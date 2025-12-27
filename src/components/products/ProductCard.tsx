'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IProduct } from '@/types';
import { Card } from '@/components/ui';
import { useCart } from '@/contexts/CartContext';

gsap.registerPlugin(ScrollTrigger);

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const hasDiscount = product.price_bulk && product.price_regular > product.price_bulk;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price_regular - product.price_bulk!) / product.price_regular) * 100)
    : 0;

  // 3D tilt effect with GSAP
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltRef.current) return;

    const rect = tiltRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width - 0.5) * 2; // -1 to 1
    const yPct = (mouseY / height - 0.5) * 2; // -1 to 1

    const rotateY = xPct * 7.5; // -7.5 to 7.5
    const rotateX = -yPct * 7.5; // -7.5 to 7.5

    gsap.to(tiltRef.current, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (!tiltRef.current) return;

    gsap.to(tiltRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    addItem(product as any, 1);

    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  useEffect(() => {
    if (!cardRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax effect on scroll
      gsap.to(imageRef.current, {
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Fade in and lift up on scroll
      gsap.fromTo(
        cardRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <Link href={`/shop/${product.slug}`} className="group block touch-manipulation active:opacity-80 transition-opacity">
      <Card hover padding="none" className="overflow-hidden border-0 shadow-none">
        <div
          ref={tiltRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          <div ref={cardRef} className="relative aspect-square bg-gray-100 overflow-hidden" style={{ transform: 'translateZ(50px)' }}>
            <div ref={imageRef} className="absolute inset-0">
              {primaryImage && (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 group-active:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              )}
            </div>
            {product.is_featured && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black text-white px-2 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider z-10">
                Featured
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-600 text-white px-2 py-1 text-[10px] sm:text-xs font-bold z-10">
                -{discountPercentage}%
              </div>
            )}
            {/* Quick view overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 group-active:bg-black/10 transition-colors duration-300 z-10" />
          </div>

          <div className="pt-3 sm:pt-4 px-1 sm:px-0" style={{ transform: 'translateZ(75px)' }}>
          <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">
            {product.category.replace('-', ' ')}
          </div>
          <h3 className="font-bold text-sm sm:text-base text-black group-hover:underline line-clamp-2 mb-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold text-black">
                ${(hasDiscount ? product.price_bulk! : product.price_regular).toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-gray-400 line-through">
                  ${product.price_regular.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`
                flex items-center justify-center gap-2 px-3 py-2
                text-xs font-bold uppercase tracking-wider
                transition-all duration-300
                ${
                  isAdding
                    ? 'bg-green-500 text-white'
                    : 'bg-black text-white hover:bg-gray-800'
                }
              `}
            >
              {isAdding ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </>
              )}
            </button>
          </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
