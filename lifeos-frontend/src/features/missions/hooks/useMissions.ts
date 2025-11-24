/**
 * React hook for fetching and managing missions
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Mission, UserMission, MissionFilters, MissionStatus } from '../types';

export function useMissions(filters?: MissionFilters) {
  const [missions, setMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();

      // Use dev user if no auth user (for development)
      const user = authUser || {
        id: '00000000-0000-0000-0000-000000000001'
      };

      if (!user) {
        setError('No user logged in');
        setLoading(false);
        return;
      }

      // Build query
      let query = supabase
        .from('user_missions')
        .select(`
          *,
          mission:missions (*)
        `)
        .eq('user_id', user.id)
        .order('assigned_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setMissions(data as UserMission[]);
    } catch (err) {
      console.error('Error fetching missions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch missions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const updateMissionProgress = useCallback(async (
    missionId: string,
    objectiveId: string,
    newValue: number
  ) => {
    try {
      const mission = missions.find(m => m.id === missionId);
      if (!mission) return;

      const updatedProgress = {
        ...mission.progress,
        [objectiveId]: newValue
      };

      // Calculate completion percentage
      const missionData = mission.mission;
      if (!missionData) return;

      const totalObjectives = missionData.objectives.length;
      const completedObjectives = missionData.objectives.filter(
        obj => updatedProgress[obj.id] >= obj.target
      ).length;
      const completionPercentage = Math.round((completedObjectives / totalObjectives) * 100);

      const { error: updateError } = await supabase
        .from('user_missions')
        .update({
          progress: updatedProgress,
          completion_percentage: completionPercentage,
          status: completionPercentage === 100 ? 'completed' : 'active'
        })
        .eq('id', missionId);

      if (updateError) throw updateError;

      // Refresh missions
      await fetchMissions();
    } catch (err) {
      console.error('Error updating mission progress:', err);
    }
  }, [missions, fetchMissions]);

  const completeMission = useCallback(async (missionId: string) => {
    try {
      const mission = missions.find(m => m.id === missionId);
      if (!mission || !mission.mission) return;

      const { data: { user: authUser } } = await supabase.auth.getUser();
      const user = authUser || { id: '00000000-0000-0000-0000-000000000001' };
      if (!user) return;

      // Award XP to the mission's module
      if (mission.mission.xpReward > 0) {
        await supabase.rpc('award_module_xp', {
          p_user_id: user.id,
          p_module_id: mission.mission.moduleId,
          p_xp_amount: mission.mission.xpReward,
          p_source: 'mission_completion'
        });
      }

      // Award cosmic credits
      if (mission.mission.creditsReward > 0) {
        await supabase.rpc('award_cosmic_credits', {
          p_user_id: user.id,
          p_amount: mission.mission.creditsReward,
          p_transaction_type: 'mission_reward',
          p_description: `Completed mission: ${mission.mission.title}`,
          p_related_entity_id: missionId,
          p_related_entity_type: 'mission'
        });
      }

      // Mark mission as completed
      const { error: updateError } = await supabase
        .from('user_missions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          rewards_claimed: true
        })
        .eq('id', missionId);

      if (updateError) throw updateError;

      // Refresh missions
      await fetchMissions();
    } catch (err) {
      console.error('Error completing mission:', err);
    }
  }, [missions, fetchMissions]);

  const assignDailyMissions = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const user = authUser || { id: '00000000-0000-0000-0000-000000000001' };
      if (!user) return;

      // Fetch available daily missions
      const { data: availableMissions, error: fetchError } = await supabase
        .from('missions')
        .select('*')
        .eq('frequency', 'daily')
        .eq('active', true)
        .limit(3);

      if (fetchError) throw fetchError;

      // Check if missions already assigned today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingMissions } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', user.id)
        .gte('assigned_at', today);

      if (existingMissions && existingMissions.length > 0) {
        console.log('Daily missions already assigned');
        return;
      }

      // Assign new missions
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const newAssignments = availableMissions?.map(mission => ({
        user_id: user.id,
        mission_id: mission.id,
        status: 'active' as MissionStatus,
        progress: {},
        completion_percentage: 0,
        expires_at: tomorrow.toISOString()
      }));

      if (newAssignments && newAssignments.length > 0) {
        const { error: insertError } = await supabase
          .from('user_missions')
          .insert(newAssignments);

        if (insertError) throw insertError;
      }

      // Refresh missions
      await fetchMissions();
    } catch (err) {
      console.error('Error assigning daily missions:', err);
    }
  }, [fetchMissions]);

  return {
    missions,
    loading,
    error,
    refetch: fetchMissions,
    updateMissionProgress,
    completeMission,
    assignDailyMissions
  };
}
