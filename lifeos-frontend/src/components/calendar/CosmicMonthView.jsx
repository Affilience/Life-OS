/**
 * Cosmic Month View - Enhanced Monthly Calendar
 * Cosmic-themed with nebula backgrounds and stellar event indicators
 */

import React, { useState, useMemo } from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react';
import CreateTimeBlockModal from './CreateTimeBlockModal';

export default function CosmicMonthView() {
  const {
    timeBlocks,
    getBlocksForDate,
  } = useCalendarStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Adjust so week starts on Monday (0 = Monday, 6 = Sunday)
  const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayBlocks = getBlocksForDate(dateStr);

      days.push({
        day,
        date,
        dateStr,
        blocks: dayBlocks,
        totalMinutes: dayBlocks.reduce((sum, b) => sum + (b.plannedDuration || 0), 0),
        completedBlocks: dayBlocks.filter(b => b.status === 'completed').length,
        deepWorkBlocks: dayBlocks.filter(b => b.type === 'deep_work').length,
      });
    }

    return days;
  }, [year, month, daysInMonth, adjustedStartDay, getBlocksForDate]);

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const allBlocks = calendarDays
      .filter(d => d !== null)
      .flatMap(d => d.blocks);

    const totalBlocks = allBlocks.length;
    const completedBlocks = allBlocks.filter(b => b.status === 'completed').length;
    const deepWorkBlocks = allBlocks.filter(b => b.type === 'deep_work');
    const deepWorkMinutes = deepWorkBlocks.reduce((sum, b) => sum + (b.plannedDuration || 0), 0);
    const deepWorkHours = (deepWorkMinutes / 60).toFixed(1);

    const daysWithBlocks = calendarDays.filter(d => d !== null && d.blocks.length > 0).length;
    const completionRate = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : null;

    return {
      totalBlocks,
      completedBlocks,
      deepWorkHours,
      daysWithBlocks,
      completionRate,
      hasData: totalBlocks > 0,
    };
  }, [calendarDays]);

  const goToPreviousMonth = () => {
    setSelectedDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month;
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return today.getFullYear() === year &&
           today.getMonth() === month &&
           today.getDate() === day;
  };

  const handleDayClick = (dayData) => {
    if (!dayData) return;

    setSelectedDay(dayData);
    setSelectedSlot({
      date: dayData.dateStr,
      startTime: '09:00',
      endTime: '10:00',
    });
  };

  const handleAddBlock = () => {
    if (selectedDay) {
      setShowCreateModal(true);
    } else {
      // Default to today
      const today = new Date();
      setSelectedSlot({
        date: today.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
      });
      setShowCreateModal(true);
    }
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthName = selectedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  // Get block type color
  const getBlockTypeColor = (type) => {
    const colors = {
      deep_work: 'bg-purple-500',
      meeting: 'bg-blue-500',
      admin: 'bg-gray-500',
      personal: 'bg-green-500',
      health: 'bg-red-500',
      learning: 'bg-yellow-500',
    };
    return colors[type] || 'bg-primary-500';
  };

  return (
    <div className="h-full flex flex-col bg-bg-0 relative overflow-hidden" data-tour="month-view">
      {/* Cosmic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
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
              onClick={goToPreviousMonth}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-primary-500/20 rounded-lg transition-all text-text-muted hover:text-primary-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-lg sm:text-2xl font-bold text-text-primary">{monthName}</h2>
              <p className="text-xs sm:text-sm text-text-muted">{daysInMonth} days</p>
            </div>

            <button
              onClick={goToNextMonth}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-primary-500/20 rounded-lg transition-all text-text-muted hover:text-primary-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {!isCurrentMonth() && (
              <button
                onClick={goToToday}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 min-h-[44px] bg-bg-1 hover:bg-bg-2 text-zinc-300 rounded-lg transition-all text-sm font-medium"
              >
                Today
              </button>
            )}
            <button
              onClick={handleAddBlock}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 min-h-[44px] bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-text-primary rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/30"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Time Block</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-tour="month-stats">
          <div className="bg-bg-elevated/60 backdrop-blur-sm border border-border/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <Calendar className="w-3 h-3" />
              <span>Total Blocks</span>
            </div>
            <div className="text-lg font-bold text-text-primary">
              {monthlyStats.totalBlocks}
            </div>
            <div className="text-xs text-text-muted mt-0.5">
              {monthlyStats.daysWithBlocks} days planned
            </div>
          </div>
          <div className="bg-bg-elevated/60 backdrop-blur-sm border border-border/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <Zap className="w-3 h-3" />
              <span>Deep Work</span>
            </div>
            <div className="text-lg font-bold text-primary-400">
              {monthlyStats.deepWorkHours}h
            </div>
            <div className="text-xs text-text-muted mt-0.5">this month</div>
          </div>
          <div className="bg-bg-elevated/60 backdrop-blur-sm border border-border/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed</span>
            </div>
            <div className="text-lg font-bold text-green-400">
              {monthlyStats.completedBlocks}
            </div>
            <div className="text-xs text-text-muted mt-0.5">
              of {monthlyStats.totalBlocks} blocks
            </div>
          </div>
          <div className="bg-bg-elevated/60 backdrop-blur-sm border border-border/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Completion Rate</span>
            </div>
            <div className={`text-lg font-bold ${
              monthlyStats.completionRate !== null
                ? monthlyStats.completionRate >= 80 ? 'text-green-400'
                  : monthlyStats.completionRate >= 60 ? 'text-yellow-400'
                  : 'text-orange-400'
                : 'text-text-muted'
            }`}>
              {monthlyStats.completionRate !== null ? `${monthlyStats.completionRate}%` : '—'}
            </div>
            {monthlyStats.completionRate === null && (
              <div className="text-xs text-text-muted mt-0.5">Add blocks to track</div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto relative z-10 p-4">
        <div className="bg-bg-elevated/30 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden">
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b border-border/50">
            {weekDays.map(day => (
              <div
                key={day}
                className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-text-muted uppercase bg-bg-elevated/40"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Calendar days grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((dayData, index) => {
              const isEmpty = dayData === null;
              const today = dayData && isToday(dayData.day);
              const hasBlocks = dayData && dayData.blocks.length > 0;
              const isSelected = selectedDay && dayData && selectedDay.dateStr === dayData.dateStr;

              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(dayData)}
                  className={`
                    min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border-b border-r border-border/30
                    transition-all cursor-pointer
                    ${isEmpty ? 'bg-bg-0/30' : 'hover:bg-primary-500/10'}
                    ${today ? 'bg-primary-500/20 ring-1 ring-primary-500/50' : ''}
                    ${isSelected ? 'bg-primary-500/30 ring-2 ring-primary-500' : ''}
                  `}
                >
                  {dayData && (
                    <>
                      {/* Day number */}
                      <div className={`
                        text-sm sm:text-base font-bold mb-1
                        ${today ? 'text-primary-400' : 'text-text-primary'}
                      `}>
                        {dayData.day}
                      </div>

                      {/* Block indicators */}
                      {hasBlocks && (
                        <div className="space-y-1">
                          {/* Show up to 3 block indicators */}
                          {dayData.blocks.slice(0, 3).map((block, i) => (
                            <div
                              key={block.id || i}
                              className={`
                                h-1.5 sm:h-2 rounded-full ${getBlockTypeColor(block.type)}
                                ${block.status === 'completed' ? 'opacity-60' : 'opacity-100'}
                              `}
                              title={block.title}
                            />
                          ))}

                          {/* Show "+X more" if more than 3 blocks */}
                          {dayData.blocks.length > 3 && (
                            <div className="text-xs text-text-muted">
                              +{dayData.blocks.length - 3} more
                            </div>
                          )}
                        </div>
                      )}

                      {/* Time summary (desktop only) */}
                      {hasBlocks && dayData.totalMinutes > 0 && (
                        <div className="hidden sm:flex items-center gap-1 mt-1 text-xs text-text-muted">
                          <Clock className="w-3 h-3" />
                          {Math.round(dayData.totalMinutes / 60)}h
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDay && selectedDay.blocks.length > 0 && (
          <div className="mt-4 bg-bg-elevated/40 backdrop-blur-sm border border-border/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              {selectedDay.date.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </h3>
            <div className="space-y-2">
              {selectedDay.blocks.map((block, i) => (
                <div
                  key={block.id || i}
                  className="flex items-center gap-3 p-2 bg-bg-0/50 rounded-lg"
                >
                  <div className={`w-2 h-8 rounded-full ${getBlockTypeColor(block.type)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">
                      {block.title}
                    </div>
                    <div className="text-xs text-text-muted">
                      {block.startTime} - {block.endTime}
                      {block.status === 'completed' && (
                        <span className="ml-2 text-green-400">Completed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Time Block Modal */}
      {showCreateModal && (
        <CreateTimeBlockModal
          initialDate={selectedSlot?.date}
          initialStartTime={selectedSlot?.startTime}
          initialEndTime={selectedSlot?.endTime}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}
