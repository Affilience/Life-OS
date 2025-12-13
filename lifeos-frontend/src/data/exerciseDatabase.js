// Comprehensive exercise database
// Imports from modular category files for 500+ exercises
import {
  ALL_EXERCISES,
  getExercisesByCategory,
  getExercisesByEquipment,
  getExercisesByMuscleGroup,
  getExercisesBySubcategory,
  searchExercises,
  getExerciseCount,
  getAllMuscleGroups,
  getAllEquipmentTypes,
  getAllSubcategories,
} from './exercises/index.js';

// Export the full exercise database
export const EXERCISE_DATABASE = ALL_EXERCISES;

// Helper to get exercise by ID (built-in only - for components that don't need custom)
export const getExerciseById = (exerciseId) => {
  return ALL_EXERCISES[exerciseId] || null;
};

// Re-export utility functions
export {
  getExercisesByCategory,
  getExercisesByEquipment,
  getExercisesByMuscleGroup,
  getExercisesBySubcategory,
  searchExercises,
  getExerciseCount,
  getAllMuscleGroups,
  getAllEquipmentTypes,
  getAllSubcategories,
};

// Exercise categories with visual styling
export const CATEGORIES = [
  { id: 'chest', name: 'Chest', icon: '💪', color: '#ef4444' },
  { id: 'back', name: 'Back', icon: '🏋️', color: '#3b82f6' },
  { id: 'legs', name: 'Legs', icon: '🦵', color: '#8b5cf6' },
  { id: 'shoulders', name: 'Shoulders', icon: '💪', color: '#f59e0b' },
  { id: 'arms', name: 'Arms', icon: '💪', color: '#10b981' },
  { id: 'core', name: 'Core', icon: '🧘', color: '#06b6d4' },
  { id: 'cardio', name: 'Cardio', icon: '🏃', color: '#ec4899' },
  { id: 'olympic', name: 'Olympic & Functional', icon: '🏋️', color: '#f97316' },
];

// Equipment types
export const EQUIPMENT_TYPES = [
  { id: 'barbell', name: 'Barbell', icon: '🏋️' },
  { id: 'dumbbell', name: 'Dumbbell', icon: '💪' },
  { id: 'machine', name: 'Machine', icon: '🏋️' },
  { id: 'cable', name: 'Cable', icon: '🔗' },
  { id: 'bodyweight', name: 'Bodyweight', icon: '🤸' },
  { id: 'kettlebell', name: 'Kettlebell', icon: '🔔' },
  { id: 'resistance-band', name: 'Resistance Band', icon: '🪢' },
  { id: 'none', name: 'No Equipment', icon: '✋' },
  { id: 'other', name: 'Other', icon: '🏃' },
  { id: 'bike', name: 'Bike', icon: '🚴' },
];

// Exercise types
export const EXERCISE_TYPES = [
  { id: 'compound', name: 'Compound', description: 'Multi-joint movement' },
  { id: 'isolation', name: 'Isolation', description: 'Single-joint movement' },
  { id: 'isometric', name: 'Isometric', description: 'Static hold' },
  { id: 'cardio', name: 'Cardio', description: 'Cardiovascular exercise' },
  { id: 'plyometric', name: 'Plyometric', description: 'Explosive movement' },
];

// Workout templates
export const WORKOUT_TEMPLATES = [
  {
    id: 'push-day',
    name: 'Push Day',
    description: 'Chest, shoulders, and triceps',
    exercises: [
      { exerciseId: 'bench-press', sets: 4, targetReps: 8 },
      { exerciseId: 'incline-bench-press', sets: 3, targetReps: 10 },
      { exerciseId: 'overhead-press', sets: 3, targetReps: 8 },
      { exerciseId: 'lateral-raise', sets: 3, targetReps: 12 },
      { exerciseId: 'tricep-dips', sets: 3, targetReps: 12 },
    ],
    icon: '💪',
    color: '#ef4444',
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    description: 'Back and biceps',
    exercises: [
      { exerciseId: 'deadlift', sets: 3, targetReps: 5 },
      { exerciseId: 'pull-ups', sets: 4, targetReps: 10 },
      { exerciseId: 'barbell-row', sets: 4, targetReps: 8 },
      { exerciseId: 'lat-pulldown', sets: 3, targetReps: 10 },
      { exerciseId: 'barbell-curl', sets: 3, targetReps: 12 },
    ],
    icon: '🏋️',
    color: '#3b82f6',
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    description: 'Quads, hamstrings, and glutes',
    exercises: [
      { exerciseId: 'back-squat', sets: 4, targetReps: 8 },
      { exerciseId: 'romanian-deadlift', sets: 3, targetReps: 10 },
      { exerciseId: 'leg-press', sets: 3, targetReps: 12 },
      { exerciseId: 'walking-lunges', sets: 3, targetReps: 12 },
      { exerciseId: 'standing-calf-raise', sets: 4, targetReps: 15 },
    ],
    icon: '🦵',
    color: '#8b5cf6',
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'Complete workout',
    exercises: [
      { exerciseId: 'back-squat', sets: 3, targetReps: 10 },
      { exerciseId: 'bench-press', sets: 3, targetReps: 10 },
      { exerciseId: 'barbell-row', sets: 3, targetReps: 10 },
      { exerciseId: 'overhead-press', sets: 3, targetReps: 10 },
      { exerciseId: 'plank', sets: 3, targetReps: 60 },
    ],
    icon: '🏋️',
    color: '#10b981',
  },
  {
    id: 'upper-body',
    name: 'Upper Body',
    description: 'Chest, back, shoulders, and arms',
    exercises: [
      { exerciseId: 'bench-press', sets: 4, targetReps: 8 },
      { exerciseId: 'pull-ups', sets: 4, targetReps: 10 },
      { exerciseId: 'overhead-press', sets: 3, targetReps: 10 },
      { exerciseId: 'dumbbell-row', sets: 3, targetReps: 10 },
      { exerciseId: 'barbell-curl', sets: 3, targetReps: 12 },
      { exerciseId: 'tricep-pushdown', sets: 3, targetReps: 12 },
    ],
    icon: '💪',
    color: '#ef4444',
  },
  {
    id: 'lower-body',
    name: 'Lower Body',
    description: 'Quads, hamstrings, glutes, and calves',
    exercises: [
      { exerciseId: 'back-squat', sets: 4, targetReps: 8 },
      { exerciseId: 'deadlift', sets: 3, targetReps: 5 },
      { exerciseId: 'leg-press', sets: 3, targetReps: 12 },
      { exerciseId: 'lying-leg-curl', sets: 3, targetReps: 12 },
      { exerciseId: 'leg-extension', sets: 3, targetReps: 12 },
      { exerciseId: 'standing-calf-raise', sets: 4, targetReps: 15 },
    ],
    icon: '🦵',
    color: '#8b5cf6',
  },
  {
    id: 'olympic-day',
    name: 'Olympic Lifting',
    description: 'Snatch, clean, and jerk variations',
    exercises: [
      { exerciseId: 'power-snatch', sets: 5, targetReps: 3 },
      { exerciseId: 'power-clean', sets: 5, targetReps: 3 },
      { exerciseId: 'push-jerk', sets: 4, targetReps: 3 },
      { exerciseId: 'front-squat', sets: 3, targetReps: 5 },
      { exerciseId: 'snatch-grip-deadlift', sets: 3, targetReps: 5 },
    ],
    icon: '🏋️',
    color: '#f97316',
  },
  {
    id: 'crossfit-wod',
    name: 'CrossFit WOD',
    description: 'High-intensity functional workout',
    exercises: [
      { exerciseId: 'power-clean', sets: 5, targetReps: 5 },
      { exerciseId: 'burpees', sets: 3, targetReps: 15 },
      { exerciseId: 'box-jumps', sets: 3, targetReps: 20 },
      { exerciseId: 'kettlebell-swings', sets: 3, targetReps: 20 },
      { exerciseId: 'toes-to-bar', sets: 3, targetReps: 15 },
    ],
    icon: '🏋️',
    color: '#06b6d4',
  },
  {
    id: 'cardio-hiit',
    name: 'HIIT Cardio',
    description: 'High-intensity interval training',
    exercises: [
      { exerciseId: 'burpees', sets: 4, targetReps: 10 },
      { exerciseId: 'jumping-jacks', sets: 4, targetReps: 30 },
      { exerciseId: 'high-knees', sets: 4, targetReps: 30 },
      { exerciseId: 'mountain-climbers', sets: 4, targetReps: 20 },
      { exerciseId: 'battle-ropes', sets: 4, targetReps: 30 },
    ],
    icon: '🏃',
    color: '#ec4899',
  },
];

// Sample workout data (for demo/testing)
export const SAMPLE_WORKOUTS = [
  {
    id: 'workout-1',
    date: '2025-01-15T09:00:00Z',
    startTime: '2025-01-15T09:00:00Z',
    endTime: '2025-01-15T10:15:00Z',
    duration: 75,
    name: 'Push Day',
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          { weight: 135, reps: 10, completed: true },
          { weight: 155, reps: 8, completed: true },
          { weight: 175, reps: 6, completed: true },
          { weight: 185, reps: 5, completed: true, isPR: true },
        ],
      },
      {
        exerciseId: 'incline-bench-press',
        sets: [
          { weight: 115, reps: 10, completed: true },
          { weight: 135, reps: 8, completed: true },
          { weight: 135, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'overhead-press',
        sets: [
          { weight: 95, reps: 8, completed: true },
          { weight: 95, reps: 8, completed: true },
          { weight: 95, reps: 7, completed: true },
        ],
      },
    ],
    notes: 'Felt strong today! Hit a PR on bench press',
    totalVolume: 12500,
    prsAchieved: 1,
  },
  {
    id: 'workout-2',
    date: '2025-01-13T10:00:00Z',
    startTime: '2025-01-13T10:00:00Z',
    endTime: '2025-01-13T11:00:00Z',
    duration: 60,
    name: 'Pull Day',
    exercises: [
      {
        exerciseId: 'deadlift',
        sets: [
          { weight: 225, reps: 5, completed: true },
          { weight: 275, reps: 5, completed: true },
          { weight: 315, reps: 3, completed: true },
        ],
      },
      {
        exerciseId: 'pull-ups',
        sets: [
          { weight: 0, reps: 12, completed: true },
          { weight: 0, reps: 10, completed: true },
          { weight: 0, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'barbell-row',
        sets: [
          { weight: 135, reps: 10, completed: true },
          { weight: 155, reps: 8, completed: true },
          { weight: 155, reps: 8, completed: true },
        ],
      },
    ],
    notes: '',
    totalVolume: 8500,
    prsAchieved: 0,
  },
  {
    id: 'workout-3',
    date: '2025-01-11T14:00:00Z',
    startTime: '2025-01-11T14:00:00Z',
    endTime: '2025-01-11T15:00:00Z',
    duration: 60,
    name: 'Leg Day',
    exercises: [
      {
        exerciseId: 'back-squat',
        sets: [
          { weight: 185, reps: 10, completed: true },
          { weight: 225, reps: 8, completed: true },
          { weight: 245, reps: 6, completed: true },
          { weight: 255, reps: 5, completed: true },
        ],
      },
      {
        exerciseId: 'leg-press',
        sets: [
          { weight: 270, reps: 12, completed: true },
          { weight: 315, reps: 10, completed: true },
          { weight: 315, reps: 10, completed: true },
        ],
      },
    ],
    notes: 'Legs feeling strong',
    totalVolume: 11750,
    prsAchieved: 0,
  },
];
