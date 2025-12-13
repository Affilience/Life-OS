/**
 * Habits Module Setup
 * Select habits to track and build streaks
 */

import React, { useState } from 'react';
import FirstRunSetup, {
  SetupStep,
  SetupChipSelect
} from './FirstRunSetup';

const HABIT_CATEGORIES = {
  health: [
    { id: 'exercise', icon: '🏃', label: 'Exercise' },
    { id: 'hydration', icon: '💧', label: 'Drink Water' },
    { id: 'sleep', icon: '😴', label: '8hr Sleep' },
    { id: 'meditation', icon: '🧘', label: 'Meditate' },
    { id: 'no-junk', icon: '🥗', label: 'No Junk Food' },
    { id: 'vitamins', icon: '💊', label: 'Take Vitamins' }
  ],
  productivity: [
    { id: 'deep-work', icon: '🎯', label: 'Deep Work' },
    { id: 'no-social', icon: '📵', label: 'No Social Media' },
    { id: 'inbox-zero', icon: '📧', label: 'Inbox Zero' },
    { id: 'plan-day', icon: '📋', label: 'Plan Tomorrow' },
    { id: 'learn', icon: '📚', label: 'Learn Something' },
    { id: 'journal', icon: '📝', label: 'Journal' }
  ],
  lifestyle: [
    { id: 'read', icon: '📖', label: 'Read 30min' },
    { id: 'gratitude', icon: '🙏', label: 'Gratitude' },
    { id: 'outdoors', icon: '🌳', label: 'Go Outside' },
    { id: 'clean', icon: '🧹', label: 'Tidy Up' },
    { id: 'budget', icon: '💰', label: 'Track Spending' },
    { id: 'connect', icon: '👋', label: 'Connect w/ Someone' }
  ]
};

const ALL_HABITS = [
  ...HABIT_CATEGORIES.health,
  ...HABIT_CATEGORIES.productivity,
  ...HABIT_CATEGORIES.lifestyle
];

const REMINDER_TIMES = [
  { id: 'morning', icon: '🌅', label: 'Morning (8am)' },
  { id: 'midday', icon: '☀️', label: 'Midday (12pm)' },
  { id: 'evening', icon: '🌆', label: 'Evening (6pm)' },
  { id: 'night', icon: '🌙', label: 'Night (9pm)' },
  { id: 'none', icon: '🔕', label: 'No Reminders' }
];

export default function HabitsSetup({ onComplete, onSkip }) {
  const [localData, setLocalData] = useState({
    selectedHabits: ['exercise', 'hydration', 'deep-work', 'read'],
    reminderTime: 'morning'
  });

  const handleComplete = (data) => {
    // In a full implementation, save to habits/quests store
    onComplete?.(localData);
  };

  return (
    <FirstRunSetup
      moduleId="habits"
      onComplete={handleComplete}
      onSkip={onSkip}
    >
      {/* Step 1: Select Habits */}
      <SetupStep
        title="Which habits do you want to build?"
        description="Start with 3-5 habits. You can add more later."
      >
        {({ onNext }) => (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <h5 style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Health & Wellness
              </h5>
              <SetupChipSelect
                options={HABIT_CATEGORIES.health}
                selected={localData.selectedHabits}
                onChange={(selected) => setLocalData({ ...localData, selectedHabits: selected })}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h5 style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Productivity
              </h5>
              <SetupChipSelect
                options={HABIT_CATEGORIES.productivity}
                selected={localData.selectedHabits}
                onChange={(selected) => setLocalData({ ...localData, selectedHabits: selected })}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h5 style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Lifestyle
              </h5>
              <SetupChipSelect
                options={HABIT_CATEGORIES.lifestyle}
                selected={localData.selectedHabits}
                onChange={(selected) => setLocalData({ ...localData, selectedHabits: selected })}
              />
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>
              {localData.selectedHabits.length} habits selected
            </p>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="setup-nav-btn primary"
                onClick={() => onNext(localData)}
                disabled={localData.selectedHabits.length === 0}
              >
                Continue →
              </button>
            </div>
          </>
        )}
      </SetupStep>

      {/* Step 2: Reminder Time */}
      <SetupStep
        title="When should we remind you?"
        description="A daily reminder to check off your habits"
        nextLabel="Finish Setup"
      >
        {({ onNext }) => (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {REMINDER_TIMES.map((time) => (
                <button
                  key={time.id}
                  className={`setup-option-card ${localData.reminderTime === time.id ? 'selected' : ''}`}
                  onClick={() => setLocalData({ ...localData, reminderTime: time.id })}
                  style={{ padding: '0.75rem 1rem' }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{time.icon}</span>
                  <span style={{ fontWeight: 500 }}>{time.label}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
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
