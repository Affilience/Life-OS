import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// All zustand persist storage keys - cleared on sign out AND sign up for fresh user experience
const STORAGE_KEYS = [
  // Core stores
  'achievements-storage',
  'avatar-storage',
  'custom-streaks-storage',
  'daily-tasks-storage',
  'financial-storage',
  'gamification-mode-storage',
  'gamification-storage',
  'level-progression-storage',
  'module-mastery-storage',
  'pet-storage',
  'productivity-storage',
  'quests-storage',
  'resolution-storage',
  'skill-points-storage',
  // LifeOS prefixed stores
  'lifeos-bad-habits',
  'lifeos-boss-battles',
  'lifeos-calendar',
  'lifeos-content',
  'lifeos-dashboard-settings',
  'lifeos-health',
  'lifeos-knowledge',
  'lifeos-perks-storage',
  'lifeos-purpose',
  'lifeos-quotes',
  'lifeos-settings-storage',
  'lifeos-skills-storage',
  'lifeos-social',
  'lifeos-theme-store',
  'lifeos-workout',
  // Onboarding and tours - CRITICAL for fresh user experience
  'lifeos-new-onboarding',
  'lifeos-integrated-onboarding',
  'lifeos-onboarding',
  'lifeos-tours',
];

/**
 * Clear all localStorage for a fresh start
 */
function clearAllStorage() {
  console.log('[Auth] Clearing all local storage for fresh start...');
  STORAGE_KEYS.forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('[Auth] Local storage cleared');
}

/**
 * Initialize all required data for a new user
 * This ensures the user has all necessary records across all tables
 */
async function initializeNewUser(userId, email, displayName) {
  const username = email.split('@')[0];
  const now = new Date().toISOString();

  try {
    // 1. Create user profile (main table with level, XP, equipment, social settings)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        display_name: displayName || username,
        username: username,
        // Level/XP initialization
        current_level: 1,
        current_xp: 0,
        total_xp: 0,
        prestige: 0,
        current_tier: 1,
        total_levels_earned: 0,
        character_gender: 'male',
        // Equipment initialization
        equipped_items: {},
        cosmetic_overrides: {},
        dye_colors: {},
        unlocked_equipment: [],
        owned_cosmetics: [],
        active_cosmetics: {},
        // Social settings
        privacy_level: 'public',
        show_on_leaderboards: true,
        show_activity_feed: true,
        allow_friend_requests: true,
        allow_guild_invites: true,
        // Module settings
        module_progress: {},
        health_settings: {},
        financial_settings: {},
        calendar_settings: {},
        knowledge_settings: {},
        // Preferences
        preferences: {
          theme: 'cosmic',
          notifications: true,
        },
        onboarding_completed: false,
        created_at: now,
        updated_at: now,
      }, { onConflict: 'id' });

    if (profileError) console.error('Profile creation error:', profileError);

    // 2. Initialize cosmic currency (starting credits)
    const { error: currencyError } = await supabase
      .from('user_cosmic_currency')
      .upsert({
        user_id: userId,
        cosmic_credits: 100,
        lifetime_credits_earned: 100,
        lifetime_credits_spent: 0,
        created_at: now,
        updated_at: now,
      }, { onConflict: 'user_id' });

    if (currencyError) console.error('Currency creation error:', currencyError);

    // 3. Initialize user stats (all zeros to start)
    // Note: total_power and balance_score are GENERATED columns in PostgreSQL - do not insert them
    const { error: statsError } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        strength: 0,
        vitality: 0,
        intelligence: 0,
        wisdom: 0,
        defense: 0,
        // Equipment bonuses
        strength_equipment: 0,
        vitality_equipment: 0,
        intelligence_equipment: 0,
        wisdom_equipment: 0,
        defense_equipment: 0,
        // Pet bonuses
        strength_pets: 0,
        vitality_pets: 0,
        intelligence_pets: 0,
        wisdom_pets: 0,
        defense_pets: 0,
        // Perk bonuses
        strength_perks: 0,
        vitality_perks: 0,
        intelligence_perks: 0,
        wisdom_perks: 0,
        defense_perks: 0,
        // Achievement bonuses
        strength_achievements: 0,
        vitality_achievements: 0,
        intelligence_achievements: 0,
        wisdom_achievements: 0,
        defense_achievements: 0,
        // Level bonuses
        strength_levels: 0,
        vitality_levels: 0,
        intelligence_levels: 0,
        wisdom_levels: 0,
        defense_levels: 0,
        created_at: now,
        updated_at: now,
      }, { onConflict: 'user_id' });

    if (statsError) console.error('Stats creation error:', statsError);

    console.log(`[Auth] Initialized all data for new user: ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('[Auth] Error initializing new user:', error);
    return { success: false, error };
  }
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}

export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      // Clear all localStorage for fresh start (removes previous user's cached data)
      clearAllStorage();

      // Initialize all user data for new signups
      if (data.user) {
        await initializeNewUser(
          data.user.id,
          email,
          metadata.display_name
        );
      }

      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { signUp, loading, error };
}

export function useSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
}

export function useSignOut() {
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all localStorage to prevent data leakage between users
      clearAllStorage();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { signOut, loading };
}
