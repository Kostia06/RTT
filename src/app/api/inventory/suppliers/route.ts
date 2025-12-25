import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database
let suppliers: any[] = [
  {
    id: '1',
    name: 'Kyoto Noodle Supply Co.',
    contactPerson: 'Takashi Yamamoto',
    email: 'takashi@kyotonoodles.jp',
    phone: '+81-75-123-4567',
    address: '123 Noodle Street, Kyoto, Japan',
    products: ['Fresh Noodles', 'Dried Noodles', 'Specialty Flour'],
    rating: 4.8,
    notes: 'Premium quality, consistent delivery',
  },
  {
    id: '2',
    name: 'Tokyo Broth Masters',
    contactPerson: 'Hiroshi Tanaka',
    email: 'hiroshi@tokyobroth.jp',
    phone: '+81-3-987-6543',
    address: '456 Ramen Avenue, Tokyo, Japan',
    products: ['Pork Bones', 'Chicken Bones', 'Kombu', 'Dried Shiitake'],
    rating: 4.9,
    notes: 'Best bone quality in the region',
  },
  {
    id: '3',
    name: 'Fresh Toppings Direct',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@freshtoppings.com',
    phone: '+1-555-234-5678',
    address: '789 Market Street, San Francisco, CA',
    products: ['Green Onions', 'Bean Sprouts', 'Nori', 'Menma'],
    rating: 4.5,
    notes: 'Local supplier, same-day delivery available',
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

    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
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
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, contactPerson, email, phone, address, products, notes } = body;

    if (!name || !contactPerson || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newSupplier = {
      id: uuidv4(),
      name,
      contactPerson,
      email,
      phone,
      address: address || '',
      products: products || [],
      rating: 0,
      notes: notes || '',
    };

    suppliers.push(newSupplier);

    return NextResponse.json({
      success: true,
      supplier: newSupplier,
      message: 'Supplier created successfully',
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
