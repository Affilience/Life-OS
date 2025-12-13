/**
 * SatisfyingCheckbox
 *
 * A delightful checkbox with:
 * - Smooth animations (Framer Motion)
 * - Haptic feedback
 * - Optional sound effects
 * - Optional celebration sparkle
 * - Reduced motion support
 *
 * Perfect for task completion, habit tracking, and any toggle interaction.
 */

import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { feedback } from '../../services/microInteractions';

const SatisfyingCheckbox = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default', // 'default', 'success', 'primary', 'cosmic'
  label = null,
  celebrate = false, // Show sparkle on check
  playSound = true,
  className = '',
  labelClassName = '',
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();
  const checkboxRef = useRef(null);

  // Size configurations
  const sizes = {
    sm: {
      box: 'w-4 h-4',
      icon: 'w-2.5 h-2.5',
      label: 'text-sm',
    },
    md: {
      box: 'w-5 h-5',
      icon: 'w-3 h-3',
      label: 'text-base',
    },
    lg: {
      box: 'w-6 h-6',
      icon: 'w-4 h-4',
      label: 'text-lg',
    },
  };

  // Variant styles
  const variants = {
    default: {
      unchecked: 'border-border hover:border-text-muted',
      checked: 'bg-success border-success',
      checkColor: 'text-white',
    },
    success: {
      unchecked: 'border-success/30 hover:border-success/50',
      checked: 'bg-success border-success',
      checkColor: 'text-white',
    },
    primary: {
      unchecked: 'border-primary-500/30 hover:border-primary-500/50',
      checked: 'bg-primary-500 border-primary-500',
      checkColor: 'text-white',
    },
    cosmic: {
      unchecked: 'border-primary-500/30 hover:border-primary-400/50',
      checked: 'bg-gradient-to-br from-primary-400 to-secondary border-transparent',
      checkColor: 'text-white',
    },
  };

  const sizeConfig = sizes[size];
  const variantConfig = variants[variant];

  // Handle toggle
  const handleToggle = useCallback(() => {
    if (disabled) return;

    const newValue = !checked;

    // Trigger micro-interactions
    if (newValue) {
      // Checking - satisfying completion feedback
      if (playSound) {
        feedback.taskComplete({
          celebrate: celebrate,
          position: celebrate && checkboxRef.current
            ? {
                x: checkboxRef.current.getBoundingClientRect().left + 10,
                y: checkboxRef.current.getBoundingClientRect().top,
              }
            : null,
        });
      }
    } else {
      // Unchecking
      if (playSound) {
        feedback.taskUncomplete();
      }
    }

    onChange?.(newValue);
  }, [checked, disabled, onChange, celebrate, playSound]);

  // Animation variants
  const boxVariants = {
    unchecked: {
      scale: 1,
    },
    checked: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.3,
        times: [0, 0.5, 1],
        ease: 'easeOut',
      },
    },
    tap: {
      scale: 0.9,
    },
  };

  const checkVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: 0.3,
          ease: 'easeOut',
        },
        opacity: {
          duration: 0.1,
        },
      },
    },
    exit: {
      pathLength: 0,
      opacity: 0,
      transition: {
        duration: 0.15,
      },
    },
  };

  // Use simpler animation for reduced motion
  const simpleVariants = {
    unchecked: { opacity: 1 },
    checked: { opacity: 1 },
    tap: { opacity: 0.8 },
  };

  return (
    <label
      className={`
        inline-flex items-center gap-2.5 cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      <motion.button
        ref={checkboxRef}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          relative flex items-center justify-center
          rounded-md border-2 transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-0
          ${sizeConfig.box}
          ${checked ? variantConfig.checked : variantConfig.unchecked}
          ${disabled ? '' : 'hover:shadow-sm'}
        `}
        variants={prefersReducedMotion ? simpleVariants : boxVariants}
        initial="unchecked"
        animate={checked ? 'checked' : 'unchecked'}
        whileTap={disabled ? undefined : 'tap'}
      >
        <AnimatePresence mode="wait">
          {checked && (
            <motion.div
              className={`${variantConfig.checkColor}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.15 }}
            >
              {prefersReducedMotion ? (
                <Check className={sizeConfig.icon} strokeWidth={3} />
              ) : (
                <svg
                  className={sizeConfig.icon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M5 12l5 5L20 7"
                    variants={checkVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  />
                </svg>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple effect on check */}
        {!prefersReducedMotion && checked && (
          <motion.div
            className={`absolute inset-0 rounded-md ${variant === 'cosmic' ? 'bg-primary-400' : 'bg-success'}`}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        )}
      </motion.button>

      {label && (
        <span
          className={`
            ${sizeConfig.label}
            ${checked ? 'text-text-muted line-through' : 'text-text-primary'}
            transition-all duration-200
            ${labelClassName}
          `}
        >
          {label}
        </span>
      )}
    </label>
  );
};

export default SatisfyingCheckbox;
