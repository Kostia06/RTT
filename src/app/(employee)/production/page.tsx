'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Package, CheckCircle, Clock, AlertCircle, FileText, Download, Filter } from 'lucide-react';
import { ProductionItem, ShiftProductionAssignment } from '@/types/production';

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

interface ProductionLog {
  id: string;
  shift_id: string;
  employee_id: string;
  production_item_id: string;
  cases_made: number;
  loose_portions: number;
  total_portions: number;
  notes: string | null;
  logged_at: string;
  created_at: string;
  production_item: ProductionItem;
}

export default function ProductionManagementPage() {
  const { user, isAuthenticated, isEmployee, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    production_item_id: '',
    start_date: '',
    end_date: '',
  });

  const isManager = isAdmin || user?.user_metadata?.role === 'manager';

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isEmployee) {
      loadProductionItems();
      if (activeTab === 'overview') {
        loadProductionData();
      } else {
        loadLogs();
      }
    }
  }, [isAuthenticated, isEmployee, selectedDate, activeTab]);

  const loadProductionItems = async () => {
    try {
      const response = await fetch('/api/production-items');
      const data = await response.json();
      setProductionItems(data.items || []);
    } catch (error) {
      console.error('Error loading production items:', error);
    }
  };

  const loadProductionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employee/schedule?includeProduction=true');
      const data = await response.json();

      if (response.ok) {
        const allShifts: Shift[] = data.shifts || [];

        // Filter shifts for selected date
        const dateShifts = allShifts.filter(shift => {
          const shiftDate = new Date(shift.startTime).toISOString().split('T')[0];
          return shiftDate === selectedDate;
        });

        // Filter to only shifts with production assignments
        const productionShifts = dateShifts.filter(
          shift => shift.productionAssignments && shift.productionAssignments.length > 0
        );

        setShifts(productionShifts);
      }
    } catch (error) {
      console.error('Error loading production data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.production_item_id) {
        params.append('production_item_id', filters.production_item_id);
      }
      if (filters.start_date) {
        params.append('start_date', new Date(filters.start_date).toISOString());
      }
      if (filters.end_date) {
        params.append('end_date', new Date(filters.end_date).toISOString());
      }

      const response = await fetch(`/api/production-logs?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error loading production logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleApplyFilters = () => {
    loadLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      production_item_id: '',
      start_date: '',
      end_date: '',
    });
    setTimeout(() => loadLogs(), 0);
  };

  const handleExport = () => {
    const headers = ['Date', 'Production Item', 'Cases Made', 'Loose Portions', 'Total Portions', 'Notes'];
    const rows = logs.map(log => [
      new Date(log.logged_at).toLocaleString(),
      log.production_item?.name || 'Unknown',
      log.cases_made,
      log.loose_portions,
      log.total_portions,
      log.notes || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isEmployee) return null;

  // Calculate statistics for Overview tab
  const allAssignments = shifts.flatMap(s => s.productionAssignments || []);
  const totalAssignments = allAssignments.length;
  const completedAssignments = allAssignments.filter(a => a.status === 'completed').length;
  const inProgressAssignments = allAssignments.filter(a => a.status === 'in_progress').length;
  const pendingAssignments = allAssignments.filter(a => a.status === 'pending').length;

  // Calculate statistics for Logs tab
  const totalCases = logs.reduce((sum, log) => sum + log.cases_made, 0);
  const totalLoose = logs.reduce((sum, log) => sum + log.loose_portions, 0);
  const totalPortions = logs.reduce((sum, log) => sum + log.total_portions, 0);

  // Group by production item
  const itemSummary = allAssignments.reduce((acc, assignment) => {
    const itemName = assignment.production_item?.name || 'Unknown';
    if (!acc[itemName]) {
      acc[itemName] = {
        name: itemName,
        totalBins: 0,
        totalPortions: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
      };
    }
    acc[itemName].totalBins += assignment.bins_required;
    acc[itemName].totalPortions += assignment.target_portions || 0;

    if (assignment.status === 'completed') acc[itemName].completed++;
    else if (assignment.status === 'in_progress') acc[itemName].inProgress++;
    else acc[itemName].pending++;

    return acc;
  }, {} as Record<string, any>);

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
                <Package className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                  Production
                </h1>
                <p className="text-white/60 text-sm mt-1">
                  View assignments and history
                </p>
              </div>
            </div>
            {activeTab === 'logs' && (
              <button
                onClick={handleExport}
                disabled={logs.length === 0}
                className="bg-white text-black px-4 py-2 text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Today&apos;s Overview
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'logs'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Production History
            </button>
          </div>
        </div>

        {/* Date Selector - Only for Overview */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : activeTab === 'overview' ? (
          <>
            {/* Overview Tab Content */}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalAssignments}</p>
                  </div>
                  <Package className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{completedAssignments}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{inProgressAssignments}</p>
                  </div>
                  <Clock className="w-12 h-12 text-orange-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-gray-600 mt-1">{pendingAssignments}</p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Production Items Summary */}
            {Object.keys(itemSummary).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Production by Item</h2>
                <div className="space-y-3">
                  {Object.values(itemSummary).map((item: any, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {item.totalBins} bins • {item.totalPortions} portions
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {item.completed > 0 && (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                            {item.completed} completed
                          </span>
                        )}
                        {item.inProgress > 0 && (
                          <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded">
                            {item.inProgress} in progress
                          </span>
                        )}
                        {item.pending > 0 && (
                          <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                            {item.pending} pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shifts with Production */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Production Shifts</h2>

              {shifts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No production scheduled</h3>
                  <p>No production assignments for {new Date(selectedDate).toLocaleDateString()}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shifts.map((shift) => (
                    <div key={shift.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{shift.employeeName}</h3>
                          <p className="text-sm text-gray-600">{shift.position}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(shift.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(shift.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            shift.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : shift.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {shift.status}
                          </span>
                        </div>
                      </div>

                      {shift.productionAssignments && shift.productionAssignments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Production Tasks:</p>
                          <div className="space-y-2">
                            {shift.productionAssignments.map((assignment) => (
                              <div key={assignment.id} className="flex justify-between items-center p-2 bg-white rounded">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    assignment.status === 'completed'
                                      ? 'bg-green-500'
                                      : assignment.status === 'in_progress'
                                      ? 'bg-orange-500'
                                      : 'bg-gray-400'
                                  }`}></span>
                                  <span className="font-medium text-sm text-gray-900">
                                    {assignment.production_item?.name || 'Unknown Item'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {assignment.bins_required} bins • {assignment.target_portions} portions
                                  </span>
                                </div>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                  assignment.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : assignment.status === 'in_progress'
                                    ? 'bg-orange-100 text-orange-800'
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
              )}
            </div>
          </>
        ) : (
          <>
            {/* Logs Tab Content */}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Logs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{logs.length}</p>
                  </div>
                  <FileText className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Cases</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalCases}</p>
                  </div>
                  <FileText className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Loose Portions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalLoose}</p>
                  </div>
                  <FileText className="w-12 h-12 text-orange-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Portions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalPortions}</p>
                  </div>
                  <FileText className="w-12 h-12 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Production Item
                  </label>
                  <select
                    value={filters.production_item_id}
                    onChange={(e) => handleFilterChange('production_item_id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">All Items</option>
                    {productionItems.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Production History</h2>
              </div>

              {logs.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No logs found</h3>
                  <p>No production logs match your current filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Production Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cases
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loose
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Portions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(log.logged_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.logged_at).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {log.production_item?.name || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {log.cases_made}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {log.loose_portions}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {log.total_portions}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {log.notes || '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
