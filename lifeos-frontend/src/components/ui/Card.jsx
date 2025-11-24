import React from 'react';

/**
 * Cosmic Card Component
 *
 * Premium surface component for grouping content.
 * Supports hover effects, padding variants, and subtle cosmic styling.
 */

const Card = ({
  children,
  padding = 'md',
  hover = false,
  glow = false,
  className = '',
  ...props
}) => {
  const baseStyles = `
    bg-[#12101a]/40
    backdrop-blur-sm
    border border-white/10/50
    transition-all duration-[250ms]
  `;

  const hoverStyles = hover ? `
    hover:border-purple-500/30
    hover:-translate-y-[2px]
    hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
    cursor-pointer
  ` : '';

  const glowStyles = glow ? 'shadow-[0_0_40px_rgba(138,92,255,0.25)]' : '';

  const paddingVariants = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const radiusStyles = 'rounded-lg';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${glowStyles} ${paddingVariants[padding]} ${radiusStyles} ${className}`}
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
      className={`pb-4 mb-4 border-b border-white/10/50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
