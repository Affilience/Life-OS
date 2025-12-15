import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { AVATAR_TIERS, calculateStats } from '../data/avatarData';
import { EQUIPMENT_DATABASE, EQUIPMENT_SLOTS, EQUIPMENT_RARITY } from '../data/equipmentDatabase';

// Lazy store imports to avoid circular dependencies
let achievementsStoreRef = null;
let perkStoreRef = null;
let gamificationStoreRef = null;

const getAchievementsStore = async () => {
  if (!achievementsStoreRef) {
    const module = await import('./achievementsStore');
    achievementsStoreRef = module.default;
  }
  return achievementsStoreRef;
};

const getPerkStore = async () => {
  if (!perkStoreRef) {
    const module = await import('./perkStore');
    perkStoreRef = module.default;
  }
  return perkStoreRef;
};

const getGamificationStore = async () => {
  if (!gamificationStoreRef) {
    const module = await import('./gamificationStore');
    gamificationStoreRef = module.default;
  }
  return gamificationStoreRef;
};

// Default state for new users
const DEFAULT_STATE = {
  level: 1,
  xp: 0,
  currentTier: 1,
  prestige: 0,
  totalLevelsEarned: 0,
  totalXPEarned: 0,
  characterGender: 'male',
  equipped: {
    helmet: 'helmet_cloth_cap',
    chest: 'chest_cloth_tunic',
    legs: null,
    mainHand: 'weapon_training_sword',
    offHand: 'shield_wooden_buckler',
    cape: 'cape_traveler',
    ring1: null,
    ring2: null,
    amulet: null,
  },
  cosmetic: {
    helmet: null,
    chest: null,
    legs: null,
    mainHand: null,
    offHand: null,
    cape: null,
    ring1: null,
    ring2: null,
    amulet: null,
  },
  dyes: {
    helmet: null,
    chest: null,
    legs: null,
    mainHand: null,
    offHand: null,
    cape: null,
    ring1: null,
    ring2: null,
    amulet: null,
  },
  // Bazaar cosmetics (titles, frames)
  ownedCosmetics: [], // Array of cosmetic item IDs owned
  activeCosmetics: {
    title: null,      // e.g., 'title_pioneer'
    frame: null,      // e.g., 'frame_golden'
  },
  unlockedEquipment: [
    'helmet_basic',
    'chest_basic',
    'weapon_basic_sword',
    'shield_basic',
    'cape_basic',
  ],
  stats: {
    defense: 3,
    strength: 0,
    vitality: 1,
    intelligence: 1,
    wisdom: 0,
  },
  moduleProgress: {
    productivity: { tasksCompleted: 0, deepWorkHours: 0, streak: 0 },
    fitness: { workoutsCompleted: 0, macroGoalsHit: 0, workoutStreak: 0 },
    knowledge: { booksCompleted: 0, skillsMastered: 0, learningHours: 0 },
    financial: { daysTracked: 0, positiveGrowth: false },
    journal: { entriesWritten: 0, journalStreak: 0 },
    calendar: { perfectWeeks: 0, timeBlockingDays: 0 },
    skills: { skillsPracticed: 0, weeklyActivities: 0 },
    cross: { allModulesActive: 0, totalHours: 0 },
  },
};

// Cosmetic item definitions for display
export const COSMETIC_DEFINITIONS = {
  // Titles
  title_pioneer: { name: 'Pioneer', type: 'title', rarity: 'uncommon' },
  title_cosmic_warrior: { name: 'Cosmic Warrior', type: 'title', rarity: 'rare' },
  title_legend: { name: 'Legend', type: 'title', rarity: 'epic' },
  // Frames
  frame_golden: { name: 'Golden Frame', type: 'frame', rarity: 'legendary', color: '#fbbf24' },
};

export const useAvatarStore = create(
  persist(
    (set, get) => ({
      // State
      ...DEFAULT_STATE,

      // Sync status
      _isSyncing: false,
      _lastSyncedAt: null,
      _syncError: null,

      // Initialize from Supabase
      initializeFromSupabase: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        set({ _isSyncing: true, _syncError: null });

        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (error) throw error;
          if (!data) {
            console.log('No user profile found, using defaults');
            set({ _isSyncing: false });
            return;
          }

          if (data) {
            // Map database fields to store state
            set({
              level: data.current_level || 1,
              xp: data.current_xp || 0,
              currentTier: data.current_tier || 1,
              prestige: data.prestige || 0,
              totalLevelsEarned: data.total_levels_earned || 0,
              totalXPEarned: data.total_xp || 0,
              characterGender: data.character_gender || 'male',
              equipped: data.equipped_items || DEFAULT_STATE.equipped,
              cosmetic: data.cosmetic_overrides || DEFAULT_STATE.cosmetic,
              dyes: data.dye_colors || DEFAULT_STATE.dyes,
              unlockedEquipment: data.unlocked_equipment || DEFAULT_STATE.unlockedEquipment,
              moduleProgress: data.module_progress || DEFAULT_STATE.moduleProgress,
              _lastSyncedAt: new Date().toISOString(),
              _isSyncing: false,
            });

            // Recalculate stats after loading
            get().recalculateStats();
          }
        } catch (error) {
          console.error('Failed to initialize avatar from Supabase:', error);
          set({ _syncError: error.message, _isSyncing: false });
        }
      },

      // Sync current state to Supabase
      syncToSupabase: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const state = get();

        try {
          const { error } = await supabase
            .from('user_profiles')
            .update({
              current_level: state.level,
              current_xp: state.xp,
              current_tier: state.currentTier,
              prestige: state.prestige,
              total_levels_earned: state.totalLevelsEarned,
              total_xp: state.totalXPEarned,
              character_gender: state.characterGender,
              equipped_items: state.equipped,
              cosmetic_overrides: state.cosmetic,
              dye_colors: state.dyes,
              unlocked_equipment: state.unlockedEquipment,
              module_progress: state.moduleProgress,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (error) throw error;

          set({ _lastSyncedAt: new Date().toISOString(), _syncError: null });
        } catch (error) {
          console.error('Failed to sync avatar to Supabase:', error);
          set({ _syncError: error.message });
        }
      },

      // Sync stats to user_stats table
      syncStatsToSupabase: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { stats } = get();

        try {
          const { error } = await supabase
            .from('user_stats')
            .update({
              strength: stats.strength,
              vitality: stats.vitality,
              intelligence: stats.intelligence,
              wisdom: stats.wisdom,
              defense: stats.defense,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          if (error) throw error;
        } catch (error) {
          console.error('Failed to sync stats to Supabase:', error);
        }
      },

      // Add XP and level up
      addXP: async (amount) => {
        const currentXP = get().xp;
        const currentLevel = get().level;
        const currentPrestige = get().prestige || 0;

        // Apply prestige XP multiplier
        const multiplier = currentPrestige === 0 ? 1 : currentPrestige === 1 ? 1.5 : 2.0;
        const adjustedAmount = amount * multiplier;
        const newXP = currentXP + adjustedAmount;

        // XP to next level formula: exponential scaling
        // Level 1: 100, Level 5: 400, Level 10: 1000, Level 20: 3000, Level 50: 15000, Level 100: 50000
        // Formula: 50 * level + 50 * level^1.5 (rounded)
        const xpNeeded = Math.round(50 * currentLevel + 50 * Math.pow(currentLevel, 1.5));

        // Track total XP earned
        set(state => ({ totalXPEarned: state.totalXPEarned + adjustedAmount }));

        let result;
        if (newXP >= xpNeeded) {
          const newLevel = currentLevel + 1;
          const overflow = newXP - xpNeeded;

          // Check if tier upgraded
          const newTier = getTierForLevel(newLevel);
          const tierUp = newTier > get().currentTier;

          set(state => ({
            level: newLevel,
            xp: overflow,
            currentTier: newTier,
            totalLevelsEarned: state.totalLevelsEarned + 1,
          }));

          // Recalculate stats
          get().recalculateStats();

          result = { leveledUp: true, newLevel, tierUp };
        } else {
          set({ xp: newXP });
          result = { leveledUp: false };
        }

        // Sync to Supabase (non-blocking)
        get().syncToSupabase();

        return result;
      },

      // Equip an item
      equipItem: async (slot, itemId) => {
        const item = EQUIPMENT_DATABASE[itemId];
        if (!item) return false;
        if (item.slot !== slot) return false;

        // Allow if unlocked OR if it's default equipment
        const isDefault = item.unlockMethod === 'default';
        const isUnlocked = get().unlockedEquipment.includes(itemId);
        if (!isDefault && !isUnlocked) return false;

        set(state => ({
          equipped: {
            ...state.equipped,
            [slot]: itemId,
          },
        }));

        get().recalculateStats();
        get().syncToSupabase();
        return true;
      },

      // Unequip an item
      unequipItem: async (slot) => {
        set(state => ({
          equipped: {
            ...state.equipped,
            [slot]: null,
          },
        }));

        get().recalculateStats();
        get().syncToSupabase();
      },

      // Unlock equipment
      unlockEquipment: async (itemId) => {
        const item = EQUIPMENT_DATABASE[itemId];
        if (!item) return false;
        if (get().unlockedEquipment.includes(itemId)) return false;

        set(state => ({
          unlockedEquipment: [...state.unlockedEquipment, itemId],
        }));

        get().syncToSupabase();
        return true;
      },

      // Update module progress
      updateModuleProgress: async (module, updates) => {
        set(state => ({
          moduleProgress: {
            ...state.moduleProgress,
            [module]: {
              ...state.moduleProgress[module],
              ...updates,
            },
          },
        }));

        // Check for new unlocks
        get().checkUnlocks();
        get().syncToSupabase();
      },

      // Check if a specific unlock requirement is met
      checkUnlockRequirement: async (item, { level, prestige, stats, unlockedAchievements, perkState }) => {
        const req = item.unlockRequirement;
        const method = item.unlockMethod;

        // Default items are always unlocked
        if (method === 'default') {
          return true;
        }

        // Bazaar items are never auto-unlocked - must be purchased
        if (method === 'bazaar') {
          return false;
        }

        // Level-based unlocks
        if (method === 'level') {
          // Check for prestige requirement
          if (req.prestige) {
            return prestige >= req.prestige;
          }
          return level >= req.level;
        }

        // Achievement-based unlocks
        if (method === 'achievement') {
          // First check if the specific achievement is unlocked
          if (req.achievementId && unlockedAchievements?.includes(req.achievementId)) {
            return true;
          }
          // Fallback to stat-based check
          if (req.fallbackStat && req.fallbackTarget) {
            return (stats[req.fallbackStat] || 0) >= req.fallbackTarget;
          }
          return false;
        }

        // Skill tree-based unlocks
        if (method === 'skill_tree') {
          const treeLevels = perkState?.treeLevels || {};
          const unlockedPerks = perkState?.unlockedPerks || [];

          // Check for specific perk unlock (OR condition)
          if (req.orPerkId && unlockedPerks.includes(req.orPerkId)) {
            return true;
          }

          // Check for specific tree level requirement
          if (req.tree && req.level) {
            const treeLevel = treeLevels[req.tree] || 0;
            if (treeLevel >= req.level) {
              return true;
            }
          }

          // Check for any tree reaching a level
          if (req.anyTree && req.level) {
            return Object.values(treeLevels).some(lvl => lvl >= req.level);
          }

          // Check for all trees reaching a level
          if (req.allTrees && req.level) {
            const trees = ['body', 'mind', 'spirit', 'wealth', 'social', 'craft'];
            return trees.every(tree => (treeLevels[tree] || 0) >= req.level);
          }

          return false;
        }

        return false;
      },

      // Check for equipment unlocks based on progress
      checkUnlocks: async () => {
        const { unlockedEquipment, unlockEquipment, checkUnlockRequirement, level, prestige } = get();

        // Import stores dynamically to avoid circular dependencies
        const [achievementsStore, perkStore] = await Promise.all([
          getAchievementsStore(),
          getPerkStore()
        ]);

        const achievementsState = achievementsStore.getState();
        const perkState = perkStore.getState();

        const stats = achievementsState.stats || {};
        const unlockedAchievements = achievementsState.unlockedAchievements || [];

        const newUnlocks = [];

        // Check each equipment's unlock condition
        for (const [itemId, item] of Object.entries(EQUIPMENT_DATABASE)) {
          if (unlockedEquipment.includes(itemId)) continue; // Already owned

          const shouldUnlock = await checkUnlockRequirement(item, {
            level,
            prestige,
            stats,
            unlockedAchievements,
            perkState,
          });

          if (shouldUnlock) {
            await unlockEquipment(itemId);
            newUnlocks.push(item);
          }
        }

        return newUnlocks;
      },

      // Purchase equipment from the Bazaar
      purchaseEquipment: async (itemId) => {
        const { unlockedEquipment, unlockEquipment } = get();
        const item = EQUIPMENT_DATABASE[itemId];

        // Validate item exists and is bazaar-purchasable
        if (!item || item.unlockMethod !== 'bazaar') {
          console.error('[AvatarStore] Equipment cannot be purchased:', itemId);
          return { success: false, error: 'Equipment cannot be purchased' };
        }

        // Check if already owned
        if (unlockedEquipment.includes(itemId)) {
          return { success: false, error: 'Already owned' };
        }

        const price = item.unlockRequirement.price;

        // Get gamification store to handle credits
        const gamificationStore = await getGamificationStore();
        const gamificationState = gamificationStore.getState();
        const currentCredits = gamificationState.cosmicCredits || 0;

        // Check if user has enough credits
        if (currentCredits < price) {
          return {
            success: false,
            error: 'Insufficient credits',
            required: price,
            current: currentCredits,
          };
        }

        // Deduct credits
        gamificationState.spendCredits(price, `Equipment purchase: ${item.name}`);

        // Unlock the equipment
        await unlockEquipment(itemId);

        // Log the purchase to timeline
        const userId = await getCurrentUserId();
        if (userId) {
          try {
            await supabase.from('timeline').insert({
              user_id: userId,
              module: 'bazaar',
              entry_type: 'equipment_purchased',
              title: `Purchased ${item.name}`,
              description: `Bought ${item.name} for ${price} Cosmic Credits`,
              metadata: {
                item_id: itemId,
                slot: item.slot,
                rarity: item.rarity,
                price: price,
              },
            });
          } catch (error) {
            console.error('Error logging equipment purchase to timeline:', error);
          }
        }

        return {
          success: true,
          item: item,
          creditsSpent: price,
          remainingCredits: currentCredits - price,
        };
      },

      // Get equipment available for purchase in the Bazaar
      getPurchasableEquipment: () => {
        const { unlockedEquipment } = get();

        return Object.entries(EQUIPMENT_DATABASE)
          .filter(([itemId, item]) => {
            // Must be bazaar-purchasable and not already owned
            return item.unlockMethod === 'bazaar' && !unlockedEquipment.includes(itemId);
          })
          .map(([itemId, item]) => ({
            ...item,
            id: itemId,
            price: item.unlockRequirement.price,
          }))
          .sort((a, b) => a.price - b.price);
      },

      // Get all locked equipment grouped by unlock method (for UI display)
      getLockedEquipmentByMethod: () => {
        const { unlockedEquipment } = get();

        const grouped = {
          level: [],
          achievement: [],
          skill_tree: [],
          bazaar: [],
        };

        Object.entries(EQUIPMENT_DATABASE)
          .filter(([itemId, item]) => !unlockedEquipment.includes(itemId) && item.unlockMethod !== 'default')
          .forEach(([itemId, item]) => {
            if (grouped[item.unlockMethod]) {
              grouped[item.unlockMethod].push({ ...item, id: itemId });
            }
          });

        return grouped;
      },

      // Recalculate stats from equipped items
      recalculateStats: () => {
        const equipped = Object.values(get().equipped).filter(Boolean);
        const stats = calculateStats(equipped);
        set({ stats });

        // Sync stats to Supabase (non-blocking)
        get().syncStatsToSupabase();
      },

      // Get current tier data
      getCurrentTierData: () => {
        return AVATAR_TIERS[get().currentTier];
      },

      // Get equipped item data
      getEquippedItems: () => {
        const equipped = get().equipped;
        return Object.fromEntries(
          Object.entries(equipped)
            .filter(([_, itemId]) => itemId)
            .map(([slot, itemId]) => [slot, EQUIPMENT_DATABASE[itemId]])
        );
      },

      // Transmog/Cosmetic System

      // Set cosmetic override for a slot
      setTransmog: async (slot, cosmeticItemId) => {
        if (!get().unlockedEquipment.includes(cosmeticItemId)) {
          return false;
        }

        const item = EQUIPMENT_DATABASE[cosmeticItemId];
        if (!item || item.slot !== slot) {
          return false;
        }

        set(state => ({
          cosmetic: {
            ...state.cosmetic,
            [slot]: cosmeticItemId,
          },
        }));

        get().syncToSupabase();
        return true;
      },

      // Remove cosmetic override
      clearTransmog: async (slot) => {
        set(state => ({
          cosmetic: {
            ...state.cosmetic,
            [slot]: null,
          },
        }));
        get().syncToSupabase();
      },

      // Clear all cosmetic overrides
      clearAllTransmog: async () => {
        set({
          cosmetic: {
            helmet: null,
            chest: null,
            legs: null,
            mainHand: null,
            offHand: null,
            cape: null,
            ring1: null,
            ring2: null,
            amulet: null,
          },
        });
        get().syncToSupabase();
      },

      // Get visual item for a slot
      getVisualItem: (slot) => {
        const cosmetic = get().cosmetic[slot];
        if (cosmetic) {
          return EQUIPMENT_DATABASE[cosmetic];
        }
        const functional = get().equipped[slot];
        return functional ? EQUIPMENT_DATABASE[functional] : null;
      },

      // Dye System

      // Set dye color for a slot
      setDye: async (slot, color) => {
        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
          return false;
        }

        set(state => ({
          dyes: {
            ...state.dyes,
            [slot]: color,
          },
        }));

        get().syncToSupabase();
        return true;
      },

      // Remove dye from slot
      clearDye: async (slot) => {
        set(state => ({
          dyes: {
            ...state.dyes,
            [slot]: null,
          },
        }));
        get().syncToSupabase();
      },

      // Clear all dyes
      clearAllDyes: async () => {
        set({
          dyes: {
            helmet: null,
            chest: null,
            legs: null,
            mainHand: null,
            offHand: null,
            cape: null,
            ring1: null,
            ring2: null,
            amulet: null,
          },
        });
        get().syncToSupabase();
      },

      // Get all visual equipment (RPG slots)
      getVisualEquipment: () => {
        const slots = ['helmet', 'chest', 'legs', 'mainHand', 'offHand', 'cape'];
        const visual = {};

        slots.forEach(slot => {
          visual[slot] = {
            item: get().getVisualItem(slot),
            dye: get().dyes[slot],
          };
        });

        return visual;
      },

      // Character Gender/Appearance
      setCharacterGender: async (gender) => {
        if (gender === 'male' || gender === 'female') {
          set({ characterGender: gender });
          get().syncToSupabase();
        }
      },

      // ============================================
      // COSMETICS (Titles, Frames)
      // ============================================

      // Add a cosmetic to owned list
      addOwnedCosmetic: (cosmeticId) => {
        const { ownedCosmetics } = get();
        if (!ownedCosmetics.includes(cosmeticId)) {
          set({ ownedCosmetics: [...ownedCosmetics, cosmeticId] });
        }
      },

      // Set active cosmetic (title or frame)
      setActiveCosmetic: (type, cosmeticId) => {
        const { activeCosmetics, ownedCosmetics } = get();
        // Only allow setting if owned (or null to unequip)
        if (cosmeticId === null || ownedCosmetics.includes(cosmeticId)) {
          set({
            activeCosmetics: {
              ...activeCosmetics,
              [type]: cosmeticId,
            },
          });
        }
      },

      // Get active title name
      getActiveTitle: () => {
        const { activeCosmetics } = get();
        if (!activeCosmetics.title) return null;
        const def = COSMETIC_DEFINITIONS[activeCosmetics.title];
        return def ? def.name : null;
      },

      // Get active frame config
      getActiveFrame: () => {
        const { activeCosmetics } = get();
        if (!activeCosmetics.frame) return null;
        return COSMETIC_DEFINITIONS[activeCosmetics.frame] || null;
      },

      // Get hero sprite path based on gender and stage
      getHeroSpritePath: (stageNumber, stageName) => {
        const gender = get().characterGender;
        const nameSlug = stageName.toLowerCase().replace(/ /g, '_');
        // Use base evolution sprites (no armor) for equipment overlay system
        if (gender === 'female') {
          return `/assets/avatar/base-evolution/heroine_base_stage_${stageNumber}_${nameSlug}.png`;
        }
        return `/assets/avatar/base-evolution/hero_base_stage_${stageNumber}_${nameSlug}.png`;
      },

      // Prestige/Rebirth system
      canPrestige: () => {
        const currentLevel = get().level;
        const currentPrestige = get().prestige || 0;

        if (currentPrestige === 0 && currentLevel >= 100) return true;
        if (currentPrestige === 1 && currentLevel >= 100) return true;
        return false;
      },

      performPrestige: async () => {
        if (!get().canPrestige()) {
          return { success: false, message: 'Not eligible for prestige' };
        }

        const currentPrestige = get().prestige || 0;
        const newPrestige = currentPrestige + 1;

        if (newPrestige > 2) {
          return { success: false, message: 'Maximum prestige level reached' };
        }

        set({
          level: 1,
          xp: 0,
          currentTier: 1,
          prestige: newPrestige,
        });

        get().recalculateStats();
        get().syncToSupabase();

        return {
          success: true,
          newPrestige,
          message: `Ascended to Prestige ${newPrestige}!`,
          bonuses: newPrestige === 1 ? { xpMultiplier: 1.5 } : { xpMultiplier: 2.0 },
        };
      },

      // Get prestige info
      getPrestigeInfo: () => {
        const prestige = get().prestige || 0;
        const level = get().level;
        const canPrestige = get().canPrestige();

        const prestigeNames = {
          0: 'Mortal Realm',
          1: 'Cosmic Ascension',
          2: 'Transcendent',
        };

        return {
          currentPrestige: prestige,
          currentRealm: prestigeNames[prestige],
          nextRealm: prestige < 2 ? prestigeNames[prestige + 1] : null,
          canPrestige,
          requiredLevel: 100,
          xpMultiplier: prestige === 0 ? 1 : prestige === 1 ? 1.5 : 2.0,
        };
      },

      // Reset avatar
      resetAvatar: async () => {
        set({
          ...DEFAULT_STATE,
        });
        get().recalculateStats();
        get().syncToSupabase();
      },
    }),
    {
      name: 'avatar-storage',
      // Only persist certain fields locally as fallback
      partialize: (state) => ({
        level: state.level,
        xp: state.xp,
        currentTier: state.currentTier,
        prestige: state.prestige,
        totalLevelsEarned: state.totalLevelsEarned,
        totalXPEarned: state.totalXPEarned,
        characterGender: state.characterGender,
        equipped: state.equipped,
        cosmetic: state.cosmetic,
        dyes: state.dyes,
        unlockedEquipment: state.unlockedEquipment,
        stats: state.stats,
        moduleProgress: state.moduleProgress,
        ownedCosmetics: state.ownedCosmetics,
        activeCosmetics: state.activeCosmetics,
      }),
    }
  )
);

// Helper Functions

/**
 * Calculate XP needed to reach the next level
 * Uses exponential scaling: 50 * level + 50 * level^1.5
 * Example values:
 *   Level 1: 100 XP    Level 10: 1,081 XP   Level 25: 4,378 XP
 *   Level 5: 309 XP    Level 15: 1,655 XP   Level 50: 15,178 XP
 *   Level 100: 52,500 XP
 */
export function getXPForLevel(level) {
  return Math.round(50 * level + 50 * Math.pow(level, 1.5));
}

/**
 * Calculate total XP needed to reach a specific level from level 1
 */
export function getTotalXPForLevel(targetLevel) {
  let total = 0;
  for (let i = 1; i < targetLevel; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

function getTierForLevel(level) {
  if (level >= 51) return 4;
  if (level >= 26) return 3;
  if (level >= 11) return 2;
  return 1;
}

// Hook to initialize store from Supabase on app load
export const initializeAvatarStore = async () => {
  await useAvatarStore.getState().initializeFromSupabase();
};
