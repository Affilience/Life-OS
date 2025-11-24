# LifeOS Navigation & Feature Hierarchy

## Visual App Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        MAIN LAYOUT                              │
│  ┌────────────────┐         ┌──────────────────────────────────┐│
│  │   SIDEBAR      │         │       TOP BAR (Mobile Menu)       ││
│  │ (Desktop Only) │         │  + Date + Quick-Add + Settings    ││
│  │                │         └──────────────────────────────────┘│
│  │ - Home         │         ┌──────────────────────────────────┐│
│  │ - Quests       │         │                                  ││
│  │ - Progress     │         │      MAIN CONTENT AREA           ││
│  │ - Avatar       │         │   (Route-based page render)      ││
│  │ - More         │         │                                  ││
│  │                │         │  Responsive: Max-width 1440px    ││
│  │ [+ Settings]   │         │  Padding: 4px (mobile)           ││
│  └────────────────┘         │         to 32px (desktop)        ││
│  ┌────────────────┐         │                                  ││
│  │  BOTTOM NAV    │         └──────────────────────────────────┘│
│  │ (Mobile Only)  │         ┌──────────────────────────────────┐│
│  │ 5 Main Tabs    │         │    BOTTOM NAVIGATION (Mobile)    ││
│  │                │         │  [🏠] [⚔️] [📈] [🧑] [⋯]         ││
│  └────────────────┘         └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Route Tree (Current Implementation)

```
/ (root)
│
├─ /                              → DashboardNew.jsx (Nexus)
│  └─ Components:
│     ├─ AvatarDashboardSection
│     ├─ QuestBoard (features/quests)
│     ├─ KpiGrid (features/kpis)
│     └─ ConsistencyHeatmap (features/consistency)
│
├─ /quests                        → Missions.jsx → MissionBoard.jsx
│  └─ Components:
│     ├─ Active Missions Grid
│     ├─ Available Missions Grid
│     └─ Mission Cards with progress
│
├─ /progress                      → Progress.jsx (4-tab container)
│  ├─ /progress?tab=avatar       → Avatar display
│  │  └─ AvatarRenderer + Stats
│  ├─ /progress?tab=skills       → SkillsNew.jsx (Constellations)
│  ├─ /progress?tab=tree         → SkillTreeNew.jsx
│  └─ /progress?tab=stats        → Streaks.jsx
│
├─ /avatar                        → EquipmentInventory.jsx
│  └─ Components:
│     ├─ Equipment Slots Grid (7 slots)
│     ├─ Stats Display
│     └─ Available Items Panel
│
├─ /more                          → More.jsx (Galaxy Navigation Hub)
│  ├─ Planning & Organization
│  │  ├─ /calendar              → CalendarNew.jsx
│  │  └─ /purpose               → PurposeValues.jsx
│  ├─ Finances
│  │  └─ /financial             → Financial.jsx
│  ├─ Gamification
│  │  ├─ /missions              → Missions.jsx (REDUNDANT ⚠️)
│  │  ├─ /rewards               → Rewards.jsx → RewardMarketplace.jsx
│  │  └─ /discoveries           → Discoveries.jsx → DiscoveryGallery.jsx
│  ├─ Customization
│  │  └─ /equipment             → EquipmentInventory.jsx (REDUNDANT ⚠️)
│  └─ Settings
│     └─ /settings              → Settings.jsx
│
├─ /learn                         → KnowledgeNew.jsx → KnowledgeModule.jsx
│
├─ /track                         → Track.jsx (4-tab container, HIDDEN)
│  ├─ Productivity (Supernova)   → ProductivityNew.jsx
│  ├─ Health (Gravity)           → HealthNew.jsx
│  ├─ Habits (Orbit)             → HabitsNew.jsx
│  └─ Journal (Starlog)          → JournalNew.jsx
│
├─ /journal/:year/:month          → JournalMonth.jsx
├─ /journal/:year/:month/:day/write → JournalWrite.jsx
│
└─ [Development Routes - Should be removed]:
   ├─ /gamification              → AtomCosmosDemo.jsx
   ├─ /cosmic-evolution          → CosmicEvolutionDemo.jsx
   ├─ /constellations-test       → ConstellationsTestPage.tsx
   ├─ /constellations-demo       → ConstellationsDemo.jsx
   └─ /evolution                 → EvolutionShowcase.jsx
```

---

## Feature Organization by Category

### 🎮 GAMIFICATION SYSTEMS

```
Gamification Layer
├─ XP & Leveling System
│  ├─ Level Display: Dashboard, Progress
│  ├─ XP Bar: Dashboard, Progress
│  ├─ Level-up Events: Haptic feedback + Toast
│  └─ Source: Missions completion
│
├─ Mission / Quest System
│  ├─ Quest Board: Dashboard (quick 3-5 daily)
│  ├─ Mission Board: /quests (full interface)
│  ├─ Display: Grid of mission cards
│  ├─ Actions: Start, track progress, complete
│  └─ Rewards: XP + Cosmic Credits
│
├─ Cosmic Currency
│  ├─ Balance: Mission Board, Rewards page
│  ├─ Earn: Mission rewards
│  ├─ Spend: Rewards marketplace
│  └─ Stats: Lifetime earned, total spent
│
├─ Avatar & Character
│  ├─ Rendering: AvatarRenderer component
│  ├─ Display Location: Dashboard, Progress
│  ├─ Stats: Defense, Strength, Vitality, Intelligence, Wisdom
│  ├─ Evolution: Stage changes by level
│  └─ Prestige: Badge system
│
├─ Equipment System
│  ├─ Interface: /avatar page
│  ├─ Slots: Helmet, Chest, Weapon, Shield, Cape, Ring, Amulet
│  ├─ Rarity: Common, Uncommon, Rare, Epic, Legendary
│  ├─ Stats: Equipment provides bonuses
│  └─ Display: Affects avatar stats
│
├─ Skill System
│  ├─ Management: Constellations (Progress tab)
│  ├─ Visualization: Skill Tree (Progress tab)
│  ├─ Level: Individual skill levels
│  ├─ Dependencies: Prerequisites for unlocking
│  └─ Application: Real-world usage tracking
│
├─ Achievement System
│  ├─ Interface: /discoveries (DiscoveryGallery)
│  ├─ Tracking: Unlocked vs locked discoveries
│  ├─ Rarity: Common through Cosmic
│  ├─ Progress: % before unlock
│  └─ Rewards: Points accumulation
│
└─ Reward Marketplace
   ├─ Interface: /rewards (RewardMarketplace)
   ├─ Categories: Entertainment, Food, Activities, Rest, Custom
   ├─ Cost: Credits per reward
   ├─ Custom: Create personal rewards
   └─ Actions: Purchase/redeem rewards
```

### 📊 LIFE TRACKING MODULES

```
Life Tracking Layer
├─ Productivity (Supernova)
│  ├─ Track: Work sessions, projects, tasks, income
│  ├─ Metrics: Focus hours, active tasks, projects
│  ├─ Access: /track (Supernova tab) + More menu
│  └─ Component: ProductivityNew.jsx
│
├─ Health & Fitness (Gravity)
│  ├─ Track: Workouts, nutrition, sleep, recovery
│  ├─ Metrics: Activity, sleep quality, nutrition
│  ├─ Access: /track (Gravity tab) + More menu
│  └─ Component: HealthNew.jsx
│
├─ Habits (Orbit)
│  ├─ Track: Daily habits, consistency, streaks
│  ├─ Metrics: Streaks, completion %, consistency
│  ├─ Access: /track (Orbit tab) + More menu
│  └─ Component: HabitsNew.jsx (28KB - Large)
│
├─ Journal & Reflection (Starlog)
│  ├─ Track: Daily entries, mood, reflections
│  ├─ Interface: Month view + daily write
│  ├─ Access: /track (Starlog tab) + More menu
│  └─ Components: JournalNew.jsx, JournalMonth.jsx, JournalWrite.jsx
│
├─ Knowledge Management (Observatory)
│  ├─ Track: Notes, books, podcasts, ideas
│  ├─ Interface: Notes/Obsidian hybrid
│  ├─ Access: /learn + More menu
│  └─ Component: KnowledgeNew.jsx → KnowledgeModule.jsx
│
├─ Calendar & Time Management (Astral Map)
│  ├─ Track: Time blocking, planned vs actual
│  ├─ Metrics: Energy mapping, time allocation
│  ├─ Access: /calendar (More menu)
│  └─ Component: CalendarNew.jsx
│
├─ Purpose & Values (North Star)
│  ├─ Track: Life purpose, values alignment, goals
│  ├─ Size: 44KB - Large component
│  ├─ Access: /purpose (More menu)
│  └─ Component: PurposeValues.jsx
│
└─ Finances (Nebula)
   ├─ Track: Income, expenses, net worth
   ├─ Metrics: Cash flow, savings, goals
   ├─ Access: /financial (More menu)
   └─ Component: Financial.jsx → FinancialNew.jsx
```

### 📈 CENTRAL DASHBOARD & ANALYTICS

```
Dashboard Hub (DashboardNew / Nexus)
├─ Input Sources:
│  ├─ Missions (earn XP, credits)
│  ├─ Track modules (log activities)
│  ├─ Equipment (affects avatar)
│  └─ Skills (show progression)
│
├─ Display Components:
│  ├─ Avatar Dashboard Section
│  │  ├─ Avatar render
│  │  ├─ Current level & XP bar
│  │  └─ Character stats
│  │
│  ├─ Quest Board (Features/Quests)
│  │  ├─ Today's 3-5 daily quests
│  │  ├─ XP claim buttons
│  │  └─ Quick overview
│  │
│  ├─ KPI Grid (Features/KPIs)
│  │  ├─ Key metrics across modules
│  │  ├─ Focus time (today/week)
│  │  ├─ Health metrics
│  │  ├─ Habit completion %
│  │  └─ Financial summary
│  │
│  └─ Consistency Heatmap (Features/Consistency)
│     ├─ Year-long activity calendar
│     ├─ Daily logging visualization
│     ├─ Streak indicators
│     └─ Click to explore days
│
└─ Data Flow:
   └─ ALL activities → Central Timeline (mentioned in CLAUDE.md)
      └─ Dashboard aggregates & displays
```

---

## Page Complexity & Size Map

```
Small Pages (< 1KB):
├─ Missions.jsx (254 bytes) - Just wrapper
├─ Rewards.jsx (254 bytes) - Just wrapper
└─ Discoveries.jsx (263 bytes) - Just wrapper

Medium Pages (1-10KB):
├─ DashboardNew.jsx (5.8KB) - Dashboard hub
├─ ProductivityNew.jsx (2.9KB) - Productivity tab
├─ HealthNew.jsx (2.8KB) - Health tab
├─ Track.jsx (2.5KB) - Multi-tab container
├─ Progress.jsx (6KB) - Multi-tab container
├─ More.jsx (3.8KB) - Navigation menu
├─ KnowledgeNew.jsx (0.27KB) - Just wrapper
├─ Financial.jsx (1KB) - Just wrapper
├─ CalendarNew.jsx (5.1KB) - Calendar page
├─ SkillsNew.jsx (6KB) - Skills display
├─ JournalNew.jsx (8KB) - Journal interface
├─ JournalMonth.jsx (6.7KB) - Calendar view
└─ JournalWrite.jsx (8.3KB) - Entry editor

Large Pages (10-50KB):
├─ HabitsNew.jsx (28KB) - Habit tracking (can split)
├─ SkillTreeNew.jsx (38KB) - Skill tree viz (can split)
└─ PurposeValues.jsx (44KB) - Purpose/values (can split)

Component-Based Pages:
├─ EquipmentInventory.jsx (7.4KB) - Equipment management
└─ Various feature components:
   ├─ MissionBoard.jsx (7.4KB) - Mission interface
   ├─ RewardMarketplace.jsx (6.7KB) - Rewards
   └─ DiscoveryGallery.jsx (6KB) - Discoveries
```

---

## Navigation Flow Patterns

### Pattern 1: Simple Direct Navigation
```
Bottom Nav → Direct Page
  /quests → Missions page
  /avatar → Equipment page
  /more → More menu
```

### Pattern 2: Multi-Tab Pages
```
Bottom Nav → Container Page → Tab Selection → Sub-Component
  /progress → Progress.jsx → Avatar/Skills/Tree/Stats tabs
  /track → Track.jsx → Supernova/Gravity/Orbit/Starlog tabs (HIDDEN)
```

### Pattern 3: Nested Routes
```
Main Route → Sub-route → Component
  /journal/:year/:month → Month view
  /journal/:year/:month/:day/write → Entry editor
```

### Pattern 4: Hub Navigation
```
More Page → Category → Link → Secondary Feature
  /more → Gamification → /missions, /rewards, /discoveries
  /more → Planning → /calendar, /purpose
```

---

## Data Relationships

```
                    ┌─── Missions ───┐
                    │   ├─ Earn XP   │
                    │   └─ Earn Credits
                    │                 │
                    ▼                 ▼
        ┌──────────────────┐   ┌──────────────┐
        │  Avatar/Level    │   │   Currency   │
        │  & Progression   │   │  (Cosmic     │
        │                  │   │   Credits)   │
        └────────┬─────────┘   └────────┬─────┘
                 │                      │
                 │                      ▼
                 │            ┌──────────────────┐
                 │            │ Rewards System   │
                 │            │ (Marketplace)    │
                 │            └──────────────────┘
                 │
        ┌────────▼────────────────────┐
        │  Track Activities            │
        │  ├─ Productivity             │
        │  ├─ Health                   │
        │  ├─ Habits                   │
        │  ├─ Journal                  │
        │  └─ Knowledge                │
        └────────┬────────────────────┘
                 │
        ┌────────▼────────────────────┐
        │  Central Timeline            │
        │  (All activities logged)     │
        └────────┬────────────────────┘
                 │
        ┌────────▼────────────────────┐
        │  Dashboard                   │
        │  ├─ KPIs (metrics)           │
        │  ├─ Consistency (heatmap)    │
        │  ├─ Avatar info              │
        │  └─ Today's quests           │
        └──────────────────────────────┘
```

---

## Recommended Optimizations

### 1. Consolidate Redundant Routes
```
BEFORE:
  /quests → Missions.jsx → MissionBoard
  /missions → Missions.jsx → MissionBoard
  /avatar → EquipmentInventory
  /equipment → EquipmentInventory

AFTER:
  /quests → Missions.jsx (primary)
  /missions → redirect to /quests
  /avatar → Progress.jsx Avatar tab (primary)
  /equipment → sub-route of /avatar or separate page
```

### 2. Clarify Track Page Status
```
OPTION A (Keep Hidden):
  - Remove /track route if deprecated
  - Keep individual module pages
  - Make sure all are accessible from More menu

OPTION B (Promote to Primary):
  - Add to bottom nav as 4th or 5th tab
  - Use as main activity tracking hub
  - Rename to "Activities" or "Logging"

OPTION C (Make Secondary):
  - Keep /track available
  - Add to More menu under "Life Tracking"
  - Don't add to primary nav
```

### 3. Reorganize More Menu
```
BEFORE:
  Planning & Organization
  Finances
  Gamification (3 items)
  Customization
  Settings

AFTER:
  Primary Shortcuts
  ├─ My Missions & Quests
  ├─ My Rewards
  └─ My Discoveries

  Life Tracking
  ├─ Productivity Logs
  ├─ Health & Fitness
  ├─ Habits & Consistency
  └─ Journal

  Planning
  ├─ Calendar
  └─ Purpose & Goals

  Settings
  ├─ Profile
  ├─ Preferences
  ├─ Integrations
  └─ About
```

### 4. Equipment Management UX
```
BETTER FLOW:
  Bottom Nav → Progress
             → Avatar Tab
                → Quick Equipment Link
                → Expanded equipment editor (modal or page)

  OR:
  Progress → Avatar Tab
          → Collapse equipment section
          → Link to /avatar as dedicated equipment page
```

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Primary Navigation Tabs | 5 |
| Secondary Features | 8+ |
| Total Route Endpoints | 20+ |
| Page Components (JSX) | 24 |
| Feature Modules | 10+ |
| Gamification Systems | 8 |
| Life Tracking Modules | 8 |
| Equipment Slots | 7 |
| Rarity Tiers | 5-6 |
| Mission Difficulties | 4 |
| Reward Categories | 5 |
| Stat Types | 5 |
| Avatar Evolution Stages | 8+ |
| Sub-tab Pages | 8 |

---

*Last Updated: Based on audit of current codebase as of 2024*
