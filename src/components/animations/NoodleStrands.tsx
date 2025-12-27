'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Animated noodle strands that weave through the page
 * SVG path animations triggered by scroll
 */
export default function NoodleStrands() {
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const paths = containerRef.current.querySelectorAll('path');

    paths.forEach((path, index) => {
      const length = path.getTotalLength();

      // Set initial state - hide the path
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      // Animate path drawing on scroll
      gsap.to(path, {
        strokeDashoffset: 0,
        scrollTrigger: {
          trigger: path,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5, // Smooth scrubbing with 1.5s lag
          markers: false,
        },
        ease: 'none',
      });

      // Add subtle floating animation
      gsap.to(path, {
        y: '+=15',
        x: '+=5',
        duration: 4 + index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.2,
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <svg
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      style={{ mixBlendMode: 'multiply' }}
    >
      {/* Top noodle strand */}
      <path
        d="M -100,200 Q 300,150 600,250 T 1200,300 Q 1500,350 2000,250"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Middle strand - wavy */}
      <path
        d="M -100,500 Q 400,450 700,550 T 1300,600 Q 1600,650 2000,550"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lower strand */}
      <path
        d="M -100,800 Q 350,750 650,850 T 1250,900 Q 1550,950 2000,850"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Additional thin strand - top right */}
      <path
        d="M 1000,100 Q 1200,80 1400,120 T 1800,150 Q 2000,180 2100,150"
        stroke="rgba(0,0,0,0.05)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Curved strand - bottom left */}
      <path
        d="M -100,950 Q 200,920 400,980 T 800,1050 Q 1000,1080 1200,1050"
        stroke="rgba(0,0,0,0.04)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Diagonal crossing strand */}
      <path
        d="M 500,100 Q 700,300 900,400 T 1300,700 Q 1500,850 1700,950"
        stroke="rgba(0,0,0,0.07)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
