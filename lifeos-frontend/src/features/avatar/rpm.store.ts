/**
 * Avatar State Store
 * Manages Ready Player Me avatar URL and character stats
 */

import { create } from 'zustand';
import { AvatarState } from './rpm.types';

type Actions = {
  setUrl(url: string | null): void;
  setStats(partial: Partial<Omit<AvatarState, 'url'>>): void;
  hydrate(): void;
  persist(): void;
};

export const useAvatarStore = create<AvatarState & Actions>((set, get) => ({
  // Initial state
  url: null,
  level: 1,
  xp: 0,
  xpToNext: 100,
  streakDays: 0,
  seasonColor: undefined,
  mood: 'calm',

  // Actions
  setUrl: (url) => {
    set({ url });
    get().persist();
  },

  setStats: (partial) => {
    set(partial as any);
    get().persist();
  },

  hydrate: () => {
    const stored = localStorage.getItem('onyxos-avatar');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        set(parsed);
      } catch (e) {
        console.error('Failed to hydrate avatar state:', e);
      }
    }
  },

  persist: () => {
    const state = get();
    localStorage.setItem(
      'onyxos-avatar',
      JSON.stringify({
        url: state.url,
        level: state.level,
        xp: state.xp,
        xpToNext: state.xpToNext,
        streakDays: state.streakDays,
        seasonColor: state.seasonColor,
        mood: state.mood,
      })
    );
  },
}));
