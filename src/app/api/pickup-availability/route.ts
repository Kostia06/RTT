import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { shifts } from '@/lib/db/schema';
import { and, gte, ne, asc } from 'drizzle-orm';

// Public, unauthenticated: upcoming staff shift windows so a customer can see when
// pickup is possible. Exposes only the time windows — no employee names/positions.
export async function GET() {
  try {
    const db = await getDb();
    const now = new Date().toISOString();
    const rows = await db
      .select({ startTime: shifts.start_time, endTime: shifts.end_time })
      .from(shifts)
      .where(and(gte(shifts.start_time, now), ne(shifts.status, 'cancelled')))
      .orderBy(asc(shifts.start_time));

    return NextResponse.json({ shifts: rows });
  } catch (error) {
    console.error('Error in GET /api/pickup-availability:', error);
    // Degrade gracefully — the checkout simply shows no available dates.
    return NextResponse.json({ shifts: [] }, { status: 200 });
  }
}
