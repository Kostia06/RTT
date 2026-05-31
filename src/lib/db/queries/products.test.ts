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
