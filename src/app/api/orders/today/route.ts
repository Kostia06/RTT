import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { orders, order_items } from '@/lib/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function GET(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const db = await getDb();

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Fetch orders for today, newest first
    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.pickup_date, today))
      .orderBy(desc(orders.created_at));

    // Fetch all related items in one query
    const orderIds = orderRows.map((o) => o.id);
    const itemRows =
      orderIds.length > 0
        ? await db.select().from(order_items).where(inArray(order_items.order_id, orderIds))
        : [];

    const itemsByOrder = new Map<string, typeof itemRows>();
    for (const item of itemRows) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }

    // Transform the data to match the frontend format
    const transformedOrders = orderRows.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      total: order.total,
      status: order.status,
      items: (itemsByOrder.get(order.id) ?? []).map((item) => ({
        id: item.id,
        name: item.product_name,
        quantity: item.quantity,
        price: item.price,
      })),
      createdAt: order.created_at,
      pickupDate: order.pickup_date,
      pickupTime: order.pickup_time,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      deliveryType: order.delivery_type,
      deliveryAddress: order.delivery_address,
      deliveryCity: order.delivery_city,
      deliveryPostalCode: order.delivery_postal_code,
      deliveryInstructions: order.delivery_instructions,
    }));

    return NextResponse.json({ orders: transformedOrders });
  } catch (error) {
    console.error('Error in GET /api/orders/today:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
