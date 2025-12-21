/**
 * Nova Trend Analysis Service
 *
 * Analyzes user data to identify trends, patterns, and insights.
 * Provides Nova with actionable intelligence about user progress.
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate percentage change between two values
 */
function percentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Get date X days ago
 */
function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Calculate average of array
 */
function average(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + (val || 0), 0) / arr.length;
}

/**
 * Calculate trend direction
 */
function getTrendDirection(current, previous) {
  const change = percentChange(current, previous);
  if (change > 10) return 'up';
  if (change < -10) return 'down';
  return 'stable';
}

/**
 * Format trend for display
 */
function formatTrend(direction, percent) {
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  const sign = percent > 0 ? '+' : '';
  return `${arrow} ${sign}${percent}%`;
}

// ============================================================================
// TASK TRENDS
// ============================================================================

/**
 * Analyze task completion trends
 */
export function analyzeTaskTrends(dailyTasks) {
  const tasksByDate = dailyTasks.allTasksByDate || {};
  const today = new Date().toISOString().split('T')[0];

  // Get this week's data
  const thisWeekDates = [];
  const lastWeekDates = [];
  for (let i = 0; i < 7; i++) {
    thisWeekDates.push(daysAgo(i));
    lastWeekDates.push(daysAgo(i + 7));
  }

  // Calculate completion rates
  const thisWeekTasks = thisWeekDates.flatMap(d => tasksByDate[d] || []);
  const lastWeekTasks = lastWeekDates.flatMap(d => tasksByDate[d] || []);

  const thisWeekCompleted = thisWeekTasks.filter(t => t.completed).length;
  const thisWeekTotal = thisWeekTasks.length;
  const lastWeekCompleted = lastWeekTasks.filter(t => t.completed).length;
  const lastWeekTotal = lastWeekTasks.length;

  const thisWeekRate = thisWeekTotal > 0 ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0;
  const lastWeekRate = lastWeekTotal > 0 ? Math.round((lastWeekCompleted / lastWeekTotal) * 100) : 0;

  // Today's progress
  const todayTasks = tasksByDate[today] || [];
  const todayCompleted = todayTasks.filter(t => t.completed).length;
  const todayTotal = todayTasks.length;

  // Find most productive day
  const dayStats = {};
  Object.entries(tasksByDate).forEach(([date, tasks]) => {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!dayStats[dayOfWeek]) {
      dayStats[dayOfWeek] = { completed: 0, total: 0 };
    }
    dayStats[dayOfWeek].completed += tasks.filter(t => t.completed).length;
    dayStats[dayOfWeek].total += tasks.length;
  });

  let bestDay = null;
  let bestRate = 0;
  Object.entries(dayStats).forEach(([day, stats]) => {
    const rate = stats.total > 0 ? stats.completed / stats.total : 0;
    if (rate > bestRate) {
      bestRate = rate;
      bestDay = day;
    }
  });

  return {
    today: {
      completed: todayCompleted,
      total: todayTotal,
      rate: todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0,
    },
    thisWeek: {
      completed: thisWeekCompleted,
      total: thisWeekTotal,
      rate: thisWeekRate,
    },
    lastWeek: {
      completed: lastWeekCompleted,
      total: lastWeekTotal,
      rate: lastWeekRate,
    },
    trend: {
      direction: getTrendDirection(thisWeekRate, lastWeekRate),
      change: percentChange(thisWeekRate, lastWeekRate),
      formatted: formatTrend(getTrendDirection(thisWeekRate, lastWeekRate), percentChange(thisWeekRate, lastWeekRate)),
    },
    insight: thisWeekRate > lastWeekRate
      ? `Task completion is up ${percentChange(thisWeekRate, lastWeekRate)}% from last week`
      : thisWeekRate < lastWeekRate
        ? `Task completion is down ${Math.abs(percentChange(thisWeekRate, lastWeekRate))}% from last week`
        : 'Task completion is stable compared to last week',
    bestDay: bestDay ? `${bestDay} is your most productive day` : null,
  };
}

// ============================================================================
// FITNESS TRENDS
// ============================================================================

/**
 * Analyze fitness and workout trends
 */
export function analyzeFitnessTrends(fitness) {
  const workouts = fitness.workouts || [];
  const cardioWorkouts = fitness.cardioWorkouts || [];

  // Get recent workouts
  const thisWeek = workouts.filter(w => new Date(w.date) > new Date(daysAgo(7)));
  const lastWeek = workouts.filter(w => {
    const d = new Date(w.date);
    return d > new Date(daysAgo(14)) && d <= new Date(daysAgo(7));
  });

  // Volume analysis (strength training)
  const thisWeekVolume = thisWeek.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
  const lastWeekVolume = lastWeek.reduce((sum, w) => sum + (w.totalVolume || 0), 0);

  // Workout frequency
  const thisWeekCount = thisWeek.length;
  const lastWeekCount = lastWeek.length;

  // Cardio analysis
  const thisWeekCardio = cardioWorkouts.filter(w => new Date(w.date) > new Date(daysAgo(7)));
  const lastWeekCardio = cardioWorkouts.filter(w => {
    const d = new Date(w.date);
    return d > new Date(daysAgo(14)) && d <= new Date(daysAgo(7));
  });

  const thisWeekCardioMinutes = thisWeekCardio.reduce((sum, w) => sum + (w.duration || 0), 0);
  const lastWeekCardioMinutes = lastWeekCardio.reduce((sum, w) => sum + (w.duration || 0), 0);

  // PR tracking
  const recentPRs = workouts
    .flatMap(w => (w.exercises || [])
      .flatMap(e => (e.sets || [])
        .filter(s => s.isPR)
        .map(s => ({ exercise: e.name, weight: s.weight, reps: s.reps, date: w.date }))
      )
    )
    .filter(pr => new Date(pr.date) > new Date(daysAgo(30)));

  // Rest days
  const workoutDates = new Set([
    ...thisWeek.map(w => w.date),
    ...thisWeekCardio.map(w => w.date),
  ]);
  const restDaysThisWeek = 7 - workoutDates.size;

  return {
    thisWeek: {
      workouts: thisWeekCount,
      cardio: thisWeekCardio.length,
      volume: thisWeekVolume,
      cardioMinutes: thisWeekCardioMinutes,
    },
    lastWeek: {
      workouts: lastWeekCount,
      cardio: lastWeekCardio.length,
      volume: lastWeekVolume,
      cardioMinutes: lastWeekCardioMinutes,
    },
    trends: {
      frequency: {
        direction: getTrendDirection(thisWeekCount, lastWeekCount),
        change: percentChange(thisWeekCount, lastWeekCount),
      },
      volume: {
        direction: getTrendDirection(thisWeekVolume, lastWeekVolume),
        change: percentChange(thisWeekVolume, lastWeekVolume),
      },
      cardio: {
        direction: getTrendDirection(thisWeekCardioMinutes, lastWeekCardioMinutes),
        change: percentChange(thisWeekCardioMinutes, lastWeekCardioMinutes),
      },
    },
    recentPRs: recentPRs.slice(0, 5),
    prCount: recentPRs.length,
    restDays: restDaysThisWeek,
    insights: [
      thisWeekCount > lastWeekCount
        ? `Workout frequency up ${percentChange(thisWeekCount, lastWeekCount)}%`
        : thisWeekCount < lastWeekCount
          ? `Workout frequency down ${Math.abs(percentChange(thisWeekCount, lastWeekCount))}%`
          : null,
      thisWeekVolume > lastWeekVolume
        ? `Training volume up ${percentChange(thisWeekVolume, lastWeekVolume)}%`
        : null,
      recentPRs.length > 0
        ? `${recentPRs.length} PR${recentPRs.length > 1 ? 's' : ''} in the last 30 days`
        : null,
      restDaysThisWeek < 2
        ? 'Consider adding a rest day for recovery'
        : null,
    ].filter(Boolean),
  };
}

// ============================================================================
// NUTRITION TRENDS
// ============================================================================

/**
 * Analyze nutrition trends
 */
export function analyzeNutritionTrends(health) {
  const meals = health.meals || [];
  const goals = health.dailyGoals || {};

  // Get meals by date
  const mealsByDate = {};
  meals.forEach(meal => {
    if (!mealsByDate[meal.date]) {
      mealsByDate[meal.date] = [];
    }
    mealsByDate[meal.date].push(meal);
  });

  // Calculate daily totals for recent days
  const dailyTotals = [];
  for (let i = 0; i < 14; i++) {
    const date = daysAgo(i);
    const dayMeals = mealsByDate[date] || [];
    const totals = dayMeals.reduce((acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
      count: acc.count + 1,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });

    dailyTotals.push({ date, ...totals });
  }

  const thisWeek = dailyTotals.slice(0, 7);
  const lastWeek = dailyTotals.slice(7, 14);

  const thisWeekAvgCalories = Math.round(average(thisWeek.map(d => d.calories)));
  const lastWeekAvgCalories = Math.round(average(lastWeek.map(d => d.calories)));
  const thisWeekAvgProtein = Math.round(average(thisWeek.map(d => d.protein)));
  const lastWeekAvgProtein = Math.round(average(lastWeek.map(d => d.protein)));

  // Goal adherence
  const daysOnTarget = thisWeek.filter(d => {
    if (!goals.calories) return true;
    const variance = Math.abs(d.calories - goals.calories) / goals.calories;
    return variance < 0.1; // Within 10%
  }).length;

  const proteinGoalDays = thisWeek.filter(d => {
    if (!goals.protein) return true;
    return d.protein >= goals.protein * 0.9; // At least 90% of goal
  }).length;

  // Logging consistency
  const loggedDays = thisWeek.filter(d => d.count > 0).length;

  return {
    averages: {
      thisWeek: {
        calories: thisWeekAvgCalories,
        protein: thisWeekAvgProtein,
      },
      lastWeek: {
        calories: lastWeekAvgCalories,
        protein: lastWeekAvgProtein,
      },
    },
    trends: {
      calories: {
        direction: getTrendDirection(thisWeekAvgCalories, lastWeekAvgCalories),
        change: percentChange(thisWeekAvgCalories, lastWeekAvgCalories),
      },
      protein: {
        direction: getTrendDirection(thisWeekAvgProtein, lastWeekAvgProtein),
        change: percentChange(thisWeekAvgProtein, lastWeekAvgProtein),
      },
    },
    consistency: {
      daysLogged: loggedDays,
      daysOnCalorieTarget: daysOnTarget,
      daysOnProteinTarget: proteinGoalDays,
    },
    insights: [
      loggedDays < 5
        ? 'Try to log meals more consistently for better insights'
        : `Great logging consistency - ${loggedDays}/7 days`,
      goals.calories && thisWeekAvgCalories > goals.calories * 1.1
        ? `Averaging ${thisWeekAvgCalories - goals.calories} calories over target`
        : null,
      goals.protein && thisWeekAvgProtein < goals.protein * 0.8
        ? `Protein intake averaging ${goals.protein - thisWeekAvgProtein}g below target`
        : null,
      thisWeekAvgProtein > lastWeekAvgProtein
        ? `Protein intake up ${percentChange(thisWeekAvgProtein, lastWeekAvgProtein)}%`
        : null,
    ].filter(Boolean),
  };
}

// ============================================================================
// STREAK TRENDS
// ============================================================================

/**
 * Analyze streak patterns
 */
export function analyzeStreakTrends(gamification) {
  const streaks = gamification.streaks || {};
  const globalStreak = gamification.globalStreak || 0;

  // Get active streaks
  const activeStreaks = Object.entries(streaks.raw || streaks)
    .filter(([_, s]) => s && s.current > 0)
    .map(([name, s]) => ({
      name,
      current: s.current,
      best: s.best,
      percentOfBest: s.best > 0 ? Math.round((s.current / s.best) * 100) : 100,
      lastActivity: s.lastActivity,
    }))
    .sort((a, b) => b.current - a.current);

  // Streaks at risk (not logged in 20+ hours)
  const atRisk = activeStreaks.filter(s => {
    if (!s.lastActivity) return false;
    const hoursSince = (Date.now() - new Date(s.lastActivity).getTime()) / (1000 * 60 * 60);
    return hoursSince > 20 && s.current >= 3;
  });

  // Find longest streak
  const longestCurrent = activeStreaks[0] || null;

  // Find closest to personal best
  const closeToPB = activeStreaks.filter(s => s.percentOfBest >= 80 && s.current < s.best);

  return {
    global: globalStreak,
    active: activeStreaks,
    atRisk,
    longestCurrent,
    closeToPB,
    insights: [
      globalStreak > 0 ? `Global streak: ${globalStreak} days` : null,
      longestCurrent ? `Longest active: ${longestCurrent.name} (${longestCurrent.current} days)` : null,
      atRisk.length > 0 ? `${atRisk.length} streak${atRisk.length > 1 ? 's' : ''} at risk of breaking` : null,
      closeToPB.length > 0 ? `${closeToPB[0].name} is ${closeToPB[0].best - closeToPB[0].current} days from personal best` : null,
    ].filter(Boolean),
  };
}

// ============================================================================
// SKILL PROGRESS TRENDS
// ============================================================================

/**
 * Analyze skill practice trends
 */
export function analyzeSkillTrends(skills) {
  const allSkills = skills.allSkills || [];

  // Get practice from last 2 weeks
  const thisWeekPractice = {};
  const lastWeekPractice = {};

  allSkills.forEach(skill => {
    const sessions = skill.sessions || [];

    const thisWeek = sessions
      .filter(s => new Date(s.date) > new Date(daysAgo(7)))
      .reduce((sum, s) => sum + (s.minutes || 0), 0);

    const lastWeek = sessions
      .filter(s => {
        const d = new Date(s.date);
        return d > new Date(daysAgo(14)) && d <= new Date(daysAgo(7));
      })
      .reduce((sum, s) => sum + (s.minutes || 0), 0);

    thisWeekPractice[skill.name] = thisWeek;
    lastWeekPractice[skill.name] = lastWeek;
  });

  // Total practice time
  const thisWeekTotal = Object.values(thisWeekPractice).reduce((sum, m) => sum + m, 0);
  const lastWeekTotal = Object.values(lastWeekPractice).reduce((sum, m) => sum + m, 0);

  // Most practiced skill this week
  const mostPracticed = Object.entries(thisWeekPractice)
    .sort((a, b) => b[1] - a[1])[0];

  // Skills with no practice this week
  const neglectedSkills = allSkills
    .filter(s => !thisWeekPractice[s.name] || thisWeekPractice[s.name] === 0)
    .map(s => s.name);

  return {
    thisWeek: {
      totalMinutes: thisWeekTotal,
      totalHours: Math.round(thisWeekTotal / 60 * 10) / 10,
      bySkill: thisWeekPractice,
    },
    lastWeek: {
      totalMinutes: lastWeekTotal,
      totalHours: Math.round(lastWeekTotal / 60 * 10) / 10,
    },
    trend: {
      direction: getTrendDirection(thisWeekTotal, lastWeekTotal),
      change: percentChange(thisWeekTotal, lastWeekTotal),
    },
    mostPracticed: mostPracticed ? { skill: mostPracticed[0], minutes: mostPracticed[1] } : null,
    neglectedSkills: neglectedSkills.slice(0, 3),
    insights: [
      thisWeekTotal > lastWeekTotal
        ? `Practice time up ${percentChange(thisWeekTotal, lastWeekTotal)}%`
        : thisWeekTotal < lastWeekTotal
          ? `Practice time down ${Math.abs(percentChange(thisWeekTotal, lastWeekTotal))}%`
          : null,
      mostPracticed && mostPracticed[1] > 60
        ? `Most practice: ${mostPracticed[0]} (${Math.round(mostPracticed[1] / 60 * 10) / 10}h)`
        : null,
      neglectedSkills.length > 0 && neglectedSkills.length <= 3
        ? `No practice this week: ${neglectedSkills.join(', ')}`
        : null,
    ].filter(Boolean),
  };
}

// ============================================================================
// FINANCIAL TRENDS
// ============================================================================

/**
 * Analyze spending trends
 */
export function analyzeFinancialTrends(financial) {
  const transactions = financial.transactions || [];
  const budgetEnvelopes = financial.budgetEnvelopes || [];

  // Group transactions by date
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const lastMonth = transactions.filter(t => {
    const d = new Date(t.date);
    const lastM = new Date();
    lastM.setMonth(lastM.getMonth() - 1);
    return d.getMonth() === lastM.getMonth() && d.getFullYear() === lastM.getFullYear();
  });

  // Calculate spending
  const thisMonthSpending = thisMonth
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const lastMonthSpending = lastMonth
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Budget analysis
  const overBudget = budgetEnvelopes.filter(e => (e.spent || 0) > (e.allocated || 0));
  const underBudget = budgetEnvelopes.filter(e => {
    const percentUsed = e.allocated > 0 ? (e.spent || 0) / e.allocated : 0;
    return percentUsed < 0.5;
  });

  // Spending by category
  const spendingByCategory = {};
  thisMonth.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'Other';
    spendingByCategory[cat] = (spendingByCategory[cat] || 0) + (t.amount || 0);
  });

  const topCategory = Object.entries(spendingByCategory)
    .sort((a, b) => b[1] - a[1])[0];

  return {
    thisMonth: {
      spending: thisMonthSpending,
      transactions: thisMonth.length,
    },
    lastMonth: {
      spending: lastMonthSpending,
      transactions: lastMonth.length,
    },
    trend: {
      direction: getTrendDirection(thisMonthSpending, lastMonthSpending),
      change: percentChange(thisMonthSpending, lastMonthSpending),
    },
    budget: {
      overBudget: overBudget.map(e => e.name),
      underUtilized: underBudget.map(e => e.name),
    },
    topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
    insights: [
      thisMonthSpending < lastMonthSpending
        ? `Spending down ${Math.abs(percentChange(thisMonthSpending, lastMonthSpending))}% from last month`
        : thisMonthSpending > lastMonthSpending
          ? `Spending up ${percentChange(thisMonthSpending, lastMonthSpending)}% from last month`
          : null,
      overBudget.length > 0
        ? `Over budget: ${overBudget.map(e => e.name).join(', ')}`
        : null,
      topCategory
        ? `Top spending: ${topCategory[0]} ($${topCategory[1].toFixed(0)})`
        : null,
    ].filter(Boolean),
  };
}

// ============================================================================
// MASTER TREND ANALYSIS
// ============================================================================

/**
 * Generate complete trend analysis for all modules
 */
export function generateTrendAnalysis(context) {
  const analysis = {};

  // Task trends
  if (context.dailyTasks) {
    analysis.tasks = analyzeTaskTrends(context.dailyTasks);
  }

  // Fitness trends
  if (context.fitness) {
    analysis.fitness = analyzeFitnessTrends(context.fitness);
  }

  // Nutrition trends
  if (context.health) {
    analysis.nutrition = analyzeNutritionTrends(context.health);
  }

  // Streak trends
  if (context.gamification) {
    analysis.streaks = analyzeStreakTrends(context.gamification);
  }

  // Skill trends
  if (context.skills) {
    analysis.skills = analyzeSkillTrends(context.skills);
  }

  // Financial trends
  if (context.financial) {
    analysis.financial = analyzeFinancialTrends(context.financial);
  }

  // Generate summary insights
  const allInsights = [
    ...(analysis.tasks?.insight ? [analysis.tasks.insight] : []),
    ...(analysis.fitness?.insights || []),
    ...(analysis.nutrition?.insights || []),
    ...(analysis.streaks?.insights || []),
    ...(analysis.skills?.insights || []),
    ...(analysis.financial?.insights || []),
  ].filter(Boolean);

  // Priority insights (most important)
  const priorityInsights = [
    // Streaks at risk are highest priority
    analysis.streaks?.atRisk?.length > 0
      ? `Streak at risk: ${analysis.streaks.atRisk[0].name} (${analysis.streaks.atRisk[0].current} days)`
      : null,
    // Tasks behind today
    analysis.tasks?.today?.completed < analysis.tasks?.today?.total && new Date().getHours() > 18
      ? `${analysis.tasks.today.total - analysis.tasks.today.completed} tasks remaining today`
      : null,
    // Over budget
    analysis.financial?.budget?.overBudget?.length > 0
      ? `Budget alert: ${analysis.financial.budget.overBudget[0]} is over budget`
      : null,
  ].filter(Boolean);

  return {
    ...analysis,
    allInsights,
    priorityInsights,
    summary: generateTrendSummary(analysis),
  };
}

/**
 * Generate a human-readable trend summary
 */
function generateTrendSummary(analysis) {
  const lines = [];

  if (analysis.tasks) {
    lines.push(`Tasks: ${analysis.tasks.thisWeek.rate}% completion rate ${analysis.tasks.trend.formatted}`);
  }

  if (analysis.fitness) {
    lines.push(`Fitness: ${analysis.fitness.thisWeek.workouts} workouts this week`);
  }

  if (analysis.streaks?.global) {
    lines.push(`Streak: ${analysis.streaks.global} days global streak`);
  }

  if (analysis.nutrition?.consistency) {
    lines.push(`Nutrition: ${analysis.nutrition.consistency.daysLogged}/7 days logged`);
  }

  if (analysis.skills?.thisWeek) {
    lines.push(`Skills: ${analysis.skills.thisWeek.totalHours}h practice this week`);
  }

  return lines.join(' | ');
}

/**
 * Format trends for Nova's context
 */
export function formatTrendsForPrompt(trends) {
  if (!trends) return '';

  const sections = [];

  sections.push('=== TREND ANALYSIS ===');

  if (trends.priorityInsights?.length > 0) {
    sections.push('PRIORITY ALERTS:');
    trends.priorityInsights.forEach(i => sections.push(`  ! ${i}`));
  }

  if (trends.summary) {
    sections.push(`\nSUMMARY: ${trends.summary}`);
  }

  if (trends.allInsights?.length > 0) {
    sections.push('\nKEY INSIGHTS:');
    trends.allInsights.slice(0, 5).forEach(i => sections.push(`  - ${i}`));
  }

  return sections.join('\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

export const trendAnalysis = {
  analyzeTaskTrends,
  analyzeFitnessTrends,
  analyzeNutritionTrends,
  analyzeStreakTrends,
  analyzeSkillTrends,
  analyzeFinancialTrends,
  generateTrendAnalysis,
  formatTrendsForPrompt,
};

export default trendAnalysis;
