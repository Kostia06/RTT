import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { time_entries } from '@/lib/db/schema';
import { and, gte, lte, desc } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function GET(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'manager');
    if (gate.error) return gate.error;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDb();

    const conditions = [];
    if (startDate) {
      conditions.push(gte(time_entries.clock_in, startDate));
    }
    if (endDate) {
      conditions.push(lte(time_entries.clock_in, endDate));
    }

    const rows = await db
      .select()
      .from(time_entries)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(time_entries.clock_in));

    const entries = rows.map((entry) => ({
      id: entry.id,
      employeeId: entry.employee_id,
      employeeName: entry.employee_name,
      clockIn: entry.clock_in,
      clockOut: entry.clock_out,
      totalHours: entry.total_hours,
      date: entry.clock_in.split('T')[0],
      notes: entry.notes || '',
      isManual: entry.is_manual,
    }));

    return NextResponse.json({ entries, total: entries.length });
  } catch (error) {
    console.error('Error in time tracking all API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
