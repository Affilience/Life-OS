/**
 * Quests Store
 * Advanced quest system with multi-tiered quests, quest chains, and cross-module integration
 *
 * Quest Types:
 * - Daily: Reset at midnight, pulled from dailyTasksStore
 * - Weekly: 7-day objectives, higher rewards
 * - Monthly Epic: Major achievements spanning the month
 * - Quest Chains: Multi-part story-driven quest lines
 * - Cross-Module: Quests that span multiple LifeOS modules
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { triggerGamification } from '../hooks/useGamification';
import useAchievementsStore from './achievementsStore';
import { feedback } from '../services/microInteractions';

// =============================================================================
// QUEST REQUIREMENT TO STATS MAPPING
// Maps quest requirement.type to achievementsStore stats for auto-completion
// =============================================================================
const QUEST_REQUIREMENT_TO_STAT = {
  // Health & Fitness
  workouts: 'workouts',
  workout_streak: 'workoutStreakDays',
  morning_workout: 'workouts',
  workout: 'workouts',

  // Knowledge
  reading_sessions: 'booksCompleted', // Approximate - reading sessions tracked via books
  reading_hours: 'readingHours',
  books_completed: 'booksCompleted',
  notes_created: 'notesCreated',
  reading_minutes: 'readingHours', // Will convert minutes to hours
  articles_read: 'articlesRead',

  // Productivity
  deep_work_sessions: 'pomodorosCompleted', // Approximate mapping
  deep_work_hours: 'deepWorkHours',
  tasks_completed: 'tasksCompleted',
  projects_completed: 'projectsCompleted',
  pomodoros_completed: 'pomodorosCompleted',

  // Journal
  journal_entries: 'journalEntries',
  journal_streak: 'journalStreakDays',
  journal_days: 'journalEntries', // Days with journal entries
  morning_entry: 'journalEntries',
  mood_logs: 'moodEntriesLogged',
  gratitude_entries: 'gratitudeEntriesCreated',

  // Financial
  budget_setup: 'budgetsCreated',
  expenses_logged: 'expensesLogged',
  daily_expense_logging: 'expensesLogged',
  expense_logged: 'expensesLogged',
  income_logged: 'incomeLogged',
  savings_contributions: 'savingsContributions',
  under_budget_months: 'underBudgetMonths',
  budget_review: 'budgetsCreated',

  // Calendar
  time_blocks_completed: 'timeBlocksCompleted',
  events_created: 'eventsCreated',

  // Skills
  practice_sessions: 'practiceSessionsCompleted',
  skills_leveled_up: 'skillsLeveledUp',

  // Streaks
  streak_days: 'streakDays',
  consecutive_days: 'consecutiveDays',
  perfect_days: 'consecutiveDays',

  // Multi-stat requirements (handled specially)
  workouts_and_streak: null,
  reading_and_books: null,
  books_and_notes: null,
  deep_work_streak: null,
  savings_rate: null,
  under_budget_streak: null,
  all_envelopes_under_budget: null,
  multi_module_completion: null,
};

// Helper functions
const getDateString = (date = new Date()) => date.toISOString().split('T')[0];
const getWeekKey = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
  return d.toISOString().split('T')[0];
};
const getMonthKey = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// Quest difficulty levels with XP multipliers
export const QUEST_DIFFICULTY = {
  trivial: { label: 'Trivial', xpMultiplier: 0.5, color: 'from-gray-400 to-gray-500' },
  easy: { label: 'Easy', xpMultiplier: 0.75, color: 'from-green-400 to-emerald-500' },
  normal: { label: 'Normal', xpMultiplier: 1, color: 'from-blue-400 to-cyan-500' },
  hard: { label: 'Hard', xpMultiplier: 1.5, color: 'from-orange-400 to-red-500' },
  epic: { label: 'Epic', xpMultiplier: 2, color: 'from-purple-400 to-pink-500' },
  legendary: { label: 'Legendary', xpMultiplier: 3, color: 'from-yellow-400 to-orange-500' },
};

// Quest types with base rewards
export const QUEST_TYPES = {
  daily: { label: 'Daily', baseXP: 25, baseCredits: 10, icon: '📅' },
  weekly: { label: 'Weekly', baseXP: 200, baseCredits: 100, icon: '📆' },
  monthly: { label: 'Monthly Epic', baseXP: 1000, baseCredits: 500, icon: '🏆' },
  chain: { label: 'Quest Chain', baseXP: 150, baseCredits: 75, icon: '⛓️' },
  boss: { label: 'Boss Battle', baseXP: 500, baseCredits: 250, icon: '🐉' },
};

// Modules that can be involved in cross-module quests
export const LIFEOS_MODULES = {
  productivity: { label: 'Productivity', icon: '💼', color: 'from-indigo-500 to-violet-500' },
  health: { label: 'Health & Fitness', icon: '💪', color: 'from-green-500 to-emerald-500' },
  knowledge: { label: 'Knowledge', icon: '📚', color: 'from-blue-500 to-cyan-500' },
  journal: { label: 'Journal', icon: '✍️', color: 'from-amber-500 to-orange-500' },
  financial: { label: 'Financial', icon: '💰', color: 'from-emerald-500 to-teal-500' },
  calendar: { label: 'Calendar', icon: '📆', color: 'from-purple-500 to-pink-500' },
  skills: { label: 'Skills', icon: '🎯', color: 'from-rose-500 to-red-500' },
};

// Pre-defined Quest Chain Templates
export const QUEST_CHAIN_TEMPLATES = [
  {
    id: 'fitness_mastery',
    title: 'Path to Fitness Mastery',
    description: 'Transform your body through consistent training',
    icon: '🏋️',
    color: 'from-green-500 to-emerald-500',
    module: 'health',
    totalSteps: 5,
    steps: [
      { id: 1, title: 'First Steps', description: 'Complete your first workout', requirement: { type: 'workouts', count: 1 } },
      { id: 2, title: 'Building Momentum', description: 'Complete 10 workouts', requirement: { type: 'workouts', count: 10 } },
      { id: 3, title: 'Consistent Warrior', description: 'Workout 5 days in a row', requirement: { type: 'workout_streak', count: 5 } },
      { id: 4, title: 'Iron Will', description: 'Complete 50 workouts', requirement: { type: 'workouts', count: 50 } },
      { id: 5, title: 'Fitness Master', description: 'Reach 100 workouts and maintain a 30-day streak', requirement: { type: 'workouts_and_streak', workouts: 100, streak: 30 } },
    ],
    rewards: {
      xp: 5000,
      credits: 2500,
      badge: 'fitness_master',
      title: 'Fitness Master',
    },
  },
  {
    id: 'knowledge_seeker',
    title: 'The Scholar\'s Journey',
    description: 'Expand your mind through dedicated learning',
    icon: '📖',
    color: 'from-blue-500 to-cyan-500',
    module: 'knowledge',
    totalSteps: 5,
    steps: [
      { id: 1, title: 'Curious Mind', description: 'Complete your first reading session', requirement: { type: 'reading_sessions', count: 1 } },
      { id: 2, title: 'Avid Reader', description: 'Read for 10 hours total', requirement: { type: 'reading_hours', count: 10 } },
      { id: 3, title: 'Book Club', description: 'Finish 3 books', requirement: { type: 'books_completed', count: 3 } },
      { id: 4, title: 'Knowledge Vault', description: 'Create 50 notes', requirement: { type: 'notes_created', count: 50 } },
      { id: 5, title: 'Grand Scholar', description: 'Read 50 hours and finish 10 books', requirement: { type: 'reading_and_books', hours: 50, books: 10 } },
    ],
    rewards: {
      xp: 5000,
      credits: 2500,
      badge: 'grand_scholar',
      title: 'Grand Scholar',
    },
  },
  {
    id: 'productivity_titan',
    title: 'Rise of the Productivity Titan',
    description: 'Master the art of deep focused work',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
    module: 'productivity',
    totalSteps: 5,
    steps: [
      { id: 1, title: 'Getting Started', description: 'Complete your first deep work session', requirement: { type: 'deep_work_sessions', count: 1 } },
      { id: 2, title: 'Building Focus', description: 'Log 10 hours of deep work', requirement: { type: 'deep_work_hours', count: 10 } },
      { id: 3, title: 'Task Slayer', description: 'Complete 50 tasks', requirement: { type: 'tasks_completed', count: 50 } },
      { id: 4, title: 'Focus Champion', description: 'Complete 5 consecutive days with 4+ hours deep work', requirement: { type: 'deep_work_streak', days: 5, hoursPerDay: 4 } },
      { id: 5, title: 'Productivity Titan', description: 'Log 100 hours of deep work', requirement: { type: 'deep_work_hours', count: 100 } },
    ],
    rewards: {
      xp: 5000,
      credits: 2500,
      badge: 'productivity_titan',
      title: 'Productivity Titan',
    },
  },
  {
    id: 'mindful_master',
    title: 'Inner Peace Journey',
    description: 'Cultivate mindfulness and emotional balance',
    icon: '🧘',
    color: 'from-purple-500 to-pink-500',
    module: 'journal',
    totalSteps: 5,
    steps: [
      { id: 1, title: 'First Reflection', description: 'Write your first journal entry', requirement: { type: 'journal_entries', count: 1 } },
      { id: 2, title: 'Daily Practice', description: 'Journal for 7 consecutive days', requirement: { type: 'journal_streak', count: 7 } },
      { id: 3, title: 'Mood Tracker', description: 'Log mood for 30 days', requirement: { type: 'mood_logs', count: 30 } },
      { id: 4, title: 'Deep Reflection', description: 'Complete 50 journal entries', requirement: { type: 'journal_entries', count: 50 } },
      { id: 5, title: 'Mindful Master', description: 'Maintain a 30-day journaling streak', requirement: { type: 'journal_streak', count: 30 } },
    ],
    rewards: {
      xp: 5000,
      credits: 2500,
      badge: 'mindful_master',
      title: 'Mindful Master',
    },
  },
  {
    id: 'wealth_builder',
    title: 'Path to Financial Freedom',
    description: 'Master your finances and build wealth',
    icon: '💎',
    color: 'from-emerald-500 to-teal-500',
    module: 'financial',
    totalSteps: 5,
    steps: [
      { id: 1, title: 'Budget Beginner', description: 'Set up your first monthly budget', requirement: { type: 'budget_setup', count: 1 } },
      { id: 2, title: 'Expense Tracker', description: 'Log 50 expenses', requirement: { type: 'expenses_logged', count: 50 } },
      { id: 3, title: 'Under Budget', description: 'Stay under budget for 1 month', requirement: { type: 'under_budget_months', count: 1 } },
      { id: 4, title: 'Savings Champion', description: 'Save 20% of income for 3 months', requirement: { type: 'savings_rate', rate: 20, months: 3 } },
      { id: 5, title: 'Wealth Builder', description: 'Stay under budget for 6 consecutive months', requirement: { type: 'under_budget_streak', count: 6 } },
    ],
    rewards: {
      xp: 5000,
      credits: 2500,
      badge: 'wealth_builder',
      title: 'Wealth Builder',
    },
  },
];

// Pre-defined Weekly Quest Templates
export const WEEKLY_QUEST_TEMPLATES = [
  {
    id: 'workout_warrior',
    title: 'Workout Warrior',
    description: 'Complete 5 workouts this week',
    icon: '💪',
    module: 'health',
    difficulty: 'normal',
    requirement: { type: 'workouts', count: 5 },
    xpReward: 300,
    creditsReward: 150,
  },
  {
    id: 'reading_sprint',
    title: 'Reading Sprint',
    description: 'Read for 7 hours this week',
    icon: '📚',
    module: 'knowledge',
    difficulty: 'normal',
    requirement: { type: 'reading_hours', count: 7 },
    xpReward: 300,
    creditsReward: 150,
  },
  {
    id: 'deep_focus',
    title: 'Deep Focus Week',
    description: 'Log 20 hours of deep work',
    icon: '🎯',
    module: 'productivity',
    difficulty: 'hard',
    requirement: { type: 'deep_work_hours', count: 20 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'daily_reflection',
    title: 'Daily Reflection',
    description: 'Write in journal every day this week',
    icon: '✍️',
    module: 'journal',
    difficulty: 'normal',
    requirement: { type: 'journal_days', count: 7 },
    xpReward: 300,
    creditsReward: 150,
  },
  {
    id: 'expense_tracker',
    title: 'Financial Awareness',
    description: 'Log every expense this week',
    icon: '💰',
    module: 'financial',
    difficulty: 'easy',
    requirement: { type: 'daily_expense_logging', count: 7 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete all daily quests for 7 days',
    icon: '⭐',
    module: 'productivity',
    difficulty: 'epic',
    requirement: { type: 'perfect_days', count: 7 },
    xpReward: 1000,
    creditsReward: 500,
  },
];

// Pre-defined Monthly Epic Quest Templates
export const MONTHLY_QUEST_TEMPLATES = [
  {
    id: 'fitness_transformation',
    title: 'Fitness Transformation',
    description: 'Complete 25 workouts this month',
    icon: '🏆',
    module: 'health',
    difficulty: 'epic',
    requirement: { type: 'workouts', count: 25 },
    xpReward: 2000,
    creditsReward: 1000,
    badge: 'monthly_fitness_champion',
  },
  {
    id: 'knowledge_expansion',
    title: 'Knowledge Expansion',
    description: 'Read 4 books and create 30 notes',
    icon: '📖',
    module: 'knowledge',
    difficulty: 'epic',
    requirement: { type: 'books_and_notes', books: 4, notes: 30 },
    xpReward: 2000,
    creditsReward: 1000,
    badge: 'monthly_scholar',
  },
  {
    id: 'productivity_master',
    title: 'Productivity Master',
    description: 'Log 80 hours of deep work',
    icon: '⚡',
    module: 'productivity',
    difficulty: 'legendary',
    requirement: { type: 'deep_work_hours', count: 80 },
    xpReward: 3000,
    creditsReward: 1500,
    badge: 'monthly_productivity_legend',
  },
  {
    id: 'financial_discipline',
    title: 'Financial Discipline',
    description: 'Stay under budget in all categories',
    icon: '💎',
    module: 'financial',
    difficulty: 'hard',
    requirement: { type: 'all_envelopes_under_budget', count: 1 },
    xpReward: 1500,
    creditsReward: 750,
    badge: 'budget_master',
  },
  {
    id: 'life_optimizer',
    title: 'Life Optimizer',
    description: 'Complete quests in all 5 main modules',
    icon: '🌟',
    module: 'all',
    difficulty: 'legendary',
    requirement: { type: 'multi_module_completion', modules: ['health', 'knowledge', 'productivity', 'journal', 'financial'] },
    xpReward: 5000,
    creditsReward: 2500,
    badge: 'life_optimizer',
  },
];

// Boss Battle Templates
export const BOSS_BATTLE_TEMPLATES = [
  {
    id: 'procrastination_dragon',
    title: 'The Procrastination Dragon',
    description: 'Defeat the beast of distraction by completing focused work sessions',
    icon: '🐉',
    health: 1000,
    difficulty: 'epic',
    damagePerTask: 50, // Each completed task deals this much damage
    attacksBack: true, // Missed tasks cause damage
    playerHealthPenalty: 10, // Damage taken per missed task
    duration: 'weekly',
    requirements: { type: 'deep_work_sessions', count: 20 },
    xpReward: 2000,
    creditsReward: 1000,
    badge: 'dragon_slayer',
  },
  {
    id: 'couch_potato',
    title: 'The Couch Potato',
    description: 'Defeat laziness by staying active',
    icon: '🥔',
    health: 500,
    difficulty: 'normal',
    damagePerTask: 100,
    attacksBack: false,
    duration: 'weekly',
    requirements: { type: 'workouts', count: 5 },
    xpReward: 800,
    creditsReward: 400,
    badge: 'couch_crusher',
  },
];

// Supabase sync helper - sync quest completion to user_missions
const syncQuestCompletionToSupabase = async (questData) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    // We'll create a user_missions entry for tracking
    const { data: existingMission } = await supabase
      .from('user_missions')
      .select('id')
      .eq('user_id', userId)
      .eq('mission_id', questData.missionId || questData.templateId || questData.id)
      .maybeSingle();

    if (existingMission) {
      // Update existing
      await supabase
        .from('user_missions')
        .update({
          status: questData.completed ? 'completed' : 'active',
          progress: { current: questData.progress, target: questData.target },
          completion_percentage: Math.round((questData.progress / questData.target) * 100),
          completed_at: questData.completed ? new Date().toISOString() : null,
          rewards_claimed: questData.completed,
        })
        .eq('id', existingMission.id);
    }
  } catch (error) {
    console.error('Error syncing quest to Supabase:', error);
  }
};

const useQuestsStore = create(
  persist(
    (set, get) => ({
      // ============================================================
      // STATE
      // ============================================================

      // Initialize from Supabase
      initializeFromSupabase: async () => {
        try {
          const userId = await getCurrentUserId();
          if (!userId) return;

          // Load user's mission progress
          const { data: userMissions, error: missionsError } = await supabase
            .from('user_missions')
            .select(`
              *,
              mission:missions (*)
            `)
            .eq('user_id', userId);

          if (missionsError) throw missionsError;

          // Calculate stats from completed missions
          const completedMissions = (userMissions || []).filter(m => m.status === 'completed');
          const totalXP = completedMissions.reduce((sum, m) => sum + (m.mission?.xp_reward || 0), 0);
          const totalCredits = completedMissions.reduce((sum, m) => sum + (m.mission?.credits_reward || 0), 0);

          // Update quest stats from Supabase data
          set(state => ({
            questStats: {
              ...state.questStats,
              totalQuestsCompleted: completedMissions.length,
              totalXPEarned: totalXP,
              totalCreditsEarned: totalCredits,
            },
          }));
        } catch (error) {
          console.error('Error initializing quests from Supabase:', error);
        }
      },

      // Active quests by type
      weeklyQuests: {}, // { weekKey: [quests] }
      monthlyQuests: {}, // { monthKey: [quests] }

      // Quest chains progress
      questChains: {}, // { chainId: { started: bool, currentStep: number, completedSteps: [], startedAt, completedAt } }

      // Boss battles
      activeBossBattles: [], // Current boss battles
      completedBossBattles: [], // History

      // User stats
      questStats: {
        totalQuestsCompleted: 0,
        weeklyQuestsCompleted: 0,
        monthlyQuestsCompleted: 0,
        chainsCompleted: 0,
        bossesDefeated: 0,
        totalXPEarned: 0,
        totalCreditsEarned: 0,
      },

      // Completed quests history
      completedQuests: [], // { questId, type, completedAt, xpEarned, creditsEarned }

      // ============================================================
      // WEEKLY QUESTS
      // ============================================================

      generateWeeklyQuests: (weekKey = getWeekKey()) => {
        const { weeklyQuests } = get();

        // Don't regenerate if already exists
        if (weeklyQuests[weekKey]) return weeklyQuests[weekKey];

        // Select 4-5 random weekly quests
        const shuffled = [...WEEKLY_QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5).map(template => ({
          ...template,
          id: `weekly-${weekKey}-${template.id}`,
          weekKey,
          progress: 0,
          completed: false,
          startedAt: new Date().toISOString(),
          completedAt: null,
        }));

        set(state => ({
          weeklyQuests: {
            ...state.weeklyQuests,
            [weekKey]: selected,
          }
        }));

        return selected;
      },

      getWeeklyQuests: (weekKey = getWeekKey()) => {
        const { weeklyQuests, generateWeeklyQuests } = get();
        if (!weeklyQuests[weekKey]) {
          generateWeeklyQuests(weekKey);
        }
        return weeklyQuests[weekKey] || [];
      },

      updateWeeklyQuestProgress: (questId, progress, weekKey = getWeekKey()) => {
        const quests = get().weeklyQuests[weekKey] || [];
        const quest = quests.find(q => q.id === questId);

        if (!quest) return;

        const isNowComplete = progress >= quest.requirement.count && !quest.completed;

        set(state => ({
          weeklyQuests: {
            ...state.weeklyQuests,
            [weekKey]: quests.map(q =>
              q.id === questId
                ? {
                    ...q,
                    progress,
                    completed: progress >= q.requirement.count,
                    completedAt: isNowComplete ? new Date().toISOString() : q.completedAt,
                  }
                : q
            ),
          },
          questStats: isNowComplete ? {
            ...state.questStats,
            totalQuestsCompleted: state.questStats.totalQuestsCompleted + 1,
            weeklyQuestsCompleted: state.questStats.weeklyQuestsCompleted + 1,
            totalXPEarned: state.questStats.totalXPEarned + quest.xpReward,
            totalCreditsEarned: state.questStats.totalCreditsEarned + quest.creditsReward,
          } : state.questStats,
          completedQuests: isNowComplete ? [
            ...state.completedQuests,
            { questId, type: 'weekly', completedAt: new Date().toISOString(), xpEarned: quest.xpReward, creditsEarned: quest.creditsReward }
          ] : state.completedQuests,
        }));

        // Sync to database and trigger unified gamification when quest is completed
        if (isNowComplete) {
          // Play quest completion sound
          feedback.questComplete();

          triggerGamification('weeklyQuestCompleted', {
            xpOverride: quest.xpReward,
            module: quest.module || 'productivity',
            questName: quest.name,
            questTitle: quest.title || quest.name,
            questDescription: quest.description,
            creditReward: quest.creditsReward || 0,
          });

          syncQuestCompletionToSupabase({
            ...quest,
            progress,
            target: quest.requirement.count,
            completed: true,
          });
        }
      },

      // ============================================================
      // MONTHLY QUESTS
      // ============================================================

      generateMonthlyQuests: (monthKey = getMonthKey()) => {
        const { monthlyQuests } = get();

        if (monthlyQuests[monthKey]) return monthlyQuests[monthKey];

        // Select 3-4 monthly epics
        const shuffled = [...MONTHLY_QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4).map(template => ({
          ...template,
          id: `monthly-${monthKey}-${template.id}`,
          monthKey,
          progress: 0,
          completed: false,
          startedAt: new Date().toISOString(),
          completedAt: null,
        }));

        set(state => ({
          monthlyQuests: {
            ...state.monthlyQuests,
            [monthKey]: selected,
          }
        }));

        return selected;
      },

      getMonthlyQuests: (monthKey = getMonthKey()) => {
        const { monthlyQuests, generateMonthlyQuests } = get();
        if (!monthlyQuests[monthKey]) {
          generateMonthlyQuests(monthKey);
        }
        return monthlyQuests[monthKey] || [];
      },

      updateMonthlyQuestProgress: (questId, progress, monthKey = getMonthKey()) => {
        const quests = get().monthlyQuests[monthKey] || [];
        const quest = quests.find(q => q.id === questId);

        if (!quest) return;

        const target = typeof quest.requirement.count === 'number'
          ? quest.requirement.count
          : Object.values(quest.requirement).find(v => typeof v === 'number') || 1;

        const isNowComplete = progress >= target && !quest.completed;

        set(state => ({
          monthlyQuests: {
            ...state.monthlyQuests,
            [monthKey]: quests.map(q =>
              q.id === questId
                ? {
                    ...q,
                    progress,
                    completed: progress >= target,
                    completedAt: isNowComplete ? new Date().toISOString() : q.completedAt,
                  }
                : q
            ),
          },
          questStats: isNowComplete ? {
            ...state.questStats,
            totalQuestsCompleted: state.questStats.totalQuestsCompleted + 1,
            monthlyQuestsCompleted: state.questStats.monthlyQuestsCompleted + 1,
            totalXPEarned: state.questStats.totalXPEarned + quest.xpReward,
            totalCreditsEarned: state.questStats.totalCreditsEarned + quest.creditsReward,
          } : state.questStats,
          completedQuests: isNowComplete ? [
            ...state.completedQuests,
            { questId, type: 'monthly', completedAt: new Date().toISOString(), xpEarned: quest.xpReward, creditsEarned: quest.creditsReward }
          ] : state.completedQuests,
        }));

        // Sync to database and trigger unified gamification when quest is completed
        if (isNowComplete) {
          // Play epic quest completion sound for monthly quests
          feedback.achievement();

          triggerGamification('monthlyQuestCompleted', {
            xpOverride: quest.xpReward,
            module: quest.module || 'productivity',
            questName: quest.name,
            questTitle: quest.title || quest.name,
            questDescription: quest.description,
            creditReward: quest.creditsReward || 0,
          });

          syncQuestCompletionToSupabase({
            ...quest,
            progress,
            target,
            completed: true,
          });
        }
      },

      // ============================================================
      // QUEST CHAINS
      // ============================================================

      startQuestChain: (chainId) => {
        const template = QUEST_CHAIN_TEMPLATES.find(c => c.id === chainId);
        if (!template) return false;

        set(state => ({
          questChains: {
            ...state.questChains,
            [chainId]: {
              started: true,
              currentStep: 1,
              completedSteps: [],
              progress: {}, // Track progress for current step
              startedAt: new Date().toISOString(),
              completedAt: null,
            }
          }
        }));

        return true;
      },

      getQuestChainProgress: (chainId) => {
        const { questChains } = get();
        const template = QUEST_CHAIN_TEMPLATES.find(c => c.id === chainId);

        if (!template) return null;

        const userProgress = questChains[chainId] || {
          started: false,
          currentStep: 0,
          completedSteps: [],
          progress: {},
        };

        return {
          ...template,
          ...userProgress,
          percentComplete: (userProgress.completedSteps.length / template.totalSteps) * 100,
          currentStepData: template.steps[userProgress.currentStep - 1] || null,
          isComplete: userProgress.completedSteps.length === template.totalSteps,
        };
      },

      updateQuestChainProgress: (chainId, stepProgress) => {
        const { questChains } = get();
        const chain = questChains[chainId];
        const template = QUEST_CHAIN_TEMPLATES.find(c => c.id === chainId);

        if (!chain || !template) return;

        const currentStepData = template.steps[chain.currentStep - 1];
        if (!currentStepData) return;

        const requirement = currentStepData.requirement;
        const targetValue = requirement.count || Object.values(requirement).find(v => typeof v === 'number') || 1;
        const isStepComplete = stepProgress >= targetValue;

        set(state => {
          const updatedChain = {
            ...chain,
            progress: { ...chain.progress, [chain.currentStep]: stepProgress },
          };

          if (isStepComplete && !chain.completedSteps.includes(chain.currentStep)) {
            updatedChain.completedSteps = [...chain.completedSteps, chain.currentStep];
            updatedChain.currentStep = chain.currentStep + 1;

            // Check if entire chain is complete
            if (updatedChain.completedSteps.length === template.totalSteps) {
              updatedChain.completedAt = new Date().toISOString();
            }
          }

          // Trigger unified gamification if entire chain is complete
          if (isStepComplete && updatedChain.completedSteps.length === template.totalSteps) {
            // Play epic achievement sound for completing a quest chain
            feedback.achievement();

            triggerGamification('questChainCompleted', {
              xpOverride: template.rewards.xp,
              module: template.module || 'productivity',
              questName: template.name,
              questTitle: template.title || template.name,
              questDescription: template.description || `Completed ${template.totalSteps}-step quest chain!`,
              creditReward: template.rewards.credits || 0,
            });
          }

          return {
            questChains: {
              ...state.questChains,
              [chainId]: updatedChain,
            },
            questStats: isStepComplete && updatedChain.completedSteps.length === template.totalSteps ? {
              ...state.questStats,
              chainsCompleted: state.questStats.chainsCompleted + 1,
              totalXPEarned: state.questStats.totalXPEarned + template.rewards.xp,
              totalCreditsEarned: state.questStats.totalCreditsEarned + template.rewards.credits,
            } : state.questStats,
          };
        });
      },

      getAllQuestChains: () => {
        const { questChains } = get();

        return QUEST_CHAIN_TEMPLATES.map(template => {
          const userProgress = questChains[template.id] || {
            started: false,
            currentStep: 0,
            completedSteps: [],
            progress: {},
          };

          return {
            ...template,
            ...userProgress,
            percentComplete: userProgress.started
              ? (userProgress.completedSteps.length / template.totalSteps) * 100
              : 0,
            isComplete: userProgress.completedSteps.length === template.totalSteps,
          };
        });
      },

      // ============================================================
      // BOSS BATTLES
      // ============================================================

      startBossBattle: (bossId) => {
        const template = BOSS_BATTLE_TEMPLATES.find(b => b.id === bossId);
        if (!template) return false;

        // Check if already fighting this boss
        const { activeBossBattles } = get();
        if (activeBossBattles.some(b => b.templateId === bossId)) return false;

        const newBattle = {
          ...template,
          id: `boss-${Date.now()}-${bossId}`,
          templateId: bossId,
          currentHealth: template.health,
          playerHealth: 100,
          damageDealt: 0,
          tasksCompleted: 0,
          tasksFailed: 0,
          startedAt: new Date().toISOString(),
          endsAt: template.duration === 'weekly'
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          defeated: false,
          playerDefeated: false,
        };

        set(state => ({
          activeBossBattles: [...state.activeBossBattles, newBattle],
        }));

        return true;
      },

      dealDamageToBoss: (battleId, tasksCompleted = 1) => {
        set(state => {
          const battles = state.activeBossBattles;
          const battleIndex = battles.findIndex(b => b.id === battleId);

          if (battleIndex === -1) return state;

          const battle = battles[battleIndex];
          const damage = tasksCompleted * battle.damagePerTask;
          const newHealth = Math.max(0, battle.currentHealth - damage);
          const isDefeated = newHealth === 0;

          const updatedBattle = {
            ...battle,
            currentHealth: newHealth,
            damageDealt: battle.damageDealt + damage,
            tasksCompleted: battle.tasksCompleted + tasksCompleted,
            defeated: isDefeated,
            completedAt: isDefeated ? new Date().toISOString() : null,
          };

          const updatedBattles = [...battles];

          if (isDefeated) {
            // Play epic level up sound for defeating a boss!
            feedback.levelUp();

            // Trigger unified gamification for defeating boss
            triggerGamification('bossDefeated', {
              xpOverride: battle.xpReward,
              module: 'productivity',
            });

            // Move to completed
            updatedBattles.splice(battleIndex, 1);
            return {
              activeBossBattles: updatedBattles,
              completedBossBattles: [...state.completedBossBattles, updatedBattle],
              questStats: {
                ...state.questStats,
                bossesDefeated: state.questStats.bossesDefeated + 1,
                totalXPEarned: state.questStats.totalXPEarned + battle.xpReward,
                totalCreditsEarned: state.questStats.totalCreditsEarned + battle.creditsReward,
              },
            };
          }

          updatedBattles[battleIndex] = updatedBattle;
          return { activeBossBattles: updatedBattles };
        });
      },

      bossAttacksPlayer: (battleId, tasksFailed = 1) => {
        set(state => {
          const battles = state.activeBossBattles;
          const battleIndex = battles.findIndex(b => b.id === battleId);

          if (battleIndex === -1) return state;

          const battle = battles[battleIndex];
          if (!battle.attacksBack) return state;

          const damage = tasksFailed * battle.playerHealthPenalty;
          const newHealth = Math.max(0, battle.playerHealth - damage);
          const playerDefeated = newHealth === 0;

          const updatedBattle = {
            ...battle,
            playerHealth: newHealth,
            tasksFailed: battle.tasksFailed + tasksFailed,
            playerDefeated,
          };

          const updatedBattles = [...battles];

          if (playerDefeated) {
            // Player lost - move to completed as failed
            updatedBattles.splice(battleIndex, 1);
            return {
              activeBossBattles: updatedBattles,
              completedBossBattles: [...state.completedBossBattles, { ...updatedBattle, completedAt: new Date().toISOString() }],
            };
          }

          updatedBattles[battleIndex] = updatedBattle;
          return { activeBossBattles: updatedBattles };
        });
      },

      getActiveBossBattles: () => {
        return get().activeBossBattles;
      },

      // ============================================================
      // UTILITIES
      // ============================================================

      getQuestStats: () => {
        return get().questStats;
      },

      // ============================================================
      // AUTO-COMPLETION SYSTEM
      // Automatically checks and updates quest progress based on stats
      // ============================================================

      /**
       * Check all active quests against current stats and auto-complete if conditions are met
       * This is called after any action that could affect quest progress
       */
      checkAndUpdateQuestProgress: () => {
        const achievementsStore = useAchievementsStore.getState();
        const stats = achievementsStore.stats;
        const weekKey = getWeekKey();
        const monthKey = getMonthKey();
        const newlyCompletedQuests = [];

        // Helper to get current stat value for a requirement type
        const getStatValue = (requirementType, requirement) => {
          const statName = QUEST_REQUIREMENT_TO_STAT[requirementType];
          if (!statName) return null;

          let value = stats[statName] || 0;

          // Handle special conversions
          if (requirementType === 'reading_minutes') {
            // Convert hours to minutes for comparison
            value = value * 60;
          }

          return value;
        };

        // Helper to check multi-stat requirements
        const checkMultiStatRequirement = (requirement) => {
          switch (requirement.type) {
            case 'workouts_and_streak':
              return {
                met: (stats.workouts || 0) >= requirement.workouts &&
                     (stats.workoutStreakDays || 0) >= requirement.streak,
                progress: Math.min(stats.workouts || 0, requirement.workouts)
              };
            case 'reading_and_books':
              return {
                met: (stats.readingHours || 0) >= requirement.hours &&
                     (stats.booksCompleted || 0) >= requirement.books,
                progress: Math.min(stats.readingHours || 0, requirement.hours)
              };
            case 'books_and_notes':
              return {
                met: (stats.booksCompleted || 0) >= requirement.books &&
                     (stats.notesCreated || 0) >= requirement.notes,
                progress: Math.min(stats.booksCompleted || 0, requirement.books)
              };
            default:
              return { met: false, progress: 0 };
          }
        };

        // Check weekly quests
        const weeklyQuests = get().weeklyQuests[weekKey] || [];
        weeklyQuests.forEach(quest => {
          if (quest.completed) return;

          const { requirement } = quest;
          let currentProgress = 0;

          // Handle multi-stat requirements
          if (QUEST_REQUIREMENT_TO_STAT[requirement.type] === null) {
            const result = checkMultiStatRequirement(requirement);
            if (result.met) {
              get().updateWeeklyQuestProgress(quest.id, requirement.count || 1, weekKey);
              newlyCompletedQuests.push({ ...quest, type: 'weekly' });
            }
            return;
          }

          // Get stat value for this requirement
          currentProgress = getStatValue(requirement.type, requirement);
          if (currentProgress === null) return;

          // Update quest progress if changed
          if (currentProgress !== quest.progress) {
            const willComplete = currentProgress >= requirement.count;
            get().updateWeeklyQuestProgress(quest.id, currentProgress, weekKey);
            if (willComplete) {
              newlyCompletedQuests.push({ ...quest, type: 'weekly' });
            }
          }
        });

        // Check monthly quests
        const monthlyQuests = get().monthlyQuests[monthKey] || [];
        monthlyQuests.forEach(quest => {
          if (quest.completed) return;

          const { requirement } = quest;
          let currentProgress = 0;

          // Handle multi-stat requirements
          if (QUEST_REQUIREMENT_TO_STAT[requirement.type] === null) {
            const result = checkMultiStatRequirement(requirement);
            if (result.met) {
              const target = requirement.count || Object.values(requirement).find(v => typeof v === 'number') || 1;
              get().updateMonthlyQuestProgress(quest.id, target, monthKey);
              newlyCompletedQuests.push({ ...quest, type: 'monthly' });
            }
            return;
          }

          // Get stat value for this requirement
          currentProgress = getStatValue(requirement.type, requirement);
          if (currentProgress === null) return;

          // Update quest progress if changed
          if (currentProgress !== quest.progress) {
            const willComplete = currentProgress >= requirement.count;
            get().updateMonthlyQuestProgress(quest.id, currentProgress, monthKey);
            if (willComplete) {
              newlyCompletedQuests.push({ ...quest, type: 'monthly' });
            }
          }
        });

        // Check quest chains
        const { questChains } = get();
        Object.entries(questChains).forEach(([chainId, chainProgress]) => {
          if (!chainProgress.started || chainProgress.completedAt) return;

          const template = QUEST_CHAIN_TEMPLATES.find(c => c.id === chainId);
          if (!template) return;

          const currentStep = template.steps[chainProgress.currentStep - 1];
          if (!currentStep) return;

          const { requirement } = currentStep;

          // Handle multi-stat requirements
          if (QUEST_REQUIREMENT_TO_STAT[requirement.type] === null) {
            const result = checkMultiStatRequirement(requirement);
            if (result.met) {
              const target = requirement.count || Object.values(requirement).find(v => typeof v === 'number') || 1;
              get().updateQuestChainProgress(chainId, target);
            }
            return;
          }

          // Get stat value for this requirement
          const currentProgress = getStatValue(requirement.type, requirement);
          if (currentProgress === null) return;

          // Update chain progress if changed
          const existingProgress = chainProgress.progress[chainProgress.currentStep] || 0;
          if (currentProgress > existingProgress) {
            get().updateQuestChainProgress(chainId, currentProgress);
          }
        });

        // Check boss battles
        const activeBossBattles = get().activeBossBattles;
        activeBossBattles.forEach(battle => {
          if (battle.defeated || battle.playerDefeated) return;

          const { requirements } = battle;
          if (!requirements) return;

          const currentProgress = getStatValue(requirements.type, requirements);
          if (currentProgress === null) return;

          // Calculate damage based on progress
          const tasksCompleted = currentProgress - battle.tasksCompleted;
          if (tasksCompleted > 0) {
            const healthBefore = battle.bossHealth;
            get().dealDamageToBoss(battle.id, tasksCompleted);
            // Check if boss was defeated
            const updatedBattle = get().activeBossBattles.find(b => b.id === battle.id);
            if (updatedBattle?.defeated && !battle.defeated) {
              newlyCompletedQuests.push({ ...battle, type: 'boss', name: battle.bossName || 'Boss Battle' });
            }
          }
        });

        // Return newly completed quests for celebration
        return newlyCompletedQuests;
      },

      getRecentCompletedQuests: (limit = 10) => {
        const { completedQuests } = get();
        return completedQuests
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
          .slice(0, limit);
      },

      // Get summary for dashboard
      getQuestSummary: () => {
        const weeklyQuests = get().getWeeklyQuests();
        const monthlyQuests = get().getMonthlyQuests();
        const bossBattles = get().getActiveBossBattles();
        const chains = get().getAllQuestChains();

        return {
          weekly: {
            total: weeklyQuests.length,
            completed: weeklyQuests.filter(q => q.completed).length,
            inProgress: weeklyQuests.filter(q => !q.completed && q.progress > 0).length,
          },
          monthly: {
            total: monthlyQuests.length,
            completed: monthlyQuests.filter(q => q.completed).length,
            inProgress: monthlyQuests.filter(q => !q.completed && q.progress > 0).length,
          },
          bossBattles: {
            active: bossBattles.length,
            healthRemaining: bossBattles.reduce((sum, b) => sum + b.currentHealth, 0),
          },
          chains: {
            started: chains.filter(c => c.started).length,
            completed: chains.filter(c => c.isComplete).length,
            available: chains.filter(c => !c.started).length,
          },
        };
      },
    }),
    {
      name: 'quests-storage',
      partialize: (state) => ({
        weeklyQuests: state.weeklyQuests,
        monthlyQuests: state.monthlyQuests,
        questChains: state.questChains,
        activeBossBattles: state.activeBossBattles,
        completedBossBattles: state.completedBossBattles,
        questStats: state.questStats,
        completedQuests: state.completedQuests,
      }),
    }
  )
);

// Initialize function for App.jsx
export const initializeQuestsStore = async () => {
  return useQuestsStore.getState().initializeFromSupabase();
};

export default useQuestsStore;
