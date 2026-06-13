# Employee Sweep Report

**Started:** 2026-06-11 · **Branch:** feature/next-16-upgrade
**Legend:** ✅ verified live · 🔧 fixed (commit) · 🔑 needs key/boundary · 📋 design issue (deferred)

## Phase 1 — Static audit
| # | Bug class | Files | Outcome | Commit |
|---|-----------|-------|---------|--------|
| T2 | Supabase leftovers | `ImageUpload.tsx`, `lib/supabase/server.ts` | 🔧 ImageUpload degrades when storage unconfigured (disabled state); deleted orphan `server.ts` (0 importers); kept `client.ts`/`config.ts` (still imported) | cb4dc5c |
| T3 | Missing auth guards | all `api/**/route.ts` | ✅ No bug. Audit of all 36 routes: every employee/admin/write route already uses `requireRole`/`requireUser`. The 5 unguarded routes are intentionally public: `products`,`recipes` (GET-only catalog), `auth/[...all]` (Better Auth), `orders/create`,`payment/create-payment` (guest checkout → sub-project B). Auth layer survived migration intact. | n/a |
| T4 | Role drift (`user` vs role model) | `lib/auth/auth.ts` | 🔧 `admin()` plugin defaulted new signups to `"user"` (rank −1, fails all guards). Set `admin({ defaultRole: 'customer', adminRoles: ['admin'] })`. Verified live: signup → `role:"customer"` in response + D1. Local data already clean (0 `user`/null rows). | _pending_ |

## Phase 2 — Live sweep
| Domain | Page | Feature | Status | Evidence |
|--------|------|---------|--------|----------|

## Missing keys / external boundaries
| Service | Env var(s) | Verified up to |
|---------|-----------|----------------|
| Image storage (Supabase, legacy) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | UI shows "unavailable" disabled state when unset; no upload path exercised |

## Test data created
| Table | Row id / name | Created by task |
|-------|---------------|-----------------|
| user | sweep-roletest@rtt.test (`7xOaxZuyk1NcJXu5TnmwF8fMFhoXA1P9`, role=customer, unverified) | T4 |

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
