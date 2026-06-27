import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { newsletter_subscribers } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

// POST - Subscribe to the newsletter (public)
export async function POST(request: NextRequest) {
  try {
    const { email, source = 'website' } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if email already exists
    const [existing] = await db
      .select({ id: newsletter_subscribers.id, is_active: newsletter_subscribers.is_active })
      .from(newsletter_subscribers)
      .where(eq(newsletter_subscribers.email, email));

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 409 }
        );
      }

      // Reactivate subscription
      await db
        .update(newsletter_subscribers)
        .set({ is_active: true, updated_at: new Date().toISOString() })
        .where(eq(newsletter_subscribers.id, existing.id));

      return NextResponse.json({
        message: 'Subscription reactivated successfully',
        subscribed: true,
      });
    }

    // Create new subscription
    await db.insert(newsletter_subscribers).values({
      id: crypto.randomUUID(),
      email,
      source,
      is_active: true,
      subscribed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter',
      subscribed: true,
    });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

// GET - List active subscribers (employee only)
export async function GET(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const db = await getDb();
    const subscribers = await db
      .select()
      .from(newsletter_subscribers)
      .where(eq(newsletter_subscribers.is_active, true))
      .orderBy(desc(newsletter_subscribers.subscribed_at));

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('Fetch subscribers error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
