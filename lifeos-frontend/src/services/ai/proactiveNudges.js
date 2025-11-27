/**
 * Proactive Nudging System for Nova
 *
 * Nova doesn't wait to be asked - she proactively reaches out when:
 * - User hasn't logged activity in a while
 * - Streaks are about to break
 * - Goals are approaching deadlines
 * - Patterns suggest burnout or decline
 * - Celebrations are due for achievements
 * - Daily check-ins are missed
 * - Budget is running low or over
 * - Tasks are piling up
 */

import { getCrossModuleContext } from './crossModuleData';

class ProactiveNudgeEngine {
  constructor() {
    this.nudgeHistory = [];
    this.lastNudgeTime = {};
    this.cooldownPeriod = 2 * 60 * 60 * 1000; // 2 hours between same type nudges
  }

  /**
   * Check if any nudges should be triggered
   * Returns a nudge object if one should be shown, null otherwise
   */
  async checkForNudges() {
    const context = getCrossModuleContext();
    const nudges = [];

    // Check each nudge type
    nudges.push(this.checkStreakNudge(context));
    nudges.push(this.checkInactivityNudge(context));
    nudges.push(this.checkTaskNudge(context));
    nudges.push(this.checkNutritionNudge(context));
    nudges.push(this.checkBudgetNudge(context));
    nudges.push(this.checkWorkoutNudge(context));
    nudges.push(this.checkCelebrationNudge(context));
    nudges.push(this.checkBurnoutNudge(context));
    nudges.push(this.checkDailyCheckIn(context));

    // Filter out null nudges and check cooldowns
    const validNudges = nudges
      .filter(n => n !== null)
      .filter(n => this.canShowNudge(n.type));

    // Return highest priority nudge
    if (validNudges.length > 0) {
      validNudges.sort((a, b) => b.priority - a.priority);
      this.recordNudge(validNudges[0]);
      return validNudges[0];
    }

    return null;
  }

  /**
   * Check for streaks about to break - HIGHEST PRIORITY
   */
  checkStreakNudge(context) {
    const { streaks } = context;

    if (streaks.atRisk.length > 0) {
      const mostValuable = streaks.atRisk.reduce((best, current) =>
        current.current > best.current ? current : best
      );

      const hoursSince = mostValuable.lastActivity
        ? Math.round((Date.now() - new Date(mostValuable.lastActivity).getTime()) / (1000 * 60 * 60))
        : 24;

      const hoursRemaining = Math.max(0, 24 - hoursSince);

      return {
        type: 'streak',
        priority: 9, // Highest priority
        emotionalState: 'encouraging',
        message: `Your ${mostValuable.current}-day ${mostValuable.name} streak is at risk! ${hoursRemaining > 0 ? `You have ~${hoursRemaining}h left` : 'Act now'}!`,
        actions: [
          { label: 'Log Activity', route: this.getRouteForStreak(mostValuable.name) },
          { label: 'Use Shield', action: 'use_shield' },
          { label: 'Skip Today', action: 'dismiss' }
        ],
        context: { streak: mostValuable }
      };
    }

    return null;
  }

  /**
   * Get the appropriate route for a streak type
   */
  getRouteForStreak(streakName) {
    const routes = {
      workout: '/health',
      fitness: '/health',
      nutrition: '/health',
      journaling: '/journal',
      journal: '/journal',
      productivity: '/productivity',
      tasks: '/productivity',
      learning: '/knowledge',
      reading: '/knowledge',
    };
    return routes[streakName.toLowerCase()] || '/dashboard';
  }

  /**
   * Check if user has been inactive
   */
  checkInactivityNudge(context) {
    const { time, today, progress } = context;

    // Don't bother at night
    if (time.timeOfDay === 'night') return null;

    // Check if no tasks done and it's afternoon/evening
    const noActivity = today.tasks.completed === 0 &&
                       today.nutrition.mealsLogged === 0 &&
                       !today.hasActiveSession &&
                       !today.hasActiveWorkout;

    if (noActivity && (time.timeOfDay === 'afternoon' || time.timeOfDay === 'evening')) {
      return {
        type: 'inactivity',
        priority: 4,
        emotionalState: 'concerned',
        message: "I haven't seen much activity today. Everything okay? Let's check in on your goals.",
        actions: [
          { label: 'View Tasks', route: '/productivity' },
          { label: 'Quick Log', action: 'quick_log' },
          { label: "I'm taking a rest day", action: 'dismiss' }
        ]
      };
    }

    return null;
  }

  /**
   * Check for task-related nudges
   */
  checkTaskNudge(context) {
    const { time, today } = context;
    const { tasks } = today;

    // Morning reminder if tasks planned but not started
    if (time.timeOfDay === 'morning' && tasks.total > 0 && tasks.completed === 0) {
      return {
        type: 'tasks_morning',
        priority: 5,
        emotionalState: 'encouraging',
        message: `Good morning! You have ${tasks.total} task${tasks.total > 1 ? 's' : ''} planned for today. Ready to start?`,
        actions: [
          { label: 'View Tasks', route: '/productivity' },
          { label: 'Plan Day', route: '/calendar' },
          { label: 'Later', action: 'dismiss' }
        ]
      };
    }

    // Afternoon check-in if falling behind
    if (time.timeOfDay === 'afternoon' && tasks.total > 3 && tasks.completionRate < 30) {
      return {
        type: 'tasks_behind',
        priority: 6,
        emotionalState: 'concerned',
        message: `You're ${tasks.completionRate}% through today's tasks. ${tasks.remaining} remaining. Need to reprioritize?`,
        actions: [
          { label: 'Focus Mode', route: '/productivity' },
          { label: 'Reschedule', action: 'reschedule' },
          { label: "I'm on it", action: 'dismiss' }
        ]
      };
    }

    // Celebration if almost done
    if (tasks.total >= 3 && tasks.completionRate >= 80 && tasks.remaining > 0) {
      return {
        type: 'tasks_almost_done',
        priority: 3,
        emotionalState: 'excited',
        message: `You're ${tasks.completionRate}% done! Just ${tasks.remaining} task${tasks.remaining > 1 ? 's' : ''} left. Finish strong!`,
        actions: [
          { label: 'View Remaining', route: '/productivity' },
          { label: 'Thanks!', action: 'dismiss' }
        ]
      };
    }

    return null;
  }

  /**
   * Check nutrition progress
   */
  checkNutritionNudge(context) {
    const { time, today } = context;
    const { nutrition } = today;

    // Only check if goals are set
    if (!nutrition.goals?.calories) return null;

    // Evening protein check
    if (time.timeOfDay === 'evening' && nutrition.proteinProgress < 70) {
      return {
        type: 'nutrition_protein',
        priority: 5,
        emotionalState: 'concerned',
        message: `You're at ${nutrition.protein}g protein (${nutrition.proteinProgress}% of goal). Consider a protein-rich dinner!`,
        actions: [
          { label: 'Log Meal', route: '/health' },
          { label: 'View Nutrition', route: '/health' },
          { label: 'Got it', action: 'dismiss' }
        ]
      };
    }

    // Over-eating warning (>120% of calories before dinner)
    if (time.timeOfDay !== 'evening' && nutrition.calorieProgress > 120) {
      return {
        type: 'nutrition_over',
        priority: 4,
        emotionalState: 'concerned',
        message: `You're at ${nutrition.calorieProgress}% of your calorie goal already. Might want to go lighter on remaining meals.`,
        actions: [
          { label: 'View Breakdown', route: '/health' },
          { label: 'Thanks for the heads up', action: 'dismiss' }
        ]
      };
    }

    return null;
  }

  /**
   * Check budget status
   */
  checkBudgetNudge(context) {
    const { financial, time } = context;

    // Only if budget is set up
    if (financial.budgetPercentUsed === 0 && financial.budgetRemaining === 0) return null;

    // Over budget warning
    if (financial.isOverBudget) {
      return {
        type: 'budget_over',
        priority: 7,
        emotionalState: 'concerned',
        message: `You've exceeded your budget for this month. Time to review spending?`,
        actions: [
          { label: 'View Budget', route: '/financial' },
          { label: 'Review Expenses', route: '/financial' },
          { label: 'Acknowledged', action: 'dismiss' }
        ]
      };
    }

    // Running low (>85% used)
    if (financial.budgetPercentUsed > 85 && financial.budgetPercentUsed <= 100) {
      return {
        type: 'budget_low',
        priority: 5,
        emotionalState: 'concerned',
        message: `${financial.budgetPercentUsed}% of your budget is used. $${financial.budgetRemaining.toFixed(0)} remaining.`,
        actions: [
          { label: 'View Budget', route: '/financial' },
          { label: 'Got it', action: 'dismiss' }
        ]
      };
    }

    return null;
  }

  /**
   * Check workout/fitness status
   */
  checkWorkoutNudge(context) {
    const { fitness, time } = context;

    // Don't bother at night or if already working out
    if (time.timeOfDay === 'night' || fitness.hasActiveWorkout) return null;

    // Haven't worked out this week (and it's mid-week or later)
    const dayOfWeek = new Date().getDay();
    if (fitness.workoutsThisWeek === 0 && fitness.cardioThisWeek === 0 && dayOfWeek >= 3) {
      return {
        type: 'workout_reminder',
        priority: 4,
        emotionalState: 'encouraging',
        message: `No workouts logged this week yet. Even a short session counts! Ready to move?`,
        actions: [
          { label: 'Log Workout', route: '/health' },
          { label: 'Quick Cardio', route: '/health' },
          { label: 'Rest week', action: 'dismiss' }
        ]
      };
    }

    return null;
  }

  /**
   * Check for achievements to celebrate
   */
  checkCelebrationNudge(context) {
    const { today, achievements, progress } = context;

    // Completed all tasks
    if (today.tasks.total >= 3 && today.tasks.completed === today.tasks.total) {
      return {
        type: 'celebration_tasks',
        priority: 6,
        emotionalState: 'proud',
        message: `All ${today.tasks.total} tasks complete! You crushed it today!`,
        actions: [
          { label: 'View Stats', route: '/dashboard' },
          { label: 'Thanks Nova!', action: 'dismiss' }
        ]
      };
    }

    // Recent achievement unlocked
    if (achievements.recent.length > 0) {
      const latest = achievements.recent[achievements.recent.length - 1];
      const achievementTime = latest.unlockedAt ? new Date(latest.unlockedAt).getTime() : 0;
      const hoursSinceUnlock = (Date.now() - achievementTime) / (1000 * 60 * 60);

      // Only celebrate if unlocked in last 2 hours
      if (hoursSinceUnlock < 2) {
        return {
          type: 'celebration_achievement',
          priority: 7,
          emotionalState: 'excited',
          message: `Achievement unlocked: ${latest.name || latest.id}! Keep up the amazing work!`,
          actions: [
            { label: 'View Achievements', route: '/gamification' },
            { label: 'Awesome!', action: 'dismiss' }
          ]
        };
      }
    }

    // Level up celebration
    const lastLevelUp = localStorage.getItem('nova_last_level_celebrated');
    if (lastLevelUp !== String(progress.level) && progress.level > 1) {
      localStorage.setItem('nova_last_level_celebrated', String(progress.level));
      return {
        type: 'celebration_level',
        priority: 8,
        emotionalState: 'proud',
        message: `Level ${progress.level} reached! You're evolving into something amazing!`,
        actions: [
          { label: 'View Progress', route: '/gamification' },
          { label: 'Thanks!', action: 'dismiss' }
        ]
      };
    }

    return null;
  }

  /**
   * Check for burnout patterns
   */
  checkBurnoutNudge(context) {
    const { time, today, fitness } = context;

    // Late night + high activity
    if (time.timeOfDay === 'night' && today.hasActiveSession) {
      return {
        type: 'burnout_late',
        priority: 6,
        emotionalState: 'concerned',
        message: "It's getting late and you're still working. Rest is productive too. How about wrapping up?",
        actions: [
          { label: 'Plan Tomorrow', route: '/productivity' },
          { label: 'End Session', action: 'end_session' },
          { label: 'Just finishing up', action: 'dismiss' }
        ]
      };
    }

    return null;
  }

  /**
   * Daily check-in reminder
   */
  checkDailyCheckIn(context) {
    const { time, today } = context;

    const lastCheckIn = localStorage.getItem('nova_last_checkin');
    const lastCheckInDate = lastCheckIn ? new Date(parseInt(lastCheckIn)) : null;
    const todayDate = new Date().toDateString();

    if (!lastCheckInDate || lastCheckInDate.toDateString() !== todayDate) {
      // Morning check-in
      if (time.timeOfDay === 'morning') {
        return {
          type: 'daily_checkin',
          priority: 4,
          emotionalState: 'happy',
          message: `Good morning! Ready to plan your day? What's your main focus?`,
          actions: [
            { label: 'Plan Day', route: '/productivity' },
            { label: 'Review Goals', route: '/dashboard' },
            { label: 'Later', action: 'dismiss' }
          ]
        };
      }

      // Afternoon check-in if morning was missed
      if (time.timeOfDay === 'afternoon' && today.tasks.total === 0) {
        return {
          type: 'daily_checkin_afternoon',
          priority: 3,
          emotionalState: 'happy',
          message: `Afternoon! No tasks planned yet. Want to set some intentions for today?`,
          actions: [
            { label: 'Add Tasks', route: '/productivity' },
            { label: 'Review Goals', route: '/dashboard' },
            { label: 'Taking it easy', action: 'dismiss' }
          ]
        };
      }
    }

    return null;
  }

  /**
   * Check if nudge can be shown (respects cooldown)
   */
  canShowNudge(type) {
    const lastTime = this.lastNudgeTime[type] || 0;
    return (Date.now() - lastTime) > this.cooldownPeriod;
  }

  /**
   * Record that a nudge was shown
   */
  recordNudge(nudge) {
    this.lastNudgeTime[nudge.type] = Date.now();
    this.nudgeHistory.push({
      ...nudge,
      shownAt: Date.now()
    });

    // Keep only last 50 nudges
    if (this.nudgeHistory.length > 50) {
      this.nudgeHistory.shift();
    }
  }

  /**
   * User dismissed a nudge
   */
  dismissNudge(type) {
    this.lastNudgeTime[type] = Date.now();
  }

  /**
   * User acted on a nudge
   */
  actOnNudge(type, action) {
    this.recordNudge({ type, action, actedOn: true });

    // Mark daily check-in as complete
    if (type === 'daily_checkin' || type === 'daily_checkin_afternoon') {
      localStorage.setItem('nova_last_checkin', Date.now().toString());
    }
  }

  /**
   * Get current context for external use
   */
  getContext() {
    return getCrossModuleContext();
  }
}

// Export singleton
export const proactiveNudges = new ProactiveNudgeEngine();
