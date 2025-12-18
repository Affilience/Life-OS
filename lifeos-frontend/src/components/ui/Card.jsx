import React, { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * Cosmic Card Component
 *
 * Premium surface component for grouping content.
 * Supports hover effects, padding variants, module-specific glows, and subtle cosmic styling.
 * Enhanced with smooth framer-motion animations.
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
  animate = true, // Enable/disable animations
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

  const MotionComponent = animate ? motion.div : 'div';

  const animationProps = animate && hover ? {
    whileHover: {
      scale: 1.02,
      y: -4,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }
    },
    whileTap: {
      scale: 0.98,
      y: 0,
    },
  } : {};

  return (
    <MotionComponent
      className={`${baseStyles} ${hoverClass} ${glowStyles} ${paddingVariants[padding]} ${className}`}
      onClick={onClick}
      tabIndex={hover ? 0 : undefined}
      role={hover ? 'button' : undefined}
      onKeyDown={hover && onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...animationProps}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

// Memoize Card for better performance in lists
const MemoizedCard = memo(Card);

// Card.Header subcomponent
MemoizedCard.Header = memo(({ children, className = '', ...props }) => {
  return (
    <div
      className={`pb-4 mb-4 border-b border-border-subtle ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default MemoizedCard;
