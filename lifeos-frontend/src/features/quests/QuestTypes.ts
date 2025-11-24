/**
 * Quest Types
 * Type definitions for the Quest Board system
 */

export type QuestPriority = 'low' | 'medium' | 'high';
export type QuestStatus = 'active' | 'completed' | 'claimed';
export type QuestKind = 'routine' | 'focus' | 'health' | 'study' | 'finance' | 'custom';

export interface Quest {
  id: string;
  title: string;
  notes?: string;
  kind: QuestKind;
  xp: number;
  priority: QuestPriority;
  createdAt: string;
  due: string | null;
  status: QuestStatus;
  order: number;
  aiSuggested?: boolean;
}

export interface QuestStore {
  quests: Quest[];
  add: (quest: Partial<Quest>) => void;
  update: (id: string, updates: Partial<Quest>) => void;
  toggleComplete: (id: string) => void;
  claim: (id: string) => void;
  remove: (id: string) => void;
  reorder: (quests: Quest[]) => void;
  resetToday: () => void;
  hydrate: () => void;
  persist: () => void;
}

export const QUEST_KIND_LABELS: Record<QuestKind, string> = {
  routine: 'Routine',
  focus: 'Focus',
  health: 'Health',
  study: 'Study',
  finance: 'Finance',
  custom: 'Custom',
};

export const QUEST_KIND_COLORS: Record<QuestKind, string> = {
  routine: 'text-blue-400',
  focus: 'text-purple-400',
  health: 'text-green-400',
  study: 'text-cyan-400',
  finance: 'text-yellow-400',
  custom: 'text-zinc-400',
};

export const PRIORITY_COLORS: Record<QuestPriority, string> = {
  low: 'rgba(122, 92, 255, 0.3)',
  medium: 'rgba(122, 92, 255, 0.6)',
  high: 'rgba(122, 92, 255, 1)',
};
