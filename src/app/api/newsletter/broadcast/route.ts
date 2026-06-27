import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { newsletter_subscribers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';
import { sendEmail } from '@/lib/email/emailService';

// POST - Broadcast a newsletter email to all active subscribers (admin only)
export async function POST(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;

    const { subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Fetch all active newsletter subscribers
    const subscribers = await db
      .select({ email: newsletter_subscribers.email })
      .from(newsletter_subscribers)
      .where(eq(newsletter_subscribers.is_active, true));

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers found' },
        { status: 404 }
      );
    }

    // Send the broadcast to each active subscriber.
    const html = `<div>${message}</div>`;
    const results = await Promise.allSettled(
      subscribers.map((subscriber) =>
        sendEmail({ to: subscriber.email, subject, html, text: message })
      )
    );

    const sentCount = results.filter((r) => r.status === 'fulfilled').length;
    const failedCount = results.length - sentCount;

    return NextResponse.json({
      success: true,
      message: `Newsletter broadcast sent to ${sentCount} subscribers`,
      recipientCount: subscribers.length,
      sentCount,
      failedCount,
    });
  } catch (error) {
    console.error('Newsletter broadcast error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send newsletter broadcast' },
      { status: 500 }
    );
  }
}
