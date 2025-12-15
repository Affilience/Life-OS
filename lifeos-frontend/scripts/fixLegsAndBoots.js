/**
 * Fix:
 * 1. Phoenix legguards - more visually impressive and MUCH wider
 * 2. Chainmail leggings - MUCH wider
 * 3. All boots - MUCH wider, designed to overlay on top of legs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment');

// Legs that need to be wider
const LEGS = [
  {
    filename: 'phoenix_legguards.png',
    folder: 'legs',
    prompt: 'pixel art epic phoenix flame leg armor, VERY WIDE spread legs in extreme V-stance, magnificent golden and orange fire legguards with glowing flames and feather details, legendary ornate design, legs end at ankles NO feet NO boots, front facing view, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
    negative: 'narrow legs, legs together, boots, feet, shoes, tight pants, skinny, simple, plain',
  },
  {
    filename: 'chainmail_leggings.png',
    folder: 'legs',
    prompt: 'pixel art silver chainmail leg armor, VERY WIDE spread legs in extreme V-stance, baggy loose chainmail mesh pants over cloth, legs end at ankles NO feet NO boots, front facing view, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
    negative: 'narrow legs, legs together, boots, feet, shoes, tight pants, skinny, form fitting',
  },
];

// All boots - much wider, designed to overlay on legs
const BOOTS = [
  {
    filename: 'cloth_shoes.png',
    folder: 'boots',
    prompt: 'pixel art pair of brown cloth shoes, VERY WIDE spread apart in extreme V-stance matching wide leg armor, simple peasant footwear designed as overlay for leg sprites, front facing view, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
    negative: 'narrow, close together, legs, pants, single shoe',
  },
  {
    filename: 'leather_boots.png',
    folder: 'boots',
    prompt: 'pixel art pair of brown leather boots, VERY WIDE spread apart in extreme V-stance matching wide leg armor, adventurer boots designed as overlay for leg sprites, front facing view, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
    negative: 'narrow, close together, legs, pants, single boot',
  },
  {
    filename: 'iron_boots.png',
    folder: 'boots',
    prompt: 'pixel art pair of iron armored boots, VERY WIDE spread apart in extreme V-stance matching wide leg armor, grey metal plated boots designed as overlay for leg sprites, front facing view, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
    negative: 'narrow, close together, legs, pants, single boot',
  },
  {
    filename: 'steel_greaves_boots.png',
    folder: 'boots',
    prompt: 'pixel art pair of steel greaves boots, VERY WIDE spread apart in extreme V-stance matching wide leg armor, shiny polished knight boots designed as overlay for leg sprites, front facing view, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
    negative: 'narrow, close together, legs, pants, single boot',
  },
  {
    filename: 'phoenix_boots.png',
    folder: 'boots',
    prompt: 'pixel art pair of epic phoenix flame boots, VERY WIDE spread apart in extreme V-stance matching wide leg armor, magnificent golden boots with fire and feather details designed as overlay for leg sprites, front facing view, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
    negative: 'narrow, close together, legs, pants, single boot, simple, plain',
  },
];

async function generateImage(description, negativePrompt) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      description,
      negative_description: negativePrompt,
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
  const allItems = [...LEGS, ...BOOTS];

  console.log(`Fixing ${LEGS.length} legs and ${BOOTS.length} boots...`);
  console.log('');
  console.log('Legs: MUCH wider V-stance');
  console.log('Boots: MUCH wider, overlay on top of legs');
  console.log('');

  let successCount = 0;
  let totalCost = 0;

  for (const item of allItems) {
    try {
      process.stdout.write(`Generating: ${item.folder}/${item.filename}... `);
      const result = await generateImage(item.prompt, item.negative);

      if (result.image?.base64) {
        const filepath = path.join(BASE_DIR, item.folder, item.filename);
        const base64Data = result.image.base64.replace(/^data:image\/png;base64,/, '');
        await saveImage(base64Data, filepath);
        console.log('✓');
        successCount++;
        if (result.usage?.usd) totalCost += result.usage.usd;
      } else if (result.error) {
        console.log(`✗ ${result.error}`);
      } else {
        console.log('✗ No image returned');
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.log(`✗ ${err.message}`);
    }
  }

  console.log(`\nComplete: ${successCount}/${allItems.length} items regenerated`);
  if (totalCost > 0) console.log(`Total cost: $${totalCost.toFixed(4)}`);
}

main().catch(console.error);
