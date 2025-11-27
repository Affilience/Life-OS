/**
 * Cross-Module Data Service
 *
 * Non-React version of useCrossModuleContext for use in services.
 * Gets current state directly from Zustand stores.
 */

import useGamificationStore from '../../stores/gamificationStore';
import useProductivityStore from '../../stores/productivityStore';
import { useHealthStore } from '../../stores/healthStore';
import { useFinancialStore } from '../../stores/financialStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useCalendarStore } from '../../stores/calendarStore';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import { useContentStore } from '../../stores/contentStore';
import useQuestsStore from '../../stores/questsStore';
import useAchievementsStore from '../../stores/achievementsStore';
import useDailyTasksStore from '../../stores/dailyTasksStore';

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
 * Get comprehensive cross-module context from all stores
 * This can be called from anywhere, not just React components
 */
export function getCrossModuleContext() {
  // Get state from all stores
  const gamification = useGamificationStore.getState();
  const productivity = useProductivityStore.getState();
  const health = useHealthStore.getState();
  const financial = useFinancialStore.getState();
  const workout = useWorkoutStore.getState();
  const calendar = useCalendarStore.getState();
  const knowledge = useKnowledgeStore.getState();
  const content = useContentStore.getState();
  const quests = useQuestsStore.getState();
  const achievements = useAchievementsStore.getState();
  const dailyTasks = useDailyTasksStore.getState();

  const today = formatDate(new Date());
  const todaysTasks = dailyTasks.tasksByDate?.[today] || [];
  const todaysCompletedTasks = todaysTasks.filter(t => t.completed);
  const todaysMeals = (health.meals || []).filter(m => m.date === today);

  // Calculate today's nutrition totals
  const todaysNutrition = todaysMeals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Find active projects
  const activeProjects = (productivity.projects || []).filter(p => p.status === 'active');

  // Calculate budget status
  const budgetEnvelopes = financial.budgetEnvelopes || [];
  const totalBudget = budgetEnvelopes.reduce((sum, env) => sum + (env.allocated || 0), 0);
  const totalSpent = budgetEnvelopes.reduce((sum, env) => sum + (env.spent || 0), 0);
  const budgetRemaining = totalBudget - totalSpent;
  const budgetPercentUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Recent workouts (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentWorkouts = (workout.workouts || []).filter(w => new Date(w.date) > weekAgo);
  const recentCardio = (workout.cardioWorkouts || []).filter(w => new Date(w.date) > weekAgo);

  // Books in progress
  const booksInProgress = (knowledge.books || []).filter(b => b.status === 'reading');
  const booksCompleted = (knowledge.books || []).filter(b => b.status === 'completed');

  // Today's time blocks
  const todaysBlocks = (calendar.timeBlocks || []).filter(b => {
    const blockDate = new Date(b.start);
    return formatDate(blockDate) === today;
  });

  // Streak information
  const streaks = gamification.streaks || {};
  const activeStreaks = Object.entries(streaks)
    .filter(([_, streak]) => streak && streak.current > 0)
    .map(([name, streak]) => ({
      name,
      current: streak.current,
      best: streak.best,
      lastActivity: streak.lastActivity,
    }));

  // Find streaks at risk (not logged in last 20 hours)
  const streaksAtRisk = activeStreaks.filter(s => {
    if (!s.lastActivity) return false;
    const hoursSinceActivity = (Date.now() - new Date(s.lastActivity).getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity > 20 && s.current >= 3;
  });

  // Recent achievements
  const recentAchievementsList = (gamification.unlockedAchievements || []).slice(-5);

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
      level: gamification.level || 1,
      stage: gamification.currentStage || 'spark',
      totalXP: gamification.totalXP || 0,
      currentXP: gamification.currentXP || 0,
      cosmicCredits: gamification.cosmicCredits || 0,
      globalStreak: gamification.globalStreak || 0,
      moduleXP: gamification.moduleXP || {},
    },

    // === Streaks ===
    streaks: {
      active: activeStreaks,
      atRisk: streaksAtRisk,
      global: gamification.globalStreak || 0,
      raw: streaks,
    },

    // === Today's Activity ===
    today: {
      tasks: {
        total: todaysTasks.length,
        completed: todaysCompletedTasks.length,
        remaining: todaysTasks.length - todaysCompletedTasks.length,
        list: todaysTasks,
        completionRate: todaysTasks.length > 0
          ? Math.round((todaysCompletedTasks.length / todaysTasks.length) * 100)
          : 0,
      },
      nutrition: {
        ...todaysNutrition,
        goals: health.dailyGoals || {},
        mealsLogged: todaysMeals.length,
        calorieProgress: health.dailyGoals?.calories
          ? Math.round((todaysNutrition.calories / health.dailyGoals.calories) * 100)
          : 0,
        proteinProgress: health.dailyGoals?.protein
          ? Math.round((todaysNutrition.protein / health.dailyGoals.protein) * 100)
          : 0,
      },
      timeBlocks: {
        total: todaysBlocks.length,
        blocks: todaysBlocks,
      },
      hasActiveWorkout: !!workout.activeWorkout,
      hasActiveSession: !!productivity.activeSession,
    },

    // === Productivity ===
    productivity: {
      activeProjects: activeProjects.length,
      projectNames: activeProjects.slice(0, 5).map(p => p.name),
      totalWorkSessions: (productivity.sessions || []).length,
      hasActiveSession: !!productivity.activeSession,
    },

    // === Health & Fitness ===
    fitness: {
      workoutsThisWeek: recentWorkouts.length,
      cardioThisWeek: recentCardio.length,
      totalWorkouts: (workout.workouts || []).length,
      personalRecordsCount: Object.keys(workout.personalRecords || {}).length,
      hasActiveWorkout: !!workout.activeWorkout,
      lastWorkoutDate: recentWorkouts[0]?.date || null,
    },

    // === Financial ===
    financial: {
      budgetRemaining,
      budgetPercentUsed,
      isOverBudget: totalSpent > totalBudget && totalBudget > 0,
      recentTransactions: (financial.transactions || []).slice(-5),
      savingsTotal: (financial.sinkingFunds || []).reduce((sum, f) => sum + (f.current || 0), 0),
      totalTransactions: (financial.transactions || []).length,
    },

    // === Knowledge & Learning ===
    learning: {
      booksInProgress: booksInProgress.length,
      booksInProgressTitles: booksInProgress.slice(0, 3).map(b => b.title),
      totalBooksCompleted: booksCompleted.length,
      notesCount: (knowledge.notes || []).length,
      contentInProgress: (content.contentItems || []).filter(c => c.status === 'in_progress').length,
    },

    // === Quests & Achievements ===
    quests: {
      stats: quests.questStats || {},
      activeBossBattles: (quests.activeBossBattles || []).length,
    },

    achievements: {
      totalUnlocked: (gamification.unlockedAchievements || []).length,
      recent: recentAchievementsList,
      stats: achievements.stats || {},
    },

    // === Calendar ===
    calendar: {
      upcomingEvents: (calendar.events || []).filter(e => new Date(e.start) > new Date()).slice(0, 5),
      todaysBlocksCount: todaysBlocks.length,
    },
  };
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
    const lastAchievement = context.achievements.recent[context.achievements.recent.length - 1];
    lines.push('Recent Achievement: ' + (lastAchievement?.name || lastAchievement?.id || 'None'));
  }

  return lines.join('\n');
}

export default { getCrossModuleContext, generateContextSummary };
