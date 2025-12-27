'use client';

import { ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/performance';

interface AnimationWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper that respects user's motion preferences
 * Conditionally renders animated or static content
 */
export default function AnimationWrapper({ children, fallback }: AnimationWrapperProps) {
  const shouldReduce = prefersReducedMotion();

  if (shouldReduce && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * HOC to wrap components with reduced motion support
 */
export function withReducedMotion<P extends object>(
  Component: React.ComponentType<P>,
  StaticComponent?: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    const shouldReduce = prefersReducedMotion();

    if (shouldReduce && StaticComponent) {
      return <StaticComponent {...props} />;
    }

    return <Component {...props} />;
  };
}
