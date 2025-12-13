# Quanta Backend Strategy & Implementation Guide

**Version:** 2.0
**Date:** December 2024
**Status:** Strategic Decision Document

---

## Executive Summary

This document provides a comprehensive analysis of backend best practices, evaluates Quanta's current state, and delivers a clear recommendation for moving forward with Supabase backend implementation.

### Key Decisions

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| **Start Fresh or Iterate?** | **Iterate on existing schema** | Good foundation exists in BACKEND_ARCHITECTURE.md; 11 tables already created |
| **Implementation Approach** | **System-based, not page-based** | Cross-module features (timeline, XP, real-time) require unified systems |
| **Priority** | **Core Systems First** | Auth > Timeline > Module Data > Gamification > Analytics |

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Best Practices Research Summary](#2-best-practices-research-summary)
3. [Gap Analysis & Recommendations](#3-gap-analysis--recommendations)
4. [Architecture Decision: Fresh Start vs Iterate](#4-architecture-decision-fresh-start-vs-iterate)
5. [Implementation Approach: Systems vs Pages](#5-implementation-approach-systems-vs-pages)
6. [Recommended System Architecture](#6-recommended-system-architecture)
7. [Database Schema Design](#7-database-schema-design)
8. [Security Implementation](#8-security-implementation)
9. [Performance & Scalability](#9-performance--scalability)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Migration Strategy](#11-migration-strategy)

---

## 1. Current State Analysis

### 1.1 What Currently Exists

**Frontend (90% Complete):**
- 19 Zustand stores managing local state
- All stores use `persist` middleware (localStorage)
- 100% mock data - no backend calls
- Comprehensive data models defined in stores

**Existing Stores:**
```
/src/stores/
├── achievementsStore.js    # Badges, milestones
├── avatarStore.js          # Character progression, equipment
├── calendarStore.js        # Time blocks, events
├── contentStore.js         # App content/config
├── dailyTasksStore.js      # Daily quests
├── dashboardStore.js       # Widget layouts
├── financialStore.js       # Transactions, budgets, goals
├── gamificationStore.js    # XP, levels, cosmic energy
├── gamificationModeStore.js # Gamification UI settings
├── healthStore.js          # Nutrition, water, supplements
├── knowledgeStore.js       # Books, notes, ideas
├── petStore.js             # Virtual pets
├── productivityStore.js    # Tasks, projects, sessions
├── purposeStore.js         # Values, goals
├── questsStore.js          # Missions, challenges
├── quotesStore.js          # Motivational quotes
├── resolutionStore.js      # Annual resolutions
├── skillsStore.js          # Skill trees, practice
└── workoutStore.js         # Exercise tracking
```

**Supabase Project:**
- Project exists with 11 tables
- RLS enabled on most tables
- No data in tables (0 rows)
- Missing tables for core modules
- Basic Supabase client configured in `/src/lib/supabase.js`

**Existing Tables (from BACKEND_ARCHITECTURE.md):**
| Table | RLS | Status |
|-------|-----|--------|
| user_module_progress | ✅ | Needs indexes |
| user_cosmic_currency | ✅ | Good |
| currency_transactions | ✅ | Needs index |
| missions | ❌ | RLS disabled! |
| user_missions | ✅ | Needs composite index |
| momentum_chains | ✅ | Good |
| momentum_events | ✅ | Needs index |
| discoveries | ❌ | RLS disabled! |
| user_discoveries | ✅ | Good |
| rewards | ✅ | Good |
| reward_redemptions | ✅ | Good |

### 1.2 Current Frontend Data Models

**Health Store Example:**
```javascript
{
  dailyGoals: { calories: 2000, protein: 150, ... },
  meals: [{ id, timestamp, foods, calories, ... }],
  waterIntake: { [date]: { amount, goal } },
  supplements: [{ id, name, timing, ... }],
  recipes: [...],
  mealPlans: { [weekKey]: { monday: {...}, ... } }
}
```

**Financial Store Example:**
```javascript
{
  transactions: [{ id, type, amount, category, date, ... }],
  budgets: { [category]: { allocated, spent } },
  savingsGoals: [{ id, name, target, current, ... }],
  accounts: [{ id, name, balance, type }],
  envelopes: { [category]: { budget, spent } }
}
```

**Avatar Store Example:**
```javascript
{
  level: 1,
  xp: 0,
  currentTier: 1,
  equipped: { helmet, suit, backpack, tool, badge },
  unlockedEquipment: [...],
  stats: { defense, strength, vitality, ... },
  moduleProgress: { productivity: {...}, fitness: {...}, ... }
}
```

---

## 2. Best Practices Research Summary

### 2.1 Database Schema Design

**Naming Conventions:**
- Use `snake_case` for all tables and columns
- Plural table names: `users`, `transactions`
- Singular column names: `user_id`, not `users_id`
- Keep names under 63 characters

**Primary Keys:**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
-- OR for sequential IDs:
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

**JSONB vs Normalized Tables:**

| Use JSONB When | Use Normalized When |
|----------------|---------------------|
| Truly variable schema | Known, consistent structure |
| Unknown metadata fields | Need to filter/join on fields |
| Webhook payloads | Data integrity via constraints |
| Rarely queried data | Frequently queried data |

**Best Practice: Hybrid Approach**
```sql
CREATE TABLE health_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  meal_type TEXT NOT NULL,                    -- Normalized: queryable
  total_calories INTEGER NOT NULL,            -- Normalized: aggregate
  foods JSONB NOT NULL,                       -- JSONB: variable items
  metadata JSONB DEFAULT '{}'::jsonb,         -- JSONB: extensible
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 Row Level Security (RLS)

**Golden Rules:**
1. **Always enable RLS** on tables with user data
2. **Never use `user_metadata`** for authorization (users can modify it)
3. **Use `app_metadata`** for roles/permissions
4. **Index columns used in RLS policies**
5. **Wrap `auth.uid()` in SELECT** for caching:

```sql
-- GOOD: Cached per-statement
CREATE POLICY "Users see own data" ON meals
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- BAD: Called on each row
CREATE POLICY "Users see own data" ON meals
  FOR SELECT USING (auth.uid() = user_id);
```

### 2.3 Edge Functions vs Database Functions

| Use Database Functions | Use Edge Functions |
|------------------------|-------------------|
| Data transformations | External API calls |
| Complex queries | Webhook handlers |
| Triggers | AI/LLM integration |
| ACID transactions | Image processing |
| Proximity to data | Authentication flows |

**Example: XP Award (Database Function)**
```sql
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_new_xp INTEGER;
BEGIN
  UPDATE user_profiles
  SET total_xp = total_xp + p_amount
  WHERE id = p_user_id
  RETURNING total_xp INTO v_new_xp;

  -- Log to timeline
  INSERT INTO timeline_events (user_id, module_id, event_type, xp_earned)
  VALUES (p_user_id, 'gamification', 'xp_earned', p_amount);

  RETURN v_new_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Example: External API (Edge Function)**
```typescript
// supabase/functions/sync-fitness-data/index.ts
serve(async (req) => {
  const { user_id, provider } = await req.json();

  // Call external fitness API
  const data = await fetchFromFitbitAPI(user_id);

  // Store in database
  await supabase.from('health_workouts').insert(data);

  return new Response(JSON.stringify({ success: true }));
});
```

### 2.4 Indexing Strategies

**Index Types:**
| Type | Best For | Example |
|------|----------|---------|
| B-tree (default) | Equality, range queries | `user_id`, `created_at` |
| GIN | JSONB, arrays, full-text | `tags`, `metadata` |
| BRIN | Large tables, ordered data | `created_at` on append-only |
| Partial | Subset of rows | `WHERE status = 'active'` |

**Essential Indexes for Quanta:**
```sql
-- Timeline (most queried table)
CREATE INDEX idx_timeline_user_time
  ON timeline_events (user_id, event_timestamp DESC);
CREATE INDEX idx_timeline_module
  ON timeline_events (user_id, module_id, event_timestamp DESC);

-- Financial
CREATE INDEX idx_transactions_user_date
  ON financial_transactions (user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category
  ON financial_transactions (user_id, category);

-- Health
CREATE INDEX idx_meals_user_date
  ON health_meals (user_id, meal_timestamp DESC);
CREATE INDEX idx_workouts_user_date
  ON health_workouts (user_id, workout_date DESC);
```

### 2.5 Connection Pooling

**Transaction Mode (Default - Recommended):**
- Connection borrowed only for transaction duration
- Best for serverless, web traffic, short queries
- Use for 99% of Quanta operations

**Session Mode:**
- Connection held for entire session
- Required for: prepared statements, LISTEN/NOTIFY
- Use only for real-time subscriptions

**Connection Limits:**
- PostgREST API: Max 40% of connections
- Direct connections: Max 80% of connections
- Always use pooler for frontend

### 2.6 Migration Best Practices

1. **One logical change per migration**
2. **Test locally before deploying**
3. **Never rollback production** - always roll forward
4. **Use idempotent migrations:**
```sql
CREATE TABLE IF NOT EXISTS users (...);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

## 3. Gap Analysis & Recommendations

### 3.1 Critical Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| No authentication | Users can't log in | Implement Supabase Auth immediately |
| 100% mock data | No persistence | Migrate stores to Supabase |
| Missing core tables | Can't store module data | Create schema per BACKEND_ARCHITECTURE.md |
| RLS disabled on 2 tables | Security vulnerability | Enable RLS on all tables |
| No indexes | Performance degradation | Add indexes per best practices |
| No real-time | Multi-device broken | Enable Realtime subscriptions |

### 3.2 Current vs Best Practices

| Aspect | Current State | Best Practice | Status |
|--------|--------------|---------------|--------|
| Naming | ✅ snake_case | snake_case | Good |
| RLS | Partial | All tables | Fix |
| Indexes | None | On query columns | Create |
| JSONB usage | Not used | Hybrid approach | Implement |
| Connection pooling | Not configured | Transaction mode | Configure |
| Migrations | None | Version controlled | Set up |
| Local dev | Not set up | Docker + CLI | Set up |

### 3.3 Store-to-Table Mapping

| Zustand Store | Proposed Tables |
|---------------|-----------------|
| avatarStore | user_profiles, user_equipment, equipment_catalog |
| healthStore | health_meals, health_water_logs, health_supplements |
| financialStore | financial_transactions, financial_budgets, financial_goals, financial_accounts |
| productivityStore | productivity_tasks, productivity_projects, productivity_sessions |
| calendarStore | calendar_time_blocks, calendar_events |
| knowledgeStore | knowledge_books, knowledge_notes, knowledge_ideas, knowledge_media |
| skillsStore | skills, skill_practice_logs |
| workoutStore | health_workouts, health_exercises |
| gamificationStore | user_profiles (xp, level), timeline_events |
| questsStore | missions, user_missions |
| achievementsStore | achievements, user_achievements |

---

## 4. Architecture Decision: Fresh Start vs Iterate

### 4.1 Option A: Fresh Start

**Pros:**
- Clean slate, no legacy baggage
- Can implement best practices from day 1
- Consistent naming/structure throughout

**Cons:**
- Lose existing schema work
- Time to recreate 11 tables + policies
- BACKEND_ARCHITECTURE.md becomes outdated

### 4.2 Option B: Iterate on Existing

**Pros:**
- 11 tables already exist with RLS
- BACKEND_ARCHITECTURE.md provides roadmap
- Can incrementally add/fix

**Cons:**
- Need to fix RLS on 2 tables
- Need to add indexes
- Some refactoring required

### 4.3 Recommendation: **Iterate on Existing**

**Rationale:**
1. Existing schema follows best practices (snake_case, UUID PKs)
2. RLS structure is correct, just needs enabling on 2 tables
3. BACKEND_ARCHITECTURE.md provides comprehensive schema for missing tables
4. 90% of work is adding new tables, not fixing existing ones
5. Fresh start would waste ~5 hours of existing work

**Action Plan:**
1. Fix RLS on `missions` and `discoveries` tables
2. Add missing indexes to existing tables
3. Create new tables per BACKEND_ARCHITECTURE.md
4. Set up local development with Supabase CLI

---

## 5. Implementation Approach: Systems vs Pages

### 5.1 Option A: Page-by-Page

```
Phase 1: Dashboard page → backend
Phase 2: Health page → backend
Phase 3: Financial page → backend
...
```

**Problems:**
- Cross-cutting concerns (auth, XP, timeline) implemented multiple times
- Inconsistent patterns between pages
- Gamification requires all modules to work together
- Real-time sync broken until all pages complete

### 5.2 Option B: System-by-System

```
Phase 1: Auth System (login, signup, session)
Phase 2: Core Data Layer (React Query, base hooks)
Phase 3: Timeline System (central event log)
Phase 4: Module Data (each module's CRUD)
Phase 5: Gamification System (XP, levels, achievements)
Phase 6: Analytics System (correlations, insights)
```

**Benefits:**
- Cross-cutting concerns done once, used everywhere
- Consistent patterns across all modules
- Gamification works from day 1
- Real-time works for all modules simultaneously

### 5.3 Recommendation: **System-Based Approach**

**Rationale:**
1. Quanta's core value is **interconnection** between modules
2. Timeline events need to flow from all modules
3. XP system awards points across all activities
4. A page-by-page approach would require rewriting when adding gamification
5. System approach aligns with existing BACKEND_ARCHITECTURE.md

---

## 6. Recommended System Architecture

### 6.1 System Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  React Components → React Query Hooks → Zustand (UI only)   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      SYSTEM LAYER                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │  Auth   │  │Timeline │  │ Event   │  │  Gamification   │ │
│  │ System  │  │ System  │  │  Bus    │  │    System       │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     MODULE LAYER                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐ │
│  │Health  │ │Finance │ │Product.│ │Calendar│ │ Knowledge  │ │
│  │Module  │ │Module  │ │Module  │ │Module  │ │   Module   │ │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│             Supabase (PostgreSQL + RLS + Realtime)          │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 System Definitions

**1. Auth System**
- Supabase Auth integration
- Session management
- Protected routes
- User profile creation on signup

**2. Timeline System**
- Central event logging from all modules
- Cross-module activity feed
- Search and filtering
- Real-time updates

**3. Event Bus**
- Module-to-module communication
- Decoupled event emission
- Gamification triggers
- Analytics hooks

**4. Gamification System**
- XP calculation and awarding
- Level progression
- Achievement unlocking
- Cosmic energy mechanics

**5. Module Data**
- CRUD operations per module
- React Query integration
- Optimistic updates
- Offline support (via persist)

### 6.3 Data Flow Example

```
User completes workout in Health Module
         │
         ▼
┌─────────────────────────────────────┐
│ healthStore.completeWorkout()       │
│   - Call Supabase: INSERT workout   │
│   - Emit event: 'workout.completed' │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Event Bus receives 'workout.completed'
│   - Timeline System: Create event   │
│   - Gamification: Award XP          │
│   - Achievements: Check unlocks     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Real-time updates via Supabase      │
│   - Dashboard refreshes             │
│   - Avatar XP bar updates           │
│   - Notification appears            │
└─────────────────────────────────────┘
```

---

## 7. Database Schema Design

### 7.1 Core Tables (Implement First)

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_stage TEXT DEFAULT 'stage_01',
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  cosmic_energy INTEGER DEFAULT 0,
  prestige_level INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{
    "theme": "dark",
    "notifications": true,
    "gamification_mode": "full"
  }'::jsonb,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Central timeline (all activity flows here)
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id TEXT NOT NULL CHECK (module_id IN (
    'health', 'financial', 'productivity', 'calendar',
    'knowledge', 'skills', 'journal', 'gamification'
  )),
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  xp_earned INTEGER DEFAULT 0,
  credits_earned INTEGER DEFAULT 0,
  event_timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_timeline_user_time ON timeline_events (user_id, event_timestamp DESC);
CREATE INDEX idx_timeline_module ON timeline_events (user_id, module_id, event_timestamp DESC);
CREATE INDEX idx_timeline_type ON timeline_events (user_id, event_type);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON user_profiles
  FOR ALL USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users see own timeline" ON timeline_events
  FOR ALL USING ((SELECT auth.uid()) = user_id);
```

### 7.2 Module Tables (Implement Per Module)

See BACKEND_ARCHITECTURE.md for complete schema for:
- `health_*` tables (workouts, exercises, meals, sleep)
- `financial_*` tables (transactions, budgets, goals)
- `productivity_*` tables (tasks, projects, sessions)
- `calendar_*` tables (time_blocks, events)
- `knowledge_*` tables (books, notes, ideas)
- `skills_*` tables (skills, practice_logs)
- `journal_*` tables (entries, prompts)

### 7.3 Gamification Tables

```sql
-- Achievements catalog
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  unlock_condition JSONB NOT NULL, -- { type: 'count', metric: 'workouts', threshold: 10 }
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT REFERENCES achievements(id) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Equipment catalog
CREATE TABLE equipment_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('helmet', 'suit', 'backpack', 'tool', 'badge')),
  tier INTEGER DEFAULT 1,
  stats JSONB DEFAULT '{}'::jsonb, -- { defense: 5, strength: 3 }
  unlock_condition JSONB, -- { type: 'level', value: 10 } or { type: 'achievement', id: 'first_workout' }
  sprite_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User equipment
CREATE TABLE user_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  equipment_id TEXT REFERENCES equipment_catalog(id) NOT NULL,
  is_equipped BOOLEAN DEFAULT false,
  slot TEXT,
  cosmetic_override TEXT, -- Transmog: show different item
  dye_color TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, equipment_id)
);
```

---

## 8. Security Implementation

### 8.1 RLS Policy Patterns

**Pattern 1: User Owns Data**
```sql
CREATE POLICY "user_owns_data" ON table_name
  FOR ALL USING ((SELECT auth.uid()) = user_id);
```

**Pattern 2: Public Read, Authenticated Write**
```sql
CREATE POLICY "public_read" ON achievements
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admin_write" ON achievements
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
```

**Pattern 3: Cascading Access (User → Project → Task)**
```sql
CREATE POLICY "user_tasks_via_project" ON productivity_tasks
  FOR ALL USING (
    (SELECT auth.uid()) IN (
      SELECT user_id FROM productivity_projects WHERE id = project_id
    )
  );
```

### 8.2 Security Checklist

- [ ] RLS enabled on ALL tables
- [ ] Service key never exposed to frontend
- [ ] JWT stored in httpOnly cookies (configure Supabase client)
- [ ] `app_metadata` used for roles (not `user_metadata`)
- [ ] Input validation on all user inputs
- [ ] HTTPS enforced
- [ ] Rate limiting on auth endpoints
- [ ] Sensitive data encrypted at rest

### 8.3 Auth Configuration

```javascript
// /src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage, // Consider httpOnly cookie for production
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
    global: {
      headers: { 'x-client-info': 'quanta-web' },
    },
  }
);
```

---

## 9. Performance & Scalability

### 9.1 Query Optimization

**Rule 1: Always limit results**
```javascript
// Bad
const { data } = await supabase.from('timeline_events').select('*');

// Good
const { data } = await supabase
  .from('timeline_events')
  .select('*')
  .order('event_timestamp', { ascending: false })
  .limit(50);
```

**Rule 2: Select only needed columns**
```javascript
// Bad
const { data } = await supabase.from('user_profiles').select('*');

// Good
const { data } = await supabase
  .from('user_profiles')
  .select('id, username, display_name, total_xp, current_level');
```

**Rule 3: Use pagination**
```javascript
const PAGE_SIZE = 20;

const { data, count } = await supabase
  .from('timeline_events')
  .select('*', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

### 9.2 React Query Configuration

```javascript
// /src/lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
        // Show toast notification
      },
    },
  },
});
```

### 9.3 Real-time Subscriptions

```javascript
// Subscribe to user's timeline updates
const subscription = supabase
  .channel('user-timeline')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'timeline_events',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      queryClient.invalidateQueries(['timeline']);
    }
  )
  .subscribe();

// Clean up on unmount
return () => subscription.unsubscribe();
```

### 9.4 Caching Strategy

| Data Type | Cache Duration | Strategy |
|-----------|---------------|----------|
| User profile | 5 min | Stale-while-revalidate |
| Timeline | 1 min | Real-time + SWR |
| Achievements | 30 min | Long cache + invalidate on unlock |
| Module data | 5 min | SWR + optimistic updates |
| Static catalogs | 24 hr | Cache until reload |

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goals:** Auth working, basic data layer, one module complete

**Tasks:**
1. Set up Supabase CLI + local development
2. Create migration for `user_profiles` table
3. Implement auth flow (signup, login, logout)
4. Create React Query provider + base hooks
5. Convert `healthStore` to Supabase (first module)
6. Test end-to-end: signup → log meal → persist → reload

**Deliverables:**
- [ ] `supabase/migrations/001_user_profiles.sql`
- [ ] `src/hooks/useAuth.js`
- [ ] `src/hooks/useHealth.js`
- [ ] Auth UI (login/signup forms)

### Phase 2: Core Systems (Week 3-4)

**Goals:** Timeline system, event bus, cross-module data flow

**Tasks:**
1. Create `timeline_events` table + migration
2. Implement event bus (`src/lib/eventBus.js`)
3. Add timeline logging to health module
4. Create timeline dashboard component
5. Add real-time subscriptions for timeline
6. Implement search/filter for timeline

**Deliverables:**
- [ ] `supabase/migrations/002_timeline_events.sql`
- [ ] `src/lib/eventBus.js`
- [ ] `src/hooks/useTimeline.js`
- [ ] Timeline feed component

### Phase 3: Module Migration (Week 5-8)

**Goals:** All modules connected to Supabase

**Order (by complexity):**
1. **Financial** - Most straightforward CRUD
2. **Productivity** - Tasks + projects + sessions
3. **Calendar** - Time blocks + events
4. **Knowledge** - Books + notes + bidirectional links
5. **Skills** - Skill trees + practice logs
6. **Journal** - Entries + prompts + mood

**Per Module Tasks:**
- Create migration for module tables
- Create React Query hooks
- Update store to use hooks (keep Zustand for UI state)
- Add timeline event emission
- Test CRUD operations
- Add real-time updates

### Phase 4: Gamification (Week 9-10)

**Goals:** XP, levels, achievements, equipment

**Tasks:**
1. Create gamification tables migration
2. Implement XP calculation database function
3. Create level progression logic
4. Implement achievement checking triggers
5. Connect equipment unlocks to achievements
6. Create avatar progression UI

**Deliverables:**
- [ ] `supabase/migrations/005_gamification.sql`
- [ ] `supabase/functions/award_xp.sql`
- [ ] `src/hooks/useGamification.js`
- [ ] Achievement notification system

### Phase 5: Polish & Analytics (Week 11-12)

**Goals:** Performance optimization, analytics, insights

**Tasks:**
1. Add indexes based on query patterns
2. Implement correlation engine (Edge Function)
3. Create AI insights integration
4. Add data export functionality
5. Performance testing + optimization
6. Security audit

---

## 11. Migration Strategy

### 11.1 Local Development Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in project
cd /path/to/LifeOS
supabase init

# Start local Supabase
supabase start

# Create migration
supabase migration new create_user_profiles

# Apply migrations locally
supabase migration up

# Reset local database
supabase db reset
```

### 11.2 Project Structure

```
LifeOS/
├── supabase/
│   ├── migrations/
│   │   ├── 001_user_profiles.sql
│   │   ├── 002_timeline_events.sql
│   │   ├── 003_health_tables.sql
│   │   ├── 004_financial_tables.sql
│   │   └── ...
│   ├── functions/
│   │   ├── award-xp/
│   │   │   └── index.ts
│   │   └── sync-fitness/
│   │       └── index.ts
│   ├── seed.sql
│   └── config.toml
├── lifeos-frontend/
│   └── src/
│       ├── lib/
│       │   ├── supabase.js
│       │   ├── queryClient.js
│       │   └── eventBus.js
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useHealth.js
│       │   ├── useFinancial.js
│       │   └── ...
│       └── stores/
│           └── ... (UI state only)
└── ...
```

### 11.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy-supabase.yml
name: Deploy Supabase

on:
  push:
    branches: [main]
    paths:
      - 'supabase/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
      - run: supabase db push
      - run: supabase functions deploy
```

### 11.4 Data Migration (Existing Users)

Since there are currently 0 users and 0 data, no data migration is needed. However, when launching:

1. **Onboarding Flow:**
   - Create `user_profile` on signup
   - Initialize default values
   - Run initial XP calculation

2. **Seed Data:**
   - Populate `achievements` catalog
   - Populate `equipment_catalog`
   - Add default `missions`

---

## Summary

### Key Decisions

1. **Iterate, don't restart** - Existing schema is good, just needs additions
2. **System-based implementation** - Build core systems first, then module data
3. **React Query + Zustand hybrid** - Server state in RQ, UI state in Zustand
4. **Database functions for XP** - Keep gamification logic in PostgreSQL
5. **Real-time from day 1** - Enable subscriptions on timeline

### Next Steps

1. Set up Supabase CLI + local development
2. Create Phase 1 migrations (user_profiles)
3. Implement auth flow
4. Convert first module (health) to Supabase
5. Add timeline system
6. Proceed through phases

### Success Metrics

| Metric | Target |
|--------|--------|
| Auth working | Week 1 |
| First module persisted | Week 2 |
| Timeline live | Week 4 |
| All modules connected | Week 8 |
| Gamification live | Week 10 |
| Production ready | Week 12 |

---

*This document should be treated as the source of truth for backend implementation decisions. Update as the project evolves.*
