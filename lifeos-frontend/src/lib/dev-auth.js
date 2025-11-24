/**
 * Development Authentication Helper
 * Creates a test user ID for development
 * TODO: Replace with real Supabase auth in production
 */

// Generate a consistent test user ID for development
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function getDevUser() {
  // Return a mock user object for development
  return {
    id: DEV_USER_ID,
    email: 'dev@lifeos.local',
    created_at: new Date().toISOString()
  };
}

export function isDevMode() {
  return import.meta.env.DEV || import.meta.env.VITE_USE_DEV_AUTH === 'true';
}
