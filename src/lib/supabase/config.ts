// Supabase is optional for local/dev runs. When the env vars below are
// absent, the app runs with Supabase "deactivated": clients fall back to
// harmless placeholders, auth is treated as logged-out, and route protection
// is skipped. Add NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY to
// `.env.local` to re-activate everything automatically — no code changes.

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_ANON_KEY = 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? PLACEHOLDER_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? PLACEHOLDER_ANON_KEY;
