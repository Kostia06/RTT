import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const employeeId = searchParams.get('employee_id');
    const productionItemId = searchParams.get('production_item_id');
    const shiftId = searchParams.get('shift_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = searchParams.get('limit') || '100';

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let query = supabase
      .from('production_logs')
      .select(`
        *,
        production_item:production_items(*)
      `)
      .order('logged_at', { ascending: false })
      .limit(parseInt(limit));

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (productionItemId) {
      query = query.eq('production_item_id', productionItemId);
    }

    if (shiftId) {
      query = query.eq('shift_id', shiftId);
    }

    if (startDate) {
      query = query.gte('logged_at', startDate);
    }

    if (endDate) {
      query = query.lte('logged_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ logs: data || [] });
  } catch (error: any) {
    console.error('Error fetching production logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch production logs' },
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

    const { shift_id, production_item_id, cases_made, loose_portions, notes } = body;

    if (!shift_id || !production_item_id) {
      return NextResponse.json(
        { error: 'Missing required fields: shift_id and production_item_id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('production_logs')
      .insert([{
        shift_id,
        employee_id: user.id,
        production_item_id,
        cases_made: cases_made || 0,
        loose_portions: loose_portions || 0,
        notes: notes || null,
      }])
      .select(`
        *,
        production_item:production_items(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      log: data,
      message: 'Production log created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating production log:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create production log' },
      { status: 500 }
    );
  }
}
