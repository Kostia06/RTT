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
  const filterBarRef = useRef<HTMLDivElement>(null);
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
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.02,
          ease: 'power3.out',
          delay: 0.2,
        }
      );

      gsap.fromTo(
        '.hero-subtitle',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.5 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (loading || products.length === 0 || !gridRef.current) return;

    const ctx = gsap.context(() => {
      // Simple stagger animation for product reveal
      gsap.fromTo(
        '.product-item',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
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
      {/* Hero Section - Compact */}
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden pt-20 sm:pt-24">
        <div className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-[-0.02em] mb-4">
              {title.split('').map((char, i) => (
                <span key={i} className="hero-char inline-block">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>

            <p className="hero-subtitle text-sm sm:text-base text-white/60 max-w-2xl">
              Authentic ramen kits, premium ingredients, and merchandise. Everything you need to respect the technique at home.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div ref={filterBarRef} className="sticky top-14 sm:top-16 z-20 bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5 gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`relative px-4 sm:px-5 py-2 text-[11px] sm:text-xs font-bold tracking-[0.12em] uppercase transition-all duration-200 whitespace-nowrap touch-manipulation flex-shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:text-black hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 flex-shrink-0 font-medium">
              <span>{products.length}</span>
              <span className="text-gray-300">/</span>
              <span>Items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-2 h-2 bg-black rounded-full animate-ping" />
              <p className="mt-6 text-xs text-gray-400 tracking-[0.15em] uppercase">Loading</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 px-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-sm text-gray-500 mb-8">
                Try selecting a different category.
              </p>
              <button
                onClick={() => handleCategoryChange('')}
                className="px-6 py-3 bg-black text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors"
              >
                View All
              </button>
            </div>
          ) : (
            <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="product-item group block"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-4">
                    <div className="product-image-container absolute inset-0">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <span className="text-6xl text-gray-200">麺</span>
                        </div>
                      )}
                    </div>

                    {/* Subtle overlay on hover */}
                    <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                      hoveredProduct === product.id ? 'opacity-5' : 'opacity-0'
                    }`} />

                    {/* Featured tag - only if featured */}
                    {product.is_featured && (
                      <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-[10px] tracking-[0.2em] uppercase">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-sm font-bold text-black tracking-tight">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-0.5 flex-shrink-0">
                        <span className="text-lg font-black text-black">
                          ${product.price.toFixed(0)}
                        </span>
                        <span className="text-xs text-gray-400">.{(product.price % 1).toFixed(2).slice(2)}</span>
                      </div>
                    </div>
                    {product.short_description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {product.short_description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Results summary */}
          {!loading && products.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-xs text-gray-500">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                  {selectedCategory && <> in {selectedCategory.replace('-', ' ')}</>}
                </p>

                <Link
                  href="/classes"
                  className="inline-flex items-center gap-3 text-xs tracking-[0.15em] uppercase font-medium text-gray-600 hover:text-black transition-colors group"
                >
                  <span>Learn to make your own</span>
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
