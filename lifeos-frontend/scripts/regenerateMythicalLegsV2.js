/**
 * Regenerate Mythical Leg Armor V2
 *
 * Creates proper ARMORED leg pieces with:
 * - Same V-stance silhouette as existing armor (iron_legguards, dragon_legguards)
 * - Metal plating, knee guards, shin guards, thigh plates
 * - Armored boots/footwear (NOT bare feet)
 * - Mythical effects and colors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment/legs');

// Negative prompt to avoid wrong outputs
const NEGATIVE_PROMPT = `bare feet, barefoot, toes, joggers, sweatpants, cloth pants, casual wear,
full body, torso, upper body, chest, head, face, arms, hands,
tight pants, skinny, legs together, closed stance, side view, profile,
background, scenery, floor, ground, single leg`;

// Base armor style - reference iron_legguards and dragon_legguards
const BASE_ARMOR_STYLE = `pixel art leg armor sprite, two armored legs spread apart in wide V-stance,
metal plated thigh armor with knee guards, armored shin guards, fantasy armored boots,
front facing view, RPG equipment overlay, TRANSPARENT BACKGROUND, 64x64 pixels`;

// Mythical leg armor pieces
const MYTHICAL_LEGS = [
  {
    filename: 'void_greaves.png',
    name: 'Void Greaves',
    prompt: `${BASE_ARMOR_STYLE}, dark purple-black void metal armor, glowing violet runes on plates, shadow energy wisps emanating, ethereal dark plating with mystical engravings, mythical shadow knight leg armor`,
  },
  {
    filename: 'crystal_legguards.png',
    name: 'Crystal Legguards',
    prompt: `${BASE_ARMOR_STYLE}, crystalline ice armor plates, embedded glowing cyan frost crystals, translucent icy metal with frozen patterns, magical ice knight leg armor, white and ice blue color scheme`,
  },
  {
    filename: 'celestial_tassets.png',
    name: 'Celestial Tassets',
    prompt: `${BASE_ARMOR_STYLE}, divine golden ornate armor plates, white angelic feather engravings, holy light glow effects, sacred celestial metal with heavenly patterns, gold and white paladin leg armor`,
  },
  {
    filename: 'abyssal_cuisses.png',
    name: 'Abyssal Cuisses',
    prompt: `${BASE_ARMOR_STYLE}, deep sea dark metal armor, bioluminescent teal and aqua glowing patterns, barnacle and coral textures on plates, underwater themed mystical armor, dark blue-green ocean knight leg armor`,
  },
  {
    filename: 'stormforged_greaves.png',
    name: 'Stormforged Greaves',
    prompt: `${BASE_ARMOR_STYLE}, electrified dark steel armor plates, crackling blue lightning patterns across metal, electrical energy arcing between plates, storm cloud colored metal, thunder knight leg armor`,
  },
  {
    filename: 'infernal_legguards.png',
    name: 'Infernal Legguards',
    prompt: `${BASE_ARMOR_STYLE}, demonic black iron armor plates, molten lava cracks glowing orange-red between plates, hellfire ember effects, charred volcanic metal, demon knight leg armor with fiery glow`,
  },
];

async function generateImage(description) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      description,
      negative_description: NEGATIVE_PROMPT,
      image_size: { width: 64, height: 64 },
      text_guidance_scale: 9,
      no_background: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function saveImage(base64Data, filepath) {
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filepath, buffer);
}

async function main() {
  // Parse args for selective regeneration
  const args = process.argv.slice(2);
  const onlyItems = args.filter(a => !a.startsWith('--'));

  let itemsToGenerate = MYTHICAL_LEGS;
  if (onlyItems.length > 0) {
    itemsToGenerate = MYTHICAL_LEGS.filter(item =>
      onlyItems.some(name => item.filename.includes(name) || item.name.toLowerCase().includes(name.toLowerCase()))
    );
  }

  console.log('🦵 MYTHICAL LEG ARMOR REGENERATION V2');
  console.log('═'.repeat(50));
  console.log('');
  console.log('📋 Style reference: iron_legguards, dragon_legguards');
  console.log('   - Metal plated armor with knee/shin guards');
  console.log('   - Armored boots (NOT bare feet)');
  console.log('   - Wide V-stance silhouette');
  console.log('');
  console.log(`📦 Items to regenerate: ${itemsToGenerate.length}`);
  if (onlyItems.length > 0) {
    console.log(`   Filter: ${onlyItems.join(', ')}`);
  }
  console.log('');

  let successCount = 0;
  let totalCost = 0;

  for (let i = 0; i < itemsToGenerate.length; i++) {
    const item = itemsToGenerate[i];

    console.log(`\n[${i + 1}/${itemsToGenerate.length}] ${item.name}`);
    console.log(`   File: ${item.filename}`);

    try {
      process.stdout.write('   Generating... ');
      const result = await generateImage(item.prompt);

      if (result.image?.base64) {
        const filepath = path.join(BASE_DIR, item.filename);
        const base64Data = result.image.base64.replace(/^data:image\/png;base64,/, '');
        await saveImage(base64Data, filepath);

        const cost = result.usage?.usd || 0;
        totalCost += cost;
        console.log(`✅ Saved ($${cost.toFixed(4)})`);
        successCount++;
      } else {
        console.log('❌ No image data returned');
      }

      // Rate limit delay - 5 seconds to be safe
      if (i < itemsToGenerate.length - 1) {
        console.log('   ⏳ Waiting 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      await new Promise(r => setTimeout(r, 8000));
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 REGENERATION COMPLETE');
  console.log('═'.repeat(50));
  console.log(`✅ Success: ${successCount}/${itemsToGenerate.length}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log('');
  console.log('💡 Usage: node scripts/regenerateMythicalLegsV2.js [item_name...]');
  console.log('   Example: node scripts/regenerateMythicalLegsV2.js crystal infernal');
}

main().catch(console.error);
