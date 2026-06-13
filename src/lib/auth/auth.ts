import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins/admin';
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
      sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
        await sendReset(user.email, url);
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
        await sendVerification(user.email, url);
      },
    },
    user: {
      additionalFields: {
        role: { type: 'string', defaultValue: 'customer', input: false },
        payRate: { type: 'number', required: false, input: false },
        phone: { type: 'string', required: false },
      },
    },
    // The admin plugin's own role default is "user", which overrides the
    // schema-level "customer" default and is unknown to ROLE_RANK in guards.ts.
    // Align it with the app's role model so new signups become "customer".
    plugins: [admin({ defaultRole: 'customer', adminRoles: ['admin'] })],
  });
}

export type Auth = Awaited<ReturnType<typeof getAuth>>;
