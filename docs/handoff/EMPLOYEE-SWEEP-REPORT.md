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

**Session baseline (T6):** Tailwind crash fixed → server stable on :3002. Logged
in live as `admin@rtt.test` via the real login form (React handler fired,
redirect to `/account`, 0 console errors). All 24 employee routes return 200 to
admin (no auth redirect, no 404/500). `/dashboard` renders full content + live
stats, 0 errors. Smoke-check folded into each domain below.

_Dev-only note (not a code bug):_ on a cold server, the very first navigation can
emit a transient "Invalid or unexpected token" while webpack is still compiling
the chunk; the form briefly falls back to a native GET. Resolves on reload once
compilation completes. Not reproducible on a warm server.

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

## Missing keys / external boundaries
| Service | Env var(s) | Verified up to |
|---------|-----------|----------------|
| Image storage (Supabase, legacy) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | UI shows "unavailable" disabled state when unset; no upload path exercised |

## Test data created
| Table | Row id / name | Created by task |
|-------|---------------|-----------------|
| user | sweep-roletest@rtt.test (`7xOaxZuyk1NcJXu5TnmwF8fMFhoXA1P9`, role=customer, unverified) | T4 |
| time_entries | 2 rows: 1 clock-in/out cycle + 1 manual entry (4.5h, `sweep manual entry`), employee Admin Tester | Time domain |
| shifts | `3eaf1522-…` Admin Tester, Jun 16 09:00–17:00, Kitchen Staff, status=confirmed | Time domain |

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
