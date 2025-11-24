import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Level Up Modal - Celebration when reaching a new level
 *
 * Shows level up animation, new stats, and unlocks
 */
export default function LevelUpModal({ isOpen, onClose, data }) {
  if (!data) return null;

  const {
    newLevel,
    oldLevel,
    stageTransition,
    newStage,
    oldStage,
    unlocksAvailable,
  } = data;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-gray-900 rounded-2xl border-2 border-cyan-500/50 p-8 max-w-md w-full pointer-events-auto relative overflow-hidden">
              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
                    animate={{
                      x: [
                        Math.random() * 400 - 200,
                        Math.random() * 400 - 200,
                      ],
                      y: [
                        Math.random() * 600 - 300,
                        Math.random() * 600 - 300,
                      ],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                  />
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Title */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                >
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                    LEVEL UP!
                  </h2>
                </motion.div>

                {/* Level Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: 'spring', damping: 12 }}
                  className="my-8 flex items-center justify-center gap-4"
                >
                  {/* Old Level */}
                  <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                    <span className="text-gray-400 font-bold text-2xl">
                      {oldLevel}
                    </span>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-cyan-400 text-3xl"
                  >
                    →
                  </motion.div>

                  {/* New Level */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring', damping: 10 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border-2 border-white/30 shadow-lg shadow-cyan-500/50"
                  >
                    <span className="text-white font-bold text-3xl">
                      {newLevel}
                    </span>
                  </motion.div>
                </motion.div>

                {/* Stage Transition */}
                {stageTransition && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="mb-6 bg-purple-500/20 border border-purple-500/30 rounded-lg p-4"
                  >
                    <p className="text-purple-400 font-semibold mb-1">
                      🌟 Cosmic Evolution!
                    </p>
                    <p className="text-white text-lg">
                      Stage {oldStage} → Stage {newStage}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Your avatar has evolved!
                    </p>
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
                    <p className="text-amber-400 font-semibold mb-2">
                      🎁 New Unlocks Available!
                    </p>
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
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
                >
                  Continue Journey
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
