'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

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
  const heroRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'employee' | 'customer' | 'banned'>('all');
  const [editingPayRateId, setEditingPayRateId] = useState<string | null>(null);
  const [editingPayRate, setEditingPayRate] = useState<string>('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

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
    if (filter === 'all') return true;
    if (filter === 'banned') return u.banned;
    return u.role === filter;
  });

  const title = 'USER MANAGEMENT';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="relative py-12 sm:py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Manage user accounts, roles, and permissions
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'admin', 'employee', 'customer', 'banned'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    filter === f
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {f}
                  {f !== 'all' && ` (${users.filter(u => f === 'banned' ? u.banned : u.role === f).length})`}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Total Users: <span className="font-bold">{users.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-red-50 border-l-4 border-red-600 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-green-50 border-l-4 border-green-600 p-4">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Pay Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((u) => {
                    const isCurrentUser = u.id === user?.id;
                    return (
                      <tr key={u.id} className={isCurrentUser ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {u.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-blue-600">(You)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value)}
                            disabled={isCurrentUser}
                            className="text-xs font-semibold uppercase px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="customer">Customer</option>
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {u.role !== 'customer' ? (
                            editingPayRateId === u.id ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-sm font-bold">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editingPayRate}
                                  onChange={(e) => setEditingPayRate(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updatePayRate(u.id);
                                    } else if (e.key === 'Escape') {
                                      cancelEditPayRate();
                                    }
                                  }}
                                  className="w-20 px-2 py-1 border-2 border-black rounded text-right font-bold text-sm"
                                  autoFocus
                                />
                                <span className="text-xs text-gray-600">/hr</span>
                                <button
                                  onClick={() => updatePayRate(u.id)}
                                  className="p-1 text-green-600 hover:text-green-800"
                                  title="Save"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={cancelEditPayRate}
                                  className="p-1 text-red-600 hover:text-red-800"
                                  title="Cancel"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditPayRate(u.id, u.payRate || 0)}
                                className="text-sm font-black text-green-600 hover:text-green-800 transition-colors group"
                              >
                                ${u.payRate?.toFixed(2) || '0.00'}/hr
                                <svg className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            )
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.banned ? (
                            <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded">
                              BANNED
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {!isCurrentUser && (
                            <div className="flex gap-2">
                              {u.banned ? (
                                <button
                                  onClick={() => unbanUser(u.id)}
                                  className="px-3 py-1 bg-green-600 text-white text-xs font-bold uppercase hover:bg-green-700 transition-colors"
                                >
                                  Unban
                                </button>
                              ) : (
                                <div className="relative group">
                                  <button className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700 transition-colors">
                                    Ban
                                  </button>
                                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black text-white p-2 rounded shadow-lg whitespace-nowrap z-10">
                                    <button
                                      onClick={() => banUser(u.id, 'hour')}
                                      className="block w-full text-left px-3 py-1 hover:bg-gray-800 text-xs"
                                    >
                                      1 Hour
                                    </button>
                                    <button
                                      onClick={() => banUser(u.id, 'day')}
                                      className="block w-full text-left px-3 py-1 hover:bg-gray-800 text-xs"
                                    >
                                      1 Day
                                    </button>
                                    <button
                                      onClick={() => banUser(u.id, 'week')}
                                      className="block w-full text-left px-3 py-1 hover:bg-gray-800 text-xs"
                                    >
                                      1 Week
                                    </button>
                                    <button
                                      onClick={() => banUser(u.id, 'permanent')}
                                      className="block w-full text-left px-3 py-1 hover:bg-gray-800 text-xs"
                                    >
                                      Permanent
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
