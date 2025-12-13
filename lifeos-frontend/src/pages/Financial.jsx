/**
 * Nebula - Financial tracking and management
 * AI-powered transaction parsing, beautiful visualizations, and insights
 */

import React from 'react';
import FinancialDashboard from '../components/financial/FinancialDashboard';
import CosmicBackground from '../components/ui/CosmicBackground';
import { FinancialSetup } from '../components/onboarding/setup';
import useIntegratedOnboardingStore from '../stores/integratedOnboardingStore';

const Financial = () => {
  const { isModuleComplete, hasSeenWelcome, isOnboardingComplete } = useIntegratedOnboardingStore();

  // Show setup wizard if financial module not configured during onboarding
  const showSetup = hasSeenWelcome && !isOnboardingComplete && !isModuleComplete('financial');

  return (
    <div style={{ position: 'relative' }}>
      <CosmicBackground variant="default" />

      {/* First-Run Setup (during onboarding) */}
      {showSetup && (
        <div style={{ padding: '1rem', position: 'relative', zIndex: 10 }}>
          <FinancialSetup />
        </div>
      )}

      <FinancialDashboard />
    </div>
  );
};

export default Financial;