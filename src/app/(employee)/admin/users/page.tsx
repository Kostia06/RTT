'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, DollarSign, Users, Shield, Ban } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  payRate?: number;
  created_at: string;
  banned: boolean;
  banned_until: string | null;
  last_sign_in_at: string | null;
}

export default function AdminUsersPage() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'employee' | 'customer' | 'banned'>('all');
  const [editingPayRateId, setEditingPayRateId] = useState<string | null>(null);
  const [editingPayRate, setEditingPayRate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [banningUserId, setBanningUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);


  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`Role updated successfully`);
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to update role');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to update role');
      console.error('Error updating role:', err);
    }
  };

  const banUser = async (userId: string, duration: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ban: { duration } }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`User banned successfully`);
        fetchUsers();
        setBanningUserId(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to ban user');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to ban user');
      console.error('Error banning user:', err);
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unban: true }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`User unbanned successfully`);
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to unban user');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to unban user');
      console.error('Error unbanning user:', err);
    }
  };

  const updatePayRate = async (userId: string) => {
    try {
      const payRate = parseFloat(editingPayRate);
      if (isNaN(payRate) || payRate < 0) {
        setError('Invalid pay rate. Must be a positive number.');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}/pay-rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payRate }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`Pay rate updated successfully`);
        fetchUsers();
        setEditingPayRateId(null);
        setEditingPayRate('');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to update pay rate');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to update pay rate');
      console.error('Error updating pay rate:', err);
    }
  };

  const startEditPayRate = (userId: string, currentRate: number) => {
    setEditingPayRateId(userId);
    setEditingPayRate(currentRate?.toString() || '0');
  };

  const cancelEditPayRate = () => {
    setEditingPayRateId(null);
    setEditingPayRate('');
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'all' ? true :
                         filter === 'banned' ? u.banned :
                         u.role === filter;
    const matchesSearch = searchQuery === '' ||
                         u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    employees: users.filter(u => u.role === 'employee').length,
    customers: users.filter(u => u.role === 'customer').length,
    banned: users.filter(u => u.banned).length,
  };

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
              <Users className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">Users</h1>
              <p className="text-white/60 text-sm mt-1">Manage accounts and permissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-black">{stats.total}</div>
            <div className="text-xs text-gray-600 uppercase mt-1">Total</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-black text-purple-600">{stats.admins}</div>
            <div className="text-xs text-gray-600 uppercase mt-1">Admins</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-black text-blue-600">{stats.employees}</div>
            <div className="text-xs text-gray-600 uppercase mt-1">Employees</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-black text-green-600">{stats.customers}</div>
            <div className="text-xs text-gray-600 uppercase mt-1">Customers</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-black text-red-600">{stats.banned}</div>
            <div className="text-xs text-gray-600 uppercase mt-1">Banned</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'admin', 'employee', 'customer', 'banned'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 text-sm font-bold rounded transition-colors ${
                    filter === f
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 mb-4">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 p-4 mb-4">
            <p className="text-sm text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((u) => {
              const isCurrentUser = u.id === user?.id;
              return (
                <div
                  key={u.id}
                  className={`bg-white border border-gray-200 p-4 ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{u.name}</h3>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded">You</span>
                        )}
                        {u.banned ? (
                          <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-800 rounded">Banned</span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{u.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600">Role</label>
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                        disabled={isCurrentUser}
                        className="px-3 py-2 border border-gray-300 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="customer">Customer</option>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Pay Rate */}
                    {u.role !== 'customer' && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600">Pay Rate</label>
                        {editingPayRateId === u.id ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border-2 border-black rounded px-2 py-1">
                              <span className="text-sm font-bold">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editingPayRate}
                                onChange={(e) => setEditingPayRate(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') updatePayRate(u.id);
                                  if (e.key === 'Escape') cancelEditPayRate();
                                }}
                                className="w-20 px-1 font-bold text-sm focus:outline-none"
                                autoFocus
                              />
                              <span className="text-xs text-gray-600">/hr</span>
                            </div>
                            <button
                              onClick={() => updatePayRate(u.id)}
                              className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={cancelEditPayRate}
                              className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditPayRate(u.id, u.payRate || 0)}
                            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded font-bold text-sm hover:bg-gray-100 transition-colors text-left"
                          >
                            ${u.payRate?.toFixed(2) || '0.00'}/hr
                          </button>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {!isCurrentUser && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-600">Actions</label>
                        {u.banned ? (
                          <button
                            onClick={() => unbanUser(u.id)}
                            className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition-colors"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => setBanningUserId(u.id)}
                            className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {banningUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded max-w-sm w-full p-6">
            <h2 className="text-xl font-black mb-4">Ban User</h2>
            <p className="text-sm text-gray-600 mb-6">Select ban duration:</p>
            <div className="space-y-2">
              <button
                onClick={() => banUser(banningUserId, 'hour')}
                className="w-full px-4 py-3 bg-gray-100 text-gray-900 font-bold rounded hover:bg-gray-200 transition-colors text-left"
              >
                1 Hour
              </button>
              <button
                onClick={() => banUser(banningUserId, 'day')}
                className="w-full px-4 py-3 bg-gray-100 text-gray-900 font-bold rounded hover:bg-gray-200 transition-colors text-left"
              >
                1 Day
              </button>
              <button
                onClick={() => banUser(banningUserId, 'week')}
                className="w-full px-4 py-3 bg-gray-100 text-gray-900 font-bold rounded hover:bg-gray-200 transition-colors text-left"
              >
                1 Week
              </button>
              <button
                onClick={() => banUser(banningUserId, 'permanent')}
                className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors text-left"
              >
                Permanent
              </button>
            </div>
            <button
              onClick={() => setBanningUserId(null)}
              className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
