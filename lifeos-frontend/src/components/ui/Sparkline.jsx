import React, { useMemo } from 'react';

/**
 * Sparkline - Lightweight mini chart component
 *
 * A simple SVG-based sparkline for showing trends at a glance.
 * Supports line and area variants with customizable colors.
 */

const Sparkline = ({
  data = [],
  width = 60,
  height = 20,
  color = '#8b5cf6',
  variant = 'area', // 'line' or 'area'
  strokeWidth = 1.5,
  className = '',
  showDot = true,
}) => {
  const points = useMemo(() => {
    if (!data.length) return { path: '', areaPath: '', lastPoint: null };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Calculate points with padding
    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const coords = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y };
    });

    // Create SVG path
    const path = coords
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    // Create area path (for filled variant)
    const areaPath = `${path} L ${coords[coords.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

    const lastPoint = coords[coords.length - 1];

    return { path, areaPath, lastPoint };
  }, [data, width, height]);

  if (!data.length) {
    return (
      <svg width={width} height={height} className={className}>
        <line
          x1={2}
          y1={height / 2}
          x2={width - 2}
          y2={height / 2}
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeWidth={1}
          strokeDasharray="2,2"
        />
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ overflow: 'visible' }}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.05} />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {variant === 'area' && (
        <path
          d={points.areaPath}
          fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
        />
      )}

      {/* Line */}
      <path
        d={points.path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      {showDot && points.lastPoint && (
        <circle
          cx={points.lastPoint.x}
          cy={points.lastPoint.y}
          r={2.5}
          fill={color}
        />
      )}
    </svg>
  );
};

export default Sparkline;
