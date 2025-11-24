# LifeOS System Overview

## What is LifeOS?

LifeOS (Life Operating System) is an integrated personal operating system for tracking productivity, fitness, learning, finances, journaling, calendar, and skills. All modules feed into a central timeline and analytics dashboard that reveals patterns and optimizes life.

## Core Philosophy

- **Interconnected**: All modules write to central timeline. Data flows between modules.
- **Actionable**: Every feature answers "what should I do with this?" Focus on insights that drive behavior.
- **Fast Entry**: Logging is quick and painless.
- **Privacy First**: All data local/self-hosted. User owns everything.
- **Gamified**: XP, levels, streaks, equipment, skill trees make progress visible and rewarding.

## 11 Core Modules

1. **Dashboard** (`/`) - Unified view, quick stats, momentum indicators, module health
2. **Modules** (`/modules`) - Overview of all modules and their stats
3. **Character** (`/character`) - Avatar customization, equipment, skill trees, evolution showcase
4. **Social** (`/social`) - Guilds, leaderboards, friends, challenges, activity feed
5. **Quests** (`/quests`) - Active missions, quest tracking, rewards
6. **Productivity** (`/productivity`) - Deep work tracking, projects, tasks, time blocking
7. **Health** (`/health`) - Workouts, nutrition, sleep, recovery
8. **Knowledge** (`/knowledge`) - Books, podcasts, notes, ideas, learning progress
9. **Journal** (`/journal`) - Free-form entries, mood tracking, reflection prompts
10. **Calendar** (`/calendar`) - Time blocking, planned vs actual, energy mapping
11. **Skills** (`/skills`) - Skill cards, practice logs, progression, real-world usage
12. **Financial** (`/financial`) - Income, expenses, net worth, goals, business finances

## Navigation Structure

### Sidebar (Desktop)
- Fixed 250px wide sidebar on left
- Main navigation items: Home, Modules, Character, Social, Quests
- Settings at bottom

### Bottom Nav (Mobile)
- 5 tabs: Home, Modules, Character, Social, Settings
- Always visible at bottom on mobile devices

### Quick Actions (Dashboard)
- Fast access to common tasks
- "Log Workout", "Add Task", "New Entry", "Track Time"

## Gamification System

### XP & Leveling
- Users gain XP from completing actions across all modules
- XP bar shown on Dashboard and Character page
- Level up grants rewards and unlocks new features

### Streaks
- Workout streak, journal streak, productivity streak
- Displayed with 🔥 fire emoji
- Breaking a streak shows recovery options

### Equipment & Items
- Unlock equipment through achievements
- Equipment displayed on character avatar
- Cosmetic and stat-boosting items

### Skill Trees
- Visual progression system for different skills
- Unlock nodes by practicing and leveling up
- Multiple skill paths to choose from

## Data Flow

1. User performs action (log workout, complete task, write journal entry)
2. Action saved to module-specific table
3. Event emitted to central timeline
4. Dashboard widgets update
5. XP awarded based on action type
6. Streaks and stats recalculated

## Key Features

- **Time Blocking**: Visual calendar with planned vs actual time
- **Correlation Engine**: Links sleep → productivity, workouts → mood, etc.
- **Module Health Scores**: At-a-glance engagement metrics per module
- **Cross-Module Insights**: Dashboard shows data from multiple modules together
- **Social Features**: Compete with friends, join guilds, track leaderboards
