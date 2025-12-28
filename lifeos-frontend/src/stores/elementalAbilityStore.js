/**
 * Elemental Ability Store
 * Manages equipped combat abilities and cooldowns for boss battles
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { DEV_USER_ID, isDevMode } from '../lib/dev-auth';
import {
  getAbilityById,
  isAbilityReady as checkAbilityReady,
  getCooldownProgress as getProgress,
  ABILITY_UNLOCKS,
  getAbilitiesByUnlockType,
  isAbilityUnlocked as checkAbilityUnlocked,
} from '../data/elementalAbilities';

// Helper to get current user ID
const getCurrentUserId = async (timeoutMs = 3000) => {
  if (isDevMode()) {
    return DEV_USER_ID;
  }

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), timeoutMs)
    );
    const authPromise = supabase.auth.getUser();
    const { data: { user } } = await Promise.race([authPromise, timeoutPromise]);
    return user?.id || null;
  } catch (error) {
    console.warn('[ElementalAbilityStore] getCurrentUserId error:', error.message);
    return null;
  }
};

const useElementalAbilityStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // STATE
      // ============================================

      // 2 equipped ability slots (stores ability IDs)
      // Note: Weapon provides a 3rd ability based on weapon type
      equippedAbilities: [null, null],

      // Cooldown tracking: { abilityId: lastUsedTimestamp }
      abilityCooldowns: {},

      // Unlocked abilities from various sources
      // { unlockedPerks: [], achievements: [], bossDrops: [], bazaarPurchases: [] }
      unlockedSources: {
        unlockedPerks: [],
        achievements: [],
        bossDrops: [],
        bazaarPurchases: [],
      },

      // Loading state
      isLoading: false,

      // ============================================
      // INITIALIZATION
      // ============================================

      initializeFromSupabase: async (passedUserId = null) => {
        set({ isLoading: true });

        try {
          const userId = passedUserId || await getCurrentUserId();
          if (!userId) {
            set({ isLoading: false });
            return;
          }

          // Load equipped abilities and unlocks in parallel
          const [equippedResult, unlocksResult] = await Promise.all([
            supabase
              .from('user_equipped_abilities')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle(),
            supabase
              .from('user_ability_unlocks')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle(),
          ]);

          const updates = {};

          if (!equippedResult.error && equippedResult.data) {
            updates.equippedAbilities = [
              equippedResult.data.slot_0 || null,
              equippedResult.data.slot_1 || null,
            ];
          }

          if (!unlocksResult.error && unlocksResult.data) {
            updates.unlockedSources = {
              unlockedPerks: unlocksResult.data.unlocked_perks || [],
              achievements: unlocksResult.data.achievements || [],
              bossDrops: unlocksResult.data.boss_drops || [],
              bazaarPurchases: unlocksResult.data.bazaar_purchases || [],
            };
          }

          if (Object.keys(updates).length > 0) {
            set(updates);
          }

          console.log('[ElementalAbilityStore] ✅ Initialized');
        } catch (error) {
          console.error('[ElementalAbilityStore] Error initializing:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // ============================================
      // EQUIP/UNEQUIP ABILITIES
      // ============================================

      /**
       * Equip an ability to a slot (0 or 1)
       */
      equipAbility: async (slot, abilityId) => {
        if (slot < 0 || slot > 1) {
          console.error('Invalid slot:', slot);
          return;
        }

        // Verify ability exists
        const ability = getAbilityById(abilityId);
        if (!ability) {
          console.error('Unknown ability:', abilityId);
          return;
        }

        // Check if ability is already equipped in another slot
        const currentSlots = [...get().equippedAbilities];
        const existingSlot = currentSlots.findIndex(id => id === abilityId);
        if (existingSlot !== -1 && existingSlot !== slot) {
          // Remove from existing slot
          currentSlots[existingSlot] = null;
        }

        // Equip to new slot
        currentSlots[slot] = abilityId;

        set({ equippedAbilities: currentSlots });

        // Sync to Supabase
        await get().syncToSupabase();
      },

      /**
       * Unequip ability from a slot
       */
      unequipAbility: async (slot) => {
        if (slot < 0 || slot > 1) return;

        const currentSlots = [...get().equippedAbilities];
        currentSlots[slot] = null;

        set({ equippedAbilities: currentSlots });

        // Sync to Supabase
        await get().syncToSupabase();
      },

      /**
       * Sync equipped abilities to Supabase
       */
      syncToSupabase: async () => {
        try {
          const userId = await getCurrentUserId();
          if (!userId) return;

          const { equippedAbilities } = get();

          await supabase
            .from('user_equipped_abilities')
            .upsert({
              user_id: userId,
              slot_0: equippedAbilities[0],
              slot_1: equippedAbilities[1],
              slot_2: null, // Reserved for weapon ability
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        } catch (error) {
          console.error('[ElementalAbilityStore] Error syncing to Supabase:', error);
        }
      },

      // ============================================
      // COOLDOWN MANAGEMENT
      // ============================================

      /**
       * Use an ability (starts cooldown)
       * Returns the ability data if successful, null if on cooldown
       */
      useAbility: (slot) => {
        const { equippedAbilities, abilityCooldowns } = get();
        const abilityId = equippedAbilities[slot];

        if (!abilityId) return null;

        const ability = getAbilityById(abilityId);
        if (!ability) return null;

        // Check if on cooldown
        const lastUsed = abilityCooldowns[abilityId];
        if (lastUsed && !checkAbilityReady(lastUsed, ability.cooldown)) {
          return null; // Still on cooldown
        }

        // Start cooldown
        set({
          abilityCooldowns: {
            ...abilityCooldowns,
            [abilityId]: Date.now(),
          },
        });

        return ability;
      },

      /**
       * Check if ability in slot is ready
       */
      isAbilityReady: (slot) => {
        const { equippedAbilities, abilityCooldowns } = get();
        const abilityId = equippedAbilities[slot];

        if (!abilityId) return false;

        const ability = getAbilityById(abilityId);
        if (!ability) return false;

        const lastUsed = abilityCooldowns[abilityId];
        return checkAbilityReady(lastUsed, ability.cooldown);
      },

      /**
       * Get cooldown progress for slot (0-1, 1 = ready)
       */
      getCooldownProgress: (slot) => {
        const { equippedAbilities, abilityCooldowns } = get();
        const abilityId = equippedAbilities[slot];

        if (!abilityId) return 1;

        const ability = getAbilityById(abilityId);
        if (!ability) return 1;

        const lastUsed = abilityCooldowns[abilityId];
        return getProgress(lastUsed, ability.cooldown);
      },

      /**
       * Get remaining cooldown time in ms
       */
      getCooldownRemaining: (slot) => {
        const { equippedAbilities, abilityCooldowns } = get();
        const abilityId = equippedAbilities[slot];

        if (!abilityId) return 0;

        const ability = getAbilityById(abilityId);
        if (!ability) return 0;

        const lastUsed = abilityCooldowns[abilityId];
        if (!lastUsed) return 0;

        const elapsed = Date.now() - lastUsed;
        return Math.max(0, ability.cooldown - elapsed);
      },

      /**
       * Reset all cooldowns (e.g., after battle ends)
       */
      resetCooldowns: () => {
        set({ abilityCooldowns: {} });
      },

      // ============================================
      // GETTERS
      // ============================================

      /**
       * Get equipped ability data for a slot
       */
      getEquippedAbility: (slot) => {
        const { equippedAbilities } = get();
        const abilityId = equippedAbilities[slot];
        if (!abilityId) return null;
        return getAbilityById(abilityId);
      },

      /**
       * Get all equipped abilities with their data
       */
      getEquippedAbilitiesData: () => {
        const { equippedAbilities } = get();
        return equippedAbilities.map(id => id ? getAbilityById(id) : null);
      },

      /**
       * Check if an ability is equipped in any slot
       */
      isAbilityEquipped: (abilityId) => {
        const { equippedAbilities } = get();
        return equippedAbilities.includes(abilityId);
      },

      /**
       * Get which slot an ability is equipped in (-1 if not equipped)
       */
      getAbilitySlot: (abilityId) => {
        const { equippedAbilities } = get();
        return equippedAbilities.indexOf(abilityId);
      },

      // ============================================
      // UNLOCK MANAGEMENT
      // ============================================

      /**
       * Check if an ability is unlocked
       */
      isAbilityUnlocked: (abilityId) => {
        const { unlockedSources } = get();
        const unlock = ABILITY_UNLOCKS[abilityId];

        if (!unlock) return false;

        switch (unlock.type) {
          case 'default':
            return true;
          case 'perk':
            return unlockedSources.unlockedPerks.includes(unlock.perkId);
          case 'achievement':
            return unlockedSources.achievements.includes(unlock.achievementId);
          case 'boss':
            return unlockedSources.bossDrops.includes(abilityId);
          case 'bazaar':
            return unlockedSources.bazaarPurchases.includes(abilityId);
          default:
            return false;
        }
      },

      /**
       * Unlock an ability from a perk
       */
      unlockFromPerk: (perkId) => {
        set(state => {
          if (state.unlockedSources.unlockedPerks.includes(perkId)) {
            return state;
          }
          return {
            unlockedSources: {
              ...state.unlockedSources,
              unlockedPerks: [...state.unlockedSources.unlockedPerks, perkId],
            },
          };
        });
        get().syncUnlocksToSupabase();
      },

      /**
       * Unlock an ability from an achievement
       */
      unlockFromAchievement: (achievementId) => {
        set(state => {
          if (state.unlockedSources.achievements.includes(achievementId)) {
            return state;
          }
          return {
            unlockedSources: {
              ...state.unlockedSources,
              achievements: [...state.unlockedSources.achievements, achievementId],
            },
          };
        });
        get().syncUnlocksToSupabase();
      },

      /**
       * Unlock an ability from a boss drop
       */
      unlockFromBossDrop: (abilityId) => {
        set(state => {
          if (state.unlockedSources.bossDrops.includes(abilityId)) {
            return state;
          }
          return {
            unlockedSources: {
              ...state.unlockedSources,
              bossDrops: [...state.unlockedSources.bossDrops, abilityId],
            },
          };
        });
        get().syncUnlocksToSupabase();
      },

      /**
       * Unlock an ability from a Bazaar purchase
       */
      unlockFromBazaar: (abilityId) => {
        set(state => {
          if (state.unlockedSources.bazaarPurchases.includes(abilityId)) {
            return state;
          }
          return {
            unlockedSources: {
              ...state.unlockedSources,
              bazaarPurchases: [...state.unlockedSources.bazaarPurchases, abilityId],
            },
          };
        });
        get().syncUnlocksToSupabase();
      },

      /**
       * Get all unlocked ability IDs
       */
      getUnlockedAbilities: () => {
        const { isAbilityUnlocked } = get();
        return Object.keys(ABILITY_UNLOCKS).filter(abilityId =>
          isAbilityUnlocked(abilityId)
        );
      },

      /**
       * Get all unlocked abilities with data
       */
      getUnlockedAbilitiesData: () => {
        return get().getUnlockedAbilities()
          .map(id => getAbilityById(id))
          .filter(Boolean);
      },

      /**
       * Sync unlock sources to Supabase
       */
      syncUnlocksToSupabase: async () => {
        try {
          const userId = await getCurrentUserId();
          if (!userId) return;

          const { unlockedSources } = get();

          await supabase
            .from('user_ability_unlocks')
            .upsert({
              user_id: userId,
              unlocked_perks: unlockedSources.unlockedPerks,
              achievements: unlockedSources.achievements,
              boss_drops: unlockedSources.bossDrops,
              bazaar_purchases: unlockedSources.bazaarPurchases,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        } catch (error) {
          console.error('[ElementalAbilityStore] Error syncing unlocks:', error);
        }
      },

      /**
       * Load unlocks from Supabase
       */
      loadUnlocksFromSupabase: async () => {
        try {
          const userId = await getCurrentUserId();
          if (!userId) return;

          const { data, error } = await supabase
            .from('user_ability_unlocks')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (!error && data) {
            set({
              unlockedSources: {
                unlockedPerks: data.unlocked_perks || [],
                achievements: data.achievements || [],
                bossDrops: data.boss_drops || [],
                bazaarPurchases: data.bazaar_purchases || [],
              },
            });
          }
        } catch (error) {
          console.error('[ElementalAbilityStore] Error loading unlocks:', error);
        }
      },

      // ============================================
      // RESET
      // ============================================

      reset: () => {
        set({
          equippedAbilities: [null, null],
          abilityCooldowns: {},
          unlockedSources: {
            unlockedPerks: [],
            achievements: [],
            bossDrops: [],
          },
          isLoading: false,
        });
      },
    }),
    {
      name: 'lifeos-elemental-abilities-storage',
      partialize: (state) => ({
        equippedAbilities: state.equippedAbilities,
        unlockedSources: state.unlockedSources,
        // Don't persist cooldowns - they reset each session
      }),
    }
  )
);

export default useElementalAbilityStore;
