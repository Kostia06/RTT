'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IProduct } from '@/types';
import { useCart } from '@/components/providers/CartProvider';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { id: '', label: 'All', kanji: '全' },
  { id: 'ramen-bowl', label: 'Bowls', kanji: '麺' },
  { id: 'retail-product', label: 'Retail', kanji: '品' },
  { id: 'merchandise', label: 'Merch', kanji: '物' },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const categoryFromUrl = searchParams.get('category') || '';

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = selectedCategory
          ? `/api/products?category=${selectedCategory}`
          : '/api/products';
        const response = await fetch(url);
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        '.hero-char',
        { y: 120, opacity: 0, rotateX: -60 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1,
          stagger: 0.03,
          ease: 'power3.out',
          delay: 0.2,
        }
      );

      gsap.fromTo(
        '.hero-subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.6 }
      );

      // Parallax kanji
      gsap.to('.hero-kanji', {
        y: 100,
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

  useEffect(() => {
    if (loading || products.length === 0 || !gridRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.product-item',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
          },
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, [loading, products]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const url = category ? `/shop?category=${category}` : '/shop';
    window.history.pushState({}, '', url);
  };

  const title = 'THE SHOP';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating Kanji */}
        <div className="hero-kanji hidden sm:block absolute top-20 right-[10%] text-[30vw] font-black text-white/[0.02] leading-none pointer-events-none select-none">
          店
        </div>

        <div className="relative py-24 sm:py-32 md:py-40 pt-32 sm:pt-40 md:pt-48">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-12">
              <Link href="/" className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors touch-manipulation">
                Home
              </Link>
              <span className="text-white/20">/</span>
              <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-white/70">Shop</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-[-0.04em] overflow-hidden" style={{ perspective: '1000px' }}>
              {title.split('').map((char, i) => (
                <span
                  key={i}
                  className="hero-char inline-block"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>

            <p className="hero-subtitle mt-6 sm:mt-8 text-base sm:text-xl md:text-2xl text-white/50 max-w-xl leading-relaxed">
              Authentic ramen kits, premium ingredients, and merchandise.
              Everything you need to respect the technique at home.
            </p>

            {/* Decorative line */}
            <div className="mt-12 flex items-center gap-4">
              <div className="w-24 h-px bg-white/20" />
              <span className="text-xs tracking-[0.3em] uppercase text-white/30">Est. 2024</span>
            </div>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Category Filter */}
      <div className="sticky top-16 sm:top-20 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6 gap-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`relative px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium tracking-[0.1em] uppercase transition-all duration-300 group whitespace-nowrap touch-manipulation flex-shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-black text-white'
                      : 'text-gray-500 hover:text-black active:text-black'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className={`text-base sm:text-lg transition-opacity ${selectedCategory === cat.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`}>
                      {cat.kanji}
                    </span>
                    {cat.label}
                  </span>
                  {selectedCategory !== cat.id && (
                    <span className="absolute inset-0 border border-transparent group-hover:border-black/10 transition-colors" />
                  )}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4 text-sm text-gray-400 flex-shrink-0">
              <span>{products.length} items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 sm:py-32">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 animate-spin-slow">
                <Image
                  src="/images/logo.png"
                  alt="Loading"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-400 tracking-[0.1em] uppercase">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 sm:py-32 px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 border-2 border-gray-200 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl text-gray-300">空</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 sm:mb-3">No products found</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
                Try selecting a different category or check back later.
              </p>
              <button
                onClick={() => handleCategoryChange('')}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-black text-white text-sm font-bold tracking-[0.1em] uppercase hover:bg-gray-800 active:bg-gray-900 transition-colors touch-manipulation"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="product-item group relative bg-white"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <Link href={`/shop/${product.slug}`} className="block touch-manipulation active:opacity-80 transition-opacity">
                    {/* Image container */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105 group-active:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <span className="text-5xl sm:text-6xl text-gray-200">麺</span>
                        </div>
                      )}

                      {/* Overlay on hover - hidden on mobile */}
                      <div className={`hidden sm:flex absolute inset-0 bg-black/40 items-center justify-center transition-opacity duration-300 ${
                        hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <span className="px-6 sm:px-8 py-2.5 sm:py-3 border border-white text-white text-xs sm:text-sm tracking-[0.2em] uppercase">
                          View Details
                        </span>
                      </div>

                      {/* Index number */}
                      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                        <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white/20">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Featured badge */}
                      {product.is_featured && (
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black text-white px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase">
                          Featured
                        </div>
                      )}

                      {/* Category badge */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm text-black px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase">
                        {product.category.replace('-', ' ')}
                      </div>
                    </div>

                    {/* Product info */}
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-black group-hover:underline underline-offset-4">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-1">
                            {product.short_description}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xl sm:text-2xl font-black text-black">
                            ${product.price.toFixed(0)}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-400">.{(product.price % 1).toFixed(2).slice(2)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Quick add button - desktop only */}
                  <div className={`hidden sm:block absolute bottom-6 right-6 transition-all duration-300 ${
                    hoveredProduct === product.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.images?.[0]?.url,
                          quantity: 1,
                        });
                      }}
                      className="w-12 h-12 bg-black text-white flex items-center justify-center hover:bg-gray-800 active:bg-gray-900 transition-colors touch-manipulation"
                      aria-label="Add to cart"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results summary */}
          {!loading && products.length > 0 && (
            <div className="mt-10 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
                <p className="text-xs sm:text-sm text-gray-500 text-center md:text-left">
                  Showing <span className="font-bold text-black">{products.length}</span> product{products.length !== 1 ? 's' : ''}
                  {selectedCategory && (
                    <> in <span className="font-bold text-black">{selectedCategory.replace('-', ' ')}</span></>
                  )}
                </p>

                <Link
                  href="/classes"
                  className="inline-flex items-center gap-2 sm:gap-3 text-xs sm:text-sm tracking-[0.1em] uppercase font-medium text-gray-600 hover:text-black active:text-black transition-colors group touch-manipulation"
                >
                  <span>Or learn to make your own</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 animate-spin-slow">
          <Image
            src="/images/logo.png"
            alt="Loading"
            fill
            className="object-contain"
          />
        </div>
        <p className="mt-6 text-sm text-gray-400 tracking-[0.1em] uppercase">Loading...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
