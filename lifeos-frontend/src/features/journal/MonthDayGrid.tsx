/**
 * MonthDayGrid Component
 * Shows all days of a specific month in organic honeycomb pattern
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { HexCell } from './HexCell';
import { gridPositions } from './HexMath';
import { JournalEntryMeta, DayISO } from './journal.types';
import { isInCurrentStreak } from './journal.utils';

interface MonthDayGridProps {
  days: Date[]; // All days in the month
  entries: JournalEntryMeta[];
  onOpenDate: (dateISO: DayISO) => void;
  cellW?: number;
  gap?: number;
  monthSeed?: string; // Optional seed for unique month pattern (e.g., "2025-01")
}

export function MonthDayGrid({
  days,
  entries,
  onOpenDate,
  cellW = 90,
  gap = 12,
  monthSeed,
}: MonthDayGridProps) {
  const cellH = cellW * 0.866; // Hex height ratio

  // Map entries to dates for quick lookup
  const entryMap = useMemo(() => {
    const map = new Map<DayISO, JournalEntryMeta>();
    entries.forEach((entry) => {
      map.set(entry.date, entry);
    });
    return map;
  }, [entries]);

  // Calculate grid dimensions
  const totalDays = days.length;
  const cols = Math.ceil(Math.sqrt(totalDays * 1.15));
  const rows = Math.ceil(totalDays / cols);

  const positions = useMemo(
    () => gridPositions(cols, rows, cellW, cellH, gap, monthSeed),
    [cols, rows, cellW, cellH, gap, monthSeed]
  );

  // Calculate SVG dimensions with extra padding for glow effects
  const glowPadding = 40;
  const svgWidth = cols * (cellW * 0.75 + gap) + cellW * 0.25 + gap + glowPadding * 2;
  const svgHeight = rows * (cellH + gap) + cellH * 0.5 + gap + glowPadding * 2;

  return (
    <div className="w-full overflow-x-auto py-8 px-4">
      <motion.svg
        width={svgWidth}
        height={svgHeight}
        className="mx-auto block"
        role="img"
        aria-label="Journal month days hexagon grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'visible' }}
      >
        {days.map((day, index) => {
          const position = positions[index];
          if (!position) return null;

          const dateISO = format(day, 'yyyy-MM-dd') as DayISO;
          const entry = entryMap.get(dateISO);
          const hasEntry = !!entry;
          const inStreak = hasEntry && isInCurrentStreak(dateISO, entries);

          return (
            <HexCell
              key={dateISO}
              dateISO={dateISO}
              hasEntry={hasEntry}
              mood={entry?.mood}
              isInStreak={inStreak}
              onOpen={onOpenDate}
              width={cellW}
              height={cellH}
              x={position.x + glowPadding}
              y={position.y + glowPadding}
            />
          );
        })}
      </motion.svg>
    </div>
  );
}
