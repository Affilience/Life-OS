# PVP Implementation Plan - LifeOS/Quanta

## Overview

A comprehensive PvP system where **stats, equipment, and pets** all contribute to battle outcomes, creating meaningful progression incentives beyond just completing tasks.

---

## Core Battle Formula

### Damage Calculation

```
Daily Damage = (Base Damage + Stat Bonus + Equipment Bonus) × Pet Multiplier × Streak Bonus

Where:
- Base Damage = Tasks Completed × 10
- Stat Bonus = (Strength × 2) + (Intelligence × 1.5)
- Equipment Bonus = Sum of all equipped item attack values
- Pet Multiplier = 1.0 + (Active Pet Bonus / 100)
- Streak Bonus = 1.0 + (Current Streak Days × 0.05), max 1.5
```

### Defense Calculation

```
Damage Taken = Opponent's Damage × Defense Reduction

Where:
- Defense Reduction = 1 - (Defense / (Defense + 100))
  - Example: 50 Defense = 33% damage reduction
  - Example: 100 Defense = 50% damage reduction
```

### HP System

```
Max HP = 1000 + (Vitality × 50) + (Level × 10)

Example Level 25 player with 20 Vitality:
Max HP = 1000 + (20 × 50) + (25 × 10) = 2,250 HP
```

---

## How Each System Contributes

### 1. Character Stats (Base Power)

| Stat | PvP Effect | Source |
|------|------------|--------|
| **Strength** | +2 damage per point | Level ups, skill tree |
| **Intelligence** | +1.5 damage per point | Level ups, skill tree |
| **Defense** | Reduces incoming damage | Equipment, level ups |
| **Vitality** | +50 max HP per point | Equipment, level ups |
| **Wisdom** | +5% XP from battle rewards | Level ups, rare equipment |

**Example Impact:**
- Player A: 30 STR, 20 INT = +90 damage/day
- Player B: 10 STR, 40 INT = +80 damage/day
- Strength-focused builds hit harder, INT builds more balanced

---

### 2. Equipment (Strategic Loadouts)

**Equipment provides direct stat bonuses that affect battle:**

| Slot | Primary Stats | Example Items |
|------|---------------|---------------|
| Helmet | Defense, Vitality | Dragon Helm (+15 DEF, +5 VIT) |
| Chest | Defense, Vitality | Dragon Scale (+20 DEF, +10 VIT) |
| Weapon | Strength, Attack | Dragon Blade (+8 STR, +50 Attack) |
| Shield | Defense | Iron Shield (+10 DEF) |
| Cape | Mixed | Shadow Cloak (+5 DEF, +10% crit) |
| Ring | Specialized | Ring of Strength (+5 STR) |
| Amulet | Vitality | Amulet of Vitality (+10 VIT) |

**Set Bonuses (Incentivize collecting):**
```
Dragon Knight Set (Helmet + Chest + Weapon):
- 2 pieces: +10% fire damage
- 3 pieces: +25% damage, +15% defense, flame aura in battle
```

**Equipment Rarity Effects:**
| Rarity | Battle Effect |
|--------|---------------|
| Common | Base stats only |
| Uncommon | +5% stat effectiveness |
| Rare | +10% stat effectiveness, subtle glow |
| Epic | +15% stat effectiveness, 5% crit chance |
| Legendary | +25% stat effectiveness, 10% crit chance, particle effects |

---

### 3. Pets (Passive Abilities)

**Pets provide percentage-based bonuses during battles:**

| Pet Tier | Battle Bonus | Example |
|----------|--------------|---------|
| Common | +5-10% to specific damage type | Imp: +5% productivity task damage |
| Uncommon | +10-15% to damage category | Sprite: +10% all task damage |
| Rare | +15-20% + secondary effect | Fenrir: +15% damage + 5% lifesteal |
| Epic | +20-25% + utility | Phoenix: +20% damage, revive once at 25% HP |
| Legendary | +25-30% + game-changing | Bahamut: +30% damage, AoE attacks in tournaments |

**Pet Abilities (Active):**

Each pet can have a special ability usable once per battle:

| Pet | Ability | Effect |
|-----|---------|--------|
| Kitsune | Fox Fire | Deal 100 bonus damage, ignore defense |
| Dragon Whelp | Flame Breath | +50% damage for 1 day |
| Phoenix | Rebirth | If you would lose, restore to 50% HP (once) |
| Fenrir | Howl | Intimidate opponent, -10% their damage for 2 days |
| Bahamut | Megaflare | Deal 500 true damage (ignores all defense) |

---

## Battle Types

### Type 1: Quick Duel (3 Days)

```
Format: First to reduce opponent to 0 HP OR highest HP after 3 days
Stakes: Low (50 XP, 25 credits)
Best for: Testing builds, casual competition
```

### Type 2: Standard Duel (7 Days)

```
Format: Highest HP remaining after 7 days wins
Stakes: Medium (250 XP, 75 credits)
Best for: Most common battle type
```

### Type 3: Ranked Battle (7 Days)

```
Format: Affects ELO rating, seasonal rewards
Stakes: High (500 XP, 150 credits, rank progression)
Best for: Competitive players
Requirements: Level 10+, completed 3 casual duels
```

### Type 4: Guild War (30 Days)

```
Format: Team vs Team (future feature)
Stakes: Very High (guild rewards, exclusive cosmetics)
Best for: Endgame content
```

---

## Battle Flow (Day by Day)

### Day 0: Challenge & Accept

```
1. Player A challenges Player B
2. Player B sees: "Challenge from [Avatar] Level 25
   - Their Stats: 30 STR / 20 DEF / 1,500 HP
   - Their Pet: Phoenix (+20% damage)
   - Their Equipment: Dragon Knight Set
   Accept this challenge?"
3. Player B can view their own loadout and adjust before accepting
4. Both players' HP set to max
5. Battle begins at midnight UTC
```

### Days 1-7: Combat Phase

```
Each day at midnight:

1. Calculate both players' daily damage
   Player A: 5 tasks × 10 = 50 base
            + 30 STR × 2 = 60 stat bonus
            + 50 weapon attack = 50 equipment
            × 1.2 pet multiplier = 192 damage
            × 1.15 (3-day streak) = 220.8 final damage

2. Apply damage to opponent (after defense)
   Player B has 50 Defense = 33% reduction
   Player B takes: 220.8 × 0.67 = 148 damage

3. Check for special effects
   - Critical hits (10% chance with epic+ gear): 1.5× damage
   - Pet abilities (if activated)
   - Set bonuses

4. Update HP bars
5. Send push notifications
   "You dealt 148 damage! Player B is at 1,352/1,500 HP"
```

### Day 7+: Resolution

```
1. Compare remaining HP
2. Determine winner
3. Calculate rewards:
   Winner: Base reward + performance bonus
   Loser: 50% base reward + effort bonus

4. Update stats:
   - PvP win/loss record
   - ELO rating (ranked only)
   - Achievement progress

5. Display battle summary with replay
```

---

## UI Components

### 1. Challenge Screen

```
┌─────────────────────────────────────────────────┐
│  ⚔️ CHALLENGE TO BATTLE                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  YOUR LOADOUT          VS    OPPONENT           │
│  ┌─────────┐                ┌─────────┐         │
│  │ [Avatar]│                │ [Avatar]│         │
│  │ Lvl 25  │                │ Lvl 28  │         │
│  └─────────┘                └─────────┘         │
│                                                 │
│  ❤️ HP: 2,250               ❤️ HP: 2,450        │
│  ⚔️ ATK: 180                ⚔️ ATK: 165         │
│  🛡️ DEF: 85                 🛡️ DEF: 120         │
│                                                 │
│  🐉 Pet: Phoenix            🦊 Pet: Fenrir      │
│  +20% DMG, Rebirth         +15% DMG, Lifesteal  │
│                                                 │
│  📊 POWER RATING: 4,250     📊 POWER: 4,180     │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Battle Duration: [3 Days ▼]              │   │
│  │ Stakes: 50 XP / 25 Credits              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Change Loadout]  [Cancel]  [⚔️ SEND CHALLENGE]│
└─────────────────────────────────────────────────┘
```

### 2. Active Battle Screen

```
┌─────────────────────────────────────────────────┐
│  ⚔️ BATTLE: Day 4 of 7 (3 days remaining)       │
├─────────────────────────────────────────────────┤
│                                                 │
│  YOU                              OPPONENT      │
│  ┌─────────┐                    ┌─────────┐    │
│  │ [Avatar]│       VS           │ [Avatar]│    │
│  │ 🐉      │                    │ 🦊      │    │
│  └─────────┘                    └─────────┘    │
│                                                 │
│  HP: 1,850/2,250               HP: 1,420/2,450  │
│  ████████████░░░               ██████░░░░░░░   │
│  82%                           58%              │
│                                                 │
│  ────────── TODAY'S COMBAT ──────────          │
│                                                 │
│  You completed 8 tasks                         │
│  ⚔️ Base Damage: 80                            │
│  💪 Stat Bonus: +65                            │
│  🗡️ Equipment: +50                             │
│  🐉 Pet Bonus: ×1.2                            │
│  🔥 Streak (5 days): ×1.25                     │
│  ────────────────────                          │
│  💥 TOTAL DAMAGE: 292                          │
│  🛡️ Enemy Defense: -97                         │
│  ────────────────────                          │
│  ⚔️ DAMAGE DEALT: 195                          │
│                                                 │
│  ────────── BATTLE LOG ──────────              │
│  Day 4: You dealt 195 damage                   │
│  Day 3: Opponent dealt 142 damage (💥 CRIT!)   │
│  Day 2: You dealt 180 damage                   │
│  Day 1: Opponent dealt 165 damage              │
│                                                 │
│  [🐉 Use Pet Ability]  [📊 Full Stats]  [🏳️]  │
└─────────────────────────────────────────────────┘
```

### 3. Loadout Manager

```
┌─────────────────────────────────────────────────┐
│  🎒 PVP LOADOUT                    Power: 4,250 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Helm │ │Chest│ │Weap │ │Shield│ │Cape │      │
│  │ 🪖  │ │ 🛡️  │ │ ⚔️  │ │ 🛡️  │ │ 🧣  │      │
│  │ +15 │ │ +20 │ │ +50 │ │ +10 │ │ +5  │      │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │
│                                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐                       │
│  │Ring1│ │Ring2│ │Amulet│                      │
│  │ 💍  │ │ 💍  │ │ 📿  │                       │
│  │ +5  │ │ +5  │ │ +10 │                       │
│  └─────┘ └─────┘ └─────┘                       │
│                                                 │
│  SET BONUS ACTIVE: Dragon Knight (3/3)         │
│  🔥 +25% damage, +15% defense, Flame Aura      │
│                                                 │
│  ────────── ACTIVE PET ──────────              │
│  ┌──────────────────────────────────────┐      │
│  │ 🐉 Phoenix (Epic)                     │      │
│  │ +20% damage to all tasks             │      │
│  │ 🔮 Ability: Rebirth                   │      │
│  │    "Restore to 50% HP once per battle"│      │
│  └──────────────────────────────────────┘      │
│                                                 │
│  ────────── CALCULATED STATS ──────────        │
│  ⚔️ Attack Power: 180 (+45 from gear)          │
│  🛡️ Defense: 85 (+50 from gear)                │
│  ❤️ Max HP: 2,250 (+500 from vitality)         │
│  💥 Crit Chance: 10% (legendary gear)          │
│  🐉 Pet Multiplier: 1.2x                       │
│                                                 │
│  [Save Loadout]  [Load Preset]  [Back]         │
└─────────────────────────────────────────────────┘
```

### 4. Battle Results Screen

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              ⚔️ VICTORY! ⚔️                     │
│                                                 │
│          ┌─────────────────────┐               │
│          │      [Avatar]       │               │
│          │    🏆 WINNER 🏆     │               │
│          │    HP: 892/2,250    │               │
│          └─────────────────────┘               │
│                                                 │
│  ────────── BATTLE SUMMARY ──────────          │
│                                                 │
│  Duration: 7 Days                              │
│  Total Damage Dealt: 1,558                     │
│  Total Damage Taken: 1,358                     │
│  Tasks Completed: 42                           │
│  Longest Streak: 7 days                        │
│  Critical Hits: 3                              │
│                                                 │
│  ────────── REWARDS ──────────                 │
│                                                 │
│  🌟 XP Earned: 250                             │
│  💰 Credits: 75                                │
│  📈 ELO: 1,050 → 1,075 (+25)                   │
│  🏅 Win Streak: 3                              │
│                                                 │
│  ────────── BONUS REWARDS ──────────           │
│                                                 │
│  🔥 Perfect Streak Bonus: +50 XP               │
│  💪 Underdog Victory: +25 Credits              │
│     (Beat higher level opponent!)              │
│                                                 │
│  [Share Victory]  [Rematch]  [Back to Arena]   │
└─────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

```sql
-- PvP Battles
CREATE TABLE pvp_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Type & Status
  battle_type VARCHAR(20) NOT NULL, -- 'quick', 'standard', 'ranked'
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- pending, active, completed, cancelled, forfeited

  -- Players
  player1_id UUID REFERENCES auth.users(id),
  player2_id UUID REFERENCES auth.users(id),

  -- Snapshots at battle start (prevents mid-battle gear swapping)
  player1_loadout JSONB, -- {stats, equipment, pet, level}
  player2_loadout JSONB,

  -- HP Tracking
  player1_max_hp INTEGER,
  player2_max_hp INTEGER,
  player1_current_hp INTEGER,
  player2_current_hp INTEGER,

  -- Configuration
  duration_days INTEGER NOT NULL DEFAULT 7,

  -- Timing
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,

  -- Results
  winner_id UUID REFERENCES auth.users(id),

  -- Rewards
  xp_reward INTEGER DEFAULT 250,
  credits_reward INTEGER DEFAULT 75,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Battle Progress
CREATE TABLE pvp_battle_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID REFERENCES pvp_battles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),

  day_number INTEGER NOT NULL, -- 1-7
  date DATE NOT NULL,

  -- Activity
  tasks_completed INTEGER DEFAULT 0,
  xp_gained INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,

  -- Combat
  base_damage INTEGER DEFAULT 0,
  stat_bonus INTEGER DEFAULT 0,
  equipment_bonus INTEGER DEFAULT 0,
  pet_multiplier DECIMAL(3,2) DEFAULT 1.0,
  streak_multiplier DECIMAL(3,2) DEFAULT 1.0,
  total_damage INTEGER DEFAULT 0,
  damage_after_defense INTEGER DEFAULT 0,

  -- Special Events
  critical_hit BOOLEAN DEFAULT FALSE,
  pet_ability_used BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battle Invites
CREATE TABLE pvp_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID REFERENCES pvp_battles(id) ON DELETE CASCADE,

  inviter_id UUID REFERENCES auth.users(id),
  invitee_id UUID REFERENCES auth.users(id),

  -- Invite details
  message TEXT,
  duration_days INTEGER,
  battle_type VARCHAR(20),

  status VARCHAR(20) DEFAULT 'pending',
  -- pending, accepted, declined, expired

  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User PvP Stats
CREATE TABLE pvp_user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),

  -- Record
  total_battles INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  forfeits INTEGER DEFAULT 0,

  -- Ranking
  elo_rating INTEGER DEFAULT 1000,
  rank_tier VARCHAR(20) DEFAULT 'bronze',
  -- bronze, silver, gold, platinum, diamond, champion
  season_highest_elo INTEGER DEFAULT 1000,

  -- Streaks
  current_win_streak INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,

  -- Stats
  total_damage_dealt BIGINT DEFAULT 0,
  total_damage_taken BIGINT DEFAULT 0,
  total_tasks_in_battles INTEGER DEFAULT 0,
  critical_hits INTEGER DEFAULT 0,
  pet_abilities_used INTEGER DEFAULT 0,

  -- Rewards Earned
  total_xp_from_pvp INTEGER DEFAULT 0,
  total_credits_from_pvp INTEGER DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PvP Loadout Presets
CREATE TABLE pvp_loadouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),

  name VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,

  -- Equipment IDs
  helmet_id VARCHAR(100),
  chest_id VARCHAR(100),
  weapon_id VARCHAR(100),
  shield_id VARCHAR(100),
  cape_id VARCHAR(100),
  ring1_id VARCHAR(100),
  ring2_id VARCHAR(100),
  amulet_id VARCHAR(100),

  -- Pet
  pet_id VARCHAR(100),

  -- Calculated stats (cached)
  power_rating INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_battles_players ON pvp_battles(player1_id, player2_id);
CREATE INDEX idx_battles_status ON pvp_battles(status) WHERE status = 'active';
CREATE INDEX idx_battle_days_battle ON pvp_battle_days(battle_id, user_id);
CREATE INDEX idx_invites_invitee ON pvp_invites(invitee_id) WHERE status = 'pending';
CREATE INDEX idx_user_stats_elo ON pvp_user_stats(elo_rating DESC);
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Backend:**
- [ ] Create database tables with RLS policies
- [ ] Edge function: `create-pvp-battle`
- [ ] Edge function: `accept-pvp-invite`
- [ ] Edge function: `decline-pvp-invite`
- [ ] Modify task completion to call `update-battle-progress`
- [ ] Cron job: `finalize-expired-battles` (hourly)

**Frontend:**
- [ ] `pvpStore.js` - Zustand store for PvP state
- [ ] `PvPInviteModal` - Accept/decline challenges
- [ ] `ActiveBattlesWidget` - Dashboard card showing active battles
- [ ] `BattleDetailPage` - Full battle view

**Testing:**
- [ ] Create test battles via SQL
- [ ] Verify damage calculations
- [ ] Test invite flow end-to-end

---

### Phase 2: Stats & Equipment Integration (Week 3)

**Backend:**
- [ ] Calculate stats from equipment at battle start
- [ ] Snapshot loadout to prevent mid-battle changes
- [ ] Implement defense damage reduction
- [ ] Add critical hit chance from gear rarity

**Frontend:**
- [ ] `LoadoutManager` - Pre-battle equipment selection
- [ ] Show equipment bonuses in battle UI
- [ ] Display stat comparisons before accepting challenge
- [ ] Add "Power Rating" calculation

**Calculations to implement:**
```javascript
function calculatePowerRating(stats, equipment, pet) {
  const baseStats = stats.strength * 2 + stats.intelligence * 1.5 + stats.defense + stats.vitality;
  const equipBonus = sumEquipmentStats(equipment);
  const petBonus = pet?.bonusAmount || 0;
  return Math.floor((baseStats + equipBonus) * (1 + petBonus / 100));
}
```

---

### Phase 3: Pet Integration (Week 4)

**Backend:**
- [ ] Apply pet passive bonus to damage calculation
- [ ] Implement pet abilities (one-time use per battle)
- [ ] Store pet ability usage in battle_days

**Frontend:**
- [ ] Pet selector in loadout manager
- [ ] "Use Ability" button in battle view
- [ ] Pet ability animations/effects
- [ ] Show pet contribution in damage breakdown

**Pet Abilities Implementation:**
```javascript
const PET_ABILITIES = {
  phoenix: {
    name: 'Rebirth',
    type: 'defensive',
    execute: (battle, user) => {
      // If user HP would go below 0, restore to 50% instead
      return { preventDeath: true, restoreHpPercent: 50 };
    }
  },
  fenrir: {
    name: 'Howl',
    type: 'debuff',
    execute: (battle, opponent) => {
      // Reduce opponent damage by 10% for 2 days
      return { debuff: 'intimidate', duration: 2, effect: -0.1 };
    }
  },
  bahamut: {
    name: 'Megaflare',
    type: 'offensive',
    execute: (battle, opponent) => {
      // Deal 500 true damage (ignores defense)
      return { trueDamage: 500 };
    }
  }
};
```

---

### Phase 4: Polish & Balance (Week 5)

**Balance Testing:**
- [ ] Ensure no equipment/pet combo is overpowered
- [ ] Test edge cases (both players 0 HP, ties)
- [ ] Verify ELO calculations
- [ ] Anti-cheat pattern detection

**UI Polish:**
- [ ] Battle animations (damage numbers, effects)
- [ ] Victory/defeat celebrations
- [ ] Sound effects (optional)
- [ ] Battle history page

**Notifications:**
- [ ] Push notification: "You were challenged!"
- [ ] Push notification: "Your opponent dealt X damage!"
- [ ] Push notification: "Battle complete - you won!"
- [ ] Email digest: Weekly PvP summary

---

### Phase 5: Ranked & Seasons (Week 6+)

**Ranked System:**
- [ ] ELO calculation on battle end
- [ ] Rank tiers: Bronze → Silver → Gold → Platinum → Diamond → Champion
- [ ] Season length: 30 days
- [ ] Season rewards based on final rank

**Matchmaking:**
- [ ] Queue system for finding random opponents
- [ ] Match by ELO ±100 points
- [ ] Fallback to level-based matching

**Leaderboards:**
- [ ] Global PvP leaderboard (by ELO)
- [ ] Friends leaderboard
- [ ] Season rankings

---

## Reward Structure

### Battle Rewards

| Battle Type | Winner | Loser | Draw |
|-------------|--------|-------|------|
| Quick (3d) | 100 XP, 25 💎 | 50 XP, 10 💎 | 75 XP, 15 💎 |
| Standard (7d) | 250 XP, 75 💎 | 125 XP, 25 💎 | 175 XP, 50 💎 |
| Ranked (7d) | 500 XP, 150 💎, +ELO | 200 XP, 50 💎, -ELO | 350 XP, 100 💎 |

### Bonus Rewards

| Bonus | Condition | Reward |
|-------|-----------|--------|
| Perfect Streak | Maintained streak all battle days | +50% XP |
| Underdog | Beat opponent 5+ levels higher | +25% credits |
| Flawless Victory | Win with >90% HP remaining | +25% XP |
| Clutch Win | Win with <10% HP remaining | +50% credits |
| Critical Master | Land 3+ critical hits | +25 XP |
| Pet Synergy | Win using pet ability at key moment | +Pet XP |

### Season Rewards

| Rank | End of Season Reward |
|------|---------------------|
| Bronze | 100 💎, Bronze Frame |
| Silver | 250 💎, Silver Frame |
| Gold | 500 💎, Gold Frame, 1 Random Rare Item |
| Platinum | 1000 💎, Platinum Frame, 1 Random Epic Item |
| Diamond | 2000 💎, Diamond Frame, 1 Guaranteed Epic Item |
| Champion | 5000 💎, Champion Frame, 1 Legendary Item, Title |

---

## Anti-Cheat Measures

### Pattern Detection

```javascript
function detectSuspiciousActivity(userId, dailyStats) {
  const userAverage = await getUserDailyAverage(userId, 30); // 30-day avg

  // Flag if tasks > 3x average
  if (dailyStats.tasks > userAverage.tasks * 3) {
    return { suspicious: true, reason: 'task_spike' };
  }

  // Flag if tasks completed too fast
  const tasksPerHour = dailyStats.tasks / dailyStats.activeHours;
  if (tasksPerHour > 20) {
    return { suspicious: true, reason: 'impossible_rate' };
  }

  return { suspicious: false };
}
```

### Battle Integrity

1. **Loadout Lock**: Equipment/pet locked when battle starts
2. **Task Verification**: High-stakes battles require integration proof
3. **Report System**: Opponents can flag suspicious activity
4. **Review Queue**: Flagged battles manually reviewed
5. **Penalties**: First offense = warning, Second = 7-day PvP ban, Third = permanent ban

---

## File Structure

```
src/
├── stores/
│   └── pvpStore.js              # PvP state management
├── pages/
│   └── PvPArena.jsx             # Main PvP page
├── components/
│   └── pvp/
│       ├── PvPInviteModal.jsx   # Accept/decline challenges
│       ├── ActiveBattleCard.jsx # Dashboard widget
│       ├── BattleView.jsx       # Full battle screen
│       ├── LoadoutManager.jsx   # Equipment/pet selection
│       ├── BattleResults.jsx    # Victory/defeat screen
│       ├── PvPLeaderboard.jsx   # Rankings
│       └── BattleHistory.jsx    # Past battles
├── utils/
│   └── pvpCalculations.js       # Damage formulas
└── api/
    └── pvp.js                   # API calls to Edge Functions

supabase/
├── functions/
│   ├── create-pvp-battle/
│   ├── accept-pvp-invite/
│   ├── update-battle-progress/
│   └── finalize-battles/
└── migrations/
    └── 20241214_create_pvp_tables.sql
```

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Adoption | 30% of active users try PvP | Users with ≥1 battle / Total active |
| Retention | 50% battle again within 7 days | Repeat battlers / First-time battlers |
| Completion | 90% of battles finish (not forfeited) | Completed / Total started |
| Engagement | +15% task completion during battles | Tasks during battle / Normal average |
| Balance | Win rate between 45-55% for all gear | Win rate by equipment tier |
| Satisfaction | NPS > 50 for PvP feature | Post-battle survey |

---

## Summary

This PvP system transforms LifeOS into a competitive RPG where:

1. **Stats matter** - Your strength, defense, vitality directly affect battles
2. **Equipment is strategic** - Choosing offensive vs defensive loadouts
3. **Pets are game-changers** - Unique abilities can turn the tide
4. **Progression feels meaningful** - Every level, item, pet makes you stronger in PvP
5. **It's still about self-improvement** - You win by completing real tasks, not button mashing

**Estimated Total Effort: 6-8 weeks for full implementation**

**MVP (4 weeks):** Basic duels with stat/equipment integration
**Full (8 weeks):** Pets, ranked, seasons, tournaments
