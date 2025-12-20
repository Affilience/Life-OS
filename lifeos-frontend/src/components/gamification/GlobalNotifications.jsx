/**
 * GlobalNotifications - Global notification layer for achievements, XP, and level ups
 *
 * Renders:
 * - Achievement unlock toasts (top-right)
 * - XP gain animations (center, floating up)
 * - Level up celebrations
 */

import React, { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotificationStore } from '../../stores/notificationStore';
import AchievementToast from './AchievementToast';
import XPGainAnimation from './XPGainAnimation';
import { feedback, celebrations } from '../../services/microInteractions';
import { useGamificationModeStore, VISIBILITY } from '../../stores/gamificationModeStore';
import { Trophy, Star, Sparkles } from 'lucide-react';

/**
 * Level Up Celebration Modal
 */
function LevelUpCelebration({ level, tierUp, onDismiss }) {
  const mode = useGamificationModeStore((state) => state.mode);

  useEffect(() => {
    // Trigger celebration effects
    feedback.levelUp();
    if (mode === 'cosmic') {
      celebrations.burst({
        particleCount: tierUp ? 150 : 80,
        spread: 100,
        origin: { y: 0.4 },
        colors: tierUp
          ? ['#fbbf24', '#f59e0b', '#d97706', '#ffffff']
          : ['#22d3ee', '#06b6d4', '#0891b2', '#ffffff'],
      });

      if (tierUp) {
        // Extra burst for tier up
        setTimeout(() => {
          celebrations.burst({
            particleCount: 100,
            spread: 120,
            origin: { y: 0.5 },
          });
        }, 300);
      }
    }
  }, [tierUp, mode]);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: -50, opacity: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className="relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl blur-3xl"
          style={{
            background: tierUp
              ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Main card */}
        <div className="relative bg-[#1a1625]/95 border-2 rounded-3xl p-8 text-center min-w-[300px]"
          style={{
            borderColor: tierUp ? '#fbbf24' : '#22d3ee',
            boxShadow: `0 0 60px ${tierUp ? '#fbbf2460' : '#22d3ee60'}`,
          }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className="mx-auto mb-4"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border-4"
              style={{
                background: `linear-gradient(135deg, ${tierUp ? '#fbbf24' : '#22d3ee'}30, ${tierUp ? '#f59e0b' : '#06b6d4'}30)`,
                borderColor: tierUp ? '#fbbf24' : '#22d3ee',
              }}
            >
              {tierUp ? (
                <Star className="w-10 h-10 text-amber-400" fill="currentColor" />
              ) : (
                <Trophy className="w-10 h-10 text-cyan-400" />
              )}
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-white/60 text-sm uppercase tracking-wider mb-2">
              {tierUp ? 'Tier Unlocked!' : 'Level Up!'}
            </p>
            <motion.h2
              className="text-5xl font-bold mb-2"
              style={{
                background: tierUp
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(135deg, #22d3ee, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              Level {level}
            </motion.h2>
            <p className="text-white/50 text-sm">
              {tierUp ? 'New abilities unlocked!' : 'Keep up the great work!'}
            </p>
          </motion.div>

          {/* Sparkles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-amber-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-2 -left-2"
          >
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Main Global Notifications Component
 */
export default function GlobalNotifications() {
  const {
    currentAchievement,
    dismissAchievement,
    currentXP,
    dismissXP,
    levelUpNotification,
    dismissLevelUp,
  } = useNotificationStore();

  const mode = useGamificationModeStore((state) => state.mode);
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Handle XP completion
  const handleXPComplete = useCallback(() => {
    dismissXP();
  }, [dismissXP]);

  // In minimal mode, don't show any notifications
  if (mode === 'minimal') {
    return null;
  }

  return (
    <>
      {/* Achievement Toast */}
      <AchievementToast
        achievement={currentAchievement}
        isVisible={!!currentAchievement && visibility.showAchievementPopups}
        onClose={dismissAchievement}
      />

      {/* XP Gain Animation - show when particle effects are enabled */}
      <AnimatePresence>
        {currentXP && visibility.showParticleEffects && (
          <XPGainAnimation
            key={currentXP.id}
            amount={currentXP.amount}
            position={currentXP.position || { x: window.innerWidth / 2, y: window.innerHeight / 2 - 100 }}
            onComplete={handleXPComplete}
          />
        )}
      </AnimatePresence>

      {/* Level Up Celebration */}
      <AnimatePresence>
        {levelUpNotification && visibility.showLevelUpAnimation && (
          <LevelUpCelebration
            key={levelUpNotification.timestamp}
            level={levelUpNotification.level}
            tierUp={levelUpNotification.tierUp}
            onDismiss={dismissLevelUp}
          />
        )}
      </AnimatePresence>
    </>
  );
}
