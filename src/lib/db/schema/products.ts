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
