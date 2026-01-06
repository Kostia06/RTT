import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// PUT /api/products/[id]/variants/[variantId] - Update a variant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    const { name, sku, size, pack_quantity, price, stock, active } = body;

    // If updating SKU, check if it already exists (excluding current variant)
    if (sku) {
      const { data: existingSku } = await supabase
        .from('product_variants')
        .select('id')
        .eq('sku', sku)
        .neq('id', variantId)
        .single();

      if (existingSku) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Update the variant
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (size !== undefined) updateData.size = size;
    if (pack_quantity !== undefined) updateData.pack_quantity = pack_quantity;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (active !== undefined) updateData.active = active;

    const { data: variant, error } = await supabase
      .from('product_variants')
      .update(updateData)
      .eq('id', variantId)
      .select()
      .single();

    if (error) {
      console.error('Error updating variant:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ variant });
  } catch (error: any) {
    console.error('Error in PUT /api/products/[id]/variants/[variantId]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/products/[id]/variants/[variantId] - Delete a variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId);

    if (error) {
      console.error('Error deleting variant:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/products/[id]/variants/[variantId]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
