/**
 * Pet Store - State Management for Mythological Companions
 * Handles pet collection, active pets, and unlock system
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { DEV_USER_ID } from '../lib/dev-auth';

// Lazy store imports to avoid circular dependencies
// These are resolved at runtime when checkUnlocks is called
let avatarStoreRef = null;
let achievementsStoreRef = null;

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
    unlockMethod: 'level_5',
    unlockDescription: 'Unlocked at Level 5',
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
    unlockMethod: 'achievement_100_tasks',
    unlockDescription: 'Complete 100 tasks',
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
    unlockMethod: 'level_5',
    unlockDescription: 'Unlocked at Level 5',
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
    unlockMethod: 'streak_30_tasks',
    unlockDescription: '30-day task completion streak',
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
    unlockMethod: 'level_10',
    unlockDescription: 'Unlocked at Level 10',
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
    unlockMethod: 'achievement_100_journal',
    unlockDescription: '100 journal entries',
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
    unlockMethod: 'level_20',
    unlockDescription: 'Unlocked at Level 20',
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
    unlockMethod: 'achievement_complete_project',
    unlockDescription: 'Complete a major project',
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
    unlockMethod: 'achievement_50_books',
    unlockDescription: 'Complete 50 books',
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
    unlockMethod: 'level_30',
    unlockDescription: 'Unlocked at Level 30',
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
    unlockMethod: 'achievement_break_restart',
    unlockDescription: 'Break a 30-day streak then restart',
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
    unlockMethod: 'achievement_balanced_week',
    unlockDescription: 'Perfect balance across all modules for a week',
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
    unlockMethod: 'level_50',
    unlockDescription: 'Unlocked at Level 50',
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
    unlockMethod: 'achievement_52_weeks',
    unlockDescription: 'Maintain system for 52 weeks',
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
    unlockMethod: 'achievement_master_skill',
    unlockDescription: 'Master any skill to level 10',
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
      initializeFromSupabase: async () => {
        try {
          // Load user's pets
          const { data: userPets, error: petsError } = await supabase
            .from('user_pets')
            .select(`
              *,
              pet:pets (*)
            `)
            .eq('user_id', DEV_USER_ID);

          if (petsError) throw petsError;

          if (userPets && userPets.length > 0) {
            const ownedPets = userPets.map(up => up.pet?.name?.toLowerCase().replace(/\s+/g, '_') || up.pet_id);
            const activePets = userPets.filter(up => up.is_active).map(up => up.pet?.name?.toLowerCase().replace(/\s+/g, '_') || up.pet_id);

            set({
              ownedPets: ownedPets.length > 0 ? ownedPets : Object.keys(PET_DATABASE),
              activePets: activePets.length > 0 ? activePets : ['common_kitsune_pup'],
            });
          }
        } catch (error) {
          console.error('Error initializing pets from Supabase:', error);
        }
      },

      // User's pet collection - starts empty, unlocked through gameplay
      ownedPets: [], // Pets unlocked through achievements, levels, etc.
      activePets: [], // Pets currently equipped
      maxSlots: 1, // Starts with 1 slot, unlocks more through progression

      // Unlock a new pet
      unlockPet: async (petId) => {
        const { ownedPets } = get();
        if (!ownedPets.includes(petId) && PET_DATABASE[petId]) {
          set({ ownedPets: [...ownedPets, petId] });

          // Sync to database
          try {
            await supabase.from('user_pets').upsert({
              user_id: DEV_USER_ID,
              pet_id: petId,
              is_active: false,
              unlocked_at: new Date().toISOString(),
            }, { onConflict: 'user_id,pet_id' });

            // Log to timeline
            const pet = PET_DATABASE[petId];
            await supabase.from('timeline').insert({
              user_id: DEV_USER_ID,
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
          } catch (error) {
            console.error('Error syncing pet unlock to database:', error);
          }

          return true;
        }
        return false;
      },

      // Equip/unequip pets
      equipPet: async (petId) => {
        const { activePets, maxSlots, ownedPets } = get();

        if (!ownedPets.includes(petId)) return false;

        // If already active, unequip it
        if (activePets.includes(petId)) {
          set({ activePets: activePets.filter(id => id !== petId) });
          // Sync to database
          try {
            await supabase.from('user_pets')
              .update({ is_active: false })
              .eq('user_id', DEV_USER_ID)
              .eq('pet_id', petId);
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
          await supabase.from('user_pets')
            .update({ is_active: true })
            .eq('user_id', DEV_USER_ID)
            .eq('pet_id', petId);
        } catch (error) {
          console.error('Error syncing pet equip:', error);
        }
        return true;
      },

      // Unequip a pet
      unequipPet: async (petId) => {
        const { activePets } = get();
        set({ activePets: activePets.filter(id => id !== petId) });
        // Sync to database
        try {
          await supabase.from('user_pets')
            .update({ is_active: false })
            .eq('user_id', DEV_USER_ID)
            .eq('pet_id', petId);
        } catch (error) {
          console.error('Error syncing pet unequip:', error);
        }
      },

      // Unlock additional pet slots
      unlockSlot: () => {
        const { maxSlots } = get();
        if (maxSlots < 6) {
          set({ maxSlots: maxSlots + 1 });
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
        const { ownedPets } = get();
        const totalPets = Object.keys(PET_DATABASE).length;
        const ownedCount = ownedPets.length;

        const byTier = {
          common: 0,
          uncommon: 0,
          rare: 0,
          epic: 0,
          mythic: 0,
        };

        ownedPets.forEach(petId => {
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
        return get().ownedPets.includes(petId);
      },

      // Check if pet is active
      isPetActive: (petId) => {
        return get().activePets.includes(petId);
      },

      // Check unlock conditions and unlock eligible pets
      checkUnlocks: async () => {
        const { ownedPets, unlockPet, unlockSlot, maxSlots } = get();

        // Import stores dynamically to avoid circular dependencies
        const [useAvatarStore, achievementsStore] = await Promise.all([
          getAvatarStore(),
          getAchievementsStore()
        ]);

        const avatarState = useAvatarStore.getState();
        const achievementsState = achievementsStore.getState();
        const stats = achievementsState.stats || {};
        const level = avatarState.level || 1;

        const newUnlocks = [];

        // Check each pet's unlock condition
        Object.entries(PET_DATABASE).forEach(([petId, pet]) => {
          if (ownedPets.includes(petId)) return; // Already owned

          const method = pet.unlockMethod;
          let shouldUnlock = false;

          // Level-based unlocks
          if (method.startsWith('level_')) {
            const requiredLevel = parseInt(method.split('_')[1], 10);
            shouldUnlock = level >= requiredLevel;
          }

          // Achievement-based unlocks (task count)
          else if (method === 'achievement_100_tasks') {
            shouldUnlock = (stats.tasksCompleted || 0) >= 100;
          }
          else if (method === 'streak_30_tasks') {
            shouldUnlock = (stats.longestStreak || 0) >= 30;
          }
          else if (method === 'achievement_100_journal') {
            shouldUnlock = (stats.journalEntriesCreated || 0) >= 100;
          }
          else if (method === 'achievement_complete_project') {
            shouldUnlock = (stats.projectsCompleted || 0) >= 1;
          }
          else if (method === 'achievement_50_books') {
            shouldUnlock = (stats.booksCompleted || 0) >= 50;
          }
          else if (method === 'achievement_break_restart') {
            // Special condition: broke a 30+ day streak then started a new 7+ day streak
            shouldUnlock = (stats.streaksBroken || 0) >= 1 && (stats.streaksMaintained || 0) >= 7;
          }
          else if (method === 'achievement_balanced_week') {
            // Would need to track balanced weeks - simplified for now
            shouldUnlock = (stats.balancedWeeks || 0) >= 1;
          }
          else if (method === 'achievement_52_weeks') {
            shouldUnlock = (stats.weeksCompleted || 0) >= 52;
          }
          else if (method === 'achievement_master_skill') {
            shouldUnlock = (stats.skillsMastered || 0) >= 1;
          }

          if (shouldUnlock) {
            unlockPet(petId);
            newUnlocks.push(pet);
          }
        });

        // Unlock additional pet slots based on level
        const slotUnlockLevels = [1, 10, 20, 30, 40, 50]; // Level thresholds for 1-6 slots
        const targetSlots = slotUnlockLevels.filter(l => level >= l).length;
        while (maxSlots < targetSlots && maxSlots < 6) {
          unlockSlot();
        }

        return newUnlocks;
      },

      // Get pets available to unlock (shows what's coming next)
      getNextUnlocks: async () => {
        const { ownedPets } = get();

        // Use lazy imports to avoid circular dependencies
        const [useAvatarStore, achievementsStore] = await Promise.all([
          getAvatarStore(),
          getAchievementsStore()
        ]);

        const level = useAvatarStore.getState().level || 1;
        const stats = achievementsStore.getState().stats || {};

        return Object.entries(PET_DATABASE)
          .filter(([petId]) => !ownedPets.includes(petId))
          .map(([petId, pet]) => {
            let progress = 0;
            let target = 1;
            const method = pet.unlockMethod;

            if (method.startsWith('level_')) {
              target = parseInt(method.split('_')[1], 10);
              progress = level;
            } else if (method === 'achievement_100_tasks') {
              target = 100;
              progress = stats.tasksCompleted || 0;
            } else if (method === 'streak_30_tasks') {
              target = 30;
              progress = stats.longestStreak || 0;
            } else if (method === 'achievement_100_journal') {
              target = 100;
              progress = stats.journalEntriesCreated || 0;
            } else if (method === 'achievement_50_books') {
              target = 50;
              progress = stats.booksCompleted || 0;
            }

            return {
              ...pet,
              id: petId,
              progress,
              target,
              progressPercent: Math.min(100, Math.round((progress / target) * 100)),
            };
          })
          .sort((a, b) => b.progressPercent - a.progressPercent)
          .slice(0, 5); // Show top 5 closest to unlock
      },
    }),
    {
      name: 'pet-storage',
    }
  )
);

// Export initialization function for App.jsx
export const initializePetStore = async () => {
  return usePetStore.getState().initializeFromSupabase();
};
