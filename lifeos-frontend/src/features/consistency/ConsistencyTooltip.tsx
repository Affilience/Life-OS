/**
 * Consistency Tooltip Component
 * Shows detailed breakdown on hover
 */

import React from 'react';
import { format } from 'date-fns';
import { ConsistencyDay } from './consistency.types';

interface ConsistencyTooltipProps {
  day: ConsistencyDay;
  x: number;
  y: number;
  visible: boolean;
}

export function ConsistencyTooltip({
  day,
  x,
  y,
  visible,
}: ConsistencyTooltipProps) {
  if (!visible) return null;

  const date = new Date(day.date);
  const dateLabel = format(date, 'EEE, d MMM yyyy');

  // Position tooltip to avoid edges
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: x + 16,
    top: y + 16,
    zIndex: 100,
    pointerEvents: 'none',
  };

  return (
    <div
      style={tooltipStyle}
      className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-3 min-w-[220px]"
    >
      {/* Date */}
      <div className="text-sm font-semibold text-white mb-2">{dateLabel}</div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
          <span>Consistency Score</span>
          <span className="font-mono text-white">{day.score}</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all"
            style={{ width: `${day.score}%` }}
          />
        </div>
      </div>

      {/* Metrics breakdown */}
      {day.score > 0 ? (
        <div className="space-y-1.5 text-xs">
          <MetricRow
            icon="📔"
            label="Journal entries"
            value={day.journalCount}
          />
          <MetricRow
            icon="✓"
            label="Quests completed"
            value={day.questsCompleted}
          />
          <MetricRow
            icon="⏱"
            label="Deep work"
            value={`${day.deepWorkMin} min`}
          />
          <MetricRow icon="🚶" label="Steps" value={day.steps.toLocaleString()} />
        </div>
      ) : (
        <div className="text-xs text-zinc-500 italic">No activity recorded</div>
      )}
    </div>
  );
}

function MetricRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400 flex items-center gap-1.5">
        <span className="w-4 text-center">{icon}</span>
        {label}
      </span>
      <span className="font-mono text-zinc-200">{value}</span>
    </div>
  );
}
