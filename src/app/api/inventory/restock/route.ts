import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { restock_orders } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';
import type { RestockOrderRow } from '@/lib/db/schema/inventory';

type RestockItem = { itemId: string; itemName: string; quantity: number; costPerUnit: number };

/** Map a snake_case D1 restock order row to the camelCase shape the UI consumes. */
function toOrderResponse(row: RestockOrderRow) {
  return {
    id: row.id,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    items: row.items ?? [],
    totalCost: row.total_cost,
    status: row.status,
    orderedBy: row.ordered_by ?? '',
    orderedAt: row.ordered_at,
    expectedDelivery: row.expected_delivery ?? null,
    receivedAt: row.received_at ?? null,
    notes: row.notes ?? '',
  };
}

export async function GET(request: Request) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const db = await getDb();
    const rows = await db
      .select()
      .from(restock_orders)
      .where(status ? eq(restock_orders.status, status) : undefined)
      .orderBy(desc(restock_orders.ordered_at));

    return NextResponse.json({ orders: rows.map(toOrderResponse) });
  } catch (error) {
    console.error('Error fetching restock orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireRole(request, 'manager');
    if (gate.error) return gate.error;
    const { user } = gate;

    const body = await request.json();
    const { supplierId, supplierName, items, expectedDelivery, notes } = body;

    if (!supplierId || !supplierName || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const totalCost = (items as RestockItem[]).reduce(
      (sum, item) => sum + item.quantity * item.costPerUnit,
      0
    );

    const db = await getDb();
    const now = new Date().toISOString();

    const [row] = await db
      .insert(restock_orders)
      .values({
        id: crypto.randomUUID(),
        supplier_id: supplierId,
        supplier_name: supplierName,
        items: items as RestockItem[],
        total_cost: Math.round(totalCost * 100) / 100,
        status: 'draft',
        ordered_by: user.name || user.id,
        ordered_at: now,
        expected_delivery: expectedDelivery || null,
        notes: notes || '',
        created_at: now,
        updated_at: now,
      })
      .returning();

    return NextResponse.json({
      success: true,
      order: toOrderResponse(row),
      message: 'Restock order created successfully',
    });
  } catch (error) {
    console.error('Error creating restock order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const gate = await requireRole(request, 'manager');
    if (gate.error) return gate.error;

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date().toISOString();

    const [row] = await db
      .update(restock_orders)
      .set({
        status,
        received_at: status === 'received' ? now : undefined,
        updated_at: now,
      })
      .where(eq(restock_orders.id, orderId))
      .returning();

    if (!row) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: toOrderResponse(row),
      message: 'Order updated successfully',
    });
  } catch (error) {
    console.error('Error updating restock order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
