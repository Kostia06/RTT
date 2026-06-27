import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { fridges } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

// Generate unique QR code string
function generateQRCode(): string {
  return `FRIDGE-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

export async function GET(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const rows = activeOnly
      ? await db
          .select()
          .from(fridges)
          .where(eq(fridges.active, true))
          .orderBy(asc(fridges.name))
      : await db.select().from(fridges).orderBy(asc(fridges.name));

    return NextResponse.json({ fridges: rows });
  } catch (error: any) {
    console.error('Error fetching fridges:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch fridges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;

    const db = await getDb();
    const body = await request.json();

    // Generate QR code if not provided
    const qrCode = body.qr_code || generateQRCode();

    const [fridge] = await db
      .insert(fridges)
      .values({
        id: crypto.randomUUID(),
        name: body.name,
        qr_code: qrCode,
        location: body.location ?? null,
        max_capacity_cases: body.max_capacity_cases ?? null,
        max_capacity_portions: body.max_capacity_portions ?? null,
        temperature_log_required: body.temperature_log_required !== false,
        active: body.active !== false,
        created_at: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ fridge }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating fridge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create fridge' },
      { status: 500 }
    );
  }
}
