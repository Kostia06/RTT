'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button, Input } from '@/components/ui';

type CheckoutStep = 'information' | 'payment';

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  position: string;
  status: string;
}

interface PickupDateInfo {
  date: string;
  earliestTime: string;
  latestTime: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state, subtotal, tax, total, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState<CheckoutStep>('information');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availablePickupDates, setAvailablePickupDates] = useState<PickupDateInfo[]>([]);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    phone: '',
    deliveryType: 'pickup' as 'pickup' | 'delivery',
    pickupDate: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryPostalCode: '',
    deliveryInstructions: '',
    paymentMethod: 'in-store' as 'in-store' | 'online',
  });

  // Fetch available pickup dates from schedule
  useEffect(() => {
    const fetchPickupDates = async () => {
      try {
        const response = await fetch('/api/employee/schedule');
        if (response.ok) {
          const data = await response.json();
          const shifts: Shift[] = data.shifts || [];

          // Group shifts by date and calculate time ranges
          const dateMap = new Map<string, { earliest: Date; latest: Date }>();

          shifts.forEach(shift => {
            const shiftStart = new Date(shift.startTime);
            const shiftEnd = new Date(shift.endTime);

            // Only include future shifts
            if (shiftStart > new Date()) {
              const dateKey = shiftStart.toISOString().split('T')[0];

              if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, { earliest: shiftStart, latest: shiftEnd });
              } else {
                const existing = dateMap.get(dateKey)!;
                if (shiftStart < existing.earliest) {
                  existing.earliest = shiftStart;
                }
                if (shiftEnd > existing.latest) {
                  existing.latest = shiftEnd;
                }
              }
            }
          });

          // Convert to PickupDateInfo array
          const pickupDates: PickupDateInfo[] = Array.from(dateMap.entries()).map(([date, times]) => ({
            date,
            earliestTime: times.earliest.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            latestTime: times.latest.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          })).sort((a, b) => a.date.localeCompare(b.date));

          setAvailablePickupDates(pickupDates);
        }
      } catch (error) {
        console.error('Error fetching pickup dates:', error);
      }
    };

    fetchPickupDates();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmitInformation = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.paymentMethod === 'in-store') {
      // Skip payment step and complete the order
      handleCompleteOrder();
    } else {
      setStep('payment');
    }
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

      // Get pickup time range (only for pickup orders)
      const selectedDateInfo = availablePickupDates.find(d => d.date === formData.pickupDate);
      const pickupTimeRange = selectedDateInfo
        ? `${selectedDateInfo.earliestTime} - ${selectedDateInfo.latestTime}`
        : '';

      // Prepare order items
      const orderItems = state.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
      }));

      // Prepare order data
      const orderData: any = {
        orderNumber,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        total: total,
        status: 'pending',
        items: orderItems,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentMethod === 'online' ? 'paid' : 'pending',
        deliveryType: formData.deliveryType,
      };

      // Add pickup or delivery specific fields
      if (formData.deliveryType === 'pickup') {
        orderData.pickupDate = formData.pickupDate;
        orderData.pickupTime = pickupTimeRange;
      } else {
        orderData.deliveryAddress = formData.deliveryAddress;
        orderData.deliveryCity = formData.deliveryCity;
        orderData.deliveryPostalCode = formData.deliveryPostalCode;
        orderData.deliveryInstructions = formData.deliveryInstructions;
      }

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      // Clear cart and redirect to success page
      clearCart();
      router.push('/checkout/success');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing - replace with Square integration
    setTimeout(async () => {
      await handleCompleteOrder();
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

                    <h3 className="text-lg font-bold mt-8 mb-4">Customer Information</h3>

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
                      label="Phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />

                    <h3 className="text-lg font-bold mt-8 mb-4">Order Type</h3>

                    <div className="space-y-3 mb-6">
                      <label className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-colors ${
                        formData.deliveryType === 'pickup'
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="deliveryType"
                            value="pickup"
                            checked={formData.deliveryType === 'pickup'}
                            onChange={handleInputChange}
                            className="w-4 h-4"
                          />
                          <div>
                            <span className="font-bold">Pickup</span>
                            <p className="text-sm text-gray-500">Pick up your order at our location</p>
                          </div>
                        </div>
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </label>

                      <label className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-colors ${
                        formData.deliveryType === 'delivery'
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="deliveryType"
                            value="delivery"
                            checked={formData.deliveryType === 'delivery'}
                            onChange={handleInputChange}
                            className="w-4 h-4"
                          />
                          <div>
                            <span className="font-bold">Local Delivery</span>
                            <p className="text-sm text-gray-500">We&apos;ll deliver to your address</p>
                          </div>
                        </div>
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                      </label>
                    </div>

                    {formData.deliveryType === 'pickup' ? (
                      <>
                        <h3 className="text-lg font-bold mb-4">Pickup Details</h3>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
                          <p className="text-sm text-blue-900">
                            Select a date when our staff will be available.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Date *
                          </label>
                          <select
                            name="pickupDate"
                            value={formData.pickupDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                            required
                          >
                            <option value="">Select a date</option>
                            {availablePickupDates.map(dateInfo => (
                              <option key={dateInfo.date} value={dateInfo.date}>
                                {new Date(dateInfo.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </option>
                            ))}
                          </select>
                        </div>

                        {formData.pickupDate && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded mt-4">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-bold text-green-900">Pickup Time Window</span>
                            </div>
                            <p className="text-sm text-green-800 ml-7">
                              {availablePickupDates.find(d => d.date === formData.pickupDate)?.earliestTime} - {availablePickupDates.find(d => d.date === formData.pickupDate)?.latestTime}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold mb-4">Delivery Address</h3>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
                          <p className="text-sm text-blue-900">
                            We deliver locally. Please provide your delivery address.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <Input
                            label="Street Address"
                            name="deliveryAddress"
                            value={formData.deliveryAddress}
                            onChange={handleInputChange}
                            required={formData.deliveryType === 'delivery'}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="City"
                              name="deliveryCity"
                              value={formData.deliveryCity}
                              onChange={handleInputChange}
                              required={formData.deliveryType === 'delivery'}
                            />
                            <Input
                              label="Postal Code"
                              name="deliveryPostalCode"
                              value={formData.deliveryPostalCode}
                              onChange={handleInputChange}
                              placeholder="A1A 1A1"
                              required={formData.deliveryType === 'delivery'}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Delivery Instructions (Optional)
                            </label>
                            <textarea
                              name="deliveryInstructions"
                              value={formData.deliveryInstructions}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                              rows={3}
                              placeholder="e.g., Leave at front door, ring doorbell"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <h3 className="text-lg font-bold mt-8 mb-4">Payment Method</h3>

                    <div className="space-y-3">
                      <label className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-colors ${
                        formData.paymentMethod === 'in-store'
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="in-store"
                            checked={formData.paymentMethod === 'in-store'}
                            onChange={handleInputChange}
                            className="w-4 h-4"
                          />
                          <div>
                            <span className="font-bold">Pay in Store</span>
                            <p className="text-sm text-gray-500">Pay when you pick up your order</p>
                          </div>
                        </div>
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </label>

                      <label className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-colors ${
                        formData.paymentMethod === 'online'
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="online"
                            checked={formData.paymentMethod === 'online'}
                            onChange={handleInputChange}
                            className="w-4 h-4"
                          />
                          <div>
                            <span className="font-bold">Pay Online</span>
                            <p className="text-sm text-gray-500">Pay now with credit card</p>
                          </div>
                        </div>
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </label>
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="w-full mt-8" disabled={isProcessing}>
                    {isProcessing ? 'PROCESSING...' : formData.paymentMethod === 'in-store' ? 'COMPLETE ORDER' : 'CONTINUE TO PAYMENT'}
                  </Button>
                </form>
              )}

              {/* Payment Step */}
              {step === 'payment' && (
                <form onSubmit={handleSubmitPayment}>
                  <button
                    type="button"
                    onClick={() => setStep('information')}
                    className="text-sm text-gray-600 hover:text-black mb-6"
                  >
                    ← Back to information
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
                  <span className="text-gray-600">GST (5%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-blue-900 bg-blue-50 p-3 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Choose pickup or local delivery</span>
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
