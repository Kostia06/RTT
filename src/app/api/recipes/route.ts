import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const difficulty = searchParams.get('difficulty');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check if user is authenticated (for employee view)
    const { data: { user } } = await supabase.auth.getUser();
    const isEmployee = !!user;

    // Build query
    let query = supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Only filter by active for public requests
    if (!isEmployee) {
      query = query.eq('active', true);
    }

    // Apply filters
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data: recipes, error } = await query;

    if (error) {
      console.error('Error fetching recipes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      );
    }

    // Parse JSON fields
    const parsedRecipes = recipes?.map(recipe => ({
      ...recipe,
      ingredients: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients,
      instructions: typeof recipe.instructions === 'string' ? JSON.parse(recipe.instructions) : recipe.instructions,
      images: typeof recipe.images === 'string' ? JSON.parse(recipe.images) : recipe.images,
      nutritional_info: recipe.nutritional_info && typeof recipe.nutritional_info === 'string'
        ? JSON.parse(recipe.nutritional_info)
        : recipe.nutritional_info,
    }));

    return NextResponse.json({ recipes: parsedRecipes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}
