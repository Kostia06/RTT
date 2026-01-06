import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const { fridge_id, temperature, notes, shift_id } = body;

    if (!fridge_id || temperature === undefined || temperature === null) {
      return NextResponse.json(
        { error: 'Missing required fields: fridge_id and temperature' },
        { status: 400 }
      );
    }

    // Log the temperature
    const { data, error } = await supabase
      .from('fridge_temperature_logs')
      .insert([{
        fridge_id,
        employee_id: user.id,
        shift_id: shift_id || null,
        temperature,
        notes: notes || null,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      log: data,
      message: 'Temperature logged successfully'
    });
  } catch (error: any) {
    console.error('Error logging temperature:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log temperature' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const fridgeId = searchParams.get('fridge_id');
    const limit = searchParams.get('limit') || '50';

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let query = supabase
      .from('fridge_temperature_logs')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(parseInt(limit));

    if (fridgeId) {
      query = query.eq('fridge_id', fridgeId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ logs: data || [] });
  } catch (error: any) {
    console.error('Error fetching temperature logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch temperature logs' },
      { status: 500 }
    );
  }
}
