/**
 * Achievements Store
 * Manages badges, achievements, and unlockable rewards
 * Integrates with questsStore, dailyTasksStore, and other LifeOS modules
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { DEV_USER_ID } from '../lib/dev-auth';
import { triggerGamification } from '../hooks/useGamification';

// Achievement Categories
export const ACHIEVEMENT_CATEGORIES = {
  quests: { id: 'quests', name: 'Quests', icon: '🎯', color: 'from-purple-500 to-pink-500' },
  productivity: { id: 'productivity', name: 'Productivity', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  health: { id: 'health', name: 'Health & Fitness', icon: '💪', color: 'from-green-500 to-emerald-500' },
  knowledge: { id: 'knowledge', name: 'Knowledge', icon: '📚', color: 'from-blue-500 to-cyan-500' },
  financial: { id: 'financial', name: 'Financial', icon: '💰', color: 'from-emerald-500 to-teal-500' },
  journal: { id: 'journal', name: 'Journal', icon: '✍️', color: 'from-amber-500 to-orange-500' },
  streaks: { id: 'streaks', name: 'Streaks', icon: '🔥', color: 'from-orange-500 to-red-500' },
  special: { id: 'special', name: 'Special', icon: '✨', color: 'from-violet-500 to-purple-500' },
  milestones: { id: 'milestones', name: 'Milestones', icon: '🏆', color: 'from-yellow-400 to-amber-500' },
};

// Achievement Rarity Levels
export const ACHIEVEMENT_RARITY = {
  common: { label: 'Common', color: 'from-gray-400 to-gray-500', xpMultiplier: 1 },
  uncommon: { label: 'Uncommon', color: 'from-green-400 to-emerald-500', xpMultiplier: 1.5 },
  rare: { label: 'Rare', color: 'from-blue-400 to-cyan-500', xpMultiplier: 2 },
  epic: { label: 'Epic', color: 'from-purple-400 to-pink-500', xpMultiplier: 3 },
  legendary: { label: 'Legendary', color: 'from-yellow-400 to-orange-500', xpMultiplier: 5 },
};

// Pre-defined Achievement Templates
export const ACHIEVEMENT_TEMPLATES = [
  // Quest Achievements
  {
    id: 'first_quest',
    title: 'First Steps',
    description: 'Complete your first quest',
    category: 'quests',
    rarity: 'common',
    icon: '🎯',
    requirement: { type: 'quests_completed', count: 1 },
    xpReward: 50,
    creditsReward: 25,
  },
  {
    id: 'quest_novice',
    title: 'Quest Novice',
    description: 'Complete 10 quests',
    category: 'quests',
    rarity: 'common',
    icon: '🎯',
    requirement: { type: 'quests_completed', count: 10 },
    xpReward: 150,
    creditsReward: 75,
  },
  {
    id: 'quest_apprentice',
    title: 'Quest Apprentice',
    description: 'Complete 50 quests',
    category: 'quests',
    rarity: 'uncommon',
    icon: '🎯',
    requirement: { type: 'quests_completed', count: 50 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'quest_master',
    title: 'Quest Master',
    description: 'Complete 200 quests',
    category: 'quests',
    rarity: 'rare',
    icon: '🎯',
    requirement: { type: 'quests_completed', count: 200 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'quest_legend',
    title: 'Quest Legend',
    description: 'Complete 500 quests',
    category: 'quests',
    rarity: 'epic',
    icon: '👑',
    requirement: { type: 'quests_completed', count: 500 },
    xpReward: 3000,
    creditsReward: 1500,
  },
  {
    id: 'weekly_warrior',
    title: 'Weekly Warrior',
    description: 'Complete all weekly quests in a single week',
    category: 'quests',
    rarity: 'rare',
    icon: '📅',
    requirement: { type: 'weekly_perfect', count: 1 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'monthly_champion',
    title: 'Monthly Champion',
    description: 'Complete all monthly epic quests',
    category: 'quests',
    rarity: 'epic',
    icon: '🏆',
    requirement: { type: 'monthly_perfect', count: 1 },
    xpReward: 3000,
    creditsReward: 1500,
  },
  {
    id: 'chain_breaker',
    title: 'Chain Breaker',
    description: 'Complete your first quest chain',
    category: 'quests',
    rarity: 'rare',
    icon: '⛓️',
    requirement: { type: 'chains_completed', count: 1 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'boss_slayer',
    title: 'Boss Slayer',
    description: 'Defeat your first boss',
    category: 'quests',
    rarity: 'rare',
    icon: '🐉',
    requirement: { type: 'bosses_defeated', count: 1 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'dragon_hunter',
    title: 'Dragon Hunter',
    description: 'Defeat 5 bosses',
    category: 'quests',
    rarity: 'epic',
    icon: '🗡️',
    requirement: { type: 'bosses_defeated', count: 5 },
    xpReward: 3000,
    creditsReward: 1500,
  },

  // Streak Achievements
  {
    id: 'streak_starter',
    title: 'Streak Starter',
    description: 'Reach a 3-day streak',
    category: 'streaks',
    rarity: 'common',
    icon: '🔥',
    requirement: { type: 'streak_days', count: 3 },
    xpReward: 50,
    creditsReward: 25,
  },
  {
    id: 'one_week',
    title: 'One Week Wonder',
    description: 'Reach a 7-day streak',
    category: 'streaks',
    rarity: 'common',
    icon: '🔥',
    requirement: { type: 'streak_days', count: 7 },
    xpReward: 150,
    creditsReward: 75,
  },
  {
    id: 'two_weeks',
    title: 'Fortnight Force',
    description: 'Reach a 14-day streak',
    category: 'streaks',
    rarity: 'uncommon',
    icon: '🔥',
    requirement: { type: 'streak_days', count: 14 },
    xpReward: 350,
    creditsReward: 175,
  },
  {
    id: 'one_month',
    title: 'Monthly Master',
    description: 'Reach a 30-day streak',
    category: 'streaks',
    rarity: 'rare',
    icon: '🔥',
    requirement: { type: 'streak_days', count: 30 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'streak_legend',
    title: 'Unstoppable',
    description: 'Reach a 100-day streak',
    category: 'streaks',
    rarity: 'legendary',
    icon: '💎',
    requirement: { type: 'streak_days', count: 100 },
    xpReward: 5000,
    creditsReward: 2500,
  },

  // Productivity Achievements
  {
    id: 'deep_work_1',
    title: 'Deep Focus',
    description: 'Log your first hour of deep work',
    category: 'productivity',
    rarity: 'common',
    icon: '🎯',
    requirement: { type: 'deep_work_hours', count: 1 },
    xpReward: 50,
    creditsReward: 25,
  },
  {
    id: 'deep_work_10',
    title: 'Focus Champion',
    description: 'Log 10 hours of deep work',
    category: 'productivity',
    rarity: 'uncommon',
    icon: '⚡',
    requirement: { type: 'deep_work_hours', count: 10 },
    xpReward: 300,
    creditsReward: 150,
  },
  {
    id: 'deep_work_100',
    title: 'Deep Work Master',
    description: 'Log 100 hours of deep work',
    category: 'productivity',
    rarity: 'rare',
    icon: '🧠',
    requirement: { type: 'deep_work_hours', count: 100 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'task_slayer',
    title: 'Task Slayer',
    description: 'Complete 100 tasks',
    category: 'productivity',
    rarity: 'uncommon',
    icon: '✅',
    requirement: { type: 'tasks_completed', count: 100 },
    xpReward: 500,
    creditsReward: 250,
  },

  // Health Achievements
  {
    id: 'first_workout',
    title: 'First Sweat',
    description: 'Complete your first workout',
    category: 'health',
    rarity: 'common',
    icon: '💪',
    requirement: { type: 'workouts', count: 1 },
    xpReward: 50,
    creditsReward: 25,
  },
  {
    id: 'workout_10',
    title: 'Gym Rookie',
    description: 'Complete 10 workouts',
    category: 'health',
    rarity: 'common',
    icon: '💪',
    requirement: { type: 'workouts', count: 10 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'workout_50',
    title: 'Fitness Enthusiast',
    description: 'Complete 50 workouts',
    category: 'health',
    rarity: 'uncommon',
    icon: '🏋️',
    requirement: { type: 'workouts', count: 50 },
    xpReward: 750,
    creditsReward: 375,
  },
  {
    id: 'workout_100',
    title: 'Iron Will',
    description: 'Complete 100 workouts',
    category: 'health',
    rarity: 'rare',
    icon: '🥇',
    requirement: { type: 'workouts', count: 100 },
    xpReward: 2000,
    creditsReward: 1000,
  },

  // Knowledge Achievements
  {
    id: 'first_book',
    title: 'Page Turner',
    description: 'Finish your first book',
    category: 'knowledge',
    rarity: 'common',
    icon: '📖',
    requirement: { type: 'books_completed', count: 1 },
    xpReward: 100,
    creditsReward: 50,
  },
  {
    id: 'bookworm',
    title: 'Bookworm',
    description: 'Finish 10 books',
    category: 'knowledge',
    rarity: 'uncommon',
    icon: '📚',
    requirement: { type: 'books_completed', count: 10 },
    xpReward: 750,
    creditsReward: 375,
  },
  {
    id: 'reading_10h',
    title: 'Avid Reader',
    description: 'Read for 10 hours total',
    category: 'knowledge',
    rarity: 'common',
    icon: '📕',
    requirement: { type: 'reading_hours', count: 10 },
    xpReward: 200,
    creditsReward: 100,
  },

  // Financial Achievements
  {
    id: 'budget_master',
    title: 'Budget Master',
    description: 'Stay under budget for a full month',
    category: 'financial',
    rarity: 'rare',
    icon: '💰',
    requirement: { type: 'under_budget_months', count: 1 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'expense_tracker',
    title: 'Expense Tracker',
    description: 'Log 100 expenses',
    category: 'financial',
    rarity: 'uncommon',
    icon: '💳',
    requirement: { type: 'expenses_logged', count: 100 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'saver',
    title: 'Smart Saver',
    description: 'Create your first savings goal',
    category: 'financial',
    rarity: 'common',
    icon: '🐷',
    requirement: { type: 'savings_goals_created', count: 1 },
    xpReward: 100,
    creditsReward: 50,
  },
  // NEW Savings Goal Achievements
  {
    id: 'first_contribution',
    title: 'First Deposit',
    description: 'Make your first contribution to a savings goal',
    category: 'financial',
    rarity: 'common',
    icon: '💵',
    requirement: { type: 'savings_contributions', count: 1 },
    xpReward: 50,
    creditsReward: 25,
  },
  {
    id: 'contribution_10',
    title: 'Consistent Saver',
    description: 'Make 10 contributions to savings goals',
    category: 'financial',
    rarity: 'common',
    icon: '💵',
    requirement: { type: 'savings_contributions', count: 10 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'contribution_50',
    title: 'Dedicated Saver',
    description: 'Make 50 contributions to savings goals',
    category: 'financial',
    rarity: 'uncommon',
    icon: '💰',
    requirement: { type: 'savings_contributions', count: 50 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'contribution_100',
    title: 'Savings Master',
    description: 'Make 100 contributions to savings goals',
    category: 'financial',
    rarity: 'rare',
    icon: '🏦',
    requirement: { type: 'savings_contributions', count: 100 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'goal_25_percent',
    title: 'Quarter Way There',
    description: 'Reach 25% on any savings goal',
    category: 'financial',
    rarity: 'common',
    icon: '📊',
    requirement: { type: 'savings_milestone_25', count: 1 },
    xpReward: 100,
    creditsReward: 50,
  },
  {
    id: 'goal_50_percent',
    title: 'Halfway Hero',
    description: 'Reach 50% on any savings goal',
    category: 'financial',
    rarity: 'uncommon',
    icon: '📈',
    requirement: { type: 'savings_milestone_50', count: 1 },
    xpReward: 250,
    creditsReward: 125,
  },
  {
    id: 'goal_75_percent',
    title: 'Almost There',
    description: 'Reach 75% on any savings goal',
    category: 'financial',
    rarity: 'rare',
    icon: '🎯',
    requirement: { type: 'savings_milestone_75', count: 1 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'first_goal_complete',
    title: 'Goal Achiever',
    description: 'Complete your first savings goal',
    category: 'financial',
    rarity: 'rare',
    icon: '🏆',
    requirement: { type: 'savings_goals_completed', count: 1 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'goals_3_complete',
    title: 'Goal Crusher',
    description: 'Complete 3 savings goals',
    category: 'financial',
    rarity: 'epic',
    icon: '👑',
    requirement: { type: 'savings_goals_completed', count: 3 },
    xpReward: 2000,
    creditsReward: 1000,
  },
  {
    id: 'goals_10_complete',
    title: 'Financial Freedom',
    description: 'Complete 10 savings goals',
    category: 'financial',
    rarity: 'legendary',
    icon: '🌟',
    requirement: { type: 'savings_goals_completed', count: 10 },
    xpReward: 5000,
    creditsReward: 2500,
  },
  {
    id: 'savings_streak_4',
    title: 'Saving Habit',
    description: 'Maintain a 4-week savings streak',
    category: 'financial',
    rarity: 'uncommon',
    icon: '🔥',
    requirement: { type: 'savings_streak_weeks', count: 4 },
    xpReward: 400,
    creditsReward: 200,
  },
  {
    id: 'savings_streak_12',
    title: 'Quarterly Saver',
    description: 'Maintain a 12-week savings streak',
    category: 'financial',
    rarity: 'rare',
    icon: '🔥',
    requirement: { type: 'savings_streak_weeks', count: 12 },
    xpReward: 1200,
    creditsReward: 600,
  },
  {
    id: 'savings_streak_52',
    title: 'Year of Savings',
    description: 'Maintain a 52-week savings streak',
    category: 'financial',
    rarity: 'legendary',
    icon: '💎',
    requirement: { type: 'savings_streak_weeks', count: 52 },
    xpReward: 5000,
    creditsReward: 2500,
  },
  {
    id: 'total_saved_1000',
    title: 'First Thousand',
    description: 'Save £1,000 total across all goals',
    category: 'financial',
    rarity: 'uncommon',
    icon: '💷',
    requirement: { type: 'total_saved', count: 1000 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'total_saved_5000',
    title: 'Five Grand Saver',
    description: 'Save £5,000 total across all goals',
    category: 'financial',
    rarity: 'rare',
    icon: '💰',
    requirement: { type: 'total_saved', count: 5000 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'total_saved_10000',
    title: 'Five Figure Saver',
    description: 'Save £10,000 total across all goals',
    category: 'financial',
    rarity: 'epic',
    icon: '🏦',
    requirement: { type: 'total_saved', count: 10000 },
    xpReward: 3000,
    creditsReward: 1500,
  },

  // Journal Achievements
  {
    id: 'first_entry',
    title: 'Dear Diary',
    description: 'Write your first journal entry',
    category: 'journal',
    rarity: 'common',
    icon: '✍️',
    requirement: { type: 'journal_entries', count: 1 },
    xpReward: 50,
    creditsReward: 25,
  },
  {
    id: 'journal_10',
    title: 'Reflector',
    description: 'Write 10 journal entries',
    category: 'journal',
    rarity: 'common',
    icon: '📝',
    requirement: { type: 'journal_entries', count: 10 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'journal_50',
    title: 'Chronicler',
    description: 'Write 50 journal entries',
    category: 'journal',
    rarity: 'uncommon',
    icon: '📔',
    requirement: { type: 'journal_entries', count: 50 },
    xpReward: 750,
    creditsReward: 375,
  },

  // Milestone Achievements
  {
    id: 'level_10',
    title: 'Rising Star',
    description: 'Reach level 10',
    category: 'milestones',
    rarity: 'common',
    icon: '⭐',
    requirement: { type: 'level', count: 10 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'level_25',
    title: 'Champion',
    description: 'Reach level 25',
    category: 'milestones',
    rarity: 'rare',
    icon: '🏅',
    requirement: { type: 'level', count: 25 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'level_50',
    title: 'Legend',
    description: 'Reach level 50',
    category: 'milestones',
    rarity: 'epic',
    icon: '👑',
    requirement: { type: 'level', count: 50 },
    xpReward: 5000,
    creditsReward: 2500,
  },
  {
    id: 'xp_1000',
    title: 'XP Hunter',
    description: 'Earn 1,000 total XP',
    category: 'milestones',
    rarity: 'common',
    icon: '✨',
    requirement: { type: 'total_xp', count: 1000 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'xp_10000',
    title: 'XP Collector',
    description: 'Earn 10,000 total XP',
    category: 'milestones',
    rarity: 'uncommon',
    icon: '💫',
    requirement: { type: 'total_xp', count: 10000 },
    xpReward: 1000,
    creditsReward: 500,
  },

  // Special Achievements
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a quest after midnight',
    category: 'special',
    rarity: 'uncommon',
    icon: '🦉',
    requirement: { type: 'special_night_owl', count: 1 },
    xpReward: 300,
    creditsReward: 150,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a quest before 6am',
    category: 'special',
    rarity: 'uncommon',
    icon: '🌅',
    requirement: { type: 'special_early_bird', count: 1 },
    xpReward: 300,
    creditsReward: 150,
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete all daily quests 7 days in a row',
    category: 'special',
    rarity: 'epic',
    icon: '💎',
    requirement: { type: 'perfect_days', count: 7 },
    xpReward: 2000,
    creditsReward: 1000,
  },
  {
    id: 'life_optimizer',
    title: 'Life Optimizer',
    description: 'Use all 5 core modules in a single day',
    category: 'special',
    rarity: 'rare',
    icon: '🌟',
    requirement: { type: 'all_modules_day', count: 1 },
    xpReward: 1000,
    creditsReward: 500,
  },

  // ==========================================
  // NEW HEALTH & FITNESS ACHIEVEMENTS
  // ==========================================

  // Perfect Week Achievements
  {
    id: 'perfect_workout_week',
    title: '7-Day Warrior',
    description: 'Complete a workout every day for a week',
    category: 'health',
    rarity: 'rare',
    icon: '🗓️',
    requirement: { type: 'workout_streak_days', count: 7 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'workout_streak_30',
    title: 'Gym Rat',
    description: 'Workout for 30 consecutive days',
    category: 'health',
    rarity: 'epic',
    icon: '🐀',
    requirement: { type: 'workout_streak_days', count: 30 },
    xpReward: 3000,
    creditsReward: 1500,
  },

  // Personal Records
  {
    id: 'first_pr',
    title: 'Personal Best',
    description: 'Set your first personal record',
    category: 'health',
    rarity: 'common',
    icon: '🏅',
    requirement: { type: 'prs_achieved', count: 1 },
    xpReward: 100,
    creditsReward: 50,
  },
  {
    id: 'pr_hunter_10',
    title: 'PR Hunter',
    description: 'Set 10 personal records',
    category: 'health',
    rarity: 'uncommon',
    icon: '🎯',
    requirement: { type: 'prs_achieved', count: 10 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'pr_collector_50',
    title: 'Record Breaker',
    description: 'Set 50 personal records',
    category: 'health',
    rarity: 'rare',
    icon: '💥',
    requirement: { type: 'prs_achieved', count: 50 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'pr_legend_100',
    title: 'PR Legend',
    description: 'Set 100 personal records',
    category: 'health',
    rarity: 'epic',
    icon: '👑',
    requirement: { type: 'prs_achieved', count: 100 },
    xpReward: 3000,
    creditsReward: 1500,
  },

  // Calorie Milestones
  {
    id: 'burn_1000_cal',
    title: 'Calorie Crusher',
    description: 'Burn 1,000 calories total from workouts',
    category: 'health',
    rarity: 'common',
    icon: '🔥',
    requirement: { type: 'calories_burned', count: 1000 },
    xpReward: 150,
    creditsReward: 75,
  },
  {
    id: 'burn_10000_cal',
    title: 'Fire Starter',
    description: 'Burn 10,000 calories total from workouts',
    category: 'health',
    rarity: 'uncommon',
    icon: '🔥',
    requirement: { type: 'calories_burned', count: 10000 },
    xpReward: 750,
    creditsReward: 375,
  },
  {
    id: 'burn_50000_cal',
    title: 'Furnace',
    description: 'Burn 50,000 calories total from workouts',
    category: 'health',
    rarity: 'rare',
    icon: '🌋',
    requirement: { type: 'calories_burned', count: 50000 },
    xpReward: 2000,
    creditsReward: 1000,
  },
  {
    id: 'burn_100000_cal',
    title: 'Inferno',
    description: 'Burn 100,000 calories total from workouts',
    category: 'health',
    rarity: 'legendary',
    icon: '☄️',
    requirement: { type: 'calories_burned', count: 100000 },
    xpReward: 5000,
    creditsReward: 2500,
  },

  // Volume/Lifting Milestones
  {
    id: 'volume_10k',
    title: 'Getting Started',
    description: 'Lift 10,000 lbs total volume',
    category: 'health',
    rarity: 'common',
    icon: '🏋️',
    requirement: { type: 'total_volume', count: 10000 },
    xpReward: 100,
    creditsReward: 50,
  },
  {
    id: 'volume_100k',
    title: 'Heavy Lifter',
    description: 'Lift 100,000 lbs total volume',
    category: 'health',
    rarity: 'uncommon',
    icon: '🏋️',
    requirement: { type: 'total_volume', count: 100000 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'volume_500k',
    title: 'Powerhouse',
    description: 'Lift 500,000 lbs total volume',
    category: 'health',
    rarity: 'rare',
    icon: '💪',
    requirement: { type: 'total_volume', count: 500000 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'volume_1m',
    title: 'Iron Legend',
    description: 'Lift 1,000,000 lbs total volume',
    category: 'health',
    rarity: 'legendary',
    icon: '🦾',
    requirement: { type: 'total_volume', count: 1000000 },
    xpReward: 5000,
    creditsReward: 2500,
  },

  // Cardio Distance Milestones
  {
    id: 'cardio_10_miles',
    title: 'On The Move',
    description: 'Log 10 total miles of cardio',
    category: 'health',
    rarity: 'common',
    icon: '🏃',
    requirement: { type: 'cardio_miles', count: 10 },
    xpReward: 150,
    creditsReward: 75,
  },
  {
    id: 'cardio_50_miles',
    title: 'Road Warrior',
    description: 'Log 50 total miles of cardio',
    category: 'health',
    rarity: 'uncommon',
    icon: '🛣️',
    requirement: { type: 'cardio_miles', count: 50 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'cardio_100_miles',
    title: 'Century Runner',
    description: 'Log 100 total miles of cardio',
    category: 'health',
    rarity: 'rare',
    icon: '🏅',
    requirement: { type: 'cardio_miles', count: 100 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'cardio_500_miles',
    title: 'Endurance Elite',
    description: 'Log 500 total miles of cardio',
    category: 'health',
    rarity: 'epic',
    icon: '🏆',
    requirement: { type: 'cardio_miles', count: 500 },
    xpReward: 3000,
    creditsReward: 1500,
  },
  {
    id: 'cardio_1000_miles',
    title: 'Ultra Legend',
    description: 'Log 1,000 total miles of cardio',
    category: 'health',
    rarity: 'legendary',
    icon: '🌟',
    requirement: { type: 'cardio_miles', count: 1000 },
    xpReward: 5000,
    creditsReward: 2500,
  },

  // Cardio Sessions
  {
    id: 'cardio_sessions_25',
    title: 'Cardio Starter',
    description: 'Complete 25 cardio sessions',
    category: 'health',
    rarity: 'common',
    icon: '❤️',
    requirement: { type: 'cardio_sessions', count: 25 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'cardio_sessions_100',
    title: 'Cardio Enthusiast',
    description: 'Complete 100 cardio sessions',
    category: 'health',
    rarity: 'rare',
    icon: '❤️‍🔥',
    requirement: { type: 'cardio_sessions', count: 100 },
    xpReward: 1000,
    creditsReward: 500,
  },

  // Nutrition Achievements
  {
    id: 'meal_log_7',
    title: 'Nutrition Tracker',
    description: 'Log meals for 7 consecutive days',
    category: 'health',
    rarity: 'common',
    icon: '🍽️',
    requirement: { type: 'meal_log_streak', count: 7 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'meal_log_30',
    title: 'Nutrition Master',
    description: 'Log meals for 30 consecutive days',
    category: 'health',
    rarity: 'rare',
    icon: '🥗',
    requirement: { type: 'meal_log_streak', count: 30 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'protein_goal_14',
    title: 'Protein Champion',
    description: 'Hit protein goal for 14 consecutive days',
    category: 'health',
    rarity: 'uncommon',
    icon: '🥩',
    requirement: { type: 'protein_goal_streak', count: 14 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'calorie_goal_30',
    title: 'Calorie Conscious',
    description: 'Stay within calorie goal for 30 days',
    category: 'health',
    rarity: 'rare',
    icon: '⚖️',
    requirement: { type: 'calorie_goal_streak', count: 30 },
    xpReward: 1000,
    creditsReward: 500,
  },

  // ==========================================
  // NEW PRODUCTIVITY ACHIEVEMENTS
  // ==========================================

  // Deep Work Extended
  {
    id: 'deep_work_500',
    title: 'Flow State Master',
    description: 'Log 500 hours of deep work',
    category: 'productivity',
    rarity: 'epic',
    icon: '🧘',
    requirement: { type: 'deep_work_hours', count: 500 },
    xpReward: 3000,
    creditsReward: 1500,
  },
  {
    id: 'deep_work_1000',
    title: 'Focus Legend',
    description: 'Log 1,000 hours of deep work',
    category: 'productivity',
    rarity: 'legendary',
    icon: '🔮',
    requirement: { type: 'deep_work_hours', count: 1000 },
    xpReward: 5000,
    creditsReward: 2500,
  },
  {
    id: 'marathon_session',
    title: 'Marathon Session',
    description: 'Complete a 4-hour uninterrupted work block',
    category: 'productivity',
    rarity: 'rare',
    icon: '⏱️',
    requirement: { type: 'longest_work_session', count: 240 },
    xpReward: 1000,
    creditsReward: 500,
  },

  // Task Achievements Extended
  {
    id: 'task_streak_7',
    title: 'Task Streak',
    description: 'Complete at least one task for 7 days straight',
    category: 'productivity',
    rarity: 'common',
    icon: '📋',
    requirement: { type: 'task_streak_days', count: 7 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'task_streak_30',
    title: 'Task Machine',
    description: 'Complete at least one task for 30 days straight',
    category: 'productivity',
    rarity: 'rare',
    icon: '⚙️',
    requirement: { type: 'task_streak_days', count: 30 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'task_blitz',
    title: 'Task Blitz',
    description: 'Complete 10+ tasks in a single day',
    category: 'productivity',
    rarity: 'uncommon',
    icon: '⚡',
    requirement: { type: 'tasks_single_day', count: 10 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'task_500',
    title: 'Task Warrior',
    description: 'Complete 500 tasks',
    category: 'productivity',
    rarity: 'rare',
    icon: '⚔️',
    requirement: { type: 'tasks_completed', count: 500 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'task_1000',
    title: 'Task Terminator',
    description: 'Complete 1,000 tasks',
    category: 'productivity',
    rarity: 'epic',
    icon: '🤖',
    requirement: { type: 'tasks_completed', count: 1000 },
    xpReward: 3000,
    creditsReward: 1500,
  },

  // Project Achievements
  {
    id: 'first_project',
    title: 'Project Pioneer',
    description: 'Complete your first project',
    category: 'productivity',
    rarity: 'common',
    icon: '📁',
    requirement: { type: 'projects_completed', count: 1 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'projects_5',
    title: 'Project Manager',
    description: 'Complete 5 projects',
    category: 'productivity',
    rarity: 'uncommon',
    icon: '📊',
    requirement: { type: 'projects_completed', count: 5 },
    xpReward: 750,
    creditsReward: 375,
  },
  {
    id: 'projects_25',
    title: 'Project Master',
    description: 'Complete 25 projects',
    category: 'productivity',
    rarity: 'rare',
    icon: '🏗️',
    requirement: { type: 'projects_completed', count: 25 },
    xpReward: 2000,
    creditsReward: 1000,
  },

  // ==========================================
  // NEW STREAK ACHIEVEMENTS
  // ==========================================

  {
    id: 'streak_60',
    title: 'Two Month Titan',
    description: 'Reach a 60-day streak',
    category: 'streaks',
    rarity: 'rare',
    icon: '🔥',
    requirement: { type: 'streak_days', count: 60 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'streak_90',
    title: 'Quarter Champion',
    description: 'Reach a 90-day streak',
    category: 'streaks',
    rarity: 'epic',
    icon: '🔥',
    requirement: { type: 'streak_days', count: 90 },
    xpReward: 2500,
    creditsReward: 1250,
  },
  {
    id: 'streak_180',
    title: 'Half Year Hero',
    description: 'Reach a 180-day streak',
    category: 'streaks',
    rarity: 'epic',
    icon: '💎',
    requirement: { type: 'streak_days', count: 180 },
    xpReward: 4000,
    creditsReward: 2000,
  },
  {
    id: 'streak_365',
    title: 'Year of Excellence',
    description: 'Reach a 365-day streak',
    category: 'streaks',
    rarity: 'legendary',
    icon: '👑',
    requirement: { type: 'streak_days', count: 365 },
    xpReward: 10000,
    creditsReward: 5000,
  },

  // Module-Specific Streaks
  {
    id: 'journal_streak_7',
    title: 'Weekly Writer',
    description: 'Journal for 7 consecutive days',
    category: 'journal',
    rarity: 'common',
    icon: '📝',
    requirement: { type: 'journal_streak', count: 7 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'journal_streak_30',
    title: 'Daily Reflector',
    description: 'Journal for 30 consecutive days',
    category: 'journal',
    rarity: 'rare',
    icon: '📓',
    requirement: { type: 'journal_streak', count: 30 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'journal_streak_100',
    title: 'Master Chronicler',
    description: 'Journal for 100 consecutive days',
    category: 'journal',
    rarity: 'epic',
    icon: '📜',
    requirement: { type: 'journal_streak', count: 100 },
    xpReward: 3000,
    creditsReward: 1500,
  },

  // ==========================================
  // NEW KNOWLEDGE ACHIEVEMENTS
  // ==========================================

  {
    id: 'books_25',
    title: 'Bibliophile',
    description: 'Finish 25 books',
    category: 'knowledge',
    rarity: 'rare',
    icon: '📖',
    requirement: { type: 'books_completed', count: 25 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'books_52',
    title: 'Book a Week',
    description: 'Finish 52 books',
    category: 'knowledge',
    rarity: 'epic',
    icon: '📚',
    requirement: { type: 'books_completed', count: 52 },
    xpReward: 3000,
    creditsReward: 1500,
  },
  {
    id: 'books_100',
    title: 'Century Reader',
    description: 'Finish 100 books',
    category: 'knowledge',
    rarity: 'legendary',
    icon: '🏛️',
    requirement: { type: 'books_completed', count: 100 },
    xpReward: 5000,
    creditsReward: 2500,
  },
  {
    id: 'reading_50h',
    title: 'Dedicated Reader',
    description: 'Read for 50 hours total',
    category: 'knowledge',
    rarity: 'uncommon',
    icon: '📕',
    requirement: { type: 'reading_hours', count: 50 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'reading_200h',
    title: 'Scholar',
    description: 'Read for 200 hours total',
    category: 'knowledge',
    rarity: 'rare',
    icon: '🎓',
    requirement: { type: 'reading_hours', count: 200 },
    xpReward: 1500,
    creditsReward: 750,
  },
  {
    id: 'notes_50',
    title: 'Note Taker',
    description: 'Create 50 notes',
    category: 'knowledge',
    rarity: 'common',
    icon: '🗒️',
    requirement: { type: 'notes_created', count: 50 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'notes_200',
    title: 'Knowledge Keeper',
    description: 'Create 200 notes',
    category: 'knowledge',
    rarity: 'uncommon',
    icon: '📋',
    requirement: { type: 'notes_created', count: 200 },
    xpReward: 750,
    creditsReward: 375,
  },
  {
    id: 'ideas_25',
    title: 'Idea Spark',
    description: 'Capture 25 ideas',
    category: 'knowledge',
    rarity: 'common',
    icon: '💡',
    requirement: { type: 'ideas_captured', count: 25 },
    xpReward: 200,
    creditsReward: 100,
  },
  {
    id: 'ideas_100',
    title: 'Idea Machine',
    description: 'Capture 100 ideas',
    category: 'knowledge',
    rarity: 'uncommon',
    icon: '🧠',
    requirement: { type: 'ideas_captured', count: 100 },
    xpReward: 750,
    creditsReward: 375,
  },
  {
    id: 'courses_3',
    title: 'Lifelong Learner',
    description: 'Complete 3 courses',
    category: 'knowledge',
    rarity: 'uncommon',
    icon: '🎯',
    requirement: { type: 'courses_completed', count: 3 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'courses_10',
    title: 'Course Collector',
    description: 'Complete 10 courses',
    category: 'knowledge',
    rarity: 'rare',
    icon: '🏆',
    requirement: { type: 'courses_completed', count: 10 },
    xpReward: 1500,
    creditsReward: 750,
  },

  // ==========================================
  // NEW SPECIAL/TIME-BASED ACHIEVEMENTS
  // ==========================================

  // Time of Day
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Complete tasks on both Saturday and Sunday',
    category: 'special',
    rarity: 'common',
    icon: '🌴',
    requirement: { type: 'weekend_complete', count: 1 },
    xpReward: 150,
    creditsReward: 75,
  },
  {
    id: 'monday_motivator',
    title: 'Monday Motivator',
    description: 'Start your week with a task before 8am on Monday',
    category: 'special',
    rarity: 'uncommon',
    icon: '☀️',
    requirement: { type: 'monday_early', count: 1 },
    xpReward: 300,
    creditsReward: 150,
  },
  {
    id: 'early_riser_streak',
    title: 'Dawn Patrol',
    description: 'Complete tasks before 6am for 7 consecutive days',
    category: 'special',
    rarity: 'rare',
    icon: '🌅',
    requirement: { type: 'early_streak', count: 7 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'night_owl_streak',
    title: 'Midnight Grinder',
    description: 'Complete tasks after 11pm for 7 consecutive days',
    category: 'special',
    rarity: 'rare',
    icon: '🌙',
    requirement: { type: 'night_streak', count: 7 },
    xpReward: 1000,
    creditsReward: 500,
  },

  // Year/Date Milestones
  {
    id: 'new_year_start',
    title: 'New Year, New You',
    description: 'Complete a quest on January 1st',
    category: 'special',
    rarity: 'rare',
    icon: '🎆',
    requirement: { type: 'new_year_quest', count: 1 },
    xpReward: 1000,
    creditsReward: 500,
  },

  // App Usage Milestones
  {
    id: 'first_month',
    title: 'One Month In',
    description: 'Use LifeOS for 30 days',
    category: 'milestones',
    rarity: 'common',
    icon: '📅',
    requirement: { type: 'days_active', count: 30 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'three_months',
    title: 'Quarter Year',
    description: 'Use LifeOS for 90 days',
    category: 'milestones',
    rarity: 'uncommon',
    icon: '📅',
    requirement: { type: 'days_active', count: 90 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'six_months',
    title: 'Half Year Member',
    description: 'Use LifeOS for 180 days',
    category: 'milestones',
    rarity: 'rare',
    icon: '🗓️',
    requirement: { type: 'days_active', count: 180 },
    xpReward: 2000,
    creditsReward: 1000,
  },
  {
    id: 'first_year',
    title: 'Annual Member',
    description: 'Use LifeOS for 365 days',
    category: 'milestones',
    rarity: 'epic',
    icon: '🏆',
    requirement: { type: 'days_active', count: 365 },
    xpReward: 5000,
    creditsReward: 2500,
  },

  // Total Activity Milestones
  {
    id: 'total_activities_100',
    title: 'Getting Active',
    description: 'Log 100 total activities across all modules',
    category: 'milestones',
    rarity: 'common',
    icon: '📊',
    requirement: { type: 'total_activities', count: 100 },
    xpReward: 300,
    creditsReward: 150,
  },
  {
    id: 'total_activities_500',
    title: 'Active User',
    description: 'Log 500 total activities across all modules',
    category: 'milestones',
    rarity: 'uncommon',
    icon: '📈',
    requirement: { type: 'total_activities', count: 500 },
    xpReward: 1000,
    creditsReward: 500,
  },
  {
    id: 'total_activities_1000',
    title: 'Thousand Actions',
    description: 'Log 1,000 total activities across all modules',
    category: 'milestones',
    rarity: 'rare',
    icon: '🚀',
    requirement: { type: 'total_activities', count: 1000 },
    xpReward: 2000,
    creditsReward: 1000,
  },
  {
    id: 'total_activities_5000',
    title: 'Power User',
    description: 'Log 5,000 total activities across all modules',
    category: 'milestones',
    rarity: 'epic',
    icon: '⚡',
    requirement: { type: 'total_activities', count: 5000 },
    xpReward: 5000,
    creditsReward: 2500,
  },

  // Hidden/Easter Egg Achievements
  {
    id: 'triple_threat',
    title: 'Triple Threat',
    description: 'Set 3 personal records in a single workout',
    category: 'special',
    rarity: 'epic',
    icon: '🔱',
    requirement: { type: 'prs_single_workout', count: 3 },
    xpReward: 2000,
    creditsReward: 1000,
  },
  {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    description: 'Return after a 7+ day break and complete a quest',
    category: 'special',
    rarity: 'uncommon',
    icon: '🔄',
    requirement: { type: 'comeback', count: 1 },
    xpReward: 500,
    creditsReward: 250,
  },
  {
    id: 'balanced_week',
    title: 'Life Balance',
    description: 'Use all 8 modules at least once in a single week',
    category: 'special',
    rarity: 'rare',
    icon: '☯️',
    requirement: { type: 'all_modules_week', count: 1 },
    xpReward: 1500,
    creditsReward: 750,
  },
];

const useAchievementsStore = create(
  persist(
    (set, get) => ({
      // Initialize from Supabase
      initializeFromSupabase: async () => {
        try {
          // Load user discoveries (achievements)
          const { data: userDiscoveries, error: discoveriesError } = await supabase
            .from('user_discoveries')
            .select(`
              *,
              discovery:discoveries (*)
            `)
            .eq('user_id', DEV_USER_ID);

          if (discoveriesError) throw discoveriesError;

          // Load achievement progress
          const { data: progressData, error: progressError } = await supabase
            .from('achievement_progress')
            .select('*')
            .eq('user_id', DEV_USER_ID);

          if (progressError) throw progressError;

          // Convert to local format
          const unlockedAchievements = (userDiscoveries || []).map(ud => ({
            achievementId: ud.discovery?.id || ud.discovery_id,
            unlockedAt: ud.earned_at,
            xpEarned: ud.discovery?.xp_reward || 0,
            creditsEarned: ud.discovery?.credits_reward || 0,
          }));

          const achievementProgress = {};
          (progressData || []).forEach(p => {
            achievementProgress[p.discovery_id] = p.current_progress;
          });

          // Calculate totals
          const totalXP = unlockedAchievements.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
          const totalCredits = unlockedAchievements.reduce((sum, a) => sum + (a.creditsEarned || 0), 0);

          set({
            unlockedAchievements,
            achievementProgress,
            totalXPFromAchievements: totalXP,
            totalCreditsFromAchievements: totalCredits,
          });
        } catch (error) {
          console.error('Error initializing achievements from Supabase:', error);
        }
      },

      // State
      unlockedAchievements: [], // Array of { achievementId, unlockedAt, xpEarned, creditsEarned }
      achievementProgress: {}, // { achievementId: currentProgress }
      totalXPFromAchievements: 0,
      totalCreditsFromAchievements: 0,

      // Stats tracking (updated by other modules)
      stats: {
        // Quest stats
        questsCompleted: 0,
        weeklyPerfect: 0,
        monthlyPerfect: 0,
        chainsCompleted: 0,
        bossesDefeated: 0,

        // Streak stats
        streakDays: 0,
        streaksMaintained: 0,
        longestStreak: 0,
        consecutiveDays: 0,

        // Productivity stats
        deepWorkHours: 0,
        tasksCompleted: 0,
        projectsCompleted: 0,
        taskStreakDays: 0,
        tasksSingleDay: 0,
        longestWorkSession: 0,
        pomodorosCompleted: 0,
        timeBlocksCompleted: 0,
        eventsCreated: 0,
        schedulesFollowed: 0,

        // Health & Fitness stats
        workouts: 0,
        workoutStreakDays: 0,
        prsAchieved: 0,
        caloriesBurned: 0,
        totalVolume: 0,
        cardioMiles: 0,
        cardioSessions: 0,
        mealsLogged: 0,
        mealLogStreak: 0,
        proteinGoalStreak: 0,
        proteinGoalsHit: 0,
        calorieGoalStreak: 0,
        caloriesTracked: 0,
        waterIntakeDays: 0,
        sleepLogged: 0,
        weightLogged: 0,

        // Knowledge stats
        booksCompleted: 0,
        readingHours: 0,
        notesCreated: 0,
        ideasCaptured: 0,
        articlesRead: 0,
        podcastsCompleted: 0,
        coursesCompleted: 0,

        // Skills stats
        practiceSessionsCompleted: 0,
        skillsLeveledUp: 0,
        skillsMastered: 0,

        // Financial stats
        underBudgetMonths: 0,
        expensesLogged: 0,
        incomeLogged: 0,
        budgetsCreated: 0,
        sinkingFundsCreated: 0,
        savingsGoalsCreated: 0,
        savingsContributions: 0,
        savingsMilestone25: 0,
        savingsMilestone50: 0,
        savingsMilestone75: 0,
        savingsGoalsCompleted: 0,
        savingsStreakWeeks: 0,
        totalSaved: 0,

        // Journal stats
        journalEntries: 0,
        journalStreak: 0,
        gratitudeEntriesCreated: 0,
        reflectionsCompleted: 0,
        moodEntriesLogged: 0,

        // Social stats
        friendsAdded: 0,
        challengesCompleted: 0,
        challengesCreated: 0,

        // Milestone stats
        level: 1,
        totalXP: 0,
        daysActive: 0,
        totalActivities: 0,
        loginDays: 0,
        modulesVisited: 0,

        // Special/Time-based stats
        perfectDays: 0,
        allModulesDay: 0,
        specialNightOwl: 0,
        specialEarlyBird: 0,
        weekendComplete: 0,
        mondayEarly: 0,
        earlyStreak: 0,
        nightStreak: 0,
        newYearQuest: 0,

        // Hidden achievement stats
        prsSingleWorkout: 0,
        comeback: 0,
        allModulesWeek: 0,
      },

      // ============================================================
      // ACHIEVEMENT METHODS
      // ============================================================

      // Check and unlock achievements based on current stats
      checkAchievements: () => {
        const { stats, unlockedAchievements } = get();
        const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));
        const newUnlocks = [];

        ACHIEVEMENT_TEMPLATES.forEach(achievement => {
          if (unlockedIds.has(achievement.id)) return; // Already unlocked

          const { type, count } = achievement.requirement;
          let currentProgress = 0;

          // Map requirement type to stat
          switch (type) {
            // Quest stats
            case 'quests_completed': currentProgress = stats.questsCompleted; break;
            case 'weekly_perfect': currentProgress = stats.weeklyPerfect; break;
            case 'monthly_perfect': currentProgress = stats.monthlyPerfect; break;
            case 'chains_completed': currentProgress = stats.chainsCompleted; break;
            case 'bosses_defeated': currentProgress = stats.bossesDefeated; break;

            // Streak stats
            case 'streak_days': currentProgress = stats.streakDays; break;
            case 'streaks_maintained': currentProgress = stats.streaksMaintained; break;
            case 'longest_streak': currentProgress = stats.longestStreak; break;
            case 'consecutive_days': currentProgress = stats.consecutiveDays; break;

            // Productivity stats
            case 'deep_work_hours': currentProgress = stats.deepWorkHours; break;
            case 'tasks_completed': currentProgress = stats.tasksCompleted; break;
            case 'projects_completed': currentProgress = stats.projectsCompleted; break;
            case 'task_streak_days': currentProgress = stats.taskStreakDays; break;
            case 'tasks_single_day': currentProgress = stats.tasksSingleDay; break;
            case 'longest_work_session': currentProgress = stats.longestWorkSession; break;
            case 'pomodoros_completed': currentProgress = stats.pomodorosCompleted; break;
            case 'time_blocks_completed': currentProgress = stats.timeBlocksCompleted; break;
            case 'events_created': currentProgress = stats.eventsCreated; break;
            case 'schedules_followed': currentProgress = stats.schedulesFollowed; break;

            // Health & Fitness stats
            case 'workouts': currentProgress = stats.workouts; break;
            case 'workout_streak_days': currentProgress = stats.workoutStreakDays; break;
            case 'prs_achieved': currentProgress = stats.prsAchieved; break;
            case 'calories_burned': currentProgress = stats.caloriesBurned; break;
            case 'total_volume': currentProgress = stats.totalVolume; break;
            case 'cardio_miles': currentProgress = stats.cardioMiles; break;
            case 'cardio_sessions': currentProgress = stats.cardioSessions; break;
            case 'meals_logged': currentProgress = stats.mealsLogged; break;
            case 'meal_log_streak': currentProgress = stats.mealLogStreak; break;
            case 'protein_goal_streak': currentProgress = stats.proteinGoalStreak; break;
            case 'protein_goals_hit': currentProgress = stats.proteinGoalsHit; break;
            case 'calorie_goal_streak': currentProgress = stats.calorieGoalStreak; break;
            case 'calories_tracked': currentProgress = stats.caloriesTracked; break;
            case 'water_intake_days': currentProgress = stats.waterIntakeDays; break;
            case 'sleep_logged': currentProgress = stats.sleepLogged; break;
            case 'weight_logged': currentProgress = stats.weightLogged; break;

            // Knowledge stats
            case 'books_completed': currentProgress = stats.booksCompleted; break;
            case 'reading_hours': currentProgress = stats.readingHours; break;
            case 'notes_created': currentProgress = stats.notesCreated; break;
            case 'ideas_captured': currentProgress = stats.ideasCaptured; break;
            case 'articles_read': currentProgress = stats.articlesRead; break;
            case 'podcasts_completed': currentProgress = stats.podcastsCompleted; break;
            case 'courses_completed': currentProgress = stats.coursesCompleted; break;

            // Skills stats
            case 'practice_sessions_completed': currentProgress = stats.practiceSessionsCompleted; break;
            case 'skills_leveled_up': currentProgress = stats.skillsLeveledUp; break;
            case 'skills_mastered': currentProgress = stats.skillsMastered; break;

            // Financial stats
            case 'under_budget_months': currentProgress = stats.underBudgetMonths; break;
            case 'expenses_logged': currentProgress = stats.expensesLogged; break;
            case 'income_logged': currentProgress = stats.incomeLogged; break;
            case 'budgets_created': currentProgress = stats.budgetsCreated; break;
            case 'sinking_funds_created': currentProgress = stats.sinkingFundsCreated; break;
            case 'savings_goals_created': currentProgress = stats.savingsGoalsCreated; break;
            case 'savings_contributions': currentProgress = stats.savingsContributions; break;
            case 'savings_milestone_25': currentProgress = stats.savingsMilestone25; break;
            case 'savings_milestone_50': currentProgress = stats.savingsMilestone50; break;
            case 'savings_milestone_75': currentProgress = stats.savingsMilestone75; break;
            case 'savings_goals_completed': currentProgress = stats.savingsGoalsCompleted; break;
            case 'savings_streak_weeks': currentProgress = stats.savingsStreakWeeks; break;
            case 'total_saved': currentProgress = stats.totalSaved; break;

            // Journal stats
            case 'journal_entries': currentProgress = stats.journalEntries; break;
            case 'journal_streak': currentProgress = stats.journalStreak; break;
            case 'gratitude_entries_created': currentProgress = stats.gratitudeEntriesCreated; break;
            case 'reflections_completed': currentProgress = stats.reflectionsCompleted; break;
            case 'mood_entries_logged': currentProgress = stats.moodEntriesLogged; break;

            // Social stats
            case 'friends_added': currentProgress = stats.friendsAdded; break;
            case 'challenges_completed': currentProgress = stats.challengesCompleted; break;
            case 'challenges_created': currentProgress = stats.challengesCreated; break;

            // Milestone stats
            case 'level': currentProgress = stats.level; break;
            case 'total_xp': currentProgress = stats.totalXP; break;
            case 'days_active': currentProgress = stats.daysActive; break;
            case 'total_activities': currentProgress = stats.totalActivities; break;
            case 'login_days': currentProgress = stats.loginDays; break;
            case 'modules_visited': currentProgress = stats.modulesVisited; break;

            // Special/Time-based stats
            case 'perfect_days': currentProgress = stats.perfectDays; break;
            case 'all_modules_day': currentProgress = stats.allModulesDay; break;
            case 'special_night_owl': currentProgress = stats.specialNightOwl; break;
            case 'special_early_bird': currentProgress = stats.specialEarlyBird; break;
            case 'weekend_complete': currentProgress = stats.weekendComplete; break;
            case 'monday_early': currentProgress = stats.mondayEarly; break;
            case 'early_streak': currentProgress = stats.earlyStreak; break;
            case 'night_streak': currentProgress = stats.nightStreak; break;
            case 'new_year_quest': currentProgress = stats.newYearQuest; break;

            // Hidden achievement stats
            case 'prs_single_workout': currentProgress = stats.prsSingleWorkout; break;
            case 'comeback': currentProgress = stats.comeback; break;
            case 'all_modules_week': currentProgress = stats.allModulesWeek; break;

            default: currentProgress = 0;
          }

          // Update progress tracking
          set(state => ({
            achievementProgress: {
              ...state.achievementProgress,
              [achievement.id]: currentProgress,
            }
          }));

          // Check if unlocked
          if (currentProgress >= count) {
            newUnlocks.push(achievement);
          }
        });

        // Process new unlocks
        if (newUnlocks.length > 0) {
          const now = new Date().toISOString();
          const newUnlockRecords = newUnlocks.map(a => ({
            achievementId: a.id,
            unlockedAt: now,
            xpEarned: a.xpReward,
            creditsEarned: a.creditsReward,
          }));

          set(state => ({
            unlockedAchievements: [
              ...state.unlockedAchievements,
              ...newUnlockRecords,
            ],
            totalXPFromAchievements: state.totalXPFromAchievements +
              newUnlocks.reduce((sum, a) => sum + a.xpReward, 0),
            totalCreditsFromAchievements: state.totalCreditsFromAchievements +
              newUnlocks.reduce((sum, a) => sum + a.creditsReward, 0),
          }));

          // Trigger unified gamification system for achievement XP
          const totalXP = newUnlocks.reduce((sum, a) => sum + a.xpReward, 0);
          if (totalXP > 0) {
            triggerGamification('achievementUnlocked', {
              xpOverride: totalXP,
              module: 'productivity', // Achievements are general progress
            });
          }

          // Sync achievement unlocks to database
          get().syncAchievementUnlocks(newUnlocks, now);
        }

        return newUnlocks;
      },

      // Sync achievement unlocks to Supabase
      syncAchievementUnlocks: async (achievements, unlockedAt) => {
        try {
          // Insert into user_discoveries (achievements table)
          const discoveryRecords = achievements.map(a => ({
            user_id: DEV_USER_ID,
            discovery_id: a.id,
            earned_at: unlockedAt,
          }));

          const { error: discoveryError } = await supabase
            .from('user_discoveries')
            .upsert(discoveryRecords, { onConflict: 'user_id,discovery_id' });

          if (discoveryError) {
            console.error('Error syncing achievement unlocks:', discoveryError);
          }

          // Award XP and credits via gamification store if available
          const totalXP = achievements.reduce((sum, a) => sum + a.xpReward, 0);
          const totalCredits = achievements.reduce((sum, a) => sum + a.creditsReward, 0);

          if (totalXP > 0 || totalCredits > 0) {
            // Update cosmic currency
            const { data: currentCurrency } = await supabase
              .from('user_cosmic_currency')
              .select('balance')
              .eq('user_id', DEV_USER_ID)
              .maybeSingle();

            if (currentCurrency) {
              await supabase
                .from('user_cosmic_currency')
                .update({ balance: currentCurrency.balance + totalCredits })
                .eq('user_id', DEV_USER_ID);
            }

            // Log the achievement rewards in timeline
            for (const achievement of achievements) {
              await supabase.from('timeline').insert({
                user_id: DEV_USER_ID,
                module: 'achievements',
                entry_type: 'achievement_unlocked',
                title: `Achievement Unlocked: ${achievement.title}`,
                description: achievement.description,
                xp_earned: achievement.xpReward,
                credits_earned: achievement.creditsReward,
                metadata: {
                  achievement_id: achievement.id,
                  rarity: achievement.rarity,
                  category: achievement.category,
                },
              });
            }
          }
        } catch (error) {
          console.error('Error syncing achievements to database:', error);
        }
      },

      // Update a specific stat and check achievements
      updateStat: (statName, value) => {
        set(state => ({
          stats: {
            ...state.stats,
            [statName]: value,
          }
        }));

        // Check for new achievement unlocks
        return get().checkAchievements();
      },

      // Increment a stat by a value
      incrementStat: (statName, amount = 1) => {
        const { stats } = get();
        const newValue = (stats[statName] || 0) + amount;
        return get().updateStat(statName, newValue);
      },

      // Get all achievements with their status
      getAllAchievements: () => {
        const { unlockedAchievements, achievementProgress } = get();
        const unlockedMap = new Map(
          unlockedAchievements.map(a => [a.achievementId, a])
        );

        return ACHIEVEMENT_TEMPLATES.map(template => {
          const unlocked = unlockedMap.get(template.id);
          const progress = achievementProgress[template.id] || 0;
          const target = template.requirement.count;

          return {
            ...template,
            unlocked: !!unlocked,
            unlockedAt: unlocked?.unlockedAt || null,
            progress,
            target,
            percentComplete: Math.min((progress / target) * 100, 100),
            category: ACHIEVEMENT_CATEGORIES[template.category],
            rarityData: ACHIEVEMENT_RARITY[template.rarity],
          };
        });
      },

      // Get achievements by category
      getAchievementsByCategory: (categoryId) => {
        return get().getAllAchievements().filter(a =>
          categoryId === 'all' || a.category.id === categoryId
        );
      },

      // Get unlocked achievements
      getUnlockedAchievements: () => {
        return get().getAllAchievements().filter(a => a.unlocked);
      },

      // Get locked achievements
      getLockedAchievements: () => {
        return get().getAllAchievements().filter(a => !a.unlocked);
      },

      // Get achievement stats summary
      getAchievementSummary: () => {
        const all = get().getAllAchievements();
        const unlocked = all.filter(a => a.unlocked);

        return {
          total: all.length,
          unlocked: unlocked.length,
          locked: all.length - unlocked.length,
          percentComplete: Math.round((unlocked.length / all.length) * 100),
          totalXPEarned: get().totalXPFromAchievements,
          totalCreditsEarned: get().totalCreditsFromAchievements,
          byRarity: {
            common: unlocked.filter(a => a.rarity === 'common').length,
            uncommon: unlocked.filter(a => a.rarity === 'uncommon').length,
            rare: unlocked.filter(a => a.rarity === 'rare').length,
            epic: unlocked.filter(a => a.rarity === 'epic').length,
            legendary: unlocked.filter(a => a.rarity === 'legendary').length,
          },
        };
      },

      // Get recently unlocked achievements
      getRecentUnlocks: (limit = 5) => {
        const { unlockedAchievements } = get();
        const sorted = [...unlockedAchievements].sort(
          (a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)
        );

        return sorted.slice(0, limit).map(unlock => {
          const template = ACHIEVEMENT_TEMPLATES.find(t => t.id === unlock.achievementId);
          return {
            ...template,
            ...unlock,
            category: ACHIEVEMENT_CATEGORIES[template.category],
            rarityData: ACHIEVEMENT_RARITY[template.rarity],
          };
        });
      },

      // Get next achievements close to unlocking
      getNextAchievements: (limit = 5) => {
        const locked = get().getLockedAchievements();
        const sorted = locked.sort((a, b) => b.percentComplete - a.percentComplete);
        return sorted.slice(0, limit);
      },
    }),
    {
      name: 'achievements-storage',
      partialize: (state) => ({
        unlockedAchievements: state.unlockedAchievements,
        achievementProgress: state.achievementProgress,
        stats: state.stats,
        totalXPFromAchievements: state.totalXPFromAchievements,
        totalCreditsFromAchievements: state.totalCreditsFromAchievements,
      }),
    }
  )
);

// Initialize function for App.jsx
export const initializeAchievementsStore = async () => {
  return useAchievementsStore.getState().initializeFromSupabase();
};

export default useAchievementsStore;
