import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X as XMarkIcon } from 'lucide-react';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { feedback, celebrations } from '../../services/microInteractions';
import { getLevelTitle, getMilestoneForLevel, getHighestFrame, getPetSlots, getInventorySlots } from '../../data/levelProgression';
import { SKILL_POINTS_PER_LEVEL } from '../../utils/statsSystem';

/**
 * Level Up Modal - Game-style fullscreen celebration
 * Inspired by Duolingo, Clash Royale, and Genshin Impact
 */
export default function LevelUpModal({ isOpen, onClose, data }) {
  const [showContent, setShowContent] = useState(false);

  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Trigger effects when modal opens
  useEffect(() => {
    if (isOpen && data) {
      // Immediate confetti burst
      if (visibility.showParticleEffects) {
        celebrations.burst({
          particleCount: 100,
          spread: 120,
          origin: { x: 0.5, y: 0.4 },
        });

        // Second burst for extra impact
        setTimeout(() => {
          celebrations.burst({
            particleCount: 50,
            spread: 80,
            origin: { x: 0.5, y: 0.5 },
          });
        }, 150);
      }

      // Sound and haptics
      feedback.levelUp();

      // Show content immediately
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [isOpen, data, visibility.showParticleEffects]);

  if (!data || !isOpen) return null;

  // In minimal mode, don't show if disabled
  if (mode === 'minimal' && !visibility.showLevelUpAnimation) {
    return null;
  }

  // Extract data
  const {
    newLevel = 1,
    oldLevel = 0,
    newlyAvailablePerks = [],
    skillPointsAwarded = SKILL_POINTS_PER_LEVEL,
  } = data;

  const safeNewLevel = newLevel || 1;
  const safeOldLevel = oldLevel || safeNewLevel - 1;

  // Get progression info
  const newTitle = getLevelTitle(safeNewLevel);
  const oldTitle = getLevelTitle(safeOldLevel);
  const titleChanged = oldTitle.title !== newTitle.title;
  const milestone = getMilestoneForLevel(safeNewLevel);
  const newFrame = getHighestFrame(safeNewLevel);
  const oldFrame = getHighestFrame(safeOldLevel);
  const frameUnlocked = newFrame.id !== oldFrame.id && newFrame.id !== 'none';
  const newPetSlots = getPetSlots(safeNewLevel);
  const oldPetSlots = getPetSlots(safeOldLevel);
  const petSlotUnlocked = newPetSlots > oldPetSlots;
  const newInventorySlots = getInventorySlots(safeNewLevel);
  const oldInventorySlots = getInventorySlots(safeOldLevel);
  const inventorySlotUnlocked = newInventorySlots > oldInventorySlots;

  // Collect rewards for display
  const rewards = [];
  if (skillPointsAwarded > 0) {
    rewards.push({ icon: '⚡', text: `+${skillPointsAwarded} Skill Points`, color: 'text-cyan-400' });
  }
  if (milestone?.credits > 0) {
    rewards.push({ icon: '💰', text: `+${milestone.credits} Credits`, color: 'text-yellow-400' });
  }
  if (frameUnlocked) {
    rewards.push({ icon: '🖼️', text: newFrame.name, color: 'text-purple-400' });
  }
  if (petSlotUnlocked) {
    rewards.push({ icon: '🐾', text: `Pet Slot ${oldPetSlots} → ${newPetSlots}`, color: 'text-pink-400' });
  }
  if (inventorySlotUnlocked) {
    rewards.push({ icon: '🎒', text: `Inventory +${newInventorySlots - oldInventorySlots}`, color: 'text-green-400' });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Fullscreen dark overlay with radial gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 40%, rgba(139, 92, 246, 0.3) 0%, rgba(0, 0, 0, 0.95) 50%)',
            }}
          />

          {/* Animated glow rings behind level */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute w-32 h-32 rounded-full border-2 border-purple-500/30"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
              className="absolute w-32 h-32 rounded-full border-2 border-pink-500/30"
            />
          </div>

          {/* Main content - no box, just content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 flex flex-col items-center px-8 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEVEL UP text */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-2"
            >
              <span className="text-lg font-bold tracking-[0.3em] text-purple-400/80 uppercase">
                {terms.levelUp}
              </span>
            </motion.div>

            {/* Giant level number */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.05 }}
              className="relative mb-4"
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 blur-3xl opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  transform: 'scale(1.5)',
                }}
              />

              {/* Level number */}
              <span
                className="relative text-[120px] font-black leading-none text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #c084fc, #f472b6, #fb923c)',
                  textShadow: '0 0 80px rgba(168, 85, 247, 0.5)',
                  WebkitTextStroke: '2px rgba(255,255,255,0.1)',
                }}
              >
                {safeNewLevel}
              </span>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 text-center"
            >
              {titleChanged ? (
                <div className="flex items-center gap-3">
                  <span className="text-white/40 line-through">{oldTitle.title}</span>
                  <span className="text-white/60">→</span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: newTitle.color }}
                  >
                    {newTitle.icon} {newTitle.title}
                  </span>
                </div>
              ) : (
                <span
                  className="text-xl font-semibold"
                  style={{ color: newTitle.color }}
                >
                  {newTitle.icon} {newTitle.title}
                </span>
              )}
            </motion.div>

            {/* Rewards row */}
            {rewards.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-3 mb-6"
              >
                {rewards.map((reward, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.35 + i * 0.05, type: 'spring', damping: 15 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10"
                  >
                    <span className="text-lg">{reward.icon}</span>
                    <span className={`font-semibold ${reward.color}`}>{reward.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* New perks available */}
            {newlyAvailablePerks.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-sm mb-6"
              >
                <div className="text-center text-white/50 text-sm mb-3">
                  🌟 {newlyAvailablePerks.length} New Skill Tree Perks Available
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {newlyAvailablePerks.slice(0, 4).map((perk, i) => (
                    <motion.div
                      key={perk.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.45 + i * 0.05, type: 'spring', damping: 15 }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: perk.treeColor }}
                      />
                      <span className="text-white/70">{perk.name}</span>
                    </motion.div>
                  ))}
                  {newlyAvailablePerks.length > 4 && (
                    <div className="px-3 py-1.5 text-white/40 text-sm">
                      +{newlyAvailablePerks.length - 4} more
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Continue button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className="px-12 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25"
            >
              Continue
            </motion.button>

            {/* Tap to close hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 text-white/30 text-xs"
            >
              Tap anywhere to close
            </motion.p>
          </motion.div>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/40 hover:text-white/80 transition-colors z-20"
          >
            <XMarkIcon className="w-8 h-8" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
