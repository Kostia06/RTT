'use client';

import { usePathname } from 'next/navigation';
import { PageTransition } from '@/components/transitions/PageTransition';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Use logo transition for homepage, vertical for all other pages
  const variant = pathname === '/' ? 'logo' : 'vertical';

  return <PageTransition variant={variant}>{children}</PageTransition>;
}
