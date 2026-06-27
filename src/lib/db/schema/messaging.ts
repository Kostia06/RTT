import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const contact_messages = sqliteTable('contact_messages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at'),
});

export type ContactMessageRow = typeof contact_messages.$inferSelect;

export const newsletter_subscribers = sqliteTable('newsletter_subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  source: text('source').notNull().default('website'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  subscribed_at: text('subscribed_at').notNull(),
  updated_at: text('updated_at'),
});

export type NewsletterSubscriberRow = typeof newsletter_subscribers.$inferSelect;
