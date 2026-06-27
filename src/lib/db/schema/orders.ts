import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  order_number: text('order_number').notNull(),
  customer_name: text('customer_name'),
  customer_email: text('customer_email').notNull(),
  customer_phone: text('customer_phone'),
  items: text('items', { mode: 'json' }).$type<unknown[]>(),
  subtotal: real('subtotal'),
  tax: real('tax'),
  total: real('total').notNull(),
  status: text('status').notNull().default('pending'),
  payment_method: text('payment_method'),
  payment_status: text('payment_status'),
  payment_id: text('payment_id'),
  delivery_type: text('delivery_type'),
  delivery_method: text('delivery_method'),
  delivery_time_slot: text('delivery_time_slot'),
  delivery_address: text('delivery_address'),
  delivery_city: text('delivery_city'),
  delivery_postal_code: text('delivery_postal_code'),
  delivery_instructions: text('delivery_instructions'),
  pickup_date: text('pickup_date'),
  pickup_time: text('pickup_time'),
  notes: text('notes'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at'),
});

export type OrderRow = typeof orders.$inferSelect;

export const order_items = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  order_id: text('order_id').notNull(),
  product_name: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  created_at: text('created_at').notNull(),
});

export type OrderItemRow = typeof order_items.$inferSelect;
