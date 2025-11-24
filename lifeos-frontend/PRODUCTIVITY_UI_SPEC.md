# Quanta Productivity Module - UI/UX Design Specification

## Executive Summary

This specification outlines a comprehensive productivity module designed for an 18-year-old entrepreneur building a business while avoiding university. The design emphasizes deep work tracking, project/task management, and simple income tracking—all optimized for speed, clarity, and actionable insights.

**Design Philosophy**: Fast capture, minimal friction, keyboard-first, data that compounds in value over time.

---

## Table of Contents

1. [Core Features & Architecture](#core-features--architecture)
2. [Layout Structure](#layout-structure)
3. [Deep Work Tracking](#deep-work-tracking)
4. [Project & Task Management](#project--task-management)
5. [Income Tracking](#income-tracking)
6. [Analytics & Insights](#analytics--insights)
7. [UI Components Library](#ui-components-library)
8. [User Flows](#user-flows)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Mobile Considerations](#mobile-considerations)
11. [Implementation Priorities](#implementation-priorities)

---

## Core Features & Architecture

### Module Structure
```
Productivity Module
├── Work Sessions (Deep Work Tracking)
├── Projects (High-level organization)
├── Tasks (Granular action items)
├── Income (Business revenue tracking)
└── Analytics (Patterns & insights)
```

### Design Principles (Research-Backed)

**1. Linear Design (from Linear app)**
- Minimal color usage, high contrast
- Single-direction information flow
- Reduced cognitive load through simplicity
- Monochrome palette with accent colors for states

**2. Keyboard-First Interface (from Linear, Notion)**
- Cmd/Ctrl+K global command palette
- Every action accessible via keyboard
- Quick capture shortcuts (Q for quick add)
- Slash commands for inline actions

**3. Speed & Efficiency (from Toggl, RescueTime)**
- One-click timer start/stop
- Pre-filled smart defaults
- Batch operations support
- Minimal clicks to complete actions

**4. Contextual Intelligence (from Motion, Sunsama)**
- Time-blocking integration with calendar
- Smart scheduling suggestions
- Workload warnings (overcommitment detection)
- Planned vs. actual time tracking

**5. Visual Clarity (from Notion, Linear)**
- Multiple view modes (List, Kanban, Calendar)
- Clear visual hierarchy
- Progress indicators everywhere
- Color-coded by priority/status

---

## Layout Structure

### Top-Level Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Icon] Productivity & Business              [12 active]    │
│  Track your work, projects, and business performance        │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐    │
│  │ XP Progress Bar: Level 6 (3200/5000 XP)          │    │
│  └────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │ 2.5h    │ │ 18.5h   │ │ £1,200  │ │ 3       │         │
│  │ Today   │ │ Weekly  │ │ Revenue │ │ Projects│         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
├─────────────────────────────────────────────────────────────┤
│  [Sessions] [Projects] [Tasks] [Income] [Analytics]        │
│  ───────────────────────────────────────────────────────   │
│  [Tab Content Area]                                         │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Layout Decisions

**Header Section**
- Module icon + title (left)
- Quick stat badge (right) - "12 active tasks"
- Subtitle explaining the module purpose
- Consistent with other modules for navigation familiarity

**Stats Grid** (Always visible)
- 4 key metrics in card format
- Responsive: 1 column mobile, 2 on tablet, 4 on desktop
- Real-time updates when timer running
- Delta indicators (±2.5h, +£200) for comparison

**Tab Navigation**
- Horizontal tabs with icons
- Active state: accent border-bottom, subtle bg highlight
- Sticky positioning on scroll
- Badge counts where relevant (Tasks: 12)

**Content Area**
- Minimum height to prevent layout shift
- Padding: 1.5rem (24px) for breathing room
- Max-width: 1400px for readability

---

## Deep Work Tracking

### Research Insights

**From RescueTime:**
- Focus session prep workflow (bathroom check, water, deep breath)
- Real-time blocking of distracting apps/sites
- Post-session detailed reports with distraction categorization
- "Body doubling" effect showing other users in focus mode

**From Forest App:**
- Visual gamification (tree growing during session)
- Punishment for abandoning session (tree dies)
- Peaceful, minimal interface
- Daily/weekly/monthly statistics with trend visualization

**From Pomodoro Apps:**
- 25-minute work blocks + 5-minute breaks
- Customizable session lengths
- Audio/visual cues for transitions
- Session quality tracking

### Work Sessions Tab Design

#### Active Timer Section

```
┌──────────────────────────────────────────────────────────┐
│                    ┌─────────────┐                        │
│                    │   ●●●●●●●   │  <- Animated ring     │
│                    │             │                        │
│                    │   00:42:18  │  <- Large time display│
│                    │  Deep Work  │  <- Session type      │
│                    │             │                        │
│                    └─────────────┘                        │
│                                                           │
│        [▶ Start Session]    [■ Stop & Save]              │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Session Type: [Deep Work ▼]                      │   │
│  │ Project: [Quanta Development ▼]                  │   │
│  │ Focus Quality: ●●●●●●●○○○ 7/10                   │   │
│  │ Notes: [Building productivity timer...]          │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**Timer States:**
- **Idle**: Gray ring, "00:00:00", muted appearance
- **Active**: Accent-colored pulsing ring, growing animation
- **Paused**: Amber ring, time frozen
- **Complete**: Green checkmark animation

**Session Types** (Dropdown):
- Deep Work (primary focus work)
- Learning (courses, reading, studying)
- Admin (email, scheduling, organization)
- Communication (meetings, calls, messages)
- Planning (strategizing, roadmapping)
- Creative (design, writing, brainstorming)

**Focus Quality Slider** (1-10):
- Visual: 10 circles that fill as you slide
- Color-coded: 1-4 red, 5-7 amber, 8-10 green
- Default: 7 (realistic baseline)
- Tooltip: "How focused were you? Be honest for better insights"

**Notes Field**:
- Multiline textarea (3-4 rows visible)
- Placeholder: "What are you working on? What did you accomplish?"
- Auto-saves draft to localStorage
- Rich text support (optional: markdown)

#### Quick Stats Row

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 12.5 hrs     │ │ 7.8/10       │ │ 3 sessions   │
│ This Week    │ │ Avg Focus    │ │ Today        │
└──────────────┘ └──────────────┘ └──────────────┘
```

#### Recent Sessions List

```
┌──────────────────────────────────────────────────────────┐
│ Recent Work Sessions                    [+ Log Session]  │
├──────────────────────────────────────────────────────────┤
│  Deep Work                                    [8/10]     │
│  Oct 28, 2025 • 2h 15m                                   │
│  Built timer component for productivity module. Added    │
│  state management and localStorage persistence.          │
│  [Quanta Development]                                    │
├──────────────────────────────────────────────────────────┤
│  Learning                                     [9/10]     │
│  Oct 28, 2025 • 1h 30m                                   │
│  Completed React hooks deep dive. Practiced custom       │
│  hooks with useTimer implementation.                     │
│  [Personal Learning]                                     │
├──────────────────────────────────────────────────────────┤
│  Communication                                [6/10]     │
│  Oct 27, 2025 • 45m                                      │
│  Client call discussing portfolio redesign requirements. │
│  [Client Portfolio]                                      │
└──────────────────────────────────────────────────────────┘
```

**Session Card Elements:**
- **Header**: Type (bold) + Focus badge (right-aligned, color-coded)
- **Meta**: Date • Duration
- **Output**: User's notes (2-line preview, "Read more" for longer)
- **Footer**: Project tag (pill-shaped, project color)

#### Pomodoro Mode (Enhancement)

**Toggle**: "Enable Pomodoro Mode" checkbox above timer

**Behavior**:
- 25-minute work blocks
- 5-minute short breaks (after each session)
- 15-minute long breaks (after 4 sessions)
- Auto-start next block (optional)
- Browser notification + sound at transitions
- Visual break screen: "Take a break! 3:42 remaining"

**Break Suggestions**:
- Stretch
- Hydrate
- Look away from screen (20-20-20 rule)
- Quick walk

---

## Project & Task Management

### Research Insights

**From Linear:**
- Keyboard shortcuts for everything (Cmd+K palette)
- Instant state changes (no loading spinners)
- Clean, minimal design with tight transitions
- Swimlane grouping in board view
- Cycles (sprints) and Projects as first-class features

**From Notion:**
- Everything lives in databases
- Multiple views (Table, Board, Calendar, Gallery)
- Relations between databases (tasks → projects → goals)
- Smart filters for contextual views
- Properties: Status, Assignee, Due Date, Priority

**From Height:**
- Flexible visualization (List, Board, Calendar, Gantt)
- AI automation for routine tasks
- Real-time collaboration
- Clean UI with visible task states

### When to Use List vs. Kanban

**List View** (Default for Tasks):
- Simple, linear workflows
- Mobile-friendly (vertical scroll)
- Quick scanning and checkbox ticking
- Best for: Daily task lists, inbox processing, prioritization

**Kanban Board** (Default for Projects):
- Visual workflow management
- Drag-and-drop state changes
- See bottlenecks at a glance
- Best for: Project stages, pipeline tracking, team workflows

**Calendar View**:
- Time-based planning
- Due date visualization
- Integration with time blocking
- Best for: Deadline tracking, weekly planning

### Projects Tab Design

#### View Switcher

```
Projects (3 active)           [☰ List] [⊞ Board] [📅 Calendar]    [+ New Project]
```

#### Board View (Default)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Planning        │  In Progress     │  Review         │  Complete        │
│  (2)             │  (4)             │  (1)            │  (6)             │
├──────────────────┼──────────────────┼─────────────────┼──────────────────┤
│ ┌──────────────┐ │ ┌──────────────┐ │ ┌─────────────┐ │ ┌──────────────┐│
│ │ [📁] HIGH    │ │ │ [📁] HIGH    │ │ │[📁] MEDIUM  │ │ │ [📁] LOW     ││
│ │              │ │ │              │ │ │             │ │ │              ││
│ │ Quanta v2.0  │ │ │ Client Site  │ │ │ Portfolio   │ │ │ Learning SDE││
│ │ Build next   │ │ │ Build web    │ │ │ Update...   │ │ │ Complete...  ││
│ │              │ │ │              │ │ │             │ │ │              ││
│ │ ●●●●●○○○ 45% │ │ │ ●●●●●●●● 80% │ │ │ ●●●●●●●○ 90%│ │ │ ●●●●●●●● 100%││
│ │ 12/27 tasks  │ │ │ 8/10 tasks   │ │ │ 9/10 tasks  │ │ │ 12/12 tasks  ││
│ │ 28.5h logged │ │ │ 15.2h logged │ │ │ 22h logged  │ │ │ 45h logged   ││
│ │              │ │ │              │ │ │             │ │ │              ││
│ │ Due Dec 1    │ │ │ Due Nov 15   │ │ │ Due Nov 20  │ │ │ Completed    ││
│ └──────────────┘ │ └──────────────┘ │ └─────────────┘ │ └──────────────┘│
│                  │                  │                 │                  │
│ ┌──────────────┐ │                  │                 │                  │
│ │ [📁] MEDIUM  │ │                  │                 │                  │
│ │ Blog Redesign│ │                  │                 │                  │
│ │ ...          │ │                  │                 │                  │
│ └──────────────┘ │                  │                 │                  │
└──────────────────┴──────────────────┴─────────────────┴──────────────────┘
```

**Project Card Components:**
- **Icon + Priority Badge** (top-right corner)
- **Project Name** (H3, bold, 2-line max)
- **Description** (text-med, 2-line max with ellipsis)
- **Progress Bar** (visual circles or linear bar + percentage)
- **Stats Row**: Tasks (12/27) • Time (28.5h) • Due Date
- **Hover State**: Lift shadow, show "View Details" button

**Priority Indicators:**
- High: Red accent, "!" icon
- Medium: Amber accent, "•" icon
- Low: Blue accent, "-" icon

**Drag-and-Drop:**
- Smooth animations (150ms ease-out)
- Drop zones highlight on drag
- Optimistic UI updates
- Undo toast notification

#### List View

```
┌──────────────────────────────────────────────────────────────────┐
│ Projects (3)                Filter: [All ▼]  Sort: [Priority ▼] │
├──────────────────────────────────────────────────────────────────┤
│ [📁] Quanta Development                                [HIGH]   │
│     Building personal operating system                          │
│     ●●●●●○○○○○ 45%  •  12/27 tasks  •  28.5h  •  Due Dec 1     │
├──────────────────────────────────────────────────────────────────┤
│ [📁] Client Portfolio Website                         [MEDIUM]  │
│     Freelance web development project                           │
│     ●●●●●●●● 80%  •  8/10 tasks  •  15.2h  •  Due Nov 15       │
├──────────────────────────────────────────────────────────────────┤
│ [📁] Learning System Design                            [LOW]    │
│     Complete online course and build project                    │
│     ●●●○○○○○○○ 25%  •  3/12 tasks  •  6h  •  Due Jan 30        │
└──────────────────────────────────────────────────────────────────┘
```

**Filters:**
- All Projects
- Active Only
- Archived
- By Priority (High/Medium/Low)
- By Due Date (Overdue, This Week, This Month)

**Sorting:**
- Priority (High → Low)
- Progress (% completion)
- Due Date (Soonest first)
- Time Spent (Most → Least)
- Recently Updated

### Tasks Tab Design

#### View Modes

**List View** (Default):
```
┌────────────────────────────────────────────────────────────┐
│ Tasks (12)          [All] [Today] [Overdue] [Upcoming]    │
│                     Group by: [Project ▼]    [+ Add Task] │
├────────────────────────────────────────────────────────────┤
│ ▸ QUANTA DEVELOPMENT (5 tasks)                            │
│                                                            │
│ ☐ Complete API integration               🚩 HIGH          │
│   [Quanta] • Due Oct 29 • #development #backend           │
│                                                            │
│ ☐ Build analytics dashboard              🚩 MEDIUM        │
│   [Quanta] • Due Nov 5 • #frontend #charts                │
│                                                            │
│ ☑ Review pull requests                   🚩 LOW           │
│   [Quanta] • Due Oct 28 • #code-review                    │
│   (Completed Oct 28, 2025)                                │
├────────────────────────────────────────────────────────────┤
│ ▸ CLIENT PORTFOLIO (3 tasks)                              │
│                                                            │
│ ☐ Design dashboard mockups                🚩 MEDIUM       │
│   [Client] • Due Oct 30 • #design #ui                     │
│                                                            │
│ ☐ Client meeting preparation              🚩 HIGH         │
│   [Client] • Due Oct 28 • #meeting #planning              │
└────────────────────────────────────────────────────────────┘
```

**Kanban View**:
```
┌────────────────────────────────────────────────────────────────┐
│ Todo (4)      │  In Progress (3)  │  Review (2)  │  Done (8)  │
├───────────────┼───────────────────┼──────────────┼────────────┤
│ ☐ API setup   │ ☐ Dashboard UI   │ ☐ PR #123    │ ☑ Login   │
│ 🚩 HIGH       │ 🚩 HIGH          │ 🚩 MEDIUM    │ 🚩 HIGH   │
│ Oct 29        │ Nov 5            │ Oct 28       │            │
│               │                  │              │            │
│ ☐ Mockups     │ ☐ DB schema      │ ☐ Testing    │ ☑ Setup   │
│ 🚩 MED        │ 🚩 MEDIUM        │ 🚩 LOW       │ 🚩 MED    │
└───────────────┴───────────────────┴──────────────┴────────────┘
```

#### Task Card / Row Elements

**Checkbox State:**
- Unchecked: Empty circle (○)
- Checked: Filled circle with check (☑)
- Animation: Scale + fade-through on toggle
- Strike-through text when completed

**Task Title:**
- Text-high color when active
- Text-med when completed
- Bold font, 16px
- Click to edit inline

**Metadata Row:**
- [Project Badge] • Due Date • Tags
- Icons: 📅 calendar, 🏷️ tags, 📁 project
- Muted text color
- Comma-separated tags

**Priority Flag:**
- Right-aligned
- Color-coded (red/amber/blue)
- Icon + text label
- Click to change priority (dropdown)

**Quick Actions** (on hover):
- ⋮ More menu (Edit, Duplicate, Delete)
- ➜ Move to project
- 📅 Reschedule
- ⏱️ Start timer

#### Smart Filters

**Today View:**
- Tasks due today
- Overdue tasks (red highlight)
- Scheduled time blocks from calendar

**Upcoming View:**
- Next 7 days
- Grouped by due date
- Shows workload distribution
- Warning if overcommitted (like Sunsama)

**Overdue View:**
- Tasks past due date
- Sorted by how overdue (most urgent first)
- Quick reschedule actions
- Batch snooze option

#### Task Hierarchy

**Structure:**
- Project → Task → Subtask
- Indent level for visual hierarchy
- Collapse/expand groups
- Completion cascades (all subtasks → task complete)

**Example:**
```
☐ Build Analytics Dashboard
  ☑ Design data schema
  ☐ Create API endpoints
    ☐ User stats endpoint
    ☐ Time tracking endpoint
  ☐ Build frontend components
```

#### Task Dependencies (Enhancement)

**Blocked Tasks:**
- Gray out task
- Show "Blocked by: [Task Name]" label
- Clicking opens dependency
- Auto-unblock when dependency complete

**Visual:**
```
☐ Deploy to production                    🚩 HIGH
  ⛔ Blocked by: "Complete testing"
```

---

## Income Tracking

### Research Insights

**From Freelance Dashboard Tools:**
- Simple transaction logging (date, source, amount)
- Monthly revenue trends
- Effective hourly rate calculations
- Client/project breakdown
- Growth metrics (MoM, YoY)

**From Financial Dashboards:**
- Avoid complexity - simple is better
- Visual charts for trends
- Goal tracking (monthly targets)
- Color-coded positive/negative changes

### Income Tab Design

#### Stats Row

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ £1,200      │  │ +25.0%      │  │ £416        │  │ £12.5K      │
│ This Month  │  │ Growth      │  │ Avg/Month   │  │ YTD Total   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

**Growth Metric:**
- Compare current month to last month
- Green for positive, red for negative
- Arrow indicator (↑ or ↓)

#### Recent Transactions

```
┌──────────────────────────────────────────────────────────┐
│ Income Transactions                       [+ Add Income] │
├──────────────────────────────────────────────────────────┤
│ 💰 Website Development                        £350.00   │
│    Client Portfolio Project                              │
│    Oct 25, 2025 • £70/hr effective rate                 │
├──────────────────────────────────────────────────────────┤
│ 💰 Consulting Call                            £125.00   │
│    Startup Advisory                                      │
│    Oct 20, 2025 • £125/hr effective rate                │
├──────────────────────────────────────────────────────────┤
│ 💰 Logo Design                                £200.00   │
│    Freelance Design Work                                 │
│    Oct 15, 2025 • £40/hr effective rate                 │
└──────────────────────────────────────────────────────────┘
```

**Transaction Card:**
- Icon (💰 or category-specific)
- Title/Description (bold)
- Project/Client (text-med)
- Date • Effective hourly rate
- Amount (right-aligned, large, bold)

**Effective Rate Calculation:**
- Amount ÷ Time Logged on Project
- Helps identify profitable work
- Visual indicator: >£50/hr green, £25-50 amber, <£25 red

#### Monthly Breakdown Chart

```
┌──────────────────────────────────────────────────────────┐
│ Monthly Revenue Trend                                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│       ┃                                                  │
│       ┃                                                  │
│       ┃        ┃                                         │
│       ┃        ┃        ┃                                │
│       ┃        ┃        ┃        ┃                       │
│  ─────┸────────┸────────┸────────┸───────────────       │
│   Jul     Aug     Sep     Oct     Nov                    │
│  £290    £520    £380    £475    £1200                   │
└──────────────────────────────────────────────────────────┘
```

**Chart Features:**
- Simple bar chart
- Hover shows exact amount + transactions count
- Color gradient based on performance
- Goal line overlay (optional)

#### Income Sources Breakdown

```
┌─────────────────────────────────────┐
│ Top Income Sources (This Quarter)  │
├─────────────────────────────────────┤
│ Client Work           £2,400  48%  │
│ ████████████████████              │
├─────────────────────────────────────┤
│ Freelance Projects    £1,800  36%  │
│ ███████████████                   │
├─────────────────────────────────────┤
│ Consulting            £800    16%  │
│ ██████                            │
└─────────────────────────────────────┘
```

#### Quick Add Modal

**Fields:**
- Date (default: today)
- Amount (£ symbol, numeric input)
- Source/Description (text)
- Project (dropdown, linked to projects)
- Hours Worked (optional, for rate calculation)
- Payment Method (optional: Cash, Bank, PayPal, Crypto)

**Smart Features:**
- Auto-calculate effective rate if hours provided
- Recently used sources dropdown
- Quick repeat transaction button
- Attach invoice/receipt (file upload)

---

## Analytics & Insights

### Research Insights

**From Productivity Analytics:**
- Track patterns over time
- Best working hours identification
- Productivity by day of week
- Correlation between focus quality and output

**From Dashboard Design:**
- 5-second rule: Answer questions at a glance
- 5-9 visuals maximum per dashboard
- Color-coded for quick scanning
- Drill-down for details

### Analytics Tab (New)

#### Time of Day Analysis

```
┌──────────────────────────────────────────────────────────┐
│ Peak Productivity Hours                                  │
├──────────────────────────────────────────────────────────┤
│ Focus Quality by Hour                                    │
│                                                          │
│ 10 │     ████                    ████                   │
│  9 │    █████                   █████                   │
│  8 │   ██████  ███             ██████                   │
│  7 │  ███████ █████   ███     ███████  ███             │
│  6 │ ████████ █████  █████   ████████ █████            │
│  5 │████████████████████████████████████████           │
│    └────────────────────────────────────────           │
│     6am  8am  10am 12pm  2pm  4pm  6pm  8pm            │
│                                                          │
│ 💡 Insight: You're most focused 9am-11am and 2pm-4pm   │
└──────────────────────────────────────────────────────────┘
```

#### Weekly Breakdown

```
┌──────────────────────────────────────────────────────────┐
│ This Week vs. Last Week                                  │
├──────────────────────────────────────────────────────────┤
│ Mon  ████████████ 3.2h     ███████ 2.1h                 │
│ Tue  █████████████ 3.5h    ████████ 2.5h                │
│ Wed  ██████████ 2.8h       ███████████ 3.2h             │
│ Thu  ████████████████ 4.1h █████████████ 3.8h           │
│ Fri  ███████████ 3.0h      ██████████ 2.9h              │
│ Sat  ████ 1.2h             ██ 0.5h                       │
│ Sun  ██ 0.5h               █ 0.3h                        │
│      This Week (18.3h)     Last Week (15.3h)            │
│                                                          │
│ ↗ +19.6% increase in focus time                         │
└──────────────────────────────────────────────────────────┘
```

#### Project Time Distribution

```
┌─────────────────────────────────────┐
│ Time by Project (Last 30 Days)     │
├─────────────────────────────────────┤
│ Quanta Dev        28.5h  52%       │
│ ████████████████████               │
│                                     │
│ Client Portfolio  15.2h  28%       │
│ ██████████                         │
│                                     │
│ Learning          8.0h   15%       │
│ █████                              │
│                                     │
│ Personal          2.8h   5%        │
│ ██                                 │
└─────────────────────────────────────┘
```

#### Streaks & Gamification

```
┌─────────────────────────────────────┐
│ Focus Streak Calendar              │
├─────────────────────────────────────┤
│ Current Streak: 🔥 12 days         │
│ Longest Streak: 🏆 28 days         │
│                                     │
│   M  T  W  T  F  S  S              │
│ W1 ██ ██ ██ ██ ██ ▓▓ ▓▓           │
│ W2 ██ ██ ██ ██ ██ ░░ ▓▓           │
│ W3 ██ ██ ██ ██ ██ ▓▓ ░░           │
│ W4 ██ ██ ░░ ░░ ░░ ░░ ░░           │
│                                     │
│ ██ >2h  ▓▓ 1-2h  ░░ <1h  ○○ None │
└─────────────────────────────────────┘
```

**Streak Rules:**
- 1+ hour of focus work = day counts
- Weekends optional (configurable)
- Visual heatmap (GitHub-style)
- Motivational messages on milestones

#### Focus Quality Insights

```
┌─────────────────────────────────────┐
│ Session Quality Trends             │
├─────────────────────────────────────┤
│ Average: 7.8/10 (Last 30 days)     │
│                                     │
│ Best Sessions:                      │
│ • Early morning (9-10am): 8.9/10   │
│ • After breaks: 8.5/10             │
│ • Deep Work type: 8.3/10           │
│                                     │
│ Lower Quality:                      │
│ • After lunch (1-2pm): 6.2/10      │
│ • Meetings days: 6.5/10            │
│ • Communication type: 6.8/10       │
│                                     │
│ 💡 Schedule deep work 9-11am       │
└─────────────────────────────────────┘
```

#### Revenue vs. Time Correlation

```
┌─────────────────────────────────────┐
│ Income per Focus Hour              │
├─────────────────────────────────────┤
│ This Month: £52.17/hr              │
│ Last Month: £48.20/hr (+8.2%)      │
│                                     │
│ Quanta Dev:      £45.50/hr         │
│ Client Work:     £62.00/hr  ⭐     │
│ Learning:        £0.00/hr          │
│ Freelance:       £58.30/hr         │
│                                     │
│ 💡 Focus more on client work       │
│    for higher returns               │
└─────────────────────────────────────┘
```

---

## UI Components Library

### Core Components

#### 1. Timer Component

**Visual Design:**
- Circular progress ring (CSS/SVG)
- Large time display (48px font)
- Pulsing glow when active
- Color states: idle (gray), active (accent), paused (amber)

**Props:**
- `value` (seconds elapsed)
- `isActive` (boolean)
- `isPaused` (boolean)
- `sessionType` (string)
- `onStart`, `onPause`, `onStop` (callbacks)

**Animations:**
- Ring grows 360° over session
- Pulse every 2s when active
- Smooth transitions (200ms ease-in-out)

#### 2. Task List Item

**States:**
- Default (unchecked)
- Completed (checked, strike-through)
- Overdue (red accent)
- Blocked (grayed out, disabled)

**Interactions:**
- Click checkbox → toggle complete
- Click title → edit inline
- Hover → show quick actions
- Drag handle → reorder

**Accessibility:**
- Keyboard nav (Tab, Space, Enter)
- ARIA labels
- Focus indicators

#### 3. Project Card

**Variants:**
- Compact (list view)
- Full (board view)
- Detailed (modal/detail page)

**Elements:**
- Header (icon, name, priority)
- Progress indicator
- Stats row (tasks, time, due date)
- Tags/labels
- Quick actions menu

#### 4. Progress Bar

**Types:**
- Linear (0-100% bar)
- Circular (ring around icon)
- Stepped (discrete stages)

**Indicators:**
- Percentage text
- Color gradient (0-40% red, 40-70% amber, 70-100% green)
- Animation on change

#### 5. Stats Card

**Layout:**
```
┌─────────────┐
│ [Icon]      │
│ 12.5h       │ <- Large value
│ This Week   │ <- Label
│ +2.5h ↑    │ <- Delta (optional)
└─────────────┘
```

**Props:**
- `label` (string)
- `value` (number/string)
- `icon` (component)
- `delta` (change indicator)
- `deltaType` (positive/negative/neutral)
- `module` (for color theming)

#### 6. Command Palette (Cmd+K)

**Design:**
- Modal overlay (80% screen width, max 600px)
- Search input at top (auto-focus)
- Results list (categorized)
- Keyboard navigation (↑↓ arrows, Enter)

**Categories:**
- Quick Actions (Start timer, Add task, Log income)
- Projects (Jump to project)
- Tasks (Jump to task)
- Navigation (Go to Analytics, Settings)

**Search:**
- Fuzzy matching
- Recent items prioritized
- Keyboard shortcuts shown (right side)

**Example:**
```
┌────────────────────────────────────────────┐
│ > start timer_                             │
├────────────────────────────────────────────┤
│ QUICK ACTIONS                              │
│   ▶ Start Timer                      Cmd+T│
│   ⊞ Start Pomodoro                  Cmd+P │
│                                            │
│ PROJECTS                                   │
│   📁 Quanta Development                   │
│   📁 Client Portfolio                      │
│                                            │
│ TASKS                                      │
│   ☐ Complete API integration              │
└────────────────────────────────────────────┘
```

#### 7. Focus Quality Slider

**Visual:**
- 10 circles in a row
- Fill from left to right as slider moves
- Color gradient: red → amber → green
- Haptic feedback on mobile

**Labels:**
- 1-3: "Distracted"
- 4-6: "Moderate"
- 7-9: "Focused"
- 10: "Flow State"

#### 8. Session Type Badge

**Styles:**
- Pill-shaped
- Icon + text
- Color-coded by type
- Minimal shadow

**Types:**
- Deep Work: 🧠 Purple
- Learning: 📚 Blue
- Admin: 📋 Gray
- Communication: 💬 Green
- Planning: 🗺️ Teal
- Creative: 🎨 Pink

---

## User Flows

### Flow 1: Start a Deep Work Session

1. User arrives on Productivity page
2. Clicks "Work Sessions" tab (or already there)
3. Sees idle timer (00:00:00)
4. Selects session type from dropdown → "Deep Work"
5. (Optional) Selects project → "Quanta Development"
6. Clicks [▶ Start Session]
7. Timer begins counting, ring animates
8. User works for 2h 15m
9. User clicks [■ Stop & Save]
10. (Optional) Adjusts focus quality slider → 8/10
11. Types notes → "Built timer component, added state management"
12. Session auto-saves to database
13. Timer resets to idle
14. New session appears in "Recent Sessions" list
15. Stats update: "Today's Focus" now shows 2.25h

**Edge Cases:**
- User closes browser → Timer state saved to localStorage, restored on return
- User pauses mid-session → Timer pauses, can resume or stop
- User forgets to stop → Prompt at midnight: "You have an active session (12:45:30). Stop it?"

### Flow 2: Quick Add Task (Keyboard Shortcut)

1. User presses `Cmd+K` (global)
2. Command palette opens
3. User types "add task"
4. Presses Enter on "Add New Task"
5. Modal opens with focus on title field
6. User types task title → "Build analytics dashboard"
7. Tabs to project field → Selects "Quanta"
8. Tabs to due date → Selects Nov 5
9. Tabs to priority → Selects "Medium"
10. Presses `Cmd+Enter` to save
11. Modal closes
12. Task appears in task list
13. Toast notification: "Task added successfully"

**Alternative Flow (Inline Add):**
1. User is on Tasks tab
2. Presses `N` key (quick add shortcut)
3. Inline input appears at top of list
4. User types title + Enter
5. Task created with smart defaults (due: today, priority: medium, project: last used)

### Flow 3: Plan Your Day (Sunsama-style)

1. User opens Productivity at start of day
2. System shows notification: "Plan your day?"
3. User clicks "Daily Planning"
4. Guided flow starts:

   **Step 1: Review Yesterday**
   - Shows incomplete tasks from yesterday
   - Options: Complete, Defer, or Delete

   **Step 2: Pull in Today's Work**
   - Shows tasks due today
   - Shows calendar events
   - User drag-drops tasks to time blocks

   **Step 3: Time Estimation**
   - User estimates time for each task
   - System calculates total: 6.5 hours
   - Warning: "You have 4 hours of meetings. Consider reducing tasks."

   **Step 4: Prioritize**
   - User drags tasks to reorder by priority
   - Top 3 highlighted as "Focus Tasks"

   **Step 5: Review & Commit**
   - Shows final plan for the day
   - User clicks "Start My Day"

5. Returns to Work Sessions tab with timer ready
6. First task auto-selected in session type

### Flow 4: Log Income from Completed Work

1. User completes client project
2. Goes to Income tab
3. Clicks [+ Add Income]
4. Modal opens
5. Fills form:
   - Amount: £350
   - Source: "Website Development"
   - Project: "Client Portfolio" (dropdown)
   - Date: Oct 25 (default today)
6. System auto-calculates effective rate:
   - Looks up time logged on "Client Portfolio": 5h
   - Calculates: £350 ÷ 5h = £70/hr
   - Shows: "Effective rate: £70/hr" in green
7. User clicks [Save]
8. Income appears in transaction list
9. Stats update: "This Month" increases
10. Growth % recalculated

### Flow 5: Analyze Productivity Patterns

1. User goes to Analytics tab
2. Sees "Peak Productivity Hours" chart
3. Notices 9-11am is highest focus quality
4. Scrolls to "Time by Project"
5. Sees 52% time on Quanta (personal project)
6. Scrolls to "Income per Focus Hour"
7. Sees Client work pays £62/hr vs Quanta £0/hr
8. **Insight**: Should schedule client work during peak hours (9-11am)
9. Goes to Calendar tab
10. Time-blocks 9-11am for "Client Work - Deep Focus"
11. Saves recurring schedule

**System Insight Card Appears:**
```
┌─────────────────────────────────────────┐
│ 💡 Productivity Insight                │
│                                         │
│ You're most focused 9-11am (avg 8.9/10)│
│ Your highest-paying work is client     │
│ projects (£62/hr).                     │
│                                         │
│ Try: Schedule client work during peak  │
│      focus hours for maximum ROI.      │
│                                         │
│ [Apply to Schedule]  [Dismiss]         │
└─────────────────────────────────────────┘
```

---

## Keyboard Shortcuts

### Global Shortcuts (Work Anywhere)

| Shortcut | Action | Context |
|----------|--------|---------|
| `Cmd/Ctrl + K` | Open command palette | Global |
| `Cmd/Ctrl + T` | Start/stop timer | Global |
| `Cmd/Ctrl + N` | New task (quick add) | Global |
| `Cmd/Ctrl + P` | Start Pomodoro session | Global |
| `Cmd/Ctrl + /` | Show keyboard shortcuts help | Global |
| `Esc` | Close modal/palette | Global |

### Task List Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `N` | New task (inline) | Tasks tab |
| `Space` | Toggle task complete | Task focused |
| `E` | Edit task | Task focused |
| `D` | Delete task (with confirm) | Task focused |
| `↑` `↓` | Navigate tasks | Task list |
| `Enter` | Open task details | Task focused |
| `Cmd + ↑` `↓` | Reorder task priority | Task focused |
| `1` `2` `3` | Set priority (High/Med/Low) | Task focused |
| `F` | Filter tasks | Tasks tab |
| `V` | Change view (List/Board/Cal) | Tasks/Projects tab |

### Project Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Shift + N` | New project | Projects tab |
| `A` | Archive project | Project focused |
| `G` then `P` | Go to Projects tab | Any tab |

### Session Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `T` | Start timer | Sessions tab |
| `S` | Stop timer | Sessions tab (active) |
| `L` | Log past session | Sessions tab |
| `1-9` | Set focus quality (timer running) | Sessions tab |
| `G` then `S` | Go to Sessions tab | Any tab |

### Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `G` then `S` | Go to Sessions |
| `G` then `P` | Go to Projects |
| `G` then `T` | Go to Tasks |
| `G` then `I` | Go to Income |
| `G` then `A` | Go to Analytics |

### Command Palette Actions

When palette open (`Cmd+K`):
- Type to filter
- `↑` `↓` to navigate
- `Enter` to execute
- `Esc` to close
- Supports fuzzy search: "st" matches "Start Timer"

---

## Mobile Considerations

### Design Adaptations

#### Layout Changes

**Desktop (>1024px):**
- Side-by-side layouts (timer + stats)
- 4-column stats grid
- Wide modals (600px)

**Tablet (768-1024px):**
- Stacked layouts
- 2-column stats grid
- Medium modals (500px)

**Mobile (<768px):**
- Single column everything
- 1-column stats grid (stacked)
- Full-width modals (bottom sheet)

#### Timer Adjustments

**Mobile Timer:**
- Larger touch targets (min 44x44px)
- Simplified controls (Start/Stop only, no pause)
- Persistent notification when timer running
- Lock screen controls (media session API)

**Example Mobile Layout:**
```
┌─────────────────┐
│                 │
│   ┌─────────┐   │
│   │  Timer  │   │
│   │ 00:42:18│   │
│   └─────────┘   │
│                 │
│  [Start] [Stop] │
│                 │
│  Type: [Deep▼]  │
│  Quality: 7/10  │
│                 │
└─────────────────┘
```

#### Task List Mobile

**Swipe Actions:**
- Swipe right → Complete
- Swipe left → Delete (with confirm)
- Tap → Expand details
- Long press → Quick actions menu

**Mobile-Specific Features:**
- Floating action button (FAB) for quick add
- Pull-to-refresh
- Infinite scroll (vs pagination)
- Bottom navigation (vs top tabs)

#### Quick Capture Widget

**Mobile Home Screen Widget:**
- Shows today's focus time
- One-tap timer start
- Task count badge
- Deep link to app

### Performance Optimizations

**Mobile-Specific:**
- Lazy load images
- Virtual scrolling for long lists
- Reduced animations (respect `prefers-reduced-motion`)
- Smaller bundle size (code splitting)
- Offline support (service worker)
- Touch-optimized interactions (no hover states)

### Progressive Web App (PWA)

**Features:**
- Add to home screen
- Offline task viewing
- Background timer sync
- Push notifications (daily planning reminder)
- Install prompt

---

## Implementation Priorities

### Phase 1: Core Timer & Tasks (Week 1-2)

**Must-Have:**
1. Work Sessions tab with basic timer
2. Start/stop/pause functionality
3. Session type selector
4. Focus quality slider
5. Notes field
6. Session history list
7. Basic stats (today's focus, weekly total)
8. Tasks tab with list view
9. Add/edit/delete tasks
10. Task completion toggle
11. Priority & due date

**Skip for Now:**
- Pomodoro mode
- Analytics
- Keyboard shortcuts
- Command palette

### Phase 2: Projects & Views (Week 3)

**Add:**
1. Projects tab with list view
2. Project cards (name, description, progress)
3. Project → Tasks relationship
4. Kanban board view (tasks only)
5. Task filtering (all/active/completed)
6. Project filtering by priority

**Skip:**
- Board view for projects
- Calendar view
- Task dependencies
- Subtasks

### Phase 3: Income & Basic Analytics (Week 4)

**Add:**
1. Income tab with transaction list
2. Add income modal
3. Monthly stats cards
4. Simple bar chart (monthly revenue)
5. Effective rate calculation
6. Basic analytics tab (time by project, weekly breakdown)

**Skip:**
- Income sources breakdown
- Advanced correlations
- Trend predictions

### Phase 4: Enhancements (Week 5-6)

**Add:**
1. Keyboard shortcuts (start with Cmd+K palette)
2. Pomodoro mode toggle
3. Streak tracking & heatmap
4. Peak hours analysis
5. Daily planning flow (simplified)
6. Task time estimation
7. Overcommitment warnings

### Phase 5: Polish & Advanced (Week 7+)

**Add:**
1. All remaining keyboard shortcuts
2. Task dependencies
3. Subtasks
4. Calendar integration
5. Board view for projects
6. Gantt chart (projects timeline)
7. Advanced analytics (correlations)
8. AI insights (pattern detection)
9. Export data (CSV, PDF reports)
10. Mobile app (PWA)

---

## Technical Specifications

### Data Models

#### WorkSession
```javascript
{
  id: string,
  userId: string,
  date: Date,
  startTime: Date,
  endTime: Date,
  duration: number, // seconds
  sessionType: 'Deep Work' | 'Learning' | 'Admin' | 'Communication' | 'Planning' | 'Creative',
  projectId: string,
  focusQuality: number, // 1-10
  notes: string,
  isPomodoroSession: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Project
```javascript
{
  id: string,
  userId: string,
  name: string,
  description: string,
  status: 'planning' | 'active' | 'review' | 'complete' | 'archived',
  priority: 'low' | 'medium' | 'high',
  dueDate: Date,
  startDate: Date,
  color: string, // hex color
  icon: string,
  tags: string[],
  estimatedHours: number,
  actualHours: number, // calculated from sessions
  completedTasks: number,
  totalTasks: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Task
```javascript
{
  id: string,
  userId: string,
  projectId: string,
  parentTaskId: string, // for subtasks
  title: string,
  description: string,
  status: 'todo' | 'in_progress' | 'review' | 'done',
  priority: 'low' | 'medium' | 'high',
  dueDate: Date,
  estimatedMinutes: number,
  completed: boolean,
  completedAt: Date,
  tags: string[],
  dependencies: string[], // task IDs this task is blocked by
  order: number, // for manual sorting
  createdAt: Date,
  updatedAt: Date
}
```

#### IncomeTransaction
```javascript
{
  id: string,
  userId: string,
  date: Date,
  amount: number,
  currency: string, // 'GBP', 'USD', etc.
  source: string,
  description: string,
  projectId: string,
  category: string,
  paymentMethod: string,
  hoursWorked: number, // optional, for rate calculation
  effectiveRate: number, // calculated: amount / hoursWorked
  invoiceNumber: string,
  isPaid: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### State Management

**Zustand Stores:**

```javascript
// useTimerStore.js
{
  isRunning: false,
  isPaused: false,
  elapsedSeconds: 0,
  sessionType: 'Deep Work',
  projectId: null,
  focusQuality: 7,
  notes: '',
  isPomodoroMode: false,
  pomodoroState: 'work' | 'short-break' | 'long-break',
  completedPomodoros: 0,

  actions: {
    start(),
    pause(),
    stop(),
    reset(),
    setSessionType(),
    setProject(),
    setFocusQuality(),
    setNotes(),
    togglePomodoroMode(),
    saveSession()
  }
}

// useTaskStore.js
{
  tasks: [],
  filter: 'all',
  sortBy: 'priority',
  groupBy: 'project',
  view: 'list',

  actions: {
    addTask(),
    updateTask(),
    deleteTask(),
    toggleComplete(),
    setFilter(),
    setSortBy(),
    setGroupBy(),
    setView()
  }
}

// useProjectStore.js
{
  projects: [],
  activeProject: null,
  view: 'board',

  actions: {
    addProject(),
    updateProject(),
    deleteProject(),
    archiveProject(),
    setActiveProject(),
    setView()
  }
}
```

### API Endpoints

```
POST   /api/sessions                 Create work session
GET    /api/sessions                 List sessions (with filters)
PUT    /api/sessions/:id             Update session
DELETE /api/sessions/:id             Delete session
GET    /api/sessions/stats           Get aggregate stats

POST   /api/projects                 Create project
GET    /api/projects                 List projects
GET    /api/projects/:id             Get project details
PUT    /api/projects/:id             Update project
DELETE /api/projects/:id             Delete project
GET    /api/projects/:id/tasks       Get project tasks
GET    /api/projects/:id/time        Get project time stats

POST   /api/tasks                    Create task
GET    /api/tasks                    List tasks (with filters)
GET    /api/tasks/:id                Get task details
PUT    /api/tasks/:id                Update task
DELETE /api/tasks/:id                Delete task
POST   /api/tasks/:id/complete       Toggle task completion

POST   /api/income                   Create income transaction
GET    /api/income                   List transactions
PUT    /api/income/:id               Update transaction
DELETE /api/income/:id               Delete transaction
GET    /api/income/stats             Get income analytics

GET    /api/analytics/productivity   Productivity analytics
GET    /api/analytics/time-patterns  Time-of-day analysis
GET    /api/analytics/streaks        Streak data
GET    /api/analytics/correlations   Income vs time correlations
```

### Performance Targets

- Initial page load: <2s
- Timer start/stop: <100ms (perceived instant)
- Task toggle complete: <100ms
- Search/filter results: <300ms
- Chart rendering: <500ms
- Command palette open: <200ms

### Browser Support

- Chrome/Edge 100+
- Firefox 100+
- Safari 15+
- Mobile Safari 15+
- Chrome Android 100+

---

## Design Tokens

### Colors (Dark Mode Default)

```css
/* Background */
--bg-primary: #0a0a0a;
--bg-secondary: #141414;
--bg-tertiary: #1a1a1a;
--bg-muted: #242424;

/* Text */
--text-high: #f5f5f5;
--text-med: #a0a0a0;
--text-low: #6a6a6a;

/* Accent (Productivity Module) */
--accent: #6366f1; /* Indigo */
--accent-hover: #4f46e5;
--accent-muted: #4f46e533; /* 20% opacity */

/* Priority Colors */
--priority-high: #ef4444; /* Red */
--priority-medium: #f59e0b; /* Amber */
--priority-low: #3b82f6; /* Blue */

/* State Colors */
--success: #10b981; /* Green */
--warning: #f59e0b; /* Amber */
--error: #ef4444; /* Red */
--info: #3b82f6; /* Blue */

/* Borders */
--border: #2a2a2a;
--border-focus: #4f46e5;
```

### Typography

```css
/* Font Family */
--font-sans: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem;  /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-glow: 0 0 20px 0 var(--accent-muted);
```

### Border Radius

```css
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-xl: 1rem;     /* 16px */
--radius-full: 9999px; /* Circle */
```

### Transitions

```css
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

---

## Accessibility Checklist

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Logical tab order
- [ ] Focus indicators visible (2px outline, accent color)
- [ ] No keyboard traps
- [ ] Shortcuts don't conflict with screen readers

### Screen Reader Support
- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`)
- [ ] ARIA labels on icon-only buttons
- [ ] ARIA live regions for timer updates
- [ ] Alt text on images
- [ ] Proper heading hierarchy (H1 → H2 → H3)

### Visual Accessibility
- [ ] WCAG AA contrast ratios (4.5:1 text, 3:1 UI)
- [ ] Text resizable to 200% without breaking layout
- [ ] No reliance on color alone (use icons + text)
- [ ] Reduced motion mode supported (`prefers-reduced-motion`)

### Forms
- [ ] Labels associated with inputs
- [ ] Error messages clear and actionable
- [ ] Required fields indicated
- [ ] Form validation accessible

---

## Success Metrics

### Adoption Metrics
- Daily active usage (sessions started per day)
- Task completion rate
- Income logging frequency
- Avg session duration

### Productivity Metrics
- Total focus hours logged (weekly)
- Avg focus quality score
- Project completion rate
- Task velocity (tasks/week)

### Engagement Metrics
- Streak length (consecutive days)
- Feature usage (which tabs most visited)
- Keyboard shortcut adoption
- Daily planning completion rate

### Business Metrics (for user)
- Monthly income growth
- Effective hourly rate trend
- Revenue per focus hour
- High-value client work %

---

## Future Enhancements (Post-MVP)

### Integrations
- Calendar sync (Google Calendar, Apple Calendar)
- Task import (Todoist, Notion, Asana)
- Time tracking export (Toggl, RescueTime)
- Invoicing tools (Stripe, PayPal)

### AI Features
- Smart scheduling (auto-block focus time)
- Task priority suggestions
- Productivity insights (GPT-powered)
- Voice logging (transcribe session notes)

### Collaboration
- Shared projects (for team work)
- Client portals (show project progress)
- Time tracking reports for clients

### Advanced Analytics
- Predictive goal completion dates
- Burnout risk detection
- Optimal work/break ratios
- Seasonal productivity patterns

### Gamification
- XP system across all modules
- Achievements/badges
- Leaderboards (friends comparison)
- Productivity challenges

---

## Conclusion

This specification provides a comprehensive blueprint for building a world-class productivity module tailored to a young entrepreneur's needs. The design draws from the best practices of Linear (speed & minimal design), Notion (flexible databases), Sunsama (daily planning), Toggl (time tracking), and RescueTime (analytics).

**Key Differentiators:**
1. **Deep work focus** - Not just task lists, but session quality tracking
2. **Income integration** - Connects time to money for business clarity
3. **Keyboard-first** - Power users can fly through workflows
4. **Actionable insights** - Analytics that drive behavior change
5. **Compound value** - The longer you use it, the more valuable it becomes

**Implementation Philosophy:**
- Start simple, iterate based on usage
- Optimize for speed and minimal friction
- Respect the user's time and focus
- Make data entry feel effortless
- Surface insights that matter

This is a long-term tool designed to grow with the user's business journey—from solo freelancer to scaling entrepreneur.
