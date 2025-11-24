/**
 * KPI Types
 * Type definitions for KPI system
 */

export type KpiRange = '7d' | '30d' | '90d' | '6m' | '12m' | 'MTD' | 'Last';
export type KpiChartType = 'line' | 'bar' | 'area' | 'ring' | 'radar' | 'gauge' | 'stackedArea' | 'line+ring' | 'gauge+line' | 'radar+area';

export interface KpiDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

export interface KpiResult {
  stat: number;
  deltaPct: number;
  series: KpiDataPoint[];
  meta?: {
    goal?: number;
    unit?: string;
    breakdown?: { label: string; value: number; color?: string }[];
    radarData?: { label: string; value: number; max: number }[];
    [key: string]: any;
  };
}

export interface KpiDefinition {
  id: string;
  label: string;
  type: KpiChartType;
  adapter: string;
  ranges: KpiRange[];
  detailRoute: string;
  description?: string;
}

export interface KpiStore {
  rangeByKpi: Record<string, KpiRange>;
  setRange: (kpiId: string, range: KpiRange) => void;
  loading: Record<string, boolean>;
  setLoading: (kpiId: string, loading: boolean) => void;
}
