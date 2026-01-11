'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const Marquee: React.FC = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      animationRef.current = gsap.to('.marquee-content', {
        xPercent: -50,
        duration: 25,
        ease: 'none',
        repeat: -1,
      });
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (animationRef.current) {
      if (isHovered) {
        gsap.to(animationRef.current, { timeScale: 0.3, duration: 0.5 });
      } else {
        gsap.to(animationRef.current, { timeScale: 1, duration: 0.5 });
      }
    }
  }, [isHovered]);

  const items = [
    { text: 'AUTHENTIC HAKATA RAMEN', icon: '麺' },
    { text: '18 HOUR BROTH', icon: '骨' },
    { text: 'HAND-PULLED NOODLES', icon: '手' },
    { text: 'CALGARY CRAFTED', icon: '心' },
    { text: 'RESPECT THE TECHNIQUE', icon: '技' },
  ];

  return (
    <div
      ref={marqueeRef}
      className="py-4 sm:py-6 md:py-8 bg-black border-y border-white/10 overflow-hidden cursor-default group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="marquee-content flex whitespace-nowrap">
        {[...Array(4)].map((_, groupIndex) => (
          <div key={groupIndex} className="flex">
            {items.map((item, i) => (
              <span
                key={`${groupIndex}-${i}`}
                className="mx-4 sm:mx-6 md:mx-8 text-[10px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.3em] text-white/60 uppercase flex items-center gap-3 sm:gap-4 md:gap-6 group-hover:text-white/80 transition-colors duration-300"
              >
                <span className="text-lg sm:text-xl md:text-2xl opacity-30 group-hover:opacity-50 transition-opacity">{item.icon}</span>
                <span className="font-medium">{item.text}</span>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white/20 rotate-45 group-hover:bg-white/40 transition-colors" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
