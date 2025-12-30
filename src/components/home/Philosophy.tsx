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

      // Bowl image parallax
      gsap.to('.philosophy-bowl-image', {
        y: -80,
        rotation: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Counter animation
      gsap.fromTo(
        { val: 0 },
        { val: 18 },
        {
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: numberRef.current,
            start: 'top 80%',
          },
          onUpdate: function() {
            if (numberRef.current) {
              numberRef.current.textContent = Math.floor(this.targets()[0].val).toString();
            }
          }
        }
      );

      // Content reveal
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

      // Steps reveal
      gsap.fromTo(
        '.philosophy-step',
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.philosophy-steps',
            start: 'top 75%',
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Massive scrolling text */}
      <div className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none">
        <span className="horizontal-text text-[20vw] font-black text-white/[0.02] tracking-[-0.04em]">
          PATIENCE • TECHNIQUE • TRADITION • PATIENCE • TECHNIQUE • TRADITION •
        </span>
      </div>

      {/* Floating bowl image */}
      <div className="philosophy-bowl-image absolute top-[10%] right-[5%] w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] opacity-20 pointer-events-none hidden lg:block">
        <Image
          src="/images/Rayo.jpg"
          alt="Authentic ramen bowl"
          fill
          className="object-contain"
          sizes="500px"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left - Number & Statement */}
          <div className="philosophy-content">
            <div className="flex items-center gap-6 mb-8">
              <div className="h-px bg-white/30 w-16" />
              <span className="text-sm tracking-[0.3em] text-gray-400 uppercase">Our Philosophy</span>
            </div>

            <div className="mb-12">
              <div className="flex items-baseline gap-4">
                <span ref={numberRef} className="text-[12rem] md:text-[16rem] font-black leading-none text-white">
                  0
                </span>
                <div className="text-gray-400">
                  <span className="text-4xl font-light">hours</span>
                  <br />
                  <span className="text-lg">of slow-simmering</span>
                </div>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.02em] mb-8 leading-tight">
              PATIENCE IS
              <br />
              <span className="text-outline-white">THE SECRET</span>
              <br />
              INGREDIENT
            </h2>

            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
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
                className="philosophy-step group border-t border-white/20 py-8 hover:bg-white/5 transition-colors px-6 -mx-6"
              >
                <div className="flex items-start gap-8">
                  <span className="text-sm text-gray-500 font-mono mt-1">{step.num}</span>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:translate-x-2 transition-transform text-white">
                      {step.title}
                    </h3>
                    <p className="text-gray-400">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .text-outline-white {
          -webkit-text-stroke: 1.5px white;
          color: transparent;
        }
      `}</style>
    </section>
  );
};
