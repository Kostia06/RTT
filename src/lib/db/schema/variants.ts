import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const product_variants = sqliteTable('product_variants', {
  id: text('id').primaryKey(),
  product_id: text('product_id').notNull(),
  sku: text('sku').notNull(),
  name: text('name').notNull(),
  price: real('price').notNull(),
  stock: integer('stock').default(0),
  options: text('options', { mode: 'json' }).$type<Record<string, string>>(),
});

export type VariantRow = typeof product_variants.$inferSelect;
