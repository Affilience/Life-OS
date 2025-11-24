import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// GET all active missions
export function useMissions() {
  return useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('active', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// GET user's active missions
export function useUserMissions() {
  return useQuery({
    queryKey: ['user-missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_missions')
        .select(`
          *,
          mission:missions(*)
        `)
        .in('status', ['active', 'in_progress'])
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// UPDATE mission progress
export function useUpdateMissionProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, progress, completionPercentage }) => {
      const { data, error } = await supabase
        .from('user_missions')
        .update({
          progress,
          completion_percentage: completionPercentage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', missionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['user-missions'] });
      const previousMissions = queryClient.getQueryData(['user-missions']);

      queryClient.setQueryData(['user-missions'], (old) => {
        return old?.map((mission) =>
          mission.id === variables.missionId
            ? { ...mission, completion_percentage: variables.completionPercentage }
            : mission
        );
      });

      return { previousMissions };
    },
    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['user-missions'], context?.previousMissions);
    },
    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-missions'] });
    },
  });
}

// COMPLETE mission (calls database function)
export function useCompleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId) => {
      const { data, error } = await supabase.rpc('complete_mission', {
        p_mission_id: missionId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['user-missions'] });
      queryClient.invalidateQueries({ queryKey: ['cosmic-currency'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

// START mission (assign to user)
export function useStartMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('user_missions')
        .insert({
          user_id: user.id,
          mission_id: missionId,
          status: 'active',
          assigned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-missions'] });
    },
  });
}
