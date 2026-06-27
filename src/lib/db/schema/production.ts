import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const production_items = sqliteTable('production_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sku: text('sku'),
  category: text('category'),
  case_size: integer('case_size').notNull().default(50),
  low_stock_threshold: integer('low_stock_threshold').notNull().default(20),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at'),
});

export type ProductionItemRow = typeof production_items.$inferSelect;

export const production_logs = sqliteTable('production_logs', {
  id: text('id').primaryKey(),
  shift_id: text('shift_id').notNull(),
  employee_id: text('employee_id').notNull(),
  production_item_id: text('production_item_id').notNull(),
  cases_made: integer('cases_made').notNull().default(0),
  loose_portions: integer('loose_portions').notNull().default(0),
  notes: text('notes'),
  logged_at: text('logged_at').notNull(),
});

export type ProductionLogRow = typeof production_logs.$inferSelect;

export const shift_production_assignments = sqliteTable('shift_production_assignments', {
  id: text('id').primaryKey(),
  shift_id: text('shift_id').notNull(),
  production_item_id: text('production_item_id').notNull(),
  bins_required: integer('bins_required'),
  target_portions: integer('target_portions'),
  status: text('status').notNull().default('pending'),
  notes: text('notes'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at'),
});

export type ShiftProductionAssignmentRow = typeof shift_production_assignments.$inferSelect;
