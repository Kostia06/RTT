import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database
let restockOrders: any[] = [
  {
    id: '1',
    supplierId: '1',
    supplierName: 'Kyoto Noodle Supply Co.',
    items: [
      { itemId: 'item1', itemName: 'Fresh Noodles', quantity: 200, costPerUnit: 1.5 },
      { itemId: 'item2', itemName: 'Dried Noodles', quantity: 100, costPerUnit: 2.0 },
    ],
    totalCost: 500,
    status: 'ordered',
    orderedBy: 'John Doe',
    orderedAt: new Date(Date.now() - 172800000).toISOString(),
    expectedDelivery: new Date(Date.now() + 86400000).toISOString(),
    notes: 'Regular weekly order',
  },
];

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let filtered = [...restockOrders];

    if (status) {
      filtered = filtered.filter(o => o.status === status);
    }

    // Sort by ordered date descending
    filtered.sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());

    return NextResponse.json({ orders: filtered });
  } catch (error) {
    console.error('Error fetching restock orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { supplierId, supplierName, items, expectedDelivery, notes } = body;

    if (!supplierId || !supplierName || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const totalCost = items.reduce((sum: number, item: any) => {
      return sum + item.quantity * item.costPerUnit;
    }, 0);

    const newOrder = {
      id: uuidv4(),
      supplierId,
      supplierName,
      items,
      totalCost: Math.round(totalCost * 100) / 100,
      status: 'draft',
      orderedBy: user.user_metadata?.name || user.email,
      orderedAt: new Date().toISOString(),
      expectedDelivery: expectedDelivery || null,
      notes: notes || '',
    };

    restockOrders.push(newOrder);

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: 'Restock order created successfully',
    });
  } catch (error) {
    console.error('Error creating restock order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, status } = body;

    const order = restockOrders.find(o => o.id === orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (status) {
      order.status = status;

      if (status === 'received') {
        order.receivedAt = new Date().toISOString();
      }
    }

    return NextResponse.json({
      success: true,
      order,
      message: 'Order updated successfully',
    });
  } catch (error) {
    console.error('Error updating restock order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
