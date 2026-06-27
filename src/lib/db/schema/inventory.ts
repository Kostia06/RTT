import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  contact_person: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  products: text('products', { mode: 'json' }).$type<string[]>(),
  rating: real('rating').notNull().default(0),
  notes: text('notes'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at'),
});

export type SupplierRow = typeof suppliers.$inferSelect;

export const restock_orders = sqliteTable('restock_orders', {
  id: text('id').primaryKey(),
  supplier_id: text('supplier_id').notNull(),
  supplier_name: text('supplier_name').notNull(),
  items: text('items', { mode: 'json' }).$type<
    { itemId: string; itemName: string; quantity: number; costPerUnit: number }[]
  >(),
  total_cost: real('total_cost').notNull().default(0),
  status: text('status').notNull().default('draft'),
  ordered_by: text('ordered_by'),
  ordered_at: text('ordered_at').notNull(),
  expected_delivery: text('expected_delivery'),
  received_at: text('received_at'),
  notes: text('notes'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at'),
});

export type RestockOrderRow = typeof restock_orders.$inferSelect;
