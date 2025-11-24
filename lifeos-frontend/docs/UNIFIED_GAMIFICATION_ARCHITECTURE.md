# Unified Gamification Architecture

## Executive Summary

This document defines the unified gamification system for LifeOS, consolidating 10 fragmented feature categories into a seamless, interconnected experience. Inspired by Habitica's reward/consequence loops and Duolingo's streak-driven engagement (3.6x retention boost), this architecture transforms isolated systems into a cohesive progression framework.

**Core Philosophy:** Every user action flows through a unified pipeline that simultaneously updates XP, currency, streaks, constellations, and achievements. No feature operates in isolation.

---

## 1. Core Progression Loop

### The Unified Flow

```
User Action (Task/Mission/Journal Entry)
    ↓
[Central Event Pipeline]
    ↓
├─→ XP Award → Level Check → Cosmic Evolution Update
├─→ Currency Reward → Unlock Purchases
├─→ Streak Update → Shield Check → Milestone Rewards
├─→ Constellation Progress → Star Unlock → Discovery Award
├─→ Achievement Check → Rarity-Based Rewards
└─→ Equipment Unlocks → Stats Boost → New Capabilities
```

### Key Principles

1. **Single Source of Truth:** All gamification state lives in Supabase with real-time sync
2. **Immediate Feedback:** Every action triggers visible progress (XP bar, particle effects, sound)
3. **Compound Rewards:** Major actions trigger multiple reward types simultaneously
4. **Consequence System:** Broken streaks, failed missions, and incomplete dailies have penalties (inspired by Habitica HP loss)
5. **Progressive Disclosure:** Features unlock as user levels up (scaffolding method)

---

## 2. Unified Systems Architecture

### 2.1 Primary Progression System: Cosmic Evolution

**Why Primary:** Visual, aspirational, connects to all other systems

**Structure:**
- 40 stages (15 cosmic + 25 alternates)
- Level 1-160+ independent of stages
- XP required per level: `100 * level^1.5`
- Stage transitions at key milestones: 1, 5, 10, 15, 20, 30, 40, 50...

**Integration Points:**
- Missions award XP → Levels → Stage transitions
- Constellations unlock stars → Discovery XP bonuses
- Equipment unlocked by level → Stats boost → Better mission rewards
- Achievements award bonus XP → Faster progression

### 2.2 Engagement Driver: Momentum Chains (Streaks)

**Why Critical:** Duolingo proved streaks = 3.6x long-term retention

**Enhanced Mechanics:**
- **Per-Module Tracking:** Separate streaks for Fitness, Productivity, Knowledge, etc.
- **Global Streak:** Combined momentum across all modules
- **Shield System:** Earn 1 shield per 7-day streak, auto-protects one missed day
- **Milestone Tiers:**
  - Building (7 days): +5% XP bonus
  - Growing (30 days): +10% XP, 1 shield
  - Momentum (90 days): +15% XP, equipment unlock
  - Legendary (365 days): +25% XP, rare discovery, cosmic credit bonus

**Consequence System:**
- Broken streak without shield = -10% XP for 24 hours
- 3 consecutive breaks = temporary "momentum lock" (must rebuild to 3 days)
- Visual indicator: Streak icon changes color when at risk

**Integration:**
- Missions completed → Streak extended
- Journal entries → Streak extended
- Fitness logs → Module streak + Global streak
- Shield purchases available in rewards store

### 2.3 Mission System (Daily/Weekly/Monthly)

**Inspired by:** Habitica's task categories + consequences

**Redesigned Structure:**

**Daily Missions (Habits/Routines):**
- Auto-renew every 24 hours
- Failure consequences:
  - Breaks module streak (if no shield)
  - -10 Cosmic Credits penalty
  - Visual "incomplete task" marker
- Examples: Morning pages, workout, deep work block

**Weekly Missions (Moderate Challenges):**
- 7-day window to complete
- Higher XP rewards (500-1000 XP)
- Failure = no penalty, but no reward
- Examples: Read 3 chapters, complete 5 deep work sessions

**Monthly Missions (Major Goals):**
- 30-day window
- Massive XP rewards (2000-5000 XP)
- Unlock equipment/discoveries
- Examples: Finish book, ship product feature

**Challenge Missions (One-Time Achievements):**
- Permanent, high difficulty
- Unique rewards (rare equipment, avatar unlocks)
- Examples: 100-day streak, Level 50 reached, Master constellation completed

**Integration:**
- Mission complete → XP, credits, streak, achievement check
- Mission failure → Consequences trigger (streak break, credit loss)
- Difficulty-based constellation star unlocks

### 2.4 Constellation System (Skill Mastery Visualization)

**Purpose:** Visual representation of module expertise + long-term progression

**5 Module Constellations:**
1. **Orion (Productivity)** - 15 stars
2. **Phoenix (Fitness)** - 12 stars
3. **Athena (Knowledge)** - 18 stars
4. **Chronos (Time)** - 10 stars
5. **Plutus (Wealth)** - 8 stars

**Star Unlock Mechanics:**
- Each star requires module-specific XP threshold
- Unlocking star → Small XP bonus to cosmic evolution
- Complete constellation → Major discovery unlock + equipment set
- 3D visualization on dashboard

**Integration:**
- Module missions award module XP → Star progress
- Completed constellations unlock perk tree tiers
- Stars required for certain equipment unlocks

### 2.5 Equipment & Avatar System

**Consolidated Approach:** Cosmic evolution is primary avatar, equipment overlays on top

**Equipment Slots:**
- Helmet (defense)
- Chest (vitality)
- Weapon (strength)
- Shield (defense)
- Cape (wisdom)
- Ring x2 (intellect, strength)
- Amulet (vitality)

**Rarity Tiers:**
- Common: Level 5+ (Training gear)
- Uncommon: Level 15+ (Iron gear)
- Rare: Level 30+ (Dragon gear)
- Epic: Level 60+ (Cosmic gear)
- Legendary: Level 100+ (Transcendent gear)

**Set Bonuses:**
- 3-piece: +10% XP gain
- 5-piece: +20% XP, +15% currency
- Full set: Special ability unlock (e.g., "Shield regeneration: +1 shield per 5-day streak")

**Stats System:**
- Defense: Reduces streak break penalties
- Strength: +% mission XP rewards
- Vitality: +% daily mission forgiveness
- Intelligence: +% knowledge module XP
- Wisdom: Unlocks perk tree bonuses

**Integration:**
- Level unlocks equipment tiers
- Constellation completion unlocks sets
- Stats modify reward calculations across all systems

### 2.6 Currency System: Cosmic Credits

**Single Currency:** Simplify from potential multi-currency confusion

**Earning Methods:**
- Mission completion (10-100 credits based on difficulty)
- Streak milestones (50 credits per tier reached)
- Achievements (25-500 credits based on rarity)
- Level ups (20 credits per level)

**Spending Options:**
- Custom rewards (user-defined, 50-500 credits)
- Streak shields (100 credits)
- Equipment cosmetic variants (200-1000 credits)
- Constellation hints (50 credits, reveals next star requirement)
- XP boosts (150 credits, 2x XP for 24 hours)

**Integration:**
- All reward events deposit to single account
- Transaction history with filters by source/category
- Lifetime earned/spent stats on dashboard

### 2.7 Discoveries & Achievements System

**Unified Achievement Framework:**

**5 Rarity Tiers:**
- Common: First actions (first mission, first journal entry)
- Uncommon: Consistency (7-day streak, 10 missions completed)
- Rare: Mastery (30-day streak, constellation completed)
- Epic: Exceptional (100-day streak, level 50)
- Legendary: Transcendent (365-day streak, level 100, all constellations)

**6 Categories:**
- Progression (levels, stages, XP milestones)
- Consistency (streaks, daily completions)
- Mastery (constellations, skill specialization)
- Exploration (module usage, feature discovery)
- Social (future: guild participation, challenges)
- Special (seasonal events, hidden achievements)

**Reward Structure:**
- Common: 50 XP, 25 credits
- Uncommon: 150 XP, 50 credits
- Rare: 500 XP, 150 credits, equipment unlock chance
- Epic: 2000 XP, 500 credits, guaranteed equipment
- Legendary: 5000 XP, 1000 credits, unique avatar variant, set bonus

**Integration:**
- Background achievement scanning on every event
- Push notifications on unlock
- Achievement showcase on profile
- Discovery XP contributes to cosmic evolution

### 2.8 Perk Tree System

**6 Stat Trees:** Body, Mind, Spirit, Wealth, Social, Craft

**4 Tiers per Tree:**
- Tier 1: Unlocked at character creation
- Tier 2: Level 20, constellation progress required
- Tier 3: Level 50, 2 constellations completed
- Tier 4 (Keystones): Level 80, 4 constellations completed

**Perk Effects:**
- +% XP for specific module types
- Unlock new mission difficulties
- Reduce currency costs
- Enhance equipment stats
- Special abilities (double XP days, streak protection)

**Integration:**
- Perks purchased with cosmic credits
- Prerequisites: Level + constellation progress + previous tier perks
- Active perks modify all reward calculations
- Respec option (200 credits)

---

## 3. Database Schema Design

### 3.1 Central Event Table (NEW)

```sql
CREATE TABLE gamification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  event_type TEXT NOT NULL, -- 'mission_complete', 'journal_entry', 'fitness_log', etc.
  event_source TEXT NOT NULL, -- 'missions', 'journal', 'fitness'
  event_data JSONB NOT NULL,

  -- Rewards calculated at event time
  xp_awarded INTEGER DEFAULT 0,
  credits_awarded INTEGER DEFAULT 0,
  streak_updated BOOLEAN DEFAULT false,

  -- Triggers fired
  level_up_triggered BOOLEAN DEFAULT false,
  stage_transition BOOLEAN DEFAULT false,
  achievement_unlocked UUID[], -- Array of achievement IDs

  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_gamification_events_user_id ON gamification_events(user_id);
CREATE INDEX idx_gamification_events_type ON gamification_events(event_type);
CREATE INDEX idx_gamification_events_created ON gamification_events(created_at DESC);
```

### 3.2 Unified User Progress (ENHANCED)

```sql
-- Extend existing user_module_progress table
ALTER TABLE user_module_progress ADD COLUMN IF NOT EXISTS
  current_level INTEGER DEFAULT 1,
  current_stage INTEGER DEFAULT 1,
  total_xp BIGINT DEFAULT 0,
  xp_to_next_level INTEGER,
  stage_name TEXT,

  -- Stats from equipment
  total_defense INTEGER DEFAULT 0,
  total_strength INTEGER DEFAULT 0,
  total_vitality INTEGER DEFAULT 0,
  total_intelligence INTEGER DEFAULT 0,
  total_wisdom INTEGER DEFAULT 0,

  -- Modifiers
  xp_multiplier DECIMAL(3,2) DEFAULT 1.0, -- From streaks/perks
  credit_multiplier DECIMAL(3,2) DEFAULT 1.0,

  last_daily_reset TIMESTAMPTZ,
  last_weekly_reset TIMESTAMPTZ,
  last_monthly_reset TIMESTAMPTZ;
```

### 3.3 Streak System (ENHANCED)

```sql
-- Extend momentum_chains
ALTER TABLE momentum_chains ADD COLUMN IF NOT EXISTS
  shields_available INTEGER DEFAULT 0,
  shields_earned_total INTEGER DEFAULT 0,
  last_shield_earned_at TIMESTAMPTZ,

  milestone_tier TEXT DEFAULT 'none', -- 'building', 'growing', 'momentum', 'legendary'
  tier_reached_at TIMESTAMPTZ,

  broken_count INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  -- Penalties
  xp_penalty_active BOOLEAN DEFAULT false,
  penalty_expires_at TIMESTAMPTZ,
  momentum_locked BOOLEAN DEFAULT false;
```

### 3.4 Equipment System (NEW)

```sql
CREATE TABLE equipment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  slot TEXT NOT NULL, -- 'helmet', 'chest', 'weapon', 'shield', 'cape', 'ring', 'amulet'
  rarity TEXT NOT NULL, -- 'common', 'uncommon', 'rare', 'epic', 'legendary'

  -- Stats
  defense INTEGER DEFAULT 0,
  strength INTEGER DEFAULT 0,
  vitality INTEGER DEFAULT 0,
  intelligence INTEGER DEFAULT 0,
  wisdom INTEGER DEFAULT 0,

  -- Requirements
  required_level INTEGER DEFAULT 1,
  required_constellation UUID, -- Optional constellation completion

  -- Set bonuses
  set_name TEXT,
  set_bonus_description TEXT,

  image_url TEXT,
  unlock_method TEXT -- 'level', 'achievement', 'constellation', 'purchase'
);

CREATE TABLE user_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  equipment_id UUID REFERENCES equipment_items NOT NULL,

  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT false,

  UNIQUE(user_id, equipment_id)
);

CREATE INDEX idx_user_equipment_user ON user_equipment(user_id);
CREATE INDEX idx_user_equipment_equipped ON user_equipment(user_id, is_equipped) WHERE is_equipped = true;
```

### 3.5 Achievements (ENHANCED)

```sql
-- Extend discoveries
ALTER TABLE discoveries ADD COLUMN IF NOT EXISTS
  category TEXT DEFAULT 'exploration', -- 'progression', 'consistency', 'mastery', 'exploration', 'social', 'special'
  xp_reward INTEGER DEFAULT 0,
  credit_reward INTEGER DEFAULT 0,

  -- Unlock requirements
  required_level INTEGER,
  required_streak INTEGER,
  required_constellation UUID,
  required_achievements UUID[], -- Prerequisites

  -- Rewards
  unlocks_equipment UUID, -- Optional equipment unlock
  unlocks_avatar_variant TEXT,

  is_hidden BOOLEAN DEFAULT false, -- Hidden until unlocked
  is_repeatable BOOLEAN DEFAULT false;

-- Track progress toward achievements
CREATE TABLE achievement_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  achievement_id UUID REFERENCES discoveries NOT NULL,

  current_progress INTEGER DEFAULT 0,
  required_progress INTEGER NOT NULL,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  UNIQUE(user_id, achievement_id)
);
```

### 3.6 Perk Trees (NEW)

```sql
CREATE TABLE perks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_name TEXT NOT NULL, -- 'body', 'mind', 'spirit', 'wealth', 'social', 'craft'
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 4),

  name TEXT NOT NULL,
  description TEXT,

  -- Requirements
  required_level INTEGER DEFAULT 1,
  required_constellations INTEGER DEFAULT 0,
  prerequisite_perks UUID[], -- Must unlock these first

  -- Cost
  credit_cost INTEGER DEFAULT 100,

  -- Effects (JSONB for flexibility)
  effect_type TEXT, -- 'xp_boost', 'credit_boost', 'unlock_feature', 'stat_bonus'
  effect_data JSONB,

  is_keystone BOOLEAN DEFAULT false
);

CREATE TABLE user_perks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  perk_id UUID REFERENCES perks NOT NULL,

  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,

  UNIQUE(user_id, perk_id)
);
```

### 3.7 Constellation Progress (ENHANCED)

```sql
-- Create constellation stars table
CREATE TABLE constellation_stars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  constellation_name TEXT NOT NULL, -- 'orion', 'phoenix', 'athena', 'chronos', 'plutus'
  star_number INTEGER NOT NULL,

  required_xp INTEGER NOT NULL,
  reward_description TEXT,

  UNIQUE(constellation_name, star_number)
);

CREATE TABLE user_constellation_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  constellation_name TEXT NOT NULL,

  unlocked_stars INTEGER[] DEFAULT '{}',
  module_xp INTEGER DEFAULT 0,

  completed_at TIMESTAMPTZ,

  UNIQUE(user_id, constellation_name)
);
```

### 3.8 Dashboard Aggregation View (NEW)

```sql
CREATE VIEW user_gamification_summary AS
SELECT
  u.id as user_id,
  ump.current_level,
  ump.current_stage,
  ump.total_xp,
  ump.xp_to_next_level,

  -- Currency
  ucc.balance as cosmic_credits,

  -- Streaks
  (SELECT COUNT(*) FROM momentum_chains WHERE user_id = u.id AND is_active = true) as active_streaks,
  (SELECT MAX(current_streak) FROM momentum_chains WHERE user_id = u.id) as longest_active_streak,
  (SELECT SUM(shields_available) FROM momentum_chains WHERE user_id = u.id) as total_shields,

  -- Missions
  (SELECT COUNT(*) FROM user_missions WHERE user_id = u.id AND status = 'completed' AND completed_at > NOW() - INTERVAL '24 hours') as missions_today,
  (SELECT COUNT(*) FROM user_missions WHERE user_id = u.id AND status = 'active') as active_missions,

  -- Achievements
  (SELECT COUNT(*) FROM user_discoveries WHERE user_id = u.id) as total_achievements,
  (SELECT COUNT(*) FROM user_discoveries ud JOIN discoveries d ON ud.discovery_id = d.id WHERE ud.user_id = u.id AND d.rarity = 'legendary') as legendary_achievements,

  -- Equipment
  (SELECT COUNT(*) FROM user_equipment WHERE user_id = u.id AND is_equipped = true) as equipped_items,
  ump.total_defense,
  ump.total_strength,
  ump.total_vitality,
  ump.total_intelligence,
  ump.total_wisdom,

  -- Constellations
  (SELECT COUNT(DISTINCT constellation_name) FROM user_constellation_progress WHERE user_id = u.id AND completed_at IS NOT NULL) as completed_constellations,

  -- Perks
  (SELECT COUNT(*) FROM user_perks WHERE user_id = u.id AND is_active = true) as active_perks

FROM auth.users u
LEFT JOIN user_module_progress ump ON u.id = ump.user_id AND ump.module_name = 'cosmic_evolution'
LEFT JOIN user_cosmic_currency ucc ON u.id = ucc.user_id;
```

---

## 4. Frontend Architecture

### 4.1 Component Hierarchy

```
<GamificationProvider>  ← Context wrapping entire app
  ├─ <Dashboard>
  │   ├─ <CosmicEvolutionWidget>
  │   ├─ <StreakOverview>
  │   ├─ <MissionQuickView>
  │   ├─ <ProgressChart>
  │   └─ <RecentAchievements>
  │
  ├─ <CosmicEvolutionPage>  ← Main progression view
  │   ├─ <AvatarDisplay3D>
  │   ├─ <XPProgressBar>
  │   ├─ <StageTimeline>
  │   ├─ <EquipmentSlots>
  │   └─ <StatsPanel>
  │
  ├─ <MissionsPage>
  │   ├─ <DailyMissionsList>
  │   ├─ <WeeklyMissionsList>
  │   ├─ <MonthlyMissionsList>
  │   ├─ <ChallengeMissionsList>
  │   └─ <MissionCreator>
  │
  ├─ <ConstellationsPage>
  │   ├─ <ConstellationMap3D>
  │   ├─ <StarProgressList>
  │   └─ <CompletionRewards>
  │
  ├─ <AchievementsPage>
  │   ├─ <AchievementGrid>
  │   ├─ <ProgressTrackers>
  │   └─ <RarityFilters>
  │
  ├─ <PerkTreePage>
  │   ├─ <TreeVisualization>
  │   ├─ <PerkDetails>
  │   └─ <UnlockButton>
  │
  └─ <RewardsStorePage>
      ├─ <CustomRewardsList>
      ├─ <ShopItems>
      └─ <PurchaseHistory>
```

### 4.2 Unified State Management (Zustand)

```javascript
// /src/stores/gamificationStore.js
export const useGamificationStore = create((set, get) => ({
  // User progress
  user: null,
  level: 1,
  stage: 1,
  totalXP: 0,
  xpToNextLevel: 100,
  cosmicCredits: 0,

  // Equipment
  equippedItems: [],
  stats: {
    defense: 0,
    strength: 0,
    vitality: 0,
    intelligence: 0,
    wisdom: 0,
  },

  // Streaks
  activeStreaks: [],
  globalStreak: 0,
  shieldsAvailable: 0,

  // Missions
  dailyMissions: [],
  weeklyMissions: [],
  monthlyMissions: [],

  // Achievements
  unlockedAchievements: [],
  achievementProgress: [],

  // Constellations
  constellationProgress: [],

  // Perks
  activePerks: [],

  // Actions
  fetchGamificationData: async (userId) => {
    // Single API call to get all gamification data
    const data = await api.getGamificationSummary(userId);
    set({ ...data });
  },

  awardXP: (amount, source) => {
    const { totalXP, level } = get();
    // Calculate with multipliers
    const finalAmount = amount * get().calculateXPMultiplier();
    // Emit event to backend
    api.createGamificationEvent({
      type: 'xp_award',
      source,
      xpAmount: finalAmount,
    });
  },

  completeMission: async (missionId) => {
    // Single action triggers entire pipeline
    await api.completeMission(missionId);
    // Refetch will update all derived state
    await get().fetchGamificationData();
  },

  calculateXPMultiplier: () => {
    const { activeStreaks, activePerks, equippedItems } = get();
    let multiplier = 1.0;

    // Streak bonuses
    const maxStreak = Math.max(...activeStreaks.map(s => s.current_streak));
    if (maxStreak >= 365) multiplier += 0.25;
    else if (maxStreak >= 90) multiplier += 0.15;
    else if (maxStreak >= 30) multiplier += 0.10;
    else if (maxStreak >= 7) multiplier += 0.05;

    // Perk bonuses
    activePerks.forEach(perk => {
      if (perk.effect_type === 'xp_boost') {
        multiplier += perk.effect_data.percentage;
      }
    });

    // Equipment set bonuses
    const equippedSets = {};
    equippedItems.forEach(item => {
      if (item.set_name) {
        equippedSets[item.set_name] = (equippedSets[item.set_name] || 0) + 1;
      }
    });
    Object.values(equippedSets).forEach(count => {
      if (count >= 5) multiplier += 0.20;
      else if (count >= 3) multiplier += 0.10;
    });

    return multiplier;
  },
}));
```

### 4.3 Real-Time Event System

```javascript
// /src/hooks/useGamificationEvents.js
export function useGamificationEvents() {
  const { fetchGamificationData } = useGamificationStore();

  useEffect(() => {
    // Subscribe to Supabase real-time changes
    const subscription = supabase
      .channel('gamification_events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'gamification_events',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        // New event processed, refresh state
        fetchGamificationData(user.id);

        // Trigger UI feedback
        if (payload.new.level_up_triggered) {
          showLevelUpModal(payload.new);
        }
        if (payload.new.achievement_unlocked?.length > 0) {
          showAchievementToast(payload.new.achievement_unlocked);
        }
        if (payload.new.stage_transition) {
          showStageTransitionAnimation(payload.new);
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user.id]);
}
```

### 4.4 Unified Progress Bar Component

```javascript
// /src/components/gamification/UnifiedProgressBar.jsx
export function UnifiedProgressBar({ showDetailed = false }) {
  const { level, totalXP, xpToNextLevel, stage } = useGamificationStore();

  return (
    <div className="unified-progress-bar">
      {/* Primary: XP to next level */}
      <div className="xp-progress">
        <div className="label">Level {level} → {level + 1}</div>
        <div className="bar">
          <div
            className="fill"
            style={{ width: `${(totalXP % xpToNextLevel) / xpToNextLevel * 100}%` }}
          />
        </div>
        <div className="xp-text">{totalXP % xpToNextLevel} / {xpToNextLevel} XP</div>
      </div>

      {/* Secondary: Stage progress */}
      {showDetailed && (
        <div className="stage-progress">
          <div className="label">Stage {stage}: {STAGES[stage].name}</div>
          <div className="next-milestone">
            Next milestone: Stage {getNextStageMilestone(stage)} at Level {STAGE_REQUIREMENTS[getNextStageMilestone(stage)]}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. API Design

### 5.1 Unified Gamification Endpoint

```javascript
// POST /api/gamification/event
// Single endpoint for all gamification actions
{
  event_type: 'mission_complete' | 'journal_entry' | 'fitness_log' | 'manual_xp',
  event_source: 'missions' | 'journal' | 'fitness' | 'admin',
  event_data: {
    mission_id?: string,
    xp_amount?: number,
    // ... context-specific data
  }
}

// Response includes ALL triggered effects
{
  success: true,
  xp_awarded: 150,
  credits_awarded: 25,
  level_up: false,
  stage_transition: false,
  achievements_unlocked: ['achievement-uuid-1'],
  streak_updated: true,
  new_streak_count: 8,
  constellation_stars_unlocked: [],

  // New state
  new_level: 12,
  new_total_xp: 8950,
  new_credits: 475,
}
```

### 5.2 Batch Fetch Endpoint

```javascript
// GET /api/gamification/summary
// Returns complete gamification state in one request
{
  user: { level, stage, totalXP, xpToNextLevel, cosmicCredits },
  stats: { defense, strength, vitality, intelligence, wisdom },
  streaks: { global, modules: [...], shields },
  missions: { daily: [...], weekly: [...], monthly: [...] },
  achievements: { unlocked: [...], inProgress: [...] },
  constellations: [...],
  equipment: { equipped: [...], unlocked: [...] },
  perks: { active: [...], available: [...] },
}
```

---

## 6. Implementation Phases

### Phase 4: Backend Implementation (Supabase)

**4.1 Database Migration**
- Create new tables (equipment, perks, constellation_stars, gamification_events)
- Enhance existing tables (user_module_progress, momentum_chains, discoveries)
- Create views (user_gamification_summary)
- Set up RLS policies

**4.2 Edge Functions**
- `process-gamification-event`: Core pipeline function
- `calculate-rewards`: Computes XP/currency with all multipliers
- `check-achievements`: Scans for newly unlocked achievements
- `update-streaks`: Daily cron job to check/break streaks

**4.3 Real-Time Subscriptions**
- Configure channels for gamification_events
- Set up user-specific subscriptions

### Phase 5: Frontend Implementation

**5.1 Core Store & Hooks**
- Implement useGamificationStore (Zustand)
- Create useGamificationEvents hook
- Build unified API client

**5.2 Shared Components**
- UnifiedProgressBar
- XPGainAnimation
- AchievementToast
- LevelUpModal
- StageTransitionScreen

**5.3 Page Refactors**
- Refactor CosmicEvolution to use unified store
- Rebuild Missions with new frequency system
- Build PerkTree UI from data
- Enhance Constellations with star progress
- Complete Achievements/Discoveries UI

**5.4 Dashboard Integration**
- Create gamification summary widgets
- Add cross-module correlation charts
- Build quick-action buttons

### Phase 6: Integration & Testing

**6.1 Connect Module Actions**
- Fitness log → gamification event
- Journal entry → gamification event
- Knowledge tracked → gamification event
- All trigger unified pipeline

**6.2 Consequence System**
- Implement streak break penalties
- Add daily mission failure effects
- Create visual indicators for penalties

**6.3 Polish**
- Particle effects on XP gain
- Sound effects for achievements
- Smooth animations for level ups
- 3D avatar transitions

---

## 7. Key Metrics to Track

Post-implementation, monitor these metrics to validate the unified system:

1. **Engagement:**
   - Daily Active Users (DAU)
   - Average session length
   - Actions per session

2. **Retention:**
   - 7-day, 30-day, 90-day retention rates
   - Users with 7+ day streaks
   - Shield usage rate

3. **Progression:**
   - Average level
   - Time to reach milestones (Level 10, 20, 50)
   - Stage transition distribution

4. **Feature Adoption:**
   - % users with equipped items
   - % users with active perks
   - Constellation completion rate
   - Mission completion rate by frequency

5. **Economy:**
   - Average cosmic credit balance
   - Most purchased rewards
   - Credit earning vs spending rate

6. **Achievement:**
   - Unlocked achievement distribution
   - Time to first legendary
   - Hidden achievement discovery rate

---

## 8. Migration Strategy

To transition from fragmented to unified without losing user data:

1. **Data Preservation:**
   - Run migration script to populate new tables from existing data
   - Map old cosmic evolution stages to new unified system
   - Preserve all existing streaks, missions, rewards

2. **Feature Parity:**
   - Ensure all existing features work in new system
   - Grandfather existing users into appropriate levels/stages

3. **Gradual Rollout:**
   - Phase 1: Backend unified, keep existing UI
   - Phase 2: New Dashboard widgets
   - Phase 3: Refactored pages one at a time
   - Phase 4: Full unified experience

4. **Fallback Plan:**
   - Keep old tables for 30 days
   - Feature flags to toggle new system
   - Rollback procedure documented

---

## 9. Success Criteria

The unified gamification system is successful when:

✅ **Single Action, Multiple Rewards:** Completing a mission simultaneously updates XP, credits, streaks, constellations, and checks achievements

✅ **Visible Connections:** Users understand how all systems relate (e.g., "My streak gives me +10% XP, which helps me level faster, which unlocks better equipment")

✅ **Engagement Boost:** 7-day retention increases by 20%+ (targeting Duolingo's proven multiplier)

✅ **Feature Adoption:** 80%+ of users have equipped at least one item within first week

✅ **Reduced Fragmentation:** No duplicate or competing systems (single avatar, single XP, single currency)

✅ **Developer Experience:** Adding new gamification feature takes <1 hour (emit event, rewards auto-calculated)

---

## 10. Future Enhancements

Once unified system is stable:

- **Social Features:** Guilds, leaderboards, challenges with friends
- **Seasonal Events:** Limited-time missions with unique rewards
- **Prestige System:** Reset to Level 1 with permanent bonuses
- **Alternate Progression Paths:** Choose specialization (e.g., "Knowledge Seeker" vs "Productivity Master")
- **AI Insights:** "Your fitness streak correlates with +15% productivity XP"
- **Transmog System:** Apply appearance of any unlocked equipment
- **Pet Companions:** Unlock and level up pets that grant passive bonuses

---

*This architecture transforms LifeOS from a collection of gamification features into a cohesive progression system where every action matters and all systems reinforce each other.*
