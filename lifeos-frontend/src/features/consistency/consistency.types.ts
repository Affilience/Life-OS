/**
 * Consistency Heatmap Types
 */

export type DayISO = string; // 'YYYY-MM-DD'

export interface ConsistencyDay {
  date: DayISO;
  score: number;          // 0..100 composite
  journalCount: number;   // entries that day
  questsCompleted: number;
  deepWorkMin: number;
  steps: number;
}

export interface ConsistencySeries {
  startISO: DayISO;       // first Sunday shown
  endISO: DayISO;         // last day shown (today)
  days: ConsistencyDay[]; // length = weeks*7
}

export type RangeWeeks = 13 | 26 | 52;

export type SeasonTint =
  | 'discipline'
  | 'ambition'
  | 'focus'
  | 'evolution'
  | 'power';
