import React, { useEffect, useState } from 'react';

/**
 * ONYXOS XPBar Component
 *
 * Global or domain-specific XP progress bar with neon afterglow animation.
 * Signature interaction: fills with gentle neon glow (1.2s) when XP is added.
 */

const XPBar = ({
  currentXP = 0,
  maxXP = 100,
  level = 1,
  showLevel = true,
  showNumbers = true,
  animated = true,
  color = 'accent',
  className = '',
  ...props
}) => {
  const [displayXP, setDisplayXP] = useState(0);
  const percentage = Math.min(Math.max((currentXP / maxXP) * 100, 0), 100);

  // Animate XP fill on mount or change
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setDisplayXP(percentage), 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayXP(percentage);
    }
  }, [percentage, animated]);

  const colorVariants = {
    accent: 'bg-gradient-to-r from-accent to-accent-2',
    health: 'bg-gradient-to-r from-success to-[#3EDC81]',
    knowledge: 'bg-gradient-to-r from-accent-3 to-accent',
    financial: 'bg-gradient-to-r from-warning to-[#F2C94C]',
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} {...props}>
      {/* Level & XP Numbers */}
      {(showLevel || showNumbers) && (
        <div className="flex items-center justify-between text-sm">
          {showLevel && (
            <div className="flex items-center gap-2">
              <span className="text-text-high font-bold">Level {level}</span>
            </div>
          )}
          {showNumbers && (
            <span className="text-text-med font-mono text-xs">
              {currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-muted rounded-pill overflow-hidden">
        <div
          className={`
            absolute inset-y-0 left-0 rounded-pill
            ${colorVariants[color]}
            transition-all duration-[1200ms] ease-out
            ${animated && displayXP > 0 ? 'shadow-[0_0_20px_var(--accent)]' : ''}
          `}
          style={{ width: `${displayXP}%` }}
        />
      </div>
    </div>
  );
};

export default XPBar;
