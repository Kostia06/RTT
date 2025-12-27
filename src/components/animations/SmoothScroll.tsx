'use client';

import { useEffect, ReactNode } from 'react';
import Lenis from 'lenis';
import { appleScrollEasing } from '@/lib/easings';

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // Create Lenis instance with Apple-like smooth scrolling
    const lenis = new Lenis({
      duration: 1.2, // Smooth scroll duration
      easing: appleScrollEasing, // Apple's easing curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Request animation frame loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup on unmount
    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
