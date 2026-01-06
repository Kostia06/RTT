import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get fridge details
    const { data: fridge, error: fridgeError } = await supabase
      .from('fridges')
      .select('*')
      .eq('id', id)
      .single();

    if (fridgeError) throw fridgeError;

    // Get inventory with production item details
    const { data: inventory, error: inventoryError } = await supabase
      .from('fridge_inventory')
      .select(`
        *,
        production_item:production_items(*)
      `)
      .eq('fridge_id', id)
      .order('batch_date', { ascending: false });

    if (inventoryError) throw inventoryError;

    // Calculate totals
    const total_cases = inventory?.reduce((sum, item) => sum + item.cases, 0) || 0;
    const total_portions = inventory?.reduce((sum, item) => sum + item.loose_portions, 0) || 0;

    // Calculate capacity used
    let capacity_used_cases = null;
    let capacity_used_portions = null;

    if (fridge.max_capacity_cases) {
      capacity_used_cases = (total_cases / fridge.max_capacity_cases) * 100;
    }

    if (fridge.max_capacity_portions) {
      const total_portions_including_cases = (total_cases * 50) + total_portions;
      capacity_used_portions = (total_portions_including_cases / fridge.max_capacity_portions) * 100;
    }

    return NextResponse.json({
      fridge,
      inventory: inventory || [],
      total_cases,
      total_portions,
      capacity_used_cases,
      capacity_used_portions,
    });
  } catch (error: any) {
    console.error('Error fetching fridge inventory:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch fridge inventory' },
      { status: 500 }
    );
  }
}
