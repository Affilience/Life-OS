import React from 'react';

/**
 * Lightweight bar chart component for dashboards
 * No heavy dependencies - pure CSS
 */
export default function MiniBarChart({ data, color = 'purple', maxHeight = 80, showValues = false }) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));

  const colorMap = {
    purple: { from: '#a855f7', to: '#c084fc' },
    pink: { from: '#ec4899', to: '#f472b6' },
    green: { from: '#10b981', to: '#34d399' },
    cyan: { from: '#06b6d4', to: '#22d3ee' },
    blue: { from: '#3b82f6', to: '#60a5fa' },
    emerald: { from: '#059669', to: '#10b981' },
    yellow: { from: '#eab308', to: '#fbbf24' }
  };

  const colors = colorMap[color] || colorMap.purple;

  return (
    <div className="relative h-full w-full">
      {/* Background grid lines for better visibility */}
      <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="w-full h-px bg-white/5" />
        ))}
      </div>

      <div className="flex items-end justify-between gap-2 h-full px-2 relative">
        {data.map((item, index) => {
          const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              {/* Bar with background track */}
              <div className="w-full relative flex-1 flex items-end justify-center">
                {/* Background track */}
                <div className="absolute bottom-0 w-full h-full bg-white/5 rounded-lg" />

                {/* Actual bar */}
                <div
                  className="w-full rounded-lg transition-all duration-300 hover:opacity-90 relative group"
                  style={{
                    height: `${Math.max(heightPercent, 5)}%`,
                    maxHeight: `${maxHeight}px`,
                    background: `linear-gradient(to top, ${colors.from}, ${colors.to})`,
                    boxShadow: `0 0 30px ${colors.from}80, 0 0 60px ${colors.from}40`
                  }}
                >
                  {/* Value on hover */}
                  {showValues && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {item.value}
                    </div>
                  )}
                </div>
              </div>

              {/* Label */}
              <div className="text-xs font-bold text-gray-300 text-center truncate w-full pt-1">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
