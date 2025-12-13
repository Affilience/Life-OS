/**
 * Journal Store (Zustand)
 * Now using real Supabase data instead of mock adapter
 */

import { create } from 'zustand';
import {
  JournalEntryMeta,
  JournalQuery,
  DayISO,
  RangeWeeks,
} from './journal.types';
import { journalDB, journalSync } from '../../db/journalDB';
import { format, subDays } from 'date-fns';

interface JournalState {
  entries: JournalEntryMeta[];
  loading: boolean;
  selectedDate?: DayISO;
  rangeWeeks: RangeWeeks;
  filters: {
    tags: string[];
    search: string;
  };
  initialized: boolean;
}

interface JournalActions {
  hydrate: (q?: Partial<JournalQuery>) => Promise<void>;
  selectDate: (date: DayISO | undefined) => void;
  setRange: (weeks: RangeWeeks) => void;
  setFilters: (filters: Partial<JournalState['filters']>) => void;
  refresh: () => Promise<void>;
  initialize: () => Promise<void>;
}

type JournalStore = JournalState & JournalActions;

export const useJournalStore = create<JournalStore>((set, get) => ({
  // Initial state
  entries: [],
  loading: false,
  selectedDate: undefined,
  rangeWeeks: 13,
  filters: {
    tags: [],
    search: '',
  },
  initialized: false,

  // Initialize - sync with Supabase and load data
  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true });

    try {
      // First sync with Supabase to get latest data
      await journalSync.fullSync();

      // Then hydrate from local DB
      await get().hydrate();

      set({ initialized: true });
    } catch (error) {
      console.error('Failed to initialize journal store:', error);
      set({ loading: false });
    }
  },

  // Actions
  hydrate: async (queryOverride) => {
    set({ loading: true });

    try {
      const state = get();
      const today = new Date();
      const fromDate = format(subDays(today, state.rangeWeeks * 7), 'yyyy-MM-dd');
      const toDate = format(today, 'yyyy-MM-dd');

      // Get entries from local IndexedDB (which syncs with Supabase)
      let entries = await journalDB.getEntriesByDateRange(fromDate, toDate);

      // Apply tag filter
      if (state.filters.tags.length > 0) {
        entries = entries.filter(entry =>
          entry.tags?.some(tag => state.filters.tags.includes(tag))
        );
      }

      // Apply search filter
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase();
        entries = entries.filter(entry =>
          entry.title?.toLowerCase().includes(search) ||
          entry.content?.toLowerCase().includes(search) ||
          entry.tags?.some(tag => tag.toLowerCase().includes(search))
        );
      }

      // Apply query overrides if provided
      if (queryOverride?.fromISO || queryOverride?.toISO) {
        const qFrom = queryOverride.fromISO || fromDate;
        const qTo = queryOverride.toISO || toDate;
        entries = entries.filter(e => e.date >= qFrom && e.date <= qTo);
      }

      // Transform to JournalEntryMeta format
      const entryMetas: JournalEntryMeta[] = entries.map(entry => ({
        date: entry.date as DayISO,
        mood: entry.mood ?? undefined,
        tags: entry.tags || [],
        wordCount: entry.wordCount || 0,
      }));

      // Sort by date descending
      entryMetas.sort((a, b) => b.date.localeCompare(a.date));

      set({ entries: entryMetas, loading: false });
    } catch (error) {
      console.error('Failed to hydrate journal:', error);
      set({ loading: false });
    }
  },

  selectDate: (date) => {
    set({ selectedDate: date });
  },

  setRange: (weeks) => {
    set({ rangeWeeks: weeks });
    // Auto-refresh when range changes
    get().hydrate();
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    // Auto-refresh when filters change
    get().hydrate();
  },

  refresh: async () => {
    // Re-sync with Supabase and refresh
    await journalSync.fullSync();
    await get().hydrate();
  },
}));

// Export initialization function for App.jsx
export const initializeJournalStore = async () => {
  await useJournalStore.getState().initialize();
};
