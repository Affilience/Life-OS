/**
 * Generate PROPER Equipment Overlay Sprites
 *
 * KEY INSIGHT: Equipment overlays must be:
 * 1. SMALL - sized to fit the character's body parts (not fill the whole canvas)
 * 2. POSITIONED - placed where they should appear on the character
 *
 * Character proportions (in 128x128 canvas):
 * - Head: y=15-45, x=45-85 (centered, upper portion)
 * - Torso: y=45-80, x=40-90
 * - Legs: y=80-110, x=45-85
 * - Feet: y=105-125, x=45-85
 * - Right hand (weapon): x=85-120, y=50-90
 * - Left hand (shield): x=10-45, y=50-90
 * - Cape: behind body, full height
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'equipment', 'overlays-v2');

// Style that matches our base character sprites
const STYLE = 'pixel art, chibi RPG style, front-facing, transparent background, fantasy medieval';

/**
 * Equipment definitions with PROPER sizing and positioning
 *
 * The key is to describe the equipment as it should appear ON the character,
 * not as a standalone item.
 */
const EQUIPMENT_SPECS = {
  helmets: [
    {
      id: 'helmet_cloth_cap',
      name: 'Cloth Cap',
      rarity: 'common',
      // Describe as small head covering, positioned for overlay
      prompt: `tiny brown cloth cap, small peasant hat, pixel art helmet for chibi character head, 25x20 pixels centered at top of 128x128 canvas, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'helmet_leather_hood',
      name: 'Leather Hood',
      rarity: 'common',
      prompt: `small brown leather hood, adventurer hood covering small head, pixel art helmet overlay positioned in upper center of 128x128 canvas, head size 30x25 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'helmet_iron',
      name: 'Iron Helmet',
      rarity: 'uncommon',
      prompt: `small iron knight helmet, medieval steel helmet with nose guard, pixel art helmet overlay for chibi character, positioned at top center, helmet size approximately 30x30 pixels in 128x128 canvas, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'helmet_steel_greathelm',
      name: 'Steel Greathelm',
      rarity: 'rare',
      prompt: `small ornate steel greathelm, enclosed knight helmet with gold trim, pixel art overlay for chibi head, size 35x35 pixels centered at top of 128x128 canvas, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'helmet_dragon',
      name: 'Dragon Helm',
      rarity: 'legendary',
      prompt: `small legendary dragon scale helmet with horns, glowing eyes, pixel art overlay for chibi character head, size 40x35 pixels at top center of 128x128 canvas, epic fiery details, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
  ],

  chest: [
    {
      id: 'chest_cloth_tunic',
      name: 'Cloth Tunic',
      rarity: 'common',
      prompt: `small brown cloth tunic, simple shirt for chibi character torso, pixel art chest overlay, torso area 35x35 pixels centered in middle of 128x128 canvas, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'chest_leather_vest',
      name: 'Leather Vest',
      rarity: 'common',
      prompt: `small brown leather vest with buckles, adventurer armor for chibi torso, pixel art chest overlay, size 40x40 pixels in center of 128x128 canvas, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'chest_chainmail',
      name: 'Chainmail Shirt',
      rarity: 'uncommon',
      prompt: `small chainmail shirt, interlocking rings armor for chibi character torso, pixel art overlay, approximately 40x40 pixels centered in 128x128 canvas, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'chest_iron_plate',
      name: 'Iron Breastplate',
      rarity: 'rare',
      prompt: `small iron breastplate armor, knight chest armor for chibi character, pixel art overlay, torso size 45x45 pixels in center of 128x128 canvas, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'chest_dragon',
      name: 'Dragon Scale Armor',
      rarity: 'legendary',
      prompt: `small legendary dragon scale breastplate, glowing crimson scales, pixel art chest overlay for chibi character, 50x50 pixels centered in 128x128 canvas, epic quality, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
  ],

  weapons: [
    {
      id: 'mainhand_wooden_sword',
      name: 'Wooden Sword',
      rarity: 'common',
      prompt: `small wooden practice sword held in right hand, pixel art weapon overlay positioned on right side of 128x128 canvas (x:85-115, y:50-100), sword size 15x50 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'mainhand_iron_sword',
      name: 'Iron Sword',
      rarity: 'uncommon',
      prompt: `small iron sword in right hand position, pixel art weapon overlay on right side of 128x128 canvas, sword approximately 15x55 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'mainhand_steel_longsword',
      name: 'Steel Longsword',
      rarity: 'rare',
      prompt: `small ornate steel longsword, pixel art weapon overlay positioned in right hand area of 128x128 canvas, sword 18x60 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'mainhand_fire_sword',
      name: 'Flaming Sword',
      rarity: 'legendary',
      prompt: `small legendary flaming sword with fire effects, pixel art weapon overlay in right hand position of 128x128 canvas, sword 20x65 pixels with flame particles, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
  ],

  shields: [
    {
      id: 'offhand_wooden_shield',
      name: 'Wooden Shield',
      rarity: 'common',
      prompt: `small round wooden shield in left hand, pixel art shield overlay positioned on left side of 128x128 canvas (x:15-45, y:50-90), shield size 25x30 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'offhand_iron_shield',
      name: 'Iron Shield',
      rarity: 'uncommon',
      prompt: `small iron kite shield with emblem, pixel art shield overlay on left side of 128x128 canvas, shield 28x35 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'offhand_tower_shield',
      name: 'Tower Shield',
      rarity: 'rare',
      prompt: `small ornate tower shield, pixel art shield overlay positioned left of center in 128x128 canvas, shield 30x45 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
  ],

  capes: [
    {
      id: 'cape_cloth',
      name: 'Cloth Cape',
      rarity: 'common',
      prompt: `small brown cloth cape hanging behind character, pixel art cape overlay for back layer, cape width 50 pixels flowing down from shoulders in 128x128 canvas, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'cape_royal',
      name: 'Royal Cape',
      rarity: 'rare',
      prompt: `small royal purple cape with gold trim, pixel art cape overlay behind chibi character, elegant flowing cape 55 pixels wide in 128x128 canvas, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'cape_phoenix',
      name: 'Phoenix Cloak',
      rarity: 'legendary',
      prompt: `small legendary phoenix feather cloak with flame effects, pixel art cape overlay, fiery orange cape behind character, 60 pixels wide in 128x128 canvas, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
  ],

  boots: [
    {
      id: 'boots_cloth',
      name: 'Cloth Shoes',
      rarity: 'common',
      prompt: `tiny brown cloth shoes at bottom of canvas, pixel art boots overlay for chibi feet, positioned at y:105-125 in 128x128 canvas, boots 30x20 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'boots_leather',
      name: 'Leather Boots',
      rarity: 'common',
      prompt: `small brown leather boots at canvas bottom, pixel art boots overlay for chibi character feet, y:100-125 in 128x128 canvas, boots 35x25 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'boots_iron',
      name: 'Iron Greaves',
      rarity: 'uncommon',
      prompt: `small iron armored boots, pixel art greaves overlay at bottom of 128x128 canvas, positioned at feet area y:95-125, boots 40x30 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'boots_dragon',
      name: 'Dragon Scale Boots',
      rarity: 'legendary',
      prompt: `small legendary dragon scale boots with claws, pixel art boots overlay at bottom of 128x128 canvas, glowing red scales, boots 45x35 pixels at y:90-125, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
  ],

  legs: [
    {
      id: 'legs_cloth_pants',
      name: 'Cloth Pants',
      rarity: 'common',
      prompt: `small brown cloth pants for lower body, pixel art legs overlay for chibi character, positioned at y:75-110 in 128x128 canvas, pants area 35x35 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'legs_leather',
      name: 'Leather Leggings',
      rarity: 'common',
      prompt: `small brown leather leggings, pixel art legs overlay for chibi character lower body, y:70-110 in 128x128 canvas, 40x40 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'legs_chainmail',
      name: 'Chainmail Leggings',
      rarity: 'uncommon',
      prompt: `small chainmail leg armor, pixel art legs overlay for chibi character, y:70-115 in 128x128 canvas, leg armor 45x45 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
    {
      id: 'legs_plate',
      name: 'Plate Legguards',
      rarity: 'rare',
      prompt: `small plate armor legguards, pixel art legs overlay for chibi character, positioned y:65-115 in 128x128 canvas, 50x50 pixels, ${STYLE}`,
      size: { width: 128, height: 128 },
    },
  ],
};

// Negative prompt to avoid full-body or oversized items
const NEGATIVE_PROMPT = 'full body, full character, face, head, large, oversized, fills canvas, centered item, standalone item, inventory icon, item showcase, white background, solid background';

async function generateOverlay(category, item) {
  const categoryDir = path.join(OUTPUT_DIR, category);
  const outputPath = path.join(categoryDir, `${item.id}.png`);

  // Skip if exists
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipping ${item.name} (exists)`);
    return { success: true, skipped: true };
  }

  console.log(`\n🎨 Generating: ${item.name} (${item.rarity})`);
  console.log(`   Prompt: ${item.prompt.substring(0, 80)}...`);

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
        image_size: item.size,
        text_guidance_scale: item.rarity === 'legendary' ? 9.5 : 8.5,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log(`   💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);

    // Ensure directory exists
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Save image
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
    console.log(`   ✅ Saved: ${item.id}.png`);

    return { success: true, cost: data.usage?.usd || 0 };
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🎯 PROPER EQUIPMENT OVERLAY GENERATION');
  console.log('=====================================');
  console.log('Generating overlays with correct SIZE and POSITION\n');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let totalItems = 0;
  let successCount = 0;
  let totalCost = 0;

  for (const [category, items] of Object.entries(EQUIPMENT_SPECS)) {
    console.log(`\n📦 ${category.toUpperCase()}`);
    console.log('─'.repeat(40));

    for (const item of items) {
      totalItems++;
      const result = await generateOverlay(category, item);

      if (result.success) {
        successCount++;
        if (result.cost) totalCost += result.cost;
      }

      // Rate limiting - wait between API calls
      if (!result.skipped) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  console.log('\n=====================================');
  console.log(`✨ Complete! ${successCount}/${totalItems} generated`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
