import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { fridges } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireRole(request, 'employee');
    if (gate.error) return gate.error;

    const db = await getDb();
    const { id } = await params;

    const [fridge] = await db
      .select()
      .from(fridges)
      .where(eq(fridges.id, id))
      .limit(1);

    if (!fridge) {
      return NextResponse.json({ error: 'Fridge not found' }, { status: 404 });
    }

    return NextResponse.json({ fridge });
  } catch (error: any) {
    console.error('Error fetching fridge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch fridge' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;

    const db = await getDb();
    const { id } = await params;
    const body = await request.json();

    const [fridge] = await db
      .update(fridges)
      .set({
        name: body.name,
        location: body.location,
        max_capacity_cases: body.max_capacity_cases,
        max_capacity_portions: body.max_capacity_portions,
        temperature_log_required: body.temperature_log_required,
        active: body.active,
        updated_at: new Date().toISOString(),
      })
      .where(eq(fridges.id, id))
      .returning();

    if (!fridge) {
      return NextResponse.json({ error: 'Fridge not found' }, { status: 404 });
    }

    return NextResponse.json({ fridge });
  } catch (error: any) {
    console.error('Error updating fridge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update fridge' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;

    const db = await getDb();
    const { id } = await params;

    // Soft delete
    await db
      .update(fridges)
      .set({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .where(eq(fridges.id, id));

    return NextResponse.json({ message: 'Fridge deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting fridge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete fridge' },
      { status: 500 }
    );
  }
}
