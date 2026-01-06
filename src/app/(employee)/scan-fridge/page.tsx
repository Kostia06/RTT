'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Thermometer, Package, ArrowRight, Search } from 'lucide-react';
import { Fridge, FridgeInventory, ProductionItem } from '@/types/production';

interface FridgeInventoryData {
  fridge: Fridge;
  inventory: (FridgeInventory & { production_item: ProductionItem })[];
  total_cases: number;
  total_portions: number;
  capacity_used_cases: number | null;
  capacity_used_portions: number | null;
}

function ScanFridgeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrFromUrl = searchParams.get('qr');

  const [qrCode, setQrCode] = useState(qrFromUrl || '');
  const [loading, setLoading] = useState(false);
  const [fridgeData, setFridgeData] = useState<FridgeInventoryData | null>(null);
  const [showTempLog, setShowTempLog] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (qrFromUrl) {
      handleSearch();
    }
  }, [qrFromUrl]);

  const handleSearch = async () => {
    if (!qrCode.trim()) {
      setError('Please enter a QR code');
      return;
    }

    setLoading(true);
    setError('');
    setFridgeData(null);

    try {
      // First, find the fridge by QR code
      const fridgesResponse = await fetch('/api/fridges');
      const fridgesData = await fridgesResponse.json();

      const fridge = fridgesData.fridges?.find(
        (f: Fridge) => f.qr_code.toLowerCase() === qrCode.trim().toLowerCase()
      );

      if (!fridge) {
        setError('Fridge not found. Please check the QR code and try again.');
        setLoading(false);
        return;
      }

      // Load fridge inventory
      const inventoryResponse = await fetch(`/api/fridges/${fridge.id}/inventory`);
      const inventoryData = await inventoryResponse.json();

      if (!inventoryResponse.ok) {
        throw new Error(inventoryData.error || 'Failed to load fridge data');
      }

      setFridgeData(inventoryData);
    } catch (error: any) {
      console.error('Error loading fridge:', error);
      setError(error.message || 'Failed to load fridge data');
    } finally {
      setLoading(false);
    }
  };

  const getCapacityColor = (percentage: number | null) => {
    if (percentage === null) return 'text-gray-600';
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white pt-16 sm:pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <QrCode className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                Scan Fridge
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Enter or scan QR code
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* QR Code Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Enter QR Code</h2>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., FRIDGE-001"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Fridge Data */}
        {fridgeData && (
          <div className="space-y-6">
            {/* Fridge Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{fridgeData.fridge.name}</h2>
                  <p className="text-gray-600 mt-1">{fridgeData.fridge.location || 'No location set'}</p>
                  <p className="text-sm text-gray-500 mt-2 font-mono">QR: {fridgeData.fridge.qr_code}</p>
                </div>
                <button
                  onClick={() => router.push(`/fridge-inventory/${fridgeData.fridge.id}`)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  Full Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Capacity */}
              {(fridgeData.fridge.max_capacity_cases || fridgeData.fridge.max_capacity_portions) && (
                <div className="space-y-3 mb-6">
                  {fridgeData.fridge.max_capacity_cases && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Cases</span>
                        <span className={`font-semibold ${getCapacityColor(fridgeData.capacity_used_cases)}`}>
                          {fridgeData.total_cases} / {fridgeData.fridge.max_capacity_cases} ({fridgeData.capacity_used_cases?.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            fridgeData.capacity_used_cases && fridgeData.capacity_used_cases >= 90
                              ? 'bg-red-500'
                              : fridgeData.capacity_used_cases && fridgeData.capacity_used_cases >= 70
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(fridgeData.capacity_used_cases || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {fridgeData.fridge.max_capacity_portions && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Total Portions</span>
                        <span className={`font-semibold ${getCapacityColor(fridgeData.capacity_used_portions)}`}>
                          {(fridgeData.total_cases * 50) + fridgeData.total_portions} / {fridgeData.fridge.max_capacity_portions} ({fridgeData.capacity_used_portions?.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            fridgeData.capacity_used_portions && fridgeData.capacity_used_portions >= 90
                              ? 'bg-red-500'
                              : fridgeData.capacity_used_portions && fridgeData.capacity_used_portions >= 70
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(fridgeData.capacity_used_portions || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{fridgeData.inventory.length}</div>
                  <div className="text-xs text-gray-600 uppercase mt-1">Items</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{fridgeData.total_cases}</div>
                  <div className="text-xs text-gray-600 uppercase mt-1">Cases</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{fridgeData.total_portions}</div>
                  <div className="text-xs text-gray-600 uppercase mt-1">Loose</div>
                </div>
              </div>

              {/* Temperature Log Button */}
              {fridgeData.fridge.temperature_log_required && (
                <button
                  onClick={() => setShowTempLog(true)}
                  className="w-full py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Thermometer className="w-5 h-5" />
                  Log Temperature
                </button>
              )}
            </div>

            {/* Inventory List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-6 h-6 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">Current Inventory</h3>
              </div>

              {fridgeData.inventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p>This fridge is currently empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fridgeData.inventory.map((item) => {
                    const batchDate = new Date(item.batch_date);
                    const expDate = new Date(item.expiration_date);
                    const daysLeft = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                    return (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.production_item?.name || 'Unknown'}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Batch: {batchDate.toLocaleDateString()}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="text-gray-700">
                                <span className="font-medium">{item.cases}</span> cases
                              </span>
                              <span className="text-gray-700">
                                <span className="font-medium">{item.loose_portions}</span> loose
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              daysLeft < 0
                                ? 'bg-red-100 text-red-800'
                                : daysLeft <= 7
                                ? 'bg-orange-100 text-orange-800'
                                : daysLeft <= 14
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {daysLeft < 0 ? 'Expired' : `${daysLeft}d left`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Temperature Log Modal */}
        {showTempLog && fridgeData && (
          <TemperatureLogModal
            fridge={fridgeData.fridge}
            onClose={() => setShowTempLog(false)}
            onSuccess={() => {
              setShowTempLog(false);
              // Could refresh data here if needed
            }}
          />
        )}
      </div>
    </div>
  );
}

function TemperatureLogModal({
  fridge,
  onClose,
  onSuccess,
}: {
  fridge: Fridge;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // This would call an API endpoint to log temperature
      // For now, we'll create a placeholder
      const response = await fetch('/api/fridges/temperature-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fridge_id: fridge.id,
          temperature: parseFloat(temperature),
          notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to log temperature');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error logging temperature:', error);
      alert(error.message || 'Failed to log temperature');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center gap-2 mb-6">
          <Thermometer className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Log Temperature</h2>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Fridge:</p>
          <p className="font-semibold text-gray-900">{fridge.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature (°F) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="e.g., 38.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any observations or issues..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
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
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Logging...' : 'Log Temperature'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ScanFridgePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <ScanFridgeContent />
    </Suspense>
  );
}
