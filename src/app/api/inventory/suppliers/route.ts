import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { suppliers } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';
import type { SupplierRow } from '@/lib/db/schema/inventory';

/** Map a snake_case D1 supplier row to the camelCase shape the UI consumes. */
function toSupplierResponse(row: SupplierRow) {
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    address: row.address ?? '',
    products: row.products ?? [],
    rating: row.rating,
    notes: row.notes ?? '',
  };
}

export async function GET(request: Request) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const db = await getDb();
    const rows = await db.select().from(suppliers).orderBy(desc(suppliers.created_at));

    return NextResponse.json({ suppliers: rows.map(toSupplierResponse) });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireRole(request, 'manager');
    if (gate.error) return gate.error;

    const body = await request.json();
    const { name, contactPerson, email, phone, address, products, notes } = body;

    if (!name || !contactPerson || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date().toISOString();

    const [row] = await db
      .insert(suppliers)
      .values({
        id: crypto.randomUUID(),
        name,
        contact_person: contactPerson,
        email,
        phone,
        address: address || '',
        products: Array.isArray(products) ? products : [],
        rating: 0,
        notes: notes || '',
        created_at: now,
        updated_at: now,
      })
      .returning();

    return NextResponse.json({
      success: true,
      supplier: toSupplierResponse(row),
      message: 'Supplier created successfully',
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
