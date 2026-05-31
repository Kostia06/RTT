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
  sqlite.exec(`CREATE TABLE recipes (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
    description TEXT, difficulty TEXT NOT NULL, servings INTEGER NOT NULL DEFAULT 1,
    ingredients TEXT NOT NULL DEFAULT '[]', instructions TEXT NOT NULL DEFAULT '[]',
    nutritional_info TEXT, images TEXT NOT NULL DEFAULT '[]', tips TEXT,
    active INTEGER NOT NULL DEFAULT 1, featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );`);
  return drizzle(sqlite, { schema });
}
