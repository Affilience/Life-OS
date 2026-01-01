/**
 * EquipmentUnlockToast - Enhanced notification for equipment/pet unlocks
 *
 * Features:
 * - 3D card flip reveal animation with perspective transforms
 * - Stat bars with counting animation
 * - Pulsing "Equip Now?" button in rarity color
 * - Mode-aware: Full effects in cosmic, subtle in professional
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, X, Shield, Sword, Crown, Heart, Star, ChevronRight } from 'lucide-react';
import { useUnlockNotificationStore, UNLOCK_TYPES } from '../../stores/unlockNotificationStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { EQUIPMENT_RARITY, EQUIPMENT_SLOTS } from '../../data/equipmentDatabase';
import { TIER_INFO as PET_TIER_INFO } from '../../stores/petStore';
import { feedback } from '../../services/microInteractions';
import { useParticleBurst, PARTICLE_PALETTES } from '../../hooks/useParticleBurst';
import confetti from 'canvas-confetti';

// Slot icons for fallback display (equipment)
const SLOT_ICONS = {
  helmet: Crown,
  chest: Shield,
  legs: Shield,
  mainHand: Sword,
  offHand: Shield,
  cape: Sparkles,
  ring1: Sparkles,
  ring2: Sparkles,
  amulet: Star,
};

// Rarity configuration for enhanced effects
const RARITY_CONFIG = {
  common: {
    particles: 0,
    confetti: false,
    glow: false,
    flipDuration: 0.6,
    sound: 'pop',
  },
  uncommon: {
    particles: 6,
    confetti: false,
    glow: true,
    flipDuration: 0.7,
    sound: 'success',
  },
  rare: {
    particles: 10,
    confetti: false,
    glow: true,
    flipDuration: 0.8,
    sound: 'achievement',
  },
  epic: {
    particles: 15,
    confetti: true,
    confettiCount: 50,
    glow: true,
    flipDuration: 0.9,
    sound: 'achievement',
  },
  legendary: {
    particles: 25,
    confetti: true,
    confettiCount: 100,
    glow: true,
    screenFlash: true,
    flipDuration: 1.0,
    sound: 'levelUp',
  },
};

// Pet tier to rarity mapping
const PET_TIER_RARITY = {
  common: 'common',
  uncommon: 'uncommon',
  rare: 'rare',
  epic: 'epic',
  mythic: 'legendary',
};

/**
 * Count-up animation hook
 */
const useCountUp = (target, duration = 400, enabled = true, delay = 0) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setCount(target);
      return;
    }

    const startTimer = setTimeout(() => {
      setStarted(true);
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [target, duration, enabled, delay]);

  return count;
};

/**
 * Animated stat bar component
 */
const AnimatedStatBar = ({ label, value, maxValue = 100, color, delay = 0, enabled = true }) => {
  const animatedValue = useCountUp(value, 500, enabled, delay);
  const percentage = Math.min((animatedValue / maxValue) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.3 }}
      className="flex items-center gap-2"
    >
      <span className="text-xs text-white/60 w-12 truncate">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay / 1000 + 0.2, duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-bold text-white/80 tabular-nums w-8 text-right">
        +{animatedValue}
      </span>
    </motion.div>
  );
};

/**
 * Screen flash for legendary items
 */
const ScreenFlash = ({ color, onComplete }) => {
  return (
    <motion.div
      className="fixed inset-0 z-40 pointer-events-none"
      style={{ backgroundColor: color }}
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
    />
  );
};

// Get tier info for pets
const getPetTierColor = (tier) => {
  return PET_TIER_INFO[tier]?.color || '#9CA3AF';
};

// Get sprite path from equipment item
const getSpritePath = (item) => {
  if (!item) return null;
  if (item.sprite?.path) return item.sprite.path;
  if (typeof item.sprite === 'string') return item.sprite;
  // Fallback: construct path from slot and id
  const slotFolder = item.slot === 'chest' ? 'chests' : `${item.slot}s`;
  return `/assets/equipment/${slotFolder}/${item.id}.png`;
};

export default function EquipmentUnlockToast() {
  const navigate = useNavigate();
  // Use main notification store for proper queueing with achievements
  const current = useNotificationStore((state) => state.currentEquipmentUnlock);
  const dismiss = useNotificationStore((state) => state.dismissEquipmentUnlock);
  const mode = useGamificationModeStore((state) => state.mode);
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef(null);
  const burst = useParticleBurst(containerRef);

  const [imageError, setImageError] = useState(false);
  const [phase, setPhase] = useState('hidden'); // 'hidden' | 'flip' | 'reveal' | 'stats'
  const [showFlash, setShowFlash] = useState(false);

  // Reset state when item changes
  useEffect(() => {
    if (current) {
      setImageError(false);
      setPhase('hidden');
      setShowFlash(false);

      // Start flip animation after brief delay
      const flipTimer = setTimeout(() => setPhase('flip'), 100);
      return () => clearTimeout(flipTimer);
    }
  }, [current?.id]);

  // Handle phase transitions
  useEffect(() => {
    if (!current) return;

    const isPet = current.type === UNLOCK_TYPES.PET;
    const rarityKey = isPet ? (PET_TIER_RARITY[current.tier] || 'common') : (current.rarity || 'common');
    const config = RARITY_CONFIG[rarityKey] || RARITY_CONFIG.common;

    const timers = [];

    if (phase === 'flip') {
      // After flip completes, transition to reveal
      timers.push(setTimeout(() => setPhase('reveal'), config.flipDuration * 1000 + 200));
    }

    if (phase === 'reveal') {
      // After reveal, show stats
      timers.push(setTimeout(() => setPhase('stats'), 400));

      // Trigger effects
      if (!prefersReducedMotion && mode === 'cosmic') {
        // Screen flash for legendary
        if (config.screenFlash) {
          setShowFlash(true);
        }

        // Confetti
        if (config.confetti) {
          confetti({
            particleCount: config.confettiCount,
            spread: 70,
            origin: { y: 0.3 },
            colors: ['#FFD700', '#FFA500', '#FF6347', '#8A2BE2'],
          });
        }

        // Particle burst
        if (config.particles > 0 && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          burst(rect.width / 2, rect.height / 2, {
            count: config.particles,
            colors: PARTICLE_PALETTES.gold,
            spread: 100,
          });
        }
      }
    }

    return () => timers.forEach(clearTimeout);
  }, [phase, current, mode, prefersReducedMotion, burst]);

  // Trigger sound feedback
  useEffect(() => {
    if (current && phase === 'reveal') {
      const isPet = current.type === UNLOCK_TYPES.PET;
      const rarityKey = isPet ? (PET_TIER_RARITY[current.tier] || 'common') : (current.rarity || 'common');

      if (rarityKey === 'legendary' || rarityKey === 'epic') {
        feedback.achievement();
      } else {
        feedback.achievementUnlock();
      }
    }
  }, [current, phase]);

  // Auto-dismiss after 8 seconds (longer to show off effects)
  useEffect(() => {
    if (current && phase === 'stats') {
      const timer = setTimeout(() => {
        dismiss();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [current, phase, dismiss]);

  // In minimal mode, don't show
  if (!visibility.showAchievementPopups) {
    return null;
  }

  if (!current) return null;

  // Determine if this is a pet or equipment unlock
  const isPet = current.type === UNLOCK_TYPES.PET;

  // Get rarity config
  const rarityKey = isPet ? (PET_TIER_RARITY[current.tier] || 'common') : (current.rarity || 'common');
  const config = RARITY_CONFIG[rarityKey] || RARITY_CONFIG.common;

  // Get appropriate color based on type
  let itemColor;
  if (isPet) {
    itemColor = getPetTierColor(current.tier);
  } else {
    const rarityData = EQUIPMENT_RARITY[current.rarity] || EQUIPMENT_RARITY.common;
    itemColor = rarityData.color;
  }

  // Get sprite path
  const spritePath = isPet ? current.sprite : getSpritePath(current);

  // Fallback icon
  const FallbackIcon = isPet ? Heart : (SLOT_ICONS[current.slot] || Sparkles);

  // Rarity/Tier label
  const tierLabel = isPet ? current.tier : current.rarity;

  // Stats for display
  const stats = isPet
    ? (current.bonusType ? [{ stat: current.bonusType, value: current.bonusAmount || 5 }] : [])
    : (current.stats ? Object.entries(current.stats).map(([stat, value]) => ({ stat, value })) : []);

  return (
    <>
      {/* Screen flash for legendary */}
      <AnimatePresence>
        {showFlash && (
          <ScreenFlash
            color={itemColor}
            onComplete={() => setShowFlash(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            ref={containerRef}
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-20 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[9999] sm:w-96 max-w-[calc(100vw-2rem)]"
            style={{ perspective: '1000px' }}
          >
            {/* 3D Flip Card Container */}
            <motion.div
              className="relative"
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ rotateY: 180 }}
              animate={{
                rotateY: phase !== 'hidden' ? 0 : 180,
              }}
              transition={{
                duration: config.flipDuration,
                ease: [0.23, 1.12, 0.56, 1], // Spring-like ease
              }}
            >
              {/* Card Front (revealed content) */}
              <div
                className="bg-[#1a1625] border-2 rounded-2xl overflow-hidden relative shadow-2xl"
                style={{
                  borderColor: itemColor,
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Animated background glow */}
                {config.glow && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.1, 0.25, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 blur-3xl"
                    style={{ backgroundColor: itemColor }}
                  />
                )}

                {/* Shimmer effect for rare+ */}
                {rarityKey !== 'common' && !prefersReducedMotion && (
                  <motion.div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: phase === 'reveal' || phase === 'stats' ? 1 : 0 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{
                        delay: config.flipDuration + 0.3,
                        duration: 1,
                        ease: 'easeInOut',
                        repeat: 1,
                        repeatDelay: 0.5,
                      }}
                    />
                  </motion.div>
                )}

                {/* Content */}
                <div className="relative z-10 p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: phase !== 'hidden' ? 1 : 0, x: 0 }}
                      transition={{ delay: config.flipDuration * 0.5 }}
                    >
                      <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: config.flipDuration, type: 'spring' }}
                      >
                        {isPet ? (
                          <Heart className="w-5 h-5" style={{ color: itemColor }} />
                        ) : (
                          <Sparkles className="w-5 h-5" style={{ color: itemColor }} />
                        )}
                      </motion.div>
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: itemColor }}
                      >
                        {isPet ? 'New Companion!' : 'Equipment Unlocked!'}
                      </span>
                    </motion.div>
                    <button
                      onClick={dismiss}
                      className="text-white/40 hover:text-white/80 transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main content */}
                  <div className="flex gap-4 items-start">
                    {/* Sprite container with 3D pop effect */}
                    <motion.div
                      className="relative flex-shrink-0"
                      initial={{ scale: 0, rotateZ: -15 }}
                      animate={{
                        scale: phase !== 'hidden' ? 1 : 0,
                        rotateZ: 0,
                      }}
                      transition={{
                        delay: config.flipDuration * 0.3,
                        type: 'spring',
                        damping: 12,
                        stiffness: 200,
                      }}
                    >
                      {/* Glow behind sprite */}
                      <motion.div
                        className="absolute inset-0 rounded-xl blur-xl"
                        style={{ backgroundColor: itemColor }}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: phase === 'reveal' || phase === 'stats' ? [0.3, 0.6, 0.3] : 0,
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />

                      {/* Sprite container */}
                      <div
                        className="relative w-24 h-24 rounded-xl border-2 flex items-center justify-center overflow-hidden"
                        style={{
                          backgroundColor: `${itemColor}15`,
                          borderColor: `${itemColor}50`,
                        }}
                      >
                        {spritePath && !imageError ? (
                          <motion.img
                            src={spritePath}
                            alt={current.name}
                            className="w-20 h-20 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                            initial={{ scale: 2, opacity: 0, filter: 'blur(4px)' }}
                            animate={{
                              scale: 1,
                              opacity: 1,
                              filter: 'blur(0px)',
                            }}
                            transition={{ delay: config.flipDuration + 0.1, duration: 0.4 }}
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <FallbackIcon
                            className="w-12 h-12"
                            style={{ color: itemColor }}
                          />
                        )}

                        {/* Shine sweep */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ delay: config.flipDuration + 0.5, duration: 0.6 }}
                        />
                      </div>
                    </motion.div>

                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <motion.h3
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: config.flipDuration + 0.1 }}
                        className="font-bold text-xl text-white leading-tight mb-1"
                      >
                        {current.name}
                      </motion.h3>

                      <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: config.flipDuration + 0.2 }}
                        className="text-white/60 text-sm mb-3 line-clamp-2"
                      >
                        {current.description}
                      </motion.p>

                      {/* Badges */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: config.flipDuration + 0.3 }}
                        className="flex items-center gap-2 mb-3"
                      >
                        <motion.span
                          className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                          style={{
                            backgroundColor: `${itemColor}30`,
                            color: itemColor,
                            boxShadow: config.glow ? `0 0 10px ${itemColor}40` : 'none',
                          }}
                          animate={config.glow ? {
                            boxShadow: [
                              `0 0 10px ${itemColor}40`,
                              `0 0 20px ${itemColor}60`,
                              `0 0 10px ${itemColor}40`,
                            ],
                          } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {tierLabel}
                        </motion.span>
                        <span className="text-white/40 text-xs">
                          {isPet
                            ? (current.culture || 'Companion')
                            : (EQUIPMENT_SLOTS[current.slot] || current.slot)
                          }
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Animated Stats Section */}
                  {stats.length > 0 && (
                    <motion.div
                      className="mt-4 space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: phase === 'stats' ? 1 : 0,
                        height: phase === 'stats' ? 'auto' : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                        {isPet ? 'Bonus' : 'Stats'}
                      </div>
                      {stats.slice(0, 4).map((item, i) => (
                        <AnimatedStatBar
                          key={item.stat}
                          label={isPet && item.stat === 'xp' ? 'XP Boost' : item.stat}
                          value={item.value}
                          maxValue={isPet ? 20 : 50}
                          color={itemColor}
                          delay={i * 100}
                          enabled={phase === 'stats' && !prefersReducedMotion}
                        />
                      ))}
                    </motion.div>
                  )}

                  {/* Pulsing Equip Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: phase === 'stats' ? 1 : 0,
                      y: phase === 'stats' ? 0 : 20,
                    }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="mt-4"
                  >
                    <motion.button
                      onClick={() => {
                        feedback.click?.();
                        dismiss();
                        // Navigate to character page with appropriate tab
                        const tab = isPet ? 'pets' : 'equipment';
                        navigate(`/character?tab=${tab}`);
                      }}
                      className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                      style={{
                        backgroundColor: itemColor,
                        boxShadow: `0 0 20px ${itemColor}50`,
                      }}
                      animate={!prefersReducedMotion ? {
                        boxShadow: [
                          `0 0 20px ${itemColor}50`,
                          `0 0 30px ${itemColor}70`,
                          `0 0 20px ${itemColor}50`,
                        ],
                        scale: [1, 1.02, 1],
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        type: 'tween',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{isPet ? 'View Companion' : 'Equip Now?'}</span>
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                </div>

                {/* Progress bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: phase === 'stats' ? 1 : 0 }}
                  transition={{ duration: 6, ease: 'linear', delay: 0.5 }}
                  className="h-1 origin-left"
                  style={{ backgroundColor: itemColor }}
                />
              </div>

              {/* Card Back (mystery/hidden state) */}
              <div
                className="absolute inset-0 bg-[#1a1625] border-2 border-purple-500/50 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="text-center">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="mb-2"
                  >
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto" />
                  </motion.div>
                  <p className="text-purple-300 font-bold">Revealing...</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Hook to easily trigger equipment unlock notifications
 */
export function useEquipmentUnlockNotification() {
  const addUnlock = useUnlockNotificationStore((state) => state.addUnlock);
  const addUnlocks = useUnlockNotificationStore((state) => state.addUnlocks);
  const addEquipmentUnlock = useUnlockNotificationStore((state) => state.addEquipmentUnlock);
  const addPetUnlock = useUnlockNotificationStore((state) => state.addPetUnlock);

  return {
    showUnlock: addUnlock,
    showUnlocks: addUnlocks,
    showEquipmentUnlock: addEquipmentUnlock,
    showPetUnlock: addPetUnlock,
  };
}
