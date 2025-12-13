/**
 * Calculated Confirm Question Component
 *
 * Shows a calculated value (like TDEE/calories) and lets user confirm or adjust.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calculator, Edit2, Check } from 'lucide-react';

export default function CalculatedConfirmQuestion({ question, value, onAnswer, allAnswers }) {
  const [calculatedValue, setCalculatedValue] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    // Calculate the value based on previous answers
    if (question.calculate && allAnswers) {
      const result = question.calculate(allAnswers);
      setCalculatedValue(result);
      setCustomValue(result?.toString() || '');
    }
  }, [question, allAnswers]);

  const handleConfirm = () => {
    const finalValue = isEditing ? parseInt(customValue) : calculatedValue;
    onAnswer(finalValue);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  if (!calculatedValue) {
    return (
      <div className="question calculated-question loading">
        <div className="calculating-animation">
          <Calculator className="spin" size={32} />
          <p>Calculating your personalized goal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="question calculated-question">
      <h3 className="question-title">{question.title}</h3>
      {question.novaSays && (
        <p className="question-hint">{question.novaSays}</p>
      )}

      <motion.div
        className="calculated-result"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        {!isEditing ? (
          <>
            <div className="result-value">
              <span className="value-number">{calculatedValue.toLocaleString()}</span>
              <span className="value-unit">{question.unit}</span>
            </div>
            <button className="edit-btn" onClick={handleEdit}>
              <Edit2 size={16} />
              <span>Adjust</span>
            </button>
          </>
        ) : (
          <div className="edit-mode">
            <input
              type="number"
              className="custom-value-input"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              autoFocus
            />
            <span className="value-unit">{question.unit}</span>
            <button className="save-edit-btn" onClick={handleSaveEdit}>
              <Check size={16} />
            </button>
          </div>
        )}
      </motion.div>

      {question.breakdown && (
        <div className="calculation-breakdown">
          <p className="breakdown-label">How this was calculated:</p>
          <ul className="breakdown-list">
            {question.breakdown.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <motion.div className="question-action">
        <button
          className="onboarding-btn primary"
          onClick={handleConfirm}
          disabled={isEditing && !customValue}
        >
          <span>{question.confirmText || 'Confirm Goal'}</span>
          <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}
