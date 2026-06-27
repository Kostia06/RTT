import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

const VALID_ROLES = ['customer', 'employee', 'manager', 'admin'] as const;

/** Parse a ban duration into an expiry Date. 'permanent' -> far-future (100y). */
function resolveBanExpires(duration: string | undefined): Date {
  const now = new Date();
  switch (duration) {
    case 'hour':
      now.setHours(now.getHours() + 1);
      return now;
    case 'day':
    case '1d':
      now.setDate(now.getDate() + 1);
      return now;
    case 'week':
    case '7d':
      now.setDate(now.getDate() + 7);
      return now;
    case 'permanent':
    default:
      now.setFullYear(now.getFullYear() + 100);
      return now;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;
    const { user: currentUser } = gate;

    const { id } = await params;
    const body = await request.json();
    const { role, ban, unban } = body as {
      role?: string;
      ban?: { duration?: string; reason?: string } | null;
      unban?: boolean;
    };

    const isRoleChange = typeof role === 'string';
    const isBanChange = ban !== undefined && ban !== null;
    const isUnbanChange = unban === true || ban === null;

    // Self-protection: an admin cannot change their own role or ban themselves.
    if (id === currentUser.id && (isRoleChange || isBanChange || isUnbanChange)) {
      return NextResponse.json(
        { error: 'You cannot modify your own account' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Ensure the target exists.
    const [target] = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role update.
    if (isRoleChange) {
      if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      await db
        .update(user)
        .set({ role, updatedAt: new Date() })
        .where(eq(user.id, id));
    }

    // Unban takes precedence over ban if both somehow arrive; handle explicit unban.
    if (isUnbanChange) {
      await db
        .update(user)
        .set({
          banned: false,
          banExpires: null,
          banReason: null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, id));
    } else if (isBanChange) {
      const banExpires = resolveBanExpires(ban?.duration);
      await db
        .update(user)
        .set({
          banned: true,
          banExpires,
          banReason: ban?.reason ?? null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, id));
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error in admin user update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
