import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database
let shifts: any[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 86400000 + 28800000).toISOString(),
    position: 'Kitchen Staff',
    status: 'scheduled',
    notes: 'Morning shift',
  },
  {
    id: '2',
    employeeId: 'emp2',
    employeeName: 'Jane Smith',
    startTime: new Date(Date.now() + 172800000).toISOString(),
    endTime: new Date(Date.now() + 172800000 + 28800000).toISOString(),
    position: 'Class Instructor',
    status: 'confirmed',
    notes: 'Teaching Ramen 101',
  },
];

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

    let filtered = [...shifts];

    // Non-admin users only see their own shifts
    if (role !== 'admin') {
      filtered = filtered.filter(s => s.employeeId === user.id);
    } else if (employeeId) {
      filtered = filtered.filter(s => s.employeeId === employeeId);
    }

    if (startDate) {
      filtered = filtered.filter(s => s.startTime >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(s => s.endTime <= endDate);
    }

    // Sort by start time
    filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return NextResponse.json({ shifts: filtered });
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
    const { employeeId, employeeName, startTime, endTime, position, notes } = body;

    if (!employeeId || !employeeName || !startTime || !endTime || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newShift = {
      id: uuidv4(),
      employeeId,
      employeeName,
      startTime,
      endTime,
      position,
      status: 'scheduled',
      notes: notes || '',
    };

    shifts.push(newShift);

    return NextResponse.json({
      success: true,
      shift: newShift,
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

    const shift = shifts.find(s => s.id === shiftId);

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    // Employees can only confirm their own shifts
    if (role !== 'admin' && shift.employeeId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (status) {
      shift.status = status;
    }

    return NextResponse.json({
      success: true,
      shift,
      message: 'Shift updated successfully',
    });
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
