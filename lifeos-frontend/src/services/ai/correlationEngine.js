/**
 * Cross-Module Correlation Engine
 * Finds relationships between different life areas
 *
 * Analyzes correlations like:
 * - Sleep → Productivity
 * - Exercise → Mood
 * - Spending → Stress (journal sentiment)
 * - Learning → Skill progression
 */

import { supabase, getCurrentUserId } from '../../lib/supabase';
import { novaMemoryService } from './novaMemoryService';

/**
 * Correlation types we track
 */
export const CORRELATION_TYPES = {
  SLEEP_PRODUCTIVITY: 'sleep_productivity',
  EXERCISE_MOOD: 'exercise_mood',
  NUTRITION_ENERGY: 'nutrition_energy',
  CONSISTENCY_SUCCESS: 'consistency_success'
};

/**
 * Analyze sleep-productivity correlation
 * Requires sleep and task data
 */
export async function analyzeSleepProductivity() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get all events
    const { data: events } = await supabase
      .from('nova_user_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo);

    if (!events || events.length < 20) {
      return { insufficient_data: true };
    }

    // Group by date
    const dailyData = {};
    events.forEach(e => {
      const date = new Date(e.created_at).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { sleepHours: null, tasksCompleted: 0 };
      }

      if (e.event_type === 'log_sleep' && e.event_data?.hours) {
        dailyData[date].sleepHours = e.event_data.hours;
      } else if (e.event_type === 'complete_task') {
        dailyData[date].tasksCompleted++;
      }
    });

    // Filter days with both sleep and task data
    const completeDays = Object.values(dailyData)
      .filter(d => d.sleepHours !== null && d.tasksCompleted > 0);

    if (completeDays.length < 5) {
      return { insufficient_data: true, message: 'Need more days with both sleep and task data' };
    }

    // Calculate correlation
    const goodSleepDays = completeDays.filter(d => d.sleepHours >= 7);
    const poorSleepDays = completeDays.filter(d => d.sleepHours < 7);

    const avgTasksGoodSleep = goodSleepDays.length > 0
      ? goodSleepDays.reduce((sum, d) => sum + d.tasksCompleted, 0) / goodSleepDays.length
      : 0;

    const avgTasksPoorSleep = poorSleepDays.length > 0
      ? poorSleepDays.reduce((sum, d) => sum + d.tasksCompleted, 0) / poorSleepDays.length
      : 0;

    const impact = avgTasksPoorSleep > 0
      ? Math.round(((avgTasksGoodSleep - avgTasksPoorSleep) / avgTasksPoorSleep) * 100)
      : 0;

    // Store correlation
    if (Math.abs(impact) >= 10) {
      await novaMemoryService.storeSemanticMemory(
        'sleep_productivity_impact',
        impact > 0
          ? `${impact}% more productive after 7+ hours sleep`
          : `Sleep duration has minimal impact on your productivity`,
        completeDays.length / 20,
        'correlation_engine'
      );
    }

    return {
      type: CORRELATION_TYPES.SLEEP_PRODUCTIVITY,
      daysAnalyzed: completeDays.length,
      avgTasksGoodSleep: Math.round(avgTasksGoodSleep * 10) / 10,
      avgTasksPoorSleep: Math.round(avgTasksPoorSleep * 10) / 10,
      impact,
      insight: impact > 20
        ? `Sleep significantly impacts your productivity. You complete ${impact}% more tasks after 7+ hours of sleep.`
        : impact > 10
          ? `Good sleep gives you a moderate productivity boost of ${impact}%.`
          : `Your productivity seems consistent regardless of sleep duration.`,
      recommendation: impact > 15
        ? 'Prioritize getting 7+ hours of sleep for optimal productivity.'
        : null
    };
  } catch (error) {
    console.error('Failed to analyze sleep-productivity correlation:', error);
    return null;
  }
}

/**
 * Analyze cross-module activity consistency
 * How does being active in one area affect others?
 */
export async function analyzeActivityConsistency() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const { data: events } = await supabase
      .from('nova_user_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', ninetyDaysAgo);

    if (!events || events.length < 30) {
      return { insufficient_data: true };
    }

    // Group by week
    const weeklyData = {};
    events.forEach(e => {
      const date = new Date(e.created_at);
      const weekStart = getWeekStart(date);

      if (!weeklyData[weekStart]) {
        weeklyData[weekStart] = {
          health: 0,
          productivity: 0,
          knowledge: 0,
          journal: 0,
          financial: 0
        };
      }

      // Categorize event
      if (['log_workout', 'log_meal', 'log_sleep'].includes(e.event_type)) {
        weeklyData[weekStart].health++;
      } else if (['complete_task', 'focus_session'].includes(e.event_type)) {
        weeklyData[weekStart].productivity++;
      } else if (['add_book', 'add_note', 'study_session'].includes(e.event_type)) {
        weeklyData[weekStart].knowledge++;
      } else if (['journal_entry'].includes(e.event_type)) {
        weeklyData[weekStart].journal++;
      } else if (['log_expense', 'log_income'].includes(e.event_type)) {
        weeklyData[weekStart].financial++;
      }
    });

    // Calculate consistency score per week (how many modules were active)
    const weeks = Object.values(weeklyData);
    const consistencyScores = weeks.map(w => {
      let activeModules = 0;
      if (w.health > 0) activeModules++;
      if (w.productivity > 0) activeModules++;
      if (w.knowledge > 0) activeModules++;
      if (w.journal > 0) activeModules++;
      if (w.financial > 0) activeModules++;
      return activeModules;
    });

    const avgConsistency = consistencyScores.reduce((a, b) => a + b, 0) / consistencyScores.length;

    // Find which modules are most/least used
    const moduleTotals = weeks.reduce((acc, w) => {
      acc.health += w.health;
      acc.productivity += w.productivity;
      acc.knowledge += w.knowledge;
      acc.journal += w.journal;
      acc.financial += w.financial;
      return acc;
    }, { health: 0, productivity: 0, knowledge: 0, journal: 0, financial: 0 });

    const sortedModules = Object.entries(moduleTotals)
      .sort((a, b) => b[1] - a[1]);

    const mostUsed = sortedModules[0];
    const leastUsed = sortedModules.filter(([_, count]) => count > 0).pop() || sortedModules[sortedModules.length - 1];

    // Store insights
    await novaMemoryService.storeSemanticMemory(
      'most_used_module',
      mostUsed[0],
      0.9,
      'correlation_engine'
    );

    await novaMemoryService.storeSemanticMemory(
      'consistency_score',
      `${Math.round(avgConsistency * 20)}% (${Math.round(avgConsistency)}/5 modules active weekly)`,
      0.8,
      'correlation_engine'
    );

    return {
      type: CORRELATION_TYPES.CONSISTENCY_SUCCESS,
      weeksAnalyzed: weeks.length,
      avgModulesActivePerWeek: Math.round(avgConsistency * 10) / 10,
      consistencyScore: Math.round(avgConsistency * 20), // Out of 100
      mostUsedModule: mostUsed[0],
      leastUsedModule: leastUsed[0],
      moduleRanking: sortedModules.map(([module, count]) => ({ module, count })),
      insight: avgConsistency >= 4
        ? "You're using LifeOS holistically! Great cross-module consistency."
        : avgConsistency >= 2.5
          ? `You're active in ${Math.round(avgConsistency)} modules on average. Try engaging with ${leastUsed[0]} more.`
          : `You're mostly focused on ${mostUsed[0]}. Consider expanding to other life areas.`,
      recommendation: avgConsistency < 3
        ? `Try adding one ${leastUsed[0]} activity this week.`
        : null
    };
  } catch (error) {
    console.error('Failed to analyze activity consistency:', error);
    return null;
  }
}

/**
 * Generate goal predictions based on current trajectory
 */
export async function generateGoalPredictions() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: events } = await supabase
      .from('nova_user_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo);

    if (!events || events.length < 10) {
      return { insufficient_data: true };
    }

    // Calculate daily averages
    const dailyCounts = {};
    events.forEach(e => {
      const date = new Date(e.created_at).toISOString().split('T')[0];
      if (!dailyCounts[date]) dailyCounts[date] = {};
      dailyCounts[date][e.event_type] = (dailyCounts[date][e.event_type] || 0) + 1;
    });

    const uniqueDays = Object.keys(dailyCounts).length;
    const predictions = [];

    // Workout prediction
    const workoutCount = events.filter(e => e.event_type === 'log_workout').length;
    const workoutsPerWeek = (workoutCount / uniqueDays) * 7;
    const yearlyWorkoutPrediction = Math.round(workoutsPerWeek * 52);
    predictions.push({
      category: 'Workouts',
      currentPace: `${Math.round(workoutsPerWeek * 10) / 10} per week`,
      yearlyProjection: yearlyWorkoutPrediction,
      insight: workoutsPerWeek >= 5
        ? "You're on track for excellent fitness consistency!"
        : workoutsPerWeek >= 3
          ? "Solid workout routine. Consider adding one more session per week."
          : "Try to increase workout frequency for better health outcomes."
    });

    // Task completion prediction
    const taskCount = events.filter(e => e.event_type === 'complete_task').length;
    const tasksPerDay = taskCount / uniqueDays;
    const monthlyTaskPrediction = Math.round(tasksPerDay * 30);
    predictions.push({
      category: 'Tasks',
      currentPace: `${Math.round(tasksPerDay * 10) / 10} per day`,
      monthlyProjection: monthlyTaskPrediction,
      insight: tasksPerDay >= 5
        ? "High productivity! Make sure you're prioritising important tasks."
        : tasksPerDay >= 2
          ? "Consistent task completion. Room to increase if needed."
          : "Consider breaking larger tasks into smaller, completable items."
    });

    // Journal prediction
    const journalCount = events.filter(e => e.event_type === 'journal_entry').length;
    const journalPerWeek = (journalCount / uniqueDays) * 7;
    predictions.push({
      category: 'Journal',
      currentPace: `${Math.round(journalPerWeek * 10) / 10} entries per week`,
      yearlyProjection: Math.round(journalPerWeek * 52),
      insight: journalPerWeek >= 5
        ? "Excellent journaling habit! This supports great self-awareness."
        : journalPerWeek >= 2
          ? "Good journaling consistency. Daily entries could boost reflection."
          : "Try journaling more regularly for better self-reflection."
    });

    return {
      predictions,
      daysAnalyzed: uniqueDays,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to generate goal predictions:', error);
    return null;
  }
}

/**
 * Build comprehensive correlation context for Nova
 */
export async function buildCorrelationContext() {
  const [sleepProductivity, consistency, predictions] = await Promise.all([
    analyzeSleepProductivity(),
    analyzeActivityConsistency(),
    generateGoalPredictions()
  ]);

  let context = '\nCROSS-MODULE INSIGHTS:\n';

  if (sleepProductivity && !sleepProductivity.insufficient_data) {
    context += `- Sleep Impact: ${sleepProductivity.insight}\n`;
  }

  if (consistency && !consistency.insufficient_data) {
    context += `- Life Balance: ${consistency.insight}\n`;
    context += `- Focus Area: ${consistency.mostUsedModule}\n`;
  }

  if (predictions && !predictions.insufficient_data && predictions.predictions?.length > 0) {
    context += '\nPROJECTIONS:\n';
    predictions.predictions.forEach(p => {
      context += `- ${p.category}: ${p.currentPace}\n`;
    });
  }

  return context;
}

// Helper function
function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

/**
 * Export correlation engine
 */
export const correlationEngine = {
  CORRELATION_TYPES,
  analyzeSleepProductivity,
  analyzeActivityConsistency,
  generateGoalPredictions,
  buildCorrelationContext
};

export default correlationEngine;
