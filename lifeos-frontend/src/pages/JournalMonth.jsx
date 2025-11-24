/**
 * Journal Month Page
 * Shows days for a specific month in organic honeycomb pattern
 */

import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { useJournalStore } from '../features/journal/journal.store';
import { MonthDayGrid } from '../features/journal/MonthDayGrid';
import { EntryFullView } from '../features/journal/EntryFullView';

export default function JournalMonth() {
  const { year, month } = useParams();
  const navigate = useNavigate();
  const {
    entries,
    loading,
    selectedDate,
    hydrate,
    selectDate,
  } = useJournalStore();

  // Load entries on mount
  useEffect(() => {
    hydrate();
  }, []);

  // Generate all days for this month with entry data
  const monthDaysData = useMemo(() => {
    if (!year || !month) return { days: [], entries: [] };

    const monthStart = startOfMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
    const monthEnd = endOfMonth(monthStart);

    // Get all days in the month
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Filter entries for this month
    const monthEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    return { days: allDays, entries: monthEntries };
  }, [entries, year, month]);

  const { days: allDays, entries: monthEntries } = monthDaysData;

  // Get month label
  const monthLabel = useMemo(() => {
    if (!year || !month) return '';
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(date, 'MMMM yyyy');
  }, [year, month]);

  // Calculate stats for this month
  const entryCount = monthEntries.length;
  const totalWords = monthEntries.reduce((sum, e) => sum + (e.wordCount || 0), 0);
  const avgWords = entryCount > 0 ? Math.round(totalWords / entryCount) : 0;

  // Handle add entry - navigate to write page with today's date
  const handleAddEntry = () => {
    const today = new Date();
    const todayFormatted = format(today, 'yyyy-MM-dd').split('-');
    navigate(`/journal/${todayFormatted[0]}/${todayFormatted[1]}/${todayFormatted[2]}/write`);
  };

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (!year || !month) return;
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const prevMonth = subMonths(currentDate, 1);
    navigate(`/journal/${format(prevMonth, 'yyyy')}/${format(prevMonth, 'MM')}`);
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (!year || !month) return;
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const nextMonth = addMonths(currentDate, 1);
    navigate(`/journal/${format(nextMonth, 'yyyy')}/${format(nextMonth, 'MM')}`);
  };

  return (
    <div className="min-h-screen bg-[#0c0a10] text-white p-6 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <button
            onClick={() => navigate('/journal')}
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Journal
          </button>
          <span className="text-zinc-600">/</span>
          <span className="text-white/60">{monthLabel}</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <BookOpen size={24} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {monthLabel}
              </h1>
              <p className="text-white/60 mt-1">
                {entryCount} {entryCount === 1 ? 'entry' : 'entries'} this month
              </p>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg bg-[#1a1724] hover:bg-[#221e2e] text-white/60 hover:text-white transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg bg-[#1a1724] hover:bg-[#221e2e] text-white/60 hover:text-white transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats - Minimal inline display */}
      <div className="flex items-center gap-8 mb-8 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-white/50">Entries:</span>
          <span className="text-white font-semibold">{entryCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/50">Total Words:</span>
          <span className="text-white font-semibold">{totalWords.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/50">Avg Words:</span>
          <span className="text-white font-semibold">{avgWords}</span>
        </div>
      </div>

      {/* Day Hex Grid - Open Canvas */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
        </div>
      ) : (
        <MonthDayGrid
          days={allDays}
          entries={monthEntries}
          onOpenDate={selectDate}
          cellW={90}
          gap={12}
          monthSeed={`${year}-${month}`}
        />
      )}

      {/* Entry Full View Modal */}
      <EntryFullView
        dateISO={selectedDate || ''}
        open={!!selectedDate}
        onClose={() => selectDate(undefined)}
      />

      {/* Floating Add Entry Button */}
      <button
        onClick={handleAddEntry}
        className="fixed bottom-8 right-8 w-16 h-16 bg-violet-500 text-white rounded-full shadow-2xl hover:bg-violet-600 hover:scale-110 transition-all duration-200 flex items-center justify-center group"
        aria-label="Add new journal entry"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-200" />
      </button>
    </div>
  );
}
