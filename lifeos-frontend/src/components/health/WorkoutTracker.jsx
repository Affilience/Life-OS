/**
 * WorkoutTracker - Main workout tracking component
 * Orchestrates the entire workout system
 */

import { useWorkoutStore } from '../../stores/workoutStore';
import WorkoutDashboard from './WorkoutDashboard';
import ActiveWorkout from './ActiveWorkout';

export default function WorkoutTracker() {
  const { isWorkoutActive } = useWorkoutStore();

  // Show active workout if one is in progress
  if (isWorkoutActive) {
    return <ActiveWorkout />;
  }

  // Otherwise show the dashboard
  return <WorkoutDashboard />;
}
