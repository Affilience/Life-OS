/**
 * Fitness & Workouts Module Setup
 * Collects workout preferences, body weight, and fitness goals
 */

import React, { useState } from 'react';
import FirstRunSetup, {
  SetupStep,
  SetupOptionCard,
  SetupNumberInput,
  SetupChipSelect
} from './FirstRunSetup';
import { useWorkoutStore } from '../../../stores/workoutStore';

const WORKOUT_FREQUENCY = [
  { id: '2', icon: '🌱', label: '2 days/week', description: 'Light routine, great for beginners' },
  { id: '3', icon: '💪', label: '3 days/week', description: 'Balanced for most people' },
  { id: '4', icon: '🔥', label: '4 days/week', description: 'Serious training' },
  { id: '5', icon: '⚡', label: '5+ days/week', description: 'Advanced athlete' }
];

const FITNESS_GOALS = [
  { id: 'strength', icon: '🏋️', label: 'Build Strength', description: 'Lift heavier weights' },
  { id: 'muscle', icon: '💪', label: 'Build Muscle', description: 'Hypertrophy & aesthetics' },
  { id: 'endurance', icon: '🏃', label: 'Improve Endurance', description: 'Better cardio & stamina' },
  { id: 'weight-loss', icon: '📉', label: 'Lose Weight', description: 'Burn fat & get lean' },
  { id: 'general', icon: '⚖️', label: 'General Fitness', description: 'Stay active & healthy' }
];

const WORKOUT_TYPES = [
  { id: 'strength', icon: '🏋️', label: 'Weight Training' },
  { id: 'cardio', icon: '🏃', label: 'Cardio' },
  { id: 'hiit', icon: '⚡', label: 'HIIT' },
  { id: 'yoga', icon: '🧘', label: 'Yoga/Flexibility' },
  { id: 'sports', icon: '⚽', label: 'Sports' },
  { id: 'swimming', icon: '🏊', label: 'Swimming' },
  { id: 'cycling', icon: '🚴', label: 'Cycling' },
  { id: 'running', icon: '👟', label: 'Running' }
];

const WEIGHT_PRESETS = [
  { value: 120, label: '120 lbs' },
  { value: 140, label: '140 lbs' },
  { value: 160, label: '160 lbs' },
  { value: 180, label: '180 lbs' },
  { value: 200, label: '200 lbs' },
  { value: 220, label: '220 lbs' }
];

export default function FitnessSetup({ onComplete, onSkip }) {
  const [localData, setLocalData] = useState({
    workoutFrequency: '3',
    fitnessGoal: 'general',
    preferredTypes: ['strength', 'cardio'],
    bodyWeight: 160 // lbs
  });

  const handleComplete = (data) => {
    // Save fitness preferences to localStorage for now
    // In the future, this could be saved to a user preferences store
    localStorage.setItem('lifeos-fitness-preferences', JSON.stringify(localData));
    onComplete?.(localData);
  };

  return (
    <FirstRunSetup
      moduleId="fitness"
      onComplete={handleComplete}
      onSkip={onSkip}
    >
      {/* Step 1: Workout Frequency */}
      <SetupStep
        title="How often do you want to work out?"
        description="We'll help you build a sustainable routine"
      >
        {({ onNext }) => (
          <>
            {WORKOUT_FREQUENCY.map((freq) => (
              <SetupOptionCard
                key={freq.id}
                icon={freq.icon}
                label={freq.label}
                description={freq.description}
                selected={localData.workoutFrequency === freq.id}
                onClick={() => setLocalData({ ...localData, workoutFrequency: freq.id })}
              />
            ))}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="setup-nav-btn primary"
                onClick={() => onNext(localData)}
              >
                Continue →
              </button>
            </div>
          </>
        )}
      </SetupStep>

      {/* Step 2: Fitness Goal */}
      <SetupStep
        title="What's your main fitness goal?"
        description="This helps us tailor workout suggestions"
      >
        {({ onNext }) => (
          <>
            {FITNESS_GOALS.map((goal) => (
              <SetupOptionCard
                key={goal.id}
                icon={goal.icon}
                label={goal.label}
                description={goal.description}
                selected={localData.fitnessGoal === goal.id}
                onClick={() => setLocalData({ ...localData, fitnessGoal: goal.id })}
              />
            ))}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="setup-nav-btn primary"
                onClick={() => onNext(localData)}
              >
                Continue →
              </button>
            </div>
          </>
        )}
      </SetupStep>

      {/* Step 3: Workout Types */}
      <SetupStep
        title="What types of workouts do you enjoy?"
        description="Select all that apply"
      >
        {({ onNext }) => (
          <>
            <SetupChipSelect
              options={WORKOUT_TYPES}
              selected={localData.preferredTypes}
              onChange={(selected) => setLocalData({ ...localData, preferredTypes: selected })}
            />
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="setup-nav-btn primary"
                onClick={() => onNext(localData)}
              >
                Continue →
              </button>
            </div>
          </>
        )}
      </SetupStep>

      {/* Step 4: Body Weight */}
      <SetupStep
        title="What's your current body weight?"
        description="Used to calculate calories burned during workouts"
        nextLabel="Finish Setup"
      >
        {({ onNext }) => (
          <>
            <SetupNumberInput
              value={localData.bodyWeight}
              onChange={(val) => setLocalData({ ...localData, bodyWeight: val })}
              min={80}
              max={400}
              step={5}
              unit="lbs"
              presets={WEIGHT_PRESETS}
            />
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              This is kept private and only used for calorie calculations
            </p>
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
