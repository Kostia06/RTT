'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Users } from 'lucide-react';

interface ClassBooking {
  id: string;
  class_title: string;
  class_date: string;
  start_time: string;
  end_time: string;
  instructor_name: string;
  seats_booked: number;
  total_seats: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function ClassesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<ClassBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/account/classes');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchClasses();
    }
  }, [isAuthenticated]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/customer/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (classId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`/api/customer/classes/${classId}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchClasses();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredClasses = classes.filter((cls) => {
    if (filter === 'all') return true;
    return cls.status === filter;
  });

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Account
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">MY CLASSES</h1>
          <Link
            href="/classes"
            className="inline-block px-6 py-3 bg-black text-white text-xs font-bold tracking-wider uppercase hover:bg-gray-800 transition-colors text-center"
          >
            Browse Classes
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-xs font-bold uppercase whitespace-nowrap ${
              filter === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Classes
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 text-xs font-bold uppercase whitespace-nowrap ${
              filter === 'upcoming'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-xs font-bold uppercase whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
        </div>

        {filteredClasses.length === 0 ? (
          <div className="bg-white p-12 shadow-sm text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-xl font-bold text-black mb-2">
              {filter === 'all' ? 'No Classes Yet' : `No ${filter} Classes`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't registered for any classes yet."
                : `You don't have any ${filter} classes.`}
            </p>
            <Link
              href="/classes"
              className="inline-block px-6 py-3 bg-black text-white text-xs font-bold tracking-wider uppercase hover:bg-gray-800 transition-colors"
            >
              Browse Available Classes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClasses.map((classBooking) => (
              <div key={classBooking.id} className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-lg font-bold text-black">{classBooking.class_title}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                          statusColors[classBooking.status]
                        }`}
                      >
                        {classBooking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Instructor: {classBooking.instructor_name}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(classBooking.class_date), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {classBooking.start_time} - {classBooking.end_time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {classBooking.seats_booked} / {classBooking.total_seats} seats
                      </div>
                    </div>
                  </div>

                  {classBooking.status === 'upcoming' && (
                    <button
                      onClick={() => handleCancelBooking(classBooking.id)}
                      className="px-4 py-2 border-2 border-red-300 text-red-700 text-xs font-bold uppercase hover:border-red-600 hover:text-red-600 transition-colors whitespace-nowrap"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
