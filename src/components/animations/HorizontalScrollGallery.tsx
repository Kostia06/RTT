'use client';

import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HorizontalScrollGalleryProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const HorizontalScrollGallery: React.FC<HorizontalScrollGalleryProps> = ({
  children,
  title,
  subtitle,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !scrollContainerRef.current) return;

    const ctx = gsap.context(() => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      const scrollWidth = scrollContainer.scrollWidth;
      const windowWidth = window.innerWidth;

      // Pin the section and scroll horizontally
      gsap.to(scrollContainer, {
        x: -(scrollWidth - windowWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          end: () => `+=${scrollWidth - windowWidth}`,
          anticipatePin: 1,
        },
      });

      // Animate title on entry
      if (title) {
        gsap.fromTo(
          '.horizontal-scroll-title',
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
            },
          }
        );
      }

      // Stagger animate items as they scroll into view
      const containerAnim = ScrollTrigger.getById('horizontal-scroll');
      gsap.utils.toArray<HTMLElement>('.horizontal-scroll-item').forEach((item) => {
        const scrollTriggerConfig: gsap.TweenVars['scrollTrigger'] = {
          trigger: item,
          start: 'left 90%',
          end: 'left 50%',
          scrub: 1,
        };

        // Only add containerAnimation if it exists
        if (containerAnim) {
          (scrollTriggerConfig as any).containerAnimation = containerAnim;
        }

        gsap.fromTo(
          item,
          { opacity: 0.6, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            scrollTrigger: scrollTriggerConfig,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [title]);

  return (
    <section ref={sectionRef} className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        {title && (
          <div className="horizontal-scroll-title">
            {subtitle && (
              <div className="flex items-center gap-6 mb-6">
                <div className="h-px bg-black/20 w-16" />
                <span className="text-sm tracking-[0.3em] text-gray-500 uppercase">
                  {subtitle}
                </span>
              </div>
            )}
            <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] text-black">
              {title}
            </h2>
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 sm:gap-8 pl-4 sm:pl-6 lg:pl-8 pr-[50vw]"
        id="horizontal-scroll"
      >
        {children}
      </div>

      {/* Scroll hint */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center gap-4 text-gray-400 text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          <span className="tracking-wide">Scroll to explore</span>
        </div>
      </div>
    </section>
  );
};
