/**
 * WorkoutsTab - Workout tracking integrated into Health & Fitness
 * Seamlessly integrated into Health & Fitness module
 */

import React from 'react';
import WorkoutTracker from './WorkoutTracker';
import { FitnessSetup } from '../onboarding/setup';
import useIntegratedOnboardingStore from '../../stores/integratedOnboardingStore';

export default function WorkoutsTab() {
  const { isModuleComplete, hasSeenWelcome, isOnboardingComplete } = useIntegratedOnboardingStore();

  // Show setup wizard if fitness module not configured during onboarding
  const showSetup = hasSeenWelcome && !isOnboardingComplete && !isModuleComplete('fitness');

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      minHeight: '600px',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* First-Run Setup (during onboarding) */}
      {showSetup && (
        <div style={{ padding: '24px', paddingBottom: 0 }}>
          <FitnessSetup />
        </div>
      )}

      <WorkoutTracker />
    </div>
  );
}