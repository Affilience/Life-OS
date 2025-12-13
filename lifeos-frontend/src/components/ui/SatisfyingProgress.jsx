/**
 * SatisfyingProgress
 *
 * A delightful progress bar with:
 * - Smooth animated fill
 * - Milestone celebrations
 * - Optional glow effect
 * - Completion celebration
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { feedback, celebrations } from '../../services/microInteractions';

const SatisfyingProgress = ({
  value = 0, // 0-100
  max = 100,
  size = 'md',
  variant = 'primary', // 'primary', 'success', 'cosmic', 'gradient'
  showValue = false,
  showMilestones = false,
  milestones = [25, 50, 75, 100],
  celebrateCompletion = true,
  celebrateMilestones = false,
  animated = true,
  glow = true,
  className = '',
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();
  const progressRef = useRef(null);
  const previousValue = useRef(value);
  const [celebratedMilestones, setCelebratedMilestones] = useState(new Set());

  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Size configurations
  const sizes = {
    sm: {
      track: 'h-1.5',
      text: 'text-xs',
    },
    md: {
      track: 'h-2.5',
      text: 'text-sm',
    },
    lg: {
      track: 'h-4',
      text: 'text-base',
    },
  };

  // Variant styles
  const variants = {
    primary: {
      fill: 'bg-primary-500',
      glow: 'shadow-[0_0_12px_rgba(var(--color-primary-500),0.5)]',
    },
    success: {
      fill: 'bg-success',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    },
    cosmic: {
      fill: 'bg-gradient-to-r from-primary-400 to-secondary',
      glow: 'shadow-[0_0_12px_rgba(var(--color-primary-500),0.5)]',
    },
    gradient: {
      fill: 'bg-gradient-to-r from-emerald-400 via-primary-500 to-secondary',
      glow: 'shadow-[0_0_12px_rgba(var(--color-primary-500),0.5)]',
    },
  };

  const sizeConfig = sizes[size];
  const variantConfig = variants[variant];

  // Check for milestone celebrations
  useEffect(() => {
    if (prefersReducedMotion) return;

    const prev = previousValue.current;
    const current = percentage;

    // Check if we crossed a milestone
    if (celebrateMilestones) {
      milestones.forEach((milestone) => {
        if (prev < milestone && current >= milestone && !celebratedMilestones.has(milestone)) {
          // Celebrate this milestone
          setCelebratedMilestones((prev) => new Set([...prev, milestone]));

          if (milestone === 100 && celebrateCompletion) {
            // Full celebration for completion
            feedback.questComplete();
          } else {
            // Smaller celebration for other milestones
            feedback.xpGain(milestone);
          }
        }
      });
    } else if (celebrateCompletion && prev < 100 && current >= 100) {
      // Only celebrate completion
      feedback.questComplete();
    }

    previousValue.current = current;
  }, [percentage, celebrateMilestones, celebrateCompletion, milestones, celebratedMilestones, prefersReducedMotion]);

  // Reset celebrations when value goes back to 0
  useEffect(() => {
    if (percentage < 25) {
      setCelebratedMilestones(new Set());
    }
  }, [percentage]);

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Track */}
      <div
        ref={progressRef}
        className={`
          relative w-full rounded-full bg-bg-2 overflow-hidden
          ${sizeConfig.track}
        `}
      >
        {/* Milestone markers */}
        {showMilestones && (
          <div className="absolute inset-0 flex items-center">
            {milestones.filter((m) => m < 100).map((milestone) => (
              <div
                key={milestone}
                className="absolute w-px h-full bg-bg-0/50"
                style={{ left: `${milestone}%` }}
              />
            ))}
          </div>
        )}

        {/* Fill */}
        <motion.div
          className={`
            h-full rounded-full relative
            ${variantConfig.fill}
            ${glow && percentage > 0 && !prefersReducedMotion ? variantConfig.glow : ''}
          `}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={
            prefersReducedMotion
              ? { duration: 0.1 }
              : {
                  type: 'spring',
                  stiffness: 100,
                  damping: 20,
                  mass: 1,
                }
          }
        >
          {/* Shimmer effect */}
          {!prefersReducedMotion && percentage > 0 && percentage < 100 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}

          {/* Completion sparkle */}
          <AnimatePresence>
            {percentage >= 100 && !prefersReducedMotion && (
              <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0.8] }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-2 h-2 bg-white rounded-full blur-sm" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Value display */}
      {showValue && (
        <div className={`mt-1 ${sizeConfig.text} text-text-muted text-right`}>
          <motion.span
            key={percentage}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        </div>
      )}
    </div>
  );
};

export default SatisfyingProgress;
