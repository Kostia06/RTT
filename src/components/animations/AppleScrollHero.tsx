'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const AppleScrollHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section 1: Hero fade and scale
      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: '.apple-section-1',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          pin: true,
          pinSpacing: false,
        },
      });

      tl1
        .to('.apple-hero-text', {
          opacity: 0,
          scale: 0.8,
          y: -100,
          ease: 'power2.inOut',
        })
        .to(
          '.apple-hero-image',
          {
            scale: 1.5,
            opacity: 0,
            ease: 'power2.inOut',
          },
          0
        );

      // Section 2: Craft text reveal
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: '.apple-section-2',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          pin: true,
        },
      });

      tl2
        .fromTo(
          '.craft-text-1',
          { opacity: 0, y: 100 },
          { opacity: 1, y: 0, ease: 'power2.out' }
        )
        .to('.craft-text-1', {
          opacity: 0,
          y: -50,
          ease: 'power2.in',
        })
        .fromTo(
          '.craft-text-2',
          { opacity: 0, y: 100 },
          { opacity: 1, y: 0, ease: 'power2.out' },
          '-=0.3'
        )
        .to('.craft-text-2', {
          opacity: 0,
          y: -50,
          ease: 'power2.in',
        })
        .fromTo(
          '.craft-text-3',
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, ease: 'power2.out' },
          '-=0.3'
        );

      // Section 3: Bowl reveal with image
      const tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: '.apple-section-3',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          pin: true,
        },
      });

      tl3
        .fromTo(
          '.bowl-image',
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, ease: 'power2.out' }
        )
        .fromTo(
          '.bowl-text',
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, ease: 'power2.out' },
          '-=0.5'
        )
        .to('.bowl-image', {
          scale: 1.2,
          y: -100,
          opacity: 0.5,
          ease: 'power2.inOut',
        })
        .to(
          '.bowl-text',
          {
            opacity: 0,
            y: -100,
            ease: 'power2.inOut',
          },
          '-=0.8'
        );

      // Section 4: Stats reveal
      const tl4 = gsap.timeline({
        scrollTrigger: {
          trigger: '.apple-section-4',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          pin: true,
        },
      });

      tl4
        .fromTo(
          '.stat-item',
          { opacity: 0, y: 60, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.2,
            ease: 'power2.out',
          }
        )
        .to('.stat-item', {
          opacity: 0,
          scale: 0.95,
          ease: 'power2.in',
        });

      // Section 5: Final message
      gsap.timeline({
        scrollTrigger: {
          trigger: '.apple-section-5',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          pin: true,
        },
      })
        .fromTo(
          '.final-text',
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, ease: 'power2.out' }
        )
        .to('.final-text', {
          opacity: 1,
          scale: 1.05,
        });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Section 1: Hero */}
      <section className="apple-section-1 h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
        <div className="apple-hero-image absolute inset-0 opacity-30">
          <Image
            src="/images/eat.png"
            alt="Ramen"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="apple-hero-text text-center z-10 px-4">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 tracking-tight">
            RESPECT THE
            <br />
            TECHNIQUE
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 tracking-wide">
            Where tradition meets perfection
          </p>
        </div>
      </section>

      {/* Section 2: Craft Story */}
      <section className="apple-section-2 h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center px-4 max-w-4xl">
          <h2 className="craft-text-1 text-5xl md:text-7xl font-black text-black mb-8 opacity-0">
            Every bowl tells a story
          </h2>
          <h2 className="craft-text-2 text-5xl md:text-7xl font-black text-black mb-8 opacity-0">
            18 hours of dedication
          </h2>
          <h2 className="craft-text-3 text-6xl md:text-8xl font-black text-black opacity-0">
            One perfect moment
          </h2>
        </div>
      </section>

      {/* Section 3: Bowl Reveal */}
      <section className="apple-section-3 h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
        <div className="bowl-image absolute inset-0 flex items-center justify-center">
          <div className="relative w-[80vw] h-[80vh] max-w-[800px]">
            <Image
              src="/images/Rayo.jpg"
              alt="Perfect Ramen Bowl"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div className="bowl-text absolute bottom-20 left-0 right-0 text-center z-10 px-4">
          <p className="text-2xl md:text-4xl font-bold text-white tracking-wide">
            Crafted with passion. Served with pride.
          </p>
        </div>
      </section>

      {/* Section 4: Stats */}
      <section className="apple-section-4 h-screen w-full bg-white flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 px-4 max-w-6xl">
          <div className="stat-item text-center opacity-0">
            <div className="text-7xl md:text-8xl font-black text-black mb-4">18</div>
            <p className="text-xl md:text-2xl text-gray-600">Hours simmering</p>
          </div>
          <div className="stat-item text-center opacity-0">
            <div className="text-7xl md:text-8xl font-black text-black mb-4">100%</div>
            <p className="text-xl md:text-2xl text-gray-600">Authentic techniques</p>
          </div>
          <div className="stat-item text-center opacity-0">
            <div className="text-7xl md:text-8xl font-black text-black mb-4">∞</div>
            <p className="text-xl md:text-2xl text-gray-600">Passion in every bowl</p>
          </div>
        </div>
      </section>

      {/* Section 5: Final Message */}
      <section className="apple-section-5 h-screen w-full bg-black flex items-center justify-center">
        <div className="final-text text-center px-4 opacity-0">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight">
            Experience
            <br />
            <span className="text-outline-white">The Art</span>
            <br />
            Of Ramen
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 mt-8">
            Scroll down to explore
          </p>
        </div>
        <style jsx>{`
          .text-outline-white {
            -webkit-text-stroke: 2px white;
            color: transparent;
          }
        `}</style>
      </section>
    </div>
  );
};
