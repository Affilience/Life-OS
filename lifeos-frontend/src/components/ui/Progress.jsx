import React from 'react';

/**
 * ONYXOS Progress Bar Component
 *
 * Linear progress indicator with smooth animations.
 */

const Progress = ({
  value = 0,
  max = 100,
  showLabel = false,
  color = 'accent',
  height = 'md',
  className = '',
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heightVariants = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorVariants = {
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm text-text-med">
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-muted rounded-pill overflow-hidden ${heightVariants[height]}`}>
        <div
          className={`${colorVariants[color]} ${heightVariants[height]} rounded-pill transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Progress;
