/**
 * Journal Types
 */

export type DayISO = string; // 'YYYY-MM-DD'

export type JournalMood = 'calm' | 'focused' | 'stressed' | 'neutral';

export interface JournalEntryMeta {
  id: string;
  date: DayISO;        // unique per day by default
  hasText: boolean;
  tags: string[];
  mood?: JournalMood;
  wordCount?: number;
  xpAwarded?: number;  // for display
}

export interface JournalEntry extends JournalEntryMeta {
  title?: string;
  body?: string;       // markdown/string
}

export interface JournalQuery {
  fromISO?: DayISO;
  toISO?: DayISO;
  tags?: string[];
  search?: string;
}

export type RangeWeeks = 13 | 26 | 52;

export type SeasonTint =
  | 'discipline'
  | 'ambition'
  | 'focus'
  | 'evolution'
  | 'power';
