/**
 * Nebula - Financial tracking and management
 * AI-powered transaction parsing, beautiful visualizations, and insights
 */

import React from 'react';
import FinancialDashboard from '../components/financial/FinancialDashboard';
import { ConstellationModulePanel } from '../features/constellations/ConstellationModulePanel';
import { useModuleConstellation } from '../features/constellations/hooks/useModuleConstellation';
import CosmicBackground from '../components/ui/CosmicBackground';

const Financial = () => {
  // Constellation progression
  const { constellation, state, currentXp } = useModuleConstellation('finance');

  return (
    <div style={{ position: 'relative' }}>
      <CosmicBackground variant="default" />
      {/* Constellation Progression */}
      <div style={{ marginBottom: '2rem' }}>
        <ConstellationModulePanel
          constellation={constellation}
          state={state}
          currentXp={currentXp}
        />
      </div>

      <FinancialDashboard />
    </div>
  );
};

export default Financial;