# 🌌 Gamification System - Page Layouts & Features

## Overview
This document defines what should appear on each page of the gamification system, based on the Cosmic Gamification Master Plan.

---

## 1. COSMIC OBSERVATORY (Main Dashboard)

**Route:** `/dashboard` or `/` (home)

### Layout: Three-Panel Design

#### Left Panel (25% width): Cosmic Avatar & Identity
- **Animated Cosmic Avatar**
  - Visual representation that evolves with user level
  - Shows current tier (Asteroid → Planet → Star → Supernova)
  - Animated particles/effects based on progress

- **User Info Card**
  - Username
  - Active Title (unlocked from achievements)
  - Current Level & Tier display

- **Life Dimensions Radar Chart**
  - Interactive 6-axis radar chart
  - Dimensions: Vitality, Cognition, Productivity, Emotional, Prosperity, Temporal
  - Click dimension to see details
  - Color-coded by cosmic theme

- **Quick Action Buttons**
  - Customize Avatar
  - View Discoveries Gallery
  - Settings

#### Center Panel (50% width): Main Activity Hub

**1. Active Missions Section**
- Horizontal scrollable mission cards
- Shows 3-5 active missions
- Each card displays:
  - Mission title & cosmic narrative
  - Difficulty indicator
  - Time remaining
  - Objectives progress bar
  - Rewards preview (Stellar Energy + Cosmic Credits)
- "View All Missions" link

**2. Momentum Chains Section**
- Top 3 current momentum chains
- Each chain preview shows:
  - Activity name
  - Current chain length (days)
  - Mini visualization of last 7 days
  - Chain strength indicator
- Overall momentum score
- Momentum Shields count

**3. Today's Focus Card**
- Current date & time
- "What's your primary focus today?" prompt
- List of today's quick win missions
- Checkbox tracking for daily objectives

#### Right Panel (25% width): Stellar Data & Metrics

**1. Energy Metrics Card**
- **Stellar Energy (XP)**
  - Current total with animated counter
  - "+X today" indicator
  - Progress bar to next level

- **Cosmic Credits (Currency)**
  - Current balance
  - Quick "Spend" button → marketplace

- **Life Force (HP)**
  - Progress bar (0-100%)
  - Visual indicator of current status

**2. Recent Discoveries**
- Last 3 unlocked achievements
- Each shows:
  - Rarity-colored icon
  - Discovery name
  - Time ago unlocked
- "View All" link to gallery

**3. Quick Stats Grid**
- Overall Level
- Total Discoveries
- Stars Unlocked (constellations)
- Best Streak

### Additional Dashboard Features

**Solar System Progress Map** (Full-width section below)
- Interactive visualization of all 8 modules
- Modules arranged as planets orbiting user's avatar
- Shows:
  - Module unlock status
  - Progress percentage
  - Current level per module
- Click planet to navigate to that module

**Temporal Energy Graph** (Full-width below solar system)
- Line chart showing XP gained over time
- Selectable time ranges: Week / Month / Quarter / Year
- Milestones marked (level-ups, major achievements)
- Interactive hover for day details

---

## 2. CHARACTER SHEET PAGE

**Route:** `/character` or `/avatar`

### Main Content

#### Top Section: Avatar Display
- **Large Animated Avatar**
  - Full cosmic representation
  - Current tier with visual effects
  - Archetype indicator (Explorer, Builder, Scholar, Guardian)
  - Customization button overlay

#### Life Dimensions Section
- **Large Interactive Radar Chart**
  - All 6 dimensions with current levels
  - Click dimension to expand detail panel

- **Dimension Detail Cards** (when clicked)
  - Dimension name & icon
  - Current level & XP
  - XP to next level
  - Recent activities contributing
  - Suggested missions to improve

#### Stats Overview
- **4-Column Grid:**
  - Total Level & Tier
  - Stellar Energy (lifetime total)
  - Current Streak
  - Cosmic Credits balance

#### Archetype Info
- Current archetype description
- Bonus dimensions highlighted
- Suggested mission types
- Visual style indicator
- Button to change archetype (if allowed)

#### Recent Activity Timeline
- Chronological feed of recent actions
- Shows XP gains, level-ups, discoveries
- Filterable by:
  - All activity
  - XP gains only
  - Level-ups
  - Discoveries
  - Missions completed

#### Character Customization Panel
- **Avatar Appearance:**
  - Primary color selector
  - Secondary color selector
  - Avatar style options

- **Active Title Selection:**
  - Dropdown of unlocked titles
  - Preview how it appears

- **Visual Effects:**
  - Particle effects toggle
  - Animation speed
  - Glow intensity

---

## 3. MISSION CONTROL PAGE

**Route:** `/missions`

### Layout: Two-Panel

#### Left Panel (60%): Mission Board

**Section 1: Active Missions**
- Full mission cards for all active missions
- Each card shows:
  - Mission type badge (Daily / Weekly / Monthly / Challenge)
  - Title & cosmic narrative
  - Difficulty & time remaining
  - Full objectives list with progress
  - Milestone rewards (for multi-part missions)
  - Rewards summary
  - Action buttons: "View Detail" / "Complete"

**Section 2: Available Missions**
- Recommended missions based on user profile
- Grid of mission cards
- Each card shows:
  - Title & brief description
  - Difficulty
  - Expected time commitment
  - Rewards preview
  - "Accept Mission" button
- Filter options:
  - By module
  - By difficulty
  - By time commitment

**Section 3: Cosmic Challenges**
- Limited-time event missions
- Special cards with:
  - Event theme visual
  - Start/end date countdown
  - Leaderboard indicator
  - Exclusive reward preview
  - Multiplier bonuses active

**Section 4: Recently Completed**
- History log of finished missions
- Collapsed cards showing:
  - Mission name
  - Completion date
  - Rewards earned
  - Time taken

#### Right Panel (40%): Mission Details & Filters

**Mission Filters:**
- Module selector (all 8 modules)
- Difficulty slider
- Time commitment range
- Reward type filter (XP / Credits / Discoveries)
- Show/hide completed

**Selected Mission Detail Panel:**
(Appears when mission is clicked)
- Full mission information
- Complete objectives breakdown
- Phase-by-phase for epic missions
- Rewards details
- Suggested strategies
- Related missions
- Community completion rate (if available)

**Personal Mission Creator:**
- "Create Custom Mission" button
- Form to define:
  - Title
  - Objectives (add multiple)
  - Self-assigned difficulty
  - Deadline
  - Self-reward amount

---

## 4. MOMENTUM CHAINS PAGE

**Route:** `/momentum` or `/streaks`

### Main Layout

#### Header: Overall Momentum Score
- Large circular progress indicator
- Overall momentum percentage
- Velocity trend indicator (Accelerating / Steady / Decelerating)
- Momentum Shields display (count available)

#### Active Chains Section
- **Grid of Chain Cards** (3-4 per row)
- Each card shows:
  - Activity name & icon
  - Current chain length (big number)
  - Chain strength badge (Forming / Building / Strong / Unstoppable)
  - Last 30 days visualization
  - Longest chain record
  - Total days completed
  - Success rate percentage
  - "Log Activity" quick button

#### Chain Detail View (Modal or Expanded)
- Full 365-day calendar heatmap
- Monthly breakdown
- Milestone markers (7, 14, 30, 50, 100 days)
- Rewards earned from milestones
- Statistics:
  - Average activities per week
  - Best month
  - Worst month
  - Recovery time after breaks
- Shield usage history

#### Momentum Calendar (Full View)
- Year-at-a-glance heatmap
- Color intensity based on activity count
- Hover to see day details
- Click day to see what was done
- Streak indicators overlaid

#### Broken Chains Section
- "Past Momentum" archive
- Shows chains that ended
- Each shows:
  - Activity name
  - Chain length achieved
  - Date ended
  - Encouraging message
  - "Start Fresh" button

#### Momentum Insights
- AI-generated insights:
  - Best days of week for consistency
  - Time of day patterns
  - Correlation with other activities
  - Suggestions for improvement

---

## 5. COSMIC BAZAAR (Reward Marketplace)

**Route:** `/marketplace` or `/rewards`

### Header
- **Credit Balance Display**
  - Large animated number
  - "+X this week" indicator
  - Credit earning tips link

- **Create New Reward Button**
  - Opens custom reward modal

### Filter & Sort Bar
- Category filter (All / Food / Entertainment / Wellness / Tech / Experiences / Custom)
- Price range slider (0 - user's credits max)
- Sort by: Price / Recently Added / Most Purchased / Recommended
- Affordable only toggle

### Reward Grid
**4-column grid of reward cards**

Each Reward Card Shows:
- Large emoji icon
- Reward name (cosmic themed)
- Description
- Cost in Cosmic Credits
- Rarity/category badge
- Affordability indicator:
  - If affordable: "Redeem Now" button
  - If not: Progress bar showing % saved
- Add to Wishlist button

### Wishlist Section (Sidebar or Separate Tab)
- "Saving For" rewards
- Each wishlist item shows:
  - Reward details
  - Circular progress (current credits / cost)
  - "X days at current pace" estimate
  - "Remove from Wishlist" option

### Purchase Confirmation Modal
(Appears when clicking "Redeem Now")
- Reward preview (large)
- Credit transaction breakdown:
  - Current balance
  - Cost deduction
  - Remaining balance
- Checkbox: "I will enjoy this within 7 days"
- Confirm / Cancel buttons

### Purchase History Tab
- Chronological list of redeemed rewards
- Each entry shows:
  - Reward name & icon
  - Date purchased
  - Cost
  - Date redeemed (when enjoyed)
  - Rating (1-5 stars)
  - Notes field
- Analytics section:
  - Total spent
  - Favorite category
  - Highest satisfaction rewards
  - Average redemption time

### Custom Reward Creator Modal
- Form fields:
  - Reward name
  - Description
  - Cost (slider: 100 - 100,000)
  - Category dropdown
  - Icon picker (emoji library)
- Preview panel
- Create button

### Seasonal/Limited Section
- Special rewards only available during events
- Countdown timer for availability
- "Limited Edition" badges
- Often tied to cosmic challenges

---

## 6. COSMIC DISCOVERIES (Achievements)

**Route:** `/discoveries` or `/achievements`

### Header
- Page title: "Cosmic Discoveries"
- Stats summary:
  - X / Y Discovered
  - Completion percentage
  - Rarity breakdown (how many of each rarity)

### Filter Bar
- **Category Filter:**
  - All / Milestone / Habit / Exploration / Mastery / Secret

- **Rarity Filter:**
  - All / Common / Uncommon / Rare / Epic / Legendary

- **Status Filter:**
  - All / Unlocked / In Progress / Locked

### Discovery Gallery
**5-6 column grid of discovery tiles**

**Unlocked Discovery Tile:**
- Rarity-colored border & glow
- Discovery icon (animated)
- Discovery name
- Scientific name (in smaller italic)
- Rarity badge
- Unlock date
- Click to expand details

**Locked Discovery Tile:**
- Grayscale/darkened
- "???" placeholder
- Cryptic hint (if available)
- Progress bar (if trackable)
- "X/Y" progress text

**In-Progress Discovery Tile:**
- Partially lit border
- Progress ring around icon
- Current/target numbers
- Estimated time to unlock

### Discovery Detail Modal
(Opens when clicking a discovery)

**For Unlocked Discoveries:**
- Large animated icon with rarity effects
- Full name & scientific name
- Rarity declaration
- Complete description
- Unlock date & time
- Rewards received
- Related discoveries
- Share button

**For Locked Discoveries:**
- Silhouette icon
- Cryptic hint/clue
- Requirements (if not secret)
- Related unlocked discoveries
- "Keep exploring" encouragement

### Secret Discoveries Section
- Special tab or section
- Only shows count: "X Secret Discoveries Found"
- Grid of ??? tiles
- Easter egg hints scattered
- No progress indicators (by design)

### Achievement Statistics
- Total discoveries by category (pie chart)
- Rarity distribution (bar chart)
- Discovery timeline (when unlocked over time)
- Rarest discovery showcase
- Most recent discoveries

---

## 7. CONSTELLATION MAP PAGE

**Route:** `/constellations` or `/skills`

### Module Selector
- Dropdown or tab navigation
- Shows all 8 modules
- Each module shows:
  - Icon
  - Name
  - Unlock status
  - Progress percentage

### Constellation Canvas
- **Large Interactive Star Map**
- Dark cosmic background
- Stars arranged in constellation pattern
- Connecting lines between stars

**Star States:**
- **Locked:** Dark/dim, no glow
- **Unlockable:** Pulsing, highlighted
- **Unlocked:** Bright, glowing, colored
- **Mastered:** Special effect, particles

**Star Information (on hover/click):**
- Skill name
- Description
- Requirements to unlock
- Rewards (XP, credits)
- Related stars
- "Unlock Now" button (if eligible)

### Progress Panel (Sidebar)
- Constellation name
- Stars unlocked: X / Y
- Total XP earned in this constellation
- Next milestone reward
- Suggested missions to progress
- Related discoveries

### Constellation Lore/Info
- Brief thematic description
- Real astronomical facts
- How it ties to life domain
- Complete benefits of full unlock

---

## 8. EQUIPMENT & ARSENAL PAGE

**Route:** `/equipment` or `/gear`

### Current Implementation (Already Built)

#### Left Panel: Equipment Slots
- 7 equipment slots displayed as cards:
  - Helmet
  - Chest
  - Weapon
  - Shield
  - Cape
  - Ring
  - Amulet

- Each slot shows:
  - Slot icon & name
  - Currently equipped item (or empty state)
  - Item preview with rarity color

- **Click slot to view available items**

#### Center Panel: Stats Display
- Total stats from all equipped items:
  - Defense
  - Strength
  - Vitality
  - Intelligence
  - Wisdom
- Each stat shows icon + value

#### Right Panel: Available Items
- Filtered by selected slot
- Rarity filter dropdown
- Grid of item cards
- Each card shows:
  - Item icon/sprite (when generated)
  - Item name (colored by rarity)
  - Rarity badge
  - Stat bonuses
  - "Equipped" badge if active
  - Click to equip/unequip

### Item Card Enhancements (Future)
- Item level requirement
- Set bonus indicators (if part of set)
- Unlock method badge (level / achievement / special)
- Compare with currently equipped
- Transmog/cosmetic options

---

## 9. PROFILE & SETTINGS PAGE

**Route:** `/profile` or `/settings`

### Profile Tab

#### User Identity
- Avatar display (medium size)
- Username
- Join date
- Account level & tier
- Active title

#### Lifetime Statistics
- Total Stellar Energy earned
- Total Cosmic Credits earned (& spent)
- Days active on platform
- Longest streak (any activity)
- Total discoveries unlocked
- Total missions completed
- Total stars unlocked
- Favorite module (most activity)

#### Achievements Showcase
- Top 5 rarest discoveries
- Custom selected achievements to display
- Share profile button

### Settings Tab

#### Account Settings
- Email/password management
- Notifications preferences:
  - Mission reminders
  - Streak warnings
  - Level-up celebrations
  - Discovery unlocks
  - Daily summary
  - Weekly report
- Time zone
- Language

#### Gamification Settings
- **Difficulty Preference:**
  - Casual / Balanced / Hardcore
  - Affects mission recommendations

- **Visibility Settings:**
  - Show/hide specific features
  - Disable certain notifications
  - Minimize distractions mode

- **Data & Privacy:**
  - Export all data
  - Delete account
  - Data usage consent

#### Appearance Settings
- Theme selector (dark / light / auto)
- Color scheme variants
- Animation intensity
- Particle effects toggle
- Sound effects toggle

---

## 10. ANALYTICS & INSIGHTS PAGE

**Route:** `/analytics` or `/insights`

### Overview Dashboard

#### Time-Based Analysis
- **Activity Heatmap**
  - Year view calendar
  - Color intensity by activity count
  - Hover for daily breakdown

- **Energy Trends**
  - Line chart of Stellar Energy over time
  - Selectable time ranges
  - Milestone markers

- **Module Balance Chart**
  - Radar chart showing activity across all modules
  - Identify overused vs underused areas

#### Performance Metrics
- **Consistency Score**
  - Overall momentum health
  - Trend indicator (improving / stable / declining)

- **Completion Rates**
  - Missions accepted vs completed
  - Broken down by difficulty

- **Productivity Patterns**
  - Best days of week
  - Best time of day
  - Longest productive periods

#### Predictive Insights
- AI-generated observations:
  - "You're most consistent on Tuesdays"
  - "Your productivity drops every Friday afternoon"
  - "You tend to unlock discoveries in bursts"
- Actionable recommendations:
  - Suggested missions based on patterns
  - Weakness identification
  - Opportunity highlights

#### Comparative Analysis
- Current month vs last month
- Current streak vs best streak
- Dimension growth rates
- Module progression rates

---

## 11. MODULE-SPECIFIC PAGES

Each of the 8 core modules has its own detailed page:

### Module Page Template
**Route:** `/modules/[module-name]`

#### Module Header
- Module name & icon
- Module level & progress
- Constellation preview (mini star map)
- Quick stats for this module

#### Recent Activity Feed
- Latest entries/logs in this module
- Filterable and searchable
- Quick-add new entry button

#### Module-Specific Features
(Varies by module - Productivity, Health, Knowledge, etc.)
- Custom forms for logging
- Visualization relevant to module
- Module-specific missions
- Related discoveries

#### Module Progression
- XP earned in this module
- Level in this module dimension
- Unlock thresholds
- Next milestone

---

## Page Priority for Implementation

### Phase 1 (MVP - Core Experience)
1. ✅ **Cosmic Observatory (Dashboard)** - Main hub
2. ✅ **Equipment & Arsenal** - Already built
3. **Character Sheet** - Identity & progression
4. **Constellation Map** - Already have partial implementation

### Phase 2 (Engagement Features)
5. **Mission Control** - Quest system
6. **Momentum Chains** - Streak tracking
7. **Cosmic Bazaar** - Rewards

### Phase 3 (Depth & Polish)
8. **Cosmic Discoveries** - Achievements
9. **Analytics & Insights** - Data visualization
10. **Profile & Settings** - User management

### Phase 4 (Module Deep-Dives)
11. **Module-Specific Pages** - One at a time

---

## Common UI Components Needed

### Cards
- `CosmicCard` - Base card with glassmorphism
- `MissionCard` - Mission display
- `DiscoveryCard` - Achievement display
- `EquipmentCard` - Item display
- `ChainCard` - Streak visualization

### Charts & Visualizations
- `RadarChart` - Life dimensions
- `LineChart` - Energy over time
- `HeatmapCalendar` - Activity calendar
- `CircularProgress` - Goals/savings
- `BarChart` - Comparisons
- `ConstellationCanvas` - Star map

### Interactive Elements
- `ProgressBar` - Linear progress
- `ProgressRing` - Circular progress
- `MomentumChain` - Chain visualization
- `StarNode` - Constellation star
- `PlanetOrbit` - Solar system module

### Modals
- `MissionDetailModal`
- `DiscoveryUnlockModal`
- `PurchaseConfirmModal`
- `CustomRewardModal`
- `ChainBrokenModal`
- `LevelUpCelebration`

### Animations
- Aurora drift background (already implemented)
- Particle effects
- Glow effects
- Constellation line drawing
- Level-up burst
- Discovery reveal
- Stat counter animations

---

## Navigation Structure

### Main Navigation (Sidebar/Header)
1. 🌌 **Cosmic Observatory** (Dashboard)
2. 👤 **Character** (Avatar & Stats)
3. 🎯 **Missions** (Quest Board)
4. 🔥 **Momentum** (Streaks)
5. ⭐ **Constellations** (Skills)
6. 💫 **Bazaar** (Rewards)
7. 🔭 **Discoveries** (Achievements)
8. ⚔️ **Equipment** (Gear)
9. 📊 **Analytics** (Insights)
10. ⚙️ **Settings** (Profile)

### Module Quick Access (Secondary Nav)
- Productivity 💼
- Health & Fitness 🏋️
- Knowledge 📚
- Journal 📝
- Calendar ⏰
- Skills 🎯
- Finance 💰
- (8th module TBD)

---

## Mobile Considerations

### Responsive Adaptations
- Dashboard: Stack panels vertically
- Mission Board: Single column
- Constellation: Zoomable canvas
- Equipment: Collapsible panels
- Charts: Simplified mobile versions

### Mobile-Specific Features
- Quick log buttons
- Swipe gestures for navigation
- Bottom navigation bar
- Simplified animations
- Touch-optimized controls

---

## Next Steps

1. **Design Mockups:** Create visual mockups for each page
2. **Component Library:** Build reusable UI components
3. **Data Structure:** Finalize database schema for new features
4. **API Endpoints:** Define backend endpoints needed
5. **Implementation Order:** Follow phase priority above

