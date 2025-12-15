/**
 * Regenerate leg sprites to match cloth_pants style:
 * - Wide V-stance legs spread far apart
 * - No boots/feet - ends at ankles
 * - Baggy/wide legged pants style
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment/legs');

const NEGATIVE_PROMPT = 'boots, feet, shoes, tight pants, skinny legs, legs together, closed stance, side view, single leg, full body, torso, head, arms';

// Match cloth_pants style - wide baggy legs spread in V-stance
const LEGS_PIECES = [
  {
    filename: 'leather_leggings.png',
    prompt: 'pixel art wide baggy brown leather pants, two legs spread very far apart in wide V-stance, loose fitting adventurer trousers with stitching, legs end at ankles NO feet NO boots, front facing view, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
  {
    filename: 'chainmail_leggings.png',
    prompt: 'pixel art wide baggy chainmail pants, two legs spread very far apart in wide V-stance, loose silver chain mesh leggings over cloth, legs end at ankles NO feet NO boots, front facing view, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
  {
    filename: 'iron_legguards.png',
    prompt: 'pixel art wide baggy iron plated pants, two legs spread very far apart in wide V-stance, loose grey metal armored leggings with knee guards, legs end at ankles NO feet NO boots, front facing view, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
  {
    filename: 'dragon_legguards.png',
    prompt: 'pixel art wide baggy dragon scale pants, two legs spread very far apart in wide V-stance, loose red and gold dragon armor leggings, legs end at ankles NO feet NO boots, front facing view, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
  },
  {
    filename: 'phoenix_legguards.png',
    prompt: 'pixel art wide baggy phoenix flame pants, two legs spread very far apart in wide V-stance, loose fiery orange and gold legendary leggings with glow, legs end at ankles NO feet NO boots, front facing view, TRANSPARENT BACKGROUND, RPG equipment sprite, 64x64',
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

  console.log(`Regenerating ${LEGS_PIECES.length} leg sprites to match cloth_pants style...`);
  console.log('Requirements:');
  console.log('  - Wide baggy legs spread far apart in V-stance');
  console.log('  - No boots/feet - ends at ankles');
  console.log('');

  let successCount = 0;
  let totalCost = 0;

  for (const item of LEGS_PIECES) {
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

  console.log(`\nComplete: ${successCount}/${LEGS_PIECES.length} legs regenerated`);
  if (totalCost > 0) console.log(`Total cost: $${totalCost.toFixed(4)}`);
}

main().catch(console.error);
