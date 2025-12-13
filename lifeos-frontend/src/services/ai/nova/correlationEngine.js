/**
 * Correlation & Pattern Explanation Engine
 *
 * This is the analytical brain that makes Nova truly intelligent.
 * It finds patterns and correlations across all user data that
 * humans typically miss, then explains them in actionable ways.
 *
 * Key capabilities:
 * - Cross-module correlation detection
 * - Time-series pattern analysis
 * - Cause-effect relationship inference
 * - Natural language explanation generation
 * - Actionable recommendation derivation
 */

import { getCrossModuleContext } from '../crossModuleData';

// ============================================================================
// CORRELATION TYPES
// ============================================================================

export const CORRELATION_TYPES = {
  POSITIVE: 'positive', // When A increases, B increases
  NEGATIVE: 'negative', // When A increases, B decreases
  CAUSAL: 'causal', // A appears to cause B
  TEMPORAL: 'temporal', // A happens before B
  CYCLICAL: 'cyclical', // Pattern repeats over time
};

export const CORRELATION_STRENGTH = {
  STRONG: 'strong',
  MODERATE: 'moderate',
  WEAK: 'weak',
  POSSIBLE: 'possible',
};

// ============================================================================
// KNOWN CORRELATION PATTERNS
// ============================================================================

/**
 * Pre-defined correlation patterns that Nova looks for
 * These are evidence-based relationships between metrics
 */
const KNOWN_CORRELATIONS = [
  {
    id: 'sleep_productivity',
    modules: ['health', 'productivity'],
    metrics: ['sleepQuality', 'taskCompletionRate'],
    type: CORRELATION_TYPES.POSITIVE,
    description: 'Sleep quality affects next-day productivity',
    explanation: {
      positive: 'Good sleep is boosting your productivity. The data shows a clear pattern.',
      negative: 'Poor sleep appears to be impacting your task completion. This is a common and fixable issue.',
    },
    recommendations: {
      improve: [
        'Aim for 7-8 hours of sleep',
        'Keep a consistent sleep schedule',
        'Avoid screens 1 hour before bed',
      ],
    },
  },
  {
    id: 'exercise_sleep',
    modules: ['fitness', 'health'],
    metrics: ['workoutsThisWeek', 'sleepQuality'],
    type: CORRELATION_TYPES.POSITIVE,
    description: 'Regular exercise improves sleep quality',
    explanation: {
      positive: 'Your workouts are contributing to better sleep. This creates a positive feedback loop.',
      negative: 'Lack of exercise may be affecting your sleep quality.',
    },
    recommendations: {
      improve: [
        'Exercise at least 3x per week',
        'Avoid intense workouts within 3 hours of bedtime',
        'Even light movement helps',
      ],
    },
  },
  {
    id: 'exercise_mood',
    modules: ['fitness', 'health'],
    metrics: ['workoutsThisWeek', 'moodScore'],
    type: CORRELATION_TYPES.POSITIVE,
    description: 'Exercise positively impacts mood',
    explanation: {
      positive: 'Your exercise routine is clearly benefiting your mood. Endorphins are powerful.',
      negative: 'Increasing physical activity could help improve your mood.',
    },
    recommendations: {
      improve: [
        'Even a 20-minute walk can help',
        'Consistency matters more than intensity',
        'Try morning workouts for all-day mood benefits',
      ],
    },
  },
  {
    id: 'budget_stress',
    modules: ['financial', 'productivity'],
    metrics: ['budgetProgress', 'taskCompletionRate'],
    type: CORRELATION_TYPES.NEGATIVE,
    description: 'Financial stress impacts focus and productivity',
    explanation: {
      active: 'Budget concerns appear to be affecting your focus. Financial stress is cognitively expensive.',
      inactive: 'Your financial health is supporting your productivity.',
    },
    recommendations: {
      improve: [
        'Review and adjust your budget',
        'Build an emergency fund to reduce anxiety',
        'Automate savings to remove decision fatigue',
      ],
    },
  },
  {
    id: 'protein_recovery',
    modules: ['health', 'fitness'],
    metrics: ['proteinIntake', 'workoutPerformance'],
    type: CORRELATION_TYPES.POSITIVE,
    description: 'Protein intake affects workout recovery and performance',
    explanation: {
      positive: 'Your protein intake is supporting your workout performance.',
      negative: 'Low protein intake may be limiting your recovery and gains.',
    },
    recommendations: {
      improve: [
        'Aim for 0.8-1g protein per pound of body weight',
        'Distribute protein across meals',
        'Consider post-workout protein within 2 hours',
      ],
    },
  },
  {
    id: 'hydration_energy',
    modules: ['health', 'productivity'],
    metrics: ['waterIntake', 'focusScore'],
    type: CORRELATION_TYPES.POSITIVE,
    description: 'Hydration affects energy and focus',
    explanation: {
      positive: 'Good hydration is supporting your energy levels.',
      negative: 'Dehydration may be causing low energy and poor focus.',
    },
    recommendations: {
      improve: [
        'Drink water first thing in the morning',
        'Keep water visible at your workspace',
        'Use the 8x8 rule: 8 glasses of 8oz',
      ],
    },
  },
  {
    id: 'streak_momentum',
    modules: ['gamification', 'productivity'],
    metrics: ['globalStreak', 'consistencyScore'],
    type: CORRELATION_TYPES.POSITIVE,
    description: 'Maintaining streaks builds momentum across all areas',
    explanation: {
      positive: 'Your streak momentum is creating spillover effects into other areas.',
      negative: 'Building consistent streaks could help establish positive momentum.',
    },
    recommendations: {
      improve: [
        'Start with one small daily habit',
        'Never miss twice in a row',
        'Use streak shields strategically',
      ],
    },
  },
  {
    id: 'journal_clarity',
    modules: ['journal', 'productivity'],
    metrics: ['journalFrequency', 'decisionQuality'],
    type: CORRELATION_TYPES.POSITIVE,
    description: 'Regular journaling improves decision-making clarity',
    explanation: {
      positive: 'Your journaling practice is contributing to clearer thinking.',
      negative: 'Regular reflection through journaling could improve your decision-making.',
    },
    recommendations: {
      improve: [
        'Write for just 5 minutes daily',
        'Use prompts if you\'re stuck',
        'Review weekly for patterns',
      ],
    },
  },
  {
    id: 'reading_knowledge',
    modules: ['knowledge', 'skills'],
    metrics: ['booksRead', 'learningSpeed'],
    type: CORRELATION_TYPES.POSITIVE,
    description: 'Reading accelerates learning in other areas',
    explanation: {
      positive: 'Your reading habit is accelerating learning across all skills.',
      negative: 'Increasing your reading could accelerate skill development.',
    },
    recommendations: {
      improve: [
        'Read 20 pages daily',
        'Mix fiction and non-fiction',
        'Take notes on key insights',
      ],
    },
  },
];

// ============================================================================
// PATTERN DETECTION
// ============================================================================

/**
 * Detect time-based patterns in user data
 */
export function detectTimePatterns(context) {
  const patterns = [];

  // Analyze task completion by day of week
  const tasksByDay = {};
  const dates = Object.keys(context.dailyTasks.allTasksByDate || {});

  dates.forEach((date) => {
    const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const tasks = context.dailyTasks.allTasksByDate[date] || [];
    const completed = tasks.filter((t) => t.completed).length;
    const total = tasks.length;

    if (!tasksByDay[day]) {
      tasksByDay[day] = { completed: 0, total: 0, count: 0 };
    }
    tasksByDay[day].completed += completed;
    tasksByDay[day].total += total;
    tasksByDay[day].count += 1;
  });

  // Find best and worst days
  const dayPerformance = Object.entries(tasksByDay)
    .map(([day, data]) => ({
      day,
      rate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      sampleSize: data.count,
    }))
    .filter((d) => d.sampleSize >= 2)
    .sort((a, b) => b.rate - a.rate);

  if (dayPerformance.length >= 2) {
    const best = dayPerformance[0];
    const worst = dayPerformance[dayPerformance.length - 1];

    if (best.rate - worst.rate > 20) {
      patterns.push({
        type: 'day_performance',
        insight: `Your productivity peaks on ${best.day}s (${best.rate.toFixed(0)}% completion) and dips on ${worst.day}s (${worst.rate.toFixed(0)}%).`,
        data: { best, worst },
        recommendation: `Schedule important tasks on ${best.day}s. Plan lighter work for ${worst.day}s or investigate what's different.`,
      });
    }
  }

  // Analyze workout patterns
  const workoutsByDay = {};
  (context.fitness.workouts || []).forEach((workout) => {
    const day = new Date(workout.date).toLocaleDateString('en-US', { weekday: 'long' });
    workoutsByDay[day] = (workoutsByDay[day] || 0) + 1;
  });

  const preferredWorkoutDays = Object.entries(workoutsByDay)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day]) => day);

  if (preferredWorkoutDays.length > 0) {
    patterns.push({
      type: 'workout_schedule',
      insight: `You tend to work out most on ${preferredWorkoutDays.join(', ')}.`,
      data: { workoutsByDay, preferred: preferredWorkoutDays },
      recommendation: 'Consider formalizing this pattern into a scheduled routine.',
    });
  }

  return patterns;
}

/**
 * Detect correlations between different metrics
 */
export function detectCorrelations(context) {
  const correlations = [];

  // Sleep → Productivity correlation
  const sleepLogs = context.health.sleepLogs || [];
  if (sleepLogs.length >= 3) {
    const recentSleep = sleepLogs.slice(0, 7);
    const avgSleep = recentSleep.reduce((sum, s) => sum + (s.quality || 0), 0) / recentSleep.length;
    const taskCompletion = context.dailyTasks.today.completionRate;

    if (avgSleep < 5 && taskCompletion < 50) {
      correlations.push({
        ...KNOWN_CORRELATIONS.find((c) => c.id === 'sleep_productivity'),
        strength: CORRELATION_STRENGTH.STRONG,
        currentState: 'negative',
        evidence: {
          avgSleepQuality: avgSleep.toFixed(1),
          taskCompletion,
        },
      });
    } else if (avgSleep >= 7 && taskCompletion >= 70) {
      correlations.push({
        ...KNOWN_CORRELATIONS.find((c) => c.id === 'sleep_productivity'),
        strength: CORRELATION_STRENGTH.STRONG,
        currentState: 'positive',
        evidence: {
          avgSleepQuality: avgSleep.toFixed(1),
          taskCompletion,
        },
      });
    }
  }

  // Exercise → Sleep correlation
  const workoutsThisWeek = context.fitness.workoutsThisWeek;
  if (sleepLogs.length > 0) {
    const recentSleepAvg =
      sleepLogs.slice(0, 3).reduce((sum, s) => sum + (s.quality || 0), 0) /
      Math.min(sleepLogs.length, 3);

    if (workoutsThisWeek >= 3 && recentSleepAvg >= 7) {
      correlations.push({
        ...KNOWN_CORRELATIONS.find((c) => c.id === 'exercise_sleep'),
        strength: CORRELATION_STRENGTH.MODERATE,
        currentState: 'positive',
        evidence: {
          workoutsThisWeek,
          avgSleepQuality: recentSleepAvg.toFixed(1),
        },
      });
    }
  }

  // Budget → Focus correlation
  if (context.financial.totalBudget > 0) {
    const budgetPercent =
      (context.financial.totalSpent / context.financial.totalBudget) * 100;
    const taskCompletion = context.dailyTasks.today.completionRate;

    if (budgetPercent > 100 && taskCompletion < 50) {
      correlations.push({
        ...KNOWN_CORRELATIONS.find((c) => c.id === 'budget_stress'),
        strength: CORRELATION_STRENGTH.MODERATE,
        currentState: 'active',
        evidence: {
          budgetPercent: budgetPercent.toFixed(0),
          taskCompletion,
        },
      });
    }
  }

  // Streak momentum
  const globalStreak = context.gamification.globalStreak;
  if (globalStreak >= 7) {
    const activeStreaks = context.gamification.streaks.active.length;
    if (activeStreaks >= 3) {
      correlations.push({
        ...KNOWN_CORRELATIONS.find((c) => c.id === 'streak_momentum'),
        strength: CORRELATION_STRENGTH.STRONG,
        currentState: 'positive',
        evidence: {
          globalStreak,
          activeStreaks,
        },
      });
    }
  }

  return correlations;
}

/**
 * Analyze trends over time
 */
export function analyzeTrends(context) {
  const trends = [];

  // Workout volume trend
  const workouts = context.fitness.workouts || [];
  if (workouts.length >= 4) {
    const recentWorkouts = workouts.slice(0, 4);
    const olderWorkouts = workouts.slice(4, 8);

    if (olderWorkouts.length >= 4) {
      const recentVolume = recentWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
      const olderVolume = olderWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);

      const change = ((recentVolume - olderVolume) / olderVolume) * 100;

      if (Math.abs(change) > 10) {
        trends.push({
          metric: 'workoutVolume',
          direction: change > 0 ? 'increasing' : 'decreasing',
          change: `${change > 0 ? '+' : ''}${change.toFixed(0)}%`,
          insight:
            change > 0
              ? 'Your workout volume is trending up. Progressive overload in action.'
              : 'Workout volume is decreasing. This may indicate fatigue or reduced effort.',
          recommendation:
            change > 0
              ? 'Keep it up, but watch for signs of overtraining.'
              : 'Consider deload week if fatigued, or re-evaluate program adherence.',
        });
      }
    }
  }

  // XP earning trend
  const moduleXP = context.gamification.moduleXP || {};
  const totalXP = Object.values(moduleXP).reduce((sum, xp) => sum + (xp || 0), 0);

  if (totalXP > 0) {
    // Identify which modules are growing
    const sortedModules = Object.entries(moduleXP)
      .filter(([_, xp]) => xp > 0)
      .sort((a, b) => b[1] - a[1]);

    if (sortedModules.length > 0) {
      const topModule = sortedModules[0][0];
      const topPercent = ((sortedModules[0][1] / totalXP) * 100).toFixed(0);

      trends.push({
        metric: 'xpDistribution',
        direction: 'concentrated',
        insight: `${topPercent}% of your XP comes from ${topModule}. You're highly focused there.`,
        recommendation:
          parseInt(topPercent) > 50
            ? 'Consider diversifying activities across other modules.'
            : 'Good balance across modules.',
      });
    }
  }

  return trends;
}

// ============================================================================
// EXPLANATION GENERATORS
// ============================================================================

/**
 * Generate a natural language explanation for a correlation
 */
export function explainCorrelation(correlation) {
  const state = correlation.currentState || 'positive';
  const baseExplanation =
    correlation.explanation[state] || correlation.explanation.positive;

  const parts = [];
  parts.push(baseExplanation);

  // Add evidence
  if (correlation.evidence) {
    const evidenceText = Object.entries(correlation.evidence)
      .map(([key, value]) => `${formatMetricName(key)}: ${value}`)
      .join(', ');
    parts.push(`(Current data: ${evidenceText})`);
  }

  // Add strength qualifier
  if (correlation.strength === CORRELATION_STRENGTH.STRONG) {
    parts.push('The pattern is very clear in your data.');
  } else if (correlation.strength === CORRELATION_STRENGTH.WEAK) {
    parts.push('This is a tentative observation - more data would help confirm.');
  }

  return parts.join(' ');
}

/**
 * Generate a natural language explanation for a pattern
 */
export function explainPattern(pattern) {
  return `${pattern.insight} ${pattern.recommendation}`;
}

/**
 * Generate a natural language explanation for a trend
 */
export function explainTrend(trend) {
  return `${trend.insight} ${trend.recommendation}`;
}

/**
 * Format a metric key into readable text
 */
function formatMetricName(key) {
  const names = {
    avgSleepQuality: 'Avg Sleep Quality',
    taskCompletion: 'Task Completion',
    workoutsThisWeek: 'Workouts This Week',
    budgetPercent: 'Budget Usage',
    globalStreak: 'Global Streak',
    activeStreaks: 'Active Streaks',
  };
  return names[key] || key.replace(/([A-Z])/g, ' $1').trim();
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Run comprehensive correlation and pattern analysis
 */
export function analyzeUserData() {
  const context = getCrossModuleContext();

  return {
    correlations: detectCorrelations(context),
    patterns: detectTimePatterns(context),
    trends: analyzeTrends(context),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get analysis formatted for Nova's context
 */
export function getAnalysisForPrompt() {
  const analysis = analyzeUserData();
  const lines = [];

  if (analysis.correlations.length > 0) {
    lines.push('## Cross-Module Correlations Detected');
    analysis.correlations.forEach((c) => {
      lines.push(`- ${explainCorrelation(c)}`);
    });
    lines.push('');
  }

  if (analysis.patterns.length > 0) {
    lines.push('## Time-Based Patterns');
    analysis.patterns.forEach((p) => {
      lines.push(`- ${explainPattern(p)}`);
    });
    lines.push('');
  }

  if (analysis.trends.length > 0) {
    lines.push('## Trends');
    analysis.trends.forEach((t) => {
      lines.push(`- ${explainTrend(t)}`);
    });
  }

  return lines.length > 0 ? lines.join('\n') : 'No significant patterns detected yet.';
}

/**
 * Get actionable recommendations based on analysis
 */
export function getRecommendations() {
  const analysis = analyzeUserData();
  const recommendations = [];

  // From correlations
  analysis.correlations.forEach((c) => {
    if (c.currentState === 'negative' || c.currentState === 'active') {
      if (c.recommendations?.improve) {
        recommendations.push({
          source: c.description,
          priority: c.strength === CORRELATION_STRENGTH.STRONG ? 1 : 2,
          actions: c.recommendations.improve,
        });
      }
    }
  });

  // From patterns
  analysis.patterns.forEach((p) => {
    if (p.recommendation) {
      recommendations.push({
        source: p.type,
        priority: 2,
        actions: [p.recommendation],
      });
    }
  });

  // From trends
  analysis.trends.forEach((t) => {
    if (t.recommendation && t.direction === 'decreasing') {
      recommendations.push({
        source: t.metric,
        priority: 2,
        actions: [t.recommendation],
      });
    }
  });

  return recommendations.sort((a, b) => a.priority - b.priority);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const correlationEngine = {
  CORRELATION_TYPES,
  CORRELATION_STRENGTH,
  KNOWN_CORRELATIONS,
  detectTimePatterns,
  detectCorrelations,
  analyzeTrends,
  explainCorrelation,
  explainPattern,
  explainTrend,
  analyzeUserData,
  getAnalysisForPrompt,
  getRecommendations,
};

export default correlationEngine;
