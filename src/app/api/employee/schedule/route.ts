import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeProduction = searchParams.get('includeProduction') === 'true';

    let query = supabase
      .from('shifts')
      .select(includeProduction
        ? `
          *,
          production_assignments:shift_production_assignments(
            *,
            production_item:production_items(*)
          )
        `
        : '*'
      )
      .order('start_time', { ascending: true });

    // Non-admin users only see their own shifts
    if (role !== 'admin') {
      query = query.eq('employee_id', user.id);
    } else if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (startDate) {
      query = query.gte('start_time', startDate);
    }

    if (endDate) {
      query = query.lte('end_time', endDate);
    }

    const { data: shifts, error } = await query;

    if (error) throw error;

    // Transform to match the frontend format
    const transformedShifts = (shifts as any[])?.map((shift: any) => ({
      id: shift.id,
      employeeId: shift.employee_id,
      employeeName: shift.employee_name,
      startTime: shift.start_time,
      endTime: shift.end_time,
      position: shift.position,
      status: shift.status,
      notes: shift.notes,
      productionAssignments: shift.production_assignments || undefined,
    })) || [];

    return NextResponse.json({ shifts: transformedShifts });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const role = user.user_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { employeeId, employeeName, startTime, endTime, position, notes, productionAssignments } = body;

    if (!employeeId || !employeeName || !startTime || !endTime || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the shift
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .insert([{
        employee_id: employeeId,
        employee_name: employeeName,
        start_time: startTime,
        end_time: endTime,
        position,
        status: 'scheduled',
        notes: notes || '',
      }])
      .select()
      .single();

    if (shiftError) throw shiftError;

    // Create production assignments if provided
    if (productionAssignments && productionAssignments.length > 0) {
      const assignmentsToInsert = productionAssignments.map((assignment: any) => ({
        shift_id: shift.id,
        production_item_id: assignment.productionItemId,
        bins_required: assignment.binsRequired,
        target_portions: assignment.targetPortions,
        notes: assignment.notes || null,
        status: 'pending',
      }));

      const { error: assignmentsError } = await supabase
        .from('shift_production_assignments')
        .insert(assignmentsToInsert);

      if (assignmentsError) {
        console.error('Error creating production assignments:', assignmentsError);
        // Don't fail the whole request, just log the error
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
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { shiftId, status } = body;

    // Get the shift first to check permissions
    const { data: shift, error: fetchError } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', shiftId)
      .single();

    if (fetchError || !shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    // Employees can only confirm their own shifts
    if (role !== 'admin' && shift.employee_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the shift
    const { data: updatedShift, error: updateError } = await supabase
      .from('shifts')
      .update({
        status: status || shift.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shiftId)
      .select()
      .single();

    if (updateError) throw updateError;

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
