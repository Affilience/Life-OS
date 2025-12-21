/**
 * Nova Proactive Intelligence
 *
 * Smart, context-aware nudges and insights that:
 * 1. Don't interrupt active work sessions
 * 2. Learn which nudges get acted on
 * 3. Time suggestions appropriately
 * 4. Avoid repetition and annoyance
 */

import { getCrossModuleContext } from '../crossModuleData';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Timing
  minTimeBetweenNudgesMs: 30 * 60 * 1000, // 30 minutes
  quietHoursStart: 22, // 10 PM
  quietHoursEnd: 7, // 7 AM

  // Learning
  nudgeHistorySize: 100,
  minActedOnRatio: 0.2, // Disable nudge types below 20% action rate

  // Priority thresholds
  urgentPriority: 0.9,
  highPriority: 0.7,
  normalPriority: 0.5,
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const STORAGE_KEY = 'nova_proactive_state';

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore
  }
  return {
    lastNudgeTime: 0,
    lastNudgeType: null,
    nudgeHistory: [], // { type, timestamp, actedOn, dismissed }
    disabledTypes: [],
    preferences: {},
  };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save proactive state:', e);
  }
}

// ============================================================================
// CONTEXT AWARENESS
// ============================================================================

/**
 * Check if user is in an active work context
 */
function isUserBusy(context) {
  // Check for active workout
  if (context.fitness?.hasActiveWorkout) {
    return { busy: true, reason: 'workout', priority: 'do_not_disturb' };
  }

  // Check for active focus session
  if (context.productivity?.activeSession) {
    return { busy: true, reason: 'focus_session', priority: 'do_not_disturb' };
  }

  // Check for active time block
  const now = new Date();
  const currentBlocks = (context.calendar?.todayBlocks || []).filter(block => {
    const start = new Date(block.start);
    const end = new Date(block.end);
    return now >= start && now <= end && !block.completed;
  });

  if (currentBlocks.length > 0) {
    return { busy: true, reason: 'time_block', priority: 'low', currentBlock: currentBlocks[0] };
  }

  return { busy: false };
}

/**
 * Check if we're in quiet hours
 */
function isQuietHours() {
  const hour = new Date().getHours();
  return hour >= CONFIG.quietHoursStart || hour < CONFIG.quietHoursEnd;
}

/**
 * Check if enough time has passed since last nudge
 */
function canNudge(state) {
  const timeSinceLastNudge = Date.now() - state.lastNudgeTime;
  return timeSinceLastNudge >= CONFIG.minTimeBetweenNudgesMs;
}

// ============================================================================
// NUDGE TYPES
// ============================================================================

const NUDGE_GENERATORS = {
  // Streak at risk
  streak_risk: {
    check: (context) => {
      const atRisk = context.gamification?.streaks?.atRisk || [];
      if (atRisk.length === 0) return null;

      const mostImportant = atRisk.sort((a, b) => b.current - a.current)[0];
      return {
        priority: CONFIG.urgentPriority,
        message: `Your ${mostImportant.name} streak (${mostImportant.current} days) is at risk! Take action to keep it alive.`,
        action: { type: 'navigate', path: getPathForStreak(mostImportant.name) },
        data: mostImportant,
      };
    },
    minInterval: 2 * 60 * 60 * 1000, // 2 hours
  },

  // Tasks behind schedule
  tasks_behind: {
    check: (context) => {
      const hour = new Date().getHours();
      const tasks = context.dailyTasks?.today || {};

      // Only after 3 PM
      if (hour < 15) return null;

      const remaining = tasks.remaining || 0;
      const total = tasks.total || 0;

      // More than half tasks remaining after 3 PM
      if (remaining > 0 && remaining >= total / 2) {
        return {
          priority: CONFIG.highPriority,
          message: `${remaining} task${remaining > 1 ? 's' : ''} still to go today. Want to knock some out?`,
          action: { type: 'navigate', path: '/productivity' },
          data: { remaining, total },
        };
      }

      return null;
    },
    minInterval: 3 * 60 * 60 * 1000, // 3 hours
  },

  // No meal logged today
  no_meals: {
    check: (context) => {
      const hour = new Date().getHours();
      const mealsLogged = context.health?.todayNutrition?.mealsLogged || 0;

      // After 11 AM and no meals
      if (hour >= 11 && mealsLogged === 0) {
        return {
          priority: CONFIG.normalPriority,
          message: "Haven't logged any meals today. Had breakfast?",
          action: { type: 'navigate', path: '/health' },
        };
      }

      // After 2 PM and only one meal
      if (hour >= 14 && mealsLogged === 1) {
        return {
          priority: CONFIG.normalPriority - 0.1,
          message: "Time for lunch? Only one meal logged so far.",
          action: { type: 'navigate', path: '/health' },
        };
      }

      return null;
    },
    minInterval: 4 * 60 * 60 * 1000, // 4 hours
  },

  // No workout this week
  workout_reminder: {
    check: (context) => {
      const dayOfWeek = new Date().getDay();
      const workoutsThisWeek = context.fitness?.workoutsThisWeek || 0;

      // It's Wednesday or later and no workouts
      if (dayOfWeek >= 3 && workoutsThisWeek === 0) {
        return {
          priority: CONFIG.normalPriority,
          message: "Haven't worked out yet this week. Ready to move?",
          action: { type: 'navigate', path: '/health' },
        };
      }

      return null;
    },
    minInterval: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Budget alert
  budget_warning: {
    check: (context) => {
      const budget = context.financial || {};
      if (!budget.totalBudget) return null;

      const percentUsed = (budget.totalSpent / budget.totalBudget) * 100;
      const dayOfMonth = new Date().getDate();
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const percentOfMonth = (dayOfMonth / daysInMonth) * 100;

      // Spending ahead of pace
      if (percentUsed > percentOfMonth + 15) {
        return {
          priority: CONFIG.highPriority,
          message: `Budget alert: ${percentUsed.toFixed(0)}% spent with ${100 - percentOfMonth.toFixed(0)}% of month left.`,
          action: { type: 'navigate', path: '/financial' },
        };
      }

      return null;
    },
    minInterval: 24 * 60 * 60 * 1000, // Daily
  },

  // Celebration - task completion
  celebrate_tasks: {
    check: (context) => {
      const tasks = context.dailyTasks?.today || {};
      if (tasks.total === 0) return null;

      // All tasks done
      if (tasks.completed === tasks.total && tasks.total >= 3) {
        return {
          priority: CONFIG.highPriority,
          message: "All tasks done! That's what I call a productive day. 🎉",
          type: 'celebration',
          data: { completed: tasks.completed },
        };
      }

      return null;
    },
    minInterval: 24 * 60 * 60 * 1000, // Daily
  },

  // Skill practice reminder
  skill_nudge: {
    check: (context) => {
      const skills = context.skills?.allSkills || [];
      const hour = new Date().getHours();

      // Evening is good for practice
      if (hour < 18 || hour > 21) return null;
      if (skills.length === 0) return null;

      // Find skill not practiced recently
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const neglected = skills.filter(s => {
        const lastSession = s.sessions?.[0];
        if (!lastSession) return true;
        return new Date(lastSession.date).getTime() < weekAgo;
      });

      if (neglected.length > 0) {
        const skill = neglected[0];
        return {
          priority: CONFIG.normalPriority - 0.2,
          message: `It's been a while since you practiced ${skill.name}. Quick session tonight?`,
          action: { type: 'navigate', path: '/skills' },
        };
      }

      return null;
    },
    minInterval: 48 * 60 * 60 * 1000, // 2 days
  },

  // Close to personal best streak
  streak_milestone: {
    check: (context) => {
      const streaks = context.gamification?.streaks?.active || [];

      for (const streak of streaks) {
        const current = streak.current || 0;
        const best = streak.best || 0;

        // Within 3 days of personal best
        if (current > 0 && best > current && best - current <= 3) {
          return {
            priority: CONFIG.highPriority,
            message: `You're ${best - current} day${best - current > 1 ? 's' : ''} away from your ${streak.name} personal best!`,
            type: 'motivation',
          };
        }
      }

      return null;
    },
    minInterval: 24 * 60 * 60 * 1000, // Daily
  },
};

function getPathForStreak(streakName) {
  const lower = streakName.toLowerCase();
  if (lower.includes('workout') || lower.includes('fitness') || lower.includes('exercise')) {
    return '/health';
  }
  if (lower.includes('journal') || lower.includes('reflect')) {
    return '/journal';
  }
  if (lower.includes('task') || lower.includes('productivity')) {
    return '/productivity';
  }
  if (lower.includes('meal') || lower.includes('nutrition') || lower.includes('food')) {
    return '/health';
  }
  return '/';
}

// ============================================================================
// NUDGE SELECTION
// ============================================================================

/**
 * Get the best nudge for the current moment
 */
export function selectNudge() {
  const state = loadState();

  // Check if we can nudge at all
  if (!canNudge(state)) {
    return null;
  }

  if (isQuietHours()) {
    return null;
  }

  // Get current context
  const context = getCrossModuleContext();

  // Check if user is busy
  const busyStatus = isUserBusy(context);
  if (busyStatus.busy && busyStatus.priority === 'do_not_disturb') {
    return null;
  }

  // Collect all possible nudges
  const candidates = [];

  for (const [type, generator] of Object.entries(NUDGE_GENERATORS)) {
    // Skip disabled types
    if (state.disabledTypes.includes(type)) continue;

    // Check type-specific interval
    const lastOfType = state.nudgeHistory
      .filter(n => n.type === type)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (lastOfType) {
      const timeSince = Date.now() - lastOfType.timestamp;
      if (timeSince < generator.minInterval) continue;
    }

    // Check if this type has poor action rate
    const typeHistory = state.nudgeHistory.filter(n => n.type === type);
    if (typeHistory.length >= 5) {
      const actedOnCount = typeHistory.filter(n => n.actedOn).length;
      const ratio = actedOnCount / typeHistory.length;
      if (ratio < CONFIG.minActedOnRatio) {
        // Disable this type
        state.disabledTypes.push(type);
        saveState(state);
        continue;
      }
    }

    // Generate nudge
    const nudge = generator.check(context);
    if (nudge) {
      candidates.push({
        type,
        ...nudge,
      });
    }
  }

  // No candidates
  if (candidates.length === 0) {
    return null;
  }

  // Sort by priority and pick the best
  candidates.sort((a, b) => b.priority - a.priority);

  // Don't repeat the same type twice in a row unless urgent
  if (state.lastNudgeType === candidates[0].type && candidates[0].priority < CONFIG.urgentPriority) {
    const alternative = candidates.find(c => c.type !== state.lastNudgeType);
    if (alternative) {
      return alternative;
    }
  }

  return candidates[0];
}

/**
 * Record that a nudge was shown
 */
export function recordNudgeShown(nudge) {
  const state = loadState();

  state.lastNudgeTime = Date.now();
  state.lastNudgeType = nudge.type;

  state.nudgeHistory.push({
    type: nudge.type,
    timestamp: Date.now(),
    actedOn: false,
    dismissed: false,
  });

  // Keep history size limited
  while (state.nudgeHistory.length > CONFIG.nudgeHistorySize) {
    state.nudgeHistory.shift();
  }

  saveState(state);
}

/**
 * Record user reaction to a nudge
 */
export function recordNudgeReaction(type, actedOn, dismissed = false) {
  const state = loadState();

  // Find the most recent nudge of this type
  const nudge = [...state.nudgeHistory]
    .reverse()
    .find(n => n.type === type && !n.actedOn && !n.dismissed);

  if (nudge) {
    nudge.actedOn = actedOn;
    nudge.dismissed = dismissed;
    saveState(state);
  }
}

// ============================================================================
// SMART SCHEDULING
// ============================================================================

let scheduledCheck = null;

/**
 * Start proactive nudge checking
 */
export function startProactiveChecks(onNudge) {
  if (scheduledCheck) {
    clearInterval(scheduledCheck);
  }

  // Check every 5 minutes
  scheduledCheck = setInterval(() => {
    const nudge = selectNudge();
    if (nudge) {
      recordNudgeShown(nudge);
      onNudge(nudge);
    }
  }, 5 * 60 * 1000);

  // Also check once after a short delay
  setTimeout(() => {
    const nudge = selectNudge();
    if (nudge) {
      recordNudgeShown(nudge);
      onNudge(nudge);
    }
  }, 30 * 1000);
}

/**
 * Stop proactive checks
 */
export function stopProactiveChecks() {
  if (scheduledCheck) {
    clearInterval(scheduledCheck);
    scheduledCheck = null;
  }
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

/**
 * Disable a specific nudge type
 */
export function disableNudgeType(type) {
  const state = loadState();
  if (!state.disabledTypes.includes(type)) {
    state.disabledTypes.push(type);
    saveState(state);
  }
}

/**
 * Enable a specific nudge type
 */
export function enableNudgeType(type) {
  const state = loadState();
  state.disabledTypes = state.disabledTypes.filter(t => t !== type);
  saveState(state);
}

/**
 * Get list of disabled nudge types
 */
export function getDisabledTypes() {
  const state = loadState();
  return state.disabledTypes;
}

/**
 * Reset all nudge preferences and history
 */
export function resetNudgePreferences() {
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const proactiveIntelligence = {
  selectNudge,
  recordNudgeShown,
  recordNudgeReaction,
  startProactiveChecks,
  stopProactiveChecks,
  disableNudgeType,
  enableNudgeType,
  getDisabledTypes,
  resetNudgePreferences,
};

export default proactiveIntelligence;
