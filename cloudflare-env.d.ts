// Minimal augmentation of the Cloudflare env used by getCloudflareContext().
// Type-only import so it does NOT pull the Workers global typings into the app
// (which would override the DOM `Response`/`fetch` types). Add bindings here as
// they're introduced in wrangler.jsonc.
import type { D1Database } from '@cloudflare/workers-types';

declare global {
  interface CloudflareEnv {
    DB: D1Database;
  }
}

export {};
