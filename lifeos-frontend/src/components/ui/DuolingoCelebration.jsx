/**
 * Duolingo-Style Celebration Modal
 *
 * Full-screen celebration animations for major milestones:
 * - Streak extended (flame animation with count-up)
 * - Quest completed (trophy/checkmark with confetti)
 * - Achievement unlocked (badge reveal with fanfare)
 *
 * Inspired by Duolingo's satisfying celebration screens.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Trophy,
  Star,
  Target,
  Zap,
  CheckCircle,
  Crown,
  Sparkles,
  Award,
  TrendingUp,
} from 'lucide-react';
import { feedback } from '../../services/microInteractions';
import { Confetti } from './Celebration';

/**
 * Animated counter that counts up from previous to new value
 */
function AnimatedCounter({ from, to, duration = 1000, delay = 0 }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const startTime = Date.now() + delay;
    const diff = to - from;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for satisfying feel
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [from, to, duration, delay]);

  return <span>{count}</span>;
}

/**
 * Streak Extended Celebration
 * Shows flame animation with streak count counting up
 */
export function StreakExtendedCelebration({
  show,
  streak,
  previousStreak,
  newStreak,
  onComplete,
  duration = 3500,
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);
      setShowConfetti(true);

      // Trigger haptic and sound
      feedback.streakMilestone(newStreak);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setShowConfetti(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Reset animation state when show becomes false (manual dismiss)
      setIsAnimating(false);
      setShowConfetti(false);
    }
  }, [show, duration, newStreak, onComplete]);

  if (!show && !isAnimating) return null;

  const isMilestone = newStreak === 7 || newStreak === 14 || newStreak === 30 ||
                      newStreak === 60 || newStreak === 100 || newStreak === 365;

  return createPortal(
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onComplete}
        >
          {/* Background glow */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-orange-500 to-red-500 blur-3xl"
          />

          {/* Main content */}
          <div className="relative text-center">
            {/* Flame icon with pulse */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    filter: [
                      'drop-shadow(0 0 20px rgba(251, 146, 60, 0.5))',
                      'drop-shadow(0 0 40px rgba(251, 146, 60, 0.8))',
                      'drop-shadow(0 0 20px rgba(251, 146, 60, 0.5))',
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Flame className="w-24 h-24 text-orange-500" fill="currentColor" />
                </motion.div>
                {isMilestone && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -top-2 -right-2"
                  >
                    <Star className="w-8 h-8 text-amber-400" fill="currentColor" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Streak count */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-4"
            >
              <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-300 via-orange-500 to-red-600">
                <AnimatedCounter from={previousStreak} to={newStreak} duration={800} delay={500} />
              </div>
              <p className="text-orange-300 text-xl font-semibold mt-2">
                {newStreak === 1 ? 'Day Streak Started!' : 'Day Streak!'}
              </p>
            </motion.div>

            {/* Message */}
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/60 text-lg"
            >
              {isMilestone ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Milestone reached! Amazing!
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </span>
              ) : (
                streak?.name ? `${streak.name} streak extended!` : "You're on fire! Keep it up!"
              )}
            </motion.p>

            {/* XP bonus indicator */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 font-medium">
                {isMilestone ? `+${newStreak * 5} Bonus XP` : '+10 XP'}
              </span>
            </motion.div>
          </div>

          {/* Confetti */}
          <Confetti
            active={showConfetti}
            particleCount={isMilestone ? 100 : 50}
            colors={['#f97316', '#fb923c', '#fbbf24', '#ef4444', '#f59e0b']}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/**
 * Quest Completed Celebration
 * Shows trophy/checkmark animation with quest details
 */
export function QuestCompletedCelebration({
  show,
  quest,
  onComplete,
  duration = 4000,
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);
      setShowConfetti(true);

      // Trigger haptic and sound
      feedback.questComplete();

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setShowConfetti(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Reset animation state when show becomes false (manual dismiss)
      setIsAnimating(false);
      setShowConfetti(false);
    }
  }, [show, duration, onComplete]);

  if (!show && !isAnimating) return null;

  const questType = quest?.type || 'weekly';
  const isChain = questType === 'chain';
  const isBoss = questType === 'boss';
  const isCrossModule = questType === 'cross-module';

  // Choose icon based on quest type
  const QuestIcon = isBoss ? Crown :
                    isChain ? TrendingUp :
                    isCrossModule ? Target : Trophy;

  // Choose colors based on quest type
  const colors = isBoss ? ['#fbbf24', '#f59e0b', '#d97706'] :
                 isChain ? ['#8b5cf6', '#a78bfa', '#c4b5fd'] :
                 isCrossModule ? ['#06b6d4', '#22d3ee', '#67e8f9'] :
                 ['#22c55e', '#4ade80', '#86efac'];

  const gradientClass = isBoss ? 'from-amber-300 via-amber-500 to-amber-700' :
                        isChain ? 'from-violet-300 via-violet-500 to-purple-600' :
                        isCrossModule ? 'from-cyan-300 via-cyan-500 to-teal-600' :
                        'from-emerald-300 via-emerald-500 to-green-600';

  return createPortal(
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onComplete}
        >
          {/* Background glow */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`absolute w-64 h-64 rounded-full blur-3xl ${
              isBoss ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
              isChain ? 'bg-gradient-to-r from-violet-500 to-purple-500' :
              isCrossModule ? 'bg-gradient-to-r from-cyan-500 to-teal-500' :
              'bg-gradient-to-r from-emerald-500 to-green-500'
            }`}
          />

          {/* Main content */}
          <div className="relative text-center max-w-md px-6">
            {/* Icon with checkmark overlay */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <QuestIcon className={`w-20 h-20 ${
                    isBoss ? 'text-amber-400' :
                    isChain ? 'text-violet-400' :
                    isCrossModule ? 'text-cyan-400' :
                    'text-emerald-400'
                  }`} />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1"
                >
                  <CheckCircle className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>

            {/* Quest completed text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className={`text-lg font-medium mb-2 ${
                isBoss ? 'text-amber-300' :
                isChain ? 'text-violet-300' :
                isCrossModule ? 'text-cyan-300' :
                'text-emerald-300'
              }`}>
                {isBoss ? 'BOSS DEFEATED!' :
                 isChain ? 'QUEST CHAIN COMPLETE!' :
                 isCrossModule ? 'CROSS-MODULE QUEST!' :
                 'QUEST COMPLETE!'}
              </p>
              <h2 className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b ${gradientClass}`}>
                {quest?.name || quest?.title || 'Quest Completed'}
              </h2>
            </motion.div>

            {/* Quest description */}
            {quest?.description && (
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white/60 mt-3"
              >
                {quest.description}
              </motion.p>
            )}

            {/* Rewards */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              className={`mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-xl border ${
                isBoss ? 'bg-amber-500/10 border-amber-500/30' :
                isChain ? 'bg-violet-500/10 border-violet-500/30' :
                isCrossModule ? 'bg-cyan-500/10 border-cyan-500/30' :
                'bg-emerald-500/10 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300 font-bold">
                  +{quest?.xpReward || (isBoss ? 200 : isChain ? 150 : 100)} XP
                </span>
              </div>
              {quest?.creditReward && (
                <>
                  <div className="w-px h-5 bg-white/20" />
                  <div className="flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-violet-400" />
                    <span className="text-violet-300 font-bold">
                      +{quest.creditReward} Credits
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Confetti */}
          <Confetti
            active={showConfetti}
            particleCount={isBoss ? 150 : 80}
            colors={colors}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/**
 * Achievement Unlocked Celebration
 * Shows badge reveal with fanfare animation
 */
export function AchievementUnlockedCelebration({
  show,
  achievement,
  onComplete,
  duration = 4000,
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);
      setShowConfetti(true);

      // Trigger haptic and sound
      feedback.achievement();

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setShowConfetti(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Reset animation state when show becomes false (manual dismiss)
      setIsAnimating(false);
      setShowConfetti(false);
    }
  }, [show, duration, onComplete]);

  if (!show && !isAnimating) return null;

  const tier = achievement?.tier || achievement?.rarity || 'common';
  const isLegendary = tier === 'legendary';
  const isEpic = tier === 'epic';
  const isRare = tier === 'rare';

  const tierConfig = {
    legendary: {
      gradient: 'from-amber-300 via-yellow-500 to-orange-600',
      glow: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      border: 'border-amber-500/50',
      bg: 'bg-amber-500/10',
      textColor: 'text-amber-300',
      colors: ['#fbbf24', '#f59e0b', '#d97706', '#b45309'],
    },
    epic: {
      gradient: 'from-violet-300 via-purple-500 to-pink-600',
      glow: 'bg-gradient-to-r from-violet-500 to-purple-500',
      border: 'border-violet-500/50',
      bg: 'bg-violet-500/10',
      textColor: 'text-violet-300',
      colors: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ec4899'],
    },
    rare: {
      gradient: 'from-blue-300 via-blue-500 to-cyan-600',
      glow: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      border: 'border-blue-500/50',
      bg: 'bg-blue-500/10',
      textColor: 'text-blue-300',
      colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#06b6d4'],
    },
    uncommon: {
      gradient: 'from-emerald-300 via-green-500 to-teal-600',
      glow: 'bg-gradient-to-r from-emerald-500 to-green-500',
      border: 'border-emerald-500/50',
      bg: 'bg-emerald-500/10',
      textColor: 'text-emerald-300',
      colors: ['#22c55e', '#4ade80', '#86efac', '#14b8a6'],
    },
    common: {
      gradient: 'from-slate-300 via-slate-400 to-slate-500',
      glow: 'bg-gradient-to-r from-slate-500 to-slate-600',
      border: 'border-slate-500/50',
      bg: 'bg-slate-500/10',
      textColor: 'text-slate-300',
      colors: ['#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'],
    },
  };

  const config = tierConfig[tier] || tierConfig.common;

  return createPortal(
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onComplete}
        >
          {/* Background glow */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`absolute w-64 h-64 rounded-full blur-3xl ${config.glow}`}
          />

          {/* Rotating rays for legendary */}
          {isLegendary && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute w-96 h-96"
            >
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-1 h-48 bg-gradient-to-t from-amber-500/0 via-amber-500/20 to-amber-500/0 origin-bottom"
                  style={{ transform: `rotate(${i * 30}deg) translateX(-50%)` }}
                />
              ))}
            </motion.div>
          )}

          {/* Main content */}
          <div className="relative text-center max-w-md px-6">
            {/* Badge/Trophy icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <motion.div
                animate={isLegendary ? {
                  filter: [
                    'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))',
                    'drop-shadow(0 0 40px rgba(251, 191, 36, 0.8))',
                    'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))',
                  ],
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`p-6 rounded-2xl ${config.bg} ${config.border} border-2`}
              >
                {achievement?.icon ? (
                  <span className="text-5xl">{achievement.icon}</span>
                ) : (
                  <Trophy className={`w-16 h-16 ${config.textColor}`} />
                )}
              </motion.div>
            </motion.div>

            {/* Achievement unlocked text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className={`text-lg font-medium mb-2 uppercase tracking-wider ${config.textColor}`}>
                Achievement Unlocked!
              </p>
              <h2 className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b ${config.gradient}`}>
                {achievement?.name || achievement?.title || 'Achievement'}
              </h2>
            </motion.div>

            {/* Description */}
            {achievement?.description && (
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white/60 mt-3"
              >
                {achievement.description}
              </motion.p>
            )}

            {/* Tier badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              className="mt-6 flex items-center justify-center gap-3"
            >
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${config.bg} ${config.border} border ${config.textColor}`}>
                {tier}
              </span>
              <div className="flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300 font-bold">
                  +{achievement?.xpReward || (isLegendary ? 500 : isEpic ? 250 : isRare ? 100 : 50)} XP
                </span>
              </div>
            </motion.div>
          </div>

          {/* Confetti */}
          <Confetti
            active={showConfetti}
            particleCount={isLegendary ? 150 : isEpic ? 100 : 60}
            colors={config.colors}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default {
  StreakExtendedCelebration,
  QuestCompletedCelebration,
  AchievementUnlockedCelebration,
};
