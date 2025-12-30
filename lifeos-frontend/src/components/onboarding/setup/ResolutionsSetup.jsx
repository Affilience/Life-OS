/**
 * Resolutions Module Setup
 * Collects yearly goals and resolution preferences
 */

import React, { useState } from 'react';
import FirstRunSetup, {
  SetupStep,
  SetupOptionCard,
  SetupNumberInput,
  SetupChipSelect
} from './FirstRunSetup';

const GOAL_CATEGORIES = [
  { id: 'health', icon: '💪', label: 'Health & Fitness' },
  { id: 'career', icon: '💼', label: 'Career & Work' },
  { id: 'finance', icon: '💰', label: 'Financial' },
  { id: 'learning', icon: '📚', label: 'Learning & Skills' },
  { id: 'relationships', icon: '❤️', label: 'Relationships' },
  { id: 'creative', icon: '🎨', label: 'Creative Projects' },
  { id: 'travel', icon: '✈️', label: 'Travel & Adventure' },
  { id: 'mindfulness', icon: '🧘', label: 'Mindfulness & Mental Health' }
];

const GOAL_APPROACH = [
  { id: 'ambitious', icon: '🚀', label: 'Ambitious', description: 'Dream big, aim high' },
  { id: 'realistic', icon: '🎯', label: 'Realistic', description: 'Achievable stretch goals' },
  { id: 'incremental', icon: '📈', label: 'Incremental', description: 'Small consistent improvements' },
  { id: 'transformative', icon: '🦋', label: 'Transformative', description: 'Major life changes' }
];

const REVIEW_FREQUENCY = [
  { id: 'weekly', icon: '📅', label: 'Weekly Check-in', description: 'Stay on top of progress' },
  { id: 'monthly', icon: '📆', label: 'Monthly Review', description: 'Regular assessment' },
  { id: 'quarterly', icon: '📊', label: 'Quarterly Deep Dive', description: 'Detailed progress review' }
];

const ACCOUNTABILITY = [
  { id: 'self', icon: '🪞', label: 'Self-Accountability', description: 'I hold myself accountable' },
  { id: 'partner', icon: '🤝', label: 'Accountability Partner', description: 'Share with someone' },
  { id: 'public', icon: '📢', label: 'Public Commitment', description: 'Share goals openly' },
  { id: 'app', icon: '📱', label: 'App Tracking Only', description: 'Let Ascynt track it' }
];

export default function ResolutionsSetup({ onComplete, onSkip }) {
  const [localData, setLocalData] = useState({
    goalCategories: ['health', 'career', 'learning'],
    goalApproach: 'realistic',
    numberOfGoals: 5,
    reviewFrequency: 'monthly',
    accountability: 'self'
  });

  const handleComplete = (data) => {
    localStorage.setItem('lifeos-resolutions-preferences', JSON.stringify(localData));
    onComplete?.(localData);
  };

  return (
    <FirstRunSetup
      moduleId="resolutions"
      onComplete={handleComplete}
      onSkip={onSkip}
    >
      {/* Step 1: Goal Categories */}
      <SetupStep
        title="What areas do you want to focus on this year?"
        description="Select the categories for your resolutions"
      >
        {({ onNext }) => (
          <>
            <SetupChipSelect
              options={GOAL_CATEGORIES}
              selected={localData.goalCategories}
              onChange={(selected) => setLocalData({ ...localData, goalCategories: selected })}
            />
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="setup-nav-btn primary"
                onClick={() => onNext(localData)}
              >
                Continue →
              </button>
            </div>
          </>
        )}
      </SetupStep>

      {/* Step 2: Goal Approach */}
      <SetupStep
        title="What's your goal-setting style?"
        description="How do you like to approach your resolutions?"
      >
        {({ onNext }) => (
          <>
            {GOAL_APPROACH.map((approach) => (
              <SetupOptionCard
                key={approach.id}
                icon={approach.icon}
                label={approach.label}
                description={approach.description}
                selected={localData.goalApproach === approach.id}
                onClick={() => setLocalData({ ...localData, goalApproach: approach.id })}
              />
            ))}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="setup-nav-btn primary"
                onClick={() => onNext(localData)}
              >
                Continue →
              </button>
            </div>
          </>
        )}
      </SetupStep>

      {/* Step 3: Review Frequency */}
      <SetupStep
        title="How often do you want to review progress?"
        description="Regular reviews keep you on track"
      >
        {({ onNext }) => (
          <>
            {REVIEW_FREQUENCY.map((freq) => (
              <SetupOptionCard
                key={freq.id}
                icon={freq.icon}
                label={freq.label}
                description={freq.description}
                selected={localData.reviewFrequency === freq.id}
                onClick={() => setLocalData({ ...localData, reviewFrequency: freq.id })}
              />
            ))}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="setup-nav-btn primary"
                onClick={() => onNext(localData)}
              >
                Continue →
              </button>
            </div>
          </>
        )}
      </SetupStep>

      {/* Step 4: Accountability */}
      <SetupStep
        title="How do you stay accountable?"
        description="Choose your accountability style"
        nextLabel="Finish Setup"
      >
        {({ onNext }) => (
          <>
            {ACCOUNTABILITY.map((option) => (
              <SetupOptionCard
                key={option.id}
                icon={option.icon}
                label={option.label}
                description={option.description}
                selected={localData.accountability === option.id}
                onClick={() => setLocalData({ ...localData, accountability: option.id })}
              />
            ))}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="setup-nav-btn primary"
                onClick={() => onNext(localData)}
              >
                Finish Setup ✓
              </button>
            </div>
          </>
        )}
      </SetupStep>
    </FirstRunSetup>
  );
}
