import { useEffect, useCallback, useState } from 'react';
import { useGamificationStore } from '../stores/gamificationStore';
import { supabase } from '../api/supabase';

/**
 * Hook for triggering and handling gamification events
 *
 * This hook provides a unified interface for all module actions to trigger
 * gamification rewards through the central event pipeline.
 */
export function useGamificationEvents() {
  const store = useGamificationStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  /**
   * Process a gamification event through the central pipeline
   * This calls the Supabase function that handles all rewards
   */
  const processEvent = useCallback(async (eventType, eventSource, eventData = {}) => {
    if (!store.userId) {
      console.warn('Cannot process event: user not initialized');
      return null;
    }

    setIsProcessing(true);

    try {
      // Call the central event processing function
      const { data, error } = await supabase.rpc('process_gamification_event', {
        p_user_id: store.userId,
        p_event_type: eventType,
        p_event_source: eventSource,
        p_event_data: eventData,
      });

      if (error) {
        console.error('Error processing gamification event:', error);
        return null;
      }

      // data contains all triggered effects
      const result = data;

      // Update local store with results
      if (result.xp_awarded > 0) {
        // XP was awarded - sync level/stage
        await store.syncAll();
      }

      if (result.credits_awarded > 0) {
        await store.addCredits(result.credits_awarded, eventSource);
      }

      if (result.level_up_triggered) {
        // Show level up notification
        console.log('🎉 Level Up!', result.new_level);
      }

      if (result.stage_transition) {
        // Show stage transition
        console.log('✨ Stage Transition!', result.new_stage);
      }

      if (result.achievements_unlocked?.length > 0) {
        // Show achievement notifications
        console.log('🏆 Achievements Unlocked:', result.achievements_unlocked);
      }

      if (result.constellation_stars_unlocked?.length > 0) {
        // Show constellation unlocks
        console.log('⭐ Constellation Stars:', result.constellation_stars_unlocked);
      }

      setLastEvent(result);
      setIsProcessing(false);

      return result;
    } catch (error) {
      console.error('Error in processEvent:', error);
      setIsProcessing(false);
      return null;
    }
  }, [store]);

  // ============================================
  // EVENT TRIGGERS BY MODULE
  // ============================================

  /**
   * PRODUCTIVITY MODULE EVENTS
   */
  const productivity = {
    taskCompleted: (task) => processEvent('task_completed', 'productivity', {
      task_id: task.id,
      task_type: task.type,
      priority: task.priority,
      deep_work: task.deep_work || false,
    }),

    projectMilestone: (project) => processEvent('project_milestone', 'productivity', {
      project_id: project.id,
      milestone: project.milestone,
    }),

    deepWorkSession: (minutes) => processEvent('deep_work_session', 'productivity', {
      duration_minutes: minutes,
    }),

    pomodoroCompleted: (count) => processEvent('pomodoro_completed', 'productivity', {
      pomodoro_count: count,
    }),
  };

  /**
   * FITNESS MODULE EVENTS
   */
  const fitness = {
    workoutCompleted: (workout) => processEvent('workout_completed', 'fitness', {
      workout_id: workout.id,
      workout_type: workout.type,
      duration_minutes: workout.duration,
      calories_burned: workout.calories,
    }),

    macroGoalHit: (macros) => processEvent('macro_goal_hit', 'fitness', {
      protein: macros.protein,
      carbs: macros.carbs,
      fats: macros.fats,
    }),

    personalRecord: (exercise, weight) => processEvent('personal_record', 'fitness', {
      exercise_name: exercise,
      weight_lbs: weight,
    }),

    workoutStreak: (days) => processEvent('workout_streak', 'fitness', {
      streak_days: days,
    }),
  };

  /**
   * KNOWLEDGE MODULE EVENTS
   */
  const knowledge = {
    bookFinished: (book) => processEvent('book_finished', 'knowledge', {
      book_id: book.id,
      book_title: book.title,
      pages: book.pages,
    }),

    skillMastered: (skill) => processEvent('skill_mastered', 'knowledge', {
      skill_id: skill.id,
      skill_name: skill.name,
      hours_practiced: skill.hours,
    }),

    learningSession: (minutes, topic) => processEvent('learning_session', 'knowledge', {
      duration_minutes: minutes,
      topic: topic,
    }),

    courseCompleted: (course) => processEvent('course_completed', 'knowledge', {
      course_id: course.id,
      course_name: course.name,
    }),
  };

  /**
   * JOURNAL MODULE EVENTS
   */
  const journal = {
    entryCreated: (entry) => processEvent('journal_entry_created', 'journal', {
      entry_id: entry.id,
      word_count: entry.word_count,
      mood: entry.mood,
    }),

    reflectionCompleted: () => processEvent('reflection_completed', 'journal', {}),

    weeklyReview: () => processEvent('weekly_review', 'journal', {}),
  };

  /**
   * FINANCIAL MODULE EVENTS
   */
  const financial = {
    budgetTracked: (date) => processEvent('budget_tracked', 'financial', {
      date: date,
    }),

    savingsGoalHit: (goal) => processEvent('savings_goal_hit', 'financial', {
      goal_name: goal.name,
      amount: goal.amount,
    }),

    incomeAdded: (amount) => processEvent('income_added', 'financial', {
      amount: amount,
    }),
  };

  /**
   * CALENDAR MODULE EVENTS
   */
  const calendar = {
    perfectWeek: () => processEvent('perfect_week', 'calendar', {}),

    timeBlockCompleted: (block) => processEvent('time_block_completed', 'calendar', {
      block_type: block.type,
      duration_minutes: block.duration,
    }),

    deadlineMet: (deadline) => processEvent('deadline_met', 'calendar', {
      deadline_name: deadline.name,
    }),
  };

  /**
   * SKILLS MODULE EVENTS
   */
  const skills = {
    skillPracticed: (skill, minutes) => processEvent('skill_practiced', 'skills', {
      skill_id: skill.id,
      skill_name: skill.name,
      duration_minutes: minutes,
    }),

    weeklyActivityCompleted: (activity) => processEvent('weekly_activity_completed', 'skills', {
      activity_name: activity.name,
    }),
  };

  /**
   * CROSS-MODULE EVENTS
   */
  const cross = {
    allModulesActive: () => processEvent('all_modules_active', 'cross', {}),

    dailyLoginStreak: (days) => processEvent('daily_login_streak', 'cross', {
      streak_days: days,
    }),

    weeklyGoalsMet: () => processEvent('weekly_goals_met', 'cross', {}),
  };

  return {
    processEvent,
    isProcessing,
    lastEvent,

    // Module-specific event triggers
    productivity,
    fitness,
    knowledge,
    journal,
    financial,
    calendar,
    skills,
    cross,
  };
}

/**
 * Hook for real-time gamification subscriptions
 *
 * Subscribes to changes in gamification tables and updates store
 */
export function useGamificationSubscriptions() {
  const store = useGamificationStore();

  useEffect(() => {
    if (!store.userId) return;

    // Subscribe to user_module_progress changes (level, stage, XP)
    const progressSubscription = supabase
      .channel('gamification_progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_module_progress',
          filter: `user_id=eq.${store.userId}`,
        },
        (payload) => {
          console.log('Progress updated:', payload);
          store.syncAll();
        }
      )
      .subscribe();

    // Subscribe to equipment changes
    const equipmentSubscription = supabase
      .channel('gamification_equipment')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_equipment',
          filter: `user_id=eq.${store.userId}`,
        },
        (payload) => {
          console.log('Equipment updated:', payload);
          store.refreshEquipment();
        }
      )
      .subscribe();

    // Subscribe to mission changes
    const missionsSubscription = supabase
      .channel('gamification_missions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_missions',
          filter: `user_id=eq.${store.userId}`,
        },
        (payload) => {
          console.log('Missions updated:', payload);
          store.refreshMissions();
        }
      )
      .subscribe();

    // Subscribe to achievement unlocks
    const achievementsSubscription = supabase
      .channel('gamification_achievements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievement_progress',
          filter: `user_id=eq.${store.userId}`,
        },
        (payload) => {
          console.log('Achievement unlocked:', payload);
          // Show achievement notification
          store.syncAll();
        }
      )
      .subscribe();

    // Subscribe to constellation progress
    const constellationsSubscription = supabase
      .channel('gamification_constellations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_constellation_progress',
          filter: `user_id=eq.${store.userId}`,
        },
        (payload) => {
          console.log('Constellation star unlocked:', payload);
          store.refreshConstellations();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      progressSubscription.unsubscribe();
      equipmentSubscription.unsubscribe();
      missionsSubscription.unsubscribe();
      achievementsSubscription.unsubscribe();
      constellationsSubscription.unsubscribe();
    };
  }, [store.userId]);
}

/**
 * Hook for XP calculations and level predictions
 */
export function useXPCalculations() {
  const level = useGamificationStore(state => state.level);
  const currentXP = useGamificationStore(state => state.currentXP);
  const totalXP = useGamificationStore(state => state.totalXP);
  const xpMultiplier = useGamificationStore(state => state.xpMultiplier);

  /**
   * Calculate XP needed for next level
   */
  const xpToNextLevel = level * 100;

  /**
   * Calculate progress percentage to next level
   */
  const progressPercent = (currentXP / xpToNextLevel) * 100;

  /**
   * Calculate how much XP an action will give after multiplier
   */
  const calculateAwardedXP = useCallback((baseXP) => {
    return Math.floor(baseXP * xpMultiplier);
  }, [xpMultiplier]);

  /**
   * Predict how many actions needed to level up
   */
  const predictActionsToLevel = useCallback((baseXPPerAction) => {
    const xpNeeded = xpToNextLevel - currentXP;
    const xpPerAction = calculateAwardedXP(baseXPPerAction);
    return Math.ceil(xpNeeded / xpPerAction);
  }, [currentXP, xpToNextLevel, calculateAwardedXP]);

  /**
   * Calculate time to reach a level (given XP/day rate)
   */
  const predictTimeToLevel = useCallback((targetLevel, xpPerDay) => {
    const currentTotalXP = totalXP;
    const targetTotalXP = (targetLevel * (targetLevel - 1) * 100) / 2;
    const xpNeeded = targetTotalXP - currentTotalXP;
    const days = Math.ceil(xpNeeded / xpPerDay);
    return {
      days,
      weeks: Math.ceil(days / 7),
      xpNeeded,
    };
  }, [totalXP]);

  return {
    xpToNextLevel,
    progressPercent,
    calculateAwardedXP,
    predictActionsToLevel,
    predictTimeToLevel,
  };
}

/**
 * Hook for streak utilities
 */
export function useStreakManager() {
  const store = useGamificationStore();

  /**
   * Check if streak is in danger (last activity > 20 hours ago)
   */
  const isStreakInDanger = useCallback((streak) => {
    if (!streak.last_activity_at) return false;
    const lastActivity = new Date(streak.last_activity_at);
    const hoursSince = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
    return hoursSince > 20;
  }, []);

  /**
   * Get streak milestone tier
   */
  const getStreakTier = useCallback((streakDays) => {
    if (streakDays >= 365) return 'legendary';
    if (streakDays >= 90) return 'epic';
    if (streakDays >= 30) return 'rare';
    if (streakDays >= 7) return 'uncommon';
    return 'common';
  }, []);

  /**
   * Calculate XP multiplier from streak
   */
  const getStreakXPMultiplier = useCallback((streakDays) => {
    if (streakDays >= 365) return 1.25;
    if (streakDays >= 90) return 1.15;
    if (streakDays >= 30) return 1.10;
    if (streakDays >= 7) return 1.05;
    return 1.0;
  }, []);

  /**
   * Get next milestone for streak
   */
  const getNextMilestone = useCallback((streakDays) => {
    const milestones = [7, 30, 90, 365];
    return milestones.find(m => m > streakDays) || null;
  }, []);

  return {
    isStreakInDanger,
    getStreakTier,
    getStreakXPMultiplier,
    getNextMilestone,
  };
}

export default useGamificationEvents;
