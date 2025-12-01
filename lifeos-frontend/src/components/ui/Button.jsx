import React from 'react';
import { haptics } from '../../utils/haptics';

/**
 * Cosmic Button Component
 *
 * Premium button with multiple variants and states.
 * Follows Cosmic minimal design system.
 * Includes haptic feedback on tap.
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
    font-medium transition-all duration-[150ms]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50
    disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    // Primary: Main call-to-action (purple)
    primary: `
      bg-purple-500 text-white
      hover:bg-purple-600 hover:shadow-[0_8px_32px_rgba(139,92,246,0.3)] hover:-translate-y-[1px]
      active:translate-y-[1px] active:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
    `,
    // Gradient: Premium primary action with gradient
    gradient: `
      bg-gradient-to-r from-purple-500 to-pink-500 text-white
      hover:from-purple-600 hover:to-pink-600 hover:shadow-[0_8px_32px_rgba(139,92,246,0.4)] hover:-translate-y-[1px]
      active:translate-y-[1px] active:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
    `,
    // Secondary: Alternative action with dark background
    secondary: `
      bg-[#12101a] text-white border border-white/10
      hover:bg-[#1a1724] hover:border-purple-500/20 hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]
      active:translate-y-[1px] active:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
    `,
    // Outline: Purple outline style for secondary emphasis
    outline: `
      bg-purple-500/10 text-purple-400 border border-purple-500/30
      hover:bg-purple-500/20 hover:border-purple-500/50 hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(139,92,246,0.15)]
      active:translate-y-[1px] active:bg-purple-500/25
    `,
    // Ghost: Minimal tertiary action
    ghost: `
      bg-transparent text-white/60 border border-transparent
      hover:bg-[#1a1724]/80 hover:text-white hover:border-white/10 hover:-translate-y-[1px]
      active:bg-[#1a1724] active:translate-y-[1px]
    `,
    // Danger: Destructive actions (red)
    danger: `
      bg-red-500 text-white
      hover:bg-red-600 hover:shadow-[0_8px_32px_rgba(239,68,68,0.3)] hover:-translate-y-[1px]
      active:translate-y-[1px] active:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
    `,
    // Danger Outline: Less prominent destructive action
    'danger-outline': `
      bg-red-500/10 text-red-400 border border-red-500/30
      hover:bg-red-500/20 hover:border-red-500/50 hover:-translate-y-[1px]
      active:translate-y-[1px] active:bg-red-500/25
    `,
    // Success: Positive/confirmation actions (emerald)
    success: `
      bg-emerald-500 text-white
      hover:bg-emerald-600 hover:shadow-[0_8px_32px_rgba(16,185,129,0.3)] hover:-translate-y-[1px]
      active:translate-y-[1px] active:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
    `,
    // Success Outline: Less prominent success action
    'success-outline': `
      bg-emerald-500/10 text-emerald-400 border border-emerald-500/30
      hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:-translate-y-[1px]
      active:translate-y-[1px] active:bg-emerald-500/25
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2.5 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
