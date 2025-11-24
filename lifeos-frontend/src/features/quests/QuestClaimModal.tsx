/**
 * QuestClaimModal Component
 * Modal for claiming XP with particle effects
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quest } from './QuestTypes';
import { Sparkles } from 'lucide-react';
import { haptics } from '../../utils/haptics';

interface QuestClaimModalProps {
  quest: Quest | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (xp: number) => void;
}

export function QuestClaimModal({ quest, open, onClose, onConfirm }: QuestClaimModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const handleClaim = async () => {
    if (!quest) return;

    // Epic haptic feedback for claiming XP
    await haptics.success();
    await haptics.heavy();

    onConfirm(quest.xp);
    onClose();
  };

  if (!quest) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-[#12101a] border border-white/10 rounded-xl shadow-2xl max-w-md w-full overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-violet-600/20 to-purple-600/20 p-6 border-b border-white/10">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center"
                >
                  <Sparkles size={32} className="text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-center text-white mb-2">
                  Quest Complete!
                </h2>
                <p className="text-center text-white/60 text-sm">
                  {quest.title}
                </p>
              </div>

              {/* XP Display */}
              <div className="p-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-full">
                    <Sparkles size={20} className="text-violet-400" />
                    <span className="text-3xl font-bold text-white">
                      +{quest.xp}
                    </span>
                    <span className="text-lg text-violet-400">XP</span>
                  </div>
                </motion.div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-[#1a1724] hover:bg-[#221e2e] text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClaim}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-violet-500/30"
                  >
                    Claim XP
                  </button>
                </div>
              </div>

              {/* Particles */}
              <XPParticles />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Animated XP particles
 */
function XPParticles() {
  const particles = Array.from({ length: 12 });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-violet-400 rounded-full"
          initial={{
            x: '50%',
            y: '50%',
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: `${50 + (Math.cos((i / particles.length) * Math.PI * 2) * 100)}%`,
            y: `${50 + (Math.sin((i / particles.length) * Math.PI * 2) * 100)}%`,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.05,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      ))}
    </div>
  );
}
