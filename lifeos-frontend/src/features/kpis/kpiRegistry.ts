/**
 * KPI Registry
 * Declarative configuration for all KPI cards
 */

import { KpiDefinition } from './kpiTypes';

export const KPI_REGISTRY: KpiDefinition[] = [
  {
    id: 'income',
    label: 'Income',
    type: 'bar',
    adapter: 'finance.income',
    ranges: ['6m', '12m'],
    detailRoute: '/kpi/income',
    description: 'Net monthly income',
  },
  {
    id: 'deepWork',
    label: 'Deep Work',
    type: 'line+ring',
    adapter: 'focus.deepWork',
    ranges: ['7d', '30d', '90d'],
    detailRoute: '/kpi/deep-work',
    description: 'Hours of focused work',
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    type: 'stackedArea',
    adapter: 'learning.hours',
    ranges: ['7d', '30d', '90d'],
    detailRoute: '/kpi/knowledge',
    description: 'Learning hours (reading + study)',
  },
  {
    id: 'health',
    label: 'Health',
    type: 'radar+area',
    adapter: 'health.composite',
    ranges: ['7d', '30d', '90d'],
    detailRoute: '/kpi/health',
    description: 'Composite health score',
  },
  {
    id: 'productivity',
    label: 'Productivity',
    type: 'gauge+line',
    adapter: 'productivity.index',
    ranges: ['7d', '30d', '90d'],
    detailRoute: '/kpi/productivity',
    description: 'Deep work / screen time ratio',
  },
  {
    id: 'spendSplit',
    label: 'Spending',
    type: 'ring',
    adapter: 'finance.spendSplit',
    ranges: ['MTD', 'Last'],
    detailRoute: '/kpi/spending',
    description: 'Spending by category',
  },
];
