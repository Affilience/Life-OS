# Dashboard Module

## Purpose
The Dashboard is the central hub of LifeOS—a "mission control" that provides at-a-glance value across all modules. It shows momentum, upcoming priorities, active quests, and module health without duplicating the functionality of individual module pages.

## Location
- **Route**: `/`
- **Navigation**: Sidebar → Home (or click logo)
- **Icon**: Home icon

## Key Sections

### 1. Hero Section
- Time-based greeting ("Good Morning", "Good Afternoon", "Good Evening")
- Motivational status message
- Avatar display with current equipment
- XP progress bar with shimmer effect
- Current level and XP to next level

### 2. Momentum Indicators (3 Cards)
- **Weekly Score**: Overall productivity/activity score for the week
- **Streak**: Current longest active streak (workout, journal, etc.)
- **Credits**: Currency earned from completing tasks and quests

### 3. Today's Focus
- Cross-module priorities for today
- Examples:
  - "Complete 3 deep work sessions" (Productivity)
  - "Leg day workout" (Health)
  - "Finish Chapter 5 of Atomic Habits" (Knowledge)
- Shows 3-4 top priorities

### 4. Next 4 Hours
- Upcoming calendar events and time blocks
- Shows what's scheduled in near future
- Helps with time awareness

### 5. Active Quests
- Currently active quests/missions
- Progress bars for each quest
- Urgency badges (High/Medium/Low priority)
- Reward preview

### 6. Module Health Scores
- 4 module cards showing engagement:
  - Health (green gradient)
  - Productivity (blue gradient)
  - Knowledge (purple gradient)
  - Financial (gold gradient)
- Each shows:
  - Score out of 100
  - Status text (excellent/good/needs-attention)
  - Progress bar

### 7. Quick Actions (4 Buttons)
- **Log Workout**: Opens Health module workout modal
- **New Task**: Opens Productivity module task creation
- **Journal**: Opens Journal writer
- **Track Time**: Opens Calendar time blocking

### 8. 7-Day Activity Heatmap
- Visual representation of activity across past week
- Color-coded by intensity (green = high activity)
- Hover shows daily details

## Common User Questions

**Q: "What should I focus on today?"**
A: Check the "Today's Focus" section—it pulls the top 3-4 priorities from your modules.

**Q: "How am I doing overall?"**
A: Look at Module Health Scores—they show your engagement across different areas. Below 50 means you need attention in that area.

**Q: "What's my current streak?"**
A: The Momentum section shows your longest active streak (usually workout or journal streak).

**Q: "How much XP until I level up?"**
A: The XP bar in the Hero section shows your progress. Hover over it to see exact numbers.

## Data Sources

The Dashboard aggregates data from:
- **Productivity**: Tasks, deep work sessions
- **Health**: Workouts, nutrition logs
- **Knowledge**: Books in progress, learning sessions
- **Financial**: Recent transactions, net worth
- **Journal**: Recent entries, mood trends
- **Calendar**: Upcoming events, time blocks
- **Quests**: Active missions, progress
- **User Stats**: XP, level, streaks, credits

## Related Modules

- All modules feed data to the Dashboard
- Dashboard does NOT duplicate module functionality—it only shows summaries
- Click any widget to navigate to the full module
