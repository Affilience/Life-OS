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
 */

import { userDataService } from './userDataService';

class ProactiveNudgeEngine {
  constructor() {
    this.nudgeHistory = [];
    this.lastNudgeTime = {};
    this.cooldownPeriod = 2 * 60 * 60 * 1000; // 2 hours between nudges
  }

  /**
   * Check if any nudges should be triggered
   * Returns a nudge object if one should be shown, null otherwise
   */
  async checkForNudges() {
    const context = await userDataService.getUserContext();
    const nudges = [];

    // Check each nudge type
    nudges.push(await this.checkInactivityNudge(context));
    nudges.push(await this.checkStreakNudge(context));
    nudges.push(await this.checkGoalNudge(context));
    nudges.push(await this.checkBurnoutNudge(context));
    nudges.push(await this.checkCelebrationNudge(context));
    nudges.push(await this.checkDailyCheckIn(context));

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
   * Check if user has been inactive
   */
  async checkInactivityNudge(context) {
    const recentEvents = userDataService.getRecentEvents(10);
    const lastEventTime = recentEvents[recentEvents.length - 1]?.timestamp || 0;
    const hoursSinceActivity = (Date.now() - lastEventTime) / (1000 * 60 * 60);

    if (hoursSinceActivity > 6 && context.timeOfDay !== 'night') {
      return {
        type: 'inactivity',
        priority: 3,
        emotionalState: 'concerned',
        message: "I haven't seen you log anything today. Everything okay? Want to check in on your goals?",
        actions: [
          { label: 'View Tasks', route: '/productivity' },
          { label: 'Quick Log', action: 'quick_log' },
          { label: "I'm fine!", action: 'dismiss' }
        ]
      };
    }

    return null;
  }

  /**
   * Check for streaks about to break
   */
  async checkStreakNudge(context) {
    // This would integrate with actual streak data
    // For now, it's a placeholder
    const mockStreak = {
      current: 7,
      lastLogTime: Date.now() - (20 * 60 * 60 * 1000), // 20 hours ago
      type: 'workout'
    };

    const hoursSinceLog = (Date.now() - mockStreak.lastLogTime) / (1000 * 60 * 60);

    if (hoursSinceLog > 20 && mockStreak.current > 3) {
      return {
        type: 'streak',
        priority: 8,
        emotionalState: 'encouraging',
        message: `Your ${mockStreak.current}-day workout streak is at risk! You've got 4 hours to keep it alive. You can do this!`,
        actions: [
          { label: 'Log Workout', route: '/health' },
          { label: 'Skip Today', action: 'break_streak' }
        ]
      };
    }

    return null;
  }

  /**
   * Check for approaching goal deadlines
   */
  async checkGoalNudge(context) {
    // Placeholder for goal deadline checking
    return null;
  }

  /**
   * Check for burnout patterns
   */
  async checkBurnoutNudge(context) {
    const recentEvents = userDataService.getRecentEvents(50);
    const now = Date.now();
    const today = recentEvents.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000);

    // If user has been extremely active (>20 events today) late at night
    if (today.length > 20 && context.timeOfDay === 'night') {
      return {
        type: 'burnout',
        priority: 7,
        emotionalState: 'concerned',
        message: "You've been going hard today. Remember - rest is productive too. How about calling it a night?",
        actions: [
          { label: 'Review Day', route: '/journal' },
          { label: 'Set Tomorrow Goals', action: 'plan_tomorrow' },
          { label: 'Just Browsing', action: 'dismiss' }
        ]
      };
    }

    return null;
  }

  /**
   * Check for achievements to celebrate
   */
  async checkCelebrationNudge(context) {
    const recentEvents = userDataService.getRecentEvents(5);
    const completions = recentEvents.filter(e =>
      e.action === 'complete_task' ||
      e.action === 'finish_book' ||
      e.action === 'level_up'
    );

    if (completions.length >= 3) {
      return {
        type: 'celebration',
        priority: 5,
        emotionalState: 'proud',
        message: "Look at you crushing it today! Three completions already. I'm proud of you!",
        actions: [
          { label: 'View Stats', route: '/dashboard' },
          { label: 'Thanks Nova!', action: 'dismiss' }
        ]
      };
    }

    return null;
  }

  /**
   * Daily check-in reminder
   */
  async checkDailyCheckIn(context) {
    const lastCheckIn = localStorage.getItem('nova_last_checkin');
    const lastCheckInDate = lastCheckIn ? new Date(parseInt(lastCheckIn)) : null;
    const today = new Date().toDateString();

    if (!lastCheckInDate || lastCheckInDate.toDateString() !== today) {
      // Only show in morning or afternoon
      if (context.timeOfDay === 'morning' || context.timeOfDay === 'afternoon') {
        return {
          type: 'daily_checkin',
          priority: 4,
          emotionalState: 'happy',
          message: "Good ${context.timeOfDay}! Let's set some intentions for today. What's your main focus?",
          actions: [
            { label: 'Plan Day', route: '/productivity' },
            { label: 'Review Goals', route: '/dashboard' },
            { label: 'Later', action: 'dismiss' }
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
    if (type === 'daily_checkin') {
      localStorage.setItem('nova_last_checkin', Date.now().toString());
    }
  }
}

// Export singleton
export const proactiveNudges = new ProactiveNudgeEngine();
