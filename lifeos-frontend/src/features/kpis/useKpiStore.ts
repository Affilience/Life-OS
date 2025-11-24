/**
 * KPI Store
 * Zustand state management for KPI ranges and loading states
 */

import { create } from 'zustand';
import { KpiStore, KpiRange } from './kpiTypes';

export const useKpiStore = create<KpiStore>((set) => ({
  rangeByKpi: {
    income: '6m',
    deepWork: '7d',
    knowledge: '7d',
    health: '7d',
    productivity: '7d',
    spendSplit: 'MTD',
  },

  loading: {},

  setRange: (kpiId, range) =>
    set((state) => ({
      rangeByKpi: { ...state.rangeByKpi, [kpiId]: range },
    })),

  setLoading: (kpiId, loading) =>
    set((state) => ({
      loading: { ...state.loading, [kpiId]: loading },
    })),
}));
