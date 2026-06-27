import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { user } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

/**
 * GET /api/employee/time-tracking/employees
 * Returns the list of staff (employee/manager/admin) for selection.
 * Manager+ only.
 */
export async function GET(request: Request) {
  try {
    const gate = await requireRole(request, 'manager');
    if (gate.error) return gate.error;

    const db = await getDb();
    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
      .from(user)
      .where(inArray(user.role, ['employee', 'manager', 'admin']));

    const employees = rows
      .map((u) => ({
        id: u.id,
        name: u.name || u.email || 'Unknown Employee',
        email: u.email,
        role: u.role,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Error processing employee list request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
