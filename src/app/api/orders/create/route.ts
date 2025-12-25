import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
    const supabase = await createClient();
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
      paymentId,
      paymentMethod = 'card',
      notes,
    } = body;

    // Validate required fields
    if (!customerEmail || !items || !subtotal || !tax || !total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderNumber = `RTT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Create order in database
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        items: JSON.stringify(items),
        subtotal,
        tax,
        total,
        delivery_method: deliveryMethod || 'shipping',
        delivery_time_slot: deliveryTimeSlot,
        delivery_address: deliveryAddress ? JSON.stringify(deliveryAddress) : null,
        payment_id: paymentId,
        payment_method: paymentMethod,
        payment_status: paymentId ? 'completed' : 'pending',
        status: 'pending',
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Send order confirmation email
    try {
      const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
      const parsedAddress = deliveryAddress && typeof deliveryAddress === 'string'
        ? JSON.parse(deliveryAddress)
        : deliveryAddress;

      await sendOrderConfirmation({
        orderNumber: order.order_number,
        customerName: customerName || 'Customer',
        customerEmail,
        items: parsedItems.map((item: OrderItem) => ({
          productName: item.productName || item.name,
          variantName: item.variantName,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        tax,
        shippingCost: deliveryMethod === 'delivery' ? 5.00 : 0, // Default shipping cost
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
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
