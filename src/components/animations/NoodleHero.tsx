'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

export const NoodleHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Clean, professional entrance
      tl.fromTo(
        '.hero-overlay',
        { opacity: 1 },
        { opacity: 0, duration: 1.2 }
      )
      .fromTo(
        '.hero-image',
        { scale: 1.1 },
        { scale: 1, duration: 1.8, ease: 'power2.out' },
        '-=1'
      )
      .fromTo(
        '.hero-tagline',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.8'
      )
      .fromTo(
        '.hero-char',
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(
        '.hero-subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.3'
      )
      .fromTo(
        '.hero-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        '-=0.2'
      )
      .fromTo(
        '.hero-scroll',
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        '-=0.1'
      );

      // Parallax on scroll
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          gsap.to('.hero-image', {
            y: self.progress * 100,
            scale: 1 + self.progress * 0.1,
            ease: 'none',
            overwrite: 'auto'
          });
          gsap.to('.hero-content', {
            y: self.progress * 50,
            opacity: 1 - self.progress * 0.8,
            ease: 'none',
            overwrite: 'auto'
          });
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const titleLine1 = 'RESPECT';
  const titleLine2 = 'THE';
  const titleLine3 = 'TECHNIQUE';

  return (
    <div
      ref={containerRef}
      className="relative min-h-[100svh] bg-black overflow-hidden flex items-center justify-center"
    >
      {/* Loading overlay */}
      <div className="hero-overlay absolute inset-0 bg-black z-30 pointer-events-none" />

      {/* Background Image */}
      <div className="hero-image absolute inset-0 z-0">
        <Image
          src="/images/230401-RTT-NoodleMaking-099.JPG"
          alt="Hand-pulling fresh ramen noodles"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={85}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Main content */}
      <div className="hero-content relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto w-full">
        {/* Tagline */}
        <div className="hero-tagline mb-4 sm:mb-6">
          <span className="inline-block px-4 py-1.5 border border-white/30 text-white/80 text-xs sm:text-sm tracking-[0.25em] uppercase font-medium">
            Calgary&apos;s Authentic Ramen
          </span>
        </div>

        {/* Main title */}
        <h1 className="text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] font-black leading-[0.9] tracking-[-0.02em] text-white mb-4 sm:mb-6">
          <span className="block overflow-hidden py-1">
            {titleLine1.split('').map((char, i) => (
              <span key={i} className="hero-char inline-block">
                {char}
              </span>
            ))}
          </span>
          <span className="block overflow-hidden py-1">
            {titleLine2.split('').map((char, i) => (
              <span key={i} className="hero-char inline-block text-outline">
                {char}
              </span>
            ))}
          </span>
          <span className="block overflow-hidden py-1">
            {titleLine3.split('').map((char, i) => (
              <span key={i} className="hero-char inline-block">
                {char}
              </span>
            ))}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle text-base sm:text-lg md:text-xl text-white/70 max-w-lg mx-auto mb-8 sm:mb-10 font-light leading-relaxed px-4">
          18 hours of patience in every bowl.
          <span className="block text-white/50 mt-1">Hakata tradition, Calgary crafted.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0">
          <Link
            href="/shop"
            className="hero-cta group relative px-8 sm:px-10 py-4 bg-white text-black font-semibold text-sm tracking-[0.1em] uppercase overflow-hidden transition-all duration-300 hover:bg-accent hover:text-white"
          >
            <span className="relative z-10">Shop Now</span>
          </Link>
          <Link
            href="/recipes"
            className="hero-cta group relative px-8 sm:px-10 py-4 border border-white/50 text-white font-semibold text-sm tracking-[0.1em] uppercase overflow-hidden transition-all duration-300 hover:bg-white hover:text-black hover:border-white"
          >
            <span className="relative z-10">Browse Recipes</span>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="text-white/50 text-xs tracking-[0.2em] uppercase font-medium">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-white animate-scroll-pulse" />
        </div>
      </div>

      {/* Minimal corner accents */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 w-8 h-8 sm:w-12 sm:h-12 border-l border-t border-white/20" />
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-8 h-8 sm:w-12 sm:h-12 border-r border-t border-white/20" />
      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 w-8 h-8 sm:w-12 sm:h-12 border-l border-b border-white/20" />
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-8 h-8 sm:w-12 sm:h-12 border-r border-b border-white/20" />

      <style jsx>{`
        .text-outline {
          -webkit-text-stroke: 1.5px white;
          color: transparent;
        }
        @media (min-width: 640px) {
          .text-outline {
            -webkit-text-stroke: 2px white;
          }
        }
        @keyframes scroll-pulse {
          0%, 100% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(300%); opacity: 0; }
        }
        .animate-scroll-pulse {
          animation: scroll-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
