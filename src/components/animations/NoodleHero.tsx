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
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // Dramatic entrance
      tl.fromTo(
        '.hero-overlay',
        { scaleY: 1 },
        { scaleY: 0, duration: 1.5, transformOrigin: 'top' }
      )
      .fromTo(
        '.hero-logo-bg',
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 0.04, duration: 1.5, ease: 'back.out(1.2)' },
        '-=1'
      )
      .fromTo(
        '.hero-logo-small',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 0.8, duration: 0.8, ease: 'back.out(1.5)' },
        '-=0.8'
      )
      .fromTo(
        '.hero-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 1, stagger: 0.1 },
        '-=1'
      )
      .fromTo(
        '.hero-char',
        { y: 120, opacity: 0, rotateX: -80 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.03 },
        '-=0.8'
      )
      .fromTo(
        '.hero-subtitle',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.4'
      )
      .fromTo(
        '.hero-cta',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        '-=0.3'
      )
      .fromTo(
        '.hero-scroll',
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        '-=0.2'
      )
      .fromTo(
        '.floating-kanji',
        { opacity: 0, scale: 0.8 },
        { opacity: 0.03, scale: 1, duration: 1.5, stagger: 0.2 },
        '-=1'
      );

      // Continuous slow rotation for the background logo
      gsap.to('.hero-logo-bg', {
        rotation: 360,
        duration: 120,
        ease: 'none',
        repeat: -1,
      });

      // Floating animation for kanji
      gsap.to('.floating-kanji', {
        y: 'random(-20, 20)',
        rotation: 'random(-5, 5)',
        duration: 'random(4, 6)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { each: 0.5, from: 'random' }
      });

      // Parallax on scroll
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          gsap.to('.hero-content', {
            y: self.progress * 100,
            opacity: 1 - self.progress,
            ease: 'none',
            overwrite: 'auto'
          });
          gsap.to('.hero-logo-bg', {
            y: self.progress * 50,
            scale: 1 + self.progress * 0.3,
            ease: 'none',
            overwrite: 'auto'
          });
          gsap.to('.floating-kanji', {
            y: self.progress * -50,
            ease: 'none',
            overwrite: 'auto'
          });
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const titleChars = 'RESPECT THE TECHNIQUE'.split('');

  return (
    <div
      ref={containerRef}
      className="relative min-h-[100svh] bg-black overflow-hidden flex items-center justify-center"
    >
      {/* Animated overlay reveal */}
      <div className="hero-overlay absolute inset-0 bg-black z-20" />

      {/* Background grain texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Large animated logo in background */}
      <div className="hero-logo-bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] max-w-[700px] max-h-[700px]">
        <Image
          src="/images/logo.png"
          alt=""
          fill
          className="object-contain"
          style={{ filter: 'invert(1) brightness(2)' }}
          priority
        />
      </div>

      {/* Floating Kanji characters - hidden on small mobile */}
      <div className="floating-kanji hidden sm:block absolute top-[10%] left-[5%] text-white text-[15vw] md:text-[12vw] lg:text-[10vw] font-bold select-none pointer-events-none">
        麺
      </div>
      <div className="floating-kanji hidden sm:block absolute top-[30%] right-[8%] text-white text-[12vw] md:text-[10vw] lg:text-[8vw] font-bold select-none pointer-events-none">
        豚
      </div>
      <div className="floating-kanji hidden sm:block absolute bottom-[20%] left-[15%] text-white text-[14vw] md:text-[11vw] lg:text-[9vw] font-bold select-none pointer-events-none">
        骨
      </div>

      {/* Decorative lines */}
      <div className="absolute top-1/4 left-0 right-0 h-px">
        <div className="hero-line h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      <div className="absolute top-3/4 left-0 right-0 h-px">
        <div className="hero-line h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Main content */}
      <div className="hero-content relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto">

        {/* Main title with character animation */}
        <h1 className="text-[13vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] font-black leading-[0.9] sm:leading-[0.85] tracking-[-0.04em] text-white mb-6 sm:mb-8"
          style={{ perspective: '1000px' }}
        >
          <span className="block overflow-hidden">
            {titleChars.slice(0, 7).map((char, i) => (
              <span key={i} className="hero-char inline-block" style={{ transformStyle: 'preserve-3d' }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
          <span className="block overflow-hidden">
            {titleChars.slice(8, 11).map((char, i) => (
              <span key={i} className="hero-char inline-block text-outline" style={{ transformStyle: 'preserve-3d' }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
          <span className="block overflow-hidden">
            {titleChars.slice(12).map((char, i) => (
              <span key={i} className="hero-char inline-block" style={{ transformStyle: 'preserve-3d' }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle text-base sm:text-lg md:text-xl lg:text-2xl text-white/60 max-w-xl mx-auto mb-8 sm:mb-10 md:mb-12 font-light tracking-wide px-4">
          18 hours of patience in every bowl.
          <br className="hidden sm:block" />
          <span className="sm:block text-white/40"> Hakata tradition, Calgary crafted.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4">
          <Link
            href="/shop"
            className="hero-cta group relative px-8 sm:px-12 py-4 sm:py-5 bg-white text-black font-bold text-sm tracking-[0.2em] uppercase overflow-hidden touch-manipulation active:bg-gray-100"
          >
            <span className="relative z-10">Shop Now</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
          <Link
            href="/recipes"
            className="hero-cta group relative px-8 sm:px-12 py-4 sm:py-5 border-2 sm:border border-white/30 text-white font-bold text-sm tracking-[0.2em] uppercase overflow-hidden hover:border-white active:bg-white/10 transition-colors duration-300 touch-manipulation"
          >
            <span className="relative z-10">Browse Recipes</span>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 sm:gap-4">
        <span className="text-white/40 text-[10px] sm:text-xs tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-12 sm:h-16 bg-gradient-to-b from-white/40 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-scroll-line" />
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 w-8 h-8 sm:w-12 sm:h-12 border-l border-t border-white/20" />
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-8 h-8 sm:w-12 sm:h-12 border-r border-t border-white/20" />
      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 w-8 h-8 sm:w-12 sm:h-12 border-l border-b border-white/20" />
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-8 h-8 sm:w-12 sm:h-12 border-r border-b border-white/20" />

      <style jsx>{`
        .text-outline {
          -webkit-text-stroke: 1.5px white;
          color: transparent;
        }
        @keyframes scroll-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-scroll-line {
          animation: scroll-line 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
