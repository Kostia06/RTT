'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';

interface ClassSession {
  id: string;
  title: string;
  date: string;
  time: string;
  instructor: string;
  capacity: number;
  enrolled: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export default function ClassesManagementPage() {
  const { user, isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'>('all');

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
    // Mock data
    setClasses([
      {
        id: '1',
        title: 'Ramen 101: Beginners',
        date: new Date(Date.now() + 86400000).toISOString(),
        time: '10:00 AM - 12:00 PM',
        instructor: 'Kenji Tanaka',
        capacity: 12,
        enrolled: 8,
        status: 'scheduled',
      },
      {
        id: '2',
        title: 'Broth Mastery Workshop',
        date: new Date().toISOString(),
        time: '2:00 PM - 5:00 PM',
        instructor: 'Yuki Nakamura',
        capacity: 8,
        enrolled: 8,
        status: 'in-progress',
      },
      {
        id: '3',
        title: 'Noodle Making Techniques',
        date: new Date(Date.now() - 86400000).toISOString(),
        time: '10:00 AM - 1:00 PM',
        instructor: 'Sakura Yamamoto',
        capacity: 10,
        enrolled: 9,
        status: 'completed',
      },
    ]);
  }, []);

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

  const filteredClasses = filter === 'all' ? classes : classes.filter(c => c.status === filter);
  const title = 'CLASS MANAGEMENT';

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
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
              Manage class schedules, registrations, and attendance
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {['all', 'scheduled', 'in-progress', 'completed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  filter === f
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.replace('-', ' ')} ({f === 'all' ? classes.length : classes.filter(c => c.status === f).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No classes found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredClasses.map((classItem) => (
                <div key={classItem.id} className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-black">{classItem.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">Instructor: {classItem.instructor}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded ${statusColors[classItem.status]}`}>
                      {classItem.status.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-bold">{new Date(classItem.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-bold">{classItem.time}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Enrollment:</span>
                      <span className="font-bold">{classItem.enrolled} / {classItem.capacity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spots Available:</span>
                      <span className={`font-bold ${classItem.capacity - classItem.enrolled > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {classItem.capacity - classItem.enrolled}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-black h-full transition-all duration-300"
                        style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 px-4 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 transition-colors">
                      View Students
                    </button>
                    <button className="flex-1 px-4 py-2 border-2 border-black text-black text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
                      Edit Class
                    </button>
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
