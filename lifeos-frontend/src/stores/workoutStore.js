import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WORKOUT_TEMPLATES } from '../data/exerciseDatabase';
import { useAvatarStore } from './avatarStore';
import { supabase } from '../lib/supabase';
import { DEV_USER_ID } from '../lib/dev-auth';
import { triggerGamification } from '../hooks/useGamification';
import useAchievementsStore from './achievementsStore';

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

// MET (Metabolic Equivalent of Task) values for different activities
// MET represents the energy cost of physical activities
// 1 MET = 1 kcal/kg/hour at rest
const MET_VALUES = {
  // Cardio activities
  running: { low: 8.0, moderate: 10.0, high: 12.5, veryHigh: 16.0 }, // Based on pace
  cycling: { low: 4.0, moderate: 6.8, high: 10.0, veryHigh: 14.0 },
  swimming: { low: 5.8, moderate: 7.0, high: 9.8, veryHigh: 11.0 },
  rowing: { low: 4.8, moderate: 7.0, high: 8.5, veryHigh: 12.0 },
  walking: { low: 2.5, moderate: 3.5, high: 4.5, veryHigh: 5.0 },
  hiking: { low: 5.3, moderate: 6.0, high: 7.5, veryHigh: 9.0 },
  elliptical: { low: 4.6, moderate: 5.0, high: 6.0, veryHigh: 8.0 },
  stairmaster: { low: 6.0, moderate: 8.0, high: 9.0, veryHigh: 12.0 },
  jumpRope: { low: 8.8, moderate: 10.0, high: 12.0, veryHigh: 14.0 },
  // Weight training
  weightTraining: { low: 3.5, moderate: 5.0, high: 6.0, veryHigh: 8.0 },
  // Other workout types
  hiit: { low: 8.0, moderate: 10.0, high: 12.0, veryHigh: 15.0 },
  yoga: { low: 2.5, moderate: 3.0, high: 4.0, veryHigh: 5.0 },
  default: { low: 4.0, moderate: 5.5, high: 7.0, veryHigh: 9.0 },
};

// Get intensity level from RPE (1-10) or pace
const getIntensityLevel = (rpe = 5, pace = null, activityType = null) => {
  // If we have pace data for running, use that to determine intensity
  if (activityType === 'running' && pace) {
    if (pace > 12) return 'low';      // Slower than 12 min/mile
    if (pace > 9) return 'moderate';  // 9-12 min/mile
    if (pace > 7) return 'high';      // 7-9 min/mile
    return 'veryHigh';                // Faster than 7 min/mile
  }

  // Use RPE scale
  if (rpe <= 3) return 'low';
  if (rpe <= 5) return 'moderate';
  if (rpe <= 7) return 'high';
  return 'veryHigh';
};

/**
 * Calculate calories burned during exercise
 * Formula: Calories = MET × weight(kg) × time(hours)
 *
 * @param {string} activityType - Type of activity (running, cycling, weightTraining, etc.)
 * @param {number} durationMinutes - Duration in minutes
 * @param {number} weightKg - User's weight in kg (default 70kg / ~154lbs)
 * @param {number} intensity - RPE 1-10 scale (default 5)
 * @param {number} pace - Pace in min/mile for running (optional)
 * @returns {number} Estimated calories burned
 */
export const calculateCaloriesBurned = (
  activityType,
  durationMinutes,
  weightKg = 70,
  intensity = 5,
  pace = null
) => {
  if (!durationMinutes || durationMinutes <= 0) return 0;

  // Normalize activity type
  const normalizedType = activityType?.toLowerCase().replace(/[\s-_]/g, '') || 'default';

  // Map common workout types to MET categories
  const typeMapping = {
    'pushday': 'weightTraining',
    'pullday': 'weightTraining',
    'legs': 'weightTraining',
    'upperbody': 'weightTraining',
    'lowerbody': 'weightTraining',
    'fullbody': 'weightTraining',
    'cardio': 'running',
    'running': 'running',
    'cycling': 'cycling',
    'swimming': 'swimming',
    'rowing': 'rowing',
    'walking': 'walking',
    'hiking': 'hiking',
    'elliptical': 'elliptical',
    'stairmaster': 'stairmaster',
    'stairclimber': 'stairmaster',
    'jumprope': 'jumpRope',
    'hiit': 'hiit',
    'yoga': 'yoga',
  };

  const mappedType = typeMapping[normalizedType] || 'default';
  const metValues = MET_VALUES[mappedType] || MET_VALUES.default;

  // Get intensity level
  const intensityLevel = getIntensityLevel(intensity, pace, mappedType);
  const met = metValues[intensityLevel];

  // Calculate calories: MET × weight(kg) × time(hours)
  const durationHours = durationMinutes / 60;
  const caloriesBurned = met * weightKg * durationHours;

  return Math.round(caloriesBurned);
};

// Supabase sync helpers
const syncWorkoutToSupabase = async (workout, action = 'upsert') => {
  try {
    if (action === 'delete') {
      // Delete exercises first (foreign key constraint)
      await supabase.from('health_exercises').delete().eq('workout_id', workout.id);
      await supabase.from('health_workouts').delete().eq('id', workout.id);
      return;
    }

    const dbWorkout = {
      id: workout.id,
      user_id: DEV_USER_ID,
      workout_date: workout.date,
      workout_type: workout.templateId ? 'strength' : 'general',
      name: workout.name,
      duration_minutes: workout.duration || 0,
      calories_burned: workout.caloriesBurned || 0,
      notes: workout.notes || '',
      rating: workout.prsAchieved > 0 ? 5 : 4,
    };

    await supabase.from('health_workouts').upsert(dbWorkout, { onConflict: 'id' });

    // Sync exercises
    if (workout.exercises && workout.exercises.length > 0) {
      // Delete existing exercises for this workout
      await supabase.from('health_exercises').delete().eq('workout_id', workout.id);

      // Insert new exercises
      const exercises = workout.exercises.flatMap((exercise, exerciseIndex) =>
        exercise.sets
          .filter(set => set.completed)
          .map((set, setIndex) => ({
            id: crypto.randomUUID(),
            workout_id: workout.id,
            exercise_name: exercise.exerciseId,
            sets: 1,
            reps: set.reps || 0,
            weight_kg: set.weight || 0,
            notes: set.isPR ? 'PR' : '',
            position: exerciseIndex * 100 + setIndex,
          }))
      );

      if (exercises.length > 0) {
        await supabase.from('health_exercises').insert(exercises);
      }
    }
  } catch (error) {
    console.error('Error syncing workout to Supabase:', error);
  }
};

const syncCardioToSupabase = async (cardio, action = 'upsert') => {
  try {
    if (action === 'delete') {
      await supabase.from('health_workouts').delete().eq('id', cardio.id);
      return;
    }

    const dbCardio = {
      id: cardio.id,
      user_id: DEV_USER_ID,
      workout_date: cardio.date,
      workout_type: cardio.activityType || 'cardio',
      name: CARDIO_TYPES[cardio.activityType]?.name || 'Cardio',
      duration_minutes: Math.round((cardio.durationSeconds || 0) / 60),
      calories_burned: cardio.calories || 0,
      notes: cardio.notes || '',
      rating: cardio.prs && cardio.prs.length > 0 ? 5 : 4,
    };

    await supabase.from('health_workouts').upsert(dbCardio, { onConflict: 'id' });

    // Store cardio-specific data in health_exercises as a single entry
    await supabase.from('health_exercises').delete().eq('workout_id', cardio.id);
    await supabase.from('health_exercises').insert({
      id: crypto.randomUUID(),
      workout_id: cardio.id,
      exercise_name: cardio.activityType,
      distance_km: (cardio.distance || 0) * 1.60934, // Convert miles to km
      duration_seconds: cardio.durationSeconds || 0,
      notes: JSON.stringify({
        pace: cardio.pace,
        speed: cardio.speed,
        heartRateAvg: cardio.heartRateAvg,
        heartRateMax: cardio.heartRateMax,
        perceivedEffort: cardio.perceivedEffort,
        prs: cardio.prs || [],
      }),
      position: 0,
    });
  } catch (error) {
    console.error('Error syncing cardio to Supabase:', error);
  }
};

export const useWorkoutStore = create(
  persist(
    (set, get) => ({
      // Data
      workouts: [],
      templates: WORKOUT_TEMPLATES,
      customTemplates: [], // User-created workout templates
      customExercises: {}, // User-created custom exercises { id: exerciseData }
      cardioWorkouts: [], // Separate array for cardio sessions

      // Initialize from Supabase
      initializeFromSupabase: async () => {
        try {
          // Load workouts with exercises
          const { data: workoutsData, error: workoutsError } = await supabase
            .from('health_workouts')
            .select(`
              *,
              health_exercises (*)
            `)
            .eq('user_id', DEV_USER_ID)
            .order('workout_date', { ascending: false });

          if (workoutsError) throw workoutsError;

          // Separate strength workouts from cardio
          const strengthWorkouts = [];
          const cardioWorkouts = [];

          (workoutsData || []).forEach(w => {
            const exercises = w.health_exercises || [];
            const isCardio = Object.keys(CARDIO_TYPES).includes(w.workout_type) ||
                            (exercises.length === 1 && exercises[0].distance_km);

            if (isCardio && exercises.length > 0) {
              // Parse cardio workout
              const exercise = exercises[0];
              let extraData = {};
              try {
                extraData = exercise.notes ? JSON.parse(exercise.notes) : {};
              } catch (e) { /* ignore parse errors */ }

              cardioWorkouts.push({
                id: w.id,
                date: w.workout_date,
                activityType: exercise.exercise_name || w.workout_type,
                distance: (exercise.distance_km || 0) / 1.60934, // km to miles
                durationSeconds: exercise.duration_seconds || (w.duration_minutes * 60),
                pace: extraData.pace || 0,
                speed: extraData.speed || 0,
                notes: w.notes || '',
                perceivedEffort: extraData.perceivedEffort,
                heartRateAvg: extraData.heartRateAvg,
                heartRateMax: extraData.heartRateMax,
                calories: w.calories_burned || 0,
                prs: extraData.prs || [],
              });
            } else {
              // Parse strength workout - group exercises by exercise_name
              const exerciseGroups = {};
              exercises.forEach(e => {
                if (!exerciseGroups[e.exercise_name]) {
                  exerciseGroups[e.exercise_name] = {
                    exerciseId: e.exercise_name,
                    sets: [],
                    targetSets: 0,
                    targetReps: 10,
                  };
                }
                exerciseGroups[e.exercise_name].sets.push({
                  weight: e.weight_kg || 0,
                  reps: e.reps || 0,
                  completed: true,
                  isPR: e.notes === 'PR',
                });
                exerciseGroups[e.exercise_name].targetSets++;
              });

              strengthWorkouts.push({
                id: w.id,
                date: w.workout_date,
                startTime: w.workout_date,
                endTime: w.workout_date,
                name: w.name || 'Workout',
                templateId: null,
                exercises: Object.values(exerciseGroups),
                notes: w.notes || '',
                duration: w.duration_minutes || 0,
                totalVolume: exercises.reduce((sum, e) => sum + ((e.weight_kg || 0) * (e.reps || 0)), 0),
                prsAchieved: exercises.filter(e => e.notes === 'PR').length,
                caloriesBurned: w.calories_burned || 0,
              });
            }
          });

          set({
            workouts: strengthWorkouts,
            cardioWorkouts,
          });
        } catch (error) {
          console.error('Error initializing workouts from Supabase:', error);
        }
      },

      // Exercise weight history (auto-populate previous weights)
      exerciseHistory: {}, // { exerciseId: { lastWeight: X, lastReps: Y, bestWeight: Z, bestReps: W } }

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
        const state = get();
        // Check both built-in and custom templates
        const template = templateId
          ? state.templates.find(t => t.id === templateId) ||
            state.customTemplates.find(t => t.id === templateId)
          : null;

        const newWorkout = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
          name: template?.name || 'Quick Workout',
          templateId: template?.id || null,
          exercises: template?.exercises.map(e => {
            // Auto-populate with last used weights
            const history = state.exerciseHistory[e.exerciseId];
            const defaultWeight = history?.lastWeight || 0;
            const defaultReps = e.targetReps || history?.lastReps || 0;

            return {
              exerciseId: e.exerciseId,
              sets: Array(e.sets).fill(null).map(() => ({
                weight: defaultWeight,
                reps: defaultReps,
                completed: false,
              })),
              targetSets: e.sets,
              targetReps: e.targetReps,
              lastWeight: history?.lastWeight,
              bestWeight: history?.bestWeight,
            };
          }) || [],
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

        // Auto-calculate calories burned for weight training
        // Estimate intensity based on volume and PRs achieved
        const avgIntensity = prsAchieved > 0 ? 7 : (completedSets > 10 ? 6 : 5);
        const estimatedCalories = calculateCaloriesBurned(
          'weightTraining',
          duration,
          70, // Default weight in kg - could be pulled from user profile
          avgIntensity
        );

        const completedWorkout = {
          ...state.activeWorkout,
          endTime: new Date().toISOString(),
          duration,
          totalVolume: Math.round(totalVolume),
          prsAchieved,
          caloriesBurned: estimatedCalories,
        };

        // Award XP for completing workout
        // Base XP: 30 for completing a workout
        // Bonus: 2 XP per completed set
        // PR bonus: 15 XP per PR achieved
        // Duration bonus: 1 XP per 5 minutes (encourages longer workouts)
        let xpEarned = 30; // Base completion XP
        xpEarned += completedSets * 2; // Set completion bonus
        xpEarned += prsAchieved * 15; // PR bonus
        xpEarned += Math.floor(duration / 5); // Duration bonus

        // Trigger unified gamification (XP + achievement stats + pet/equipment unlocks)
        // Include duration and workout type for perk bonuses
        triggerGamification('workoutCompleted', {
          xpOverride: xpEarned,
          module: 'fitness',
          durationMinutes: duration,
          workoutType: 'strength', // Strength training for the completeWorkout function
        });

        // Track additional achievement stats
        const achievementsStore = useAchievementsStore.getState();

        // Track PRs achieved
        if (prsAchieved > 0) {
          achievementsStore.incrementStat('prsAchieved', prsAchieved);

          // Check if multiple PRs in single workout (hidden achievement)
          if (prsAchieved >= 3) {
            achievementsStore.incrementStat('prsSingleWorkout', 1);
          }
        }

        // Track total volume lifted (sum of weight * reps for all sets)
        if (totalVolume > 0) {
          achievementsStore.incrementStat('totalVolume', totalVolume);
        }

        // Track calories burned (using the already calculated estimatedCalories from above)
        if (estimatedCalories > 0) {
          achievementsStore.incrementStat('caloriesBurned', estimatedCalories);
        }

        // Check achievements after updating stats
        achievementsStore.checkAchievements();

        // Update exercise history for weight pre-population
        const updatedHistory = { ...state.exerciseHistory };
        state.activeWorkout.exercises.forEach(exercise => {
          const completedSetsForExercise = exercise.sets.filter(s => s.completed && s.setType !== 'warmup');
          if (completedSetsForExercise.length > 0) {
            // Get the best set (highest weight or highest reps at same weight)
            const bestSet = completedSetsForExercise.reduce((best, current) => {
              if (!best) return current;
              if (current.weight > best.weight) return current;
              if (current.weight === best.weight && current.reps > best.reps) return current;
              return best;
            }, null);

            // Get the last set for default weights
            const lastSet = completedSetsForExercise[completedSetsForExercise.length - 1];

            const existingHistory = updatedHistory[exercise.exerciseId] || {};
            updatedHistory[exercise.exerciseId] = {
              lastWeight: lastSet?.weight || existingHistory.lastWeight || 0,
              lastReps: lastSet?.reps || existingHistory.lastReps || 0,
              bestWeight: Math.max(bestSet?.weight || 0, existingHistory.bestWeight || 0),
              bestReps: bestSet?.weight >= (existingHistory.bestWeight || 0)
                ? bestSet?.reps || existingHistory.bestReps || 0
                : existingHistory.bestReps || 0,
              lastUsed: new Date().toISOString(),
            };
          }
        });

        set({
          workouts: [completedWorkout, ...state.workouts],
          exerciseHistory: updatedHistory,
          activeWorkout: null,
          isWorkoutActive: false,
          workoutStartTime: null,
          currentExerciseIndex: 0,
        });

        // Sync to Supabase
        syncWorkoutToSupabase(completedWorkout);

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
        const workoutToDelete = get().workouts.find(w => w.id === id);
        set((state) => ({
          workouts: state.workouts.filter(w => w.id !== id),
        }));
        if (workoutToDelete) {
          syncWorkoutToSupabase(workoutToDelete, 'delete');
        }
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
      // CUSTOM TEMPLATE ACTIONS
      // ==================

      // Create a custom workout template
      createTemplate: (templateData) => {
        const state = get();
        const newTemplate = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timesUsed: 0,
          lastUsed: null,
          isCustom: true,
          ...templateData,
        };

        set({
          customTemplates: [...state.customTemplates, newTemplate],
        });

        // Award XP for creating a workout template
        triggerGamification('workoutTemplateCreated', { xpOverride: 15, module: 'health' });

        return newTemplate;
      },

      // Update a custom template
      updateTemplate: (templateId, updates) => {
        set((state) => ({
          customTemplates: state.customTemplates.map(t =>
            t.id === templateId
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      // Delete a custom template
      deleteTemplate: (templateId) => {
        set((state) => ({
          customTemplates: state.customTemplates.filter(t => t.id !== templateId),
        }));
      },

      // Duplicate a template (built-in or custom) as a new custom template
      duplicateTemplate: (templateId, newName = null) => {
        const state = get();
        const sourceTemplate =
          state.templates.find(t => t.id === templateId) ||
          state.customTemplates.find(t => t.id === templateId);

        if (!sourceTemplate) return null;

        const newTemplate = {
          id: crypto.randomUUID(),
          name: newName || `${sourceTemplate.name} (Copy)`,
          description: sourceTemplate.description,
          exercises: [...sourceTemplate.exercises],
          icon: sourceTemplate.icon,
          color: sourceTemplate.color,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timesUsed: 0,
          lastUsed: null,
          isCustom: true,
        };

        set({
          customTemplates: [...state.customTemplates, newTemplate],
        });

        return newTemplate;
      },

      // Save current workout as a template
      saveWorkoutAsTemplate: (name, description = '') => {
        const state = get();
        if (!state.activeWorkout || state.activeWorkout.exercises.length === 0) return null;

        const exercises = state.activeWorkout.exercises.map(e => ({
          exerciseId: e.exerciseId,
          sets: e.sets.length,
          targetReps: e.targetReps || 10,
        }));

        const newTemplate = {
          id: crypto.randomUUID(),
          name: name || state.activeWorkout.name || 'Custom Workout',
          description,
          exercises,
          icon: '🏋️',
          color: '#a855f7',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timesUsed: 0,
          lastUsed: null,
          isCustom: true,
        };

        set({
          customTemplates: [...state.customTemplates, newTemplate],
        });

        return newTemplate;
      },

      // Track template usage
      incrementTemplateUsage: (templateId) => {
        set((state) => ({
          customTemplates: state.customTemplates.map(t =>
            t.id === templateId
              ? { ...t, timesUsed: (t.timesUsed || 0) + 1, lastUsed: new Date().toISOString() }
              : t
          ),
        }));
      },

      // Get all templates (built-in + custom), sorted by usage
      getAllTemplates: () => {
        const state = get();
        const all = [
          ...state.templates.map(t => ({ ...t, isCustom: false })),
          ...state.customTemplates,
        ];
        return all.sort((a, b) => (b.timesUsed || 0) - (a.timesUsed || 0));
      },

      // Get exercise weight suggestion based on history
      getWeightSuggestion: (exerciseId) => {
        const state = get();
        const history = state.exerciseHistory[exerciseId];
        if (!history) return null;

        return {
          suggested: history.lastWeight,
          lastUsed: history.lastWeight,
          personal_best: history.bestWeight,
          lastReps: history.lastReps,
        };
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

        // Auto-calculate calories if not provided
        const durationMinutes = Math.round(durationSeconds / 60);
        const estimatedCalories = calories || calculateCaloriesBurned(
          activityType,
          durationMinutes,
          70, // Default weight in kg - could be pulled from user profile
          perceivedEffort || 5,
          pace
        );

        const newCardioWorkout = {
          id: crypto.randomUUID(),
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
          calories: estimatedCalories,
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
        let xpEarned = 25; // Base cardio XP
        xpEarned += Math.floor(durationSeconds / 300); // 1 XP per 5 minutes
        xpEarned += Math.floor(distance * 5); // 5 XP per mile/unit
        xpEarned += prs.length * 15; // 15 XP per PR

        // Trigger unified gamification
        // Include duration and workout type for perk bonuses
        triggerGamification('workoutCompleted', {
          xpOverride: xpEarned,
          module: 'fitness',
          durationMinutes: Math.floor(durationSeconds / 60),
          workoutType: 'cardio', // Cardio workout
        });

        // Track cardio-specific achievement stats
        const achievementsStore = useAchievementsStore.getState();

        // Track cardio sessions
        achievementsStore.incrementStat('cardioSessions', 1);

        // Track cardio distance (only for distance-based activities)
        const distanceUnits = ['miles', 'km'];
        const activityConfig = CARDIO_TYPES[activityType];
        if (activityConfig && distanceUnits.includes(activityConfig.unit) && distance > 0) {
          // Convert to miles if needed (assuming input is already in the correct unit)
          achievementsStore.incrementStat('cardioMiles', Math.round(distance * 100) / 100);
        }

        // Track calories burned from cardio (rough: ~8 cal per minute for cardio)
        const cardioCalories = Math.round((durationSeconds / 60) * 8);
        if (cardioCalories > 0) {
          achievementsStore.incrementStat('caloriesBurned', cardioCalories);
        }

        // Track cardio PRs
        if (prs.length > 0) {
          achievementsStore.incrementStat('prsAchieved', prs.length);
        }

        // Check achievements after updating stats
        achievementsStore.checkAchievements();

        set({
          cardioWorkouts: [newCardioWorkout, ...state.cardioWorkouts],
          cardioRecords: updatedRecords,
        });

        // Sync to Supabase
        syncCardioToSupabase(newCardioWorkout);

        return { workout: newCardioWorkout, xpEarned, prs };
      },

      // Delete cardio workout
      deleteCardioWorkout: (id) => {
        const cardioToDelete = get().cardioWorkouts.find(w => w.id === id);
        set((state) => ({
          cardioWorkouts: state.cardioWorkouts.filter(w => w.id !== id),
        }));
        if (cardioToDelete) {
          syncCardioToSupabase(cardioToDelete, 'delete');
        }
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

      // ==================
      // CUSTOM EXERCISE ACTIONS
      // ==================

      // Create a custom exercise
      createCustomExercise: (exerciseData) => {
        const state = get();
        const id = exerciseData.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const newExercise = {
          id,
          name: exerciseData.name,
          category: exerciseData.category || 'other',
          subcategory: exerciseData.subcategory || 'custom',
          muscleGroups: exerciseData.muscleGroups || [],
          equipment: exerciseData.equipment || 'other',
          type: exerciseData.type || 'compound',
          icon: exerciseData.icon || '🏋️',
          isCustom: true,
          createdAt: new Date().toISOString(),
          trackingType: exerciseData.trackingType || null,
        };

        set({
          customExercises: {
            ...state.customExercises,
            [id]: newExercise,
          },
        });

        return newExercise;
      },

      // Update a custom exercise
      updateCustomExercise: (exerciseId, updates) => {
        const state = get();
        if (!state.customExercises[exerciseId]) return null;

        const updatedExercise = {
          ...state.customExercises[exerciseId],
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        set({
          customExercises: {
            ...state.customExercises,
            [exerciseId]: updatedExercise,
          },
        });

        return updatedExercise;
      },

      // Delete a custom exercise
      deleteCustomExercise: (exerciseId) => {
        const state = get();
        const { [exerciseId]: deleted, ...remaining } = state.customExercises;
        set({ customExercises: remaining });
      },

      // Get all exercises (built-in + custom)
      getAllExercises: () => {
        const state = get();
        // Import the EXERCISE_DATABASE dynamically would cause circular dependency
        // So we access it through the component that calls this function
        return state.customExercises;
      },

      // Check if an exercise exists (built-in or custom)
      getCustomExercise: (exerciseId) => {
        return get().customExercises[exerciseId] || null;
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

// Initialize function for App.jsx
export const initializeWorkoutStore = async () => {
  return useWorkoutStore.getState().initializeFromSupabase();
};
