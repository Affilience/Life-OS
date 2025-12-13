/**
 * Slider Question Component
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function SliderQuestion({ question, value, onAnswer }) {
  const [sliderValue, setSliderValue] = useState(value || question.default || question.min);

  const handleContinue = () => {
    onAnswer(sliderValue);
  };

  return (
    <div className="question slider-question">
      <h3 className="question-title">{question.title}</h3>
      {question.novaSays && (
        <p className="question-hint">{question.novaSays}</p>
      )}

      <div className="slider-wrapper">
        <div className="slider-value-display">
          <span className="slider-value">{sliderValue}</span>
          <span className="slider-unit">{question.unit}</span>
        </div>

        <input
          type="range"
          className="slider-input"
          min={question.min}
          max={question.max}
          step={question.step || 1}
          value={sliderValue}
          onChange={(e) => setSliderValue(parseInt(e.target.value))}
        />

        <div className="slider-labels">
          <span>{question.min} {question.unit}</span>
          <span>{question.max}+ {question.unit}</span>
        </div>
      </div>

      <motion.div className="question-action">
        <button
          className="onboarding-btn primary"
          onClick={handleContinue}
        >
          <span>Continue</span>
          <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}
