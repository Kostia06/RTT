import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check if this is an employee request (no active filter for employees)
    const { data: { user } } = await supabase.auth.getUser();
    const isEmployee = !!user;

    // Build query
    let query = supabase
      .from('recipes')
      .select('*');

    // Only filter by active for public requests
    if (!isEmployee) {
      query = query.eq('active', true);
    }

    // Determine if id is UUID or slug
    if (UUID_REGEX.test(id)) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data: recipe, error } = await query.single();

    if (error || !recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsedRecipe = {
      ...recipe,
      ingredients: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients,
      instructions: typeof recipe.instructions === 'string' ? JSON.parse(recipe.instructions) : recipe.instructions,
      images: typeof recipe.images === 'string' ? JSON.parse(recipe.images) : recipe.images,
      nutritional_info: recipe.nutritional_info && typeof recipe.nutritional_info === 'string'
        ? JSON.parse(recipe.nutritional_info)
        : recipe.nutritional_info,
    };

    return NextResponse.json({ recipe: parsedRecipe }, { status: 200 });
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
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is an employee/admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const { data: existingRecipe } = await supabase
      .from('recipes')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existingRecipe) {
      return NextResponse.json(
        { error: 'A recipe with this slug already exists' },
        { status: 400 }
      );
    }

    // Update recipe
    const { data: recipe, error } = await supabase
      .from('recipes')
      .update({
        title,
        slug,
        description,
        difficulty,
        servings,
        ingredients: JSON.stringify(ingredients),
        instructions: JSON.stringify(instructions),
        nutritional_info: nutritional_info ? JSON.stringify(nutritional_info) : null,
        images: JSON.stringify(images || []),
        tips,
        active,
        featured,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is an employee/admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete recipe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
