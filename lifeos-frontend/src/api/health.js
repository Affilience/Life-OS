import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ==================== WORKOUTS ====================

export function useWorkouts(filters = {}) {
  return useQuery({
    queryKey: ['workouts', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('health_workouts')
        .select('*')
        .eq('user_id', user.id);

      if (filters.startDate) {
        query = query.gte('workout_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('workout_date', filters.endDate);
      }

      query = query.order('workout_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workout, exercises }) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Create workout using the database function
      const { data, error } = await supabase.rpc('log_workout_with_timeline', {
        p_workout_type: workout.workout_type,
        p_title: workout.title,
        p_duration_minutes: workout.duration_minutes,
        p_calories_burned: workout.calories_burned,
        p_intensity: workout.intensity,
        p_workout_date: workout.workout_date,
      });

      if (error) throw error;

      const workoutId = data;

      // Add exercises if provided
      if (exercises && exercises.length > 0) {
        const exercisesWithWorkoutId = exercises.map((ex, index) => ({
          ...ex,
          workout_id: workoutId,
          position: index,
        }));

        const { error: exercisesError } = await supabase
          .from('health_exercises')
          .insert(exercisesWithWorkoutId);

        if (exercisesError) throw exercisesError;
      }

      return workoutId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

// ==================== NUTRITION ====================

export function useNutritionLogs(date) {
  return useQuery({
    queryKey: ['nutrition-logs', date],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('health_nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('meal_timestamp', startOfDay.toISOString())
        .lte('meal_timestamp', endOfDay.toISOString())
        .order('meal_timestamp', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateNutritionLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nutritionLog) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('health_nutrition_logs')
        .insert({ ...nutritionLog, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Add to timeline
      await supabase.from('timeline_events').insert({
        user_id: user.id,
        module_id: 'health',
        event_type: 'meal_logged',
        title: `${nutritionLog.meal_type} logged`,
        metadata: { nutrition_log_id: data.id },
        xp_earned: 5,
      });

      return data;
    },
    onSuccess: (data) => {
      const date = new Date(data.meal_timestamp).toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['nutrition-logs', date] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

// ==================== SLEEP ====================

export function useSleepLogs(filters = {}) {
  return useQuery({
    queryKey: ['sleep-logs', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('health_sleep_logs')
        .select('*')
        .eq('user_id', user.id);

      if (filters.startDate) {
        query = query.gte('sleep_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('sleep_date', filters.endDate);
      }

      query = query.order('sleep_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSleepLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sleepLog) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('health_sleep_logs')
        .upsert(
          { ...sleepLog, user_id: user.id },
          { onConflict: 'user_id,sleep_date' }
        )
        .select()
        .single();

      if (error) throw error;

      // Add to timeline
      await supabase.from('timeline_events').insert({
        user_id: user.id,
        module_id: 'health',
        event_type: 'sleep_logged',
        title: 'Sleep logged',
        metadata: {
          sleep_date: sleepLog.sleep_date,
          duration_hours: sleepLog.duration_hours,
        },
        xp_earned: 10,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleep-logs'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

// ==================== RECOVERY ====================

export function useRecoveryLogs(filters = {}) {
  return useQuery({
    queryKey: ['recovery-logs', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('health_recovery_logs')
        .select('*')
        .eq('user_id', user.id);

      if (filters.startDate) {
        query = query.gte('log_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('log_date', filters.endDate);
      }

      query = query.order('log_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateRecoveryLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recoveryLog) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('health_recovery_logs')
        .upsert(
          { ...recoveryLog, user_id: user.id },
          { onConflict: 'user_id,log_date' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recovery-logs'] });
    },
  });
}
