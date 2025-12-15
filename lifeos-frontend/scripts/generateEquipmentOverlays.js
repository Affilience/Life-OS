/**
 * Equipment Overlay Sprite Generator
 * Generates TRUE overlay sprites that layer on top of base characters
 * Consistent with base evolution sprite style
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Style consistency with base evolution sprites
const STYLE_BASE = 'pixel art, 128x128, highly detailed, front-facing isometric view, fantasy RPG style, transparent background';
const OVERLAY_KEYWORDS = 'equipment overlay layer, designed to fit on character, isolated piece';

// Negative prompt to ensure clean overlays
const NEGATIVE_BASE = 'full character, full body, face, head (unless helmet), legs (unless leg armor), background, multiple items, blurry, low quality, text, watermark';

// ============================================
// EQUIPMENT DEFINITIONS - TRUE OVERLAYS
// ============================================

const EQUIPMENT_OVERLAYS = {
  // ========================================
  // HELMETS - Head overlays
  // ========================================
  helmets: [
    {
      id: 'helmet_cloth_cap',
      name: 'Cloth Cap',
      rarity: 'common',
      prompt: `simple brown cloth cap helmet overlay, worn peasant hat, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, armor, metal, fancy`,
    },
    {
      id: 'helmet_leather_hood',
      name: 'Leather Hood',
      rarity: 'common',
      prompt: `brown leather hood helmet overlay, adventurer hood covering head, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, metal, plate`,
    },
    {
      id: 'helmet_iron',
      name: 'Iron Helmet',
      rarity: 'uncommon',
      prompt: `iron knight helmet overlay, medieval steel helmet with nose guard, polished metal, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, gold, dragon, horns`,
    },
    {
      id: 'helmet_steel_greathelm',
      name: 'Steel Greathelm',
      rarity: 'rare',
      prompt: `magnificent steel greathelm overlay, full enclosed knight helmet, polished silver steel with gold trim, cross visor slit, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, dragon, horns, fire`,
    },
    {
      id: 'helmet_dragon',
      name: 'Dragon Helm',
      rarity: 'legendary',
      prompt: `LEGENDARY dragon scale helmet overlay, forged from crimson dragon scales, two curved dragon horns, glowing molten orange eyes in visor, wisps of flame emanating, ancient draconic runes etched in gold, fierce dragon face design, radiating heat aura, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, simple, plain, dull, low detail`,
    },
    {
      id: 'helmet_phoenix_crown',
      name: 'Phoenix Crown',
      rarity: 'legendary',
      prompt: `immortal phoenix feather crown helmet overlay, golden crown with rising phoenix wings, eternal flames dancing, orange and red feathers of pure fire, rebirth aura, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, simple, dull`,
    },
  ],

  // ========================================
  // CHEST ARMOR - Torso overlays
  // ========================================
  chest: [
    {
      id: 'chest_cloth_tunic',
      name: 'Cloth Tunic',
      rarity: 'common',
      prompt: `simple cloth tunic chest overlay, peasant shirt torso piece, brown fabric, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, armor, metal, helmet`,
    },
    {
      id: 'chest_leather_vest',
      name: 'Leather Vest',
      rarity: 'common',
      prompt: `brown leather vest chest overlay, adventurer leather armor torso, buckles and straps, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, metal, plate, helmet`,
    },
    {
      id: 'chest_chainmail',
      name: 'Chainmail Shirt',
      rarity: 'uncommon',
      prompt: `chainmail shirt chest overlay, interlocking metal rings torso armor, silver steel, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, helmet, dragon, gold`,
    },
    {
      id: 'chest_iron_plate',
      name: 'Iron Chestplate',
      rarity: 'uncommon',
      prompt: `iron chestplate overlay, solid metal torso armor, polished iron with rivets, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, helmet, dragon, fancy`,
    },
    {
      id: 'chest_steel_plate',
      name: 'Steel Plate Armor',
      rarity: 'rare',
      prompt: `magnificent steel plate armor chest overlay, knightly torso armor, polished silver steel with gold engravings, layered pauldrons, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, helmet, dragon, fire`,
    },
    {
      id: 'chest_dragon',
      name: 'Dragon Scale Armor',
      rarity: 'legendary',
      prompt: `LEGENDARY dragon scale chestplate overlay, impenetrable crimson dragon scales layered perfectly, molten gold trim between scales, glowing orange veins of dragon fire pulsing through armor, ancient dragon soul bound within, wisps of flame at edges, draconic rune engravings, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality, masterwork detail`,
      negative: `${NEGATIVE_BASE}, helmet, simple, plain, dull`,
    },
    {
      id: 'chest_phoenix_plate',
      name: 'Phoenix Battleplate',
      rarity: 'legendary',
      prompt: `immortal phoenix battleplate chest overlay, golden armor with phoenix wings design, eternal flames dancing across surface, feather engravings, rebirth aura, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, helmet, simple`,
    },
  ],

  // ========================================
  // WEAPONS - Main hand overlays
  // ========================================
  weapons: [
    {
      id: 'weapon_wooden_sword',
      name: 'Wooden Sword',
      rarity: 'common',
      prompt: `wooden training sword weapon overlay, simple wooden blade, practice sword, held at side position, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, metal, glowing, fire`,
    },
    {
      id: 'weapon_iron_sword',
      name: 'Iron Sword',
      rarity: 'uncommon',
      prompt: `iron longsword weapon overlay, medieval steel blade, leather wrapped handle, held at side position, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, gold, dragon, fire, glowing`,
    },
    {
      id: 'weapon_steel_blade',
      name: 'Steel Blade',
      rarity: 'rare',
      prompt: `magnificent steel longsword weapon overlay, polished silver blade with gold crossguard, noble weapon, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, dragon, fire`,
    },
    {
      id: 'weapon_dragon_blade',
      name: 'Dragon Blade',
      rarity: 'legendary',
      prompt: `LEGENDARY dragon blade weapon overlay, massive sword forged from dragon fang, blade of crimson dragonfire steel, molten orange edge that never cools, dragon bone hilt wrapped in dragon leather, ancient draconic runes glowing along blade, wisps of flame trailing from edge, dragon eye gem in pommel, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, simple, plain, dull, wooden`,
    },
    {
      id: 'weapon_phoenix_sword',
      name: 'Phoenix Blade',
      rarity: 'legendary',
      prompt: `immortal phoenix sword weapon overlay, blade of eternal flame, golden hilt with phoenix wings, fire dancing along edge, rebirth energy, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, simple, wooden`,
    },
  ],

  // ========================================
  // SHIELDS - Off hand overlays
  // ========================================
  shields: [
    {
      id: 'shield_wooden',
      name: 'Wooden Shield',
      rarity: 'common',
      prompt: `round wooden shield overlay, simple wooden buckler with iron rim, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, metal, dragon, glowing`,
    },
    {
      id: 'shield_iron',
      name: 'Iron Shield',
      rarity: 'uncommon',
      prompt: `iron kite shield overlay, medieval metal shield with cross emblem, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, dragon, gold, fire`,
    },
    {
      id: 'shield_steel',
      name: 'Steel Tower Shield',
      rarity: 'rare',
      prompt: `steel tower shield overlay, large knight shield with gold trim and noble crest, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, dragon, fire`,
    },
    {
      id: 'shield_dragon',
      name: 'Dragon Scale Shield',
      rarity: 'legendary',
      prompt: `LEGENDARY dragon scale shield overlay, impenetrable shield of crimson dragon scales, dragon face emblem with glowing eyes, molten gold trim, wisps of protective flame, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, simple, wooden`,
    },
  ],

  // ========================================
  // CAPES - Back layer overlays
  // ========================================
  capes: [
    {
      id: 'cape_cloth',
      name: "Traveler's Cloak",
      rarity: 'common',
      prompt: `simple brown traveling cloak cape overlay, worn cloth cape flowing behind, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, fancy, glowing, fire`,
    },
    {
      id: 'cape_noble',
      name: 'Noble Cape',
      rarity: 'uncommon',
      prompt: `red noble cape overlay, fine fabric with gold trim, flowing elegantly, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, fire, magic`,
    },
    {
      id: 'cape_shadow',
      name: 'Shadow Cloak',
      rarity: 'epic',
      prompt: `mysterious shadow cloak cape overlay, dark purple ethereal fabric, shadows swirling at edges, magical darkness, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, fire, bright`,
    },
    {
      id: 'cape_dragon',
      name: 'Dragon Wing Cape',
      rarity: 'legendary',
      prompt: `LEGENDARY dragon wing cape overlay, actual dragon wing membrane stretched as cape, crimson scales at shoulders, glowing orange veins, wisps of flame at edges, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, cloth, simple`,
    },
    {
      id: 'cape_phoenix',
      name: 'Phoenix Feather Cape',
      rarity: 'legendary',
      prompt: `immortal phoenix feather cape overlay, cape made of eternal flame feathers, golden and orange, fire dancing, rebirth aura, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, cloth, simple`,
    },
  ],

  // ========================================
  // GLOVES/GAUNTLETS - Hand overlays
  // ========================================
  gloves: [
    {
      id: 'gloves_leather',
      name: 'Leather Gloves',
      rarity: 'common',
      prompt: `brown leather gloves hand overlay, simple adventurer gloves, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, metal, armor`,
    },
    {
      id: 'gloves_iron',
      name: 'Iron Gauntlets',
      rarity: 'uncommon',
      prompt: `iron gauntlets hand overlay, metal armored gloves, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, dragon, gold`,
    },
    {
      id: 'gloves_dragon',
      name: 'Dragon Scale Gauntlets',
      rarity: 'legendary',
      prompt: `LEGENDARY dragon scale gauntlets hand overlay, crimson dragon scale armored gloves, glowing claws, wisps of flame, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, simple, leather`,
    },
  ],

  // ========================================
  // BOOTS - Feet overlays (7 total)
  // ========================================
  boots: [
    {
      id: 'boots_cloth_shoes',
      name: 'Cloth Shoes',
      rarity: 'common',
      prompt: `simple brown cloth shoes feet overlay, peasant wrapped fabric footwear, positioned at bottom of sprite, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, metal, armor, fancy`,
    },
    {
      id: 'boots_leather',
      name: 'Leather Boots',
      rarity: 'common',
      prompt: `brown leather boots feet overlay, simple adventurer boots, positioned at bottom of sprite, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, metal, armor`,
    },
    {
      id: 'boots_iron',
      name: 'Iron Boots',
      rarity: 'uncommon',
      prompt: `iron boots feet overlay, metal armored footwear with shin guards, positioned at bottom of sprite, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, dragon, gold`,
    },
    {
      id: 'boots_steel_greaves',
      name: 'Steel Greaves',
      rarity: 'rare',
      prompt: `polished steel greaves boots overlay, knight armored boots with ornate engravings, positioned at bottom of sprite, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, dragon, fire`,
    },
    {
      id: 'boots_mage_slippers',
      name: 'Mage Slippers',
      rarity: 'rare',
      prompt: `purple enchanted mage slippers feet overlay, wizard footwear with glowing blue runes, magical soft shoes, positioned at bottom of sprite, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, metal, armor, heavy`,
    },
    {
      id: 'boots_dragon',
      name: 'Dragon Scale Boots',
      rarity: 'legendary',
      prompt: `LEGENDARY dragon scale boots feet overlay, crimson dragon scale armored boots with clawed toes, glowing molten orange veins, wisps of flame, positioned at bottom of sprite, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, simple, leather, cloth`,
    },
    {
      id: 'boots_phoenix',
      name: 'Phoenix Flame Boots',
      rarity: 'legendary',
      prompt: `LEGENDARY phoenix feather boots feet overlay, golden boots with flame effects, divine radiance, eternal fire dancing, positioned at bottom of sprite, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, simple, leather, cloth`,
    },
  ],

  // ========================================
  // LEGS - Leg armor overlays (8 total)
  // ========================================
  legs: [
    {
      id: 'legs_cloth_pants',
      name: 'Cloth Pants',
      rarity: 'common',
      prompt: `simple brown cloth pants leg overlay, peasant trousers, positioned at lower body thigh to knee area, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, metal, armor, fancy`,
    },
    {
      id: 'legs_leather_leggings',
      name: 'Leather Leggings',
      rarity: 'common',
      prompt: `brown leather leggings leg overlay, reinforced leather thigh guards, ranger style, positioned at lower body, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, metal, plate`,
    },
    {
      id: 'legs_chainmail',
      name: 'Chainmail Leggings',
      rarity: 'uncommon',
      prompt: `silver chainmail leggings leg overlay, interlocking metal rings leg armor, positioned at lower body thigh to knee, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, dragon, gold, fire`,
    },
    {
      id: 'legs_iron_legguards',
      name: 'Iron Legguards',
      rarity: 'rare',
      prompt: `iron plate legguards leg overlay, heavy iron thigh and knee armor, warrior style, positioned at lower body, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, dragon, fire, gold`,
    },
    {
      id: 'legs_steel_legplates',
      name: 'Steel Legplates',
      rarity: 'rare',
      prompt: `polished steel legplates leg overlay, ornate knight leg armor with engravings, positioned at lower body thigh to knee, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
      negative: `${NEGATIVE_BASE}, dragon, fire`,
    },
    {
      id: 'legs_mage_robes',
      name: 'Arcane Legwraps',
      rarity: 'epic',
      prompt: `purple arcane legwraps leg overlay, flowing wizard cloth with glowing magical runes, mystical leg wrappings, positioned at lower body, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, purple magical glow`,
      negative: `${NEGATIVE_BASE}, metal, armor, heavy`,
    },
    {
      id: 'legs_dragon',
      name: 'Dragon Scale Legguards',
      rarity: 'legendary',
      prompt: `LEGENDARY dragon scale legguards leg overlay, crimson dragon scales with glowing molten veins, fearsome leg armor, wisps of flame, positioned at lower body, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, simple, cloth, leather`,
    },
    {
      id: 'legs_phoenix',
      name: 'Phoenix Flame Legguards',
      rarity: 'legendary',
      prompt: `LEGENDARY phoenix feather legguards leg overlay, golden leg armor with flame effects, divine radiance, eternal fire, positioned at lower body, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
      negative: `${NEGATIVE_BASE}, simple, cloth, leather`,
    },
  ],
};

// ============================================
// GENERATION FUNCTIONS
// ============================================

async function generateSprite(item, category) {
  console.log(`\n🎨 Generating ${item.name} (${item.rarity})...`);
  console.log(`📝 ${item.prompt.substring(0, 80)}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: item.prompt,
        negative_description: item.negative,
        image_size: { width: 128, height: 128 },
        text_guidance_scale: item.rarity === 'legendary' ? 9.0 : 8.5,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);

    // Save sprite
    const outputDir = path.join(__dirname, '..', 'public', 'assets', 'equipment', 'overlays', category);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(outputDir, `${item.id}.png`);

    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Saved: overlays/${category}/${item.id}.png`);

    return { success: true, cost: data.usage?.usd || 0 };
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return { success: false, cost: 0, error: error.message };
  }
}

async function generateAllEquipment() {
  console.log('🚀 EQUIPMENT OVERLAY GENERATION');
  console.log('================================');
  console.log('Generating TRUE overlay sprites for layering on base characters\n');

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;
  const failed = [];

  const categories = Object.keys(EQUIPMENT_OVERLAYS);
  const totalItems = Object.values(EQUIPMENT_OVERLAYS).flat().length;

  console.log(`📊 Total items to generate: ${totalItems}`);
  console.log(`📁 Categories: ${categories.join(', ')}\n`);

  let itemIndex = 0;

  for (const [category, items] of Object.entries(EQUIPMENT_OVERLAYS)) {
    console.log(`\n========== ${category.toUpperCase()} ==========`);

    for (const item of items) {
      itemIndex++;
      const result = await generateSprite(item, category);

      if (result.success) {
        successCount++;
        totalCost += result.cost;
      } else {
        failCount++;
        failed.push({ category, item: item.name, error: result.error });
      }

      console.log(`📈 Progress: ${itemIndex}/${totalItems} (${Math.round(itemIndex / totalItems * 100)}%)`);

      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 GENERATION COMPLETE');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${successCount}/${totalItems}`);
  console.log(`❌ Failed: ${failCount}/${totalItems}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);

  if (failed.length > 0) {
    console.log('\n❌ Failed items:');
    failed.forEach(f => console.log(`  - ${f.category}/${f.item}: ${f.error}`));
  }

  console.log('\n📁 Sprites saved to: public/assets/equipment/overlays/');
}

// Run
generateAllEquipment().catch(console.error);
