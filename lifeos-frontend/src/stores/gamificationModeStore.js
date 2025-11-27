/**
 * Gamification Mode Store
 *
 * Controls the presentation layer of gamification elements without affecting
 * the underlying progression mechanics. Three modes available:
 *
 * - COSMIC: Full RPG experience with pixel art, fantasy names, pets
 * - PROFESSIONAL: Same mechanics with neutral, business-friendly terminology
 * - MINIMAL: Data-focused view with hidden game elements (bonuses still apply)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mode definitions
export const GAMIFICATION_MODES = {
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic',
    description: 'Full RPG experience with avatars, pets, and fantasy elements',
    icon: 'Sparkles',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Clean progress tracking with business-friendly terminology',
    icon: 'Briefcase',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Data-focused view with hidden game elements',
    icon: 'BarChart2',
  },
};

// Terminology mappings for Professional mode
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

    // Avatar
    avatar: 'Avatar',
    evolution: 'Evolution',
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
  professional: {
    // XP & Levels
    xp: 'Points',
    level: 'Milestone',
    levelUp: 'Milestone Reached!',
    experience: 'Progress',

    // Currency
    currency: 'Progress Points',
    currencyShort: 'PP',

    // Avatar
    avatar: 'Profile',
    evolution: 'Growth Stage',
    tier: 'Level',
    prestige: 'Mastery',
    realm: 'Stage',

    // Equipment
    equipment: 'Boosters',
    inventory: 'Booster Library',
    equip: 'Activate',
    unequip: 'Deactivate',
    rarity: 'Tier',
    stats: 'Metrics',

    // Rarity names
    rarityCommon: 'Basic',
    rarityUncommon: 'Standard',
    rarityRare: 'Advanced',
    rarityEpic: 'Premium',
    rarityLegendary: 'Elite',

    // Pets
    pets: 'Focus Boosters',
    petCodex: 'Booster Catalog',
    companion: 'Booster',
    activeCompanions: 'Active Boosters',

    // Skills
    skillTree: 'Growth Map',
    perk: 'Skill',
    perks: 'Skills',

    // Progress
    streak: 'Consistency',
    streakShield: 'Buffer Day',
    quest: 'Goal',
    mission: 'Objective',
    achievement: 'Accomplishment',
    milestone: 'Milestone',

    // Stats
    strength: 'Physical',
    vitality: 'Energy',
    intelligence: 'Learning',
    wisdom: 'Focus',
    defense: 'Resilience',

    // Prestige names
    prestigeRealm0: 'Foundation',
    prestigeRealm1: 'Advanced',
    prestigeRealm2: 'Expert',
  },
  minimal: {
    // Same as professional but even more neutral
    xp: 'Points',
    level: 'Level',
    levelUp: 'New Level',
    experience: 'Progress',

    currency: 'Points',
    currencyShort: 'pts',

    avatar: 'Profile',
    evolution: 'Stage',
    tier: 'Level',
    prestige: 'Tier',
    realm: 'Tier',

    equipment: 'Bonuses',
    inventory: 'Bonuses',
    equip: 'Enable',
    unequip: 'Disable',
    rarity: 'Level',
    stats: 'Stats',

    rarityCommon: 'Level 1',
    rarityUncommon: 'Level 2',
    rarityRare: 'Level 3',
    rarityEpic: 'Level 4',
    rarityLegendary: 'Level 5',

    pets: 'Bonuses',
    petCodex: 'Bonus List',
    companion: 'Bonus',
    activeCompanions: 'Active Bonuses',

    skillTree: 'Skills',
    perk: 'Skill',
    perks: 'Skills',

    streak: 'Streak',
    streakShield: 'Grace Day',
    quest: 'Task',
    mission: 'Task',
    achievement: 'Complete',
    milestone: 'Level',

    strength: 'Physical',
    vitality: 'Energy',
    intelligence: 'Mental',
    wisdom: 'Focus',
    defense: 'Consistency',

    prestigeRealm0: 'Tier 1',
    prestigeRealm1: 'Tier 2',
    prestigeRealm2: 'Tier 3',
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
  },
  professional: {
    showAvatar: true,
    showAvatarEffects: false, // No particle effects
    showPets: true,
    showPetSprites: false, // Show as icons instead
    showEquipment: true,
    showEquipmentEffects: false, // No glow effects
    showSkillTree: true,
    showConstellationEffects: false, // Simplified view
    showXPBar: true,
    showLevel: true,
    showStreaks: true,
    showStreakFlame: false, // Show as number only
    showAchievementPopups: true,
    showLevelUpAnimation: false, // Subtle notification instead
    showParticleEffects: false,
    showRarityGlow: false,
  },
  minimal: {
    showAvatar: false,
    showAvatarEffects: false,
    showPets: false, // Hidden but bonuses apply
    showPetSprites: false,
    showEquipment: false, // Hidden but bonuses apply
    showEquipmentEffects: false,
    showSkillTree: true, // Show as simple list
    showConstellationEffects: false,
    showXPBar: true,
    showLevel: true,
    showStreaks: true,
    showStreakFlame: false,
    showAchievementPopups: false, // Silent
    showLevelUpAnimation: false,
    showParticleEffects: false,
    showRarityGlow: false,
  },
};

// Avatar stage name mappings (Cosmic -> Professional)
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
  professional: [
    // Act I - Foundation
    'Beginner', 'Explorer', 'Learner', 'Developing', 'Growing',
    'Establishing', 'Building', 'Progressing', 'Advancing', 'Improving',
    // Act II - Development
    'Capable', 'Dedicated', 'Skilled', 'Versatile', 'Balanced',
    'Focused', 'Efficient', 'Strategic', 'Accomplished', 'Experienced',
    // Act III - Mastery
    'Specialist', 'Leader', 'Expert', 'Refined', 'Distinguished',
    'Innovative', 'Influential', 'High Achiever', 'Peak Performer', 'Elite',
    // Act IV - Excellence
    'Master', 'Virtuoso', 'Luminary', 'Visionary', 'Trailblazer',
    'Pioneer', 'Legendary', 'Transcendent', 'Ultimate', 'Perfected',
  ],
  minimal: [
    // Simple numbered stages
    ...Array.from({ length: 40 }, (_, i) => `Stage ${i + 1}`),
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
  professional: {
    // Helmets
    helmet_basic: 'Focus Aid',
    helmet_iron: 'Concentration Boost',
    helmet_hud: 'Analytics Display',
    helmet_neural: 'Cognitive Enhancer',
    helmet_omniscient: 'Master Focus',
    // Suits
    suit_basic: 'Basic Wellness',
    suit_reinforced: 'Enhanced Wellness',
    suit_biometric: 'Health Monitor',
    suit_adaptive: 'Adaptive Performance',
    suit_cosmic: 'Peak Optimization',
    // Backpacks
    backpack_basic: 'Basic Storage',
    backpack_endurance: 'Stamina Boost',
    backpack_quantum: 'Capacity Expander',
    backpack_universe: 'Full Overview',
    // Tools
    tool_scanner: 'Basic Tracker',
    tool_tablet: 'Data Manager',
    tool_planner: 'Advanced Planner',
    tool_predictor: 'Trend Analyzer',
    tool_dilation: 'Time Optimizer',
    tool_analyzer: 'Complete Analytics',
    // Badges
    badge_productivity: 'Productivity Award',
    badge_performance: 'Performance Award',
    badge_scholar: 'Learning Award',
    badge_cosmic: 'Excellence Award',
  },
  minimal: {
    // Generic names
    helmet_basic: 'Focus +1',
    helmet_iron: 'Focus +2',
    helmet_hud: 'Focus +3',
    helmet_neural: 'Focus +4',
    helmet_omniscient: 'Focus +5',
    suit_basic: 'Vitality +1',
    suit_reinforced: 'Vitality +2',
    suit_biometric: 'Vitality +3',
    suit_adaptive: 'Vitality +4',
    suit_cosmic: 'Vitality +5',
    backpack_basic: 'Storage +1',
    backpack_endurance: 'Stamina +2',
    backpack_quantum: 'Capacity +3',
    backpack_universe: 'Overview +4',
    tool_scanner: 'Tracking +1',
    tool_tablet: 'Data +2',
    tool_planner: 'Planning +3',
    tool_predictor: 'Analysis +4',
    tool_dilation: 'Time +4',
    tool_analyzer: 'Analytics +5',
    badge_productivity: 'Award A',
    badge_performance: 'Award B',
    badge_scholar: 'Award C',
    badge_cosmic: 'Award D',
  },
};

// Pet name mappings (only shown in Professional mode as boosters)
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
  professional: {
    kitsune_pup: 'Learning Boost',
    imp: 'Task Completion Boost',
    scarab: 'Workout Boost',
    griffin_chick: 'Focus Session Boost',
    tanuki: 'Skill Practice Boost',
    domovoi: 'Reflection Boost',
    azure_dragon: 'Time Management Boost',
    pegasus: 'Creative Project Boost',
    anubis_jackal: 'Study Session Boost',
    nine_tailed_kitsune: 'All Learning Boost',
    phoenix: 'Universal Boost',
    fenghuang: 'Multi-Module Boost',
    fenrir_pup: 'Achievement Boost',
    jormungandr: 'Weekly Completion Boost',
    leviathan: 'Mastery Boost',
  },
  minimal: {
    kitsune_pup: '+5% Learning',
    imp: '+5% Tasks',
    scarab: '+5% Fitness',
    griffin_chick: '+10% Focus',
    tanuki: '+10% Skills',
    domovoi: '+10% Reflection',
    azure_dragon: '+15% Time',
    pegasus: '+15% Projects',
    anubis_jackal: '+15% Study',
    nine_tailed_kitsune: '+20% Learning',
    phoenix: '+10% All',
    fenghuang: '+15% Multi',
    fenrir_pup: '+25% Achievement',
    jormungandr: '+20% Weekly',
    leviathan: '+30% Mastery',
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

      // Actions
      setMode: (mode) => {
        if (GAMIFICATION_MODES[mode]) {
          set({ mode, visibilityOverrides: {} });
        }
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
      },

      // Set specific visibility
      setVisibility: (key, value) => {
        set({
          visibilityOverrides: {
            ...get().visibilityOverrides,
            [key]: value,
          },
        });
      },

      // Reset visibility to mode defaults
      resetVisibility: () => {
        set({ visibilityOverrides: {} });
      },

      // Get term based on current mode
      getTerm: (key) => {
        const mode = get().mode;
        return TERMINOLOGY[mode][key] || TERMINOLOGY.cosmic[key] || key;
      },

      // Get visibility setting (with override support)
      isVisible: (key) => {
        const mode = get().mode;
        const overrides = get().visibilityOverrides;
        return overrides[key] ?? VISIBILITY[mode][key] ?? true;
      },

      // Get all visibility settings for current mode
      getVisibilitySettings: () => {
        const mode = get().mode;
        const overrides = get().visibilityOverrides;
        return {
          ...VISIBILITY[mode],
          ...overrides,
        };
      },

      // Get avatar stage name for current mode
      getAvatarStageName: (stageIndex) => {
        const mode = get().mode;
        const names = AVATAR_STAGE_NAMES[mode];
        return names[stageIndex] || names[names.length - 1];
      },

      // Get equipment name for current mode
      getEquipmentName: (equipmentId) => {
        const mode = get().mode;
        return EQUIPMENT_NAMES[mode][equipmentId] || EQUIPMENT_NAMES.cosmic[equipmentId] || equipmentId;
      },

      // Get pet name for current mode
      getPetName: (petId) => {
        const mode = get().mode;
        return PET_NAMES[mode][petId] || PET_NAMES.cosmic[petId] || petId;
      },

      // Get rarity name for current mode
      getRarityName: (rarity) => {
        const mode = get().mode;
        const key = `rarity${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`;
        return TERMINOLOGY[mode][key] || rarity;
      },

      // Check if in a specific mode
      isMode: (mode) => get().mode === mode,

      // Check if cosmic mode (full gamification)
      isCosmic: () => get().mode === 'cosmic',

      // Check if professional mode
      isProfessional: () => get().mode === 'professional',

      // Check if minimal mode
      isMinimal: () => get().mode === 'minimal',
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
