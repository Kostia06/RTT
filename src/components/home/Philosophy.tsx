'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Philosophy: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Horizontal scroll effect for the large text
      gsap.fromTo(
        '.horizontal-text',
        { x: '100%' },
        {
          x: '-50%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      // Bowl image parallax with rotation
      gsap.to('.philosophy-bowl-image', {
        y: -80,
        rotation: 8,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Counter animation with easing
      const counterTrigger = ScrollTrigger.create({
        trigger: numberRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo(
            { val: 0 },
            { val: 18 },
            {
              duration: 2.5,
              ease: 'power2.out',
              onUpdate: function() {
                if (numberRef.current) {
                  numberRef.current.textContent = Math.floor(this.targets()[0].val).toString();
                }
              }
            }
          );
        },
        once: true
      });

      // Section header animation
      gsap.fromTo(
        '.philosophy-header',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.philosophy-header',
            start: 'top 85%',
          },
        }
      );

      // Content reveal with stagger
      gsap.fromTo(
        '.philosophy-content > *',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.philosophy-content',
            start: 'top 75%',
          },
        }
      );

      // Steps reveal with slide and fade
      gsap.fromTo(
        '.philosophy-step',
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.philosophy-steps',
            start: 'top 75%',
          },
        }
      );

      // Animated decorative lines
      gsap.fromTo(
        '.philosophy-line',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.philosophy-content',
            start: 'top 80%',
          },
        }
      );

      // Floating particles
      gsap.to('.philosophy-particle', {
        y: 'random(-30, 30)',
        x: 'random(-15, 15)',
        rotation: 'random(-180, 180)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { each: 0.3, from: 'random' }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Massive scrolling text */}
      <div className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none">
        <span className="horizontal-text text-[15vw] sm:text-[18vw] md:text-[20vw] font-black text-white/[0.02] tracking-[-0.04em]">
          PATIENCE • TECHNIQUE • TRADITION • PATIENCE • TECHNIQUE • TRADITION •
        </span>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="philosophy-particle absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
          />
        ))}
      </div>

      {/* Floating bowl image */}
      <div className="philosophy-bowl-image absolute top-[10%] right-[5%] w-[250px] h-[250px] md:w-[350px] md:h-[350px] lg:w-[450px] lg:h-[450px] opacity-15 pointer-events-none hidden md:block">
        <Image
          src="/images/Rayo.jpg"
          alt="Authentic ramen bowl"
          fill
          className="object-contain"
          sizes="450px"
        />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative py-12 sm:py-16 md:py-20 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-center">
          {/* Left - Number & Statement */}
          <div className="philosophy-content">
            <div className="philosophy-header flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="philosophy-line h-px bg-white/30 w-10 sm:w-16 origin-left" />
              <span className="text-[10px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.3em] text-gray-400 uppercase">Our Philosophy</span>
            </div>

            <div className="mb-8 sm:mb-12">
              <div className="flex items-baseline gap-2 sm:gap-4">
                <span ref={numberRef} className="text-[80px] sm:text-[100px] md:text-[140px] lg:text-[180px] font-black leading-none text-white">
                  0
                </span>
                <div className="text-gray-400">
                  <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light">hours</span>
                  <br />
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg">of slow-simmering</span>
                </div>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-[-0.02em] mb-6 sm:mb-8 leading-tight">
              PATIENCE IS
              <br />
              <span className="text-outline-white">THE SECRET</span>
              <br />
              INGREDIENT
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg">
              There are no shortcuts to greatness. Our tonkotsu broth is a
              testament to the Hakata tradition—a labor of love that cannot
              be rushed.
            </p>
          </div>

          {/* Right - Steps */}
          <div className="philosophy-steps space-y-0">
            {[
              {
                num: '01',
                title: 'The Bones',
                desc: 'Premium pork bones sourced from local farms. Quality begins at the source.'
              },
              {
                num: '02',
                title: 'The Simmer',
                desc: 'A rolling boil for 18 hours. The collagen breaks down into liquid silk.'
              },
              {
                num: '03',
                title: 'The Noodles',
                desc: 'Hand-pulled daily. The perfect chew, the right thickness for our broth.'
              },
              {
                num: '04',
                title: 'The Bowl',
                desc: 'Every element in harmony. Chashu, egg, toppings—all prepared with care.'
              }
            ].map((step, i) => (
              <div
                key={i}
                className="philosophy-step group border-t border-white/20 py-5 sm:py-6 md:py-8 hover:bg-white/5 transition-colors px-3 sm:px-4 md:px-6 -mx-3 sm:-mx-4 md:-mx-6"
              >
                <div className="flex items-start gap-4 sm:gap-6 md:gap-8">
                  <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-mono mt-0.5 sm:mt-1">{step.num}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 group-hover:translate-x-2 transition-transform text-white">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-8 h-8 md:w-10 md:h-10 border border-white/10 group-hover:border-white/30 transition-colors flex-shrink-0">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .text-outline-white {
          -webkit-text-stroke: 1px white;
          color: transparent;
        }
        @media (min-width: 640px) {
          .text-outline-white {
            -webkit-text-stroke: 1.5px white;
          }
        }
      `}</style>
    </section>
  );
};
