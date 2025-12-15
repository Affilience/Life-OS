/**
 * Fix:
 * 1. Capes - remove hands from storyteller_cloak and traveler_cloak
 * 2. Chests - open neck (no black area), shoulders are the top
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment');

// Capes that need hands removed
const CAPES = [
  {
    filename: 'storyteller_cloak.png',
    folder: 'capes',
    prompt: 'pixel art purple storyteller cloak cape, flowing magical cape with gold trim and runes, NO hands NO arms NO body, just the cape fabric hanging, back view cape, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
  {
    filename: 'traveler_cloak.png',
    folder: 'capes',
    prompt: 'pixel art brown traveler cloak cape, worn weathered travel cape with hood down, NO hands NO arms NO body, just the cape fabric hanging, back view cape, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
];

// Chests that need open neck (no black bit, shoulders are the top)
const CHESTS = [
  {
    filename: 'armor_cosmic.png',
    folder: 'chests',
    prompt: 'pixel art cosmic purple chestplate armor, torso armor with WIDE OPEN neck showing skin, shoulders are the highest point with NO collar NO neck coverage NO black area at top, glowing ethereal stars and galaxies, isolated chest piece, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
  {
    filename: 'armor_plate.png',
    folder: 'chests',
    prompt: 'pixel art steel plate chestplate armor, torso armor with WIDE OPEN neck showing skin, shoulders are the highest point with NO collar NO neck coverage NO black area at top, polished silver metal plates, isolated chest piece, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
  {
    filename: 'dragon_cuirass.png',
    folder: 'chests',
    prompt: 'pixel art dragon scale cuirass armor, torso armor with WIDE OPEN neck showing skin, shoulders are the highest point with NO collar NO neck coverage NO black area at top, red and gold dragon scales, isolated chest piece, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
  {
    filename: 'leather_vest.png',
    folder: 'chests',
    prompt: 'pixel art brown leather vest, torso vest with WIDE OPEN neck showing skin, shoulders are the highest point with NO collar NO neck coverage NO black area at top, simple leather with straps, isolated chest piece, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
  {
    filename: 'padded_armor.png',
    folder: 'chests',
    prompt: 'pixel art quilted padded armor vest, torso armor with WIDE OPEN neck showing skin, shoulders are the highest point with NO collar NO neck coverage NO black area at top, beige quilted fabric padding, isolated chest piece, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
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
  const allItems = [
    ...CAPES.map(c => ({ ...c, negativePrompt: 'hands, arms, fingers, body, person, face, head, front view' })),
    ...CHESTS.map(c => ({ ...c, negativePrompt: 'collar, turtleneck, neck coverage, black neck area, closed neck, full body, head, face, helmet, high collar' })),
  ];

  console.log(`Fixing ${CAPES.length} capes and ${CHESTS.length} chests...`);
  console.log('');
  console.log('Capes: removing hands');
  console.log('Chests: open neck, shoulders are top (no black area)');
  console.log('');

  let successCount = 0;
  let totalCost = 0;

  for (const item of allItems) {
    try {
      process.stdout.write(`Generating: ${item.folder}/${item.filename}... `);
      const result = await generateImage(item.prompt, item.negativePrompt);

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
