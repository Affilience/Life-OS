/**
 * Nova Context Summary Service
 *
 * Provides pre-computed, lightweight user context summaries for fast AI responses.
 * This replaces the heavy getCrossModuleContext() call with a tiered approach:
 *
 * HOT TIER (< 50ms): Pre-computed summary cached in Redis
 * WARM TIER (50-200ms): Quick store access for specific module data
 * COLD TIER (200-500ms): Full context build (fallback only)
 *
 * The summary focuses on actionable, time-sensitive data that Nova needs most often.
 */

import useGamificationStore from '../../stores/gamificationStore';
import useProductivityStore from '../../stores/productivityStore';
import { useHealthStore } from '../../stores/healthStore';
import { useFinancialStore } from '../../stores/financialStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import useDailyTasksStore from '../../stores/dailyTasksStore';
import { useAvatarStore, getXPForLevel } from '../../stores/avatarStore';
import { getCache, setCache } from '../redis';

// Cache keys
const CACHE_KEYS = {
  USER_SUMMARY: (userId) => `nova:summary:${userId}`,
  SEMANTIC_CACHE: (hash) => `nova:semantic:${hash}`,
  PATTERN_CACHE: (userId) => `nova:patterns:${userId}`,
};

// Cache TTLs in seconds
const CACHE_TTL = {
  SUMMARY: 60,      // 1 minute - hot data changes frequently
  SEMANTIC: 300,    // 5 minutes - similar queries
  PATTERNS: 600,    // 10 minutes - behavioral patterns
};

/**
 * Query Intent Classification
 * Determines what data Nova actually needs based on the user's question
 */
export function classifyQueryIntent(query) {
  const lower = query.toLowerCase();

  return {
    // Simple interactions that need minimal context
    isGreeting: /^(hi|hello|hey|sup|yo|morning|evening|good\s)/i.test(lower),
    isSimpleQuestion: /^(what is|who is|how do i|can you|where is)\s/i.test(lower) && lower.length < 50,

    // Status checks - need today's snapshot
    isStatusCheck: /how.*(am i|doing|going|progress)|what.*progress|status|update me/i.test(lower),

    // Module-specific queries
    needsTaskData: /task|todo|productivity|work|project|deadline|done|complete/i.test(lower),
    needsHealthData: /workout|exercise|meal|calorie|sleep|health|weight|nutrition|gym|fit/i.test(lower),
    needsFinanceData: /money|budget|spend|save|finance|expense|income|dollar|bank|\$/i.test(lower),
    needsKnowledgeData: /book|learn|read|note|idea|study|knowledge/i.test(lower),
    needsCalendarData: /calendar|schedule|event|meeting|appointment|plan|today|tomorrow/i.test(lower),
    needsSkillsData: /skill|practice|level up|xp|progress/i.test(lower),
    needsSocialData: /friend|challenge|guild|social|compete|leaderboard/i.test(lower),
    needsStreakData: /streak|habit|daily|consecutive|maintain/i.test(lower),

    // Deep analysis queries - need more context
    needsHistoricalData: /last (week|month|year)|trend|average|compare|history|over time/i.test(lower),
    needsCorrelations: /why|affect|impact|relationship|when.*better|when.*worse|correlation/i.test(lower),
    needsRecommendations: /should i|recommend|suggest|advice|help me|what can i/i.test(lower),

    // XP/Level queries
    needsXPData: /xp|level|stage|evolution|cosmic|credits|unlock/i.test(lower),
  };
}

/**
 * Get context tier based on query intent
 * Returns: 'hot' | 'warm' | 'cold'
 */
export function determineContextTier(intent) {
  // Hot tier: greetings, simple questions
  if (intent.isGreeting || intent.isSimpleQuestion) {
    return 'hot';
  }

  // Cold tier: historical analysis, correlations, complex recommendations
  if (intent.needsHistoricalData || intent.needsCorrelations) {
    return 'cold';
  }

  // Warm tier: everything else (most common)
  return 'warm';
}

/**
 * Generate a lightweight "hot" summary of user's current state
 * This is the data Nova needs 80% of the time
 */
export function generateHotSummary() {
  const gamification = useGamificationStore.getState();
  const dailyTasks = useDailyTasksStore.getState();
  const health = useHealthStore.getState();
  const workout = useWorkoutStore.getState();
  const financial = useFinancialStore.getState();
  const avatar = useAvatarStore.getState();
  const productivity = useProductivityStore.getState();

  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = dailyTasks.tasksByDate?.[today] || [];
  const completedTasks = todaysTasks.filter(t => t.completed);
  const todaysMeals = (health.meals || []).filter(m => m.date === today);

  // Calculate today's macros
  const todaysNutrition = todaysMeals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
  }), { calories: 0, protein: 0 });

  // Streak status check
  const streaks = gamification.streaks || {};
  const streaksAtRisk = Object.entries(streaks)
    .filter(([_, streak]) => {
      if (!streak || streak.current < 3) return false;
      const hoursSince = streak.lastActivity
        ? (Date.now() - new Date(streak.lastActivity).getTime()) / (1000 * 60 * 60)
        : 24;
      return hoursSince > 20;
    })
    .map(([name]) => name);

  // Week's workouts
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentWorkouts = (workout.workouts || []).filter(w => new Date(w.date) > weekAgo);

  // Budget status
  const budgetTotal = (financial.budgetEnvelopes || []).reduce((sum, e) => sum + (e.allocated || 0), 0);
  const budgetSpent = (financial.budgetEnvelopes || []).reduce((sum, e) => sum + (e.spent || 0), 0);

  // Active session check
  const hasActiveWorkout = !!workout.activeWorkout;
  const hasActiveFocusSession = !!productivity.activeSession;

  return {
    // Identity - userId populated by caller for caching
    userId: null,
    displayName: avatar.displayName || gamification.displayName || 'User',

    // Progress
    level: gamification.level || 1,
    stage: gamification.currentStage || 'spark',
    totalXP: gamification.totalXP || 0,
    cosmicCredits: gamification.cosmicCredits || 0,
    globalStreak: gamification.globalStreak || 0,

    // Today's snapshot
    today: {
      date: today,
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      timeOfDay: getTimeOfDay(),

      // Tasks
      tasksTotal: todaysTasks.length,
      tasksCompleted: completedTasks.length,
      tasksRemaining: todaysTasks.length - completedTasks.length,
      taskCompletionRate: todaysTasks.length > 0
        ? Math.round((completedTasks.length / todaysTasks.length) * 100)
        : 0,

      // Top 3 pending tasks (names only for context)
      pendingTasks: todaysTasks
        .filter(t => !t.completed)
        .slice(0, 3)
        .map(t => ({ name: t.name, priority: t.priority })),

      // Nutrition
      caloriesConsumed: todaysNutrition.calories,
      calorieGoal: health.dailyGoals?.calories || 0,
      proteinConsumed: todaysNutrition.protein,
      proteinGoal: health.dailyGoals?.protein || 0,
      mealsLogged: todaysMeals.length,
    },

    // Weekly fitness
    workoutsThisWeek: recentWorkouts.length,
    hasActiveWorkout,
    hasActiveFocusSession,

    // Financial quick look
    budgetPercentUsed: budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : 0,
    budgetRemaining: budgetTotal - budgetSpent,

    // Alerts
    streaksAtRisk,
    isOverBudget: budgetSpent > budgetTotal,

    // Timing
    generatedAt: new Date().toISOString(),
  };
}

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
 * Generate module-specific context based on intent
 * Called for 'warm' tier queries
 */
export function generateWarmContext(intent) {
  const contexts = [];

  if (intent.needsTaskData) {
    const productivity = useProductivityStore.getState();
    const dailyTasks = useDailyTasksStore.getState();
    const today = new Date().toISOString().split('T')[0];
    const tasks = dailyTasks.tasksByDate?.[today] || [];

    contexts.push({
      module: 'tasks',
      data: {
        todaysTasks: tasks.map(t => ({
          name: t.name,
          completed: t.completed,
          priority: t.priority,
          category: t.category,
          estimatedMinutes: t.estimatedMinutes,
        })),
        activeProjects: (productivity.projects || [])
          .filter(p => p.status === 'active')
          .slice(0, 5)
          .map(p => ({ name: p.name, progress: p.progress })),
        activeSession: productivity.activeSession ? {
          type: productivity.activeSession.type,
          startTime: productivity.activeSession.startTime,
        } : null,
      },
    });
  }

  if (intent.needsHealthData) {
    const health = useHealthStore.getState();
    const workout = useWorkoutStore.getState();
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todaysMeals = (health.meals || []).filter(m => m.date === today);
    const recentWorkouts = (workout.workouts || []).filter(w => new Date(w.date) > weekAgo);

    contexts.push({
      module: 'health',
      data: {
        dailyGoals: health.dailyGoals || {},
        todaysMeals: todaysMeals.map(m => ({
          name: m.name,
          mealType: m.mealType,
          calories: m.calories,
          protein: m.protein,
        })),
        recentWorkouts: recentWorkouts.map(w => ({
          date: w.date,
          name: w.name || w.templateId,
          duration: w.duration,
          exerciseCount: (w.exercises || []).length,
        })),
        activeWorkout: workout.activeWorkout ? {
          name: workout.activeWorkout.name,
          startedAt: workout.activeWorkout.startedAt,
        } : null,
        currentWeight: health.currentWeight,
        goalWeight: health.goalWeight,
        recentSleep: (health.sleepLogs || []).slice(0, 3).map(s => ({
          date: s.date,
          duration: s.duration,
          quality: s.quality,
        })),
      },
    });
  }

  if (intent.needsFinanceData) {
    const financial = useFinancialStore.getState();

    contexts.push({
      module: 'financial',
      data: {
        budgets: (financial.budgetEnvelopes || []).map(e => ({
          name: e.name,
          allocated: e.allocated,
          spent: e.spent,
          remaining: (e.allocated || 0) - (e.spent || 0),
        })),
        recentTransactions: (financial.transactions || []).slice(0, 10).map(t => ({
          date: t.date,
          description: t.description,
          amount: t.amount,
          category: t.category,
          type: t.type,
        })),
        savingsGoals: (financial.sinkingFunds || []).map(f => ({
          name: f.name,
          current: f.current,
          target: f.target,
          progress: f.target > 0 ? Math.round((f.current / f.target) * 100) : 0,
        })),
        monthlyIncome: financial.monthlyIncome || 0,
        netWorth: financial.netWorth || 0,
      },
    });
  }

  if (intent.needsStreakData || intent.needsXPData) {
    const gamification = useGamificationStore.getState();
    const avatar = useAvatarStore.getState();

    const streaks = gamification.streaks || {};
    const activeStreaks = Object.entries(streaks)
      .filter(([_, s]) => s && s.current > 0)
      .map(([name, s]) => ({
        name,
        current: s.current,
        best: s.best,
        lastActivity: s.lastActivity,
      }));

    contexts.push({
      module: 'gamification',
      data: {
        level: gamification.level,
        stage: gamification.currentStage,
        totalXP: gamification.totalXP,
        currentXP: gamification.currentXP,
        xpToNextLevel: gamification.xpToNextLevel,
        cosmicCredits: gamification.cosmicCredits,
        cosmicGems: gamification.cosmicGems,
        globalStreak: gamification.globalStreak,
        activeStreaks,
        moduleXP: gamification.moduleXP || {},
        recentAchievements: (gamification.unlockedAchievements || []).slice(-5),
        // Character stats
        characterLevel: avatar.level,
        characterXP: avatar.xp,
        characterStats: avatar.stats || {},
        prestige: avatar.prestige || 0,
      },
    });
  }

  return contexts;
}

/**
 * Convert hot summary to text for AI prompt
 */
export function hotSummaryToText(summary) {
  const lines = [];

  lines.push(`User: ${summary.displayName} | Level ${summary.level} (${summary.stage}) | ${summary.totalXP.toLocaleString()} XP`);
  lines.push(`Time: ${summary.today.dayOfWeek} ${summary.today.timeOfDay}`);
  lines.push('');

  // Today's progress
  lines.push('TODAY:');
  lines.push(`Tasks: ${summary.today.tasksCompleted}/${summary.today.tasksTotal} done (${summary.today.taskCompletionRate}%)`);

  if (summary.today.pendingTasks.length > 0) {
    lines.push('Pending: ' + summary.today.pendingTasks.map(t => t.name).join(', '));
  }

  if (summary.today.calorieGoal > 0) {
    const calPercent = Math.round((summary.today.caloriesConsumed / summary.today.calorieGoal) * 100);
    lines.push(`Calories: ${summary.today.caloriesConsumed}/${summary.today.calorieGoal} (${calPercent}%)`);
  }

  lines.push(`Workouts this week: ${summary.workoutsThisWeek}`);

  if (summary.budgetPercentUsed > 0) {
    lines.push(`Budget: ${summary.budgetPercentUsed}% used ($${summary.budgetRemaining} left)`);
  }

  // Alerts
  if (summary.streaksAtRisk.length > 0) {
    lines.push(`⚠️ STREAKS AT RISK: ${summary.streaksAtRisk.join(', ')}`);
  }

  if (summary.isOverBudget) {
    lines.push('⚠️ OVER BUDGET!');
  }

  if (summary.hasActiveWorkout) {
    lines.push('🏋️ Currently in a workout');
  }

  if (summary.hasActiveFocusSession) {
    lines.push('🎯 Currently in a focus session');
  }

  return lines.join('\n');
}

/**
 * Convert warm context modules to text
 */
export function warmContextToText(contexts) {
  return contexts.map(ctx => {
    const lines = [`=== ${ctx.module.toUpperCase()} ===`];

    if (ctx.module === 'tasks') {
      const d = ctx.data;
      if (d.todaysTasks.length > 0) {
        lines.push('Today\'s Tasks:');
        d.todaysTasks.forEach(t => {
          const status = t.completed ? '✓' : '○';
          lines.push(`  ${status} ${t.name}${t.priority ? ` [${t.priority}]` : ''}`);
        });
      }
      if (d.activeProjects.length > 0) {
        lines.push('Active Projects:');
        d.activeProjects.forEach(p => {
          lines.push(`  - ${p.name}${p.progress ? ` (${p.progress}%)` : ''}`);
        });
      }
      if (d.activeSession) {
        lines.push(`Currently in ${d.activeSession.type} session`);
      }
    }

    if (ctx.module === 'health') {
      const d = ctx.data;
      if (d.todaysMeals.length > 0) {
        lines.push('Today\'s Meals:');
        d.todaysMeals.forEach(m => {
          lines.push(`  - ${m.mealType}: ${m.name} (${m.calories} cal, ${m.protein}g protein)`);
        });
      }
      if (d.recentWorkouts.length > 0) {
        lines.push('Recent Workouts:');
        d.recentWorkouts.forEach(w => {
          lines.push(`  - ${w.date}: ${w.name} (${w.duration}min, ${w.exerciseCount} exercises)`);
        });
      }
      if (d.recentSleep.length > 0) {
        lines.push('Recent Sleep:');
        d.recentSleep.forEach(s => {
          lines.push(`  - ${s.date}: ${s.duration}hrs (${s.quality}/5 quality)`);
        });
      }
    }

    if (ctx.module === 'financial') {
      const d = ctx.data;
      if (d.budgets.length > 0) {
        lines.push('Budgets:');
        d.budgets.forEach(b => {
          const pct = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0;
          lines.push(`  - ${b.name}: $${b.spent}/$${b.allocated} (${pct}%)`);
        });
      }
      if (d.recentTransactions.length > 0) {
        lines.push('Recent Transactions:');
        d.recentTransactions.slice(0, 5).forEach(t => {
          const sign = t.type === 'income' ? '+' : '-';
          lines.push(`  - ${t.date}: ${sign}$${Math.abs(t.amount)} ${t.description}`);
        });
      }
      if (d.netWorth) {
        lines.push(`Net Worth: $${d.netWorth.toLocaleString()}`);
      }
    }

    if (ctx.module === 'gamification') {
      const d = ctx.data;
      lines.push(`Level ${d.level} (${d.stage})`);
      lines.push(`XP: ${d.currentXP}/${d.xpToNextLevel} to next level (${d.totalXP} total)`);
      lines.push(`Cosmic Credits: ${d.cosmicCredits} | Gems: ${d.cosmicGems}`);
      lines.push(`Global Streak: ${d.globalStreak} days`);

      if (d.activeStreaks.length > 0) {
        lines.push('Active Streaks:');
        d.activeStreaks.forEach(s => {
          lines.push(`  - ${s.name}: ${s.current} days (best: ${s.best})`);
        });
      }

      if (Object.keys(d.moduleXP).length > 0) {
        lines.push('XP by Module:');
        Object.entries(d.moduleXP)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .forEach(([mod, xp]) => {
            lines.push(`  - ${mod}: ${xp.toLocaleString()} XP`);
          });
      }
    }

    return lines.join('\n');
  }).join('\n\n');
}

/**
 * Get cached summary or generate fresh one
 */
export async function getCachedSummary(userId) {
  if (!userId) {
    // No userId means no caching - generate fresh each time
    return generateHotSummary();
  }
  try {
    const cached = await getCache(CACHE_KEYS.USER_SUMMARY(userId));
    if (cached) {
      return cached;
    }
  } catch (e) {
    console.warn('Cache read failed:', e);
  }

  // Generate fresh
  const summary = generateHotSummary();

  // Cache it
  try {
    await setCache(CACHE_KEYS.USER_SUMMARY(userId), summary, CACHE_TTL.SUMMARY);
  } catch (e) {
    console.warn('Cache write failed:', e);
  }

  return summary;
}

/**
 * Invalidate user's cached summary (call after data changes)
 */
export async function invalidateSummaryCache(userId) {
  if (!userId) {
    console.warn('invalidateSummaryCache called without userId - skipping');
    return;
  }
  try {
    const { deleteCache } = await import('../redis');
    await deleteCache(CACHE_KEYS.USER_SUMMARY(userId));
  } catch (e) {
    console.warn('Cache invalidation failed:', e);
  }
}

/**
 * Build optimized context based on query
 * This is the main entry point for the optimized context system
 */
export async function buildOptimizedContext(query, userId) {
  const startTime = Date.now();

  if (!userId) {
    console.warn('buildOptimizedContext called without userId - caching disabled');
  }

  // Classify the query
  const intent = classifyQueryIntent(query);
  const tier = determineContextTier(intent);

  let contextText = '';
  let summary = null;

  // Always get hot summary (it's fast)
  try {
    summary = await getCachedSummary(userId);
    contextText = hotSummaryToText(summary);
  } catch (e) {
    console.warn('Hot summary failed, generating fresh:', e);
    summary = generateHotSummary();
    contextText = hotSummaryToText(summary);
  }

  // For warm tier, add module-specific context
  if (tier === 'warm' || tier === 'cold') {
    const warmContexts = generateWarmContext(intent);
    if (warmContexts.length > 0) {
      contextText += '\n\n' + warmContextToText(warmContexts);
    }
  }

  // For cold tier, we'd add historical patterns and correlations
  // This is handled by the existing novaContextBuilder for now

  const buildTime = Date.now() - startTime;

  return {
    context: contextText,
    summary,
    intent,
    tier,
    buildTimeMs: buildTime,
    tokenEstimate: Math.ceil(contextText.length / 4), // Rough estimate
  };
}

export const novaContextSummary = {
  classifyQueryIntent,
  determineContextTier,
  generateHotSummary,
  generateWarmContext,
  hotSummaryToText,
  warmContextToText,
  getCachedSummary,
  invalidateSummaryCache,
  buildOptimizedContext,
  CACHE_KEYS,
  CACHE_TTL,
};

export default novaContextSummary;
