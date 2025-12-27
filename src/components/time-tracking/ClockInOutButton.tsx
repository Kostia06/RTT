'use client';

import { useState, useEffect } from 'react';
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns';

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  date: string;
  notes?: string;
}

interface ClockInOutButtonProps {
  employeeId: string;
  employeeName: string;
  activeEntry: TimeEntry | null;
  onSuccess: () => void;
}

export default function ClockInOutButton({
  employeeId,
  employeeName,
  activeEntry,
  onSuccess,
}: ClockInOutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [elapsedTime, setElapsedTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showClockOutForm, setShowClockOutForm] = useState(false);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [roundToNearest15, setRoundToNearest15] = useState(true);
  const [manualClockOut, setManualClockOut] = useState('');

  // Live timer for elapsed time
  useEffect(() => {
    if (!activeEntry) return;

    const updateElapsedTime = () => {
      const now = new Date();

      // Ensure clock in time is parsed correctly
      // If the timestamp doesn't end with Z, add it to indicate UTC
      let clockInStr = activeEntry.clockIn;
      if (!clockInStr.endsWith('Z') && !clockInStr.includes('+') && !clockInStr.includes('-', 10)) {
        clockInStr = clockInStr + 'Z';
      }
      const clockInTime = new Date(clockInStr);

      const totalSeconds = differenceInSeconds(now, clockInTime);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setElapsedTime({ hours, minutes, seconds });

      // Auto-set break time if > 5 hours
      if (hours >= 5 && breakMinutes === 0) {
        setBreakMinutes(30);
      }
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [activeEntry, breakMinutes]);

  const handleClockIn = async () => {
    if (!employeeId) {
      setMessage({ type: 'error', text: 'Please select an employee first' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/employee/time-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clockIn',
          employeeId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Successfully clocked in' });
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to clock in' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeEntry) return;

    setLoading(true);
    setMessage(null);

    try {
      // Calculate clock out time (current or manual)
      let clockOutTime = manualClockOut ? new Date(manualClockOut) : new Date();

      // Parse clock in time correctly (add Z if needed for UTC)
      let clockInStr = activeEntry.clockIn;
      if (!clockInStr.endsWith('Z') && !clockInStr.includes('+') && !clockInStr.includes('-', 10)) {
        clockInStr = clockInStr + 'Z';
      }
      const clockInTime = new Date(clockInStr);

      // Calculate total minutes worked
      let totalMinutes = differenceInMinutes(clockOutTime, clockInTime);

      // Subtract break time
      totalMinutes -= breakMinutes;

      // Round to nearest 15 if enabled
      if (roundToNearest15) {
        totalMinutes = Math.round(totalMinutes / 15) * 15;
      }

      const response = await fetch('/api/employee/time-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clockOut',
          employeeId,
          entryId: activeEntry.id,
          breakMinutes,
          roundToNearest15,
          manualClockOut: manualClockOut || undefined,
          calculatedMinutes: totalMinutes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Successfully clocked out' });
        setShowClockOutForm(false);
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to clock out' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !employeeId || loading;
  const isClockedIn = !!activeEntry;

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Status Bar */}
      <div className="bg-white border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm uppercase tracking-wider font-bold text-gray-900">
                {isClockedIn ? 'Clocked In' : 'Clocked Out'}
              </span>
            </div>
            {isClockedIn && activeEntry && (
              <span className="text-sm text-gray-500">
                Since {(() => {
                  let clockInStr = activeEntry.clockIn;
                  if (!clockInStr.endsWith('Z') && !clockInStr.includes('+') && !clockInStr.includes('-', 10)) {
                    clockInStr = clockInStr + 'Z';
                  }
                  return new Date(clockInStr).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });
                })()}
              </span>
            )}
          </div>

          {/* Live Timer */}
          {isClockedIn && (
            <div className="mt-6 text-center border-t border-gray-200 pt-6">
              <p className="text-6xl font-black tabular-nums">
                {formatTime(elapsedTime.hours, elapsedTime.minutes, elapsedTime.seconds)}
              </p>
              <p className="text-sm text-gray-500 mt-2 uppercase tracking-wide">
                {elapsedTime.hours}h {elapsedTime.minutes}m {elapsedTime.seconds}s
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clock In Button */}
      {!isClockedIn && (
        <button
          onClick={handleClockIn}
          disabled={isDisabled}
          className={`
            w-full py-6 text-xl font-black uppercase tracking-wider transition-all
            ${isDisabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800 text-white'
            }
          `}
        >
          {loading ? 'Processing...' : 'Clock In'}
        </button>
      )}

      {/* Clock Out Button */}
      {isClockedIn && !showClockOutForm && (
        <button
          onClick={() => setShowClockOutForm(true)}
          disabled={isDisabled}
          className={`
            w-full py-6 text-xl font-black uppercase tracking-wider transition-all
            ${isDisabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800 text-white'
            }
          `}
        >
          Clock Out
        </button>
      )}

      {/* Clock Out Form */}
      {isClockedIn && showClockOutForm && (
        <div className="bg-white border border-gray-200 space-y-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-black uppercase tracking-wide">Clock Out</h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Break Time */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-3">
                Break Time
                {elapsedTime.hours >= 5 && (
                  <span className="ml-2 text-xs text-gray-500 normal-case">
                    (Auto-set for 5+ hours)
                  </span>
                )}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setBreakMinutes(mins)}
                    className={`py-3 text-sm font-bold transition-all ${
                      breakMinutes === mins
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-900 border border-gray-200 hover:border-black'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Clock Out Time */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-gray-900 mb-3">
                Clock Out Time
              </label>
              <input
                type="datetime-local"
                value={manualClockOut}
                onChange={(e) => setManualClockOut(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none"
                placeholder="Leave blank for current time"
              />
            </div>

            {/* Round to Nearest 15 */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="round15"
                checked={roundToNearest15}
                onChange={(e) => setRoundToNearest15(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
              <label htmlFor="round15" className="text-sm font-bold cursor-pointer">
                Round to nearest 15 minutes
              </label>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total time:</span>
                  <span className="font-bold">{elapsedTime.hours}h {elapsedTime.minutes}m</span>
                </div>
                {breakMinutes > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Break:</span>
                    <span className="font-bold">-{breakMinutes}m</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold">Paid time:</span>
                  <span className="font-black text-lg">
                    {(() => {
                      let totalMins = elapsedTime.hours * 60 + elapsedTime.minutes - breakMinutes;
                      if (roundToNearest15) {
                        totalMins = Math.round(totalMins / 15) * 15;
                      }
                      const hours = Math.floor(totalMins / 60);
                      const mins = totalMins % 60;
                      return `${hours}h ${mins}m`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => setShowClockOutForm(false)}
              className="flex-1 py-3 font-bold uppercase tracking-wide bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleClockOut}
              disabled={loading}
              className={`
                flex-1 py-3 font-bold uppercase tracking-wide transition-all
                ${loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
                }
              `}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 text-center font-bold border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
