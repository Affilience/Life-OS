/**
 * Generate Equipment Overlays for EXACT database items
 * Matches IDs from equipmentDatabase.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const STYLE_BASE = 'pixel art, 128x128, highly detailed, front-facing isometric view, fantasy RPG style, transparent background';
const OVERLAY_KEYWORDS = 'equipment overlay layer, designed to fit on character, isolated piece';

const NEGATIVE_BASE = 'full character, full body, face, head (unless helmet), legs (unless leg armor), background, multiple items, blurry, low quality, text, watermark';

// Equipment matching EXACT database IDs
const EQUIPMENT = [
  // HELMETS
  {
    id: 'helmet_basic',
    category: 'helmets',
    name: 'Training Helmet',
    rarity: 'common',
    prompt: `simple leather training helmet overlay, basic protective headgear, brown leather with metal studs, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    negative: `${NEGATIVE_BASE}, fancy, glowing, dragon`,
  },
  {
    id: 'helmet_iron',
    category: 'helmets',
    name: 'Iron Helmet',
    rarity: 'uncommon',
    prompt: `iron knight helmet overlay, medieval steel helmet with nose guard, polished iron metal, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    negative: `${NEGATIVE_BASE}, gold, dragon, horns, fire`,
  },
  {
    id: 'helmet_dragon',
    category: 'helmets',
    name: 'Dragon Helm',
    rarity: 'legendary',
    prompt: `LEGENDARY dragon scale helmet overlay, forged from crimson dragon scales, two curved dragon horns, glowing molten orange eyes in visor, wisps of flame emanating, ancient draconic runes etched in gold, fierce dragon face design, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
    negative: `${NEGATIVE_BASE}, simple, plain, dull`,
  },

  // CHEST ARMOR
  {
    id: 'chest_basic',
    category: 'chest',
    name: 'Training Vest',
    rarity: 'common',
    prompt: `simple leather training vest chest overlay, basic protective vest, brown leather with straps, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    negative: `${NEGATIVE_BASE}, helmet, metal plate, fancy`,
  },
  {
    id: 'chest_iron',
    category: 'chest',
    name: 'Iron Chestplate',
    rarity: 'uncommon',
    prompt: `iron chestplate overlay, solid metal torso armor, polished iron with rivets, knight armor, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    negative: `${NEGATIVE_BASE}, helmet, dragon, gold, fire`,
  },
  {
    id: 'chest_dragon',
    category: 'chest',
    name: 'Dragon Scale Armor',
    rarity: 'legendary',
    prompt: `LEGENDARY dragon scale chestplate overlay, impenetrable crimson dragon scales layered perfectly, molten gold trim between scales, glowing orange veins of dragon fire pulsing through armor, ancient dragon soul bound within, wisps of flame at edges, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
    negative: `${NEGATIVE_BASE}, helmet, simple, plain`,
  },

  // WEAPONS
  {
    id: 'weapon_basic_sword',
    category: 'weapons',
    name: 'Training Sword',
    rarity: 'common',
    prompt: `simple training sword weapon overlay, basic steel blade, leather wrapped handle, held at side position, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    negative: `${NEGATIVE_BASE}, glowing, fire, dragon, fancy`,
  },
  {
    id: 'weapon_iron_sword',
    category: 'weapons',
    name: 'Iron Sword',
    rarity: 'uncommon',
    prompt: `iron longsword weapon overlay, medieval steel blade, polished iron, leather wrapped handle, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    negative: `${NEGATIVE_BASE}, gold, dragon, fire, glowing`,
  },
  {
    id: 'weapon_dragon_blade',
    category: 'weapons',
    name: 'Dragon Blade',
    rarity: 'legendary',
    prompt: `LEGENDARY dragon blade weapon overlay, massive sword forged from dragon fang, blade of crimson dragonfire steel, molten orange edge that never cools, dragon bone hilt wrapped in dragon leather, ancient draconic runes glowing along blade, wisps of flame trailing, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic legendary quality`,
    negative: `${NEGATIVE_BASE}, simple, plain, wooden`,
  },

  // SHIELDS
  {
    id: 'shield_basic',
    category: 'shields',
    name: 'Training Shield',
    rarity: 'common',
    prompt: `round wooden training shield overlay, simple wooden buckler with iron rim, basic shield, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    negative: `${NEGATIVE_BASE}, metal, dragon, glowing, fancy`,
  },
  {
    id: 'shield_iron',
    category: 'shields',
    name: 'Iron Shield',
    rarity: 'uncommon',
    prompt: `iron kite shield overlay, medieval metal shield with cross emblem, polished iron, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    negative: `${NEGATIVE_BASE}, dragon, gold, fire, wooden`,
  },

  // CAPES
  {
    id: 'cape_basic',
    category: 'capes',
    name: 'Traveler\'s Cloak',
    rarity: 'common',
    prompt: `simple brown traveling cloak cape overlay, worn cloth cape flowing behind, basic cloak, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    negative: `${NEGATIVE_BASE}, fancy, glowing, fire, magic`,
  },
  {
    id: 'cape_shadow',
    category: 'capes',
    name: 'Shadow Cloak',
    rarity: 'epic',
    prompt: `mysterious shadow cloak cape overlay, dark purple ethereal fabric, shadows swirling at edges, magical darkness emanating, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}, epic quality`,
    negative: `${NEGATIVE_BASE}, fire, bright colors, simple`,
  },

  // RINGS (small, may not render well but we'll try)
  {
    id: 'ring_strength',
    category: 'rings',
    name: 'Ring of Strength',
    rarity: 'rare',
    prompt: `golden ring of strength overlay, thick gold band with red gem, warrior ring, glowing faintly, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    negative: `${NEGATIVE_BASE}, large, armor`,
  },
  {
    id: 'ring_intelligence',
    category: 'rings',
    name: 'Ring of Intelligence',
    rarity: 'rare',
    prompt: `silver ring of intelligence overlay, elegant silver band with blue sapphire gem, magical ring, glowing arcane energy, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    negative: `${NEGATIVE_BASE}, large, armor`,
  },

  // AMULET
  {
    id: 'amulet_vitality',
    category: 'amulets',
    name: 'Amulet of Vitality',
    rarity: 'rare',
    prompt: `golden amulet of vitality overlay, ornate gold necklace with glowing green gem, life energy emanating, healing aura, ${OVERLAY_KEYWORDS}, ${STYLE_BASE}`,
    negative: `${NEGATIVE_BASE}, large, armor`,
  },
];

async function generateSprite(item) {
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

    // Save to overlays folder
    const outputDir = path.join(__dirname, '..', 'public', 'assets', 'equipment', 'overlays', item.category);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(outputDir, `${item.id}.png`);

    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Saved: overlays/${item.category}/${item.id}.png`);

    return { success: true, cost: data.usage?.usd || 0 };
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function generateAll() {
  console.log('🚀 GENERATING EQUIPMENT OVERLAYS (Exact Database Match)');
  console.log('========================================================');
  console.log(`📊 Total items: ${EQUIPMENT.length}`);
  console.log('⏳ Using 5s delay to avoid rate limiting\n');

  let success = 0;
  let failed = [];
  let totalCost = 0;

  for (let i = 0; i < EQUIPMENT.length; i++) {
    const item = EQUIPMENT[i];
    const result = await generateSprite(item);

    if (result.success) {
      success++;
      totalCost += result.cost;
    } else {
      failed.push({ name: item.name, error: result.error });
    }

    console.log(`📈 Progress: ${i + 1}/${EQUIPMENT.length} (${Math.round((i + 1) / EQUIPMENT.length * 100)}%)`);

    // 5 second delay between requests
    if (i < EQUIPMENT.length - 1) {
      console.log('⏳ Waiting 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 GENERATION COMPLETE');
  console.log('='.repeat(50));
  console.log(`✅ Success: ${success}/${EQUIPMENT.length}`);
  console.log(`❌ Failed: ${failed.length}/${EQUIPMENT.length}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);

  if (failed.length > 0) {
    console.log('\n❌ Failed items:');
    failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }

  console.log('\n📁 Saved to: public/assets/equipment/overlays/');
}

generateAll().catch(console.error);
