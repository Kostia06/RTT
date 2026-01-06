'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, AlertTriangle, Thermometer, Archive, Printer, QrCode as QrCodeIcon } from 'lucide-react';
import { Fridge, FridgeInventory, ProductionItem } from '@/types/production';
import { QRCodeSVG } from 'qrcode.react';

interface FridgeInventoryData {
  fridge: Fridge;
  inventory: (FridgeInventory & { production_item: ProductionItem })[];
  total_cases: number;
  total_portions: number;
  capacity_used_cases: number | null;
  capacity_used_portions: number | null;
}

export default function FridgeInventoryPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<FridgeInventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInventory();
  }, [params.id]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fridges/${params.id}/inventory`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load inventory');
      }

      setData(result);
    } catch (error: any) {
      console.error('Error loading fridge inventory:', error);
      alert(error.message || 'Failed to load fridge inventory');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${data?.fridge.name}</title>
          <style>
            @media print {
              body { margin: 0; }
              @page { margin: 0; }
            }
            body {
              margin: 0;
              padding: 40px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
              border: 3px solid black;
              padding: 40px;
              max-width: 400px;
            }
            h1 {
              font-size: 32px;
              font-weight: 900;
              margin: 0 0 10px 0;
              text-transform: uppercase;
            }
            .location {
              font-size: 18px;
              color: #666;
              margin: 0 0 30px 0;
            }
            .qr-wrapper {
              background: white;
              padding: 20px;
              border: 2px solid black;
              display: inline-block;
              margin: 0 0 30px 0;
            }
            .code {
              font-family: 'Courier New', monospace;
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 2px;
              margin: 0;
              color: black;
            }
            .instructions {
              font-size: 14px;
              color: #666;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${data?.fridge.name}</h1>
            <p class="location">${data?.fridge.location || 'Storage Unit'}</p>
            <div class="qr-wrapper">
              ${printRef.current?.innerHTML || ''}
            </div>
            <p class="code">${data?.fridge.qr_code}</p>
            <p class="instructions">Scan to view inventory and log temperature</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(qrContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const getCapacityColor = (percentage: number | null) => {
    if (percentage === null) return 'bg-gray-200';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getExpirationStatus = (batchDate: string) => {
    const batch = new Date(batchDate);
    const expiration = new Date(batch);
    expiration.setMonth(expiration.getMonth() + 3);

    const now = new Date();
    const daysUntilExpiration = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
      return { status: 'expired', color: 'bg-red-100 text-red-800', text: 'Expired' };
    } else if (daysUntilExpiration <= 7) {
      return { status: 'expiring-soon', color: 'bg-orange-100 text-orange-800', text: `${daysUntilExpiration}d` };
    } else if (daysUntilExpiration <= 14) {
      return { status: 'warning', color: 'bg-yellow-100 text-yellow-800', text: `${daysUntilExpiration}d` };
    }
    return { status: 'good', color: 'bg-green-100 text-green-800', text: `${daysUntilExpiration}d` };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fridge not found</h2>
          <button
            onClick={() => router.back()}
            className="text-red-600 hover:text-red-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const { fridge, inventory, total_cases, total_portions, capacity_used_cases, capacity_used_portions } = data;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white pt-16 sm:pt-20 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/fridges"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Fridges
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white text-black flex items-center justify-center">
                <Archive className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">{fridge.name}</h1>
                <p className="text-white/60 text-sm mt-1">{fridge.location || 'Storage Unit'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="bg-white text-black px-4 py-2 font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
            >
              <QrCodeIcon className="w-4 h-4" />
              {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* QR Code Section */}
        {showQRCode && (
          <div className="bg-white border-2 border-black p-8 mb-6 text-center">
            <h2 className="text-xl font-black mb-4">QR Code</h2>
            <div ref={printRef} className="inline-block bg-white p-4 mb-4">
              <QRCodeSVG
                value={`${window.location.origin}/scan-fridge?qr=${fridge.qr_code}`}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="font-mono text-2xl font-bold mb-4">{fridge.qr_code}</p>
            <button
              onClick={handlePrintQR}
              className="bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print QR Code
            </button>
            <p className="text-sm text-gray-600 mt-4">
              Scan to access this fridge&apos;s inventory and log temperature
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-black">{inventory.length}</div>
            <div className="text-xs text-gray-600 uppercase mt-1">Items</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-black">{total_cases}</div>
            <div className="text-xs text-gray-600 uppercase mt-1">Cases</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-black">{total_portions}</div>
            <div className="text-xs text-gray-600 uppercase mt-1">Loose</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 text-center">
            <div className={`text-3xl font-black ${inventory.filter(item => {
              const exp = getExpirationStatus(item.batch_date);
              return exp.status === 'expiring-soon' || exp.status === 'expired';
            }).length > 0 ? 'text-orange-600' : ''}`}>
              {inventory.filter(item => {
                const exp = getExpirationStatus(item.batch_date);
                return exp.status === 'expiring-soon' || exp.status === 'expired';
              }).length}
            </div>
            <div className="text-xs text-gray-600 uppercase mt-1">Expiring</div>
          </div>
        </div>

        {/* Capacity Bars */}
        {(fridge.max_capacity_cases || fridge.max_capacity_portions) && (
          <div className="bg-white border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Capacity</h3>
            <div className="space-y-4">
              {fridge.max_capacity_cases && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Cases</span>
                    <span className="font-bold">{total_cases} / {fridge.max_capacity_cases}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCapacityColor(capacity_used_cases)}`}
                      style={{ width: `${Math.min(capacity_used_cases || 0, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {fridge.max_capacity_portions && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Portions</span>
                    <span className="font-bold">{(total_cases * 50) + total_portions} / {fridge.max_capacity_portions}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCapacityColor(capacity_used_portions)}`}
                      style={{ width: `${Math.min(capacity_used_portions || 0, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inventory - Minimalistic List */}
        <div className="bg-white border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-black">Inventory</h2>
            {fridge.temperature_log_required && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold uppercase rounded">
                <Thermometer className="w-3 h-3" />
                Temp Check
              </div>
            )}
          </div>

          {inventory.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Empty</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {inventory.map((item) => {
                const expStatus = getExpirationStatus(item.batch_date);
                return (
                  <div key={item.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{item.production_item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Batch: {new Date(item.batch_date).toLocaleDateString()}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-gray-700">
                            <span className="font-bold">{item.cases}</span> cases
                          </span>
                          <span className="text-gray-700">
                            <span className="font-bold">{item.loose_portions}</span> loose
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${expStatus.color} flex-shrink-0`}>
                        {expStatus.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expiration Warning */}
        {inventory.some(item => {
          const exp = getExpirationStatus(item.batch_date);
          return exp.status === 'expired' || exp.status === 'expiring-soon';
        }) && (
          <div className="mt-6 bg-orange-50 border border-orange-200 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-orange-900 text-sm">Items Expiring Soon</h3>
                <p className="text-xs text-orange-700 mt-1">
                  {inventory.filter(item => {
                    const exp = getExpirationStatus(item.batch_date);
                    return exp.status === 'expired' || exp.status === 'expiring-soon';
                  }).length} item(s) need attention
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
