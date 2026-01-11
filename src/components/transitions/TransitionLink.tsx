'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, MouseEvent } from 'react';
import { usePageTransition } from './PageTransition';

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TransitionLink = ({
  href,
  children,
  className,
  onClick,
  ...props
}: TransitionLinkProps & Omit<React.ComponentProps<typeof Link>, 'href'>) => {
  const router = useRouter();
  const { startExitTransition } = usePageTransition();

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    // Don't intercept external links or anchor links
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
      onClick?.();
      return;
    }

    e.preventDefault();
    onClick?.();

    // Start exit animation
    await startExitTransition();

    // Navigate after animation
    router.push(href);
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
};
