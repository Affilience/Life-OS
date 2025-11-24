/**
 * Quest Store
 * Zustand state management for quests
 */

import { create } from 'zustand';
import { Quest, QuestStore } from './QuestTypes';
import { loadToday, saveToday } from './QuestService.mock';

export const useQuestStore = create<QuestStore>((set, get) => ({
  quests: [],

  add: (questPartial) => {
    const newQuest: Quest = {
      id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: questPartial.title || 'Untitled Quest',
      kind: questPartial.kind || 'custom',
      xp: questPartial.xp || 50,
      priority: questPartial.priority || 'medium',
      createdAt: new Date().toISOString(),
      due: questPartial.due || getDefaultDueTime(),
      status: 'active',
      order: get().quests.length,
      notes: questPartial.notes,
      aiSuggested: questPartial.aiSuggested,
    };

    set((state) => ({
      quests: [...state.quests, newQuest],
    }));

    get().persist();
  },

  update: (id, updates) => {
    set((state) => ({
      quests: state.quests.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    }));

    get().persist();
  },

  toggleComplete: (id) => {
    set((state) => ({
      quests: state.quests.map((q) =>
        q.id === id
          ? { ...q, status: q.status === 'active' ? 'completed' : 'active' }
          : q
      ),
    }));

    get().persist();
  },

  claim: (id) => {
    set((state) => ({
      quests: state.quests.map((q) =>
        q.id === id ? { ...q, status: 'claimed' } : q
      ),
    }));

    get().persist();
  },

  remove: (id) => {
    set((state) => ({
      quests: state.quests.filter((q) => q.id !== id),
    }));

    get().persist();
  },

  reorder: (reorderedQuests) => {
    const updatedQuests = reorderedQuests.map((q, index) => ({
      ...q,
      order: index,
    }));

    set({ quests: updatedQuests });
    get().persist();
  },

  resetToday: () => {
    set({ quests: [] });
    get().persist();
  },

  hydrate: async () => {
    const quests = await loadToday();
    set({ quests });
  },

  persist: async () => {
    const { quests } = get();
    await saveToday(quests);
  },
}));

/**
 * Get default due time (today at 21:00)
 */
function getDefaultDueTime(): string {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  return `${today}T21:00:00`;
}
