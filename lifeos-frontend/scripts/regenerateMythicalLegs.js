/**
 * Regenerate Mythical Leg Armor to Match Cloth Pants Shape
 *
 * Recreates the 6 mythical leg pieces with the EXACT same silhouette as cloth_pants:
 * - Wide V-stance legs spread far apart
 * - Baggy/loose fitting style
 * - No boots/feet - ends at ankles
 * - Same proportions and stance width
 *
 * Items to regenerate:
 * 1. Void Greaves - Dark shadow armor with purple runes
 * 2. Crystal Legguards - Frost crystal armor (cyan)
 * 3. Celestial Tassets - Divine golden armor with feathers
 * 4. Abyssal Cuisses - Deep sea bioluminescent armor (teal)
 * 5. Stormforged Greaves - Lightning steel armor (blue)
 * 6. Infernal Legguards - Molten lava demon armor (red-orange)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment/legs');

// Critical negative prompt to ensure correct shape
const NEGATIVE_PROMPT = `boots, feet, shoes, footwear, tight pants, skinny legs, slim fit,
legs together, closed stance, narrow stance, side view, profile view, single leg,
full body, torso, upper body, head, face, arms, hands,
background, scenery, floor, ground, platform`;

// Base style description to match cloth_pants exactly
const BASE_STYLE = 'pixel art wide baggy pants, two legs spread very far apart in wide V-stance, loose fitting trousers, legs end at ankles with NO feet NO boots, front facing view, TRANSPARENT BACKGROUND, RPG equipment overlay sprite, 64x64 pixels';

// Mythical leg pieces with their unique characteristics
const MYTHICAL_LEGS = [
  {
    filename: 'void_greaves.png',
    name: 'Void Greaves',
    prompt: `${BASE_STYLE}, dark purple-black shadowy armor plating, glowing violet runes etched into metal, wispy shadow tendrils emanating from edges, ethereal void energy effect, mythical dark armor aesthetic`,
    colors: 'deep purple, black, violet glow',
  },
  {
    filename: 'crystal_legguards.png',
    name: 'Crystal Legguards',
    prompt: `${BASE_STYLE}, translucent crystalline ice armor, embedded frost crystals glowing cyan, faceted gem-like surface catching light, frozen magical aesthetic, icy blue and white color scheme, mythical frost armor`,
    colors: 'cyan, ice blue, white crystals',
  },
  {
    filename: 'celestial_tassets.png',
    name: 'Celestial Tassets',
    prompt: `${BASE_STYLE}, divine golden ornate armor plating, angelic white feather motifs along edges, holy light radiating softly, sacred celestial engravings, heavenly mythical armor, gold and white color scheme`,
    colors: 'gold, white, divine glow',
  },
  {
    filename: 'abyssal_cuisses.png',
    name: 'Abyssal Cuisses',
    prompt: `${BASE_STYLE}, deep sea dark armor with bioluminescent patterns, glowing teal and aqua markings like deep ocean creatures, barnacle and coral textures, mysterious underwater aesthetic, mythical abyssal armor`,
    colors: 'dark teal, aqua glow, deep blue',
  },
  {
    filename: 'stormforged_greaves.png',
    name: 'Stormforged Greaves',
    prompt: `${BASE_STYLE}, electrified steel armor plating, crackling lightning patterns across surface, blue electrical energy arcing between plates, storm cloud dark metal, thunderous mythical armor aesthetic`,
    colors: 'dark steel, electric blue, lightning',
  },
  {
    filename: 'infernal_legguards.png',
    name: 'Infernal Legguards',
    prompt: `${BASE_STYLE}, demonic dark iron armor with molten lava cracks glowing orange-red, hellfire emanating from seams, charred blackened metal with ember glow, fiery mythical demon armor`,
    colors: 'black iron, molten orange, red embers',
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
  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
  }

  console.log('🦵 MYTHICAL LEG ARMOR REGENERATION');
  console.log('═'.repeat(50));
  console.log('');
  console.log('📋 Target: Match cloth_pants silhouette exactly');
  console.log('   - Wide V-stance legs spread apart');
  console.log('   - Baggy/loose fitting style');
  console.log('   - No feet/boots - ends at ankles');
  console.log('');
  console.log(`📦 Items to regenerate: ${MYTHICAL_LEGS.length}`);
  console.log('');

  let successCount = 0;
  let totalCost = 0;

  for (let i = 0; i < MYTHICAL_LEGS.length; i++) {
    const item = MYTHICAL_LEGS[i];

    console.log(`\n[${i + 1}/${MYTHICAL_LEGS.length}] ${item.name}`);
    console.log(`   Colors: ${item.colors}`);
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

      // Rate limit delay
      if (i < MYTHICAL_LEGS.length - 1) {
        console.log('   ⏳ Waiting 3 seconds...');
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      // Wait longer on error
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 REGENERATION COMPLETE');
  console.log('═'.repeat(50));
  console.log(`✅ Success: ${successCount}/${MYTHICAL_LEGS.length}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log(`📁 Output: ${BASE_DIR}`);
  console.log('');
  console.log('🔍 Please verify the generated sprites match cloth_pants stance!');
}

main().catch(console.error);
