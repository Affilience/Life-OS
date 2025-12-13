/**
 * SatisfyingButton
 *
 * An enhanced button with:
 * - Smooth press animations
 * - Haptic feedback
 * - Optional sound effects
 * - Ripple effect
 * - Loading state
 * - Success state with celebration
 *
 * Perfect for important actions, submissions, and CTAs.
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { feedback, haptics, sounds, celebrations } from '../../services/microInteractions';

const SatisfyingButton = ({
  children,
  onClick,
  variant = 'primary', // 'primary', 'secondary', 'ghost', 'danger', 'success', 'gradient'
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  playSound = true,
  hapticStyle = 'light', // 'light', 'medium', 'heavy', 'none'
  showRipple = true,
  celebrateOnClick = false, // Burst confetti on click
  successState = null, // null, 'pending', 'success', 'error'
  className = '',
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();
  const buttonRef = useRef(null);
  const [ripples, setRipples] = useState([]);

  // Size configurations
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
    md: 'px-4 py-2.5 text-base rounded-lg gap-2',
    lg: 'px-6 py-3 text-lg rounded-lg gap-2.5',
  };

  // Variant styles
  const variants = {
    primary: `
      bg-primary-500 text-white
      hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25
      active:bg-primary-700
    `,
    secondary: `
      bg-bg-1 text-text-primary border border-border
      hover:bg-bg-2 hover:border-primary-500/30
      active:bg-bg-3
    `,
    ghost: `
      bg-transparent text-text-secondary
      hover:bg-bg-2 hover:text-text-primary
      active:bg-bg-3
    `,
    danger: `
      bg-error text-white
      hover:bg-error/90 hover:shadow-lg hover:shadow-error/25
      active:bg-error/80
    `,
    success: `
      bg-success text-white
      hover:bg-success/90 hover:shadow-lg hover:shadow-success/25
      active:bg-success/80
    `,
    gradient: `
      bg-gradient-to-r from-primary-500 to-secondary text-white
      hover:from-primary-600 hover:to-secondary hover:shadow-lg hover:shadow-primary-500/25
    `,
  };

  // Create ripple effect
  const createRipple = useCallback((event) => {
    if (!showRipple || prefersReducedMotion) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev, ripple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 600);
  }, [showRipple, prefersReducedMotion]);

  // Handle click
  const handleClick = useCallback(async (event) => {
    if (disabled || loading) return;

    // Create ripple
    createRipple(event);

    // Haptic feedback
    if (hapticStyle !== 'none') {
      const hapticMap = {
        light: () => haptics.impact('light'),
        medium: () => haptics.impact('medium'),
        heavy: () => haptics.impact('heavy'),
      };
      await hapticMap[hapticStyle]?.();
    }

    // Sound effect
    if (playSound) {
      sounds.click();
    }

    // Celebration
    if (celebrateOnClick) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        celebrations.sparkle(
          rect.left + rect.width / 2,
          rect.top
        );
      }
    }

    // Call original onClick
    onClick?.(event);
  }, [disabled, loading, createRipple, hapticStyle, playSound, celebrateOnClick, onClick]);

  // Animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02, y: -1 },
    tap: { scale: 0.98, y: 1 },
  };

  const iconVariants = {
    initial: { rotate: 0 },
    hover: { rotate: [0, -10, 10, 0] },
  };

  // Loading spinner animation
  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  // Success checkmark animation
  const successVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 25,
      },
    },
  };

  const isDisabled = disabled || loading || successState === 'pending';

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      className={`
        relative inline-flex items-center justify-center
        font-medium transition-colors duration-200 overflow-hidden
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-0
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
        ${fullWidth ? 'w-full' : ''}
        ${sizes[size]}
        ${variants[variant]}
        ${className}
      `}
      variants={prefersReducedMotion ? {} : buttonVariants}
      initial="initial"
      whileHover={isDisabled ? undefined : 'hover'}
      whileTap={isDisabled ? undefined : 'tap'}
      {...props}
    >
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Content wrapper for proper z-index */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {/* Loading state */}
        <AnimatePresence mode="wait">
          {(loading || successState === 'pending') && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <motion.span
                variants={loadingVariants}
                animate="animate"
                className="inline-block"
              >
                <Loader2 className="w-4 h-4" />
              </motion.span>
            </motion.span>
          )}

          {/* Success state */}
          {successState === 'success' && (
            <motion.span
              variants={successVariants}
              initial="hidden"
              animate="visible"
              className="text-white"
            >
              <Check className="w-4 h-4" />
            </motion.span>
          )}

          {/* Normal content */}
          {!loading && successState !== 'pending' && successState !== 'success' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              {leftIcon && (
                <motion.span
                  variants={!prefersReducedMotion ? iconVariants : {}}
                  className="flex-shrink-0"
                >
                  {leftIcon}
                </motion.span>
              )}
              {children}
              {rightIcon && (
                <span className="flex-shrink-0">{rightIcon}</span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* Shine effect for gradient variant */}
      {variant === 'gradient' && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{
            x: '100%',
            transition: { duration: 0.6, ease: 'easeInOut' },
          }}
        />
      )}
    </motion.button>
  );
};

export default SatisfyingButton;
