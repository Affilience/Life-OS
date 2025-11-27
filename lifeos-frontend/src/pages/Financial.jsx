/**
 * Nebula - Financial tracking and management
 * AI-powered transaction parsing, beautiful visualizations, and insights
 */

import React from 'react';
import FinancialDashboard from '../components/financial/FinancialDashboard';
import CosmicBackground from '../components/ui/CosmicBackground';

const Financial = () => {
  return (
    <div style={{ position: 'relative' }}>
      <CosmicBackground variant="default" />
      <FinancialDashboard />
    </div>
  );
};

export default Financial;