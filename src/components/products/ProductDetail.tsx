'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IProduct } from '@/types';
import { Button } from '@/components/ui';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProductDetailProps {
  product: IProduct;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const { isEmployee } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const images = product.images || [];
  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const currentImage = images[selectedImageIndex] || primaryImage;
  const hasDiscount = product.price_bulk && product.price_regular > product.price_bulk;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price_regular - product.price_bulk!) / product.price_regular) * 100)
    : 0;

  const currentPrice = selectedVariant?.price || product.price_regular;

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, selectedVariant || undefined, quantity);

    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {currentImage && (
            <Image
              src={currentImage.url}
              alt={currentImage.alt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
          {product.is_featured && (
            <div className="absolute top-4 left-4 bg-black text-white px-3 py-1.5 text-sm font-bold tracking-wider">
              FEATURED
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 text-sm font-bold">
              -{discountPercentage}%
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative w-20 h-20 flex-shrink-0 bg-gray-100 overflow-hidden border-2 transition-colors ${
                  selectedImageIndex === index ? 'border-black' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <div className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 font-medium tracking-wider mb-3">
            {product.category.replace('-', ' ').toUpperCase()}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-gray-600">{product.description}</p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-black">
            ${currentPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xl text-gray-400 line-through">
              ${product.price_regular.toFixed(2)}
            </span>
          )}
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 1 && (
          <div>
            <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wider">
              Select Option
            </label>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.sku}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-4 py-3 border-2 text-sm font-medium transition-all ${
                    selectedVariant?.sku === variant.sku
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-black'
                  }`}
                >
                  {variant.name}
                  {variant.price !== product.price_regular && (
                    <span className="block text-xs mt-0.5 opacity-70">
                      ${variant.price.toFixed(2)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wider">
            Quantity
          </label>
          <div className="flex items-center">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 border-2 border-gray-300 hover:border-black transition-colors flex items-center justify-center text-xl"
            >
              -
            </button>
            <span className="w-16 text-center font-bold text-lg">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 border-2 border-gray-300 hover:border-black transition-colors flex items-center justify-center text-xl"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <Button
          onClick={handleAddToCart}
          variant="primary"
          size="lg"
          className="w-full py-4 text-lg"
          disabled={isAdding}
        >
          {isAdding ? 'ADDED!' : `ADD TO CART - $${(currentPrice * quantity).toFixed(2)}`}
        </Button>

        {/* Edit Button for Employees */}
        {isEmployee && (
          <button
            onClick={() => router.push(`/manage-products/edit/${product.id}`)}
            className="w-full py-3 border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Product
          </button>
        )}

        {/* Description */}
        <div className="pt-8 border-t border-gray-200">
          <h3 className="text-sm font-bold text-black mb-3 uppercase tracking-wider">
            Description
          </h3>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        </div>

        {/* Nutritional Info */}
        {product.nutritional_info && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-bold text-black mb-4 uppercase tracking-wider">
              Nutritional Information
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {product.nutritional_info.calories && (
                <div className="text-center p-3 bg-gray-50">
                  <div className="text-2xl font-bold text-black">{product.nutritional_info.calories}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Calories</div>
                </div>
              )}
              {product.nutritional_info.protein && (
                <div className="text-center p-3 bg-gray-50">
                  <div className="text-2xl font-bold text-black">{product.nutritional_info.protein}g</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Protein</div>
                </div>
              )}
              {product.nutritional_info.carbs && (
                <div className="text-center p-3 bg-gray-50">
                  <div className="text-2xl font-bold text-black">{product.nutritional_info.carbs}g</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Carbs</div>
                </div>
              )}
              {product.nutritional_info.fat && (
                <div className="text-center p-3 bg-gray-50">
                  <div className="text-2xl font-bold text-black">{product.nutritional_info.fat}g</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Fat</div>
                </div>
              )}
              {product.nutritional_info.sodium && (
                <div className="text-center p-3 bg-gray-50">
                  <div className="text-2xl font-bold text-black">{product.nutritional_info.sodium}mg</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Sodium</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
