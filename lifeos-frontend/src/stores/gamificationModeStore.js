/**
 * Gamification Mode Store
 *
 * Controls the presentation layer of gamification elements.
 * Always uses COSMIC mode for full RPG experience.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';

// Mode definitions - cosmic only
export const GAMIFICATION_MODES = {
  cosmic: {
    id: 'cosmic',
    name: 'Full Experience',
    description: 'Complete RPG experience with avatars, companions, equipment, and celebrations',
    icon: 'Sparkles',
  },
};

// Terminology mappings for each mode
export const TERMINOLOGY = {
  cosmic: {
    // XP & Levels
    xp: 'XP',
    level: 'Level',
    levelUp: 'Level Up!',
    experience: 'Experience',

    // Currency
    currency: 'Cosmic Credits',
    currencyShort: 'CC',
    credits: 'credits',

    // Avatar
    avatar: 'Avatar',
    evolution: 'Cosmic Evolution',
    stage: 'Stage',
    tier: 'Tier',
    prestige: 'Prestige',
    realm: 'Realm',

    // Equipment
    equipment: 'Equipment',
    inventory: 'Inventory',
    equip: 'Equip',
    unequip: 'Unequip',
    rarity: 'Rarity',
    stats: 'Stats',

    // Rarity names
    rarityCommon: 'Common',
    rarityUncommon: 'Uncommon',
    rarityRare: 'Rare',
    rarityEpic: 'Epic',
    rarityLegendary: 'Legendary',

    // Pets
    pets: 'Companions',
    petCodex: 'Pet Codex',
    companion: 'Companion',
    activeCompanions: 'Active Companions',

    // Skills
    skillTree: 'Skill Constellation',
    perk: 'Perk',
    perks: 'Perks',

    // Progress
    streak: 'Streak',
    streakShield: 'Streak Shield',
    quest: 'Quest',
    mission: 'Mission',
    achievement: 'Achievement',
    milestone: 'Milestone',

    // Stats
    strength: 'Strength',
    vitality: 'Vitality',
    intelligence: 'Intelligence',
    wisdom: 'Wisdom',
    defense: 'Defense',

    // Prestige names
    prestigeRealm0: 'Mortal Realm',
    prestigeRealm1: 'Cosmic Ascension',
    prestigeRealm2: 'Transcendent',
  },
};

// Visibility settings for each mode
export const VISIBILITY = {
  cosmic: {
    showAvatar: true,
    showAvatarEffects: true,
    showPets: true,
    showPetSprites: true,
    showEquipment: true,
    showEquipmentEffects: true,
    showSkillTree: true,
    showConstellationEffects: true,
    showXPBar: true,
    showLevel: true,
    showStreaks: true,
    showStreakFlame: true,
    showAchievementPopups: true,
    showLevelUpAnimation: true,
    showParticleEffects: true,
    showRarityGlow: true,
    showEvolutionGallery: true, // Full RPG evolution showcase
    showBazaar: true, // Fantasy marketplace
    showCharacterPage: true, // Full character page with avatar
  },
};

// Avatar stage name mappings
export const AVATAR_STAGE_NAMES = {
  cosmic: [
    // Act I
    'Dreamer', 'Seeker', 'Recruit', 'Trainee', 'Squire',
    'Initiate', 'Footman', 'Scout', 'Warrior', 'Swordsman',
    // Act II
    'Duelist', 'Berserker', 'Knight', 'Ranger', 'Paladin',
    'Monk', 'Assassin', 'Battlemage', 'Champion', 'Veteran',
    // Act III
    'Blade Master', 'War Chief', 'Dragon Knight', 'Shadow Master', 'Holy Crusader',
    'Arcane Warrior', 'Beast Master', 'Demon Hunter', 'Storm Lord', 'Warlord',
    // Act IV
    'Sword Saint', 'Phoenix Knight', 'Void Stalker', 'Celestial Guardian', 'Titan Slayer',
    'Elemental Lord', 'Immortal Champion', 'Godslayer', 'Ascendant', 'Avatar of Mastery',
  ],
};

// Equipment name mappings
export const EQUIPMENT_NAMES = {
  cosmic: {
    // Helmets
    helmet_basic: 'Basic Helmet',
    helmet_iron: 'Iron Helm',
    helmet_hud: 'HUD Interface',
    helmet_neural: 'Neural Interface',
    helmet_omniscient: 'Omniscient Crown',
    // Suits
    suit_basic: 'Basic Space Suit',
    suit_reinforced: 'Reinforced Suit',
    suit_biometric: 'Biometric Suit',
    suit_adaptive: 'Adaptive Exo-Suit',
    suit_cosmic: 'Cosmic Harmonizer',
    // Backpacks
    backpack_basic: 'Standard Oxygen Tank',
    backpack_endurance: 'Endurance Booster',
    backpack_quantum: 'Quantum Storage',
    backpack_universe: 'Universe Mapper',
    // Tools
    tool_scanner: 'Basic Scanner',
    tool_tablet: 'Data Tablet',
    tool_planner: 'Quantum Planner',
    tool_predictor: 'Value Predictor',
    tool_dilation: 'Time Dilation',
    tool_analyzer: 'Omniscient Analyzer',
    // Badges
    badge_productivity: 'Productivity Master Badge',
    badge_performance: 'Peak Performance Badge',
    badge_scholar: 'Scholar Emblem',
    badge_cosmic: 'Cosmic Achievement Medal',
  },
};

// Pet name mappings
export const PET_NAMES = {
  cosmic: {
    kitsune_pup: 'Kitsune Pup',
    imp: 'Imp',
    scarab: 'Scarab',
    griffin_chick: 'Griffin Chick',
    tanuki: 'Tanuki',
    domovoi: 'Domovoi',
    azure_dragon: 'Azure Dragon',
    pegasus: 'Pegasus',
    anubis_jackal: 'Anubis Jackal',
    nine_tailed_kitsune: 'Nine-Tailed Kitsune',
    phoenix: 'Phoenix',
    fenghuang: 'Fenghuang',
    fenrir_pup: 'Fenrir Pup',
    jormungandr: 'Jörmungandr',
    leviathan: 'Leviathan',
  },
};

// Create the store
export const useGamificationModeStore = create(
  persist(
    (set, get) => ({
      // Current mode
      mode: 'cosmic',

      // Individual visibility overrides (for granular control)
      visibilityOverrides: {},

      // Sync status
      _isSyncing: false,

      // Initialize from Supabase
      initializeFromSupabase: async (passedUserId = null) => {
        // Master timeout to prevent hanging
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
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
            return;
          }

          const { data } = await withTimeout(
            supabase
              .from('user_profiles')
              .select('preferences')
              .eq('id', userId)
              .maybeSingle()
          );

          if (data?.preferences?.gamificationMode) {
            const modePrefs = data.preferences.gamificationMode;
            set({
              mode: modePrefs.mode || 'cosmic',
              visibilityOverrides: modePrefs.visibilityOverrides || {},
            });
          }
          console.log('[GamificationModeStore] ✅ Initialized');
        } catch (error) {
          console.error('[GamificationModeStore] ❌ Error initializing:', error);
        } finally {
          clearTimeout(timeoutId);
        }
      },

      // Sync to Supabase
      syncToSupabase: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const state = get();
        if (state._isSyncing) return;

        set({ _isSyncing: true });

        try {
          // Get existing preferences to merge
          const { data: existing } = await supabase
            .from('user_profiles')
            .select('preferences')
            .eq('id', userId)
            .maybeSingle();

          const existingPrefs = existing?.preferences || {};

          await supabase
            .from('user_profiles')
            .update({
              preferences: {
                ...existingPrefs,
                gamificationMode: {
                  mode: state.mode,
                  visibilityOverrides: state.visibilityOverrides,
                },
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        } catch (error) {
          console.error('Error syncing gamification mode to Supabase:', error);
        } finally {
          set({ _isSyncing: false });
        }
      },

      // Actions
      setMode: () => {
        // Always use cosmic mode
        set({ mode: 'cosmic', visibilityOverrides: {} });
        // Sync to Supabase
        get().syncToSupabase();
      },

      // Toggle individual visibility setting
      toggleVisibility: (key) => {
        const currentMode = get().mode;
        const defaultValue = VISIBILITY[currentMode][key];
        const overrides = get().visibilityOverrides;
        const currentValue = overrides[key] ?? defaultValue;

        set({
          visibilityOverrides: {
            ...overrides,
            [key]: !currentValue,
          },
        });
        // Sync to Supabase
        get().syncToSupabase();
      },

      // Set specific visibility
      setVisibility: (key, value) => {
        set({
          visibilityOverrides: {
            ...get().visibilityOverrides,
            [key]: value,
          },
        });
        // Sync to Supabase
        get().syncToSupabase();
      },

      // Reset visibility to mode defaults
      resetVisibility: () => {
        set({ visibilityOverrides: {} });
        // Sync to Supabase
        get().syncToSupabase();
      },

      // Get term based on current mode
      getTerm: (key) => {
        const mode = get().mode;
        const modeTerms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
        return modeTerms[key] || TERMINOLOGY.cosmic[key] || key;
      },

      // Get visibility setting (with override support)
      isVisible: (key) => {
        const mode = get().mode;
        const overrides = get().visibilityOverrides;
        const modeVisibility = VISIBILITY[mode] || VISIBILITY.cosmic;
        return overrides[key] ?? modeVisibility[key] ?? true;
      },

      // Get all visibility settings for current mode
      getVisibilitySettings: () => {
        const mode = get().mode;
        const overrides = get().visibilityOverrides;
        const modeVisibility = VISIBILITY[mode] || VISIBILITY.cosmic;
        return {
          ...modeVisibility,
          ...overrides,
        };
      },

      // Get avatar stage name for current mode
      getAvatarStageName: (stageIndex) => {
        const mode = get().mode;
        const names = AVATAR_STAGE_NAMES[mode] || AVATAR_STAGE_NAMES.cosmic;
        const index = Math.max(0, Math.min(stageIndex || 0, names.length - 1));
        return names[index] || names[0] || 'Adventurer';
      },

      // Get equipment name for current mode
      getEquipmentName: (equipmentId) => {
        const mode = get().mode;
        const modeNames = EQUIPMENT_NAMES[mode] || EQUIPMENT_NAMES.cosmic;
        return modeNames[equipmentId] || EQUIPMENT_NAMES.cosmic[equipmentId] || equipmentId;
      },

      // Get pet name for current mode
      getPetName: (petId) => {
        const mode = get().mode;
        const modeNames = PET_NAMES[mode] || PET_NAMES.cosmic;
        return modeNames[petId] || PET_NAMES.cosmic[petId] || petId;
      },

      // Get rarity name for current mode
      getRarityName: (rarity) => {
        const mode = get().mode;
        const key = `rarity${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`;
        const modeTerms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
        return modeTerms[key] || rarity;
      },

      // Check if in a specific mode
      isMode: (mode) => get().mode === mode,

      // Check if cosmic mode (full gamification) - always true now
      isCosmic: () => true,

      // Check if minimal mode - always false now (minimal mode removed)
      isMinimal: () => false,
    }),
    {
      name: 'gamification-mode-storage',
    }
  )
);

// Hook for getting terminology
export const useGamificationTerm = (key) => {
  const getTerm = useGamificationModeStore((state) => state.getTerm);
  return getTerm(key);
};

// Hook for checking visibility
export const useGamificationVisibility = (key) => {
  const isVisible = useGamificationModeStore((state) => state.isVisible);
  return isVisible(key);
};

// Hook for getting current mode
export const useGamificationMode = () => {
  return useGamificationModeStore((state) => state.mode);
};

// Initialize gamification mode store from Supabase
export const initializeGamificationModeStore = async (userId = null) => {
  await useGamificationModeStore.getState().initializeFromSupabase(userId);
};
