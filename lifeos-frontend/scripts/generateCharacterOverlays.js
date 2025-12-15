/**
 * Generate Proper Character Equipment Overlays
 *
 * Uses PixelLab API to generate equipment overlays that are:
 * 1. Designed to fit on our chibi character style
 * 2. Properly positioned within 128x128 canvas
 * 3. Transparent backgrounds
 * 4. Matching art style
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'equipment', 'overlays-v3');

// Character style reference - matches our base-evolution sprites
const CHARACTER_STYLE = `chibi pixel art style, front-facing view, fantasy RPG,
same style as a cute chibi adventurer character with big head and small body,
128x128 canvas, transparent background`;

// Character proportions (based on our base sprites)
const CHAR_PROPORTIONS = `
Character is ~80px tall in 128x128 canvas:
- Head: top-center, y:15-50, roughly 35px diameter
- Torso: center, y:45-75, roughly 30px wide
- Legs: center, y:70-100
- Feet: center-bottom, y:95-115
- Right hand (weapon): x:75-95, y:45-70
- Left hand (shield): x:30-50, y:45-70
`;

/**
 * Equipment definitions with overlay-specific prompts
 */
const EQUIPMENT = {
  helmets: [
    { id: 'helmet_cloth_cap', name: 'Cloth Cap', rarity: 'common',
      prompt: `small brown cloth cap sitting on top of chibi character head, peasant hat, positioned at top of head area (y:10-35), shows hair underneath, ${CHARACTER_STYLE}` },
    { id: 'helmet_leather_hood', name: 'Leather Hood', rarity: 'common',
      prompt: `brown leather hood on chibi character head, adventurer hood, positioned at head area (y:8-40), face visible, ${CHARACTER_STYLE}` },
    { id: 'helmet_iron', name: 'Iron Helmet', rarity: 'uncommon',
      prompt: `small iron knight helmet on chibi head, open-face helmet with nose guard, positioned at y:10-45, character face visible through opening, ${CHARACTER_STYLE}` },
    { id: 'helmet_chainmail_coif', name: 'Chainmail Coif', rarity: 'uncommon',
      prompt: `chainmail coif hood on chibi head, metal mesh head covering, face visible, positioned at y:8-45, ${CHARACTER_STYLE}` },
    { id: 'helmet_steel_greathelm', name: 'Steel Greathelm', rarity: 'rare',
      prompt: `ornate steel greathelm on chibi head, full knight helmet with visor slit, gold trim, positioned at y:5-48, ${CHARACTER_STYLE}` },
    { id: 'helmet_mage_hat', name: 'Mage Hat', rarity: 'rare',
      prompt: `purple wizard hat on chibi head, pointed mage cap with stars, positioned at y:0-45, face visible, ${CHARACTER_STYLE}` },
    { id: 'helmet_crown', name: 'Royal Crown', rarity: 'epic',
      prompt: `golden royal crown on chibi head, jeweled king crown, positioned at top of head y:5-30, ${CHARACTER_STYLE}` },
    { id: 'helmet_dragon', name: 'Dragon Helm', rarity: 'legendary',
      prompt: `epic dragon scale helmet on chibi head, red dragon horns, glowing eyes, fiery aura, positioned at y:0-50, ${CHARACTER_STYLE}` },
    { id: 'helmet_phoenix_crown', name: 'Phoenix Crown', rarity: 'legendary',
      prompt: `legendary phoenix feather crown on chibi head, golden with flame wings, divine glow, positioned at y:0-45, ${CHARACTER_STYLE}` },
  ],

  chest: [
    { id: 'chest_cloth_tunic', name: 'Cloth Tunic', rarity: 'common',
      prompt: `simple cloth tunic on chibi torso, brown peasant shirt, positioned at torso area y:40-75 x:35-90, arms visible, ${CHARACTER_STYLE}` },
    { id: 'chest_leather_vest', name: 'Leather Vest', rarity: 'common',
      prompt: `brown leather vest on chibi torso, adventurer armor with buckles, positioned at y:40-78, ${CHARACTER_STYLE}` },
    { id: 'chest_chainmail', name: 'Chainmail Shirt', rarity: 'uncommon',
      prompt: `chainmail shirt on chibi torso, interlocking metal rings, silver steel, positioned at y:38-78, ${CHARACTER_STYLE}` },
    { id: 'chest_iron_plate', name: 'Iron Breastplate', rarity: 'rare',
      prompt: `iron breastplate on chibi torso, knight chest armor, positioned at y:35-78, ${CHARACTER_STYLE}` },
    { id: 'chest_steel_plate', name: 'Steel Plate', rarity: 'rare',
      prompt: `polished steel plate armor on chibi torso, ornate knight armor, positioned at y:35-80, ${CHARACTER_STYLE}` },
    { id: 'chest_mage_robes', name: 'Mage Robes', rarity: 'rare',
      prompt: `purple mage robes on chibi torso, wizard cloth with runes, positioned at y:38-85, ${CHARACTER_STYLE}` },
    { id: 'chest_dragon', name: 'Dragon Scale Armor', rarity: 'legendary',
      prompt: `dragon scale chestplate on chibi torso, crimson scales glowing, epic armor, positioned at y:32-80, ${CHARACTER_STYLE}` },
    { id: 'chest_phoenix_plate', name: 'Phoenix Plate', rarity: 'legendary',
      prompt: `phoenix feather armor on chibi torso, golden with flame effects, divine, positioned at y:32-82, ${CHARACTER_STYLE}` },
  ],

  weapons: [
    { id: 'weapon_wooden_sword', name: 'Wooden Sword', rarity: 'common',
      prompt: `wooden practice sword held in right hand, chibi character grip, blade pointing up-right, positioned at x:70-110 y:25-85, ${CHARACTER_STYLE}` },
    { id: 'weapon_iron_sword', name: 'Iron Sword', rarity: 'uncommon',
      prompt: `iron sword held in right hand, medieval blade pointing up-right, positioned at x:70-115 y:20-90, ${CHARACTER_STYLE}` },
    { id: 'weapon_steel_blade', name: 'Steel Longsword', rarity: 'rare',
      prompt: `steel longsword held in right hand, polished blade with crossguard, pointing up-right, positioned at x:68-118 y:15-95, ${CHARACTER_STYLE}` },
    { id: 'weapon_mage_staff', name: 'Mage Staff', rarity: 'rare',
      prompt: `wizard staff held in right hand, wooden with crystal orb top, positioned at x:72-105 y:5-100, ${CHARACTER_STYLE}` },
    { id: 'weapon_battle_axe', name: 'Battle Axe', rarity: 'rare',
      prompt: `battle axe held in right hand, large axe head, positioned at x:65-115 y:15-90, ${CHARACTER_STYLE}` },
    { id: 'weapon_dragon_blade', name: 'Dragon Blade', rarity: 'legendary',
      prompt: `legendary dragon sword in right hand, fiery blade with dragon hilt, glowing, positioned at x:65-120 y:10-95, ${CHARACTER_STYLE}` },
    { id: 'weapon_phoenix_sword', name: 'Phoenix Sword', rarity: 'legendary',
      prompt: `phoenix flame sword in right hand, golden blade with fire effects, positioned at x:65-120 y:10-95, ${CHARACTER_STYLE}` },
  ],

  shields: [
    { id: 'shield_wooden', name: 'Wooden Shield', rarity: 'common',
      prompt: `round wooden shield held in left hand, simple buckler, positioned at x:10-50 y:40-85, ${CHARACTER_STYLE}` },
    { id: 'shield_iron', name: 'Iron Shield', rarity: 'uncommon',
      prompt: `iron kite shield held in left hand, metal shield with emblem, positioned at x:8-52 y:35-88, ${CHARACTER_STYLE}` },
    { id: 'shield_steel', name: 'Steel Tower Shield', rarity: 'rare',
      prompt: `steel tower shield held in left hand, tall knight shield, positioned at x:5-50 y:30-95, ${CHARACTER_STYLE}` },
    { id: 'shield_dragon', name: 'Dragon Shield', rarity: 'legendary',
      prompt: `dragon scale shield in left hand, crimson with dragon face, glowing, positioned at x:5-55 y:28-92, ${CHARACTER_STYLE}` },
  ],

  capes: [
    { id: 'cape_cloth', name: 'Cloth Cape', rarity: 'common',
      prompt: `brown cloth cape behind chibi character, simple cloak flowing down from shoulders, positioned at x:25-100 y:35-100, behind body layer, ${CHARACTER_STYLE}` },
    { id: 'cape_noble', name: 'Noble Cape', rarity: 'rare',
      prompt: `purple noble cape behind chibi character, elegant cloak with gold trim, positioned at x:22-105 y:32-105, ${CHARACTER_STYLE}` },
    { id: 'cape_shadow', name: 'Shadow Cloak', rarity: 'epic',
      prompt: `dark shadow cape behind chibi character, mysterious black cloak with wisps, positioned at x:20-108 y:30-108, ${CHARACTER_STYLE}` },
    { id: 'cape_dragon', name: 'Dragon Cape', rarity: 'legendary',
      prompt: `dragon scale cape behind chibi character, crimson with fiery edges, positioned at x:18-110 y:28-110, ${CHARACTER_STYLE}` },
    { id: 'cape_phoenix', name: 'Phoenix Cloak', rarity: 'legendary',
      prompt: `phoenix feather cape behind chibi character, golden flames flowing, positioned at x:18-110 y:28-112, ${CHARACTER_STYLE}` },
  ],

  boots: [
    { id: 'boots_cloth', name: 'Cloth Shoes', rarity: 'common',
      prompt: `simple cloth shoes on chibi feet, brown wrapped footwear, positioned at bottom y:95-120 x:40-88, ${CHARACTER_STYLE}` },
    { id: 'boots_leather', name: 'Leather Boots', rarity: 'common',
      prompt: `brown leather boots on chibi feet, adventurer footwear, positioned at y:90-120 x:38-90, ${CHARACTER_STYLE}` },
    { id: 'boots_iron', name: 'Iron Greaves', rarity: 'uncommon',
      prompt: `iron armored boots on chibi feet, knight greaves, positioned at y:88-122 x:36-92, ${CHARACTER_STYLE}` },
    { id: 'boots_steel', name: 'Steel Sabatons', rarity: 'rare',
      prompt: `steel plate boots on chibi feet, ornate knight sabatons, positioned at y:85-122 x:34-94, ${CHARACTER_STYLE}` },
    { id: 'boots_dragon', name: 'Dragon Boots', rarity: 'legendary',
      prompt: `dragon scale boots on chibi feet, crimson with claws, glowing, positioned at y:82-124 x:32-96, ${CHARACTER_STYLE}` },
  ],

  legs: [
    { id: 'legs_cloth_pants', name: 'Cloth Pants', rarity: 'common',
      prompt: `brown cloth pants on chibi legs, simple trousers, positioned at y:68-100 x:42-86, ${CHARACTER_STYLE}` },
    { id: 'legs_leather', name: 'Leather Leggings', rarity: 'common',
      prompt: `brown leather leggings on chibi legs, adventurer pants, positioned at y:65-102 x:40-88, ${CHARACTER_STYLE}` },
    { id: 'legs_chainmail', name: 'Chainmail Leggings', rarity: 'uncommon',
      prompt: `chainmail leg armor on chibi legs, metal rings, positioned at y:62-105 x:38-90, ${CHARACTER_STYLE}` },
    { id: 'legs_plate', name: 'Plate Legguards', rarity: 'rare',
      prompt: `steel plate leg armor on chibi legs, knight legguards, positioned at y:60-105 x:36-92, ${CHARACTER_STYLE}` },
    { id: 'legs_dragon', name: 'Dragon Legguards', rarity: 'legendary',
      prompt: `dragon scale leg armor on chibi legs, crimson glowing, positioned at y:58-108 x:34-94, ${CHARACTER_STYLE}` },
  ],
};

const NEGATIVE_PROMPT = 'full body character, face, head, background, multiple items, blurry, low quality, realistic, 3D, photograph';

async function generateOverlay(category, item) {
  const categoryDir = path.join(OUTPUT_DIR, category);
  const outputPath = path.join(categoryDir, `${item.id}.png`);

  // Skip if exists
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skip: ${item.name} (exists)`);
    return { success: true, skipped: true };
  }

  console.log(`\n🎨 Generating: ${item.name} (${item.rarity})`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: item.prompt,
        negative_description: NEGATIVE_PROMPT,
        image_size: { width: 128, height: 128 },
        text_guidance_scale: item.rarity === 'legendary' ? 9.0 : 8.0,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API ${response.status}: ${err}`);
    }

    const data = await response.json();

    // Ensure directory
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Save image
    const base64 = data.image.base64.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'));

    const cost = data.usage?.usd || 0;
    console.log(`   ✅ Saved (${item.rarity}) - $${cost.toFixed(4)}`);

    return { success: true, cost };
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🎯 GENERATE CHARACTER EQUIPMENT OVERLAYS');
  console.log('=========================================');
  console.log('Using PixelLab to create proper chibi-style overlays\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let total = 0, success = 0, totalCost = 0;

  for (const [category, items] of Object.entries(EQUIPMENT)) {
    console.log(`\n📦 ${category.toUpperCase()} (${items.length} items)`);
    console.log('─'.repeat(40));

    for (const item of items) {
      total++;
      const result = await generateOverlay(category, item);

      if (result.success) {
        success++;
        if (result.cost) totalCost += result.cost;
      }

      // Rate limit
      if (!result.skipped) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  console.log('\n=========================================');
  console.log(`✨ Complete: ${success}/${total} generated`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
