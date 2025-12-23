/**
 * Quest Service (Supabase)
 * Supabase-based persistence for daily quests
 */

import { Quest } from './QuestTypes';
import { supabase, getCurrentUserId } from '../../lib/supabase';

/**
 * Load today's quests from Supabase
 */
export async function loadToday(): Promise<Quest[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('[QuestService] No user ID available, returning seed quests');
      return getSeedQuests();
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_date', today)
      .order('quest_order', { ascending: true });

    if (error) {
      console.error('Failed to load quests from Supabase:', error);
      return getSeedQuests();
    }

    if (!data || data.length === 0) {
      // No quests for today - return seed quests for first time
      const seeds = getSeedQuests();
      // Save seed quests to database
      await saveQuests(seeds);
      return seeds;
    }

    // Transform from DB format to store format
    return data.map(dbQuest => ({
      id: dbQuest.id,
      title: dbQuest.title,
      notes: dbQuest.notes || undefined,
      kind: dbQuest.kind,
      xp: dbQuest.xp,
      priority: dbQuest.priority,
      createdAt: dbQuest.created_at,
      due: dbQuest.due,
      status: dbQuest.status,
      order: dbQuest.quest_order,
      aiSuggested: dbQuest.ai_suggested || undefined,
    }));
  } catch (error) {
    console.error('Failed to load quests:', error);
    return getSeedQuests();
  }
}

/**
 * Save today's quests to Supabase
 */
export async function saveToday(quests: Quest[]): Promise<void> {
  await saveQuests(quests);
}

/**
 * Save quests to Supabase (upsert)
 */
async function saveQuests(quests: Quest[]): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('[QuestService] No user ID available, skipping save');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    // Delete all existing quests for today first (to handle removals)
    await supabase
      .from('daily_quests')
      .delete()
      .eq('user_id', userId)
      .eq('quest_date', today);

    if (quests.length === 0) return;

    // Insert all current quests
    const dbQuests = quests.map((quest, index) => ({
      id: quest.id,
      user_id: userId,
      title: quest.title,
      notes: quest.notes || null,
      kind: quest.kind,
      xp: quest.xp,
      priority: quest.priority,
      due: quest.due,
      status: quest.status,
      quest_order: quest.order ?? index,
      ai_suggested: quest.aiSuggested || false,
      quest_date: today,
      created_at: quest.createdAt,
    }));

    const { error } = await supabase
      .from('daily_quests')
      .insert(dbQuests);

    if (error) {
      console.error('Failed to save quests to Supabase:', error);
    }
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
