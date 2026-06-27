import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { payRate } = (await request.json()) as { payRate?: unknown };

    if (typeof payRate !== 'number' || Number.isNaN(payRate) || payRate < 0) {
      return NextResponse.json(
        { error: 'Invalid pay rate. Must be a positive number.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const [target] = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await db
      .update(user)
      .set({ payRate, updatedAt: new Date() })
      .where(eq(user.id, id));

    return NextResponse.json({
      success: true,
      payRate,
    });
  } catch (error) {
    console.error('Error in pay rate API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
