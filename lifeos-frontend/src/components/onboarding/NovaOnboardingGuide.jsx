import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNewOnboardingStore, NOVA_STATES, NOVA_DIALOGUES } from '../../stores/newOnboardingStore';

/**
 * NovaOnboardingGuide - Persistent Nova component during onboarding
 * Shows Nova with dialogue bubbles, typewriter effect
 */
export default function NovaOnboardingGuide() {
  const {
    currentStep,
    novaState,
    novaDialogueIndex,
    profile,
    advanceDialogue,
    isDialogueComplete,
    getCurrentDialogue,
  } = useNewOnboardingStore();

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  const currentDialogue = getCurrentDialogue();
  const novaImage = NOVA_STATES[novaState] || NOVA_STATES.neutral;

  // Typewriter effect
  useEffect(() => {
    if (!currentDialogue) {
      setDisplayedText('');
      setShowContinue(false);
      return;
    }

    setIsTyping(true);
    setShowContinue(false);
    setDisplayedText('');

    let index = 0;
    const text = currentDialogue;

    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setShowContinue(true);
      }
    }, 30); // Typing speed

    return () => clearInterval(typeInterval);
  }, [currentDialogue, novaDialogueIndex]);

  // Handle click to advance or skip typing
  const handleClick = () => {
    if (isTyping) {
      // Skip to end of current text
      setDisplayedText(currentDialogue);
      setIsTyping(false);
      setShowContinue(true);
    } else if (showContinue && !isDialogueComplete()) {
      // Advance to next dialogue
      advanceDialogue();
    }
  };

  // Don't show if no dialogue
  if (!currentDialogue && isDialogueComplete()) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-4 left-4 right-4 sm:left-8 sm:right-auto sm:bottom-8 z-50"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div
        className="flex items-end gap-4 cursor-pointer"
        onClick={handleClick}
      >
        {/* Nova Avatar */}
        <motion.div
          className="relative flex-shrink-0"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl" />

          {/* Nova image */}
          <motion.img
            src={novaImage}
            alt="Nova"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain relative z-10"
            style={{ imageRendering: 'pixelated' }}
            animate={{ scale: novaState === 'celebrating' ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: novaState === 'celebrating' ? Infinity : 0 }}
          />

          {/* State indicator */}
          {novaState === 'thinking' && (
            <motion.div
              className="absolute -top-2 -right-2 text-xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >

            </motion.div>
          )}
        </motion.div>

        {/* Dialogue bubble */}
        <AnimatePresence mode="wait">
          {displayedText && (
            <motion.div
              key={novaDialogueIndex}
              initial={{ opacity: 0, scale: 0.9, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -10 }}
              className="relative max-w-md sm:max-w-lg"
            >
              {/* Bubble arrow */}
              <div className="absolute left-0 bottom-4 w-0 h-0 border-t-8 border-r-8 border-b-8 border-transparent border-r-[#1a1724] -translate-x-2" />

              {/* Bubble content */}
              <div className="bg-[#1a1724] border border-purple-500/30 rounded-2xl rounded-bl-md px-5 py-4 shadow-lg shadow-purple-500/10">
                <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                  {displayedText}
                  {isTyping && (
                    <motion.span
                      className="inline-block w-2 h-4 bg-purple-400 ml-1"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </p>

                {/* Continue indicator */}
                {showContinue && !isDialogueComplete() && (
                  <motion.div
                    className="flex items-center gap-1 mt-2 text-purple-400 text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span>Click to continue</span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >

                    </motion.span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
