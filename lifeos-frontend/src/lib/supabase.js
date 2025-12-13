import { createClient } from '@supabase/supabase-js';
import { DEV_USER_ID, isDevMode } from './dev-auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

// In dev mode, use service role key to bypass RLS
// In production, use anon key with proper auth
const clientKey = isDevMode() && supabaseServiceKey ? supabaseServiceKey : supabaseAnonKey;

export const supabase = createClient(supabaseUrl, clientKey, {
  auth: {
    persistSession: !isDevMode(), // Don't persist in dev mode
    autoRefreshToken: !isDevMode(),
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Get current user ID (dev user or authenticated user)
export const getCurrentUserId = async () => {
  if (isDevMode()) {
    return DEV_USER_ID;
  }
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
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
