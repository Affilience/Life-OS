/**
 * Journal Store (Zustand)
 */

import { create } from 'zustand';
import {
  JournalEntryMeta,
  JournalQuery,
  DayISO,
  RangeWeeks,
} from './journal.types';
import { listEntriesMeta } from './journal.adapter.mock';
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
}

interface JournalActions {
  hydrate: (q?: Partial<JournalQuery>) => Promise<void>;
  selectDate: (date: DayISO | undefined) => void;
  setRange: (weeks: RangeWeeks) => void;
  setFilters: (filters: Partial<JournalState['filters']>) => void;
  refresh: () => Promise<void>;
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

  // Actions
  hydrate: async (queryOverride) => {
    set({ loading: true });

    try {
      const state = get();
      const today = new Date();
      const fromISO = format(subDays(today, state.rangeWeeks * 7), 'yyyy-MM-dd');
      const toISO = format(today, 'yyyy-MM-dd');

      const query: JournalQuery = {
        fromISO,
        toISO,
        tags: state.filters.tags.length > 0 ? state.filters.tags : undefined,
        search: state.filters.search || undefined,
        ...queryOverride,
      };

      const entries = await listEntriesMeta(query);

      set({ entries, loading: false });
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
    await get().hydrate();
  },
}));
