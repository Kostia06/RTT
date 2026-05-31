import { and, desc, eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { recipes } from '@/lib/db/schema';
import type { RecipeDifficulty } from '@/types/recipe';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = BaseSQLiteDatabase<'sync' | 'async', any, any>;

export interface RecipeFilter {
  difficulty?: RecipeDifficulty;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export async function getRecipes(db: Db, f: RecipeFilter) {
  const where = [eq(recipes.active, true)];
  if (f.difficulty) where.push(eq(recipes.difficulty, f.difficulty));
  if (f.featured !== undefined) where.push(eq(recipes.featured, f.featured));

  let q = db.select().from(recipes).where(and(...where)).orderBy(desc(recipes.created_at));
  if (f.limit !== undefined) q = q.limit(f.limit) as typeof q;
  if (f.offset) q = q.offset(f.offset) as typeof q;
  return q;
}
