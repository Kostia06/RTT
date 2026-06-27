import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { production_items } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const db = await getDb();
    const { id } = await params;

    const [item] = await db
      .select()
      .from(production_items)
      .where(eq(production_items.id, id));

    if (!item) {
      return NextResponse.json(
        { error: 'Production item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
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
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;

    const db = await getDb();
    const { id } = await params;
    const body = await request.json();

    const [item] = await db
      .update(production_items)
      .set({
        name: body.name,
        sku: body.sku,
        category: body.category,
        case_size: body.case_size,
        low_stock_threshold: body.low_stock_threshold,
        active: body.active,
        updated_at: new Date().toISOString(),
      })
      .where(eq(production_items.id, id))
      .returning();

    if (!item) {
      return NextResponse.json(
        { error: 'Production item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
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
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;

    const db = await getDb();
    const { id } = await params;

    // Soft delete
    await db
      .update(production_items)
      .set({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .where(eq(production_items.id, id));

    return NextResponse.json({ message: 'Production item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting production item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete production item' },
      { status: 500 }
    );
  }
}
