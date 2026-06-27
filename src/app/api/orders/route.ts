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

    // Fetch orders, newest first
    const orderRows = await db.select().from(orders).orderBy(desc(orders.created_at));

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
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const body = await request.json();
    const {
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      total,
      status = 'pending',
      items,
      pickupDate,
      pickupTime,
      paymentMethod,
      paymentStatus,
      deliveryType = 'pickup',
      deliveryAddress,
      deliveryCity,
      deliveryPostalCode,
      deliveryInstructions,
    } = body;

    // Validate required fields based on delivery type
    if (!orderNumber || !customerName || !customerEmail || !total || !items || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate pickup-specific fields
    if (deliveryType === 'pickup' && (!pickupDate || !pickupTime)) {
      return NextResponse.json(
        { error: 'Pickup date and time are required for pickup orders' },
        { status: 400 }
      );
    }

    // Validate delivery-specific fields
    if (
      deliveryType === 'delivery' &&
      (!deliveryAddress || !deliveryCity || !deliveryPostalCode)
    ) {
      return NextResponse.json(
        {
          error:
            'Delivery address, city, and postal code are required for delivery orders',
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const now = new Date().toISOString();

    // Prepare order data
    const orderData = {
      id: crypto.randomUUID(),
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone ?? null,
      total,
      status,
      payment_method: paymentMethod,
      payment_status:
        paymentStatus || (paymentMethod === 'online' ? 'paid' : 'pending'),
      delivery_type: deliveryType,
      pickup_date: deliveryType === 'pickup' ? pickupDate : null,
      pickup_time: deliveryType === 'pickup' ? pickupTime : null,
      delivery_address: deliveryType === 'pickup' ? null : deliveryAddress ?? null,
      delivery_city: deliveryType === 'pickup' ? null : deliveryCity ?? null,
      delivery_postal_code:
        deliveryType === 'pickup' ? null : deliveryPostalCode ?? null,
      delivery_instructions:
        deliveryType === 'pickup' ? null : deliveryInstructions ?? null,
      created_at: now,
      updated_at: now,
    };

    // Insert order
    const [order] = await db.insert(orders).values(orderData).returning();

    // Insert order items
    const orderItems = (items as Array<{ name: string; quantity: number; price: number }>).map(
      (item) => ({
        id: crypto.randomUUID(),
        order_id: order.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        created_at: now,
      })
    );

    try {
      if (orderItems.length > 0) {
        await db.insert(order_items).values(orderItems);
      }
    } catch (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order creation (D1 has no cross-statement transaction here)
      await db.delete(orders).where(eq(orders.id, order.id));
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
