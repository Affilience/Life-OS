/**
 * Multi Input Question Component
 *
 * For collecting multiple text inputs (e.g., top 3 priorities).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, X, SkipForward } from 'lucide-react';

export default function MultiInputQuestion({ question, value, onAnswer }) {
  const [inputs, setInputs] = useState(value || ['']);
  const maxInputs = question.maxInputs || 5;
  const minInputs = question.minInputs || 1;

  const handleInputChange = (index, newValue) => {
    const newInputs = [...inputs];
    newInputs[index] = newValue;
    setInputs(newInputs);
  };

  const handleAddInput = () => {
    if (inputs.length < maxInputs) {
      setInputs([...inputs, '']);
    }
  };

  const handleRemoveInput = (index) => {
    if (inputs.length > minInputs) {
      const newInputs = inputs.filter((_, i) => i !== index);
      setInputs(newInputs);
    }
  };

  const handleContinue = () => {
    const filledInputs = inputs.filter(input => input.trim());
    onAnswer(filledInputs);
  };

  const handleSkip = () => {
    onAnswer([]);
  };

  const filledCount = inputs.filter(input => input.trim()).length;
  const canContinue = filledCount >= minInputs;

  return (
    <div className="question multi-input-question">
      <h3 className="question-title">{question.title}</h3>
      {question.novaSays && (
        <p className="question-hint">{question.novaSays}</p>
      )}

      <div className="multi-input-list">
        <AnimatePresence>
          {inputs.map((input, index) => (
            <motion.div
              key={index}
              className="input-row"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <span className="input-number">{index + 1}.</span>
              <input
                type="text"
                className="multi-text-input"
                placeholder={question.placeholder || `Item ${index + 1}`}
                value={input}
                onChange={(e) => handleInputChange(index, e.target.value)}
                autoFocus={index === inputs.length - 1}
              />
              {inputs.length > minInputs && (
                <button
                  className="remove-input-btn"
                  onClick={() => handleRemoveInput(index)}
                >
                  <X size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {inputs.length < maxInputs && (
        <button className="add-input-btn" onClick={handleAddInput}>
          <Plus size={16} />
          <span>Add another</span>
        </button>
      )}

      <div className="question-actions">
        {question.optional && (
          <button className="skip-link" onClick={handleSkip}>
            <SkipForward size={14} />
            <span>Skip</span>
          </button>
        )}

        <motion.div
          className="question-action"
          animate={{ opacity: canContinue ? 1 : 0.5 }}
        >
          <button
            className="onboarding-btn primary"
            onClick={handleContinue}
            disabled={!canContinue}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
