import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { SKILL_POINTS_PER_LEVEL } from '../utils/statsSystem';

const DEFAULT_STATE = {
  unallocatedPoints: 0,
  allocatedPoints: {
    strength: 0,
    vitality: 0,
    intelligence: 0,
    wisdom: 0,
    defense: 0,
  },
  totalPointsEarned: 0,
  pointsResetCount: 0,
  lastAllocationAt: null,
  _isLoading: false,
  _error: null,
};

export const useSkillPointsStore = create(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      // Initialize from Supabase
      initializeFromSupabase: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        set({ _isLoading: true, _error: null });

        try {
          const { data, error } = await supabase
            .from('user_skill_points')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            set({
              unallocatedPoints: data.unallocated_points || 0,
              allocatedPoints: {
                strength: data.strength_points || 0,
                vitality: data.vitality_points || 0,
                intelligence: data.intelligence_points || 0,
                wisdom: data.wisdom_points || 0,
                defense: data.defense_points || 0,
              },
              totalPointsEarned: data.total_points_earned || 0,
              pointsResetCount: data.points_reset_count || 0,
              lastAllocationAt: data.last_allocation_at,
              _isLoading: false,
            });
          } else {
            // No record exists - will be created on first allocation
            set({ _isLoading: false });
          }
        } catch (error) {
          console.error('Failed to load skill points:', error);
          set({ _error: error.message, _isLoading: false });
        }
      },

      // Initialize skill points based on current level
      initializeForLevel: async (currentLevel) => {
        const totalPoints = currentLevel * SKILL_POINTS_PER_LEVEL;
        const { totalPointsEarned } = get();

        // Only add new points if level has increased
        if (totalPoints > totalPointsEarned) {
          const newPoints = totalPoints - totalPointsEarned;

          // Update local state first (always works)
          set(state => ({
            unallocatedPoints: state.unallocatedPoints + newPoints,
            totalPointsEarned: totalPoints,
          }));

          // Try to sync to Supabase (may fail if user doesn't exist in users table)
          const userId = await getCurrentUserId();
          if (userId) {
            try {
              await supabase
                .from('user_skill_points')
                .upsert({
                  user_id: userId,
                  unallocated_points: get().unallocatedPoints,
                  total_points_earned: totalPoints,
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });
            } catch (error) {
              // Silently fail - local state is already updated
              // This handles cases where user_skill_points table has FK constraint
            }
          }

          return { pointsAwarded: newPoints };
        }

        return { pointsAwarded: 0 };
      },

      // Award points on level up
      awardLevelUpPoints: async () => {
        const pointsToAdd = SKILL_POINTS_PER_LEVEL;

        // Update local state first
        set(state => ({
          unallocatedPoints: state.unallocatedPoints + pointsToAdd,
          totalPointsEarned: state.totalPointsEarned + pointsToAdd,
        }));

        // Try to sync to Supabase
        const userId = await getCurrentUserId();
        if (userId) {
          try {
            await supabase
              .from('user_skill_points')
              .upsert({
                user_id: userId,
                unallocated_points: get().unallocatedPoints,
                total_points_earned: get().totalPointsEarned,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' });
          } catch (error) {
            // Silently fail - local state is already updated
          }
        }

        return { success: true, pointsAwarded: pointsToAdd };
      },

      // Allocate a point to a stat
      allocatePoint: async (stat, amount = 1) => {
        const { unallocatedPoints, allocatedPoints } = get();

        if (!['strength', 'vitality', 'intelligence', 'wisdom', 'defense'].includes(stat)) {
          return { error: 'Invalid stat' };
        }

        if (unallocatedPoints < amount) {
          return { error: 'Not enough unallocated points' };
        }

        const newAllocated = {
          ...allocatedPoints,
          [stat]: allocatedPoints[stat] + amount,
        };

        // Update local state first
        set({
          unallocatedPoints: unallocatedPoints - amount,
          allocatedPoints: newAllocated,
          lastAllocationAt: new Date().toISOString(),
        });

        // Try to sync to Supabase
        const userId = await getCurrentUserId();
        if (userId) {
          try {
            await supabase
              .from('user_skill_points')
              .upsert({
                user_id: userId,
                unallocated_points: unallocatedPoints - amount,
                strength_points: newAllocated.strength,
                vitality_points: newAllocated.vitality,
                intelligence_points: newAllocated.intelligence,
                wisdom_points: newAllocated.wisdom,
                defense_points: newAllocated.defense,
                last_allocation_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' });
          } catch (error) {
            // Silently fail - local state is already updated
          }
        }

        return { success: true, stat, amount };
      },

      // Allocate multiple points at once
      allocatePoints: async (allocations) => {
        const { unallocatedPoints, allocatedPoints } = get();

        const totalToAllocate = Object.values(allocations).reduce((sum, val) => sum + val, 0);

        if (totalToAllocate > unallocatedPoints) {
          return { error: 'Not enough unallocated points' };
        }

        const newAllocated = {
          strength: allocatedPoints.strength + (allocations.strength || 0),
          vitality: allocatedPoints.vitality + (allocations.vitality || 0),
          intelligence: allocatedPoints.intelligence + (allocations.intelligence || 0),
          wisdom: allocatedPoints.wisdom + (allocations.wisdom || 0),
          defense: allocatedPoints.defense + (allocations.defense || 0),
        };

        // Update local state first
        set({
          unallocatedPoints: unallocatedPoints - totalToAllocate,
          allocatedPoints: newAllocated,
          lastAllocationAt: new Date().toISOString(),
        });

        // Try to sync to Supabase
        const userId = await getCurrentUserId();
        if (userId) {
          try {
            await supabase
              .from('user_skill_points')
              .upsert({
                user_id: userId,
                unallocated_points: unallocatedPoints - totalToAllocate,
                strength_points: newAllocated.strength,
                vitality_points: newAllocated.vitality,
                intelligence_points: newAllocated.intelligence,
                wisdom_points: newAllocated.wisdom,
                defense_points: newAllocated.defense,
                last_allocation_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' });
          } catch (error) {
            // Silently fail - local state is already updated
          }
        }

        return { success: true, allocated: allocations };
      },

      // Reset all allocated points (costs credits)
      resetPoints: async (creditCost = 500) => {
        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not logged in' };

        const { allocatedPoints, unallocatedPoints, pointsResetCount } = get();

        const totalAllocated = Object.values(allocatedPoints).reduce((sum, val) => sum + val, 0);

        if (totalAllocated === 0) {
          return { error: 'No points to reset' };
        }

        // Check credits via gamification store
        const { default: gamificationStore } = await import('./gamificationStore');
        const currentCredits = gamificationStore.getState().cosmicCredits || 0;

        if (currentCredits < creditCost) {
          return { error: 'Not enough credits', required: creditCost, current: currentCredits };
        }

        try {
          // Deduct credits
          gamificationStore.getState().spendCredits(creditCost, 'Skill points reset');

          // Reset points
          const { error } = await supabase
            .from('user_skill_points')
            .update({
              unallocated_points: unallocatedPoints + totalAllocated,
              strength_points: 0,
              vitality_points: 0,
              intelligence_points: 0,
              wisdom_points: 0,
              defense_points: 0,
              points_reset_count: pointsResetCount + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          if (error) throw error;

          set({
            unallocatedPoints: unallocatedPoints + totalAllocated,
            allocatedPoints: {
              strength: 0,
              vitality: 0,
              intelligence: 0,
              wisdom: 0,
              defense: 0,
            },
            pointsResetCount: pointsResetCount + 1,
          });

          return {
            success: true,
            pointsRefunded: totalAllocated,
            creditsSpent: creditCost,
          };
        } catch (error) {
          console.error('Failed to reset points:', error);
          return { error: error.message };
        }
      },

      // Get total allocated points
      getTotalAllocated: () => {
        const { allocatedPoints } = get();
        return Object.values(allocatedPoints).reduce((sum, val) => sum + val, 0);
      },

      // Get available points for a stat (considering any limits)
      getAvailableForStat: (stat) => {
        return get().unallocatedPoints;
      },
    }),
    {
      name: 'skill-points-storage',
      partialize: (state) => ({
        unallocatedPoints: state.unallocatedPoints,
        allocatedPoints: state.allocatedPoints,
        totalPointsEarned: state.totalPointsEarned,
        pointsResetCount: state.pointsResetCount,
      }),
    }
  )
);

// Export initialization function
export const initializeSkillPointsStore = async () => {
  await useSkillPointsStore.getState().initializeFromSupabase();
};

export default useSkillPointsStore;
