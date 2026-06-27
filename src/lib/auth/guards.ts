import { NextResponse } from 'next/server';
import { getAuth } from './auth';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  banned?: boolean | null;
};

export type Role = 'customer' | 'employee' | 'manager' | 'admin';

const ROLE_RANK: Record<string, number> = {
  customer: 0,
  employee: 1,
  manager: 2,
  admin: 3,
};

export function hasRole(role: string | null | undefined, min: Role): boolean {
  return (ROLE_RANK[role ?? ''] ?? -1) >= ROLE_RANK[min];
}

/** Resolve the current session user from request headers, or null if unauthenticated. */
export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;
  return session.user as SessionUser;
}

type Guard = { user: SessionUser; error?: never } | { user?: never; error: NextResponse };

/** Require any authenticated user. Returns `{ user }` or `{ error }` (return the error early). */
export async function requireUser(request: Request): Promise<Guard> {
  const user = await getSessionUser(request);
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  return { user };
}

/** Require an authenticated user with at least `min` role. Returns `{ user }` or `{ error }`. */
export async function requireRole(request: Request, min: Role): Promise<Guard> {
  const user = await getSessionUser(request);
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (!hasRole(user.role, min)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user };
}
