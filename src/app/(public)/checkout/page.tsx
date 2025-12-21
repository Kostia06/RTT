'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button, Input } from '@/components/ui';

type CheckoutStep = 'information' | 'shipping' | 'payment';

export default function CheckoutPage() {
  const router = useRouter();
  const { state, subtotal, tax, total, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState<CheckoutStep>('information');
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    province: 'Alberta',
    postalCode: '',
    phone: '',
    saveInfo: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmitInformation = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('shipping');
  };

  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing - replace with Square integration
    setTimeout(() => {
      clearCart();
      router.push('/checkout/success');
    }, 2000);
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl font-black tracking-tight text-black mb-4">CHECKOUT</h1>
          <p className="text-gray-600 mb-8">Your cart is empty. Add some items before checking out.</p>
          <Link href="/shop">
            <Button variant="primary">CONTINUE SHOPPING</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="order-2 lg:order-1">
            {/* Progress Indicator */}
            <div className="flex items-center gap-4 mb-8 text-sm">
              <span className={`font-medium ${step === 'information' ? 'text-black' : 'text-gray-500'}`}>
                Information
              </span>
              <span className="text-gray-300">→</span>
              <span className={`font-medium ${step === 'shipping' ? 'text-black' : 'text-gray-500'}`}>
                Shipping
              </span>
              <span className="text-gray-300">→</span>
              <span className={`font-medium ${step === 'payment' ? 'text-black' : 'text-gray-500'}`}>
                Payment
              </span>
            </div>

            <div className="bg-white p-8 shadow-sm">
              {/* Information Step */}
              {step === 'information' && (
                <form onSubmit={handleSubmitInformation}>
                  <h2 className="text-xl font-bold mb-6">Contact Information</h2>

                  {!isAuthenticated && (
                    <p className="text-sm text-gray-600 mb-6">
                      Already have an account?{' '}
                      <Link href="/login?redirect=/checkout" className="text-black font-medium hover:underline">
                        Log in
                      </Link>
                    </p>
                  )}

                  <div className="space-y-4">
                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />

                    <h3 className="text-lg font-bold mt-8 mb-4">Shipping Address</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <Input
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />

                    <Input
                      label="Apartment, suite, etc. (optional)"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Province
                        </label>
                        <select
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="Alberta">Alberta</option>
                          <option value="British Columbia">British Columbia</option>
                          <option value="Ontario">Ontario</option>
                          <option value="Quebec">Quebec</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Postal Code"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="w-full mt-8">
                    CONTINUE TO SHIPPING
                  </Button>
                </form>
              )}

              {/* Shipping Step */}
              {step === 'shipping' && (
                <form onSubmit={handleSubmitShipping}>
                  <button
                    type="button"
                    onClick={() => setStep('information')}
                    className="text-sm text-gray-600 hover:text-black mb-6"
                  >
                    ← Back to information
                  </button>

                  <h2 className="text-xl font-bold mb-6">Shipping Method</h2>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 border-2 border-black bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value="standard"
                          defaultChecked
                          className="w-4 h-4"
                        />
                        <div>
                          <span className="font-medium">Standard Shipping</span>
                          <p className="text-sm text-gray-500">5-7 business days</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">FREE</span>
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-300 cursor-pointer hover:border-gray-400">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          className="w-4 h-4"
                        />
                        <div>
                          <span className="font-medium">Express Shipping</span>
                          <p className="text-sm text-gray-500">2-3 business days</p>
                        </div>
                      </div>
                      <span className="font-bold">$12.00</span>
                    </label>
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="w-full mt-8">
                    CONTINUE TO PAYMENT
                  </Button>
                </form>
              )}

              {/* Payment Step */}
              {step === 'payment' && (
                <form onSubmit={handleSubmitPayment}>
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="text-sm text-gray-600 hover:text-black mb-6"
                  >
                    ← Back to shipping
                  </button>

                  <h2 className="text-xl font-bold mb-6">Payment</h2>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 text-sm">
                    <p className="font-medium text-yellow-800">Sandbox Mode</p>
                    <p className="text-yellow-700">
                      This is a demo. No real payment will be processed.
                      Use test card: 4111 1111 1111 1111
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Card Number"
                      placeholder="4111 1111 1111 1111"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Expiry Date"
                        placeholder="MM/YY"
                        required
                      />
                      <Input
                        label="CVV"
                        placeholder="123"
                        required
                      />
                    </div>
                    <Input
                      label="Name on Card"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-8"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'PROCESSING...' : `PAY $${total.toFixed(2)}`}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-1 lg:order-2">
            <div className="bg-white p-8 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-gray-100 flex-shrink-0">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                      <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-xs text-gray-500">{item.variantName}</p>
                      )}
                    </div>
                    <span className="font-medium text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
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
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
