'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface WorkshopGalleryState {
  currentSlide: number;
}

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-play carousel
  useEffect(() => {
    const startAutoplay = () => {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % workshopImages.length);
      }, 5000);
    };

    const stopAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };

    // Intersection Observer to start/stop autoplay
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAutoplay();
          } else {
            stopAutoplay();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      stopAutoplay();
      observer.disconnect();
    };
  }, []);

  // Scroll to current slide
  useEffect(() => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const itemWidth = scrollWidth / workshopImages.length;
      carouselRef.current.scrollTo({
        left: itemWidth * currentSlide,
        behavior: 'smooth',
      });
    }
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % workshopImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + workshopImages.length) % workshopImages.length);
  };

  const title = 'BEHIND THE SCENES';

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center justify-center bg-white text-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-16 md:py-20 lg:py-24">
        {/* Header */}
        <div className="mb-20 text-center">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="h-px bg-black/20 w-16" />
            <span className="text-sm tracking-[0.3em] text-gray-500 uppercase">Our Workshops</span>
            <div className="h-px bg-black/20 w-16" />
          </div>

          <h2 className="gallery-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] text-black mb-6 overflow-visible py-2 break-words">
            {title.split('').map((char, i) => (
              <span key={i} className="gallery-title-char inline-block will-change-transform">
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Experience the art of traditional ramen making. Watch our students
            transform from curious beginners to confident noodle masters.
          </p>
        </div>

        {/* Mobile carousel */}
        <div className="lg:hidden relative">
          <div
            ref={carouselRef}
            className="overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide pb-4"
          >
            <div className="flex gap-4 gallery-grid pl-[12.5vw] pr-[12.5vw] sm:pl-[20vw] sm:pr-[20vw] md:pl-[27.5vw] md:pr-[27.5vw]">
            {workshopImages.map((image, index) => (
              <div
                key={index}
                className="gallery-item group relative aspect-[3/4] bg-gray-100 overflow-hidden cursor-pointer w-[75vw] sm:w-[60vw] md:w-[45vw] snap-center flex-shrink-0"
              >
                <div className="gallery-image absolute inset-0">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="75vw"
                  />
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />

                <div className="absolute bottom-4 left-4 text-white/40 group-hover:text-white/80 text-5xl font-black transition-colors duration-300">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Navigation Buttons - only show if more than 1 image */}
          {workshopImages.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 text-white flex items-center justify-center hover:bg-black transition-colors z-10"
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 text-white flex items-center justify-center hover:bg-black transition-colors z-10"
                aria-label="Next slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Scroll indicator dots */}
              <div className="mt-6 flex justify-center gap-2">
                {workshopImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide ? 'bg-black w-8' : 'bg-black/20'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Desktop grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-4 gallery-grid">
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
