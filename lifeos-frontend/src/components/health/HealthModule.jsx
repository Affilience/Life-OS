/**
 * Health Module - Main Container
 * AI-powered meal tracking with zero friction
 */

import React from 'react';
import MealTracker from './MealTracker';

export default function HealthModule() {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#0a0a0a',
    }}>
      <MealTracker />
    </div>
  );
}
