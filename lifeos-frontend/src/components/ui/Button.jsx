import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { haptics } from '../../utils/haptics';

/**
 * Cosmic Button Component
 *
 * Premium button with multiple variants and states.
 * Follows Cosmic minimal design system.
 * Includes haptic feedback and smooth animations.
 */

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  className = '',
  haptic = 'light', // 'light', 'medium', 'heavy', 'none'
  ...props
}) => {
  const handleClick = async (e) => {
    if (disabled) return;

    // Trigger haptic feedback based on variant/haptic prop
    if (haptic !== 'none') {
      const hapticMap = {
        light: haptics.light,
        medium: haptics.medium,
        heavy: haptics.heavy,
      };

      // Danger buttons get medium haptic by default
      if (variant === 'danger' && haptic === 'light') {
        await haptics.medium();
      } else {
        await hapticMap[haptic]?.();
      }
    }

    // Call original onClick
    onClick?.(e);
  };
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50
    disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    // Primary: Main call-to-action (theme primary color)
    primary: `
      bg-primary-500 text-text-primary
      hover:bg-primary-600 hover:shadow-glow
      active:shadow-soft
    `,
    // Gradient: Premium primary action with gradient
    gradient: `
      bg-gradient-to-r from-primary-500 to-secondary text-text-primary
      hover:from-primary-600 hover:to-secondary hover:shadow-glow
      active:shadow-soft
    `,
    // Secondary: Alternative action with dark background
    secondary: `
      bg-bg-1 text-text-primary border border-border
      hover:bg-bg-2 hover:border-primary-500/20 hover:shadow-soft
      active:shadow-soft
    `,
    // Outline: Primary outline style for secondary emphasis
    outline: `
      bg-primary-500/10 text-primary-400 border border-primary-500/30
      hover:bg-primary-500/20 hover:border-primary-500/50 hover:shadow-glowSoft
      active:bg-primary-500/25
    `,
    // Ghost: Minimal tertiary action
    ghost: `
      bg-transparent text-text-secondary border border-transparent
      hover:bg-bg-2/80 hover:text-text-primary hover:border-border
      active:bg-bg-2
    `,
    // Danger: Destructive actions
    danger: `
      bg-error text-text-primary
      hover:bg-error/90 hover:shadow-glow
      active:shadow-soft
    `,
    // Danger Outline: Less prominent destructive action
    'danger-outline': `
      bg-error/10 text-error border border-error/30
      hover:bg-error/20 hover:border-error/50
      active:bg-error/25
    `,
    // Success: Positive/confirmation actions
    success: `
      bg-success text-text-primary
      hover:bg-success/90 hover:shadow-glow
      active:shadow-soft
    `,
    // Success Outline: Less prominent success action
    'success-outline': `
      bg-success/10 text-success border border-success/30
      hover:bg-success/20 hover:border-success/50
      active:bg-success/25
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2.5 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg',
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
      {...props}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </motion.button>
  );
};

export default memo(Button);
