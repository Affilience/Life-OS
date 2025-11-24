/**
 * WorkoutsTab - Workout tracking integrated into Health & Fitness
 * Seamlessly integrated into Health & Fitness module
 */

import React from 'react';
import WorkoutTracker from './WorkoutTracker';

export default function WorkoutsTab() {
  return (
    <div style={{
      margin: '-24px', // Counteract the parent padding to make it full-width
      minHeight: '600px',
    }}>
      <WorkoutTracker />
    </div>
  );
}