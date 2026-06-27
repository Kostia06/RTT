import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { contact_messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

// GET - Fetch a single message (employee only)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const { id } = await params;
    const db = await getDb();
    const [message] = await db
      .select()
      .from(contact_messages)
      .where(eq(contact_messages.id, id));

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH - Update message status (employee only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['new', 'read', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: new, read, or archived' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const [updatedMessage] = await db
      .update(contact_messages)
      .set({ status, updated_at: new Date().toISOString() })
      .where(eq(contact_messages.id, id))
      .returning();

    if (!updatedMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
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

// DELETE - Delete a message (employee only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const { id } = await params;
    const db = await getDb();
    await db.delete(contact_messages).where(eq(contact_messages.id, id));

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
