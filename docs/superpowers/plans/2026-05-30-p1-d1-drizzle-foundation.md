# Phase 1 — D1 + Drizzle Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up Cloudflare D1 + Drizzle as the new data layer and prove it end-to-end by serving the `products` domain from D1, establishing the pattern every other table follows.

**Architecture:** Drizzle schema is defined once with `drizzle-orm/sqlite-core` and shared by two drivers — `drizzle-orm/d1` at runtime (binding from `getCloudflareContext().env.DB`) and `drizzle-orm/better-sqlite3` in unit tests (in-memory). Query logic lives in pure helper functions that take a `db` argument, so they're testable without Miniflare. API routes call the helpers.

**Tech Stack:** Next 16 (webpack), `@opennextjs/cloudflare`, Cloudflare D1, Drizzle ORM + drizzle-kit, Vitest, better-sqlite3 (test driver only).

**Scope:** Foundation + `products` vertical slice only. Better Auth, remaining route migrations, the ETL of live Supabase data, and the ops features are separate plans. This plan ends with `/api/products` reading from local D1 and a schema-capture task that feeds the next plan.

---

### Task 1: Install deps and add the D1 binding

**Files:**
- Modify: `package.json` (scripts + deps)
- Modify: `wrangler.jsonc`

- [ ] **Step 1: Install runtime + tooling deps**

Run:
```bash
npm install drizzle-orm
npm install -D drizzle-kit vitest better-sqlite3 @types/better-sqlite3
```

- [ ] **Step 2: Create the local + remote D1 database**

Run:
```bash
npx wrangler d1 create rtt-db
```
Expected: prints a `database_id`. Copy it for the next step.

- [ ] **Step 3: Add the binding to `wrangler.jsonc`**

Merge this into the existing object (replace `PASTE_ID`):
```jsonc
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "rtt-db",
      "database_id": "PASTE_ID",
      "migrations_dir": "drizzle/migrations"
    }
  ]
```

- [ ] **Step 4: Add db scripts to `package.json`**

In `"scripts"` add:
```json
    "db:generate": "drizzle-kit generate",
    "db:migrate:local": "wrangler d1 migrations apply rtt-db --local",
    "db:migrate:remote": "wrangler d1 migrations apply rtt-db --remote",
    "test": "vitest run"
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json wrangler.jsonc
git commit -m "Add D1 binding and Drizzle tooling"
```

---

### Task 2: Drizzle config and the runtime `getDb()` helper

**Files:**
- Create: `drizzle.config.ts`
- Create: `src/lib/db/client.ts`

- [ ] **Step 1: Create `drizzle.config.ts`**

```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
} satisfies Config;
```

- [ ] **Step 2: Create the runtime client `src/lib/db/client.ts`**

```ts
import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import * as schema from './schema';

export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
}
```

- [ ] **Step 3: Commit**

```bash
git add drizzle.config.ts src/lib/db/client.ts
git commit -m "Add drizzle config and getDb helper"
```

---

### Task 3: Define the `products` Drizzle schema

**Files:**
- Create: `src/lib/db/schema/products.ts`
- Create: `src/lib/db/schema/index.ts`

- [ ] **Step 1: Write `src/lib/db/schema/products.ts`**

Translated from `src/types/product.ts` (Postgres → SQLite: text ids, JSON-as-text, real for money, integer for counts, integer 0/1 for booleans, text ISO for timestamps):

```ts
import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sku: text('sku').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  images: text('images', { mode: 'json' }).$type<{ url: string; alt: string; isPrimary?: boolean }[]>().notNull().default([]),
  price_regular: real('price_regular').notNull(),
  price_bulk: real('price_bulk'),
  price_cost: real('price_cost'),
  stock: integer('stock').notNull().default(0),
  unit: text('unit').notNull().default('unit'),
  low_stock_threshold: integer('low_stock_threshold').notNull().default(0),
  supplier: text('supplier'),
  expiry_date: text('expiry_date'),
  nutritional_info: text('nutritional_info', { mode: 'json' }).$type<Record<string, number | undefined>>(),
  cooking_instructions: text('cooking_instructions'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  storage_locations: text('storage_locations', { mode: 'json' }).$type<string[]>(),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export type ProductRow = typeof products.$inferSelect;
```

- [ ] **Step 2: Write `src/lib/db/schema/index.ts`**

```ts
export * from './products';
```

- [ ] **Step 3: Generate the migration**

Run: `npm run db:generate`
Expected: a new SQL file under `drizzle/migrations/` creating the `products` table. No errors.

- [ ] **Step 4: Apply to local D1**

Run: `npm run db:migrate:local`
Expected: "Migrations applied" — creates `.wrangler/.../d1` local SQLite.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/schema drizzle/migrations
git commit -m "Add products D1 schema and migration"
```

---

### Task 4: Products query helpers (TDD)

**Files:**
- Create: `src/lib/db/queries/products.ts`
- Create: `src/lib/db/queries/products.test.ts`
- Create: `src/test/sqlite.ts` (test helper that builds an in-memory db with the schema)

- [ ] **Step 1: Write the in-memory test db helper `src/test/sqlite.ts`**

```ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '@/lib/db/schema';

export function makeTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.exec(`CREATE TABLE products (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, sku TEXT NOT NULL,
    description TEXT, category TEXT NOT NULL, images TEXT NOT NULL DEFAULT '[]',
    price_regular REAL NOT NULL, price_bulk REAL, price_cost REAL,
    stock INTEGER NOT NULL DEFAULT 0, unit TEXT NOT NULL DEFAULT 'unit',
    low_stock_threshold INTEGER NOT NULL DEFAULT 0, supplier TEXT, expiry_date TEXT,
    nutritional_info TEXT, cooking_instructions TEXT,
    active INTEGER NOT NULL DEFAULT 1, featured INTEGER NOT NULL DEFAULT 0,
    storage_locations TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );`);
  return drizzle(sqlite, { schema });
}
```

- [ ] **Step 2: Write the failing test `src/lib/db/queries/products.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { makeTestDb } from '@/test/sqlite';
import { products } from '@/lib/db/schema';
import { getActiveProducts } from './products';

describe('getActiveProducts', () => {
  it('returns only active products, featured filterable', async () => {
    const db = makeTestDb();
    const now = '2026-01-01T00:00:00Z';
    await db.insert(products).values([
      { id: '1', name: 'A', slug: 'a', sku: 'A', category: 'ramen-bowl', images: [], price_regular: 10, active: true, featured: true, created_at: now, updated_at: now },
      { id: '2', name: 'B', slug: 'b', sku: 'B', category: 'merchandise', images: [], price_regular: 5, active: false, featured: false, created_at: now, updated_at: now },
    ]);

    const all = await getActiveProducts(db, {});
    expect(all.map(p => p.id)).toEqual(['1']);

    const feat = await getActiveProducts(db, { featured: true });
    expect(feat.map(p => p.id)).toEqual(['1']);
  });
});
```

- [ ] **Step 3: Run it; verify it fails**

Run: `npm test -- products`
Expected: FAIL — `getActiveProducts` is not exported.

- [ ] **Step 4: Implement `src/lib/db/queries/products.ts`**

```ts
import { and, desc, eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { products } from '@/lib/db/schema';

type Db = BaseSQLiteDatabase<'sync' | 'async', any, any>;

export interface ProductFilter {
  category?: string;
  featured?: boolean;
  limit?: number;
  skip?: number;
}

export async function getActiveProducts(db: Db, f: ProductFilter) {
  const where = [eq(products.active, true)];
  if (f.category && f.category !== 'all') where.push(eq(products.category, f.category));
  if (f.featured) where.push(eq(products.featured, true));

  let q = db.select().from(products).where(and(...where)).orderBy(desc(products.created_at));
  if (f.limit) q = q.limit(f.limit) as typeof q;
  if (f.skip) q = q.offset(f.skip) as typeof q;
  return q;
}
```

- [ ] **Step 5: Run it; verify it passes**

Run: `npm test -- products`
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/queries src/test/sqlite.ts
git commit -m "Add products query helpers with tests"
```

---

### Task 5: Rewire `/api/products` to D1

**Files:**
- Modify: `src/app/api/products/route.ts`

- [ ] **Step 1: Replace the Supabase GET body with the Drizzle helper**

Replace the `try { const supabase = await createClient(); ... }` block so the handler reads from D1. Keep the existing `isSupabaseConfigured` early-return removed (no longer needed). New file:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getActiveProducts } from '@/lib/db/queries/products';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const db = await getDb();
    const rows = await getActiveProducts(db, {
      category: sp.get('category') ?? undefined,
      featured: sp.get('featured') === 'true',
      limit: parseInt(sp.get('limit') || '50'),
      skip: parseInt(sp.get('skip') || '0'),
    });
    return NextResponse.json({ products: rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Seed one local product to verify end-to-end**

Run:
```bash
npx wrangler d1 execute rtt-db --local --command "INSERT INTO products (id,name,slug,sku,category,images,price_regular,active,featured,created_at,updated_at) VALUES ('seed','Tonkotsu','tonkotsu','TON','ramen-bowl','[]',16.0,1,1,'2026-01-01','2026-01-01');"
```
Expected: 1 row written.

- [ ] **Step 3: Run the app and hit the route**

Run: `npm run dev` then in another shell:
```bash
npx wrangler d1 execute rtt-db --local --command "SELECT count(*) FROM products;"
```
Then load `http://localhost:3000/api/products` — expected JSON `{ "products": [ { "id": "seed", ... } ] }`.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/products/route.ts
git commit -m "Serve products from D1 via Drizzle"
```

---

### Task 6: Capture the remaining Supabase schema (feeds the next plan)

**Files:**
- Create: `docs/superpowers/specs/supabase-schema-dump.sql`

- [ ] **Step 1: Dump the live schema**

With the live Supabase connection string in `.env.local` as `SUPABASE_DB_URL`, run:
```bash
npx tsx -e "import postgres from 'postgres'; const sql=postgres(process.env.SUPABASE_DB_URL); const r=await sql\`select table_name,column_name,data_type,is_nullable from information_schema.columns where table_schema='public' order by table_name,ordinal_position\`; console.log(JSON.stringify(r,null,2)); await sql.end();" > docs/superpowers/specs/supabase-schema.json
```
Expected: a JSON listing of every public table's columns.

- [ ] **Step 2: Commit the captured schema**

```bash
git add docs/superpowers/specs/supabase-schema.json
git commit -m "Capture live Supabase schema for migration"
```

This artifact lets the next plan (Phase 1b: remaining tables + Better Auth + ETL) define exact Drizzle schemas without guessing.

---

## What this plan deliberately leaves to later plans

- **Better Auth** (auth tables, login/register/middleware rewrite) — Phase 1b.
- **Remaining ~18 tables + ~38 routes** migrated to Drizzle — Phase 1c (uses the captured schema).
- **ETL** of live Supabase data → D1 — Phase 1d.
- **Ops features** (clock in/out, schedules, checklist, fridge stocking, reminders) — Phases 3–6.
- **R2 image migration** — Phase 7.
