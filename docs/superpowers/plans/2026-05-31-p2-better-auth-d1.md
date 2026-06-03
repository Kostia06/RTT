# Phase 2 — Better Auth on D1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace the deactivated Supabase auth with Better Auth backed by D1 — email/password + email verification + password reset + role-based access (customer/employee/manager/admin) — working under OpenNext's request-scoped bindings.

**Architecture:** The D1 binding only exists per-request (`getCloudflareContext().env.DB`), so the Better Auth instance is built **per request** by `getAuth()` (static config: secret, plugins, email; request-bound `drizzleAdapter(db)`). The session cookie is signed with a stable `BETTER_AUTH_SECRET`, so cookies remain valid across instances. Middleware does a **cheap cookie-presence** gate (no DB); fine-grained **role checks happen server-side** in pages/routes via `getAuth().api.getSession()`. Auth tables are defined manually in Drizzle (greenfield) to avoid the Better Auth CLI's need for a static `auth` export.

**Tech Stack:** better-auth, Drizzle (sqlite), D1, OpenNext, existing Resend email lib (`src/lib/email`).

---

### Task 1: Install Better Auth, secret, auth schema + migration

**Files:** `package.json`, `.env.local` (gitignored), Create `src/lib/db/schema/auth.ts`, Modify `src/lib/db/schema/index.ts`.

- [ ] **Step 1: Install**

Run: `npm install better-auth`

- [ ] **Step 2: Generate a secret into `.env.local`** (do not commit; .env*.local is gitignored)

Run:
```bash
printf '\nBETTER_AUTH_SECRET=%s\nBETTER_AUTH_URL=http://localhost:3000\n' "$(openssl rand -base64 32)" >> .env.local
```

- [ ] **Step 3: Create `src/lib/db/schema/auth.ts`** (Better Auth core + admin-plugin fields; camelCase names match Better Auth defaults; timestamps as epoch via `{mode:'timestamp'}`, booleans via `{mode:'boolean'}`):

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('customer'),
  banned: integer('banned', { mode: 'boolean' }),
  banReason: text('banReason'),
  banExpires: integer('banExpires', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonatedBy'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
});
```

- [ ] **Step 4:** In `src/lib/db/schema/index.ts` add `export * from './auth';`

- [ ] **Step 5:** Generate + apply migration: `npm run db:generate` then `npm run db:migrate:local`. Expected: tables `user/session/account/verification` created locally.

- [ ] **Step 6: Commit** `git add -A && git commit -m "Add Better Auth D1 schema + migration"`

---

### Task 2: getAuth() + catch-all route

**Files:** Create `src/lib/auth/auth.ts`, Create `src/lib/auth/email.ts`, Create `src/app/api/auth/[...all]/route.ts`.

- [ ] **Step 1: Read** `src/lib/email/emailService.ts` to learn the exported send function (name + signature). You'll call it from `email.ts`.

- [ ] **Step 2: Create `src/lib/auth/email.ts`** — thin wrappers that call the existing Resend sender. Adapt the import/call to the actual exported function found in Step 1:

```ts
// Adapt `sendEmail` import to the real export in src/lib/email/emailService.ts
import { sendEmail } from '@/lib/email/emailService';

export async function sendVerification(to: string, url: string) {
  await sendEmail({
    to,
    subject: 'Verify your email — Respect the Technique',
    html: `<p>Confirm your email to finish signing up.</p><p><a href="${url}">Verify email</a></p>`,
  });
}

export async function sendReset(to: string, url: string) {
  await sendEmail({
    to,
    subject: 'Reset your password — Respect the Technique',
    html: `<p>Reset your password.</p><p><a href="${url}">Set a new password</a></p>`,
  });
}
```
If the existing sender has a different signature (e.g. positional args), adapt these two calls to match it. If no env key is set, the sender already throws at call time — that's fine (only fires on signup/reset).

- [ ] **Step 3: Create `src/lib/auth/auth.ts`** (request-scoped):

```ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { getDb } from '@/lib/db/client';
import * as authSchema from '@/lib/db/schema/auth';
import { sendVerification, sendReset } from './email';

export async function getAuth() {
  const db = await getDb();
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, { provider: 'sqlite', schema: authSchema }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => { await sendReset(user.email, url); },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => { await sendVerification(user.email, url); },
    },
    user: { additionalFields: { role: { type: 'string', defaultValue: 'customer', input: false } } },
    plugins: [admin()],
  });
}

export type Auth = Awaited<ReturnType<typeof getAuth>>;
```

- [ ] **Step 4: Create `src/app/api/auth/[...all]/route.ts`** (build auth per request, delegate to its handler):

```ts
import { getAuth } from '@/lib/auth/auth';

export async function GET(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}

export async function POST(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}
```

- [ ] **Step 5:** `npx tsc --noEmit` — fix any type errors in the new files (e.g. adapt to better-auth's actual `admin()` import path or option names if the installed version differs; report if the API diverges materially).

- [ ] **Step 6: Commit** `git add -A && git commit -m "Add request-scoped Better Auth + auth route"`

---

### Task 3: Auth client

**Files:** Create `src/lib/auth/client.ts`.

- [ ] **Step 1:**
```ts
'use client';
import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

- [ ] **Step 2:** `npx tsc --noEmit` clean for this file. Commit `git add -A && git commit -m "Add Better Auth client"`.

---

### Task 4: Rewire useAuth + Header sign-out

**Files:** Modify `src/lib/hooks/useAuth.ts`, Modify `src/components/layout/Header.tsx`.

- [ ] **Step 1: Read both files.** In `useAuth.ts`, replace the Supabase session logic with Better Auth's `useSession()`:

```ts
'use client';
import { useSession } from '@/lib/auth/client';

export const useAuth = () => {
  const { data, isPending } = useSession();
  const user = data?.user ?? null;
  const role = (user as { role?: string } | null)?.role;
  return {
    user,
    role,
    isAuthenticated: !!user,
    isLoading: isPending,
    isEmployee: role === 'employee' || role === 'manager' || role === 'admin',
    isManager: role === 'manager' || role === 'admin',
    isAdmin: role === 'admin',
  };
};
```
Keep the exact same return shape/keys (other components depend on `isEmployee`, `isManager`, `isAdmin`, `isAuthenticated`, `isLoading`, `user`, `role`). Remove the `isSupabaseConfigured`/`createClient` imports.

- [ ] **Step 2:** In `Header.tsx`, replace `handleSignOut` (which used `supabase.auth.signOut()`) with:
```ts
import { signOut } from '@/lib/auth/client';
// ...
const handleSignOut = async () => {
  await signOut();
  window.location.href = '/';
};
```
Remove the now-unused `createClient` import from Header.

- [ ] **Step 3:** `npx tsc --noEmit` clean for these files. Commit `git add -A && git commit -m "Rewire useAuth + Header to Better Auth"`.

---

### Task 5: Rewire LoginForm + RegisterForm

**Files:** Modify `src/components/auth/LoginForm.tsx`, `src/components/auth/RegisterForm.tsx`.

- [ ] **Step 1: Read both files** to learn their current fields/validation/submit + redirect behavior. Preserve the existing UI, validation, loading/error states, and post-submit redirect. Only swap the auth call.

- [ ] **Step 2: LoginForm submit** → use Better Auth:
```ts
import { signIn } from '@/lib/auth/client';
// in submit handler:
const { error } = await signIn.email({ email, password });
if (error) { /* set the form's existing error state to error.message */ return; }
// then the existing success redirect (e.g. router.push('/account') or window.location)
```

- [ ] **Step 3: RegisterForm submit** → use Better Auth:
```ts
import { signUp } from '@/lib/auth/client';
const { error } = await signUp.email({ email, password, name });
if (error) { /* existing error state */ return; }
// existing success behavior (note: with email verification on, show a "check your email" message instead of an authed redirect)
```
Map the form's existing field variables (it may call them differently) — read the file and wire to the real state. Remove Supabase imports.

- [ ] **Step 4:** `npx tsc --noEmit` clean. Commit `git add -A && git commit -m "Rewire login/register to Better Auth"`.

---

### Task 6: Rewire middleware to Better Auth cookie check

**Files:** Modify `src/middleware.ts`.

- [ ] **Step 1: Read** the current middleware. Replace the Supabase `getUser()` gate with a cheap cookie-presence check (no DB call — middleware runs on the edge):
```ts
import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;
  const isProtected = ['/account', '/orders'].some(p => pathname.startsWith(p));
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if ((pathname === '/login' || pathname === '/register') && sessionCookie) {
    return NextResponse.redirect(new URL('/account', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/account/:path*', '/orders/:path*', '/login', '/register'] };
```
This is coarse (presence only). Fine-grained role checks happen server-side in pages/routes via `getAuth().api.getSession({ headers })`. Remove the `isSupabaseConfigured` import and the deactivation shim.

- [ ] **Step 2:** `npx tsc --noEmit` clean. Commit `git add -A && git commit -m "Rewire middleware to Better Auth session cookie"`.

---

### Task 7: Seed a verified admin (dev login without email)

**Files:** Create `scripts/seed-admin.md` (instructions) — runs via the auth API, not raw SQL (passwords must be hashed by Better Auth).

- [ ] **Step 1:** Because passwords must be hashed by Better Auth, seed the admin by calling the running sign-up endpoint, then mark verified + admin directly in local D1. Document + run:
```bash
# With `npm run dev` running:
# 1) create the user via the API (hashes the password):
#    POST http://localhost:3000/api/auth/sign-up/email  {"email":"admin@rtt.local","password":"<pw>","name":"Admin"}
# 2) flip verified + role in local D1 (no email needed in dev):
npx wrangler d1 execute rtt-db --local --command "UPDATE user SET emailVerified=1, role='admin' WHERE email='admin@rtt.local';"
```
Provide this as `scripts/seed-admin.md`. (Controller will run the sign-up call since it requires the dev server; the SQL flip is local.)

- [ ] **Step 2: Commit** `git add scripts/seed-admin.md && git commit -m "Add dev admin seed instructions"`.

---

## Notes / deferred

- Other API routes still call `createClient()` from Supabase; they're migrated to D1 in later plans. Any that call `supabase.auth.getUser()` for authz should switch to `getAuth().api.getSession({ headers: request.headers })` when migrated.
- `requireEmailVerification: true` blocks unverified logins; the seeded admin is pre-verified for dev. Real email sending needs `RESEND_API_KEY`.
- Replace the placeholder D1 `database_id` and run migrations `--remote` before deploy.
