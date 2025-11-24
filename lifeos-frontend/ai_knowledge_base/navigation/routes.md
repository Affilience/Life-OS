# LifeOS Navigation & Routes

## All Available Routes

### Main Navigation (Sidebar/Bottom Nav)
- `/` - Dashboard (Home)
- `/modules` - Modules overview page
- `/character` - Character customization & progression
- `/social` - Social features (guilds, leaderboards, friends, challenges)
- `/quests` - Active quests and missions
- `/settings` - User settings and preferences

### Module Routes
- `/productivity` - Productivity module (tasks, deep work, projects)
- `/health` - Health & Fitness module
- `/knowledge` - Knowledge management (books, podcasts, notes)
- `/skills` - Skills learning and practice tracking
- `/financial` - Financial tracking
- `/calendar` - Calendar and time blocking
- `/journal` - Journal book (list of entries)
- `/journal/write` - Journal writer (create new entry)

### Feature Pages
- `/rewards` - Rewards marketplace
- `/discoveries` - Discoveries and unlocks
- `/learn` - Learning interface (alternate Knowledge view)
- `/avatar` - Equipment inventory
- `/evolution` - Evolution showcase (avatar progression)

### Demo/Test Pages
- `/gamification` - Atom/Cosmos demo
- `/cosmic-evolution` - Cosmic evolution demo
- `/constellations-test` - Constellations test page
- `/constellations-demo` - Constellations demo

## Quick Actions Mapping

When user wants to:
- **"Log a workout"** → Navigate to `/health` or show modal
- **"Add a task"** → Navigate to `/productivity` or show task modal
- **"Write in journal"** → Navigate to `/journal/write`
- **"Check calendar"** → Navigate to `/calendar`
- **"Track time"** → Navigate to `/calendar` with time-blocking focus
- **"See my character"** → Navigate to `/character`
- **"Join a guild"** → Navigate to `/social` (Guilds tab)
- **"Check leaderboard"** → Navigate to `/social` (Leaderboards tab)

## Deep Links with Actions

Some routes support query parameters for specific actions:
- `/health?action=log-workout` - Opens workout logging modal
- `/productivity?action=new-task` - Opens new task modal
- `/productivity?action=start-pomodoro&task=123` - Starts Pomodoro for task 123
- `/journal/write?prompt=reflection` - Opens journal with reflection prompt
- `/social?tab=guilds` - Opens Social page on Guilds tab
- `/social?tab=challenges` - Opens Social page on Challenges tab

## Navigation Behavior

- **Desktop**: Fixed sidebar (250px) + main content area
- **Mobile**: Bottom nav (5 tabs) + hamburger menu for sidebar
- **Active State**: Current route highlighted in sidebar/bottom nav
- **Logo Click**: Always returns to Dashboard (`/`)
