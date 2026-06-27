import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { production_logs, production_items } from '@/lib/db/schema';
import { eq, and, desc, gte, lte, type SQL } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function GET(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const db = await getDb();
    const { searchParams } = new URL(request.url);

    const employeeId = searchParams.get('employee_id');
    const productionItemId = searchParams.get('production_item_id');
    const shiftId = searchParams.get('shift_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');

    const filters: SQL[] = [];
    if (employeeId) filters.push(eq(production_logs.employee_id, employeeId));
    if (productionItemId)
      filters.push(eq(production_logs.production_item_id, productionItemId));
    if (shiftId) filters.push(eq(production_logs.shift_id, shiftId));
    if (startDate) filters.push(gte(production_logs.logged_at, startDate));
    if (endDate) filters.push(lte(production_logs.logged_at, endDate));

    const rows = await db
      .select({ log: production_logs, production_item: production_items })
      .from(production_logs)
      .leftJoin(
        production_items,
        eq(production_logs.production_item_id, production_items.id)
      )
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(production_logs.logged_at))
      .limit(limit);

    const logs = rows.map((row) => ({
      ...row.log,
      total_portions:
        (row.log.cases_made ?? 0) * (row.production_item?.case_size ?? 0) +
        (row.log.loose_portions ?? 0),
      production_item: row.production_item,
    }));

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Error fetching production logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch production logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;
    const { user } = gate;

    const db = await getDb();
    const body = await request.json();

    const { shift_id, production_item_id, cases_made, loose_portions, notes } = body;

    if (!shift_id || !production_item_id) {
      return NextResponse.json(
        { error: 'Missing required fields: shift_id and production_item_id' },
        { status: 400 }
      );
    }

    const [log] = await db
      .insert(production_logs)
      .values({
        id: crypto.randomUUID(),
        shift_id,
        employee_id: user.id,
        production_item_id,
        cases_made: cases_made || 0,
        loose_portions: loose_portions || 0,
        notes: notes || null,
        logged_at: new Date().toISOString(),
      })
      .returning();

    const [production_item] = await db
      .select()
      .from(production_items)
      .where(eq(production_items.id, production_item_id));

    return NextResponse.json(
      {
        success: true,
        log: { ...log, production_item: production_item ?? null },
        message: 'Production log created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating production log:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create production log' },
      { status: 500 }
    );
  }
}
