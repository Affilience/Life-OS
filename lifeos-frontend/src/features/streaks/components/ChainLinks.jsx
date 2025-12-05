import React from 'react';
import { motion } from 'framer-motion';

/**
 * ChainLinks - Visual chain link representation of a streak
 * Each link represents a day in the streak
 * Based on the "Don't Break the Chain" / Seinfeld method
 */
export function ChainLinks({
  currentStreak = 0,
  maxDisplay = 30,
  brokenAt = null, // Index where chain was broken (null if active)
  size = 'md', // 'sm', 'md', 'lg'
  color = 'orange',
  showCount = true,
  className = ''
}) {
  const displayCount = Math.min(currentStreak, maxDisplay);
  const hasMore = currentStreak > maxDisplay;

  const sizes = {
    sm: { width: 16, height: 24, stroke: 3 },
    md: { width: 24, height: 36, stroke: 4 },
    lg: { width: 32, height: 48, stroke: 5 }
  };

  const colors = {
    orange: {
      active: 'stroke-orange-400',
      glow: 'drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]',
      fill: 'fill-orange-400/20'
    },
    green: {
      active: 'stroke-green-400',
      glow: 'drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]',
      fill: 'fill-green-400/20'
    },
    purple: {
      active: 'stroke-purple-400',
      glow: 'drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]',
      fill: 'fill-purple-400/20'
    },
    blue: {
      active: 'stroke-blue-400',
      glow: 'drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]',
      fill: 'fill-blue-400/20'
    },
    gold: {
      active: 'stroke-yellow-400',
      glow: 'drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]',
      fill: 'fill-yellow-400/20'
    }
  };

  const s = sizes[size];
  const c = colors[color] || colors.orange;

  // SVG chain link path
  const getLinkPath = (w, h) => {
    const rx = w / 2;
    const ry = h / 4;
    return `
      M ${rx} ${ry}
      A ${rx} ${ry} 0 0 1 ${rx} ${h - ry}
      A ${rx} ${ry} 0 0 1 ${rx} ${ry}
    `;
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Chain Container */}
      <div className="flex items-center overflow-x-auto pb-2">
        {hasMore && (
          <div className="flex items-center mr-2">
            <span className="text-sm text-white/50">+{currentStreak - maxDisplay}</span>
            <span className="mx-2 text-white/30">...</span>
          </div>
        )}

        <div className="flex items-center" style={{ marginLeft: `-${s.width * 0.3}px` }}>
          {Array.from({ length: displayCount }).map((_, index) => {
            const actualIndex = hasMore ? index + (currentStreak - maxDisplay) : index;
            const isBroken = brokenAt !== null && actualIndex >= brokenAt;
            const isLastLink = index === displayCount - 1 && !hasMore;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  delay: index * 0.03,
                  duration: 0.3,
                  type: 'spring',
                  stiffness: 300
                }}
                className="relative"
                style={{
                  marginLeft: index > 0 ? `-${s.width * 0.3}px` : 0,
                  zIndex: displayCount - index
                }}
              >
                <svg
                  width={s.width}
                  height={s.height}
                  viewBox={`0 0 ${s.width} ${s.height}`}
                  className={`
                    ${isBroken ? 'stroke-gray-600 opacity-30' : c.active}
                    ${!isBroken && isLastLink ? c.glow : ''}
                    transition-all duration-300
                  `}
                  style={{ strokeWidth: s.stroke, fill: 'none' }}
                >
                  {/* Outer ring */}
                  <ellipse
                    cx={s.width / 2}
                    cy={s.height / 2}
                    rx={s.width / 2 - s.stroke / 2}
                    ry={s.height / 2 - s.stroke / 2}
                    className={!isBroken ? c.fill : 'fill-gray-800/20'}
                  />
                </svg>

                {/* Milestone markers */}
                {(actualIndex + 1) % 7 === 0 && !isBroken && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-300 shadow-lg shadow-yellow-400/50"
                    title={`${actualIndex + 1} days - Week milestone!`}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Active indicator */}
        {brokenAt === null && currentStreak > 0 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="ml-2 w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
          />
        )}
      </div>

      {/* Count Display */}
      {showCount && (
        <div className="mt-2 text-center">
          <span className="text-2xl font-bold text-white">{currentStreak}</span>
          <span className="text-white/50 ml-1">links</span>
        </div>
      )}
    </div>
  );
}

/**
 * ChainLinksCompact - Horizontal chain with breaks visualization
 * Great for showing weekly view with gaps
 */
export function ChainLinksWeekly({
  weekData = [], // Array of 7 booleans for each day
  labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  color = 'orange',
  className = ''
}) {
  const colors = {
    orange: 'bg-gradient-to-br from-orange-500 to-amber-500',
    green: 'bg-gradient-to-br from-green-500 to-emerald-500',
    purple: 'bg-gradient-to-br from-purple-500 to-pink-500',
    blue: 'bg-gradient-to-br from-blue-500 to-cyan-500'
  };

  const activeColor = colors[color] || colors.orange;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {weekData.map((completed, index) => (
        <div key={index} className="flex items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`
              relative w-10 h-10 rounded-lg flex items-center justify-center
              ${completed
                ? `${activeColor} shadow-lg`
                : 'bg-[#1a1724] border border-white/10'
              }
            `}
          >
            {completed ? (
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 + 0.1 }}
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            ) : (
              <span className="text-white/30 text-xs">{labels[index]}</span>
            )}

            {/* Chain connector */}
            {index < weekData.length - 1 && (
              <div
                className={`
                  absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-1 z-10
                  ${completed && weekData[index + 1]
                    ? activeColor
                    : 'bg-white/10'
                  }
                `}
              />
            )}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

export default ChainLinks;
