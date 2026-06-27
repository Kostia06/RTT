import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { production_items } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function GET(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const items = activeOnly
      ? await db
          .select()
          .from(production_items)
          .where(eq(production_items.active, true))
          .orderBy(asc(production_items.name))
      : await db.select().from(production_items).orderBy(asc(production_items.name));

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Error fetching production items:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch production items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;

    const db = await getDb();
    const body = await request.json();

    const now = new Date().toISOString();
    const [item] = await db
      .insert(production_items)
      .values({
        id: crypto.randomUUID(),
        name: body.name,
        sku: body.sku ?? null,
        category: body.category ?? null,
        case_size: body.case_size ?? 50,
        low_stock_threshold: body.low_stock_threshold ?? 20,
        active: body.active !== false,
        created_at: now,
        updated_at: now,
      })
      .returning();

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating production item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create production item' },
      { status: 500 }
    );
  }
}
