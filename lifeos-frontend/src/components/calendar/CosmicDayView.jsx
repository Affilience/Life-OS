/**
 * Cosmic Day View - Focused single-day time blocking view
 * Shows hourly breakdown with cosmic styling
 */

import React, { useState } from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Zap,
  TrendingUp,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import CosmicTimeBlock from './CosmicTimeBlock';
import CreateTimeBlockModal from './CreateTimeBlockModal';

export default function CosmicDayView() {
  const { getBlocksForDate, getPlannedTimeForDate, getBufferPercentage } =
    useCalendarStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Time slots (6am to 11pm)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  const navigateDay = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  const formatDate = () => {
    return selectedDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSlotClick = (hour) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    setSelectedSlot({
      date: dateStr,
      startTime,
      endTime,
    });
    setShowCreateModal(true);
  };

  const dateStr = selectedDate.toISOString().split('T')[0];
  const dayBlocks = getBlocksForDate(dateStr);
  const plannedMinutes = getPlannedTimeForDate(dateStr);
  const bufferPct = getBufferPercentage(dateStr);

  // Calculate stats for the day
  const totalBlocks = dayBlocks.length;
  const completedBlocks = dayBlocks.filter((b) => b.status === 'completed').length;
  const deepWorkBlocks = dayBlocks.filter((b) => b.type === 'deep_work');
  const deepWorkMinutes = deepWorkBlocks.reduce((acc, b) => acc + b.plannedDuration, 0);

  const getBufferStatus = () => {
    if (bufferPct < 10) return { color: 'red', label: 'Overcommitted' };
    if (bufferPct < 20) return { color: 'orange', label: 'High Load' };
    return { color: 'green', label: 'Healthy' };
  };

  const bufferStatus = getBufferStatus();

  return (
    <div className="h-full flex flex-col bg-[#0c0a10] relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-white/10/50 bg-[#12101a]/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateDay(-1)}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-all text-white/60 hover:text-purple-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">{formatDate()}</h2>
              {isToday() && (
                <p className="text-sm text-purple-400 font-medium">Today</p>
              )}
            </div>

            <button
              onClick={() => navigateDay(1)}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-all text-white/60 hover:text-purple-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-[#1a1724] hover:bg-[#221e2e] text-zinc-300 rounded-lg transition-all text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-purple-500/30"
            >
              <Plus className="w-4 h-4" />
              Add Time Block
            </button>
          </div>
        </div>

        {/* Day Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#12101a]/60 backdrop-blur-sm border border-white/10/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
              <Calendar className="w-3 h-3" />
              <span>Total Blocks</span>
            </div>
            <div className="text-lg font-bold text-white">{totalBlocks}</div>
            {completedBlocks > 0 && (
              <div className="text-xs text-green-400 mt-1">
                {completedBlocks} completed
              </div>
            )}
          </div>

          <div className="bg-[#12101a]/60 backdrop-blur-sm border border-white/10/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
              <Zap className="w-3 h-3" />
              <span>Deep Work</span>
            </div>
            <div className="text-lg font-bold text-purple-400">
              {(deepWorkMinutes / 60).toFixed(1)}h
            </div>
            <div className="text-xs text-white/50 mt-1">
              {deepWorkBlocks.length} blocks
            </div>
          </div>

          <div className="bg-[#12101a]/60 backdrop-blur-sm border border-white/10/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Planned Time</span>
            </div>
            <div className="text-lg font-bold text-blue-400">
              {(plannedMinutes / 60).toFixed(1)}h
            </div>
            <div className="text-xs text-white/50 mt-1">
              of {((18 * 60) / 60).toFixed(0)}h available
            </div>
          </div>

          <div className="bg-[#12101a]/60 backdrop-blur-sm border border-white/10/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
              {bufferStatus.color === 'red' ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <Sun className="w-3 h-3" />
              )}
              <span>Buffer Time</span>
            </div>
            <div
              className={`text-lg font-bold ${
                bufferStatus.color === 'red'
                  ? 'text-red-400'
                  : bufferStatus.color === 'orange'
                  ? 'text-orange-400'
                  : 'text-green-400'
              }`}
            >
              {bufferPct.toFixed(0)}%
            </div>
            <div className="text-xs text-white/50 mt-1">{bufferStatus.label}</div>
          </div>
        </div>
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="min-w-[800px] flex">
          {/* Time Column */}
          <div className="w-24 flex-shrink-0 border-r border-white/10/50 bg-[#12101a]/20">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-20 border-b border-white/10/30 flex items-start justify-end pr-4 pt-2"
              >
                <span className="text-sm text-white/50 font-medium">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day Column */}
          <div
            className="flex-1 relative"
            style={{
              background: isToday()
                ? 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)'
                : 'transparent',
            }}
          >
            {/* Time Slots */}
            <div className="relative">
              {hours.map((hour) => (
                <div
                  key={hour}
                  onClick={() => handleSlotClick(hour)}
                  className="h-20 border-b border-white/10/30 hover:bg-purple-500/5 transition-all cursor-pointer group relative"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-purple-400 font-medium">
                      + Add Block
                    </div>
                  </div>
                </div>
              ))}

              {/* Render Time Blocks */}
              <div className="absolute inset-0">
                {dayBlocks.map((block) => (
                  <CosmicTimeBlock key={block.id} block={block} heightMultiplier={1.25} />
                ))}
              </div>

              {/* Current Time Indicator (if today) */}
              {isToday() && <CurrentTimeIndicator />}
            </div>
          </div>
        </div>
      </div>

      {/* Create Time Block Modal */}
      {showCreateModal && (
        <CreateTimeBlockModal
          initialData={selectedSlot}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}

// Current time indicator component
function CurrentTimeIndicator() {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const hour = currentTime.getHours();
  const minute = currentTime.getMinutes();

  // Only show if within visible hours (6am to 11pm)
  if (hour < 6 || hour >= 23) return null;

  const top = (hour - 6) * 80 + (minute / 60) * 80; // 80px per hour in day view

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${top}px` }}
    >
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-pulse" />
        <div className="flex-1 h-0.5 bg-red-500/50" />
        <div className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
          {currentTime.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
