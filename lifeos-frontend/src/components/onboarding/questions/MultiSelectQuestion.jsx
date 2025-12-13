/**
 * Multi Select Question Component
 *
 * Allows selecting multiple options.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

export default function MultiSelectQuestion({ question, value, onAnswer }) {
  const [selected, setSelected] = useState(value || question.default || []);
  const maxSelect = question.maxSelect || question.options.length;

  const handleToggle = (optionId) => {
    setSelected(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else if (prev.length < maxSelect) {
        return [...prev, optionId];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      onAnswer(selected);
    }
  };

  return (
    <div className="question multi-select-question">
      <h3 className="question-title">{question.title}</h3>
      {question.novaSays && (
        <p className="question-hint">{question.novaSays}</p>
      )}
      {maxSelect < question.options.length && (
        <p className="selection-limit">Select up to {maxSelect}</p>
      )}

      <div className="options-grid multi">
        {question.options.map((option, index) => {
          const isSelected = selected.includes(option.id);
          return (
            <motion.button
              key={option.id}
              className={`option-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => handleToggle(option.id)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {option.icon && <span className="option-icon">{option.icon}</span>}
              <span className="option-label">{option.label}</span>
              {isSelected && (
                <motion.span
                  className="chip-check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check size={14} />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        className="question-action"
        animate={{ opacity: selected.length > 0 ? 1 : 0.5 }}
      >
        <button
          className="onboarding-btn primary"
          onClick={handleContinue}
          disabled={selected.length === 0}
        >
          <span>Continue</span>
          <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}
