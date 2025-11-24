import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AVATAR_TIERS, EQUIPMENT_DATABASE, calculateStats } from '../data/avatarData';

export const useAvatarStore = create(
  persist(
    (set, get) => ({
      // Current state
      level: 1,
      xp: 0,
      currentTier: 1,
      prestige: 0,
      totalLevelsEarned: 0,
      totalXPEarned: 0,

      // Equipped items (itemId for each slot) - provides stats
      equipped: {
        helmet: 'helmet_basic',
        suit: 'suit_basic',
        backpack: 'backpack_basic',
        tool: 'tool_scanner',
        badge: null,
      },

      // Cosmetic overrides (transmog) - visual appearance only
      cosmetic: {
        helmet: null,
        suit: null,
        backpack: null,
        tool: null,
        badge: null,
      },

      // Dye colors for equipment tinting
      dyes: {
        helmet: null,
        suit: null,
        backpack: null,
        tool: null,
        badge: null,
      },

      // Unlocked equipment
      unlockedEquipment: [
        'helmet_basic',
        'suit_basic',
        'backpack_basic',
        'tool_scanner',
      ],

      // Avatar stats (calculated from equipment)
      stats: {
        defense: 3,
        strength: 0,
        vitality: 1,
        intelligence: 1,
        wisdom: 0,
      },

      // Module progress (for unlock conditions)
      moduleProgress: {
        productivity: {
          tasksCompleted: 0,
          deepWorkHours: 0,
          streak: 0,
        },
        fitness: {
          workoutsCompleted: 0,
          macroGoalsHit: 0,
          workoutStreak: 0,
        },
        knowledge: {
          booksCompleted: 0,
          skillsMastered: 0,
          learningHours: 0,
        },
        financial: {
          daysTracked: 0,
          positiveGrowth: false,
        },
        journal: {
          entriesWritten: 0,
          journalStreak: 0,
        },
        calendar: {
          perfectWeeks: 0,
          timeBlockingDays: 0,
        },
        skills: {
          skillsPracticed: 0,
          weeklyActivities: 0,
        },
        cross: {
          allModulesActive: 0,
          totalHours: 0,
        },
      },

      // Actions

      // Add XP and level up
      addXP: (amount) => {
        const currentXP = get().xp;
        const currentLevel = get().level;
        const currentPrestige = get().prestige || 0;

        // Apply prestige XP multiplier
        const multiplier = currentPrestige === 0 ? 1 : currentPrestige === 1 ? 1.5 : 2.0;
        const adjustedAmount = amount * multiplier;
        const newXP = currentXP + adjustedAmount;

        // XP to next level formula: level * 100
        const xpNeeded = currentLevel * 100;

        // Track total XP earned
        set(state => ({ totalXPEarned: state.totalXPEarned + adjustedAmount }));

        if (newXP >= xpNeeded) {
          const newLevel = currentLevel + 1;
          const overflow = newXP - xpNeeded;

          // Check if tier upgraded
          const newTier = getTierForLevel(newLevel);

          set(state => ({
            level: newLevel,
            xp: overflow,
            currentTier: newTier,
            totalLevelsEarned: state.totalLevelsEarned + 1,
          }));

          // Recalculate stats
          get().recalculateStats();

          return { leveledUp: true, newLevel, tierUp: newTier > get().currentTier };
        } else {
          set({ xp: newXP });
          return { leveledUp: false };
        }
      },

      // Equip an item
      equipItem: (slot, itemId) => {
        const item = EQUIPMENT_DATABASE[itemId];
        if (!item) return false;

        if (item.slot !== slot) return false;

        if (!get().unlockedEquipment.includes(itemId)) return false;

        set(state => ({
          equipped: {
            ...state.equipped,
            [slot]: itemId,
          },
        }));

        get().recalculateStats();
        return true;
      },

      // Unequip an item
      unequipItem: (slot) => {
        set(state => ({
          equipped: {
            ...state.equipped,
            [slot]: null,
          },
        }));

        get().recalculateStats();
      },

      // Unlock equipment
      unlockEquipment: (itemId) => {
        const item = EQUIPMENT_DATABASE[itemId];
        if (!item) return false;

        if (get().unlockedEquipment.includes(itemId)) return false;

        set(state => ({
          unlockedEquipment: [...state.unlockedEquipment, itemId],
        }));

        return true;
      },

      // Update module progress
      updateModuleProgress: (module, updates) => {
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
      },

      // Check for equipment unlocks based on progress
      checkUnlocks: () => {
        const progress = get().moduleProgress;
        const unlocked = get().unlockedEquipment;
        let newUnlocks = [];

        Object.entries(EQUIPMENT_DATABASE).forEach(([itemId, item]) => {
          if (unlocked.includes(itemId)) return;
          if (item.unlockedBy === 'default') return;

          // Check unlock conditions
          if (checkUnlockCondition(item.unlockedBy, progress)) {
            get().unlockEquipment(itemId);
            newUnlocks.push(item);
          }
        });

        return newUnlocks;
      },

      // Recalculate stats from equipped items
      recalculateStats: () => {
        const equipped = Object.values(get().equipped).filter(Boolean);
        const stats = calculateStats(equipped);
        set({ stats });
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
      setTransmog: (slot, cosmeticItemId) => {
        if (!get().unlockedEquipment.includes(cosmeticItemId)) {
          return false; // Can only transmog to unlocked items
        }

        const item = EQUIPMENT_DATABASE[cosmeticItemId];
        if (!item || item.slot !== slot) {
          return false; // Item doesn't exist or wrong slot
        }

        set(state => ({
          cosmetic: {
            ...state.cosmetic,
            [slot]: cosmeticItemId,
          },
        }));

        return true;
      },

      // Remove cosmetic override (show functional item)
      clearTransmog: (slot) => {
        set(state => ({
          cosmetic: {
            ...state.cosmetic,
            [slot]: null,
          },
        }));
      },

      // Clear all cosmetic overrides
      clearAllTransmog: () => {
        set({
          cosmetic: {
            helmet: null,
            suit: null,
            backpack: null,
            tool: null,
            badge: null,
          },
        });
      },

      // Get visual item for a slot (cosmetic override or functional)
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
      setDye: (slot, color) => {
        // Validate hex color format
        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
          return false;
        }

        set(state => ({
          dyes: {
            ...state.dyes,
            [slot]: color,
          },
        }));

        return true;
      },

      // Remove dye from slot
      clearDye: (slot) => {
        set(state => ({
          dyes: {
            ...state.dyes,
            [slot]: null,
          },
        }));
      },

      // Clear all dyes
      clearAllDyes: () => {
        set({
          dyes: {
            helmet: null,
            suit: null,
            backpack: null,
            tool: null,
            badge: null,
          },
        });
      },

      // Get all visual equipment (for rendering)
      getVisualEquipment: () => {
        const slots = ['helmet', 'suit', 'backpack', 'tool', 'badge'];
        const visual = {};

        slots.forEach(slot => {
          visual[slot] = {
            item: get().getVisualItem(slot),
            dye: get().dyes[slot],
          };
        });

        return visual;
      },

      // Prestige/Rebirth system
      canPrestige: () => {
        const currentLevel = get().level;
        const currentPrestige = get().prestige || 0;

        // Prestige 0→1: Requires Level 100
        if (currentPrestige === 0 && currentLevel >= 100) return true;

        // Prestige 1→2: Requires Level 100 (again)
        if (currentPrestige === 1 && currentLevel >= 100) return true;

        // Max prestige is 2
        return false;
      },

      performPrestige: () => {
        if (!get().canPrestige()) {
          return { success: false, message: 'Not eligible for prestige' };
        }

        const currentPrestige = get().prestige || 0;
        const newPrestige = currentPrestige + 1;

        if (newPrestige > 2) {
          return { success: false, message: 'Maximum prestige level reached' };
        }

        // Reset level and XP, but keep total stats and increase prestige
        set({
          level: 1,
          xp: 0,
          currentTier: 1,
          prestige: newPrestige,
        });

        get().recalculateStats();

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

      // Reset avatar (for testing or prestige)
      resetAvatar: () => {
        set({
          level: 1,
          xp: 0,
          currentTier: 1,
          prestige: 0,
          totalLevelsEarned: 0,
          totalXPEarned: 0,
          equipped: {
            helmet: 'helmet_basic',
            suit: 'suit_basic',
            backpack: 'backpack_basic',
            tool: 'tool_scanner',
            badge: null,
          },
          unlockedEquipment: [
            'helmet_basic',
            'suit_basic',
            'backpack_basic',
            'tool_scanner',
          ],
        });
        get().recalculateStats();
      },
    }),
    {
      name: 'avatar-storage',
    }
  )
);

// Helper Functions

function getTierForLevel(level) {
  if (level >= 51) return 4;
  if (level >= 26) return 3;
  if (level >= 11) return 2;
  return 1;
}

function checkUnlockCondition(unlockCondition, progress) {
  if (!unlockCondition.module || !unlockCondition.requirement) return false;

  const moduleProgress = progress[unlockCondition.module];
  const requirement = unlockCondition.requirement;

  // Parse requirement string and check against progress
  // This is a simplified version - expand with actual logic

  if (requirement === 'complete_50_tasks') {
    return moduleProgress.tasksCompleted >= 50;
  }
  if (requirement === 'complete_200_tasks') {
    return moduleProgress.tasksCompleted >= 200;
  }
  if (requirement === 'complete_500_tasks') {
    return moduleProgress.tasksCompleted >= 500;
  }
  if (requirement === '30_workouts_completed') {
    return moduleProgress.workoutsCompleted >= 30;
  }
  if (requirement === '90_day_workout_streak') {
    return moduleProgress.workoutStreak >= 90;
  }
  if (requirement === 'finish_10_books') {
    return moduleProgress.booksCompleted >= 10;
  }
  if (requirement === 'master_5_skills') {
    return moduleProgress.skillsMastered >= 5;
  }
  if (requirement === '30_days_tracked') {
    return moduleProgress.daysTracked >= 30;
  }

  // Add more conditions as needed

  return false;
}
