import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { orders, order_items } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const { id } = await params;
    const db = await getDb();

    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const items = await db.select().from(order_items).where(eq(order_items.order_id, id));

    return NextResponse.json({ order: { ...order, order_items: items } });
  } catch (error) {
    console.error('Error in GET /api/orders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateOrder(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  const gate = await requireRole(request, 'employee');
  if (gate.error) return gate.error;

  const { id } = await params;
  const body = await request.json();
  const { status, paymentStatus } = body;

  const updateData: Partial<typeof orders.$inferInsert> = {};
  if (status) updateData.status = status;
  if (paymentStatus) updateData.payment_status = paymentStatus;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  updateData.updated_at = new Date().toISOString();

  const db = await getDb();
  const [order] = await db
    .update(orders)
    .set(updateData)
    .where(eq(orders.id, id))
    .returning();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, order });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    return await updateOrder(request, params);
  } catch (error) {
    console.error('Error in PATCH /api/orders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    return await updateOrder(request, params);
  } catch (error) {
    console.error('Error in PUT /api/orders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;

    const { id } = await params;
    const db = await getDb();

    const [existing] = await db.select().from(orders).where(eq(orders.id, id));
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Remove child items first, then the order
    await db.delete(order_items).where(eq(order_items.order_id, id));
    await db.delete(orders).where(eq(orders.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/orders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
