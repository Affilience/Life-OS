/**
 * Development Authentication Helper
 * Creates a test user ID for development that bypasses auth
 * In production, this is replaced with real Supabase auth
 */

// Consistent dev user ID - used across all stores and database operations
export const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

// Dev user profile
export const DEV_USER = {
  id: DEV_USER_ID,
  email: 'dev@lifeos.local',
  username: 'Developer',
  created_at: '2024-01-01T00:00:00.000Z',
};

export function getDevUser() {
  return DEV_USER;
}

/**
 * Dev mode is DISABLED by default to enable multi-user auth
 * Set VITE_USE_DEV_AUTH=true in .env.local to bypass auth for solo development
 */
export function isDevMode() {
  // Only enable dev mode if explicitly requested via env var
  return import.meta.env.VITE_USE_DEV_AUTH === 'true';
}
