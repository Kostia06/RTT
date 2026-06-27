import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { recipes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function POST(request: Request) {
  const gate = await requireRole(request, 'admin');
  if (gate.error) return gate.error;

  try {
    const db = await getDb();
    const body = await request.json();
    const {
      title,
      slug,
      description,
      difficulty,
      servings,
      ingredients,
      instructions,
      nutritional_info,
      images,
      tips,
      active = true,
      featured = false,
    } = body;

    // Validate required fields
    if (!title || !slug || !difficulty || !ingredients || !instructions) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, difficulty, ingredients, instructions' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await db
      .select({ id: recipes.id })
      .from(recipes)
      .where(eq(recipes.slug, slug))
      .limit(1);

    if (existing[0]) {
      return NextResponse.json(
        { error: 'A recipe with this slug already exists' },
        { status: 400 }
      );
    }

    // Create recipe. JSON columns are serialized by Drizzle (mode: 'json').
    const now = new Date().toISOString();
    const inserted = await db
      .insert(recipes)
      .values({
        id: crypto.randomUUID(),
        title,
        slug,
        description,
        difficulty,
        servings,
        ingredients,
        instructions,
        nutritional_info: nutritional_info ?? null,
        images: images ?? [],
        tips,
        active,
        featured,
        created_at: now,
        updated_at: now,
      })
      .returning();

    const recipe = inserted[0];

    return NextResponse.json({
      success: true,
      recipe: {
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
      },
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    const message = error instanceof Error ? error.message : 'Failed to create recipe';
    return NextResponse.json(
      { error: 'Failed to create recipe', details: message },
      { status: 500 }
    );
  }
}
