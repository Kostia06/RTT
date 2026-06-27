import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// Initialize OpenNext for development
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-auth statically imports its kysely sqlite adapters, which import `kysely`.
  // kysely's CJS re-exports migration constants via a runtime __exportStar helper that
  // webpack can't statically analyze, breaking the build. The app uses the Drizzle adapter,
  // so externalize only `kysely` (never bundled/analyzed). NOTE: do not externalize
  // `better-auth` itself — that would give `better-auth/react` a second React copy on the
  // server and break SSR hooks (useSession -> "Cannot read properties of null (useRef)").
  serverExternalPackages: ['kysely'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
