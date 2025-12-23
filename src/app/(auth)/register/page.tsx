'use client';

import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function RegisterPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(
        '.hero-title-char',
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.03,
          ease: 'power3.out',
          delay: 0.2,
        }
      );

      gsap.fromTo(
        '.hero-subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.6 }
      );

      gsap.fromTo(
        '.hero-back-link',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, delay: 0.1 }
      );

      gsap.fromTo(
        '.feature-item',
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          delay: 0.8,
          ease: 'power3.out',
        }
      );

      // Form animations
      gsap.fromTo(
        formRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.4, ease: 'power3.out' }
      );

      // Bowl image parallax
      gsap.to('.auth-bowl-image', {
        y: -30,
        rotation: -3,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const title = 'JOIN US';

  const features = [
    { icon: '🛒', text: 'Exclusive product access' },
    { icon: '🎓', text: 'Early class registration' },
    { icon: '📦', text: 'Order tracking & history' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Hero Section */}
      <div ref={heroRef} className="lg:w-1/2 bg-black text-white pt-20 sm:pt-24 pb-12 sm:pb-16 lg:pb-0 relative overflow-hidden flex items-center">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative bowl image */}
        <div className="auth-bowl-image absolute top-[15%] right-[-10%] w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] opacity-10 pointer-events-none">
          <Image
            src="/images/eat.png"
            alt=""
            fill
            className="object-contain"
            sizes="400px"
          />
        </div>

        <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 lg:px-12 w-full">
          <Link href="/" className="hero-back-link inline-block mb-12 text-white/50 hover:text-white transition-colors text-xs tracking-[0.2em] uppercase group">
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </span>
          </Link>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] mb-6 leading-[0.9]">
            {title.split('').map((char, i) => (
              <span key={i} className="hero-title-char inline-block">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>

          <div className="hero-subtitle space-y-6">
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed">
              Create an account to start your journey into authentic ramen making and join our community.
            </p>

            <div className="pt-6 border-t border-white/10 space-y-4">
              {features.map((feature, i) => (
                <div key={i} className="feature-item flex items-center gap-3 text-white/60">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-white/10" />
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="lg:w-1/2 bg-white flex items-center justify-center py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-12">
        <div ref={formRef} className="max-w-md w-full">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-black/10 flex-1" />
              <span className="text-xs tracking-[0.3em] text-gray-400 uppercase">Sign Up</span>
              <div className="h-px bg-black/10 flex-1" />
            </div>
            <h2 className="text-2xl font-black text-black mb-2">Create Your Account</h2>
            <p className="text-sm text-gray-600">Join thousands of ramen enthusiasts</p>
          </div>

          <RegisterForm />

          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 1024px) {
          .lg\:w-1\/2 {
            min-height: 100vh;
          }
        }
      `}</style>
    </div>
  );
}
