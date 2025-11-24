# LifeOS Pages - Quick Reference Guide

## Main Navigation (5 Tabs) - ✅ OPTION C IMPLEMENTED

| Tab | Route | Page File | Component | Main Purpose |
|-----|-------|-----------|-----------|--------------|
| 🏠 Home | `/` | `DashboardNew.jsx` | Nexus | Central hub: quests, KPIs, heatmap, avatar |
| 📊 Track | `/track` | `Track.jsx` | 4 tabs | Productivity, Health, Habits, Journal |
| 📈 Progress | `/progress` | `Progress.jsx` | 4 tabs | Avatar, Skills, Skill Tree, Streaks |
| 🎯 Quests | `/quests` | `Missions.jsx` | MissionBoard | Accept/track/complete missions for XP & credits |
| ⋯ More | `/more` | `More.jsx` | Galaxy Menu | Navigation hub for secondary features (includes Avatar/Equipment) |

---

## Secondary Features (Accessed from More Menu or Direct Routes)

| Feature | Route | Page File | Component | Purpose |
|---------|-------|-----------|-----------|---------|
| Calendar | `/calendar` | `CalendarNew.jsx` | - | Time blocking, planning (Astral Map) |
| Purpose | `/purpose` | `PurposeValues.jsx` | - | Life purpose, values, goals (North Star) |
| Finance | `/financial` | `Financial.jsx` | - | Income, expenses, net worth (Nebula) |
| Rewards | `/rewards` | `Rewards.jsx` | RewardMarketplace | Spend credits on personal rewards |
| Discoveries | `/discoveries` | `Discoveries.jsx` | DiscoveryGallery | Unlock achievements through gameplay |
| Learn | `/learn` | `KnowledgeNew.jsx` | KnowledgeModule | Notes, books, podcasts (Observatory) |
| Avatar/Equipment | `/avatar` | `EquipmentInventory.jsx` | Equipment | Equip gear to boost stats (moved from main nav) |

---

## Progress Page - 4 Sub-Tabs

| Sub-Tab | Component | Features |
|---------|-----------|----------|
| Avatar | AvatarRenderer | Character display, level, XP bar, stats, prestige |
| Constellations | SkillsNew | Skill management, levels, progression |
| Skill Tree | SkillTreeNew | Visual skill tree, dependencies, progression paths |
| Stats | Streaks | Consistency streaks, habit tracking, daily metrics |

---

## Track Page - 4 Sub-Tabs (Hidden from Primary Nav)

| Sub-Tab | Component | Features |
|---------|-----------|----------|
| Supernova | ProductivityNew | Work sessions, projects, tasks, income |
| Gravity | HealthNew | Workouts, nutrition, sleep, recovery |
| Orbit | HabitsNew | Habit tracking, streaks, consistency |
| Starlog | JournalNew | Journal entries, mood, reflections |

---

## Gamification Systems

### 1. XP & Leveling
- **Level:** Current progression tier (1-7+)
- **XP:** Experience points, bar to next level
- **Scaling:** Each level needs 1.2× previous XP
- **Display:** Dashboard, Progress page
- **Trigger:** Mission completion

### 2. Cosmic Currency
- **Currency:** Cosmic Credits
- **Earn:** Complete missions
- **Spend:** Rewards marketplace
- **Track:** Balance, lifetime earned, total spent
- **Display:** Mission board, Rewards page

### 3. Missions / Quests
- **Quest Board:** Dashboard (3-5 daily quests)
- **Mission Board:** `/quests` (full interface)
- **Difficulties:** Routine → Moderate → Challenging → Cosmic
- **Rewards:** XP + Credits on completion
- **Progress:** Real-time % completion tracking

### 4. Avatar & Equipment
- **Avatar:** Rendered character, evolves with level
- **Prestige:** Badge system on avatar
- **Equipment:** 7 slots (helmet, chest, weapon, shield, cape, ring, amulet)
- **Rarities:** Common, Uncommon, Rare, Epic, Legendary
- **Stats:** Defense, Strength, Vitality, Intelligence, Wisdom
- **Bonuses:** Equipment provides stat boosts

### 5. Achievements / Discoveries
- **Discovery System:** Unlock achievements through gameplay
- **Rarity:** Common → Uncommon → Rare → Epic → Legendary → Cosmic
- **Tracking:** Progress % before unlock
- **Points:** Accumulate points from unlocked discoveries
- **Stats:** Tracks unlocked count, completion %, total points

### 6. Skills & Skill Tree
- **Constellations:** Individual skills with levels
- **Skill Tree:** Visual node-based progression
- **Dependencies:** Prerequisites for unlocking
- **Practice:** Track real-world skill usage

### 7. Consistency & Streaks
- **Heatmap:** Year-long activity visualization
- **Streaks:** Daily/weekly/monthly consistency tracking
- **Motivation:** Visual progress, streak badges

### 8. Rewards Marketplace
- **Categories:** Entertainment, Food, Activities, Rest, Custom
- **Cost:** Set credit price per reward
- **Creation:** User-defined custom rewards
- **Redemption:** Spend credits to claim rewards

---

## Data Flow Summary

```
Missions → Earn XP → Dashboard Shows Level/XP → Progress Shows Avatar Stage
       → Earn Credits → Rewards → Spend on Personal Rewards
                      → Also feed into Discoveries system

Activities (Track modules) → Consistency Heatmap → Dashboard
                          → Streaks tracking → Progress page

Equipment Management → Avatar Stats → Displayed on Avatar

Skills → Constellations (Progress) → Skill Tree (Progress) → Track usage
```

---

## Known Issues

| Issue | Severity | Details |
|-------|----------|---------|
| Mission/Quest Redundancy | Medium | Both `/quests` and `/missions` go to MissionBoard - unclear which is primary |
| Avatar Equipment Nav | Medium | Equipment at `/avatar` but also in More menu; confusing hierarchy |
| Hidden Track Page | Low | `/track` works but not in navigation; may be deprecated |
| Demo Pages | Low | `/gamification`, `/cosmic-evolution`, `/constellations-test` still in routes |

---

## File Locations Quick Map

**Main Pages:** `/src/pages/`
- `DashboardNew.jsx` - Home
- `Progress.jsx` - Character progression
- `Missions.jsx` - Missions interface
- `EquipmentInventory.jsx` - Equipment management
- `More.jsx` - Navigation hub
- `ProductivityNew.jsx`, `HealthNew.jsx`, `HabitsNew.jsx`, `JournalNew.jsx` - Track modules

**Components:** `/src/components/`
- `missions/MissionBoard.jsx` - Mission display
- `rewards/RewardMarketplace.jsx` - Rewards system
- `discoveries/DiscoveryGallery.jsx` - Achievements
- `avatar/` - Avatar, equipment, evolution
- `dashboard/` - Dashboard components
- `layout/` - MainLayout, TopBar, BottomNav, Sidebar

**Features:** `/src/features/`
- `quests/` - Quest system
- `missions/` - Mission management
- `rewards/` - Reward system
- `discoveries/` - Achievement system
- `cosmic-evolution/` - Avatar evolution
- `constellations/` - Skills visualization
- `kpis/` - Metrics display
- `consistency/` - Heatmap display

---

## Quick Stats

- **Main Pages:** 5
- **Secondary Pages:** 8+
- **Total Gamification Systems:** 8
- **Sub-tab Pages:** 8 (4 in Progress, 4 in Track)
- **Equipment Slots:** 7
- **Rarity Tiers:** 5-6
- **Mission Difficulties:** 4
- **Reward Categories:** 5
- **Stat Types:** 5

---

## ✅ IMPLEMENTED: Option C Navigation Structure

**Final Decision:** Option C - Balanced approach keeping existing Track page

```
[Home]  [Track]  [Progress]  [Quests]  [More]
```

**Implementation Details:**
- **Home** (`/`) → DashboardNew.jsx - Central hub with widgets
- **Track** (`/track`) → Track.jsx with 4 sub-tabs:
  - Supernova: ProductivityNew (work sessions, projects, tasks, income)
  - Gravity: HealthNew (workouts, nutrition, sleep, recovery)
  - Orbit: HabitsNew (habit tracking, streaks, consistency)
  - Starlog: JournalNew (journal entries, mood, reflections)
- **Progress** (`/progress`) → Progress.jsx with 4 sub-tabs:
  - Avatar: AvatarRenderer (character display, level, XP, stats, prestige)
  - Constellations: SkillsNew (skill management, levels, progression)
  - Skill Tree: SkillTreeNew (visual skill tree, dependencies)
  - Stats: Streaks (consistency streaks, habit tracking, metrics)
- **Quests** (`/quests`) → Missions.jsx - Mission board interface
- **More** (`/more`) → More.jsx - Navigation hub for:
  - Calendar, Purpose, Finance, Rewards, Discoveries, Learn, Avatar/Equipment, Settings

**Files Updated:**
- `/src/components/layout/Sidebar.jsx` - Desktop navigation (5 tabs)
- `/src/components/layout/BottomNav.jsx` - Mobile navigation (5 tabs)
- `/src/App.jsx` - Routes updated to match Option C
- Navigation synchronized between mobile and desktop

**Rationale:**
- Keeps valuable existing Track page (4 sub-tabs) instead of hiding it
- Progress focuses purely on character/gamification progression
- Equipment accessible from More menu (secondary but important)
- Track covers all life logging modules in organized tabs

---

## Development Notes

- **Tech Stack:** React + Tailwind CSS + TypeScript
- **State Management:** Zustand stores (avatarStore, gamificationStore, evolutionStore, questStore)
- **API Client:** React Query (TanStack Query)
- **Animations:** Framer Motion
- **Icons:** Lucide React + Emoji
- **Dark Mode:** Always enabled
- **Responsive:** Mobile-first, bottom nav on mobile, sidebar on desktop
- **Performance:** Lazy-loaded pages, 5min query staleTime

---

*For full details, see PAGES_AUDIT.md*
