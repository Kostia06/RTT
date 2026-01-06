'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Archive, Thermometer, Plus, AlertTriangle, Package, Search } from 'lucide-react';
import { Fridge } from '@/types/production';

export default function FridgesPage() {
  const { isAuthenticated, isEmployee, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/login?redirect=/fridges');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isEmployee) {
      loadFridges();
    }
  }, [isAuthenticated, isEmployee]);

  const loadFridges = async () => {
    try {
      const response = await fetch('/api/fridges');
      const data = await response.json();
      if (response.ok) {
        setFridges(data.fridges || []);
      }
    } catch (error) {
      console.error('Error loading fridges:', error);
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

  if (!isAuthenticated || !isEmployee) {
    return null;
  }

  const filteredFridges = searchTerm
    ? fridges.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.qr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : fridges;

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
              <Archive className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">FRIDGES & STORAGE</h1>
              <p className="text-white/60 text-sm mt-1">Manage storage, inventory, and temperature monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Scan Fridge */}
            <Link
              href="/scan-fridge"
              className="bg-white border-2 border-gray-200 p-6 hover:border-black transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0 group-hover:bg-gray-800 transition-colors">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-black mb-1">Scan QR Code</h3>
                  <p className="text-sm text-gray-600">Quick access to fridge inventory and temperature logging</p>
                </div>
              </div>
            </Link>

            {/* Manage Fridges */}
            {isAdmin && (
              <Link
                href="/manage-fridges"
                className="bg-white border-2 border-gray-200 p-6 hover:border-black transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0 group-hover:bg-gray-800 transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-black mb-1">Manage Fridges</h3>
                    <p className="text-sm text-gray-600">Add, edit, or remove storage units</p>
                  </div>
                </div>
              </Link>
            )}

            {/* Temperature Monitoring */}
            <Link
              href="/fridges?filter=temp-required"
              className="bg-white border-2 border-orange-200 p-6 hover:border-orange-500 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500 text-white flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 transition-colors">
                  <Thermometer className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-black mb-1">Temperature Checks</h3>
                  <p className="text-sm text-gray-600">View fridges requiring temperature monitoring</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold uppercase">
                    {fridges.filter(f => f.temperature_log_required).length} Required
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* All Fridges */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-black">All Fridges ({fridges.length})</h2>

            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search fridges..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
            </div>
          ) : filteredFridges.length === 0 ? (
            <div className="bg-white border-2 border-gray-200 p-12 text-center">
              <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {searchTerm ? 'No fridges found' : 'No fridges set up'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try a different search term' : 'Create your first fridge to get started'}
              </p>
              {!searchTerm && isAdmin && (
                <Link
                  href="/manage-fridges"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-bold hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Fridge
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFridges.map((fridge) => (
                <Link
                  key={fridge.id}
                  href={`/fridge-inventory/${fridge.id}`}
                  className="bg-white border-2 border-gray-200 p-6 hover:border-black hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-black mb-1 group-hover:underline">
                        {fridge.name}
                      </h3>
                      <p className="text-sm text-gray-600">{fridge.location || 'No location set'}</p>
                    </div>
                    {fridge.temperature_log_required && (
                      <div className="flex-shrink-0">
                        <Thermometer className="w-5 h-5 text-orange-500" />
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <QrCode className="w-4 h-4" />
                      <span className="font-mono font-medium">{fridge.qr_code}</span>
                    </div>
                  </div>

                  {/* Capacity Info */}
                  {(fridge.max_capacity_cases || fridge.max_capacity_portions) && (
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      {fridge.max_capacity_cases && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Max Cases:</span>
                          <span className="font-bold text-gray-900">{fridge.max_capacity_cases}</span>
                        </div>
                      )}
                      {fridge.max_capacity_portions && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Max Portions:</span>
                          <span className="font-bold text-gray-900">{fridge.max_capacity_portions}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-black group-hover:text-gray-600">
                      <span>View Inventory</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="py-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 p-4 text-center">
              <div className="text-3xl font-black text-black mb-1">{fridges.length}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wider">Total Fridges</div>
            </div>
            <div className="bg-white border border-gray-200 p-4 text-center">
              <div className="text-3xl font-black text-black mb-1">
                {fridges.filter(f => f.temperature_log_required).length}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wider">Temp Monitoring</div>
            </div>
            <div className="bg-white border border-gray-200 p-4 text-center">
              <div className="text-3xl font-black text-black mb-1">
                {fridges.filter(f => f.max_capacity_cases || f.max_capacity_portions).length}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wider">With Capacity Limits</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
