# Employee Feature Verification Sweep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every `(employee)` page verified working live against local D1 — static migration bugs fixed in batch first, then every interactive feature exercised in a real browser with DB verification.

**Architecture:** Two phases. Phase 1 fixes known migration bug classes codebase-wide (Supabase leftovers, missing guards, role drift, type mismatches). Phase 2 drives each of 7 page domains with Playwright MCP against `next dev` on :3002 + local D1, verifying every mutation with `wrangler d1 execute`, fixing bugs as found, recording evidence in a living report.

**Tech Stack:** Next.js 16 (`--webpack`), Drizzle + Cloudflare D1 (local), Better Auth (drizzleAdapter + admin plugin), Playwright MCP, wrangler CLI.

**Spec:** `docs/superpowers/specs/2026-06-11-employee-sweep-design.md`

---

## Worker context (read before any task)

- **Dev server:** `BETTER_AUTH_URL=http://localhost:3002 PORT=3002 npm run dev` — launch with run_in_background:true (NOT `nohup ... &`, which dies). Ready when stdout shows `Ready in`.
- **D1 query template:** `npx wrangler d1 execute rtt-db --local --command "<SQL>"` (run from repo root).
- **Test accounts (already in local D1):** `admin@rtt.test` / `admin12345` (role=admin, verified). `target@rtt.test` / `target12345` (role=employee, pay_rate=21.5, currently banned=1).
- **CRITICAL Playwright caveat:** synthetic `browser_click`/`browser_type` do NOT fire this app's React handlers. Always use `browser_evaluate` with real DOM dispatch:
  ```js
  // click
  document.querySelector('<sel>').click();
  // set a controlled input's value
  const el = document.querySelector('<sel>');
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')
    .set.call(el, 'VALUE');
  el.dispatchEvent(new Event('input', { bubbles: true }));
  ```
  For `<select>`: use the `HTMLSelectElement` prototype setter + `change` event. For forms that won't submit: `form.requestSubmit()`.
- **Login fallback** (if the login form won't submit): run in `browser_evaluate` on any page of the app origin:
  ```js
  await fetch('/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@rtt.test', password: 'admin12345' }),
  }).then(r => r.status); // expect 200; session cookie is now set
  ```
- **React state flush:** UI assertions in a separate `browser_evaluate` call from the action that caused them.
- **Commit rules:** short imperative subject < 50 chars, no AI signing, one bug class / one domain's fixes per commit. Never `git add -A` — the tree carries unrelated migration changes; stage explicit paths only.
- **Bug-fix loop (applies in every live task):** reproduce → read the page/route source → fix → verify the fix live in the browser → D1-check → commit → log a 🔧 row in the report.

---

## Phase 1 — Static migration audit

### Task 1: Create the sweep report skeleton

**Files:**
- Create: `docs/handoff/EMPLOYEE-SWEEP-REPORT.md`

- [ ] **Step 1: Write the skeleton**

```markdown
# Employee Sweep Report

**Started:** 2026-06-11 · **Branch:** feature/next-16-upgrade
**Legend:** ✅ verified live · 🔧 fixed (commit) · 🔑 needs key/boundary · 📋 design issue (deferred)

## Phase 1 — Static audit
| # | Bug class | Files | Outcome | Commit |
|---|-----------|-------|---------|--------|

## Phase 2 — Live sweep
| Domain | Page | Feature | Status | Evidence |
|--------|------|---------|--------|----------|

## Missing keys / external boundaries
| Service | Env var(s) | Verified up to |
|---------|-----------|----------------|

## Test data created
| Table | Row id / name | Created by task |
|-------|---------------|-----------------|

## Design issues deferred
(none yet)
```

- [ ] **Step 2: Commit**

```bash
git add docs/handoff/EMPLOYEE-SWEEP-REPORT.md
git commit -m "Add employee sweep report skeleton"
```

### Task 2: Resolve Supabase leftovers

**Files:**
- Inspect: `src/components/ui/ImageUpload.tsx`, `src/lib/supabase/client.ts`, `src/lib/supabase/config.ts`, `src/lib/supabase/server.ts`
- Modify: `src/components/ui/ImageUpload.tsx` (graceful failure), delete unused `src/lib/supabase/*`

- [ ] **Step 1: Map who imports the supabase files**

Run: `grep -rn "lib/supabase" src --include='*.ts' --include='*.tsx'`
Expected: importers list. As of planning, only `ImageUpload.tsx` is known; if others appear, treat each the same way.

- [ ] **Step 2: Check which pages render ImageUpload**

Run: `grep -rln "ImageUpload" src/app src/components --include='*.tsx'`
Expected: likely manage-products / manage-content. Note them for Phase 2 checks.

- [ ] **Step 3: Decide per spec** — image storage is a design-level dependency (D1 cannot store blobs; R2 migration is sub-project work, not a migration bug). Do NOT rebuild storage. Instead make ImageUpload fail gracefully: if `NEXT_PUBLIC_SUPABASE_URL` is unset, render the component with the upload control disabled and a small note ("Image upload unavailable"), instead of throwing at import/call time. Keep `src/lib/supabase/*` only if still imported; delete any file with zero importers.

- [ ] **Step 4: Verify nothing broke**

Run: `npx tsc --noEmit` — expect no NEW errors vs the Task 4 baseline (if Task 4 hasn't run yet, just record the count).
Run: `npm test` — expect same pass/fail as before the change.

- [ ] **Step 5: Commit + report row**

```bash
git add src/components/ui/ImageUpload.tsx src/lib/supabase
git commit -m "Make image upload degrade without Supabase"
```
Add a 🔧/📋 row to the report (image storage → "Design issues deferred": needs R2 or similar).

### Task 3: Guard the unprotected time-tracking route

**Files:**
- Modify: `src/app/api/employee/time-tracking/route.ts`

- [ ] **Step 1: Read the route.** Confirm it touches `time_entries` and has no `requireRole`/`getSessionUser` call. (Sibling routes `time-tracking/all` and `time-tracking/employees` already use guards — match their style.)

- [ ] **Step 2: Add the guard to every exported method**, following the existing pattern used across `src/app/api/**`:

```ts
import { requireRole } from '@/lib/auth/guards';

export async function GET(request: Request) {
  const { user, error } = await requireRole(request, 'employee');
  if (error) return error;
  // ...existing logic; scope reads/writes to user.id where the route
  // previously trusted a client-supplied userId
}
```
Apply the same to POST/PATCH/DELETE if present. If the route takes a `userId` param, ignore it for non-managers and use `user.id`.

- [ ] **Step 3: Verify (negative test by hand)**

With the dev server up and NO session cookie:
`ctx_execute(language:"javascript", code:"const r = await fetch('http://localhost:3002/api/employee/time-tracking'); console.log(r.status)")`
Expected: `401`.

- [ ] **Step 4: Audit the other unguarded routes — confirm intentionally public, do not change:** `api/auth/[...all]` (Better Auth), `api/orders/create`, `api/payment/create-payment` (customer checkout), `api/products`, `api/recipes` (public catalog GETs — but if they export POST/PUT/DELETE without a guard, add `requireRole(request, 'manager')` using the Step 2 pattern). Record each verdict in the report.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/employee/time-tracking/route.ts src/app/api/products/route.ts src/app/api/recipes/route.ts
git commit -m "Guard time-tracking and write routes"
```

### Task 4: Fix role drift ("user" vs customer/employee/manager/admin)

**Files:**
- Modify: `src/lib/auth/auth.ts`
- Data: local D1 `user` table

Background: Better Auth's admin plugin defaults new signups to role `"user"`. `ROLE_RANK` in `src/lib/auth/guards.ts` maps `"user"` to −1, so such accounts fail even customer-level checks, and the admin users page displays them incorrectly.

- [ ] **Step 1: Set the default role in the admin plugin** in `src/lib/auth/auth.ts`:

```ts
import { admin } from 'better-auth/plugins';
// inside betterAuth({ ... })
plugins: [
  admin({
    defaultRole: 'customer',
    adminRoles: ['admin'],
  }),
],
```
(Adjust to the existing `admin()` call — add options, don't duplicate the plugin. Verify the option names against the installed better-auth 1.6.x types; if `defaultRole` is not available, set `user.role.defaultValue` via the schema instead.)

- [ ] **Step 2: Migrate existing rows**

Run: `npx wrangler d1 execute rtt-db --local --command "UPDATE user SET role='customer' WHERE role='user' OR role IS NULL; SELECT role, COUNT(*) FROM user GROUP BY role"`
Expected: no `user` role remaining.
Note: remote D1 needs the same UPDATE at deploy time — add a row to the report's "Design issues deferred" so it isn't forgotten.

- [ ] **Step 3: Verify live** — sign up a throwaway account via the running app (`sweep-roletest@rtt.test` / `sweeptest123`), then:

Run: `npx wrangler d1 execute rtt-db --local --command "SELECT email, role FROM user WHERE email='sweep-roletest@rtt.test'"`
Expected: `role = customer`. Log the account under "Test data created".

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth/auth.ts
git commit -m "Default new signups to customer role"
```

### Task 5: Typecheck + unit test baseline

**Files:** none new — fixes wherever the compiler points (expect snake_case/camelCase property mismatches against the Drizzle schema, whose TS properties are snake_case, e.g. `orders.order_number`).

- [ ] **Step 1:** Run `npx tsc --noEmit 2>&1 | tail -30` (use ctx_execute if long). Record the error count in the report.
- [ ] **Step 2:** Fix every error that is a real defect (wrong column/property names, dead imports). For pre-existing errors unrelated to employee features, fix if < 5 min each, otherwise log 📋 rows.
- [ ] **Step 3:** Run `npm test` — both existing suites (`products.test.ts`, `recipes.test.ts`) must pass. Fix regressions; do not delete tests.
- [ ] **Step 4:** Re-run both commands; expect 0 type errors (or only logged 📋 exceptions) and green tests.
- [ ] **Step 5: Commit**

```bash
git add -u src
git commit -m "Fix type errors from D1 migration"
```

---

## Phase 2 — Live sweep

> Spec bug class #4 (API response shapes that no longer match what pages
> expect) is intentionally NOT a static task — it is caught here, the moment
> each feature is exercised against its real route.

### Task 6: Session setup + smoke-crawl all employee pages

- [ ] **Step 1:** Start the dev server (see Worker context). Confirm `Ready in` in task output.
- [ ] **Step 2:** Playwright: navigate to `http://localhost:3002/login`, log in as admin (UI first; fetch fallback from Worker context if the form won't submit). Verify: `document.cookie` contains a better-auth session OR navigating to `/dashboard` doesn't redirect to `/login`.
- [ ] **Step 3:** Smoke-crawl: navigate to each of the 24 employee URLs (`/dashboard`, `/clock-in`, `/time-tracking`, `/schedule`, `/today`, `/inventory`, `/inventory-advanced`, `/fridges`, `/manage-fridges`, `/scan-fridge`, `/production`, `/production-logs`, `/manage-production-items`, `/orders`, `/reports`, `/messages`, `/support`, `/ai-assistant`, `/manage-products`, `/manage-recipes`, `/manage-recipes/create`, `/manage-content`, `/admin/users`, `/admin/qr-codes`). For each: record HTTP result, whether it rendered (vs error boundary/blank), and `browser_console_messages` errors. Fill a Status row per page in the report (this becomes the work queue for Tasks 7–13).
- [ ] **Step 4: Commit the report update**

```bash
git add docs/handoff/EMPLOYEE-SWEEP-REPORT.md
git commit -m "Record smoke-crawl baseline"
```

### Tasks 7–13: Domain deep-dives (one task per domain, same procedure)

| Task | Domain | Pages | Mutations to verify in D1 (tables) |
|------|--------|-------|-------------------------------------|
| 7 | Time & scheduling | clock-in, time-tracking, schedule, today | `time_entries` (clock in/out rows, timestamps), `shifts` (create/edit) |
| 8 | Inventory & fridges | inventory, inventory-advanced, fridges, manage-fridges, fridge-inventory/[id], scan-fridge | `fridges` (CRUD), `fridge_temperature_logs`/temperature-log rows, inventory + `restock_orders`, `suppliers` |
| 9 | Production | production, production-logs, manage-production-items | `production_items` (CRUD), `production_logs` (create) |
| 10 | Orders & reports | orders, reports, dashboard | `orders` (status change via PATCH `/api/orders/[id]`), dashboard/report figures match SQL aggregates |
| 11 | Comms | messages, support, newsletter, ai-assistant | `messages` (send/read/delete, count badge); newsletter + AI: boundary only (UI, validation, graceful failure; log 🔑 rows: `GOOGLE_GENAI_API_KEY`-class, email-service keys) |
| 12 | Content | manage-products (+edit/[id]), manage-recipes (+create, edit/[id]), manage-content | `products` + variants (CRUD), `recipes` (create/edit), content settings; image upload = 🔑/📋 boundary from Task 2 |
| 13 | Admin | admin/users, admin/qr-codes | `user` — **first action: unban `target@rtt.test`** (click Unban via DOM dispatch, expect PATCH 200, D1 `banned=0` — closes last session's pending step); qr-codes generation (+ `qr_codes` table if present) |

For EACH domain task, run this exact procedure:

- [ ] **Step 1: Enumerate.** Read each page's source (`src/app/(employee)/<page>/page.tsx` and components it imports) and list every interactive feature (buttons, forms, filters, dialogs). Add one report row per feature before testing.
- [ ] **Step 2: Exercise each feature** via DOM dispatch (Worker context snippets). After every mutation, verify with the D1 query template against the table(s) in the matrix above, and confirm the UI reflects the change in a separate evaluate call.
- [ ] **Step 3: Check rendering quality.** `browser_console_messages` after each page: zero errors. Screenshot full page → `docs/handoff/sweep-screenshots/<page>.png`. Fix obvious visual defects (broken layout, overflow, missing loading/empty state).
- [ ] **Step 4: Fix bugs** using the bug-fix loop from Worker context. One commit per domain for fixes:

```bash
git add <only files changed for this domain> docs/handoff/EMPLOYEE-SWEEP-REPORT.md docs/handoff/sweep-screenshots
git commit -m "Fix and verify <domain> pages"
```

- [ ] **Step 5: Report.** Every feature row ends ✅ / 🔧(commit) / 🔑 / 📋 — none left blank — then mark the domain done.

### Task 14: Final wrap-up

- [ ] **Step 1:** Re-run `npx tsc --noEmit` and `npm test` — both clean.
- [ ] **Step 2:** Fill the report's summary: counts per status, full missing-keys table, test-data table, deferred 📋 list (feeds sub-projects B and C).
- [ ] **Step 3:** Commit the final report:

```bash
git add docs/handoff/EMPLOYEE-SWEEP-REPORT.md docs/handoff/sweep-screenshots
git commit -m "Complete employee sweep report"
```
- [ ] **Step 4:** Present the report summary to the user. Ask before deleting any test accounts/data.
