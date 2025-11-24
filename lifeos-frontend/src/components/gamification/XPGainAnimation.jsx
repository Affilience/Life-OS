import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * XP Gain Animation - Floating +XP indicator
 *
 * Shows when XP is earned with a floating animation
 */
export default function XPGainAnimation({ amount, multiplier = 1.0, onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const displayAmount = Math.floor(amount * multiplier);
  const hasMultiplier = multiplier > 1.0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -50, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.8 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full px-6 py-3 shadow-2xl border-2 border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-2xl">
                +{displayAmount} XP
              </span>
              {hasMultiplier && (
                <span className="text-amber-300 font-semibold text-sm">
                  ({multiplier.toFixed(1)}x)
                </span>
              )}
            </div>
          </div>

          {/* Particles */}
          <motion.div
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 8) * 40,
                  y: Math.sin((i * Math.PI * 2) / 8) * 40,
                  opacity: 0,
                }}
                transition={{
                  duration: 1,
                  delay: 0.2,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Credits Gain Animation - Similar to XP but for Cosmic Credits
 */
export function CreditsGainAnimation({ amount, onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -50, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.8 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full px-6 py-3 shadow-2xl border-2 border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span className="text-white font-bold text-2xl">
                +{amount}
              </span>
            </div>
          </div>

          {/* Star particles */}
          <motion.div
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  rotate: 0,
                }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 6) * 50,
                  y: Math.sin((i * Math.PI * 2) / 6) * 50,
                  opacity: 0,
                  rotate: 360,
                }}
                transition={{
                  duration: 1.2,
                  delay: 0.1,
                  ease: 'easeOut',
                }}
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
