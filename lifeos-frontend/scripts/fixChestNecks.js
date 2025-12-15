/**
 * Fix chest armor to cut off at shoulders - NO neck coverage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment/chests');

const CHESTS = [
  {
    filename: 'armor_cosmic.png',
    prompt: 'pixel art cosmic chestplate, torso armor ENDING AT SHOULDERS with completely open neckline, deep U-cut showing bare chest/skin at top, purple ethereal galaxy design with stars, shoulder pauldrons are the TOP of the armor, NO neck NO collar NO high cut, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
  {
    filename: 'armor_plate.png',
    prompt: 'pixel art steel plate chestplate, torso armor ENDING AT SHOULDERS with completely open neckline, deep U-cut showing bare chest/skin at top, polished silver metal plates, shoulder pauldrons are the TOP of the armor, NO neck NO collar NO high cut, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
  {
    filename: 'padded_armor.png',
    prompt: 'pixel art quilted padded vest, torso armor ENDING AT SHOULDERS with completely open neckline, deep U-cut showing bare chest/skin at top, beige tan quilted fabric, shoulders are the TOP of the armor, NO neck NO collar NO high cut, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
];

const NEGATIVE = 'neck coverage, collar, turtleneck, high neckline, closed neck, black area at neck, neck armor, gorget, full coverage';

async function generateImage(description) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      description,
      negative_description: NEGATIVE,
      image_size: { width: 64, height: 64 },
      text_guidance_scale: 10,
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
  console.log(`Fixing ${CHESTS.length} chest armors - cut off at shoulders, open neck...`);
  console.log('');

  let successCount = 0;
  let totalCost = 0;

  for (const item of CHESTS) {
    try {
      process.stdout.write(`Generating: ${item.filename}... `);
      const result = await generateImage(item.prompt);

      if (result.image?.base64) {
        const filepath = path.join(BASE_DIR, item.filename);
        const base64Data = result.image.base64.replace(/^data:image\/png;base64,/, '');
        await saveImage(base64Data, filepath);
        console.log('✓');
        successCount++;
        if (result.usage?.usd) totalCost += result.usage.usd;
      } else {
        console.log('✗ No image returned');
      }

      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.log(`✗ ${err.message}`);
    }
  }

  console.log(`\nComplete: ${successCount}/${CHESTS.length} items regenerated`);
  if (totalCost > 0) console.log(`Total cost: $${totalCost.toFixed(4)}`);
}

main().catch(console.error);
