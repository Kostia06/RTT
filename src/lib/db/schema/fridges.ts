import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const fridges = sqliteTable('fridges', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  qr_code: text('qr_code').notNull().unique(),
  location: text('location'),
  max_capacity_cases: integer('max_capacity_cases'),
  max_capacity_portions: integer('max_capacity_portions'),
  temperature_log_required: integer('temperature_log_required', { mode: 'boolean' }).notNull().default(true),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at'),
});

export type FridgeRow = typeof fridges.$inferSelect;

export const fridge_inventory = sqliteTable('fridge_inventory', {
  id: text('id').primaryKey(),
  fridge_id: text('fridge_id').notNull(),
  production_item_id: text('production_item_id').notNull(),
  cases: integer('cases').notNull().default(0),
  loose_portions: integer('loose_portions').notNull().default(0),
  batch_date: text('batch_date'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at'),
});

export type FridgeInventoryRow = typeof fridge_inventory.$inferSelect;

export const fridge_temperature_logs = sqliteTable('fridge_temperature_logs', {
  id: text('id').primaryKey(),
  fridge_id: text('fridge_id').notNull(),
  employee_id: text('employee_id').notNull(),
  shift_id: text('shift_id'),
  temperature: real('temperature').notNull(),
  notes: text('notes'),
  logged_at: text('logged_at').notNull(),
});

export type FridgeTemperatureLogRow = typeof fridge_temperature_logs.$inferSelect;
