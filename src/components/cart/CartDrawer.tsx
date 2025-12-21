'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { useCart } from '@/components/providers/CartProvider';

export const CartDrawer: React.FC = () => {
  const { state, closeCart, removeFromCart, updateQuantity, itemCount, subtotal, tax, total } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      gsap.to(drawerRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
    } else {
      document.body.style.overflow = '';
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(drawerRef.current, { x: '100%', duration: 0.3, ease: 'power2.in' });
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [state.isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={closeCart}
        className={`fixed inset-0 bg-black/50 z-40 ${state.isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{ opacity: 0 }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">YOUR CART ({itemCount})</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="inline-block px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-colors"
              >
                START SHOPPING
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {state.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-24 h-24 bg-gray-100 flex-shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${item.productSlug}`}
                      onClick={closeCart}
                      className="font-bold text-black hover:underline line-clamp-1"
                    >
                      {item.productName}
                    </Link>
                    {item.variantName && (
                      <p className="text-sm text-gray-500">{item.variantName}</p>
                    )}
                    <p className="font-bold mt-1">${item.price.toFixed(2)}</p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST (5%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full py-4 bg-black text-white text-center font-bold hover:bg-gray-800 transition-colors"
            >
              CHECKOUT
            </Link>

            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full py-3 border-2 border-black text-center font-bold hover:bg-gray-100 transition-colors"
            >
              VIEW CART
            </Link>
          </div>
        )}
      </div>
    </>
  );
};
