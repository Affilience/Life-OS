/**
 * Calendar & Time Module Setup
 * Collects work hours, time preferences, and scheduling style
 */

import React, { useState } from 'react';
import FirstRunSetup, {
  SetupStep,
  SetupOptionCard,
  SetupNumberInput,
  SetupChipSelect
} from './FirstRunSetup';

const WORK_SCHEDULES = [
  { id: '9-5', icon: '🏢', label: 'Traditional 9-5', description: 'Standard office hours' },
  { id: 'flexible', icon: '🌊', label: 'Flexible Hours', description: 'Work when it suits you' },
  { id: 'early-bird', icon: '🌅', label: 'Early Bird', description: 'Start early, finish early' },
  { id: 'night-owl', icon: '🦉', label: 'Night Owl', description: 'Start late, work late' },
  { id: 'split', icon: '⚡', label: 'Split Schedule', description: 'Multiple work blocks' }
];

const PLANNING_STYLES = [
  { id: 'detailed', icon: '📋', label: 'Detailed Planner', description: 'Every hour scheduled' },
  { id: 'balanced', icon: '⚖️', label: 'Balanced', description: 'Key blocks + flexibility' },
  { id: 'minimal', icon: '🎯', label: 'Minimal', description: 'Only major commitments' }
];

const WEEKEND_WORK = [
  { id: 'never', icon: '🏖️', label: 'Never', description: 'Weekends are sacred' },
  { id: 'sometimes', icon: '🌤️', label: 'Sometimes', description: 'When needed' },
  { id: 'often', icon: '💪', label: 'Often', description: 'Hustle mode' }
];

const BUFFER_TIME = [
  { value: 0, label: 'None' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' }
];

export default function CalendarSetup({ onComplete, onSkip }) {
  const [localData, setLocalData] = useState({
    workSchedule: '9-5',
    planningStyle: 'balanced',
    weekendWork: 'sometimes',
    bufferTime: 10
  });

  const handleComplete = (data) => {
    localStorage.setItem('lifeos-calendar-preferences', JSON.stringify(localData));
    onComplete?.(localData);
  };

  return (
    <FirstRunSetup
      moduleId="calendar"
      onComplete={handleComplete}
      onSkip={onSkip}
    >
      {/* Step 1: Work Schedule */}
      <SetupStep
        title="What's your typical work schedule?"
        description="Helps us suggest optimal time blocks"
      >
        {({ onNext }) => (
          <>
            {WORK_SCHEDULES.map((schedule) => (
              <SetupOptionCard
                key={schedule.id}
                icon={schedule.icon}
                label={schedule.label}
                description={schedule.description}
                selected={localData.workSchedule === schedule.id}
                onClick={() => setLocalData({ ...localData, workSchedule: schedule.id })}
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

      {/* Step 2: Planning Style */}
      <SetupStep
        title="How detailed do you like to plan?"
        description="We'll match your calendar view to your style"
      >
        {({ onNext }) => (
          <>
            {PLANNING_STYLES.map((style) => (
              <SetupOptionCard
                key={style.id}
                icon={style.icon}
                label={style.label}
                description={style.description}
                selected={localData.planningStyle === style.id}
                onClick={() => setLocalData({ ...localData, planningStyle: style.id })}
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

      {/* Step 3: Weekend Work */}
      <SetupStep
        title="Do you work on weekends?"
        description="We'll adjust your weekly view accordingly"
      >
        {({ onNext }) => (
          <>
            {WEEKEND_WORK.map((option) => (
              <SetupOptionCard
                key={option.id}
                icon={option.icon}
                label={option.label}
                description={option.description}
                selected={localData.weekendWork === option.id}
                onClick={() => setLocalData({ ...localData, weekendWork: option.id })}
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

      {/* Step 4: Buffer Time */}
      <SetupStep
        title="Buffer time between events"
        description="Breathing room between scheduled blocks"
        nextLabel="Finish Setup"
      >
        {({ onNext }) => (
          <>
            <SetupNumberInput
              value={localData.bufferTime}
              onChange={(val) => setLocalData({ ...localData, bufferTime: val })}
              min={0}
              max={60}
              step={5}
              unit="minutes"
              presets={BUFFER_TIME}
            />
            <p style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)', marginTop: '0.5rem' }}>
              We'll automatically add this buffer when scheduling back-to-back events
            </p>
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
