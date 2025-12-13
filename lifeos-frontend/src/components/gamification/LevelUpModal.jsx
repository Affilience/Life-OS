import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, ArrowUpIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { useGamificationModeStore, TERMINOLOGY, VISIBILITY } from '../../stores/gamificationModeStore';
import { feedback } from '../../services/microInteractions';

/**
 * Level Up Modal - Celebration when reaching a new level
 *
 * Mode-specific display:
 * - Cosmic: Full celebration with particles, animations, and dramatic reveal
 * - Professional: Clean notification with progress indicator
 * - Minimal: Simple toast-style notification (or skip entirely)
 */
export default function LevelUpModal({ isOpen, onClose, data }) {
  // Get gamification mode
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Trigger level up feedback when modal opens
  useEffect(() => {
    if (isOpen && data) {
      feedback.levelUp();
    }
  }, [isOpen, data]);

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

  // Render Cosmic Mode (Full celebration)
  const renderCosmicModal = () => (
    <div
      className="bg-[#12101a] rounded-2xl border-2 p-8 max-w-md w-full pointer-events-auto relative overflow-hidden"
      style={getModalStyle()}
    >
      {/* Animated background particles */}
      {visibility.showParticleEffects && (
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

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-20"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Title with dramatic animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', damping: 10 }}
        >
          <h2
            className="text-4xl font-bold text-transparent bg-clip-text mb-2"
            style={{ backgroundImage: getGradientStyle() }}
          >
            {terms.levelUp.toUpperCase()}
          </h2>
        </motion.div>

        {/* Level Badge with dramatic reveal */}
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring', damping: 12 }}
          className="my-8 flex items-center justify-center gap-4"
        >
          {/* Old Level */}
          <div className="w-20 h-20 rounded-full bg-[#221e2e] flex items-center justify-center border-2 border-gray-600">
            <span className="text-white/60 font-bold text-2xl">{oldLevel}</span>
          </div>

          {/* Arrow */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-purple-400 text-3xl"
          >
            →
          </motion.div>

          {/* New Level with glow */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: 'spring', damping: 10 }}
            className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg animate-achievement-gold"
            style={{ background: getGradientStyle() }}
          >
            <span className="text-white font-bold text-3xl">{newLevel}</span>
          </motion.div>
        </motion.div>

        {/* Stage Transition (Evolution) */}
        {stageTransition && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-6 bg-purple-500/20 border border-purple-500/30 rounded-lg p-4"
          >
            <p className="text-purple-400 font-semibold mb-1">🌟 {terms.evolution}!</p>
            <p className="text-white text-lg">
              {terms.stage} {oldStage} → {terms.stage} {newStage}
            </p>
            <p className="text-white/60 text-sm mt-1">Your avatar has evolved!</p>
          </motion.div>
        )}

        {/* Unlocks */}
        {unlocksAvailable && unlocksAvailable.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4"
          >
            <p className="text-amber-400 font-semibold mb-2">🎁 New Unlocks Available!</p>
            <ul className="text-sm text-gray-300 space-y-1">
              {unlocksAvailable.map((unlock, i) => (
                <li key={i}>• {unlock}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          onClick={onClose}
          className={`mt-6 px-8 py-3 ${getButtonStyle()} text-white font-semibold rounded-lg transition-all shadow-lg`}
        >
          Continue Journey
        </motion.button>
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
