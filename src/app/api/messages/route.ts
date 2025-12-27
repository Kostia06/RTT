import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET - Fetch all messages (employee only)
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Use service client to fetch messages
    const serviceClient = await createServiceClient();
    let query = serviceClient
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Supabase error fetching messages:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch messages',
          details: error.message || 'Unknown error',
          hint: error.hint || null,
          code: error.code || null
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: messages || [] });
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

    // Use regular client with anon key (public endpoint)
    const supabase = await createClient();

    // Insert message - RLS policy allows public inserts
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        subject: subject || 'No subject',
        message,
        status: 'new',
      });

    if (error) {
      console.error('Supabase error creating message:', error);
      return NextResponse.json(
        {
          error: 'Failed to send message',
          details: error.message || 'Unknown error',
          hint: error.hint || null,
          code: error.code || null
        },
        { status: 500 }
      );
    }

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
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
