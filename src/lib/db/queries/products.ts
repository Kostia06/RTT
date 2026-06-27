import { and, asc, desc, eq, inArray, ne, or } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { products, product_variants, related_products } from '@/lib/db/schema';

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

  let q = db.select().from(products).where(and(...where)).orderBy(desc(products.featured), desc(products.created_at));
  if (f.limit) q = q.limit(f.limit) as typeof q;
  if (f.skip) q = q.offset(f.skip) as typeof q;
  return q;
}

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  images: unknown;
  category: string;
};

// Single active product by id OR slug, plus its variants and related/similar
// products. Used by the public detail page (server-side, no self-fetch) and
// mirrors GET /api/products/[id]. Returns null when not found.
export async function getProductDetail(db: Db, idOrSlug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.active, true), or(eq(products.id, idOrSlug), eq(products.slug, idOrSlug))))
    .limit(1);
  if (!product) return null;

  const variantRows = await db
    .select()
    .from(product_variants)
    .where(eq(product_variants.product_id, product.id));
  const variants = variantRows.map((v) => ({
    id: v.id,
    name: v.name,
    sku: v.sku,
    price: v.price,
    stock: v.stock,
    options: v.options,
  }));

  const relatedRows = await db
    .select()
    .from(related_products)
    .where(eq(related_products.product_id, product.id))
    .orderBy(asc(related_products.sort_order));

  let relatedProducts: RelatedProduct[] = [];
  if (relatedRows.length > 0) {
    const ids = relatedRows.map((rp) => rp.related_product_id);
    const details = await db
      .select()
      .from(products)
      .where(and(inArray(products.id, ids), eq(products.active, true)));
    relatedProducts = details.map((p) => ({
      id: p.id, name: p.name, slug: p.slug, description: p.description,
      price: p.price_regular, images: p.images, category: p.category,
    }));
  }
  if (relatedProducts.length === 0) {
    const similar = await db
      .select()
      .from(products)
      .where(and(eq(products.category, product.category), eq(products.active, true), ne(products.id, product.id)))
      .limit(4);
    relatedProducts = similar.map((p) => ({
      id: p.id, name: p.name, slug: p.slug, description: p.description,
      price: p.price_regular, images: p.images, category: p.category,
    }));
  }

  return { ...product, variants, relatedProducts };
}
