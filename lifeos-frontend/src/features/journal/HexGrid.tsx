/**
 * HexGrid Component
 * Honeycomb grid of journal entries
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HexCell } from './HexCell';
import { weeksToGrid, gridPositions } from './HexMath';
import { JournalEntryMeta, RangeWeeks, DayISO } from './journal.types';

interface HexGridProps {
  rangeWeeks: RangeWeeks;
  entries: JournalEntryMeta[];
  onOpenDate: (dateISO: DayISO) => void;
  cellW?: number;
  gap?: number;
}

export function HexGrid({
  rangeWeeks,
  entries,
  onOpenDate,
  cellW = 80,
  gap = 8,
}: HexGridProps) {
  const cellH = cellW * 0.866; // Hex height ratio

  // Generate grid layout
  const { dates, cols, rows } = useMemo(
    () => weeksToGrid(rangeWeeks),
    [rangeWeeks]
  );

  const positions = useMemo(
    () => gridPositions(cols, rows, cellW, cellH, gap),
    [cols, rows, cellW, cellH, gap]
  );

  // Map entries to dates for quick lookup
  const entryMap = useMemo(() => {
    const map = new Map<DayISO, JournalEntryMeta>();
    entries.forEach((entry) => {
      map.set(entry.date, entry);
    });
    return map;
  }, [entries]);

  // Calculate SVG dimensions with extra padding for glow effects
  const glowPadding = 40; // Extra space for purple glow and hover effects
  const svgWidth = cols * (cellW * 0.75 + gap) + cellW * 0.25 + gap + glowPadding * 2;
  const svgHeight = rows * (cellH + gap) + cellH * 0.5 + gap + glowPadding * 2;

  return (
    <div className="w-full overflow-x-auto py-8 px-4">
      <motion.svg
        width={svgWidth}
        height={svgHeight}
        className="mx-auto block"
        role="img"
        aria-label="Journal entry hexagon grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'visible' }}
      >
        {dates.map((dateISO, index) => {
          const position = positions[index];
          if (!position) return null;

          const entry = entryMap.get(dateISO);
          const hasEntry = !!entry;

          return (
            <HexCell
              key={dateISO}
              dateISO={dateISO}
              hasEntry={hasEntry}
              mood={entry?.mood}
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
