'use client';

import { usePathname } from 'next/navigation';
import { PageTransition } from '@/components/transitions/PageTransition';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dashboard, worker, and admin edit pages - no transitions (fast and snappy)
  const noTransitionPages = [
    '/dashboard',
    '/time-tracking',
    '/schedule',
    '/clock-in',
    '/production',
    '/production-logs',
    '/inventory',
    '/inventory-advanced',
    '/orders',
    '/messages',
    '/reports',
    '/today',
    '/manage-',
    '/admin/',
    '/fridge',
    '/support',
  ];

  const shouldSkipTransition = noTransitionPages.some(
    (page) => pathname === page || pathname?.startsWith(page)
  );

  // Determine variant
  let variant: 'grid' | 'logo' | 'none' = 'grid';

  if (shouldSkipTransition) {
    variant = 'none';
  } else if (pathname === '/') {
    variant = 'logo';
  }

  return <PageTransition variant={variant}>{children}</PageTransition>;
}
