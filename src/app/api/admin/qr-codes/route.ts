import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateTimeTrackingQR } from '@/lib/qrcode';

/**
 * GET /api/admin/qr-codes
 * Get current time tracking QR code
 * Admin only
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const role = user.user_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Fetch the QR token from settings
    const { data: settingData, error: settingError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'time_tracking_qr_token')
      .single();

    if (settingError || !settingData) {
      return NextResponse.json({ error: 'QR token not found' }, { status: 404 });
    }

    const token = settingData.value;

    // Get base URL from request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Generate QR code
    const qrCodeUrl = await generateTimeTrackingQR(token, baseUrl);

    return NextResponse.json({
      qrCodeUrl,
      token,
      clockInUrl: `${baseUrl}/clock-in?qr=true&token=${token}`,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/qr-codes
 * Regenerate time tracking QR code token
 * Admin only
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const role = user.user_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Generate new UUID token
    const { data: newTokenData, error: updateError } = await supabase
      .rpc('gen_random_uuid');

    if (updateError) {
      console.error('Error generating UUID:', updateError);
      return NextResponse.json({ error: 'Failed to generate new token' }, { status: 500 });
    }

    const newToken = newTokenData;

    // Update settings table
    const { error: settingError } = await supabase
      .from('settings')
      .update({ value: `"${newToken}"` })
      .eq('key', 'time_tracking_qr_token');

    if (settingError) {
      console.error('Error updating QR token:', settingError);
      return NextResponse.json({ error: 'Failed to update QR token' }, { status: 500 });
    }

    // Get base URL from request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Generate new QR code
    const qrCodeUrl = await generateTimeTrackingQR(newToken, baseUrl);

    return NextResponse.json({
      success: true,
      message: 'QR code regenerated successfully',
      qrCodeUrl,
      token: newToken,
      clockInUrl: `${baseUrl}/clock-in?qr=true&token=${newToken}`,
    });
  } catch (error) {
    console.error('Error regenerating QR code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
