'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header line animation
      gsap.fromTo(
        '.newsletter-line',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.newsletter-header',
            start: 'top 85%',
          },
        }
      );

      // Title reveal with split animation
      gsap.fromTo(
        '.newsletter-title-line',
        { y: 80, opacity: 0, rotateX: -45 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.newsletter-title',
            start: 'top 80%',
          },
        }
      );

      // Content stagger
      gsap.fromTo(
        '.newsletter-content > *',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.newsletter-content',
            start: 'top 80%',
          },
        }
      );

      // Form input animation
      gsap.fromTo(
        '.newsletter-form',
        { y: 30, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.newsletter-form',
            start: 'top 85%',
          },
        }
      );

      // Floating decorative elements
      gsap.to('.newsletter-float', {
        y: 'random(-20, 20)',
        rotation: 'random(-10, 10)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { each: 0.5, from: 'random' }
      });

      // Background pattern parallax
      gsap.to('.newsletter-pattern', {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source: 'website' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setStatus('success');
      setEmail('');
    } catch (error: any) {
      console.error('Newsletter signup error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <section ref={sectionRef} className="min-h-[80vh] sm:min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="newsletter-pattern absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="newsletter-float absolute top-[15%] left-[10%] w-16 h-16 sm:w-20 sm:h-20 border border-black/5 rounded-full" />
        <div className="newsletter-float absolute top-[25%] right-[15%] w-8 h-8 sm:w-12 sm:h-12 bg-black/[0.02]" />
        <div className="newsletter-float absolute bottom-[20%] left-[20%] w-6 h-6 sm:w-8 sm:h-8 bg-black/[0.03] rotate-45" />
        <div className="newsletter-float absolute bottom-[30%] right-[10%] w-20 h-20 sm:w-24 sm:h-24 border border-black/5 rounded-full" />
      </div>

      {/* Large background text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <span className="text-[20vw] sm:text-[15vw] font-black text-black/[0.02] tracking-[-0.05em]">
          JOIN
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative py-12 sm:py-16 md:py-20 lg:py-24 w-full">
        <div className="newsletter-content text-center">
          <div className="newsletter-header flex items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="newsletter-line h-px bg-black/20 w-10 sm:w-16 origin-right" />
            <span className="text-[10px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.3em] text-gray-500 uppercase">Newsletter</span>
            <div className="newsletter-line h-px bg-black/20 w-10 sm:w-16 origin-left" />
          </div>

          <h2 className="newsletter-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.04em] text-black mb-4 sm:mb-6 overflow-hidden"
            style={{ perspective: '1000px' }}
          >
            <span className="newsletter-title-line block" style={{ transformStyle: 'preserve-3d' }}>JOIN THE</span>
            <span className="newsletter-title-line block text-outline-black" style={{ transformStyle: 'preserve-3d' }}>INNER CIRCLE</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 md:mb-12 max-w-md mx-auto px-2">
            Be the first to know about new bowls, exclusive classes, and special offers.
          </p>

          {status === 'success' ? (
            <div className="newsletter-form bg-black text-white py-5 sm:py-6 px-6 sm:px-8 inline-block animate-fade-in">
              <div className="flex items-center gap-3 justify-center mb-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-base sm:text-lg font-bold tracking-wide">Welcome to the family.</p>
              </div>
              <p className="text-white/60 text-xs sm:text-sm">Check your inbox for confirmation.</p>
            </div>
          ) : status === 'error' ? (
            <div className="newsletter-form bg-red-600 text-white py-5 sm:py-6 px-6 sm:px-8 inline-block animate-fade-in">
              <p className="text-base sm:text-lg font-bold tracking-wide">Oops! Something went wrong.</p>
              <p className="text-white/60 text-xs sm:text-sm mt-1">Please try again.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form max-w-sm sm:max-w-md mx-auto px-2">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 sm:border-r-0 border-black focus:outline-none focus:ring-2 focus:ring-black/20 text-black placeholder-gray-400 text-sm sm:text-base transition-shadow"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-black text-white font-bold text-xs sm:text-sm tracking-[0.1em] uppercase hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="hidden sm:inline">Joining...</span>
                    </span>
                  ) : (
                    'Join'
                  )}
                </button>
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-500">
                No spam. Unsubscribe anytime. Privacy matters.
              </p>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .text-outline-black {
          -webkit-text-stroke: 1px black;
          color: transparent;
        }
        @media (min-width: 640px) {
          .text-outline-black {
            -webkit-text-stroke: 1.5px black;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </section>
  );
};
