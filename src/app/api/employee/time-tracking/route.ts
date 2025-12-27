import { createClient, createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Check if there's an authenticated user
    const authSupabase = await createClient();
    const { data: { user }, error: userError } = await authSupabase.auth.getUser();

    let supabase;
    let effectiveEmployeeId: string | null = null;

    if (user) {
      // Manual flow - user is logged in
      console.log('GET: Authenticated user flow:', user.id);
      const role = user.user_metadata?.role;
      if (role !== 'admin' && role !== 'employee') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Use regular client for authenticated users
      supabase = authSupabase;

      // Filter by employee (non-admin users only see their own entries)
      if (role !== 'admin') {
        effectiveEmployeeId = user.id;
      } else if (employeeId) {
        effectiveEmployeeId = employeeId;
      }
    } else if (employeeId) {
      // QR code flow - no authenticated user, but employeeId provided
      // Use service role client to bypass RLS
      console.log('GET: QR code flow, using service role client for employee:', employeeId);
      supabase = createServiceClient();
      effectiveEmployeeId = employeeId;
    } else {
      // No user and no employeeId - not authorized
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Build query
    let query = supabase
      .from('time_entries')
      .select('*')
      .order('clock_in', { ascending: false });

    // Filter by employee if specified
    if (effectiveEmployeeId) {
      query = query.eq('employee_id', effectiveEmployeeId);
    }

    // Filter by date range
    if (startDate) {
      query = query.gte('clock_in', startDate);
    }
    if (endDate) {
      query = query.lte('clock_in', endDate);
    }

    const { data: entries, error } = await query;

    if (error) {
      console.error('Error fetching time entries:', error);
      return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
    }

    // Transform database fields to match frontend expectations
    const transformedEntries = entries.map(entry => ({
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
    const body = await request.json();
    const { action, entryId, notes, employeeId: providedEmployeeId } = body;
    console.log('POST /api/employee/time-tracking - Body:', { action, entryId, providedEmployeeId });

    // For QR code flow, employeeId can be provided
    // For manual flow, use authenticated user
    let effectiveEmployeeId: string;
    let employeeName: string;
    let useServiceRole = false;

    if (providedEmployeeId) {
      // QR code flow - validate employee exists using service role client
      const serviceSupabase = createServiceClient();
      const { data: employeeData, error: employeeError } = await serviceSupabase.auth.admin.getUserById(providedEmployeeId);

      if (employeeError || !employeeData?.user) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }

      effectiveEmployeeId = providedEmployeeId;
      employeeName = employeeData.user.user_metadata?.name || employeeData.user.email || 'Unknown';
      useServiceRole = true; // Use service role to bypass RLS for QR flow
    } else {
      // Manual flow - require authentication
      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }

      const role = user.user_metadata?.role;
      if (role !== 'admin' && role !== 'employee') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      effectiveEmployeeId = user.id;
      employeeName = user.user_metadata?.name || user.email || 'Unknown';
      useServiceRole = false;
    }

    // Use appropriate client based on flow
    const supabase = useServiceRole ? createServiceClient() : await createClient();

    if (action === 'clockIn') {
      // Check if already clocked in
      console.log('Checking for active entries for employee:', effectiveEmployeeId);
      const { data: activeEntries, error: checkError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', effectiveEmployeeId)
        .is('clock_out', null);

      console.log('Active entries check result:', { activeEntries, checkError });

      if (checkError) {
        console.error('Error checking active entries:', checkError);
        return NextResponse.json({ error: 'Failed to check clock-in status' }, { status: 500 });
      }

      if (activeEntries && activeEntries.length > 0) {
        console.log('Employee already has active entry:', activeEntries[0]);
        return NextResponse.json(
          { error: 'Already clocked in' },
          { status: 400 }
        );
      }

      // Create new time entry
      console.log('Creating new entry for:', { effectiveEmployeeId, employeeName, useServiceRole });
      const { data: newEntry, error: insertError } = await supabase
        .from('time_entries')
        .insert({
          employee_id: effectiveEmployeeId,
          employee_name: employeeName,
          clock_in: new Date().toISOString(),
          notes: notes || '',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting time entry:', insertError);
        return NextResponse.json({ error: 'Failed to clock in' }, { status: 500 });
      }

      console.log('Successfully created entry:', newEntry.id);

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
      const { breakMinutes = 0, roundToNearest15 = false, manualClockOut, calculatedMinutes } = body;

      // Fetch the entry
      const { data: entry, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', entryId)
        .single();

      if (fetchError || !entry) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }

      // Verify ownership
      // For QR flow: Only allow clocking out own entry
      // For manual flow: Allow if it's your entry or you're an admin
      if (!useServiceRole) {
        // Manual flow - check if user is admin
        const authSupabase = await createClient();
        const { data: { user } } = await authSupabase.auth.getUser();
        const role = user?.user_metadata?.role;

        if (entry.employee_id !== effectiveEmployeeId && role !== 'admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
      } else {
        // QR flow - only allow clocking out own entry
        if (entry.employee_id !== effectiveEmployeeId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
      }

      if (entry.clock_out) {
        return NextResponse.json(
          { error: 'Already clocked out' },
          { status: 400 }
        );
      }

      // Calculate total hours
      const clockOutTime = manualClockOut ? new Date(manualClockOut) : new Date();
      const clockInTime = new Date(entry.clock_in);

      // Calculate total minutes worked
      let totalMinutes = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60));

      // Subtract break time
      totalMinutes -= breakMinutes;

      // Round to nearest 15 if enabled
      if (roundToNearest15) {
        totalMinutes = Math.round(totalMinutes / 15) * 15;
      }

      // Convert to hours (with 2 decimal places)
      const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

      console.log('Clock out calculation:', {
        clockInTime: clockInTime.toISOString(),
        clockOutTime: clockOutTime.toISOString(),
        breakMinutes,
        roundToNearest15,
        totalMinutes,
        totalHours
      });

      // Update entry with break time info in notes if applicable
      let updatedNotes = notes || entry.notes || '';
      if (breakMinutes > 0) {
        updatedNotes = updatedNotes
          ? `${updatedNotes} | Break: ${breakMinutes}min`
          : `Break: ${breakMinutes}min`;
      }

      // Update entry
      const { data: updatedEntry, error: updateError } = await supabase
        .from('time_entries')
        .update({
          clock_out: clockOutTime.toISOString(),
          total_hours: totalHours,
          notes: updatedNotes,
        })
        .eq('id', entryId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating time entry:', updateError);
        return NextResponse.json({ error: 'Failed to clock out' }, { status: 500 });
      }

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
        message: `Clocked out successfully. Total: ${totalHours.toFixed(2)} hours${breakMinutes > 0 ? ` (${breakMinutes}min break deducted)` : ''}`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing time entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
