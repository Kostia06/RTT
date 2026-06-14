# Square Pickup Payments — Design

**Date:** 2026-06-14
**Branch:** `feature/next-16-upgrade`
**Status:** Approved by user
**Sub-project:** B of 3 (A = employee sweep ✅ done; C = admin UX deferred)

## Context

The customer storefront has a full cart + two-step checkout (Information →
Payment) under `src/app/(public)/`, but the payment step is a **stub**: plain
text card inputs and a `setTimeout(2000)` that calls `handleCompleteOrder()`
without ever contacting Square. The server side is already built and correct:

- `src/lib/square/client.ts` — lazy Square `Client` keyed on `SQUARE_ACCESS_TOKEN`,
  `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT` (sandbox|production); also exports
  `SQUARE_APPLICATION_ID` from `NEXT_PUBLIC_SQUARE_APPLICATION_ID` for the frontend.
- `src/app/api/payment/create-payment/route.ts` — `POST { sourceId, amount,
  currency='CAD', orderId, customerEmail }` → `paymentsApi.createPayment` (amount→
  cents, idempotency key, `referenceId=orderId`) → returns payment id/status/
  receiptUrl. Handles Square error arrays. Unchanged by this work.
- `orders` schema already has `payment_method`, `payment_status`, `payment_id`,
  `pickup_date`, `pickup_time`, and delivery columns.
- `POST /api/orders` creates an order (+order_items), validates that pickup orders
  have `pickupDate`/`pickupTime`, returns `201 { order: { id, orderNumber, ... } }`.
- `PATCH /api/orders/[id]` currently updates `status` and `paymentStatus` only —
  **it does not persist `payment_id`** (the one server gap to close).

## Goal

A customer can pay for a pickup order with a real card via Square's embedded
Web Payments form, or choose pay-at-pickup. Verified end-to-end against Square
**sandbox** with test card `4111 1111 1111 1111`.

## Scope (user-confirmed)

| Decision | Choice |
|----------|--------|
| Fulfillment | **Pickup only.** Default the form to pickup; hide the delivery toggle. Leave delivery schema columns untouched. |
| Payment methods | **Card online (Square)** + **pay-at-pickup** (pending order). |
| Credentials | Square **sandbox**; user provides Application ID, Access Token, Location ID. |
| Flow | **Order-first, then confirm** (create pending order → charge → mark paid/confirmed). |
| Card UI | Square **Web Payments SDK** embedded card form (the scaffolding's pattern). |

**Out of scope:** delivery payments, saved cards, refunds, webhooks,
Apple/Google Pay, tipping. All viable follow-ups.

## Architecture & data flow

### Card path (order-first)
1. Customer completes the Information step (contact + pickup date/time) and the
   Payment step with `paymentMethod='online'`.
2. `POST /api/orders` with the order payload (items, totals, `deliveryType='pickup'`,
   `pickupDate`, `pickupTime`, `paymentMethod='online'`) → order created
   `status='pending'`, `payment_status='pending'`; response gives `{ id, orderNumber }`.
3. `SquareCard.tokenize()` → `sourceId` (card data never touches our server).
4. `POST /api/payment/create-payment { sourceId, amount: total, orderId: id,
   customerEmail }` → Square charge.
5. Success → `PATCH /api/orders/[id] { status:'confirmed', paymentStatus:'paid',
   paymentId: payment.id }` → `clearCart()` → redirect to
   `/checkout/success?order=<orderNumber>&receipt=<receiptUrl>`.
6. Failure (tokenize error / decline / Square error) → show the error inline; the
   order stays `pending`; the customer retries from the Payment step without
   re-entering pickup info.

### Pay-at-pickup path
- Step 2 only: `POST /api/orders` with `paymentMethod='in-store'` → order
  `status='pending'`, `payment_status='pending'` → success page (no Square call).

## Components / files

### New: `src/components/checkout/SquareCard.tsx`
Client component. Responsibilities:
- On mount, `GET /api/payment/config` → `{ applicationId, locationId, environment }`
  (single source of truth; no Square env duplicated to the public bundle).
- Load the Web Payments SDK script once, choosing the URL by `environment`:
  sandbox → `https://sandbox.web.squarecdn.com/v1/square.js`, production →
  `https://web.squarecdn.com/v1/square.js`.
- `payments = window.Square.payments(applicationId, locationId)`; `card =
  await payments.card(); await card.attach('#square-card')`.
- Expose tokenization to the parent via a `ref` (e.g. `useImperativeHandle` →
  `tokenize(): Promise<{ token?: string; errors?: ... }>`).
- If config returns empty `applicationId`/`locationId`, render a small "Card
  payment unavailable" notice and signal unavailability to the parent (no throw).
- Surfaces ready/unavailable state to the parent via a callback prop. Keep < 150 lines.

### Edit: `src/app/(public)/checkout/page.tsx`
- Default `deliveryType` to `pickup`; remove/hide the delivery option from the UI
  (keep the state + schema fields for later).
- Replace the fake card inputs and `handleSubmitPayment` `setTimeout` simulation
  with: render `<SquareCard>` in the Payment step (only when `paymentMethod==='online'`),
  and implement the order-first sequence (create order → tokenize → charge →
  confirm). Pay-at-pickup keeps a single create-order call.
- `<SquareCard>` self-configures via `GET /api/payment/config` (the parent does
  not pass credentials); the parent only calls `squareCardRef.tokenize()` and
  reads the ready/unavailable callback.

### Edit: `src/app/api/orders/[id]/route.ts`
- Extend the update to accept `paymentId` and persist it to `payment_id`
  (alongside the existing `status`/`paymentStatus`). One added field; no behavior
  change otherwise.

### New: `src/app/api/payment/config/route.ts`
- `GET` → `{ applicationId: SQUARE_APPLICATION_ID, locationId: SQUARE_LOCATION_ID,
  environment: SQUARE_ENVIRONMENT ?? 'sandbox' }`. Returns empty strings when unset
  so the client can show the unavailable state. No secrets (access token never sent).

### Edit: `src/app/(public)/checkout/success/page.tsx`
- Read `order` and `receipt` query params; show the order number and, if present,
  a "View Square receipt" link. Keep the existing reassurance copy.

### Config: `.env.example` (new or appended)
```
SQUARE_ACCESS_TOKEN=          # sandbox access token (server only)
SQUARE_LOCATION_ID=           # sandbox location id (server only)
SQUARE_ENVIRONMENT=sandbox    # sandbox | production (also selects the Web SDK URL, via /api/payment/config)
NEXT_PUBLIC_SQUARE_APPLICATION_ID=  # sandbox application id (client)
```

## Error handling

- **Missing creds:** `/api/payment/config` returns empty ids → `SquareCard` shows
  "Card payment unavailable"; the Payment step still allows pay-at-pickup. The
  charge route already throws a clear 500 if called without a token.
- **SDK load failure:** catch the script `onerror`; show "Couldn't load the
  payment form — try again or choose pay at pickup."
- **Tokenization errors:** Square returns field errors → display inline; do not
  proceed to charge.
- **Charge declined / Square error:** the route returns `{ error, details }`;
  surface the human-readable detail; order stays `pending` for retry.
- **Order-creation failure before charge:** no charge happens; show error.
- **Confirm (PATCH) failure after a successful charge:** rare; the payment id +
  receipt are in hand. Show success with a note and log the order id + payment id
  so staff can reconcile. (No auto-refund in scope.)

## Testing / verification

With sandbox credentials in `.env.local`:
1. **Card success** — test card `4111 1111 1111 1111`, any future expiry/CVV/zip
   → Square sandbox dashboard shows the payment; D1 order has `payment_id` set,
   `payment_status='paid'`, `status='confirmed'`; success page shows order number
   + receipt link.
2. **Card decline** — a Square sandbox decline card → inline error; D1 order
   remains `payment_status='pending'`, `status='pending'`; no false success.
3. **Pay-at-pickup** — order created `pending`, no Square payment.
4. **No creds** — card option shows unavailable; pay-at-pickup still works.
5. `npx tsc --noEmit` → 0 errors; `npm test` → existing suites pass.

Verification driven live with Playwright against `next dev` on :3002 (same harness
as sub-project A): synthetic clicks don't fire React handlers — use DOM dispatch /
`form.requestSubmit()`; the Square card iframe is cross-origin, so card entry in
the sandbox iframe is driven via the SDK's test hooks or confirmed manually if the
iframe can't be scripted — fall back to asserting tokenize→charge→D1 for the
automated portion and note any manually-confirmed step.

## Risks / notes

- `square` SDK v38 uses the legacy `Client`/`paymentsApi` API — the existing route
  matches it; do not upgrade the SDK as part of this work.
- The Web Payments card iframe is cross-origin; full automation of card entry may
  be limited — the spec's verification accounts for this.
- Guest-checkout abuse surface (from the sweep's deferred list) is noted but not
  solved here; order-first + real Square charge already ties paid orders to a
  verified payment.
