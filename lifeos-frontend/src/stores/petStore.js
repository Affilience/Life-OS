/**
 * Pet Store - State Management for Mythological Companions
 * Handles pet collection, active pets, and unlock system
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';

// Lazy store imports to avoid circular dependencies
// These are resolved at runtime when checkUnlocks is called
let avatarStoreRef = null;
let achievementsStoreRef = null;
let perkStoreRef = null;
let gamificationStoreRef = null;
let unlockNotificationStoreRef = null;

const getAvatarStore = () => {
  if (!avatarStoreRef) {
    avatarStoreRef = import('./avatarStore').then(m => m.useAvatarStore);
  }
  return avatarStoreRef;
};

const getAchievementsStore = () => {
  if (!achievementsStoreRef) {
    achievementsStoreRef = import('./achievementsStore').then(m => m.default);
  }
  return achievementsStoreRef;
};

const getPerkStore = () => {
  if (!perkStoreRef) {
    perkStoreRef = import('./perkStore').then(m => m.default);
  }
  return perkStoreRef;
};

const getGamificationStore = () => {
  if (!gamificationStoreRef) {
    gamificationStoreRef = import('./gamificationStore').then(m => m.default);
  }
  return gamificationStoreRef;
};

const getUnlockNotificationStore = async () => {
  if (!unlockNotificationStoreRef) {
    const module = await import('./unlockNotificationStore');
    unlockNotificationStoreRef = module.useUnlockNotificationStore;
  }
  return unlockNotificationStoreRef;
};

// DEV MODE: Set to true to unlock all pets automatically during development
export const DEV_UNLOCK_ALL_PETS = false;

// Unlock method types
export const UNLOCK_METHODS = {
  LEVEL: 'level',
  ACHIEVEMENT: 'achievement',
  SKILL_TREE: 'skill_tree',
  BAZAAR: 'bazaar',
};

// Pet database with all available pets
export const PET_DATABASE = {
  // COMMON TIER
  common_kitsune_pup: {
    id: 'common_kitsune_pup',
    name: 'Kitsune Pup',
    tier: 'common',
    culture: 'Japanese',
    sprite: '/assets/pets/pet_kitsune_pup.png',
    description: 'A baby fox spirit with mystical blue eyes and a single fluffy tail',
    lore: 'Young kitsune are playful and curious, learning to harness their magical abilities. They bring luck and wisdom to those they befriend.',
    bonusType: 'learning',
    bonusAmount: 5,
    bonusDescription: '+5% Learning XP',
    // Unlock via notes_50 achievement (moved from first_book which has wind_slash ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'notes_50', fallbackStat: 'notesCreated', fallbackTarget: 50 },
    unlockDescription: 'Create 50 notes',
  },
  common_imp: {
    id: 'common_imp',
    name: 'Imp',
    tier: 'common',
    culture: 'European',
    sprite: '/assets/pets/pet_imp.png',
    description: 'A mischievous familiar with bat wings and an impish grin',
    lore: 'These tiny demons are tireless workers, never sleeping and always eager to help. Their mischievous nature keeps things interesting.',
    bonusType: 'productivity',
    bonusAmount: 5,
    bonusDescription: '+5% Task Completion XP',
    // Unlock via first_project achievement (moved from first_quest which has lightning_strike ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'first_project', fallbackStat: 'projectsCompleted', fallbackTarget: 1 },
    unlockDescription: 'Complete your first project',
  },
  common_scarab: {
    id: 'common_scarab',
    name: 'Scarab',
    tier: 'common',
    culture: 'Egyptian',
    sprite: '/assets/pets/pet_scarab.png',
    description: 'A sacred beetle with a glowing golden shell and hieroglyphic patterns',
    lore: 'Sacred to the ancient Egyptians, scarabs represent transformation and rebirth. They guide travelers through difficult journeys.',
    bonusType: 'health',
    bonusAmount: 5,
    bonusDescription: '+5% Workout XP',
    // Unlock via volume_10k achievement (moved from first_workout which has rock_throw ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'volume_10k', fallbackStat: 'totalVolume', fallbackTarget: 10000 },
    unlockDescription: 'Lift 10,000 lbs total volume',
  },

  // UNCOMMON TIER
  uncommon_griffin_chick: {
    id: 'uncommon_griffin_chick',
    name: 'Griffin Chick',
    tier: 'uncommon',
    culture: 'Greek',
    sprite: '/assets/pets/pet_griffin_chick.png',
    description: 'A young eagle-lion hybrid with fluffy downy feathers',
    lore: 'Noble guardians in training, griffin chicks are fiercely loyal. They represent discipline and honor in all pursuits.',
    bonusType: 'productivity',
    bonusAmount: 10,
    bonusDescription: '+10% Focus Session XP',
    // Unlock via cardio_sessions_25 achievement (moved from one_week which has inferno ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'cardio_sessions_25', fallbackStat: 'cardioSessions', fallbackTarget: 25 },
    unlockDescription: 'Complete 25 cardio sessions',
  },
  uncommon_tanuki: {
    id: 'uncommon_tanuki',
    name: 'Tanuki',
    tier: 'uncommon',
    culture: 'Japanese',
    sprite: '/assets/pets/pet_tanuki.png',
    description: 'A shapeshifting raccoon dog with a magical leaf on its head',
    lore: 'Masters of transformation and adaptability, tanuki teach us to embrace change. They bring joy and flexibility to rigid routines.',
    bonusType: 'learning',
    bonusAmount: 10,
    bonusDescription: '+10% Skill Practice XP',
    // Unlock via volume_100k achievement (moved from workout_50 which has power_buff ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'volume_100k', fallbackStat: 'totalVolume', fallbackTarget: 100000 },
    unlockDescription: 'Lift 100,000 lbs total volume',
  },
  uncommon_domovoi: {
    id: 'uncommon_domovoi',
    name: 'Domovoi',
    tier: 'uncommon',
    culture: 'Slavic',
    sprite: '/assets/pets/pet_domovoi.png',
    description: 'An elderly bearded household spirit with a protective presence',
    lore: 'Ancient protectors of the hearth, domovoi watch over homes and families. They reward consistency and care for living spaces.',
    bonusType: 'journal',
    bonusAmount: 10,
    bonusDescription: '+10% Reflection Bonus',
    // Unlock via notes_200 achievement (moved from bookworm which has tornado ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'notes_200', fallbackStat: 'notesCreated', fallbackTarget: 200 },
    unlockDescription: 'Create 200 notes',
  },

  // RARE TIER
  rare_azure_dragon: {
    id: 'rare_azure_dragon',
    name: 'Azure Dragon',
    tier: 'rare',
    culture: 'Chinese',
    sprite: '/assets/pets/pet_azure_dragon.png',
    description: 'An Eastern dragon with brilliant cyan scales representing spring',
    lore: 'Guardian of the East and herald of spring, the Azure Dragon brings renewal and growth. It masters the flow of time itself.',
    bonusType: 'time',
    bonusAmount: 15,
    bonusDescription: '+15% Time Management XP',
    // Unlock via journal_50 achievement (moved from level_25 which has earthquake ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'journal_50', fallbackStat: 'journalEntries', fallbackTarget: 50 },
    unlockDescription: 'Write 50 journal entries',
  },
  rare_pegasus: {
    id: 'rare_pegasus',
    name: 'Pegasus',
    tier: 'rare',
    culture: 'Greek',
    sprite: '/assets/pets/pet_pegasus.png',
    description: 'A divine winged horse with pure white coat and majestic wings',
    lore: 'Born from Medusa and Poseidon, Pegasus represents creative flight and divine inspiration. Those who ride with Pegasus touch the heavens.',
    bonusType: 'creativity',
    bonusAmount: 15,
    bonusDescription: '+15% Creative Project XP',
    // Unlock via workout_100 achievement (no ability conflict)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'workout_100', fallbackStat: 'workoutsCompleted', fallbackTarget: 100 },
    unlockDescription: 'Complete 100 workouts',
  },
  rare_anubis_jackal: {
    id: 'rare_anubis_jackal',
    name: 'Anubis Jackal',
    tier: 'rare',
    culture: 'Egyptian',
    sprite: '/assets/pets/pet_anubis_jackal.png',
    description: 'A divine jackal guide with glowing golden eyes',
    lore: 'Guide of souls and protector of the dead, Anubis ensures safe passage through transitions. He weighs hearts against truth.',
    bonusType: 'wisdom',
    bonusAmount: 15,
    bonusDescription: '+15% Study Session XP',
    // Unlock via deep_work_1000 achievement (moved from deep_work_100 which has dark_tendrils ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'deep_work_1000', fallbackStat: 'deepWorkHours', fallbackTarget: 1000 },
    unlockDescription: 'Log 1,000 deep work hours',
  },

  // EPIC TIER
  epic_nine_tailed_kitsune: {
    id: 'epic_nine_tailed_kitsune',
    name: 'Nine-Tailed Kitsune',
    tier: 'epic',
    culture: 'Japanese',
    sprite: '/assets/pets/pet_nine_tailed_kitsune.png',
    description: 'An ancient fox spirit with nine flowing tails and ethereal white-gold fur',
    lore: 'After living for a thousand years, kitsune grow nine tails and achieve enlightenment. They possess immeasurable wisdom and power.',
    bonusType: 'universal',
    bonusAmount: 20,
    bonusDescription: '+20% All Learning XP',
    // Unlock via total_activities_1000 achievement (moved from task_500 which has thunder_storm ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'total_activities_1000', fallbackStat: 'totalActivities', fallbackTarget: 1000 },
    unlockDescription: 'Complete 1,000 total activities',
  },
  epic_phoenix: {
    id: 'epic_phoenix',
    name: 'Phoenix',
    tier: 'epic',
    culture: 'Greek',
    sprite: '/assets/pets/pet_phoenix.png',
    description: 'An immortal fire bird with brilliant red-orange-gold plumage',
    lore: 'Death is but a transformation for the phoenix. Rising from its own ashes, it embodies eternal renewal and the power of rebirth.',
    bonusType: 'universal',
    bonusAmount: 10,
    bonusDescription: '+10% XP to All Modules',
    // Unlock via early_riser_streak achievement (moved from perfect_workout_week which has stone_spike ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'early_riser_streak', fallbackStat: 'earlyRiserDays', fallbackTarget: 30 },
    unlockDescription: 'Complete 30 days of early morning activities',
  },
  epic_fenghuang: {
    id: 'epic_fenghuang',
    name: 'Fenghuang',
    tier: 'epic',
    culture: 'Chinese',
    sprite: '/assets/pets/pet_fenghuang.png',
    description: 'The Chinese phoenix empress with rainbow iridescent plumage',
    lore: 'Ruler of all birds and symbol of the empress, Fenghuang appears only in times of peace and prosperity. She brings harmony to chaos.',
    bonusType: 'balance',
    bonusAmount: 15,
    bonusDescription: '+15% XP when all modules active',
    // Unlock via life_optimizer achievement (all modules in one day - no ability conflict)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'life_optimizer' },
    unlockDescription: 'Complete all modules in one day',
  },

  // MYTHIC TIER
  mythic_fenrir_pup: {
    id: 'mythic_fenrir_pup',
    name: 'Fenrir Pup',
    tier: 'mythic',
    culture: 'Norse',
    sprite: '/assets/pets/pet_fenrir_pup.png',
    description: 'Young wolf destined to bring Ragnarok, with ancient eyes and runic patterns',
    lore: 'Son of Loki, fated to devour Odin at Ragnarok. Even as a pup, Fenrir possesses world-ending power, barely contained by ancient chains.',
    bonusType: 'power',
    bonusAmount: 25,
    bonusDescription: '+25% Achievement XP',
    // Unlock via six_months achievement (moved from level_50 which has landslide ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'six_months' },
    unlockDescription: 'Use the app for 6 months',
  },
  mythic_jormungandr: {
    id: 'mythic_jormungandr',
    name: 'Jörmungandr',
    tier: 'mythic',
    culture: 'Norse',
    sprite: '/assets/pets/pet_jormungandr.png',
    description: 'The World Serpent coiled in infinity, with ocean-blue scales and ancient runes',
    lore: 'So vast it encircles the world, biting its own tail. When Jörmungandr releases its grip, Ragnarok begins. It represents the eternal cycle.',
    bonusType: 'completion',
    bonusAmount: 20,
    bonusDescription: '+20% XP on weekly completion',
    // Unlock via streak_365 achievement (no ability conflict)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'streak_365', fallbackStat: 'longestStreak', fallbackTarget: 365 },
    unlockDescription: '365-day streak',
  },
  mythic_leviathan: {
    id: 'mythic_leviathan',
    name: 'Leviathan',
    tier: 'mythic',
    culture: 'Hebrew',
    sprite: '/assets/pets/pet_leviathan.png',
    description: 'Primordial sea serpent with dark purple scales and bioluminescent patterns',
    lore: 'Chaos incarnate, created on the fifth day. Leviathan rules the deepest oceans, representing forces beyond mortal comprehension.',
    bonusType: 'mastery',
    bonusAmount: 30,
    bonusDescription: '+30% XP when mastering new skills',
    // Unlock via total_activities_5000 achievement (moved from balanced_week which has greater_heal ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'total_activities_5000', fallbackStat: 'totalActivities', fallbackTarget: 5000 },
    unlockDescription: 'Complete 5,000 total activities',
  },

  // ====================================
  // NEW PETS - Generated with PixelLab
  // ====================================

  // COMMON TIER - New Companions
  common_pixie: {
    id: 'common_pixie',
    name: 'Pixie',
    tier: 'common',
    culture: 'Celtic',
    sprite: '/assets/pets/pet_pixie.png',
    description: 'Tiny glowing fairy sprite with butterfly wings',
    lore: 'Celtic pixies are nature spirits who guide lost travelers through forests. They bring creativity and inspiration to those they befriend.',
    bonusType: 'creativity',
    bonusAmount: 5,
    bonusDescription: '+5% Journal XP',
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'quest_novice' },
    unlockDescription: 'Complete "Quest Novice" achievement',
  },
  common_foo_pup: {
    id: 'common_foo_pup',
    name: 'Foo Dog Pup',
    tier: 'common',
    culture: 'Chinese',
    sprite: '/assets/pets/pet_foo_pup.png',
    description: 'Baby Chinese guardian lion dog with fluffy golden mane',
    lore: 'Guardian lions protect homes and temples from evil spirits. As pups, they are playful yet fiercely loyal to their companions.',
    bonusType: 'focus',
    bonusAmount: 5,
    bonusDescription: '+5% Focus Session XP',
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'deep_work_1' },
    unlockDescription: 'Complete first deep work session',
  },
  common_will_o_wisp: {
    id: 'common_will_o_wisp',
    name: "Will-o'-Wisp",
    tier: 'common',
    culture: 'Celtic',
    sprite: '/assets/pets/pet_will_o_wisp.png',
    description: 'Floating ghostly flame spirit with an ethereal glow',
    lore: 'These mysterious lights were once thought to lead travelers astray, but befriended wisps guide you toward your true path.',
    bonusType: 'streak',
    bonusAmount: 5,
    bonusDescription: '+5% Streak Bonus',
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'journal_10' },
    unlockDescription: 'Write 10 journal entries',
  },

  // UNCOMMON TIER - New Companions
  uncommon_thunderbird: {
    id: 'uncommon_thunderbird',
    name: 'Thunderbird Chick',
    tier: 'uncommon',
    culture: 'Native American',
    sprite: '/assets/pets/pet_thunderbird.png',
    description: 'Baby thunderbird eagle with lightning patterns on feathers',
    lore: 'Sacred to many indigenous nations, thunderbirds control the weather. Their presence signals divine favor and powerful change.',
    bonusType: 'productivity',
    bonusAmount: 10,
    bonusDescription: '+10% Deep Work XP',
    // Unlock via marathon_session achievement (moved from deep_work_10 which has ice_beam ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'marathon_session' },
    unlockDescription: 'Complete a marathon deep work session (4+ hours)',
  },
  uncommon_selkie: {
    id: 'uncommon_selkie',
    name: 'Selkie Pup',
    tier: 'uncommon',
    culture: 'Scottish',
    sprite: '/assets/pets/pet_selkie.png',
    description: 'Adorable seal pup with magical shimmer and human-like eyes',
    lore: 'Selkies transform between seal and human form. They represent adaptability and the deep connections between different worlds.',
    bonusType: 'adaptation',
    bonusAmount: 10,
    bonusDescription: '+10% Streak Recovery',
    // Unlock via cardio_sessions_100 achievement (moved from two_weeks which has blizzard ability)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'cardio_sessions_100', fallbackStat: 'cardioSessions', fallbackTarget: 100 },
    unlockDescription: 'Complete 100 cardio sessions',
  },
  uncommon_carbuncle: {
    id: 'uncommon_carbuncle',
    name: 'Carbuncle',
    tier: 'uncommon',
    culture: 'Latin American',
    sprite: '/assets/pets/pet_carbuncle.png',
    description: 'Small blue rabbit-like creature with a glowing red gemstone on forehead',
    lore: 'Carbuncles are treasure-finding creatures whose gem glows brighter near valuable discoveries. They symbolize finding hidden potential.',
    bonusType: 'discovery',
    bonusAmount: 10,
    bonusDescription: '+10% Quest Reward XP',
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'quest_apprentice' },
    unlockDescription: 'Complete "Quest Apprentice" achievement',
  },

  // RARE TIER - New Companions
  rare_qilin: {
    id: 'rare_qilin',
    name: 'Qilin',
    tier: 'rare',
    culture: 'Chinese',
    sprite: '/assets/pets/pet_qilin.png',
    description: 'Young qilin unicorn dragon hybrid with golden scales',
    lore: 'Qilins appear only during prosperous times and to wise rulers. Their presence brings good fortune and signals great achievements.',
    bonusType: 'prosperity',
    bonusAmount: 15,
    bonusDescription: '+15% Financial XP',
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'one_month' },
    unlockDescription: '30-day streak',
  },
  rare_basilisk: {
    id: 'rare_basilisk',
    name: 'Basilisk Hatchling',
    tier: 'rare',
    culture: 'European',
    sprite: '/assets/pets/pet_basilisk.png',
    description: 'Baby basilisk serpent king with emerald scales and hypnotic eyes',
    lore: 'The King of Serpents, basilisks possess deadly gazes. As hatchlings, their power is channeled into intense focus and determination.',
    bonusType: 'intensity',
    bonusAmount: 15,
    bonusDescription: '+15% Task Completion XP',
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'task_slayer' },
    unlockDescription: 'Complete 100 tasks',
  },
  rare_baku: {
    id: 'rare_baku',
    name: 'Baku',
    tier: 'rare',
    culture: 'Japanese',
    sprite: '/assets/pets/pet_baku.png',
    description: 'Dream-eating tapir spirit surrounded by purple dreamlike mist',
    lore: 'Baku devour nightmares and bad dreams, leaving only peaceful sleep. They represent the power of rest and mental clarity.',
    bonusType: 'recovery',
    bonusAmount: 15,
    bonusDescription: '+15% Sleep/Recovery XP',
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'quest_master' },
    unlockDescription: 'Complete "Quest Master" achievement',
  },

  // EPIC TIER - New Companions
  epic_chimera: {
    id: 'epic_chimera',
    name: 'Chimera Cub',
    tier: 'epic',
    culture: 'Greek',
    sprite: '/assets/pets/pet_chimera.png',
    description: 'Baby chimera with lion head, goat head on back, and snake tail',
    lore: 'The Chimera represents impossible combinations made real. Its cub embodies the power of embracing all aspects of yourself.',
    bonusType: 'versatility',
    bonusAmount: 20,
    bonusDescription: '+20% Multi-module Bonus',
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'boss_slayer' },
    unlockDescription: 'Complete "Boss Slayer" achievement',
  },
  epic_garuda: {
    id: 'epic_garuda',
    name: 'Garuda',
    tier: 'epic',
    culture: 'Hindu',
    sprite: '/assets/pets/pet_garuda.png',
    description: 'Divine eagle-human hybrid with golden feathers and royal crown',
    lore: 'Mount of Lord Vishnu, Garuda is the king of birds. He represents speed, power, and the ability to rise above all obstacles.',
    bonusType: 'speed',
    bonusAmount: 20,
    bonusDescription: '+20% Daily Challenge XP',
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'streak_60' },
    unlockDescription: '60-day streak',
  },
  epic_sleipnir: {
    id: 'epic_sleipnir',
    name: 'Sleipnir Foal',
    tier: 'epic',
    culture: 'Norse',
    sprite: '/assets/pets/pet_sleipnir.png',
    description: "Young eight-legged horse with silver-grey coat and cosmic mane",
    lore: "Odin's legendary steed can travel between worlds. Even as a foal, Sleipnir grants unmatched endurance and journeying prowess.",
    bonusType: 'endurance',
    bonusAmount: 20,
    bonusDescription: '+20% Long Streak XP',
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'streak_90' },
    unlockDescription: '90-day streak',
  },

  // MYTHIC TIER - New Companions
  mythic_quetzalcoatl: {
    id: 'mythic_quetzalcoatl',
    name: 'Quetzalcoatl',
    tier: 'mythic',
    culture: 'Aztec',
    sprite: '/assets/pets/pet_quetzalcoatl.png',
    description: 'Feathered serpent god with rainbow iridescent feathers and divine glow',
    lore: 'The Plumed Serpent god of wind, air, and learning. Quetzalcoatl brought knowledge to humanity and represents wisdom incarnate.',
    bonusType: 'wisdom',
    bonusAmount: 25,
    bonusDescription: '+25% Learning & Knowledge XP',
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'books_52' },
    unlockDescription: 'Read 52 books',
  },
  mythic_raiju: {
    id: 'mythic_raiju',
    name: 'Raijū',
    tier: 'mythic',
    culture: 'Japanese',
    sprite: '/assets/pets/pet_raiju.png',
    description: 'Lightning beast wolf-cat hybrid crackling with blue electricity',
    lore: 'The lightning beast companion of Raijin, god of thunder. Raijū embodies raw power and the electric energy of peak performance.',
    bonusType: 'power',
    bonusAmount: 25,
    bonusDescription: '+25% All XP on 100+ day streaks',
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'streak_legend' },
    unlockDescription: '100-day streak',
  },
};

// Tier colors and metadata
export const TIER_INFO = {
  common: { color: '#9CA3AF', name: 'Common', slots: 1 },
  uncommon: { color: '#10B981', name: 'Uncommon', slots: 2 },
  rare: { color: '#3B82F6', name: 'Rare', slots: 3 },
  epic: { color: '#8B5CF6', name: 'Epic', slots: 4 },
  mythic: { color: '#F59E0B', name: 'Mythic', slots: 5 },
};

export const usePetStore = create(
  persist(
    (set, get) => ({
      // Initialize from Supabase
      initializeFromSupabase: async (passedUserId = null) => {
        // Master timeout to prevent hanging
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
          set({ _isInitialized: true });
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
            set({ _isInitialized: true });
            return;
          }

          // Load user's pets and profile (for max_pet_slots)
          const [petsResult, profileResult] = await Promise.all([
            withTimeout(
              supabase
                .from('user_pets')
                .select(`
                  *,
                  pet:pets (*)
                `)
                .eq('user_id', userId)
            ),
            withTimeout(
              supabase
                .from('user_profiles')
                .select('max_pet_slots')
                .eq('id', userId)
                .maybeSingle()
            ),
          ]);

          const { data: userPets, error: petsError } = petsResult;
          const { data: profile } = profileResult;

          // Continue with empty data on timeout - don't throw
          if (petsError && petsError !== 'timeout') throw petsError;

          // Always set maxSlots from profile (default to 1 to override localStorage)
          set({ maxSlots: profile?.max_pet_slots || 1 });

          // Map database pet names to PET_DATABASE keys
          // Database stores UUIDs with names like "Kitsune Pup"
          // PET_DATABASE uses keys like "common_kitsune_pup" with name: "Kitsune Pup"
          const findPetDatabaseId = (dbPetName) => {
            if (!dbPetName) return null;
            // Find the PET_DATABASE entry that matches this name
            for (const [petId, pet] of Object.entries(PET_DATABASE)) {
              if (pet.name === dbPetName) {
                return petId;
              }
            }
            return null;
          };

          if (userPets && userPets.length > 0) {
            const ownedPets = userPets
              .map(up => findPetDatabaseId(up.pet?.name))
              .filter(Boolean);
            const activePets = userPets
              .filter(up => up.is_active)
              .map(up => findPetDatabaseId(up.pet?.name))
              .filter(Boolean);

            set({
              ownedPets: ownedPets.length > 0 ? ownedPets : [],
              activePets: activePets.length > 0 ? activePets : [],
            });
          } else {
            // No pets in database - reset to empty (override localStorage)
            set({ ownedPets: [], activePets: [] });
          }

          // Mark as initialized after loading from Supabase
          set({ _isInitialized: true });
          console.log('[PetStore] ✅ Initialized');
        } catch (error) {
          console.error('[PetStore] ❌ Error initializing:', error);
          set({ _isInitialized: true }); // Still mark initialized even on error
        } finally {
          clearTimeout(timeoutId);
        }
      },

      // Initialization flag - prevents race conditions with localStorage
      _isInitialized: false,

      // User's pet collection - starts empty, unlocked through gameplay
      ownedPets: [], // Pets unlocked through achievements, levels, etc.
      activePets: [], // Pets currently equipped
      maxSlots: 1, // Starts with 1 slot, unlocks more through progression

      // Get effective owned pets (all pets in dev mode)
      getEffectiveOwnedPets: () => {
        if (DEV_UNLOCK_ALL_PETS) {
          return Object.keys(PET_DATABASE);
        }
        return get().ownedPets;
      },

      // Unlock a new pet
      unlockPet: async (petId, showNotification = true) => {
        // Skip if not initialized to prevent syncing stale localStorage data
        if (!get()._isInitialized) {
          console.log('[PetStore] Skipping unlockPet - not initialized yet');
          return false;
        }

        const { ownedPets } = get();
        if (!ownedPets.includes(petId) && PET_DATABASE[petId]) {
          const pet = PET_DATABASE[petId];
          set({ ownedPets: [...ownedPets, petId] });

          // Show unlock notification with pixel art sprite
          if (showNotification) {
            try {
              const notificationStore = await getUnlockNotificationStore();
              notificationStore.getState().addPetUnlock({
                ...pet,
                id: petId,
              });
            } catch (e) {
              console.warn('Could not show pet unlock notification:', e);
            }
          }

          // Sync to database
          try {
            const userId = await getCurrentUserId();
            if (!userId) return true;

            // Look up the pet's UUID from the pets table by name
            const petUUID = await get()._getPetUUID(petId);

            if (!petUUID) {
              // Pet doesn't exist in database - this is OK for new pets not yet migrated
              console.warn('[PetStore] Pet not found in database:', petId, '- skipping sync');
              return true;
            }

            // Try to sync to database with proper UUID
            const { error: petError } = await supabase.from('user_pets').upsert({
              user_id: userId,
              pet_id: petUUID,
              is_active: false,
              unlocked_at: new Date().toISOString(),
            }, { onConflict: 'user_id,pet_id' });

            if (petError) {
              // Table may not exist - this is OK, local state is sufficient for now
              console.warn('[PetStore] Could not sync pet to database:', petError.message);
            }

            // Log to timeline (may fail if table doesn't exist)
            const { error: timelineError } = await supabase.from('timeline').insert({
              user_id: userId,
              module: 'companions',
              entry_type: 'pet_unlocked',
              title: `New Companion: ${pet.name}`,
              description: pet.description,
              metadata: {
                pet_id: petId,
                tier: pet.tier,
                culture: pet.culture,
                bonus: pet.bonusDescription,
              },
            });

            if (timelineError) {
              console.warn('[PetStore] Could not log pet unlock to timeline:', timelineError.message);
            }
          } catch (error) {
            console.warn('[PetStore] Error syncing pet unlock:', error.message);
          }

          return true;
        }
        return false;
      },

      // Helper to get database UUID for a pet by its PET_DATABASE key
      _getPetUUID: async (petId) => {
        const pet = PET_DATABASE[petId];
        if (!pet) return null;

        // Look up the pet's UUID by name
        const { data } = await supabase
          .from('pets')
          .select('id')
          .eq('name', pet.name)
          .maybeSingle();

        return data?.id || null;
      },

      // Equip/unequip pets
      equipPet: async (petId) => {
        const { activePets, maxSlots, ownedPets, _getPetUUID } = get();

        // In dev mode, allow equipping any pet; otherwise check ownership
        const canEquip = DEV_UNLOCK_ALL_PETS ? PET_DATABASE[petId] !== undefined : ownedPets.includes(petId);
        if (!canEquip) return false;

        // If already active, unequip it
        if (activePets.includes(petId)) {
          set({ activePets: activePets.filter(id => id !== petId) });
          // Sync to database
          try {
            const userId = await getCurrentUserId();
            if (userId) {
              // Get the database UUID for this pet
              const petUUID = await _getPetUUID(petId);
              if (petUUID) {
                await supabase.from('user_pets')
                  .update({ is_active: false })
                  .eq('user_id', userId)
                  .eq('pet_id', petUUID);
              }
            }
          } catch (error) {
            console.error('Error syncing pet unequip:', error);
          }
          return true;
        }

        // If at max capacity, don't equip
        if (activePets.length >= maxSlots) return false;

        // Equip the pet
        set({ activePets: [...activePets, petId] });
        // Sync to database
        try {
          const userId = await getCurrentUserId();
          if (userId) {
            // Get the database UUID for this pet
            const petUUID = await _getPetUUID(petId);
            if (petUUID) {
              await supabase.from('user_pets')
                .update({ is_active: true })
                .eq('user_id', userId)
                .eq('pet_id', petUUID);
            }
          }
        } catch (error) {
          console.error('Error syncing pet equip:', error);
        }
        return true;
      },

      // Unequip a pet
      unequipPet: async (petId) => {
        const { activePets, _getPetUUID } = get();
        set({ activePets: activePets.filter(id => id !== petId) });
        // Sync to database
        try {
          const userId = await getCurrentUserId();
          if (userId) {
            // Get the database UUID for this pet
            const petUUID = await _getPetUUID(petId);
            if (petUUID) {
              await supabase.from('user_pets')
                .update({ is_active: false })
                .eq('user_id', userId)
                .eq('pet_id', petUUID);
            }
          }
        } catch (error) {
          console.error('Error syncing pet unequip:', error);
        }
      },

      // Unlock additional pet slots
      unlockSlot: async () => {
        const { maxSlots } = get();
        if (maxSlots < 6) {
          const newMaxSlots = maxSlots + 1;
          set({ maxSlots: newMaxSlots });

          // Sync to Supabase
          try {
            const userId = await getCurrentUserId();
            if (userId) {
              await supabase
                .from('user_profiles')
                .update({ max_pet_slots: newMaxSlots })
                .eq('id', userId);
            }
          } catch (error) {
            console.error('Error syncing pet slots to Supabase:', error);
          }

          return true;
        }
        return false;
      },

      // Get total active bonuses
      getActiveBonuses: () => {
        const { activePets } = get();
        const bonuses = {};

        activePets.forEach(petId => {
          const pet = PET_DATABASE[petId];
          if (pet) {
            if (!bonuses[pet.bonusType]) {
              bonuses[pet.bonusType] = 0;
            }
            bonuses[pet.bonusType] += pet.bonusAmount;
          }
        });

        return bonuses;
      },

      // Get collection stats
      getCollectionStats: () => {
        const effectiveOwnedPets = get().getEffectiveOwnedPets();
        const totalPets = Object.keys(PET_DATABASE).length;
        const ownedCount = effectiveOwnedPets.length;

        const byTier = {
          common: 0,
          uncommon: 0,
          rare: 0,
          epic: 0,
          mythic: 0,
        };

        effectiveOwnedPets.forEach(petId => {
          const pet = PET_DATABASE[petId];
          if (pet) {
            byTier[pet.tier]++;
          }
        });

        return {
          owned: ownedCount,
          total: totalPets,
          percentage: Math.round((ownedCount / totalPets) * 100),
          byTier,
        };
      },

      // Check if pet is unlocked
      isPetUnlocked: (petId) => {
        if (DEV_UNLOCK_ALL_PETS) {
          return PET_DATABASE[petId] !== undefined;
        }
        return get().ownedPets.includes(petId);
      },

      // Check if pet is active
      isPetActive: (petId) => {
        return get().activePets.includes(petId);
      },

      // Check if a specific unlock requirement is met
      checkUnlockRequirement: async (pet, { level, stats, unlockedAchievements, perkState }) => {
        const req = pet.unlockRequirement;
        const method = pet.unlockMethod;

        // Bazaar items are never auto-unlocked - must be purchased
        if (method === 'bazaar') {
          return false;
        }

        // Level-based unlocks
        if (method === 'level') {
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
          // Check for specific perk unlock
          if (req.perkId) {
            return perkState?.unlockedPerks?.includes(req.perkId) || false;
          }
          // Check for tree level requirement
          if (req.tree && req.level) {
            const treeLevel = perkState?.treeLevels?.[req.tree] || 0;
            return treeLevel >= req.level;
          }
          // Check for any tree reaching a level
          if (req.anyTree && req.level) {
            const treeLevels = perkState?.treeLevels || {};
            return Object.values(treeLevels).some(lvl => lvl >= req.level);
          }
          return false;
        }

        return false;
      },

      // Check unlock conditions and unlock eligible pets
      checkUnlocks: async () => {
        // Skip if not initialized to prevent race conditions with localStorage
        if (!get()._isInitialized) {
          console.log('[PetStore] Skipping checkUnlocks - not initialized yet');
          return [];
        }

        const { ownedPets, unlockPet, unlockSlot, maxSlots, checkUnlockRequirement } = get();

        // Import stores dynamically to avoid circular dependencies
        const [useAvatarStore, achievementsStore, perkStore] = await Promise.all([
          getAvatarStore(),
          getAchievementsStore(),
          getPerkStore()
        ]);

        const avatarState = useAvatarStore.getState();
        const achievementsState = achievementsStore.getState();
        const perkState = perkStore.getState();

        const stats = achievementsState.stats || {};
        // Extract achievement IDs from objects (unlockedAchievements is array of { achievementId, ... })
        const unlockedAchievements = (achievementsState.unlockedAchievements || [])
          .map(a => a.achievementId || a.id || a)
          .filter(Boolean);
        const level = avatarState.level || 1;

        const newUnlocks = [];

        // Check each pet's unlock condition
        for (const [petId, pet] of Object.entries(PET_DATABASE)) {
          if (ownedPets.includes(petId)) continue; // Already owned

          const shouldUnlock = await checkUnlockRequirement(pet, {
            level,
            stats,
            unlockedAchievements,
            perkState,
          });

          if (shouldUnlock) {
            await unlockPet(petId);
            newUnlocks.push(pet);
          }
        }

        // Unlock additional pet slots based on level
        const slotUnlockLevels = [1, 10, 20, 30, 40, 50]; // Level thresholds for 1-6 slots
        const targetSlots = slotUnlockLevels.filter(l => level >= l).length;
        while (maxSlots < targetSlots && maxSlots < 6) {
          unlockSlot();
        }

        return newUnlocks;
      },

      // Purchase a pet from the Bazaar
      purchasePet: async (petId) => {
        const { ownedPets, unlockPet } = get();
        const pet = PET_DATABASE[petId];

        // Validate pet exists and is bazaar-purchasable
        if (!pet || pet.unlockMethod !== 'bazaar') {
          console.error('[PetStore] Pet cannot be purchased:', petId);
          return { success: false, error: 'Pet cannot be purchased' };
        }

        // Check if already owned
        if (ownedPets.includes(petId)) {
          return { success: false, error: 'Already owned' };
        }

        const price = pet.unlockRequirement.price;

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
        await gamificationState.spendCredits(price, 'purchase');

        // Unlock the pet
        await unlockPet(petId);

        // Log the purchase to timeline
        try {
          const userId = await getCurrentUserId();
          if (userId) {
            await supabase.from('timeline').insert({
              user_id: userId,
              module: 'bazaar',
              entry_type: 'pet_purchased',
              title: `Purchased ${pet.name}`,
              description: `Bought ${pet.name} for ${price} Cosmic Credits`,
              metadata: {
                pet_id: petId,
                tier: pet.tier,
                price: price,
              },
            });
          }
        } catch (error) {
          console.error('Error logging pet purchase to timeline:', error);
        }

        return {
          success: true,
          pet: pet,
          creditsSpent: price,
          remainingCredits: currentCredits - price,
        };
      },

      // Get pets available for purchase in the Bazaar
      getPurchasablePets: () => {
        const { ownedPets } = get();

        return Object.entries(PET_DATABASE)
          .filter(([petId, pet]) => {
            // Must be bazaar-purchasable and not already owned
            return pet.unlockMethod === 'bazaar' && !ownedPets.includes(petId);
          })
          .map(([petId, pet]) => ({
            ...pet,
            id: petId,
            price: pet.unlockRequirement.price,
          }))
          .sort((a, b) => a.price - b.price);
      },

      // Get pets available to unlock (shows what's coming next)
      getNextUnlocks: async () => {
        const { ownedPets } = get();

        // Use lazy imports to avoid circular dependencies
        const [useAvatarStore, achievementsStore, perkStore] = await Promise.all([
          getAvatarStore(),
          getAchievementsStore(),
          getPerkStore()
        ]);

        const level = useAvatarStore.getState().level || 1;
        const stats = achievementsStore.getState().stats || {};
        const perkState = perkStore.getState();
        const treeLevels = perkState.treeLevels || {};
        const unlockedPerks = perkState.unlockedPerks || [];

        return Object.entries(PET_DATABASE)
          .filter(([petId]) => !ownedPets.includes(petId))
          .map(([petId, pet]) => {
            let progress = 0;
            let target = 1;
            let progressLabel = '';
            const method = pet.unlockMethod;
            const req = pet.unlockRequirement;

            if (method === 'level') {
              target = req.level;
              progress = level;
              progressLabel = `Level ${level}/${req.level}`;
            } else if (method === 'achievement') {
              if (req.fallbackStat && req.fallbackTarget) {
                target = req.fallbackTarget;
                progress = stats[req.fallbackStat] || 0;
                progressLabel = `${progress}/${target}`;
              }
            } else if (method === 'skill_tree') {
              if (req.perkId) {
                // Perk unlock - binary progress
                progress = unlockedPerks.includes(req.perkId) ? 1 : 0;
                target = 1;
                progressLabel = progress ? 'Unlocked' : 'Locked';
              } else if (req.tree && req.level) {
                target = req.level;
                progress = treeLevels[req.tree] || 0;
                progressLabel = `${req.tree} L${progress}/${req.level}`;
              } else if (req.anyTree && req.level) {
                target = req.level;
                progress = Math.max(...Object.values(treeLevels), 0);
                progressLabel = `Best tree L${progress}/${req.level}`;
              }
            } else if (method === 'bazaar') {
              // Bazaar items show price instead of progress
              progress = 0;
              target = req.price;
              progressLabel = `${req.price} credits`;
            }

            return {
              ...pet,
              id: petId,
              progress,
              target,
              progressLabel,
              progressPercent: method === 'bazaar' ? 0 : Math.min(100, Math.round((progress / target) * 100)),
            };
          })
          .sort((a, b) => {
            // Sort bazaar items to the end, then by progress
            if (a.unlockMethod === 'bazaar' && b.unlockMethod !== 'bazaar') return 1;
            if (a.unlockMethod !== 'bazaar' && b.unlockMethod === 'bazaar') return -1;
            return b.progressPercent - a.progressPercent;
          })
          .slice(0, 5); // Show top 5 closest to unlock
      },

      // Get all locked pets grouped by unlock method (for UI display)
      getLockedPetsByMethod: () => {
        const { ownedPets } = get();

        const grouped = {
          level: [],
          achievement: [],
          skill_tree: [],
          bazaar: [],
        };

        Object.entries(PET_DATABASE)
          .filter(([petId]) => !ownedPets.includes(petId))
          .forEach(([petId, pet]) => {
            if (grouped[pet.unlockMethod]) {
              grouped[pet.unlockMethod].push({ ...pet, id: petId });
            }
          });

        return grouped;
      },
    }),
    {
      name: 'pet-storage',
    }
  )
);

// Export initialization function for App.jsx
export const initializePetStore = async (userId = null) => {
  return usePetStore.getState().initializeFromSupabase(userId);
};
