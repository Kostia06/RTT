import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is employee, manager, or admin
    const role = user.user_metadata?.role;
    if (!['employee', 'manager', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use service client to bypass RLS (auth already checked above)
    const serviceSupabase = createServiceClient();

    // Fetch orders with their items
    const { data: orders, error } = await serviceSupabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Transform the data to match the frontend format
    const transformedOrders = orders?.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      total: parseFloat(order.total),
      status: order.status,
      items: order.order_items.map((item: any) => ({
        id: item.id,
        name: item.product_name,
        quantity: item.quantity,
        price: parseFloat(item.price),
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
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      return NextResponse.json({ error: 'Pickup date and time are required for pickup orders' }, { status: 400 });
    }

    // Validate delivery-specific fields
    if (deliveryType === 'delivery' && (!deliveryAddress || !deliveryCity || !deliveryPostalCode)) {
      return NextResponse.json({ error: 'Delivery address, city, and postal code are required for delivery orders' }, { status: 400 });
    }

    // Use service client to bypass RLS (auth already checked above)
    const serviceSupabase = createServiceClient();

    // Prepare order data
    const orderData: any = {
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      total,
      status,
      payment_method: paymentMethod,
      payment_status: paymentStatus || (paymentMethod === 'online' ? 'paid' : 'pending'),
      delivery_type: deliveryType,
    };

    // Add pickup or delivery specific fields
    if (deliveryType === 'pickup') {
      orderData.pickup_date = pickupDate;
      orderData.pickup_time = pickupTime;
    } else {
      orderData.delivery_address = deliveryAddress;
      orderData.delivery_city = deliveryCity;
      orderData.delivery_postal_code = deliveryPostalCode;
      orderData.delivery_instructions = deliveryInstructions;
    }

    // Insert order
    const { data: order, error: orderError } = await serviceSupabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await serviceSupabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order creation
      await serviceSupabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
