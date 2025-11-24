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
    primary: `
      bg-purple-500 text-white
      hover:bg-purple-600 hover:shadow-[0_0_40px_rgba(138,92,255,0.25)] hover:-translate-y-[1px]
      active:translate-y-[1px] active:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
    `,
    secondary: `
      bg-zinc-900 text-white border border-zinc-800
      hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
      active:translate-y-[1px]
    `,
    ghost: `
      bg-transparent text-zinc-400
      hover:bg-zinc-800/50 hover:text-zinc-200
      active:bg-zinc-800
    `,
    danger: `
      bg-red-500 text-white
      hover:bg-red-600 hover:shadow-[0_0_40px_rgba(239,68,68,0.25)] hover:-translate-y-[1px]
      active:translate-y-[1px]
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
