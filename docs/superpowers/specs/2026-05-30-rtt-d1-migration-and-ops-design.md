# RTT — D1/Better Auth Migration + Admin Operations System

**Date:** 2026-05-30
**Status:** Approved — in progress

> **UPDATE (2026-05-31): GREENFIELD.** The D1 database is created **from scratch** — no Supabase data is imported. All "migrate existing data" / ETL / live-schema-dump work (originally Task 6 and the §7 ETL step) is **dropped**. Tables are defined fresh in Drizzle from the app's types/usage and populated with **seed data**. No Supabase credentials are needed.

## 1. Goals

1. **Foundation migration** (do first): move the data layer Supabase → **Cloudflare D1** (Drizzle ORM) and auth → **Better Auth** (email/password, roles, email verification, password reset). Migrate existing production data. R2 image storage follows in a later phase.
2. **Refocus the admin area**: keep product / order / recipe management; remove the other ~17 admin/employee pages; add a focused **operations system**: QR clock in/out, schedules, shift production, end-of-shift checklist, QR fridge stocking, reminders.

## 2. Roles (Better Auth `admin` plugin role field)

- `customer` — storefront only.
- `employee` — clock in/out, see their shift's production tasks, stock fridges, complete the closing checklist.
- `manager` / `admin` — all of the above + create schedules, generate QR codes, manage fridges/boxes/thresholds, maintain the checklist template, act on reminders, manage products/orders/recipes.

## 3. Phasing

- **P1 — Foundation:** D1 schema + Drizzle; Better Auth; ETL of existing data + users; keep storefront working. (This is the previously-brainstormed migration.)
- **P2 — Admin cleanup:** remove non-kept admin pages; restructure admin nav to {Products, Orders, Recipes} + {Clock, Schedule, Production, Checklist, Fridges, Reminders}.
- **P3 — Clock in/out + schedules + shift production.**
- **P4 — End-of-shift checklist.**
- **P5 — QR fridge stocking.**
- **P6 — Reminders (auto-surfaced).**
- **P7 (later) — R2 image migration.**

Each phase is its own PR(s), kept small.

## 4. Data model (new D1 tables, Drizzle; SQLite types)

- `shifts` — id, date, start_at, end_at, notes.
- `shift_assignments` — shift_id, user_id (who is scheduled).
- `shift_production` — shift_id, product_id, quantity, status. Admin-assigned; quantities pre-filled from recommendations (§5.3).
- `clock_qr` — id, token, label, active, created_by. The static shop QR (rotatable).
- `time_entries` — id, user_id, shift_id (nullable), clock_in_at, clock_out_at.
- `checklist_templates` — id, name, items (JSON array of step strings), active.
- `checklist_runs` — id, template_id, shift_id/date, item_states (JSON), completed_by, completed_at.
- `fridges` — id, name, qr_token.
- `fridge_boxes` — id, fridge_id, product_id, max_portions, current_portions, allocation (flexible JSON/text — "for who/what", see §6), updated_at, updated_by. A box is **partial** when `current_portions < max_portions`.
- `stock_events` — id, box_id, user_id, delta, resulting_portions, at (audit trail of stocking).
- `reminders` — id, type (`schedule` | `restock`), source (`low_stock` | `order_demand` | `manual`), product_id (nullable), message, status (`open` | `done` | `dismissed`), created_by, created_at.
- `products` — add `low_stock_threshold` (for reminder detection) + `stock_on_hand` if not already tracked.
- Better Auth tables: `user`, `session`, `account`, `verification` (generated).
- Migrated as-is: products, product_variants, recipes, orders, order_items, etc.

## 5. Feature flows

### 5.1 QR clock in/out (one shop QR, staff scan)
- Admin "Clock QR" page renders the shop QR (encodes `/{clock}?token=…`). Static token, rotatable.
- Staff scan on their phone → `/clock?token=…` → must be logged in (Better Auth) → token validated → **toggle**: open `time_entry` = clock in; open entry exists = clock out.
- **On clock-in:** show the person their shift's production tasks (`shift_production` for today's shift).
- **Last-person rule:** a clock-out that would drop clocked-in count to zero requires a completed `checklist_run` (from the active template) before it finalizes.

### 5.2 Schedules
- Admin schedule page: create `shifts`, assign employees (`shift_assignments`), attach production (`shift_production`).
- Employees see their upcoming shifts (read-only).

### 5.3 Shift production + recommendations
- When the admin builds `shift_production`, the system **recommends** quantities = f(open orders, products below `low_stock_threshold`). Admin edits/confirms → becomes the shift's tasks. (Combines "admin assigns per shift" + "auto from stock/orders".)

### 5.4 End-of-shift checklist
- Admin maintains a reusable `checklist_template`. The last person to clock out completes a `checklist_run` (all items checked) before clock-out finalizes.

### 5.5 QR fridge stocking
- Each `fridge` has its own QR (admin-generated). Staff scan → `/fridge/[id]` stocking UI.
- UI lists the fridge's boxes: product, `current/max` portions; **partial boxes flagged "fill first"** and sorted to the top.
- Staff adjust portions while stocking → writes `stock_events` (audit) and updates `current_portions`. Admin sets `max_portions` per box.

### 5.6 Reminders (auto-surfaced, admin acts)
- A derived check surfaces: products below threshold (low stock) and demand implied by open orders → reminder cards on the admin dashboard.
- Admin acts **manually** (create a schedule / restock task) from the suggestion. Reminders have `open` / `done` / `dismissed` states. Manual reminders also supported.

## 6. Open items / assumptions

- **Fridge box allocation** ("for who depends on many factors"): modeled as a flexible `allocation` field on `fridge_boxes` for now (e.g., order id, business name, or freeform). To be refined once the real allocation rules are known — flagged, not silently fixed.
- One static shop QR for clock in/out (rotation optional); fridge QRs are per-fridge.
- Square payments untouched (lazy client retained).

## 7. Tech decisions (carried from prior brainstorm)

- **Drizzle** on D1; `drizzle-kit` migrations; bindings via `getCloudflareContext().env.DB`.
- **Better Auth** + `drizzleAdapter` + `admin` plugin (roles); email/password + verification + reset via existing `src/lib/email` (Resend).
- **Local dev:** `next dev --webpack` + `initOpenNextCloudflareForDev()` for local Miniflare D1/R2.
- **QR:** existing `qrcode` / `qrcode.react` deps.
- **ETL:** script reads live Supabase Postgres → transforms → loads into D1 (`wrangler d1 execute --remote`). Auth users migrated with bcrypt hashes; Better Auth configured with a bcrypt-compatible verify so existing logins keep working.
