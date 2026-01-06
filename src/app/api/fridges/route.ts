import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Generate unique QR code string
function generateQRCode(): string {
  return `FRIDGE-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    let query = supabase
      .from('fridges')
      .select('*')
      .order('name', { ascending: true });

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ fridges: data || [] });
  } catch (error: any) {
    console.error('Error fetching fridges:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch fridges' },
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

    // Generate QR code if not provided
    const qrCode = body.qr_code || generateQRCode();

    const { data, error } = await supabase
      .from('fridges')
      .insert([{
        name: body.name,
        qr_code: qrCode,
        location: body.location,
        max_capacity_cases: body.max_capacity_cases,
        max_capacity_portions: body.max_capacity_portions,
        temperature_log_required: body.temperature_log_required !== false,
        active: body.active !== false,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ fridge: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating fridge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create fridge' },
      { status: 500 }
    );
  }
}
