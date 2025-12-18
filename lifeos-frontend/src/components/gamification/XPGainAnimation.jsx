import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Trophy, Sparkles, Zap } from 'lucide-react';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { feedback } from '../../services/microInteractions';

/**
 * Animated counter hook - counts from 0 to target
 */
const useCountUp = (target, duration = 300, enabled = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setCount(target);
      return;
    }

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, enabled]);

  return count;
};

/**
 * Get size tier based on XP amount
 */
const getSizeTier = (amount) => {
  if (amount <= 25) return 'small';
  if (amount <= 75) return 'medium';
  return 'large';
};

const SIZE_CONFIG = {
  small: {
    scale: 1,
    fontSize: 'text-xl',
    padding: 'px-4 py-2',
    particleCount: 6,
    glowIntensity: '0 0 20px',
  },
  medium: {
    scale: 1.1,
    fontSize: 'text-2xl',
    padding: 'px-5 py-3',
    particleCount: 10,
    glowIntensity: '0 0 30px',
  },
  large: {
    scale: 1.25,
    fontSize: 'text-3xl',
    padding: 'px-6 py-4',
    particleCount: 15,
    glowIntensity: '0 0 40px',
  },
};

/**
 * XP Gain Animation - Enhanced with counting, scaling, and absorption
 *
 * Features:
 * - Count-up animation from 0 to XP amount
 * - Size scales based on amount (small/medium/large)
 * - Floating path curves toward XP bar then fades
 * - Mode-aware: Full animation in cosmic, subtle in professional, hidden in minimal
 */
export default function XPGainAnimation({
  amount,
  multiplier = 1.0,
  onComplete,
  position = null, // Optional starting position { x, y }
  targetPosition = null, // Optional XP bar position for absorption effect
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState('appear'); // 'appear' | 'hold' | 'absorb'
  const prefersReducedMotion = useReducedMotion();

  // Get mode settings
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  const displayAmount = Math.floor(amount * multiplier);
  const hasMultiplier = multiplier > 1.0;
  const sizeTier = getSizeTier(displayAmount);
  const sizeConfig = SIZE_CONFIG[sizeTier];

  // Count-up animation
  const animatedCount = useCountUp(
    displayAmount,
    sizeTier === 'large' ? 500 : sizeTier === 'medium' ? 400 : 300,
    !prefersReducedMotion && mode !== 'minimal'
  );

  // Trigger feedback on mount
  useEffect(() => {
    feedback.xpGain(displayAmount);
  }, [displayAmount]);

  // Animation phases
  useEffect(() => {
    if (mode === 'minimal') {
      const timer = setTimeout(() => onComplete?.(), 100);
      return () => clearTimeout(timer);
    }

    const timers = [];

    // Hold phase after appear
    timers.push(setTimeout(() => setPhase('hold'), 400));

    // Absorb phase (if target position exists)
    if (targetPosition) {
      timers.push(setTimeout(() => setPhase('absorb'), 1200));
    }

    // Complete
    timers.push(setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, targetPosition ? 2000 : 1800));

    return () => timers.forEach(clearTimeout);
  }, [onComplete, targetPosition, mode]);

  // In minimal mode, skip animation entirely
  if (mode === 'minimal') {
    return null;
  }

  // Mode-specific styles
  const bgGradient = mode === 'cosmic'
    ? 'from-cyan-500 to-blue-600'
    : 'from-blue-500 to-cyan-600';

  const glowColor = mode === 'cosmic' ? 'rgba(34, 211, 238, 0.5)' : 'rgba(59, 130, 246, 0.5)';

  // Calculate animation path
  const getAnimationVariants = () => {
    const baseY = position?.y ?? window.innerHeight / 2;
    const baseX = position?.x ?? window.innerWidth / 2;

    if (phase === 'absorb' && targetPosition) {
      return {
        initial: { opacity: 0, y: 0, scale: 0.5 },
        animate: {
          opacity: [0, 1, 1, 0.8, 0],
          y: [0, -30, -40, targetPosition.y - baseY],
          x: [0, 0, 0, targetPosition.x - baseX],
          scale: [0.5, sizeConfig.scale * 1.1, sizeConfig.scale, 0.3],
        },
        transition: {
          duration: 2,
          times: [0, 0.2, 0.6, 0.9, 1],
          ease: [0.22, 1, 0.36, 1],
        },
      };
    }

    return {
      initial: { opacity: 0, y: 0, scale: 0.5 },
      animate: {
        opacity: [0, 1, 1, 0],
        y: [0, -40, -60, -100],
        scale: [0.5, sizeConfig.scale * 1.1, sizeConfig.scale, sizeConfig.scale * 0.8],
      },
      exit: { opacity: 0, y: -120, scale: 0.5 },
      transition: {
        duration: 1.8,
        times: [0, 0.2, 0.7, 1],
        ease: [0.22, 1, 0.36, 1],
      },
    };
  };

  const variants = getAnimationVariants();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={variants.transition}
          className="fixed z-50 pointer-events-none"
          style={{
            top: position?.y ?? '50%',
            left: position?.x ?? '50%',
            transform: position ? 'translate(-50%, -50%)' : undefined,
          }}
        >
          {/* Main XP badge */}
          <motion.div
            className={`bg-gradient-to-r ${bgGradient} rounded-full ${sizeConfig.padding} shadow-2xl border-2 border-white/30`}
            style={{
              boxShadow: `${sizeConfig.glowIntensity} ${glowColor}`,
            }}
            animate={
              !prefersReducedMotion && phase === 'hold'
                ? { scale: [1, 1.05, 1] }
                : {}
            }
            transition={{ duration: 0.3, repeat: phase === 'hold' ? 2 : 0 }}
          >
            <div className="flex items-center gap-2">
              {/* Trophy icon with bounce */}
              <motion.div
                initial={{ rotate: -20 }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Trophy className="w-5 h-5 text-yellow-300" />
              </motion.div>

              {/* Animated count */}
              <span className={`text-white font-bold ${sizeConfig.fontSize} tabular-nums`}>
                +{prefersReducedMotion ? displayAmount : animatedCount}
              </span>

              <span className="text-white/80 font-semibold text-sm">
                {terms.xp}
              </span>

              {/* Multiplier badge */}
              {hasMultiplier && (
                <motion.span
                  className="text-amber-300 font-bold text-sm bg-amber-500/20 px-2 py-0.5 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  {multiplier.toFixed(1)}x
                </motion.span>
              )}
            </div>
          </motion.div>

          {/* Particle burst - Only show in cosmic mode */}
          {visibility.showParticleEffects && !prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 -z-10 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(sizeConfig.particleCount)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${
                      i % 2 === 0 ? '#22d3ee' : '#a855f7'
                    }, transparent)`,
                    boxShadow: `0 0 6px ${i % 2 === 0 ? '#22d3ee' : '#a855f7'}`,
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  animate={{
                    x: Math.cos((i * Math.PI * 2) / sizeConfig.particleCount) * (40 + Math.random() * 20),
                    y: Math.sin((i * Math.PI * 2) / sizeConfig.particleCount) * (40 + Math.random() * 20),
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    duration: 0.8 + Math.random() * 0.4,
                    delay: 0.1 + Math.random() * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Rising sparkles for large amounts */}
          {visibility.showParticleEffects && !prefersReducedMotion && sizeTier === 'large' && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute text-yellow-400"
                  initial={{
                    x: (Math.random() - 0.5) * 60,
                    y: 20,
                    opacity: 0,
                    scale: 0.5,
                  }}
                  animate={{
                    y: -60 - Math.random() * 40,
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 1 + Math.random() * 0.5,
                    delay: 0.2 + i * 0.1,
                    ease: 'easeOut',
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Credits Gain Animation - Similar to XP but for Cosmic Credits
 * Mode-aware: Full animation in cosmic, subtle in professional, hidden in minimal
 */
export function CreditsGainAnimation({ amount, onComplete, position = null }) {
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Get mode settings
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  const sizeTier = getSizeTier(amount);
  const sizeConfig = SIZE_CONFIG[sizeTier];

  // Count-up animation
  const animatedCount = useCountUp(
    amount,
    sizeTier === 'large' ? 500 : sizeTier === 'medium' ? 400 : 300,
    !prefersReducedMotion && mode !== 'minimal'
  );

  useEffect(() => {
    if (mode === 'minimal') {
      const timer = setTimeout(() => onComplete?.(), 100);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete, mode]);

  // In minimal mode, skip animation entirely
  if (mode === 'minimal') {
    return null;
  }

  // Mode-specific styles
  const bgGradient = mode === 'cosmic'
    ? 'from-purple-500 to-pink-600'
    : 'from-blue-500 to-indigo-600';

  const glowColor = mode === 'cosmic' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(99, 102, 241, 0.5)';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [0, -40, -60, -100],
            scale: [0.5, sizeConfig.scale * 1.1, sizeConfig.scale, sizeConfig.scale * 0.8],
          }}
          transition={{
            duration: 1.8,
            times: [0, 0.2, 0.7, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed z-50 pointer-events-none"
          style={{
            top: position?.y ?? '50%',
            left: position?.x ?? '50%',
            transform: position ? 'translate(-50%, -50%)' : undefined,
          }}
        >
          <motion.div
            className={`bg-gradient-to-r ${bgGradient} rounded-full ${sizeConfig.padding} shadow-2xl border-2 border-white/30`}
            style={{
              boxShadow: `${sizeConfig.glowIntensity} ${glowColor}`,
            }}
          >
            <div className="flex items-center gap-2">
              {/* Zap icon with bounce */}
              <motion.div
                initial={{ rotate: -20 }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Zap className="w-5 h-5 text-yellow-300" fill="currentColor" />
              </motion.div>

              {/* Animated count */}
              <span className={`text-white font-bold ${sizeConfig.fontSize} tabular-nums`}>
                +{prefersReducedMotion ? amount : animatedCount}
              </span>

              <span className="text-white/80 font-semibold text-sm">
                {terms.credits}
              </span>
            </div>
          </motion.div>

          {/* Star particles - Only show in cosmic mode */}
          {visibility.showParticleEffects && !prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 -z-10 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(sizeConfig.particleCount)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-xl"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    rotate: 0,
                    scale: 1,
                  }}
                  animate={{
                    x: Math.cos((i * Math.PI * 2) / sizeConfig.particleCount) * (50 + Math.random() * 20),
                    y: Math.sin((i * Math.PI * 2) / sizeConfig.particleCount) * (50 + Math.random() * 20),
                    opacity: 0,
                    rotate: 360,
                    scale: 0,
                  }}
                  transition={{
                    duration: 1 + Math.random() * 0.4,
                    delay: 0.1 + Math.random() * 0.1,
                    ease: 'easeOut',
                  }}
                >
                  <Sparkles className="w-4 h-4 text-purple-300" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
