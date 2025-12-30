import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const role = user.user_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    console.log('GET: Fetching all time entries for admin');

    // Mock data for now - will be replaced with actual Supabase query
    // This would query the time_entries table with date filters
    const mockEntries = [
      {
        id: '1',
        employeeId: user.id,
        employeeName: user.user_metadata?.name || 'Test User',
        clockIn: new Date().toISOString(),
        clockOut: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        totalHours: 8,
        date: new Date().toISOString().split('T')[0],
        notes: 'Sample entry',
        isManual: false,
      },
    ];

    return NextResponse.json({
      entries: mockEntries,
      total: mockEntries.length,
    });
  } catch (error) {
    console.error('Error in time tracking all API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
