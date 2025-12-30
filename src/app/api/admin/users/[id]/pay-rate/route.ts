import { createClient, createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { payRate } = await request.json();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin or manager
    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin or manager access required.' },
        { status: 403 }
      );
    }

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (typeof payRate !== 'number' || payRate < 0) {
      return NextResponse.json(
        { error: 'Invalid pay rate. Must be a positive number.' },
        { status: 400 }
      );
    }

    // Use service role client to update user metadata
    const serviceSupabase = await createServiceClient();

    // Get the user first to preserve existing metadata
    const { data: targetUser, error: getUserError } = await serviceSupabase.auth.admin.getUserById(userId);

    if (getUserError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user metadata with new pay rate
    const { data, error: updateError } = await serviceSupabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...targetUser.user.user_metadata,
          payRate: payRate,
        },
      }
    );

    if (updateError) {
      console.error('Error updating pay rate:', updateError);
      return NextResponse.json(
        { error: 'Failed to update pay rate' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payRate: payRate,
    });
  } catch (error) {
    console.error('Error in pay rate API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
