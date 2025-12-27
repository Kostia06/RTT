import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET - Get count of new messages (employee only)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is employee or admin
    const isEmployee = user.user_metadata?.role === 'employee' || user.user_metadata?.role === 'admin';
    if (!isEmployee) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use service client to count new messages
    const serviceClient = await createServiceClient();
    const { count, error } = await serviceClient
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    if (error) {
      console.error('Supabase error counting messages:', error);
      return NextResponse.json(
        {
          error: 'Failed to count messages',
          details: error.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('Error counting messages:', error);
    return NextResponse.json(
      { error: 'Failed to count messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
