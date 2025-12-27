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
  const [addingProduct, setAddingProduct] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const { state, addToCart, updateQuantity, removeFromCart } = useCart();

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
      // Hero character animation
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

      // Hero subtitle
      gsap.fromTo(
        '.hero-subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.8 }
      );

      // Parallax Kanji
      gsap.to('.hero-kanji', {
        y: 150,
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

  const handleAddToCart = (e: React.MouseEvent, product: IProduct) => {
    e.preventDefault();
    e.stopPropagation();

    setAddingProduct(product.id);
    addToCart(product);

    setTimeout(() => {
      setAddingProduct(null);
    }, 500);
  };

  const handleUpdateQuantity = (e: React.MouseEvent, productId: string, newQuantity: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const getProductQuantity = (productId: string): number => {
    if (!state || !state.items) return 0;
    const item = state.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const title = 'THE SHOP';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating Kanji with Parallax */}
        <div className="hero-kanji absolute top-10 right-[5%] text-[35vw] font-black text-white/[0.02] pointer-events-none select-none">
          品
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-48 pt-56">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-12 text-sm text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Shop</span>
          </div>

          {/* Animated Title */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none mb-8">
            {title.split('').map((char, i) => (
              <span key={i} className="hero-char inline-block" style={{ perspective: '1000px' }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-xl md:text-2xl text-white/80 max-w-3xl leading-relaxed">
            Authentic ramen kits, premium ingredients, and merchandise. Everything you need to respect the technique at home.
          </p>

          {/* Scroll Indicator */}
          <div className="mt-16 flex items-center gap-4 text-sm text-white/60">
            <div className="w-px h-16 bg-white/20 animate-pulse" />
            <span className="uppercase tracking-wider">Scroll to explore</span>
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
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-bold text-black tracking-tight flex-1">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-0.5 flex-shrink-0">
                        <span className="text-lg font-black text-black">
                          ${product.price_regular.toFixed(0)}
                        </span>
                        <span className="text-xs text-gray-400">.{(product.price_regular % 1).toFixed(2).slice(2)}</span>
                      </div>
                    </div>
                    {product.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Add to Cart Controls */}
                    {(() => {
                      const quantity = getProductQuantity(product.id);
                      return quantity > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleUpdateQuantity(e, product.id, quantity - 1)}
                            className="w-8 h-8 bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center font-bold"
                          >
                            {quantity === 1 ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            ) : (
                              <span>−</span>
                            )}
                          </button>
                          <span className="px-4 py-2 bg-gray-100 text-black font-bold text-sm min-w-[60px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={(e) => handleUpdateQuantity(e, product.id, quantity + 1)}
                            className="w-8 h-8 bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className={`w-full py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                            addingProduct === product.id
                              ? 'bg-green-500 text-white'
                              : 'bg-black text-white hover:bg-gray-800'
                          }`}
                        >
                          {addingProduct === product.id ? 'Added!' : 'Add to Cart'}
                        </button>
                      );
                    })()}
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
