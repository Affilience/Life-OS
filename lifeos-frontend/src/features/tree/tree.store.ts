/**
 * Growth Tree Store
 * Zustand state management for tree component
 */

import { create } from 'zustand';
import { TreeState } from './tree.types';

export const useTreeStore = create<TreeState>((set) => ({
  level: 1,
  xp: 0,
  xpToNext: 100,
  streakDays: 0,
  season: 'discipline',
  mood: 'calm',

  set: (partial) => set(partial),
}));
