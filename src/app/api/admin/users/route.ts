import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin or employee
    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'employee') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin or employee access required.' },
        { status: 403 }
      );
    }

    // Get service role client to access all users
    const serviceSupabase = await createClient();

    // Fetch all users from auth.users
    const { data: { users }, error: usersError } = await serviceSupabase.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Format user data
    const formattedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || 'N/A',
      role: u.user_metadata?.role || 'customer',
      created_at: u.created_at,
      banned: u.banned_until ? new Date(u.banned_until) > new Date() : false,
      banned_until: u.banned_until,
      last_sign_in_at: u.last_sign_in_at,
    }));

    return NextResponse.json({
      users: formattedUsers,
      total: formattedUsers.length,
    });
  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
