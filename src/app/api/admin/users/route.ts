import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { user, session } from '@/lib/db/schema';
import { desc, inArray } from 'drizzle-orm';
import { requireRole } from '@/lib/auth/guards';

export async function GET(request: Request) {
  try {
    const gate = await requireRole(request, 'admin');
    if (gate.error) return gate.error;

    const db = await getDb();

    const rows = await db.select().from(user).orderBy(desc(user.createdAt));

    // Resolve each user's most recent session.createdAt for "last sign in".
    const lastSignInByUserId = new Map<string, Date>();
    if (rows.length > 0) {
      const userIds = rows.map((u) => u.id);
      const sessions = await db
        .select({ userId: session.userId, createdAt: session.createdAt })
        .from(session)
        .where(inArray(session.userId, userIds));

      for (const s of sessions) {
        if (!s.createdAt) continue;
        const existing = lastSignInByUserId.get(s.userId);
        if (!existing || s.createdAt > existing) {
          lastSignInByUserId.set(s.userId, s.createdAt);
        }
      }
    }

    const formattedUsers = rows.map((u) => {
      const lastSignIn = lastSignInByUserId.get(u.id) ?? null;
      return {
        id: u.id,
        email: u.email,
        name: u.name ?? 'N/A',
        role: u.role ?? 'customer',
        payRate: u.payRate ?? 0,
        created_at: u.createdAt ? u.createdAt.toISOString() : null,
        banned: u.banned ?? false,
        banned_until: u.banExpires ? u.banExpires.toISOString() : null,
        last_sign_in_at: lastSignIn ? lastSignIn.toISOString() : null,
      };
    });

    return NextResponse.json({
      users: formattedUsers,
      total: formattedUsers.length,
    });
  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
