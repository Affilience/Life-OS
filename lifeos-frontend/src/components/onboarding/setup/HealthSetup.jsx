/**
 * Health Module Setup
 * Collects calorie goals, macros, and hydration targets
 */

import React, { useState } from 'react';
import FirstRunSetup, {
  SetupStep,
  SetupOptionCard,
  SetupNumberInput,
  SetupChipSelect
} from './FirstRunSetup';
import { useHealthStore } from '../../../stores/healthStore';

const CALORIE_PRESETS = [
  { value: 1500, label: '1,500' },
  { value: 1800, label: '1,800' },
  { value: 2000, label: '2,000' },
  { value: 2200, label: '2,200' },
  { value: 2500, label: '2,500' },
  { value: 3000, label: '3,000' }
];

const FITNESS_GOALS = [
  { id: 'lose', icon: '📉', label: 'Lose Weight', description: 'Create a calorie deficit' },
  { id: 'maintain', icon: '⚖️', label: 'Maintain', description: 'Stay at current weight' },
  { id: 'gain', icon: '📈', label: 'Build Muscle', description: 'Slight calorie surplus' }
];

const HYDRATION_PRESETS = [
  { value: 1500, label: '1.5L' },
  { value: 2000, label: '2L' },
  { value: 2500, label: '2.5L' },
  { value: 3000, label: '3L' },
  { value: 3500, label: '3.5L' }
];

export default function HealthSetup({ onComplete, onSkip }) {
  const [localData, setLocalData] = useState({
    fitnessGoal: 'maintain',
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 200,
    fatGoal: 65,
    hydrationGoal: 2000
  });

  const { updateDailyGoals, setWaterGoal } = useHealthStore();

  const handleComplete = (data) => {
    // Save to health store
    updateDailyGoals({
      calories: localData.calorieGoal,
      protein: localData.proteinGoal,
      carbs: localData.carbsGoal,
      fat: localData.fatGoal
    });
    setWaterGoal(localData.hydrationGoal);
    onComplete?.(localData);
  };

  return (
    <FirstRunSetup
      moduleId="health"
      onComplete={handleComplete}
      onSkip={onSkip}
    >
      {/* Step 1: Fitness Goal */}
      <SetupStep
        title="What's your fitness goal?"
        description="This helps us suggest the right calorie target"
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
                onClick={() => {
                  const newCalories = goal.id === 'lose' ? 1800
                    : goal.id === 'gain' ? 2500 : 2000;
                  setLocalData({
                    ...localData,
                    fitnessGoal: goal.id,
                    calorieGoal: newCalories
                  });
                }}
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

      {/* Step 2: Calorie Goal */}
      <SetupStep
        title="Daily Calorie Target"
        description="You can adjust this anytime based on your progress"
      >
        {({ onNext }) => (
          <>
            <SetupNumberInput
              value={localData.calorieGoal}
              onChange={(val) => setLocalData({ ...localData, calorieGoal: val })}
              min={1000}
              max={5000}
              step={50}
              unit="calories/day"
              presets={CALORIE_PRESETS}
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

      {/* Step 3: Macros */}
      <SetupStep
        title="Macro Targets"
        description="Protein, carbs, and fats for balanced nutrition"
      >
        {({ onNext }) => (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <SetupNumberInput
                label="Protein"
                value={localData.proteinGoal}
                onChange={(val) => setLocalData({ ...localData, proteinGoal: val })}
                min={50}
                max={300}
                step={5}
                unit="g"
              />
              <SetupNumberInput
                label="Carbohydrates"
                value={localData.carbsGoal}
                onChange={(val) => setLocalData({ ...localData, carbsGoal: val })}
                min={50}
                max={500}
                step={5}
                unit="g"
              />
              <SetupNumberInput
                label="Fat"
                value={localData.fatGoal}
                onChange={(val) => setLocalData({ ...localData, fatGoal: val })}
                min={20}
                max={200}
                step={5}
                unit="g"
              />
            </div>
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

      {/* Step 4: Hydration */}
      <SetupStep
        title="Daily Water Intake"
        description="Stay hydrated for better energy and focus"
        nextLabel="Finish Setup"
      >
        {({ onNext }) => (
          <>
            <SetupNumberInput
              value={localData.hydrationGoal}
              onChange={(val) => setLocalData({ ...localData, hydrationGoal: val })}
              min={1000}
              max={5000}
              step={250}
              unit="ml"
              presets={HYDRATION_PRESETS}
            />
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
