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
let perkStoreRef = null;
let gamificationStoreRef = null;

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
    // New unlock system
    unlockMethod: 'level',
    unlockRequirement: { level: 5 },
    unlockDescription: 'Reach Level 5',
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
    // New unlock system - "First Steps" achievement
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'first_steps', fallbackStat: 'tasksCompleted', fallbackTarget: 1 },
    unlockDescription: 'Complete "First Steps" achievement',
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
    // New unlock system - Bazaar purchase
    unlockMethod: 'bazaar',
    unlockRequirement: { price: 150 },
    unlockDescription: '150 Cosmic Credits',
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
    // New unlock system - "One Week Wonder" achievement (7-day streak)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'one_week_wonder', fallbackStat: 'longestStreak', fallbackTarget: 7 },
    unlockDescription: 'Complete "One Week Wonder" achievement',
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
    // New unlock system - Skill Tree (Craft tree Level 15)
    unlockMethod: 'skill_tree',
    unlockRequirement: { tree: 'craft', level: 15 },
    unlockDescription: 'Reach Craft tree Level 15',
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
    // New unlock system - Bazaar purchase
    unlockMethod: 'bazaar',
    unlockRequirement: { price: 600 },
    unlockDescription: '600 Cosmic Credits',
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
    // New unlock system - Leveling
    unlockMethod: 'level',
    unlockRequirement: { level: 20 },
    unlockDescription: 'Reach Level 20',
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
    // New unlock system - Achievement (complete 10 projects)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'project_master', fallbackStat: 'projectsCompleted', fallbackTarget: 10 },
    unlockDescription: 'Complete 10 projects',
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
    // New unlock system - Skill Tree (Mind tree Level 30)
    unlockMethod: 'skill_tree',
    unlockRequirement: { tree: 'mind', level: 30 },
    unlockDescription: 'Reach Mind tree Level 30',
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
    // New unlock system - Skill Tree (unlock "Peak Performance" keystone perk)
    unlockMethod: 'skill_tree',
    unlockRequirement: { perkId: 'peak_performance' },
    unlockDescription: 'Unlock "Peak Performance" keystone',
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
    // New unlock system - Achievement (Rise from Ashes - rebuild 30-day streak)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'rise_from_ashes', fallbackStat: 'streaksRebuilt', fallbackTarget: 1 },
    unlockDescription: 'Rebuild a 30-day streak after losing one',
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
    // New unlock system - Bazaar purchase
    unlockMethod: 'bazaar',
    unlockRequirement: { price: 3500 },
    unlockDescription: '3,500 Cosmic Credits',
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
    // New unlock system - Leveling
    unlockMethod: 'level',
    unlockRequirement: { level: 50 },
    unlockDescription: 'Reach Level 50',
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
    // New unlock system - Achievement (Year of Excellence - 365-day streak)
    unlockMethod: 'achievement',
    unlockRequirement: { achievementId: 'year_of_excellence', fallbackStat: 'longestStreak', fallbackTarget: 365 },
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
    // New unlock system - Skill Tree (Any tree Level 80+)
    unlockMethod: 'skill_tree',
    unlockRequirement: { anyTree: true, level: 80 },
    unlockDescription: 'Reach Level 80 in any skill tree',
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
        const unlockedAchievements = achievementsState.unlockedAchievements || [];
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
        gamificationState.spendCredits(price, `Pet purchase: ${pet.name}`);

        // Unlock the pet
        await unlockPet(petId);

        // Log the purchase to timeline
        try {
          await supabase.from('timeline').insert({
            user_id: DEV_USER_ID,
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
export const initializePetStore = async () => {
  return usePetStore.getState().initializeFromSupabase();
};
