# Square Pickup Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a customer pay for a pickup order with a real card via Square's embedded Web Payments form (or choose pay-at-pickup), verified end-to-end against Square sandbox.

**Architecture:** Order-first flow — the checkout creates a `pending` order, the Square card iframe tokenizes the card to a `sourceId`, and `POST /api/payment/create-payment` charges the order's server-side `total` and confirms the order in the same server action. A `GET /api/payment/config` feeds the client the public app/location ids. Everything degrades gracefully when Square env vars are absent.

**Tech Stack:** Next.js 16 (App Router, `--webpack`), Square server SDK `square@^38` (legacy `Client`/`paymentsApi`), Square Web Payments SDK (browser script), Drizzle + Cloudflare D1, Playwright MCP for live verification.

**Spec:** `docs/superpowers/specs/2026-06-14-square-pickup-payments-design.md`

---

## Worker context (read before any task)

- **Dev server:** `BETTER_AUTH_URL=http://localhost:3002 PORT=3002 npm run dev` (run in background; ready on `Ready in`). It may already be running from sub-project A.
- **Test strategy:** this repo unit-tests only DB query helpers (`src/lib/db/queries/*.test.ts`); routes and UI are verified live (Playwright + D1 + the Square sandbox dashboard), which the spec mandates. So Tasks 1–5 are implemented then verified in Task 7; there are no per-route vitest files. Keep `npx tsc --noEmit` and `npm test` green throughout.
- **D1 query template:** `npx wrangler d1 execute rtt-db --local --command "<SQL>"` from repo root. `orders` columns are snake_case (`order_number`, `payment_status`, `payment_id`, `total`, `pickup_date`, `pickup_time`).
- **Playwright caveat (from sub-project A):** synthetic clicks don't fire React handlers — drive via `browser_evaluate` DOM dispatch / `form.requestSubmit()` / native value setters. HTML5 `required` fields block submit until filled. The Square card fields live in a **cross-origin iframe**; card entry typically can't be scripted — see Task 7 for the manual-confirm fallback.
- **Square sandbox creds** (user provides, into `.env.local`): `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT=sandbox`, `NEXT_PUBLIC_SQUARE_APPLICATION_ID`. Restart the dev server after adding them.
- **Commit rules:** short imperative subject < 50 chars, no AI signing, one task per commit, stage explicit paths (never `git add -A` — the tree carries unrelated sub-project-A work).

---

### Task 1: Square config endpoint

**Files:**
- Create: `src/app/api/payment/config/route.ts`

- [ ] **Step 1: Create the route**

```ts
import { NextResponse } from 'next/server';
import { SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID } from '@/lib/square/client';

// Public, non-secret config the browser Web Payments SDK needs.
// The access token is NEVER returned here. Empty strings signal "card payment
// unavailable" so the client can degrade gracefully.
export async function GET() {
  return NextResponse.json({
    applicationId: SQUARE_APPLICATION_ID || '',
    locationId: SQUARE_LOCATION_ID || '',
    environment: process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors. (`SQUARE_APPLICATION_ID` and `SQUARE_LOCATION_ID` are already exported from `src/lib/square/client.ts`.)

- [ ] **Step 3: Commit**

```bash
git add src/app/api/payment/config/route.ts
git commit -m "Add Square public config endpoint"
```

### Task 2: create-payment — load order, charge total, confirm order

**Files:**
- Modify: `src/app/api/payment/create-payment/route.ts` (full rewrite of the body)

- [ ] **Step 1: Rewrite the route**

```ts
import { NextResponse } from 'next/server';
import { squareClient, SQUARE_LOCATION_ID } from '@/lib/square/client';
import { getDb } from '@/lib/db/client';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceId, orderId, customerEmail, currency = 'CAD' } = body;

    if (!sourceId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceId, orderId' },
        { status: 400 }
      );
    }

    // Source of truth for the amount is the stored order total, never the client.
    const db = await getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 409 });
    }

    const amount = Number(order.total);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Order has no payable total' }, { status: 400 });
    }

    // Charge via Square.
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId,
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)), // dollars -> cents
        currency,
      },
      locationId: SQUARE_LOCATION_ID,
      idempotencyKey: randomUUID(),
      referenceId: orderId,
      note: `Order payment for ${order.order_number}`,
      buyerEmailAddress: customerEmail,
    });

    const payment = result.payment;

    // Confirm the order in the same server action (the customer cannot do this —
    // the orders PATCH is employee-guarded — and this proves "paid").
    try {
      await db
        .update(orders)
        .set({
          payment_status: 'paid',
          payment_id: payment?.id ?? null,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .where(eq(orders.id, orderId));
    } catch (updateError) {
      // Charge succeeded; don't fail the customer. Log for manual reconciliation.
      console.error(
        `Payment ${payment?.id} succeeded but order ${orderId} update failed:`,
        updateError
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
      payment: {
        id: payment?.id,
        status: payment?.status,
        receiptUrl: payment?.receiptUrl,
      },
    });
  } catch (error: any) {
    console.error('Square payment error:', error);
    if (error.errors) {
      const squareErrors = error.errors.map((e: any) => ({
        code: e.code,
        detail: e.detail,
        field: e.field,
      }));
      return NextResponse.json({ error: 'Payment failed', details: squareErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/payment/create-payment/route.ts
git commit -m "Charge order total and confirm order on payment"
```

### Task 3: SquareCard component (Web Payments SDK)

**Files:**
- Create: `src/components/checkout/SquareCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// Minimal typing for the browser Web Payments SDK injected by the script.
declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => {
        card: () => Promise<{
          attach: (selector: string) => Promise<void>;
          tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>;
        }>;
      };
    };
  }
}

export interface SquareCardHandle {
  tokenize: () => Promise<{ token?: string; error?: string }>;
}

interface SquareCardProps {
  onStatusChange?: (status: 'loading' | 'ready' | 'unavailable') => void;
}

const SDK_URL = {
  sandbox: 'https://sandbox.web.squarecdn.com/v1/square.js',
  production: 'https://web.squarecdn.com/v1/square.js',
};

function loadSdk(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Square) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Square SDK failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Square SDK failed to load'));
    document.head.appendChild(script);
  });
}

export const SquareCard = forwardRef<SquareCardHandle, SquareCardProps>(function SquareCard(
  { onStatusChange },
  ref
) {
  const cardRef = useRef<Awaited<ReturnType<NonNullable<Window['Square']>['payments']>['card']> | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  useEffect(() => {
    let cancelled = false;
    const setState = (s: 'loading' | 'ready' | 'unavailable') => {
      if (cancelled) return;
      setStatus(s);
      onStatusChange?.(s);
    };

    (async () => {
      try {
        const cfg = await fetch('/api/payment/config').then((r) => r.json());
        if (!cfg.applicationId || !cfg.locationId) return setState('unavailable');
        await loadSdk(SDK_URL[cfg.environment === 'production' ? 'production' : 'sandbox']);
        if (cancelled || !window.Square) return setState('unavailable');
        const payments = window.Square.payments(cfg.applicationId, cfg.locationId);
        const card = await payments.card();
        await card.attach('#square-card-container');
        if (cancelled) return;
        cardRef.current = card;
        setState('ready');
      } catch (e) {
        console.error('Square card init failed:', e);
        setState('unavailable');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onStatusChange]);

  useImperativeHandle(ref, () => ({
    async tokenize() {
      if (!cardRef.current) return { error: 'Card form not ready' };
      try {
        const result = await cardRef.current.tokenize();
        if (result.status === 'OK' && result.token) return { token: result.token };
        return { error: result.errors?.[0]?.message || 'Card was not accepted' };
      } catch {
        return { error: 'Could not read card details' };
      }
    },
  }));

  if (status === 'unavailable') {
    return (
      <div className="border-2 border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        Card payment is unavailable right now. Please choose <strong>pay at pickup</strong>.
      </div>
    );
  }

  return (
    <div>
      {status === 'loading' && <p className="mb-2 text-sm text-gray-500">Loading secure card form…</p>}
      <div id="square-card-container" className="min-h-[90px]" />
    </div>
  );
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/checkout/SquareCard.tsx
git commit -m "Add Square Web Payments card component"
```

### Task 4: Wire checkout — order-first card flow, pickup-only

**Files:**
- Modify: `src/app/(public)/checkout/page.tsx`

- [ ] **Step 1: Add imports + refs/state.** At the top of `CheckoutPage`, import the card and add a ref + payment error/card-status state.

Amend line 3 to add `useRef` (don't add a second `react` import line):
```tsx
import { useState, useEffect, useRef } from 'react';
```
Add to the import block (after line 9, `import { Button, Input } ...`):
```tsx
import { SquareCard, type SquareCardHandle } from '@/components/checkout/SquareCard';
```
Inside the component (near the other `useState` calls, after line 35):
```tsx
const squareRef = useRef<SquareCardHandle>(null);
const [paymentError, setPaymentError] = useState<string | null>(null);
const [cardStatus, setCardStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
```

- [ ] **Step 2: Force pickup-only (JSX deletion).** `formData.deliveryType` already defaults to `'pickup'` (line 42) — leave the state as-is. First **read the Information-step JSX** (`Read` the file region between `handleSubmitInformation`'s `<form>` and the pickup date selector) to locate two things: (a) the control that lets the user switch to delivery (a `deliveryType` radio/button group or `<select>` with a `delivery` option), and (b) the `formData.deliveryType === 'delivery'` conditional block rendering address/city/postal/instructions inputs. **Delete both** so only the pickup date/time UI remains. This is a pure deletion — no new code, and the `formData` delivery fields stay in state (unused). If no delivery control exists (already pickup-only), record that and skip.

- [ ] **Step 3: Split order creation out of `handleCompleteOrder`.** Replace the whole `handleCompleteOrder` function (lines 120–186) with a `createOrder` helper that returns the created order, plus a thin pay-at-pickup completer:

```tsx
  // Creates the order in D1 and returns { id, orderNumber }. Online orders are
  // created `pending`; they become `paid/confirmed` only after Square charges.
  const createOrder = async (): Promise<{ id: string; orderNumber: string }> => {
    const selectedDateInfo = availablePickupDates.find((d) => d.date === formData.pickupDate);
    const pickupTimeRange = selectedDateInfo
      ? `${selectedDateInfo.earliestTime} - ${selectedDateInfo.latestTime}`
      : '';

    const orderItems = state.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      price: item.price,
    }));

    const orderData: Record<string, unknown> = {
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      subtotal,
      tax,
      total,
      status: 'pending',
      items: orderItems,
      paymentMethod: formData.paymentMethod,
      paymentStatus: 'pending',
      deliveryType: 'pickup',
      pickupDate: formData.pickupDate,
      pickupTime: pickupTimeRange,
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create order');
    }
    const data = await response.json();
    const order = data.order ?? data;
    return { id: order.id, orderNumber: order.orderNumber ?? order.order_number };
  };

  // Pay-at-pickup: just create the pending order and go to success.
  const handlePayAtPickup = async () => {
    setIsProcessing(true);
    setPaymentError(null);
    try {
      const { orderNumber } = await createOrder();
      clearCart();
      router.push(`/checkout/success?order=${encodeURIComponent(orderNumber)}`);
    } catch (error) {
      console.error('Error creating order:', error);
      setPaymentError(error instanceof Error ? error.message : 'Failed to create order.');
      setIsProcessing(false);
    }
  };
```

- [ ] **Step 4: Repoint the information-step submit.** Replace `handleSubmitInformation` (lines 110–118) so the in-store branch calls the renamed pay-at-pickup handler:

```tsx
  const handleSubmitInformation = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.paymentMethod === 'in-store') {
      handlePayAtPickup();
    } else {
      setStep('payment');
    }
  };
```

- [ ] **Step 5: Replace the simulated payment with the real card flow.** Replace `handleSubmitPayment` (lines 188–196):

```tsx
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (cardStatus !== 'ready') {
      setPaymentError('The card form is not ready yet. Please wait a moment.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1) create the pending order
      const { id, orderNumber } = await createOrder();

      // 2) tokenize the card
      const tokenResult = await squareRef.current!.tokenize();
      if (!tokenResult.token) {
        setPaymentError(tokenResult.error || 'Card was not accepted.');
        setIsProcessing(false);
        return; // order stays pending; customer can retry
      }

      // 3) charge + server-side confirm
      const payRes = await fetch('/api/payment/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: tokenResult.token, orderId: id, customerEmail: formData.email }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        const detail = payData.details?.[0]?.detail || payData.error || 'Payment failed.';
        setPaymentError(detail);
        setIsProcessing(false);
        return;
      }

      // 4) done
      clearCart();
      const receipt = payData.payment?.receiptUrl ? `&receipt=${encodeURIComponent(payData.payment.receiptUrl)}` : '';
      router.push(`/checkout/success?order=${encodeURIComponent(payData.orderNumber || orderNumber)}${receipt}`);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };
```

- [ ] **Step 6: Replace the fake card UI with `<SquareCard>`.** In the Payment step `<form onSubmit={handleSubmitPayment}>`, delete the "Sandbox Mode" notice block and the fake `<Input label="Card Number" .../>`, expiry/CVC, and "Name on Card" inputs. In their place render:

```tsx
                  <SquareCard ref={squareRef} onStatusChange={setCardStatus} />

                  {paymentError && (
                    <p className="mt-4 text-sm text-red-600">{paymentError}</p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-8"
                    disabled={isProcessing || cardStatus !== 'ready'}
                  >
                    {isProcessing ? 'PROCESSING…' : `PAY $${total.toFixed(2)}`}
                  </Button>
```
(Keep the existing "← Back to information" button and the `<h2>Payment</h2>` heading.)

- [ ] **Step 7: Surface pay-at-pickup errors in the Information step.** Just below the information `<form>`'s submit button, render the same error (so a failed pay-at-pickup create shows up):
```tsx
                  {paymentError && step === 'information' && (
                    <p className="mt-4 text-sm text-red-600">{paymentError}</p>
                  )}
```

- [ ] **Step 8: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors. Fix any unused-variable errors from removed delivery code (e.g. delete now-unused `handleInputChange` branches only if the compiler flags them; leave otherwise).

- [ ] **Step 9: Commit**

```bash
git add "src/app/(public)/checkout/page.tsx"
git commit -m "Wire real Square card + pay-at-pickup checkout"
```

### Task 5: Success page shows order number + receipt

**Files:**
- Modify: `src/app/(public)/checkout/success/page.tsx`

The file is a **client component** (`'use client'`), so `useSearchParams()` must be read inside a `<Suspense>` boundary (Next errors otherwise). The default export becomes a thin Suspense wrapper around an inner component that reads the params.

- [ ] **Step 1: Add imports.** Amend the import block:
```tsx
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
```

- [ ] **Step 2: Wrap the existing body in an inner component + Suspense.** Rename the current `export default function CheckoutSuccessPage()` to `function SuccessContent()` (keep its JSX). Then add, at the top of `SuccessContent`, the param read:
```tsx
function SuccessContent() {
  const params = useSearchParams();
  const order = params.get('order');
  const receipt = params.get('receipt');
  return (
    // ...existing JSX unchanged, except add the order/receipt block below...
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
```

- [ ] **Step 3: Show the order number + receipt.** Inside `SuccessContent`'s JSX, directly under the "Thank you for your order" paragraph, add:
```tsx
          {order && (
            <p className="mt-2 text-sm text-gray-700">
              Order <span className="font-bold">{order}</span>
            </p>
          )}
          {receipt && (
            <a href={receipt} target="_blank" rel="noopener noreferrer"
               className="mt-2 inline-block text-sm text-blue-600 underline">
              View Square receipt
            </a>
          )}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(public)/checkout/success/page.tsx"
git commit -m "Show order number and receipt on success page"
```

### Task 6: Document env vars

**Files:**
- Create or append: `.env.example`

- [ ] **Step 1: Add the Square block** to `.env.example` (create the file if absent):

```
# Square payments (sandbox). Get these from https://developer.squareup.com (Sandbox).
SQUARE_ACCESS_TOKEN=          # sandbox access token (server only — never exposed)
SQUARE_LOCATION_ID=           # sandbox location id (server only)
SQUARE_ENVIRONMENT=sandbox    # sandbox | production
NEXT_PUBLIC_SQUARE_APPLICATION_ID=  # sandbox application id (sent to the browser)
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "Document Square env vars"
```

### Task 7: Live verification (needs sandbox creds)

> Pause and ask the user to paste their Square **sandbox** credentials into
> `.env.local`, then restart the dev server:
> `BETTER_AUTH_URL=http://localhost:3002 PORT=3002 npm run dev`.

- [ ] **Step 1: Config endpoint.** In the browser (logged-in or not) via `browser_evaluate`: `await fetch('/api/payment/config').then(r=>r.json())`. Expect `applicationId`, `locationId` non-empty, `environment:'sandbox'`.
- [ ] **Step 2: Card form renders.** Navigate to `/shop`, add an item to the cart, go to `/checkout`. Fill contact + pickup date/time, choose **Pay online**, continue to Payment. Confirm the Square card iframe appears (`#square-card-container` has an iframe child) and the Pay button enables (`cardStatus==='ready'`).
- [ ] **Step 3: Successful payment.** Enter test card `4111 1111 1111 1111`, exp `12/29`, CVV `111`, ZIP `94103` **in the Square iframe** (this is cross-origin — if Playwright cannot type into it, do this step manually in a real browser and record the result). Submit. Expect redirect to `/checkout/success?order=…&receipt=…`.
- [ ] **Step 4: D1 + Square check.**
  Run: `npx wrangler d1 execute rtt-db --local --command "SELECT order_number, status, payment_status, payment_id, total FROM orders ORDER BY created_at DESC LIMIT 1"`
  Expect: `status=confirmed`, `payment_status=paid`, `payment_id` set, `total` matches. Confirm the payment also appears in the Square Sandbox dashboard (Transactions).
- [ ] **Step 5: Decline path.** Repeat with Square's decline test card `4000 0000 0000 0002`. Expect an inline error on the Payment step and a new order left `payment_status=pending`, `status=pending` (no false success).
- [ ] **Step 6: Pay-at-pickup.** Fresh checkout, choose **Pay at pickup**. Expect success page + a `pending` order with `payment_method` reflecting in-store and no `payment_id`.
- [ ] **Step 7: No-creds degradation (optional).** Temporarily blank `NEXT_PUBLIC_SQUARE_APPLICATION_ID`, restart, and confirm the Payment step shows "Card payment is unavailable" while pay-at-pickup still works. Restore creds after.
- [ ] **Step 8: Green checks + report.**
  Run: `npx tsc --noEmit` (0 errors) and `npm test` (existing suites pass).
  Write `docs/handoff/SQUARE-PAYMENTS-REPORT.md` — per-step ✅/🔧/manual results, the test orders created, and the Square dashboard confirmation. Commit:
```bash
git add docs/handoff/SQUARE-PAYMENTS-REPORT.md
git commit -m "Add Square payments verification report"
```
- [ ] **Step 9: Present results to the user.** Summarize what was verified live vs. manually, and ask before cleaning up test orders.
