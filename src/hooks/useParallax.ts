'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for parallax scroll effects
 * Creates depth by moving elements at different speeds
 *
 * @param speed - Parallax speed multiplier (0-1: slower, >1: faster)
 * @returns ref and offset value for transform
 */
export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Only calculate when element is in viewport (performance optimization)
      const isInViewport = elementTop < windowHeight && elementTop + elementHeight > 0;

      if (isInViewport) {
        // Calculate how much of the viewport the element has scrolled through
        const scrolled = windowHeight - elementTop;
        const parallaxOffset = scrolled * speed;
        setOffset(parallaxOffset);
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Call once to set initial position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, offset };
}

/**
 * Advanced parallax hook with custom range and clamp
 */
export function useParallaxAdvanced(options: {
  speed?: number;
  startOffset?: number;
  endOffset?: number;
  clamp?: boolean;
} = {}) {
  const { speed = 0.5, startOffset = 0, endOffset = 0, clamp = false } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      const isInViewport = elementTop < windowHeight && elementTop + elementHeight > 0;

      if (isInViewport) {
        const progress = (windowHeight - elementTop) / (windowHeight + elementHeight);
        let parallaxValue = (progress - 0.5) * speed * 100;

        // Add custom range
        parallaxValue += startOffset + (endOffset - startOffset) * progress;

        // Clamp if needed
        if (clamp) {
          const maxOffset = Math.max(Math.abs(startOffset), Math.abs(endOffset));
          parallaxValue = Math.max(-maxOffset, Math.min(maxOffset, parallaxValue));
        }

        setOffset(parallaxValue);
      }
    };

    // Use RAF for smoother updates
    const loop = () => {
      handleScroll();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [speed, startOffset, endOffset, clamp]);

  return { ref, offset };
}
