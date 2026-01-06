'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  items: OrderItem[];
  createdAt: string;
  pickupDate?: string;
  pickupTime?: string;
  paymentMethod?: 'in-store' | 'online';
  paymentStatus?: 'pending' | 'paid';
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
}

interface PickupDateInfo {
  date: string;
  earliestTime: string;
  latestTime: string;
}

export default function OrdersManagementPage() {
  const { user, isAuthenticated, isEmployee, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed'>('all');
  const [loading, setLoading] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [availablePickupDates, setAvailablePickupDates] = useState<PickupDateInfo[]>([]);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupDate: '',
    paymentMethod: 'in-store' as 'in-store' | 'online',
    items: [] as OrderItem[],
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

  // Fetch available pickup dates from schedule
  useEffect(() => {
    const fetchPickupDates = async () => {
      try {
        const response = await fetch('/api/employee/schedule');
        if (response.ok) {
          const data = await response.json();
          const shifts: Shift[] = data.shifts || [];

          // Group shifts by date and calculate time ranges
          const dateMap = new Map<string, { earliest: Date; latest: Date }>();

          shifts.forEach(shift => {
            const shiftStart = new Date(shift.startTime);
            const shiftEnd = new Date(shift.endTime);

            // Only include future shifts
            if (shiftStart > new Date()) {
              const dateKey = shiftStart.toISOString().split('T')[0];

              if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, { earliest: shiftStart, latest: shiftEnd });
              } else {
                const existing = dateMap.get(dateKey)!;
                if (shiftStart < existing.earliest) {
                  existing.earliest = shiftStart;
                }
                if (shiftEnd > existing.latest) {
                  existing.latest = shiftEnd;
                }
              }
            }
          });

          // Convert to PickupDateInfo array
          const pickupDates: PickupDateInfo[] = Array.from(dateMap.entries()).map(([date, times]) => ({
            date,
            earliestTime: times.earliest.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            latestTime: times.latest.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          })).sort((a, b) => a.date.localeCompare(b.date));

          setAvailablePickupDates(pickupDates);
        }
      } catch (error) {
        console.error('Error fetching pickup dates:', error);
      }
    };

    if (isAuthenticated && isEmployee) {
      fetchPickupDates();
    }
  }, [isAuthenticated, isEmployee]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    if (isAuthenticated && isEmployee) {
      fetchOrders();
    }
  }, [isAuthenticated, isEmployee]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.customerName || !newOrder.customerEmail || !newOrder.pickupDate || newOrder.items.length === 0) {
      alert('Please fill in all required fields and add at least one item');
      return;
    }

    setLoading(true);
    try {
      const total = newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

      const selectedDateInfo = availablePickupDates.find(d => d.date === newOrder.pickupDate);
      const pickupTimeRange = selectedDateInfo
        ? `${selectedDateInfo.earliestTime} - ${selectedDateInfo.latestTime}`
        : '';

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber,
          customerName: newOrder.customerName,
          customerEmail: newOrder.customerEmail,
          customerPhone: newOrder.customerPhone,
          total,
          status: 'pending',
          items: newOrder.items,
          pickupDate: newOrder.pickupDate,
          pickupTime: pickupTimeRange,
          paymentMethod: newOrder.paymentMethod,
          paymentStatus: newOrder.paymentMethod === 'online' ? 'paid' : 'pending',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      // Refresh orders list
      const ordersResponse = await fetch('/api/orders');
      if (ordersResponse.ok) {
        const data = await ordersResponse.json();
        setOrders(data.orders || []);
      }

      setShowCreateOrder(false);
      setNewOrder({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        pickupDate: '',
        paymentMethod: 'in-store',
        items: [],
      });

      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const addOrderItem = () => {
    const itemName = prompt('Enter item name:');
    const itemQuantity = prompt('Enter quantity:');
    const itemPrice = prompt('Enter price per item:');

    if (itemName && itemQuantity && itemPrice) {
      const newItem: OrderItem = {
        id: String(Date.now()),
        name: itemName,
        quantity: parseInt(itemQuantity),
        price: parseFloat(itemPrice),
      };
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, newItem],
      });
    }
  };

  const removeOrderItem = (itemId: string) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter(item => item.id !== itemId),
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isEmployee) {
    return null;
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const title = 'ORDER MANAGEMENT';

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">ORDERS</h1>
              <p className="text-white/60 text-sm mt-1">View and manage all customer orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="py-8 bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    filter === f
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  {f} ({f === 'all' ? orders.length : orders.filter(o => o.status === f).length})
                </button>
              ))}
            </div>
            {(isAdmin || user?.user_metadata?.role === 'manager') && (
              <button
                onClick={() => setShowCreateOrder(true)}
                className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
              >
                + Create Order
              </button>
            )}
          </div>

          {availablePickupDates.length > 0 && (
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-bold text-blue-900">
                  Pickup available on {availablePickupDates.length} upcoming day{availablePickupDates.length !== 1 ? 's' : ''} when staff are working
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase">Create New Order</h2>
                <button
                  onClick={() => setShowCreateOrder(false)}
                  className="text-gray-400 hover:text-black"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-black mb-4 uppercase">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Name *</label>
                    <input
                      type="text"
                      value={newOrder.customerName}
                      onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Email *</label>
                    <input
                      type="email"
                      value={newOrder.customerEmail}
                      onChange={(e) => setNewOrder({ ...newOrder, customerEmail: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Phone</label>
                    <input
                      type="tel"
                      value={newOrder.customerPhone}
                      onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
                      placeholder="(403) 555-0100"
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Details */}
              <div>
                <h3 className="text-lg font-black mb-4 uppercase">Pickup Details</h3>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Pickup Date *</label>
                  <select
                    value={newOrder.pickupDate}
                    onChange={(e) => setNewOrder({ ...newOrder, pickupDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
                  >
                    <option value="">Select a date when staff are working</option>
                    {availablePickupDates.map(dateInfo => (
                      <option key={dateInfo.date} value={dateInfo.date}>
                        {new Date(dateInfo.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>

                {newOrder.pickupDate && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-bold text-green-900 uppercase">Pickup Time Window</span>
                    </div>
                    <p className="text-sm text-green-800 ml-7 font-bold">
                      {availablePickupDates.find(d => d.date === newOrder.pickupDate)?.earliestTime} - {availablePickupDates.find(d => d.date === newOrder.pickupDate)?.latestTime}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-black mb-4 uppercase">Payment Method</h3>
                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-colors ${
                    newOrder.paymentMethod === 'in-store'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="in-store"
                        checked={newOrder.paymentMethod === 'in-store'}
                        onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value as 'in-store' | 'online' })}
                        className="w-4 h-4"
                      />
                      <div>
                        <span className="text-sm font-bold">Pay in Store</span>
                        <p className="text-xs text-gray-500">Customer pays when picking up</p>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-colors ${
                    newOrder.paymentMethod === 'online'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={newOrder.paymentMethod === 'online'}
                        onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value as 'in-store' | 'online' })}
                        className="w-4 h-4"
                      />
                      <div>
                        <span className="text-sm font-bold">Pay Online</span>
                        <p className="text-xs text-gray-500">Customer already paid</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black uppercase">Order Items</h3>
                  <button
                    onClick={addOrderItem}
                    className="px-4 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 transition-all"
                  >
                    + Add Item
                  </button>
                </div>
                {newOrder.items.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
                    <p className="text-gray-500">No items added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {newOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 border-2 border-gray-200 rounded">
                        <div className="flex-1">
                          <div className="font-bold">{item.name}</div>
                          <div className="text-sm text-gray-600">Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="font-black text-lg">${(item.quantity * item.price).toFixed(2)}</div>
                          <button
                            onClick={() => removeOrderItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-4 bg-black text-white rounded font-black text-xl">
                      <span>Total:</span>
                      <span>${newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCreateOrder}
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-black text-white text-sm font-bold uppercase hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg"
                >
                  {loading ? 'Creating...' : 'Create Order'}
                </button>
                <button
                  onClick={() => setShowCreateOrder(false)}
                  className="px-6 py-4 bg-white text-black text-sm font-bold uppercase hover:bg-gray-100 transition-all border-2 border-black"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Grid */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg font-bold">No orders found</p>
              <p className="text-gray-400 text-sm mt-2">Orders will appear here once created</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-black text-black uppercase">{order.orderNumber}</h3>
                        <p className="text-base font-bold text-gray-700 mt-1">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.customerEmail}</p>
                        {order.customerPhone && (
                          <p className="text-sm text-gray-600">{order.customerPhone}</p>
                        )}
                      </div>
                      <span className={`px-3 py-2 text-xs font-bold uppercase rounded-lg ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Pickup Information */}
                    {order.pickupDate && (
                      <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-bold text-blue-900 uppercase">Pickup Details</span>
                        </div>
                        <div className="text-sm text-blue-800">
                          <div className="font-bold">{new Date(order.pickupDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                          {order.pickupTime && <div className="mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold">{order.pickupTime}</span>
                          </div>}
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                            <div>
                              <div className="font-bold">{item.name}</div>
                              <div className="text-xs text-gray-600">Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                            </div>
                            <div className="font-bold">${(item.quantity * item.price).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                      <div className="flex justify-between text-base">
                        <span className="font-bold text-gray-700 uppercase">Total:</span>
                        <span className="font-black text-2xl">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ordered:</span>
                        <span className="font-bold">{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      {order.paymentMethod && (
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Payment:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{order.paymentMethod === 'in-store' ? 'Pay in Store' : 'Online'}</span>
                            <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                              order.paymentStatus === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.paymentStatus || 'pending'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-200 p-4 bg-gray-50">
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                      Update Status:
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded text-sm font-bold focus:outline-none focus:border-black"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready for Pickup</option>
                      <option value="completed">Completed</option>
                    </select>
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
