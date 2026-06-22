'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TransitionLink } from '@/components/transitions';

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
        { scale: 0, rotation: 180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 0.85, duration: 1.5, ease: 'back.out(1.2)' },
        '-=1'
      )
      .fromTo(
        '.hero-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 1, stagger: 0.1 },
        '-=1'
      )
      .fromTo(
        '.hero-subtitle',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.4'
      )
      .fromTo(
        '.hero-cta',
        { y: 30, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.15 },
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
        { opacity: 0, scale: 0.8, y: 50 },
        { opacity: 0.03, scale: 1, y: 0, duration: 1.5, stagger: 0.2 },
        '-=1'
      )
      .fromTo(
        '.corner-accent',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1 },
        '-=1'
      )
      .fromTo(
        '.steam-line',
        { scaleY: 0, opacity: 0 },
        { scaleY: 1, opacity: 0.3, duration: 1.5, stagger: 0.2 },
        '-=1'
      );

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

      // Steam rising effect
      gsap.to('.steam-line', {
        y: -30,
        opacity: 0,
        duration: 2,
        stagger: 0.3,
        repeat: -1,
        ease: 'power1.out'
      });

      // Subtle pulse on CTA buttons
      gsap.to('.hero-cta-pulse', {
        scale: 1.02,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Base orientation rotated 90° counter-clockwise (-90°), with a gentle
      // centered sway (±4°) pivoting on its own center. Slow + shallow so the
      // fine concentric lines don't shimmer/alias.
      gsap.fromTo(
        '.hero-logo-mark',
        { rotation: -94 },
        {
          rotation: -86,
          transformOrigin: 'center center',
          duration: 11,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        }
      );

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
          gsap.to('.corner-accent', {
            scale: 1 - self.progress * 0.5,
            opacity: 1 - self.progress,
            ease: 'none',
            overwrite: 'auto'
          });
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[100svh] bg-white overflow-hidden flex flex-col items-center justify-center gap-6 sm:gap-10"
    >
      {/* Animated overlay reveal */}
      <div className="hero-overlay absolute inset-0 bg-white z-20" />

      {/* Background grain texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Steam effect lines */}
      <div className="absolute bottom-1/4 left-1/4 flex gap-2 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="steam-line w-px h-8 bg-gradient-to-t from-black/30 to-transparent origin-bottom"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>

      {/* Solid blue logo — the hero centerpiece (its ring already reads "Respect the Technique").
          Vector SVG (traced from the artwork, recolored to navy) so it stays perfectly crisp at
          any size — no raster pixelation or mask aliasing. */}
      <div className="hero-logo-bg relative z-0 flex justify-center">
        <img
          src="/images/logo.svg"
          alt="Respect the Technique"
          draggable={false}
          className="hero-logo-mark relative w-[60vw] h-[60vw] max-w-[440px] max-h-[440px] object-contain select-none pointer-events-none"
          style={{ transformOrigin: 'center center' }}
        />
      </div>

      {/* Decorative lines */}
      <div className="absolute top-1/4 left-0 right-0 h-px">
        <div className="hero-line h-full bg-gradient-to-r from-transparent via-black/20 to-transparent" />
      </div>
      <div className="absolute top-3/4 left-0 right-0 h-px">
        <div className="hero-line h-full bg-gradient-to-r from-transparent via-black/20 to-transparent" />
      </div>

      {/* Main content \u2014 sits below the logo so it never overlaps */}
      <div className="hero-content relative z-10 text-center px-3 sm:px-6 max-w-6xl mx-auto w-full">

        {/* Subtitle */}
        <p className="hero-subtitle text-sm sm:text-base md:text-lg lg:text-xl text-black/70 max-w-md mx-auto mb-6 sm:mb-10 font-light tracking-wide px-2">
          18 hours of patience in every bowl.
          <span className="block text-black/60 mt-1">Hakata tradition, Calgary crafted.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-2">
          <TransitionLink
            href="/shop"
            className="hero-cta hero-cta-pulse group relative px-6 sm:px-10 py-3.5 sm:py-4 bg-black text-white font-bold text-xs sm:text-sm tracking-[0.15em] uppercase overflow-hidden touch-manipulation active:scale-95 transition-transform"
          >
            <span className="relative z-10">Shop Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </TransitionLink>
          <TransitionLink
            href="/recipes"
            className="hero-cta group relative px-6 sm:px-10 py-3.5 sm:py-4 border border-black/40 text-black font-bold text-xs sm:text-sm tracking-[0.15em] uppercase overflow-hidden hover:border-black active:bg-black/10 transition-all duration-300 touch-manipulation"
          >
            <span className="relative z-10">Browse Recipes</span>
            <div className="absolute inset-0 bg-black/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </TransitionLink>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sm:gap-3">
        <span className="text-black/60 text-[9px] sm:text-xs tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-10 sm:h-14 bg-gradient-to-b from-black/40 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-black animate-scroll-line" />
        </div>
      </div>

      {/* Corner accents */}
      <div className="corner-accent absolute top-3 left-3 sm:top-6 sm:left-6 w-6 h-6 sm:w-10 sm:h-10 border-l border-t border-black/20" />
      <div className="corner-accent absolute top-3 right-3 sm:top-6 sm:right-6 w-6 h-6 sm:w-10 sm:h-10 border-r border-t border-black/20" />
      <div className="corner-accent absolute bottom-3 left-3 sm:bottom-6 sm:left-6 w-6 h-6 sm:w-10 sm:h-10 border-l border-b border-black/20" />
      <div className="corner-accent absolute bottom-3 right-3 sm:bottom-6 sm:right-6 w-6 h-6 sm:w-10 sm:h-10 border-r border-b border-black/20" />

      {/* Animated dots pattern - subtle decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-black rounded-full animate-float-dots"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-scroll-line {
          animation: scroll-line 1.5s ease-in-out infinite;
        }
        @keyframes float-dots {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 0.5; }
        }
        .animate-float-dots {
          animation: float-dots 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
