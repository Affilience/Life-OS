/**
 * MonthHexGrid Component
 * Shows months as hexagons with organic honeycomb layout
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MonthHexCell } from './MonthHexCell';
import { gridPositions } from './HexMath';
import { JournalEntryMeta } from './journal.types';
import { startOfMonth, format } from 'date-fns';

interface MonthHexGridProps {
  entries: JournalEntryMeta[];
  onOpenMonth: (year: number, month: number) => void;
  cellW?: number;
  gap?: number;
}

export function MonthHexGrid({
  entries,
  onOpenMonth,
  cellW = 120,
  gap = 16,
}: MonthHexGridProps) {
  const cellH = cellW * 0.866; // Hex height ratio

  // Generate all 12 months of the current year
  const monthData = useMemo(() => {
    const currentYear = new Date().getFullYear();

    // Count entries by month
    const monthMap = new Map<string, number>();
    entries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      const monthKey = format(startOfMonth(entryDate), 'yyyy-MM');
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });

    // Generate all 12 months for current year
    const months: { year: number; month: number; count: number }[] = [];
    for (let month = 1; month <= 12; month++) {
      const monthKey = `${currentYear}-${String(month).padStart(2, '0')}`;
      months.push({
        year: currentYear,
        month,
        count: monthMap.get(monthKey) || 0,
      });
    }

    return months;
  }, [entries]);

  // Calculate grid dimensions - fewer columns for months
  const cols = Math.min(Math.ceil(Math.sqrt(monthData.length * 1.5)), 6);
  const rows = Math.ceil(monthData.length / cols);

  const positions = useMemo(
    () => gridPositions(cols, rows, cellW, cellH, gap),
    [cols, rows, cellW, cellH, gap]
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
        aria-label="Journal months hexagon grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'visible' }}
      >
        {monthData.map((monthInfo, index) => {
          const position = positions[index];
          if (!position) return null;

          return (
            <MonthHexCell
              key={`${monthInfo.year}-${monthInfo.month}`}
              year={monthInfo.year}
              month={monthInfo.month}
              entryCount={monthInfo.count}
              onOpen={onOpenMonth}
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
