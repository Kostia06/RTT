import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { orders } from '@/lib/db/schema';
import { sendOrderConfirmation } from '@/lib/email/emailService';

interface OrderItem {
  productName?: string;
  name?: string;
  variantName?: string;
  quantity: number;
  price: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      tax,
      total,
      deliveryMethod,
      deliveryTimeSlot,
      deliveryAddress,
      deliveryType,
      pickupDate,
      pickupTime,
      paymentId,
      paymentMethod = 'card',
      notes,
    } = body;

    // Validate required fields
    if (!customerEmail || !items || !subtotal || !tax || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique order number
    const orderNumber = `RTT-${new Date().getFullYear()}${String(
      new Date().getMonth() + 1
    ).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(
      Math.random() * 10000
    )
      .toString()
      .padStart(4, '0')}`;

    const db = await getDb();
    const now = new Date().toISOString();

    // Create order in database
    const [order] = await db
      .insert(orders)
      .values({
        id: crypto.randomUUID(),
        order_number: orderNumber,
        customer_name: customerName ?? null,
        customer_email: customerEmail,
        customer_phone: customerPhone ?? null,
        items: typeof items === 'string' ? JSON.parse(items) : items,
        subtotal,
        tax,
        total,
        delivery_method: deliveryMethod || 'shipping',
        delivery_type: deliveryType ?? null,
        delivery_time_slot: deliveryTimeSlot ?? null,
        delivery_address: deliveryAddress ? JSON.stringify(deliveryAddress) : null,
        pickup_date: pickupDate ?? null,
        pickup_time: pickupTime ?? null,
        payment_id: paymentId ?? null,
        payment_method: paymentMethod,
        payment_status: paymentId ? 'completed' : 'pending',
        status: 'pending',
        notes: notes ?? null,
        created_at: now,
        updated_at: now,
      })
      .returning();

    // Send order confirmation email
    try {
      const parsedItems: OrderItem[] = typeof items === 'string' ? JSON.parse(items) : items;
      const parsedAddress =
        deliveryAddress && typeof deliveryAddress === 'string'
          ? JSON.parse(deliveryAddress)
          : deliveryAddress;

      await sendOrderConfirmation({
        orderNumber: order.order_number,
        customerName: customerName || 'Customer',
        customerEmail,
        items: parsedItems.map((item) => ({
          productName: item.productName || item.name || '',
          variantName: item.variantName,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        tax,
        shippingCost: deliveryMethod === 'delivery' ? 5.0 : 0, // Default shipping cost
        total,
        shippingAddress: parsedAddress || {
          firstName: customerName?.split(' ')[0] || '',
          lastName: customerName?.split(' ').slice(1).join(' ') || '',
          addressLine1: '',
          city: '',
          state: '',
          zipCode: '',
        },
        fulfillmentType: deliveryMethod === 'pickup' ? 'pickup' : 'delivery',
        scheduledDate: deliveryTimeSlot,
      });
    } catch (emailError) {
      // Log email error but don't fail the order creation
      console.error('Failed to send order confirmation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        total: order.total,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
