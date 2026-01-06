'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { ProductionItem, ShiftProductionAssignment } from '@/types/production';
import CreateShiftFullPageModal from '@/components/schedule/CreateShiftFullPageModal';

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  productionAssignments?: (ShiftProductionAssignment & { production_item: ProductionItem })[];
}

export default function SchedulePage() {
  const { user, isAuthenticated, isEmployee, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isEmployee) {
      fetchShifts();
    }
  }, [isAuthenticated, isEmployee]);

  const fetchShifts = async () => {
    try {
      const url = isAdmin
        ? '/api/employee/schedule?includeProduction=true'
        : `/api/employee/schedule?employeeId=${user?.id}&includeProduction=true`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setShifts(data.shifts);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isEmployee) return null;

  const upcomingShifts = shifts.filter(s => new Date(s.startTime) > new Date());
  const statusColors = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white pt-16 sm:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white text-black flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">SCHEDULE</h1>
                <p className="text-white/60 text-sm mt-1">View {isAdmin ? 'all' : 'your'} upcoming shifts</p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-black px-4 py-2 hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Create Shift
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Shifts Summary */}
      <div className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 shadow-sm">
              <div className="text-3xl font-black text-black mb-2">{upcomingShifts.length}</div>
              <div className="text-xs tracking-[0.15em] uppercase text-gray-500">Upcoming Shifts</div>
            </div>
            <div className="bg-white p-6 shadow-sm">
              <div className="text-3xl font-black text-black mb-2">
                {shifts.filter(s => s.status === 'confirmed').length}
              </div>
              <div className="text-xs tracking-[0.15em] uppercase text-gray-500">Confirmed</div>
            </div>
            <div className="bg-white p-6 shadow-sm">
              <div className="text-3xl font-black text-black mb-2">
                {shifts.filter(s => s.status === 'scheduled').length}
              </div>
              <div className="text-xs tracking-[0.15em] uppercase text-gray-500">Awaiting Confirmation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Shifts List */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black mb-6">All Shifts</h2>
          <div className="space-y-4">
            {shifts.map(shift => (
              <div key={shift.id} className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-black">{shift.position}</h3>
                      <span className={`px-3 py-1 text-xs font-bold uppercase rounded ${statusColors[shift.status]}`}>
                        {shift.status}
                      </span>
                    </div>
                    {isAdmin && (
                      <p className="text-sm text-gray-600 mb-2">Employee: {shift.employeeName}</p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {format(new Date(shift.startTime), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {format(new Date(shift.startTime), 'h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}
                      </div>
                    </div>
                    {shift.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">{shift.notes}</p>
                    )}
                    {shift.productionAssignments && shift.productionAssignments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Production Tasks:</p>
                        <div className="space-y-1">
                          {shift.productionAssignments.map((assignment) => (
                            <div key={assignment.id} className="text-sm text-gray-700 flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <span className="font-medium">{assignment.production_item?.name || 'Unknown Item'}</span>
                              <span className="text-gray-500">- {assignment.bins_required} bins ({assignment.target_portions} portions)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {shift.status === 'scheduled' && !isAdmin && (
                    <button
                      onClick={() => handleConfirmShift(shift.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            ))}
            {shifts.length === 0 && (
              <div className="bg-white border border-gray-200 p-12 text-center text-gray-500">
                No shifts scheduled
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Shift Modal */}
      {showCreateModal && (
        <CreateShiftFullPageModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchShifts();
          }}
        />
      )}
    </div>
  );
}
