/**
 * Cosmic Week View - Enhanced Time Blocking Calendar
 * Based on research from Motion, Reclaim, Sunsama, Amie, etc.
 * Cosmic-themed with nebula backgrounds and stellar time blocks
 */

import React, { useState } from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  Zap,
  Moon,
  Sun,
  TrendingUp,
} from 'lucide-react';
import CosmicTimeBlock from './CosmicTimeBlock';
import CreateTimeBlockModal from './CreateTimeBlockModal';

export default function CosmicWeekView() {
  const { timeBlocks, getBlocksForDate, getBufferPercentage } = useCalendarStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Get start of week (Monday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(selectedDate);

  // Generate 7 days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Time slots (6am to 11pm)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatWeekRange = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return `${weekStart.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })} - ${end.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`;
  };

  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const handleSlotClick = (date, hour) => {
    const dateStr = date.toISOString().split('T')[0];
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    setSelectedSlot({
      date: dateStr,
      startTime,
      endTime,
    });
    setShowCreateModal(true);
  };

  const getBlocksForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return timeBlocks.filter((block) => block.date === dateStr);
  };

  const getBufferWarning = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const bufferPct = getBufferPercentage(dateStr);
    if (bufferPct < 10) return 'critical';
    if (bufferPct < 20) return 'warning';
    return 'good';
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0a10] relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Nebula gradients */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-white/10/50 bg-[#12101a]/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-all text-white/60 hover:text-purple-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">{formatWeekRange()}</h2>
              <p className="text-sm text-white/50">Week {getWeekNumber(weekStart)}</p>
            </div>

            <button
              onClick={() => navigateWeek(1)}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#12101a]/60 backdrop-blur-sm border border-white/10/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
              <Sun className="w-3 h-3" />
              <span>Peak Energy</span>
            </div>
            <div className="text-lg font-bold text-white">9-11 AM</div>
          </div>
          <div className="bg-[#12101a]/60 backdrop-blur-sm border border-white/10/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
              <Zap className="w-3 h-3" />
              <span>Deep Work</span>
            </div>
            <div className="text-lg font-bold text-purple-400">4.5h</div>
          </div>
          <div className="bg-[#12101a]/60 backdrop-blur-sm border border-white/10/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Planning Accuracy</span>
            </div>
            <div className="text-lg font-bold text-green-400">87%</div>
          </div>
          <div className="bg-[#12101a]/60 backdrop-blur-sm border border-white/10/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
              <Calendar className="w-3 h-3" />
              <span>Buffer Time</span>
            </div>
            <div className="text-lg font-bold text-blue-400">22%</div>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="min-w-[1200px] flex">
          {/* Time Column */}
          <div className="w-20 flex-shrink-0 border-r border-white/10/50 bg-[#12101a]/20">
            <div className="h-12 border-b border-white/10/50" />
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-white/10/30 flex items-start justify-center pt-2"
              >
                <span className="text-xs text-zinc-600 font-medium">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDays.map((date, dayIndex) => {
            const dayBlocks = getBlocksForDay(date);
            const bufferWarning = getBufferWarning(date);
            const today = isToday(date);

            return (
              <div
                key={dayIndex}
                className="flex-1 border-r border-white/10/50 relative"
                style={{
                  background: today
                    ? 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)'
                    : 'transparent',
                }}
              >
                {/* Day Header */}
                <div
                  className={`h-12 border-b border-white/10/50 flex flex-col items-center justify-center ${
                    today ? 'bg-purple-500/10' : 'bg-[#12101a]/20'
                  }`}
                >
                  <div className="text-xs text-white/50 uppercase">
                    {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      today ? 'text-purple-400' : 'text-white'
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  {bufferWarning === 'critical' && (
                    <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5" />
                  )}
                </div>

                {/* Time Slots */}
                <div className="relative">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      onClick={() => handleSlotClick(date, hour)}
                      className="h-16 border-b border-white/10/30 hover:bg-purple-500/5 transition-all cursor-pointer group relative"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-purple-400 font-medium">
                          + Add Block
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Render Time Blocks */}
                  {dayBlocks.map((block) => (
                    <CosmicTimeBlock key={block.id} block={block} />
                  ))}
                </div>
              </div>
            );
          })}
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
