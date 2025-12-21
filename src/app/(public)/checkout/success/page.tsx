import Link from 'next/link';
import { Button } from '@/components/ui';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-black mb-4">
          ORDER CONFIRMED!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Thank you for your order. We&apos;ve received your payment and will begin
          preparing your ramen experience right away.
        </p>

        <div className="bg-gray-50 p-6 mb-8 text-left">
          <h2 className="font-bold text-black mb-4">What happens next?</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-black text-white text-sm flex items-center justify-center flex-shrink-0">1</span>
              <span>You&apos;ll receive an order confirmation email shortly.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-black text-white text-sm flex items-center justify-center flex-shrink-0">2</span>
              <span>We&apos;ll prepare your order with care and attention.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-black text-white text-sm flex items-center justify-center flex-shrink-0">3</span>
              <span>You&apos;ll receive tracking info when your order ships.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button variant="primary" size="lg">
              CONTINUE SHOPPING
            </Button>
          </Link>
          <Link href="/account/orders">
            <Button variant="outline" size="lg">
              VIEW ORDER HISTORY
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Questions about your order?{' '}
          <Link href="/contact" className="text-black font-medium hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
