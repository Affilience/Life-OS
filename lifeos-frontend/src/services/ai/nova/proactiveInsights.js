/**
 * Proactive Insights Engine
 *
 * This engine is what makes Nova feel ALIVE and INTELLIGENT.
 *
 * Instead of waiting for the user to ask questions, Nova proactively:
 * - Notices patterns they might miss
 * - Alerts them to important things (streaks at risk, goals approaching)
 * - Suggests actions based on context
 * - Correlates data across modules to provide insights
 * - Learns from their patterns to give better advice
 *
 * This is the "brain" that runs in the background and feeds Nova.
 */

import { getCrossModuleContext } from '../crossModuleData';

// ============================================================================
// INSIGHT CATEGORIES
// ============================================================================

export const INSIGHT_PRIORITY = {
  URGENT: 1, // Needs immediate attention (streak about to break)
  HIGH: 2, // Important but not urgent (goal almost reached)
  MEDIUM: 3, // Worth mentioning (pattern observed)
  LOW: 4, // Nice to know (milestone approaching)
  INFO: 5, // Background information
};

export const INSIGHT_TYPES = {
  STREAK_AT_RISK: 'streak_at_risk',
  STREAK_MILESTONE: 'streak_milestone',
  LEVEL_UP_CLOSE: 'level_up_close',
  GOAL_PROGRESS: 'goal_progress',
  PATTERN_DETECTED: 'pattern_detected',
  CORRELATION_FOUND: 'correlation_found',
  REMINDER: 'reminder',
  CELEBRATION: 'celebration',
  CONCERN: 'concern',
  SUGGESTION: 'suggestion',
  ACHIEVEMENT_UNLOCKABLE: 'achievement_unlockable',
  WEEKLY_SUMMARY: 'weekly_summary',
};

// ============================================================================
// INSIGHT GENERATORS
// ============================================================================

/**
 * Check for streaks at risk of breaking
 */
function checkStreakRisks(context) {
  const insights = [];
  const activeStreaks = context.gamification.streaks.active;

  activeStreaks.forEach((streak) => {
    if (!streak.lastActivity) return;

    const hoursSinceActivity =
      (Date.now() - new Date(streak.lastActivity).getTime()) / (1000 * 60 * 60);

    // At risk if 20+ hours without activity and streak is valuable
    if (hoursSinceActivity > 20 && streak.current >= 3) {
      const hoursRemaining = Math.max(0, 24 - hoursSinceActivity);

      insights.push({
        type: INSIGHT_TYPES.STREAK_AT_RISK,
        priority: streak.current >= 7 ? INSIGHT_PRIORITY.URGENT : INSIGHT_PRIORITY.HIGH,
        title: `${streak.name} streak at risk!`,
        message:
          streak.current >= 30
            ? `Your ${streak.current}-day ${streak.name} streak is about to break! You've worked so hard for this.`
            : `Your ${streak.current}-day ${streak.name} streak will break in ${hoursRemaining.toFixed(0)} hours.`,
        data: {
          streakName: streak.name,
          currentStreak: streak.current,
          hoursRemaining,
          bestStreak: streak.best,
        },
        action: {
          type: 'navigate',
          label: 'Complete now',
          route: getRouteForStreak(streak.name),
        },
        expiresAt: new Date(Date.now() + hoursRemaining * 60 * 60 * 1000),
      });
    }
  });

  return insights;
}

/**
 * Get route for a given streak type
 */
function getRouteForStreak(streakName) {
  const routes = {
    workout: '/health',
    fitness: '/health',
    journal: '/journal',
    meditation: '/health',
    reading: '/knowledge',
    tasks: '/productivity',
    nutrition: '/health',
    sleep: '/health',
  };

  const lowerName = streakName.toLowerCase();
  for (const [key, route] of Object.entries(routes)) {
    if (lowerName.includes(key)) return route;
  }

  return '/';
}

/**
 * Check for upcoming streak milestones
 */
function checkStreakMilestones(context) {
  const insights = [];
  const milestones = [7, 14, 21, 30, 60, 90, 100, 180, 365];

  context.gamification.streaks.active.forEach((streak) => {
    const upcomingMilestone = milestones.find((m) => m === streak.current + 1);

    if (upcomingMilestone) {
      insights.push({
        type: INSIGHT_TYPES.STREAK_MILESTONE,
        priority: INSIGHT_PRIORITY.HIGH,
        title: `${upcomingMilestone}-day milestone tomorrow!`,
        message: `One more day and you'll hit ${upcomingMilestone} days on your ${streak.name} streak! Don't stop now.`,
        data: {
          streakName: streak.name,
          currentStreak: streak.current,
          milestone: upcomingMilestone,
        },
        celebratory: true,
      });
    }
  });

  return insights;
}

/**
 * Check if user is close to leveling up
 */
function checkLevelUpProgress(context) {
  const insights = [];
  const { currentXP, xpToNextLevel, level } = context.gamification;

  const xpRemaining = xpToNextLevel - currentXP;
  const percentComplete = (currentXP / xpToNextLevel) * 100;

  if (percentComplete >= 90 && percentComplete < 100) {
    insights.push({
      type: INSIGHT_TYPES.LEVEL_UP_CLOSE,
      priority: INSIGHT_PRIORITY.HIGH,
      title: 'Level up is within reach!',
      message: `Just ${xpRemaining} XP to Level ${level + 1}! One completed task could push you over.`,
      data: {
        currentLevel: level,
        xpRemaining,
        percentComplete: Math.round(percentComplete),
      },
      celebratory: true,
    });
  }

  return insights;
}

/**
 * Check for task completion patterns
 */
function checkTaskPatterns(context) {
  const insights = [];
  const { today, allTasksByDate } = context.dailyTasks;
  const hour = new Date().getHours();

  // Low completion rate for time of day
  if (hour >= 14 && hour < 20 && today.completionRate < 30 && today.total > 0) {
    insights.push({
      type: INSIGHT_TYPES.CONCERN,
      priority: INSIGHT_PRIORITY.MEDIUM,
      title: 'Tasks falling behind',
      message: `It's ${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'} and only ${today.completionRate}% of tasks done. What's blocking you today?`,
      data: {
        completionRate: today.completionRate,
        completed: today.completed,
        total: today.total,
        remaining: today.remaining,
      },
      action: {
        type: 'navigate',
        label: 'View tasks',
        route: '/productivity',
      },
    });
  }

  // Great progress celebration
  if (today.completionRate === 100 && today.total >= 3) {
    insights.push({
      type: INSIGHT_TYPES.CELEBRATION,
      priority: INSIGHT_PRIORITY.LOW,
      title: 'All tasks complete!',
      message: `You crushed all ${today.total} tasks today. That's the kind of execution that compounds.`,
      data: {
        completedCount: today.total,
      },
      celebratory: true,
    });
  }

  return insights;
}

/**
 * Check nutrition progress
 */
function checkNutritionProgress(context) {
  const insights = [];
  const { todayNutrition, dailyGoals } = context.health;
  const hour = new Date().getHours();

  // Calorie check
  const calorieProgress = todayNutrition.calorieProgress || 0;

  // Under-eating warning
  if (hour >= 18 && calorieProgress < 50 && dailyGoals?.calories > 0) {
    insights.push({
      type: INSIGHT_TYPES.CONCERN,
      priority: INSIGHT_PRIORITY.MEDIUM,
      title: 'Low calorie intake',
      message: `You've only logged ${calorieProgress}% of your calories this late in the day. Are you eating enough?`,
      data: {
        calories: todayNutrition.calories,
        goal: dailyGoals.calories,
        progress: calorieProgress,
      },
      action: {
        type: 'navigate',
        label: 'Log a meal',
        route: '/health',
      },
    });
  }

  // Protein check
  const proteinProgress = todayNutrition.proteinProgress || 0;
  if (hour >= 20 && proteinProgress < 70 && dailyGoals?.protein > 0) {
    insights.push({
      type: INSIGHT_TYPES.SUGGESTION,
      priority: INSIGHT_PRIORITY.MEDIUM,
      title: 'Protein target not met',
      message: `You're at ${proteinProgress}% protein today. Consider a protein-rich snack before bed for recovery.`,
      data: {
        protein: todayNutrition.protein,
        goal: dailyGoals.protein,
        progress: proteinProgress,
      },
    });
  }

  return insights;
}

/**
 * Check workout patterns
 */
function checkWorkoutPatterns(context) {
  const insights = [];
  const { workoutsThisWeek, workouts, hasActiveWorkout } = context.fitness;
  const dayOfWeek = new Date().getDay();

  // No workouts mid-week
  if (dayOfWeek >= 3 && workoutsThisWeek === 0) {
    insights.push({
      type: INSIGHT_TYPES.REMINDER,
      priority: INSIGHT_PRIORITY.MEDIUM,
      title: 'No workouts this week yet',
      message: "It's already midweek with no logged workouts. When's your next session?",
      action: {
        type: 'navigate',
        label: 'Start workout',
        route: '/health',
      },
    });
  }

  // Great workout week
  if (workoutsThisWeek >= 4 && dayOfWeek < 5) {
    insights.push({
      type: INSIGHT_TYPES.CELEBRATION,
      priority: INSIGHT_PRIORITY.LOW,
      title: 'Strong training week!',
      message: `${workoutsThisWeek} workouts already this week - you're crushing it. Remember to prioritise recovery.`,
      celebratory: true,
    });
  }

  return insights;
}

/**
 * Check financial patterns
 */
function checkFinancialPatterns(context) {
  const insights = [];
  const { totalBudget, totalSpent, budgetEnvelopes, sinkingFunds } = context.financial;

  if (totalBudget <= 0) return insights;

  const budgetPercent = (totalSpent / totalBudget) * 100;
  const dayOfMonth = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const expectedPercent = (dayOfMonth / daysInMonth) * 100;

  // Over budget
  if (budgetPercent > 100) {
    insights.push({
      type: INSIGHT_TYPES.CONCERN,
      priority: INSIGHT_PRIORITY.HIGH,
      title: 'Over budget',
      message: `You've exceeded your budget by $${(totalSpent - totalBudget).toFixed(0)}. Let's review spending.`,
      data: {
        spent: totalSpent,
        budget: totalBudget,
        overage: totalSpent - totalBudget,
      },
      action: {
        type: 'navigate',
        label: 'Review spending',
        route: '/financial',
      },
    });
  }
  // Significantly ahead of pace
  else if (budgetPercent > expectedPercent + 20) {
    insights.push({
      type: INSIGHT_TYPES.CONCERN,
      priority: INSIGHT_PRIORITY.MEDIUM,
      title: 'Spending ahead of pace',
      message: `You've used ${Math.round(budgetPercent)}% of budget but we're only ${Math.round(expectedPercent)}% through the month.`,
      data: {
        budgetPercent,
        expectedPercent,
        remaining: totalBudget - totalSpent,
      },
    });
  }

  // Savings goal almost complete
  sinkingFunds.forEach((fund) => {
    if (fund.progress >= 90 && fund.progress < 100) {
      insights.push({
        type: INSIGHT_TYPES.GOAL_PROGRESS,
        priority: INSIGHT_PRIORITY.MEDIUM,
        title: `"${fund.name}" almost complete!`,
        message: `Your ${fund.name} savings is ${fund.progress}% complete! Just $${(fund.target - fund.current).toFixed(0)} to go.`,
        data: fund,
        celebratory: true,
      });
    }
  });

  return insights;
}

/**
 * Check cross-module correlations
 */
function checkCorrelations(context) {
  const insights = [];

  // Sleep + Productivity correlation
  const recentSleep = context.health.sleepLogs.slice(0, 3);
  if (recentSleep.length > 0) {
    const avgSleepQuality =
      recentSleep.reduce((sum, s) => sum + (s.quality || 0), 0) / recentSleep.length;

    if (avgSleepQuality < 5 && context.dailyTasks.today.completionRate < 40) {
      insights.push({
        type: INSIGHT_TYPES.CORRELATION_FOUND,
        priority: INSIGHT_PRIORITY.MEDIUM,
        title: 'Sleep affecting productivity',
        message:
          'Poor sleep quality recently correlates with lower task completion. Prioritize sleep tonight.',
        data: {
          avgSleepQuality,
          taskCompletion: context.dailyTasks.today.completionRate,
        },
      });
    }
  }

  // Budget stress + low productivity
  if (context.financial.totalBudget > 0) {
    const budgetPercent =
      (context.financial.totalSpent / context.financial.totalBudget) * 100;
    if (budgetPercent > 100 && context.dailyTasks.today.completionRate < 50) {
      insights.push({
        type: INSIGHT_TYPES.CORRELATION_FOUND,
        priority: INSIGHT_PRIORITY.MEDIUM,
        title: 'Financial stress may be affecting focus',
        message:
          'Being over budget often correlates with reduced productivity. Consider addressing financial concerns.',
        data: {
          budgetPercent,
          taskCompletion: context.dailyTasks.today.completionRate,
        },
      });
    }
  }

  // Consistent workouts + good sleep
  if (context.fitness.workoutsThisWeek >= 3 && recentSleep.length > 0) {
    const avgSleepQuality =
      recentSleep.reduce((sum, s) => sum + (s.quality || 0), 0) / recentSleep.length;
    if (avgSleepQuality > 7) {
      insights.push({
        type: INSIGHT_TYPES.PATTERN_DETECTED,
        priority: INSIGHT_PRIORITY.INFO,
        title: 'Exercise-sleep positive loop',
        message:
          "Your consistent workouts appear to be improving sleep quality. This is a powerful positive feedback loop.",
        celebratory: true,
      });
    }
  }

  return insights;
}

/**
 * Check time-based suggestions
 */
function checkTimeBasedSuggestions(context) {
  const insights = [];
  const hour = new Date().getHours();
  const { timeOfDay, isWeekend } = context.time;

  // Morning suggestions
  if (hour >= 6 && hour < 9) {
    if (context.dailyTasks.today.total === 0) {
      insights.push({
        type: INSIGHT_TYPES.SUGGESTION,
        priority: INSIGHT_PRIORITY.MEDIUM,
        title: 'Plan your day',
        message:
          "Good morning! You haven't set any tasks for today. A few minutes of planning now saves hours later.",
        action: {
          type: 'navigate',
          label: 'Add tasks',
          route: '/productivity',
        },
      });
    }
  }

  // Evening journal reminder
  if (hour >= 20 && hour < 23) {
    insights.push({
      type: INSIGHT_TYPES.SUGGESTION,
      priority: INSIGHT_PRIORITY.LOW,
      title: 'Evening reflection',
      message:
        'Evening is perfect for journaling. Reflecting on your day improves self-awareness and sleep quality.',
      action: {
        type: 'navigate',
        label: 'Write entry',
        route: '/journal',
      },
    });
  }

  // Weekend balance check
  if (isWeekend && context.dailyTasks.today.completionRate > 80) {
    insights.push({
      type: INSIGHT_TYPES.PATTERN_DETECTED,
      priority: INSIGHT_PRIORITY.INFO,
      title: 'High weekend productivity',
      message:
        "You're being very productive on the weekend. Make sure you're also making time for rest and enjoyment.",
    });
  }

  return insights;
}

// ============================================================================
// MAIN INSIGHT GENERATION
// ============================================================================

/**
 * Generate all proactive insights based on current state
 *
 * @returns {Array} Array of insight objects, sorted by priority
 */
export function generateAllInsights() {
  const context = getCrossModuleContext();

  // Run all insight generators
  const allInsights = [
    ...checkStreakRisks(context),
    ...checkStreakMilestones(context),
    ...checkLevelUpProgress(context),
    ...checkTaskPatterns(context),
    ...checkNutritionProgress(context),
    ...checkWorkoutPatterns(context),
    ...checkFinancialPatterns(context),
    ...checkCorrelations(context),
    ...checkTimeBasedSuggestions(context),
  ];

  // Add timestamp and dedupe
  const timestampedInsights = allInsights.map((insight) => ({
    ...insight,
    generatedAt: new Date().toISOString(),
    id: `${insight.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }));

  // Sort by priority (lower number = higher priority)
  return timestampedInsights.sort((a, b) => a.priority - b.priority);
}

/**
 * Get top N most important insights
 */
export function getTopInsights(count = 3) {
  const insights = generateAllInsights();
  return insights.slice(0, count);
}

/**
 * Get insights by type
 */
export function getInsightsByType(type) {
  const insights = generateAllInsights();
  return insights.filter((i) => i.type === type);
}

/**
 * Get urgent insights only (priority 1-2)
 */
export function getUrgentInsights() {
  const insights = generateAllInsights();
  return insights.filter((i) => i.priority <= INSIGHT_PRIORITY.HIGH);
}

/**
 * Get celebratory insights
 */
export function getCelebrations() {
  const insights = generateAllInsights();
  return insights.filter((i) => i.celebratory);
}

/**
 * Format insights for Nova's context
 */
export function formatInsightsForPrompt(insights = null) {
  const insightList = insights || getTopInsights(5);

  if (insightList.length === 0) {
    return 'No notable insights at this time.';
  }

  const lines = ['# Current Insights to Consider:', ''];

  insightList.forEach((insight) => {
    const priorityLabel =
      insight.priority === 1
        ? '[URGENT]'
        : insight.priority === 2
          ? '[IMPORTANT]'
          : '';

    lines.push(`${priorityLabel} ${insight.title}`);
    lines.push(`  ${insight.message}`);
    if (insight.action) {
      lines.push(`  Action: ${insight.action.label} → ${insight.action.route}`);
    }
    lines.push('');
  });

  return lines.join('\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

export const proactiveInsights = {
  generateAllInsights,
  getTopInsights,
  getInsightsByType,
  getUrgentInsights,
  getCelebrations,
  formatInsightsForPrompt,
  INSIGHT_PRIORITY,
  INSIGHT_TYPES,
};

export default proactiveInsights;
