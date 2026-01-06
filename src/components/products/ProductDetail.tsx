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
  const { state, addToCart, updateQuantity, removeFromCart } = useCart();
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

  const currentPrice = selectedVariant?.price || product.price_regular;

  const getProductQuantityInCart = (): number => {
    if (!state || !state.items) return 0;
    const item = state.items.find(item => item.productId === product.id);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, selectedVariant || undefined, quantity);

    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const handleUpdateCartQuantity = (newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, newQuantity);
    }
  };

  const cartQuantity = getProductQuantityInCart();

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
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={index}
                type="button"
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight break-words">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-gray-600">{product.description}</p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-black">
            ${currentPrice.toFixed(2)}
          </span>
        </div>

        {/* Variants - Size and Pack Quantity */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-4">
            {/* Size Selection (if multiple sizes) */}
            {(() => {
              const uniqueSizes = [...new Set(product.variants.map((v: any) => v.size))].filter(Boolean);
              if (uniqueSizes.length > 1) {
                return (
                  <div>
                    <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wider">
                      Size
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {uniqueSizes.map((size) => {
                        const variantWithSize = product.variants?.find((v: any) => v.size === size);
                        const isSelected = (selectedVariant as any)?.size === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              // Select first variant with this size
                              const variant = product.variants?.find((v: any) => v.size === size);
                              if (variant) setSelectedVariant(variant);
                            }}
                            className={`px-4 py-3 border-2 text-sm font-bold transition-all ${
                              isSelected
                                ? 'border-black bg-black text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-black'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Pack Quantity Selection */}
            <div>
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wider">
                Pack Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.variants
                  .filter((v: any) => !(selectedVariant as any)?.size || v.size === (selectedVariant as any).size)
                  .map((variant: any) => (
                    <button
                      key={variant.sku}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-4 border-2 text-sm transition-all ${
                        selectedVariant?.sku === variant.sku
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-black'
                      }`}
                    >
                      <div className="font-bold">
                        {variant.packQuantity} Pack{variant.packQuantity && variant.packQuantity > 1 ? 's' : ''}
                      </div>
                      <div className={`text-xs mt-1 ${selectedVariant?.sku === variant.sku ? 'text-white/70' : 'text-gray-500'}`}>
                        ${variant.price.toFixed(2)}
                      </div>
                      {variant.packQuantity && variant.packQuantity >= 50 && (
                        <div className={`text-[10px] mt-1 uppercase tracking-wider ${selectedVariant?.sku === variant.sku ? 'text-white/60' : 'text-gray-400'}`}>
                          Wholesale
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Cart Controls */}
        {cartQuantity > 0 ? (
          <div>
            <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wider">
              In Your Cart
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleUpdateCartQuantity(cartQuantity - 1)}
                className="w-14 h-14 bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center text-2xl font-bold"
              >
                {cartQuantity === 1 ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                ) : (
                  '−'
                )}
              </button>
              <div className="flex-1 text-center">
                <div className="text-3xl font-black text-black">{cartQuantity}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">In Cart</div>
              </div>
              <button
                type="button"
                onClick={() => handleUpdateCartQuantity(cartQuantity + 1)}
                className="w-14 h-14 bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center text-2xl font-bold"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Quantity */}
            <div>
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wider">
                Quantity
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 border-2 border-gray-300 hover:border-black transition-colors flex items-center justify-center text-xl"
                >
                  -
                </button>
                <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                <button
                  type="button"
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
          </>
        )}

        {/* Edit Button for Employees */}
        {isEmployee && (
          <button
            type="button"
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

      {/* Similar Products */}
      {(product as any).relatedProducts && (product as any).relatedProducts.length > 0 && (
        <div className="col-span-full mt-16 pt-16 border-t-2 border-gray-900">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-black mb-3 uppercase tracking-tight">
              Similar Products
            </h2>
            <p className="text-sm text-gray-600 uppercase tracking-wider">
              You might also like these items
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(product as any).relatedProducts.map((relatedProduct: any) => (
              <a
                key={relatedProduct.id}
                href={`/shop/${relatedProduct.slug}`}
                className="group block"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden mb-3">
                  {relatedProduct.images?.[0] ? (
                    <Image
                      src={relatedProduct.images[0].url}
                      alt={relatedProduct.images[0].alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <span className="text-6xl text-gray-200">麺</span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    {relatedProduct.category?.replace('-', ' ')}
                  </div>
                  <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:underline">
                    {relatedProduct.name}
                  </h3>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-black text-black">
                      ${Math.floor(relatedProduct.price)}
                    </span>
                    <span className="text-xs text-gray-400">
                      .{(relatedProduct.price % 1).toFixed(2).slice(2)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
