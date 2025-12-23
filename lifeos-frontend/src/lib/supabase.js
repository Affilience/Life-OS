import { createClient } from '@supabase/supabase-js';
import { DEV_USER_ID, isDevMode } from './dev-auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

// SECURITY: Always use anon key in frontend - service role key must NEVER be in client code
// The anon key respects RLS policies and is safe to expose
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: !isDevMode(),
    autoRefreshToken: !isDevMode(),
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Don't block on storage - this can cause hanging
    storageKey: 'lifeos-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  // Disable global auth requirement for REST queries
  // This prevents queries from hanging while waiting for auth
  global: {
    headers: {
      'x-client-info': 'lifeos-frontend',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
});

// ==============================================================================
// CRITICAL: Auth initialization and caching
//
// The Supabase JS client's auth.getSession() and auth.getUser() can HANG
// indefinitely in certain conditions (stale tokens, LockManager issues, etc.)
//
// Solution: Use onAuthStateChange which is EVENT-BASED (doesn't hang) and
// cache the session ourselves to avoid calling getSession() repeatedly.
//
// See: https://github.com/supabase/auth-js/issues/762
// See: https://github.com/supabase/supabase/issues/35754
// ==============================================================================

let cachedSession = null;
let cachedUserId = null;
let authInitialized = false;
let authInitPromise = null;

/**
 * Initialize auth state using onAuthStateChange (event-based, doesn't hang)
 * This should be called early in the app lifecycle.
 *
 * Unlike getSession() which can hang indefinitely, onAuthStateChange fires
 * with INITIAL_SESSION immediately and then for subsequent changes.
 */
export const initializeSupabaseAuth = () => {
  if (authInitPromise) return authInitPromise;

  authInitPromise = new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.warn('[Supabase] Auth init timeout (5s) - continuing without session');
      authInitialized = true;
      resolve({ session: null, timedOut: true });
    }, 5000);

    // onAuthStateChange fires with INITIAL_SESSION immediately
    // This is event-based and won't hang like getSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Supabase] Auth state change:', event);

      // Cache the session and user ID
      cachedSession = session;
      cachedUserId = session?.user?.id || null;

      // On first event (INITIAL_SESSION), resolve the promise
      if (!authInitialized) {
        clearTimeout(timeoutId);
        authInitialized = true;
        console.log('[Supabase] Auth initialized via', event, '- user:', cachedUserId || 'none');
        resolve({ session, timedOut: false });
      }
    });

    // Store subscription for cleanup if needed
    if (typeof window !== 'undefined') {
      window.__supabaseAuthSubscription = subscription;
    }
  });

  return authInitPromise;
};

/**
 * Get the cached user ID (doesn't call Supabase API - instant)
 * Returns DEV_USER_ID in dev mode, cached user ID otherwise
 */
export const getCachedUserId = () => {
  if (isDevMode()) {
    return DEV_USER_ID;
  }
  return cachedUserId;
};

/**
 * Get the cached session (doesn't call Supabase API - instant)
 */
export const getCachedSession = () => {
  return cachedSession;
};

/**
 * Check if auth has been initialized
 */
export const isAuthInitialized = () => {
  return authInitialized;
};

/**
 * Get current user ID with fallback to API call (with timeout)
 * Prefers cached value, falls back to API call only if no cache
 */
export const getCurrentUserId = async () => {
  if (isDevMode()) {
    return DEV_USER_ID;
  }

  // Prefer cached value (instant, doesn't hang)
  if (cachedUserId) {
    return cachedUserId;
  }

  // If auth initialized but no cached user, user is not logged in
  if (authInitialized) {
    return null;
  }

  // Fallback: Try to get session with timeout (may hang, so use short timeout)
  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise((resolve) =>
        setTimeout(() => resolve({ data: { session: null }, timedOut: true }), 3000)
      ),
    ]);

    if (result.timedOut) {
      console.warn('[Supabase] getCurrentUserId timed out');
      return null;
    }

    const userId = result.data?.session?.user?.id || null;
    if (userId) {
      cachedUserId = userId;
      cachedSession = result.data.session;
    }
    return userId;
  } catch (error) {
    console.warn('[Supabase] getCurrentUserId error:', error.message);
    return null;
  }
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  if (error) {
    console.error('Supabase error:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred',
    };
  }
  return { success: true };
};

// Helper function for database queries with error handling
export const safeQuery = async (queryFn) => {
  try {
    const { data, error } = await queryFn();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Query error:', error);
    return { data: null, error };
  }
};

// ==============================================================================
// DIAGNOSTIC TOOLS - Call from browser console to debug issues
// ==============================================================================

// DIAGNOSTIC: Test Supabase REST connectivity
// Call this from browser console: window.testSupabase()
export const testSupabaseConnection = async () => {
  console.log('[Supabase Test] Starting connectivity test...');
  console.log('[Supabase Test] URL:', supabaseUrl);

  const startTime = Date.now();

  try {
    // Test 1: Simple query with no auth required
    console.log('[Supabase Test] Test 1: Querying user_profiles (should work with RLS)...');
    const { data, error, status } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    const elapsed = Date.now() - startTime;
    console.log(`[Supabase Test] Query completed in ${elapsed}ms`);
    console.log('[Supabase Test] Status:', status);
    console.log('[Supabase Test] Data:', data);
    console.log('[Supabase Test] Error:', error);

    if (error) {
      console.error('[Supabase Test] ❌ FAILED - Query error:', error);
      return { success: false, error, elapsed };
    }

    console.log('[Supabase Test] ✅ SUCCESS - Supabase REST is working!');
    return { success: true, data, elapsed };
  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.error(`[Supabase Test] ❌ EXCEPTION after ${elapsed}ms:`, err);
    return { success: false, error: err, elapsed };
  }
};

// DIAGNOSTIC: Test raw fetch to Supabase (bypasses client completely)
export const testSupabaseRaw = async () => {
  console.log('[Supabase Raw Test] Testing direct fetch...');
  const startTime = Date.now();

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=id&limit=1`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });

    const elapsed = Date.now() - startTime;
    const data = await response.json();

    console.log(`[Supabase Raw Test] Completed in ${elapsed}ms`);
    console.log('[Supabase Raw Test] Status:', response.status);
    console.log('[Supabase Raw Test] Data:', data);

    return { success: response.ok, status: response.status, data, elapsed };
  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.error(`[Supabase Raw Test] Failed after ${elapsed}ms:`, err);
    return { success: false, error: err, elapsed };
  }
};

// DIAGNOSTIC: Test auth caching (SAFE - uses cached values)
export const testAuthCache = () => {
  console.log('[Supabase Auth Cache Test] Checking cached auth state...');
  console.log('[Supabase Auth Cache Test] Initialized:', authInitialized);
  console.log('[Supabase Auth Cache Test] Cached User ID:', cachedUserId || 'NULL');
  console.log('[Supabase Auth Cache Test] Has Session:', cachedSession ? 'YES' : 'NO');
  return { initialized: authInitialized, userId: cachedUserId, hasSession: !!cachedSession };
};

// DIAGNOSTIC: Test getSession (WARNING - may hang!)
export const testSupabaseAuth = async () => {
  console.log('[Supabase Auth Test] ⚠️ WARNING: This may hang if auth is stuck!');
  console.log('[Supabase Auth Test] Checking auth state...');

  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('getSession timed out after 5s')), 5000)
      ),
    ]);

    const session = result.data?.session;
    console.log('[Supabase Auth Test] Session:', session ? 'EXISTS' : 'NULL');
    return { success: true, session: !!session, userId: session?.user?.id };
  } catch (err) {
    console.error('[Supabase Auth Test] ❌ FAILED:', err.message);
    return { success: false, error: err.message };
  }
};

// Expose to window for console testing
if (typeof window !== 'undefined') {
  window.testSupabase = testSupabaseConnection;
  window.testSupabaseRaw = testSupabaseRaw;
  window.testSupabaseAuth = testSupabaseAuth;
  window.testAuthCache = testAuthCache;
}
