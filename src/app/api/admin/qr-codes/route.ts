import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateTimeTrackingQR } from '@/lib/qrcode';
import { requireRole } from '@/lib/auth/guards';

const QR_TOKEN_KEY = 'time_tracking_qr_token';

/** Decode a settings value that may be JSON-encoded (legacy: `"<token>"`). */
function decodeToken(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'string' ? parsed : value;
  } catch {
    return value;
  }
}

/**
 * GET /api/admin/qr-codes
 * Get the current time tracking QR code. Creates a token if none exists.
 * Admin only.
 */
export async function GET(request: Request) {
  try {
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;

    const db = await getDb();

    const [row] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, QR_TOKEN_KEY))
      .limit(1);

    let token = decodeToken(row?.value ?? null);

    if (!token) {
      token = crypto.randomUUID();
      await db
        .insert(settings)
        .values({ key: QR_TOKEN_KEY, value: JSON.stringify(token) })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: JSON.stringify(token) },
        });
    }

    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
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
 * Regenerate the time tracking QR code token.
 * Admin only.
 */
export async function POST(request: Request) {
  try {
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;

    const newToken = crypto.randomUUID();

    const db = await getDb();
    await db
      .insert(settings)
      .values({ key: QR_TOKEN_KEY, value: JSON.stringify(newToken) })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: JSON.stringify(newToken) },
      });

    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
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
