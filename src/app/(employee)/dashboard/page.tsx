'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { BsQrCode } from 'react-icons/bs';
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



      {/* Quick Actions */}
      <div className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
            {/* Communication Section */}
            <div className="lg:col-span-2">
              <ActionCard
                href="/ai-assistant"
                title="AI Assistant"
                description="Get instant help with products, recipes, and operations."
                icon={<FiCpu size={32} />}
              />
            </div>
            <ActionCard
              href="/messages"
              title="Customer Messages"
              description="View and respond to customer inquiries."
              icon={<FiMail size={32} />}
            />
            <ActionCard
              href="/clock-in"
              title="Quick Clock In/Out"
              description="Track your work hours."
              icon={<FiClock size={32} />}
            />
            <ActionCard
              href="/time-tracking"
              title="Time Tracking"
              description="View your timesheet."
              icon={<FiCalendar size={32} />}
            />
            <ActionCard
              href="/schedule"
              title="My Schedule"
              description="View your upcoming shifts."
              icon={<FiCalendar size={32} />}
            />
            {isAdmin && (
              <>
                <ActionCard
                  href="/admin/qr-codes"
                  title="QR Code Management"
                  description="Generate and manage QR codes."
                  icon={<BsQrCode size={32} />}
                />
                <ActionCard
                  href="/admin/users"
                  title="Manage Users"
                  description="Manage user accounts and permissions."
                  icon={<FiUsers size={32} />}
                />
              </>
            )}
            <div className="lg:col-span-2">
              <ActionCard
                href="/orders"
                title="Manage Orders"
                description="View, process, and update order status."
                icon={<FiPackage size={32} />}
              />
            </div>
            <ActionCard
              href="/inventory"
              title="Check Inventory"
              description="Monitor stock levels and update quantities."
              icon={<FiArchive size={32} />}
            />
            <ActionCard
              href="/manage-recipes"
              title="Manage Recipes"
              description="Create, edit, and publish recipes."
              icon={<FiBookOpen size={32} />}
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
            <ActionCard
              href="/account"
              title="Account Settings"
              description="Update your profile and preferences."
              icon={<FiSettings size={32} />}
            />
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
