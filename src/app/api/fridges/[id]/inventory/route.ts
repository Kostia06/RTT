import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { fridges, fridge_inventory, production_items } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const db = await getDb();
    const { id } = await params;

    // Get fridge details
    const [fridge] = await db
      .select()
      .from(fridges)
      .where(eq(fridges.id, id))
      .limit(1);

    if (!fridge) {
      return NextResponse.json({ error: 'Fridge not found' }, { status: 404 });
    }

    // Get inventory with production item details
    const rows = await db
      .select({
        inventory: fridge_inventory,
        production_item: production_items,
      })
      .from(fridge_inventory)
      .leftJoin(
        production_items,
        eq(fridge_inventory.production_item_id, production_items.id)
      )
      .where(eq(fridge_inventory.fridge_id, id))
      .orderBy(desc(fridge_inventory.batch_date));

    // Preserve the Supabase nested shape: each inventory row carries a `production_item`
    const inventory = rows.map((row) => ({
      ...row.inventory,
      production_item: row.production_item,
    }));

    // Calculate totals
    const total_cases = inventory.reduce((sum, item) => sum + item.cases, 0);
    const total_portions = inventory.reduce(
      (sum, item) => sum + item.loose_portions,
      0
    );

    // Calculate capacity used
    let capacity_used_cases: number | null = null;
    let capacity_used_portions: number | null = null;

    if (fridge.max_capacity_cases) {
      capacity_used_cases = (total_cases / fridge.max_capacity_cases) * 100;
    }

    if (fridge.max_capacity_portions) {
      const total_portions_including_cases = total_cases * 50 + total_portions;
      capacity_used_portions =
        (total_portions_including_cases / fridge.max_capacity_portions) * 100;
    }

    return NextResponse.json({
      fridge,
      inventory,
      total_cases,
      total_portions,
      capacity_used_cases,
      capacity_used_portions,
    });
  } catch (error: any) {
    console.error('Error fetching fridge inventory:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch fridge inventory' },
      { status: 500 }
    );
  }
}
