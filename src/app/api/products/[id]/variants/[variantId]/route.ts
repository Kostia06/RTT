import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { product_variants } from '@/lib/db/schema';
import { and, eq, ne } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

// PUT /api/products/[id]/variants/[variantId] - Update a variant (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const gate = await requireRole(request, 'admin');
  if (gate.error) return gate.error;

  try {
    const { variantId } = await params;
    const body = await request.json();
    const db = await getDb();

    const { name, sku, size, pack_quantity, price, stock, options } = body;

    // If updating SKU, check if it already exists (excluding current variant)
    if (sku) {
      const existing = await db
        .select({ id: product_variants.id })
        .from(product_variants)
        .where(and(eq(product_variants.sku, sku), ne(product_variants.id, variantId)))
        .limit(1);

      if (existing[0]) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Build the update payload. size/pack_quantity have no columns; fold them
    // into the `options` JSON column when provided.
    const updateData: Partial<typeof product_variants.$inferInsert> = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;

    if (options !== undefined || size !== undefined || pack_quantity !== undefined) {
      const current = await db
        .select({ options: product_variants.options })
        .from(product_variants)
        .where(eq(product_variants.id, variantId))
        .limit(1);
      const mergedOptions: Record<string, string> = {
        ...(current[0]?.options ?? {}),
        ...(options ?? {}),
      };
      if (size !== undefined) mergedOptions.size = String(size);
      if (pack_quantity !== undefined) mergedOptions.pack_quantity = String(pack_quantity);
      updateData.options = mergedOptions;
    }

    const updated = await db
      .update(product_variants)
      .set(updateData)
      .where(eq(product_variants.id, variantId))
      .returning();

    if (!updated[0]) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    return NextResponse.json({ variant: updated[0] });
  } catch (error) {
    console.error('Error in PUT /api/products/[id]/variants/[variantId]:', error);
    const message = error instanceof Error ? error.message : 'Failed to update variant';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/products/[id]/variants/[variantId] - Delete a variant (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const gate = await requireRole(request, 'admin');
  if (gate.error) return gate.error;

  try {
    const { variantId } = await params;
    const db = await getDb();

    await db.delete(product_variants).where(eq(product_variants.id, variantId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/products/[id]/variants/[variantId]:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete variant';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
