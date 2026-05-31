import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import type { RecipeDifficulty, RecipeIngredient, RecipeInstruction, NutritionalInfo, RecipeImage } from '@/types/recipe';

export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  difficulty: text('difficulty').notNull(),
  servings: integer('servings').notNull().default(1),
  ingredients: text('ingredients', { mode: 'json' }).$type<RecipeIngredient[]>().notNull().default([]),
  instructions: text('instructions', { mode: 'json' }).$type<RecipeInstruction[]>().notNull().default([]),
  nutritional_info: text('nutritional_info', { mode: 'json' }).$type<NutritionalInfo>(),
  images: text('images', { mode: 'json' }).$type<RecipeImage[]>().notNull().default([]),
  tips: text('tips'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

export type RecipeRow = typeof recipes.$inferSelect;
