'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return;

    // Page enter animation
    const tl = gsap.timeline();

    tl.fromTo(
      overlayRef.current,
      { scaleY: 0, transformOrigin: 'bottom' },
      { scaleY: 1, duration: 0.6, ease: 'power4.inOut' }
    )
    .to(overlayRef.current, {
      scaleY: 0,
      transformOrigin: 'top',
      duration: 0.6,
      ease: 'power4.inOut',
    }, '+=0.1')
    .fromTo(
      contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    );
  }, [pathname]);

  return (
    <>
      {/* Transition overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black z-[100] pointer-events-none"
        style={{ transform: 'scaleY(0)', transformOrigin: 'top' }}
      />

      {/* Content */}
      <div ref={contentRef}>
        {children}
      </div>
    </>
  );
};
