/**
 * Productivity Module Setup
 * Collects work preferences, focus areas, and productivity style
 */

import React, { useState } from 'react';
import FirstRunSetup, {
  SetupStep,
  SetupOptionCard,
  SetupNumberInput,
  SetupChipSelect
} from './FirstRunSetup';

const WORK_STYLES = [
  { id: 'deep-work', icon: '🎯', label: 'Deep Work Focus', description: 'Long uninterrupted sessions' },
  { id: 'pomodoro', icon: '🍅', label: 'Pomodoro Style', description: '25 min work, 5 min breaks' },
  { id: 'flexible', icon: '🌊', label: 'Flexible Flow', description: 'Adapt based on energy' },
  { id: 'time-blocks', icon: '📅', label: 'Time Blocking', description: 'Scheduled blocks for tasks' }
];

const FOCUS_AREAS = [
  { id: 'career', icon: '💼', label: 'Career Growth' },
  { id: 'business', icon: '🚀', label: 'Business/Side Project' },
  { id: 'learning', icon: '📚', label: 'Learning & Skills' },
  { id: 'creative', icon: '🎨', label: 'Creative Projects' },
  { id: 'fitness', icon: '💪', label: 'Fitness Goals' },
  { id: 'relationships', icon: '❤️', label: 'Relationships' },
  { id: 'finance', icon: '💰', label: 'Financial Goals' },
  { id: 'health', icon: '🏥', label: 'Health & Wellness' }
];

const DAILY_GOALS = [
  { value: 2, label: '2 hrs' },
  { value: 4, label: '4 hrs' },
  { value: 6, label: '6 hrs' },
  { value: 8, label: '8 hrs' },
  { value: 10, label: '10 hrs' }
];

const PEAK_HOURS = [
  { id: 'early-morning', icon: '🌅', label: 'Early Morning', description: '5 AM - 9 AM' },
  { id: 'morning', icon: '☀️', label: 'Morning', description: '9 AM - 12 PM' },
  { id: 'afternoon', icon: '🌤️', label: 'Afternoon', description: '12 PM - 5 PM' },
  { id: 'evening', icon: '🌆', label: 'Evening', description: '5 PM - 9 PM' },
  { id: 'night', icon: '🌙', label: 'Night Owl', description: '9 PM - 1 AM' }
];

export default function ProductivitySetup({ onComplete, onSkip }) {
  const [localData, setLocalData] = useState({
    workStyle: 'deep-work',
    focusAreas: ['career', 'learning'],
    dailyProductiveHours: 6,
    peakHours: 'morning'
  });

  const handleComplete = (data) => {
    localStorage.setItem('lifeos-productivity-preferences', JSON.stringify(localData));
    onComplete?.(localData);
  };

  return (
    <FirstRunSetup
      moduleId="productivity"
      onComplete={handleComplete}
      onSkip={onSkip}
    >
      {/* Step 1: Work Style */}
      <SetupStep
        title="What's your preferred work style?"
        description="We'll optimize your experience around this"
      >
        {({ onNext }) => (
          <>
            {WORK_STYLES.map((style) => (
              <SetupOptionCard
                key={style.id}
                icon={style.icon}
                label={style.label}
                description={style.description}
                selected={localData.workStyle === style.id}
                onClick={() => setLocalData({ ...localData, workStyle: style.id })}
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

      {/* Step 2: Focus Areas */}
      <SetupStep
        title="What are your main focus areas?"
        description="Select all that apply to your current priorities"
      >
        {({ onNext }) => (
          <>
            <SetupChipSelect
              options={FOCUS_AREAS}
              selected={localData.focusAreas}
              onChange={(selected) => setLocalData({ ...localData, focusAreas: selected })}
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

      {/* Step 3: Daily Productive Hours */}
      <SetupStep
        title="Daily productive hours goal"
        description="How many hours of focused work do you aim for?"
      >
        {({ onNext }) => (
          <>
            <SetupNumberInput
              value={localData.dailyProductiveHours}
              onChange={(val) => setLocalData({ ...localData, dailyProductiveHours: val })}
              min={1}
              max={16}
              step={1}
              unit="hours/day"
              presets={DAILY_GOALS}
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

      {/* Step 4: Peak Hours */}
      <SetupStep
        title="When are you most productive?"
        description="We'll suggest scheduling important work during this time"
        nextLabel="Finish Setup"
      >
        {({ onNext }) => (
          <>
            {PEAK_HOURS.map((time) => (
              <SetupOptionCard
                key={time.id}
                icon={time.icon}
                label={time.label}
                description={time.description}
                selected={localData.peakHours === time.id}
                onClick={() => setLocalData({ ...localData, peakHours: time.id })}
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
