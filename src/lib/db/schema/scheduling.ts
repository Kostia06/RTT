import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const shifts = sqliteTable('shifts', {
  id: text('id').primaryKey(),
  employee_id: text('employee_id').notNull(),
  employee_name: text('employee_name').notNull(),
  start_time: text('start_time').notNull(),
  end_time: text('end_time').notNull(),
  position: text('position').notNull(),
  status: text('status').notNull().default('scheduled'),
  notes: text('notes'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at'),
});

export type ShiftRow = typeof shifts.$inferSelect;

export const time_entries = sqliteTable('time_entries', {
  id: text('id').primaryKey(),
  employee_id: text('employee_id').notNull(),
  employee_name: text('employee_name').notNull(),
  clock_in: text('clock_in').notNull(),
  clock_out: text('clock_out'),
  total_hours: real('total_hours'),
  notes: text('notes'),
  is_manual: integer('is_manual', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at'),
});

export type TimeEntryRow = typeof time_entries.$inferSelect;
