'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const Marquee: React.FC = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.marquee-content', {
        xPercent: -50,
        duration: 30,
        ease: 'none',
        repeat: -1,
      });
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  const items = [
    'AUTHENTIC HAKATA RAMEN',
    '18 HOUR BROTH',
    'HAND-PULLED NOODLES',
    'CALGARY CRAFTED',
    'RESPECT THE TECHNIQUE',
  ];

  return (
    <div ref={marqueeRef} className="py-8 bg-black border-y border-white/10 overflow-hidden">
      <div className="marquee-content flex whitespace-nowrap">
        {[...Array(4)].map((_, groupIndex) => (
          <div key={groupIndex} className="flex">
            {items.map((item, i) => (
              <span
                key={`${groupIndex}-${i}`}
                className="mx-8 text-sm tracking-[0.3em] text-white/60 uppercase flex items-center gap-8"
              >
                {item}
                <span className="w-2 h-2 bg-white/20 rotate-45" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
