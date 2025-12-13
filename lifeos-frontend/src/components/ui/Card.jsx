import React from 'react';

/**
 * Cosmic Card Component
 *
 * Premium surface component for grouping content.
 * Supports hover effects, padding variants, module-specific glows, and subtle cosmic styling.
 *
 * Hover variants:
 * - false: No hover effect
 * - true/'default': Standard lift with shadow
 * - 'glow': Lift with purple glow
 * - 'subtle': Background color change only
 * - 'scale': Scale up slightly
 *
 * Module prop adds module-specific hover glow colors
 */

const Card = ({
  children,
  padding = 'md',
  hover = false,
  glow = false,
  module = null,
  className = '',
  onClick,
  ...props
}) => {
  // Module-specific hover classes
  const moduleHoverClasses = {
    health: 'hover-glow-health',
    productivity: 'hover-glow-productivity',
    knowledge: 'hover-glow-knowledge',
    financial: 'hover-glow-financial',
    calendar: 'hover-glow-calendar',
    skills: 'hover-glow-skills',
    journal: 'hover-glow-journal',
  };

  // Hover variant classes
  const hoverVariants = {
    default: 'hover-lift-glow cursor-pointer',
    glow: 'hover-lift-glow cursor-pointer',
    subtle: 'hover-subtle cursor-pointer',
    scale: 'hover-scale cursor-pointer',
  };

  const baseStyles = `
    bg-bg-1/40
    backdrop-blur-sm
    border border-border
    rounded-lg
  `;

  // Determine hover class
  let hoverClass = '';
  if (hover) {
    if (module && moduleHoverClasses[module]) {
      // Use module-specific hover glow
      hoverClass = `${moduleHoverClasses[module]} cursor-pointer`;
    } else if (typeof hover === 'string' && hoverVariants[hover]) {
      // Use named variant
      hoverClass = hoverVariants[hover];
    } else {
      // Default hover
      hoverClass = hoverVariants.default;
    }
  }

  const glowStyles = glow ? 'shadow-glowSoft' : '';

  const paddingVariants = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`${baseStyles} ${hoverClass} ${glowStyles} ${paddingVariants[padding]} ${className}`}
      onClick={onClick}
      tabIndex={hover ? 0 : undefined}
      role={hover ? 'button' : undefined}
      onKeyDown={hover && onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

// Card.Header subcomponent
Card.Header = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`pb-4 mb-4 border-b border-border-subtle ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
