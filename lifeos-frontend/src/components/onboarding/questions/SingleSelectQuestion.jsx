/**
 * Single Select Question Component
 *
 * Displays a question with mutually exclusive options.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function SingleSelectQuestion({ question, value, onAnswer }) {
  const [selected, setSelected] = useState(value || question.default || null);

  const handleSelect = (optionId) => {
    setSelected(optionId);
  };

  const handleContinue = () => {
    if (selected) {
      onAnswer(selected);
    }
  };

  return (
    <div className="question single-select-question">
      <h3 className="question-title">{question.title}</h3>
      {question.novaSays && (
        <p className="question-hint">{question.novaSays}</p>
      )}

      <div className="options-grid">
        {question.options.map((option, index) => (
          <motion.button
            key={option.id}
            className={`option-card ${selected === option.id ? 'selected' : ''}`}
            onClick={() => handleSelect(option.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {option.icon && <span className="option-icon">{option.icon}</span>}
            <div className="option-content">
              <span className="option-label">{option.label}</span>
              {option.description && (
                <span className="option-description">{option.description}</span>
              )}
            </div>
            {selected === option.id && (
              <motion.div
                className="option-check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <motion.div
        className="question-action"
        animate={{ opacity: selected ? 1 : 0.5 }}
      >
        <button
          className="onboarding-btn primary"
          onClick={handleContinue}
          disabled={!selected}
        >
          <span>Continue</span>
          <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}
