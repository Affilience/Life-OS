# LifeOS - Unified Stats System Design

## Executive Summary

This document defines the **complete, unified stats system** for LifeOS that integrates with all gamification features, modules, and progression systems. The stats system provides meaningful character growth tied to real-world productivity and self-improvement.

---

## Core Philosophy

> **"Your character grows as you grow in real life"**

The stats system bridges real-world activities with RPG progression, creating meaningful feedback loops that motivate consistent self-improvement. Stats are not arbitrary numbers - they reflect genuine skill development and habitual actions.

---

## The Five Core Stats

Based on research into [RPG attribute design](https://en.wikipedia.org/wiki/Attribute_(role-playing_games)) and [gamification leveling systems](https://yukaichou.com/advanced-gamification/leveling-system-gt85-and-league-rank-gt101/), we use a balanced 5-stat system:

### 1. **STRENGTH** (Physical Power)
- **Color:** `#EF4444` (Red)
- **Icon:** ⚔️ Sword
- **Real-World Mapping:** Physical fitness, exercise completion, workout consistency
- **Derived From:**
  - Workout completion (Health module)
  - Exercise streak maintenance
  - Physical challenges conquered
  - Recovery management
- **Affects:**
  - Health & Fitness XP multiplier
  - Physical milestone achievements
  - Workout-themed equipment bonuses
  - Avatar visual progression (muscular development)

### 2. **VITALITY** (Endurance & Health)
- **Color:** `#10B981` (Green)
- **Icon:** ❤️ Heart
- **Real-World Mapping:** Stamina, sleep quality, nutrition, recovery
- **Derived From:**
  - Sleep tracking consistency
  - Nutrition logging
  - Recovery days taken
  - Health metrics maintenance
- **Affects:**
  - Daily streak shields
  - Recovery bonus multipliers
  - Energy system capacity
  - Resistance to "burnout" penalties

### 3. **INTELLIGENCE** (Mental Acuity)
- **Color:** `#8B5CF6` (Purple)
- **Icon:** 🧠 Brain
- **Real-World Mapping:** Learning, problem-solving, knowledge acquisition
- **Derived From:**
  - Book reading completion (Knowledge module)
  - Course completion
  - Study session consistency
  - Note-taking and synthesis
- **Affects:**
  - Knowledge module XP multiplier
  - Learning speed bonuses
  - Skill tree unlock rate
  - Research-themed achievements

### 4. **WISDOM** (Focus & Discipline)
- **Color:** `#F59E0B` (Amber/Gold)
- **Icon:** ✨ Sparkle / 🦉 Owl
- **Real-World Mapping:** Time management, focus, reflection, planning
- **Derived From:**
  - Pomodoro/focus session completion
  - Journal entry consistency (Journal module)
  - Calendar time-blocking usage
  - Task prioritization
- **Affects:**
  - Productivity module XP multiplier
  - Focus session effectiveness
  - Time management bonuses
  - Planning-related perks

### 5. **DEFENSE** (Resilience & Consistency)
- **Color:** `#3B82F6` (Blue)
- **Icon:** 🛡️ Shield
- **Real-World Mapping:** Habit formation, streak maintenance, consistency
- **Derived From:**
  - Global streak length
  - Module-specific streaks
  - Comeback from broken streaks
  - Daily login consistency
- **Affects:**
  - Streak shield capacity
  - Comeback XP bonuses
  - Protective equipment bonuses
  - Anti-burnout resilience

---

## Stat Scaling & Ranges

### Base Values
- **Starting Value:** 0 (all stats)
- **Normal Range:** 0-100
- **Legendary Range:** 100-200+ (achievable with dedication)
- **Soft Cap:** 100 (diminishing returns after)
- **Hard Cap:** 200 (maximum achievable)

### Stat Increase Sources

#### **Equipment** (Primary Source)
- Common: +2-5 per stat
- Uncommon: +5-10 per stat
- Rare: +10-15 per stat
- Epic: +15-25 per stat
- Legendary: +25-40 per stat

#### **Pet Bonuses** (Secondary Source)
- Common: +5% category XP
- Uncommon: +10% category XP
- Rare: +15% category XP
- Epic: +20% category XP
- Mythic: +25-30% category XP

#### **Perks** (Tertiary Source)
- Passive stat bonuses: +3-10 per perk
- Conditional bonuses: +10-20 (when active)
- Synergy bonuses: +5-15 (when multiple perks combine)

#### **Achievements** (Permanent Boosts)
- Minor achievements: +1-2 permanent stat
- Major achievements: +3-5 permanent stat
- Legendary achievements: +10-15 permanent stat

#### **Level Milestones**
- Every 5 levels: +2 to all stats
- Every 10 levels: +5 to chosen stat
- Every 25 levels: +10 to chosen stat

---

## Module-to-Stat Mapping

### Productivity Module → **WISDOM**
- **Primary Stat:** Wisdom +60%
- **Secondary Stat:** Intelligence +30%, Defense +10%
- **Activities:**
  - Complete tasks → Wisdom XP
  - Focus sessions → Wisdom XP
  - Project milestones → Wisdom XP
  - Time blocking → Wisdom XP

### Health & Fitness Module → **STRENGTH + VITALITY**
- **Primary Stats:** Strength +50%, Vitality +40%
- **Secondary Stat:** Defense +10%
- **Activities:**
  - Workouts → Strength XP
  - Recovery tracking → Vitality XP
  - Nutrition logging → Vitality XP
  - Sleep tracking → Vitality XP

### Knowledge Module → **INTELLIGENCE**
- **Primary Stat:** Intelligence +70%
- **Secondary Stats:** Wisdom +20%, Defense +10%
- **Activities:**
  - Books completed → Intelligence XP
  - Courses finished → Intelligence XP
  - Notes taken → Intelligence XP
  - Skills practiced → Intelligence XP

### Journal Module → **WISDOM + INTELLIGENCE**
- **Primary Stat:** Wisdom +50%
- **Secondary Stats:** Intelligence +30%, Vitality +20%
- **Activities:**
  - Journal entries → Wisdom XP
  - Reflection prompts → Wisdom XP
  - Mood tracking → Vitality XP
  - Goal reviews → Wisdom XP

### Finance Module → **DEFENSE + WISDOM**
- **Primary Stat:** Defense +50%
- **Secondary Stats:** Wisdom +30%, Intelligence +20%
- **Activities:**
  - Budget tracking → Defense XP
  - Expense logging → Defense XP
  - Investment tracking → Wisdom XP
  - Financial goals → Defense XP

### Calendar Module → **WISDOM + DEFENSE**
- **Primary Stat:** Wisdom +60%
- **Secondary Stat:** Defense +40%
- **Activities:**
  - Time blocks created → Wisdom XP
  - Schedule adherence → Defense XP
  - Planning consistency → Wisdom XP

### Skills Module → **ALL STATS** (Balanced)
- **Distribution:** +20% to each stat
- **Activities:**
  - Skill practice → Relevant stat XP
  - Skill mastery → All stats XP
  - Skill trees unlocked → Bonus XP

---

## Stat Effects & Benefits

### Combat/Challenge Multipliers
- **Strength:** Physical challenges, workout goals
- **Vitality:** Endurance challenges, streaks
- **Intelligence:** Learning challenges, quizzes
- **Wisdom:** Focus challenges, time management
- **Defense:** Streak protection, recovery

### XP Multipliers (Per 10 Stat Points)
- **+2% XP** to related module activities
- Example: 50 Intelligence = +10% Knowledge module XP

### Equipment Requirements
- **Common:** No stat requirements
- **Uncommon:** 10+ in primary stat
- **Rare:** 25+ in primary stat
- **Epic:** 50+ in primary stat
- **Legendary:** 75+ in primary stat

### Stat Synergies
- **Strength + Vitality ≥ 100:** "Titan's Body" - +10% all physical XP
- **Intelligence + Wisdom ≥ 100:** "Scholar's Mind" - +10% all mental XP
- **All Stats ≥ 50:** "Balanced Hero" - +5% global XP
- **All Stats ≥ 100:** "Legendary Hero" - +15% global XP, special title

---

## Derived Stats (Secondary Metrics)

### **Total Power Score**
- Formula: `SUM(all 5 stats)`
- Used for leaderboards, milestones
- Display prominently on character sheet

### **Attribute Balance Score**
- Formula: `MIN(all 5 stats) / AVERAGE(all 5 stats) * 100`
- Measures how balanced character growth is
- Rewards well-rounded development

### **Category Specialization**
- **Physical:** Strength + Vitality
- **Mental:** Intelligence + Wisdom
- **Core:** Defense

---

## Stat Decay & Maintenance

### No Decay System (Philosophy)
- **Real progress is permanent** - Stats don't decay
- Reflects genuine skill acquisition
- Prevents punishment for life events
- Encourages comeback mechanics instead

### Comeback Bonuses (Instead of Decay)
- Return after break: +25% XP for 7 days
- Streak broken but restarted: +15% XP for 3 days
- Motivation to return without penalty

---

## UI/UX Display Guidelines

### Primary Display Locations
1. **Character Page** - Full stat breakdown with bars
2. **Dashboard** - Compact stat overview
3. **Equipment Page** - Stat bonuses from gear
4. **Progress Page** - Stat growth graphs

### Visual Elements
- **Stat Bars:** Show current/max with gradient fills
- **Stat Icons:** Consistent iconography across app
- **Stat Colors:** Unique color per stat for quick recognition
- **Glow Effects:** Higher stats = brighter glow
- **Milestones:** Visual indicators at 25, 50, 75, 100

### Comparison Views
- **Before/After Equipment:** Show stat delta
- **With/Without Pets:** Show bonus percentage
- **Growth Over Time:** Graphs per stat
- **Peer Comparison:** Anonymous percentile ranking

---

## Implementation Checklist

### Phase 1: Core Stats (COMPLETE ✓)
- [x] Define 5 core stats
- [x] Implement in gamificationStore
- [x] Create stat calculation functions
- [x] Add to equipment system

### Phase 2: Module Integration (IN PROGRESS)
- [ ] Map all module activities to stats
- [ ] Create XP attribution system
- [ ] Implement stat-based XP multipliers
- [ ] Add stat displays to module pages

### Phase 3: Derived Systems
- [ ] Equipment stat requirements
- [ ] Pet stat bonuses
- [ ] Achievement stat rewards
- [ ] Perk stat multipliers

### Phase 4: Advanced Features
- [ ] Stat synergy bonuses
- [ ] Specialization tracking
- [ ] Balance scoring
- [ ] Leaderboards

### Phase 5: Visual Polish
- [ ] Stat growth animations
- [ ] Milestone celebrations
- [ ] Stat comparison tools
- [ ] Achievement notifications

---

## Database Schema

### `user_stats` Table
```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Core Stats
  strength INTEGER DEFAULT 0,
  vitality INTEGER DEFAULT 0,
  intelligence INTEGER DEFAULT 0,
  wisdom INTEGER DEFAULT 0,
  defense INTEGER DEFAULT 0,

  -- Derived Stats
  total_power INTEGER GENERATED ALWAYS AS (strength + vitality + intelligence + wisdom + defense) STORED,
  balance_score NUMERIC(5,2),

  -- Sources Breakdown
  strength_equipment INTEGER DEFAULT 0,
  strength_pets INTEGER DEFAULT 0,
  strength_perks INTEGER DEFAULT 0,
  strength_achievements INTEGER DEFAULT 0,
  strength_levels INTEGER DEFAULT 0,

  vitality_equipment INTEGER DEFAULT 0,
  vitality_pets INTEGER DEFAULT 0,
  vitality_perks INTEGER DEFAULT 0,
  vitality_achievements INTEGER DEFAULT 0,
  vitality_levels INTEGER DEFAULT 0,

  intelligence_equipment INTEGER DEFAULT 0,
  intelligence_pets INTEGER DEFAULT 0,
  intelligence_perks INTEGER DEFAULT 0,
  intelligence_achievements INTEGER DEFAULT 0,
  intelligence_levels INTEGER DEFAULT 0,

  wisdom_equipment INTEGER DEFAULT 0,
  wisdom_pets INTEGER DEFAULT 0,
  wisdom_perks INTEGER DEFAULT 0,
  wisdom_achievements INTEGER DEFAULT 0,
  wisdom_levels INTEGER DEFAULT 0,

  defense_equipment INTEGER DEFAULT 0,
  defense_pets INTEGER DEFAULT 0,
  defense_perks INTEGER DEFAULT 0,
  defense_achievements INTEGER DEFAULT 0,
  defense_levels INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_stats_user ON user_stats(user_id);
CREATE INDEX idx_user_stats_power ON user_stats(total_power DESC);
```

### `stat_history` Table (Optional - for graphs)
```sql
CREATE TABLE stat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stat_type TEXT NOT NULL, -- 'strength', 'vitality', etc
  stat_value INTEGER NOT NULL,
  source TEXT, -- 'equipment', 'achievement', etc
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stat_history_user_date ON stat_history(user_id, recorded_at DESC);
```

---

## API Endpoints

### GET `/api/stats/:userId`
Returns full stat breakdown

### POST `/api/stats/recalculate`
Triggers full stat recalculation from all sources

### GET `/api/stats/history/:userId?days=30`
Returns stat history for graphing

### GET `/api/stats/leaderboard?stat=total_power&limit=100`
Returns top players by stat

---

## Future Enhancements

### Stat Specialization Trees
- At level 25: Choose specialization (Physical/Mental/Balanced)
- Unlocks unique perks for chosen path
- Can respec once per month

### Seasonal Stat Boosts
- Each season focuses on 1-2 stats
- Bonus XP for those stats
- Special seasonal equipment

### Stat-Based Quests
- Unlock quests based on stat thresholds
- "Wisdom 50+" quest: Master 5 new skills
- Rewards scale with stat level

### Social Features
- Stat-based matchmaking for challenges
- Team composition optimization
- Guild/party stat synergies

---

## References & Research

- [RPG Attribute Systems - Wikipedia](https://en.wikipedia.org/wiki/Attribute_(role-playing_games))
- [Gamification Leveling Systems - Yu-kai Chou](https://yukaichou.com/advanced-gamification/leveling-system-gt85-and-league-rank-gt101/)
- [Productivity Gamification Examples - Trophy](https://trophy.so/blog/productivity-gamification-examples)
- [The Six Stats - TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/TheSixStats)

---

**Last Updated:** 2025-11-24
**Version:** 1.0
**Status:** Foundation Complete, Implementation In Progress
