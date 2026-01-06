'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Users, Calendar, Clock, Briefcase } from 'lucide-react';
import { ProductionItem } from '@/types/production';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface EmployeeShiftData {
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
}

interface CreateShiftFullPageModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateShiftFullPageModal({ onClose, onSuccess }: CreateShiftFullPageModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Step management
  const [currentStep, setCurrentStep] = useState<'select-workers' | 'set-times' | 'set-details'>('select-workers');

  // Selected employees
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Common shift data
  const [shiftDate, setShiftDate] = useState('');
  const [position, setPosition] = useState('Kitchen Staff');
  const [showCustomRole, setShowCustomRole] = useState(false);
  const [customRole, setCustomRole] = useState('');
  const [notes, setNotes] = useState('');

  // Individual times for each employee
  const [employeeShifts, setEmployeeShifts] = useState<EmployeeShiftData[]>([]);

  // Production assignments
  const [productionAssignments, setProductionAssignments] = useState<{
    productionItemId: string;
    binsRequired: number;
    targetPortions: number;
    notes: string;
  }[]>([]);

  useEffect(() => {
    loadEmployees();
    loadProductionItems();

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setShiftDate(today);
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (response.ok) {
        const employeeList = (data.users || []).filter((u: any) => u.role === 'employee');
        setEmployees(employeeList);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadProductionItems = async () => {
    try {
      const response = await fetch('/api/production-items');
      const data = await response.json();
      setProductionItems(data.items || []);
    } catch (error) {
      console.error('Error loading production items:', error);
    }
  };

  const toggleEmployee = (employeeId: string) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };

  const selectAll = () => {
    setSelectedEmployees(employees.map(e => e.id));
  };

  const deselectAll = () => {
    setSelectedEmployees([]);
  };

  const goToSetTimes = () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    // Initialize employee shifts with default times
    const shifts = selectedEmployees.map(empId => {
      const employee = employees.find(e => e.id === empId);
      return {
        employeeId: empId,
        employeeName: `${employee?.first_name} ${employee?.last_name}`,
        startTime: '09:00',
        endTime: '17:00',
      };
    });

    setEmployeeShifts(shifts);
    setCurrentStep('set-times');
  };

  const updateEmployeeTime = (employeeId: string, field: 'startTime' | 'endTime', value: string) => {
    setEmployeeShifts(shifts =>
      shifts.map(shift =>
        shift.employeeId === employeeId
          ? { ...shift, [field]: value }
          : shift
      )
    );
  };

  const copyTimeToAll = (sourceEmployeeId: string) => {
    const sourceShift = employeeShifts.find(s => s.employeeId === sourceEmployeeId);
    if (sourceShift) {
      setEmployeeShifts(shifts =>
        shifts.map(shift => ({
          ...shift,
          startTime: sourceShift.startTime,
          endTime: sourceShift.endTime,
        }))
      );
    }
  };

  const addProductionAssignment = () => {
    setProductionAssignments([
      ...productionAssignments,
      {
        productionItemId: '',
        binsRequired: 1,
        targetPortions: 0,
        notes: '',
      },
    ]);
  };

  const updateProductionAssignment = (index: number, field: string, value: any) => {
    const updated = [...productionAssignments];
    updated[index] = { ...updated[index], [field]: value };
    setProductionAssignments(updated);
  };

  const removeProductionAssignment = (index: number) => {
    setProductionAssignments(productionAssignments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const finalPosition = showCustomRole ? customRole : position;

      if (!finalPosition) {
        alert('Please enter a role');
        setLoading(false);
        return;
      }

      if (!shiftDate) {
        alert('Please select a date');
        setLoading(false);
        return;
      }

      // Create shifts for each selected employee
      const promises = employeeShifts.map(async (empShift) => {
        const startDateTime = `${shiftDate}T${empShift.startTime}`;
        const endDateTime = `${shiftDate}T${empShift.endTime}`;

        const response = await fetch('/api/employee/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: empShift.employeeId,
            employeeName: empShift.employeeName,
            startTime: startDateTime,
            endTime: endDateTime,
            position: finalPosition,
            notes,
            productionAssignments: productionAssignments.filter(a => a.productionItemId),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create shift');
        }

        return response.json();
      });

      await Promise.all(promises);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating shifts:', error);
      alert(error.message || 'Failed to create shifts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-black text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black">Create New Shift</h2>
              <p className="text-white/60 text-xs sm:text-sm mt-1">
                {currentStep === 'select-workers' && 'Step 1: Select Workers'}
                {currentStep === 'set-times' && 'Step 2: Set Times'}
                {currentStep === 'set-details' && 'Step 3: Details & Production'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-colors rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Step 1: Select Workers */}
        {currentStep === 'select-workers' && (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h3 className="font-bold text-gray-900">Select Employees</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1 text-xs font-bold bg-black text-white hover:bg-gray-800 transition-colors rounded"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-1 text-xs font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors rounded"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {employees.map(employee => (
                  <button
                    key={employee.id}
                    onClick={() => toggleEmployee(employee.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedEmployees.includes(employee.id)
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedEmployees.includes(employee.id)
                          ? 'border-white bg-white'
                          : 'border-gray-300'
                      }`}>
                        {selectedEmployees.includes(employee.id) && (
                          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className={`text-xs ${selectedEmployees.includes(employee.id) ? 'text-white/70' : 'text-gray-500'}`}>
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {employees.length === 0 && (
                <p className="text-center text-gray-500 py-8">No employees found</p>
              )}
            </div>

            <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg">
              <p className="text-sm font-bold text-gray-700">
                Selected: {selectedEmployees.length} {selectedEmployees.length === 1 ? 'employee' : 'employees'}
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Set Times */}
        {currentStep === 'set-times' && (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Shift Date</label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-black focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">Set Times for Each Employee</h3>
              </div>

              <div className="space-y-3">
                {employeeShifts.map((shift, index) => (
                  <div key={shift.employeeId} className="bg-white border border-gray-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-sm text-gray-900">{shift.employeeName}</p>
                      {index === 0 && employeeShifts.length > 1 && (
                        <button
                          onClick={() => copyTimeToAll(shift.employeeId)}
                          className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors rounded"
                        >
                          Copy to All
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={shift.startTime}
                          onChange={(e) => updateEmployeeTime(shift.employeeId, 'startTime', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-black focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                        <input
                          type="time"
                          value={shift.endTime}
                          onChange={(e) => updateEmployeeTime(shift.employeeId, 'endTime', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Details & Production */}
        {currentStep === 'set-details' && (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">Shift Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Position / Role</label>
                  <select
                    value={showCustomRole ? 'custom' : position}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomRole(true);
                        setPosition('');
                      } else {
                        setShowCustomRole(false);
                        setCustomRole('');
                        setPosition(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-black focus:outline-none"
                  >
                    <option value="Kitchen Staff">Kitchen Staff</option>
                    <option value="Server">Server</option>
                    <option value="Class Instructor">Class Instructor</option>
                    <option value="Production">Production</option>
                    <option value="Prep Cook">Prep Cook</option>
                    <option value="Dishwasher">Dishwasher</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Manager">Manager</option>
                    <option value="Delivery">Delivery</option>
                    <option value="custom">+ Custom Role</option>
                  </select>
                  {showCustomRole && (
                    <input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="Enter custom role name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-black focus:outline-none mt-2"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes for this shift..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-black focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Production Tasks (Optional)</h3>
                <button
                  onClick={addProductionAssignment}
                  className="px-3 py-2 bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors rounded flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              {productionAssignments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  No production tasks assigned
                </p>
              ) : (
                <div className="space-y-3">
                  {productionAssignments.map((assignment, index) => (
                    <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-xs font-bold text-gray-500 uppercase">Task {index + 1}</p>
                        <button
                          onClick={() => removeProductionAssignment(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Production Item</label>
                          <select
                            value={assignment.productionItemId}
                            onChange={(e) => updateProductionAssignment(index, 'productionItemId', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-black focus:outline-none"
                          >
                            <option value="">Select item</option>
                            {productionItems.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Bins Required</label>
                            <input
                              type="number"
                              min="1"
                              value={assignment.binsRequired}
                              onChange={(e) => updateProductionAssignment(index, 'binsRequired', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-black focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Target Portions</label>
                            <input
                              type="number"
                              min="0"
                              value={assignment.targetPortions}
                              onChange={(e) => updateProductionAssignment(index, 'targetPortions', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-black focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-3">
            {currentStep !== 'select-workers' && (
              <button
                onClick={() => {
                  if (currentStep === 'set-times') setCurrentStep('select-workers');
                  if (currentStep === 'set-details') setCurrentStep('set-times');
                }}
                disabled={loading}
                className="flex-1 px-4 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 font-bold hover:border-black transition-colors text-sm sm:text-base rounded-lg disabled:opacity-50"
              >
                Back
              </button>
            )}

            {currentStep === 'select-workers' && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 font-bold hover:border-black transition-colors text-sm sm:text-base rounded-lg"
              >
                Cancel
              </button>
            )}

            <button
              onClick={() => {
                if (currentStep === 'select-workers') goToSetTimes();
                else if (currentStep === 'set-times') setCurrentStep('set-details');
                else if (currentStep === 'set-details') handleSubmit();
              }}
              disabled={loading}
              className="flex-1 px-4 py-3 sm:py-4 bg-black text-white font-bold hover:bg-gray-800 transition-colors text-sm sm:text-base rounded-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : currentStep === 'set-details' ? 'Create Shifts' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
