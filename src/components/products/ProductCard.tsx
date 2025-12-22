'use client';

import Link from 'next/link';
import Image from 'next/image';
import { IProduct } from '@/types';
import { Card } from '@/components/ui';

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  return (
    <Link href={`/shop/${product.slug}`} className="group block touch-manipulation active:opacity-80 transition-opacity">
      <Card hover padding="none" className="overflow-hidden border-0 shadow-none">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105 group-active:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          )}
          {product.is_featured && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black text-white px-2 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              Featured
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-600 text-white px-2 py-1 text-[10px] sm:text-xs font-bold">
              -{discountPercentage}%
            </div>
          )}
          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 group-active:bg-black/10 transition-colors duration-300" />
        </div>

        <div className="pt-3 sm:pt-4 px-1 sm:px-0">
          <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">
            {product.category.replace('-', ' ')}
          </div>
          <h3 className="font-bold text-sm sm:text-base text-black group-hover:underline line-clamp-2 mb-1">
            {product.name}
          </h3>

          {product.short_description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">
              {product.short_description}
            </p>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-black">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                ${product.compare_at_price!.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
