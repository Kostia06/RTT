'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/providers/CartProvider';
import { Button } from '@/components/ui';

export default function CartPage() {
  const { state, removeFromCart, updateQuantity, itemCount, subtotal, tax, total, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black tracking-tight text-black mb-8">YOUR CART</h1>

        {state.items.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-black mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
            <Link href="/shop">
              <Button variant="primary" size="lg">
                START SHOPPING
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="border-b border-gray-200 pb-4 mb-6 hidden md:grid grid-cols-12 gap-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="space-y-6">
                {state.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-6 border-b border-gray-200">
                    {/* Product Info */}
                    <div className="md:col-span-6 flex gap-4">
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
                      <div>
                        <Link
                          href={`/shop/${item.productSlug}`}
                          className="font-bold text-black hover:underline"
                        >
                          {item.productName}
                        </Link>
                        {item.variantName && (
                          <p className="text-sm text-gray-500 mt-1">{item.variantName}</p>
                        )}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-sm text-red-600 hover:text-red-800 mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden text-gray-500">Price:</span>
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden text-gray-500">Quantity:</span>
                      <div className="flex items-center border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                      <span className="md:hidden text-gray-500">Total:</span>
                      <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-black">
                  ← Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-black mb-6">Order Summary</h2>

                <div className="space-y-3 text-sm">
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
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Link href="/checkout" className="block mt-6">
                  <Button variant="primary" size="lg" className="w-full">
                    PROCEED TO CHECKOUT
                  </Button>
                </Link>

                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure checkout
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
