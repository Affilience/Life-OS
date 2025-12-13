/**
 * SatisfyingToggle
 *
 * A delightful toggle switch with:
 * - Smooth spring animations
 * - Haptic feedback
 * - Sound effects
 * - Glow effect when enabled
 */

import React, { useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { feedback } from '../../services/microInteractions';

const SatisfyingToggle = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'primary', // 'primary', 'success', 'cosmic'
  label = null,
  playSound = true,
  className = '',
  labelClassName = '',
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Size configurations
  const sizes = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
      label: 'text-sm',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
      label: 'text-base',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
      label: 'text-lg',
    },
  };

  // Variant styles
  const variants = {
    primary: {
      off: 'bg-bg-3',
      on: 'bg-primary-500',
      glow: 'shadow-lg shadow-primary-500/40',
    },
    success: {
      off: 'bg-bg-3',
      on: 'bg-success',
      glow: 'shadow-lg shadow-success/40',
    },
    cosmic: {
      off: 'bg-bg-3',
      on: 'bg-gradient-to-r from-primary-400 to-secondary',
      glow: 'shadow-lg shadow-primary-500/40',
    },
  };

  const sizeConfig = sizes[size];
  const variantConfig = variants[variant];

  // Handle toggle
  const handleToggle = useCallback(() => {
    if (disabled) return;

    const newValue = !checked;

    // Trigger feedback
    if (playSound) {
      if (newValue) {
        feedback.toggleOn();
      } else {
        feedback.toggleOff();
      }
    }

    onChange?.(newValue);
  }, [checked, disabled, onChange, playSound]);

  // Spring animation for thumb
  const thumbSpring = {
    type: 'spring',
    stiffness: 700,
    damping: 30,
  };

  return (
    <label
      className={`
        inline-flex items-center gap-3 cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          relative inline-flex items-center rounded-full p-0.5
          transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-0
          ${sizeConfig.track}
          ${checked ? variantConfig.on : variantConfig.off}
          ${checked && !prefersReducedMotion ? variantConfig.glow : ''}
        `}
        whileTap={disabled ? undefined : { scale: 0.95 }}
      >
        {/* Background glow animation */}
        {checked && !prefersReducedMotion && (
          <motion.div
            className={`absolute inset-0 rounded-full ${variantConfig.on} blur-sm`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
          />
        )}

        {/* Thumb */}
        <motion.span
          className={`
            ${sizeConfig.thumb}
            bg-white rounded-full shadow-md
            relative z-10
          `}
          initial={false}
          animate={{
            x: checked ? parseInt(sizeConfig.translate.replace('translate-x-', '')) * 4 : 0,
          }}
          transition={prefersReducedMotion ? { duration: 0.1 } : thumbSpring}
        >
          {/* Inner highlight */}
          <span className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white to-gray-100" />
        </motion.span>
      </motion.button>

      {label && (
        <span
          className={`
            ${sizeConfig.label}
            text-text-primary
            transition-colors duration-200
            ${labelClassName}
          `}
        >
          {label}
        </span>
      )}
    </label>
  );
};

export default SatisfyingToggle;
