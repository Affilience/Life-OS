import React from 'react';

/**
 * Ascnd LevelBadge Component
 *
 * Displays user level with premium styling.
 * Can show as large hero element or compact inline badge.
 */

const LevelBadge = ({
  level = 1,
  size = 'md',
  showLabel = true,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: {
      container: 'w-10 h-10',
      text: 'text-lg',
      label: 'text-xs',
    },
    md: {
      container: 'w-16 h-16',
      text: 'text-2xl',
      label: 'text-sm',
    },
    lg: {
      container: 'w-24 h-24',
      text: 'text-4xl',
      label: 'text-base',
    },
    xl: {
      container: 'w-32 h-32',
      text: 'text-5xl',
      label: 'text-lg',
    },
  };

  const sizeStyles = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`} {...props}>
      {/* Level Circle */}
      <div
        className={`
          ${sizeStyles.container}
          rounded-full
          bg-gradient-to-br from-accent to-accent-2
          border-2 border-accent/30
          shadow-glow
          flex items-center justify-center
          relative
          overflow-hidden
        `}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

        {/* Level Number */}
        <span className={`
          ${sizeStyles.text}
          font-bold text-white
          tracking-tighter
          relative z-10
        `}>
          {level}
        </span>
      </div>

      {/* Label */}
      {showLabel && (
        <span className={`
          ${sizeStyles.label}
          text-text-med font-medium
        `}>
          Level
        </span>
      )}
    </div>
  );
};

export default LevelBadge;
