import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/**
 * SkipButton - Persistent skip option for onboarding steps
 *
 * Features:
 * - Subtle but always accessible
 * - Confirms before skipping entire onboarding
 * - Different modes: skip step vs skip all
 */
export default function SkipButton({
  onSkip,
  onSkipAll,
  canSkip = true,
  variant = 'step', // 'step' | 'all'
  className = ''
}) {
  const [showConfirm, setShowConfirm] = React.useState(false);

  if (!canSkip) return null;

  const handleSkipAll = () => {
    if (showConfirm) {
      onSkipAll?.();
    } else {
      setShowConfirm(true);
      // Auto-hide confirm after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  if (variant === 'all') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className={`fixed bottom-6 right-6 z-50 ${className}`}
      >
        {showConfirm ? (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleSkipAll}
            className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
          >
            Click again to skip setup
          </motion.button>
        ) : (
          <button
            onClick={handleSkipAll}
            className="flex items-center gap-1 text-white/30 hover:text-white/50 text-sm transition-colors group"
          >
            <span>Skip to App</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </motion.div>
    );
  }

  // Step skip variant
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      onClick={onSkip}
      className={`text-white/40 hover:text-white/60 text-sm transition-colors ${className}`}
    >
      Skip this step
    </motion.button>
  );
}
