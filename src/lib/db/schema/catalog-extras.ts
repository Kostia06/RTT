import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const related_products = sqliteTable('related_products', {
  id: text('id').primaryKey(),
  product_id: text('product_id').notNull(),
  related_product_id: text('related_product_id').notNull(),
  relationship_type: text('relationship_type'),
  sort_order: integer('sort_order').notNull().default(0),
  created_at: text('created_at').notNull(),
});

export type RelatedProductRow = typeof related_products.$inferSelect;
