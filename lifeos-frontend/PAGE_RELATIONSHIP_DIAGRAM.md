# LifeOS Page Relationships & Data Flow Diagrams

## 1. PRIMARY NAVIGATION STRUCTURE

```
                              ┌─────────────────────┐
                              │   MAIN LAYOUT       │
                              │  (MainLayout.jsx)   │
                              └──────────┬──────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
            ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
            │  Sidebar     │    │   TopBar     │    │  BottomNav   │
            │ (Desktop)    │    │  (All)       │    │  (Mobile)    │
            └──────────────┘    └──────────────┘    └──────┬───────┘
                                                           │
                    ┌──────────────────────────────────────┼──────────────────┐
                    │                                      │                  │
                    ▼                                      ▼                  ▼
            ┌─────────────────┐              ┌─────────────────┐    ┌────────────┐
            │   MAIN CONTENT  │              │  5 PRIMARY TABS  │    │ EACH TAB   │
            │   (Route-based) │              │                 │    │ RENDERS    │
            └─────────────────┘              │ 🏠 Home         │    │ DIFFERENT  │
                                             │ ⚔️  Quests      │    │ PAGE       │
                                             │ 📈 Progress     │    └────────────┘
                                             │ 🧑 Avatar       │
                                             │ ⋯  More         │
                                             └─────────────────┘
```

---

## 2. PAGE HIERARCHY & FEATURE TREE

```
LIFEOS
│
├─ PRIMARY PAGES (Bottom Nav - 5 tabs)
│  │
│  ├─ HOME / NEXUS (/)
│  │  ├─ Component: DashboardNew.jsx
│  │  ├─ Features:
│  │  │  ├─ Avatar Dashboard Section (visual + level/XP)
│  │  │  ├─ Quest Board (quick daily quests)
│  │  │  ├─ KPI Grid (key metrics)
│  │  │  ├─ Consistency Heatmap (year-long activity)
│  │  │  └─ Level-up notifications
│  │  └─ Data Sources:
│  │     ├─ Avatar progression
│  │     ├─ Quest system
│  │     └─ All tracked activities
│  │
│  ├─ QUESTS / MISSIONS (/quests)
│  │  ├─ Component: Missions.jsx → MissionBoard.jsx
│  │  ├─ Features:
│  │  │  ├─ Available Missions grid
│  │  │  ├─ Active Missions with progress bars
│  │  │  ├─ 4-tier difficulty system
│  │  │  ├─ Cosmic narrative flavor text
│  │  │  ├─ XP reward display
│  │  │  ├─ Credit reward display
│  │  │  └─ Accept/Complete actions
│  │  └─ Data Flow Output:
│  │     ├─ XP → Avatar/Level system
│  │     ├─ Credits → Reward system
│  │     └─ Progress → Dashboard
│  │
│  ├─ PROGRESS / CHARACTER (/)
│  │  ├─ Component: Progress.jsx (4-tab container)
│  │  │
│  │  ├─ TAB 1: AVATAR
│  │  │  ├─ Component: AvatarRenderer
│  │  │  ├─ Shows: Character visual, level, XP bar, stats
│  │  │  ├─ Features:
│  │  │  │  ├─ Animated 256px avatar render
│  │  │  │  ├─ Prestige badge
│  │  │  │  ├─ Evolution stage display
│  │  │  │  ├─ Stat grid (4-5 stats)
│  │  │  │  ├─ Quick links to Equipment
│  │  │  │  └─ Quick links to Evolution showcase
│  │  │  └─ Data Source: Avatar store
│  │  │
│  │  ├─ TAB 2: CONSTELLATIONS (Skills)
│  │  │  ├─ Component: SkillsNew.jsx
│  │  │  ├─ Shows: Individual skill cards with progression
│  │  │  └─ Features:
│  │  │     ├─ Skill level display
│  │  │     ├─ Experience bars per skill
│  │  │     └─ Skill descriptions
│  │  │
│  │  ├─ TAB 3: SKILL TREE
│  │  │  ├─ Component: SkillTreeNew.jsx (38KB)
│  │  │  ├─ Shows: Visual node-based skill progression
│  │  │  └─ Features:
│  │  │     ├─ Interactive skill tree map
│  │  │     ├─ Dependencies visualization
│  │  │     ├─ Unlock prerequisites
│  │  │     └─ Real-world usage tracking
│  │  │
│  │  └─ TAB 4: STATS (Streaks)
│  │     ├─ Component: Streaks.jsx
│  │     ├─ Shows: Consistency metrics
│  │     └─ Features:
│  │        ├─ Daily streaks
│  │        ├─ Weekly consistency
│  │        ├─ Monthly tracking
│  │        └─ Habit completion rates
│  │
│  ├─ AVATAR / EQUIPMENT (/avatar)
│  │  ├─ Component: EquipmentInventory.jsx
│  │  ├─ Features:
│  │  │  ├─ 7 Equipment Slots
│  │  │  │  ├─ Helmet (⛑️)
│  │  │  │  ├─ Chest (🦺)
│  │  │  │  ├─ Weapon (⚔️)
│  │  │  │  ├─ Shield (🛡️)
│  │  │  │  ├─ Cape (🧥)
│  │  │  │  ├─ Ring (💍)
│  │  │  │  └─ Amulet (📿)
│  │  │  ├─ 5 Rarity Tiers
│  │  │  │  ├─ Common (white, no glow)
│  │  │  │  ├─ Uncommon (green, no glow)
│  │  │  │  ├─ Rare (blue, 10px glow)
│  │  │  │  ├─ Epic (purple, 15px glow)
│  │  │  │  └─ Legendary (orange, 20px glow)
│  │  │  ├─ Stat Bonuses
│  │  │  │  ├─ Defense
│  │  │  │  ├─ Strength
│  │  │  │  ├─ Vitality
│  │  │  │  ├─ Intelligence
│  │  │  │  └─ Wisdom
│  │  │  ├─ Equipment Selection UI
│  │  │  │  ├─ Left panel: Equipped items grid
│  │  │  │  ├─ Right panel: Available items
│  │  │  │  └─ Filters: By rarity
│  │  │  └─ Dev Mode: Load all from database
│  │  └─ Data Flow:
│  │     ├─ Equipment stats → Avatar display
│  │     └─ Equipped items → Avatar calculation
│  │
│  └─ MORE / GALAXY (/more)
│     ├─ Component: More.jsx
│     ├─ Type: Navigation hub (not a feature page)
│     └─ Sections:
│        ├─ Planning & Organization
│        │  ├─ Calendar (Astral Map) → /calendar
│        │  └─ Purpose (North Star) → /purpose
│        ├─ Finances
│        │  └─ Nebula → /financial
│        ├─ Gamification
│        │  ├─ Missions & Quests → /missions ⚠️ REDUNDANT
│        │  ├─ Rewards → /rewards
│        │  └─ Discoveries → /discoveries
│        ├─ Customization
│        │  └─ Equipment → /equipment ⚠️ REDUNDANT
│        └─ Settings
│           └─ Settings → /settings
│
└─ SECONDARY FEATURES
   │
   ├─ GAMIFICATION FEATURES
   │  │
   │  ├─ MISSIONS (/missions) ⚠️ REDUNDANT WITH /quests
   │  │  ├─ Component: MissionBoard.jsx
   │  │  └─ [Same as Quests page]
   │  │
   │  ├─ REWARDS (/rewards)
   │  │  ├─ Component: RewardMarketplace.jsx
   │  │  ├─ Features:
   │  │  │  ├─ Reward categories (5 types)
   │  │  │  ├─ Credit balance display
   │  │  │  ├─ Lifetime earned stats
   │  │  │  ├─ Total spent tracking
   │  │  │  ├─ Reward cards with costs
   │  │  │  ├─ Add custom reward modal
   │  │  │  └─ Purchase functionality
   │  │  └─ Data Source: Cosmic currency from missions
   │  │
   │  └─ DISCOVERIES (/discoveries)
   │     ├─ Component: DiscoveryGallery.jsx
   │     ├─ Features:
   │     │  ├─ Unlock status tracking
   │     │  ├─ Summary stats
   │     │  │  ├─ Unlocked count / Total
   │     │  │  ├─ Total points accumulated
   │     │  │  ├─ Completion %
   │     │  │  └─ Rarest discovered
   │     │  ├─ Filtering system
   │     │  │  ├─ Status: All / Unlocked / Locked
   │     │  │  └─ Rarity: 6 tiers
   │     │  ├─ Grid display (3-4 columns)
   │     │  └─ Animated cards
   │     └─ Data Source: Achievements unlocked through gameplay
   │
   ├─ LIFE TRACKING FEATURES
   │  │
   │  ├─ TRACK (HIDDEN) (/track)
   │  │  ├─ Component: Track.jsx (4-tab container)
   │  │  ├─ Status: NOT in primary navigation
   │  │  │
   │  │  ├─ TAB: SUPERNOVA (Productivity)
   │  │  │  ├─ Component: ProductivityNew.jsx
   │  │  │  ├─ Tracks: Work sessions, projects, tasks, income
   │  │  │  └─ Metrics: Daily/weekly focus hours
   │  │  │
   │  │  ├─ TAB: GRAVITY (Health)
   │  │  │  ├─ Component: HealthNew.jsx
   │  │  │  ├─ Tracks: Workouts, nutrition, sleep, recovery
   │  │  │  └─ Metrics: Activity level, sleep quality
   │  │  │
   │  │  ├─ TAB: ORBIT (Habits)
   │  │  │  ├─ Component: HabitsNew.jsx (28KB)
   │  │  │  ├─ Tracks: Daily habits, streaks, consistency
   │  │  │  └─ Metrics: Streak days, completion %
   │  │  │
   │  │  └─ TAB: STARLOG (Journal)
   │  │     ├─ Components: JournalNew.jsx, JournalMonth.jsx, JournalWrite.jsx
   │  │     ├─ Tracks: Daily entries, mood, reflections
   │  │     └─ Features: Month calendar, daily write interface
   │  │
   │  ├─ LEARN / KNOWLEDGE (/learn)
   │  │  ├─ Component: KnowledgeNew.jsx → KnowledgeModule.jsx
   │  │  ├─ Title: Observatory
   │  │  ├─ Tracks: Notes, books, podcasts, ideas
   │  │  └─ Type: Notes/Obsidian hybrid
   │  │
   │  ├─ CALENDAR (/calendar)
   │  │  ├─ Component: CalendarNew.jsx
   │  │  ├─ Title: Astral Map
   │  │  ├─ Tracks: Time blocking, planned vs actual
   │  │  └─ Metrics: Energy mapping, time allocation
   │  │
   │  ├─ PURPOSE (/purpose)
   │  │  ├─ Component: PurposeValues.jsx (44KB - Large)
   │  │  ├─ Title: North Star
   │  │  ├─ Tracks: Life purpose, values, goals
   │  │  └─ Features: Values alignment, goal tracking
   │  │
   │  └─ FINANCIAL (/financial)
   │     ├─ Component: Financial.jsx → FinancialNew.jsx
   │     ├─ Title: Nebula
   │     ├─ Tracks: Income, expenses, net worth
   │     └─ Metrics: Cash flow, savings, financial goals
   │
   └─ UTILITIES
      ├─ SETTINGS (/settings)
      │  └─ App configuration and preferences
      │
      └─ JOURNAL SUBROUTES
         ├─ /journal/:year/:month → JournalMonth.jsx
         └─ /journal/:year/:month/:day/write → JournalWrite.jsx
```

---

## 3. GAMIFICATION SYSTEMS INTERCONNECTION

```
                    ┌──────────────────────┐
                    │  MISSION SYSTEM      │
                    │  - 4 difficulties    │
                    │  - Progress tracking │
                    │  - Accept/complete   │
                    └──────────┬───────────┘
                              /  \
                            /      \
                          /          \
                        /              \
                      /                  \
            ┌──────────────┐        ┌──────────────┐
            │  XP REWARDS  │        │ CREDIT REWARDS
            │              │        │              │
            │ • Level up   │        │ • Currency   │
            │ • XP display │        │ • Earn       │
            │ • Haptics    │        │ • Spend      │
            └──────┬───────┘        └────────┬─────┘
                   │                         │
                   │                         ▼
                   │              ┌──────────────────┐
                   │              │ REWARDS SYSTEM   │
                   │              │ - Categories (5) │
                   │              │ - Custom rewards │
                   │              │ - Purchase flow  │
                   │              └──────────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │  AVATAR PROGRESSION      │
        │  ├─ Level display        │
        │  ├─ XP bar               │
        │  ├─ Evolution stage      │
        │  ├─ Character stats      │
        │  └─ Prestige badges      │
        └──────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │  EQUIPMENT SYSTEM        │
        │  ├─ 7 slots              │
        │  ├─ 5 rarities           │
        │  ├─ 5 stat types         │
        │  └─ Equip/unequip        │
        └──────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │  SKILL SYSTEM            │
        │  ├─ Individual skills    │
        │  ├─ Skill tree           │
        │  ├─ Levels & XP          │
        │  └─ Dependencies         │
        └──────────────────────────┘

        ┌──────────────────────────┐
        │  ACHIEVEMENT SYSTEM      │
        │  ├─ Discoveries          │
        │  ├─ Unlock tracking      │
        │  ├─ 6 rarity tiers       │
        │  └─ Point accumulation   │
        └──────────────────────────┘

        ┌──────────────────────────┐
        │  CONSISTENCY TRACKING    │
        │  ├─ Daily streaks        │
        │  ├─ Heatmap              │
        │  ├─ Activity calendar    │
        │  └─ Habit completion     │
        └──────────────────────────┘
```

---

## 4. DATA FLOW: INPUT → PROCESSING → DISPLAY

```
┌─────────────────────────────────────────────────────────────────────┐
│                          INPUT LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ MISSION SYSTEM   │  │  TRACK MODULES   │  │  EQUIPMENT       │  │
│  │ - Accept mission │  │  - Log activity  │  │  - Equip items   │  │
│  │ - Complete       │  │  - Record metric │  │  - Change stats  │  │
│  │ - Claim reward   │  │  - Write journal │  │  - Swap gear     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                      │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                ┌────────────▼────────────┐
                │  CENTRAL STORE/STATE    │
                │  ├─ avatarStore         │
                │  ├─ gamificationStore   │
                │  ├─ evolutionStore      │
                │  └─ questStore          │
                │                         │
                │  API Hooks:             │
                │  ├─ useMissions         │
                │  ├─ useCosmicCurrency   │
                │  ├─ useRewards          │
                │  └─ useDiscoveries      │
                └────────────┬────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────────┐
│                    PROCESSING LAYER                                   │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Level Calculation     Currency Tracking      Equipment Bonus         │
│  • XP accumulation     • Credits earned       • Stat aggregation      │
│  • Threshold checks    • Credits spent        • Total stat calculation│
│  • Level up trigger    • Balance update       • Avatar effect         │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │    CENTRAL TIMELINE (All activities logged here)            │     │
│  │    - Timestamp for every action                             │     │
│  │    - Module type tracking                                   │     │
│  │    - Data aggregation for analytics                         │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                        │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                      DISPLAY LAYER                                      │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────┐  │
│  │ DASHBOARD          │  │ PROGRESS PAGE      │  │ EQUIPMENT PAGE │  │
│  │ ├─ Avatar          │  │ ├─ Avatar display  │  │ ├─ Equipped    │  │
│  │ ├─ Level/XP        │  │ ├─ Current stats   │  │ ├─ Available   │  │
│  │ ├─ Quests          │  │ ├─ Skill progress  │  │ ├─ Stat bonuses
│  │ ├─ KPIs            │  │ ├─ Streaks         │  │ └─ Filters     │  │
│  │ └─ Heatmap         │  │ └─ Evolution stage │  └────────────────┘  │
│  └────────────────────┘  └────────────────────┘                       │
│                                                                        │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────┐  │
│  │ MISSION BOARD      │  │ REWARDS PAGE       │  │ DISCOVERIES    │  │
│  │ ├─ Available       │  │ ├─ Balance         │  │ ├─ Unlocked    │  │
│  │ ├─ Active          │  │ ├─ Categories      │  │ ├─ Progress    │  │
│  │ ├─ Progress bars   │  │ ├─ Cards           │  │ ├─ Points      │  │
│  │ └─ Rewards         │  │ └─ Purchase        │  │ └─ Rarity      │  │
│  └────────────────────┘  └────────────────────┘  └────────────────┘  │
│                                                                        │
│  ┌────────────────────┐  ┌────────────────────┐                       │
│  │ TRACK MODULES      │  │ OTHER FEATURES     │                       │
│  │ ├─ Supernova       │  │ ├─ Learn           │                       │
│  │ ├─ Gravity         │  │ ├─ Calendar        │                       │
│  │ ├─ Orbit           │  │ ├─ Purpose         │                       │
│  │ └─ Starlog         │  │ └─ Financial       │                       │
│  └────────────────────┘  └────────────────────┘                       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. REDUNDANCY & OVERLAP ANALYSIS

```
┌─────────────────────────────────────────────────┐
│ REDUNDANT ROUTES (Same Component, Different URL) │
├─────────────────────────────────────────────────┤
│                                                   │
│ ISSUE #1: Missions/Quests                        │
│ ├─ /quests → Missions.jsx → MissionBoard         │
│ ├─ /missions → Missions.jsx → MissionBoard       │
│ ├─ Also: More menu → "Missions & Quests"         │
│ └─ PROBLEM: Three ways to same feature           │
│                                                   │
│ ISSUE #2: Equipment                              │
│ ├─ /avatar → EquipmentInventory.jsx              │
│ ├─ /equipment → EquipmentInventory.jsx           │
│ ├─ Also: Progress → Avatar tab                   │
│ ├─ Also: More menu → "Equipment"                 │
│ └─ PROBLEM: Multiple entry points confusing      │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## 6. COMPONENT DEPENDENCY CHAIN

```
App.jsx (Router)
  │
  ├─→ MainLayout.jsx
  │   ├─→ Sidebar.jsx (Desktop)
  │   ├─→ TopBar.jsx (All)
  │   ├─→ BottomNav.jsx (Mobile)
  │   └─→ DynamicBackground (All)
  │
  └─→ Routes (Lazy Loaded)
      │
      ├─→ DashboardNew.jsx
      │   ├─→ AvatarDashboardSection
      │   ├─→ QuestBoard (features/quests)
      │   ├─→ KpiGrid (features/kpis)
      │   └─→ ConsistencyHeatmap (features/consistency)
      │
      ├─→ Progress.jsx
      │   ├─→ AvatarRenderer (when tab='avatar')
      │   ├─→ SkillsNew.jsx (when tab='skills')
      │   ├─→ SkillTreeNew.jsx (when tab='tree')
      │   └─→ Streaks.jsx (when tab='stats')
      │
      ├─→ Missions.jsx
      │   └─→ MissionBoard.jsx
      │       ├─→ Mission Cards
      │       └─→ Progress bars
      │
      ├─→ EquipmentInventory.jsx
      │   ├─→ Equipment Slots Grid
      │   ├─→ Available Items Panel
      │   └─→ Stats Display
      │
      ├─→ More.jsx (Navigation Hub)
      │   └─→ Menu Sections
      │
      ├─→ Rewards.jsx
      │   └─→ RewardMarketplace.jsx
      │       ├─→ Reward Cards
      │       └─→ Category Filters
      │
      ├─→ Discoveries.jsx
      │   └─→ DiscoveryGallery.jsx
      │       ├─→ Discovery Cards
      │       └─→ Filters (Status, Rarity)
      │
      ├─→ Track.jsx (Hidden)
      │   ├─→ ProductivityNew.jsx (Supernova)
      │   ├─→ HealthNew.jsx (Gravity)
      │   ├─→ HabitsNew.jsx (Orbit)
      │   └─→ JournalNew.jsx (Starlog)
      │
      └─→ [Other Feature Pages]
          └─→ CalendarNew, PurposeValues, Financial, etc.
```

---

## 7. STATE MANAGEMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────┐
│          ZUSTAND STORES (Global State)          │
├─────────────────────────────────────────────────┤
│                                                  │
│ avatarStore                                      │
│ ├─ level (number)                                │
│ ├─ xp (number)                                   │
│ ├─ prestige (number)                             │
│ ├─ stats (object: Defense, Strength, etc.)       │
│ └─ setLevel, setXp, updateStats (functions)      │
│                                                  │
│ gamificationStore                                │
│ ├─ equippedItems (array)                         │
│ ├─ ownedEquipment (array)                        │
│ ├─ stats (calculated from equipment)             │
│ ├─ equipItem (function)                          │
│ └─ unequipItem (function)                        │
│                                                  │
│ evolutionStore                                   │
│ ├─ currentStage (evolution stage)                │
│ ├─ currentLevel (number)                         │
│ └─ updateEvolution (function)                    │
│                                                  │
│ questStore                                       │
│ ├─ quests (array)                                │
│ ├─ activeQuests (array)                          │
│ ├─ addQuest (function)                           │
│ └─ completeQuest (function)                      │
│                                                  │
└─────────────────────────────────────────────────┘
        ▲                      │
        │ (useState)           │ (useSelector)
        │                      │
┌───────┴──────────────────────▼──────────────────┐
│     REACT QUERY HOOKS (API Data)                │
├─────────────────────────────────────────────────┤
│                                                  │
│ useMissions() → fetch missions                   │
│ useUserMissions() → fetch active missions        │
│ useStartMission() → POST accept mission          │
│ useCompleteMission() → POST complete mission     │
│ useCosmicCurrency() → fetch currency balance     │
│ useRewards() → fetch rewards                     │
│ useRedeemReward() → POST redeem                  │
│ useDiscoveries() → fetch all discoveries         │
│ useUserDiscoveries() → fetch unlocked            │
│                                                  │
└─────────────────────────────────────────────────┘
        │
        │ (Caching: 5min staleTime)
        │
        ▼
┌─────────────────────────────────────────────────┐
│     SUPABASE DATABASE (Backend)                 │
├─────────────────────────────────────────────────┤
│                                                  │
│ Tables:                                          │
│ - users                                          │
│ - missions / user_missions                       │
│ - equipment_items / user_equipment               │
│ - discoveries / user_discoveries                 │
│ - rewards / user_rewards                         │
│ - user_stats / timeline                          │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 8. PAGE LOAD & RENDERING FLOW

```
1. App.jsx mounted
   ↓
2. Check intro screen (localStorage)
   ├─ Not shown: Skip to MainLayout
   └─ Show: IntroScreen (lazy loaded, Suspense boundary)
   ↓
3. MainLayout renders
   ├─ Sidebar (hidden on mobile)
   ├─ TopBar
   ├─ BottomNav (hidden on desktop)
   └─ Main content area
   ↓
4. Router detects URL path
   ↓
5. Lazy load appropriate page component
   ├─ With Suspense boundary
   └─ Loading fallback: LoadingSpinner
   ↓
6. Page component mounts
   ├─ Initialize state (useState)
   ├─ Fetch data (React Query hooks)
   ├─ Subscribe to stores (Zustand)
   └─ Render content
   ↓
7. Data flows in from:
   ├─ Global stores (Zustand)
   ├─ API calls (React Query)
   ├─ Local component state
   └─ URL parameters
   ↓
8. Component renders with data
   ├─ Display content
   ├─ Attach event handlers
   └─ Show animations (Framer Motion)
```

---

## 9. FEATURE MATURITY ASSESSMENT

```
PRODUCTION READY:
✓ Dashboard (DashboardNew)
✓ Mission/Quest system
✓ Progress page (Avatar, Streaks)
✓ Equipment inventory
✓ Rewards system
✓ Discoveries/Achievements
✓ Layout & Navigation
✓ Gamification framework

PARTIALLY COMPLETE:
⚠ Skill Tree (SkillTreeNew) - Large, could optimize
⚠ Habits tracking (HabitsNew) - Large, could split
⚠ Purpose/Values (PurposeValues) - Large, could split
⚠ Knowledge system - Placeholder/incomplete
⚠ Track page - Hidden from navigation

PLACEHOLDER/INCOMPLETE:
❌ Settings page
❌ Custom reward creation modal
❌ Some track modules
❌ Advanced analytics

DEVELOPMENT ARTIFACTS:
❌ Demo pages (/gamification, /cosmic-evolution, etc.)
```

---

*This diagram set provides a complete visual reference for LifeOS page structure, data flow, and relationships. For detailed descriptions, see PAGES_AUDIT.md*
