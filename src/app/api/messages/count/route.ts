import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { contact_messages } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

// GET - Get count of new messages (employee only)
export async function GET(request: Request) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const db = await getDb();
    const [{ value }] = await db
      .select({ value: count() })
      .from(contact_messages)
      .where(eq(contact_messages.status, 'new'));

    return NextResponse.json({ count: value ?? 0 });
  } catch (error) {
    console.error('Error counting messages:', error);
    return NextResponse.json(
      { error: 'Failed to count messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
