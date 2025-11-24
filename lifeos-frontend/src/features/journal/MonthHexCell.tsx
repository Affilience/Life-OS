/**
 * MonthHexCell Component
 * Renders a single hexagon cell for a month
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { hexPoints } from './HexMath';

interface MonthHexCellProps {
  year: number;
  month: number; // 1-12
  entryCount: number;
  selected?: boolean;
  onOpen: (year: number, month: number) => void;
  width: number;
  height: number;
  x: number;
  y: number;
}

export function MonthHexCell({
  year,
  month,
  entryCount,
  selected,
  onOpen,
  width,
  height,
  x,
  y,
}: MonthHexCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const date = new Date(year, month - 1, 1);
  const monthLabel = format(date, 'MMM'); // "Jan", "Feb", etc.
  const fullLabel = format(date, 'MMMM yyyy');

  // Add subtle size variation for organic appearance
  const getSizeVariation = (y: number, m: number) => {
    const seed = y * 100 + m;
    const variation = Math.sin(seed * 0.1) * 0.08;
    return 1 + variation;
  };

  const sizeScale = getSizeVariation(year, month);
  const adjustedWidth = width * sizeScale;
  const adjustedHeight = height * sizeScale;

  const points = hexPoints(adjustedWidth, adjustedHeight);

  const baseFill = 'transparent';
  const strokeColor = '#3f3f46'; // zinc-700

  // Stronger glow for months with entries
  const glowOpacity = entryCount > 0 ? 0.25 : 0.15;

  const showGlow = isHovered || isFocused || selected;

  const handleClick = () => {
    onOpen(year, month);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(year, month);
    }
  };

  return (
    <g
      transform={`translate(${x}, ${y}) scale(${isHovered ? 1.08 : 1})`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`${fullLabel} — ${entryCount} journal ${entryCount === 1 ? 'entry' : 'entries'}`}
      className="cursor-pointer outline-none"
      style={{
        transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Purple background glow - subtle tight aura */}
      <polygon
        points={points}
        fill="none"
        stroke="rgba(139, 92, 246, 0.4)"
        strokeWidth="6"
        style={{
          filter: 'blur(8px)',
          opacity: glowOpacity,
        }}
      />

      {/* Hover/Focus glow effect */}
      {showGlow && (
        <polygon
          points={points}
          fill="none"
          stroke="rgba(139, 92, 246, 0.9)"
          strokeWidth={selected ? 3 : 2}
          style={{
            filter: 'drop-shadow(0 0 16px rgba(139, 92, 246, 0.8))',
          }}
        />
      )}

      {/* Main hex - charcoal outline */}
      <polygon
        points={points}
        fill={baseFill}
        stroke={strokeColor}
        strokeWidth="2"
      />

      {/* Month label */}
      <text
        x={adjustedWidth / 2}
        y={adjustedHeight / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#c4b5fd"
        fontSize="22"
        fontWeight="600"
        fontFamily="sans-serif"
      >
        {monthLabel}
      </text>
    </g>
  );
}
