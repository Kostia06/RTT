'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-black mb-4">ORDER CONFIRMED!</h1>
          <p className="text-gray-600 text-lg">
            Thank you for your order. We&apos;ve received your request and will begin preparing it shortly.
          </p>
        </div>

        <div className="bg-gray-50 p-6 mb-8 text-left">
          <h2 className="font-bold text-lg mb-3">What happens next?</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">1.</span>
              <span>You&apos;ll receive a confirmation email with your order details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">2.</span>
              <span>We&apos;ll prepare your order fresh</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">3.</span>
              <span>Pick up your order during the scheduled time window or receive it via delivery</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button variant="primary">CONTINUE SHOPPING</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">BACK TO HOME</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
