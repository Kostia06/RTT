'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SectionDividerProps {
  variant?: 'light' | 'dark';
  pattern?: 'dots' | 'lines' | 'wave';
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  variant = 'dark',
  pattern = 'lines'
}) => {
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the lines/dots on scroll
      gsap.fromTo(
        '.divider-element',
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: dividerRef.current,
            start: 'top 85%',
          },
        }
      );

      // Animate dots floating
      if (pattern === 'dots') {
        gsap.to('.divider-dot', {
          y: 'random(-5, 5)',
          duration: 'random(1.5, 2.5)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: { each: 0.1, from: 'random' }
        });
      }
    }, dividerRef);

    return () => ctx.revert();
  }, [pattern]);

  const bgColor = variant === 'dark' ? 'bg-black' : 'bg-white';
  const lineColor = variant === 'dark' ? 'bg-white/10' : 'bg-black/10';
  const dotColor = variant === 'dark' ? 'bg-white/20' : 'bg-black/20';

  return (
    <div ref={dividerRef} className={`py-6 sm:py-8 ${bgColor} overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {pattern === 'lines' && (
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`divider-element h-px ${lineColor} origin-left`}
                style={{ width: `${12 + i * 4}%` }}
              />
            ))}
          </div>
        )}

        {pattern === 'dots' && (
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`divider-element divider-dot w-1.5 h-1.5 sm:w-2 sm:h-2 ${dotColor} rounded-full`}
              />
            ))}
          </div>
        )}

        {pattern === 'wave' && (
          <div className="flex items-center justify-center">
            <svg
              className="w-full max-w-md h-4 sm:h-6"
              viewBox="0 0 200 20"
              preserveAspectRatio="none"
            >
              <path
                className={`divider-element ${variant === 'dark' ? 'stroke-white/20' : 'stroke-black/20'}`}
                d="M0 10 Q 25 0, 50 10 T 100 10 T 150 10 T 200 10"
                fill="none"
                strokeWidth="1"
                style={{ transformOrigin: 'left center' }}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
