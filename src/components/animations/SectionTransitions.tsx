'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const SectionTransitions: React.FC = () => {
  useEffect(() => {
    // Get all sections
    const sections = gsap.utils.toArray<HTMLElement>('section');

    sections.forEach((section, index) => {
      // Skip if not a main section or is the hero
      if (!section.classList.contains('min-h-screen') || index === 0) return;

      // Apple-style: Fade and scale transition from previous section
      gsap.fromTo(
        section,
        {
          opacity: 0,
          scale: 0.95,
          y: 100,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 90%',
            end: 'top 40%',
            scrub: 2,
          },
        }
      );

      // Apple-style: Fade out current section as we leave
      gsap.to(section, {
        opacity: 0.3,
        scale: 0.98,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 2,
        },
      });

      // Apple-style: Pin effect for dramatic sections
      const isDarkSection = section.classList.contains('bg-black');
      if (isDarkSection) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          onEnter: () => {
            gsap.to(section, {
              filter: 'brightness(1.1)',
              duration: 0.5,
            });
          },
          onLeave: () => {
            gsap.to(section, {
              filter: 'brightness(1)',
              duration: 0.5,
            });
          },
          onEnterBack: () => {
            gsap.to(section, {
              filter: 'brightness(1.1)',
              duration: 0.5,
            });
          },
          onLeaveBack: () => {
            gsap.to(section, {
              filter: 'brightness(1)',
              duration: 0.5,
            });
          },
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
};
