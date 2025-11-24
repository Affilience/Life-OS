/**
 * Consistency Legend Component
 * Shows color scale from low to high
 */

import React from 'react';
import { CONSISTENCY_SCALE } from './consistency.colors';

export function ConsistencyLegend() {
  // Skip the first entry (0 threshold) for the legend display
  const legendSteps = CONSISTENCY_SCALE.slice(1);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400">Less</span>
      <div className="flex items-center gap-1">
        {legendSteps.map((step, index) => (
          <div
            key={index}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: step.color }}
            title={`Score: ${step.threshold}+`}
          />
        ))}
      </div>
      <span className="text-xs text-zinc-400">More</span>
    </div>
  );
}
