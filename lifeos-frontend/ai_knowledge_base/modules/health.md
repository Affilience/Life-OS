# Health & Fitness Module

## Purpose
Tracks workouts, nutrition, sleep, and recovery. Feeds data to Dashboard for correlation analysis with productivity and mood.

## Location
- **Route**: `/health`
- **Navigation**: Sidebar → Modules → Health
- **Quick Action**: Dashboard → "Log Workout"
- **Icon**: Heart icon
- **Color**: Green (`--success-500`)

## Key Features

### 1. Workout Logging
- **Exercise Type**: Cardio, Strength, HIIT, Yoga, Sports, etc.
- **Duration**: Minutes spent exercising
- **Intensity**: Low (1) to High (5)
- **Calories**: Estimated or tracked calories burned
- **Notes**: Optional workout notes

### 2. Nutrition Tracking
- **Meal Type**: Breakfast, Lunch, Dinner, Snack
- **Calories**: Total calories consumed
- **Macros**: Protein, Carbs, Fats (in grams)
- **Water Intake**: Glasses/liters of water

### 3. Sleep Tracking
- **Duration**: Hours slept (e.g., 7.5 hours)
- **Quality Rating**: 1-5 stars
- **Wake Feeling**: How you felt waking up (Refreshed/Tired/Groggy)
- **Notes**: Dreams, interruptions, etc.

### 4. Recovery Monitoring
- **Soreness Level**: 1-5 scale
- **Energy Levels**: Low/Medium/High
- **Readiness Score**: Overall readiness for training (1-10)

## Common User Actions

**"Log a workout"**
→ Opens workout modal with fields for exercise type, duration, intensity, calories

**"Check this week's workouts"**
→ Shows 7-day workout history with total time and calories burned

**"How many calories did I burn today?"**
→ Sums workout calories for current day from workout logs

**"What's my workout streak?"**
→ Displays current consecutive days with at least one workout logged

**"Track sleep"**
→ Opens sleep logging modal with duration, quality, wake feeling

## Data Structures

### Workouts Table
- `user_id`: User identifier
- `timestamp`: When workout occurred
- `exercise_type`: Type of exercise
- `duration`: Minutes
- `intensity`: 1-5 scale
- `calories`: Calories burned
- `notes`: Optional text

### Nutrition Logs Table
- `user_id`: User identifier
- `timestamp`: When meal consumed
- `meal_type`: Breakfast/Lunch/Dinner/Snack
- `calories`: Total calories
- `protein`: Grams
- `carbs`: Grams
- `fats`: Grams
- `water_intake`: Glasses/liters

### Sleep Logs Table
- `user_id`: User identifier
- `date`: Date of sleep
- `hours_slept`: Duration in hours
- `quality`: 1-5 rating
- `wake_feeling`: Refreshed/Tired/Groggy
- `notes`: Optional text

## Stats & Insights

- **Weekly Activity**: Total workouts and calories burned this week
- **Average Sleep**: Average hours slept over last 7/30 days
- **Workout Frequency**: Days with workouts vs. rest days
- **Macro Balance**: Protein/Carbs/Fats distribution
- **Recovery Trends**: Soreness and energy levels over time

## XP & Rewards

- Log workout: +50 XP
- Log nutrition: +20 XP
- Log sleep: +30 XP
- Complete weekly workout goal: +200 XP
- Maintain 7-day workout streak: +500 XP

## Related Modules

- **Dashboard**: Health score widget, workout streak
- **Calendar**: Scheduled workouts appear as events
- **Journal**: Auto-suggests reflection prompts after workouts ("How did your workout feel?")
- **Quests**: Health-related quests (e.g., "Work out 5 times this week")

## Correlation Insights

The AI can analyze:
- Workout → Productivity correlation (e.g., "You're 34% more productive on days you exercise")
- Sleep → Mood correlation (e.g., "Your mood is rated 1.5 points higher on 8+ hour sleep nights")
- Nutrition → Energy levels
