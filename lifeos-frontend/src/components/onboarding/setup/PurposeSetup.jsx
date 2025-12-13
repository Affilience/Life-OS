/**
 * Purpose & Values Module Setup
 * Collects core values, life vision, and purpose exploration
 */

import React, { useState } from 'react';
import FirstRunSetup, {
  SetupStep,
  SetupOptionCard,
  SetupChipSelect
} from './FirstRunSetup';

const LIFE_PRIORITIES = [
  { id: 'family', icon: '👨‍👩‍👧‍👦', label: 'Family & Relationships', description: 'Deep connections with loved ones' },
  { id: 'career', icon: '🚀', label: 'Career & Achievement', description: 'Professional success & growth' },
  { id: 'health', icon: '💪', label: 'Health & Vitality', description: 'Physical & mental wellbeing' },
  { id: 'freedom', icon: '🦅', label: 'Freedom & Independence', description: 'Autonomy over your life' },
  { id: 'impact', icon: '🌍', label: 'Impact & Contribution', description: 'Making a difference' },
  { id: 'growth', icon: '🌱', label: 'Personal Growth', description: 'Continuous learning & development' }
];

const CORE_VALUES = [
  { id: 'integrity', icon: '⚖️', label: 'Integrity' },
  { id: 'creativity', icon: '🎨', label: 'Creativity' },
  { id: 'courage', icon: '🦁', label: 'Courage' },
  { id: 'compassion', icon: '💝', label: 'Compassion' },
  { id: 'excellence', icon: '⭐', label: 'Excellence' },
  { id: 'wisdom', icon: '🦉', label: 'Wisdom' },
  { id: 'authenticity', icon: '💎', label: 'Authenticity' },
  { id: 'adventure', icon: '🗺️', label: 'Adventure' },
  { id: 'balance', icon: '☯️', label: 'Balance' },
  { id: 'discipline', icon: '🎯', label: 'Discipline' },
  { id: 'gratitude', icon: '🙏', label: 'Gratitude' },
  { id: 'resilience', icon: '💪', label: 'Resilience' }
];

const LIFE_STAGE = [
  { id: 'exploring', icon: '🔍', label: 'Exploring', description: 'Still figuring things out' },
  { id: 'building', icon: '🏗️', label: 'Building', description: 'Creating something meaningful' },
  { id: 'growing', icon: '📈', label: 'Growing', description: 'Expanding what I\'ve built' },
  { id: 'mastering', icon: '🎓', label: 'Mastering', description: 'Refining my craft' },
  { id: 'giving-back', icon: '🤝', label: 'Giving Back', description: 'Sharing what I\'ve learned' }
];

const REFLECTION_FREQUENCY = [
  { id: 'daily', icon: '📅', label: 'Daily', description: 'Quick daily check-in' },
  { id: 'weekly', icon: '📆', label: 'Weekly', description: 'Weekly purpose review' },
  { id: 'monthly', icon: '🗓️', label: 'Monthly', description: 'Monthly deep reflection' },
  { id: 'quarterly', icon: '📊', label: 'Quarterly', description: 'Quarterly life review' }
];

export default function PurposeSetup({ onComplete, onSkip }) {
  const [localData, setLocalData] = useState({
    topPriority: 'growth',
    coreValues: ['integrity', 'growth', 'excellence'],
    lifeStage: 'building',
    reflectionFrequency: 'weekly'
  });

  const handleComplete = (data) => {
    localStorage.setItem('lifeos-purpose-preferences', JSON.stringify(localData));
    onComplete?.(localData);
  };

  return (
    <FirstRunSetup
      moduleId="purpose"
      onComplete={handleComplete}
      onSkip={onSkip}
    >
      {/* Step 1: Top Priority */}
      <SetupStep
        title="What matters most to you right now?"
        description="Choose your top life priority"
      >
        {({ onNext }) => (
          <>
            {LIFE_PRIORITIES.map((priority) => (
              <SetupOptionCard
                key={priority.id}
                icon={priority.icon}
                label={priority.label}
                description={priority.description}
                selected={localData.topPriority === priority.id}
                onClick={() => setLocalData({ ...localData, topPriority: priority.id })}
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

      {/* Step 2: Core Values */}
      <SetupStep
        title="Select your core values"
        description="Choose 3-5 values that define who you are"
      >
        {({ onNext }) => (
          <>
            <SetupChipSelect
              options={CORE_VALUES}
              selected={localData.coreValues}
              onChange={(selected) => setLocalData({ ...localData, coreValues: selected })}
              maxSelect={5}
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

      {/* Step 3: Life Stage */}
      <SetupStep
        title="Where are you in your journey?"
        description="This helps us provide relevant guidance"
      >
        {({ onNext }) => (
          <>
            {LIFE_STAGE.map((stage) => (
              <SetupOptionCard
                key={stage.id}
                icon={stage.icon}
                label={stage.label}
                description={stage.description}
                selected={localData.lifeStage === stage.id}
                onClick={() => setLocalData({ ...localData, lifeStage: stage.id })}
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

      {/* Step 4: Reflection Frequency */}
      <SetupStep
        title="How often do you want to reflect on your purpose?"
        description="Regular reflection keeps you aligned"
        nextLabel="Finish Setup"
      >
        {({ onNext }) => (
          <>
            {REFLECTION_FREQUENCY.map((freq) => (
              <SetupOptionCard
                key={freq.id}
                icon={freq.icon}
                label={freq.label}
                description={freq.description}
                selected={localData.reflectionFrequency === freq.id}
                onClick={() => setLocalData({ ...localData, reflectionFrequency: freq.id })}
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
