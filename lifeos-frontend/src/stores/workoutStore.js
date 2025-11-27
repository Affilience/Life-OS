import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SAMPLE_WORKOUTS, WORKOUT_TEMPLATES } from '../data/exerciseDatabase';
import { useAvatarStore } from './avatarStore';

// Cardio activity types
export const CARDIO_TYPES = {
  running: { id: 'running', name: 'Running', icon: '🏃', unit: 'miles', color: '#10b981' },
  cycling: { id: 'cycling', name: 'Cycling', icon: '🚴', unit: 'miles', color: '#3b82f6' },
  swimming: { id: 'swimming', name: 'Swimming', icon: '🏊', unit: 'yards', color: '#06b6d4' },
  rowing: { id: 'rowing', name: 'Rowing', icon: '🚣', unit: 'meters', color: '#8b5cf6' },
  walking: { id: 'walking', name: 'Walking', icon: '🚶', unit: 'miles', color: '#22c55e' },
  hiking: { id: 'hiking', name: 'Hiking', icon: '🥾', unit: 'miles', color: '#84cc16' },
  elliptical: { id: 'elliptical', name: 'Elliptical', icon: '🏋️', unit: 'miles', color: '#f59e0b' },
  stairmaster: { id: 'stairmaster', name: 'Stair Climber', icon: '🪜', unit: 'floors', color: '#ef4444' },
  jumpRope: { id: 'jumpRope', name: 'Jump Rope', icon: '🪢', unit: 'minutes', color: '#ec4899' },
};

// Helper: Convert pace (min/mile) to speed (mph)
export const paceToSpeed = (paceMinutes) => {
  if (!paceMinutes || paceMinutes <= 0) return 0;
  return 60 / paceMinutes;
};

// Helper: Convert speed (mph) to pace (min/mile)
export const speedToPace = (speed) => {
  if (!speed || speed <= 0) return 0;
  return 60 / speed;
};

// Helper: Format pace as MM:SS
export const formatPace = (paceMinutes) => {
  if (!paceMinutes || paceMinutes <= 0) return '--:--';
  const mins = Math.floor(paceMinutes);
  const secs = Math.round((paceMinutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper: Format duration as HH:MM:SS or MM:SS
export const formatDuration = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return '0:00';
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper: Calculate pace from distance and time
export const calculatePace = (distance, durationSeconds) => {
  if (!distance || !durationSeconds || distance <= 0) return 0;
  return (durationSeconds / 60) / distance; // minutes per unit
};

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      // Data
      workouts: SAMPLE_WORKOUTS,
      templates: WORKOUT_TEMPLATES,
      cardioWorkouts: [], // Separate array for cardio sessions

      // Active workout state
      activeWorkout: null,
      isWorkoutActive: false,
      workoutStartTime: null,
      currentExerciseIndex: 0,

      // UI state
      selectedDate: new Date().toISOString().split('T')[0],
      viewMode: 'dashboard', // 'dashboard' | 'history' | 'templates' | 'exercises' | 'cardio'

      // Personal Records
      personalRecords: {}, // { exerciseId: { weight: X, reps: Y, date: Z } }
      cardioRecords: {}, // { activityType: { distance: X, duration: Y, pace: Z, date: W } }

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

      // Add a set to an exercise in the active workout
      addSetToExercise: (exerciseIndex) => {
        const state = get();
        if (!state.activeWorkout) return;

        const updatedExercises = [...state.activeWorkout.exercises];
        updatedExercises[exerciseIndex].sets.push({
          weight: 0,
          reps: 0,
          completed: false,
        });

        set({
          activeWorkout: {
            ...state.activeWorkout,
            exercises: updatedExercises,
          },
        });
      },

      // Remove a set from an exercise (only if not completed)
      removeSetFromExercise: (exerciseIndex, setIndex) => {
        const state = get();
        if (!state.activeWorkout) return;

        const updatedExercises = [...state.activeWorkout.exercises];
        const exercise = updatedExercises[exerciseIndex];

        // Only allow removing if set is not completed and there's more than 1 set
        if (exercise.sets[setIndex]?.completed || exercise.sets.length <= 1) return;

        exercise.sets.splice(setIndex, 1);

        set({
          activeWorkout: {
            ...state.activeWorkout,
            exercises: updatedExercises,
          },
        });
      },

      // Log a set
      logSet: (exerciseIndex, setIndex, weight, reps, setType = 'normal') => {
        const state = get();
        if (!state.activeWorkout) return;

        const updatedExercises = [...state.activeWorkout.exercises];
        updatedExercises[exerciseIndex].sets[setIndex] = {
          weight: parseFloat(weight),
          reps: parseInt(reps),
          completed: true,
          timestamp: new Date().toISOString(),
          setType, // Store set type (normal, warmup, drop, failure)
        };

        // Check if it's a PR (only for non-warmup sets)
        const exerciseId = updatedExercises[exerciseIndex].exerciseId;
        const currentPR = state.personalRecords[exerciseId];
        const isPR = setType !== 'warmup' && (
          !currentPR ||
          (weight > currentPR.weight) ||
          (weight === currentPR.weight && reps > currentPR.reps)
        );

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

      // ==================
      // CARDIO ACTIONS
      // ==================

      // Log a cardio workout
      logCardioWorkout: (cardioData) => {
        const state = get();
        const {
          activityType,
          distance,
          durationSeconds,
          date = new Date().toISOString(),
          notes = '',
          perceivedEffort, // 1-10 RPE scale
          heartRateAvg,
          heartRateMax,
          calories,
          elevation,
          weather,
          splits = [], // For runs: [{distance, time, pace}]
        } = cardioData;

        // Calculate pace
        const pace = calculatePace(distance, durationSeconds);
        const speed = paceToSpeed(pace);

        const newCardioWorkout = {
          id: `cardio-${Date.now()}`,
          date,
          activityType,
          distance: parseFloat(distance) || 0,
          durationSeconds: parseInt(durationSeconds) || 0,
          pace,
          speed,
          notes,
          perceivedEffort,
          heartRateAvg,
          heartRateMax,
          calories,
          elevation,
          weather,
          splits,
        };

        // Check for PRs
        const currentRecord = state.cardioRecords[activityType];
        const prs = [];

        // Check distance PR (longest single session)
        if (!currentRecord?.longestDistance || distance > currentRecord.longestDistance) {
          prs.push('longestDistance');
        }

        // Check pace PR (fastest pace for similar distance - within 10%)
        if (currentRecord?.fastestPace) {
          const similarDistanceWorkouts = state.cardioWorkouts.filter(w =>
            w.activityType === activityType &&
            Math.abs(w.distance - distance) / distance < 0.1
          );
          const isFasterThanSimilar = similarDistanceWorkouts.every(w => pace < w.pace);
          if (isFasterThanSimilar && pace < currentRecord.fastestPace) {
            prs.push('fastestPace');
          }
        } else if (pace > 0) {
          prs.push('fastestPace');
        }

        // Check duration PR (longest session)
        if (!currentRecord?.longestDuration || durationSeconds > currentRecord.longestDuration) {
          prs.push('longestDuration');
        }

        newCardioWorkout.prs = prs;

        // Update records
        const updatedRecords = {
          ...state.cardioRecords,
          [activityType]: {
            ...currentRecord,
            longestDistance: Math.max(distance, currentRecord?.longestDistance || 0),
            fastestPace: pace > 0 ? Math.min(pace, currentRecord?.fastestPace || Infinity) : currentRecord?.fastestPace,
            longestDuration: Math.max(durationSeconds, currentRecord?.longestDuration || 0),
            lastActivity: date,
            totalDistance: (currentRecord?.totalDistance || 0) + distance,
            totalDuration: (currentRecord?.totalDuration || 0) + durationSeconds,
            totalSessions: (currentRecord?.totalSessions || 0) + 1,
          },
        };

        // Award XP
        let xpEarned = 15; // Base cardio XP
        xpEarned += Math.floor(durationSeconds / 300); // 1 XP per 5 minutes
        xpEarned += Math.floor(distance * 5); // 5 XP per mile/unit
        xpEarned += prs.length * 15; // 15 XP per PR

        const avatarStore = useAvatarStore.getState();
        avatarStore.addXP(xpEarned);
        avatarStore.updateModuleProgress('fitness', {
          cardioSessionsCompleted: 1,
          cardioDistance: distance,
          cardioDuration: durationSeconds,
        });

        set({
          cardioWorkouts: [newCardioWorkout, ...state.cardioWorkouts],
          cardioRecords: updatedRecords,
        });

        return { workout: newCardioWorkout, xpEarned, prs };
      },

      // Delete cardio workout
      deleteCardioWorkout: (id) => {
        set((state) => ({
          cardioWorkouts: state.cardioWorkouts.filter(w => w.id !== id),
        }));
      },

      // Get cardio history for a specific activity type
      getCardioHistory: (activityType = null) => {
        const workouts = get().cardioWorkouts;
        if (activityType) {
          return workouts.filter(w => w.activityType === activityType);
        }
        return workouts;
      },

      // Get cardio stats for a time period
      getCardioStats: (days = 30, activityType = null) => {
        const workouts = get().cardioWorkouts;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const filtered = workouts.filter(w => {
          const workoutDate = new Date(w.date);
          const matchesDate = workoutDate >= cutoffDate;
          const matchesType = !activityType || w.activityType === activityType;
          return matchesDate && matchesType;
        });

        return {
          totalSessions: filtered.length,
          totalDistance: filtered.reduce((sum, w) => sum + (w.distance || 0), 0),
          totalDuration: filtered.reduce((sum, w) => sum + (w.durationSeconds || 0), 0),
          avgPace: filtered.length > 0
            ? filtered.reduce((sum, w) => sum + (w.pace || 0), 0) / filtered.filter(w => w.pace > 0).length
            : 0,
          avgDistance: filtered.length > 0
            ? filtered.reduce((sum, w) => sum + (w.distance || 0), 0) / filtered.length
            : 0,
          totalCalories: filtered.reduce((sum, w) => sum + (w.calories || 0), 0),
          prsAchieved: filtered.reduce((sum, w) => sum + (w.prs?.length || 0), 0),
          workoutsByType: Object.entries(
            filtered.reduce((acc, w) => {
              acc[w.activityType] = (acc[w.activityType] || 0) + 1;
              return acc;
            }, {})
          ).map(([type, count]) => ({ type, count })),
        };
      },

      // Get pace trend data for charts
      getPaceTrend: (activityType, days = 90) => {
        const workouts = get().cardioWorkouts;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return workouts
          .filter(w => w.activityType === activityType && new Date(w.date) >= cutoffDate && w.pace > 0)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(w => ({
            date: w.date,
            pace: w.pace,
            distance: w.distance,
            duration: w.durationSeconds,
          }));
      },

      // Get distance trend data for charts
      getDistanceTrend: (activityType = null, days = 90) => {
        const workouts = get().cardioWorkouts;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return workouts
          .filter(w => {
            const matchesDate = new Date(w.date) >= cutoffDate;
            const matchesType = !activityType || w.activityType === activityType;
            return matchesDate && matchesType;
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(w => ({
            date: w.date,
            distance: w.distance,
            activityType: w.activityType,
          }));
      },

      // Get weekly/monthly aggregated data
      getCardioAggregated: (activityType = null, period = 'week') => {
        const workouts = get().cardioWorkouts;
        const grouped = {};

        workouts.forEach(w => {
          if (activityType && w.activityType !== activityType) return;

          const date = new Date(w.date);
          let key;

          if (period === 'week') {
            // Get ISO week
            const startOfYear = new Date(date.getFullYear(), 0, 1);
            const weekNum = Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
            key = `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
          } else if (period === 'month') {
            key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          } else {
            key = w.date.split('T')[0];
          }

          if (!grouped[key]) {
            grouped[key] = { period: key, totalDistance: 0, totalDuration: 0, sessions: 0, paces: [] };
          }
          grouped[key].totalDistance += w.distance || 0;
          grouped[key].totalDuration += w.durationSeconds || 0;
          grouped[key].sessions += 1;
          if (w.pace > 0) grouped[key].paces.push(w.pace);
        });

        return Object.values(grouped)
          .map(g => ({
            ...g,
            avgPace: g.paces.length > 0 ? g.paces.reduce((a, b) => a + b, 0) / g.paces.length : 0,
          }))
          .sort((a, b) => a.period.localeCompare(b.period));
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
