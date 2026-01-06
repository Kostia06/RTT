'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import {
  FiArchive,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiCpu,
  FiMail,
  FiPackage,
  FiSettings,
  FiTruck,
  FiUsers,
} from 'react-icons/fi';
import { QrCode, Thermometer, FileText, Package2 } from 'lucide-react';
import { ActionCard } from '@/components/employee/ActionCard';

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
  const [newMessagesCount, setNewMessagesCount] = useState<number>(0);

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

  // Fetch new messages count
  useEffect(() => {
    const fetchNewMessagesCount = async () => {
      if (isAuthenticated && isEmployee) {
        try {
          const response = await fetch('/api/messages/count');
          if (response.ok) {
            const data = await response.json();
            setNewMessagesCount(data.count || 0);
          }
        } catch (error) {
          console.error('Error fetching new messages count:', error);
        }
      }
    };

    fetchNewMessagesCount();

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchNewMessagesCount, 30000);
    return () => clearInterval(interval);
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
      <div ref={heroRef} className="relative bg-black text-white pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="relative py-12 sm:py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em] mb-4 break-words overflow-visible py-2">
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

            <p className="text-sm sm:text-base text-white/60 max-w-2xl break-words mb-8">
              Welcome back, <span className="inline-block font-bold text-white">{user?.user_metadata?.name || 'Team Member'}</span>
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="stat-card bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
                <div className="text-3xl font-black text-white mb-1">{stats.ordersToday}</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">Orders Today</div>
              </div>
              <div className="stat-card bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
                <div className="text-3xl font-black text-white mb-1">{stats.ordersThisWeek}</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">This Week</div>
              </div>
              <div className="stat-card bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
                <div className="text-3xl font-black text-white mb-1">{newMessagesCount}</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">New Messages</div>
              </div>
              <div className="stat-card bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
                <div className="text-3xl font-black text-green-400 mb-1">Active</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Quick Actions */}
      <div className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Primary Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Daily Operations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ActionCard
                href="/today"
                title="Today"
                description="View today's orders, what to make, and your shift details."
                icon={<FiCalendar size={32} />}
                badge={null}
              />
              <ActionCard
                href="/time-tracking"
                title="Time Tracking & Schedule"
                description="Clock in/out, add manual entries, view your timesheet, and see your upcoming shifts."
                icon={<FiClock size={32} />}
                badge={null}
              />
              <ActionCard
                href="/messages"
                title="Customer Messages"
                description="View and respond to customer inquiries."
                icon={<FiMail size={32} />}
                badge={newMessagesCount > 0 ? newMessagesCount : null}
              />
            </div>
          </div>

          {/* Operations Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Operations & Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ActionCard
                href="/ai-assistant"
                title="AI Assistant"
                description="Get instant help with products, recipes, and operations."
                icon={<FiCpu size={32} />}
              />
              <ActionCard
                href="/orders"
                title="Manage Orders"
                description="View, process, and update order status."
                icon={<FiPackage size={32} />}
              />
              <ActionCard
                href="/manage-content"
                title="Manage Content"
                description="Manage products and recipes."
                icon={<FiBookOpen size={32} />}
              />
              <ActionCard
                href="/inventory"
                title="Shop Inventory"
                description="Monitor retail product stock levels."
                icon={<FiPackage size={32} />}
              />
              <ActionCard
                href="/inventory-advanced"
                title="Suppliers & Restock"
                description="Manage suppliers and create restock orders."
                icon={<FiTruck size={32} />}
              />
              <ActionCard
                href="/reports"
                title="View Reports"
                description="Access sales reports and analytics."
                icon={<FiBarChart2 size={32} />}
              />
            </div>
          </div>

          {/* Fridges & Storage */}
          <div className="mb-12">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Fridges & Storage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ActionCard
                href="/fridges"
                title="Fridges Hub"
                description="Central hub for all fridge operations and inventory."
                icon={<FiArchive size={32} />}
              />
              <ActionCard
                href="/scan-fridge"
                title="Scan QR Code"
                description="Quick fridge access and temperature logging."
                icon={<QrCode size={32} />}
              />
              {isAdmin && (
                <ActionCard
                  href="/manage-fridges"
                  title="Manage Fridges"
                  description="Add, edit, or remove storage units."
                  icon={<Thermometer size={32} />}
                />
              )}
            </div>
          </div>

          {/* Production Management */}
          <div className="mb-12">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Production Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ActionCard
                href="/production"
                title="Production"
                description="View today's assignments and production history."
                icon={<Package2 size={32} />}
              />
              <ActionCard
                href="/production-logs"
                title="Production Logs"
                description="View and export historical production data."
                icon={<FileText size={32} />}
              />
              {isAdmin && (
                <ActionCard
                  href="/manage-production-items"
                  title="Production Setup"
                  description="Manage production items and recipes."
                  icon={<FiPackage size={32} />}
                />
              )}
            </div>
          </div>

          {/* Admin & Settings */}
          <div>
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">
              {isAdmin ? 'Admin & Settings' : 'Settings'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isAdmin && (
                <ActionCard
                  href="/admin/users"
                  title="Manage Users"
                  description="Manage user accounts, roles, and pay rates."
                  icon={<FiUsers size={32} />}
                />
              )}
              <ActionCard
                href="/account"
                title="Account Settings"
                description="Update your profile and preferences."
                icon={<FiSettings size={32} />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="py-12 sm:py-16 bg-white border-t-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-white rounded-lg border-2 border-gray-200">
            <div>
              <h3 className="text-xl font-black mb-2">Need to leave?</h3>
              <p className="text-sm text-gray-600">Remember to clock out if you&apos;re done for the day.</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-8 py-4 border-2 border-black bg-black text-white text-xs font-bold tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
