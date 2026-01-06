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
      .from('fridges')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ fridge: data });
  } catch (error: any) {
    console.error('Error fetching fridge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch fridge' },
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
      .from('fridges')
      .update({
        name: body.name,
        location: body.location,
        max_capacity_cases: body.max_capacity_cases,
        max_capacity_portions: body.max_capacity_portions,
        temperature_log_required: body.temperature_log_required,
        active: body.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ fridge: data });
  } catch (error: any) {
    console.error('Error updating fridge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update fridge' },
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
      .from('fridges')
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Fridge deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting fridge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete fridge' },
      { status: 500 }
    );
  }
}
