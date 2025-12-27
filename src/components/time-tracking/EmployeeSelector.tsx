'use client';

import { useEffect, useState } from 'react';

interface Employee {
  id: string;
  name: string;
}

interface EmployeeSelectorProps {
  onSelect: (employeeId: string, employeeName: string) => void;
  selectedEmployeeId?: string;
}

export default function EmployeeSelector({ onSelect, selectedEmployeeId }: EmployeeSelectorProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employee/time-tracking/employees');
      const data = await response.json();

      if (response.ok) {
        setEmployees(data.employees);
      } else {
        setError(data.error || 'Failed to fetch employees');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 text-center">
        <p className="text-red-900 mb-4">{error}</p>
        <button
          onClick={fetchEmployees}
          className="px-6 py-2 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-6">
      {/* Search input */}
      <input
        type="text"
        placeholder="Search employees..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 mb-4 focus:outline-none focus:border-black transition-colors"
      />

      {/* Employee dropdown */}
      <select
        value={selectedEmployeeId || ''}
        onChange={(e) => {
          const employee = employees.find(emp => emp.id === e.target.value);
          if (employee) {
            onSelect(employee.id, employee.name);
          }
        }}
        className="w-full px-4 py-4 border border-gray-200 text-lg font-bold focus:outline-none focus:border-black transition-colors appearance-none bg-white"
      >
        <option value="">Choose your name...</option>
        {filteredEmployees.map(employee => (
          <option key={employee.id} value={employee.id}>
            {employee.name}
          </option>
        ))}
      </select>

      {/* Selected employee display */}
      {selectedEmployee && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Selected</p>
          <p className="text-xl font-black">{selectedEmployee.name}</p>
        </div>
      )}

      {filteredEmployees.length === 0 && searchTerm && (
        <p className="mt-4 text-gray-500 text-sm">No employees found matching &quot;{searchTerm}&quot;</p>
      )}
    </div>
  );
}
