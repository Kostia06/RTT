import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { fridge_temperature_logs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function POST(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;
    const { user } = gate;

    const db = await getDb();
    const body = await request.json();

    const { fridge_id, temperature, notes, shift_id } = body;

    if (!fridge_id || temperature === undefined || temperature === null) {
      return NextResponse.json(
        { error: 'Missing required fields: fridge_id and temperature' },
        { status: 400 }
      );
    }

    // Log the temperature
    const [log] = await db
      .insert(fridge_temperature_logs)
      .values({
        id: crypto.randomUUID(),
        fridge_id,
        employee_id: user.id,
        shift_id: shift_id || null,
        temperature,
        notes: notes || null,
        logged_at: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      log,
      message: 'Temperature logged successfully',
    });
  } catch (error: any) {
    console.error('Error logging temperature:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log temperature' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const fridgeId = searchParams.get('fridge_id');
    const limit = searchParams.get('limit') || '50';

    const rows = fridgeId
      ? await db
          .select()
          .from(fridge_temperature_logs)
          .where(eq(fridge_temperature_logs.fridge_id, fridgeId))
          .orderBy(desc(fridge_temperature_logs.logged_at))
          .limit(parseInt(limit))
      : await db
          .select()
          .from(fridge_temperature_logs)
          .orderBy(desc(fridge_temperature_logs.logged_at))
          .limit(parseInt(limit));

    return NextResponse.json({ logs: rows });
  } catch (error: any) {
    console.error('Error fetching temperature logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch temperature logs' },
      { status: 500 }
    );
  }
}
