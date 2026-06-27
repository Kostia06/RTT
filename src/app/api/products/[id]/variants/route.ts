import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { product_variants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

// GET /api/products/[id]/variants - Fetch all variants for a product (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    const variants = await db
      .select()
      .from(product_variants)
      .where(eq(product_variants.product_id, id));

    return NextResponse.json({ variants: variants || [] });
  } catch (error) {
    console.error('Error in GET /api/products/[id]/variants:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch variants';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/products/[id]/variants - Create a new variant (admin)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireRole(request, 'admin');
  if (gate.error) return gate.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDb();

    const { name, sku, size, pack_quantity, price, stock, options } = body;

    // Validate required fields
    if (!name || !sku || !size) {
      return NextResponse.json(
        { error: 'Name, SKU, and Size are required' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existing = await db
      .select({ id: product_variants.id })
      .from(product_variants)
      .where(eq(product_variants.sku, sku))
      .limit(1);

    if (existing[0]) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      );
    }

    // The product_variants table has no size/pack_quantity columns; fold them
    // (and any caller-supplied options) into the `options` JSON column.
    const mergedOptions: Record<string, string> = { ...(options ?? {}) };
    if (size !== undefined) mergedOptions.size = String(size);
    if (pack_quantity !== undefined) mergedOptions.pack_quantity = String(pack_quantity);

    const inserted = await db
      .insert(product_variants)
      .values({
        id: crypto.randomUUID(),
        product_id: id,
        name,
        sku,
        price: price || 0,
        stock: stock || 0,
        options: mergedOptions,
      })
      .returning();

    return NextResponse.json({ variant: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/products/[id]/variants:', error);
    const message = error instanceof Error ? error.message : 'Failed to create variant';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
