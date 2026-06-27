import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { contact_messages } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

// GET - Fetch all messages (employee only)
export async function GET(request: Request) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const db = await getDb();
    const messages = status
      ? await db
          .select()
          .from(contact_messages)
          .where(eq(contact_messages.status, status))
          .orderBy(desc(contact_messages.created_at))
      : await db
          .select()
          .from(contact_messages)
          .orderBy(desc(contact_messages.created_at));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Submit a new message (public)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    await db.insert(contact_messages).values({
      id: crypto.randomUUID(),
      name,
      email,
      subject: subject || 'No subject',
      message,
      status: 'new',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      {
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
