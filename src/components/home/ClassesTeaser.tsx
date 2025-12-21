'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ClassesTeaser: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image reveal
      gsap.fromTo(
        '.classes-image-wrapper',
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: '.classes-image-wrapper',
            start: 'top 70%',
          },
        }
      );

      // Content reveal
      gsap.fromTo(
        '.classes-content > *',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.classes-content',
            start: 'top 75%',
          },
        }
      );

      // Stats counter
      document.querySelectorAll('.stat-number').forEach((el) => {
        const target = parseInt(el.getAttribute('data-target') || '0');
        gsap.fromTo(
          { val: 0 },
          { val: target },
          {
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
            onUpdate: function() {
              (el as HTMLElement).textContent = Math.floor(this.targets()[0].val).toString();
            }
          }
        );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left - Image */}
        <div className="classes-image-wrapper relative bg-black min-h-[50vh] lg:min-h-screen">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Decorative elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[80%] h-[80%] border border-white/10" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[60%] h-[60%] border border-white/10" />
            </div>

            {/* Center content */}
            <div className="relative text-center text-white z-10">
              <span className="text-[15vw] lg:text-[8vw] font-black block leading-none tracking-[-0.04em]">
                学ぶ
              </span>
              <span className="text-sm tracking-[0.3em] uppercase text-white/50 mt-4 block">
                Learn
              </span>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-white/20" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-white/20" />
        </div>

        {/* Right - Content */}
        <div className="bg-gray-50 flex items-center py-20 lg:py-0">
          <div className="classes-content px-8 lg:px-16 max-w-xl">
            <div className="flex items-center gap-6 mb-8">
              <div className="h-px bg-black/30 w-16" />
              <span className="text-sm tracking-[0.3em] text-gray-500 uppercase">Workshops</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] text-black mb-6 leading-[0.9]">
              MASTER
              <br />
              THE
              <br />
              <span className="text-outline-black">CRAFT</span>
            </h2>

            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Join our hands-on workshops and learn the ancient art of
              Hakata-style ramen. From broth basics to noodle mastery.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mb-12">
              {[
                { num: 3, label: 'Class Types' },
                { num: 8, label: 'Max Students' },
                { num: 500, label: 'Trained' },
              ].map((stat, i) => (
                <div key={i}>
                  <div
                    className="stat-number text-4xl font-black text-black"
                    data-target={stat.num}
                  >
                    0
                  </div>
                  <div className="text-xs tracking-[0.1em] text-gray-500 uppercase mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/classes"
              className="group inline-flex items-center gap-4"
            >
              <span className="relative px-8 py-4 bg-black text-white text-sm tracking-[0.2em] uppercase font-bold overflow-hidden">
                <span className="relative z-10">View Classes</span>
                <span className="absolute inset-0 bg-gray-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </span>
              <span className="w-12 h-12 border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </div>
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
