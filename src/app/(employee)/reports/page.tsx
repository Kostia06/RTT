'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';

export default function ReportsPage() {
  const { user, isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) router.push('/dashboard');
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-title-char', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out', delay: 0.2 });
      gsap.fromTo('.stat-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.5 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  if (isLoading) return <div className="min-h-screen bg-white pt-24 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" /></div>;
  if (!isAuthenticated || !isEmployee) return null;

  const title = 'REPORTS & ANALYTICS';

  const stats = [
    { label: 'Total Sales (Month)', value: '$12,450', change: '+15%', positive: true },
    { label: 'Orders (Month)', value: '234', change: '+8%', positive: true },
    { label: 'Classes Held', value: '18', change: '+2', positive: true },
    { label: 'Active Students', value: '89', change: '+12', positive: true },
    { label: 'Avg Order Value', value: '$53.20', change: '+3%', positive: true },
    { label: 'Customer Satisfaction', value: '4.8/5', change: '+0.2', positive: true },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="relative py-12 sm:py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs uppercase tracking-wider mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
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
            <p className="text-sm sm:text-base text-white/60 max-w-2xl">View sales reports, analytics, and performance metrics</p>
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card bg-white p-6 shadow-sm">
                <div className="text-3xl font-black text-black mb-2">{stat.value}</div>
                <div className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">{stat.label}</div>
                <div className={`text-sm font-bold ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 p-8">
              <h2 className="text-2xl font-black text-black mb-6">Top Products</h2>
              <div className="space-y-4">
                {['Classic Tonkotsu Kit', 'Spicy Miso Ramen Kit', 'Shoyu Ramen Kit'].map((product, i) => (
                  <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="font-medium">{product}</span>
                    <span className="font-black">{45 - i * 10} sold</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h2 className="text-2xl font-black text-black mb-6">Popular Classes</h2>
              <div className="space-y-4">
                {['Ramen 101', 'Broth Mastery', 'Noodle Making'].map((classItem, i) => (
                  <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="font-medium">{classItem}</span>
                    <span className="font-black">{12 - i * 2} students</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
