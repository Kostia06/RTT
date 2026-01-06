import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('production_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ item: data });
  } catch (error: any) {
    console.error('Error fetching production item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch production item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
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
      .update({
        name: body.name,
        sku: body.sku,
        category: body.category,
        case_size: body.case_size,
        low_stock_threshold: body.low_stock_threshold,
        active: body.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item: data });
  } catch (error: any) {
    console.error('Error updating production item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update production item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Soft delete
    const { error } = await supabase
      .from('production_items')
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Production item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting production item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete production item' },
      { status: 500 }
    );
  }
}
