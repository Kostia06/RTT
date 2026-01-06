'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
    <section ref={sectionRef} className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative bowl images */}
      <div className="absolute top-10 left-[5%] w-[200px] h-[200px] opacity-10 pointer-events-none hidden lg:block">
        <Image
          src="/images/eat.png"
          alt=""
          fill
          className="object-contain"
          sizes="200px"
        />
      </div>
      <div className="absolute bottom-10 right-[5%] w-[250px] h-[250px] opacity-10 pointer-events-none hidden lg:block rotate-12">
        <Image
          src="/images/eat.png"
          alt=""
          fill
          className="object-contain"
          sizes="250px"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="newsletter-content text-center">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="h-px bg-black/20 w-16" />
            <span className="text-sm tracking-[0.3em] text-gray-500 uppercase">Newsletter</span>
            <div className="h-px bg-black/20 w-16" />
          </div>

          <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] text-black mb-6">
            JOIN THE
            <br />
            <span className="text-outline-black">INNER CIRCLE</span>
          </h2>

          <p className="text-xl text-gray-600 mb-12 max-w-lg mx-auto">
            Be the first to know about new bowls, exclusive classes, and special offers.
          </p>

          {status === 'success' ? (
            <div className="bg-black text-white py-6 px-8 inline-block">
              <p className="text-lg font-bold tracking-wide">Welcome to the family.</p>
              <p className="text-white/60 text-sm mt-1">Check your inbox for confirmation.</p>
            </div>
          ) : status === 'error' ? (
            <div className="bg-red-600 text-white py-6 px-8 inline-block">
              <p className="text-lg font-bold tracking-wide">Oops! Something went wrong.</p>
              <p className="text-white/60 text-sm mt-1">Please try again.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-nowrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-3 sm:px-6 py-3 sm:py-4 bg-white border-2 border-r-0 border-black focus:outline-none text-black placeholder-gray-400 text-sm sm:text-base"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-4 sm:px-8 py-3 sm:py-4 bg-black text-white font-bold text-xs sm:text-sm tracking-[0.1em] uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {status === 'loading' ? '...' : 'Join'}
                </button>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                No spam. Unsubscribe anytime. Privacy matters.
              </p>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .text-outline-black {
          -webkit-text-stroke: 1.5px black;
          color: transparent;
        }
      `}</style>
    </section>
  );
};
