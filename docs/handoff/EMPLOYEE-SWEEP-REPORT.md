# Employee Sweep Report

**Started:** 2026-06-11 · **Branch:** feature/next-16-upgrade
**Legend:** ✅ verified live · 🔧 fixed (commit) · 🔑 needs key/boundary · 📋 design issue (deferred)

## Phase 1 — Static audit
| # | Bug class | Files | Outcome | Commit |
|---|-----------|-------|---------|--------|
| T2 | Supabase leftovers | `ImageUpload.tsx`, `lib/supabase/server.ts` | 🔧 ImageUpload degrades when storage unconfigured (disabled state); deleted orphan `server.ts` (0 importers); kept `client.ts`/`config.ts` (still imported) | cb4dc5c |
| T3 | Missing auth guards | all `api/**/route.ts` | ✅ No bug. Audit of all 36 routes: every employee/admin/write route already uses `requireRole`/`requireUser`. The 5 unguarded routes are intentionally public: `products`,`recipes` (GET-only catalog), `auth/[...all]` (Better Auth), `orders/create`,`payment/create-payment` (guest checkout → sub-project B). Auth layer survived migration intact. | n/a |
| T4 | Role drift (`user` vs role model) | `lib/auth/auth.ts` | 🔧 `admin()` plugin defaulted new signups to `"user"` (rank −1, fails all guards). Set `admin({ defaultRole: 'customer', adminRoles: ['admin'] })`. Verified live: signup → `role:"customer"` in response + D1. Local data already clean (0 `user`/null rows). | dab7dc1 |
| T5 | Type + test baseline | (whole `src`) | ✅ `npx tsc --noEmit` exits 0 (zero type errors); `npm test` → 5/5 pass (products, recipes suites). Migration left code type-clean; no fixes needed. | n/a |
| T6 | **CRITICAL: server crash on every page** | `tailwind.config.ts` | 🔧 `plugins:[require('@tailwindcss/forms'),...]` threw `require is not defined` (config loads as ESM under Next 16/Node 25), crashing Tailwind's PostCSS step → **every CSS-rendering route 500'd**. Converted to ESM `import forms from ...`. Verified: all pages compile + render after fix. API-only routes (e.g. signup) were unaffected, which is why it hid until first page nav. | _pending_ |

## Phase 2 — Live sweep

> **⚠️ ID correction:** the prior handoff swapped the test-account IDs. Actual:
> `admin@rtt.test` = `khRqCZvbRI3K3m1zPWDyWWyvrBSoOQ7h` (role=admin);
> `target@rtt.test` = `pkr65a0Sq33c4ziGmpcEPFMhuxZguHXo` (role=employee).

**Session baseline (T6):** Tailwind crash fixed → server stable on :3002. Logged
in live as `admin@rtt.test` via the real login form (React handler fired,
redirect to `/account`, 0 console errors). All 24 employee routes return 200 to
admin (no auth redirect, no 404/500). `/dashboard` renders full content + live
stats, 0 errors. Smoke-check folded into each domain below.

_Dev-only note (not a code bug):_ on a cold server, the very first navigation can
emit a transient "Invalid or unexpected token" while webpack is still compiling
the chunk; the form briefly falls back to a native GET. Resolves on reload once
compilation completes. Not reproducible on a warm server.

_Method note — modal forms:_ create/edit modals use HTML5 `required` fields, so
submitting with a required field empty is correctly blocked (no POST) — this is
proper validation, **not a bug**. Confirmed by filling all required fields and
submitting via `form.requestSubmit()` (e.g. production-items, fridges) → writes
to D1. Where a modal submit was awkward to drive, the same write was verified via
its authenticated API endpoint + source-read of the (correct) handler. Direct
button features (clock in/out) were driven fully through the UI.

| Domain | Page | Feature | Status | Evidence |
|--------|------|---------|--------|----------|
| Time | time-tracking | Render | ✅ | 0 console errors; full UI (status, week hours, QR, entries, schedule) |
| Time | time-tracking | Clock in → out | ✅ | Live click; D1 `time_entries` row gets `clock_in` then `clock_out`+`total_hours`; UI toggles NOT CLOCKED IN ↔ CLOCKED IN |
| Time | time-tracking | Manual entry | ✅ | `manualEntry` action → 200, `total_hours`=4.5 for 08:00–12:30 (correct calc) |
| Time | time-tracking | Create shift | ✅ | POST `/api/employee/schedule` → 200, D1 `shifts` row (`scheduled`). Modal form fields verified in source (datetime-local ×2, position, notes, employee picker). |
| Time | schedule | Render + list | ✅ | Shows created shift; stats "1 upcoming / 0 confirmed / 1 awaiting" correct; 0 errors |
| Time | schedule | Confirm shift | ✅ | PATCH → D1 status `scheduled`→`confirmed`. Confirm button correctly gated `!isAdmin` (employee-only action; not a bug) |
| Time | clock-in | Render (kiosk) | ✅ | Shows employee, CLOCKED OUT, Recent Entries reflects time_entries; 0 errors |
| Time | today | Render + empty states | ✅ | "No shift today" (shift is Jun 16) + "No orders today" render correctly; 0 errors |
| Fridges | fridges | Render + list | ✅ | "All Fridges (2)" with both seeded fridges; 0 errors |
| Fridges | manage-fridges | Create (modal) | ✅ | Add Fridge modal → D1 `fridges` row; UI count 2→3. Active + Temp-monitoring checkboxes default **checked** (verified). |
| Fridges | manage-fridges | Edit (PUT) | ✅ | PUT `/api/fridges/[id]` → 200, name+capacity updated |
| Fridges | manage-fridges | Delete | ✅ | DELETE `/api/fridges/[id]` → 200. **Soft delete by design** (sets `active=false`, keeps row) — not data loss. |
| Fridges | fridge-inventory/[id] | Render | ✅ | Capacity stats + empty inventory (0 items) render; 0 errors |
| Fridges | scan-fridge | QR search | ✅ | Entering `fridge-main-walkin` loads Main Walk-In Cooler + inventory; 0 errors |
| Fridges | scan-fridge | Log temperature | ✅ | POST `/api/fridges/temperature-log` → 200, D1 row, `employee_id` correctly = logged-in admin. (UI modal submit flaky under automation; endpoint+handler verified.) |
| Inventory | inventory | Render + stats | ✅ | "4 total products / 1 out of stock" from real products; 0 errors |
| Inventory | inventory-advanced | Render tabs | ✅ | Suppliers / Restock Orders tabs + empty states; 0 errors |
| Inventory | inventory-advanced | Add supplier | ✅ | POST `/api/inventory/suppliers` → 200, D1 row (requires `name`,`contactPerson`,`email`,`phone`) |
| Production | production | Render (overview/history tabs) | ✅ | "Today's Overview"/"Production History" tabs, empty state; 0 errors |
| Production | manage-production-items | Create (modal, full UI) | ✅ | Add Item modal filled (name+category+case-size, all `required`) → `form.requestSubmit` → D1 `production_items` row (`Sweep UI Item`, case_size 36). Endpoint also 201. |
| Production | manage-production-items | Render + list | ✅ | All 4 seeded items with Edit/Delete; "Total Items 4"; 0 errors |
| Production | production-logs | Render + filters + CSV | ✅ | History view, "No logs found" empty state, Export CSV + filter controls; 0 errors. (Log rows are created by the shift→production-assignment workflow.) |
| Orders | orders | Render + status tabs | ✅ | ALL/PENDING/…/COMPLETED filter tabs; empty→1 after create; 0 errors |
| Orders | orders | Create order | ✅ | POST `/api/orders/create` → 200, order RTT-20260612-2373 ($32.55) in D1 (also confirms customer-checkout endpoint for sub-project B) |
| Orders | orders | Status change | ✅ | UI status dropdown (pending→preparing) → PATCH `/api/orders/[id]` → D1 `status=preparing`; tab counts update |
| Orders | reports | Render + live aggregation | ✅ | After marking order completed: TOTAL SALES $32.55, TOTAL ORDERS 1, COMPLETED 1, AVG $32.55 — all correct. Period tabs render. 0 errors |
| Orders | dashboard | Render + stats | ✅ | (T6) "Welcome back, Admin Tester", live order/message stats, all tool sections; 0 errors |
| Comms | messages | Render + list | ✅ | Seeded customer message shows; 0 errors |
| Comms | messages | Mark read (open) | ✅ | Clicking opens detail + PATCH `/api/messages/[id]` → D1 `contact_messages.status` `new`→`read` |
| Comms | messages | **Tab counts** | 🔧 | **Bug:** counts (All/New/Read/Archived) were derived from the per-filter fetch, so "All" showed only the active bucket and a message vanished once read. Fixed `MessagesSection` to fetch the full set + filter client-side (commit f442ad9). Verified: All (1)/Read (1) correct after read. |
| Comms | messages | Newsletter broadcast | ✅🔑 | POST `/api/newsletter/broadcast` → 200, "sent to 1 subscribers" via **console-mode** email. Real send needs `RESEND_API_KEY`. |
| Comms | support | Render + ticket filters | ✅ | "ALL (3)/OPEN (1)/IN PROGRESS (1)/RESOLVED (1)" with correct counts; 0 errors |
| Comms | ai-assistant | Render + graceful failure | ✅🔑 | Chat UI renders; sending a message → endpoint returns structured 500 (no GCP creds), UI shows error bubble, no crash. Needs Google GenAI credentials for function. |
| Content | manage-products | Render + list/stats | ✅ | 4 products, stats (4 Total/4 Active/3 Featured), filter tabs; 0 errors |
| Content | manage-products/edit/[id] | **Load + Save** | 🔧 | **Bug:** edit page alerted "Failed to load product" for every seeded product. `/api/products/[id]` used a UUID-shape heuristic that misrouted non-UUID ids (`prod-tonkotsu-kit`) to a slug lookup; PUT/PATCH/DELETE outright rejected non-UUID ids ("Invalid product ID"). Fixed: match id OR slug, drop the UUID gate (commit a8afe9b). Verified: edit loads, name PUT → D1, reverted. |
| Content | manage-recipes | Render + list | ✅ | 1 recipe + stats; 0 errors |
| Content | manage-recipes/edit/[id] | Load | 🔧 | Same id-vs-slug bug for recipe `seed-r1`; fixed in same commit. Verified: edit loads "Classic Tonkotsu Ramen". |
| Content | manage-recipes/create | Render + create | ✅ | Full form (basic/ingredients/instructions/images); POST `/api/recipes/create` → 200 (UUID recipe), DELETE → 200. Image upload shows the graceful "unavailable" state (T2 fix). |
| Content | manage-content | Render + tabs | ✅ | Products (4)/Recipes (1) tabs, combined management; 0 errors |

## Missing keys / external boundaries
| Service | Env var(s) | Verified up to |
|---------|-----------|----------------|
| Image storage (Supabase, legacy) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | UI shows "unavailable" disabled state when unset; no upload path exercised |
| Email (verification, order confirm, newsletter) | `RESEND_API_KEY` (+ `EMAIL_PROVIDER=resend`, `FROM_EMAIL`) | Console-mode logs full email payload; newsletter broadcast returns success; no real send |
| AI assistant | Google GenAI credentials (`@google/genai` — `GOOGLE_API_KEY`/ADC) | Endpoint + chat UI exercised; returns structured 500 + UI error bubble without creds |

## Test data created
| Table | Row id / name | Created by task |
|-------|---------------|-----------------|
| user | sweep-roletest@rtt.test (`7xOaxZuyk1NcJXu5TnmwF8fMFhoXA1P9`, role=customer, unverified) | T4 |
| time_entries | 2 rows: 1 clock-in/out cycle + 1 manual entry (4.5h, `sweep manual entry`), employee Admin Tester | Time domain |
| shifts | `3eaf1522-…` Jun 16 09:00–17:00, Kitchen Staff, status=confirmed (employee_id=target's id, name label "Admin Tester") | Time domain |
| fridge_temperature_logs | 1 row: fr-main-walkin, 38.5°F, "sweep temp check", by admin | Fridges domain |
| suppliers | `c3b159de-…` Sweep Supplier Co (Jane, jane@sweepsupplier.test) | Fridges domain |
| fridges | (test fridges created + hard-deleted; back to 2 seeded) | Fridges domain |
| production_items | (test items created + hard-deleted; back to 4 seeded) | Production domain |
| orders | `98d4264c-…` RTT-20260612-2373, Sweep Customer, $32.55, status=completed (left in place as report/dashboard evidence) | Orders domain |
| contact_messages | seeded `msg-welcome` toggled new→read→**reset to new** (seed preserved) | Comms domain |
| newsletter_subscribers | 1 seeded subscriber received a console-mode broadcast (no row change) | Comms domain |
| products | `prod-tonkotsu-kit` name edited→reverted (PUT test) | Content domain |
| recipes | test recipe created + hard-deleted; back to 1 seeded | Content domain |

## Design issues deferred
- 📋 **Image storage**: app was migrated off Supabase, but image upload still
  targets Supabase Storage. Needs an R2 (or equivalent) upload route + signed
  URLs to fully restore. Until then, manage-products/recipes can set image URLs
  by pasting, not uploading. (Feeds a future sub-project.)
- 📋 **Remote D1 role migration**: at deploy, run on remote D1 the same
  `UPDATE user SET role='customer' WHERE role='user' OR role IS NULL;` so any
  pre-fix accounts there get a valid role.
- 📋 **Guest-checkout abuse surface**: `orders/create` and `payment/create-payment`
  are public POST routes by design (guests can order). Sub-project B (Square)
  should add payment-intent verification + basic rate limiting so orders can't be
  forged without a real payment.
- 📋 **Reports "Top Products" empty for inline-item orders**: `/api/orders/create`
  stores line items as JSON on `orders.items`, but the reports Top Products widget
  appears to read the normalized `order_items` table (not populated by that route).
  Sales/orders/avg metrics are correct; only the Top Products breakdown stays empty.
  Decide on one source of truth for order line items (normalize on create, or have
  reports parse `orders.items`).
