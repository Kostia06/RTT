'use client';

import { useState, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  payRate?: number;
}

interface PayRateManagerProps {
  isAdmin: boolean;
  isManager: boolean;
}

export default function PayRateManager({ isAdmin, isManager }: PayRateManagerProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAdmin || isManager) {
      fetchEmployees();
    }
  }, [isAdmin, isManager]);

  const fetchEmployees = async () => {
    setLoading(true);
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
        setEmployees(employeeUsers);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setEditingRate(employee.payRate?.toString() || '0');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingRate('');
  };

  const handleSaveRate = async (employeeId: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${employeeId}/pay-rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payRate: parseFloat(editingRate) || 0 }),
      });

      if (response.ok) {
        await fetchEmployees();
        setEditingId(null);
        setEditingRate('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update pay rate');
      }
    } catch (error) {
      console.error('Error updating pay rate:', error);
      alert('Failed to update pay rate');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin && !isManager) {
    return null;
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black uppercase">Pay Rate Management</h2>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Set hourly pay rates for employees. These rates will be used to calculate total pay in the hours report.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-bold text-xs uppercase text-gray-600">Employee</th>
                <th className="text-left py-3 px-4 font-bold text-xs uppercase text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-bold text-xs uppercase text-gray-600">Email</th>
                <th className="text-right py-3 px-4 font-bold text-xs uppercase text-gray-600">Hourly Rate</th>
                <th className="text-right py-3 px-4 font-bold text-xs uppercase text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold">{employee.name}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-1 text-xs font-bold uppercase bg-gray-100 text-gray-700 rounded">
                      {employee.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{employee.email}</td>
                  <td className="py-3 px-4 text-right">
                    {editingId === employee.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-lg font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingRate}
                          onChange={(e) => setEditingRate(e.target.value)}
                          className="w-24 px-2 py-1 border-2 border-black rounded text-right font-bold"
                          autoFocus
                        />
                        <span className="text-sm text-gray-600">/hr</span>
                      </div>
                    ) : (
                      <span className="text-lg font-black">
                        ${employee.payRate?.toFixed(2) || '0.00'}/hr
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {editingId === employee.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSaveRate(employee.id)}
                          disabled={saving}
                          className="px-3 py-1 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 disabled:opacity-50 transition-all rounded"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="px-3 py-1 bg-white text-black text-xs font-bold uppercase hover:bg-gray-100 border-2 border-gray-300 disabled:opacity-50 transition-all rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(employee)}
                        className="px-3 py-1 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 transition-all rounded"
                      >
                        Edit Rate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
