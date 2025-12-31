/**
 * GlobalNotifications - Global notification layer for achievements, XP, level ups, and streaks
 *
 * Renders:
 * - Achievement unlock toasts (top-right)
 * - XP gain animations (center, floating up)
 * - Level up celebrations (full-screen modal with XP animation and level transition)
 * - Streak extended celebrations (Duolingo-style full-screen celebration)
 */

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotificationStore } from '../../stores/notificationStore';
import AchievementToast from './AchievementToast';
import XPGainAnimation from './XPGainAnimation';
import LevelUpModal from './LevelUpModal';
import { StreakExtendedCelebration } from '../ui/DuolingoCelebration';
import { useGamificationModeStore, VISIBILITY } from '../../stores/gamificationModeStore';
import useSettingsStore from '../../stores/settingsStore';
import usePvpArenaStore from '../../stores/pvpArenaStore';
import ArenaInvitePopup from '../pvp/ArenaInvitePopup';
import { supabase } from '../../lib/supabase';
import { X, Flame } from 'lucide-react';

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
    streakCelebration,
    dismissStreakCelebration,
    brokenStreakNotification,
    dismissBrokenStreak,
  } = useNotificationStore();

  const mode = useGamificationModeStore((state) => state.mode);
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Get user notification preferences
  const notifications = useSettingsStore((state) => state.settings?.notifications);
  const achievementAlertsEnabled = notifications?.achievementAlerts ?? true;
  const xpToastEnabled = notifications?.xpToastEnabled ?? true;
  const xpToastMinThreshold = notifications?.xpToastMinThreshold ?? 15;
  const streakAlertsEnabled = notifications?.streakAlerts ?? true;

  // Arena invite state
  const [currentArenaInvite, setCurrentArenaInvite] = useState(null);
  const { subscribeToArenaInvites, fetchPendingArenaInvites, isInMatch } = usePvpArenaStore();

  // Subscribe to arena invites on mount
  useEffect(() => {
    let unsubscribe = null;

    const setupArenaInvites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch any pending invites on load
      const invites = await fetchPendingArenaInvites();
      if (invites.length > 0 && !isInMatch) {
        setCurrentArenaInvite(invites[0]);
      }

      // Subscribe to new invites
      unsubscribe = subscribeToArenaInvites(user.id, (newInvite) => {
        if (!isInMatch) {
          setCurrentArenaInvite(newInvite);
        }
      });
    };

    setupArenaInvites();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribeToArenaInvites, fetchPendingArenaInvites, isInMatch]);

  // Handle XP completion
  const handleXPComplete = useCallback(() => {
    dismissXP();
  }, [dismissXP]);

  // Auto-dismiss broken streak notification after 8 seconds
  useEffect(() => {
    if (brokenStreakNotification) {
      const timer = setTimeout(() => {
        dismissBrokenStreak();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [brokenStreakNotification, dismissBrokenStreak]);

  // Note: Notifications now show one at a time via the master queue in notificationStore

  
  // Determine if XP toast should show (based on both visibility settings and user preferences)
  const shouldShowXP = currentXP &&
    visibility.showParticleEffects &&
    xpToastEnabled &&
    currentXP.amount >= xpToastMinThreshold;

  // Determine if achievement should show (based on both visibility settings and user preferences)
  const shouldShowAchievement = currentAchievement &&
    visibility.showAchievementPopups &&
    achievementAlertsEnabled;

  return (
    <>
      {/* Achievement Toast */}
      <AchievementToast
        achievement={currentAchievement}
        isVisible={shouldShowAchievement}
        onClose={dismissAchievement}
      />

      {/* XP Gain Animation - show when particle effects are enabled AND user has it enabled */}
      <AnimatePresence>
        {shouldShowXP && (
          <XPGainAnimation
            key={currentXP.id}
            amount={currentXP.amount}
            position={currentXP.position || { x: window.innerWidth / 2, y: window.innerHeight / 2 - 100 }}
            onComplete={handleXPComplete}
          />
        )}
      </AnimatePresence>

      {/* Level Up Celebration - Using enhanced LevelUpModal */}
      <LevelUpModal
        isOpen={!!levelUpNotification && visibility.showLevelUpAnimation}
        onClose={dismissLevelUp}
        data={levelUpNotification}
      />

      {/* Streak Extended Celebration - Duolingo-style */}
      <StreakExtendedCelebration
        show={!!streakCelebration && visibility.showLevelUpAnimation && streakAlertsEnabled}
        streak={streakCelebration?.streak}
        previousStreak={streakCelebration?.previousStreak || 0}
        newStreak={streakCelebration?.newStreak || 1}
        onComplete={dismissStreakCelebration}
      />

      {/* Broken Streak Notification */}
      <AnimatePresence>
        {brokenStreakNotification && streakAlertsEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-20 left-1/2 z-[9999] max-w-sm w-full mx-4"
          >
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-red-500/30 rounded-2xl p-4 shadow-2xl shadow-red-500/20">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5 h-5 text-red-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm">
                    {brokenStreakNotification.streak
                      ? `${brokenStreakNotification.streak.icon || '🔥'} Streak Reset`
                      : 'Streaks Reset'}
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {brokenStreakNotification.message}
                  </p>
                  {brokenStreakNotification.previousStreak > 0 && (
                    <p className="text-red-400/70 text-xs mt-1">
                      Was {brokenStreakNotification.previousStreak} days
                    </p>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={dismissBrokenStreak}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Encouragement */}
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 text-center">
                  Don't worry! Start fresh today and build it back up 💪
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PvP Arena Invite Popup */}
      {currentArenaInvite && !isInMatch && (
        <ArenaInvitePopup
          invite={currentArenaInvite}
          onClose={() => setCurrentArenaInvite(null)}
        />
      )}
    </>
  );
}
