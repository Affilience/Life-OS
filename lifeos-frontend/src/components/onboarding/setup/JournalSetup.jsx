/**
 * Journal Module Setup
 * Collects journaling preferences, prompts, and mood tracking settings
 */

import React, { useState } from 'react';
import FirstRunSetup, {
  SetupStep,
  SetupOptionCard,
  SetupChipSelect
} from './FirstRunSetup';

const JOURNAL_STYLES = [
  { id: 'free-form', icon: '✍️', label: 'Free Writing', description: 'Write whatever comes to mind' },
  { id: 'prompted', icon: '💡', label: 'Guided Prompts', description: 'Answer thought-provoking questions' },
  { id: 'gratitude', icon: '🙏', label: 'Gratitude Focus', description: 'Daily gratitude practice' },
  { id: 'reflection', icon: '🔍', label: 'Daily Reflection', description: 'Review and learn from each day' }
];

const JOURNAL_FREQUENCY = [
  { id: 'daily', icon: '📅', label: 'Daily', description: 'Every day, no excuses' },
  { id: 'weekdays', icon: '💼', label: 'Weekdays', description: 'Monday through Friday' },
  { id: 'few-times', icon: '🌟', label: 'Few Times a Week', description: '3-4 times per week' },
  { id: 'weekly', icon: '📆', label: 'Weekly', description: 'Once a week reflection' }
];

const JOURNAL_TIME = [
  { id: 'morning', icon: '🌅', label: 'Morning', description: 'Start the day with intention' },
  { id: 'evening', icon: '🌙', label: 'Evening', description: 'Reflect before bed' },
  { id: 'both', icon: '☀️🌙', label: 'Both', description: 'Morning intention + evening reflection' },
  { id: 'flexible', icon: '🕐', label: 'Whenever', description: 'No fixed time' }
];

const TRACKING_OPTIONS = [
  { id: 'mood', icon: '😊', label: 'Mood' },
  { id: 'energy', icon: '⚡', label: 'Energy Level' },
  { id: 'sleep', icon: '😴', label: 'Sleep Quality' },
  { id: 'stress', icon: '😰', label: 'Stress Level' },
  { id: 'productivity', icon: '📈', label: 'Productivity' },
  { id: 'gratitude', icon: '🙏', label: 'Gratitude Count' }
];

export default function JournalSetup({ onComplete, onSkip }) {
  const [localData, setLocalData] = useState({
    journalStyle: 'prompted',
    frequency: 'daily',
    preferredTime: 'evening',
    trackingOptions: ['mood', 'energy', 'gratitude']
  });

  const handleComplete = (data) => {
    localStorage.setItem('lifeos-journal-preferences', JSON.stringify(localData));
    onComplete?.(localData);
  };

  return (
    <FirstRunSetup
      moduleId="journal"
      onComplete={handleComplete}
      onSkip={onSkip}
    >
      {/* Step 1: Journal Style */}
      <SetupStep
        title="How do you like to journal?"
        description="We'll customize your experience"
      >
        {({ onNext }) => (
          <>
            {JOURNAL_STYLES.map((style) => (
              <SetupOptionCard
                key={style.id}
                icon={style.icon}
                label={style.label}
                description={style.description}
                selected={localData.journalStyle === style.id}
                onClick={() => setLocalData({ ...localData, journalStyle: style.id })}
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

      {/* Step 2: Frequency */}
      <SetupStep
        title="How often do you want to journal?"
        description="We'll send gentle reminders"
      >
        {({ onNext }) => (
          <>
            {JOURNAL_FREQUENCY.map((freq) => (
              <SetupOptionCard
                key={freq.id}
                icon={freq.icon}
                label={freq.label}
                description={freq.description}
                selected={localData.frequency === freq.id}
                onClick={() => setLocalData({ ...localData, frequency: freq.id })}
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

      {/* Step 3: Preferred Time */}
      <SetupStep
        title="When do you prefer to journal?"
        description="We'll remind you at the right time"
      >
        {({ onNext }) => (
          <>
            {JOURNAL_TIME.map((time) => (
              <SetupOptionCard
                key={time.id}
                icon={time.icon}
                label={time.label}
                description={time.description}
                selected={localData.preferredTime === time.id}
                onClick={() => setLocalData({ ...localData, preferredTime: time.id })}
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

      {/* Step 4: Tracking Options */}
      <SetupStep
        title="What do you want to track?"
        description="Quick metrics alongside your entries"
        nextLabel="Finish Setup"
      >
        {({ onNext }) => (
          <>
            <SetupChipSelect
              options={TRACKING_OPTIONS}
              selected={localData.trackingOptions}
              onChange={(selected) => setLocalData({ ...localData, trackingOptions: selected })}
            />
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
