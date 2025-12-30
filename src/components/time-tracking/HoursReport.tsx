'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  date: string;
  notes?: string;
  isManual?: boolean;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  payRate?: number;
}

interface HoursReportProps {
  isAdmin: boolean;
  currentUserId: string;
}

export default function HoursReport({ isAdmin, currentUserId }: HoursReportProps) {
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(1)), 'yyyy-MM-dd')); // First day of current month
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd')); // Today
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(isAdmin ? 'all' : currentUserId);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeePayRates, setEmployeePayRates] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
    fetchEntries();
  }, [isAdmin, selectedEmployeeId, startDate, endDate]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (response.ok && data.users) {
        const employeeUsers = data.users
          .filter((u: any) => u.role !== 'customer')
          .map((u: any) => ({
            id: u.id,
            name: u.name || u.email || 'Unknown',
            email: u.email,
            role: u.role || 'employee',
            payRate: u.payRate || 0,
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        // Create pay rate map
        const payRateMap: { [key: string]: number } = {};
        employeeUsers.forEach((emp: Employee) => {
          payRateMap[emp.id] = emp.payRate || 0;
        });

        setEmployees(employeeUsers);
        setEmployeePayRates(payRateMap);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const employeeId = isAdmin && selectedEmployeeId !== 'all' ? selectedEmployeeId : currentUserId;
      const url = isAdmin && selectedEmployeeId === 'all'
        ? `/api/employee/time-tracking/all?startDate=${startDate}&endDate=${endDate}`
        : `/api/employee/time-tracking?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`;

      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalHours = () => {
    return entries
      .filter(e => e.clockOut)
      .reduce((sum, e) => sum + (e.totalHours || 0), 0);
  };

  const calculateTotalPay = () => {
    return entries
      .filter(e => e.clockOut)
      .reduce((sum, e) => {
        const payRate = employeePayRates[e.employeeId] || 0;
        const hours = e.totalHours || 0;
        return sum + (hours * payRate);
      }, 0);
  };

  const getPayRateForEmployee = (employeeId: string): number => {
    return employeePayRates[employeeId] || 0;
  };

  const groupEntriesByEmployee = () => {
    const grouped: { [key: string]: { name: string; entries: TimeEntry[]; totalHours: number; totalPay: number; payRate: number } } = {};

    entries.forEach(entry => {
      if (!grouped[entry.employeeId]) {
        const payRate = getPayRateForEmployee(entry.employeeId);
        grouped[entry.employeeId] = {
          name: entry.employeeName,
          entries: [],
          totalHours: 0,
          totalPay: 0,
          payRate: payRate,
        };
      }
      grouped[entry.employeeId].entries.push(entry);
      if (entry.totalHours) {
        const payRate = getPayRateForEmployee(entry.employeeId);
        grouped[entry.employeeId].totalHours += entry.totalHours;
        grouped[entry.employeeId].totalPay += entry.totalHours * payRate;
      }
    });

    return Object.entries(grouped).sort((a, b) => a[1].name.localeCompare(b[1].name));
  };

  const totalHours = calculateTotalHours();
  const totalPay = calculateTotalPay();
  const groupedData = isAdmin && selectedEmployeeId === 'all' ? groupEntriesByEmployee() : null;
  const currentEmployeePayRate = !isAdmin ? getPayRateForEmployee(currentUserId) :
    (selectedEmployeeId !== 'all' ? getPayRateForEmployee(selectedEmployeeId) : 0);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black uppercase">Hours Report</h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 border-2 border-gray-200 rounded">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
          />
        </div>
        {isAdmin && (
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Employee
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black transition-colors"
            >
              <option value="all">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-black to-gray-800 text-white p-6 rounded-lg">
              <div className="text-sm font-bold uppercase tracking-wider opacity-80 mb-2">Total Hours</div>
              <div className="text-4xl font-black">{totalHours.toFixed(2)}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-2">Total Pay</div>
              <div className="text-4xl font-black">${totalPay.toFixed(2)}</div>
              {!isAdmin && currentEmployeePayRate > 0 && (
                <div className="text-xs opacity-80 mt-2">${currentEmployeePayRate.toFixed(2)}/hr</div>
              )}
            </div>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-lg border-2 border-gray-300">
              <div className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">Total Entries</div>
              <div className="text-4xl font-black text-black">{entries.length}</div>
            </div>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-lg border-2 border-gray-300">
              <div className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">Days in Range</div>
              <div className="text-4xl font-black text-black">
                {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
              </div>
            </div>
          </div>

          {/* Grouped by Employee (Admin, All Employees) */}
          {groupedData ? (
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase mb-3">Hours by Employee</h3>
              {groupedData.map(([employeeId, data]) => (
                <div key={employeeId} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-4 border-b-2 border-gray-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-lg">{data.name}</h4>
                      <p className="text-sm text-gray-600">
                        {data.entries.length} entries • ${data.payRate.toFixed(2)}/hr
                      </p>
                    </div>
                    <div className="text-right flex gap-6">
                      <div>
                        <div className="text-3xl font-black">{data.totalHours.toFixed(2)}</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wider">Hours</div>
                      </div>
                      <div className="border-l-2 border-gray-300 pl-6">
                        <div className="text-3xl font-black text-green-600">${data.totalPay.toFixed(2)}</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wider">Total Pay</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-2 px-2 font-bold text-xs uppercase text-gray-600">Date</th>
                            <th className="text-left py-2 px-2 font-bold text-xs uppercase text-gray-600">Clock In</th>
                            <th className="text-left py-2 px-2 font-bold text-xs uppercase text-gray-600">Clock Out</th>
                            <th className="text-right py-2 px-2 font-bold text-xs uppercase text-gray-600">Hours</th>
                            <th className="text-right py-2 px-2 font-bold text-xs uppercase text-gray-600">Pay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.entries.map((entry) => (
                            <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 px-2 font-medium">{format(parseISO(entry.date), 'MMM dd, yyyy')}</td>
                              <td className="py-2 px-2">{format(parseISO(entry.clockIn), 'h:mm a')}</td>
                              <td className="py-2 px-2">{entry.clockOut ? format(parseISO(entry.clockOut), 'h:mm a') : '-'}</td>
                              <td className="py-2 px-2 text-right font-bold">{entry.totalHours?.toFixed(2) || '-'}</td>
                              <td className="py-2 px-2 text-right font-bold text-green-600">
                                ${entry.totalHours ? (entry.totalHours * data.payRate).toFixed(2) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Individual entries table
            <div>
              <h3 className="text-lg font-black uppercase mb-3">Time Entries</h3>
              {currentEmployeePayRate > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-bold text-blue-900">
                    Your hourly rate: ${currentEmployeePayRate.toFixed(2)}/hr
                  </span>
                </div>
              )}
              <div className="overflow-x-auto border-2 border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase text-gray-600">Clock In</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase text-gray-600">Clock Out</th>
                      <th className="text-right py-3 px-4 font-bold text-xs uppercase text-gray-600">Hours</th>
                      <th className="text-right py-3 px-4 font-bold text-xs uppercase text-gray-600">Pay</th>
                      <th className="text-left py-3 px-4 font-bold text-xs uppercase text-gray-600">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => {
                      const payRate = getPayRateForEmployee(entry.employeeId);
                      return (
                        <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{format(parseISO(entry.date), 'MMM dd, yyyy')}</td>
                          <td className="py-3 px-4 flex items-center gap-2">
                            {format(parseISO(entry.clockIn), 'h:mm a')}
                            {entry.isManual && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase">
                                Manual
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">{entry.clockOut ? format(parseISO(entry.clockOut), 'h:mm a') : '-'}</td>
                          <td className="py-3 px-4 text-right font-black text-lg">{entry.totalHours?.toFixed(2) || '-'}</td>
                          <td className="py-3 px-4 text-right font-black text-lg text-green-600">
                            ${entry.totalHours && payRate ? (entry.totalHours * payRate).toFixed(2) : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 italic">{entry.notes || '-'}</td>
                        </tr>
                      );
                    })}
                    {entries.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500">
                          No time entries found for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
