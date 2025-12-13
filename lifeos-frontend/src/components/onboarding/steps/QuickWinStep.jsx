/**
 * Quick Win Step - First Action
 *
 * Gets users to take their first meaningful action, creating immediate value.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { getQuickWinConfig } from '../../../services/onboarding/novaDialogue';
import useOnboardingStore from '../../../stores/onboardingStore';

export default function QuickWinStep({ primaryGoal, onComplete }) {
  const [input, setInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const setNovaState = useOnboardingStore(state => state.setNovaState);

  const config = getQuickWinConfig(primaryGoal);

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleSubmit = () => {
    if (input.trim()) {
      setIsCompleted(true);
      setNovaState('proud', config.successMessage);

      // Delay to show celebration before continuing
      setTimeout(() => {
        onComplete({
          type: primaryGoal || 'general',
          value: input.trim(),
          createdAt: new Date().toISOString()
        });
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      handleSubmit();
    }
  };

  return (
    <div className="quick-win-step">
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="quick-win-input-section"
          >
            <motion.div
              className="step-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="step-title">Your First Step</h2>
              <p className="step-subtitle">{config.prompt}</p>
            </motion.div>

            {/* Input field */}
            <motion.div
              className="quick-win-input-wrapper"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <input
                type="text"
                className="quick-win-input"
                placeholder="Type something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
              />
            </motion.div>

            {/* Suggestions */}
            <motion.div
              className="suggestions-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="suggestions-label">Or pick one:</p>
              <div className="suggestions-grid">
                {config.suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    className={`suggestion-chip ${input === suggestion ? 'selected' : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Continue button */}
            <motion.div
              className="step-action"
              initial={{ opacity: 0 }}
              animate={{ opacity: input.trim() ? 1 : 0.5 }}
              transition={{ delay: 0.6 }}
            >
              <button
                className="onboarding-btn primary"
                onClick={handleSubmit}
                disabled={!input.trim()}
              >
                <span>Log This</span>
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="quick-win-celebration"
          >
            {/* Celebration animation */}
            <motion.div
              className="celebration-icon"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.5 }}
            >
              <div className="celebration-circle">
                <Check size={48} />
              </div>
              <motion.div
                className="celebration-sparkles"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: 2 }}
              >
                <Sparkles className="sparkle sparkle-1" />
                <Sparkles className="sparkle sparkle-2" />
                <Sparkles className="sparkle sparkle-3" />
              </motion.div>
            </motion.div>

            <motion.h2
              className="celebration-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              First Step Complete!
            </motion.h2>

            <motion.p
              className="celebration-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {config.successMessage}
            </motion.p>

            <motion.div
              className="logged-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <span className="logged-label">You logged:</span>
              <span className="logged-value">{input}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
