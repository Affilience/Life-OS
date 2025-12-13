/**
 * Text Input Question Component
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, SkipForward } from 'lucide-react';

export default function TextInputQuestion({ question, value, onAnswer }) {
  const [inputValue, setInputValue] = useState(value || '');

  const handleContinue = () => {
    onAnswer(inputValue.trim());
  };

  const handleSkip = () => {
    onAnswer('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (inputValue.trim() || question.optional)) {
      handleContinue();
    }
  };

  return (
    <div className="question text-input-question">
      <h3 className="question-title">{question.title}</h3>
      {question.novaSays && (
        <p className="question-hint">{question.novaSays}</p>
      )}

      <div className="text-input-wrapper">
        <input
          type="text"
          className="text-input"
          placeholder={question.placeholder || 'Type here...'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          autoFocus
        />
      </div>

      <div className="question-actions">
        {question.optional && (
          <button className="skip-link" onClick={handleSkip}>
            <SkipForward size={14} />
            <span>Skip</span>
          </button>
        )}

        <motion.div
          className="question-action"
          animate={{ opacity: inputValue.trim() || question.optional ? 1 : 0.5 }}
        >
          <button
            className="onboarding-btn primary"
            onClick={handleContinue}
            disabled={!inputValue.trim() && !question.optional}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
