'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const SectionTransitions: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      const sections = gsap.utils.toArray<HTMLElement>('section.min-h-screen');

      sections.forEach((section, index) => {
        if (index === 0) return; // Skip hero

        // Apple-style: Section enters from below with fade and scale
        gsap.fromTo(
          section,
          {
            opacity: 0,
            scale: 0.9,
            y: 100,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top center',
              scrub: 1.5,
            },
          }
        );

        // Apple-style: Previous section fades and scales down as next enters
        if (index > 0) {
          const prevSection = sections[index - 1];
          gsap.to(prevSection, {
            opacity: 0.3,
            scale: 0.95,
            y: -50,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top center',
              scrub: 1.5,
            },
          });
        }

        // Apple-style: Current section exits - fades and scales down
        gsap.to(section, {
          opacity: 0.4,
          scale: 0.92,
          y: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'bottom center',
            end: 'bottom top',
            scrub: 1.5,
          },
        });

        // Apple-style: Pin dark sections for dramatic effect
        if (section.classList.contains('bg-black')) {
          ScrollTrigger.create({
            trigger: section,
            start: 'center center',
            end: 'center center',
            onEnter: () => {
              gsap.to(section, {
                scale: 1.02,
                duration: 0.6,
                ease: 'power2.out',
              });
            },
            onLeaveBack: () => {
              gsap.to(section, {
                scale: 1,
                duration: 0.6,
                ease: 'power2.out',
              });
            },
          });
        }
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
};
