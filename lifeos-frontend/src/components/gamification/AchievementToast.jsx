import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { getRarityColor } from '../../stores/gamificationStore';

/**
 * Achievement Toast - Notification when achievements are unlocked
 *
 * Appears at top-right corner with achievement details
 */
export default function AchievementToast({ achievement, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!achievement) return null;

  const rarityColor = getRarityColor(achievement.rarity || 'common');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 400, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-20 right-6 z-50 w-96 max-w-[90vw]"
        >
          <div
            className="bg-[#12101a] border-2 rounded-xl p-4 shadow-2xl overflow-hidden relative"
            style={{ borderColor: rarityColor }}
          >
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-10 blur-2xl"
              style={{ backgroundColor: rarityColor }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                  className="flex-shrink-0"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                    style={{
                      backgroundColor: `${rarityColor}20`,
                      borderColor: rarityColor
                    }}
                  >
                    <CheckCircleIcon
                      className="w-7 h-7"
                      style={{ color: rarityColor }}
                    />
                  </div>
                </motion.div>

                {/* Title & Description */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
                    Achievement Unlocked
                  </p>
                  <h4 className="text-white font-bold text-lg leading-tight mb-1">
                    {achievement.title || achievement.name}
                  </h4>
                  <p className="text-white/60 text-sm">
                    {achievement.description}
                  </p>
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

              {/* Rewards */}
              {(achievement.xp_reward > 0 || achievement.credit_reward > 0) && (
                <div className="flex items-center gap-3 pt-3 border-t border-white/15/50">
                  {achievement.xp_reward > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-cyan-400">⚡</span>
                      <span className="text-white font-semibold">
                        +{achievement.xp_reward} XP
                      </span>
                    </div>
                  )}

                  {achievement.credit_reward > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-purple-400">💎</span>
                      <span className="text-white font-semibold">
                        +{achievement.credit_reward}
                      </span>
                    </div>
                  )}

                  {/* Rarity badge */}
                  <div className="ml-auto">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold uppercase"
                      style={{
                        backgroundColor: `${rarityColor}20`,
                        color: rarityColor,
                      }}
                    >
                      {achievement.rarity || 'Common'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Progress bar animation */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 5, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-1 origin-left"
              style={{ backgroundColor: rarityColor }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Achievement Toast Manager - Manages queue of achievement notifications
 */
export function AchievementToastManager({ achievements = [] }) {
  const [queue, setQueue] = React.useState([]);
  const [current, setCurrent] = React.useState(null);

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
