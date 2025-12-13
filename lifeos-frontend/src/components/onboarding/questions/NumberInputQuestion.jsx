/**
 * Number Input Question Component
 *
 * For numeric inputs with optional unit selection.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, SkipForward } from 'lucide-react';

export default function NumberInputQuestion({ question, value, onAnswer }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [unit, setUnit] = useState(question.unit || 'lbs');

  const handleContinue = () => {
    if (inputValue) {
      onAnswer({
        value: parseFloat(inputValue),
        unit
      });
    }
  };

  const handleSkip = () => {
    onAnswer(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue) {
      handleContinue();
    }
  };

  return (
    <div className="question number-input-question">
      <h3 className="question-title">{question.title}</h3>
      {question.novaSays && (
        <p className="question-hint">{question.novaSays}</p>
      )}

      <div className="number-input-wrapper">
        <input
          type="number"
          className="number-input"
          placeholder={question.placeholder || '0'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          autoFocus
        />

        {question.altUnit && (
          <div className="unit-toggle">
            <button
              className={`unit-btn ${unit === question.unit ? 'active' : ''}`}
              onClick={() => setUnit(question.unit)}
            >
              {question.unit}
            </button>
            <button
              className={`unit-btn ${unit === question.altUnit ? 'active' : ''}`}
              onClick={() => setUnit(question.altUnit)}
            >
              {question.altUnit}
            </button>
          </div>
        )}
      </div>

      <div className="question-actions">
        {question.optional && (
          <button
            className="skip-link"
            onClick={handleSkip}
          >
            <SkipForward size={14} />
            <span>{question.skipText || 'Skip'}</span>
          </button>
        )}

        <motion.div
          className="question-action"
          animate={{ opacity: inputValue ? 1 : 0.5 }}
        >
          <button
            className="onboarding-btn primary"
            onClick={handleContinue}
            disabled={!inputValue && !question.optional}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
