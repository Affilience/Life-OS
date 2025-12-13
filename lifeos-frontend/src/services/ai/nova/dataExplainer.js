/**
 * Data Explainer Service
 *
 * This service is the key to making Nova truly understand and explain
 * what every single data point means in the context of the user's life.
 *
 * Nova shouldn't just report "You have 1500 calories" - Nova should say
 * "You've eaten 1500 calories, which is 75% of your goal. At this time of day,
 * you're right on track. With dinner still ahead, you have room for a
 * 500 calorie meal."
 *
 * THIS IS WHAT MAKES NOVA MAGICAL.
 */

import { getCrossModuleContext } from '../crossModuleData';

// ============================================================================
// METRIC EXPLANATION TEMPLATES
// ============================================================================

/**
 * Complete explanation system for every metric in LifeOS
 * Each function takes the value and full context, returns a human explanation
 */
export const METRIC_EXPLAINERS = {
  // =========================================================================
  // GAMIFICATION & PROGRESS
  // =========================================================================

  level: (value, ctx) => {
    const stages = [
      { max: 5, name: 'Dreamer', desc: 'Just beginning your journey' },
      { max: 10, name: 'Spark', desc: 'Building your foundation' },
      { max: 15, name: 'Flame', desc: 'Developing momentum' },
      { max: 20, name: 'Blaze', desc: 'Systems are working' },
      { max: 25, name: 'Nova', desc: 'Real transformation happening' },
      { max: 30, name: 'Star', desc: 'Consistency is your superpower' },
      { max: 35, name: 'Stellar', desc: 'Operating at high level' },
      { max: 40, name: 'Supernova', desc: 'Peak performance unlocked' },
      { max: 45, name: 'Galaxy', desc: 'Mastery in multiple areas' },
      { max: 50, name: 'Cosmos', desc: 'Transcendent achievement' },
      { max: Infinity, name: 'Avatar of Mastery', desc: 'Complete life mastery' },
    ];

    const stage = stages.find(s => value <= s.max);
    const xpPercent = Math.round((ctx.gamification.currentXP / ctx.gamification.xpToNextLevel) * 100);

    return {
      summary: `Level ${value} - ${stage.name}`,
      meaning: stage.desc,
      progress: `${xpPercent}% to Level ${value + 1}`,
      xpNeeded: ctx.gamification.xpToNextLevel - ctx.gamification.currentXP,
      insight: value < 10
        ? 'Focus on consistency over intensity at this stage.'
        : value < 25
          ? 'Your habits are forming. Keep the momentum.'
          : value < 40
            ? 'You\'ve built real systems. Now optimize them.'
            : 'You\'re in the top tier. Teach others what you\'ve learned.',
    };
  },

  totalXP: (value, ctx) => {
    const milestones = [
      { xp: 1000, name: 'First Thousand' },
      { xp: 5000, name: 'Getting Serious' },
      { xp: 10000, name: '10K Club' },
      { xp: 50000, name: 'Dedicated' },
      { xp: 100000, name: 'Centurion' },
      { xp: 500000, name: 'Life Master' },
      { xp: 1000000, name: 'Millionaire' },
    ];

    const nextMilestone = milestones.find(m => value < m.xp);
    const topSources = ctx.xpSources.breakdown.slice(0, 3);

    return {
      summary: `${value.toLocaleString()} total XP earned`,
      meaning: 'XP represents all your logged progress across every area of life',
      nextMilestone: nextMilestone
        ? `${(nextMilestone.xp - value).toLocaleString()} XP until "${nextMilestone.name}"`
        : 'You\'ve hit all milestones!',
      breakdown: topSources.map(s => `${s.module}: ${s.percent}%`).join(', '),
      insight: `Your XP mainly comes from ${topSources[0]?.module || 'various activities'}. ${topSources[0]?.percent > 50 ? 'Consider diversifying.' : 'Good balance across modules.'}`,
    };
  },

  globalStreak: (value, ctx) => {
    const milestones = [7, 14, 21, 30, 60, 90, 100, 180, 365];
    const nextMilestone = milestones.find(m => m > value);

    const streakHealth = value === 0
      ? 'Start fresh today'
      : value < 7
        ? 'Building the habit (21 days to solidify)'
        : value < 30
          ? 'Habit is forming (keep going!)'
          : value < 90
            ? 'Habit is solid (now it\'s identity)'
            : 'This is who you are now';

    return {
      summary: `${value} day streak`,
      meaning: 'Consecutive days with meaningful activity logged',
      health: streakHealth,
      nextMilestone: nextMilestone ? `${nextMilestone - value} days until ${nextMilestone}-day milestone` : 'All milestones achieved!',
      insight: value === 0
        ? 'Today is day 1. Every streak starts here.'
        : value < 21
          ? 'Research shows 21 days to form a habit. Keep going.'
          : value < 66
            ? 'You\'re past habit formation. Now building identity.'
            : 'This level of consistency is rare. You\'ve made this part of who you are.',
    };
  },

  cosmicCredits: (value, ctx) => {
    return {
      summary: `${value.toLocaleString()} Cosmic Credits`,
      meaning: 'In-app currency earned through gameplay',
      uses: 'Use for cosmetics, equipment, and special unlocks in the Bazaar',
      insight: value < 100
        ? 'Keep completing quests and maintaining streaks to earn more.'
        : value < 1000
          ? 'Nice savings! Consider what you want to unlock.'
          : 'You\'re wealthy in Cosmic Credits. Time to spend on upgrades?',
    };
  },

  // =========================================================================
  // DAILY TASKS
  // =========================================================================

  taskCompletionRate: (value, ctx) => {
    const total = ctx.dailyTasks.today.total;
    const completed = ctx.dailyTasks.today.completed;
    const remaining = ctx.dailyTasks.today.remaining;
    const hour = new Date().getHours();

    let timeContext;
    if (hour < 12) timeContext = 'morning';
    else if (hour < 17) timeContext = 'afternoon';
    else timeContext = 'evening';

    const expectedByTime = {
      morning: 30,
      afternoon: 60,
      evening: 90,
    };

    const onTrack = value >= expectedByTime[timeContext];

    return {
      summary: `${value}% tasks completed (${completed}/${total})`,
      meaning: 'Percentage of today\'s planned tasks finished',
      remaining: remaining === 0 ? 'All done!' : `${remaining} tasks remaining`,
      onTrack: onTrack,
      insight: total === 0
        ? 'No tasks planned. Consider adding your priorities.'
        : remaining === 0
          ? 'All tasks complete! Exceptional execution.'
          : onTrack
            ? `On track for ${timeContext}. Keep the momentum.`
            : `Behind schedule for ${timeContext}. Focus on high-priority items first.`,
    };
  },

  // =========================================================================
  // NUTRITION & HEALTH
  // =========================================================================

  calories: (value, ctx) => {
    const goal = ctx.health.dailyGoals?.calories || 2000;
    const percent = Math.round((value / goal) * 100);
    const remaining = goal - value;
    const hour = new Date().getHours();

    let mealSuggestion;
    if (hour < 10 && percent < 20) mealSuggestion = 'Time for a good breakfast';
    else if (hour >= 12 && hour < 14 && percent < 40) mealSuggestion = 'Lunch should bring you closer to target';
    else if (hour >= 17 && percent < 60) mealSuggestion = 'You have room for a substantial dinner';
    else if (percent > 100) mealSuggestion = 'Already at goal - light snacking only if hungry';
    else mealSuggestion = 'On track';

    return {
      summary: `${value} / ${goal} calories (${percent}%)`,
      meaning: 'Total calories consumed today vs your daily goal',
      remaining: remaining > 0 ? `${remaining} calories remaining` : `${Math.abs(remaining)} calories over`,
      insight: mealSuggestion,
      quality: percent < 80
        ? 'Under target - ensure you\'re fueling adequately'
        : percent <= 110
          ? 'Right on target'
          : 'Over target - consider if this aligns with your goals',
    };
  },

  protein: (value, ctx) => {
    const goal = ctx.health.dailyGoals?.protein || 120;
    const percent = Math.round((value / goal) * 100);
    const perPound = ctx.health.currentWeight
      ? (value / ctx.health.currentWeight).toFixed(2)
      : null;

    return {
      summary: `${value}g / ${goal}g protein (${percent}%)`,
      meaning: 'Protein intake is crucial for muscle maintenance and satiety',
      perPound: perPound ? `${perPound}g per pound of body weight` : null,
      insight: percent < 50
        ? 'Protein is low. Prioritize it in your next meal - eggs, meat, or legumes.'
        : percent < 80
          ? 'Getting there. One more protein-rich meal will hit the target.'
          : percent >= 100
            ? 'Protein goal hit! Great for muscle maintenance and recovery.'
            : 'Almost there - add a protein snack to reach your goal.',
    };
  },

  sleepQuality: (value, ctx) => {
    const recentSleep = ctx.health.sleepLogs.slice(0, 7);
    const avgQuality = recentSleep.length > 0
      ? recentSleep.reduce((sum, s) => sum + (s.quality || 0), 0) / recentSleep.length
      : null;

    return {
      summary: `${value}/10 sleep quality`,
      meaning: 'Self-reported sleep quality score',
      weeklyAvg: avgQuality ? `Weekly average: ${avgQuality.toFixed(1)}/10` : null,
      insight: value < 4
        ? 'Poor sleep significantly impacts everything - prioritize recovery today.'
        : value < 6
          ? 'Below average sleep. Consider what affected it and adjust tonight.'
          : value < 8
            ? 'Decent rest. You should function well today.'
            : 'Excellent sleep - you\'re primed for peak performance.',
      impact: value < 5
        ? 'Expect reduced focus, willpower, and workout performance.'
        : value >= 7
          ? 'Good sleep sets you up for strong decision-making and energy.'
          : 'Moderate energy levels expected.',
    };
  },

  waterIntake: (value, ctx) => {
    const goal = 8; // glasses/cups
    const percent = Math.round((value / goal) * 100);

    return {
      summary: `${value}/${goal} glasses of water`,
      meaning: 'Hydration level for the day',
      insight: percent < 25
        ? 'Very low hydration. This affects energy, focus, and hunger signals.'
        : percent < 50
          ? 'Getting there. Keep a water bottle visible as a reminder.'
          : percent < 75
            ? 'Good hydration progress. A few more glasses to go.'
            : percent < 100
              ? 'Almost fully hydrated!'
              : 'Hydration goal met! Well done.',
    };
  },

  // =========================================================================
  // FITNESS & WORKOUTS
  // =========================================================================

  workoutsThisWeek: (value, ctx) => {
    const target = 4; // assuming 4x/week is typical goal
    const onPace = (new Date().getDay() / 7) * target <= value;

    return {
      summary: `${value} workouts this week`,
      meaning: 'Strength training sessions completed this week',
      insight: value === 0
        ? 'No workouts yet this week. When\'s your next session?'
        : value < 3
          ? `${value} workout${value > 1 ? 's' : ''} in. ${onPace ? 'On pace.' : 'Behind pace.'}`
          : value < 5
            ? 'Solid training week. Consistent effort.'
            : value >= 7
              ? 'Training every day - ensure you\'re recovering properly.'
              : 'Great workout frequency this week.',
      recovery: value >= 5
        ? 'High volume. Sleep and nutrition are extra important.'
        : 'Normal training load.',
    };
  },

  totalVolume: (value, ctx) => {
    const formatted = value > 1000 ? `${(value / 1000).toFixed(1)}k` : value;

    return {
      summary: `${formatted} lbs total volume`,
      meaning: 'Weight × Reps summed across all sets in the workout',
      insight: value < 5000
        ? 'Light session - could be recovery/technique focused.'
        : value < 15000
          ? 'Moderate volume - solid training session.'
          : value < 30000
            ? 'High volume session - significant training stimulus.'
            : 'Very high volume - this was a big session. Prioritize recovery.',
    };
  },

  personalRecord: (exercise, value, ctx) => {
    return {
      summary: `PR: ${value.weight}lbs × ${value.reps} reps`,
      meaning: 'Your all-time best performance on this exercise',
      insight: 'Personal records are proof of progressive overload - the key to strength gains.',
      nextTarget: `Try ${value.weight + 5}lbs × ${value.reps} or ${value.weight}lbs × ${value.reps + 1}`,
    };
  },

  // =========================================================================
  // FINANCIAL
  // =========================================================================

  budgetProgress: (value, ctx) => {
    const total = ctx.financial.totalBudget;
    const spent = ctx.financial.totalSpent;
    const remaining = total - spent;
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dayOfMonth = new Date().getDate();
    const expectedPercent = (dayOfMonth / daysInMonth) * 100;

    return {
      summary: `${value}% of budget used`,
      meaning: `$${spent.toFixed(0)} spent of $${total.toFixed(0)} budgeted`,
      remaining: remaining > 0 ? `$${remaining.toFixed(0)} remaining` : `$${Math.abs(remaining).toFixed(0)} over budget`,
      pacing: value <= expectedPercent
        ? `On track (expected ${expectedPercent.toFixed(0)}% by now)`
        : `Ahead of pace (expected ${expectedPercent.toFixed(0)}% by now)`,
      insight: value > 100
        ? 'Over budget. Review spending and adjust for next month.'
        : value > expectedPercent + 10
          ? 'Spending faster than expected. Consider slowing down.'
          : 'Budget pacing looks healthy.',
    };
  },

  savingsProgress: (fund, ctx) => {
    const percent = fund.target > 0 ? Math.round((fund.current / fund.target) * 100) : 0;
    const remaining = fund.target - fund.current;

    return {
      summary: `${fund.name}: ${percent}% ($${fund.current.toFixed(0)}/$${fund.target.toFixed(0)})`,
      meaning: 'Progress toward your savings goal',
      remaining: `$${remaining.toFixed(0)} to go`,
      insight: percent < 25
        ? 'Early stages. Small consistent contributions add up.'
        : percent < 50
          ? 'Making progress! You\'re building toward your goal.'
          : percent < 75
            ? 'Over halfway there. The finish line is visible.'
            : percent < 100
              ? 'Almost there! Final stretch.'
              : 'Goal reached! Consider your next target.',
    };
  },

  netWorth: (value, ctx) => {
    const formatted = value >= 1000000
      ? `$${(value / 1000000).toFixed(2)}M`
      : value >= 1000
        ? `$${(value / 1000).toFixed(1)}k`
        : `$${value.toFixed(0)}`;

    return {
      summary: `Net Worth: ${formatted}`,
      meaning: 'Total assets minus total liabilities',
      insight: value < 0
        ? 'Negative net worth - focus on debt reduction.'
        : value < 10000
          ? 'Building your foundation. Every dollar saved matters.'
          : value < 100000
            ? 'Solid foundation. Continue building wealth.'
            : 'Strong financial position. Consider optimizing investments.',
    };
  },

  // =========================================================================
  // KNOWLEDGE & LEARNING
  // =========================================================================

  booksCompleted: (value, ctx) => {
    const booksPerYear = ctx.knowledge.booksCompleted.filter(b => {
      const finishDate = new Date(b.finishDate);
      return finishDate.getFullYear() === new Date().getFullYear();
    }).length;

    return {
      summary: `${value} books completed lifetime`,
      meaning: 'Total books you\'ve finished reading',
      thisYear: `${booksPerYear} books this year`,
      pace: booksPerYear < 6
        ? 'Below 1 book/month pace'
        : booksPerYear < 12
          ? 'About 1 book/month - solid reader'
          : booksPerYear < 24
            ? 'Avid reader - 2+ books/month'
            : 'Exceptional reading pace',
      insight: value < 10
        ? 'Every book adds to your knowledge compound interest.'
        : value < 50
          ? 'Building a solid reading foundation.'
          : 'You\'re a serious learner. Consider teaching what you know.',
    };
  },

  practiceHours: (skill, ctx) => {
    const value = skill.totalHours;

    return {
      summary: `${value} hours practiced in ${skill.name}`,
      meaning: 'Total deliberate practice time logged',
      insight: value < 10
        ? 'Still in exploration phase. Keep showing up.'
        : value < 100
          ? 'Building fundamentals. Consistency matters more than duration.'
          : value < 1000
            ? 'Developing real competence. You\'re past beginner.'
            : value < 10000
              ? 'Approaching mastery level. Deep expertise forming.'
              : 'Expert level practice. You could teach this.',
      reference: '10,000 hours is the commonly cited mastery threshold (though quality matters more than hours).',
    };
  },

  // =========================================================================
  // CHARACTER & EQUIPMENT
  // =========================================================================

  characterLevel: (value, ctx) => {
    const tier = Math.floor(value / 10) + 1;
    const xpPercent = Math.round((ctx.character.xp / ctx.character.xpToNextLevel) * 100);

    return {
      summary: `Character Level ${value} (Tier ${ctx.character.tier})`,
      meaning: 'Your RPG character progression in LifeOS',
      prestige: ctx.character.prestige > 0
        ? `Prestige ${ctx.character.prestige} (${ctx.character.xpMultiplier}x XP bonus)`
        : 'No prestige yet',
      progress: `${xpPercent}% to level ${value + 1}`,
      insight: ctx.character.prestige === 0 && value >= 50
        ? 'Consider prestiging for permanent XP bonuses!'
        : `Keep leveling to unlock more equipment and features.`,
    };
  },

  stats: (statName, value, ctx) => {
    const statDescriptions = {
      strength: {
        meaning: 'Affects workout effectiveness and physical challenges',
        benefit: `+${value}% workout XP bonus`,
      },
      vitality: {
        meaning: 'Health regeneration and endurance',
        benefit: `+${value}% health-related XP bonus`,
      },
      intelligence: {
        meaning: 'Learning speed and knowledge retention',
        benefit: `+${value}% knowledge/skill XP bonus`,
      },
      wisdom: {
        meaning: 'Overall XP gain and decision quality',
        benefit: `+${value}% global XP bonus`,
      },
      defense: {
        meaning: 'Streak protection and resilience',
        benefit: `${value}% chance to protect streaks on missed days`,
      },
    };

    const stat = statDescriptions[statName] || { meaning: 'Unknown stat', benefit: 'Unknown' };

    return {
      summary: `${statName}: ${value}`,
      meaning: stat.meaning,
      benefit: stat.benefit,
      insight: value < 10
        ? 'Low stat - equip gear or complete quests to improve.'
        : value < 25
          ? 'Developing stat. Keep progressing.'
          : value < 50
            ? 'Strong stat. Noticeable benefits.'
            : 'Powerful stat. Maximum effectiveness.',
    };
  },
};

// ============================================================================
// MAIN EXPLANATION FUNCTIONS
// ============================================================================

/**
 * Get a comprehensive explanation for any metric
 *
 * @param {string} metricKey - The key identifying the metric
 * @param {any} value - The current value of the metric
 * @param {object} additionalContext - Any additional context needed (e.g., skill name)
 * @returns {object} Full explanation object
 */
export function explainMetric(metricKey, value, additionalContext = {}) {
  const context = getCrossModuleContext();
  const explainer = METRIC_EXPLAINERS[metricKey];

  if (explainer) {
    return explainer(value, { ...context, ...additionalContext });
  }

  // Fallback for unknown metrics
  return {
    summary: `${metricKey}: ${value}`,
    meaning: 'Metric tracked in LifeOS',
    insight: 'Track this over time to see patterns.',
  };
}

/**
 * Generate a natural language explanation of a metric
 *
 * @param {string} metricKey - The key identifying the metric
 * @param {any} value - The current value
 * @param {object} additionalContext - Any additional context
 * @returns {string} Natural language explanation
 */
export function explainMetricNaturally(metricKey, value, additionalContext = {}) {
  const explanation = explainMetric(metricKey, value, additionalContext);

  // Build natural language from the explanation object
  const parts = [];

  if (explanation.summary) parts.push(explanation.summary);
  if (explanation.meaning) parts.push(`This represents ${explanation.meaning.toLowerCase()}.`);
  if (explanation.insight) parts.push(explanation.insight);

  return parts.join(' ');
}

/**
 * Explain multiple metrics in context
 * Useful for dashboard summaries
 */
export function explainDashboard() {
  const context = getCrossModuleContext();

  return {
    level: explainMetric('level', context.gamification.level),
    streak: explainMetric('globalStreak', context.gamification.globalStreak),
    tasks: explainMetric('taskCompletionRate', context.dailyTasks.today.completionRate),
    calories: explainMetric('calories', context.health.todayNutrition.calories),
    workouts: explainMetric('workoutsThisWeek', context.fitness.workoutsThisWeek),
    budget: explainMetric('budgetProgress', context.financial.totalBudget > 0
      ? Math.round((context.financial.totalSpent / context.financial.totalBudget) * 100)
      : 0),
  };
}

/**
 * Generate a "state of your life" summary
 * This is what Nova uses to truly understand the user
 */
export function generateLifeSummary() {
  const context = getCrossModuleContext();
  const explanations = explainDashboard();

  const summary = {
    overall: {
      level: explanations.level.summary,
      insight: explanations.level.insight,
    },
    today: {
      tasks: explanations.tasks.summary,
      insight: explanations.tasks.insight,
      nutrition: explanations.calories.summary,
      nutritionInsight: explanations.calories.insight,
    },
    streaks: {
      global: explanations.streak.summary,
      health: explanations.streak.health,
      atRisk: context.gamification.streaks.atRisk.length,
    },
    fitness: {
      summary: explanations.workouts.summary,
      insight: explanations.workouts.insight,
    },
    financial: {
      summary: explanations.budget.summary,
      insight: explanations.budget.insight,
    },
  };

  return summary;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const dataExplainer = {
  explainMetric,
  explainMetricNaturally,
  explainDashboard,
  generateLifeSummary,
  METRIC_EXPLAINERS,
};

export default dataExplainer;
