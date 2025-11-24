/**
 * KPI Grid Component
 * Responsive grid of KPI cards
 */

import React from 'react';
import { KPI_REGISTRY } from './kpiRegistry';
import { KpiCard } from './KpiCard';

interface KpiGridProps {
  compact?: boolean;
}

export function KpiGrid({ compact = false }: KpiGridProps) {
  return (
    <div
      className={`
        grid gap-6
        grid-cols-1
        md:grid-cols-2
        ${compact ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}
      `}
    >
      {KPI_REGISTRY.map((kpi) => (
        <KpiCard key={kpi.id} definition={kpi} />
      ))}
    </div>
  );
}
