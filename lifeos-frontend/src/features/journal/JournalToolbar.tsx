/**
 * Journal Toolbar Component
 * Filters and controls for the journal view
 */

import React from 'react';
import { RangeWeeks } from './journal.types';

interface JournalToolbarProps {
  rangeWeeks: RangeWeeks;
  onChangeRange: (weeks: RangeWeeks) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function JournalToolbar({
  rangeWeeks,
  onChangeRange,
  search,
  onSearchChange,
}: JournalToolbarProps) {
  const ranges: RangeWeeks[] = [13, 26, 52];

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Range selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">Range:</span>
        {ranges.map((range) => (
          <button
            key={range}
            onClick={() => onChangeRange(range)}
            className={`
              px-3 py-1 rounded-md text-xs font-medium transition-all
              ${
                rangeWeeks === range
                  ? 'bg-violet-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }
            `}
          >
            {range}w
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search entries..."
        className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
      />
    </div>
  );
}
