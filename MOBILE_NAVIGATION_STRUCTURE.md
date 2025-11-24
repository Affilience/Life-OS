# 🌌 Mobile-First Navigation Structure

## The 5-Tab Bottom Navigation

### Design Philosophy
- **5 tabs maximum** for optimal mobile UX
- Each tab can have **nested sub-pages** accessed via headers/buttons
- Dashboard contains **quick access widgets** to all features
- Deep features are **2 taps away maximum**

---

## THE 5 MAIN TABS

```
┌─────────────────────────────────────────────────┐
│  🏠      🎯      ⚡      👤      ⚙️            │
│ Home   Quests  Progress  Avatar  More           │
└─────────────────────────────────────────────────┘
```

---

## TAB 1: 🏠 HOME (Cosmic Observatory)

**Route:** `/` or `/home`

**Purpose:** Central hub with overview of everything + quick actions

### Main Content (Scrollable)

#### Hero Section
- **Animated Cosmic Avatar** (tap to open Character Sheet)
- Level, XP bar, title
- Today's date & quick focus input

#### Active Missions Widget (Compact)
- Shows top 3 active missions
- Swipeable carousel
- Tap card → opens Mission Control tab
- "View All" button → navigates to Quests tab

#### Momentum Snapshot
- Today's streak status (fire icons)
- Top 3 chains with day counts
- Tap → opens Progress tab

#### Quick Stats Row
- 4 stat cards in horizontal scroll:
  - Stellar Energy
  - Cosmic Credits (tap → Bazaar modal)
  - Discoveries count
  - Current streak

#### Recent Discoveries
- Last 2-3 achievements unlocked
- Swipeable carousel
- Tap → opens discovery detail modal

#### Module Quick Access Grid
- 8 module cards in 2x4 grid
- Each shows:
  - Module icon
  - Progress percentage
  - Level in that module
- Tap → navigates to module page

### Floating Action Button (FAB)
- "+ Quick Log" button
- Opens context menu:
  - Log habit
  - Complete mission
  - Add journal entry
  - Quick note

---

## TAB 2: 🎯 QUESTS (Mission Control)

**Route:** `/missions`

**Purpose:** All quest/mission management

### Top Navigation Bar
- Search icon
- Filter icon (opens filter sheet)
- Sort dropdown

### Content (Scrollable)

#### Active Missions Section
- Large mission cards
- Shows:
  - Title, narrative, difficulty
  - Progress bars
  - Time remaining
  - Rewards
  - Complete/View buttons

#### Available Missions Section
- Recommended for you
- Filtered by selected categories
- "Accept" button on each

#### Cosmic Challenges
- Limited-time events
- Countdown timers
- Special rewards

#### Completed Missions (Collapsible)
- Recently finished
- Tap to see details/rewards

### Bottom Sheet Panels (slide up)
- **Mission Detail:** Full objectives, rewards, lore
- **Mission Filters:** Module, difficulty, time, rewards
- **Create Custom Mission:** Form to make your own

---

## TAB 3: ⚡ PROGRESS (Streaks & Analytics)

**Route:** `/progress`

**Purpose:** View streaks, momentum, analytics, constellations

### Top Segmented Control (Tabs within tab)
```
┌──────────────────────────────────────┐
│  Momentum  |  Stats  |  Constellations │
└──────────────────────────────────────┘
```

### Sub-Tab 1: Momentum
- Overall momentum score (large circular)
- Momentum Shields indicator
- Grid of active streak cards
- Calendar heatmap (year view)
- Tap streak card → opens detail modal with:
  - Full calendar
  - Statistics
  - Milestones
  - Shield usage

### Sub-Tab 2: Stats
- Life Dimensions Radar Chart
- Energy over time graph
- Module balance chart
- Dimension comparison bars
- Activity heatmap
- Insights & patterns

### Sub-Tab 3: Constellations
- Module selector dropdown
- Interactive star map for selected module
- Progress panel showing:
  - Stars unlocked: X/Y
  - Next unlock requirements
  - Suggested missions
- Tap star → unlock modal or info

---

## TAB 4: 👤 AVATAR (Character & Equipment)

**Route:** `/character`

**Purpose:** Character identity, equipment, discoveries

### Top Segmented Control
```
┌──────────────────────────────────┐
│  Character  |  Equipment  |  Gallery │
└──────────────────────────────────┘
```

### Sub-Tab 1: Character
- **Large Animated Avatar Display**
- User info (name, title, level)
- **Life Dimensions Radar** (tap dimension → details)
- **Quick Stats Grid:**
  - Stellar Energy
  - Cosmic Credits (tap → Bazaar)
  - Total Discoveries
  - Best Streak
- **Archetype Card:**
  - Current archetype
  - Description
  - Change button
- **Customization Button:**
  - Opens customization modal:
    - Colors
    - Visual effects
    - Avatar style

### Sub-Tab 2: Equipment
- **Equipment Slots Grid** (already implemented)
  - 7 slots displayed
  - Tap slot → shows available items
- **Stats Display:**
  - Total bonuses from gear
- **Available Items Panel:**
  - Filtered by selected slot
  - Rarity filter
  - Item cards with stats
  - Tap to equip/unequip

### Sub-Tab 3: Gallery
- **Discoveries Grid:**
  - All achievements/discoveries
  - Rarity colored
  - Unlocked/locked states
  - Search bar
  - Filter by: Category, Rarity, Status
- Tap discovery → detail modal:
  - Full info, rewards
  - Unlock date

---

## TAB 5: ⚙️ MORE (Settings & Secondary Features)

**Route:** `/more`

**Purpose:** Settings, profile, marketplace, and overflow features

### Main Menu List

#### Cosmic Bazaar
- Icon: 💫
- Badge: Credits balance
- Tap → opens Bazaar page

#### Profile & Stats
- Icon: 📊
- Shows username & level
- Tap → opens profile page

#### Settings
- Icon: ⚙️
- Tap → opens settings page

#### Analytics Deep Dive
- Icon: 📈
- Tap → opens full analytics page

#### Module Management
- Icon: 🗂️
- List of 8 modules
- Tap → navigate to module page

#### Help & Support
- Icon: ❓
- FAQ, tutorials, contact

#### About
- Icon: ℹ️
- Version, credits, legal

---

## MODAL/OVERLAY PAGES (Not in tabs)

These appear as overlays, modals, or full-screen sheets:

### Cosmic Bazaar
- **Trigger:** Credits tap from home, or More tab
- **Display:** Bottom sheet or full screen
- **Content:**
  - Credit balance header
  - Reward grid
  - Filters
  - Wishlist tab
  - Custom reward creator
  - Purchase history

### Mission Detail
- **Trigger:** Tap mission card
- **Display:** Bottom sheet (75% height)
- **Content:**
  - Full mission info
  - Objectives breakdown
  - Rewards
  - Accept/Complete buttons

### Discovery Unlock Animation
- **Trigger:** Achievement unlocked
- **Display:** Full screen overlay
- **Content:**
  - Animated reveal
  - Discovery info
  - Rewards granted
  - Share button

### Streak Detail
- **Trigger:** Tap momentum chain card
- **Display:** Full screen
- **Content:**
  - Full calendar
  - Statistics
  - Milestones
  - Shield management

### Level Up Celebration
- **Trigger:** Level up event
- **Display:** Full screen overlay
- **Content:**
  - Animated celebration
  - New level announced
  - Rewards summary
  - Unlocks available

### Character Customization
- **Trigger:** Customize button from Avatar tab
- **Display:** Bottom sheet
- **Content:**
  - Color pickers
  - Style options
  - Preview
  - Save button

---

## DEEP-LINKED PAGES (Full Screen)

These are accessed from widgets but take over full screen:

### Module Pages
- **Route:** `/modules/:moduleId`
- **Access:** Tap module card from home
- **Navigation:** Back button to home
- **Content:**
  - Module-specific interface
  - Activity logging
  - Module stats
  - Related missions
  - Constellation for module

### Profile Page
- **Route:** `/profile`
- **Access:** More tab → Profile
- **Content:**
  - Avatar & identity
  - Lifetime statistics
  - Achievement showcase
  - Activity history

### Analytics Page
- **Route:** `/analytics`
- **Access:** More tab → Analytics
- **Content:**
  - Full graphs & charts
  - Time-based analysis
  - Performance metrics
  - Predictive insights

### Settings Page
- **Route:** `/settings`
- **Access:** More tab → Settings
- **Content:**
  - Account settings
  - Notifications
  - Gamification preferences
  - Appearance
  - Data & privacy

---

## NAVIGATION PATTERNS

### Depth Hierarchy

```
Level 1: Bottom Nav (5 tabs)
├─ Level 2: Sub-tabs within tab (e.g., Progress → Momentum/Stats/Constellations)
├─ Level 2: Modals/Bottom sheets (e.g., Mission Detail, Bazaar)
└─ Level 3: Full-screen deep pages (e.g., Module pages, Settings)
```

### Navigation Rules

1. **Never more than 2 taps** to reach any feature
2. **Bottom nav always visible** (except modals)
3. **Swipe gestures:**
   - Swipe down to dismiss modals
   - Swipe between sub-tabs
   - Swipe carousels horizontally
4. **Back button behavior:**
   - Modals → dismiss
   - Deep pages → return to originating tab
   - Sub-tabs → don't navigate, switch tabs only

---

## MOBILE-SPECIFIC OPTIMIZATIONS

### Home Tab Widgets
- **All widgets collapsible/expandable**
- User can reorder widgets
- Hide/show widgets in settings
- Widgets are "springboards" to full features

### Gesture Controls
- **Pull to refresh** on all tabs
- **Swipe between sub-tabs** (Progress tab)
- **Long press mission card** → quick complete
- **Swipe streak card** → shield management
- **Pinch to zoom** on constellation map

### Quick Actions
- **Floating Action Button (FAB)** on home tab
- **Quick complete buttons** on mission cards
- **One-tap logging** for habits
- **Swipe to dismiss** notifications

### Performance
- **Lazy load** deep content
- **Cache** frequently accessed data
- **Skeleton screens** while loading
- **Optimized animations** for 60fps

---

## COMPARISON: 5-Tab vs 10-Page Desktop

### Desktop (10+ pages with sidebar)
- Cosmic Observatory (Dashboard)
- Character Sheet
- Mission Control
- Momentum Chains
- Constellations
- Cosmic Bazaar
- Discoveries
- Equipment
- Analytics
- Settings
- 8 Module pages

### Mobile (5 tabs, nested structure)
- **Home** = Cosmic Observatory with widgets
- **Quests** = Mission Control (single tab)
- **Progress** = Momentum + Analytics + Constellations (3 sub-tabs)
- **Avatar** = Character + Equipment + Discoveries (3 sub-tabs)
- **More** = Settings + Bazaar + Profile + overflow

**Result:** Same functionality, optimized hierarchy for mobile

---

## QUICK REFERENCE: What Goes Where?

| Feature | Desktop Page | Mobile Location |
|---------|-------------|-----------------|
| Dashboard | Main page | Home tab |
| Active missions | Dashboard + Mission page | Home widget + Quests tab |
| Mission board | Mission Control page | Quests tab |
| Create custom mission | Mission Control | Quests tab → bottom sheet |
| Momentum chains | Momentum page | Progress tab → Momentum sub-tab |
| Streak calendar | Momentum page | Progress → Momentum → tap card |
| Analytics | Analytics page | Progress tab → Stats sub-tab |
| Constellations | Constellation page | Progress tab → Constellations sub-tab |
| Character sheet | Character page | Avatar tab → Character sub-tab |
| Equipment | Equipment page | Avatar tab → Equipment sub-tab |
| Discoveries | Discoveries page | Avatar tab → Gallery sub-tab |
| Reward marketplace | Bazaar page | More tab → Bazaar (or home credit tap) |
| Profile | Profile page | More tab → Profile |
| Settings | Settings page | More tab → Settings |
| Module pages | Sidebar links | Home → module cards (or More → Modules) |

---

## IMPLEMENTATION PRIORITY

### Phase 1: Core 5 Tabs
1. Home tab (dashboard with widgets)
2. Quests tab (mission board)
3. Progress tab (with Momentum sub-tab)
4. Avatar tab (with Equipment sub-tab - already built)
5. More tab (basic menu)

### Phase 2: Sub-Tabs & Modals
6. Progress → Stats sub-tab
7. Progress → Constellations sub-tab
8. Avatar → Character sub-tab
9. Avatar → Gallery sub-tab
10. Mission detail modals
11. Discovery modals
12. Bazaar modal/page

### Phase 3: Deep Pages
13. Module pages
14. Profile page
15. Analytics page
16. Settings page

### Phase 4: Polish
17. Animations & transitions
18. Gesture controls
19. Customization options
20. Performance optimization

---

## DESKTOP VERSION NOTES

For desktop/web, we can:
- Show sidebar with all 10+ pages
- Use full horizontal space for 3-panel layouts
- Keep mobile navigation as fallback for responsive design
- Add keyboard shortcuts
- Show more content simultaneously

But **mobile is primary**, so we design mobile-first, then enhance for desktop.

---

## FINAL STRUCTURE DIAGRAM

```
MOBILE APP (Bottom Navigation - 5 tabs)

🏠 HOME
└─ Dashboard widgets (scrollable)
   ├─ Avatar (tap → Avatar tab)
   ├─ Missions preview (tap → Quests tab)
   ├─ Momentum preview (tap → Progress tab)
   ├─ Quick stats (credits tap → Bazaar modal)
   ├─ Recent discoveries (tap → discovery modal)
   └─ Module grid (tap → module page)

🎯 QUESTS
└─ Mission board
   ├─ Active missions
   ├─ Available missions
   ├─ Cosmic challenges
   └─ Completed (tap card → mission detail modal)

⚡ PROGRESS
├─ [Momentum sub-tab]
│  └─ Chains, calendar, shields (tap → detail modal)
├─ [Stats sub-tab]
│  └─ Charts, graphs, insights
└─ [Constellations sub-tab]
   └─ Star map, progress (tap star → unlock modal)

👤 AVATAR
├─ [Character sub-tab]
│  └─ Avatar, dimensions, stats, archetype
├─ [Equipment sub-tab] ✅ (already built)
│  └─ Slots, items, stats
└─ [Gallery sub-tab]
   └─ Discoveries grid (tap → detail modal)

⚙️ MORE
├─ Cosmic Bazaar → (opens full page/modal)
├─ Profile → (opens profile page)
├─ Settings → (opens settings page)
├─ Analytics → (opens analytics page)
├─ Modules → (list, tap → module page)
└─ Help & About
```

---

This structure keeps the app **clean, intuitive, and mobile-optimized** while maintaining access to all features within 2 taps maximum.
