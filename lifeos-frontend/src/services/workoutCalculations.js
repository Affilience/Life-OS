/**
 * Calculate estimated 1 Rep Max using Epley formula
 */
export function calculate1RM(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Calculate total volume for a workout
 */
export function calculateWorkoutVolume(workout) {
  let total = 0;
  workout.exercises.forEach(exercise => {
    exercise.sets.forEach(set => {
      if (set.completed) {
        total += set.weight * set.reps;
      }
    });
  });
  return Math.round(total);
}

/**
 * Calculate workout intensity (average % of estimated 1RM)
 */
export function calculateIntensity(sets, estimated1RM) {
  if (!sets.length || !estimated1RM) return 0;

  const totalIntensity = sets.reduce((sum, set) => {
    if (!set.completed) return sum;
    return sum + (set.weight / estimated1RM);
  }, 0);

  return Math.round((totalIntensity / sets.length) * 100);
}

/**
 * Detect trend in exercise progress
 */
export function detectProgressTrend(history) {
  if (history.length < 3) return 'insufficient-data';

  const recent = history.slice(-5);
  const older = history.slice(-10, -5);

  if (older.length === 0) return 'insufficient-data';

  const recentAvg = recent.reduce((sum, h) => sum + h.volume, 0) / recent.length;
  const olderAvg = older.reduce((sum, h) => sum + h.volume, 0) / older.length;

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (change > 10) return 'improving';
  if (change < -10) return 'declining';
  return 'maintaining';
}

/**
 * Calculate workout streak
 */
export function calculateWorkoutStreak(workouts) {
  if (workouts.length === 0) return 0;

  const sortedWorkouts = [...workouts].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const workout of sortedWorkouts) {
    const workoutDate = new Date(workout.date);
    workoutDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak++;
      currentDate = workoutDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get weekly workout frequency
 */
export function getWeeklyFrequency(workouts) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return workouts.filter(w => new Date(w.date) >= weekAgo).length;
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}

/**
 * Format date to relative time (Today, Yesterday, etc.)
 */
export function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}
