# Employee Feature Verification Sweep — Design

**Date:** 2026-06-11
**Branch:** `feature/next-16-upgrade`
**Status:** Approved by user

## Context

The app was migrated from Supabase to Cloudflare D1 + Drizzle + Better Auth.
The admin users page was verified live last session; the other ~25 employee
pages have not been driven since the migration and may be silently broken.

This is sub-project **A** of three. Deferred siblings:
- **B — Square payments** for customer order/pickup (scaffolding exists:
  `src/lib/square/client.ts`, `/api/payment/create-payment`, full
  cart/checkout pages; no Square credentials configured anywhere yet).
- **C — Admin UX**: easy-to-use admin navigation/dashboard (today only
  `admin/users` and `admin/qr-codes` exist).

## Goal

Every `(employee)` page works flawlessly against local D1: loads clean,
every interactive feature does what it claims, mutations persist correctly,
no console errors, no obvious visual defects. Evidence-based — nothing is
marked done without being driven live in a browser.

## Scope decisions (user-confirmed)

| Decision | Choice |
|----------|--------|
| Depth | Full exercise of every interactive feature on every page |
| Issue bar | Functional bugs + obvious visual defects (broken layout, overflow, missing loading/empty states, console errors). No subjective restyling. |
| External services (AI assistant, email, newsletter) | Verify up to the boundary: UI, validation, DB writes, graceful failure without keys. Report which keys are needed for full verification. |
| Execution | Static migration audit first (batch fixes), then full live sweep |

## Phase 1 — Static migration audit

Scan all `(employee)` pages plus every API route they call for known
migration bug classes; fix each class once, codebase-wide:

1. Leftover `supabase` imports/calls (`src/lib/db/supabase.ts` was deleted).
2. Drizzle column-name mismatches (snake_case DB columns vs camelCase code).
3. Missing or incorrect `requireRole` guards (`src/lib/auth/guards.ts`).
4. API response shapes that no longer match what pages expect.
5. Role-value drift: Better Auth admin plugin defaults new users to
   `"user"`, while UI/guards check `employee | manager | admin` (and the
   users page dropdown shows "Customer" for the `"user"` value).

Output: findings table + one atomic commit per bug class.

## Phase 2 — Live sweep

Setup: `BETTER_AUTH_URL=http://localhost:3002 PORT=3002 npm run dev`
(run in background), Playwright MCP browser, logged in as seeded admin
`admin@rtt.test` / `admin12345`. Note: synthetic Playwright clicks do not
fire this app's React handlers — use DOM `.click()` and native value
setters + input events via `browser_evaluate`.

Domain order; after every mutation, verify the row in local D1 via
`npx wrangler d1 execute rtt-db --local --command "..."`:

1. **Time & scheduling** — clock-in, time-tracking, schedule, today
2. **Inventory & fridges** — inventory, inventory-advanced, fridges,
   manage-fridges, fridge-inventory/[id], scan-fridge
3. **Production** — production, production-logs, manage-production-items
4. **Orders & reports** — orders, reports, dashboard
5. **Comms** — messages, support, newsletter (boundary),
   ai-assistant (boundary)
6. **Content** — manage-products (+edit/[id]), manage-recipes
   (+create, edit/[id]), manage-content
7. **Admin** — users (finish pending unban verification from last
   session), qr-codes

## Bug handling

- Fix immediately, re-verify live, continue. No deferred-fix backlog
  except polish items explicitly out of scope.
- Each fix is an atomic commit (builds, passes tests).
- Test data created freely in local D1; all test records listed in the
  final report.

## Error handling & risks

- Dev server background task can die across sessions — restart with the
  command above; admin session cookie usually survives, otherwise re-login.
- Pages depending on tables with no seed data: seed minimal rows via
  `wrangler d1 execute` so features are exercisable.
- If a page reveals a design-level problem (not a migration bug), record
  it in the report rather than redesigning mid-sweep.

## Deliverable

`docs/handoff/EMPLOYEE-SWEEP-REPORT.md` — per-domain table of
✅ verified / 🔧 fixed (with commit) / 🔑 needs key, screenshots of each
working page, list of created test data, and the missing-keys list.
The report is updated as each domain completes so the sweep is resumable
across sessions/compactions.

## Known carry-over state

- Test accounts in local D1: `admin@rtt.test` (admin, verified) and
  `target@rtt.test` (employee, payRate 21.5, currently **banned=1** —
  unban is the pending step).
- Uncommitted working tree includes the migration itself plus two fixes
  from last session: `package.json` kysely 0.28.17 override and
  `next.config.mjs` `serverExternalPackages: ['kysely']`.
