import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    let query = supabase
      .from('production_items')
      .select('*')
      .order('name', { ascending: true });

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ items: data || [] });
  } catch (error: any) {
    console.error('Error fetching production items:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch production items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('production_items')
      .insert([{
        name: body.name,
        sku: body.sku,
        category: body.category,
        case_size: body.case_size || 50,
        low_stock_threshold: body.low_stock_threshold || 20,
        active: body.active !== false,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating production item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create production item' },
      { status: 500 }
    );
  }
}
