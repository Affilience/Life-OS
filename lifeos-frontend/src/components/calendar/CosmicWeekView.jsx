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
  TrendingUp,
} from 'lucide-react';
import CosmicTimeBlock from './CosmicTimeBlock';
import CreateTimeBlockModal from './CreateTimeBlockModal';

export default function CosmicWeekView({ onNavigateToDay }) {
  const {
    timeBlocks,
    events,
    getBlocksForDate,
    getEventsForDate,
    getBufferPercentage,
    getPlanningAccuracy,
    getThisWeeksBlocks
  } = useCalendarStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);

  // Calculate weekly stats from actual data
  const weeklyStats = React.useMemo(() => {
    const weekBlocks = getThisWeeksBlocks();

    // Deep work hours this week
    const deepWorkBlocks = weekBlocks.filter(b => b.type === 'deep_work');
    const deepWorkMinutes = deepWorkBlocks.reduce((sum, b) => sum + (b.plannedDuration || 0), 0);
    const deepWorkHours = (deepWorkMinutes / 60).toFixed(1);

    // Planning accuracy
    const accuracy = getPlanningAccuracy();
    const accuracyPercent = accuracy.count > 0
      ? Math.round(Math.min(100, Math.max(0, (1 - Math.abs(1 - accuracy.ratio)) * 100)))
      : null;

    // Average buffer time for the week
    const today = new Date();
    let totalBuffer = 0;
    let daysWithBlocks = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - today.getDay() + 1 + i); // Monday-based week
      const dateStr = d.toISOString().split('T')[0];
      const dayBlocks = getBlocksForDate(dateStr);
      if (dayBlocks.length > 0) {
        totalBuffer += getBufferPercentage(dateStr);
        daysWithBlocks++;
      }
    }

    const avgBuffer = daysWithBlocks > 0 ? Math.round(totalBuffer / daysWithBlocks) : null;

    return {
      deepWorkHours,
      accuracyPercent,
      avgBuffer,
      hasData: weekBlocks.length > 0
    };
  }, [timeBlocks, getThisWeeksBlocks, getPlanningAccuracy, getBlocksForDate, getBufferPercentage]);

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

  const getEventsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (getEventsForDate) {
      return getEventsForDate(dateStr);
    }
    return (events || []).filter((event) => event.startTime?.split('T')[0] === dateStr);
  };

  const getBufferWarning = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const bufferPct = getBufferPercentage(dateStr);
    if (bufferPct < 10) return 'critical';
    if (bufferPct < 20) return 'warning';
    return 'good';
  };

  return (
    <div className="h-full flex flex-col bg-bg-0 relative overflow-hidden">
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
      <div className="relative z-10 p-4 md:p-6 border-b border-border/50 bg-bg-elevated/20 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-primary-500/20 rounded-lg transition-all text-text-muted hover:text-primary-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-lg sm:text-2xl font-bold text-text-primary">{formatWeekRange()}</h2>
              <p className="text-xs sm:text-sm text-text-muted">Week {getWeekNumber(weekStart)}</p>
            </div>

            <button
              onClick={() => navigateWeek(1)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-primary-500/20 rounded-lg transition-all text-text-muted hover:text-primary-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={goToToday}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 min-h-[44px] bg-bg-1 hover:bg-bg-2 text-zinc-300 rounded-lg transition-all text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 min-h-[44px] bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-text-primary rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/30"
              data-tour="add-block-btn"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Time Block</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg-elevated/60 backdrop-blur-sm border border-border/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <Zap className="w-3 h-3" />
              <span>Deep Work</span>
            </div>
            <div className="text-lg font-bold text-primary-400">
              {weeklyStats.deepWorkHours}h
            </div>
            <div className="text-xs text-text-muted mt-0.5">this week</div>
          </div>
          <div className="bg-bg-elevated/60 backdrop-blur-sm border border-border/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Planning Accuracy</span>
            </div>
            <div className={`text-lg font-bold ${
              weeklyStats.accuracyPercent !== null
                ? weeklyStats.accuracyPercent >= 80 ? 'text-green-400'
                  : weeklyStats.accuracyPercent >= 60 ? 'text-yellow-400'
                  : 'text-orange-400'
                : 'text-text-muted'
            }`}>
              {weeklyStats.accuracyPercent !== null ? `${weeklyStats.accuracyPercent}%` : '—'}
            </div>
            {weeklyStats.accuracyPercent === null && (
              <div className="text-xs text-text-muted mt-0.5">Complete blocks to track</div>
            )}
          </div>
          <div className="bg-bg-elevated/60 backdrop-blur-sm border border-border/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <Calendar className="w-3 h-3" />
              <span>Buffer Time</span>
            </div>
            <div className={`text-lg font-bold ${
              weeklyStats.avgBuffer !== null
                ? weeklyStats.avgBuffer >= 20 ? 'text-green-400'
                  : weeklyStats.avgBuffer >= 10 ? 'text-yellow-400'
                  : 'text-red-400'
                : 'text-text-muted'
            }`}>
              {weeklyStats.avgBuffer !== null ? `${weeklyStats.avgBuffer}%` : '—'}
            </div>
            {weeklyStats.avgBuffer === null && (
              <div className="text-xs text-text-muted mt-0.5">Add blocks to calculate</div>
            )}
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-auto relative z-10 -webkit-overflow-scrolling-touch">
        <div className="min-w-[800px] lg:min-w-[1200px] flex">
          {/* Time Column */}
          <div className="w-20 flex-shrink-0 border-r border-border/50 bg-bg-elevated/20">
            <div className="h-12 border-b border-border/50" />
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-border/30 flex items-start justify-center pt-2"
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
            const dayEvents = getEventsForDay(date);
            const bufferWarning = getBufferWarning(date);
            const today = isToday(date);

            return (
              <div
                key={dayIndex}
                className="flex-1 border-r border-border/50 relative"
                style={{
                  background: today
                    ? 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)'
                    : 'transparent',
                }}
              >
                {/* Day Header - Click to navigate to day view */}
                <div
                  onClick={() => onNavigateToDay && onNavigateToDay(date)}
                  className={`h-12 border-b border-border/50 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-primary-500/20 ${
                    today ? 'bg-primary-500/10' : 'bg-bg-elevated/20'
                  }`}
                  title="Click to view full day"
                >
                  <div className="text-xs text-text-muted uppercase">
                    {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      today ? 'text-primary-400' : 'text-text-primary'
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
                      className="h-16 border-b border-border/30 hover:bg-primary-500/5 transition-all cursor-pointer group relative"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-primary-400 font-medium">
                          + Add Block
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Render Time Blocks */}
                  {dayBlocks.map((block) => (
                    <CosmicTimeBlock
                      key={block.id}
                      block={block}
                      onEdit={(block) => {
                        setEditingBlock(block);
                        setShowCreateModal(true);
                      }}
                    />
                  ))}

                  {/* Render Timed Events */}
                  {dayEvents.filter(e => !e.allDay && e.startTime).map((event) => {
                    const startHour = parseInt(event.startTime?.split('T')[1]?.split(':')[0] || '0');
                    const startMinute = parseInt(event.startTime?.split('T')[1]?.split(':')[1] || '0');
                    const endHour = parseInt(event.endTime?.split('T')[1]?.split(':')[0] || startHour + 1);
                    const endMinute = parseInt(event.endTime?.split('T')[1]?.split(':')[1] || '0');

                    const top = (startHour - 6) * 64 + (startMinute / 60) * 64;
                    const duration = (endHour - startHour) * 60 + (endMinute - startMinute);
                    const height = Math.max((duration / 60) * 64, 24);

                    if (startHour < 6 || startHour >= 23) return null;

                    return (
                      <div
                        key={event.id}
                        className="absolute left-0.5 right-0.5 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity z-10"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: `${event.color || '#06b6d4'}30`,
                          borderLeft: `2px solid ${event.color || '#06b6d4'}`,
                        }}
                      >
                        <div className="p-1">
                          <div className="text-xs font-medium text-text-primary truncate">
                            {event.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit Time Block Modal */}
      {showCreateModal && (
        <CreateTimeBlockModal
          initialData={selectedSlot}
          editBlock={editingBlock}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedSlot(null);
            setEditingBlock(null);
          }}
        />
      )}
    </div>
  );
}
