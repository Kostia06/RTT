'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui';

export default function AccountPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black tracking-tight text-black mb-8">MY ACCOUNT</h1>

        {/* Welcome Card */}
        <div className="bg-white p-8 shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-2xl font-bold rounded-full">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/account/orders" className="block bg-white p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-black group-hover:underline">Order History</h3>
                <p className="text-sm text-gray-600 mt-1">View and track your orders</p>
              </div>
            </div>
          </Link>

          <Link href="/account/profile" className="block bg-white p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-black group-hover:underline">Profile Settings</h3>
                <p className="text-sm text-gray-600 mt-1">Update your personal information</p>
              </div>
            </div>
          </Link>

          <Link href="/account/addresses" className="block bg-white p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-black group-hover:underline">Addresses</h3>
                <p className="text-sm text-gray-600 mt-1">Manage shipping addresses</p>
              </div>
            </div>
          </Link>

          <Link href="/account/classes" className="block bg-white p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-black group-hover:underline">My Classes</h3>
                <p className="text-sm text-gray-600 mt-1">View registered classes</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Sign Out */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
