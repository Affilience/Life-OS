/**
 * HexCell Component
 * Renders a single hexagon cell for the journal grid
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { hexPoints, getMoodColor } from './HexMath';
import { DayISO, JournalMood } from './journal.types';

interface HexCellProps {
  dateISO: DayISO;
  hasEntry: boolean;
  mood?: JournalMood;
  selected?: boolean;
  isInStreak?: boolean;
  onOpen: (dateISO: DayISO) => void;
  width: number;
  height: number;
  x: number;
  y: number;
}

export function HexCell({
  dateISO,
  hasEntry,
  mood,
  selected,
  isInStreak = false,
  onOpen,
  width,
  height,
  x,
  y,
}: HexCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const date = new Date(dateISO);
  const dateLabel = format(date, 'd'); // Just the day number
  const fullDateLabel = format(date, 'EEE, d MMM yyyy');

  // Add subtle size variation for organic appearance
  const getSizeVariation = (dateStr: string) => {
    const seed = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variation = Math.sin(seed * 0.1) * 0.08; // -8% to +8% variation
    return 1 + variation;
  };

  const sizeScale = getSizeVariation(dateISO);
  const adjustedWidth = width * sizeScale;
  const adjustedHeight = height * sizeScale;

  const points = hexPoints(adjustedWidth, adjustedHeight);

  // Minimal clean design - transparent fill with purple glow
  const baseFill = 'transparent';

  // Charcoal outline
  const strokeColor = '#3f3f46'; // zinc-700

  // Purple glow for all hexagons (stronger for entries)
  const glowOpacity = hasEntry ? 0.25 : 0.15;

  // Mood tint (inner ring effect via stroke)
  const moodColor = getMoodColor(mood);

  // Glow on hover/focus/selected
  const showGlow = isHovered || isFocused || selected;

  const handleClick = () => {
    onOpen(dateISO);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(dateISO);
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
      aria-label={`${fullDateLabel} — ${hasEntry ? 'journal entry exists' : 'no entry'}`}
      className="cursor-pointer outline-none"
      style={{
        transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Purple background glow for all hexagons - subtle tight aura behind everything */}
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

      {/* Mood inner ring - disabled for now */}
      {false && hasEntry && mood && moodColor !== 'transparent' && (
        <polygon
          points={points}
          fill="none"
          stroke={moodColor}
          strokeWidth="3"
          style={{
            transform: 'scale(0.7)',
            transformOrigin: 'center',
          }}
        />
      )}

      {/* Streak indicator - flame icon */}
      {isInStreak && (
        <g transform={`translate(${adjustedWidth / 2}, ${adjustedHeight / 2 - 20})`}>
          {/* Orange glow behind flame */}
          <circle
            r="10"
            fill="none"
            stroke="rgba(249, 115, 22, 0.6)"
            strokeWidth="4"
            style={{
              filter: 'blur(4px)',
              opacity: isHovered ? 1 : 0.7,
            }}
          />
          {/* Flame emoji using text */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="18"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(249, 115, 22, 0.8))',
            }}
          >
            🔥
          </text>
        </g>
      )}

      {/* Date text */}
      <text
        x={adjustedWidth / 2}
        y={adjustedHeight / 2 + (isInStreak ? 8 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#c4b5fd"
        fontSize="20"
        fontWeight="500"
        fontFamily="sans-serif"
      >
        {String(dateLabel)}
      </text>
    </g>
  );
}
