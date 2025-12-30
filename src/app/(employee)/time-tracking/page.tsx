'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { format } from 'date-fns';
import QRCodeDisplay from '@/components/time-tracking/QRCodeDisplay';
import ScheduleCalendar from '@/components/time-tracking/ScheduleCalendar';
import HoursReport from '@/components/time-tracking/HoursReport';

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  date: string;
  notes?: string;
  isManual?: boolean;
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export default function TimeTrackingPage() {
  const { user, isAuthenticated, isEmployee, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    clockIn: '',
    clockOut: '',
    notes: ''
  });

  // QR Code state (admin only)
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [clockInUrl, setClockInUrl] = useState<string>('');
  const [loadingQR, setLoadingQR] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [qrMessage, setQrMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Schedule state
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [showCreateShift, setShowCreateShift] = useState(false);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);
  const [newShift, setNewShift] = useState({
    employeeId: '',
    employeeName: '',
    startTime: '',
    endTime: '',
    position: '',
    notes: '',
  });

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
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out', delay: 0.2 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isAuthenticated && isEmployee) {
      fetchEntries();
      fetchShifts();
    }
  }, [isAuthenticated, isEmployee]);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/employee/time-tracking?employeeId=${user?.id}`);
      const data = await response.json();
      if (response.ok) {
        setEntries(data.entries);
        const active = data.entries.find((e: TimeEntry) => !e.clockOut);
        setActiveEntry(active || null);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleClockIn = async () => {
    if (activeEntry) return;

    setLoading(true);
    try {
      const response = await fetch('/api/employee/time-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clockIn' }),
      });

      const data = await response.json();
      if (response.ok) {
        await fetchEntries();
      } else {
        alert(data.error || 'Failed to clock in');
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      alert('Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeEntry) return;

    setLoading(true);
    try {
      const response = await fetch('/api/employee/time-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clockOut', entryId: activeEntry.id }),
      });

      const data = await response.json();
      if (response.ok) {
        await fetchEntries();
      } else {
        alert(data.error || 'Failed to clock out');
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      alert('Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualEntry.clockIn || !manualEntry.clockOut) {
      alert('Please fill in both clock in and clock out times');
      return;
    }

    setLoading(true);
    try {
      const clockInDateTime = `${manualEntry.date}T${manualEntry.clockIn}`;
      const clockOutDateTime = `${manualEntry.date}T${manualEntry.clockOut}`;

      const response = await fetch('/api/employee/time-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manualEntry',
          clockIn: clockInDateTime,
          clockOut: clockOutDateTime,
          notes: manualEntry.notes,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        await fetchEntries();
        setShowManualEntry(false);
        setManualEntry({
          date: format(new Date(), 'yyyy-MM-dd'),
          clockIn: '',
          clockOut: '',
          notes: ''
        });
        alert('Manual entry added successfully');
      } else {
        alert(data.error || 'Failed to create manual entry');
      }
    } catch (error) {
      console.error('Error creating manual entry:', error);
      alert('Failed to create manual entry');
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async () => {
    if (!isAdmin) return;

    setLoadingQR(true);
    setQrMessage(null);
    try {
      const response = await fetch('/api/admin/qr-codes');
      const data = await response.json();

      if (response.ok) {
        setQrCodeUrl(data.qrCodeUrl);
        setClockInUrl(data.clockInUrl);
      } else {
        setQrMessage({ type: 'error', text: data.error || 'Failed to load QR code' });
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      setQrMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoadingQR(false);
    }
  };

  const handleRegenerateQR = async () => {
    setRegenerating(true);
    setQrMessage(null);
    setShowConfirm(false);

    try {
      const response = await fetch('/api/admin/qr-codes', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setQrCodeUrl(data.qrCodeUrl);
        setClockInUrl(data.clockInUrl);
        setQrMessage({ type: 'success', text: 'QR code regenerated successfully! Please print and replace the old QR code.' });
      } else {
        setQrMessage({ type: 'error', text: data.error || 'Failed to regenerate QR code' });
      }
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      setQrMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleQRCode = () => {
    if (!showQRCode && !qrCodeUrl) {
      fetchQRCode();
    }
    setShowQRCode(!showQRCode);
  };

  const fetchShifts = async () => {
    try {
      const url = isAdmin
        ? '/api/employee/schedule'
        : `/api/employee/schedule?employeeId=${user?.id}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setShifts(data.shifts);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      console.log('Fetched users:', data.users?.length);

      if (response.ok && data.users) {
        // Include all staff members who can be assigned shifts (employees, admins, managers, etc.)
        const employeeUsers = data.users.filter((u: any) => {
          // API returns role at top level, not nested in user_metadata
          const role = u.role;
          console.log('User:', u.email, 'Role:', role);
          // Include anyone with a staff role (exclude only 'customer' role)
          return role !== 'customer';
        }).map((u: any) => ({
          id: u.id,
          name: u.name || u.email || 'Unknown',
          email: u.email,
          role: u.role || 'employee',
        })).sort((a: any, b: any) => {
          // Sort alphabetically by name
          return a.name.localeCompare(b.name);
        });

        console.log('Filtered employees:', employeeUsers);
        setEmployees(employeeUsers);
      } else {
        console.error('Failed to fetch users:', data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedEmployee = employees.find(emp => emp.id === selectedId);
    if (selectedEmployee) {
      setNewShift({
        ...newShift,
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
      });
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newShift.employeeId || !newShift.employeeName || !newShift.startTime || !newShift.endTime || !newShift.position) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/employee/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift),
      });

      const data = await response.json();
      if (response.ok) {
        await fetchShifts();
        setShowCreateShift(false);
        setNewShift({
          employeeId: '',
          employeeName: '',
          startTime: '',
          endTime: '',
          position: '',
          notes: '',
        });
        alert('Shift created successfully');
      } else {
        alert(data.error || 'Failed to create shift');
      }
    } catch (error) {
      console.error('Error creating shift:', error);
      alert('Failed to create shift');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmShift = async (shiftId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/employee/schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shiftId, status: 'confirmed' }),
      });

      if (response.ok) {
        await fetchShifts();
        alert('Shift confirmed successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to confirm shift');
      }
    } catch (error) {
      console.error('Error confirming shift:', error);
      alert('Failed to confirm shift');
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (date: Date) => {
    if (!isAdmin) return;

    // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Set default start time to 9:00 AM and end time to 5:00 PM
    const startTime = `${dateString}T09:00`;
    const endTime = `${dateString}T17:00`;

    // Pre-fill the form with the selected date
    setNewShift({
      ...newShift,
      startTime,
      endTime,
    });

    // Open the create shift form
    setShowCreateShift(true);

    // Scroll to the form
    setTimeout(() => {
      const form = document.querySelector('.create-shift-form');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isEmployee) return null;

  const title = 'TIME TRACKING';
  const totalHoursThisWeek = entries
    .filter(e => e.totalHours)
    .reduce((sum, e) => sum + (e.totalHours || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      <div ref={heroRef} className="relative bg-black text-white pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="relative py-12 sm:py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs uppercase tracking-wider mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
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
            <p className="text-sm sm:text-base text-white/60 max-w-2xl">
              Track your work hours and manage time entries
            </p>
          </div>
        </div>
      </div>

      {/* Main Time Tracking Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Quick Actions Card */}
          <div className="bg-white p-8 shadow-sm border-2 border-gray-200">
            <h2 className="text-2xl font-black mb-6">QUICK ACTIONS</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Current Status */}
              <div className="md:col-span-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Current Status</h3>
                    {activeEntry ? (
                      <>
                        <p className="text-xl text-green-600 font-black">CLOCKED IN</p>
                        <p className="text-sm text-gray-600">
                          Since {(() => {
                            let clockInStr = activeEntry.clockIn;
                            if (!clockInStr.endsWith('Z') && !clockInStr.includes('+') && !clockInStr.includes('-', 10)) {
                              clockInStr = clockInStr + 'Z';
                            }
                            return new Date(clockInStr).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            });
                          })()}
                        </p>
                      </>
                    ) : (
                      <p className="text-xl text-gray-500 font-black">NOT CLOCKED IN</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 w-full sm:w-auto">
                    {!activeEntry ? (
                      <button
                        onClick={handleClockIn}
                        disabled={loading}
                        className="px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {loading ? 'Processing...' : 'Clock In'}
                      </button>
                    ) : (
                      <button
                        onClick={handleClockOut}
                        disabled={loading}
                        className="px-8 py-4 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {loading ? 'Processing...' : 'Clock Out'}
                      </button>
                    )}
                    <button
                      onClick={() => setShowManualEntry(!showManualEntry)}
                      className="px-6 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all border-2 border-black"
                    >
                      {showManualEntry ? 'Cancel Manual Entry' : 'Add Manual Entry'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Hours Summary */}
              <div className="bg-gray-50 p-6 border-2 border-gray-200">
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">This Week</h3>
                <p className="text-3xl font-black text-black">{totalHoursThisWeek.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Hours</p>
              </div>
            </div>

            {/* Manual Entry Form */}
            {showManualEntry && (
              <form onSubmit={handleManualEntry} className="mt-6 pt-6 border-t-2 border-gray-200">
                <h3 className="text-lg font-black mb-4">MANUAL TIME ENTRY</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={manualEntry.date}
                      onChange={(e) => setManualEntry({...manualEntry, date: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Clock In Time</label>
                    <input
                      type="time"
                      value={manualEntry.clockIn}
                      onChange={(e) => setManualEntry({...manualEntry, clockIn: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Clock Out Time</label>
                    <input
                      type="time"
                      value={manualEntry.clockOut}
                      onChange={(e) => setManualEntry({...manualEntry, clockOut: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={manualEntry.notes}
                    onChange={(e) => setManualEntry({...manualEntry, notes: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black"
                    rows={3}
                    placeholder="Add notes about this entry..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Saving...' : 'Save Manual Entry'}
                </button>
              </form>
            )}

            {/* QR Code Section - Admin Only */}
            {isAdmin && (
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black">EMPLOYEE QR CODE</h3>
                  <button
                    onClick={handleToggleQRCode}
                    className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-all"
                  >
                    {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
                  </button>
                </div>

                {showQRCode && (
                  <div className="space-y-4">
                    {loadingQR ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
                      </div>
                    ) : (
                      <>
                        {qrMessage && (
                          <div
                            className={`p-4 border-2 text-sm font-medium ${
                              qrMessage.type === 'success'
                                ? 'bg-green-50 border-green-300 text-green-800'
                                : 'bg-red-50 border-red-300 text-red-800'
                            }`}
                          >
                            {qrMessage.text}
                          </div>
                        )}

                        {qrCodeUrl && <QRCodeDisplay qrCodeUrl={qrCodeUrl} displayUrl={clockInUrl} />}

                        {/* Regenerate Section */}
                        <div className="bg-gray-50 border-2 border-gray-200 p-6">
                          <h4 className="text-sm font-black mb-2">REGENERATE QR CODE</h4>
                          <p className="text-xs text-gray-600 mb-4">
                            This will invalidate the current QR code. You&apos;ll need to print and replace it.
                          </p>

                          {!showConfirm ? (
                            <button
                              onClick={() => setShowConfirm(true)}
                              className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all border-2 border-black"
                            >
                              Regenerate QR Code
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-red-600 font-bold text-xs">
                                Are you sure? This will invalidate the current QR code.
                              </p>
                              <div className="flex gap-3">
                                <button
                                  onClick={handleRegenerateQR}
                                  disabled={regenerating}
                                  className="px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all disabled:bg-gray-400"
                                >
                                  {regenerating ? 'Regenerating...' : 'Yes, Regenerate'}
                                </button>
                                <button
                                  onClick={() => setShowConfirm(false)}
                                  disabled={regenerating}
                                  className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all border-2 border-black disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border-2 border-blue-200 p-6">
                          <h4 className="text-sm font-black mb-3">HOW TO USE</h4>
                          <ol className="space-y-2 text-xs text-gray-700">
                            <li className="flex gap-3">
                              <span className="flex-shrink-0 w-5 h-5 bg-black text-white flex items-center justify-center font-bold text-xs">1</span>
                              <span>Print the QR code using the button above</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="flex-shrink-0 w-5 h-5 bg-black text-white flex items-center justify-center font-bold text-xs">2</span>
                              <span>Post it near your time clock location</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="flex-shrink-0 w-5 h-5 bg-black text-white flex items-center justify-center font-bold text-xs">3</span>
                              <span>Employees scan with their phone to clock in/out</span>
                            </li>
                          </ol>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Time Entries History */}
          <div className="bg-white p-8 shadow-sm border-2 border-gray-200">
            <h2 className="text-2xl font-black mb-6">RECENT ENTRIES</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map(entry => {
                  // Helper to add Z for UTC parsing if needed
                  const parseUTC = (timestamp: string) => {
                    let str = timestamp;
                    if (!str.endsWith('Z') && !str.includes('+') && !str.includes('-', 10)) {
                      str = str + 'Z';
                    }
                    return new Date(str);
                  };

                  const clockInTime = parseUTC(entry.clockIn).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });

                  const clockOutTime = entry.clockOut ? parseUTC(entry.clockOut).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  }) : '-';

                  return (
                    <tr key={entry.id} className={!entry.clockOut ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseUTC(entry.clockIn).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {clockInTime} - {clockOutTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {entry.totalHours ? `${entry.totalHours.toFixed(2)} hrs` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.isManual ? (
                          <span className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded">Manual</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-800 rounded">Auto</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.clockOut ? (
                          <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-800 rounded">Completed</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded">Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No time entries found. Clock in to start tracking your time.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white p-8 shadow-sm border-2 border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">MY SCHEDULE</h2>
              {isAdmin && (
                <button
                  onClick={() => {
                    if (!showCreateShift && employees.length === 0) {
                      fetchEmployees();
                    }
                    setShowCreateShift(!showCreateShift);
                  }}
                  className="px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-all"
                >
                  {showCreateShift ? 'Cancel' : 'Create Shift'}
                </button>
              )}
            </div>

            {/* Create Shift Form - Admin Only */}
            {isAdmin && showCreateShift && (
              <div className="create-shift-form mb-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 border-2 border-black shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black">CREATE NEW SHIFT</h3>
                </div>

                <form onSubmit={handleCreateShift} className="space-y-6">
                  {/* Employee Selection */}
                  <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Select Staff Member
                      </label>
                      <span className="text-xs text-gray-500">
                        {employees.length} staff member{employees.length !== 1 ? 's' : ''} available
                      </span>
                    </div>
                    <select
                      value={newShift.employeeId}
                      onChange={handleEmployeeSelect}
                      className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                      required
                    >
                      <option value="">
                        {employees.length > 0 ? 'Choose a staff member...' : 'Loading staff members...'}
                      </option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.role.toUpperCase()} ({emp.email})
                        </option>
                      ))}
                    </select>
                    {newShift.employeeId && (
                      <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-bold text-green-800">
                              Selected: {newShift.employeeName}
                            </p>
                            <p className="text-xs text-green-700">
                              {employees.find(e => e.id === newShift.employeeId)?.role.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
                      Shift Time
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Start Time
                        </label>
                        <input
                          type="datetime-local"
                          value={newShift.startTime}
                          onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                          className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          End Time
                        </label>
                        <input
                          type="datetime-local"
                          value={newShift.endTime}
                          onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                          className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Position & Notes */}
                  <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">
                      Additional Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Position/Role
                        </label>
                        <input
                          type="text"
                          value={newShift.position}
                          onChange={(e) => setNewShift({...newShift, position: e.target.value})}
                          className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                          placeholder="e.g., Kitchen Staff, Server, Manager"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Notes <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={newShift.notes}
                          onChange={(e) => setNewShift({...newShift, notes: e.target.value})}
                          className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
                          placeholder="e.g., Morning shift, Training day"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Creating Shift...
                        </span>
                      ) : (
                        'Create Shift'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateShift(false)}
                      className="px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all rounded border-2 border-black"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Schedule Calendar */}
            <ScheduleCalendar
              shifts={shifts}
              onDayClick={isAdmin ? handleDayClick : undefined}
              isAdmin={isAdmin}
            />

            {/* Hours Report */}
            <div className="mt-8">
              <HoursReport
                isAdmin={isAdmin || false}
                currentUserId={user?.id || ''}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
