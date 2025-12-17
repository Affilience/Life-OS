/**
 * EquipmentUnlockToast - Shows notification when equipment or pets are unlocked
 * Features the pixel art sprite of the unlocked item prominently
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Shield, Sword, Crown, Heart } from 'lucide-react';
import { useUnlockNotificationStore, UNLOCK_TYPES } from '../../stores/unlockNotificationStore';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { EQUIPMENT_RARITY, EQUIPMENT_SLOTS } from '../../data/equipmentDatabase';
import { TIER_INFO as PET_TIER_INFO } from '../../stores/petStore';
import { feedback } from '../../services/microInteractions';

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
  amulet: Sparkles,
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
  const { current, dismiss } = useUnlockNotificationStore();
  const mode = useGamificationModeStore((state) => state.mode);
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;

  const [imageError, setImageError] = useState(false);

  // Reset image error when item changes
  useEffect(() => {
    setImageError(false);
  }, [current?.id]);

  // Trigger feedback when toast appears
  useEffect(() => {
    if (current) {
      const rarity = current.rarity || 'common';
      if (rarity === 'legendary' || rarity === 'epic') {
        feedback.achievement();
      } else {
        feedback.achievementUnlock();
      }
    }
  }, [current]);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (current) {
      const timer = setTimeout(() => {
        dismiss();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [current, dismiss]);

  // In minimal mode, don't show
  if (!visibility.showAchievementPopups) {
    return null;
  }

  if (!current) return null;

  // Determine if this is a pet or equipment unlock
  const isPet = current.type === UNLOCK_TYPES.PET;

  // Get appropriate color based on type
  let itemColor;
  if (isPet) {
    itemColor = getPetTierColor(current.tier);
  } else {
    const rarityData = EQUIPMENT_RARITY[current.rarity] || EQUIPMENT_RARITY.common;
    itemColor = rarityData.color;
  }

  // Get sprite path - for pets use the sprite directly, for equipment construct path
  const spritePath = isPet ? current.sprite : getSpritePath(current);

  // Fallback icon
  const FallbackIcon = isPet ? Heart : (SLOT_ICONS[current.slot] || Sparkles);

  // Rarity/Tier label
  const tierLabel = isPet ? current.tier : current.rarity;

  // Is it legendary/epic/mythic (for special effects)
  const isSpecial = isPet
    ? ['epic', 'mythic'].includes(current.tier)
    : ['legendary', 'epic'].includes(current.rarity);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-80 max-w-[90vw]"
        >
          <div
            className="bg-[#1a1625] border-2 rounded-2xl overflow-hidden relative shadow-2xl"
            style={{ borderColor: itemColor }}
          >
            {/* Animated background glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 blur-3xl"
              style={{ backgroundColor: itemColor }}
            />

            {/* Particle effects for special tiers */}
            {isSpecial && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{ backgroundColor: itemColor }}
                    initial={{
                      x: '50%',
                      y: '50%',
                      opacity: 0,
                    }}
                    animate={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Content */}
            <div className="relative z-10 p-4">
              {/* Header with unlock text */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    {isPet ? (
                      <Heart className="w-5 h-5" style={{ color: itemColor }} />
                    ) : (
                      <Sparkles className="w-5 h-5" style={{ color: itemColor }} />
                    )}
                  </motion.div>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: itemColor }}>
                    {isPet ? 'New Companion!' : 'Equipment Unlocked!'}
                  </span>
                </div>
                <button
                  onClick={dismiss}
                  className="text-white/40 hover:text-white/80 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main content - sprite and info side by side */}
              <div className="flex gap-4 items-center">
                {/* Sprite container with glow effect */}
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 12 }}
                  className="relative flex-shrink-0"
                >
                  {/* Glow behind sprite */}
                  <div
                    className="absolute inset-0 rounded-xl blur-xl opacity-50"
                    style={{ backgroundColor: itemColor }}
                  />

                  {/* Sprite container */}
                  <div
                    className="relative w-20 h-20 rounded-xl border-2 flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: `${itemColor}15`,
                      borderColor: `${itemColor}50`,
                    }}
                  >
                    {spritePath && !imageError ? (
                      <motion.img
                        src={spritePath}
                        alt={current.name}
                        className="w-16 h-16 object-contain pixelated"
                        style={{ imageRendering: 'pixelated' }}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <FallbackIcon
                        className="w-10 h-10"
                        style={{ color: itemColor }}
                      />
                    )}

                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                  </div>
                </motion.div>

                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <motion.h3
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-bold text-lg text-white leading-tight mb-1"
                  >
                    {current.name}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/60 text-sm mb-2 line-clamp-2"
                  >
                    {current.description}
                  </motion.p>

                  {/* Rarity/Tier and type badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                      style={{
                        backgroundColor: `${itemColor}25`,
                        color: itemColor,
                      }}
                    >
                      {tierLabel}
                    </span>
                    <span className="text-white/40 text-xs">
                      {isPet
                        ? (current.culture || 'Companion')
                        : (EQUIPMENT_SLOTS[current.slot] || current.slot)
                      }
                    </span>
                  </motion.div>

                  {/* Stats/Bonus preview */}
                  {isPet ? (
                    // Pet bonus display
                    current.bonusType && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-2 mt-2 flex-wrap"
                      >
                        <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                          +{current.bonusAmount || 5}% {current.bonusType === 'xp' ? 'XP' : current.bonusType}
                        </span>
                      </motion.div>
                    )
                  ) : (
                    // Equipment stats display
                    current.stats && Object.keys(current.stats).length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-2 mt-2 flex-wrap"
                      >
                        {Object.entries(current.stats).slice(0, 3).map(([stat, value]) => (
                          <span
                            key={stat}
                            className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/70"
                          >
                            +{value} {stat.charAt(0).toUpperCase() + stat.slice(1)}
                          </span>
                        ))}
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 6, ease: 'linear' }}
              className="h-1 origin-left"
              style={{ backgroundColor: itemColor }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
