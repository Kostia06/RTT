'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

interface ScheduleCalendarProps {
  shifts: Shift[];
  onDayClick?: (date: Date) => void;
  onShiftClick?: (shift: Shift) => void;
  isAdmin?: boolean;
}

export default function ScheduleCalendar({ shifts, onDayClick, onShiftClick, isAdmin }: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tight">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          aria-label="Next month"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 gap-2 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-gray-600 uppercase tracking-wider py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const getShiftsForDay = (day: Date) => {
    return shifts.filter((shift) => {
      const shiftDate = parseISO(shift.startTime);
      return isSameDay(shiftDate, day);
    });
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayShifts = getShiftsForDay(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isCurrentDay = isToday(day);

        const dayKey = format(cloneDay, 'yyyy-MM-dd');
        const isExpanded = expandedDays.has(dayKey);
        const visibleShifts = isExpanded ? dayShifts : dayShifts.slice(0, 3);
        const hasMore = dayShifts.length > 3;

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[160px] border-2 transition-all ${
              isCurrentMonth
                ? 'bg-white border-gray-200'
                : 'bg-gray-50 border-gray-100'
            } ${isCurrentDay ? 'ring-2 ring-black ring-inset' : ''} ${
              dayShifts.length > 0 ? 'bg-blue-50/30' : ''
            } p-3 flex flex-col`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-base font-bold ${
                    isCurrentMonth ? 'text-black' : 'text-gray-400'
                  } ${isCurrentDay ? 'bg-black text-white px-2 py-1 rounded' : ''}`}
                >
                  {format(day, 'd')}
                </span>
                {dayShifts.length > 0 && (
                  <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {dayShifts.length}
                  </span>
                )}
              </div>
              {onDayClick && isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDayClick(cloneDay);
                  }}
                  className="text-gray-400 hover:text-black hover:bg-white rounded p-1 transition-colors"
                  title="Add shift"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {visibleShifts.map((shift) => {
                const statusColors = {
                  scheduled: 'bg-yellow-100 border-l-3 border-yellow-500 text-yellow-900',
                  confirmed: 'bg-green-100 border-l-3 border-green-500 text-green-900',
                  completed: 'bg-gray-200 border-l-3 border-gray-500 text-gray-700',
                  cancelled: 'bg-red-100 border-l-3 border-red-500 text-red-900',
                };

                const statusDots = {
                  scheduled: 'bg-yellow-500',
                  confirmed: 'bg-green-500',
                  completed: 'bg-gray-500',
                  cancelled: 'bg-red-500',
                };

                return (
                  <button
                    key={shift.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedShift(shift);
                      if (onShiftClick) onShiftClick(shift);
                    }}
                    className={`w-full text-left p-2 rounded shadow-sm border-l-4 transition-all hover:shadow-md ${statusColors[shift.status]}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusDots[shift.status]}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate text-[13px]">{shift.employeeName}</div>
                        <div className="text-[10px] truncate opacity-80 font-medium">{shift.position}</div>
                        <div className="text-[10px] font-bold mt-0.5 opacity-70">
                          {format(parseISO(shift.startTime), 'h:mma')} - {format(parseISO(shift.endTime), 'h:mma')}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {hasMore && !isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedDays(new Set([...expandedDays, dayKey]));
                  }}
                  className="w-full text-center py-1.5 text-[11px] font-bold text-gray-600 hover:text-black hover:bg-white rounded transition-colors border-2 border-dashed border-gray-300"
                >
                  +{dayShifts.length - 3} more
                </button>
              )}
              {hasMore && isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newSet = new Set(expandedDays);
                    newSet.delete(dayKey);
                    setExpandedDays(newSet);
                  }}
                  className="w-full text-center py-1.5 text-[11px] font-bold text-gray-600 hover:text-black hover:bg-white rounded transition-colors border-2 border-dashed border-gray-300"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-2">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-2">{rows}</div>;
  };

  return (
    <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t-2 border-gray-200">
        <h4 className="text-xs font-bold text-gray-600 uppercase mb-3">Status Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-50 border border-yellow-300 rounded"></div>
            <span className="text-xs text-gray-700">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
            <span className="text-xs text-gray-700">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
            <span className="text-xs text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-red-300 rounded"></div>
            <span className="text-xs text-gray-700">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
