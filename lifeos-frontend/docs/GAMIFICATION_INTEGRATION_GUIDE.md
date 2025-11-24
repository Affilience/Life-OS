# Unified Gamification System - Integration Guide

## Overview

This guide shows how to integrate the unified gamification system into any module or page in LifeOS.

## Architecture Summary

The unified gamification system consists of:

1. **Backend (Supabase)**: 8 new tables + enhanced existing tables with PostgreSQL functions
2. **Frontend Store**: `useGamificationStore` - Single source of truth
3. **Event Hooks**: `useGamificationEvents` - Trigger rewards from any module
4. **UI Components**: Pre-built React components for all gamification features
5. **Real-time Subscriptions**: Live updates via Supabase real-time

## Quick Start

### 1. Initialize Store on App Load

In your main `App.jsx` or auth handler:

```jsx
import { useGamificationStore } from './stores/gamificationStore';
import { useGamificationSubscriptions } from './hooks/useGamificationEvents';

function App() {
  const { initialize, userId } = useGamificationStore();

  useEffect(() => {
    // After user authentication
    if (userId) {
      initialize(userId);
    }
  }, [userId]);

  // Subscribe to real-time updates
  useGamificationSubscriptions();

  return (
    // Your app
  );
}
```

### 2. Add Progress Bar to Layout

Add the unified progress bar to your top navigation or sidebar:

```jsx
import { UnifiedProgressBar } from './components/gamification';

function Sidebar() {
  return (
    <div className="sidebar">
      {/* Your sidebar content */}

      {/* Add progress bar */}
      <UnifiedProgressBar compact />
    </div>
  );
}
```

### 3. Trigger Events from Modules

In any module, trigger gamification events:

```jsx
import { useGamificationEvents } from '../hooks/useGamificationEvents';

function ProductivityPage() {
  const { productivity } = useGamificationEvents();

  const handleCompleteTask = async (task) => {
    // Complete task logic...

    // Trigger gamification event
    const result = await productivity.taskCompleted(task);

    // Result contains: xp_awarded, credits_awarded, level_up_triggered, etc.
    if (result?.level_up_triggered) {
      setShowLevelUpModal(true);
    }
  };

  return (
    // Your page
  );
}
```

### 4. Show Notifications

Add toast managers to your app root:

```jsx
import { AchievementToastManager } from './components/gamification';

function App() {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  // Listen for achievements
  useEffect(() => {
    const subscription = supabase
      .channel('achievements')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'achievement_progress',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setUnlockedAchievements(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [userId]);

  return (
    <>
      {/* Your app */}

      {/* Toast notifications */}
      <AchievementToastManager achievements={unlockedAchievements} />
    </>
  );
}
```

## Module-Specific Integration Examples

### Productivity Module

```jsx
import { useGamificationEvents } from '../hooks/useGamificationEvents';
import { XPGainAnimation } from '../components/gamification';

function TaskList() {
  const { productivity } = useGamificationEvents();
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const completeTask = async (task) => {
    // Mark task complete
    await markComplete(task.id);

    // Trigger gamification
    const result = await productivity.taskCompleted({
      id: task.id,
      type: task.type,
      priority: task.priority,
      deep_work: task.deep_work,
    });

    // Show XP animation
    if (result?.xp_awarded > 0) {
      setXpGained(result.xp_awarded);
      setShowXPGain(true);
    }
  };

  return (
    <>
      {/* Task list */}
      <div className="task-list">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={() => completeTask(task)}
          />
        ))}
      </div>

      {/* XP gain animation */}
      {showXPGain && (
        <XPGainAnimation
          amount={xpGained}
          onComplete={() => setShowXPGain(false)}
        />
      )}
    </>
  );
}
```

### Fitness Module

```jsx
import { useGamificationEvents } from '../hooks/useGamificationEvents';

function WorkoutTracker() {
  const { fitness } = useGamificationEvents();

  const completeWorkout = async (workout) => {
    // Save workout
    await saveWorkout(workout);

    // Trigger gamification
    const result = await fitness.workoutCompleted({
      id: workout.id,
      type: workout.type, // 'strength', 'cardio', etc.
      duration: workout.duration_minutes,
      calories: workout.calories_burned,
    });

    // Check for personal record
    if (workout.is_personal_record) {
      await fitness.personalRecord(
        workout.exercise_name,
        workout.weight
      );
    }

    // Check streak
    const streak = await checkWorkoutStreak();
    if (streak >= 7) {
      await fitness.workoutStreak(streak);
    }
  };

  return (
    // Your workout UI
  );
}
```

### Knowledge Module

```jsx
function BookTracker() {
  const { knowledge } = useGamificationEvents();

  const finishBook = async (book) => {
    // Mark book finished
    await updateBook(book.id, { status: 'finished' });

    // Trigger gamification
    await knowledge.bookFinished({
      id: book.id,
      title: book.title,
      pages: book.pages,
    });
  };

  const completeLearningSession = async (minutes, topic) => {
    await knowledge.learningSession(minutes, topic);
  };

  return (
    // Your book tracker UI
  );
}
```

## Dashboard Integration

Full dashboard example showing all gamification features:

```jsx
import React, { useEffect } from 'react';
import { useGamificationStore } from '../stores/gamificationStore';
import {
  UnifiedProgressBar,
  StreakGrid,
  MissionTabs,
  EquipmentGrid,
} from '../components/gamification';

function Dashboard() {
  const {
    initialize,
    userId,
    isLoading,
    streaks,
    missions,
    ownedEquipment,
    equippedItems,
    equipItem,
    unequipItem,
    completeMission,
  } = useGamificationStore();

  useEffect(() => {
    if (userId) {
      initialize(userId);
    }
  }, [userId]);

  if (isLoading) {
    return <div>Loading gamification...</div>;
  }

  return (
    <div className="dashboard p-6">
      {/* Header with progress */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <UnifiedProgressBar showDetails />
      </section>

      {/* Streaks */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Active Streaks</h2>
        <StreakGrid streaks={streaks} columns={3} />
      </section>

      {/* Missions */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Missions</h2>
        <MissionTabs
          missions={missions}
          onComplete={completeMission}
        />
      </section>

      {/* Equipment */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Equipment</h2>
        <EquipmentGrid
          equipment={ownedEquipment}
          equippedIds={equippedItems.map(e => e.equipment_id)}
          onEquip={equipItem}
          onUnequip={unequipItem}
        />
      </section>
    </div>
  );
}
```

## Event Types Reference

### Productivity Events
- `taskCompleted` - Task completed
- `projectMilestone` - Project milestone reached
- `deepWorkSession` - Deep work session completed
- `pomodoroCompleted` - Pomodoro completed

### Fitness Events
- `workoutCompleted` - Workout finished
- `macroGoalHit` - Daily macro targets hit
- `personalRecord` - Personal record achieved
- `workoutStreak` - Workout streak milestone

### Knowledge Events
- `bookFinished` - Book completed
- `skillMastered` - Skill mastery achieved
- `learningSession` - Learning session completed
- `courseCompleted` - Course finished

### Journal Events
- `entryCreated` - Journal entry written
- `reflectionCompleted` - Reflection completed
- `weeklyReview` - Weekly review done

### Financial Events
- `budgetTracked` - Budget tracked for day
- `savingsGoalHit` - Savings goal reached
- `incomeAdded` - Income recorded

### Calendar Events
- `perfectWeek` - Perfect week (all time blocks completed)
- `timeBlockCompleted` - Time block completed
- `deadlineMet` - Deadline met on time

### Skills Events
- `skillPracticed` - Skill practice session
- `weeklyActivityCompleted` - Weekly activity done

### Cross-Module Events
- `allModulesActive` - All modules used in one day
- `dailyLoginStreak` - Daily login streak
- `weeklyGoalsMet` - All weekly goals met

## Available Components

### Layout Components
- `UnifiedProgressBar` - Level/Stage/XP display (compact or full)

### Notification Components
- `XPGainAnimation` - Floating +XP indicator
- `CreditsGainAnimation` - Floating credits indicator
- `LevelUpModal` - Level up celebration modal
- `AchievementToast` - Achievement unlock notification
- `AchievementToastManager` - Queue manager for multiple achievements

### Feature Components
- `StreakCard` - Individual streak display
- `StreakGrid` - Multiple streaks in grid
- `EquipmentCard` - Equipment item display
- `EquipmentGrid` - Equipment inventory
- `MissionCard` - Mission display
- `MissionGrid` - Mission list
- `MissionTabs` - Missions with frequency tabs

## Store Actions Reference

### Core Actions
- `initialize(userId)` - Initialize store with user data
- `addXP(amount, source)` - Add XP and check for level up
- `addModuleXP(module, amount)` - Add module-specific XP
- `syncAll()` - Refresh all data from Supabase

### Equipment Actions
- `equipItem(equipmentId)` - Equip an item
- `unequipItem(equipmentId)` - Unequip an item
- `refreshEquipment()` - Refresh equipment from database

### Currency Actions
- `addCredits(amount, source)` - Add cosmic credits
- `spendCredits(amount, purpose)` - Spend cosmic credits

### Streak Actions
- `updateStreak(module, success)` - Update streak for module
- `refreshStreaks()` - Refresh streaks from database

### Mission Actions
- `completeMission(missionId)` - Complete a mission
- `refreshMissions()` - Refresh missions from database

### Constellation Actions
- `checkConstellationProgress(module)` - Check for star unlocks
- `refreshConstellations()` - Refresh constellations from database

### Utility Actions
- `recalculateXPMultiplier()` - Recalculate XP multiplier
- `logEvent(eventType, eventSource, eventData)` - Log event to history
- `reset()` - Reset store (logout)

## Store State Reference

```typescript
{
  // Core
  userId: string | null,
  isInitialized: boolean,
  isLoading: boolean,
  lastSyncedAt: string | null,

  // Progression
  level: number,
  currentStage: number,
  totalXP: number,
  currentXP: number,
  xpToNextLevel: number,
  xpMultiplier: number,

  // Equipment & Stats
  equippedItems: Array,
  ownedEquipment: Array,
  stats: {
    defense: number,
    strength: number,
    vitality: number,
    intelligence: number,
    wisdom: number,
  },

  // Currency
  cosmicCredits: number,
  lifetimeCreditsEarned: number,
  lifetimeCreditsSpent: number,

  // Streaks
  streaks: Array,
  globalStreak: object | null,
  shieldsRemaining: number,

  // Missions
  missions: {
    daily: Array,
    weekly: Array,
    monthly: Array,
    seasonal: Array,
  },

  // Achievements
  achievements: Array,
  unlockedAchievements: Array,
  recentAchievements: Array,

  // Constellations
  constellations: {
    orion: { unlocked, total, stars },
    phoenix: { unlocked, total, stars },
    athena: { unlocked, total, stars },
    chronos: { unlocked, total, stars },
    plutus: { unlocked, total, stars },
  },

  // Perks
  unlockedPerks: Array,
  activePerks: Array,

  // Module XP
  moduleXP: {
    productivity: number,
    fitness: number,
    knowledge: number,
    journal: number,
    finance: number,
    calendar: number,
    skills: number,
  },

  // Events
  recentEvents: Array,
  pendingRewards: Array,
}
```

## Testing the System

### Manual Testing Steps

1. **Initialize Store**
   ```javascript
   const store = useGamificationStore.getState();
   await store.initialize('user-id-here');
   ```

2. **Trigger Test Event**
   ```javascript
   const { productivity } = useGamificationEvents();
   const result = await productivity.taskCompleted({
     id: 'test-task',
     type: 'task',
     priority: 'high',
   });
   console.log('Result:', result);
   ```

3. **Check State Updates**
   ```javascript
   const state = useGamificationStore.getState();
   console.log('Level:', state.level);
   console.log('XP:', state.totalXP);
   console.log('Credits:', state.cosmicCredits);
   ```

4. **Verify Database**
   ```sql
   -- Check gamification events
   SELECT * FROM gamification_events ORDER BY created_at DESC LIMIT 10;

   -- Check user progress
   SELECT * FROM user_module_progress WHERE user_id = 'your-user-id';
   ```

## Performance Considerations

1. **Debounce frequent events** - Don't trigger XP for every keystroke
2. **Batch related events** - Group multiple actions into one event when possible
3. **Use subscriptions wisely** - Only subscribe to what you need
4. **Cache store data** - Store persists minimal data to localStorage
5. **Lazy load components** - Use React.lazy for heavy components

## Troubleshooting

### Store not initializing
- Check if userId is available
- Verify Supabase connection
- Check browser console for errors

### Events not triggering rewards
- Verify process_gamification_event function exists in Supabase
- Check event parameters match expected format
- Look at gamification_events table for error logs

### UI not updating
- Ensure useGamificationSubscriptions is called
- Check Supabase real-time is enabled
- Verify RLS policies allow access

## Next Steps

1. Integrate into all existing modules
2. Add more achievement definitions
3. Create seasonal mission rotation
4. Build perk tree UI
5. Add social features (leaderboards, sharing)
6. Implement prestige/rebirth system
7. Add more equipment sets with bonuses

## Support

For issues or questions, check:
- `/docs/UNIFIED_GAMIFICATION_ARCHITECTURE.md` - Full system architecture
- `/src/db/migrations/002_unified_gamification.sql` - Database schema
- `/src/stores/gamificationStore.js` - Store implementation
- `/src/hooks/useGamificationEvents.js` - Event hooks

---

**Remember**: Every user action should feel rewarding. When in doubt, add more feedback!
