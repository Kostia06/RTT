import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is an employee/admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const { data: existingRecipe } = await supabase
      .from('recipes')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingRecipe) {
      return NextResponse.json(
        { error: 'A recipe with this slug already exists' },
        { status: 400 }
      );
    }

    // Create recipe
    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert({
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
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        {
          error: 'Failed to create recipe',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
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
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}
