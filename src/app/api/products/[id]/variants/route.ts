import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// GET /api/products/[id]/variants - Fetch all variants for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .order('size', { ascending: true })
      .order('pack_quantity', { ascending: true });

    if (error) {
      console.error('Error fetching variants:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ variants: variants || [] });
  } catch (error: any) {
    console.error('Error in GET /api/products/[id]/variants:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/products/[id]/variants - Create a new variant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    const { name, sku, size, pack_quantity, price, stock, active } = body;

    // Validate required fields
    if (!name || !sku || !size) {
      return NextResponse.json(
        { error: 'Name, SKU, and Size are required' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const { data: existingSku } = await supabase
      .from('product_variants')
      .select('id')
      .eq('sku', sku)
      .single();

    if (existingSku) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      );
    }

    // Insert the new variant
    const { data: variant, error } = await supabase
      .from('product_variants')
      .insert({
        product_id: id,
        name,
        sku,
        size,
        pack_quantity: pack_quantity || 0,
        price: price || 0,
        stock: stock || 0,
        active: active !== undefined ? active : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating variant:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ variant }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/products/[id]/variants:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
