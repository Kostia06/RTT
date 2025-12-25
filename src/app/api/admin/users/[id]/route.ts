import { createClient, createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role, ban, unban } = body;

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Prevent self-modification
    if (user.id === id) {
      return NextResponse.json(
        { error: 'Cannot modify your own account' },
        { status: 400 }
      );
    }

    const serviceSupabase = await createServiceClient();

    // Update role if provided
    if (role) {
      if (!['customer', 'employee', 'admin'].includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        );
      }

      // Get target user
      const { data: { user: targetUser }, error: getUserError } =
        await serviceSupabase.auth.admin.getUserById(id);

      if (getUserError || !targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Update user metadata
      const { error: updateError } = await serviceSupabase.auth.admin.updateUserById(
        id,
        {
          user_metadata: {
            ...targetUser.user_metadata,
            role: role,
          },
        }
      );

      if (updateError) {
        console.error('Error updating user role:', updateError);
        return NextResponse.json(
          { error: 'Failed to update role' },
          { status: 500 }
        );
      }
    }

    // Ban user if requested
    if (ban) {
      const banDuration = ban.duration || 'permanent'; // 'hour', 'day', 'week', 'permanent'
      let banUntil: string | undefined;

      if (banDuration !== 'permanent') {
        const now = new Date();
        switch (banDuration) {
          case 'hour':
            now.setHours(now.getHours() + 1);
            break;
          case 'day':
            now.setDate(now.getDate() + 1);
            break;
          case 'week':
            now.setDate(now.getDate() + 7);
            break;
        }
        banUntil = now.toISOString();
      } else {
        // Set to 100 years from now for "permanent"
        const farFuture = new Date();
        farFuture.setFullYear(farFuture.getFullYear() + 100);
        banUntil = farFuture.toISOString();
      }

      const { error: banError } = await serviceSupabase.auth.admin.updateUserById(
        id,
        {
          ban_duration: banUntil,
        }
      );

      if (banError) {
        console.error('Error banning user:', banError);
        return NextResponse.json(
          { error: 'Failed to ban user' },
          { status: 500 }
        );
      }
    }

    // Unban user if requested
    if (unban) {
      const { error: unbanError } = await serviceSupabase.auth.admin.updateUserById(
        id,
        {
          ban_duration: 'none',
        }
      );

      if (unbanError) {
        console.error('Error unbanning user:', unbanError);
        return NextResponse.json(
          { error: 'Failed to unban user' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error in admin user update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
