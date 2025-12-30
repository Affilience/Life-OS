/**
 * AbilityIcon - Renders ability icons using PNG images with emoji fallback
 *
 * Uses the iconPath from elementalAbilities.js to display pixel art icons
 * Falls back to emoji icon if image fails to load or doesn't exist
 */

import React, { useState } from 'react';

export default function AbilityIcon({
  ability,
  size = 'md',
  className = '',
  showFallback = true
}) {
  const [imageError, setImageError] = useState(false);

  // Size mappings
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
    '3xl': 'w-20 h-20',
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
    '3xl': 'text-5xl',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const textSize = textSizes[size] || textSizes.md;

  // If no ability or iconPath, show fallback
  if (!ability) return null;

  // Show image if iconPath exists and no error
  if (ability.iconPath && !imageError) {
    return (
      <img
        src={ability.iconPath}
        alt={ability.name}
        className={`${sizeClass} object-contain pixelated ${className}`}
        style={{ imageRendering: 'pixelated' }}
        onError={() => setImageError(true)}
        draggable={false}
      />
    );
  }

  // Fallback to emoji icon
  if (showFallback && ability.icon) {
    return (
      <span className={`${textSize} ${className}`}>
        {ability.icon}
      </span>
    );
  }

  return null;
}

// Inline version for use in buttons/compact spaces
export function AbilityIconInline({ ability, className = '' }) {
  const [imageError, setImageError] = useState(false);

  if (!ability) return null;

  if (ability.iconPath && !imageError) {
    return (
      <img
        src={ability.iconPath}
        alt={ability.name}
        className={`w-5 h-5 object-contain inline-block align-middle ${className}`}
        style={{ imageRendering: 'pixelated' }}
        onError={() => setImageError(true)}
        draggable={false}
      />
    );
  }

  return <span className={className}>{ability.icon}</span>;
}
