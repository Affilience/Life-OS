import React from 'react';

/**
 * Ascnd SeasonPill Component
 *
 * Displays the current season with dynamic accent colors.
 * Seasons rotate every 6-8 weeks and shift background gradients.
 */

const SeasonPill = ({
  seasonNumber = 1,
  seasonName = 'Discipline',
  variant = 'default',
  className = '',
  ...props
}) => {
  // Rotate accent colors based on season
  const seasonColors = {
    0: 'bg-accent/10 text-accent border-accent/20', // Violet
    1: 'bg-accent-2/10 text-accent-2 border-accent-2/20', // Blue
    2: 'bg-accent-3/10 text-accent-3 border-accent-3/20', // Magenta
    3: 'bg-accent-4/10 text-accent-4 border-accent-4/20', // Cyan
  };

  const colorIndex = seasonNumber % 4;
  const colors = seasonColors[colorIndex];

  if (variant === 'compact') {
    return (
      <span
        className={`
          inline-flex items-center gap-1.5 px-3 py-1
          rounded-pill border font-medium text-sm
          ${colors} ${className}
        `}
        {...props}
      >
        <span className="font-mono text-xs opacity-75">S{seasonNumber}</span>
        <span>{seasonName}</span>
      </span>
    );
  }

  return (
    <div
      className={`
        inline-flex flex-col items-center gap-1 px-4 py-2
        rounded-lg border ${colors} ${className}
      `}
      {...props}
    >
      <span className="font-mono text-xs opacity-75">Season {seasonNumber}</span>
      <span className="font-bold text-lg tracking-tighter">{seasonName}</span>
    </div>
  );
};

export default SeasonPill;
