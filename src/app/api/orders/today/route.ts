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

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Use service client to bypass RLS (auth already checked above)
    const serviceSupabase = createServiceClient();

    // Fetch orders for today
    const { data: orders, error } = await serviceSupabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('pickup_date', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching today orders:', error);
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

    return NextResponse.json({ orders: transformedOrders || [] });
  } catch (error) {
    console.error('Error in GET /api/orders/today:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
