import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database - in production, use Supabase database
let timeEntries: any[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    clockIn: new Date(Date.now() - 7200000).toISOString(),
    clockOut: new Date(Date.now() - 3600000).toISOString(),
    totalHours: 1,
    date: new Date().toISOString().split('T')[0],
    notes: '',
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

    let filtered = [...timeEntries];

    if (employeeId) {
      filtered = filtered.filter(e => e.employeeId === employeeId);
    }

    if (startDate) {
      filtered = filtered.filter(e => e.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(e => e.date <= endDate);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime());

    return NextResponse.json({ entries: filtered });
  } catch (error) {
    console.error('Error fetching time entries:', error);
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
    if (role !== 'admin' && role !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action, entryId, notes } = body;

    if (action === 'clockIn') {
      // Check if already clocked in
      const activeEntry = timeEntries.find(
        e => e.employeeId === user.id && !e.clockOut
      );

      if (activeEntry) {
        return NextResponse.json(
          { error: 'Already clocked in' },
          { status: 400 }
        );
      }

      const newEntry = {
        id: uuidv4(),
        employeeId: user.id,
        employeeName: user.user_metadata?.name || user.email,
        clockIn: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        notes: notes || '',
      };

      timeEntries.push(newEntry);

      return NextResponse.json({
        success: true,
        entry: newEntry,
        message: 'Clocked in successfully',
      });
    }

    if (action === 'clockOut') {
      const entry = timeEntries.find(e => e.id === entryId);

      if (!entry) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }

      if (entry.employeeId !== user.id && role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (entry.clockOut) {
        return NextResponse.json(
          { error: 'Already clocked out' },
          { status: 400 }
        );
      }

      const clockOutTime = new Date();
      const clockInTime = new Date(entry.clockIn);
      const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      entry.clockOut = clockOutTime.toISOString();
      entry.totalHours = Math.round(totalHours * 100) / 100;

      if (notes) {
        entry.notes = notes;
      }

      return NextResponse.json({
        success: true,
        entry,
        message: 'Clocked out successfully',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing time entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
