'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import EmployeeSelector from '@/components/time-tracking/EmployeeSelector';
import ClockInOutButton from '@/components/time-tracking/ClockInOutButton';
import { format } from 'date-fns';

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  date: string;
  notes?: string;
}

function ClockInContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if QR mode
  const isQRMode = searchParams?.get('qr') === 'true';
  const qrToken = searchParams?.get('token');


  useEffect(() => {
    // If manual mode and user is logged in, auto-select them
    if (!isQRMode && isAuthenticated && user) {
      setSelectedEmployeeId(user.id);
      setSelectedEmployeeName(user.user_metadata?.name || user.email || 'You');
    }
  }, [isAuthenticated, user, isQRMode]);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchTimeEntries();
    }
  }, [selectedEmployeeId]);

  const fetchTimeEntries = async () => {
    if (!selectedEmployeeId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/employee/time-tracking?employeeId=${selectedEmployeeId}`);
      const data = await response.json();

      if (response.ok) {
        const entries = data.entries || [];
        // Find active entry (no clock_out)
        const active = entries.find((e: TimeEntry) => !e.clockOut);
        setActiveEntry(active || null);

        // Get recent entries (last 5, excluding active)
        const recent = entries
          .filter((e: TimeEntry) => e.clockOut)
          .slice(0, 5);
        setRecentEntries(recent);
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = (id: string, name: string) => {
    setSelectedEmployeeId(id);
    setSelectedEmployeeName(name);
  };

  const handleSuccess = () => {
    // Refresh time entries after clock in/out
    fetchTimeEntries();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white pt-16 sm:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white text-black flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">TIME CLOCK</h1>
              <p className="text-white/60 text-sm mt-1">
                {isQRMode ? 'Select your name to continue' : 'Track your work hours'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Employee Selection */}
          {(isQRMode || !isAuthenticated) && (
            <div>
              <h2 className="text-lg font-black mb-4 uppercase tracking-wide">Select Employee</h2>
              <EmployeeSelector
                onSelect={handleEmployeeSelect}
                selectedEmployeeId={selectedEmployeeId}
              />
            </div>
          )}

          {/* Auto-selected employee */}
          {!isQRMode && isAuthenticated && selectedEmployeeName && (
            <div className="bg-gray-50 border border-gray-200 p-6">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Employee</p>
              <p className="text-xl font-black">{selectedEmployeeName}</p>
            </div>
          )}

          {/* Clock In/Out Button */}
          {selectedEmployeeId && (
            <div>
              {loading ? (
                <div className="bg-white border border-gray-200 p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto" />
                  <p className="mt-4 text-gray-500 text-sm">Loading...</p>
                </div>
              ) : (
                <ClockInOutButton
                  employeeId={selectedEmployeeId}
                  employeeName={selectedEmployeeName}
                  activeEntry={activeEntry}
                  onSuccess={handleSuccess}
                />
              )}
            </div>
          )}

          {/* Recent Entries */}
          {selectedEmployeeId && recentEntries.length > 0 && (
            <div>
              <h2 className="text-lg font-black mb-4 uppercase tracking-wide">Recent Entries</h2>
              <div className="bg-white border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">In</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Out</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentEntries.map(entry => (
                      <tr key={entry.id}>
                        <td className="px-4 py-3 text-sm">
                          {format(new Date(entry.clockIn), 'MMM d')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {format(new Date(entry.clockIn), 'h:mm a')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {entry.clockOut ? format(new Date(entry.clockOut), 'h:mm a') : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold">
                          {entry.totalHours ? `${entry.totalHours}h` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No employee selected message */}
          {!selectedEmployeeId && (
            <div className="bg-gray-50 border border-gray-200 p-12 text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600 text-lg">
                {isQRMode || !isAuthenticated
                  ? 'Select your name above to get started'
                  : 'Please log in to clock in/out'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ClockInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    }>
      <ClockInContent />
    </Suspense>
  );
}
