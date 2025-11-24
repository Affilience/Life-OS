/**
 * Quest Service (Mock)
 * LocalStorage-based persistence with simulated latency
 */

import { Quest } from './QuestTypes';

const STORAGE_KEY = 'quanta-quests-today';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Load today's quests from localStorage
 */
export async function loadToday(): Promise<Quest[]> {
  await sleep(150); // Simulate network latency

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getSeedQuests();

    const data = JSON.parse(stored);
    return data.quests || [];
  } catch (error) {
    console.error('Failed to load quests:', error);
    return getSeedQuests();
  }
}

/**
 * Save today's quests to localStorage
 */
export async function saveToday(quests: Quest[]): Promise<void> {
  await sleep(50); // Simulate network latency

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        quests,
        lastSaved: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error('Failed to save quests:', error);
  }
}

/**
 * Get seed quests for first-time users
 */
function getSeedQuests(): Quest[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  return [
    {
      id: 'seed-1',
      title: '45-min deep work',
      kind: 'focus',
      xp: 50,
      priority: 'medium',
      createdAt: now.toISOString(),
      due: `${today}T11:00:00`,
      status: 'active',
      order: 0,
    },
    {
      id: 'seed-2',
      title: 'Walk 3,000 steps',
      kind: 'health',
      xp: 25,
      priority: 'low',
      createdAt: now.toISOString(),
      due: `${today}T18:00:00`,
      status: 'active',
      order: 1,
    },
    {
      id: 'seed-3',
      title: 'Read 20 minutes',
      kind: 'study',
      xp: 25,
      priority: 'low',
      createdAt: now.toISOString(),
      due: `${today}T21:30:00`,
      status: 'active',
      order: 2,
    },
  ];
}

/**
 * Get AI-suggested quests
 */
export function getAISuggestions(): Partial<Quest>[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  return [
    {
      title: 'Review weekly goals',
      kind: 'routine',
      xp: 25,
      priority: 'medium',
      due: `${today}T09:00:00`,
      aiSuggested: true,
    },
    {
      title: 'Journal morning thoughts',
      kind: 'routine',
      xp: 25,
      priority: 'low',
      due: `${today}T08:00:00`,
      aiSuggested: true,
    },
    {
      title: 'Workout session',
      kind: 'health',
      xp: 50,
      priority: 'high',
      due: `${today}T17:00:00`,
      aiSuggested: true,
    },
  ];
}
