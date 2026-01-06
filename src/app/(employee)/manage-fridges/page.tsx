'use client';

import { useState, useEffect } from 'react';
import { Plus, Archive, QrCode, Search, Thermometer } from 'lucide-react';
import { Fridge } from '@/types/production';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ManageFridgesPage() {
  const router = useRouter();
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFridge, setEditingFridge] = useState<Fridge | null>(null);

  useEffect(() => {
    loadFridges();
  }, [statusFilter]);

  const loadFridges = async () => {
    try {
      setLoading(true);
      const activeParam = statusFilter === 'all' ? 'false' : statusFilter === 'active' ? 'true' : 'false';
      const response = await fetch(`/api/fridges?active=${activeParam}`);
      const data = await response.json();
      setFridges(data.fridges || []);
    } catch (error) {
      console.error('Error loading fridges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fridge?')) return;

    try {
      const response = await fetch(`/api/fridges/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete fridge');
      }

      await loadFridges();
    } catch (error: any) {
      console.error('Error deleting fridge:', error);
      alert(error.message || 'Failed to delete fridge');
    }
  };

  const filteredFridges = fridges.filter(fridge => {
    const matchesSearch = fridge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fridge.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fridge.qr_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' ? fridge.active : !fridge.active);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: fridges.length,
    active: fridges.filter(f => f.active).length,
    tempRequired: fridges.filter(f => f.temperature_log_required).length,
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white text-black flex items-center justify-center">
                <Archive className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                  Fridge Management
                </h1>
                <p className="text-white/60 text-sm mt-1">
                  Manage storage fridges and QR codes
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/manage-production-items"
                className="px-4 py-2 bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors"
              >
                ← Items
              </Link>
              <button
                onClick={() => {
                  setEditingFridge(null);
                  setShowAddModal(true);
                }}
                className="bg-white text-black px-4 py-2 text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Fridge
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fridges</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Archive className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Fridges</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</p>
              </div>
              <Archive className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temp Monitoring</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.tempRequired}</p>
              </div>
              <Thermometer className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search fridges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="active">Active Only</option>
              <option value="all">All Status</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Fridges Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : filteredFridges.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No fridges found</h3>
            <p className="text-gray-600">Try adjusting your filters or add a new fridge</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFridges.map((fridge) => (
              <div
                key={fridge.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{fridge.name}</h3>
                    <p className="text-sm text-gray-600">{fridge.location || 'No location set'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    fridge.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {fridge.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <QrCode className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-gray-700">{fridge.qr_code}</span>
                  </div>

                  {fridge.temperature_log_required && (
                    <div className="flex items-center gap-2 text-sm">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700">Temperature monitoring required</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Capacity Limits</p>
                    {fridge.max_capacity_cases || fridge.max_capacity_portions ? (
                      <div className="space-y-1">
                        {fridge.max_capacity_cases && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Cases:</span>
                            <span className="font-medium text-gray-900">{fridge.max_capacity_cases}</span>
                          </div>
                        )}
                        {fridge.max_capacity_portions && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Portions:</span>
                            <span className="font-medium text-gray-900">{fridge.max_capacity_portions}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No limits set</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => router.push(`/fridge-inventory/${fridge.id}`)}
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    Inventory
                  </button>
                  <button
                    onClick={() => {
                      setEditingFridge(fridge);
                      setShowAddModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(fridge.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <FridgeModal
          fridge={editingFridge}
          onClose={() => {
            setShowAddModal(false);
            setEditingFridge(null);
          }}
          onSave={async () => {
            setShowAddModal(false);
            setEditingFridge(null);
            await loadFridges();
          }}
        />
      )}
    </div>
  );
}

function FridgeModal({
  fridge,
  onClose,
  onSave,
}: {
  fridge: Fridge | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: fridge?.name || '',
    qr_code: fridge?.qr_code || '',
    location: fridge?.location || '',
    max_capacity_cases: fridge?.max_capacity_cases || null,
    max_capacity_portions: fridge?.max_capacity_portions || null,
    temperature_log_required: fridge?.temperature_log_required ?? true,
    active: fridge?.active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = fridge
        ? `/api/fridges/${fridge.id}`
        : '/api/fridges';

      const response = await fetch(url, {
        method: fridge ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          max_capacity_cases: formData.max_capacity_cases || null,
          max_capacity_portions: formData.max_capacity_portions || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save fridge');
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving fridge:', error);
      alert(error.message || 'Failed to save fridge');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {fridge ? 'Edit Fridge' : 'Add Fridge'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fridge Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Main Storage A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QR Code {!fridge && <span className="text-gray-500">(auto-generated if empty)</span>}
            </label>
            <input
              type="text"
              value={formData.qr_code}
              onChange={(e) => setFormData({ ...formData, qr_code: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., FRIDGE-001"
              disabled={!!fridge}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Kitchen - Back Wall"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Capacity (Cases)
            </label>
            <input
              type="number"
              min="0"
              value={formData.max_capacity_cases || ''}
              onChange={(e) => setFormData({
                ...formData,
                max_capacity_cases: e.target.value ? parseInt(e.target.value) : null
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Leave empty for no limit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Capacity (Portions)
            </label>
            <input
              type="number"
              min="0"
              value={formData.max_capacity_portions || ''}
              onChange={(e) => setFormData({
                ...formData,
                max_capacity_portions: e.target.value ? parseInt(e.target.value) : null
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Leave empty for no limit"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="temperature_log_required"
              checked={formData.temperature_log_required}
              onChange={(e) => setFormData({ ...formData, temperature_log_required: e.target.checked })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="temperature_log_required" className="ml-2 text-sm text-gray-700">
              Temperature monitoring required
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : fridge ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
