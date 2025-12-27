import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// PATCH - Update message status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['new', 'read', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: new, read, or archived' },
        { status: 400 }
      );
    }

    // Use service client to update message
    const serviceClient = await createServiceClient();
    const { data: updatedMessage, error } = await serviceClient
      .from('contact_messages')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a message
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can delete messages' }, { status: 403 });
    }

    const { id } = await params;

    // Use service client to delete message
    const serviceClient = await createServiceClient();
    const { error } = await serviceClient
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
