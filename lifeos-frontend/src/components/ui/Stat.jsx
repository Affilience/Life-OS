import React from 'react';

/**
 * Cosmic Stat Component
 *
 * Displays a key metric with label, value, and optional delta.
 */

const Stat = ({
  label,
  value,
  delta = null,
  deltaType = null, // 'positive' | 'negative' | 'neutral'
  icon = null,
  className = '',
  ...props
}) => {
  const deltaColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-zinc-400',
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`} {...props}>
      <div className="flex items-center gap-2 text-zinc-400 text-sm">
        {icon && (
          <span className="text-zinc-500">
            {typeof icon === 'function' || (icon && icon.$$typeof)
              ? React.createElement(icon, { size: 16 })
              : icon}
          </span>
        )}
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-white text-2xl font-bold tracking-tighter">
          {value}
        </span>
        {delta && (
          <span className={`text-sm font-medium ${deltaColors[deltaType] || deltaColors.neutral}`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
};

export default Stat;
