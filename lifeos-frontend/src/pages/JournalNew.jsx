/**
 * Starlog - Honeycomb Hex Browser
 * Uniform grid of hexagons showing journal entries by date
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Flame, Search, X, Tag as TagIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useJournalStore } from '../features/journal/journal.store';
import { MonthHexGrid } from '../features/journal/MonthHexGrid';
import { EntryFullView } from '../features/journal/EntryFullView';
import { calculateStreaks, getAllTags } from '../features/journal/journal.utils';
import PageHeader from '../components/shared/PageHeader';

export default function JournalNew() {
  const navigate = useNavigate();
  const {
    entries,
    loading,
    selectedDate,
    filters,
    hydrate,
    selectDate,
    setFilters,
  } = useJournalStore();

  const [searchInput, setSearchInput] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);

  // Load entries on mount
  useEffect(() => {
    hydrate();
  }, []);

  // Handle month selection
  const handleOpenMonth = (year, month) => {
    navigate(`/journal/${year}/${month}`);
  };

  // Jump to today's month
  const handleJumpToToday = () => {
    const today = new Date();
    navigate(`/journal/${format(today, 'yyyy')}/${format(today, 'MM')}`);
  };

  // Calculate stats
  const entryCount = entries.length;
  const totalWords = entries.reduce((sum, e) => sum + (e.wordCount || 0), 0);
  const avgWords = entryCount > 0 ? Math.round(totalWords / entryCount) : 0;

  // Weekly entry count (last 7 days)
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const weeklyEntries = entries.filter((e) => {
    const entryDate = new Date(e.date);
    return entryDate >= sevenDaysAgo && entryDate <= today;
  }).length;

  // Calculate streaks
  const streakInfo = useMemo(() => calculateStreaks(entries), [entries]);

  // Get all available tags
  const availableTags = useMemo(() => getAllTags(entries), [entries]);

  // Handle search
  const handleSearch = () => {
    setFilters({ search: searchInput });
  };

  // Handle tag filter toggle
  const handleToggleTag = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    setFilters({ tags: newTags });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setFilters({ search: '', tags: [] });
  };

  // Check if filters are active
  const hasActiveFilters = filters.search || filters.tags.length > 0;

  return (
    <div className="min-h-screen bg-[#0c0a10] text-white p-6 md:p-8 animate-fade-in">
      <PageHeader
        title="Starlog"
        subtitle="Personal journal and daily reflections"
        stats={`${entryCount} entries · ${weeklyEntries} this week${streakInfo.current > 0 ? ` · ${streakInfo.current} day streak 🔥` : ''}`}
        icon={BookOpen}
        module="journal"
        variant="icon"
        actions={
          <button
            onClick={handleJumpToToday}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors text-sm"
          >
            <Calendar size={16} />
            <span>Today</span>
          </button>
        }
      />

      {/* Search & Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 flex items-center gap-2 bg-[#12101a]/50 border border-white/10/50 rounded-lg px-4 py-2.5 focus-within:border-violet-500/30 transition-colors">
            <Search size={18} className="text-zinc-600" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search entries..."
              className="flex-1 bg-transparent border-none outline-none text-zinc-300 placeholder-zinc-700 text-sm"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setFilters({ search: '' });
                }}
                className="text-zinc-600 hover:text-white/60 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors text-sm ${
              showFilters || filters.tags.length > 0
                ? 'bg-violet-500/20 border border-violet-500/30 text-violet-400'
                : 'bg-[#12101a]/50 border border-white/10/50 text-white/60 hover:text-white'
            }`}
          >
            <TagIcon size={16} />
            <span>Tags</span>
            {filters.tags.length > 0 && (
              <span className="px-2 py-0.5 bg-violet-500/30 rounded-full text-xs">
                {filters.tags.length}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 bg-[#1a1724]/50 hover:bg-[#221e2e]/50 text-white/60 hover:text-white rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <X size={16} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Tag Filter Pills */}
        {showFilters && availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 bg-[#12101a]/30 rounded-lg border border-white/10/30">
            <span className="text-xs text-zinc-600 mr-2">Filter by tag:</span>
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  filters.tags.includes(tag)
                    ? 'bg-violet-500/20 border border-violet-500/30 text-violet-400'
                    : 'bg-[#1a1724]/50 border border-white/15/50 text-white/50 hover:text-zinc-300 hover:border-zinc-600/50'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>Active filters:</span>
            {filters.search && (
              <span className="px-2 py-1 bg-[#1a1724]/50 rounded text-white/60">
                Search: "{filters.search}"
              </span>
            )}
            {filters.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-violet-500/10 rounded text-violet-400">
                #{tag}
              </span>
            ))}
            <span className="text-zinc-600">• {entryCount} results</span>
          </div>
        )}
      </div>


      {/* Month Hex Grid - Open Canvas */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
        </div>
      ) : (
        <MonthHexGrid
          entries={entries}
          onOpenMonth={handleOpenMonth}
          cellW={120}
          gap={16}
        />
      )}

      {/* Entry Full View Modal */}
      <EntryFullView
        dateISO={selectedDate || ''}
        open={!!selectedDate}
        onClose={() => selectDate(undefined)}
      />
    </div>
  );
}
