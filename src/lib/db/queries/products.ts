import { and, desc, eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { products } from '@/lib/db/schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
