import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X as XMarkIcon, CheckCircle as CheckCircleIcon, ArrowUp as ArrowUpIcon, Trophy as TrophyIcon, Gift as GiftIcon, Sparkles as SparklesIcon } from 'lucide-react';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { feedback, sounds, haptics, celebrations } from '../../services/microInteractions';
import { getLevelTitle, getMilestoneForLevel, getHighestFrame, getLevelXPBonus, getPetSlots, getInventorySlots } from '../../data/levelProgression';
import LevelTitle from './LevelTitle';
import ProfileFrame from './ProfileFrame';

/**
 * Count-up animation hook
 */
const useCountUp = (start, end, duration = 500, enabled = true, delay = 0) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!enabled) {
      setCount(end);
      return;
    }

    const timer = setTimeout(() => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(start + (end - start) * eased));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [start, end, duration, enabled, delay]);

  return count;
};

/**
 * Circular progress ring component
 */
const ChargingRing = ({ progress, size = 120, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="absolute -inset-2"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(168, 85, 247, 0.2)"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#chargingGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.1, ease: 'linear' }}
      />
      <defs>
        <linearGradient id="chargingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/**
 * Level Up Modal - Celebration when reaching a new level
 *
 * Features:
 * - Level title progression display
 * - Milestone rewards (credits, XP bonus, equipment, frames)
 * - New slot unlocks (pets, inventory)
 * - Mode-specific display (Cosmic, Professional, Minimal)
 */
export default function LevelUpModal({ isOpen, onClose, data, onClaimMilestone }) {
  const prefersReducedMotion = useReducedMotion();

  // Get gamification mode
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Animation phase state: 'charging' → 'reveal' → 'content' → 'complete'
  const [phase, setPhase] = useState('charging');
  const [chargingProgress, setChargingProgress] = useState(0);

  // Phased animation sequence
  useEffect(() => {
    if (!isOpen || !data) {
      setPhase('charging');
      setChargingProgress(0);
      return;
    }

    if (prefersReducedMotion || mode === 'minimal') {
      setPhase('content');
      return;
    }

    // Phase 1: Charging (0-500ms) - anticipation build-up
    const chargingDuration = 500;
    const chargingStart = Date.now();

    // Play anticipation sound
    try {
      sounds.pop(); // Subtle start sound
    } catch (e) {}

    const chargeInterval = setInterval(() => {
      const elapsed = Date.now() - chargingStart;
      const progress = Math.min((elapsed / chargingDuration) * 100, 100);
      setChargingProgress(progress);

      if (progress >= 100) {
        clearInterval(chargeInterval);
        setPhase('reveal');

        // Phase 2: Reveal (500ms) - fanfare!
        feedback.levelUp();
        celebrations.burst({
          particleCount: 50,
          spread: 70,
          origin: { x: 0.5, y: 0.4 },
        });

        // Phase 3: Content (after reveal animation)
        setTimeout(() => {
          setPhase('content');
        }, 800);
      }
    }, 16);

    return () => clearInterval(chargeInterval);
  }, [isOpen, data, prefersReducedMotion, mode]);

  if (!data) return null;

  // In minimal mode, don't show the modal if level up animation is disabled
  if (mode === 'minimal' && !visibility.showLevelUpAnimation) {
    return null;
  }

  const {
    newLevel,
    oldLevel,
    stageTransition,
    newStage,
    oldStage,
    unlocksAvailable,
  } = data;

  // Get level progression info
  const oldTitle = getLevelTitle(oldLevel);
  const newTitle = getLevelTitle(newLevel);
  const titleChanged = oldTitle.title !== newTitle.title;
  const milestone = getMilestoneForLevel(newLevel);
  const newFrame = getHighestFrame(newLevel);
  const oldFrame = getHighestFrame(oldLevel);
  const frameUnlocked = newFrame.id !== oldFrame.id && newFrame.id !== 'none';
  const xpBonus = getLevelXPBonus(newLevel);
  const xpBonusFormatted = `+${(xpBonus * 100).toFixed(1)}%`;
  const newPetSlots = getPetSlots(newLevel);
  const oldPetSlots = getPetSlots(oldLevel);
  const petSlotUnlocked = newPetSlots > oldPetSlots;
  const newInventorySlots = getInventorySlots(newLevel);
  const oldInventorySlots = getInventorySlots(oldLevel);
  const inventorySlotUnlocked = newInventorySlots > oldInventorySlots;

  // Mode-specific styling
  const getModalStyle = () => {
    if (mode === 'cosmic') {
      return {
        borderColor: 'var(--level-up-primary)',
        boxShadow: 'var(--level-up-glow)',
        background: '#12101a'
      };
    } else if (mode === 'professional') {
      return {
        borderColor: 'rgba(59, 130, 246, 0.5)',
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)',
        background: '#12101a'
      };
    } else {
      return {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        boxShadow: 'none',
        background: '#1a1724'
      };
    }
  };

  const getGradientStyle = () => {
    if (mode === 'cosmic') {
      return 'linear-gradient(to right, var(--level-up-primary), var(--level-up-secondary))';
    } else if (mode === 'professional') {
      return 'linear-gradient(to right, #3b82f6, #06b6d4)';
    } else {
      return 'linear-gradient(to right, #6b7280, #9ca3af)';
    }
  };

  const getButtonStyle = () => {
    if (mode === 'cosmic') {
      return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';
    } else if (mode === 'professional') {
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600';
    } else {
      return 'bg-white/10 hover:bg-white/20 border border-white/20';
    }
  };

  // Calculate staggered unlock delays
  const getUnlockDelay = (index) => 0.2 + index * 0.15;

  // Collect all unlocks for staggered animation
  const unlocks = [];
  if (titleChanged) unlocks.push({ type: 'title', data: { oldTitle, newTitle } });
  if (milestone?.credits > 0) unlocks.push({ type: 'credits', data: milestone.credits });
  if (milestone?.xpBonus > 0) unlocks.push({ type: 'xpBonus', data: milestone.xpBonus });
  if (milestone?.equipment) unlocks.push({ type: 'equipment', data: milestone.equipment });
  if (frameUnlocked) unlocks.push({ type: 'frame', data: newFrame });
  if (petSlotUnlocked) unlocks.push({ type: 'petSlot', data: { old: oldPetSlots, new: newPetSlots } });
  if (inventorySlotUnlocked) unlocks.push({ type: 'inventory', data: { old: oldInventorySlots, new: newInventorySlots } });

  // Render Cosmic Mode (Full celebration with anticipation)
  const renderCosmicModal = () => (
    <div
      className="bg-[#12101a] rounded-2xl border-2 p-8 max-w-md w-full pointer-events-auto relative overflow-hidden"
      style={getModalStyle()}
    >
      {/* Animated background particles - only during content phase */}
      {visibility.showParticleEffects && phase !== 'charging' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              initial={{ left: '50%', top: '50%', opacity: 0 }}
              animate={{
                x: [0, Math.random() * 400 - 200],
                y: [0, Math.random() * 600 - 300],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ backgroundColor: 'var(--celebration-primary)' }}
            />
          ))}
        </div>
      )}

      {/* Close button - only after charging */}
      {phase !== 'charging' && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-20"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* CHARGING PHASE */}
        <AnimatePresence mode="wait">
          {phase === 'charging' && (
            <motion.div
              key="charging"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="py-8"
            >
              {/* Charging ring around level number */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <ChargingRing progress={chargingProgress} size={96} strokeWidth={4} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    className="text-white/60 font-bold text-3xl"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  >
                    {oldLevel}
                  </motion.span>
                </div>
              </div>
              <motion.p
                className="text-purple-400 text-sm font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Leveling up...
              </motion.p>
            </motion.div>
          )}

          {/* REVEAL & CONTENT PHASES */}
          {(phase === 'reveal' || phase === 'content') && (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            >
              {/* Title with dramatic animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                <h2
                  className="text-4xl font-bold text-transparent bg-clip-text mb-2"
                  style={{ backgroundImage: getGradientStyle() }}
                >
                  {terms.levelUp.toUpperCase()}
                </h2>
              </motion.div>

              {/* Level Badge with count-up animation */}
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', damping: 12 }}
                className="my-8 flex items-center justify-center gap-4"
              >
                {/* Old Level */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-[#221e2e] flex items-center justify-center border-2 border-gray-600"
                >
                  <span className="text-white/60 font-bold text-2xl">{oldLevel}</span>
                </motion.div>

                {/* Arrow with pulse */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="text-purple-400 text-3xl"
                >
                  →
                </motion.div>

                {/* New Level with glow and count-up */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.4, type: 'spring', damping: 10, stiffness: 300 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg relative"
                  style={{
                    background: getGradientStyle(),
                    boxShadow: '0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
                  }}
                >
                  <motion.span
                    className="text-white font-bold text-3xl tabular-nums"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {newLevel}
                  </motion.span>
                  {/* Pulsing ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white/50"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1, repeat: 2 }}
                  />
                </motion.div>
              </motion.div>

              {/* Staggered Unlocks */}
              {phase === 'content' && (
                <div className="space-y-3">
                  {/* Title Change */}
                  {titleChanged && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: getUnlockDelay(0), type: 'spring' }}
                      className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4"
                    >
                      <p className="text-purple-400 font-semibold mb-2">🎖️ New Title Achieved!</p>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-white/50" style={{ color: oldTitle.color }}>
                          {oldTitle.icon} {oldTitle.title}
                        </span>
                        <motion.span
                          className="text-white/40"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 0.3, delay: getUnlockDelay(0) + 0.2 }}
                        >
                          →
                        </motion.span>
                        <motion.span
                          className="font-bold"
                          style={{ color: newTitle.color }}
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ delay: getUnlockDelay(0) + 0.3 }}
                        >
                          {newTitle.icon} {newTitle.title}
                        </motion.span>
                      </div>
                    </motion.div>
                  )}

                  {/* Milestone Rewards - Staggered Grid */}
                  {milestone && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: getUnlockDelay(titleChanged ? 1 : 0), type: 'spring' }}
                      className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4"
                    >
                      <p className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                        <GiftIcon className="w-5 h-5" />
                        Level {newLevel} Milestone Rewards!
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {milestone.credits > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: getUnlockDelay(titleChanged ? 1 : 0) + 0.1 }}
                            className="flex items-center gap-2 text-yellow-400"
                          >
                            <span>💰</span>
                            <span>+{milestone.credits} Credits</span>
                          </motion.div>
                        )}
                        {milestone.xpBonus > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: getUnlockDelay(titleChanged ? 1 : 0) + 0.2 }}
                            className="flex items-center gap-2 text-blue-400"
                          >
                            <span>⚡</span>
                            <span>+{milestone.xpBonus} Bonus XP</span>
                          </motion.div>
                        )}
                        {milestone.equipment && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: getUnlockDelay(titleChanged ? 1 : 0) + 0.3 }}
                            className="flex items-center gap-2 text-purple-400"
                          >
                            <span>⚔️</span>
                            <span>New Equipment!</span>
                          </motion.div>
                        )}
                        {milestone.frame && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: getUnlockDelay(titleChanged ? 1 : 0) + 0.4 }}
                            className="flex items-center gap-2 text-cyan-400"
                          >
                            <span>🖼️</span>
                            <span>{newFrame.name}</span>
                          </motion.div>
                        )}
                        {milestone.petSlot && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: getUnlockDelay(titleChanged ? 1 : 0) + 0.5 }}
                            className="flex items-center gap-2 text-pink-400"
                          >
                            <span>🐾</span>
                            <span>+1 Pet Slot</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* XP Bonus Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: getUnlockDelay(unlocks.length), type: 'spring' }}
                    className="flex items-center justify-center gap-4 text-sm"
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                      <SparklesIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-white/70">Level Bonus:</span>
                      <span className="text-purple-400 font-semibold">{xpBonusFormatted} XP</span>
                    </div>
                  </motion.div>

                  {/* Slot Unlocks */}
                  {(petSlotUnlocked || inventorySlotUnlocked) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: getUnlockDelay(unlocks.length + 1), type: 'spring' }}
                      className="bg-green-500/20 border border-green-500/30 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-center gap-4 text-sm">
                        {petSlotUnlocked && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: getUnlockDelay(unlocks.length + 1) + 0.1 }}
                            className="flex items-center gap-2 text-green-400"
                          >
                            <span>🐾</span>
                            <span>Pet Slots: {oldPetSlots} → {newPetSlots}</span>
                          </motion.div>
                        )}
                        {inventorySlotUnlocked && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: getUnlockDelay(unlocks.length + 1) + 0.2 }}
                            className="flex items-center gap-2 text-green-400"
                          >
                            <span>🎒</span>
                            <span>Inventory: {oldInventorySlots} → {newInventorySlots}</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Legacy Unlocks */}
                  {unlocksAvailable && unlocksAvailable.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: getUnlockDelay(unlocks.length + 2), type: 'spring' }}
                      className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4"
                    >
                      <p className="text-blue-400 font-semibold mb-2">🎁 Additional Unlocks!</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {unlocksAvailable.map((unlock, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: getUnlockDelay(unlocks.length + 2) + 0.1 * i }}
                          >
                            • {unlock}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Continue Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: phase === 'content' ? getUnlockDelay(unlocks.length + 3) : 0.5 }}
                onClick={onClose}
                className={`mt-6 px-8 py-3 ${getButtonStyle()} text-white font-semibold rounded-lg transition-all shadow-lg hover:scale-105`}
              >
                Continue Journey
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // Render Professional Mode (Clean notification)
  const renderProfessionalModal = () => (
    <div
      className="bg-[#12101a] rounded-xl border p-6 max-w-sm w-full pointer-events-auto relative"
      style={getModalStyle()}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center"
        >
          <TrophyIcon className="w-8 h-8 text-blue-400" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-white mb-2"
        >
          {terms.levelUp}
        </motion.h2>

        {/* Level indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <span className="text-white/60 text-lg">{terms.level} {oldLevel}</span>
          <ArrowUpIcon className="w-5 h-5 text-blue-400" />
          <span className="text-blue-400 text-xl font-bold">{terms.level} {newLevel}</span>
        </motion.div>

        {/* Stage Transition */}
        {stageTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-white/60 mb-4"
          >
            Growth Stage: {oldStage} → {newStage}
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onClose}
          className={`w-full py-2.5 ${getButtonStyle()} text-white font-medium rounded-lg transition-all`}
        >
          Continue
        </motion.button>
      </div>
    </div>
  );

  // Render Minimal Mode (Simple toast)
  const renderMinimalModal = () => (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 bg-[#1a1724] border border-white/20 rounded-lg px-6 py-3 pointer-events-auto flex items-center gap-3"
    >
      <CheckCircleIcon className="w-5 h-5 text-green-400" />
      <span className="text-white text-sm">
        Level {newLevel} reached
      </span>
      <button
        onClick={onClose}
        className="text-white/60 hover:text-white ml-2"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - only for cosmic and professional */}
          {mode !== 'minimal' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-50 ${mode === 'cosmic' ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/60'}`}
              onClick={onClose}
            />
          )}

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: mode === 'minimal' ? 1 : 0.8, y: mode === 'minimal' ? -20 : 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: mode === 'minimal' ? 1 : 0.8, y: mode === 'minimal' ? -20 : 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`fixed z-50 ${mode === 'minimal' ? '' : 'inset-0 flex items-center justify-center p-4'} pointer-events-none`}
          >
            {mode === 'cosmic' && renderCosmicModal()}
            {mode === 'professional' && renderProfessionalModal()}
            {mode === 'minimal' && renderMinimalModal()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
