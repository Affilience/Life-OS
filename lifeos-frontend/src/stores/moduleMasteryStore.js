import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';

// Mastery level calculation: Level = sqrt(XP / 100)
// Level 1 = 0 XP, Level 10 = 10,000 XP, Level 50 = 250,000 XP, Level 100 = 1,000,000 XP
export const calculateMasteryLevel = (xp) => {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)));
};

// XP needed for a specific mastery level
export const xpForMasteryLevel = (level) => {
  return level * level * 100;
};

// Module mastery stat bonuses per level
export const MODULE_MASTERY_STAT_BONUSES = {
  health: { strength: 0.5, vitality: 0.5 },
  productivity: { wisdom: 0.8, defense: 0.2 },
  knowledge: { intelligence: 0.8, wisdom: 0.2 },
  journal: { wisdom: 0.5, vitality: 0.3, intelligence: 0.2 },
  financial: { defense: 0.6, wisdom: 0.4 },
  skills: { strength: 0.2, vitality: 0.2, intelligence: 0.2, wisdom: 0.2, defense: 0.2 },
};

const DEFAULT_STATE = {
  mastery: {
    health: { lifetimeXP: 0, level: 1 },
    productivity: { lifetimeXP: 0, level: 1 },
    knowledge: { lifetimeXP: 0, level: 1 },
    journal: { lifetimeXP: 0, level: 1 },
    financial: { lifetimeXP: 0, level: 1 },
    skills: { lifetimeXP: 0, level: 1 },
  },
  _isLoading: false,
  _error: null,
};

export const useModuleMasteryStore = create(
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
            .from('user_module_mastery')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            set({
              mastery: {
                health: {
                  lifetimeXP: data.health_lifetime_xp || 0,
                  level: data.health_mastery_level || 1,
                },
                productivity: {
                  lifetimeXP: data.productivity_lifetime_xp || 0,
                  level: data.productivity_mastery_level || 1,
                },
                knowledge: {
                  lifetimeXP: data.knowledge_lifetime_xp || 0,
                  level: data.knowledge_mastery_level || 1,
                },
                journal: {
                  lifetimeXP: data.journal_lifetime_xp || 0,
                  level: data.journal_mastery_level || 1,
                },
                financial: {
                  lifetimeXP: data.financial_lifetime_xp || 0,
                  level: data.financial_mastery_level || 1,
                },
                skills: {
                  lifetimeXP: data.skills_lifetime_xp || 0,
                  level: data.skills_mastery_level || 1,
                },
              },
              _isLoading: false,
            });
          } else {
            set({ _isLoading: false });
          }
        } catch (error) {
          console.error('Failed to load module mastery:', error);
          set({ _error: error.message, _isLoading: false });
        }
      },

      // Add XP to a module (called when user earns XP in that module)
      addModuleXP: async (module, xpAmount) => {
        if (!MODULE_MASTERY_STAT_BONUSES[module]) {
          console.error('Invalid module:', module);
          return { error: 'Invalid module' };
        }

        const userId = await getCurrentUserId();
        if (!userId) return { error: 'Not logged in' };

        const { mastery } = get();
        const currentData = mastery[module];
        const newLifetimeXP = currentData.lifetimeXP + xpAmount;
        const newLevel = calculateMasteryLevel(newLifetimeXP);
        const leveledUp = newLevel > currentData.level;

        // Update local state
        set({
          mastery: {
            ...mastery,
            [module]: {
              lifetimeXP: newLifetimeXP,
              level: newLevel,
            },
          },
        });

        // Sync to Supabase
        try {
          const xpColumn = `${module}_lifetime_xp`;
          const levelColumn = `${module}_mastery_level`;

          const { error } = await supabase
            .from('user_module_mastery')
            .upsert({
              user_id: userId,
              [xpColumn]: newLifetimeXP,
              [levelColumn]: newLevel,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

          if (error) throw error;

          return {
            success: true,
            module,
            xpAdded: xpAmount,
            newLifetimeXP,
            newLevel,
            leveledUp,
          };
        } catch (error) {
          console.error('Failed to sync module mastery:', error);
          return { error: error.message };
        }
      },

      // Get mastery levels for stat calculation
      getMasteryLevels: () => {
        const { mastery } = get();
        return Object.fromEntries(
          Object.entries(mastery).map(([module, data]) => [module, data.level])
        );
      },

      // Get stat bonuses from all module mastery
      getMasteryStatBonuses: () => {
        const { mastery } = get();
        const bonuses = { strength: 0, vitality: 0, intelligence: 0, wisdom: 0, defense: 0 };

        Object.entries(mastery).forEach(([module, data]) => {
          const moduleBonus = MODULE_MASTERY_STAT_BONUSES[module];
          if (moduleBonus) {
            Object.entries(moduleBonus).forEach(([stat, perLevel]) => {
              bonuses[stat] += Math.floor(data.level * perLevel);
            });
          }
        });

        return bonuses;
      },

      // Get total mastery level (sum of all modules)
      getTotalMasteryLevel: () => {
        const { mastery } = get();
        return Object.values(mastery).reduce((sum, data) => sum + data.level, 0);
      },

      // Get mastery progress for a specific module
      getMasteryProgress: (module) => {
        const { mastery } = get();
        const data = mastery[module];
        if (!data) return null;

        const currentLevelXP = xpForMasteryLevel(data.level);
        const nextLevelXP = xpForMasteryLevel(data.level + 1);
        const progressXP = data.lifetimeXP - currentLevelXP;
        const requiredXP = nextLevelXP - currentLevelXP;
        const progress = Math.min(100, (progressXP / requiredXP) * 100);

        return {
          level: data.level,
          lifetimeXP: data.lifetimeXP,
          progressXP,
          requiredXP,
          progress,
          nextLevelXP,
        };
      },
    }),
    {
      name: 'module-mastery-storage',
      partialize: (state) => ({
        mastery: state.mastery,
      }),
    }
  )
);

export const initializeModuleMasteryStore = async () => {
  await useModuleMasteryStore.getState().initializeFromSupabase();
};

export default useModuleMasteryStore;
