import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { clearAllNovaState } from '../services/ai/nova/novaService';

// Shared auth state context - ensures all components see the same auth state
const AuthContext = createContext(null);

// Key to track which user's data is currently in localStorage
// This is separate from zustand stores and survives their clearing
const CURRENT_USER_KEY = 'lifeos-current-user-id';

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

// IndexedDB databases that need to be cleared on user switch
const INDEXED_DB_NAMES = [
  'QuantaJournalDB', // Journal entries stored locally
];

/**
 * Clear all localStorage, IndexedDB, and in-memory state for a fresh start
 * SECURITY: Prevents data leakage between users
 */
function clearAllStorage() {
  console.log('[Auth] Clearing all local storage for fresh start...');
  STORAGE_KEYS.forEach(key => {
    localStorage.removeItem(key);
  });
  // Also clear the user tracking key
  localStorage.removeItem(CURRENT_USER_KEY);
  console.log('[Auth] Local storage cleared');

  // Clear IndexedDB databases (Journal, etc.)
  // SECURITY: Prevents journal entries from leaking between users
  INDEXED_DB_NAMES.forEach(dbName => {
    try {
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => console.log(`[Auth] Cleared IndexedDB: ${dbName}`);
      request.onerror = () => console.warn(`[Auth] Failed to clear IndexedDB: ${dbName}`);
    } catch (e) {
      console.warn(`[Auth] Could not clear IndexedDB ${dbName}:`, e);
    }
  });

  // Clear Nova's in-memory caches (conversation history, context, etc.)
  // This prevents previous user's data from being shown to new user
  try {
    clearAllNovaState();
  } catch (e) {
    console.warn('[Auth] Could not clear Nova state:', e);
  }
}

/**
 * Check if the current user differs from the last known user
 * If different, clear all storage and reload to prevent data leakage
 * @param {string} newUserId - The user ID to check against
 * @returns {boolean} - True if user changed and reload is happening
 */
function handleUserChange(newUserId) {
  const lastUserId = localStorage.getItem(CURRENT_USER_KEY);

  // If no previous user or same user, just update the tracking
  if (!lastUserId || lastUserId === newUserId) {
    if (newUserId) {
      localStorage.setItem(CURRENT_USER_KEY, newUserId);
    }
    return false;
  }

  // Different user detected - clear everything and reload
  console.log('[Auth] User change detected:', lastUserId, '->', newUserId);
  console.log('[Auth] Clearing all data and reloading for security...');

  // Clear all storage
  clearAllStorage();

  // Set the new user ID
  if (newUserId) {
    localStorage.setItem(CURRENT_USER_KEY, newUserId);
  }

  // Force page reload to clear all in-memory zustand state
  // This is the nuclear option but guarantees no data leakage
  window.location.reload();
  return true;
}

/**
 * Initialize all required data for a new user
 * This ensures the user has all necessary records across all tables
 * Note: display_name and username are NOT set here - they are set during onboarding
 */
async function initializeNewUser(userId, email) {
  const now = new Date().toISOString();

  console.log('[Auth] Initializing new user:', { userId, email });

  try {
    // 1. Create user profile (main table with level, XP, equipment, social settings)
    // Note: display_name and username will be set during onboarding
    console.log('[Auth] Creating user profile...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        // display_name and username intentionally omitted - set in onboarding
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

    if (profileError) {
      console.error('[Auth] ❌ Profile creation error:', profileError);
      throw profileError;
    }
    console.log('[Auth] ✅ User profile created');

    // 2. Initialize cosmic currency (starting credits)
    console.log('[Auth] Creating cosmic currency...');
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

    if (currencyError) {
      console.error('[Auth] ❌ Currency creation error:', currencyError);
      // Don't throw - profile is more important
    } else {
      console.log('[Auth] ✅ Cosmic currency created');
    }

    // Note: Skipping user_stats - it has generated columns that require a missing function
    // Stats will be created on-demand when needed

    console.log(`[Auth] ✅ Initialized all data for new user: ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('[Auth] ❌ Error initializing new user:', error);
    return { success: false, error };
  }
}

/**
 * Safe wrapper for getSession that won't hang indefinitely
 * Uses Promise.race with a timeout to guarantee resolution
 */
async function safeGetSession(timeoutMs = 5000) {
  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise((resolve) =>
        setTimeout(() => {
          console.warn(`[Auth] getSession timed out after ${timeoutMs}ms`);
          resolve({ data: { session: null }, error: null, timedOut: true });
        }, timeoutMs)
      ),
    ]);
    return result;
  } catch (error) {
    console.error('[Auth] getSession error:', error);
    return { data: { session: null }, error, timedOut: false };
  }
}

/**
 * AuthProvider - Provides shared auth state to all child components
 * This ensures all useAuth() calls see the same state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const isReloading = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let authResolved = false;

    // Hard timeout - if auth never resolves after 10s, assume offline/error
    // Reduced from 30s because we now have safeGetSession with its own timeout
    const hardTimeoutId = setTimeout(() => {
      if (isMounted && !authResolved) {
        console.error('[Auth] Hard timeout (10s) - auth service unresponsive, assuming no session');
        authResolved = true;
        setLoading(false);
      }
    }, 10000);

    // Get initial session with safe timeout wrapper
    console.log('[Auth] Starting session check...');
    safeGetSession(5000).then((result) => {
      const { data, timedOut } = result;
      const session = data?.session;

      if (!isMounted) {
        console.log('[Auth] Component unmounted, ignoring session result');
        return;
      }
      if (authResolved) {
        console.log('[Auth] Auth already resolved, ignoring duplicate session result');
        return;
      }
      authResolved = true;
      clearTimeout(hardTimeoutId);

      if (timedOut) {
        console.warn('[Auth] Session check timed out - continuing without session');
      }

      const newUser = session?.user ?? null;
      console.log('[Auth] Session check complete:', newUser ? `User found: ${newUser.id}` : 'No user');

      // Check for user change on initial load
      if (newUser && !isReloading.current) {
        const didReload = handleUserChange(newUser.id);
        if (didReload) {
          isReloading.current = true;
          return;
        }
      } else if (!newUser) {
        // No authenticated user - clear ALL localStorage to prevent stale state
        // This handles the case where auth users were deleted from DB
        const hadPreviousUser = localStorage.getItem(CURRENT_USER_KEY);
        if (hadPreviousUser) {
          console.log('[Auth] No session but had previous user - clearing all stale data');
          clearAllStorage();
        }
      }

      setSession(session);
      setUser(newUser);
      setLoading(false);
    }).catch((error) => {
      if (!isMounted) return;
      authResolved = true;
      clearTimeout(hardTimeoutId);
      console.error('[Auth] Session check error:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      // Mark auth as resolved to prevent timeout
      if (!authResolved) {
        authResolved = true;
        clearTimeout(hardTimeoutId);
      }

      const newUser = session?.user ?? null;
      console.log('[Auth] Auth state changed:', event, newUser ? 'User found' : 'No user');

      // CRITICAL: Detect user change and force reload for security
      if (newUser && !isReloading.current) {
        const didReload = handleUserChange(newUser.id);
        if (didReload) {
          isReloading.current = true;
          return;
        }
      } else if (!newUser && event === 'SIGNED_OUT') {
        localStorage.removeItem(CURRENT_USER_KEY);
      }

      setSession(session);
      setUser(newUser);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(hardTimeoutId);
      subscription.unsubscribe();
    };
  }, []);

  return React.createElement(
    AuthContext.Provider,
    { value: { user, session, loading } },
    children
  );
}

/**
 * useAuth hook - returns shared auth state from AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
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
        // Track this user as the current user
        localStorage.setItem(CURRENT_USER_KEY, data.user.id);

        await initializeNewUser(data.user.id, email);

        // Force reload to ensure completely fresh state for new user
        // This clears all in-memory zustand state
        window.location.href = '/onboarding';
        return { data, error: null };
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

      // Check if signing in as a different user
      const previousUserId = localStorage.getItem(CURRENT_USER_KEY);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // If different user, clear everything and reload
      if (data.user && previousUserId && previousUserId !== data.user.id) {
        console.log('[Auth] Different user signing in, clearing all data...');
        clearAllStorage();
        localStorage.setItem(CURRENT_USER_KEY, data.user.id);
        // Force full page reload to clear all in-memory state
        window.location.href = '/';
        return { data, error: null };
      }

      // Same user or no previous user - just track and continue
      if (data.user) {
        localStorage.setItem(CURRENT_USER_KEY, data.user.id);
      }

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
    setLoading(true);

    // Set a timeout to force redirect even if Supabase hangs
    const timeoutId = setTimeout(() => {
      console.warn('[Auth] Sign out timeout - forcing redirect');
      clearAllStorage();
      window.location.href = '/auth';
    }, 3000); // 3 second timeout

    try {
      const { error } = await supabase.auth.signOut();
      clearTimeout(timeoutId);

      if (error) {
        console.error('[Auth] Sign out error:', error);
      }

      // Clear all localStorage to prevent data leakage between users
      clearAllStorage();

      // Force redirect to auth page with full page reload
      // This ensures all in-memory state is completely cleared
      window.location.href = '/auth';
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('[Auth] Sign out error:', err);
      // Even on error, try to clear storage and redirect
      clearAllStorage();
      window.location.href = '/auth';
    }
    // Note: No finally block needed since we're redirecting
  };

  return { signOut, loading };
}
