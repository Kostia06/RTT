import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { recipes } from '@/lib/db/schema';
import { and, eq, ne, or } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb();
    const { id } = await params;

    // Public storefront detail endpoint: only active recipes are returned.
    // Match by id OR slug so admin edit links (which pass the recipe id, e.g.
    // the seeded `seed-r1`) load correctly alongside slug-based storefront URLs.
    const where = and(
      eq(recipes.active, true),
      or(eq(recipes.id, id), eq(recipes.slug, id))
    );

    const rows = await db.select().from(recipes).where(where).limit(1);
    const recipe = rows[0];

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // JSON columns are already parsed by Drizzle (mode: 'json').
    return NextResponse.json({ recipe }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireRole(request, 'admin');
  if (gate.error) return gate.error;

  try {
    const db = await getDb();
    const { id } = await params;
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
      active,
      featured,
    } = body;

    // Validate required fields
    if (!title || !slug || !difficulty || !ingredients || !instructions) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, difficulty, ingredients, instructions' },
        { status: 400 }
      );
    }

    // Check if slug already exists for a different recipe
    const existing = await db
      .select({ id: recipes.id })
      .from(recipes)
      .where(and(eq(recipes.slug, slug), ne(recipes.id, id)))
      .limit(1);

    if (existing[0]) {
      return NextResponse.json(
        { error: 'A recipe with this slug already exists' },
        { status: 400 }
      );
    }

    // Update recipe. JSON columns are serialized by Drizzle (mode: 'json').
    const updated = await db
      .update(recipes)
      .set({
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
        updated_at: new Date().toISOString(),
      })
      .where(eq(recipes.id, id))
      .returning();

    const recipe = updated[0];

    if (!recipe) {
      return NextResponse.json(
        { error: 'Failed to update recipe' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recipe: {
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
      },
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireRole(request, 'admin');
  if (gate.error) return gate.error;

  try {
    const db = await getDb();
    const { id } = await params;
    const body = await request.json();

    // If updating slug, ensure it is unique among other recipes.
    if (body.slug !== undefined) {
      const existing = await db
        .select({ id: recipes.id })
        .from(recipes)
        .where(and(eq(recipes.slug, body.slug), ne(recipes.id, id)))
        .limit(1);

      if (existing[0]) {
        return NextResponse.json(
          { error: 'A recipe with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: Partial<typeof recipes.$inferInsert> = {
      updated_at: new Date().toISOString(),
    };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.difficulty !== undefined) updateData.difficulty = body.difficulty;
    if (body.servings !== undefined) updateData.servings = body.servings;
    if (body.ingredients !== undefined) updateData.ingredients = body.ingredients;
    if (body.instructions !== undefined) updateData.instructions = body.instructions;
    if (body.nutritional_info !== undefined) updateData.nutritional_info = body.nutritional_info;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.tips !== undefined) updateData.tips = body.tips;
    if (body.active !== undefined) updateData.active = body.active;
    if (body.featured !== undefined) updateData.featured = body.featured;

    const updated = await db
      .update(recipes)
      .set(updateData)
      .where(eq(recipes.id, id))
      .returning();

    const recipe = updated[0];

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, recipe });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireRole(request, 'admin');
  if (gate.error) return gate.error;

  try {
    const db = await getDb();
    const { id } = await params;

    await db.delete(recipes).where(eq(recipes.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
