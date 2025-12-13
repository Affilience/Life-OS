/**
 * Pattern Recognition Service
 * Analyzes user behavior to detect patterns, peaks, and correlations
 *
 * Features:
 * - Productivity peak detection (best hours/days)
 * - Sleep-productivity correlation
 * - Workout-mood correlation
 * - Spending patterns
 * - Habit formation tracking
 */

import { supabase, getCurrentUserId } from '../../lib/supabase';
import { novaMemoryService } from './novaMemoryService';

/**
 * Analyze productivity patterns
 * Returns peak hours, best days, and productivity trends
 */
export async function analyzeProductivityPatterns() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    // Get task completion events from last 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const { data: events } = await supabase
      .from('nova_user_events')
      .select('*')
      .eq('user_id', userId)
      .eq('event_type', 'complete_task')
      .gte('created_at', ninetyDaysAgo);

    if (!events || events.length < 10) {
      return { insufficient_data: true, message: 'Need at least 10 completed tasks for analysis' };
    }

    // Analyze by hour of day
    const hourlyData = new Array(24).fill(0);
    events.forEach(e => {
      const hour = new Date(e.created_at).getHours();
      hourlyData[hour]++;
    });

    // Find peak hours (top 3)
    const peakHours = hourlyData
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .filter(h => h.count > 0);

    // Analyze by day of week
    const dailyData = new Array(7).fill(0);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    events.forEach(e => {
      const day = new Date(e.created_at).getDay();
      dailyData[day]++;
    });

    const bestDays = dailyData
      .map((count, day) => ({ day: dayNames[day], count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Calculate weekly trend
    const weeklyTotals = {};
    events.forEach(e => {
      const weekStart = getWeekStart(new Date(e.created_at));
      weeklyTotals[weekStart] = (weeklyTotals[weekStart] || 0) + 1;
    });

    const weeklyArray = Object.entries(weeklyTotals)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, count]) => count);

    const trend = weeklyArray.length >= 4
      ? calculateTrend(weeklyArray)
      : 'stable';

    // Store insights in memory
    if (peakHours.length > 0) {
      await novaMemoryService.storeSemanticMemory(
        'peak_productivity_hours',
        peakHours.map(h => `${h.hour}:00`).join(', '),
        events.length / 50,
        'pattern_analysis'
      );
    }

    return {
      peakHours,
      bestDays,
      trend,
      totalTasksAnalyzed: events.length,
      averagePerWeek: Math.round(events.length / 13), // ~13 weeks in 90 days
      insights: generateProductivityInsights(peakHours, bestDays, trend)
    };
  } catch (error) {
    console.error('Failed to analyze productivity patterns:', error);
    return null;
  }
}

/**
 * Analyze health-productivity correlation
 */
export async function analyzeHealthProductivityCorrelation() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: events } = await supabase
      .from('nova_user_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo);

    if (!events || events.length < 20) {
      return { insufficient_data: true };
    }

    // Group events by date
    const dailyData = {};
    events.forEach(e => {
      const date = new Date(e.created_at).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { workouts: 0, tasks: 0, meals: 0, journalEntries: 0 };
      }

      switch (e.event_type) {
        case 'log_workout':
          dailyData[date].workouts++;
          break;
        case 'complete_task':
          dailyData[date].tasks++;
          break;
        case 'log_meal':
          dailyData[date].meals++;
          break;
        case 'journal_entry':
          dailyData[date].journalEntries++;
          break;
      }
    });

    // Calculate correlation between workouts and task completion
    const days = Object.values(dailyData);
    const workoutDays = days.filter(d => d.workouts > 0);
    const nonWorkoutDays = days.filter(d => d.workouts === 0);

    const avgTasksOnWorkoutDays = workoutDays.length > 0
      ? workoutDays.reduce((sum, d) => sum + d.tasks, 0) / workoutDays.length
      : 0;

    const avgTasksOnRestDays = nonWorkoutDays.length > 0
      ? nonWorkoutDays.reduce((sum, d) => sum + d.tasks, 0) / nonWorkoutDays.length
      : 0;

    const productivityBoost = avgTasksOnRestDays > 0
      ? Math.round(((avgTasksOnWorkoutDays - avgTasksOnRestDays) / avgTasksOnRestDays) * 100)
      : 0;

    // Store correlation insight
    if (Math.abs(productivityBoost) >= 10) {
      await novaMemoryService.storeSemanticMemory(
        'workout_productivity_correlation',
        productivityBoost > 0
          ? `${productivityBoost}% more productive on workout days`
          : `${Math.abs(productivityBoost)}% less productive on workout days`,
        0.7,
        'correlation_analysis'
      );
    }

    return {
      workoutDaysCount: workoutDays.length,
      restDaysCount: nonWorkoutDays.length,
      avgTasksOnWorkoutDays: Math.round(avgTasksOnWorkoutDays * 10) / 10,
      avgTasksOnRestDays: Math.round(avgTasksOnRestDays * 10) / 10,
      productivityBoost,
      insight: productivityBoost > 10
        ? `You're ${productivityBoost}% more productive on days you work out!`
        : productivityBoost < -10
          ? `Interesting: You complete more tasks on rest days. Consider lighter workouts?`
          : `Your productivity is consistent whether you work out or not.`
    };
  } catch (error) {
    console.error('Failed to analyze health-productivity correlation:', error);
    return null;
  }
}

/**
 * Analyze streak patterns
 */
export async function analyzeStreakPatterns() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    // Get all events for streak analysis
    const { data: events } = await supabase
      .from('nova_user_events')
      .select('event_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!events || events.length < 10) {
      return { insufficient_data: true };
    }

    // Calculate streaks for different activities
    const activityTypes = ['log_workout', 'journal_entry', 'complete_task', 'log_meal'];
    const streakData = {};

    activityTypes.forEach(activityType => {
      const activityEvents = events.filter(e => e.event_type === activityType);
      if (activityEvents.length < 3) return;

      const dates = activityEvents.map(e =>
        new Date(e.created_at).toISOString().split('T')[0]
      );
      const uniqueDates = [...new Set(dates)].sort();

      // Calculate current streak
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 1;

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          tempStreak++;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, tempStreak);

      // Check if streak is current (last activity within 48 hours)
      const lastActivity = new Date(uniqueDates[uniqueDates.length - 1]);
      const hoursSinceLastActivity = (Date.now() - lastActivity) / (1000 * 60 * 60);

      if (hoursSinceLastActivity <= 48) {
        currentStreak = tempStreak;
      }

      streakData[activityType] = {
        currentStreak,
        maxStreak,
        totalDays: uniqueDates.length,
        lastActivity: uniqueDates[uniqueDates.length - 1]
      };
    });

    // Find best maintained habit
    const bestHabit = Object.entries(streakData)
      .filter(([_, data]) => data.maxStreak >= 3)
      .sort((a, b) => b[1].maxStreak - a[1].maxStreak)[0];

    if (bestHabit) {
      await novaMemoryService.storeSemanticMemory(
        'best_maintained_habit',
        `${bestHabit[0].replace('_', ' ')} (${bestHabit[1].maxStreak} day max streak)`,
        0.8,
        'streak_analysis'
      );
    }

    return {
      streaks: streakData,
      bestHabit: bestHabit ? {
        activity: bestHabit[0],
        maxStreak: bestHabit[1].maxStreak,
        currentStreak: bestHabit[1].currentStreak
      } : null
    };
  } catch (error) {
    console.error('Failed to analyze streak patterns:', error);
    return null;
  }
}

/**
 * Generate comprehensive pattern analysis
 */
export async function generatePatternAnalysis() {
  const [productivity, healthCorrelation, streaks] = await Promise.all([
    analyzeProductivityPatterns(),
    analyzeHealthProductivityCorrelation(),
    analyzeStreakPatterns()
  ]);

  // Trigger memory learning
  await novaMemoryService.learnFromActivity();

  return {
    productivity,
    healthCorrelation,
    streaks,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Build pattern context for Nova's system prompt
 */
export async function buildPatternContext() {
  const patterns = await generatePatternAnalysis();
  let context = '\nPATTERN INSIGHTS:\n';

  if (patterns.productivity && !patterns.productivity.insufficient_data) {
    const { peakHours, bestDays, trend } = patterns.productivity;
    if (peakHours?.length > 0) {
      context += `- Peak productivity hours: ${peakHours.map(h => `${h.hour}:00`).join(', ')}\n`;
    }
    if (bestDays?.length > 0) {
      context += `- Most productive days: ${bestDays.map(d => d.day).join(', ')}\n`;
    }
    context += `- Productivity trend: ${trend}\n`;
  }

  if (patterns.healthCorrelation && !patterns.healthCorrelation.insufficient_data) {
    context += `- ${patterns.healthCorrelation.insight}\n`;
  }

  if (patterns.streaks?.bestHabit) {
    const { activity, maxStreak, currentStreak } = patterns.streaks.bestHabit;
    context += `- Best habit: ${activity} (current: ${currentStreak} days, max: ${maxStreak} days)\n`;
  }

  return context;
}

// Helper functions

function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

function calculateTrend(data) {
  if (data.length < 4) return 'stable';

  const recent = data.slice(-4);
  const older = data.slice(0, -4);

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.length > 0
    ? older.reduce((a, b) => a + b, 0) / older.length
    : recentAvg;

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (change > 15) return 'improving';
  if (change < -15) return 'declining';
  return 'stable';
}

function generateProductivityInsights(peakHours, bestDays, trend) {
  const insights = [];

  if (peakHours.length > 0) {
    const peakHour = peakHours[0].hour;
    if (peakHour >= 5 && peakHour <= 9) {
      insights.push("You're an early bird! Your best work happens in the morning.");
    } else if (peakHour >= 10 && peakHour <= 14) {
      insights.push("Mid-day is your power zone. Protect this time for deep work.");
    } else if (peakHour >= 15 && peakHour <= 18) {
      insights.push("You hit your stride in the afternoon. Save complex tasks for then.");
    } else {
      insights.push("You're a night owl! Your productivity peaks in the evening.");
    }
  }

  if (trend === 'improving') {
    insights.push("Your productivity has been trending up. Keep it going!");
  } else if (trend === 'declining') {
    insights.push("Productivity has dipped recently. Consider reviewing your routine.");
  }

  return insights;
}

/**
 * Export pattern recognition service
 */
export const patternRecognitionService = {
  analyzeProductivityPatterns,
  analyzeHealthProductivityCorrelation,
  analyzeStreakPatterns,
  generatePatternAnalysis,
  buildPatternContext
};

export default patternRecognitionService;
