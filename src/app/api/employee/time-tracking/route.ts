import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { time_entries, user as userTable } from '@/lib/db/schema';
import { and, eq, gte, lte, isNull, desc } from 'drizzle-orm';
import { requireUser, hasRole } from '@/lib/auth/guards';

type TimeEntryRecord = typeof time_entries.$inferSelect;

function serializeEntry(entry: TimeEntryRecord) {
  return {
    id: entry.id,
    employeeId: entry.employee_id,
    employeeName: entry.employee_name,
    clockIn: entry.clock_in,
    clockOut: entry.clock_out,
    totalHours: entry.total_hours,
    date: entry.clock_in.split('T')[0],
    notes: entry.notes || '',
    isManual: entry.is_manual,
  };
}

export async function GET(request: Request) {
  try {
    const gate = await requireUser(request);
    if (gate.error) return gate.error;
    const { user } = gate;

    const { searchParams } = new URL(request.url);
    const requestedEmployeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Employees only see their own entries; managers/admins may scope to anyone.
    const isPrivileged = hasRole(user.role, 'manager');
    const effectiveEmployeeId = isPrivileged
      ? requestedEmployeeId ?? null
      : user.id;

    const db = await getDb();

    const conditions = [];
    if (effectiveEmployeeId) {
      conditions.push(eq(time_entries.employee_id, effectiveEmployeeId));
    }
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

    const transformedEntries = rows.map((entry) => ({
      id: entry.id,
      employeeId: entry.employee_id,
      employeeName: entry.employee_name,
      clockIn: entry.clock_in,
      clockOut: entry.clock_out,
      totalHours: entry.total_hours,
      date: entry.clock_in.split('T')[0],
      notes: entry.notes || '',
    }));

    return NextResponse.json({ entries: transformedEntries });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireUser(request);
    if (gate.error) return gate.error;
    const { user } = gate;

    const body = await request.json();
    const { action, entryId, notes, employeeId: providedEmployeeId } = body;

    const isPrivileged = hasRole(user.role, 'manager');

    // Acting employee is the session user. Managers/admins may act for others.
    let effectiveEmployeeId = user.id;
    let employeeName = user.name || user.email || 'Unknown';

    if (providedEmployeeId && providedEmployeeId !== user.id) {
      if (!isPrivileged) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const lookupDb = await getDb();
      const [target] = await lookupDb
        .select()
        .from(userTable)
        .where(eq(userTable.id, providedEmployeeId))
        .limit(1);
      if (!target) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
      effectiveEmployeeId = target.id;
      employeeName = target.name || target.email || 'Unknown';
    }

    const db = await getDb();

    if (action === 'clockIn') {
      const activeEntries = await db
        .select()
        .from(time_entries)
        .where(
          and(
            eq(time_entries.employee_id, effectiveEmployeeId),
            isNull(time_entries.clock_out)
          )
        );

      if (activeEntries.length > 0) {
        return NextResponse.json({ error: 'Already clocked in' }, { status: 400 });
      }

      const now = new Date().toISOString();
      const [newEntry] = await db
        .insert(time_entries)
        .values({
          id: crypto.randomUUID(),
          employee_id: effectiveEmployeeId,
          employee_name: employeeName,
          clock_in: now,
          notes: notes || '',
          is_manual: false,
          created_at: now,
        })
        .returning();

      return NextResponse.json({
        success: true,
        entry: {
          id: newEntry.id,
          employeeId: newEntry.employee_id,
          employeeName: newEntry.employee_name,
          clockIn: newEntry.clock_in,
          date: newEntry.clock_in.split('T')[0],
          notes: newEntry.notes || '',
        },
        message: 'Clocked in successfully',
      });
    }

    if (action === 'clockOut') {
      const { breakMinutes = 0, roundToNearest15 = false, manualClockOut } = body;

      const [entry] = await db
        .select()
        .from(time_entries)
        .where(eq(time_entries.id, entryId))
        .limit(1);

      if (!entry) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }

      // Only the owner or a manager/admin may clock out an entry.
      if (entry.employee_id !== user.id && !isPrivileged) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (entry.clock_out) {
        return NextResponse.json({ error: 'Already clocked out' }, { status: 400 });
      }

      const clockOutTime = manualClockOut ? new Date(manualClockOut) : new Date();
      const clockInTime = new Date(entry.clock_in);

      let totalMinutes = Math.floor(
        (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60)
      );
      totalMinutes -= breakMinutes;
      if (roundToNearest15) {
        totalMinutes = Math.round(totalMinutes / 15) * 15;
      }
      const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

      let updatedNotes = notes || entry.notes || '';
      if (breakMinutes > 0) {
        updatedNotes = updatedNotes
          ? `${updatedNotes} | Break: ${breakMinutes}min`
          : `Break: ${breakMinutes}min`;
      }

      const [updatedEntry] = await db
        .update(time_entries)
        .set({
          clock_out: clockOutTime.toISOString(),
          total_hours: totalHours,
          notes: updatedNotes,
          updated_at: new Date().toISOString(),
        })
        .where(eq(time_entries.id, entryId))
        .returning();

      return NextResponse.json({
        success: true,
        entry: {
          id: updatedEntry.id,
          employeeId: updatedEntry.employee_id,
          employeeName: updatedEntry.employee_name,
          clockIn: updatedEntry.clock_in,
          clockOut: updatedEntry.clock_out,
          totalHours: updatedEntry.total_hours,
          date: updatedEntry.clock_in.split('T')[0],
          notes: updatedEntry.notes || '',
        },
        message: `Clocked out successfully. Total: ${totalHours.toFixed(2)} hours${
          breakMinutes > 0 ? ` (${breakMinutes}min break deducted)` : ''
        }`,
      });
    }

    if (action === 'manualEntry') {
      const { clockIn, clockOut } = body;

      if (!clockIn || !clockOut) {
        return NextResponse.json(
          { error: 'Clock in and clock out times are required' },
          { status: 400 }
        );
      }

      const clockInTime = new Date(clockIn);
      const clockOutTime = new Date(clockOut);

      const totalMinutes = Math.floor(
        (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60)
      );
      const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

      if (totalHours < 0) {
        return NextResponse.json(
          { error: 'Clock out time must be after clock in time' },
          { status: 400 }
        );
      }

      const now = new Date().toISOString();
      const [newEntry] = await db
        .insert(time_entries)
        .values({
          id: crypto.randomUUID(),
          employee_id: effectiveEmployeeId,
          employee_name: employeeName,
          clock_in: clockInTime.toISOString(),
          clock_out: clockOutTime.toISOString(),
          total_hours: totalHours,
          notes: notes || '',
          is_manual: true,
          created_at: now,
        })
        .returning();

      return NextResponse.json({
        success: true,
        entry: serializeEntry(newEntry),
        message: 'Manual entry created successfully',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing time entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
