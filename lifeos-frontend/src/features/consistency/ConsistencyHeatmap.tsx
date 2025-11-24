/**
 * Consistency Heatmap Component
 * GitHub-style activity heatmap showing daily consistency scores
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { format, getDay, startOfMonth } from 'date-fns';
import { getConsistency, calculateStreaks } from './consistency.adapter';
import { getColorForScore } from './consistency.colors';
import { ConsistencyTooltip } from './ConsistencyTooltip';
import { ConsistencyLegend } from './ConsistencyLegend';
import {
  RangeWeeks,
  ConsistencySeries,
  ConsistencyDay,
  SeasonTint,
  DayISO,
} from './consistency.types';

interface ConsistencyHeatmapProps {
  rangeWeeks?: RangeWeeks;
  cellSize?: number;
  cellGap?: number;
  startOnSunday?: boolean;
  onOpenDay?: (dateISO: DayISO) => void;
  seasonTint?: SeasonTint;
  className?: string;
}

export function ConsistencyHeatmap({
  rangeWeeks = 52,
  cellSize = 12,
  cellGap = 3,
  startOnSunday = true,
  onOpenDay,
  seasonTint,
  className = '',
}: ConsistencyHeatmapProps) {
  const [data, setData] = useState<ConsistencySeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<RangeWeeks>(rangeWeeks);
  const [hoveredDay, setHoveredDay] = useState<ConsistencyDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load data when range changes
  useEffect(() => {
    loadData();
  }, [selectedRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getConsistency(selectedRange);
      setData(result);
    } catch (error) {
      console.error('Failed to load consistency data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate streaks
  const streaks = useMemo(() => {
    if (!data) return { current: 0, best: 0 };
    return calculateStreaks(data.days);
  }, [data]);

  // Grid dimensions
  const numWeeks = selectedRange;
  const numDays = 7;
  const svgWidth = numWeeks * (cellSize + cellGap);
  const svgHeight = numDays * (cellSize + cellGap) + 20; // +20 for month labels

  // Handle mouse events
  const handleMouseEnter = (day: ConsistencyDay, event: React.MouseEvent) => {
    setHoveredDay(day);
    setTooltipPos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoveredDay) {
      setTooltipPos({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  // Handle click/keyboard activation
  const handleActivate = (day: ConsistencyDay) => {
    if (onOpenDay && day.score > 0) {
      onOpenDay(day.date);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!data) return;

    let newIndex = index;
    const totalDays = data.days.length;

    switch (event.key) {
      case 'ArrowRight':
        newIndex = Math.min(index + numDays, totalDays - 1);
        event.preventDefault();
        break;
      case 'ArrowLeft':
        newIndex = Math.max(index - numDays, 0);
        event.preventDefault();
        break;
      case 'ArrowDown':
        newIndex = index + 1;
        if (Math.floor(newIndex / numDays) !== Math.floor(index / numDays)) {
          newIndex = index; // Stay in same column
        }
        event.preventDefault();
        break;
      case 'ArrowUp':
        newIndex = index - 1;
        if (Math.floor(newIndex / numDays) !== Math.floor(index / numDays)) {
          newIndex = index; // Stay in same column
        }
        event.preventDefault();
        break;
      case 'Home':
        newIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        newIndex = totalDays - 1;
        event.preventDefault();
        break;
      case 'PageUp':
        newIndex = Math.max(index - numDays * 4, 0);
        event.preventDefault();
        break;
      case 'PageDown':
        newIndex = Math.min(index + numDays * 4, totalDays - 1);
        event.preventDefault();
        break;
      case 'Enter':
      case ' ':
        handleActivate(data.days[index]);
        event.preventDefault();
        break;
      default:
        return;
    }

    setFocusedIndex(newIndex);
    // Focus the element
    const cellId = `cell-${newIndex}`;
    const cellElement = document.getElementById(cellId);
    if (cellElement) {
      cellElement.focus();
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  // Organize days into weekly columns
  const weekColumns: ConsistencyDay[][] = [];
  for (let week = 0; week < numWeeks; week++) {
    const weekDays: ConsistencyDay[] = [];
    for (let day = 0; day < numDays; day++) {
      const index = week * numDays + day;
      if (index < data.days.length) {
        weekDays.push(data.days[index]);
      }
    }
    weekColumns.push(weekDays);
  }

  // Find month boundaries for labels
  const monthLabels: { week: number; label: string }[] = [];
  let lastMonth = -1;
  weekColumns.forEach((week, weekIndex) => {
    if (week.length > 0) {
      const firstDay = new Date(week[0].date);
      const monthNum = firstDay.getMonth();
      if (monthNum !== lastMonth && weekIndex > 0) {
        monthLabels.push({
          week: weekIndex,
          label: format(firstDay, 'MMM'),
        });
        lastMonth = monthNum;
      }
    }
  });

  return (
    <div className={`${className}`} ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {/* Range selector */}
        <div className="flex items-center gap-2">
          {([13, 26, 52] as RangeWeeks[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`
                px-3 py-1 rounded-md text-xs font-medium transition-all
                ${
                  selectedRange === range
                    ? 'bg-violet-500 text-white'
                    : 'bg-[#1a1724] text-white/60 hover:bg-[#221e2e]'
                }
              `}
            >
              {range}w
            </button>
          ))}
        </div>

        {/* Streak info */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-white/60">Current streak:</span>
            <span className="font-semibold text-white bg-[#1a1724] px-2 py-1 rounded">
              {streaks.current}d
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60">Best:</span>
            <span className="font-semibold text-amber-400">
              {streaks.best}d
            </span>
          </div>
        </div>
      </div>

      {/* SVG Heatmap Grid */}
      <div
        className="overflow-x-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          className="mx-auto"
          role="img"
          aria-label="Consistency heatmap"
        >
          {/* Month labels */}
          {monthLabels.map((label) => (
            <text
              key={label.week}
              x={label.week * (cellSize + cellGap)}
              y={10}
              className="text-xs fill-zinc-500"
              fontSize="10"
            >
              {label.label}
            </text>
          ))}

          {/* Day cells */}
          <g transform={`translate(0, 20)`}>
            {weekColumns.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const index = weekIndex * numDays + dayIndex;
                const x = weekIndex * (cellSize + cellGap);
                const y = dayIndex * (cellSize + cellGap);
                const color = getColorForScore(day.score);
                const isFocused = focusedIndex === index;
                const isToday =
                  day.date === format(new Date(), 'yyyy-MM-dd');

                // Create accessible label
                const dateObj = new Date(day.date);
                const dayLabel = format(dateObj, 'EEE d MMM');
                const ariaLabel =
                  day.score > 0
                    ? `${dayLabel} — score ${day.score} — ${day.journalCount} journal, ${day.questsCompleted} quests, ${day.deepWorkMin} min deep work, ${day.steps} steps`
                    : `${dayLabel} — no activity`;

                return (
                  <g key={index}>
                    <rect
                      id={`cell-${index}`}
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      rx={2}
                      fill={color}
                      className="cursor-pointer transition-all"
                      style={{
                        filter: isFocused
                          ? 'drop-shadow(0 0 4px rgba(122, 92, 255, 0.8))'
                          : undefined,
                        stroke: isToday ? '#7A5CFF' : 'none',
                        strokeWidth: isToday ? 1.5 : 0,
                      }}
                      onMouseEnter={(e) =>
                        handleMouseEnter(day, e as any)
                      }
                      onClick={() => handleActivate(day)}
                      onKeyDown={(e) => handleKeyDown(e as any, index)}
                      tabIndex={0}
                      role="button"
                      aria-label={ariaLabel}
                      onFocus={() => setFocusedIndex(index)}
                    />
                  </g>
                );
              })
            )}
          </g>

          {/* Day labels (Sun, Mon, etc.) */}
          <g transform={`translate(-30, 20)`}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, i) => (
              <text
                key={i}
                x={0}
                y={i * (cellSize + cellGap) + cellSize / 2 + 4}
                className="text-xs fill-zinc-500"
                fontSize="10"
                textAnchor="end"
              >
                {label}
              </text>
            ))}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between">
        <ConsistencyLegend />
        <div className="text-xs text-white/50">
          Click any cell to view that day
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <ConsistencyTooltip
          day={hoveredDay}
          x={tooltipPos.x}
          y={tooltipPos.y}
          visible={true}
        />
      )}
    </div>
  );
}
