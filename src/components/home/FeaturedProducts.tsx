'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IProduct } from '@/types';

gsap.registerPlugin(ScrollTrigger);

export const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?featured=true&limit=4');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (loading || products.length === 0) return;

    const startAutoplay = () => {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % products.length);
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
  }, [loading, products]);

  // Scroll to current slide
  useEffect(() => {
    if (carouselRef.current && products.length > 0) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const itemWidth = scrollWidth / products.length;
      carouselRef.current.scrollTo({
        left: itemWidth * currentSlide,
        behavior: 'smooth',
      });
    }
  }, [currentSlide, products]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  useEffect(() => {
    if (loading || products.length === 0) return;

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        '.section-heading-line',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.section-heading-line',
            start: 'top 80%',
          },
        }
      );

      gsap.fromTo(
        '.section-title-char',
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.02,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.section-title',
            start: 'top 80%',
          },
        }
      );

      // Product cards stagger
      gsap.fromTo(
        '.product-card',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.products-grid',
            start: 'top 75%',
          },
        }
      );

      // Parallax and hover animations
      document.querySelectorAll('.product-card').forEach((card, index) => {
        const image = card.querySelector('.product-image');
        const overlay = card.querySelector('.product-overlay');
        const numberElement = card.querySelector('.product-number');

        // Image parallax effect
        if (image) {
          gsap.to(image, {
            y: -25,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          });
        }

        // Number rotation on scroll
        if (numberElement) {
          gsap.fromTo(
            numberElement,
            { rotation: -20, opacity: 0.2 },
            {
              rotation: 0,
              opacity: 0.3,
              scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'top 40%',
                scrub: 1,
              },
            }
          );
        }

        // Stagger scale effect
        gsap.fromTo(
          card,
          { scale: 0.95 },
          {
            scale: 1,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'top 60%',
              scrub: 1,
            },
          }
        );

        // Hover interactions
        card.addEventListener('mouseenter', () => {
          gsap.to(image, { scale: 1.05, duration: 0.6, ease: 'power2.out' });
          gsap.to(overlay, { opacity: 1, duration: 0.3 });
          gsap.to(card, { y: -8, duration: 0.4, ease: 'power2.out' });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(image, { scale: 1, duration: 0.6, ease: 'power2.out' });
          gsap.to(overlay, { opacity: 0, duration: 0.3 });
          gsap.to(card, { y: 0, duration: 0.4, ease: 'power2.out' });
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [loading, products]);

  if (loading) {
    return (
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  const title = 'FEATURED';

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50 -skew-x-12 origin-top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full py-12 sm:py-16 md:py-20 lg:py-24">
        {/* Section header */}
        <div className="mb-20">
          <div className="flex items-center gap-8 mb-6">
            <div className="section-heading-line h-px bg-black flex-1 max-w-[100px] origin-left" />
            <span className="text-sm tracking-[0.3em] text-gray-500 uppercase">Selection</span>
          </div>

          <h2 className="section-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] text-black overflow-visible py-4 break-words">
            {title.split('').map((char, i) => (
              <span key={i} className="section-title-char inline-block will-change-transform">
                {char}
              </span>
            ))}
          </h2>

          <p className="mt-6 text-xl text-gray-500 max-w-xl">
            Each bowl represents years of refinement. Slow-simmered broths,
            hand-pulled noodles, carefully sourced toppings.
          </p>
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden relative">
          <div
            ref={carouselRef}
            className="overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide pb-4"
          >
            <div className="flex gap-6 products-grid pl-[7.5vw] pr-[7.5vw] sm:pl-[15vw] sm:pr-[15vw]">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="product-card group block w-[85vw] sm:w-[70vw] snap-center flex-shrink-0"
                >
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-6">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt}
                      fill
                      className="product-image object-cover"
                      sizes="85vw"
                    />
                  )}

                  <div className="product-overlay absolute inset-0 bg-black/40 opacity-0 flex items-center justify-center">
                    <span className="text-white text-sm tracking-[0.2em] uppercase border border-white px-6 py-3">
                      View
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 text-white/30 text-6xl font-black product-number">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {product.is_featured && (
                    <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-[10px] tracking-[0.2em] uppercase">
                      Featured
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-xs tracking-[0.2em] text-gray-400 uppercase">
                    {product.category.replace('-', ' ')}
                  </span>
                  <h3 className="text-lg font-bold text-black group-hover:underline underline-offset-4">
                    {product.name}
                  </h3>
                  <p className="text-2xl font-black text-black">
                    ${product.price_regular.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
            </div>
          </div>

          {/* Navigation Buttons - only show if more than 1 product */}
          {products.length > 1 && (
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
                {products.map((_, index) => (
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
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 products-grid">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="product-card group block"
            >
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-6">
                {product.images?.[0] && (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt}
                    fill
                    className="product-image object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                )}

                {/* Overlay */}
                <div className="product-overlay absolute inset-0 bg-black/40 opacity-0 flex items-center justify-center">
                  <span className="text-white text-sm tracking-[0.2em] uppercase border border-white px-6 py-3">
                    View
                  </span>
                </div>

                {/* Index number */}
                <div className="absolute bottom-4 left-4 text-white/30 text-6xl font-black product-number">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Featured badge */}
                {product.is_featured && (
                  <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-[10px] tracking-[0.2em] uppercase">
                    Featured
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-xs tracking-[0.2em] text-gray-400 uppercase">
                  {product.category.replace('-', ' ')}
                </span>
                <h3 className="text-lg font-bold text-black group-hover:underline underline-offset-4">
                  {product.name}
                </h3>
                <p className="text-2xl font-black text-black">
                  ${product.price_regular.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-16 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-4 text-sm tracking-[0.2em] uppercase font-bold group"
          >
            <span className="relative">
              View All Products
              <span className="absolute bottom-0 left-0 w-0 h-px bg-black group-hover:w-full transition-all duration-300" />
            </span>
            <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};
