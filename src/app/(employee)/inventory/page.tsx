'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  low_stock_threshold: number;
  price: number;
  updated_at: string;
}

export default function InventoryPage() {
  const { isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-title-char', { y: 80, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out', delay: 0.2
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=200');
        const data = await response.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isEmployee) {
      fetchProducts();
    }
  }, [isAuthenticated, isEmployee]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isEmployee) return null;

  const title = 'INVENTORY';
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.low_stock_threshold);
  const outOfStockItems = products.filter(p => p.stock === 0);

  const filteredProducts = products.filter(p => {
    if (filter === 'low') return p.stock > 0 && p.stock <= p.low_stock_threshold;
    if (filter === 'out') return p.stock === 0;
    return true;
  });

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-white">
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden pt-16 sm:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white text-black flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                {title}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Monitor stock levels
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-black text-black">{products.length}</div>
              <div className="text-xs text-gray-600 uppercase">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-600">{lowStockItems.length}</div>
              <div className="text-xs text-gray-600 uppercase">Low Stock</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-red-600">{outOfStockItems.length}</div>
              <div className="text-xs text-gray-600 uppercase">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-bold transition-colors ${
                filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-4 py-2 text-sm font-bold transition-colors ${
                filter === 'low' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              Low Stock ({lowStockItems.length})
            </button>
            <button
              onClick={() => setFilter('out')}
              className={`px-4 py-2 text-sm font-bold transition-colors ${
                filter === 'out' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Out of Stock ({outOfStockItems.length})
            </button>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No products found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 border-2 rounded-lg flex items-center justify-between ${
                    product.stock === 0
                      ? 'border-red-200 bg-red-50'
                      : product.stock <= product.low_stock_threshold
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-bold text-black">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black">
                      {product.stock}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.stock === 0 ? (
                        <span className="text-red-600 font-bold">OUT OF STOCK</span>
                      ) : product.stock <= product.low_stock_threshold ? (
                        <span className="text-yellow-600 font-bold">LOW STOCK</span>
                      ) : (
                        <span className="text-green-600">In Stock</span>
                      )}
                    </div>
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
