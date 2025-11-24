import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SAMPLE_WORKOUTS, WORKOUT_TEMPLATES } from '../data/exerciseDatabase';
import { useAvatarStore } from './avatarStore';

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      // Data
      workouts: SAMPLE_WORKOUTS,
      templates: WORKOUT_TEMPLATES,

      // Active workout state
      activeWorkout: null,
      isWorkoutActive: false,
      workoutStartTime: null,
      currentExerciseIndex: 0,

      // UI state
      selectedDate: new Date().toISOString().split('T')[0],
      viewMode: 'dashboard', // 'dashboard' | 'history' | 'templates' | 'exercises'

      // Personal Records
      personalRecords: {}, // { exerciseId: { weight: X, reps: Y, date: Z } }

      // Actions

      // Start a new workout
      startWorkout: (templateId = null) => {
        const template = templateId
          ? get().templates.find(t => t.id === templateId)
          : null;

        const newWorkout = {
          id: `workout-${Date.now()}`,
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
          name: template?.name || 'Quick Workout',
          exercises: template?.exercises.map(e => ({
            exerciseId: e.exerciseId,
            sets: Array(e.sets).fill(null).map(() => ({
              weight: 0,
              reps: 0,
              completed: false,
            })),
            targetSets: e.sets,
            targetReps: e.targetReps,
          })) || [],
          notes: '',
          totalVolume: 0,
          prsAchieved: 0,
        };

        set({
          activeWorkout: newWorkout,
          isWorkoutActive: true,
          workoutStartTime: Date.now(),
          currentExerciseIndex: 0,
        });
      },

      // Add exercise to active workout
      addExerciseToWorkout: (exerciseId, sets = 3) => {
        const state = get();
        if (!state.activeWorkout) return;

        const newExercise = {
          exerciseId,
          sets: Array(sets).fill(null).map(() => ({
            weight: 0,
            reps: 0,
            completed: false,
          })),
          targetSets: sets,
          targetReps: 10,
        };

        set({
          activeWorkout: {
            ...state.activeWorkout,
            exercises: [...state.activeWorkout.exercises, newExercise],
          },
        });
      },

      // Log a set
      logSet: (exerciseIndex, setIndex, weight, reps) => {
        const state = get();
        if (!state.activeWorkout) return;

        const updatedExercises = [...state.activeWorkout.exercises];
        updatedExercises[exerciseIndex].sets[setIndex] = {
          weight: parseFloat(weight),
          reps: parseInt(reps),
          completed: true,
          timestamp: new Date().toISOString(),
        };

        // Check if it's a PR
        const exerciseId = updatedExercises[exerciseIndex].exerciseId;
        const currentPR = state.personalRecords[exerciseId];
        const isPR = !currentPR ||
                     (weight > currentPR.weight) ||
                     (weight === currentPR.weight && reps > currentPR.reps);

        if (isPR) {
          updatedExercises[exerciseIndex].sets[setIndex].isPR = true;
          set({
            personalRecords: {
              ...state.personalRecords,
              [exerciseId]: {
                weight: parseFloat(weight),
                reps: parseInt(reps),
                date: new Date().toISOString(),
              },
            },
          });
        }

        set({
          activeWorkout: {
            ...state.activeWorkout,
            exercises: updatedExercises,
          },
        });
      },

      // Finish workout
      finishWorkout: () => {
        const state = get();
        if (!state.activeWorkout) return;

        const duration = Math.round((Date.now() - state.workoutStartTime) / 1000 / 60);

        // Calculate total volume
        let totalVolume = 0;
        let prsAchieved = 0;
        let completedSets = 0;

        state.activeWorkout.exercises.forEach(exercise => {
          exercise.sets.forEach(set => {
            if (set.completed) {
              totalVolume += set.weight * set.reps;
              completedSets++;
              if (set.isPR) prsAchieved++;
            }
          });
        });

        const completedWorkout = {
          ...state.activeWorkout,
          endTime: new Date().toISOString(),
          duration,
          totalVolume: Math.round(totalVolume),
          prsAchieved,
        };

        // Award XP for completing workout
        // Base XP: 20 for completing a workout
        // Bonus: 2 XP per completed set
        // PR bonus: 10 XP per PR achieved
        // Duration bonus: 1 XP per 5 minutes (encourages longer workouts)
        let xpEarned = 20; // Base completion XP
        xpEarned += completedSets * 2; // Set completion bonus
        xpEarned += prsAchieved * 10; // PR bonus
        xpEarned += Math.floor(duration / 5); // Duration bonus

        // Add XP to avatar
        const avatarStore = useAvatarStore.getState();
        avatarStore.addXP(xpEarned);
        avatarStore.updateModuleProgress('fitness', {
          workoutsCompleted: 1,
          totalVolume: Math.round(totalVolume),
          prsAchieved,
        });

        set({
          workouts: [completedWorkout, ...state.workouts],
          activeWorkout: null,
          isWorkoutActive: false,
          workoutStartTime: null,
          currentExerciseIndex: 0,
        });

        return completedWorkout;
      },

      // Cancel workout
      cancelWorkout: () => {
        set({
          activeWorkout: null,
          isWorkoutActive: false,
          workoutStartTime: null,
          currentExerciseIndex: 0,
        });
      },

      // Delete workout
      deleteWorkout: (id) => {
        set((state) => ({
          workouts: state.workouts.filter(w => w.id !== id),
        }));
      },

      // Update workout notes
      updateWorkoutNotes: (notes) => {
        set((state) => ({
          activeWorkout: {
            ...state.activeWorkout,
            notes,
          },
        }));
      },

      // Get workouts for date
      getWorkoutsForDate: (date) => {
        return get().workouts.filter(w => w.date.startsWith(date));
      },

      // Get exercise history
      getExerciseHistory: (exerciseId) => {
        const workouts = get().workouts;
        const history = [];

        workouts.forEach(workout => {
          const exercise = workout.exercises.find(e => e.exerciseId === exerciseId);
          if (exercise) {
            exercise.sets.forEach(set => {
              if (set.completed) {
                history.push({
                  date: workout.date,
                  weight: set.weight,
                  reps: set.reps,
                  volume: set.weight * set.reps,
                  isPR: set.isPR || false,
                });
              }
            });
          }
        });

        return history.sort((a, b) => new Date(a.date) - new Date(b.date));
      },

      // UI actions
      setViewMode: (mode) => set({ viewMode: mode }),
      setCurrentExerciseIndex: (index) => set({ currentExerciseIndex: index }),
    }),
    {
      name: 'lifeos-workout',
    }
  )
);
