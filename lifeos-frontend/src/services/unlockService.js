/**
 * Unified Unlock Service
 * Coordinates unlock triggers across pets, equipment, and other unlockable content
 *
 * This service is called when:
 * - User levels up
 * - Achievement is unlocked
 * - Skill tree perk is unlocked or tree level increases
 * - User makes a Bazaar purchase
 */

// Lazy store imports to avoid circular dependencies
let petStoreRef = null;
let avatarStoreRef = null;
let gamificationStoreRef = null;
let elementalAbilityStoreRef = null;
let perkTreesRef = null;

const getPetStore = async () => {
  if (!petStoreRef) {
    const module = await import('../stores/petStore');
    petStoreRef = module.usePetStore;
  }
  return petStoreRef;
};

const getAvatarStore = async () => {
  if (!avatarStoreRef) {
    const module = await import('../stores/avatarStore');
    avatarStoreRef = module.useAvatarStore;
  }
  return avatarStoreRef;
};

const getGamificationStore = async () => {
  if (!gamificationStoreRef) {
    const module = await import('../stores/gamificationStore');
    gamificationStoreRef = module.default;
  }
  return gamificationStoreRef;
};

const getElementalAbilityStore = async () => {
  if (!elementalAbilityStoreRef) {
    const module = await import('../stores/elementalAbilityStore');
    elementalAbilityStoreRef = module.default;
  }
  return elementalAbilityStoreRef;
};

const getPerkTrees = async () => {
  if (!perkTreesRef) {
    const module = await import('../data/perkTrees');
    perkTreesRef = module.PERK_TREES;
  }
  return perkTreesRef;
};

/**
 * Check all pet unlocks
 * @returns {Promise<Array>} Array of newly unlocked pets
 */
export const checkPetUnlocks = async () => {
  try {
    const petStore = await getPetStore();
    const newPets = await petStore.getState().checkUnlocks();

    if (newPets?.length > 0) {
      console.log('[UnlockService] Unlocked new pets:', newPets.map(p => p.name));
    }

    return newPets || [];
  } catch (error) {
    console.error('[UnlockService] Error checking pet unlocks:', error);
    return [];
  }
};

/**
 * Check all equipment unlocks
 * @returns {Promise<Array>} Array of newly unlocked equipment
 */
export const checkEquipmentUnlocks = async () => {
  try {
    const avatarStore = await getAvatarStore();
    const newEquipment = await avatarStore.getState().checkUnlocks();

    if (newEquipment?.length > 0) {
      console.log('[UnlockService] Unlocked new equipment:', newEquipment.map(e => e.name));
    }

    return newEquipment || [];
  } catch (error) {
    console.error('[UnlockService] Error checking equipment unlocks:', error);
    return [];
  }
};

/**
 * Check all unlocks (pets + equipment)
 * @returns {Promise<Object>} Object with newPets and newEquipment arrays
 */
export const checkAllUnlocks = async () => {
  const [newPets, newEquipment] = await Promise.all([
    checkPetUnlocks(),
    checkEquipmentUnlocks(),
  ]);

  return {
    newPets,
    newEquipment,
    hasNewUnlocks: newPets.length > 0 || newEquipment.length > 0,
  };
};

/**
 * Called when user levels up
 * @param {number} newLevel - The new level reached
 * @returns {Promise<Object>} Object with unlocked items
 */
export const onLevelUp = async (newLevel) => {
  console.log('[UnlockService] Level up triggered:', newLevel);

  // Check all unlocks when leveling up
  const result = await checkAllUnlocks();

  if (result.hasNewUnlocks) {
    console.log('[UnlockService] New unlocks from level up:', {
      pets: result.newPets.map(p => p.name),
      equipment: result.newEquipment.map(e => e.name),
    });
  }

  return result;
};

/**
 * Called when an achievement is unlocked
 * @param {string} achievementId - The achievement that was unlocked
 * @returns {Promise<Object>} Object with unlocked items
 */
export const onAchievementUnlock = async (achievementId) => {
  console.log('[UnlockService] Achievement unlock triggered:', achievementId);

  // Check all unlocks when an achievement is unlocked
  const result = await checkAllUnlocks();

  if (result.hasNewUnlocks) {
    console.log('[UnlockService] New unlocks from achievement:', {
      achievementId,
      pets: result.newPets.map(p => p.name),
      equipment: result.newEquipment.map(e => e.name),
    });
  }

  return result;
};

/**
 * Called when a perk is unlocked or skill tree level increases
 * @param {string} perkId - The perk that was unlocked (optional)
 * @param {string} treeId - The skill tree that changed
 * @param {number} newTreeLevel - The new tree level
 * @returns {Promise<Object>} Object with unlocked items
 */
export const onPerkUnlock = async (perkId, treeId, newTreeLevel) => {
  console.log('[UnlockService] Perk/tree unlock triggered:', { perkId, treeId, newTreeLevel });

  // Check if this perk unlocks an ability
  let unlockedAbility = null;
  if (perkId) {
    try {
      const PERK_TREES = await getPerkTrees();
      const tree = PERK_TREES[treeId];
      if (tree) {
        const perk = tree.perks.find(p => p.id === perkId);
        if (perk?.effect?.unlocksAbility) {
          // This perk unlocks an ability - register it
          const abilityStore = await getElementalAbilityStore();
          abilityStore.getState().unlockFromPerk(perkId);
          unlockedAbility = perk.effect.unlocksAbility;
          console.log('[UnlockService] Unlocked ability from perk:', unlockedAbility);
        }
      }
    } catch (error) {
      console.error('[UnlockService] Error checking perk ability unlock:', error);
    }
  }

  // Check all unlocks when skill tree changes
  const result = await checkAllUnlocks();

  if (result.hasNewUnlocks || unlockedAbility) {
    console.log('[UnlockService] New unlocks from skill tree:', {
      perkId,
      treeId,
      newTreeLevel,
      pets: result.newPets.map(p => p.name),
      equipment: result.newEquipment.map(e => e.name),
      ability: unlockedAbility,
    });
  }

  return { ...result, unlockedAbility };
};

/**
 * Purchase a pet from the Bazaar
 * @param {string} petId - The pet to purchase
 * @returns {Promise<Object>} Purchase result
 */
export const purchasePet = async (petId) => {
  try {
    const petStore = await getPetStore();
    const result = await petStore.getState().purchasePet(petId);

    if (result.success) {
      console.log('[UnlockService] Pet purchased:', result.pet.name);
    }

    return result;
  } catch (error) {
    console.error('[UnlockService] Error purchasing pet:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Purchase equipment from the Bazaar
 * @param {string} itemId - The equipment to purchase
 * @returns {Promise<Object>} Purchase result
 */
export const purchaseEquipment = async (itemId) => {
  try {
    const avatarStore = await getAvatarStore();
    const result = await avatarStore.getState().purchaseEquipment(itemId);

    if (result.success) {
      console.log('[UnlockService] Equipment purchased:', result.item.name);
    }

    return result;
  } catch (error) {
    console.error('[UnlockService] Error purchasing equipment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Purchase an ability from the Bazaar
 * @param {string} abilityId - The ability to purchase
 * @returns {Promise<Object>} Purchase result
 */
export const purchaseAbility = async (abilityId) => {
  try {
    // Get the ability data to check price
    const { getAbilityById, ABILITY_UNLOCKS } = await import('../data/elementalAbilities');
    const ability = getAbilityById(abilityId);
    const unlock = ABILITY_UNLOCKS[abilityId];

    if (!ability || !unlock || unlock.type !== 'bazaar') {
      return { success: false, error: 'Ability not available for purchase' };
    }

    const price = unlock.price;

    // Check if already unlocked
    const abilityStore = await getElementalAbilityStore();
    if (abilityStore.getState().isAbilityUnlocked(abilityId)) {
      return { success: false, error: 'Ability already owned' };
    }

    // Spend credits
    const gamificationStore = await getGamificationStore();
    const spendResult = await gamificationStore.getState().spendCredits(price, 'ability_purchase');

    if (!spendResult.success) {
      return { success: false, error: spendResult.error || 'Insufficient credits' };
    }

    // Unlock the ability
    abilityStore.getState().unlockFromBazaar(abilityId);

    console.log('[UnlockService] Ability purchased:', ability.name);
    return {
      success: true,
      ability,
      price,
    };
  } catch (error) {
    console.error('[UnlockService] Error purchasing ability:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all purchasable items from the Bazaar
 * @returns {Promise<Object>} Object with pets and equipment arrays
 */
export const getPurchasableItems = async () => {
  const [petStore, avatarStore] = await Promise.all([
    getPetStore(),
    getAvatarStore(),
  ]);

  const pets = petStore.getState().getPurchasablePets();
  const equipment = avatarStore.getState().getPurchasableEquipment();

  return {
    pets,
    equipment,
    allItems: [
      ...pets.map(p => ({ ...p, itemType: 'pet' })),
      ...equipment.map(e => ({ ...e, itemType: 'equipment' })),
    ].sort((a, b) => a.price - b.price),
  };
};

/**
 * Get unlock progress for all items
 * @returns {Promise<Object>} Object with pet and equipment unlock progress
 */
export const getUnlockProgress = async () => {
  const [petStore, avatarStore] = await Promise.all([
    getPetStore(),
    getAvatarStore(),
  ]);

  const [nextPetUnlocks, lockedPetsByMethod] = await Promise.all([
    petStore.getState().getNextUnlocks(),
    Promise.resolve(petStore.getState().getLockedPetsByMethod()),
  ]);

  const lockedEquipmentByMethod = avatarStore.getState().getLockedEquipmentByMethod();

  return {
    pets: {
      nextUnlocks: nextPetUnlocks,
      byMethod: lockedPetsByMethod,
    },
    equipment: {
      byMethod: lockedEquipmentByMethod,
    },
  };
};

// Export as default object for easier importing
export default {
  checkPetUnlocks,
  checkEquipmentUnlocks,
  checkAllUnlocks,
  onLevelUp,
  onAchievementUnlock,
  onPerkUnlock,
  purchasePet,
  purchaseEquipment,
  purchaseAbility,
  getPurchasableItems,
  getUnlockProgress,
};
