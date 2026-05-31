import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getRecipes } from '@/lib/db/queries/recipes';
import type { RecipeDifficulty } from '@/types/recipe';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const db = await getDb();
    const rows = await getRecipes(db, {
      difficulty: (sp.get('difficulty') as RecipeDifficulty) ?? undefined,
      featured: sp.get('featured') === 'true' ? true : undefined,
      limit: parseInt(sp.get('limit') || '20'),
      offset: parseInt(sp.get('offset') || '0'),
    });
    return NextResponse.json({ recipes: rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}
