/**
 * SatisfyingCheckbox
 *
 * A delightful checkbox with:
 * - Smooth animations (Framer Motion + anime.js)
 * - Haptic feedback
 * - Sound effects
 * - Position-aware particle burst celebration
 * - Green glow pulse effect
 * - Overshoot spring animation
 * - Reduced motion support
 *
 * Perfect for task completion, habit tracking, and any toggle interaction.
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { feedback } from '../../services/microInteractions';
import { useParticleBurst, PARTICLE_PALETTES } from '../../hooks/useParticleBurst';

const SatisfyingCheckbox = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default', // 'default', 'success', 'primary', 'cosmic'
  label = null,
  celebrate = true, // Show particle burst on check (default true for maximum satisfaction)
  playSound = true,
  className = '',
  labelClassName = '',
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();
  const checkboxRef = useRef(null);
  const containerRef = useRef(null);
  const [showGlow, setShowGlow] = useState(false);

  // Particle burst hook for position-aware celebrations
  const burst = useParticleBurst(containerRef);

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

  // Handle toggle with enhanced feedback
  const handleToggle = useCallback((event) => {
    if (disabled) return;

    const newValue = !checked;

    // Trigger micro-interactions
    if (newValue) {
      // Checking - EXTREMELY satisfying completion feedback

      // 1. Show glow pulse
      if (!prefersReducedMotion) {
        setShowGlow(true);
        setTimeout(() => setShowGlow(false), 600);
      }

      // 2. Trigger sound + haptic
      if (playSound) {
        feedback.taskComplete({
          celebrate: false, // We handle celebration ourselves with particle burst
          subtle: prefersReducedMotion,
        });
      }

      // 3. Position-aware particle burst (from click point)
      if (celebrate && !prefersReducedMotion && checkboxRef.current) {
        const rect = checkboxRef.current.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };

        // Get click position relative to container, fallback to checkbox center
        const clickX = event?.clientX ?? (rect.left + rect.width / 2);
        const clickY = event?.clientY ?? (rect.top + rect.height / 2);

        // Convert to container-relative coordinates
        const x = clickX - containerRect.left;
        const y = clickY - containerRect.top;

        // Burst with success colors (green/teal themed)
        burst(x, y, {
          count: 10,
          colors: PARTICLE_PALETTES.success,
          spread: 80,
          duration: 500,
          size: 5,
        });
      }
    } else {
      // Unchecking - subtle feedback
      if (playSound) {
        feedback.taskUncomplete();
      }
    }

    onChange?.(newValue);
  }, [checked, disabled, onChange, celebrate, playSound, prefersReducedMotion, burst]);

  // Animation variants with overshoot spring effect
  const boxVariants = {
    unchecked: {
      scale: 1,
    },
    checked: {
      // Overshoot spring: 1 → 1.3 → 1.0 (Duolingo-style "pop")
      scale: [1, 1.3, 0.95, 1.05, 1],
      transition: {
        duration: 0.4,
        times: [0, 0.3, 0.5, 0.7, 1],
        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for satisfying overshoot
      },
    },
    tap: {
      scale: 0.85,
      transition: { duration: 0.1 },
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
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1], // Snappy ease-out
          delay: 0.05, // Slight delay for checkbox to "land" first
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
        duration: 0.12,
      },
    },
  };

  // Use simpler animation for reduced motion
  const simpleVariants = {
    unchecked: { opacity: 1 },
    checked: { opacity: 1 },
    tap: { opacity: 0.8 },
  };

  // Glow color based on variant
  const glowColor = variant === 'cosmic' ? 'rgba(139, 92, 246, 0.5)' : 'rgba(34, 197, 94, 0.5)';

  return (
    <div ref={containerRef} className="relative inline-block">
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
          style={{
            // Glow pulse effect
            boxShadow: showGlow
              ? `0 0 0 3px ${glowColor}, 0 0 20px ${glowColor}, 0 0 40px ${glowColor.replace('0.5', '0.3')}`
              : undefined,
            transition: 'box-shadow 0.3s ease-out',
          }}
        >
          <AnimatePresence mode="wait">
            {checked && (
              <motion.div
                className={`${variantConfig.checkColor}`}
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 45 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 15,
                }}
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
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Secondary subtle ring pulse */}
          <AnimatePresence>
            {!prefersReducedMotion && showGlow && (
              <motion.div
                className="absolute inset-0 rounded-md"
                style={{
                  border: `2px solid ${variant === 'cosmic' ? '#a78bfa' : '#4ade80'}`,
                }}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
        </motion.button>

        {label && (
          <motion.span
            className={`
              ${sizeConfig.label}
              ${checked ? 'text-text-muted' : 'text-text-primary'}
              transition-colors duration-200
              ${labelClassName}
            `}
            animate={{
              textDecoration: checked ? 'line-through' : 'none',
              opacity: checked ? 0.7 : 1,
            }}
            transition={{ duration: 0.2, delay: checked ? 0.1 : 0 }}
          >
            {label}
          </motion.span>
        )}
      </label>
    </div>
  );
};

export default SatisfyingCheckbox;
