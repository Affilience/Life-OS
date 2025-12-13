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
 *
 * Now backed by Supabase with localStorage fallback for offline scenarios
 */

import { supabase, getCurrentUserId } from '../../lib/supabase';

class UserDataCollector {
  constructor() {
    this.db = null;
    this.pendingEvents = []; // Queue for offline events
    this.isOnline = true;
    // Cache for user context to avoid repeated fetches
    this.contextCache = null;
    this.contextCacheExpiry = 0;
    this.CACHE_DURATION = 60 * 1000; // 1 minute cache
  }

  /**
   * Track user activity event
   * @param {string} module - Which module (productivity, health, learning, etc.)
   * @param {string} action - What action (complete_task, log_workout, etc.)
   * @param {Object} metadata - Additional context
   */
  async trackEvent(module, action, metadata = {}) {
    // Invalidate context cache since user activity has changed
    this.invalidateCache();

    const event = {
      timestamp: Date.now(),
      module,
      action,
      metadata
    };

    // Try to save to Supabase
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        const { error } = await supabase
          .from('nova_user_events')
          .insert({
            user_id: userId,
            event_type: action,
            event_data: metadata,
            module,
            metadata: {
              url: window.location.pathname,
              timestamp: new Date().toISOString()
            }
          });

        if (error) {
          console.warn('Failed to save event to Supabase:', error);
          this.saveToLocalStorage(event);
        }
      } else {
        this.saveToLocalStorage(event);
      }
    } catch (error) {
      console.warn('Error saving event:', error);
      this.saveToLocalStorage(event);
    }

    return event;
  }

  /**
   * Save event to localStorage as fallback
   */
  saveToLocalStorage(event) {
    const events = this.getLocalEvents();
    events.push(event);

    // Keep only last 1000 events in localStorage
    if (events.length > 1000) {
      events.shift();
    }

    localStorage.setItem('nova_user_events', JSON.stringify(events));
  }

  /**
   * Get events from localStorage
   */
  getLocalEvents() {
    try {
      const stored = localStorage.getItem('nova_user_events');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading local events:', error);
      return [];
    }
  }

  /**
   * Get recent user events from Supabase or localStorage
   * @param {number} limit - Maximum number of events to return
   */
  async getRecentEvents(limit = 100) {
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        const { data, error } = await supabase
          .from('nova_user_events')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.warn('Failed to load events from Supabase:', error);
          return this.getLocalEvents().slice(-limit);
        }

        // Transform Supabase format to local format
        return data.map(row => ({
          timestamp: new Date(row.created_at).getTime(),
          module: row.module,
          action: row.event_type,
          metadata: row.event_data
        }));
      }

      return this.getLocalEvents().slice(-limit);
    } catch (error) {
      console.error('Error loading user events:', error);
      return this.getLocalEvents().slice(-limit);
    }
  }

  /**
   * Sync pending local events to Supabase
   */
  async syncPendingEvents() {
    const localEvents = this.getLocalEvents();
    if (localEvents.length === 0) return;

    try {
      const userId = await getCurrentUserId();
      if (!userId) return;

      const eventsToSync = localEvents.map(event => ({
        user_id: userId,
        event_type: event.action,
        event_data: event.metadata,
        module: event.module,
        created_at: new Date(event.timestamp).toISOString(),
        metadata: { synced: true }
      }));

      const { error } = await supabase
        .from('nova_user_events')
        .insert(eventsToSync);

      if (!error) {
        // Clear local storage after successful sync
        localStorage.removeItem('nova_user_events');
        console.log(`Synced ${eventsToSync.length} events to Supabase`);
      }
    } catch (error) {
      console.warn('Failed to sync events:', error);
    }
  }

  /**
   * Get user context summary for Nova
   * This creates a rich context object that Nova can use
   * Uses caching to avoid repeated Supabase queries
   */
  async getUserContext(forceRefresh = false) {
    const now = Date.now();

    // Return cached context if still valid
    if (!forceRefresh && this.contextCache && now < this.contextCacheExpiry) {
      // Update time-sensitive fields without refetching
      this.contextCache.currentTime = new Date().toLocaleString();
      this.contextCache.timeOfDay = this.getTimeOfDay();
      return this.contextCache;
    }

    const events = await this.getRecentEvents(100);
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
      preferences: await this.getUserPreferences(),
    };

    // Add module-specific summaries
    for (const [module, moduleEvents] of Object.entries(moduleActivity)) {
      context.modules[module] = this.summarizeModuleActivity(module, moduleEvents);
    }

    // Cache the context
    this.contextCache = context;
    this.contextCacheExpiry = now + this.CACHE_DURATION;

    return context;
  }

  /**
   * Invalidate the context cache (call after significant user actions)
   */
  invalidateCache() {
    this.contextCache = null;
    this.contextCacheExpiry = 0;
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

    if (events.length === 0) return patterns;

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
   * Get user preferences from Supabase or localStorage
   */
  async getUserPreferences() {
    const defaultPrefs = {
      notificationStyle: 'encouraging',
      reminderFrequency: 'moderate',
      focusAreas: [],
    };

    try {
      const userId = await getCurrentUserId();
      if (userId) {
        // Try to get from Supabase user metadata or a preferences table
        const { data, error } = await supabase
          .from('nova_user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          return data.preferences || defaultPrefs;
        }
      }

      // Fallback to localStorage
      const stored = localStorage.getItem('nova_user_preferences');
      return stored ? JSON.parse(stored) : defaultPrefs;
    } catch (error) {
      const stored = localStorage.getItem('nova_user_preferences');
      return stored ? JSON.parse(stored) : defaultPrefs;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences) {
    const current = await this.getUserPreferences();
    const updated = { ...current, ...preferences };

    try {
      const userId = await getCurrentUserId();
      if (userId) {
        // Upsert to Supabase
        const { error } = await supabase
          .from('nova_user_preferences')
          .upsert({
            user_id: userId,
            preferences: updated,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.warn('Failed to save preferences to Supabase:', error);
        }
      }
    } catch (error) {
      console.warn('Error saving preferences:', error);
    }

    // Always save to localStorage as backup
    localStorage.setItem('nova_user_preferences', JSON.stringify(updated));
    return updated;
  }

  /**
   * Clear all user data (for testing/reset)
   */
  async clearAllData() {
    localStorage.removeItem('nova_user_events');
    localStorage.removeItem('nova_user_preferences');

    try {
      const userId = await getCurrentUserId();
      if (userId) {
        // Clear from Supabase too
        await supabase
          .from('nova_user_events')
          .delete()
          .eq('user_id', userId);

        await supabase
          .from('nova_user_preferences')
          .delete()
          .eq('user_id', userId);
      }
    } catch (error) {
      console.warn('Error clearing Supabase data:', error);
    }
  }
}

// Export singleton instance
export const userDataService = new UserDataCollector();
