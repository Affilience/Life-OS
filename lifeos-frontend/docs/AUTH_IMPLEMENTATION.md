# Authentication Implementation Guide

This document explains how to replace the development user ID with real Supabase authentication.

## Current State (Development Mode)

Currently, the app uses a hardcoded development user ID for all database operations:

```javascript
// src/lib/dev-auth.js
export const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';
```

This allows development without authentication, but **must be replaced** before production.

## Files That Need Updates

### 1. Core Auth Files

#### `src/lib/dev-auth.js` → Replace with real auth

Replace the entire file or modify to use real user:

```javascript
// src/lib/auth.js (new file)
import { supabase } from './supabase';

// Get the current authenticated user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Get current user ID (throws if not authenticated)
export async function getCurrentUserId() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// Hook for components
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, userId: user?.id };
}
```

### 2. Store Files (All 14 Stores)

Each store imports `DEV_USER_ID`. Update them to get the user ID dynamically.

**Pattern to replace:**
```javascript
// OLD
import { DEV_USER_ID } from '../lib/dev-auth';

// In store actions:
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', DEV_USER_ID);
```

**New pattern:**
```javascript
// NEW
import { getCurrentUserId } from '../lib/auth';

// In store actions:
const userId = await getCurrentUserId();
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', userId);
```

### Stores to update:

1. `src/stores/skillsStore.js`
2. `src/stores/productivityStore.js`
3. `src/stores/workoutStore.js`
4. `src/stores/financialStore.js`
5. `src/stores/calendarStore.js`
6. `src/stores/knowledgeStore.js`
7. `src/stores/healthStore.js`
8. `src/stores/avatarStore.js`
9. `src/stores/achievementsStore.js`
10. `src/stores/resolutionStore.js`
11. `src/stores/questsStore.js`
12. `src/stores/petStore.js`
13. `src/stores/gamificationStore.js`
14. `src/stores/dashboardStore.js`

### 3. RealtimeProvider

Update `src/components/RealtimeProvider.jsx` to use dynamic user ID:

```javascript
// Replace
import { DEV_USER_ID } from '../lib/dev-auth';

// With
import { useCurrentUser } from '../lib/auth';

// In component
const { userId } = useCurrentUser();

// Update channel filters to use userId instead of DEV_USER_ID
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'skills',
  filter: `user_id=eq.${userId}`,
}, ...);
```

### 4. Real-time Subscription Hook

Update `src/hooks/useRealtimeSubscription.js`:

```javascript
// Replace
import { DEV_USER_ID } from '../lib/dev-auth';

// With
import { useCurrentUser } from '../lib/auth';

// Use userId from hook instead of DEV_USER_ID
```

### 5. Data Migration Utility

Update `src/utils/dataMigration.js` to use authenticated user.

## Implementation Steps

### Step 1: Set Up Supabase Auth

1. Enable authentication in Supabase dashboard
2. Configure auth providers (email, OAuth, etc.)
3. Set up email templates for confirmation/reset

### Step 2: Create Auth Components

```javascript
// src/pages/Auth.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleSignIn} disabled={loading}>
        Sign In
      </button>
      <button onClick={handleSignUp} disabled={loading}>
        Sign Up
      </button>
    </div>
  );
}
```

### Step 3: Add Protected Routes

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../lib/auth';

export function ProtectedRoute({ children }) {
  const { user, loading } = useCurrentUser();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;

  return children;
}
```

### Step 4: Update App.jsx

```javascript
// Wrap protected routes
<Route
  path="/*"
  element={
    <ProtectedRoute>
      <MainLayout>
        {/* ... routes ... */}
      </MainLayout>
    </ProtectedRoute>
  }
/>

// Add auth route
<Route path="/auth" element={<AuthPage />} />
```

### Step 5: Update All Stores

Use find-and-replace across all store files:

**Find:**
```javascript
import { DEV_USER_ID } from '../lib/dev-auth';
```

**Replace with:**
```javascript
import { getCurrentUserId } from '../lib/auth';
```

Then update each Supabase query to:
```javascript
const userId = await getCurrentUserId();
```

### Step 6: Database Row Level Security (RLS)

Ensure RLS is enabled on all tables:

```sql
-- Enable RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can only access their own data"
ON skills
FOR ALL
USING (user_id = auth.uid());
```

Apply similar policies to all tables:
- `skills`
- `skill_practice_logs`
- `productivity_tasks`
- `productivity_projects`
- `health_workouts`
- `health_nutrition_logs`
- `health_water_logs`
- `financial_transactions`
- `financial_goals`
- `calendar_time_blocks`
- `calendar_events`
- `knowledge_notes`
- `knowledge_media`
- `journal_entries`
- `user_profiles`
- `user_discoveries`
- `user_resolutions`
- `user_pets`
- etc.

## Search Pattern for All DEV_USER_ID References

Run this command to find all files that need updating:

```bash
grep -r "DEV_USER_ID" src/
```

## Testing Checklist

After implementing auth:

- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Password reset works
- [ ] Protected routes redirect to /auth when not authenticated
- [ ] All stores load data for correct user
- [ ] Real-time subscriptions filter by correct user
- [ ] Signing out clears local state
- [ ] RLS policies prevent cross-user data access

## Security Notes

1. **Never commit API keys** - Use environment variables
2. **Enable RLS on all tables** - This is your primary security layer
3. **Validate on server** - Don't trust client-side validation alone
4. **Use HTTPS only** - Supabase enforces this
5. **Session management** - Supabase handles refresh tokens automatically

## Migration for Existing Users

If you have data under `DEV_USER_ID` that needs to be migrated to a real user:

```sql
-- Update all records to new user ID
UPDATE skills SET user_id = 'real-user-uuid' WHERE user_id = '00000000-0000-0000-0000-000000000001';
-- Repeat for all tables
```

Or use the data migration UI in Settings to export and re-import under the new user.
