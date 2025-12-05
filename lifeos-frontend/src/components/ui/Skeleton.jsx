/**
 * Skeleton Loading System
 *
 * A comprehensive skeleton loading system with:
 * - Base skeleton with shimmer animation
 * - Pre-built skeleton variants (cards, lists, tables, text)
 * - Customizable dimensions and shapes
 * - Dark mode optimized pulse animation
 */

import React from 'react';

/**
 * Base Skeleton - Animated loading placeholder
 */
export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
  animate = true,
  style = {},
}) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={`
        bg-white/5 overflow-hidden relative
        ${roundedClasses[rounded]}
        ${animate ? 'skeleton-shimmer' : ''}
        ${className}
      `}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonText - Multi-line text skeleton
 */
export function SkeletonText({
  lines = 3,
  spacing = 'md',
  className = '',
  lastLineWidth = '60%',
}) {
  const spacingClasses = {
    sm: 'space-y-1.5',
    md: 'space-y-2',
    lg: 'space-y-3',
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          rounded="sm"
          style={{
            width: i === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCircle - Circular avatar/icon skeleton
 */
export function SkeletonCircle({ size = 40, className = '' }) {
  return (
    <Skeleton
      width={size}
      height={size}
      rounded="full"
      className={className}
    />
  );
}

/**
 * SkeletonCard - Card-style loading skeleton
 */
export function SkeletonCard({
  hasImage = false,
  imageHeight = 120,
  lines = 2,
  className = '',
}) {
  return (
    <div
      className={`
        bg-[var(--bg-2)] border border-white/5 rounded-xl overflow-hidden
        ${className}
      `}
    >
      {hasImage && (
        <Skeleton height={imageHeight} rounded="none" className="w-full" />
      )}
      <div className="p-4 space-y-3">
        <Skeleton height="1.25rem" width="70%" rounded="sm" />
        <SkeletonText lines={lines} />
      </div>
    </div>
  );
}

/**
 * SkeletonStatCard - Stat card skeleton for dashboards
 */
export function SkeletonStatCard({ className = '' }) {
  return (
    <div
      className={`
        bg-[var(--bg-2)] border border-white/5 rounded-xl p-4 space-y-3
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <Skeleton height="0.875rem" width="40%" rounded="sm" />
        <SkeletonCircle size={20} />
      </div>
      <Skeleton height="2rem" width="60%" rounded="sm" />
      <div className="flex items-center gap-2">
        <Skeleton height="0.75rem" width="3rem" rounded="sm" />
        <Skeleton height="0.75rem" width="5rem" rounded="sm" />
      </div>
    </div>
  );
}

/**
 * SkeletonListItem - List item skeleton
 */
export function SkeletonListItem({
  hasAvatar = true,
  avatarSize = 40,
  lines = 2,
  className = '',
}) {
  return (
    <div className={`flex items-start gap-3 p-3 ${className}`}>
      {hasAvatar && <SkeletonCircle size={avatarSize} />}
      <div className="flex-1 space-y-2">
        <Skeleton height="1rem" width="50%" rounded="sm" />
        {lines > 1 && <SkeletonText lines={lines - 1} />}
      </div>
    </div>
  );
}

/**
 * SkeletonList - Full list skeleton
 */
export function SkeletonList({
  count = 5,
  hasAvatar = true,
  className = '',
  dividers = true,
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <SkeletonListItem hasAvatar={hasAvatar} />
          {dividers && i < count - 1 && (
            <div className="border-b border-white/5 mx-3" />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonTableRow - Table row skeleton
 */
export function SkeletonTableRow({ columns = 4, className = '' }) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton
            height="1rem"
            width={i === 0 ? '70%' : '50%'}
            rounded="sm"
          />
        </td>
      ))}
    </tr>
  );
}

/**
 * SkeletonTable - Full table skeleton
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  hasHeader = true,
  className = '',
}) {
  return (
    <div
      className={`
        bg-[var(--bg-2)] border border-white/5 rounded-xl overflow-hidden
        ${className}
      `}
    >
      <table className="w-full">
        {hasHeader && (
          <thead className="bg-white/5">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton height="0.875rem" width="60%" rounded="sm" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-white/5">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * SkeletonAvatar - Avatar with name skeleton
 */
export function SkeletonAvatar({
  size = 40,
  showName = true,
  className = '',
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SkeletonCircle size={size} />
      {showName && (
        <div className="space-y-1.5">
          <Skeleton height="1rem" width="8rem" rounded="sm" />
          <Skeleton height="0.75rem" width="5rem" rounded="sm" />
        </div>
      )}
    </div>
  );
}

/**
 * SkeletonButton - Button placeholder skeleton
 */
export function SkeletonButton({
  size = 'md',
  width = 'auto',
  className = '',
}) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const widthClasses = {
    auto: 'w-24',
    full: 'w-full',
  };

  return (
    <Skeleton
      className={`${sizeClasses[size]} ${typeof width === 'string' && widthClasses[width] ? widthClasses[width] : ''} ${className}`}
      style={typeof width === 'number' ? { width } : undefined}
      rounded="lg"
    />
  );
}

/**
 * SkeletonChart - Chart placeholder skeleton
 */
export function SkeletonChart({ height = 200, className = '' }) {
  return (
    <div
      className={`
        bg-[var(--bg-2)] border border-white/5 rounded-xl p-4
        ${className}
      `}
    >
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {[65, 45, 80, 55, 90, 70, 60].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            height={`${h}%`}
            rounded="sm"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * SkeletonDashboard - Full dashboard skeleton layout
 */
export function SkeletonDashboard({ className = '' }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonChart height={250} />
        <SkeletonChart height={250} />
      </div>

      {/* List section */}
      <div className="bg-[var(--bg-2)] border border-white/5 rounded-xl">
        <div className="p-4 border-b border-white/5">
          <Skeleton height="1.25rem" width="10rem" rounded="sm" />
        </div>
        <SkeletonList count={5} />
      </div>
    </div>
  );
}

// CSS for shimmer animation (add to design-tokens.css or include inline)
export const skeletonStyles = `
@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}
`;

// Export all components as default
export default {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonListItem,
  SkeletonList,
  SkeletonTableRow,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonChart,
  SkeletonDashboard,
};
