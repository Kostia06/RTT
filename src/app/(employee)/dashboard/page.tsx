'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AIAssistantSection from '@/components/employee/AIAssistantSection';

gsap.registerPlugin(ScrollTrigger);

interface EmployeeStats {
  ordersToday: number;
  ordersThisWeek: number;
}

export default function EmployeeDashboard() {
  const { user, isAuthenticated, isEmployee, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const heroRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<EmployeeStats>({
    ordersToday: 0,
    ordersThisWeek: 0,
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero title animation
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

      // Stats cards animation
      gsap.fromTo(
        '.stat-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.5,
        }
      );

      // Feature cards animation
      gsap.fromTo(
        '.feature-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 80%',
          },
        }
      );

      // AI Assistant section animation
      gsap.fromTo(
        '.ai-assistant-section',
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.ai-assistant-section',
            start: 'top 85%',
          },
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Fetch employee stats (mock data for now)
  useEffect(() => {
    if (isAuthenticated && isEmployee) {
      // TODO: Fetch real data from Supabase
      setStats({
        ordersToday: 12,
        ordersThisWeek: 47,
      });
    }
  }, [isAuthenticated, isEmployee]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isEmployee) {
    return null;
  }

  const title = 'EMPLOYEE DASHBOARD';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em] mb-4 break-words">
              {title.split('').map((char, i) => (
                <span key={i} className="hero-title-char inline-block">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>

            <p className="text-sm sm:text-base text-white/60 max-w-2xl break-words">
              Welcome back, <span className="inline-block">{user?.user_metadata?.name || 'Team Member'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="py-12 sm:py-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="stat-card bg-white p-6 shadow-sm">
              <div className="text-3xl sm:text-4xl font-black text-black mb-2">
                {stats.ordersToday}
              </div>
              <div className="text-xs tracking-[0.15em] uppercase text-gray-500">
                Orders Today
              </div>
            </div>

            <div className="stat-card bg-white p-6 shadow-sm">
              <div className="text-3xl sm:text-4xl font-black text-black mb-2">
                {stats.ordersThisWeek}
              </div>
              <div className="text-xs tracking-[0.15em] uppercase text-gray-500">
                Orders This Week
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Section */}
      <div className="py-8 sm:py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AIAssistantSection />
        </div>
      </div>


      {/* Quick Actions */}
      <div className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* User Management (Admin Only) */}
            {isAdmin && (
              <Link href="/admin/users" className="feature-card bg-white p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-black mb-3">
                  Manage Users
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  View all users, change roles, and manage account access and permissions.
                </p>
              </Link>
            )}

            {/* Orders Management */}
            <Link href="/orders" className="feature-card bg-white p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-3">
                Manage Orders
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                View, process, and update order status for today&apos;s deliveries and pickups.
              </p>
            </Link>

            {/* Inventory */}
            <Link href="/inventory" className="feature-card bg-white p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-3">
                Check Inventory
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Monitor stock levels, update quantities, and manage product availability.
              </p>
            </Link>

            {/* Recipe Management */}
            <Link href="/manage-recipes" className="feature-card bg-white p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-3">
                Manage Recipes
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Create, edit, and publish recipes with ingredients, instructions, and photos.
              </p>
            </Link>

            {/* Time Tracking */}
            <Link href="/time-tracking" className="feature-card bg-white p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-3">
                Time Tracking
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Clock in/out, track work hours, and view your timesheet.
              </p>
            </Link>

            {/* Schedule */}
            <Link href="/schedule" className="feature-card bg-white p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-3">
                My Schedule
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                View your upcoming shifts, confirm schedule, and request time off.
              </p>
            </Link>

            {/* Supplier Management */}
            <Link href="/inventory-advanced" className="feature-card bg-white p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-3">
                Suppliers & Restock
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Manage suppliers, create restock orders, and track deliveries.
              </p>
            </Link>

            {/* Customer Support */}
            <Link href="/support" className="feature-card bg-white p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-3">
                Customer Support
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Respond to customer inquiries and resolve support tickets.
              </p>
            </Link>

            {/* Reports */}
            <Link href="/reports" className="feature-card bg-white p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-3">
                View Reports
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Access sales reports, analytics, and performance metrics.
              </p>
            </Link>

            {/* Account Settings */}
            <Link href="/account" className="feature-card bg-white p-8 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-3">
                Account Settings
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Update your profile, change password, and manage preferences.
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="py-12 sm:py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <button
            onClick={handleSignOut}
            className="inline-block px-8 py-4 border-2 border-black text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
