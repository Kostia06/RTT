'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { ProductionItem, ShiftProductionAssignment } from '@/types/production';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  items: OrderItem[];
  pickupTime: string;
  paymentMethod: string;
  paymentStatus: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  position: string;
  status: string;
  productionAssignments?: (ShiftProductionAssignment & { production_item: ProductionItem })[];
}

export default function TodayPage() {
  const { user, isAuthenticated, isEmployee, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myShift, setMyShift] = useState<Shift | null>(null);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const isManager = isAdmin || user?.user_metadata?.role === 'manager';

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/login?redirect=/today');
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

  // Fetch today's orders
  useEffect(() => {
    const fetchTodayOrders = async () => {
      try {
        const response = await fetch('/api/orders/today');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Error fetching today orders:', error);
      }
    };

    if (isAuthenticated && isEmployee) {
      fetchTodayOrders();
    }
  }, [isAuthenticated, isEmployee]);

  // Fetch today's shifts
  useEffect(() => {
    const fetchTodayShifts = async () => {
      try {
        const response = await fetch('/api/employee/schedule?includeProduction=true');
        if (response.ok) {
          const data = await response.json();
          const shifts: Shift[] = data.shifts || [];

          // Get today's date
          const today = new Date().toISOString().split('T')[0];

          // Filter shifts for today
          const todayShifts = shifts.filter(shift => {
            const shiftDate = new Date(shift.startTime).toISOString().split('T')[0];
            return shiftDate === today;
          });

          setAllShifts(todayShifts);

          // Find my shift
          if (user?.id) {
            const myTodayShift = todayShifts.find(shift => shift.employeeId === user.id);
            setMyShift(myTodayShift || null);
          }
        }
      } catch (error) {
        console.error('Error fetching today shifts:', error);
      }
    };

    if (isAuthenticated && isEmployee && user) {
      fetchTodayShifts();
    }
  }, [isAuthenticated, isEmployee, user]);

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

  const title = 'TODAY';

  // Calculate total items to make
  const itemsToMake = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      const existing = acc.find(i => i.name === item.name);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        acc.push({ name: item.name, quantity: item.quantity });
      }
    });
    return acc;
  }, [] as { name: string; quantity: number }[]);

  const calculateShiftDuration = (shift: Shift) => {
    const start = new Date(shift.startTime);
    const end = new Date(shift.endTime);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white pt-16 sm:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white text-black flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">TODAY</h1>
              <p className="text-white/60 text-sm mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Shift */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">My Shift</h2>
              {myShift ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-blue-900 uppercase">{myShift.position}</span>
                      <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                        myShift.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {myShift.status}
                      </span>
                    </div>
                    <div className="text-blue-800 space-y-1">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-bold">
                          {new Date(myShift.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(myShift.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-sm">
                        Duration: <span className="font-bold">{calculateShiftDuration(myShift)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Production Tasks */}
                  {myShift.productionAssignments && myShift.productionAssignments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider mb-3">Production Tasks:</h3>
                      <div className="space-y-2">
                        {myShift.productionAssignments.map((assignment) => (
                          <div key={assignment.id} className="p-3 bg-white border-2 border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-black">{assignment.production_item?.name || 'Unknown Item'}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">{assignment.bins_required} bins</span>
                                  {' • '}
                                  <span className="font-medium">{assignment.target_portions} portions target</span>
                                </div>
                                {assignment.notes && (
                                  <div className="text-xs text-gray-500 mt-1 italic">{assignment.notes}</div>
                                )}
                              </div>
                              <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                                assignment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : assignment.status === 'in_progress'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {assignment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No shift scheduled for today</p>
                </div>
              )}
            </div>

            {/* Orders Summary */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Orders Today</h2>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-center">
                      <div className="text-3xl font-black text-black">{orders.length}</div>
                      <div className="text-xs text-gray-600 uppercase tracking-wider mt-1">Total Orders</div>
                    </div>
                    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
                      <div className="text-3xl font-black text-yellow-800">
                        {orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}
                      </div>
                      <div className="text-xs text-yellow-800 uppercase tracking-wider mt-1">To Prepare</div>
                    </div>
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                      <div className="text-3xl font-black text-green-800">
                        {orders.filter(o => o.status === 'ready' || o.status === 'completed').length}
                      </div>
                      <div className="text-xs text-green-800 uppercase tracking-wider mt-1">Ready/Done</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No orders for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Items to Make */}
          {itemsToMake.length > 0 && (
            <div className="mt-8 bg-white border-2 border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">What to Make Today</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {itemsToMake.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-black">{item.name}</span>
                      <span className="text-2xl font-black text-black">×{item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manager View: All Employees Today */}
          {isManager && allShifts.length > 0 && (
            <div className="mt-8 bg-white border-2 border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Team Working Today</h2>
              <div className="space-y-3">
                {allShifts.map((shift) => (
                  <div key={shift.id} className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-lg">{shift.employeeName}</h3>
                        <p className="text-sm text-gray-600 uppercase">{shift.position}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">
                          {new Date(shift.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(shift.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {calculateShiftDuration(shift)}
                        </div>
                      </div>
                    </div>

                    {/* Production Tasks for this shift */}
                    {shift.productionAssignments && shift.productionAssignments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Production Tasks:</p>
                        <div className="space-y-1">
                          {shift.productionAssignments.map((assignment) => (
                            <div key={assignment.id} className="text-sm text-gray-700 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                <span className="font-medium">{assignment.production_item?.name || 'Unknown Item'}</span>
                                <span className="text-gray-500 text-xs">
                                  {assignment.bins_required} bins • {assignment.target_portions} portions
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${
                                assignment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : assignment.status === 'in_progress'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {assignment.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
