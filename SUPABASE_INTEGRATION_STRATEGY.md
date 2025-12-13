# LifeOS Supabase Integration Strategy

## Executive Summary

This document outlines the comprehensive strategy for connecting the LifeOS React frontend to the existing Supabase backend. The analysis covers all 14 frontend Zustand stores and maps them to the 47 existing Supabase tables, identifying gaps and providing implementation patterns.

**Key Findings:**
- 47 Supabase tables already exist with proper RLS structure
- 14 frontend Zustand stores with localStorage persistence
- ~85% schema alignment - most features have backend support
- 6 new tables needed for complete coverage
- Frontend uses optimistic updates pattern - ideal for Supabase

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Store Analysis](#frontend-store-analysis)
3. [Backend Schema Summary](#backend-schema-summary)
4. [Module-by-Module Mapping](#module-by-module-mapping)
5. [Gap Analysis](#gap-analysis)
6. [Implementation Strategy](#implementation-strategy)
7. [Migration Plan](#migration-plan)
8. [Code Patterns](#code-patterns)

---

## Architecture Overview

### Current Frontend Architecture
```
React App
    └── Zustand Stores (14 stores)
        └── persist middleware → localStorage
        └── Cross-store integration (avatarStore.addXP called from other stores)
```

### Target Architecture
```
React App
    └── Zustand Stores (14 stores)
        └── Supabase Client (realtime subscriptions)
        └── Local cache (TanStack Query or custom)
        └── Optimistic updates → Supabase sync
        └── persist middleware → localStorage (offline fallback)
```

### Supabase Project Details
- **Project ID:** `pynijtaxxcrdheyzoawv`
- **Project Name:** Onyx
- **Region:** US East 1
- **Tables:** 47 tables with RLS enabled

---

## Frontend Store Analysis

### 1. avatarStore.js
**Purpose:** Character progression, XP, equipment, transmog, prestige system

**State Structure:**
```javascript
{
  level: number,
  xp: number,
  currentTier: number,
  prestige: number,
  totalLevelsEarned: number,
  totalXPEarned: number,
  characterGender: 'male' | 'female',
  equipped: { helmet, suit, backpack, tool, badge },
  cosmetic: { helmet, suit, backpack, tool, badge },  // Transmog
  dyes: { helmet, suit, backpack, tool, badge },
  unlockedEquipment: string[],
  stats: { defense, strength, vitality, intelligence, wisdom },
  moduleProgress: { productivity, fitness, knowledge, financial, journal, calendar, skills, cross }
}
```

**Backend Tables:** `user_profiles`, `user_stats`, `user_equipment`, `equipment_items`, `user_module_progress`

---

### 2. healthStore.js
**Purpose:** Nutrition tracking, meals, water intake, recipes, meal planning, supplements

**State Structure:**
```javascript
{
  dailyGoals: { calories, protein, carbs, fat, fiber },
  micronutrientGoals: { sodium, potassium, calcium, ... },
  meals: [{ id, timestamp, totalCalories, totalProtein, ... }],
  recipes: [{ id, name, ingredients, instructions, nutrition }],
  mealPlans: { [weekKey]: { monday: { breakfast, lunch, dinner }, ... } },
  groceryItems: [{ id, name, quantity, unit, category, checked }],
  supplements: [{ id, name, dosage, timing }],
  supplementStacks: [{ id, name, supplementIds }],
  supplementLog: { [date]: { [supplementId]: { taken, time } } },
  waterIntake: { [date]: { amount, goal } },
  waterGoalMl: number,
  waterUnit: 'ml' | 'oz' | 'glasses' | 'bottles'
}
```

**Backend Tables:** `health_nutrition_logs`, `health_sleep_logs`, `health_recovery_logs`

**GAPS:** Need tables for recipes, meal_plans, grocery_items, supplements

---

### 3. workoutStore.js
**Purpose:** Weight training, cardio, exercises, personal records, templates

**State Structure:**
```javascript
{
  workouts: [{ id, date, type, exercises, duration, notes }],
  exercises: [{ id, name, sets: [{ weight, reps }], notes }],
  cardioWorkouts: [{ id, date, type, distance, duration, pace, calories }],
  personalRecords: { [exerciseName]: { weight, reps, date } },
  customTemplates: [{ id, name, exercises }],
  userWeight: number
}
```

**Backend Tables:** `health_workouts`, `health_exercises`

**GAPS:** Need `workout_templates`, `personal_records` tables

---

### 4. financialStore.js
**Purpose:** Transactions, budgets, savings goals, accounts, envelope budgeting, sinking funds

**State Structure:**
```javascript
{
  transactions: [{ id, date, amount, type, category, merchant, account }],
  budgets: [{ id, category, limit, spent, period }],
  savingsGoals: [{ id, name, target, current, deadline, contributions, milestones }],
  accounts: [{ id, name, type, balance, institution }],
  envelopeBudgets: { [monthKey]: { [categoryId]: amount } },
  monthlyIncomeTarget: number,
  sinkingFunds: [{ id, name, targetAmount, currentAmount, monthlyContribution }]
}
```

**Backend Tables:** `financial_transactions`, `financial_accounts`, `financial_goals`, `financial_net_worth_snapshots`

**GAPS:** Need `financial_budgets`, `financial_envelope_budgets`, `financial_sinking_funds` tables

---

### 5. skillsStore.js
**Purpose:** Skill tracking, practice sessions, XP, goals, milestones

**State Structure:**
```javascript
{
  skills: [{
    id, name, category, xp, totalMinutes, description, icon,
    sessions: [{ id, date, minutes, notes, xpEarned }],
    goals: [{ id, text, completed }],
    milestones: string[]
  }]
}
```

**Backend Tables:** `skills`, `skill_practice_logs`

**Alignment:** ✅ Excellent - backend schema matches frontend needs

---

### 6. achievementsStore.js
**Purpose:** Achievement tracking, badges, progress, stats across all modules

**State Structure:**
```javascript
{
  unlockedAchievements: [{ achievementId, unlockedAt, xpEarned, creditsEarned }],
  achievementProgress: { [achievementId]: currentProgress },
  totalXPFromAchievements: number,
  totalCreditsFromAchievements: number,
  stats: {
    questsCompleted, streakDays, deepWorkHours, tasksCompleted,
    workouts, booksCompleted, journalEntries, savingsGoalsCompleted,
    prsAchieved, caloriesBurned, totalVolume, cardioMiles, ...
  }
}
```

**Backend Tables:** `discoveries`, `user_discoveries`, `achievement_progress`

**Alignment:** ✅ Good - backend uses "discoveries" terminology but same concept

---

### 7. petStore.js
**Purpose:** Mythological companion pets, bonuses, collection system

**State Structure:**
```javascript
{
  ownedPets: string[],  // Pet IDs
  activePets: string[], // Currently equipped pets (max 6)
  maxSlots: number
}
// PET_DATABASE contains 15 pets across 5 tiers with bonuses
```

**Backend Tables:** ❌ None exist

**GAPS:** Need `pets` (definitions) and `user_pets` tables

---

### 8. questsStore.js
**Purpose:** Complex quest system with dailies, weeklies, chains, boss battles

**State Structure:**
```javascript
{
  dailyQuests: [{ id, completed, progress }],
  weeklyQuests: [{ id, progress, completed }],
  monthlyQuests: [{ id, progress, completed }],
  activeQuestChains: [{ id, currentStep, completed }],
  completedQuestChains: string[],
  activeBossBattle: { id, currentPhase, health },
  completedBossBattles: string[],
  questStats: { totalCompleted, chainsCompleted, bossesDefeated, ... }
}
```

**Backend Tables:** `missions`, `user_missions`

**Alignment:** ⚠️ Partial - backend has basic missions, frontend has more complex system

---

### 9. calendarStore.js
**Purpose:** Time blocking, events, templates, weekly plans

**State Structure:**
```javascript
{
  timeBlocks: [{
    id, title, date, startTime, endTime, plannedDuration, actualDuration,
    module, type, status, priority, energyLevel, actualEnergyLevel,
    notes, taskId, projectId, tags, interruptions
  }],
  events: [{ id, title, start, end, allDay, recurring, color }],
  templates: [{ id, name, blocks }],
  weeklyPlan: { [dayOfWeek]: [blockIds] }
}
```

**Backend Tables:** `calendar_events`, `calendar_time_blocks`

**Alignment:** ✅ Good - minor field name differences

---

### 10. knowledgeStore.js
**Purpose:** Notes, books, media tracking, tags, collections, linking

**State Structure:**
```javascript
{
  notes: [{ id, title, content, tags, linkedTo, linkedFrom, folder, pinned }],
  books: [{ id, title, author, status, progress, rating, notes, highlights }],
  media: [{ id, type, title, url, status, progress, notes }],
  tags: string[],
  collections: [{ id, name, noteIds }],
  projects: [{ id, name, description, noteIds }]
}
```

**Backend Tables:** `knowledge_notes`, `knowledge_links`, `knowledge_media`

**GAPS:** Need `knowledge_collections` table

---

### 11. resolutionStore.js
**Purpose:** New Year's resolutions, check-ins, milestones, achievements

**State Structure:**
```javascript
{
  resolutions: [{
    id, title, category, status, currentStreak, longestStreak,
    totalCheckIns, lastCheckIn, milestones, checkInNotes
  }],
  checkIns: { [date]: [resolutionIds] },
  achievements: string[],
  resolutionXP: number,
  activeYear: number
}
```

**Backend Tables:** ❌ None exist

**GAPS:** Need `resolutions`, `resolution_checkins` tables

---

### 12. dashboardStore.js
**Purpose:** Widget visibility, layouts, presets (UI state only)

**State Structure:**
```javascript
{
  widgetVisibility: { [widgetId]: boolean },
  layouts: { lg: [], md: [], sm: [] },
  currentPreset: string,
  isEditMode: boolean
}
```

**Backend Tables:** Can use `user_profiles.preferences` JSONB field

**Note:** This is mostly UI state - can remain localStorage only or sync to preferences

---

### 13. journalStore.js (referenced in components)
**Purpose:** Journal entries, mood tracking, prompts

**Backend Tables:** `journal_entries`, `journal_prompts`

**Alignment:** ✅ Excellent match

---

### 14. productivityStore.js (referenced in components)
**Purpose:** Projects, tasks, sessions, income tracking

**Backend Tables:** `productivity_projects`, `productivity_tasks`, `productivity_sessions`, `productivity_income`

**Alignment:** ✅ Excellent match

---

## Backend Schema Summary

### Existing Tables (47)

#### User & Auth
| Table | Purpose | RLS |
|-------|---------|-----|
| `user_profiles` | User info, level, XP, preferences | ✅ |
| `user_stats` | Character stats with multiple sources | ✅ |
| `user_cosmic_currency` | Credits balance and lifetime tracking | ✅ |

#### Gamification Core
| Table | Purpose | RLS |
|-------|---------|-----|
| `user_module_progress` | XP/level per module | ✅ |
| `gamification_events` | Event log for all XP/credit awards | ✅ |
| `stat_history` | Historical stat changes | ✅ |
| `timeline_events` | Cross-module activity timeline | ✅ |

#### Achievements & Discoveries
| Table | Purpose | RLS |
|-------|---------|-----|
| `discoveries` | Achievement definitions | ✅ |
| `user_discoveries` | User's unlocked achievements | ✅ |
| `achievement_progress` | Progress toward achievements | ✅ |

#### Equipment & Perks
| Table | Purpose | RLS |
|-------|---------|-----|
| `equipment_items` | Equipment definitions | ✅ |
| `user_equipment` | User's owned/equipped items | ✅ |
| `perks` | Perk tree definitions | ✅ |
| `user_perks` | User's unlocked perks | ✅ |

#### Constellations
| Table | Purpose | RLS |
|-------|---------|-----|
| `constellation_stars` | Star definitions | ✅ |
| `user_constellation_progress` | User's progress per constellation | ✅ |

#### Missions & Streaks
| Table | Purpose | RLS |
|-------|---------|-----|
| `missions` | Mission definitions | ✅ |
| `user_missions` | User's mission progress | ✅ |
| `momentum_chains` | Streak tracking | ✅ |
| `momentum_events` | Streak event log | ✅ |

#### Rewards
| Table | Purpose | RLS |
|-------|---------|-----|
| `rewards` | User-defined rewards | ✅ |
| `reward_redemptions` | Redemption history | ✅ |
| `currency_transactions` | Credit transaction log | ✅ |

#### Productivity
| Table | Purpose | RLS |
|-------|---------|-----|
| `productivity_projects` | Projects | ✅ |
| `productivity_tasks` | Tasks with subtask support | ✅ |
| `productivity_sessions` | Deep work sessions | ✅ |
| `productivity_income` | Income tracking | ✅ |

#### Financial
| Table | Purpose | RLS |
|-------|---------|-----|
| `financial_accounts` | Bank accounts | ✅ |
| `financial_transactions` | All transactions | ✅ |
| `financial_goals` | Savings goals | ✅ |
| `financial_net_worth_snapshots` | Net worth history | ✅ |

#### Health
| Table | Purpose | RLS |
|-------|---------|-----|
| `health_workouts` | Workout sessions | ✅ |
| `health_exercises` | Exercises within workouts | ✅ |
| `health_nutrition_logs` | Meal logging | ✅ |
| `health_sleep_logs` | Sleep tracking | ✅ |
| `health_recovery_logs` | Recovery metrics | ✅ |

#### Knowledge
| Table | Purpose | RLS |
|-------|---------|-----|
| `knowledge_notes` | Notes with full-text search | ✅ |
| `knowledge_links` | Bi-directional note links | ✅ |
| `knowledge_media` | Books, podcasts, courses | ✅ |

#### Journal
| Table | Purpose | RLS |
|-------|---------|-----|
| `journal_entries` | Daily entries | ✅ |
| `journal_prompts` | System and user prompts | ✅ |

#### Calendar
| Table | Purpose | RLS |
|-------|---------|-----|
| `calendar_events` | Calendar events | ✅ |
| `calendar_time_blocks` | Time blocking | ✅ |

#### Skills
| Table | Purpose | RLS |
|-------|---------|-----|
| `skills` | User's skills | ✅ |
| `skill_practice_logs` | Practice sessions | ✅ |

---

## Gap Analysis

### Tables Needed (New)

#### 1. `pets` - Pet Definitions
```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id TEXT UNIQUE NOT NULL,  -- 'common_kitsune_pup', etc.
  name TEXT NOT NULL,
  tier TEXT NOT NULL,  -- common, uncommon, rare, epic, mythic
  culture TEXT,
  sprite_path TEXT,
  description TEXT,
  lore TEXT,
  bonus_type TEXT NOT NULL,
  bonus_amount INTEGER DEFAULT 0,
  bonus_description TEXT,
  unlock_method TEXT,
  unlock_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. `user_pets` - User's Pet Collection
```sql
CREATE TABLE user_pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id TEXT REFERENCES pets(pet_id),
  is_active BOOLEAN DEFAULT false,
  slot_position INTEGER,  -- 1-6 for active pets
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, pet_id)
);
```

#### 3. `health_recipes` - Recipe Library
```sql
CREATE TABLE health_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,  -- breakfast, lunch, dinner, snack
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 1,
  ingredients JSONB NOT NULL,  -- [{ name, quantity, unit, category }]
  instructions JSONB,  -- [{ step, text }]
  nutrition_per_serving JSONB,  -- { calories, protein, carbs, fat, ... }
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 4. `health_meal_plans` - Weekly Meal Planning
```sql
CREATE TABLE health_meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,  -- Monday of the week
  day_of_week INTEGER NOT NULL,  -- 0-6 (Monday-Sunday)
  meal_type TEXT NOT NULL,  -- breakfast, lunch, dinner, snack
  recipe_id UUID REFERENCES health_recipes(id) ON DELETE SET NULL,
  custom_meal_name TEXT,  -- If not using a recipe
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start_date, day_of_week, meal_type)
);
```

#### 5. `health_supplements` - Supplement Library
```sql
CREATE TABLE health_supplements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,  -- vitamin-d, iron, protein, etc.
  dosage TEXT,
  unit TEXT,
  timing TEXT,  -- morning, evening, with-food, etc.
  frequency TEXT DEFAULT 'daily',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE health_supplement_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID REFERENCES health_supplements(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  taken BOOLEAN DEFAULT false,
  taken_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(user_id, supplement_id, log_date)
);
```

#### 6. `resolutions` - New Year's Resolutions
```sql
CREATE TABLE resolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,  -- health, career, learning, financial, etc.
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'active',  -- active, completed, abandoned
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_check_ins INTEGER DEFAULT 0,
  frequency TEXT DEFAULT 'daily',  -- daily, weekly
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE resolution_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resolution_id UUID REFERENCES resolutions(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, resolution_id, check_in_date)
);
```

### Schema Modifications Needed

#### 1. `financial_goals` - Add Contribution Tracking
```sql
ALTER TABLE financial_goals ADD COLUMN contributions JSONB DEFAULT '[]';
ALTER TABLE financial_goals ADD COLUMN milestones_reached JSONB DEFAULT '[]';
ALTER TABLE financial_goals ADD COLUMN contribution_streak INTEGER DEFAULT 0;
ALTER TABLE financial_goals ADD COLUMN last_contribution_date DATE;
```

#### 2. `health_workouts` - Add Template Support
```sql
ALTER TABLE health_workouts ADD COLUMN template_id UUID;
ALTER TABLE health_workouts ADD COLUMN is_template BOOLEAN DEFAULT false;
```

#### 3. `knowledge_notes` - Add Collections Support
```sql
CREATE TABLE knowledge_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  note_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Implementation Strategy

### Phase 1: Core Infrastructure (Week 1)

1. **Set up Supabase client**
   ```typescript
   // src/lib/supabase.ts
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY
   );
   ```

2. **Create custom hooks for data fetching**
   ```typescript
   // src/hooks/useSupabaseQuery.ts
   export function useSupabaseQuery<T>(
     key: string,
     queryFn: () => Promise<T>,
     options?: QueryOptions
   ) {
     // Implement with TanStack Query or custom solution
   }
   ```

3. **Implement authentication flow**
   - Email/password signup
   - Session persistence
   - Protected routes

### Phase 2: Module Integration (Weeks 2-4)

**Priority Order:**
1. User Profile & Avatar (foundation)
2. Productivity (most used)
3. Health & Fitness
4. Financial
5. Skills
6. Knowledge
7. Journal
8. Calendar
9. Gamification (achievements, quests, pets)

### Phase 3: Real-time & Offline (Weeks 5-6)

1. **Real-time subscriptions**
   ```typescript
   supabase
     .channel('user_progress')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'user_module_progress',
       filter: `user_id=eq.${userId}`
     }, handleChange)
     .subscribe();
   ```

2. **Offline support**
   - Keep localStorage as fallback
   - Queue operations when offline
   - Sync on reconnect

---

## Code Patterns

### Pattern 1: Hybrid Store (Supabase + Local)

```typescript
// src/stores/skillsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface SkillsState {
  skills: Skill[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSkills: () => Promise<void>;
  addSkill: (skill: Partial<Skill>) => Promise<void>;
  logPractice: (skillId: string, minutes: number, notes?: string) => Promise<void>;
}

export const useSkillsStore = create<SkillsState>()(
  persist(
    (set, get) => ({
      skills: [],
      isLoading: false,
      error: null,

      fetchSkills: async () => {
        set({ isLoading: true, error: null });

        const { data, error } = await supabase
          .from('skills')
          .select(`
            *,
            skill_practice_logs (*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          set({ error: error.message, isLoading: false });
          return;
        }

        set({ skills: data, isLoading: false });
      },

      addSkill: async (skillData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const newSkill = {
          id: tempId,
          user_id: user.id,
          xp: 0,
          total_practice_hours: 0,
          ...skillData,
          created_at: new Date().toISOString(),
        };

        set(state => ({
          skills: [newSkill, ...state.skills]
        }));

        // Sync to Supabase
        const { data, error } = await supabase
          .from('skills')
          .insert({
            user_id: user.id,
            name: skillData.name,
            description: skillData.description,
            category: skillData.category,
            icon: skillData.icon,
          })
          .select()
          .single();

        if (error) {
          // Rollback optimistic update
          set(state => ({
            skills: state.skills.filter(s => s.id !== tempId),
            error: error.message
          }));
          return;
        }

        // Replace temp with real data
        set(state => ({
          skills: state.skills.map(s =>
            s.id === tempId ? data : s
          )
        }));
      },

      logPractice: async (skillId, minutes, notes) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const xpEarned = minutes * 2; // XP_PER_MINUTE

        // Optimistic update
        set(state => ({
          skills: state.skills.map(skill => {
            if (skill.id !== skillId) return skill;
            return {
              ...skill,
              xp: skill.xp + xpEarned,
              total_practice_hours: skill.total_practice_hours + (minutes / 60),
            };
          })
        }));

        // Sync to Supabase - both log and skill update
        const [logResult, skillResult] = await Promise.all([
          supabase.from('skill_practice_logs').insert({
            skill_id: skillId,
            user_id: user.id,
            practice_date: new Date().toISOString().split('T')[0],
            duration_minutes: minutes,
            notes,
          }),
          supabase.from('skills')
            .update({
              xp: get().skills.find(s => s.id === skillId)?.xp,
              total_practice_hours: get().skills.find(s => s.id === skillId)?.total_practice_hours,
            })
            .eq('id', skillId)
        ]);

        // Award XP via gamification system
        await supabase.from('gamification_events').insert({
          user_id: user.id,
          event_type: 'skill_practice',
          event_source: 'skills',
          event_data: { skill_id: skillId, minutes, xp_earned: xpEarned },
          xp_awarded: xpEarned,
        });
      },
    }),
    {
      name: 'lifeos-skills-storage',
      // Only persist locally what's needed for offline
      partialize: (state) => ({
        skills: state.skills,
      }),
    }
  )
);
```

### Pattern 2: Gamification Event Handler

```typescript
// src/lib/gamification.ts
import { supabase } from './supabase';

interface GamificationEvent {
  event_type: string;
  event_source: string;
  event_data: Record<string, any>;
  xp_awarded?: number;
  credits_awarded?: number;
  module_xp_awarded?: Record<string, number>;
}

export async function recordGamificationEvent(event: GamificationEvent) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('gamification_events')
    .insert({
      user_id: user.id,
      ...event,
      processed: true,
      processed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to record gamification event:', error);
    return null;
  }

  // Check for achievements that might be unlocked
  await checkAchievements(user.id, event);

  return data;
}

async function checkAchievements(userId: string, event: GamificationEvent) {
  // Query achievements that match the event criteria
  const { data: achievements } = await supabase
    .from('discoveries')
    .select('*')
    .contains('unlock_criteria', { event_type: event.event_type });

  // Check each and unlock if criteria met
  for (const achievement of achievements || []) {
    const isUnlocked = await evaluateUnlockCriteria(userId, achievement.unlock_criteria);
    if (isUnlocked) {
      await supabase.from('user_discoveries').insert({
        user_id: userId,
        discovery_id: achievement.id,
        unlocked_at: new Date().toISOString(),
      });
    }
  }
}
```

### Pattern 3: Real-time Subscription Hook

```typescript
// src/hooks/useRealtimeSubscription.ts
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSubscription(
  table: string,
  userId: string,
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void
) {
  useEffect(() => {
    if (!userId) return;

    const channel: RealtimeChannel = supabase
      .channel(`${table}_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onInsert?.(payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onUpdate?.(payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onDelete?.(payload.old)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, userId, onInsert, onUpdate, onDelete]);
}
```

---

## Migration Plan

### Data Migration Steps

1. **Export localStorage data**
   ```typescript
   function exportLocalData() {
     const stores = [
       'lifeos-skills-storage',
       'lifeos-health',
       'financial-storage',
       'avatar-storage',
       // ... all stores
     ];

     const data = {};
     stores.forEach(key => {
       const stored = localStorage.getItem(key);
       if (stored) data[key] = JSON.parse(stored);
     });

     return data;
   }
   ```

2. **Transform to Supabase schema**
   - Map frontend IDs to UUIDs
   - Normalize nested data into separate tables
   - Convert timestamps to proper format

3. **Bulk insert to Supabase**
   - Use transactions for related data
   - Handle conflicts (upsert where needed)

4. **Verify and cleanup**
   - Compare counts
   - Run integrity checks
   - Clear localStorage after confirmed sync

---

## Summary

### What's Ready Now
- 47 tables with proper RLS
- User auth and profiles
- All productivity tables
- All financial tables
- Health workouts and nutrition
- Skills and practice logs
- Journal and calendar
- Full gamification infrastructure

### What Needs Creation
1. Pet system tables (2 tables)
2. Recipe/meal planning tables (2 tables)
3. Supplement tracking tables (2 tables)
4. Resolution tracking tables (2 tables)
5. Knowledge collections table (1 table)
6. Minor schema modifications

### Recommended Approach
1. Start with authentication
2. Connect avatar/profile store first
3. Add modules one at a time
4. Use optimistic updates throughout
5. Keep localStorage as offline fallback
6. Add real-time last (nice-to-have)

This document should serve as the comprehensive guide for integrating the LifeOS frontend with Supabase backend.
