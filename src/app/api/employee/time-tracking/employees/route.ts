import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/employee/time-tracking/employees
 * Returns list of active employees for QR code clock-in selection
 * Public endpoint (no auth required) - only returns id and name
 */
export async function GET(request: Request) {
  try {
    const supabase = createServiceClient();

    // Fetch all users with service role
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }

    // Filter to only employees and admins, return minimal data
    const employees = data.users
      .filter(user => {
        const role = user.user_metadata?.role;
        return role === 'employee' || role === 'admin';
      })
      .map(user => ({
        id: user.id,
        name: user.user_metadata?.name || user.email || 'Unknown Employee',
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical order

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Error processing employee list request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
