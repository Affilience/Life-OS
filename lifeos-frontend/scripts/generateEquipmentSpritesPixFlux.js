/**
 * Equipment Sprite Generator using PixelLab PixFlux API
 * Generates pixel art sprites for equipment items
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';
const OUTPUT_DIR = path.join(__dirname, '../public/assets/equipment');

// Full equipment list with visually impressive prompts
const EQUIPMENT_LIST = [
  // ===================================
  // HELMETS (15 items)
  // ===================================
  { name: 'Cloth Cap', prompt: 'simple white cloth cap, clean design, pixel art, 64x64, top-down view, high detail, soft fabric folds', category: 'helmets', filename: 'cloth_cap.png' },
  { name: 'Leather Hood', prompt: 'brown leather hood with stitching details, pixel art, 64x64, top-down view, high detail, rustic texture', category: 'helmets', filename: 'leather_hood.png' },
  { name: 'Training Helmet', prompt: 'basic bronze training helmet with dents, pixel art, 64x64, top-down view, high detail, weathered metal', category: 'helmets', filename: 'training_helmet.png' },
  { name: 'Iron Helmet', prompt: 'sturdy iron medieval helmet with face guard, shiny gray metal, pixel art, 64x64, top-down view, high detail, metallic sheen', category: 'helmets', filename: 'iron_helmet.png' },
  { name: 'Reinforced Coif', prompt: 'chainmail coif reinforced with metal plates, silver and gray, pixel art, 64x64, top-down view, high detail, interlocked rings', category: 'helmets', filename: 'reinforced_coif.png' },
  { name: 'Scholar\'s Circlet', prompt: 'elegant silver circlet with blue gemstone, glowing sapphire centerpiece, pixel art, 64x64, top-down view, high detail, mystical glow', category: 'helmets', filename: 'scholar_circlet.png' },
  { name: 'Steel Greathelm', prompt: 'imposing steel greathelm with cross visor, polished silver, pixel art, 64x64, top-down view, high detail, crusader style', category: 'helmets', filename: 'steel_greathelm.png' },
  { name: 'Sage\'s Crown', prompt: 'golden crown with purple gemstones, ornate wisdom runes, pixel art, 64x64, top-down view, high detail, regal design', category: 'helmets', filename: 'sage_crown.png' },
  { name: 'Dragon Scale Helm', prompt: 'helmet made of red dragon scales with horns, fierce design, pixel art, 64x64, top-down view, high detail, scales shimmer', category: 'helmets', filename: 'dragon_helm.png' },
  { name: 'Mindguard Helmet', prompt: 'futuristic psionic helmet with purple energy field, glowing mind protection, pixel art, 64x64, top-down view, high detail, energy aura', category: 'helmets', filename: 'mindguard_helmet.png' },
  { name: 'Titanium War Helm', prompt: 'sleek titanium war helmet, silver-white metal with blue accents, pixel art, 64x64, top-down view, high detail, modern warfare', category: 'helmets', filename: 'titanium_helm.png' },
  { name: 'Archmage\'s Diadem', prompt: 'magnificent arcane diadem with multiple glowing gems, purple and gold, pixel art, 64x64, top-down view, high detail, magical energy', category: 'helmets', filename: 'archmage_diadem.png' },
  { name: 'Phoenix Crown', prompt: 'golden crown with flame motifs, orange fire effects, phoenix feathers, pixel art, 64x64, top-down view, high detail, blazing aura', category: 'helmets', filename: 'phoenix_crown.png' },
  { name: 'Celestial Circlet', prompt: 'divine circlet radiating holy light, white gold with star patterns, pixel art, 64x64, top-down view, high detail, heavenly glow', category: 'helmets', filename: 'celestial_circlet.png' },
  { name: 'Crown of the Eternal Monarch', prompt: 'legendary golden crown with rainbow gemstones, ultimate power radiating, pixel art, 64x64, top-down view, high detail, prismatic aura', category: 'helmets', filename: 'eternal_crown.png' },

  // ===================================
  // CHEST ARMOR (11 items)
  // ===================================
  { name: 'Cloth Tunic', prompt: 'simple beige cloth tunic with rope belt, pixel art, 64x64, top-down view, high detail, fabric texture', category: 'chests', filename: 'cloth_tunic.png' },
  { name: 'Leather Vest', prompt: 'brown leather vest with buckles and straps, pixel art, 64x64, top-down view, high detail, worn leather', category: 'chests', filename: 'leather_vest.png' },
  { name: 'Padded Armor', prompt: 'quilted padded armor with diamond pattern, beige and brown, pixel art, 64x64, top-down view, high detail, stitched padding', category: 'chests', filename: 'padded_armor.png' },
  { name: 'Chainmail Shirt', prompt: 'interlocked chainmail armor, silver rings, pixel art, 64x64, top-down view, high detail, metallic mesh', category: 'chests', filename: 'chainmail_shirt.png' },
  { name: 'Reinforced Breastplate', prompt: 'solid iron breastplate with shoulder guards, dark gray metal, pixel art, 64x64, top-down view, high detail, battle-worn', category: 'chests', filename: 'reinforced_breastplate.png' },
  { name: 'Steel Plate Armor', prompt: 'full steel plate armor with intricate engravings, shiny silver, pixel art, 64x64, top-down view, high detail, knight armor', category: 'chests', filename: 'steel_plate.png' },
  { name: 'Dragon Hide Cuirass', prompt: 'flexible dragon leather cuirass, red scales with gold trim, pixel art, 64x64, top-down view, high detail, dragon texture', category: 'chests', filename: 'dragon_cuirass.png' },
  { name: 'Paladin\'s Chestguard', prompt: 'holy paladin armor with golden cross emblem, white and gold, pixel art, 64x64, top-down view, high detail, divine light', category: 'chests', filename: 'paladin_chestguard.png' },
  { name: 'Titanium Platemail', prompt: 'advanced titanium plate armor, silver-white with blue energy lines, pixel art, 64x64, top-down view, high detail, futuristic', category: 'chests', filename: 'titanium_platemail.png' },
  { name: 'Phoenix Battleplate', prompt: 'legendary phoenix armor with flame patterns, gold and orange fire effects, pixel art, 64x64, top-down view, high detail, burning aura', category: 'chests', filename: 'phoenix_battleplate.png' },
  { name: 'Aegis of the Titan', prompt: 'ultimate titan armor, massive golden plates with glowing runes, pixel art, 64x64, top-down view, high detail, god-tier power', category: 'chests', filename: 'aegis_titan.png' },

  // ===================================
  // WEAPONS (14 items)
  // ===================================
  { name: 'Wooden Staff', prompt: 'simple brown wooden staff with carved top, natural wood grain, pixel art, 64x64, top-down view, high detail', category: 'weapons', filename: 'wooden_staff.png' },
  { name: 'Iron Dagger', prompt: 'small iron dagger with leather grip, silver blade, pixel art, 64x64, top-down view, high detail, sharp edge', category: 'weapons', filename: 'iron_dagger.png' },
  { name: 'Training Sword', prompt: 'practice sword with rounded tip, bronze metal with worn grip, pixel art, 64x64, top-down view, high detail', category: 'weapons', filename: 'training_sword.png' },
  { name: 'Steel Longsword', prompt: 'balanced steel longsword with cross guard, shiny silver blade, pixel art, 64x64, top-down view, high detail, knight sword', category: 'weapons', filename: 'steel_longsword.png' },
  { name: 'Wizard\'s Wand', prompt: 'mystical wand with blue crystal tip, dark wood with arcane runes, pixel art, 64x64, top-down view, high detail, glowing crystal', category: 'weapons', filename: 'wizard_wand.png' },
  { name: 'Battle Axe', prompt: 'heavy battle axe with double blade, iron head with wooden handle, pixel art, 64x64, top-down view, high detail, brutal weapon', category: 'weapons', filename: 'battle_axe.png' },
  { name: 'Enchanted Blade', prompt: 'magically enhanced sword with glowing blue runes, silver blade with purple aura, pixel art, 64x64, top-down view, high detail, magical energy', category: 'weapons', filename: 'enchanted_blade.png' },
  { name: 'Warlock\'s Scepter', prompt: 'dark magic scepter with purple gem orb, black metal with shadow energy, pixel art, 64x64, top-down view, high detail, sinister glow', category: 'weapons', filename: 'warlock_scepter.png' },
  { name: 'Executioner\'s Greataxe', prompt: 'massive executioner axe with bloodstained blade, dark iron with spikes, pixel art, 64x64, top-down view, high detail, intimidating', category: 'weapons', filename: 'executioner_axe.png' },
  { name: 'Staff of the Archmage', prompt: 'supreme arcane staff with multiple glowing orbs, gold and purple crystals, pixel art, 64x64, top-down view, high detail, immense power', category: 'weapons', filename: 'archmage_staff.png' },
  { name: 'Thunder Hammer', prompt: 'legendary hammer crackling with lightning, silver metal with blue electricity, pixel art, 64x64, top-down view, high detail, storm power', category: 'weapons', filename: 'thunder_hammer.png' },
  { name: 'Godslayer', prompt: 'ultimate destructive greatsword, black blade with red demonic energy, pixel art, 64x64, top-down view, high detail, apocalyptic aura', category: 'weapons', filename: 'godslayer.png' },
  { name: 'Eternity\'s Edge', prompt: 'perfectly balanced legendary sword, prismatic blade with rainbow energy, pixel art, 64x64, top-down view, high detail, cosmic power', category: 'weapons', filename: 'eternity_edge.png' },
  { name: 'Bloodfang', prompt: 'vampiric curved blade dripping with blood, crimson steel with dark energy, pixel art, 64x64, top-down view, high detail, blood magic', category: 'weapons', filename: 'bloodfang.png' },

  // ===================================
  // SHIELDS (8 items)
  // ===================================
  { name: 'Wooden Buckler', prompt: 'small round wooden shield with iron rim, brown wood with metal bands, pixel art, 64x64, top-down view, high detail', category: 'shields', filename: 'wooden_buckler.png' },
  { name: 'Iron Round Shield', prompt: 'circular iron shield with boss center, gray metal with rivets, pixel art, 64x64, top-down view, high detail, basic defense', category: 'shields', filename: 'iron_shield.png' },
  { name: 'Steel Kite Shield', prompt: 'large kite shield with heraldic design, silver steel with blue emblem, pixel art, 64x64, top-down view, high detail, knight shield', category: 'shields', filename: 'steel_kite.png' },
  { name: 'Tower Shield', prompt: 'massive rectangular tower shield, dark iron with reinforced edges, pixel art, 64x64, top-down view, high detail, full body cover', category: 'shields', filename: 'tower_shield.png' },
  { name: 'Dragon Scale Shield', prompt: 'shield made of red dragon scales, crimson scales with golden edges, pixel art, 64x64, top-down view, high detail, dragon texture', category: 'shields', filename: 'dragon_shield.png' },
  { name: 'Guardian\'s Bulwark', prompt: 'holy guardian shield with golden cross, white and gold with divine glow, pixel art, 64x64, top-down view, high detail, protective aura', category: 'shields', filename: 'guardian_bulwark.png' },
  { name: 'Fortress Wall Shield', prompt: 'enormous fortress shield like castle wall, gray stone with metal reinforcement, pixel art, 64x64, top-down view, high detail, impenetrable', category: 'shields', filename: 'fortress_shield.png' },
  { name: 'Shield of the Immortal', prompt: 'legendary indestructible shield, golden with glowing runes and rainbow aura, pixel art, 64x64, top-down view, high detail, absolute protection', category: 'shields', filename: 'immortal_shield.png' },

  // ===================================
  // CAPES (8 items)
  // ===================================
  { name: 'Traveler\'s Cloak', prompt: 'simple brown traveling cloak with hood, worn fabric, pixel art, 64x64, top-down view, high detail, practical design', category: 'capes', filename: 'traveler_cloak.png' },
  { name: 'Leather Cape', prompt: 'short leather cape with fur collar, brown leather with buckle, pixel art, 64x64, top-down view, high detail, adventurer style', category: 'capes', filename: 'leather_cape.png' },
  { name: 'Enchanter\'s Mantle', prompt: 'blue enchanter mantle with silver trim and star patterns, pixel art, 64x64, top-down view, high detail, magical embroidery', category: 'capes', filename: 'enchanter_mantle.png' },
  { name: 'Shadow Cloak', prompt: 'dark shadowy cloak that blends with darkness, black with purple wisps, pixel art, 64x64, top-down view, high detail, smoky effect', category: 'capes', filename: 'shadow_cloak.png' },
  { name: 'Oracle\'s Shroud', prompt: 'mystical oracle shroud with glowing eye patterns, purple with gold runes, pixel art, 64x64, top-down view, high detail, foresight aura', category: 'capes', filename: 'oracle_shroud.png' },
  { name: 'Mystic\'s Robe', prompt: 'flowing mystic robe with arcane symbols, deep blue with glowing patterns, pixel art, 64x64, top-down view, high detail, magical energy', category: 'capes', filename: 'mystic_robe.png' },
  { name: 'Sage\'s Grand Cloak', prompt: 'magnificent sage cloak with golden trim, white and gold with wisdom runes, pixel art, 64x64, top-down view, high detail, enlightened aura', category: 'capes', filename: 'sage_cloak.png' },
  { name: 'Cloak of the Ancients', prompt: 'legendary ancient cloak radiating cosmic power, starry blue with galaxy patterns, pixel art, 64x64, top-down view, high detail, universe energy', category: 'capes', filename: 'ancient_cloak.png' },

  // ===================================
  // RINGS (10 items)
  // ===================================
  { name: 'Copper Band', prompt: 'simple copper ring band, orange-brown metal, pixel art, 64x64, top-down view, high detail, basic jewelry', category: 'rings', filename: 'copper_band.png' },
  { name: 'Iron Ring', prompt: 'sturdy iron ring with simple design, gray metal band, pixel art, 64x64, top-down view, high detail', category: 'rings', filename: 'iron_ring.png' },
  { name: 'Ring of Strength', prompt: 'powerful ring with red gemstone, silver band with ruby, pixel art, 64x64, top-down view, high detail, strength aura', category: 'rings', filename: 'strength_ring.png' },
  { name: 'Ring of Intelligence', prompt: 'intelligent ring with blue sapphire, gold band with glowing gem, pixel art, 64x64, top-down view, high detail, wisdom glow', category: 'rings', filename: 'intelligence_ring.png' },
  { name: 'Ring of Vitality', prompt: 'life-giving ring with green emerald, silver band with pulsing gem, pixel art, 64x64, top-down view, high detail, vitality energy', category: 'rings', filename: 'vitality_ring.png' },
  { name: 'Warrior\'s Signet', prompt: 'warrior signet ring with sword emblem, gold with engraved blade, pixel art, 64x64, top-down view, high detail, combat mastery', category: 'rings', filename: 'warrior_signet.png' },
  { name: 'Scholar\'s Ring', prompt: 'scholar ring with purple amethyst and book symbol, silver with gem, pixel art, 64x64, top-down view, high detail, knowledge aura', category: 'rings', filename: 'scholar_ring.png' },
  { name: 'Ring of Power', prompt: 'powerful ring with multiple gems, gold band with red and blue stones, pixel art, 64x64, top-down view, high detail, overwhelming force', category: 'rings', filename: 'power_ring.png' },
  { name: 'Ring of Immortality', prompt: 'immortal ring glowing with life energy, platinum with pulsing white gem, pixel art, 64x64, top-down view, high detail, eternal aura', category: 'rings', filename: 'immortal_ring.png' },
  { name: 'The One Ring', prompt: 'legendary supreme ring with fiery inscriptions, golden band with glowing runes, pixel art, 64x64, top-down view, high detail, ultimate power', category: 'rings', filename: 'one_ring.png' },

  // ===================================
  // AMULETS (10 items)
  // ===================================
  { name: 'Wooden Charm', prompt: 'lucky wooden pendant with carved symbol, brown wood on rope, pixel art, 64x64, top-down view, high detail, simple charm', category: 'amulets', filename: 'wooden_charm.png' },
  { name: 'Stone Pendant', prompt: 'protective stone amulet, gray stone with carved rune, pixel art, 64x64, top-down view, high detail, ancient symbol', category: 'amulets', filename: 'stone_pendant.png' },
  { name: 'Amulet of Strength', prompt: 'strength amulet with red crystal, iron chain with ruby gem, pixel art, 64x64, top-down view, high detail, power radiating', category: 'amulets', filename: 'strength_amulet.png' },
  { name: 'Amulet of Mind', prompt: 'mind-expanding amulet with purple crystal, silver chain with amethyst, pixel art, 64x64, top-down view, high detail, psionic energy', category: 'amulets', filename: 'mind_amulet.png' },
  { name: 'Dragon Tooth Necklace', prompt: 'dragon tooth on chain, massive white tooth with gold setting, pixel art, 64x64, top-down view, high detail, dragon power', category: 'amulets', filename: 'dragon_tooth.png' },
  { name: 'Arcane Medallion', prompt: 'mystical medallion with glowing blue runes, gold disc with arcane symbols, pixel art, 64x64, top-down view, high detail, magical knowledge', category: 'amulets', filename: 'arcane_medallion.png' },
  { name: 'Guardian\'s Pendant', prompt: 'holy guardian pendant with angel wings, silver with divine glow, pixel art, 64x64, top-down view, high detail, protection aura', category: 'amulets', filename: 'guardian_pendant.png' },
  { name: 'Celestial Medallion', prompt: 'celestial medallion radiating starlight, platinum with constellation pattern, pixel art, 64x64, top-down view, high detail, heavenly wisdom', category: 'amulets', filename: 'celestial_medallion.png' },
  { name: 'Heart of the Phoenix', prompt: 'glowing phoenix heart crystal, orange-red gem with flame effects, pixel art, 64x64, top-down view, high detail, rebirth essence', category: 'amulets', filename: 'phoenix_heart.png' },
  { name: 'Amulet of Infinity', prompt: 'legendary infinity amulet with rainbow prismatic glow, gold with cosmic energy, pixel art, 64x64, top-down view, high detail, limitless power', category: 'amulets', filename: 'infinity_amulet.png' },
];

// Create output directories
['weapons', 'helmets', 'shields', 'chests', 'capes', 'rings', 'amulets'].forEach(dir => {
  const dirPath = path.join(OUTPUT_DIR, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

async function generateEquipmentSprite(equipment) {
  console.log(`\nGenerating: ${equipment.name} (${equipment.category})`);

  const payload = {
    description: equipment.prompt,
    negative_description: 'blurry, low quality, distorted, text, watermark, signature, messy',
    image_size: {
      width: 64,
      height: 64
    },
    text_guidance_scale: 7.5,
    no_background: true,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`  ✗ API Error: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = await response.json();

    if (data.image && data.image.base64) {
      // Decode base64 image (remove data:image/png;base64, prefix if present)
      const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const outputPath = path.join(OUTPUT_DIR, equipment.category, equipment.filename);
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`  ✓ Saved: ${equipment.category}/${equipment.filename} ($${data.usage.usd.toFixed(4)})`);
      return true;
    } else {
      console.error(`  ✗ No image data returned`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return false;
  }
}

async function generateAll() {
  console.log('🎨 Starting Equipment Sprite Generation...');
  console.log('================================================\n');

  let successCount = 0;
  let failCount = 0;

  for (const equipment of EQUIPMENT_LIST) {
    const success = await generateEquipmentSprite(equipment);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Wait 2 seconds between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n================================================');
  console.log('✨ Generation Complete!');
  console.log(`✓ Success: ${successCount} items`);
  console.log(`✗ Failed: ${failCount} items`);
  console.log(`\nLocation: ${OUTPUT_DIR}`);
}

generateAll().catch(console.error);
