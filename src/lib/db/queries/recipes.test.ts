import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from '@/test/sqlite';
import { recipes } from '@/lib/db/schema';
import { getRecipes } from './recipes';

function makeDb() {
  return makeTestDb();
}

const NOW = new Date().toISOString();

const activeRecipe = {
  id: 'r1',
  title: 'Tonkotsu Ramen',
  slug: 'tonkotsu-ramen',
  difficulty: 'Medium' as const,
  servings: 2,
  active: true,
  featured: true,
  ingredients: [],
  instructions: [],
  images: [],
  created_at: NOW,
  updated_at: NOW,
};

const inactiveRecipe = {
  id: 'r2',
  title: 'Secret Recipe',
  slug: 'secret-recipe',
  difficulty: 'Hard' as const,
  servings: 1,
  active: false,
  featured: false,
  ingredients: [],
  instructions: [],
  images: [],
  created_at: NOW,
  updated_at: NOW,
};

describe('getRecipes', () => {
  let db: ReturnType<typeof makeDb>;

  beforeEach(async () => {
    db = makeDb();
    await db.insert(recipes).values([activeRecipe, inactiveRecipe]);
  });

  it('returns only active recipes', async () => {
    const rows = await getRecipes(db, {});
    expect(rows.length).toBe(1);
    expect(rows[0].id).toBe('r1');
  });

  it('filters by featured', async () => {
    const featured = await getRecipes(db, { featured: true });
    expect(featured.length).toBe(1);
    expect(featured[0].featured).toBe(true);

    const notFeatured = await getRecipes(db, { featured: false });
    expect(notFeatured.length).toBe(0);
  });

  it('filters by difficulty', async () => {
    const medium = await getRecipes(db, { difficulty: 'Medium' });
    expect(medium.length).toBe(1);
    expect(medium[0].difficulty).toBe('Medium');

    const hard = await getRecipes(db, { difficulty: 'Hard' });
    expect(hard.length).toBe(0); // inactive, so excluded
  });

  it('respects limit and offset', async () => {
    const limited = await getRecipes(db, { limit: 0 });
    expect(limited.length).toBe(0);
  });
});
