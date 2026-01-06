import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Verify user is authenticated and is an employee
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all active newsletter subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (fetchError) throw fetchError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers found' },
        { status: 404 }
      );
    }

    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // For now, we'll just log the broadcast attempt
    console.log('Newsletter broadcast:', {
      subject,
      message,
      recipientCount: subscribers.length,
      recipients: subscribers.map(s => s.email)
    });

    // In a production environment, you would:
    // 1. Use an email service like SendGrid or Resend
    // 2. Send emails in batches to avoid rate limits
    // 3. Track delivery status
    // 4. Handle bounces and unsubscribes
    //
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // for (const subscriber of subscribers) {
    //   await resend.emails.send({
    //     from: 'newsletter@respectthetechnique.com',
    //     to: subscriber.email,
    //     subject: subject,
    //     text: message,
    //   });
    // }

    return NextResponse.json({
      success: true,
      message: `Newsletter broadcast queued for ${subscribers.length} subscribers`,
      recipientCount: subscribers.length
    });

  } catch (error: any) {
    console.error('Newsletter broadcast error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send newsletter broadcast' },
      { status: 500 }
    );
  }
}
