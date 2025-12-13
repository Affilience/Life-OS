/**
 * First Run Setup - Wrapper for module setup wizards
 *
 * Shows an inline setup wizard when a module hasn't been configured yet.
 * Guides users through initial configuration within the actual module page.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, X, Sparkles } from 'lucide-react';
import useIntegratedOnboardingStore, { MODULE_SETUP } from '../../../stores/integratedOnboardingStore';
import './FirstRunSetup.css';

export default function FirstRunSetup({
  moduleId,
  children, // Setup steps as children
  onComplete,
  onSkip
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({});

  const {
    isModuleComplete,
    markModuleComplete,
    updateSetupData,
    isOnboardingComplete,
    hasSeenWelcome
  } = useIntegratedOnboardingStore();

  const moduleConfig = MODULE_SETUP[moduleId];
  const steps = React.Children.toArray(children);
  const totalSteps = steps.length;

  // Don't show if module already complete or onboarding skipped
  if (isModuleComplete(moduleId) || isOnboardingComplete || !hasSeenWelcome) {
    return null;
  }

  const handleNext = (data = {}) => {
    const newStepData = { ...stepData, ...data };
    setStepData(newStepData);

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete setup
      updateSetupData(moduleId, newStepData);
      markModuleComplete(moduleId);
      onComplete?.(newStepData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    markModuleComplete(moduleId);
    onSkip?.();
  };

  // Clone children with props
  const currentStepElement = React.cloneElement(steps[currentStep], {
    onNext: handleNext,
    onBack: handleBack,
    stepData,
    setStepData: (data) => setStepData({ ...stepData, ...data })
  });

  return (
    <motion.div
      className="first-run-setup"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="setup-header">
        <div className="setup-header-left">
          <div className="setup-icon">
            <Sparkles size={20} />
          </div>
          <div className="setup-title">
            <h3>Quick Setup</h3>
            <p>Let's configure your {moduleConfig?.name || 'module'}</p>
          </div>
        </div>
        <button className="setup-skip" onClick={handleSkip}>
          Skip for now
        </button>
      </div>

      {/* Progress */}
      <div className="setup-progress">
        <div className="setup-progress-bar">
          <div
            className="setup-progress-fill"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <span className="setup-progress-text">
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>

      {/* Content */}
      <div className="setup-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStepElement}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="setup-navigation">
        {currentStep > 0 && (
          <button className="setup-nav-btn secondary" onClick={handleBack}>
            <ChevronLeft size={18} />
            Back
          </button>
        )}
        <div className="setup-nav-spacer" />
      </div>
    </motion.div>
  );
}

/**
 * Setup Step - Individual step within setup wizard
 */
export function SetupStep({
  title,
  description,
  children,
  onNext,
  onBack,
  stepData,
  setStepData,
  isValid = true,
  nextLabel = 'Continue'
}) {
  const isRenderProp = typeof children === 'function';

  return (
    <div className="setup-step">
      <div className="setup-step-header">
        <h4>{title}</h4>
        {description && <p>{description}</p>}
      </div>

      <div className="setup-step-content">
        {isRenderProp
          ? children({ stepData, setStepData, onNext })
          : children}
      </div>

      {/* Only show default button if children is not a render prop (render props handle their own buttons) */}
      {!isRenderProp && (
        <div className="setup-step-actions">
          <button
            className="setup-nav-btn primary"
            onClick={() => onNext?.()}
            disabled={!isValid}
          >
            {nextLabel}
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Option Card - Selectable option within setup
 */
export function SetupOptionCard({
  icon,
  label,
  description,
  selected,
  onClick
}) {
  return (
    <button
      type="button"
      className={`setup-option-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {icon && <span className="option-icon">{icon}</span>}
      <div className="option-content">
        <span className="option-label">{label}</span>
        {description && <span className="option-desc">{description}</span>}
      </div>
      {selected && (
        <div className="option-check">
          <Check size={16} />
        </div>
      )}
    </button>
  );
}

/**
 * Number Input - For numeric values in setup
 */
export function SetupNumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  presets
}) {
  return (
    <div className="setup-number-input">
      {label && <label>{label}</label>}
      <div className="number-input-row">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
        />
        {unit && <span className="number-unit">{unit}</span>}
      </div>
      {presets && presets.length > 0 && (
        <div className="number-presets">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`preset-btn ${value === preset.value ? 'active' : ''}`}
              onClick={() => onChange(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Chip Select - Multi-select chips
 */
export function SetupChipSelect({
  label,
  options,
  selected = [],
  onChange,
  maxSelect
}) {
  const toggleOption = (optionId) => {
    if (!onChange) return;
    if (selected.includes(optionId)) {
      onChange(selected.filter(id => id !== optionId));
    } else if (!maxSelect || selected.length < maxSelect) {
      onChange([...selected, optionId]);
    }
  };

  return (
    <div className="setup-chip-select">
      {label && <label>{label}</label>}
      <div className="chip-options">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`chip-option ${selected.includes(option.id) ? 'selected' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleOption(option.id);
            }}
          >
            {option.icon && <span className="chip-icon">{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      {maxSelect && (
        <span className="chip-hint">
          Select up to {maxSelect} ({selected.length}/{maxSelect})
        </span>
      )}
    </div>
  );
}
