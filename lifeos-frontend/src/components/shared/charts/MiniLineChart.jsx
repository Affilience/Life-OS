import React from 'react';

/**
 * Lightweight line/area chart component for dashboards
 * No heavy dependencies - pure SVG
 */
export default function MiniLineChart({ data, color = 'purple', filled = true, showDots = true, height = 80 }) {
  if (!data || data.length === 0) return null;

  const padding = 10;
  const width = 300;
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  const colorMap = {
    purple: { main: '#a855f7', light: '#c084fc', gradient: '#9333ea' },
    pink: { main: '#ec4899', light: '#f472b6', gradient: '#db2777' },
    green: { main: '#10b981', light: '#34d399', gradient: '#059669' },
    cyan: { main: '#06b6d4', light: '#22d3ee', gradient: '#0891b2' },
    blue: { main: '#3b82f6', light: '#60a5fa', gradient: '#2563eb' },
    emerald: { main: '#059669', light: '#10b981', gradient: '#047857' },
    orange: { main: '#f97316', light: '#fb923c', gradient: '#ea580c' }
  };

  const colors = colorMap[color] || colorMap.purple;

  // Calculate points
  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((item.value - minValue) / valueRange) * (height - padding * 2);
    return { x, y, value: item.value, label: item.label };
  });

  // Create path for line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  // Create path for filled area
  const areaPath = filled
    ? `${linePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`
    : '';

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Filled area with gradient */}
        {filled && (
          <path
            d={areaPath}
            fill={`url(#gradient-${color})`}
            opacity="0.4"
          />
        )}

        {/* Glow effect under line */}
        <path
          d={linePath}
          fill="none"
          stroke={colors.main}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.3"
          filter="blur(4px)"
        />

        {/* Main line - thicker and brighter */}
        <path
          d={linePath}
          fill="none"
          stroke={colors.light}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots with glow */}
        {showDots && points.map((point, index) => (
          <g key={index}>
            {/* Glow circle */}
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill={colors.main}
              opacity="0.3"
            />
            {/* Main dot */}
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={colors.light}
              stroke={colors.main}
              strokeWidth="2"
              className="cursor-pointer"
            />
            {/* Tooltip */}
            <title>{`${point.label}: ${point.value}`}</title>
          </g>
        ))}

        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.light} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colors.gradient} stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-2">
        {data.map((item, index) => (
          index % Math.ceil(data.length / 5) === 0 && (
            <span key={index} className="text-xs font-medium text-white/60">
              {item.label}
            </span>
          )
        ))}
      </div>
    </div>
  );
}
