import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircleIcon, StarIcon, SparklesIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { getRarityColor } from '../../stores/gamificationStore';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { feedback, sounds, haptics, celebrations } from '../../services/microInteractions';
import { useParticleBurst, PARTICLE_PALETTES } from '../../hooks/useParticleBurst';

/**
 * Rarity-based configuration for achievement toast intensity
 */
const RARITY_CONFIG = {
  common: {
    icon: CheckCircleIcon,
    animation: 'slide',
    particleCount: 0,
    confetti: false,
    screenFlash: false,
    glowPulse: false,
    soundDelay: 0,
    duration: 4000,
    scale: 1,
  },
  rare: {
    icon: SparklesIcon,
    animation: 'slideGlow',
    particleCount: 8,
    confetti: false,
    screenFlash: false,
    glowPulse: true,
    soundDelay: 100,
    duration: 5000,
    scale: 1.02,
  },
  epic: {
    icon: StarIcon,
    animation: 'burst',
    particleCount: 20,
    confetti: true,
    confettiCount: 40,
    screenFlash: false,
    glowPulse: true,
    soundDelay: 200,
    duration: 6000,
    scale: 1.05,
  },
  legendary: {
    icon: TrophyIcon,
    animation: 'legendary',
    particleCount: 35,
    confetti: true,
    confettiCount: 100,
    screenFlash: true,
    glowPulse: true,
    soundDelay: 300,
    duration: 8000,
    scale: 1.1,
  },
};

/**
 * Screen flash effect for legendary achievements
 */
const ScreenFlash = ({ color, trigger }) => (
  <AnimatePresence>
    {trigger && (
      <motion.div
        className="fixed inset-0 pointer-events-none z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{ backgroundColor: color }}
      />
    )}
  </AnimatePresence>
);

/**
 * Achievement Toast - Notification when achievements are unlocked
 *
 * Enhanced with rarity-based intensity:
 * - Common: Simple slide-in, soft chime
 * - Rare: Slide-in with glow pulse, rising arpeggio
 * - Epic: Particle burst, dramatic fanfare
 * - Legendary: Full-screen flash, confetti cascade, orchestral hit
 */
export default function AchievementToast({ achievement, isVisible, onClose }) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef(null);

  // Get mode visibility and terminology
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // State for animations
  const [showScreenFlash, setShowScreenFlash] = useState(false);
  const [glowPulseActive, setGlowPulseActive] = useState(false);

  // Particle burst hook
  const burst = useParticleBurst(containerRef);

  // In minimal mode or if achievement popups are disabled, don't show
  if (!visibility.showAchievementPopups) {
    return null;
  }

  const rarity = achievement?.rarity?.toLowerCase() || 'common';
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  const rarityColor = getRarityColor(rarity);
  const IconComponent = config.icon;

  // Trigger rarity-based feedback when toast appears
  useEffect(() => {
    if (!isVisible || !achievement) return;

    const runEffects = async () => {
      // 1. Screen flash for legendary
      if (config.screenFlash && !prefersReducedMotion && mode !== 'minimal') {
        setShowScreenFlash(true);
        setTimeout(() => setShowScreenFlash(false), 600);
      }

      // 2. Haptic feedback (stronger for rarer achievements)
      if (rarity === 'legendary' || rarity === 'epic') {
        haptics.notification('success');
      } else {
        haptics.impact('medium');
      }

      // 3. Sound effect based on rarity
      setTimeout(() => {
        if (rarity === 'legendary') {
          feedback.achievement();
        } else if (rarity === 'epic') {
          feedback.achievement();
        } else if (rarity === 'rare') {
          sounds.success();
        } else {
          sounds.pop();
        }
      }, config.soundDelay);

      // 4. Confetti for epic/legendary
      if (config.confetti && !prefersReducedMotion && mode !== 'minimal') {
        setTimeout(() => {
          celebrations.burst({
            particleCount: config.confettiCount,
            spread: rarity === 'legendary' ? 100 : 70,
            origin: { x: 0.85, y: 0.15 },
            colors: [rarityColor, '#ffffff', '#fbbf24'],
          });

          // Second burst for legendary
          if (rarity === 'legendary') {
            setTimeout(() => {
              celebrations.burst({
                particleCount: 60,
                spread: 120,
                origin: { x: 0.85, y: 0.2 },
              });
            }, 300);
          }
        }, 200);
      }

      // 5. Glow pulse animation
      if (config.glowPulse && !prefersReducedMotion) {
        setGlowPulseActive(true);
        setTimeout(() => setGlowPulseActive(false), 2000);
      }

      // 6. Particle burst from icon
      if (config.particleCount > 0 && !prefersReducedMotion && mode !== 'minimal') {
        setTimeout(() => {
          if (containerRef.current) {
            burst(60, 60, {
              count: config.particleCount,
              colors: [rarityColor, '#ffffff', '#fbbf24'],
              spread: rarity === 'legendary' ? 120 : 80,
              duration: 800,
            });
          }
        }, 400);
      }
    };

    runEffects();
  }, [isVisible, achievement, rarity, config, prefersReducedMotion, mode, rarityColor, burst]);

  // Auto-close timer
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, config.duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, config.duration]);

  if (!achievement) return null;

  // Animation variants based on rarity
  const getAnimationVariants = () => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    switch (config.animation) {
      case 'legendary':
        return {
          initial: { opacity: 0, scale: 0.5, x: 100, rotate: 10 },
          animate: {
            opacity: 1,
            scale: [0.5, 1.15, 1],
            x: 0,
            rotate: [10, -5, 0],
          },
          exit: { opacity: 0, scale: 0.8, x: 100 },
          transition: { type: 'spring', stiffness: 300, damping: 15 },
        };
      case 'burst':
        return {
          initial: { opacity: 0, scale: 0.7, x: 50 },
          animate: {
            opacity: 1,
            scale: [0.7, 1.1, 1],
            x: 0,
          },
          exit: { opacity: 0, x: 100 },
          transition: { type: 'spring', stiffness: 400, damping: 20 },
        };
      case 'slideGlow':
        return {
          initial: { opacity: 0, x: 100 },
          animate: {
            opacity: 1,
            x: 0,
            scale: [1, config.scale, 1],
          },
          exit: { opacity: 0, x: 100 },
          transition: { type: 'spring', damping: 25, stiffness: 300 },
        };
      default:
        return {
          initial: { opacity: 0, x: 100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 100 },
          transition: { type: 'spring', damping: 25, stiffness: 300 },
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <>
      {/* Screen flash for legendary */}
      <ScreenFlash color={rarityColor} trigger={showScreenFlash} />

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={containerRef}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={variants.transition}
            className="fixed top-20 right-6 z-50 w-96 max-w-[90vw]"
          >
            <div
              className="bg-[#12101a] border-2 rounded-xl p-4 shadow-2xl overflow-hidden relative"
              style={{
                borderColor: rarityColor,
                boxShadow: glowPulseActive
                  ? `0 0 30px ${rarityColor}80, 0 0 60px ${rarityColor}40`
                  : `0 0 20px ${rarityColor}40`,
                transition: 'box-shadow 0.3s ease',
              }}
            >
              {/* Animated background glow */}
              <motion.div
                className="absolute inset-0 blur-2xl"
                style={{ backgroundColor: rarityColor }}
                initial={{ opacity: 0.1 }}
                animate={
                  glowPulseActive
                    ? { opacity: [0.1, 0.25, 0.1] }
                    : { opacity: 0.1 }
                }
                transition={
                  glowPulseActive
                    ? { duration: 1, repeat: 2 }
                    : { duration: 0.3 }
                }
              />

              {/* Rarity-specific background shimmer */}
              {(rarity === 'legendary' || rarity === 'epic') && !prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${rarityColor}20, transparent)`,
                  }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  {/* Icon with rarity-based animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      delay: 0.2,
                      type: 'spring',
                      damping: rarity === 'legendary' ? 8 : 10,
                    }}
                    className="flex-shrink-0"
                  >
                    <motion.div
                      className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                      style={{
                        backgroundColor: `${rarityColor}20`,
                        borderColor: rarityColor,
                      }}
                      animate={
                        rarity === 'legendary' && !prefersReducedMotion
                          ? { rotate: [0, 5, -5, 0] }
                          : {}
                      }
                      transition={
                        rarity === 'legendary'
                          ? { duration: 0.5, delay: 0.5, repeat: 2 }
                          : {}
                      }
                    >
                      <IconComponent
                        className="w-7 h-7"
                        style={{ color: rarityColor }}
                      />
                    </motion.div>
                  </motion.div>

                  {/* Title & Description */}
                  <div className="flex-1 min-w-0">
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xs text-white/60 uppercase tracking-wider mb-1"
                    >
                      {rarity === 'legendary' ? '🏆 ' : rarity === 'epic' ? '⭐ ' : ''}
                      {terms.achievement} Unlocked
                    </motion.p>
                    <motion.h4
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-white font-bold text-lg leading-tight mb-1"
                    >
                      {achievement.title || achievement.name}
                    </motion.h4>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/60 text-sm"
                    >
                      {achievement.description}
                    </motion.p>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Rewards with staggered animation */}
                {(achievement.xp_reward > 0 || achievement.credit_reward > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 pt-3 border-t border-white/10"
                  >
                    {achievement.xp_reward > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="flex items-center gap-1.5 text-sm"
                      >
                        <span className="text-cyan-400">⚡</span>
                        <span className="text-white font-semibold">
                          +{achievement.xp_reward} {terms.xp}
                        </span>
                      </motion.div>
                    )}

                    {achievement.credit_reward > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: 'spring' }}
                        className="flex items-center gap-1.5 text-sm"
                      >
                        <span className="text-purple-400">💎</span>
                        <span className="text-white font-semibold">
                          +{achievement.credit_reward} {terms.credits}
                        </span>
                      </motion.div>
                    )}

                    {/* Rarity badge with pulse for rare+ */}
                    <motion.div
                      className="ml-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: 'spring' }}
                    >
                      <motion.span
                        className="px-2 py-0.5 rounded text-xs font-semibold uppercase"
                        style={{
                          backgroundColor: `${rarityColor}20`,
                          color: rarityColor,
                        }}
                        animate={
                          rarity !== 'common' && !prefersReducedMotion
                            ? { scale: [1, 1.1, 1] }
                            : {}
                        }
                        transition={
                          rarity !== 'common'
                            ? { duration: 0.5, delay: 1, repeat: 1 }
                            : {}
                        }
                      >
                        {rarity}
                      </motion.span>
                    </motion.div>
                  </motion.div>
                )}
              </div>

              {/* Progress bar animation */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: config.duration / 1000, ease: 'linear' }}
                className="absolute bottom-0 left-0 right-0 h-1 origin-left"
                style={{ backgroundColor: rarityColor }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Achievement Toast Manager - Manages queue of achievement notifications
 * Mode-aware: respects showAchievementPopups visibility setting
 */
export function AchievementToastManager({ achievements = [] }) {
  const [queue, setQueue] = React.useState([]);
  const [current, setCurrent] = React.useState(null);

  // Get visibility settings
  const visibility = VISIBILITY[useGamificationModeStore.getState().mode] || VISIBILITY.cosmic;

  // If achievement popups are disabled, don't process queue
  if (!visibility.showAchievementPopups) {
    return null;
  }

  // Add new achievements to queue
  React.useEffect(() => {
    if (achievements.length > 0) {
      setQueue(prev => [...prev, ...achievements]);
    }
  }, [achievements]);

  // Show next achievement in queue
  React.useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(prev => prev.slice(1));
    }
  }, [current, queue]);

  const handleClose = () => {
    setCurrent(null);
  };

  return (
    <AchievementToast
      achievement={current}
      isVisible={!!current}
      onClose={handleClose}
    />
  );
}
