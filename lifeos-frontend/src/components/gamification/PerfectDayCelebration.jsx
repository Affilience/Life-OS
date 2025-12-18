/**
 * PerfectDayCelebration
 *
 * Full-screen celebration overlay for completing all daily tasks/quests.
 * Features:
 * - Epic "PERFECT DAY!" text with glow effects
 * - Stats summary (tasks completed, XP earned, streak)
 * - Animated counters and staggered reveals
 * - Confetti cascade and particle effects
 * - Mode-aware: Full effects in cosmic, simpler in professional
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Trophy, Star, Flame, CheckCircle, X, Sparkles, Zap } from 'lucide-react';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { feedback, celebrations } from '../../services/microInteractions';
import { useParticleBurst, PARTICLE_PALETTES } from '../../hooks/useParticleBurst';
import confetti from 'canvas-confetti';

/**
 * Count-up animation hook
 */
const useCountUp = (target, duration = 800, enabled = true, delay = 0) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setCount(target);
      return;
    }

    const startTimer = setTimeout(() => {
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
 * Stat card component with animated counter
 */
const StatCard = ({ icon: Icon, label, value, color, delay, enabled }) => {
  const animatedValue = useCountUp(value, 600, enabled, delay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay / 1000, type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-w-[100px]"
    >
      <motion.div
        className="flex items-center justify-center mb-2"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ delay: delay / 1000 + 0.3, duration: 0.4 }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </motion.div>
      <div className="text-2xl font-bold text-white tabular-nums text-center">
        {enabled ? animatedValue : value}
      </div>
      <div className="text-xs text-white/60 text-center mt-1">{label}</div>
    </motion.div>
  );
};

/**
 * Floating particle effect behind the main content
 */
const FloatingParticles = ({ count = 20 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#A855F7' : '#22D3EE',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default function PerfectDayCelebration({
  isOpen,
  onClose,
  stats = {},
}) {
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef(null);
  const burst = useParticleBurst(containerRef);

  const [phase, setPhase] = useState('entering'); // 'entering' | 'stats' | 'idle'

  const {
    tasksCompleted = 0,
    xpEarned = 0,
    currentStreak = 0,
    creditsEarned = 0,
  } = stats;

  // Trigger celebration effects on mount
  useEffect(() => {
    if (!isOpen) {
      setPhase('entering');
      return;
    }

    // Phase transitions
    const timers = [];

    // Enter phase
    timers.push(setTimeout(() => setPhase('stats'), 800));

    // Celebration effects
    if (!prefersReducedMotion && mode !== 'minimal') {
      // Epic confetti burst
      const duration = 4000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          spread: 100,
          startVelocity: 40,
          colors: ['#FFD700', '#A855F7', '#22D3EE', '#EF4444', '#22C55E'],
          zIndex: 9999,
        });
        confetti({
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          spread: 100,
          startVelocity: 40,
          colors: ['#FFD700', '#A855F7', '#22D3EE', '#EF4444', '#22C55E'],
          zIndex: 9999,
        });
      }, 200);

      timers.push({ clear: () => clearInterval(interval) });

      // Sound and haptic
      feedback.levelUp?.();
    }

    return () => {
      timers.forEach((t) => {
        if (t.clear) t.clear();
        else clearTimeout(t);
      });
    };
  }, [isOpen, prefersReducedMotion, mode]);

  // Trigger particle burst on title appear
  useEffect(() => {
    if (phase === 'stats' && containerRef.current && !prefersReducedMotion && mode !== 'minimal') {
      setTimeout(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          burst(rect.width / 2, rect.height / 3, {
            count: 30,
            colors: PARTICLE_PALETTES.celebration,
            spread: 150,
          });
        }
      }, 200);
    }
  }, [phase, burst, prefersReducedMotion, mode]);

  // Don't render in minimal mode
  if (mode === 'minimal' && isOpen) {
    // Just show a simple toast instead
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-purple-900/80 via-black/80 to-indigo-900/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
          />

          {/* Floating particles */}
          {!prefersReducedMotion && <FloatingParticles count={25} />}

          {/* Main content */}
          <motion.div
            className="relative z-10 text-center px-6 max-w-md"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute -top-4 -right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-white/80" />
            </motion.button>

            {/* Trophy icon */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
              className="mb-4"
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"
                animate={!prefersReducedMotion ? {
                  boxShadow: [
                    '0 0 20px rgba(255, 215, 0, 0.4)',
                    '0 0 40px rgba(255, 215, 0, 0.6)',
                    '0 0 20px rgba(255, 215, 0, 0.4)',
                  ],
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>

            {/* PERFECT DAY! title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.h1
                className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 mb-2"
                animate={!prefersReducedMotion ? {
                  textShadow: [
                    '0 0 20px rgba(255, 215, 0, 0.4)',
                    '0 0 40px rgba(255, 215, 0, 0.7)',
                    '0 0 20px rgba(255, 215, 0, 0.4)',
                  ],
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                style={{
                  textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
                }}
              >
                PERFECT DAY!
              </motion.h1>
              <motion.p
                className="text-white/80 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                You completed all your daily {terms.quests.toLowerCase()}!
              </motion.p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex justify-center gap-4 mt-8 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'stats' || phase === 'idle' ? 1 : 0 }}
              transition={{ delay: 0.6 }}
            >
              <StatCard
                icon={CheckCircle}
                label="Tasks"
                value={tasksCompleted}
                color="#22C55E"
                delay={800}
                enabled={!prefersReducedMotion && phase !== 'entering'}
              />
              <StatCard
                icon={Zap}
                label={terms.xp}
                value={xpEarned}
                color="#A855F7"
                delay={950}
                enabled={!prefersReducedMotion && phase !== 'entering'}
              />
              <StatCard
                icon={Flame}
                label="Streak"
                value={currentStreak}
                color="#F59E0B"
                delay={1100}
                enabled={!prefersReducedMotion && phase !== 'entering'}
              />
              {creditsEarned > 0 && (
                <StatCard
                  icon={Star}
                  label={terms.credits}
                  value={creditsEarned}
                  color="#22D3EE"
                  delay={1250}
                  enabled={!prefersReducedMotion && phase !== 'entering'}
                />
              )}
            </motion.div>

            {/* Continue button */}
            <motion.button
              onClick={onClose}
              className="mt-8 px-8 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                boxShadow: '0 10px 30px rgba(255, 165, 0, 0.3)',
              }}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Continue
              </span>
            </motion.button>

            {/* Bonus streak message */}
            {currentStreak > 1 && (
              <motion.p
                className="mt-4 text-amber-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                {currentStreak} day streak! Keep it going!
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to trigger Perfect Day celebration
 */
export function usePerfectDayCelebration() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({});

  const trigger = (celebrationStats = {}) => {
    setStats(celebrationStats);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    stats,
    trigger,
    close,
    PerfectDayCelebration: () => (
      <PerfectDayCelebration isOpen={isOpen} onClose={close} stats={stats} />
    ),
  };
}
