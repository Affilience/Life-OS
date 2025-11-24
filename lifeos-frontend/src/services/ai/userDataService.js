/**
 * User Data Service
 * Collects and manages user data for Nova's contextual understanding
 *
 * This service tracks:
 * - User activities across all modules
 * - Productivity patterns
 * - Health metrics
 * - Learning progress
 * - Financial trends
 * - Time usage
 * - Goals and achievements
 */

class UserDataCollector {
  constructor() {
    this.db = null;
  }

  /**
   * Track user activity event
   * @param {string} module - Which module (productivity, health, learning, etc.)
   * @param {string} action - What action (complete_task, log_workout, etc.)
   * @param {Object} metadata - Additional context
   */
  async trackEvent(module, action, metadata = {}) {
    const event = {
      timestamp: Date.now(),
      module,
      action,
      metadata
    };

    // Store in local storage for now (will move to IndexedDB)
    const events = this.getRecentEvents();
    events.push(event);

    // Keep only last 1000 events in memory
    if (events.length > 1000) {
      events.shift();
    }

    localStorage.setItem('nova_user_events', JSON.stringify(events));

    return event;
  }

  /**
   * Get recent user events
   * @param {number} limit - Maximum number of events to return
   */
  getRecentEvents(limit = 100) {
    try {
      const stored = localStorage.getItem('nova_user_events');
      const events = stored ? JSON.parse(stored) : [];
      return events.slice(-limit);
    } catch (error) {
      console.error('Error loading user events:', error);
      return [];
    }
  }

  /**
   * Get user context summary for Nova
   * This creates a rich context object that Nova can use
   */
  async getUserContext() {
    const events = this.getRecentEvents(100);
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Analyze recent activity
    const recentEvents = events.filter(e => e.timestamp > oneDayAgo);
    const weekEvents = events.filter(e => e.timestamp > oneWeekAgo);

    // Group by module
    const moduleActivity = {};
    weekEvents.forEach(event => {
      if (!moduleActivity[event.module]) {
        moduleActivity[event.module] = [];
      }
      moduleActivity[event.module].push(event);
    });

    // Build context
    const context = {
      // Time context
      currentTime: new Date().toLocaleString(),
      timeOfDay: this.getTimeOfDay(),

      // Activity summary
      recentActivity: {
        today: recentEvents.length,
        thisWeek: weekEvents.length,
        mostActive: this.getMostActiveModule(weekEvents),
      },

      // Module-specific context
      modules: {},

      // Patterns and insights
      patterns: this.detectPatterns(events),

      // User preferences (will be populated over time)
      preferences: this.getUserPreferences(),
    };

    // Add module-specific summaries
    for (const [module, moduleEvents] of Object.entries(moduleActivity)) {
      context.modules[module] = this.summarizeModuleActivity(module, moduleEvents);
    }

    return context;
  }

  /**
   * Get current time of day
   */
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Find most active module
   */
  getMostActiveModule(events) {
    const counts = {};
    events.forEach(event => {
      counts[event.module] = (counts[event.module] || 0) + 1;
    });

    let maxModule = null;
    let maxCount = 0;
    for (const [module, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxModule = module;
      }
    }

    return maxModule;
  }

  /**
   * Summarize activity for a specific module
   */
  summarizeModuleActivity(module, events) {
    const summary = {
      totalEvents: events.length,
      lastActive: events[events.length - 1]?.timestamp,
      recentActions: events.slice(-5).map(e => e.action),
    };

    // Module-specific summaries
    switch (module) {
      case 'productivity':
        summary.tasksCompleted = events.filter(e => e.action === 'complete_task').length;
        summary.focusSessions = events.filter(e => e.action === 'focus_session').length;
        break;

      case 'health':
        summary.workouts = events.filter(e => e.action === 'log_workout').length;
        summary.meals = events.filter(e => e.action === 'log_meal').length;
        break;

      case 'learning':
        summary.studySessions = events.filter(e => e.action === 'study_session').length;
        summary.booksRead = events.filter(e => e.action === 'finish_book').length;
        break;

      case 'financial':
        summary.transactions = events.filter(e => e.action === 'log_transaction').length;
        break;
    }

    return summary;
  }

  /**
   * Detect patterns in user behavior
   */
  detectPatterns(events) {
    const patterns = {
      mostProductiveTime: null,
      streaks: {},
      declines: [],
      improvements: [],
    };

    // Analyze by hour of day
    const hourlyActivity = new Array(24).fill(0);
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyActivity[hour]++;
    });

    // Find most productive hour
    const maxHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
    patterns.mostProductiveTime = `${maxHour}:00 - ${maxHour + 1}:00`;

    // More pattern detection can be added here
    return patterns;
  }

  /**
   * Get user preferences
   */
  getUserPreferences() {
    try {
      const stored = localStorage.getItem('nova_user_preferences');
      return stored ? JSON.parse(stored) : {
        notificationStyle: 'encouraging',
        reminderFrequency: 'moderate',
        focusAreas: [],
      };
    } catch (error) {
      return {
        notificationStyle: 'encouraging',
        reminderFrequency: 'moderate',
        focusAreas: [],
      };
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences) {
    const current = this.getUserPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem('nova_user_preferences', JSON.stringify(updated));
    return updated;
  }

  /**
   * Clear all user data (for testing/reset)
   */
  clearAllData() {
    localStorage.removeItem('nova_user_events');
    localStorage.removeItem('nova_user_preferences');
  }
}

// Export singleton instance
export const userDataService = new UserDataCollector();
