'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  items: number;
  createdAt: string;
  fulfillmentType: 'pickup' | 'delivery';
}

export default function OrdersManagementPage() {
  const { user, isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-title-char',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.02,
          ease: 'power3.out',
          delay: 0.2,
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Mock data - replace with actual API call
    setOrders([
      {
        id: '1',
        orderNumber: 'ORD-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        total: 45.99,
        status: 'pending',
        items: 3,
        createdAt: new Date().toISOString(),
        fulfillmentType: 'pickup',
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        total: 89.50,
        status: 'preparing',
        items: 5,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        fulfillmentType: 'delivery',
      },
    ]);
  }, []);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isEmployee) {
    return null;
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const title = 'ORDER MANAGEMENT';

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs uppercase tracking-wider mb-6 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em] mb-4 break-words">
              {title.split('').map((char, i) => (
                <span key={i} className="hero-title-char inline-block">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-2xl">
              View and manage all customer orders
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  filter === f
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f} ({f === 'all' ? orders.length : orders.filter(o => o.status === f).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-black">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerEmail}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-bold">{order.items}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-bold capitalize">{order.fulfillmentType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ordered:</span>
                      <span className="font-bold">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                      Update Status:
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="w-full px-4 py-2 border border-gray-300 text-sm font-semibold focus:outline-none focus:border-black"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
