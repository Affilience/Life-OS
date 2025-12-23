/**
 * Level Progression Store
 * Manages level-based progression: titles, milestones, frames, bonuses, slots
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';
import {
  getLevelTitle,
  getTitleProgress,
  getLevelXPBonus,
  getHighestFrame,
  getUnlockedFrames,
  getPetSlots,
  getEquipmentSetSlots,
  getInventorySlots,
  getMilestoneForLevel,
  getUnclaimedMilestones,
  getNextMilestone,
  getLevelProgressionStats,
  PROFILE_FRAMES,
} from '../data/levelProgression';

const useLevelProgressionStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // STATE
      // ============================================

      // User preferences
      selectedFrame: 'none',
      customTitle: null,
      showLevelBadge: true,

      // Cached calculations
      currentTitle: null,
      currentFrame: null,
      petSlots: 1,
      equipmentSetSlots: 1,
      inventorySlots: 10,
      levelXPBonus: 0,

      // Milestones
      claimedMilestones: [],
      pendingMilestones: [], // Milestones that can be claimed

      // Loading state
      isInitialized: false,
      isLoading: false,

      // ============================================
      // ACTIONS
      // ============================================

      /**
       * Initialize store with user's level
       */
      initialize: async (level = 1, passedUserId = null) => {
        set({ isLoading: true });

        // Master timeout - guarantee function returns
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
          console.warn('[LevelProgressionStore] ⏱️ Master timeout reached - using defaults');
          const title = getLevelTitle(level);
          const frame = getHighestFrame(level);
          set({
            currentTitle: title,
            currentFrame: frame,
            petSlots: getPetSlots(level),
            equipmentSetSlots: getEquipmentSetSlots(level),
            inventorySlots: getInventorySlots(level),
            levelXPBonus: getLevelXPBonus(level),
            isInitialized: true,
            isLoading: false,
          });
        }, INIT_TIMEOUT_MS);

        // Helper to wrap queries with timeout
        const withTimeout = (promise, timeoutMs = 10000) => {
          return Promise.race([
            promise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
            )
          ]).catch(() => ({ data: null, error: 'timeout' }));
        };

        try {
          const userId = passedUserId || await getCurrentUserId();
          if (!userId) {
            clearTimeout(timeoutId);
            set({ isLoading: false, isInitialized: true });
            console.log('[LevelProgressionStore] ✅ Initialized (no user)');
            return;
          }

          // Fetch user's level progression data from Supabase
          const { data: progressionData } = await withTimeout(
            supabase
              .from('user_level_progression')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle()
          );

          // Fetch claimed milestones
          const { data: claimedData } = await withTimeout(
            supabase
              .from('user_claimed_milestones')
              .select('*')
              .eq('user_id', userId)
          );

          clearTimeout(timeoutId);
          if (timedOut) return;

          // Calculate current values based on level
          const title = getLevelTitle(level);
          const frame = getHighestFrame(level);
          const xpBonus = getLevelXPBonus(level);

          set({
            selectedFrame: progressionData?.selected_frame || frame.id,
            customTitle: progressionData?.custom_title || null,
            showLevelBadge: progressionData?.show_level_badge ?? true,
            currentTitle: title,
            currentFrame: frame,
            petSlots: getPetSlots(level),
            equipmentSetSlots: getEquipmentSetSlots(level),
            inventorySlots: getInventorySlots(level),
            levelXPBonus: xpBonus,
            claimedMilestones: claimedData || [],
            isInitialized: true,
            isLoading: false,
          });

          // Ensure user has a progression record (use upsert to avoid conflicts)
          if (!progressionData && userId) {
            // Fire and forget - don't block on this
            supabase.from('user_level_progression').upsert({
              user_id: userId,
              selected_frame: frame.id,
              pet_slots: getPetSlots(level),
              equipment_set_slots: getEquipmentSetSlots(level),
              inventory_slots: getInventorySlots(level),
              level_xp_bonus: xpBonus,
            }, { onConflict: 'user_id' }).then(() => {}).catch(() => {});
          }

          console.log('[LevelProgressionStore] ✅ Initialized');
        } catch (error) {
          console.error('[LevelProgressionStore] Error initializing:', error);
          clearTimeout(timeoutId);
          if (!timedOut) {
            set({ isLoading: false, isInitialized: true });
          }
        }
      },

      /**
       * Update progression when level changes
       */
      onLevelChange: async (oldLevel, newLevel) => {
        const title = getLevelTitle(newLevel);
        const frame = getHighestFrame(newLevel);
        const xpBonus = getLevelXPBonus(newLevel);

        // Check for unclaimed milestones
        const unclaimed = getUnclaimedMilestones(oldLevel, newLevel);
        const { claimedMilestones } = get();
        const claimedLevels = new Set(claimedMilestones.map(m => m.milestone_level));
        const pendingMilestones = unclaimed.filter(m => !claimedLevels.has(m.level));

        set({
          currentTitle: title,
          currentFrame: frame,
          petSlots: getPetSlots(newLevel),
          equipmentSetSlots: getEquipmentSetSlots(newLevel),
          inventorySlots: getInventorySlots(newLevel),
          levelXPBonus: xpBonus,
          pendingMilestones,
        });

        // Update in database
        const userId = await getCurrentUserId();
        if (userId) {
          await supabase
            .from('user_level_progression')
            .update({
              pet_slots: getPetSlots(newLevel),
              equipment_set_slots: getEquipmentSetSlots(newLevel),
              inventory_slots: getInventorySlots(newLevel),
              level_xp_bonus: xpBonus,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }

        return { pendingMilestones, titleChanged: title.title !== getLevelTitle(oldLevel).title };
      },

      /**
       * Claim a milestone reward
       */
      claimMilestone: async (milestone, onRewardsClaimed) => {
        const { claimedMilestones } = get();

        // Check if already claimed
        if (claimedMilestones.some(m => m.milestone_level === milestone.level)) {
          return { success: false, error: 'Already claimed' };
        }

        // Insert claim record
        const userId = await getCurrentUserId();
        if (!userId) {
          return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase.from('user_claimed_milestones').insert({
          user_id: userId,
          milestone_level: milestone.level,
          milestone_type: milestone.type,
          credits_claimed: milestone.credits || 0,
          xp_bonus_claimed: milestone.xpBonus || 0,
          equipment_unlocked: milestone.equipment || null,
          frame_unlocked: milestone.frame || null,
          pet_slot_unlocked: milestone.petSlot || false,
        });

        if (error) {
          console.error('Error claiming milestone:', error);
          return { success: false, error: error.message };
        }

        // Update local state
        set({
          claimedMilestones: [
            ...claimedMilestones,
            {
              milestone_level: milestone.level,
              milestone_type: milestone.type,
              credits_claimed: milestone.credits || 0,
              xp_bonus_claimed: milestone.xpBonus || 0,
              equipment_unlocked: milestone.equipment || null,
              frame_unlocked: milestone.frame || null,
              pet_slot_unlocked: milestone.petSlot || false,
              claimed_at: new Date().toISOString(),
            },
          ],
          pendingMilestones: get().pendingMilestones.filter(m => m.level !== milestone.level),
        });

        // Callback to award rewards (credits, XP, etc.)
        if (onRewardsClaimed) {
          onRewardsClaimed({
            credits: milestone.credits || 0,
            xpBonus: milestone.xpBonus || 0,
            equipment: milestone.equipment,
            frame: milestone.frame,
            petSlot: milestone.petSlot,
          });
        }

        return { success: true };
      },

      /**
       * Select a profile frame
       */
      selectFrame: async (frameId) => {
        const frame = PROFILE_FRAMES[frameId];
        if (!frame) return { success: false, error: 'Invalid frame' };

        set({ selectedFrame: frameId });

        const userId = await getCurrentUserId();
        if (userId) {
          await supabase
            .from('user_level_progression')
            .update({ selected_frame: frameId, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        }

        return { success: true };
      },

      /**
       * Set custom title
       */
      setCustomTitle: async (title) => {
        set({ customTitle: title });

        const userId = await getCurrentUserId();
        if (userId) {
          await supabase
            .from('user_level_progression')
            .update({ custom_title: title, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        }

        return { success: true };
      },

      /**
       * Toggle level badge visibility
       */
      toggleLevelBadge: async () => {
        const newValue = !get().showLevelBadge;
        set({ showLevelBadge: newValue });

        const userId = await getCurrentUserId();
        if (userId) {
          await supabase
            .from('user_level_progression')
            .update({ show_level_badge: newValue, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        }

        return { success: true };
      },

      /**
       * Get full progression stats for current level
       */
      getProgressionStats: (level) => {
        return getLevelProgressionStats(level);
      },

      /**
       * Get display title (custom or level-based)
       */
      getDisplayTitle: (level) => {
        const { customTitle } = get();
        if (customTitle) return { title: customTitle, isCustom: true };
        const titleData = getLevelTitle(level);
        return { ...titleData, isCustom: false };
      },

      /**
       * Get display frame (selected or highest unlocked)
       */
      getDisplayFrame: (level) => {
        const { selectedFrame } = get();
        const frame = PROFILE_FRAMES[selectedFrame];

        // Verify user has unlocked this frame
        if (frame && level >= frame.minLevel) {
          return frame;
        }

        // Fallback to highest unlocked
        return getHighestFrame(level);
      },

      /**
       * Check if a specific milestone has been claimed
       */
      isMilestoneClaimed: (level) => {
        const { claimedMilestones } = get();
        return claimedMilestones.some(m => m.milestone_level === level);
      },

      /**
       * Reset store
       */
      reset: () => {
        set({
          selectedFrame: 'none',
          customTitle: null,
          showLevelBadge: true,
          currentTitle: null,
          currentFrame: null,
          petSlots: 1,
          equipmentSetSlots: 1,
          inventorySlots: 10,
          levelXPBonus: 0,
          claimedMilestones: [],
          pendingMilestones: [],
          isInitialized: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'level-progression-storage',
      partialize: (state) => ({
        selectedFrame: state.selectedFrame,
        customTitle: state.customTitle,
        showLevelBadge: state.showLevelBadge,
        claimedMilestones: state.claimedMilestones,
      }),
    }
  )
);

// Export initialization function
export const initializeLevelProgressionStore = async (level = 1, userId = null) => {
  return useLevelProgressionStore.getState().initialize(level, userId);
};

export default useLevelProgressionStore;
