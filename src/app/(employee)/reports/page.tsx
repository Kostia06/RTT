'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
}

interface Stats {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
}

export default function ReportsPage() {
  const { isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) router.push('/dashboard');
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.stat-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.3 });
    }, heroRef);
    return () => ctx.revert();
  }, [stats]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders');
        const data = await response.json();
        const orders: Order[] = data.orders || [];

        // Filter by period
        const now = new Date();
        const filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          if (period === 'today') {
            return orderDate.toDateString() === now.toDateString();
          } else if (period === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          } else if (period === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          }
          return true;
        });

        // Calculate stats
        const completedOrders = filteredOrders.filter(o => o.status === 'completed' || o.status === 'ready');
        const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
        const avgOrderValue = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;

        // Calculate top products
        const productMap: Record<string, { quantity: number; revenue: number }> = {};
        filteredOrders.forEach(order => {
          order.items?.forEach(item => {
            if (!productMap[item.name]) {
              productMap[item.name] = { quantity: 0, revenue: 0 };
            }
            productMap[item.name].quantity += item.quantity;
            productMap[item.name].revenue += item.price * item.quantity;
          });
        });

        const topProducts = Object.entries(productMap)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setStats({
          totalSales,
          totalOrders: filteredOrders.length,
          avgOrderValue,
          completedOrders: completedOrders.length,
          pendingOrders: filteredOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
          topProducts,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isEmployee) {
      fetchStats();
    }
  }, [isAuthenticated, isEmployee, period]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isEmployee) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">REPORTS</h1>
              <p className="text-white/60 text-sm mt-1">Sales and analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <div className="border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-bold transition-colors ${
                  period === p ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="stat-card p-6 border-2 border-gray-200 bg-white">
              <div className="text-3xl font-black text-black">{formatCurrency(stats?.totalSales || 0)}</div>
              <div className="text-xs text-gray-600 uppercase mt-1">Total Sales</div>
            </div>
            <div className="stat-card p-6 border-2 border-gray-200 bg-white">
              <div className="text-3xl font-black text-black">{stats?.totalOrders || 0}</div>
              <div className="text-xs text-gray-600 uppercase mt-1">Total Orders</div>
            </div>
            <div className="stat-card p-6 border-2 border-gray-200 bg-white">
              <div className="text-3xl font-black text-green-600">{stats?.completedOrders || 0}</div>
              <div className="text-xs text-gray-600 uppercase mt-1">Completed</div>
            </div>
            <div className="stat-card p-6 border-2 border-gray-200 bg-white">
              <div className="text-3xl font-black text-black">{formatCurrency(stats?.avgOrderValue || 0)}</div>
              <div className="text-xs text-gray-600 uppercase mt-1">Avg Order</div>
            </div>
          </div>

          {/* Top Products */}
          <div className="border-2 border-gray-200 bg-white p-6">
            <h2 className="text-xl font-black mb-4">Top Products</h2>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-bold">{product.name}</div>
                        <div className="text-sm text-gray-600">{product.quantity} sold</div>
                      </div>
                    </div>
                    <div className="text-lg font-black">{formatCurrency(product.revenue)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No sales data for this period</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
