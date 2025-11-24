/**
 * Equipment Arsenal Generator
 *
 * Creates a comprehensive equipment database based on RPG best practices
 *
 * Rarity System (based on Diablo/PoE/WoW):
 * - Common (white): Basic items, level 1-10, +1-5 stats
 * - Uncommon (green): Improved items, level 5-20, +6-12 stats
 * - Rare (blue): Enhanced items, level 15-30, +13-25 stats
 * - Epic (purple): Powerful items, level 25-40, +26-45 stats
 * - Legendary (orange): Ultimate items, level 35+, +46-75 stats, special effects
 *
 * Equipment Slots:
 * - Helmet: Defense + Intelligence focus
 * - Chest: High defense + Vitality
 * - Weapon: Strength + Intelligence
 * - Shield: Pure defense + Vitality
 * - Cape: Wisdom + Intelligence
 * - Ring: Balanced stats, 2 slots
 * - Amulet: High single stat or balanced
 */

const EQUIPMENT_ARSENAL = {
  // ===================================
  // HELMETS (Defense + Intelligence)
  // ===================================
  helmets: [
    // COMMON
    { name: 'Cloth Cap', rarity: 'common', level: 1, defense: 2, intelligence: 1, desc: 'Simple cloth head protection' },
    { name: 'Leather Hood', rarity: 'common', level: 3, defense: 3, intelligence: 1, desc: 'Basic leather headgear' },
    { name: 'Training Helmet', rarity: 'common', level: 5, defense: 4, intelligence: 2, desc: 'Standard training equipment' },

    // UNCOMMON
    { name: 'Iron Helmet', rarity: 'uncommon', level: 8, defense: 7, intelligence: 3, desc: 'Sturdy iron protection' },
    { name: 'Reinforced Coif', rarity: 'uncommon', level: 12, defense: 9, intelligence: 4, desc: 'Metal-reinforced headpiece' },
    { name: 'Scholar\'s Circlet', rarity: 'uncommon', level: 15, defense: 6, intelligence: 8, desc: 'Enhances mental clarity' },

    // RARE
    { name: 'Steel Greathelm', rarity: 'rare', level: 18, defense: 14, intelligence: 6, desc: 'Heavy steel helmet' },
    { name: 'Sage\'s Crown', rarity: 'rare', level: 22, defense: 10, intelligence: 12, desc: 'Crown of ancient wisdom' },
    { name: 'Dragon Scale Helm', rarity: 'rare', level: 26, defense: 18, intelligence: 8, desc: 'Forged from dragon scales' },
    { name: 'Mindguard Helmet', rarity: 'rare', level: 28, defense: 12, intelligence: 15, desc: 'Protects against mental intrusion' },

    // EPIC
    { name: 'Titanium War Helm', rarity: 'epic', level: 30, defense: 24, intelligence: 10, desc: 'Lightweight but incredibly strong' },
    { name: 'Archmage\'s Diadem', rarity: 'epic', level: 33, defense: 15, intelligence: 22, desc: 'Worn by legendary archmages' },
    { name: 'Phoenix Crown', rarity: 'epic', level: 36, defense: 20, intelligence: 18, desc: 'Rises from the ashes' },
    { name: 'Celestial Circlet', rarity: 'epic', level: 38, defense: 18, intelligence: 24, desc: 'Blessed by celestial beings' },

    // LEGENDARY
    { name: 'Crown of the Eternal Monarch', rarity: 'legendary', level: 40, defense: 35, intelligence: 30, lore: 'Worn by rulers who never age', desc: 'Grants legendary wisdom and protection' },
    { name: 'Mindbreaker Helm', rarity: 'legendary', level: 42, defense: 30, intelligence: 35, lore: 'Shatters enemy will', desc: 'Dominates the battlefield' },
    { name: 'Helm of Cosmic Insight', rarity: 'legendary', level: 45, defense: 32, intelligence: 40, lore: 'Sees across dimensions', desc: 'Peer into the fabric of reality' },
  ],

  // ===================================
  // CHEST ARMOR (Defense + Vitality)
  // ===================================
  chests: [
    // COMMON
    { name: 'Cloth Tunic', rarity: 'common', level: 1, defense: 3, vitality: 2, desc: 'Simple cloth protection' },
    { name: 'Leather Vest', rarity: 'common', level: 3, defense: 4, vitality: 2, desc: 'Basic leather armor' },
    { name: 'Padded Armor', rarity: 'common', level: 5, defense: 5, vitality: 3, desc: 'Quilted protective layer' },

    // UNCOMMON
    { name: 'Chainmail Shirt', rarity: 'uncommon', level: 8, defense: 9, vitality: 5, desc: 'Interlocked metal rings' },
    { name: 'Reinforced Breastplate', rarity: 'uncommon', level: 12, defense: 11, vitality: 6, desc: 'Solid metal chest piece' },
    { name: 'Scout\'s Jerkin', rarity: 'uncommon', level: 15, defense: 8, vitality: 8, desc: 'Lightweight but protective' },

    // RARE
    { name: 'Steel Plate Armor', rarity: 'rare', level: 18, defense: 16, vitality: 10, desc: 'Full steel protection' },
    { name: 'Dragon Hide Cuirass', rarity: 'rare', level: 22, defense: 14, vitality: 14, desc: 'Flexible dragon leather' },
    { name: 'Paladin\'s Chestguard', rarity: 'rare', level: 26, defense: 20, vitality: 12, desc: 'Holy warrior\'s armor' },
    { name: 'Berserker\'s Harness', rarity: 'rare', level: 28, defense: 18, vitality: 15, desc: 'Enhances combat fury' },

    // EPIC
    { name: 'Titanium Platemail', rarity: 'epic', level: 30, defense: 28, vitality: 16, desc: 'Nearly indestructible' },
    { name: 'Immortal\'s Vestment', rarity: 'epic', level: 33, defense: 25, vitality: 22, desc: 'Extends life force' },
    { name: 'Phoenix Battleplate', rarity: 'epic', level: 36, defense: 30, vitality: 20, desc: 'Regenerates when damaged' },
    { name: 'Vanguard\'s Fortress', rarity: 'epic', level: 38, defense: 32, vitality: 24, desc: 'Unyielding protection' },

    // LEGENDARY
    { name: 'Aegis of the Titan', rarity: 'legendary', level: 40, defense: 45, vitality: 30, lore: 'Forged by ancient titans', desc: 'Unbreakable titan armor' },
    { name: 'Heartguard of Eternity', rarity: 'legendary', level: 42, defense: 40, vitality: 38, lore: 'Protects the eternal heart', desc: 'Legendary life preservation' },
    { name: 'Armor of the Cosmos', rarity: 'legendary', level: 45, defense: 48, vitality: 35, lore: 'Woven from starlight', desc: 'Cosmic energy protection' },
  ],

  // ===================================
  // WEAPONS (Strength + Intelligence)
  // ===================================
  weapons: [
    // COMMON
    { name: 'Wooden Staff', rarity: 'common', level: 1, strength: 2, intelligence: 2, desc: 'Simple wooden weapon' },
    { name: 'Iron Dagger', rarity: 'common', level: 3, strength: 3, intelligence: 1, desc: 'Basic blade' },
    { name: 'Training Sword', rarity: 'common', level: 5, strength: 4, intelligence: 2, desc: 'Standard practice weapon' },

    // UNCOMMON
    { name: 'Steel Longsword', rarity: 'uncommon', level: 8, strength: 7, intelligence: 3, desc: 'Well-balanced blade' },
    { name: 'Wizard\'s Wand', rarity: 'uncommon', level: 12, strength: 4, intelligence: 8, desc: 'Focuses magical energy' },
    { name: 'Battle Axe', rarity: 'uncommon', level: 15, strength: 10, intelligence: 2, desc: 'Heavy cleaving weapon' },

    // RARE
    { name: 'Enchanted Blade', rarity: 'rare', level: 18, strength: 12, intelligence: 10, desc: 'Magically enhanced' },
    { name: 'Warlock\'s Scepter', rarity: 'rare', level: 22, strength: 8, intelligence: 16, desc: 'Dark magic amplifier' },
    { name: 'Executioner\'s Greataxe', rarity: 'rare', level: 26, strength: 20, intelligence: 5, desc: 'Devastating power' },
    { name: 'Arcane Staff', rarity: 'rare', level: 28, strength: 6, intelligence: 18, desc: 'Pure magic conduit' },

    // EPIC
    { name: 'Sword of a Thousand Truths', rarity: 'epic', level: 30, strength: 24, intelligence: 12, desc: 'Reveals all deceptions' },
    { name: 'Staff of the Archmage', rarity: 'epic', level: 33, strength: 10, intelligence: 26, desc: 'Ultimate magical focus' },
    { name: 'Thunder Hammer', rarity: 'epic', level: 36, strength: 30, intelligence: 10, desc: 'Strikes like lightning' },
    { name: 'Spellblade of Elements', rarity: 'epic', level: 38, strength: 20, intelligence: 24, desc: 'Commands elemental forces' },

    // LEGENDARY
    { name: 'Godslayer', rarity: 'legendary', level: 40, strength: 40, intelligence: 20, lore: 'Has ended divine beings', desc: 'Legendary destructive power' },
    { name: 'Cosmic Cipher Staff', rarity: 'legendary', level: 42, strength: 18, intelligence: 45, lore: 'Decodes reality itself', desc: 'Rewrite the laws of magic' },
    { name: 'Eternity\'s Edge', rarity: 'legendary', level: 45, strength: 35, intelligence: 35, lore: 'Cuts through time', desc: 'Perfect balance of might and magic' },
  ],

  // ===================================
  // SHIELDS (Defense + Vitality)
  // ===================================
  shields: [
    // COMMON
    { name: 'Wooden Buckler', rarity: 'common', level: 1, defense: 3, vitality: 1, desc: 'Small wooden shield' },
    { name: 'Iron Round Shield', rarity: 'common', level: 5, defense: 5, vitality: 2, desc: 'Basic metal shield' },

    // UNCOMMON
    { name: 'Steel Kite Shield', rarity: 'uncommon', level: 10, defense: 8, vitality: 4, desc: 'Large protective shield' },
    { name: 'Tower Shield', rarity: 'uncommon', level: 15, defense: 12, vitality: 5, desc: 'Massive body coverage' },

    // RARE
    { name: 'Dragon Scale Shield', rarity: 'rare', level: 20, defense: 16, vitality: 10, desc: 'Dragon-forged protection' },
    { name: 'Guardian\'s Bulwark', rarity: 'rare', level: 25, defense: 20, vitality: 12, desc: 'Protects allies nearby' },

    // EPIC
    { name: 'Fortress Wall Shield', rarity: 'epic', level: 32, defense: 28, vitality: 18, desc: 'Like a walking fortress' },
    { name: 'Aegis of Valor', rarity: 'epic', level: 36, defense: 32, vitality: 20, desc: 'Impenetrable defense' },

    // LEGENDARY
    { name: 'Shield of the Immortal', rarity: 'legendary', level: 40, defense: 42, vitality: 28, lore: 'Never been breached', desc: 'Absolute protection' },
    { name: 'Cosmos Barrier', rarity: 'legendary', level: 45, defense: 48, vitality: 32, lore: 'Blocks dimensional attacks', desc: 'Shield against reality itself' },
  ],

  // ===================================
  // CAPES (Wisdom + Intelligence)
  // ===================================
  capes: [
    // COMMON
    { name: 'Traveler\'s Cloak', rarity: 'common', level: 1, wisdom: 2, intelligence: 1, desc: 'Simple traveling gear' },
    { name: 'Leather Cape', rarity: 'common', level: 5, wisdom: 3, intelligence: 2, desc: 'Basic weather protection' },

    // UNCOMMON
    { name: 'Enchanter\'s Mantle', rarity: 'uncommon', level: 10, wisdom: 6, intelligence: 5, desc: 'Enhances magical awareness' },
    { name: 'Shadow Cloak', rarity: 'uncommon', level: 15, wisdom: 8, intelligence: 4, desc: 'Blends with shadows' },

    // RARE
    { name: 'Oracle\'s Shroud', rarity: 'rare', level: 20, wisdom: 14, intelligence: 10, desc: 'Foresees danger' },
    { name: 'Mystic\'s Robe', rarity: 'rare', level: 25, wisdom: 12, intelligence: 14, desc: 'Amplifies mystic power' },

    // EPIC
    { name: 'Sage\'s Grand Cloak', rarity: 'epic', level: 32, wisdom: 22, intelligence: 18, desc: 'Legendary knowledge' },
    { name: 'Veil of Eternity', rarity: 'epic', level: 36, wisdom: 24, intelligence: 20, desc: 'Timeless wisdom' },

    // LEGENDARY
    { name: 'Cloak of the Ancients', rarity: 'legendary', level: 40, wisdom: 35, intelligence: 25, lore: 'Worn by first mages', desc: 'Ancient magical mastery' },
    { name: 'Shroud of Infinite Knowledge', rarity: 'legendary', level: 45, wisdom: 38, intelligence: 35, lore: 'Contains all wisdom', desc: 'Omniscient awareness' },
  ],

  // ===================================
  // RINGS (Balanced / Special)
  // ===================================
  rings: [
    // COMMON
    { name: 'Copper Band', rarity: 'common', level: 1, strength: 1, intelligence: 1, desc: 'Simple metal ring' },
    { name: 'Iron Ring', rarity: 'common', level: 5, defense: 2, vitality: 1, desc: 'Basic protective ring' },

    // UNCOMMON
    { name: 'Ring of Strength', rarity: 'uncommon', level: 10, strength: 6, desc: 'Enhances physical power' },
    { name: 'Ring of Intelligence', rarity: 'uncommon', level: 10, intelligence: 6, desc: 'Sharpens the mind' },
    { name: 'Ring of Vitality', rarity: 'uncommon', level: 12, vitality: 6, desc: 'Boosts life force' },
    { name: 'Ring of Defense', rarity: 'uncommon', level: 12, defense: 6, desc: 'Provides protection' },
    { name: 'Ring of Wisdom', rarity: 'uncommon', level: 15, wisdom: 6, desc: 'Grants insight' },

    // RARE
    { name: 'Warrior\'s Signet', rarity: 'rare', level: 20, strength: 10, defense: 8, desc: 'Combat mastery' },
    { name: 'Scholar\'s Ring', rarity: 'rare', level: 20, intelligence: 10, wisdom: 8, desc: 'Mental acuity' },
    { name: 'Guardian Band', rarity: 'rare', level: 22, defense: 12, vitality: 10, desc: 'Protective barrier' },
    { name: 'Ring of Balance', rarity: 'rare', level: 25, strength: 6, intelligence: 6, wisdom: 6, desc: 'Perfect harmony' },

    // EPIC
    { name: 'Ring of Power', rarity: 'epic', level: 30, strength: 18, intelligence: 12, desc: 'Overwhelming force' },
    { name: 'Ring of Clarity', rarity: 'epic', level: 32, intelligence: 18, wisdom: 14, desc: 'Perfect understanding' },
    { name: 'Ring of Immortality', rarity: 'epic', level: 35, vitality: 22, defense: 16, desc: 'Extends life' },
    { name: 'Ring of Elements', rarity: 'epic', level: 38, strength: 12, intelligence: 18, wisdom: 12, desc: 'Elemental mastery' },

    // LEGENDARY
    { name: 'The One Ring', rarity: 'legendary', level: 40, strength: 15, defense: 15, intelligence: 15, vitality: 15, wisdom: 15, lore: 'To rule them all', desc: 'Supreme power ring' },
    { name: 'Ring of Cosmic Power', rarity: 'legendary', level: 42, strength: 25, intelligence: 30, lore: 'Channels cosmic energy', desc: 'Ultimate magical might' },
    { name: 'Eternal Band', rarity: 'legendary', level: 45, defense: 25, vitality: 30, intelligence: 20, lore: 'Never breaks', desc: 'Unending protection' },
  ],

  // ===================================
  // AMULETS (High Single Stat / Balanced)
  // ===================================
  amulets: [
    // COMMON
    { name: 'Wooden Charm', rarity: 'common', level: 1, wisdom: 2, desc: 'Lucky wooden pendant' },
    { name: 'Stone Pendant', rarity: 'common', level: 5, defense: 3, desc: 'Protective stone' },

    // UNCOMMON
    { name: 'Amulet of Strength', rarity: 'uncommon', level: 10, strength: 7, desc: 'Empowers the body' },
    { name: 'Amulet of Mind', rarity: 'uncommon', level: 12, intelligence: 8, desc: 'Expands consciousness' },
    { name: 'Amulet of Life', rarity: 'uncommon', level: 15, vitality: 8, desc: 'Enhances vitality' },

    // RARE
    { name: 'Dragon Tooth Necklace', rarity: 'rare', level: 20, strength: 14, vitality: 10, desc: 'Dragon\'s might' },
    { name: 'Arcane Medallion', rarity: 'rare', level: 22, intelligence: 16, wisdom: 10, desc: 'Mystical knowledge' },
    { name: 'Guardian\'s Pendant', rarity: 'rare', level: 25, defense: 18, vitality: 12, desc: 'Divine protection' },

    // EPIC
    { name: 'Amulet of the Titans', rarity: 'epic', level: 30, strength: 24, defense: 18, desc: 'Titanic power' },
    { name: 'Celestial Medallion', rarity: 'epic', level: 33, intelligence: 26, wisdom: 18, desc: 'Heavenly wisdom' },
    { name: 'Heart of the Phoenix', rarity: 'epic', level: 36, vitality: 28, intelligence: 16, desc: 'Rebirth essence' },

    // LEGENDARY
    { name: 'Amulet of Infinity', rarity: 'legendary', level: 40, strength: 20, defense: 20, intelligence: 20, vitality: 20, wisdom: 20, lore: 'Contains infinite power', desc: 'Limitless potential' },
    { name: 'Eye of the Cosmos', rarity: 'legendary', level: 42, intelligence: 45, wisdom: 35, lore: 'Sees all reality', desc: 'Cosmic awareness' },
    { name: 'Soul of Creation', rarity: 'legendary', level: 45, strength: 30, vitality: 35, intelligence: 30, lore: 'First amulet ever made', desc: 'Primordial essence' },
  ],
};

// Equipment Set Definitions
const EQUIPMENT_SETS = {
  'Starter Set': {
    pieces: ['Training Helmet', 'Padded Armor', 'Training Sword', 'Wooden Buckler'],
    bonus_2pc: '+5% XP gain',
    bonus_4pc: '+10% XP gain, +2 all stats',
  },
  'Iron Warrior Set': {
    pieces: ['Iron Helmet', 'Chainmail Shirt', 'Steel Longsword', 'Steel Kite Shield'],
    bonus_2pc: '+15 Defense',
    bonus_4pc: '+30 Defense, +10 Strength',
  },
  'Sage\'s Set': {
    pieces: ['Scholar\'s Circlet', 'Enchanter\'s Mantle', 'Wizard\'s Wand', 'Scholar\'s Ring'],
    bonus_2pc: '+20 Intelligence',
    bonus_4pc: '+40 Intelligence, +25 Wisdom',
  },
  'Dragon Hunter Set': {
    pieces: ['Dragon Scale Helm', 'Dragon Hide Cuirass', 'Dragon Scale Shield', 'Dragon Tooth Necklace'],
    bonus_2pc: '+30 Defense, +20 Vitality',
    bonus_4pc: '+60 Defense, +40 Vitality, Fire Resistance',
  },
  'Archmage Set': {
    pieces: ['Archmage\'s Diadem', 'Mystic\'s Robe', 'Staff of the Archmage', 'Arcane Medallion'],
    bonus_2pc: '+35 Intelligence, +25 Wisdom',
    bonus_4pc: '+70 Intelligence, +50 Wisdom, Spell Power +50%',
  },
  'Legendary Guardian Set': {
    pieces: ['Crown of the Eternal Monarch', 'Aegis of the Titan', 'Shield of the Immortal', 'Guardian\'s Pendant'],
    bonus_2pc: '+50 Defense, +40 Vitality',
    bonus_4pc: '+100 Defense, +80 Vitality, Damage Reduction +25%',
  },
  'Cosmic Ascendant Set': {
    pieces: ['Helm of Cosmic Insight', 'Armor of the Cosmos', 'Cosmic Cipher Staff', 'Eye of the Cosmos', 'Cosmos Barrier', 'Shroud of Infinite Knowledge'],
    bonus_2pc: '+40 all stats',
    bonus_4pc: '+80 all stats, XP +50%',
    bonus_6pc: '+120 all stats, XP +100%, Cosmic Power Unlocked',
  },
};

// Total: 110+ items across 7 slots with 5 rarity tiers
console.log('Equipment Arsenal Generated:');
Object.entries(EQUIPMENT_ARSENAL).forEach(([slot, items]) => {
  console.log(`${slot}: ${items.length} items`);
});

module.exports = { EQUIPMENT_ARSENAL, EQUIPMENT_SETS };
