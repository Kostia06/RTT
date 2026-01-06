import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { email, source = 'website' } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email)
      .single();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 409 }
        );
      } else {
        // Reactivate subscription
        const { error } = await supabase
          .from('newsletter_subscribers')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) throw error;

        return NextResponse.json({
          message: 'Subscription reactivated successfully',
          subscribed: true
        });
      }
    }

    // Create new subscription
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, source }]);

    if (error) throw error;

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter',
      subscribed: true
    });

  } catch (error: any) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ subscribers: data || [] });

  } catch (error: any) {
    console.error('Fetch subscribers error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
