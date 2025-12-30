'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  lowStock: number;
  lastRestocked: string;
}

export default function InventoryPage() {
  const { user, isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-title-char', { y: 80, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out', delay: 0.2 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    setItems([
      { id: '1', name: 'Pork Bones', category: 'Broth Ingredients', stock: 45, unit: 'kg', lowStock: 20, lastRestocked: new Date(Date.now() - 172800000).toISOString() },
      { id: '2', name: 'Fresh Noodles', category: 'Noodles', stock: 120, unit: 'portions', lowStock: 50, lastRestocked: new Date().toISOString() },
      { id: '3', name: 'Soft Boiled Eggs', category: 'Toppings', stock: 15, unit: 'dozen', lowStock: 10, lastRestocked: new Date(Date.now() - 86400000).toISOString() },
      { id: '4', name: 'Green Onions', category: 'Toppings', stock: 8, unit: 'bunches', lowStock: 5, lastRestocked: new Date(Date.now() - 259200000).toISOString() },
      { id: '5', name: 'Chashu Pork', category: 'Toppings', stock: 25, unit: 'kg', lowStock: 15, lastRestocked: new Date(Date.now() - 86400000).toISOString() },
    ]);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-white pt-24 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" /></div>;
  }

  if (!isAuthenticated || !isEmployee) return null;

  const title = 'INVENTORY';
  const lowStockItems = items.filter(item => item.stock <= item.lowStock);

  return (
    <div className="min-h-screen bg-white">
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="relative py-12 sm:py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs uppercase tracking-wider mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em] mb-4 break-words">
              {title.split('').map((char, i) => <span key={i} className="hero-title-char inline-block">{char === ' ' ? '\u00A0' : char}</span>)}
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-2xl">Monitor stock levels and manage inventory</p>
          </div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border-b-2 border-yellow-400 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <span className="text-sm font-bold text-yellow-900">{lowStockItems.length} item(s) low on stock!</span>
            </div>
          </div>
        </div>
      )}

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Restocked</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className={item.stock <= item.lowStock ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{item.name}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold">{item.stock} {item.unit}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.stock <= item.lowStock ? (
                        <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded">LOW STOCK</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded">IN STOCK</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.lastRestocked).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><button className="px-3 py-1 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800">Update</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
