import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import {
  shifts,
  shift_production_assignments,
  production_items,
} from '@/lib/db/schema';
import { and, eq, gte, lte, inArray, asc } from 'drizzle-orm';
import { requireUser, requireRole, hasRole } from '@/lib/auth/guards';

type ProductionAssignment = typeof shift_production_assignments.$inferSelect & {
  production_item?: typeof production_items.$inferSelect;
};

export async function GET(request: Request) {
  try {
    const gate = await requireUser(request);
    if (gate.error) return gate.error;
    const { user } = gate;

    const { searchParams } = new URL(request.url);
    const requestedEmployeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeProduction = searchParams.get('includeProduction') === 'true';

    // Employees only see their own shifts; managers/admins may scope to anyone.
    const isPrivileged = hasRole(user.role, 'manager');
    const effectiveEmployeeId = isPrivileged
      ? requestedEmployeeId ?? null
      : user.id;

    const db = await getDb();

    const conditions = [];
    if (effectiveEmployeeId) {
      conditions.push(eq(shifts.employee_id, effectiveEmployeeId));
    }
    if (startDate) {
      conditions.push(gte(shifts.start_time, startDate));
    }
    if (endDate) {
      conditions.push(lte(shifts.end_time, endDate));
    }

    const shiftRows = await db
      .select()
      .from(shifts)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(shifts.start_time));

    // Optionally hydrate production assignments (+ their production item).
    const assignmentsByShift = new Map<string, ProductionAssignment[]>();
    if (includeProduction && shiftRows.length > 0) {
      const shiftIds = shiftRows.map((s) => s.id);
      const assignments = await db
        .select()
        .from(shift_production_assignments)
        .where(inArray(shift_production_assignments.shift_id, shiftIds));

      const itemIds = [
        ...new Set(assignments.map((a) => a.production_item_id)),
      ];
      const items = itemIds.length
        ? await db
            .select()
            .from(production_items)
            .where(inArray(production_items.id, itemIds))
        : [];
      const itemsById = new Map(items.map((item) => [item.id, item]));

      for (const assignment of assignments) {
        const list = assignmentsByShift.get(assignment.shift_id) ?? [];
        list.push({
          ...assignment,
          production_item: itemsById.get(assignment.production_item_id),
        });
        assignmentsByShift.set(assignment.shift_id, list);
      }
    }

    const transformedShifts = shiftRows.map((shift) => ({
      id: shift.id,
      employeeId: shift.employee_id,
      employeeName: shift.employee_name,
      startTime: shift.start_time,
      endTime: shift.end_time,
      position: shift.position,
      status: shift.status,
      notes: shift.notes,
      productionAssignments: includeProduction
        ? assignmentsByShift.get(shift.id) ?? []
        : undefined,
    }));

    return NextResponse.json({ shifts: transformedShifts });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const gate = await requireRole(request, 'manager');
    if (gate.error) return gate.error;

    const body = await request.json();
    const {
      employeeId,
      employeeName,
      startTime,
      endTime,
      position,
      notes,
      productionAssignments,
    } = body;

    if (!employeeId || !employeeName || !startTime || !endTime || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date().toISOString();

    const [shift] = await db
      .insert(shifts)
      .values({
        id: crypto.randomUUID(),
        employee_id: employeeId,
        employee_name: employeeName,
        start_time: startTime,
        end_time: endTime,
        position,
        status: 'scheduled',
        notes: notes || '',
        created_at: now,
      })
      .returning();

    if (Array.isArray(productionAssignments) && productionAssignments.length > 0) {
      try {
        const assignmentsToInsert = productionAssignments.map(
          (assignment: {
            productionItemId: string;
            binsRequired?: number;
            targetPortions?: number;
            notes?: string;
          }) => ({
            id: crypto.randomUUID(),
            shift_id: shift.id,
            production_item_id: assignment.productionItemId,
            bins_required: assignment.binsRequired ?? null,
            target_portions: assignment.targetPortions ?? null,
            notes: assignment.notes ?? null,
            status: 'pending',
            created_at: now,
          })
        );

        await db.insert(shift_production_assignments).values(assignmentsToInsert);
      } catch (assignmentsError) {
        // Don't fail the whole request, just log the error.
        console.error('Error creating production assignments:', assignmentsError);
      }
    }

    return NextResponse.json({
      success: true,
      shift: {
        id: shift.id,
        employeeId: shift.employee_id,
        employeeName: shift.employee_name,
        startTime: shift.start_time,
        endTime: shift.end_time,
        position: shift.position,
        status: shift.status,
        notes: shift.notes,
      },
      message: 'Shift created successfully',
    });
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const gate = await requireRole(request, 'manager');
    if (gate.error) return gate.error;

    const body = await request.json();
    const { shiftId, status } = body;

    const db = await getDb();

    const [shift] = await db
      .select()
      .from(shifts)
      .where(eq(shifts.id, shiftId))
      .limit(1);

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    const [updatedShift] = await db
      .update(shifts)
      .set({
        status: status || shift.status,
        updated_at: new Date().toISOString(),
      })
      .where(eq(shifts.id, shiftId))
      .returning();

    return NextResponse.json({
      success: true,
      shift: {
        id: updatedShift.id,
        employeeId: updatedShift.employee_id,
        employeeName: updatedShift.employee_name,
        startTime: updatedShift.start_time,
        endTime: updatedShift.end_time,
        position: updatedShift.position,
        status: updatedShift.status,
        notes: updatedShift.notes,
      },
      message: 'Shift updated successfully',
    });
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
