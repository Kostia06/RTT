'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const workshopImages = [
  {
    src: '/images/230401-RTT-NoodleMaking-005.JPG',
    alt: 'Hands-on noodle making technique',
  },
  {
    src: '/images/230401-RTT-NoodleMaking-082.JPG',
    alt: 'Learning traditional ramen methods',
  },
  {
    src: '/images/230401-RTT-NoodleMaking-092.JPG',
    alt: 'Workshop students crafting noodles',
  },
  {
    src: '/images/230401-RTT-NoodleMaking-099.JPG',
    alt: 'Mastering the noodle pulling technique',
  },
];

export const WorkshopGallery: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.gallery-title-char',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.02,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.gallery-title',
            start: 'top 80%',
          },
        }
      );

      // Gallery items stagger
      gsap.fromTo(
        '.gallery-item',
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.gallery-grid',
            start: 'top 75%',
          },
        }
      );

      // Individual image parallax
      document.querySelectorAll('.gallery-item').forEach((item) => {
        const image = item.querySelector('.gallery-image');
        if (image) {
          gsap.to(image, {
            y: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const title = 'BEHIND THE SCENES';

  return (
    <section ref={sectionRef} className="py-32 bg-white text-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="h-px bg-black/20 w-16" />
            <span className="text-sm tracking-[0.3em] text-gray-500 uppercase">Our Workshops</span>
            <div className="h-px bg-black/20 w-16" />
          </div>

          <h2 className="gallery-title text-5xl md:text-7xl font-black tracking-[-0.04em] text-black mb-6 overflow-hidden">
            {title.split('').map((char, i) => (
              <span key={i} className="gallery-title-char inline-block">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the art of traditional ramen making. Watch our students
            transform from curious beginners to confident noodle masters.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workshopImages.map((image, index) => (
            <div
              key={index}
              className="gallery-item group relative aspect-[3/4] bg-gray-100 overflow-hidden cursor-pointer"
            >
              <div className="gallery-image absolute inset-0">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />

              {/* Number */}
              <div className="absolute bottom-4 left-4 text-white/40 group-hover:text-white/80 text-5xl font-black transition-colors duration-300">
                {String(index + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/workshops"
            className="inline-flex items-center gap-4 px-8 py-4 bg-black text-white text-sm tracking-[0.2em] uppercase font-bold hover:bg-gray-900 transition-colors group"
          >
            <span>Join A Workshop</span>
            <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};
