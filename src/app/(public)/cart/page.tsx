'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/providers/CartProvider';
import { Button } from '@/components/ui';
import gsap from 'gsap';

export default function CartPage() {
  const { state, removeFromCart, updateQuantity, itemCount, subtotal, tax, total, clearCart } = useCart();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Page title animation
      gsap.fromTo(
        '.cart-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );

      // Cart items stagger
      gsap.fromTo(
        '.cart-item',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.2,
        }
      );

      // Order summary slide in
      gsap.fromTo(
        '.order-summary',
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: 'power3.out' }
      );

      // Empty cart animation
      gsap.fromTo(
        '.empty-cart',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [state.items.length]);

  const handleRemove = (id: string) => {
    // Animate out before removing
    const element = document.querySelector(`[data-cart-item="${id}"]`);
    if (element) {
      gsap.to(element, {
        x: -50,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => removeFromCart(id),
      });
    } else {
      removeFromCart(id);
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-white pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="cart-title text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black mb-6 sm:mb-8">
          YOUR CART
        </h1>

        {state.items.length === 0 ? (
          <div className="empty-cart text-center py-12 sm:py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">Your cart is empty</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link href="/shop">
              <Button variant="primary" size="lg" className="text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4">
                START SHOPPING
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {/* Header - Desktop only */}
              <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-4 sm:mb-6 hidden md:grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {state.items.map((item) => (
                  <div
                    key={item.id}
                    data-cart-item={item.id}
                    className="cart-item grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200"
                  >
                    {/* Product Info */}
                    <div className="md:col-span-6 flex gap-3 sm:gap-4">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 flex-shrink-0 overflow-hidden group">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="96px"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/shop/${item.productSlug}`}
                          className="font-bold text-sm sm:text-base text-black hover:underline line-clamp-2"
                        >
                          {item.productName}
                        </Link>
                        {item.variantName && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{item.variantName}</p>
                        )}
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-xs sm:text-sm text-red-600 hover:text-red-800 mt-1.5 sm:mt-2 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider">Price:</span>
                      <span className="font-medium text-sm sm:text-base">${item.price.toFixed(2)}</span>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider">Quantity:</span>
                      <div className="flex items-center border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 transition-colors touch-manipulation"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-8 sm:w-10 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 transition-colors touch-manipulation"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider">Total:</span>
                      <span className="font-bold text-sm sm:text-base">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <Link href="/shop" className="text-xs sm:text-sm font-medium text-gray-700 hover:text-black transition-colors">
                  ← Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="order-summary bg-gray-50 p-4 sm:p-6 sticky top-20 sm:top-24">
                <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">Order Summary</h2>

                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (5%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 sm:pt-3 mt-2 sm:mt-3">
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Link href="/checkout" className="block mt-4 sm:mt-6">
                  <Button variant="primary" size="lg" className="w-full text-xs sm:text-sm py-3 sm:py-4">
                    PROCEED TO CHECKOUT
                  </Button>
                </Link>

                <div className="mt-4 sm:mt-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure checkout
                  </div>
                </div>

                {/* Trust badges */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <div className="flex justify-center gap-3 sm:gap-4 text-gray-400">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 10h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10zm0 0V6a2 2 0 012-2h14a2 2 0 012 2v4M8 14h.01M12 14h.01M16 14h.01" />
                    </svg>
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
