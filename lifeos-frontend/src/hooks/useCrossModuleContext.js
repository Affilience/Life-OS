/**
 * Cross-Module Context Hook
 *
 * Aggregates data from all Zustand stores to provide Nova with
 * comprehensive, real-time context about the user's activities,
 * progress, and patterns across the entire Ascynt ecosystem.
 */

import { useMemo } from 'react';
import useGamificationStore from '../stores/gamificationStore';
import useProductivityStore from '../stores/productivityStore';
import { useHealthStore } from '../stores/healthStore';
import { useFinancialStore } from '../stores/financialStore';
import { useWorkoutStore } from '../stores/workoutStore';
import { useCalendarStore } from '../stores/calendarStore';
import { useKnowledgeStore } from '../stores/knowledgeStore';
import { useContentStore } from '../stores/contentStore';
import useQuestsStore from '../stores/questsStore';
import useAchievementsStore from '../stores/achievementsStore';
import useDailyTasksStore from '../stores/dailyTasksStore';

/**
 * Get time of day category
 */
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

/**
 * Format a date as YYYY-MM-DD
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Calculate days since a date
 */
function daysSince(date) {
  if (!date) return null;
  const now = new Date();
  const past = new Date(date);
  return Math.floor((now - past) / (1000 * 60 * 60 * 24));
}

/**
 * Hook to get comprehensive cross-module context
 */
export function useCrossModuleContext() {
  // === Gamification Store ===
  const {
    level,
    currentStage,
    totalXP,
    currentXP,
    cosmicCredits,
    streaks,
    globalStreak,
    moduleXP,
    recentEvents,
    achievements,
    unlockedAchievements,
  } = useGamificationStore();

  // === Productivity Store ===
  const {
    sessions: workSessions,
    activeSession,
    projects,
    tasks: projectTasks,
  } = useProductivityStore();

  // === Health Store ===
  const {
    meals,
    dailyGoals,
    selectedDate: healthSelectedDate,
  } = useHealthStore();

  // === Financial Store ===
  const {
    transactions,
    budgetEnvelopes,
    sinkingFunds,
  } = useFinancialStore();

  // === Workout Store ===
  const {
    workouts,
    activeWorkout,
    personalRecords,
    cardioWorkouts,
  } = useWorkoutStore();

  // === Calendar Store ===
  const {
    timeBlocks,
    events: calendarEvents,
  } = useCalendarStore();

  // === Knowledge Store ===
  const {
    notes,
    books,
    media,
  } = useKnowledgeStore();

  // === Content Store ===
  const {
    contentItems,
    stats: contentStats,
  } = useContentStore();

  // === Quests Store ===
  const {
    questStats,
    activeBossBattles,
  } = useQuestsStore();

  // === Achievements Store ===
  const {
    stats: achievementStats,
  } = useAchievementsStore();

  // === Daily Tasks Store ===
  const {
    tasksByDate,
  } = useDailyTasksStore();

  // Build comprehensive context
  const context = useMemo(() => {
    const today = formatDate(new Date());
    const todaysTasks = tasksByDate[today] || [];
    const todaysCompletedTasks = todaysTasks.filter(t => t.completed);
    const todaysMeals = meals.filter(m => m.date === today);

    // Calculate today's nutrition totals
    const todaysNutrition = todaysMeals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Find active projects
    const activeProjects = projects?.filter(p => p.status === 'active') || [];

    // Calculate budget status
    const totalBudget = budgetEnvelopes?.reduce((sum, env) => sum + (env.allocated || 0), 0) || 0;
    const totalSpent = budgetEnvelopes?.reduce((sum, env) => sum + (env.spent || 0), 0) || 0;
    const budgetRemaining = totalBudget - totalSpent;
    const budgetPercentUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    // Recent workouts (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentWorkouts = workouts?.filter(w => new Date(w.date) > weekAgo) || [];
    const recentCardio = cardioWorkouts?.filter(w => new Date(w.date) > weekAgo) || [];

    // Books in progress
    const booksInProgress = books?.filter(b => b.status === 'reading') || [];
    const booksCompleted = books?.filter(b => b.status === 'completed') || [];

    // Content consumption
    const contentInProgress = contentItems?.filter(c => c.status === 'in_progress') || [];

    // Today's time blocks
    const todaysBlocks = timeBlocks?.filter(b => {
      const blockDate = new Date(b.start);
      return formatDate(blockDate) === today;
    }) || [];

    // Streak information
    const activeStreaks = Object.entries(streaks || {})
      .filter(([_, streak]) => streak.current > 0)
      .map(([name, streak]) => ({
        name,
        current: streak.current,
        best: streak.best,
        lastActivity: streak.lastActivity,
      }));

    // Find streak at risk (not logged in last 20 hours)
    const streaksAtRisk = activeStreaks.filter(s => {
      if (!s.lastActivity) return false;
      const hoursSinceActivity = (Date.now() - new Date(s.lastActivity).getTime()) / (1000 * 60 * 60);
      return hoursSinceActivity > 20 && s.current >= 3;
    });

    // Recent achievements
    const recentAchievementsList = unlockedAchievements?.slice(-5) || [];

    // Build the full context object
    return {
      // === Time Context ===
      time: {
        current: new Date().toLocaleString(),
        timeOfDay: getTimeOfDay(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        isWeekend: [0, 6].includes(new Date().getDay()),
      },

      // === Gamification & Progress ===
      progress: {
        level,
        stage: currentStage,
        totalXP,
        currentXP,
        cosmicCredits,
        globalStreak,
        moduleXP: moduleXP || {},
        recentEventsCount: recentEvents?.length || 0,
      },

      // === Streaks ===
      streaks: {
        active: activeStreaks,
        atRisk: streaksAtRisk,
        global: globalStreak,
      },

      // === Today's Activity ===
      today: {
        tasks: {
          total: todaysTasks.length,
          completed: todaysCompletedTasks.length,
          remaining: todaysTasks.length - todaysCompletedTasks.length,
          completionRate: todaysTasks.length > 0
            ? Math.round((todaysCompletedTasks.length / todaysTasks.length) * 100)
            : 0,
        },
        nutrition: {
          ...todaysNutrition,
          goals: dailyGoals,
          calorieProgress: dailyGoals?.calories
            ? Math.round((todaysNutrition.calories / dailyGoals.calories) * 100)
            : 0,
          proteinProgress: dailyGoals?.protein
            ? Math.round((todaysNutrition.protein / dailyGoals.protein) * 100)
            : 0,
        },
        timeBlocks: {
          total: todaysBlocks.length,
          blocks: todaysBlocks.slice(0, 5), // Limit for context size
        },
        hasActiveWorkout: !!activeWorkout,
        hasActiveSession: !!activeSession,
      },

      // === Productivity ===
      productivity: {
        activeProjects: activeProjects.length,
        projectNames: activeProjects.slice(0, 5).map(p => p.name),
        totalWorkSessions: workSessions?.length || 0,
        recentSessions: workSessions?.slice(-5) || [],
      },

      // === Health & Fitness ===
      fitness: {
        workoutsThisWeek: recentWorkouts.length,
        cardioThisWeek: recentCardio.length,
        personalRecordsCount: Object.keys(personalRecords || {}).length,
        hasActiveWorkout: !!activeWorkout,
      },

      // === Financial ===
      financial: {
        budgetRemaining,
        budgetPercentUsed,
        isOverBudget: totalSpent > totalBudget && totalBudget > 0,
        recentTransactions: transactions?.slice(-5) || [],
        savingsTotal: sinkingFunds?.reduce((sum, f) => sum + (f.current || 0), 0) || 0,
      },

      // === Knowledge & Learning ===
      learning: {
        booksInProgress: booksInProgress.length,
        booksInProgressTitles: booksInProgress.slice(0, 3).map(b => b.title),
        totalBooksCompleted: booksCompleted.length,
        notesCount: notes?.length || 0,
        contentInProgress: contentInProgress.length,
        contentStats: contentStats || {},
      },

      // === Quests & Achievements ===
      quests: {
        stats: questStats || {},
        activeBossBattles: activeBossBattles?.length || 0,
      },

      // === Achievements ===
      achievements: {
        totalUnlocked: unlockedAchievements?.length || 0,
        recent: recentAchievementsList,
        stats: achievementStats || {},
      },

      // === Calendar ===
      calendar: {
        upcomingEvents: calendarEvents?.filter(e => new Date(e.start) > new Date()).slice(0, 5) || [],
        todaysBlocksCount: todaysBlocks.length,
      },
    };
  }, [
    // Gamification
    level, currentStage, totalXP, currentXP, cosmicCredits, streaks, globalStreak, moduleXP, recentEvents, unlockedAchievements,
    // Productivity
    workSessions, activeSession, projects, projectTasks,
    // Health
    meals, dailyGoals,
    // Financial
    transactions, budgetEnvelopes, sinkingFunds,
    // Workout
    workouts, activeWorkout, personalRecords, cardioWorkouts,
    // Calendar
    timeBlocks, calendarEvents,
    // Knowledge
    notes, books, media,
    // Content
    contentItems, contentStats,
    // Quests
    questStats, activeBossBattles,
    // Achievements
    achievementStats,
    // Daily Tasks
    tasksByDate,
  ]);

  return context;
}

/**
 * Generate a text summary of the context for AI prompts
 */
export function generateContextSummary(context) {
  const lines = [];

  // Time context
  lines.push(`Current Time: ${context.time.current} (${context.time.timeOfDay})`);
  lines.push(`Day: ${context.time.dayOfWeek}${context.time.isWeekend ? ' (Weekend)' : ''}`);
  lines.push('');

  // Progress
  lines.push(`User Level: ${context.progress.level} (${context.progress.stage || 'Spark'} stage)`);
  lines.push(`Total XP: ${context.progress.totalXP?.toLocaleString() || 0}`);
  lines.push(`Global Streak: ${context.progress.globalStreak || 0} days`);
  lines.push('');

  // Today's tasks
  if (context.today.tasks.total > 0) {
    lines.push(`Today's Tasks: ${context.today.tasks.completed}/${context.today.tasks.total} completed (${context.today.tasks.completionRate}%)`);
  } else {
    lines.push('Today\'s Tasks: No tasks planned yet');
  }

  // Nutrition
  if (context.today.nutrition.goals?.calories) {
    lines.push(`Nutrition: ${context.today.nutrition.calories}/${context.today.nutrition.goals.calories} calories (${context.today.nutrition.calorieProgress}%)`);
    lines.push(`Protein: ${context.today.nutrition.protein}g/${context.today.nutrition.goals.protein || 0}g`);
  }
  lines.push('');

  // Streaks at risk
  if (context.streaks.atRisk.length > 0) {
    lines.push('STREAKS AT RISK:');
    context.streaks.atRisk.forEach(s => {
      lines.push(`  - ${s.name}: ${s.current} day streak about to break!`);
    });
    lines.push('');
  }

  // Active streaks
  if (context.streaks.active.length > 0) {
    lines.push('Active Streaks:');
    context.streaks.active.slice(0, 5).forEach(s => {
      lines.push(`  - ${s.name}: ${s.current} days (best: ${s.best})`);
    });
    lines.push('');
  }

  // Productivity
  if (context.productivity.activeProjects > 0) {
    lines.push(`Active Projects: ${context.productivity.activeProjects}`);
    if (context.productivity.projectNames.length > 0) {
      lines.push(`  Projects: ${context.productivity.projectNames.join(', ')}`);
    }
  }
  lines.push('');

  // Fitness
  lines.push(`Workouts This Week: ${context.fitness.workoutsThisWeek} strength, ${context.fitness.cardioThisWeek} cardio`);
  if (context.fitness.hasActiveWorkout) {
    lines.push('Currently in a workout session!');
  }
  lines.push('');

  // Financial
  if (context.financial.budgetPercentUsed > 0) {
    lines.push(`Budget: ${context.financial.budgetPercentUsed}% used ($${context.financial.budgetRemaining?.toFixed(0) || 0} remaining)`);
    if (context.financial.isOverBudget) {
      lines.push('WARNING: Over budget this month!');
    }
  }
  lines.push('');

  // Learning
  if (context.learning.booksInProgress > 0) {
    lines.push(`Books in Progress: ${context.learning.booksInProgress}`);
    if (context.learning.booksInProgressTitles.length > 0) {
      lines.push(`  Reading: ${context.learning.booksInProgressTitles.join(', ')}`);
    }
  }
  lines.push(`Total Books Completed: ${context.learning.totalBooksCompleted}`);
  lines.push(`Notes Created: ${context.learning.notesCount}`);
  lines.push('');

  // Achievements
  lines.push(`Achievements Unlocked: ${context.achievements.totalUnlocked}`);
  if (context.achievements.recent.length > 0) {
    lines.push('Recent Achievement: ' + (context.achievements.recent[context.achievements.recent.length - 1]?.name || 'None'));
  }

  return lines.join('\n');
}

/**
 * Get specific module context for targeted nudges
 */
export function getModuleContext(context, moduleName) {
  switch (moduleName) {
    case 'productivity':
      return {
        tasks: context.today.tasks,
        projects: context.productivity,
        hasActiveSession: context.today.hasActiveSession,
      };
    case 'health':
    case 'fitness':
      return {
        nutrition: context.today.nutrition,
        fitness: context.fitness,
        hasActiveWorkout: context.today.hasActiveWorkout,
      };
    case 'financial':
      return context.financial;
    case 'learning':
    case 'knowledge':
      return context.learning;
    case 'calendar':
      return {
        ...context.calendar,
        todaysBlocks: context.today.timeBlocks,
      };
    default:
      return context;
  }
}

export default useCrossModuleContext;
