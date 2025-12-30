'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { format } from 'date-fns';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  products: string[];
  rating: number;
}

interface RestockOrder {
  id: string;
  supplierName: string;
  items: { itemName: string; quantity: number; costPerUnit: number }[];
  totalCost: number;
  status: string;
  orderedAt: string;
  expectedDelivery?: string;
}

export default function InventoryAdvancedPage() {
  const { isAuthenticated, isEmployee, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'restock'>('suppliers');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [restockOrders, setRestockOrders] = useState<RestockOrder[]>([]);

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
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out', delay: 0.2 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isAuthenticated && isEmployee) {
      fetchSuppliers();
      fetchRestockOrders();
    }
  }, [isAuthenticated, isEmployee]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/inventory/suppliers');
      const data = await response.json();
      if (response.ok) {
        setSuppliers(data.suppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchRestockOrders = async () => {
    try {
      const response = await fetch('/api/inventory/restock');
      const data = await response.json();
      if (response.ok) {
        setRestockOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching restock orders:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isEmployee) return null;

  const title = 'SUPPLIER MANAGEMENT';

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    ordered: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    received: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-white">
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="relative py-12 sm:py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs uppercase tracking-wider mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em] mb-2 break-words overflow-visible py-2">
              {title.split(' ').map((word, wordIndex) => (
                <span key={wordIndex} className="block overflow-visible py-0.5 whitespace-nowrap">
                  {word.split('').map((char, charIndex) => (
                    <span key={`${wordIndex}-${charIndex}`} className="hero-title-char inline-block will-change-transform">
                      {char}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-2xl">
              Manage suppliers and create restock orders
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'suppliers' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Suppliers ({suppliers.length})
            </button>
            <button
              onClick={() => setActiveTab('restock')}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'restock' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Restock Orders ({restockOrders.length})
            </button>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'suppliers' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black">All Suppliers</h2>
                {isAdmin && (
                  <button className="px-6 py-3 bg-black text-white text-sm font-bold uppercase hover:bg-gray-800 transition-colors">
                    Add Supplier
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map(supplier => (
                  <div key={supplier.id} className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-black">{supplier.name}</h3>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-bold">{supplier.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Contact:</span>
                        <span className="ml-2 font-medium">{supplier.contactPerson}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-medium">{supplier.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-2 font-medium">{supplier.phone}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Products:</p>
                      <div className="flex flex-wrap gap-1">
                        {supplier.products.slice(0, 3).map((product, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-xs font-medium rounded">
                            {product}
                          </span>
                        ))}
                        {supplier.products.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-xs font-medium rounded">
                            +{supplier.products.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'restock' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black">Restock Orders</h2>
                {isAdmin && (
                  <button className="px-6 py-3 bg-black text-white text-sm font-bold uppercase hover:bg-gray-800 transition-colors">
                    Create Order
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {restockOrders.map(order => (
                  <div key={order.id} className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-black">{order.supplierName}</h3>
                          <span className={`px-3 py-1 text-xs font-bold uppercase rounded ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Ordered {format(new Date(order.orderedAt), 'MMM dd, yyyy')}
                        </p>
                        {order.expectedDelivery && (
                          <p className="text-sm text-gray-600">
                            Expected: {format(new Date(order.expectedDelivery), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black">${order.totalCost.toFixed(2)}</p>
                        <p className="text-xs text-gray-600">{order.items.length} items</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm py-2 border-t border-gray-100">
                          <span className="font-medium">{item.itemName}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-600">Qty: {item.quantity}</span>
                            <span className="font-bold">${(item.quantity * item.costPerUnit).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {restockOrders.length === 0 && (
                  <div className="bg-white border border-gray-200 p-12 text-center text-gray-500">
                    No restock orders found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
