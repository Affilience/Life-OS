import React, { useState, useRef, useEffect } from 'react';

/**
 * Lightweight line/area chart component for dashboards
 * No heavy dependencies - pure SVG with percentage-based positioning
 *
 * @param {boolean} baselineZero - If true, y-axis starts at 0. If false (default), uses data min for better visualization.
 */
export default function MiniLineChart({ data, color = 'purple', filled = true, showDots = true, height = 80, baselineZero = false }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const updateWidth = () => setContainerWidth(containerRef.current.offsetWidth);
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, []);

  if (!data || data.length === 0) return null;

  const paddingX = 12; // Pixels padding on left/right
  const paddingTop = 15; // Pixels from top for tooltip space
  const paddingBottom = 10; // Pixels from bottom
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = containerWidth - paddingX * 2;

  const dataMax = Math.max(...data.map(d => d.value));
  const dataMin = Math.min(...data.map(d => d.value));

  // Use actual data range for better visualization, with 10% padding
  const rangePadding = (dataMax - dataMin) * 0.1 || dataMax * 0.1;
  const minValue = baselineZero ? 0 : Math.max(0, dataMin - rangePadding);
  const maxValue = dataMax + rangePadding;
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

  // Calculate points in pixels
  const points = data.map((item, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
    return { x, y, value: item.value, label: item.label };
  });

  // Create SVG path for line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  // Create SVG path for filled area
  const areaPath = filled
    ? `${linePath} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`
    : '';

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Chart area */}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        {containerWidth > 0 && (
          <svg
            width={containerWidth}
            height={height}
            className="absolute inset-0"
            style={{ overflow: 'visible' }}
          >
            {/* Filled area with gradient */}
            {filled && (
              <path
                d={areaPath}
                fill={`url(#gradient-${color})`}
                opacity="0.4"
              />
            )}

            {/* Main line */}
            <path
              d={linePath}
              fill="none"
              stroke={colors.light}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.light} stopOpacity="0.6" />
                <stop offset="100%" stopColor={colors.gradient} stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Dots positioned absolutely */}
        {showDots && containerWidth > 0 && points.map((point, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${point.x}px`,
              top: `${point.y}px`,
            }}
            onMouseEnter={() => setHoveredPoint(index)}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Glow */}
            <div
              className="absolute rounded-full"
              style={{
                width: hoveredPoint === index ? '16px' : '12px',
                height: hoveredPoint === index ? '16px' : '12px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: colors.main,
                opacity: hoveredPoint === index ? 0.5 : 0.3,
              }}
            />
            {/* Dot */}
            <div
              className="relative rounded-full"
              style={{
                width: hoveredPoint === index ? '10px' : '8px',
                height: hoveredPoint === index ? '10px' : '8px',
                backgroundColor: colors.light,
                border: `2px solid ${colors.main}`,
              }}
            />

            {/* Tooltip */}
            {hoveredPoint === index && (
              <div
                className="absolute left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-semibold text-white whitespace-nowrap z-10"
                style={{
                  bottom: '20px',
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  border: `1px solid ${colors.main}`,
                }}
              >
                {point.value.toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* X-axis labels - positioned to match dots exactly */}
      <div className="relative w-full h-5 mt-1">
        {containerWidth > 0 && data.map((item, index) => (
          <span
            key={index}
            className={`absolute text-xs font-medium transition-colors transform -translate-x-1/2 ${
              hoveredPoint === index ? 'text-white' : 'text-white/50'
            }`}
            style={{ left: `${points[index].x}px` }}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
