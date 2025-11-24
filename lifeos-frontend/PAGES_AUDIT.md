# LifeOS Frontend - Comprehensive Pages Audit

## Executive Summary

The app has a **mobile-first, tab-based architecture** with 5 main bottom navigation tabs and an extensive secondary "More" menu. The app is heavily gamified with XP/leveling, missions, rewards, discoveries, and character progression.

**Total Main Pages: 5**
**Total Feature Pages: 8+**
**Total Gamification Features: 4 distinct systems**

---

## MAIN NAVIGATION STRUCTURE

### Bottom Navigation (Mobile-First - 5 Tabs)
All users see these 5 primary tabs at the bottom on mobile, sidebar on desktop:

```
[Home] [Quests] [Progress] [Avatar] [More]
```

---

## MAIN PAGES (5)

### 1. **Home / Dashboard (DashboardNew.jsx)**
**Route:** `/`
**Full Title:** "Nexus - Central Command Hub"

**Main Purpose:**
- Central hub showing all key systems at a glance
- Unified dashboard combining multiple features into one comprehensive view

**Key Features:**
- **Avatar Progression Section** - Visual avatar display with level/XP
- **Quest Board** - Today's active quests with XP claim functionality
- **Key Metrics Grid (KpiGrid)** - Important KPIs across all life dimensions
- **Consistency Heatmap** - Year-long activity constellation showing daily engagement
- **XP/Level System** - Shows level, current XP, XP to next level
- **Level-up Notifications** - Epic haptic feedback on level up
- **Toast Notifications** - In-app notifications system

**Related Pages:** All other pages feed data back to this dashboard

**Data Flows:**
- Receives XP claims from Quest Board
- Displays avatar stats from Progress page
- Shows consistency metrics across all tracked modules

---

### 2. **Quests (Missions.jsx)**
**Route:** `/quests`
**Full Title:** "Mission Control" (in MissionBoard.jsx)

**Main Purpose:**
- Accept and track daily/weekly missions
- Complete missions to earn XP and Cosmic Credits
- Mission difficulty scaling system

**Key Features:**
- **Mission Board Component** - Grid of available and active missions
- **Difficulty Tiers:**
  - Routine (Star icon)
  - Moderate (Target icon)
  - Challenging (Zap icon)
  - Cosmic (Trophy icon)
- **Active Missions Tab** - Shows progress with completion percentage bars
- **Available Missions Tab** - Browse and accept new missions
- **Cosmic Currency Display** - Shows current Cosmic Credits balance
- **Progress Tracking** - Real-time completion percentage for active missions
- **XP/Credit Rewards** - Each mission has XP and credit rewards
- **Cosmic Narrative** - Flavor text for missions

**Related Pages:**
- Feeds XP to Dashboard
- Credits earned go toward Rewards

**API Integration:**
- `useMissions()` - Fetch all available missions
- `useUserMissions()` - Get active user missions
- `useStartMission()` - Accept a mission
- `useCompleteMission()` - Complete and claim rewards
- `useCosmicCurrency()` - Get currency balance

---

### 3. **Progress (Progress.jsx)**
**Route:** `/progress`
**Full Title:** "Character Progression Hub" (4-tab system)

**Main Purpose:**
- Manage character/avatar evolution and progression
- View skills, skill tree, and consistency streaks
- Monitor leveling and prestige system

**Key Sub-Tabs (4):**

#### Tab A: Avatar (Character Display)
- **AvatarRenderer** - 256x256 animated avatar display
- **Prestige System** - Badges showing prestige level (✨ Prestige N)
- **Level Display** - Current level and visual title (e.g., "Stardancer")
- **XP Progress Bar** - Shows progress to next level
- **Character Stats Grid** - 4-stat display (varies per evolution)
- **Quick Links:**
  - Evolution Page - View all avatar stages
  - Equipment Page - Manage equipped gear

#### Tab B: Constellations (Skills)
- **SkillsNew Component** - Skill management and progression
- **Skill Cards** - Each skill shows level, experience, and progression
- **Skill Tree Integration** - Visual skill tree connections

#### Tab C: Skill Tree (SkillTreeNew.jsx)
- **Visual Skill Tree** - Node-based skill progression system
- **Large component** (38KB) - Complex skill progression visualization
- **Skill Dependencies** - Prerequisites for unlocking skills
- **Performance Tracking** - Practice logs and real-world usage

#### Tab D: Stats (Streaks.jsx)
- **Consistency Streaks** - Daily/weekly/monthly activity streaks
- **Habit Tracking** - Monitor consistency across modules

**Related Pages:**
- Links to Evolution showcase
- Links to Equipment inventory
- Feeds progression data to Dashboard

**Data Integration:**
- Uses `useAvatarStore()` for level, XP, prestige, stats
- `getStageByLevel()` determines avatar evolution stage

---

### 4. **Avatar Inventory (EquipmentInventory.jsx)**
**Route:** `/avatar` (Also `/equipment`)
**Full Title:** "⚔️ Equipment & Arsenal"

**Main Purpose:**
- Manage character equipment and inventory
- Equip items to boost character stats
- Browse equipment by slot and rarity

**Key Features:**
- **7 Equipment Slots:**
  - Helmet (⛑️)
  - Chest (🦺)
  - Weapon (⚔️)
  - Shield (🛡️)
  - Cape (🧥)
  - Ring (💍)
  - Amulet (📿)

- **Rarity System (5 Tiers):**
  - Common (White) - No glow
  - Uncommon (Green) - No glow
  - Rare (Blue) - 10px glow
  - Epic (Purple) - 15px glow
  - Legendary (Orange) - 20px glow

- **Stat Bonuses Per Item:**
  - Defense
  - Strength
  - Vitality
  - Intelligence
  - Wisdom

- **Equipment Selection UI:**
  - Left panel: Equipped items grid
  - Right panel: Available items for selected slot
  - Filter by rarity
  - Visual stat calculations

- **Dev Mode:**
  - Load all equipment from database
  - Useful for testing

**Related Pages:**
- Accessed from Progress tab Avatar section
- Equipment affects stats on avatar display
- Stats shown in avatar section

**Data Integration:**
- Uses `useGamificationStore()` for inventory
- Manages `equippedItems` and `ownedEquipment`
- Supabase integration for equipment database

---

### 5. **More / Galaxy (More.jsx)**
**Route:** `/more`
**Full Title:** "Galaxy - Access additional features"

**Main Purpose:**
- Navigation hub for secondary features
- Organized by feature category
- Gateway to all non-primary features

**Sections:**

#### Planning & Organization
- **Astral Map** (`/calendar`) - Calendar and time blocking
- **North Star** (`/purpose`) - Purpose/values tracking

#### Finances
- **Nebula** (`/financial`) - Income/expense tracking

#### Gamification
- **Missions & Quests** (`/missions`) - Duplicate of quests tab (REDUNDANCY)
- **Reward Marketplace** (`/rewards`) - Spend credits on rewards
- **Discoveries** (`/discoveries`) - Achievements and discovery system

#### Customization
- **Equipment** (`/equipment`) - Duplicate of avatar equipment

#### Settings
- **Settings** (`/settings`) - App configuration

**Related Pages:** Links to all other features in the app

---

## SECONDARY PAGES (Accessed from More or Direct Routes)

### **Missions & Quests** (Missions.jsx)
**Route:** `/missions` (Also accessible as `/quests`)
- Duplicate of Quests tab (REDUNDANCY - see below)

---

### **Rewards** (Rewards.jsx)
**Route:** `/rewards`
**Component:** RewardMarketplace.jsx

**Main Purpose:**
- Spend Cosmic Credits on self-defined rewards
- Reward system for gamification motivation

**Key Features:**
- **Reward Categories:**
  - Entertainment (🎮)
  - Food & Treats (🍕)
  - Activities (🎯)
  - Rest & Relax (🛋️)
  - Custom (✨)

- **Currency Display:**
  - Current Cosmic Credits balance
  - Lifetime credits earned
  - Total spent statistics
  - Cheapest reward tracker

- **Reward Cards:**
  - Name and description
  - Cost in credits
  - Category tag
  - Purchase functionality
  - Availability checking

- **Add Reward Modal** - Custom reward creation (placeholder)

**Related Pages:**
- Feeds back from Missions earning credits
- Motivation system for completing tasks

**Data Integration:**
- `useRewards()` - Fetch reward list
- `useCreateReward()` - Create custom reward
- `useRedeemReward()` - Purchase reward
- `useCosmicCurrency()` - Get currency data

---

### **Discoveries** (Discoveries.jsx)
**Route:** `/discoveries`
**Component:** DiscoveryGallery.jsx

**Main Purpose:**
- Achievement/discovery system
- Unlock achievements through gameplay
- Track progression and unlock status

**Key Features:**
- **Unlock Status Tracking:**
  - Show unlocked vs locked discoveries
  - Progress percentage per discovery
  - Unlock timestamp

- **Summary Stats:**
  - Unlocked count / Total (e.g., 5/12)
  - Total points accumulated
  - Completion percentage
  - Rarest item unlocked (Common → Cosmic)

- **Filtering System:**
  - Status: All / Unlocked / Locked
  - Rarity: All / Common / Rare / Epic / Legendary / Cosmic

- **Discovery Card Display:**
  - Grid layout with 3-4 columns
  - Animated entrance/exit
  - Visual status indicators
  - Rarity badges

**Related Pages:**
- Unlocked through other module activities
- Points contribute to overall progression

**Data Integration:**
- `useDiscoveries()` - Fetch all discoveries
- `useUserDiscoveries()` - Get user's unlocked discoveries
- Merge unlocked status with discovery data

---

### **Learn / Knowledge** (KnowledgeNew.jsx)
**Route:** `/learn`
**Component:** KnowledgeModule.jsx

**Main Purpose:**
- Knowledge management system
- Apple Notes + Obsidian hybrid
- Track books, podcasts, notes, ideas

**Key Features:**
- **Content Types:** Notes, books, media
- **Organization:** Tag-based or hierarchical
- **Placeholder Status:** Full implementation in KnowledgeModule

**Related Pages:**
- Part of 8 core life modules
- Feeds into overall knowledge timeline

---

### **Track** (Track.jsx)
**Route:** `/track`
**Full Title:** "Tracking Hub" (4-tab system)

**Main Purpose:**
- Multi-module tracking interface
- Named tabs with cosmic theme
- Log data across multiple life areas

**Key Sub-Tabs (4):**

#### Tab A: Supernova (Productivity.jsx)
- Work sessions (Pomodoro-style)
- Projects
- Tasks
- Income tracking
- Daily focus hours
- Weekly statistics

#### Tab B: Gravity (HealthNew.jsx)
- Workouts
- Nutrition
- Sleep tracking
- Recovery metrics

#### Tab C: Orbit (HabitsNew.jsx)
- Large component (28KB)
- Habit tracking and streaks
- Daily check-ins
- Habit analytics

#### Tab D: Starlog (JournalNew.jsx)
- Journal entries
- Free-form writing
- Mood tracking
- Reflection prompts

**Related Pages:**
- Data feeds into Dashboard metrics
- Consistency tracked in Progress

---

### **Calendar** (CalendarNew.jsx)
**Route:** `/calendar`
**Title:** "Astral Map"

**Main Purpose:**
- Time blocking and calendar management
- Planned vs actual time tracking
- Energy mapping throughout the day

---

### **Purpose & Values** (PurposeValues.jsx)
**Route:** `/purpose`
**Title:** "North Star"
**Component Size:** Large (44KB)

**Main Purpose:**
- Define and track life purpose
- Values alignment
- Long-term goal setting

---

### **Financial** (Financial.jsx)
**Route:** `/financial`
**Title:** "Nebula"

**Main Purpose:**
- Income tracking
- Expense management
- Net worth tracking
- Financial goals

---

## GAMIFICATION SYSTEM OVERVIEW

The app has **4 interconnected gamification systems**:

### 1. **XP / Leveling System**
- **Current Level:** Shown on Dashboard and Progress
- **XP Progress:** Bar showing progress to next level
- **Level-Up Triggers:** Completing quests/missions
- **Exponential Scaling:** Next level XP = current × 1.2
- **Max Level:** Appears to be 7+ based on initial state
- **Integration Points:**
  - Dashboard displays level and XP
  - Progress page shows evolution stage by level
  - Quests reward XP on completion

**Key File:** `/features/quests/QuestBoard.tsx` handles XP claims

### 2. **Cosmic Currency (Credits) System**
- **Currency Name:** Cosmic Credits
- **Earning:** Missions award credits
- **Spending:** Rewards marketplace
- **Display:** Shows balance and lifetime earned
- **Tracking:** Total spent, cheapest reward

**Integration Points:**
- Missions Board shows currency balance
- Rewards page shows spending power
- Progress toward reward unlocks

### 3. **Mission / Quest System**
- **Two Components:** Quest Board (Dashboard) + Mission Board (Missions page)
- **Mission Difficulty:** 4 tiers (Routine → Cosmic)
- **Tracking:** Active missions show progress %
- **Completion:** Click "Claim Reward" when 100% done
- **Narrative:** Each mission has "cosmic narrative" flavor text

**Files:**
- `/features/quests/QuestBoard.tsx` - Dashboard quests
- `/components/missions/MissionBoard.jsx` - Full mission interface

### 4. **Achievements / Discoveries System**
- **Types:** Discoveries (unlocked through gameplay)
- **Rarity Tiers:** Common → Legendary → Cosmic (6 total)
- **Progress Tracking:** % complete before unlock
- **Point System:** Each discovery worth points when unlocked
- **Stats:** Tracks unlocked count, total points, completion %

---

## CHARACTER PROGRESSION SYSTEM

### Avatar Evolution
- **Stages:** Multiple evolution stages based on level
- **Stage Tracking:** `getStageByLevel(level, prestige)`
- **Stage Display:** Name, category, description
- **Prestige System:** Badge showing prestige level
- **Visual:** Animated 256x256 character render

### Equipment System
- **Slots:** 7 equipment slots
- **Rarity:** 5 tiers with visual glow effects
- **Stats:** 5 stat types (Defense, Strength, Vitality, Intelligence, Wisdom)
- **Equipment Inventory:** Shows equipped vs available items
- **Filtering:** By slot and rarity

### Skill System
- **Skills Page:** "Constellations" - skill management
- **Skill Tree:** Visual node-based progression (38KB component)
- **Progression:** Leveling and experience per skill
- **Dependencies:** Prerequisites for skills
- **Real-World Application:** Track skill usage in real activities

---

## PAGE RELATIONSHIP MAP

```
DashboardNew (Home)
├── Shows data from: Quest Board, KPI Grid, Heatmap
├── Links to: All modules indirectly
└── Central hub for all systems

Missions/Quests
├── Feeds: XP to Dashboard, Credits to Rewards
├── Sources: Mission Board component
└── Related: Discoveries (achievements for completing)

Progress
├── Avatar Tab
│   ├── Shows: Level, XP, Stats, Evolution stage
│   ├── Links: Equipment inventory, Evolution showcase
│   └── Sources: Avatar store, Evolution data
├── Constellations Tab (Skills)
├── Skill Tree Tab
└── Stats Tab (Streaks)

Equipment
├── Sources: Gamification store, Supabase database
├── Affects: Avatar stats display
└── Used By: Avatar display and stat calculations

More / Galaxy
├── Navigation hub
└── Links: Calendar, Purpose, Financial, Missions, Rewards, Discoveries, Equipment, Settings

Rewards
├── Sources: Cosmic Credits from Missions
├── Types: Entertainment, Food, Activities, Rest, Custom
└── Motivation: Spend credits on personal rewards

Discoveries
├── Unlock: Through gameplay achievements
├── Track: Unlock status and progress
└── Reward: Points accumulated

Track (Multi-module)
├── Supernova: Productivity tracking
├── Gravity: Health/fitness tracking
├── Orbit: Habits and consistency
└── Starlog: Journaling and reflection
```

---

## IDENTIFIED ISSUES & REDUNDANCIES

### 🔴 CRITICAL REDUNDANCY #1: Quests/Missions
**Problem:** Two different pages show missions
- Dashboard has "Quest Board" (QuestBoard.tsx)
- Bottom nav has "Quests" tab → `/quests` → Missions.jsx
- More menu has "Missions & Quests" → `/missions` → Also Missions.jsx
- `/quests` and `/missions` both route to the same page

**Impact:**
- Confusing for users
- Unclear which is "primary"
- Multiple entry points to same feature

**Recommendation:**
```
BEFORE:
- "/" shows Quest Board (limited, for Dashboard only)
- "/quests" shows full MissionBoard
- "/missions" shows same MissionBoard
- "/more" links to "/missions"

AFTER OPTION A - Make Missions Primary:
- "/" shows daily summary quests only
- "/quests" removed or redirects to "/missions"
- "/missions" is primary missions interface
- "/more" links to "/missions"

AFTER OPTION B - Separate Quest Types:
- "/" shows 3-5 quick daily quests (Dashboard)
- "/quests" shows story/campaign quests
- "/missions" shows all active missions
```

### 🟡 MEDIUM ISSUE: Avatar Equipment Slot Inconsistency
**Problem:** Equipment inventory at `/avatar` but quick-link says "Equipment"
- Bottom nav says "Avatar" → `/avatar` → Shows equipment, not avatar
- Progress page has actual avatar display
- Confusing navigation hierarchy

**Recommendation:**
```
BETTER STRUCTURE:
- Bottom nav "/progress" → Avatar display with stats
- Bottom nav link should stay as "Avatar"
- OR rename bottom nav to "Character"
- Progress → Avatar tab should be primary
- Equipment should be secondary or sub-page
```

### 🟡 MEDIUM ISSUE: Track Page Existence
**Problem:** Track page (`/track`) exists and works, but isn't in main navigation
- Accessible at `/track` directly
- Contains Supernova, Gravity, Orbit, Starlog modules
- Hidden from bottom nav and More menu
- Might be intended as deprecated in favor of modular pages

**Recommendation:**
- Either integrate into navigation or remove
- Consider: Single Track page vs. individual module pages
- Currently: Individual pages (Productivity, Health, Habits, Journal) seem to be the design direction

### 🟡 MEDIUM ISSUE: Unused Demo Pages
**Problem:** Several demo/test pages in routes:
- `/gamification` - AtomCosmosDemo
- `/cosmic-evolution` - CosmicEvolutionDemo
- `/constellations-test` - ConstellationsTestPage
- `/constellations-demo` - ConstellationsDemo
- `/evolution` - EvolutionShowcase

**Recommendation:**
- Remove from App.jsx or put in separate `/dev` route
- Clean up codebase for production
- These are development artifacts

### 🟢 GOOD: Cosmic Theme Consistency
- All pages use cosmic naming (Nexus, Supernova, Gravity, Orbit, Starlog, Astral Map, North Star, Nebula, Galaxy)
- Emoji-heavy UI with consistent dark theme
- Good naming consistency

---

## NAVIGATION ARCHITECTURE SUMMARY

### Current Mobile Navigation (Bottom Tabs - 5)
```
[Home] [Quests] [Progress] [Avatar] [More]
  /       /quests   /progress  /avatar   /more
```

### Desktop Navigation (Sidebar)
- Same structure as mobile bottom nav
- Fixed 280px sidebar
- Hamburger menu on mobile to access sidebar

### Secondary Features (via More Menu)
```
Planning & Organization
  └─ Astral Map (/calendar)
  └─ North Star (/purpose)

Finances
  └─ Nebula (/financial)

Gamification
  └─ Missions & Quests (/missions) ❌ REDUNDANT
  └─ Reward Marketplace (/rewards)
  └─ Discoveries (/discoveries)

Customization
  └─ Equipment (/equipment) ❌ SHOULD BE IN AVATAR

Settings
  └─ Settings (/settings)
```

---

## FILE ORGANIZATION

### Pages Directory
```
src/pages/
├── DashboardNew.jsx          ✓ Main hub
├── Missions.jsx              ✓ Gamification
├── Progress.jsx              ✓ Character progression
├── EquipmentInventory.jsx    ✓ Character equipment
├── More.jsx                  ✓ Navigation hub
├── Track.jsx                 ❓ Hidden/deprecated?
├── ProductivityNew.jsx       ✓ Productivity tracking
├── HealthNew.jsx             ✓ Health tracking
├── HabitsNew.jsx             ✓ Habit tracking
├── JournalNew.jsx            ✓ Journaling
├── JournalWrite.jsx          ✓ Journal entry editor
├── JournalMonth.jsx          ✓ Journal calendar
├── KnowledgeNew.jsx          ✓ Knowledge/learn module
├── CalendarNew.jsx           ✓ Calendar/time blocking
├── PurposeValues.jsx         ✓ Purpose/values
├── Financial.jsx             ✓ Finances
├── SkillsNew.jsx             ✓ Skills (Constellations)
├── SkillTreeNew.jsx          ✓ Skill tree visualization
├── Streaks.jsx               ✓ Streak tracking
└── [Demo/Test Pages]         ❌ Should be removed
```

### Components Directory
```
src/components/
├── missions/MissionBoard.jsx        ✓ Mission interface
├── rewards/RewardMarketplace.jsx    ✓ Reward system
├── discoveries/DiscoveryGallery.jsx ✓ Achievements
├── avatar/
│   ├── EquipmentInventory.jsx       ✓ Equipment management
│   ├── AvatarRenderer.jsx           ✓ Avatar display
│   └── EvolutionShowcase.jsx        ✓ Evolution stages
├── dashboard/
│   └── AvatarDashboardSection.jsx   ✓ Avatar on dashboard
├── [Other modules]
└── layout/
    ├── MainLayout.jsx
    ├── TopBar.jsx
    ├── BottomNav.jsx
    └── Sidebar.jsx
```

### Features Directory
```
src/features/
├── quests/
│   ├── QuestBoard.tsx               ✓ Quest display
│   ├── QuestCard.tsx
│   └── useQuestStore.ts
├── missions/                        ✓ Mission management
├── rewards/                         ✓ Reward system
├── discoveries/                     ✓ Achievement system
├── avatar/                          ✓ Avatar rendering
├── cosmic-evolution/                ✓ Evolution system
├── constellations/                  ✓ Skills visualization
├── kpis/
│   └── KpiGrid.tsx                  ✓ Metrics display
├── consistency/
│   └── ConsistencyHeatmap.tsx       ✓ Activity heatmap
├── tree/
│   └── Tree.tsx                     ✓ Skill tree
└── [Other features]
```

---

## GAMIFICATION FEATURE CHECKLIST

```
✓ XP / Leveling System
  ├─ Levels (1-7+)
  ├─ Experience points
  ├─ Level-up notifications
  └─ Exponential scaling

✓ Avatar / Character System
  ├─ Avatar rendering (3D/animated)
  ├─ Evolution stages by level
  ├─ Character stats
  └─ Prestige levels

✓ Equipment / Gear System
  ├─ 7 equipment slots
  ├─ 5 rarity tiers
  ├─ Stat bonuses
  └─ Equipped/inventory management

✓ Skill System
  ├─ Individual skills with levels
  ├─ Skill tree visualization
  ├─ Dependencies/prerequisites
  └─ Real-world application tracking

✓ Mission / Quest System
  ├─ Available missions list
  ├─ Active mission tracking
  ├─ Difficulty tiers (4)
  ├─ Progress tracking (%)
  ├─ XP/Credit rewards
  └─ Cosmic narrative flavor text

✓ Cosmic Currency System
  ├─ Credits earned from missions
  ├─ Credits spent on rewards
  ├─ Currency balance tracking
  └─ Lifetime statistics

✓ Reward System
  ├─ Reward categories (5)
  ├─ Cost in credits
  ├─ Custom reward creation
  └─ Purchase/redemption

✓ Achievement / Discovery System
  ├─ Unlock tracking
  ├─ Progress percentage
  ├─ Rarity tiers (6)
  ├─ Point accumulation
  └─ Filtering and sorting

✓ Streak / Consistency Tracking
  ├─ Daily streaks
  ├─ Weekly consistency
  ├─ Heatmap visualization
  └─ Consistency rewards

✓ Progression Timeline
  ├─ Central timeline (mentioned in CLAUDE.md)
  └─ All activities logged to timeline
```

---

## RECOMMENDED NAVIGATION STRUCTURE (OPTIMIZED)

### Primary Navigation (5 Tabs - Keep As Is)
```
[Home]    [Progress]   [Quests]   [Rewards]   [More]
  /          /progress   /quests    /rewards    /more
Nexus      Character     Missions   Rewards     Galaxy
Home       Skills        Quests     Marketplace Nav Hub
Avatar     Tree          & Track
KPIs       Streaks
Timeline
```

### Alternative Structure
```
[Home]       [Track]       [Progress]   [Avatar]    [More]
  /          /track        /progress    /avatar     /more
Dashboard   Productivity  Skills       Equipment   Settings
            Health        Streaks      Gear        Learning
            Habits        Evolution    Inventory   Calendar
            Journal                               Finances
                                                  Purpose
```

### Secondary Features (More Menu - Reorganized)
```
Life Tracking
  ├─ Productivity (Supernova)
  ├─ Health (Gravity)
  ├─ Habits (Orbit)
  └─ Journal (Starlog)

Planning
  ├─ Calendar (Astral Map)
  └─ Purpose (North Star)

Finances
  └─ Financial (Nebula)

Game Features
  ├─ Missions ← Remove from here (PRIMARY)
  ├─ Rewards ← Remove from here (PRIMARY)
  ├─ Discoveries
  ├─ Skills (Constellations)
  └─ Skill Tree

Customization
  └─ Equipment

Settings
  └─ Settings
```

---

## DATA FLOW ARCHITECTURE

```
Missions (Quests)
    ↓ (Earns XP)
Dashboard (Nexus)
    ↓ (Displays)
  - Level/XP
  - Today's quests
  - KPIs
  - Consistency heatmap
    ↓
Progress Page
    ↓ (Shows)
  - Avatar (evolution stage)
  - Current level
  - Skills (Constellations)
  - Skill Tree
  - Streaks

Equipment
    ↓ (Affects)
  Avatar stats display

Missions (Quests)
    ↓ (Earns Credits)
Rewards Marketplace
    ↓ (Spend on)
  Personal rewards

Gameplay Activities
    ↓ (Unlock)
Discoveries
    ↓ (Grant Points)
  Progression metric

Track Modules
    ├─ Supernova (Productivity)
    ├─ Gravity (Health)
    ├─ Orbit (Habits)
    └─ Starlog (Journal)
    ↓ (Feed data into)
Dashboard KPIs & Consistency
```

---

## STORE/STATE MANAGEMENT

### Key Stores
- `useAvatarStore()` - Level, XP, prestige, stats
- `useGamificationStore()` - Equipment, inventory, equipped items
- `useEvolutionStore()` - Avatar evolution stage and level
- `useQuestStore()` - Quest state management

### API Hooks
- `useMissions()` - Fetch missions
- `useUserMissions()` - User's active missions
- `useStartMission()` - Start a mission
- `useCompleteMission()` - Complete and claim rewards
- `useCosmicCurrency()` - Currency balance
- `useRewards()` - Fetch rewards
- `useCreateReward()` - Create custom reward
- `useRedeemReward()` - Redeem reward
- `useDiscoveries()` - Fetch all discoveries
- `useUserDiscoveries()` - User's unlocked discoveries

---

## STYLING & THEMING

- **Dark Mode:** Always dark theme (`#0a0e1a` primary background)
- **Color Palette:**
  - Purple/Pink: Primary actions and highlights
  - Blue: Secondary elements
  - Amber/Yellow: Currency and warnings
  - Green: Success and health
  - Orange/Red: Danger and cosmic difficulty
- **CSS Classes:**
  - `cosmic-title`, `cosmic-panel`, `cosmic-border`, `cosmic-lift`, `cosmic-glow` - Themed elements
  - Tailwind CSS for utility styling
- **Animation:** Framer Motion for component animations
- **Icons:** Lucide React for UI icons, emoji for thematic icons

---

## PERFORMANCE NOTES

- Lazy-loaded pages in App.jsx using React.lazy()
- React Query for data caching (5 min staleTime, 10 min cacheTime)
- Suspense boundaries with LoadingSpinner fallback
- Large components:
  - SkillTreeNew.jsx (38KB) - Could benefit from splitting
  - PurposeValues.jsx (44KB) - Could benefit from splitting
  - HabitsNew.jsx (28KB) - Large but manageable

---

## CONCLUSION

The app has a **well-structured, deeply gamified personal OS** with:
- Clear primary navigation (5 main tabs)
- Comprehensive gamification systems (4 interconnected)
- Character progression mechanics
- Multiple tracking modules
- Secondary feature hub (More menu)

**Main issues to address:**
1. Mission/Quest redundancy (pick one primary location)
2. Avatar equipment navigation confusion
3. Remove demo/test pages from production routing
4. Consider consolidating Track page or add to primary nav

**Strengths:**
- Consistent cosmic theming
- Well-organized component structure
- Multiple gamification systems working together
- Clear data flow patterns
- Mobile-first responsive design
