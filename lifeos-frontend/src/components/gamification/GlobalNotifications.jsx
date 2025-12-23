/**
 * GlobalNotifications - Global notification layer for achievements, XP, and level ups
 *
 * Renders:
 * - Achievement unlock toasts (top-right)
 * - XP gain animations (center, floating up)
 * - Level up celebrations (full-screen modal with XP animation and level transition)
 */

import React, { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../../stores/notificationStore';
import AchievementToast from './AchievementToast';
import XPGainAnimation from './XPGainAnimation';
import LevelUpModal from './LevelUpModal';
import { useGamificationModeStore, VISIBILITY } from '../../stores/gamificationModeStore';
import useSettingsStore from '../../stores/settingsStore';

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

  // Get user notification preferences
  const notifications = useSettingsStore((state) => state.settings?.notifications);
  const achievementAlertsEnabled = notifications?.achievementAlerts ?? true;
  const xpToastEnabled = notifications?.xpToastEnabled ?? true;
  const xpToastMinThreshold = notifications?.xpToastMinThreshold ?? 15;

  // Handle XP completion
  const handleXPComplete = useCallback(() => {
    dismissXP();
  }, [dismissXP]);

  // In minimal mode, don't show any notifications
  if (mode === 'minimal') {
    return null;
  }

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
    </>
  );
}
