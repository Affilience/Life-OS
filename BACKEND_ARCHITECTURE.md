# Quanta Backend Architecture Specification

**Version:** 1.0
**Date:** January 2025
**Status:** Technical Specification

---

## Executive Summary

This document provides a comprehensive technical architecture for Quanta's backend system, designed to transform the current mock-data frontend into a production-ready, secure, and scalable personal operating system.

**Key Decisions:**
- **Primary Stack:** Supabase (PostgreSQL + PostgREST + GoTrue + Realtime)
- **Data Layer:** React Query for server state, Zustand for UI state
- **Security:** Row Level Security (RLS) + End-to-end encryption for sensitive data
- **Architecture:** Modular monolith with event-driven cross-module communication
- **Deployment:** Self-hostable via Docker, with managed Supabase option

**Implementation Timeline:** 16 weeks across 4 phases

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Architecture Decision Record](#2-architecture-decision-record)
3. [Database Architecture](#3-database-architecture)
4. [API Design](#4-api-design)
5. [Security Architecture](#5-security-architecture)
6. [Real-time & Sync](#6-real-time--sync)
7. [State Management Integration](#7-state-management-integration)
8. [Cross-Module Integration](#8-cross-module-integration)
9. [Module-Specific Implementations](#9-module-specific-implementations)
10. [Testing Strategy](#10-testing-strategy)
11. [Performance Optimization](#11-performance-optimization)
12. [Deployment & DevOps](#12-deployment--devops)
13. [Implementation Roadmap](#13-implementation-roadmap)
14. [Risk Assessment](#14-risk-assessment)
15. [References](#15-references)

---

## 1. Current State Analysis

### 1.1 Frontend Architecture

**Strengths:**
- 162 React components with modern functional patterns
- 9 Zustand stores for state management
- Comprehensive cosmic-themed design system
- Mobile-first responsive design
- Lazy loading and code splitting implemented

**Current Stores:**
```
/src/store/
├── authStore.js          ❌ No backend integration
├── cosmicCurrencyStore.js ❌ Mock data only
├── discoveryStore.js     ❌ Mock data only
├── gamificationStore.js  ❌ Mock data only
├── missionStore.js       ❌ Mock data only
├── momentumStore.js      ❌ Mock data only
├── rewardsStore.js       ❌ Mock data only
├── skillsStore.js        ❌ Mock data only
└── statsStore.js         ❌ Mock data only
```

### 1.2 Database Schema Analysis

**Existing Tables (11 total):**

| Table | Rows | RLS | Status | Issues |
|-------|------|-----|--------|--------|
| `user_module_progress` | 0 | ✅ | Good | Needs indexes |
| `user_cosmic_currency` | 0 | ✅ | Good | None |
| `currency_transactions` | 0 | ✅ | Good | Needs index on user_id |
| `missions` | 20 | ❌ | ⚠️ | RLS disabled, needs JSONB validation |
| `user_missions` | 0 | ✅ | Good | Composite index needed |
| `momentum_chains` | 0 | ✅ | Good | None |
| `momentum_events` | 0 | ✅ | Good | Needs index on event_date |
| `discoveries` | 0 | ❌ | ⚠️ | RLS disabled |
| `user_discoveries` | 0 | ✅ | Good | None |
| `rewards` | 0 | ✅ | Good | None |
| `reward_redemptions` | 0 | ✅ | Good | None |

**Missing Tables for Core Modules:**

```sql
-- Productivity Module
productivity_sessions
productivity_projects
productivity_tasks
productivity_income

-- Health Module
health_workouts
health_exercises
health_nutrition_logs
health_sleep_logs
health_recovery_logs

-- Knowledge Module
knowledge_notes
knowledge_links (bidirectional linking)
knowledge_books
knowledge_media

-- Journal Module
journal_entries
journal_moods
journal_prompts

-- Calendar Module
calendar_events
calendar_time_blocks

-- Skills Module
skills (already exists in skillsStore)
skill_practice_logs

-- Financial Module
financial_accounts
financial_transactions
financial_goals
financial_net_worth_snapshots
```

### 1.3 Gap Analysis

**Critical Gaps:**
1. **No authentication flow** - Users can't log in/sign up
2. **90% mock data** - No persistence between sessions
3. **Missing module tables** - Only gamification tables exist
4. **No real-time subscriptions** - Multi-device sync impossible
5. **No data export** - User data lock-in
6. **No audit logging** - Can't track security events
7. **Zero test coverage** - High regression risk

---

## 2. Architecture Decision Record

### 2.1 Backend Stack: Supabase vs Custom API

**Decision: Use Supabase-first architecture with selective Edge Functions**

#### Comparison Matrix

| Criterion | Supabase | Custom Express.js | tRPC | Score |
|-----------|----------|-------------------|------|-------|
| Development Speed | ⭐⭐⭐⭐⭐ (Auto-generated REST) | ⭐⭐⭐ | ⭐⭐⭐⭐ | Supabase wins |
| Type Safety | ⭐⭐⭐ (Generated types) | ⭐⭐ (Manual) | ⭐⭐⭐⭐⭐ | tRPC best |
| Real-time | ⭐⭐⭐⭐⭐ (Built-in) | ⭐⭐ (Custom WebSocket) | ⭐⭐ | Supabase wins |
| Self-hosting | ⭐⭐⭐⭐ (Docker) | ⭐⭐⭐⭐⭐ (Simple) | ⭐⭐⭐⭐ | Tie |
| Row-level Security | ⭐⭐⭐⭐⭐ (PostgreSQL RLS) | ⭐⭐⭐ (Custom middleware) | ⭐⭐⭐ | Supabase wins |
| Maturity | ⭐⭐⭐⭐ (3 years) | ⭐⭐⭐⭐⭐ (10+ years) | ⭐⭐⭐ (2 years) | Express wins |
| Learning Curve | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Supabase easiest |

**Rationale:**
- **Supabase** provides instant REST API, real-time subscriptions, and authentication out of the box
- **PostgreSQL** handles complex queries for timeline/correlations better than NoSQL
- **RLS policies** provide database-level security that can't be bypassed
- **Self-hosting** via Docker is mature and well-documented
- For complex operations (AI insights, correlations), use **Supabase Edge Functions** (Deno runtime)

### 2.2 State Management: React Query + Zustand

**Decision: Use React Query for server state, keep Zustand for UI state only**

#### Before (Current):
```javascript
// Zustand store manages both server and UI state
const useMissionStore = create((set) => ({
  missions: mockMissions, // ❌ Mock data
  fetchMissions: () => {}, // ❌ Not implemented
  completeMission: () => {} // ❌ No backend call
}));
```

#### After (Proposed):
```javascript
// React Query for server state
function useMissions() {
  return useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('active', true);
      if (error) throw error;
      return data;
    }
  });
}

// Zustand only for UI state
const useUIStore = create((set) => ({
  selectedMission: null,
  missionModalOpen: false,
  setSelectedMission: (mission) => set({ selectedMission: mission })
}));
```

**Benefits:**
- Automatic caching, refetching, and background updates
- Optimistic updates with automatic rollback on error
- DevTools for debugging queries
- Reduces Zustand store complexity by 80%

### 2.3 Architecture Pattern: Modular Monolith

**Decision: Modular monolith with event-driven cross-module communication**

```
/src/modules/
├── dashboard/
│   ├── api/           # React Query hooks
│   ├── components/
│   ├── hooks/
│   └── types/
├── productivity/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   └── types/
├── health/
├── knowledge/
├── journal/
├── calendar/
├── skills/
├── financial/
└── shared/
    ├── events/        # Event bus for cross-module communication
    ├── types/
    └── utils/
```

**Event-Driven Communication:**
```typescript
// When workout is completed in Health module
eventBus.emit('workout.completed', {
  userId,
  workoutId,
  xpEarned: 50,
  timestamp: new Date()
});

// Dashboard module listens
eventBus.on('workout.completed', async (data) => {
  // Update timeline
  // Recalculate stats
  // Check for discoveries
});
```

---

## 3. Database Architecture

### 3.1 Schema Design Principles

**Principles:**
1. **Normalization for core data**, denormalization for read-heavy analytics
2. **JSONB for flexible metadata**, relational for queryable fields
3. **Temporal tables** for audit trails and point-in-time recovery
4. **Soft deletes** for user data (set `deleted_at` timestamp)
5. **Composite indexes** for common query patterns
6. **Partitioning** for tables exceeding 10M rows (future-proofing)

### 3.2 Complete Schema

#### 3.2.1 Authentication & Users

```sql
-- Managed by Supabase Auth (auth.users)
-- No custom modifications needed

-- Extended user profile
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_stage TEXT DEFAULT 'ordinary_human',
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  cosmic_energy INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{}'::jsonb,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policy
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### 3.2.2 Timeline (Central Table)

```sql
-- Central timeline aggregating all activity
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL CHECK (module_id IN (
    'journal', 'knowledge', 'health', 'finance',
    'productivity', 'calendar', 'skills', 'gamification'
  )),
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  xp_earned INTEGER DEFAULT 0,
  credits_earned INTEGER DEFAULT 0,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Indexes for common queries
  CONSTRAINT timeline_pkey PRIMARY KEY (id),
  INDEX idx_timeline_user_timestamp (user_id, event_timestamp DESC),
  INDEX idx_timeline_module (user_id, module_id, event_timestamp DESC),
  INDEX idx_timeline_type (user_id, event_type, event_timestamp DESC)
);

-- Enable RLS
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own timeline"
  ON timeline_events FOR ALL
  USING (auth.uid() = user_id);

-- Partitioning for scale (when > 1M rows)
-- CREATE TABLE timeline_events_2025 PARTITION OF timeline_events
--   FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

#### 3.2.3 Productivity Module

```sql
-- Work/focus sessions
CREATE TABLE productivity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES productivity_projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT DEFAULT 'deep_work' CHECK (session_type IN (
    'deep_work', 'shallow_work', 'meeting', 'learning', 'break'
  )),
  planned_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  focus_quality INTEGER CHECK (focus_quality BETWEEN 1 AND 5),
  tags TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_productivity_sessions_user_date (user_id, started_at DESC)
);

-- Projects
CREATE TABLE productivity_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  color TEXT,
  estimated_hours NUMERIC,
  actual_hours NUMERIC DEFAULT 0,
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks
CREATE TABLE productivity_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES productivity_projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES productivity_tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'completed', 'cancelled')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  position INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_tasks_user_status (user_id, status),
  INDEX idx_tasks_project (project_id, status, position)
);

-- Income tracking
CREATE TABLE productivity_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES productivity_projects(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  source TEXT NOT NULL,
  description TEXT,
  income_date DATE NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'received', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_income_user_date (user_id, income_date DESC)
);

-- Enable RLS on all tables
ALTER TABLE productivity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_income ENABLE ROW LEVEL SECURITY;

-- RLS Policies (same pattern for all)
CREATE POLICY "Users manage own data" ON productivity_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON productivity_projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON productivity_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON productivity_income FOR ALL USING (auth.uid() = user_id);
```

#### 3.2.4 Health Module

```sql
-- Workouts
CREATE TABLE health_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_type TEXT NOT NULL CHECK (workout_type IN (
    'strength', 'cardio', 'flexibility', 'sports', 'other'
  )),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  perceived_exertion INTEGER CHECK (perceived_exertion BETWEEN 1 AND 10),
  mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 5),
  notes TEXT,
  workout_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_workouts_user_date (user_id, workout_date DESC)
);

-- Exercises within workouts
CREATE TABLE health_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES health_workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  weight_kg NUMERIC,
  distance_km NUMERIC,
  duration_seconds INTEGER,
  notes TEXT,
  position INTEGER DEFAULT 0
);

-- Nutrition logs
CREATE TABLE health_nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items JSONB NOT NULL, -- Array of {name, calories, protein, carbs, fat}
  total_calories INTEGER,
  total_protein NUMERIC,
  total_carbs NUMERIC,
  total_fat NUMERIC,
  meal_timestamp TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_nutrition_user_date (user_id, meal_timestamp DESC)
);

-- Sleep logs
CREATE TABLE health_sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_date DATE NOT NULL,
  bedtime TIMESTAMPTZ,
  wake_time TIMESTAMPTZ,
  duration_hours NUMERIC,
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 100),
  deep_sleep_hours NUMERIC,
  rem_sleep_hours NUMERIC,
  awakenings INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, sleep_date),
  INDEX idx_sleep_user_date (user_id, sleep_date DESC)
);

-- Recovery tracking
CREATE TABLE health_recovery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  recovery_score INTEGER CHECK (recovery_score BETWEEN 1 AND 100),
  hrv_ms INTEGER, -- Heart rate variability
  resting_hr INTEGER,
  muscle_soreness INTEGER CHECK (muscle_soreness BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, log_date),
  INDEX idx_recovery_user_date (user_id, log_date DESC)
);

-- Enable RLS
ALTER TABLE health_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_recovery_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own data" ON health_workouts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON health_exercises FOR ALL USING (auth.uid() IN (SELECT user_id FROM health_workouts WHERE id = workout_id));
CREATE POLICY "Users manage own data" ON health_nutrition_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON health_sleep_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON health_recovery_logs FOR ALL USING (auth.uid() = user_id);
```

#### 3.2.5 Knowledge Module

```sql
-- Notes (Obsidian-style)
CREATE TABLE knowledge_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || content)) STORED,
  tags TEXT[] DEFAULT '{}',
  folder_path TEXT DEFAULT '/',
  pinned BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_notes_user_updated (user_id, updated_at DESC),
  INDEX idx_notes_search (content_vector) USING GIN,
  INDEX idx_notes_tags (user_id, tags) USING GIN
);

-- Bidirectional links between notes
CREATE TABLE knowledge_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_note_id UUID REFERENCES knowledge_notes(id) ON DELETE CASCADE,
  target_note_id UUID REFERENCES knowledge_notes(id) ON DELETE CASCADE,
  link_type TEXT DEFAULT 'reference' CHECK (link_type IN ('reference', 'parent', 'related')),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (source_note_id, target_note_id),
  INDEX idx_links_source (source_note_id),
  INDEX idx_links_target (target_note_id),
  INDEX idx_links_user (user_id)
);

-- Books & Media
CREATE TABLE knowledge_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('book', 'article', 'video', 'podcast', 'course')),
  title TEXT NOT NULL,
  author TEXT,
  url TEXT,
  status TEXT DEFAULT 'want' CHECK (status IN ('want', 'in_progress', 'completed', 'abandoned')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  key_takeaways TEXT[],
  tags TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_media_user_status (user_id, status, updated_at DESC)
);

-- Enable RLS
ALTER TABLE knowledge_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own data" ON knowledge_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON knowledge_links FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON knowledge_media FOR ALL USING (auth.uid() = user_id);
```

#### 3.2.6 Journal Module

```sql
-- Daily journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content TEXT NOT NULL,
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  gratitude_items TEXT[],
  wins TEXT[],
  challenges TEXT[],
  lessons_learned TEXT,
  tomorrow_focus TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, entry_date),
  INDEX idx_journal_user_date (user_id, entry_date DESC),
  INDEX idx_journal_mood (user_id, mood_rating, entry_date DESC)
);

-- Journal prompts
CREATE TABLE journal_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  category TEXT,
  is_system BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own data" ON journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own prompts" ON journal_prompts FOR ALL USING (auth.uid() = user_id OR is_system = true);
```

#### 3.2.7 Calendar Module

```sql
-- Calendar events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'event' CHECK (event_type IN (
    'event', 'task', 'time_block', 'reminder'
  )),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- RRULE format
  location TEXT,
  attendees TEXT[],
  color TEXT,
  tags TEXT[] DEFAULT '{}',
  external_calendar_id TEXT,
  external_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_calendar_user_time (user_id, start_time, end_time)
);

-- Time blocks (planned vs actual)
CREATE TABLE calendar_time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  block_date DATE NOT NULL,
  block_type TEXT NOT NULL CHECK (block_type IN (
    'deep_work', 'meetings', 'learning', 'exercise', 'personal', 'break'
  )),
  planned_start TIME,
  planned_end TIME,
  actual_start TIME,
  actual_end TIME,
  energy_planned INTEGER CHECK (energy_planned BETWEEN 1 AND 5),
  energy_actual INTEGER CHECK (energy_actual BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_timeblocks_user_date (user_id, block_date DESC)
);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_time_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own data" ON calendar_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON calendar_time_blocks FOR ALL USING (auth.uid() = user_id);
```

#### 3.2.8 Skills Module

```sql
-- Skills
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  current_level INTEGER DEFAULT 1 CHECK (current_level BETWEEN 1 AND 100),
  target_level INTEGER CHECK (target_level BETWEEN 1 AND 100),
  xp INTEGER DEFAULT 0,
  total_practice_hours NUMERIC DEFAULT 0,
  icon TEXT,
  color TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'mastered')),
  started_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_skills_user_status (user_id, status)
);

-- Practice logs
CREATE TABLE skill_practice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 10),
  focus_areas TEXT[],
  notes TEXT,
  resources_used TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_practice_skill_date (skill_id, practice_date DESC),
  INDEX idx_practice_user_date (user_id, practice_date DESC)
);

-- Enable RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_practice_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own data" ON skills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON skill_practice_logs FOR ALL USING (auth.uid() = user_id);
```

#### 3.2.9 Financial Module

```sql
-- Financial accounts
CREATE TABLE financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN (
    'checking', 'savings', 'credit_card', 'investment', 'cash', 'other'
  )),
  institution TEXT,
  currency TEXT DEFAULT 'USD',
  current_balance NUMERIC(12, 2) DEFAULT 0,
  external_account_id TEXT,
  plaid_access_token TEXT, -- Encrypted
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES financial_accounts(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
  category TEXT NOT NULL,
  subcategory TEXT,
  merchant TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_recurring BOOLEAN DEFAULT false,
  external_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_transactions_user_date (user_id, transaction_date DESC),
  INDEX idx_transactions_category (user_id, category, transaction_date DESC)
);

-- Financial goals
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('savings', 'debt_payoff', 'investment', 'budget')),
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Net worth snapshots
CREATE TABLE financial_net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_assets NUMERIC(12, 2) NOT NULL,
  total_liabilities NUMERIC(12, 2) NOT NULL,
  net_worth NUMERIC(12, 2) GENERATED ALWAYS AS (total_assets - total_liabilities) STORED,
  breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, snapshot_date),
  INDEX idx_networth_user_date (user_id, snapshot_date DESC)
);

-- Enable RLS
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_net_worth_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own data" ON financial_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON financial_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON financial_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON financial_net_worth_snapshots FOR ALL USING (auth.uid() = user_id);
```

### 3.3 Database Functions & Triggers

#### Auto-update timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- (Repeat for all tables)
```

#### Award XP on activity
```sql
CREATE OR REPLACE FUNCTION award_xp_on_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Award XP based on activity type
  INSERT INTO currency_transactions (
    user_id, amount, transaction_type, description, related_entity_id, balance_after
  ) VALUES (
    NEW.user_id,
    NEW.xp_earned,
    'activity_reward',
    'XP earned from ' || NEW.event_type,
    NEW.id,
    (SELECT cosmic_energy + NEW.xp_earned FROM user_profiles WHERE id = NEW.user_id)
  );

  -- Update user total XP
  UPDATE user_profiles
  SET cosmic_energy = cosmic_energy + NEW.xp_earned
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER award_xp_trigger
  AFTER INSERT ON timeline_events
  FOR EACH ROW WHEN (NEW.xp_earned > 0)
  EXECUTE FUNCTION award_xp_on_activity();
```

### 3.4 Indexes for Performance

```sql
-- Timeline queries (most important)
CREATE INDEX idx_timeline_recent ON timeline_events (user_id, event_timestamp DESC)
  WHERE event_timestamp > now() - interval '30 days';

-- Module-specific filters
CREATE INDEX idx_timeline_module_type ON timeline_events (user_id, module_id, event_type, event_timestamp DESC);

-- Full-text search on notes
CREATE INDEX idx_notes_fulltext ON knowledge_notes USING GIN (content_vector);

-- Journal mood tracking
CREATE INDEX idx_journal_mood_trends ON journal_entries (user_id, mood_rating, entry_date DESC);

-- Financial category analysis
CREATE INDEX idx_transactions_category_amount ON financial_transactions (user_id, category, transaction_date DESC, amount);

-- Productivity time tracking
CREATE INDEX idx_sessions_duration ON productivity_sessions (user_id, started_at DESC, actual_duration_minutes);
```

---

## 4. API Design

### 4.1 REST API Convention

**Supabase Auto-Generated Endpoints:**
```
GET    /rest/v1/{table}                 # List with filters
GET    /rest/v1/{table}?id=eq.{uuid}    # Get single
POST   /rest/v1/{table}                 # Create
PATCH  /rest/v1/{table}?id=eq.{uuid}    # Update
DELETE /rest/v1/{table}?id=eq.{uuid}    # Delete
```

**Custom Endpoints via Edge Functions:**
```
POST   /functions/v1/timeline/aggregate          # Get aggregated timeline
POST   /functions/v1/analytics/correlations      # Cross-module correlations
POST   /functions/v1/ai/insights                 # AI-generated insights
POST   /functions/v1/export/data                 # Export all user data
POST   /functions/v1/import/data                 # Import data (migrations)
```

### 4.2 React Query Hooks Pattern

#### Example: Missions Module

```typescript
// /src/modules/gamification/api/useMissions.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Mission, UserMission } from './types';

// GET all active missions
export function useMissions() {
  return useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('active', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      return data as Mission[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// GET user's active missions
export function useUserMissions() {
  return useQuery({
    queryKey: ['user-missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_missions')
        .select(`
          *,
          mission:missions(*)
        `)
        .eq('status', 'active');

      if (error) throw error;
      return data as UserMission[];
    },
    // Real-time subscription
    refetchInterval: false, // Disable polling, use subscription instead
  });
}

// UPDATE mission progress
export function useUpdateMissionProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      missionId,
      progress,
      completionPercentage
    }: {
      missionId: string;
      progress: object;
      completionPercentage: number;
    }) => {
      const { data, error } = await supabase
        .from('user_missions')
        .update({
          progress,
          completion_percentage: completionPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', missionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['user-missions'] });

      const previousMissions = queryClient.getQueryData(['user-missions']);

      queryClient.setQueryData(['user-missions'], (old: UserMission[]) => {
        return old?.map(mission =>
          mission.id === variables.missionId
            ? { ...mission, completion_percentage: variables.completionPercentage }
            : mission
        );
      });

      return { previousMissions };
    },
    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['user-missions'], context?.previousMissions);
    },
    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-missions'] });
    },
  });
}

// COMPLETE mission
export function useCompleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      const { data, error } = await supabase.rpc('complete_mission', {
        p_mission_id: missionId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-missions'] });
      queryClient.invalidateQueries({ queryKey: ['cosmic-currency'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}
```

#### Database Function for Mission Completion
```sql
CREATE OR REPLACE FUNCTION complete_mission(p_mission_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_mission RECORD;
  v_mission RECORD;
  v_xp_awarded INTEGER;
  v_credits_awarded INTEGER;
BEGIN
  -- Get user mission and mission details
  SELECT um.*, m.xp_reward, m.credits_reward
  INTO v_user_mission, v_mission
  FROM user_missions um
  JOIN missions m ON um.mission_id = m.id
  WHERE um.id = p_mission_id AND um.user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission not found or unauthorized';
  END IF;

  -- Update mission status
  UPDATE user_missions
  SET
    status = 'completed',
    completed_at = now(),
    completion_percentage = 100
  WHERE id = p_mission_id;

  -- Award XP
  UPDATE user_module_progress
  SET
    current_xp = current_xp + v_mission.xp_reward,
    total_xp_earned = total_xp_earned + v_mission.xp_reward
  WHERE user_id = auth.uid() AND module_id = 'any'; -- Adjust based on mission module

  -- Award Credits
  UPDATE user_cosmic_currency
  SET
    cosmic_credits = cosmic_credits + v_mission.credits_reward,
    lifetime_credits_earned = lifetime_credits_earned + v_mission.credits_reward
  WHERE user_id = auth.uid();

  -- Log transaction
  INSERT INTO currency_transactions (user_id, amount, transaction_type, description, related_entity_id)
  VALUES (
    auth.uid(),
    v_mission.credits_reward,
    'mission_reward',
    'Completed: ' || (SELECT title FROM missions WHERE id = v_user_mission.mission_id),
    p_mission_id
  );

  -- Add to timeline
  INSERT INTO timeline_events (user_id, module_id, event_type, title, metadata, xp_earned, credits_earned)
  VALUES (
    auth.uid(),
    'gamification',
    'mission_completed',
    'Mission Completed',
    jsonb_build_object('mission_id', v_user_mission.mission_id),
    v_mission.xp_reward,
    v_mission.credits_reward
  );

  RETURN json_build_object(
    'success', true,
    'xp_awarded', v_mission.xp_reward,
    'credits_awarded', v_mission.credits_reward
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.3 Real-time Subscriptions

```typescript
// /src/modules/gamification/api/useRealtimeMissions.ts

export function useRealtimeMissions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabase
      .channel('user-missions-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_missions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Mission updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['user-missions'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);
}
```

---

## 5. Security Architecture

### 5.1 Authentication Strategy

**Primary: Email/Password with Magic Links**
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123!',
  options: {
    data: {
      display_name: 'John Doe',
    },
    emailRedirectTo: 'https://quanta.app/auth/callback'
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securePassword123!'
});

// Magic link (passwordless)
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'https://quanta.app/auth/callback'
  }
});
```

**OAuth Providers:**
```typescript
// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://quanta.app/auth/callback',
    scopes: 'email profile'
  }
});

// GitHub, Apple, etc.
```

**2FA/MFA Setup:**
```typescript
// Enable MFA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
  friendlyName: 'My Authenticator'
});

// Verify MFA
const { data, error } = await supabase.auth.mfa.verify({
  factorId: data.id,
  code: '123456'
});
```

### 5.2 Row Level Security Policies

#### Pattern: User Isolation
```sql
-- Every table follows this pattern
CREATE POLICY "Users see only their own data"
  ON {table_name}
  FOR ALL
  USING (auth.uid() = user_id);
```

#### Pattern: Admin Override (Future)
```sql
CREATE POLICY "Admins see all data"
  ON {table_name}
  FOR ALL
  USING (
    auth.uid() = user_id
    OR
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );
```

#### Pattern: Shared Resources
```sql
-- Missions table (global, readable by all, editable by admins only)
CREATE POLICY "All users can read missions"
  ON missions FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify missions"
  ON missions FOR ALL
  USING ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin');
```

### 5.3 Sensitive Data Encryption

**Client-Side Encryption for Journals:**
```typescript
import { encrypt, decrypt } from '@/lib/crypto';

// Encrypt before sending to database
async function saveJournalEntry(content: string) {
  const encryptedContent = await encrypt(content, userMasterKey);

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      content: encryptedContent,
      // ... other fields
    });
}

// Decrypt after fetching
async function getJournalEntry(id: string) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .single();

  const decryptedContent = await decrypt(data.content, userMasterKey);
  return { ...data, content: decryptedContent };
}
```

**Crypto Library (Web Crypto API):**
```typescript
// /src/lib/crypto.ts
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  );

  // Combine IV + ciphertext and encode as base64
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encrypted: string, key: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(plaintext);
}
```

### 5.4 API Security Checklist

- [x] **Row Level Security** enabled on all user tables
- [x] **HTTPS only** (enforce TLS 1.3+)
- [x] **CORS** configured to allow only your domain
- [x] **Rate limiting** via Supabase (1000 req/hour per IP)
- [x] **JWT validation** automatic via Supabase Auth
- [x] **SQL injection** prevented by parameterized queries
- [x] **XSS protection** via Content Security Policy headers
- [x] **CSRF tokens** for state-changing operations
- [ ] **Audit logging** for sensitive operations (implement)
- [ ] **2FA enforcement** for all users (optional, implement later)

### 5.5 Secret Management

**Never commit:**
```env
# .env.local (gitignored)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # Backend only!

# Third-party API keys
FATSECRET_CLIENT_ID=xxx
FATSECRET_CLIENT_SECRET=xxx
OPENAI_API_KEY=sk-xxx
PLAID_CLIENT_ID=xxx
PLAID_SECRET=xxx
```

**Secure storage for user API keys:**
```sql
-- Encrypt user-provided API keys (e.g., for integrations)
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL, -- 'plaid', 'apple_health', etc.
  encrypted_key TEXT NOT NULL, -- Encrypted with user's master key
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. Real-time & Sync

### 6.1 Supabase Realtime Setup

**Enable Realtime on Tables:**
```sql
-- Enable realtime for all user tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_missions;
ALTER PUBLICATION supabase_realtime ADD TABLE timeline_events;
ALTER PUBLICATION supabase_realtime ADD TABLE productivity_tasks;
-- etc.
```

**React Hook for Realtime:**
```typescript
// /src/hooks/useRealtimeTable.ts
export function useRealtimeTable<T>(
  table: string,
  queryKey: string[],
  filter?: string
) {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filter || `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log(`${table} changed:`, payload);

          // Invalidate queries to refetch
          queryClient.invalidateQueries({ queryKey });

          // Or update cache directly (optimistic)
          queryClient.setQueryData<T[]>(queryKey, (old) => {
            if (!old) return old;

            if (payload.eventType === 'INSERT') {
              return [...old, payload.new as T];
            } else if (payload.eventType === 'UPDATE') {
              return old.map(item =>
                (item as any).id === payload.new.id ? payload.new as T : item
              );
            } else if (payload.eventType === 'DELETE') {
              return old.filter(item => (item as any).id !== payload.old.id);
            }

            return old;
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, table, queryKey, queryClient]);
}

// Usage
function TaskList() {
  const { data: tasks } = useTasks();
  useRealtimeTable('productivity_tasks', ['tasks']);

  return <div>{/* render tasks */}</div>;
}
```

### 6.2 Offline-First with IndexedDB

**Install Dexie (IndexedDB wrapper):**
```bash
npm install dexie
```

**Setup IndexedDB:**
```typescript
// /src/lib/db.ts
import Dexie, { Table } from 'dexie';

class QuantaDB extends Dexie {
  tasks!: Table<Task>;
  workouts!: Table<Workout>;
  notes!: Table<Note>;

  constructor() {
    super('QuantaDB');

    this.version(1).stores({
      tasks: 'id, user_id, status, due_date',
      workouts: 'id, user_id, workout_date',
      notes: 'id, user_id, updated_at'
    });
  }
}

export const db = new QuantaDB();
```

**Sync Strategy:**
```typescript
// /src/lib/sync.ts
export async function syncToServer() {
  const pendingChanges = await db.pendingChanges.toArray();

  for (const change of pendingChanges) {
    try {
      if (change.operation === 'INSERT') {
        await supabase.from(change.table).insert(change.data);
      } else if (change.operation === 'UPDATE') {
        await supabase.from(change.table).update(change.data).eq('id', change.id);
      } else if (change.operation === 'DELETE') {
        await supabase.from(change.table).delete().eq('id', change.id);
      }

      // Remove from pending queue
      await db.pendingChanges.delete(change.id);
    } catch (error) {
      console.error('Sync failed:', error);
      // Retry later
    }
  }
}

// Sync every 30 seconds when online
setInterval(() => {
  if (navigator.onLine) {
    syncToServer();
  }
}, 30000);
```

### 6.3 Conflict Resolution

**Last-Write-Wins Strategy:**
```typescript
// When syncing local changes to server
const { data, error } = await supabase
  .from('productivity_tasks')
  .upsert(localTask, {
    onConflict: 'id',
    ignoreDuplicates: false
  });
```

**Timestamp-Based Resolution:**
```sql
-- Add version column
ALTER TABLE productivity_tasks ADD COLUMN version INTEGER DEFAULT 1;

-- Trigger to increment version on update
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_task_version
  BEFORE UPDATE ON productivity_tasks
  FOR EACH ROW EXECUTE FUNCTION increment_version();
```

---

## 7. State Management Integration

### 7.1 Zustand Cleanup Strategy

**Before (Current):**
```javascript
// ❌ Bad: Zustand manages server state
const useMissionStore = create((set) => ({
  missions: mockMissions,
  fetchMissions: async () => {
    // Mock implementation
  }
}));
```

**After (Proposed):**
```typescript
// ✅ Good: React Query manages server state
import { useQuery } from '@tanstack/react-query';

function useMissions() {
  return useQuery({
    queryKey: ['missions'],
    queryFn: fetchMissions
  });
}

// ✅ Good: Zustand only for UI state
const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  selectedMission: null,
  missionModalOpen: false,
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  selectMission: (mission) => set({ selectedMission: mission })
}));
```

### 7.2 Migration Plan for Stores

| Current Store | Action | New Pattern |
|---------------|--------|-------------|
| `authStore` | ✅ Keep | Use Supabase Auth hooks |
| `cosmicCurrencyStore` | 🔄 Migrate | React Query + Zustand UI |
| `discoveryStore` | 🔄 Migrate | React Query + Zustand UI |
| `gamificationStore` | 🔄 Migrate | React Query + Zustand UI |
| `missionStore` | 🔄 Migrate | React Query + Zustand UI |
| `momentumStore` | 🔄 Migrate | React Query + Zustand UI |
| `rewardsStore` | 🔄 Migrate | React Query + Zustand UI |
| `skillsStore` | 🔄 Migrate | React Query + Zustand UI |
| `statsStore` | 🔄 Migrate | React Query (computed) |

---

## 8. Cross-Module Integration

### 8.1 Event Bus Architecture

**Event Bus Implementation:**
```typescript
// /src/lib/eventBus.ts
type EventCallback = (data: any) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      this.events.set(event, callbacks.filter(cb => cb !== callback));
    }
  }

  emit(event: string, data: any) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}

export const eventBus = new EventBus();
```

**Event Types:**
```typescript
// /src/types/events.ts
export type AppEvent =
  | { type: 'workout.completed'; data: { workoutId: string; xp: number } }
  | { type: 'task.completed'; data: { taskId: string; xp: number } }
  | { type: 'journal.created'; data: { entryId: string; xp: number } }
  | { type: 'note.created'; data: { noteId: string; xp: number } }
  | { type: 'mission.completed'; data: { missionId: string; rewards: Rewards } }
  | { type: 'level.up'; data: { oldLevel: number; newLevel: number } }
  | { type: 'discovery.unlocked'; data: { discoveryId: string } };
```

**Usage Example:**
```typescript
// In Health module
async function completeWorkout(workoutId: string) {
  const { data } = await supabase
    .from('health_workouts')
    .update({ completed: true })
    .eq('id', workoutId);

  // Emit event
  eventBus.emit('workout.completed', {
    workoutId,
    xp: 50,
    userId: user.id
  });
}

// In Dashboard module
useEffect(() => {
  const handler = (data: any) => {
    // Update timeline
    queryClient.invalidateQueries(['timeline']);

    // Show notification
    toast.success(`Workout completed! +${data.xp} XP`);
  };

  eventBus.on('workout.completed', handler);
  return () => eventBus.off('workout.completed', handler);
}, []);
```

### 8.2 Timeline Aggregation

**Edge Function for Timeline:**
```typescript
// /supabase/functions/timeline-aggregate/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { startDate, endDate, modules } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get user from JWT
  const authHeader = req.headers.get('Authorization')!;
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

  // Fetch timeline events
  let query = supabase
    .from('timeline_events')
    .select('*')
    .eq('user_id', user.id)
    .gte('event_timestamp', startDate)
    .lte('event_timestamp', endDate)
    .order('event_timestamp', { ascending: false });

  if (modules && modules.length > 0) {
    query = query.in('module_id', modules);
  }

  const { data: events, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  // Aggregate stats
  const stats = {
    totalEvents: events.length,
    totalXp: events.reduce((sum, e) => sum + (e.xp_earned || 0), 0),
    totalCredits: events.reduce((sum, e) => sum + (e.credits_earned || 0), 0),
    byModule: events.reduce((acc, e) => {
      if (!acc[e.module_id]) acc[e.module_id] = 0;
      acc[e.module_id]++;
      return acc;
    }, {} as Record<string, number>),
    byType: events.reduce((acc, e) => {
      if (!acc[e.event_type]) acc[e.event_type] = 0;
      acc[e.event_type]++;
      return acc;
    }, {} as Record<string, number>)
  };

  return new Response(JSON.stringify({ events, stats }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## 9. Module-Specific Implementations

### 9.1 Dashboard Module

**Key Features:**
- Aggregated KPIs from all modules
- Timeline view
- Consistency heatmap
- Quick actions

**Implementation:**
```typescript
// /src/modules/dashboard/api/useDashboardStats.ts
export function useDashboardStats(period: 'week' | 'month' | 'year') {
  return useQuery({
    queryKey: ['dashboard-stats', period],
    queryFn: async () => {
      const startDate = getStartDate(period);
      const endDate = new Date();

      // Fetch timeline summary
      const { data } = await supabase.functions.invoke('timeline-aggregate', {
        body: { startDate, endDate }
      });

      return data;
    },
    staleTime: 60000 // 1 minute
  });
}
```

### 9.2 Productivity Module

**React Query Hooks:**
```typescript
// Sessions
export function useSessions(date: Date) { /* ... */ }
export function useCreateSession() { /* ... */ }
export function useUpdateSession() { /* ... */ }

// Projects
export function useProjects() { /* ... */ }
export function useCreateProject() { /* ... */ }

// Tasks
export function useTasks(filters: TaskFilters) { /* ... */ }
export function useCreateTask() { /* ... */ }
export function useUpdateTask() { /* ... */ }
export function useCompleteTask() { /* ... */ }
```

### 9.3 Health Module

**Integration with External APIs:**
```typescript
// Apple Health sync
export async function syncAppleHealth() {
  const { data: workouts } = await fetchAppleHealthWorkouts();

  for (const workout of workouts) {
    await supabase.from('health_workouts').upsert({
      user_id: user.id,
      external_id: workout.id,
      workout_type: mapWorkoutType(workout.type),
      duration_minutes: workout.duration / 60,
      calories_burned: workout.calories,
      workout_date: workout.startDate
    });
  }
}
```

### 9.4 Knowledge Module

**Bidirectional Linking:**
```typescript
// Parse [[wikilinks]] in note content
export function parseWikiLinks(content: string): string[] {
  const regex = /\[\[([^\]]+)\]\]/g;
  const matches = content.matchAll(regex);
  return Array.from(matches, m => m[1]);
}

// Create links when saving note
export async function saveNoteWithLinks(note: Note) {
  // Save note
  const { data: savedNote } = await supabase
    .from('knowledge_notes')
    .upsert(note)
    .select()
    .single();

  // Extract links
  const linkedTitles = parseWikiLinks(note.content);

  // Find target notes by title
  const { data: targetNotes } = await supabase
    .from('knowledge_notes')
    .select('id')
    .in('title', linkedTitles);

  // Create link records
  for (const target of targetNotes) {
    await supabase.from('knowledge_links').upsert({
      user_id: user.id,
      source_note_id: savedNote.id,
      target_note_id: target.id
    });
  }
}
```

**Graph Visualization Query:**
```sql
-- Get all notes and their connections
SELECT
  n1.id as source_id,
  n1.title as source_title,
  n2.id as target_id,
  n2.title as target_title
FROM knowledge_links l
JOIN knowledge_notes n1 ON l.source_note_id = n1.id
JOIN knowledge_notes n2 ON l.target_note_id = n2.id
WHERE l.user_id = auth.uid();
```

---

## 10. Testing Strategy

### 10.1 Testing Pyramid

```
         E2E Tests (5%)
       ┌───────────────┐
      │   Playwright    │
     └─────────────────┘

    Integration Tests (15%)
  ┌─────────────────────────┐
 │  Vitest + Supabase Test │
└───────────────────────────┘

      Unit Tests (80%)
┌─────────────────────────────────┐
│ Vitest + React Testing Library │
└─────────────────────────────────┘
```

### 10.2 Unit Tests Example

```typescript
// /src/modules/missions/api/useMissions.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMissions } from './useMissions';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useMissions', () => {
  it('fetches missions successfully', async () => {
    const { result } = renderHook(() => useMissions(), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(20);
    expect(result.current.data[0]).toHaveProperty('title');
  });
});
```

### 10.3 Integration Tests

```typescript
// /tests/integration/missions.test.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_TEST_URL!,
  process.env.SUPABASE_TEST_ANON_KEY!
);

describe('Mission Completion Flow', () => {
  let userId: string;

  beforeAll(async () => {
    // Create test user
    const { data } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123'
    });
    userId = data.user!.id;
  });

  it('completes mission and awards XP', async () => {
    // Create user mission
    const { data: userMission } = await supabase
      .from('user_missions')
      .insert({
        user_id: userId,
        mission_id: 'test-mission-id',
        status: 'active'
      })
      .select()
      .single();

    // Complete mission
    await supabase.rpc('complete_mission', {
      p_mission_id: userMission.id
    });

    // Verify XP awarded
    const { data: currency } = await supabase
      .from('user_cosmic_currency')
      .select('cosmic_credits')
      .eq('user_id', userId)
      .single();

    expect(currency.cosmic_credits).toBeGreaterThan(0);
  });
});
```

### 10.4 E2E Tests

```typescript
// /e2e/missions.spec.ts
import { test, expect } from '@playwright/test';

test('user can complete a mission', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to missions
  await page.goto('/missions');

  // Click on a mission
  await page.click('text=Daily Journal Entry');

  // Complete mission
  await page.click('button:has-text("Mark Complete")');

  // Verify success message
  await expect(page.locator('text=Mission completed!')).toBeVisible();

  // Verify XP awarded
  await expect(page.locator('text=+50 XP')).toBeVisible();
});
```

---

## 11. Performance Optimization

### 11.1 Database Query Optimization

**EXPLAIN ANALYZE for Slow Queries:**
```sql
EXPLAIN ANALYZE
SELECT * FROM timeline_events
WHERE user_id = '123'
  AND event_timestamp > now() - interval '30 days'
ORDER BY event_timestamp DESC
LIMIT 50;
```

**Materialized View for Dashboard Stats:**
```sql
CREATE MATERIALIZED VIEW user_dashboard_stats AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE module_id = 'productivity') as productivity_count,
  COUNT(*) FILTER (WHERE module_id = 'health') as health_count,
  COUNT(*) FILTER (WHERE module_id = 'journal') as journal_count,
  SUM(xp_earned) as total_xp_last_30_days,
  MAX(event_timestamp) as last_activity
FROM timeline_events
WHERE event_timestamp > now() - interval '30 days'
GROUP BY user_id;

-- Refresh daily
CREATE INDEX ON user_dashboard_stats (user_id);
REFRESH MATERIALIZED VIEW CONCURRENTLY user_dashboard_stats;
```

### 11.2 Frontend Optimization

**Code Splitting:**
```typescript
// Lazy load heavy modules
const KnowledgeModule = lazy(() => import('./modules/knowledge'));
const CalendarModule = lazy(() => import('./modules/calendar'));
```

**React Query Prefetching:**
```typescript
// Prefetch likely next page
queryClient.prefetchQuery({
  queryKey: ['tasks', { page: currentPage + 1 }],
  queryFn: () => fetchTasks({ page: currentPage + 1 })
});
```

**Virtual Scrolling for Long Lists:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function NotesList() {
  const parentRef = useRef<HTMLDivElement>(null);
  const { data: notes } = useNotes();

  const virtualizer = useVirtualizer({
    count: notes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(item => (
          <div key={item.key} style={{ transform: `translateY(${item.start}px)` }}>
            <NoteCard note={notes[item.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 12. Deployment & DevOps

### 12.1 Self-Hosting Supabase

**Docker Compose:**
```yaml
# /docker-compose.yml
version: '3.8'
services:
  postgres:
    image: supabase/postgres:15.1.0.54
    ports:
      - 5432:5432
    environment:
      POSTGRES_PASSWORD: your-super-secret-password
    volumes:
      - ./volumes/db/data:/var/lib/postgresql/data

  auth:
    image: supabase/gotrue:v2.45.0
    environment:
      GOTRUE_JWT_SECRET: your-jwt-secret
      GOTRUE_DB_DRIVER: postgres
      DATABASE_URL: postgres://postgres:password@postgres:5432/postgres
    depends_on:
      - postgres

  rest:
    image: postgrest/postgrest:v10.1.1
    environment:
      PGRST_DB_URI: postgres://postgres:password@postgres:5432/postgres
      PGRST_JWT_SECRET: your-jwt-secret
    depends_on:
      - postgres

  realtime:
    image: supabase/realtime:v2.8.0
    environment:
      DB_HOST: postgres
      DB_NAME: postgres
      DB_USER: postgres
      DB_PASSWORD: password
      JWT_SECRET: your-jwt-secret
    depends_on:
      - postgres
```

### 12.2 CI/CD Pipeline

**GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - uses: supabase/setup-cli@v1
      - run: supabase db push
      - run: supabase functions deploy
      - uses: cloudflare/wrangler-action@2.0.0
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          command: pages publish dist
```

---

## 13. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Week 1: Authentication & User Management**
- [ ] Implement Supabase Auth signup/login
- [ ] Create user profile table and RLS policies
- [ ] Build Auth UI components
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Test auth flow end-to-end

**Week 2: Database Setup**
- [ ] Create all module tables (Productivity, Health, etc.)
- [ ] Write RLS policies for all tables
- [ ] Create database functions (complete_mission, etc.)
- [ ] Set up triggers (updated_at, XP awarding)
- [ ] Add indexes for performance

**Week 3: React Query Integration**
- [ ] Install @tanstack/react-query
- [ ] Migrate first store (missionStore) to React Query
- [ ] Set up real-time subscriptions
- [ ] Test optimistic updates
- [ ] Create reusable query hooks

**Week 4: Timeline & Events**
- [ ] Build timeline_events table
- [ ] Implement event bus for cross-module communication
- [ ] Create timeline aggregation Edge Function
- [ ] Build Timeline UI component
- [ ] Test cross-module event flow

### Phase 2: Core Modules (Weeks 5-8)

**Week 5: Productivity Module**
- [ ] Migrate productivity stores to React Query
- [ ] Implement sessions CRUD
- [ ] Implement projects CRUD
- [ ] Implement tasks CRUD with drag-drop
- [ ] Add income tracking

**Week 6: Health Module**
- [ ] Migrate health stores to React Query
- [ ] Implement workouts logging
- [ ] Implement nutrition logging (FatSecret integration)
- [ ] Implement sleep tracking
- [ ] Implement recovery tracking

**Week 7: Knowledge Module**
- [ ] Migrate knowledge stores to React Query
- [ ] Implement notes CRUD with full-text search
- [ ] Build bidirectional linking engine
- [ ] Create graph visualization
- [ ] Add media library

**Week 8: Journal Module**
- [ ] Migrate journal stores to React Query
- [ ] Implement daily entries CRUD
- [ ] Add client-side encryption for entries
- [ ] Build calendar heatmap
- [ ] Add mood tracking charts

### Phase 3: Advanced Features (Weeks 9-12)

**Week 9: Calendar & Skills**
- [ ] Implement calendar events CRUD
- [ ] Add time blocking functionality
- [ ] Sync with Google Calendar
- [ ] Implement skills CRUD
- [ ] Add practice logging

**Week 10: Financial Module**
- [ ] Implement accounts CRUD
- [ ] Implement transactions CRUD
- [ ] Integrate Plaid for bank sync
- [ ] Build budget tracking
- [ ] Add net worth snapshots

**Week 11: Gamification Polish**
- [ ] Ensure all XP awarding works
- [ ] Test mission completion flow
- [ ] Implement discovery unlocking
- [ ] Build rewards marketplace
- [ ] Add momentum chain logic

**Week 12: Analytics & Insights**
- [ ] Build correlation analysis Edge Function
- [ ] Create dashboard KPI widgets
- [ ] Implement trend detection
- [ ] Add AI insights (Claude API)
- [ ] Build weekly/monthly reports

### Phase 4: Production Ready (Weeks 13-16)

**Week 13: Testing**
- [ ] Write unit tests (80% coverage target)
- [ ] Write integration tests
- [ ] Write E2E tests for critical flows
- [ ] Load testing with k6
- [ ] Security audit

**Week 14: Performance & Security**
- [ ] Database query optimization
- [ ] Add caching layer (React Query + service worker)
- [ ] Implement rate limiting
- [ ] Add 2FA support
- [ ] Audit logging

**Week 15: Mobile & Offline**
- [ ] Build native mobile apps with Capacitor
- [ ] Implement offline mode with IndexedDB
- [ ] Add background sync
- [ ] Test on iOS and Android
- [ ] Submit to app stores

**Week 16: Launch Prep**
- [ ] Data export/import functionality
- [ ] Self-hosting documentation
- [ ] User onboarding flow
- [ ] Help documentation
- [ ] Beta testing with users

---

## 14. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Supabase vendor lock-in** | Medium | High | All data exportable, self-hosting available |
| **Data loss** | Low | Critical | Automated backups every 6 hours, point-in-time recovery |
| **Security breach** | Medium | Critical | RLS policies, encryption, 2FA, regular audits |
| **Performance degradation** | Medium | High | Indexes, materialized views, caching, query optimization |
| **Third-party API failures** | High | Medium | Graceful degradation, local caching, retry logic |
| **Migration bugs** | High | Medium | Staging environment, rollback procedures, comprehensive testing |
| **Scope creep** | High | Medium | Strict phase boundaries, MVP-first approach |

---

## 15. References

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [React Query Guide](https://tanstack.com/query/latest/docs/react/overview)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Database Indexing Strategies](https://use-the-index-luke.com/)

### Case Studies
- [How Notion handles offline-first](https://www.notion.so/blog/how-notion-built-a-database)
- [Obsidian's local-first architecture](https://obsidian.md/blog/scaling-obsidian/)

---

**Document Status:** Ready for Implementation
**Next Steps:** Begin Phase 1, Week 1 - Authentication & User Management
