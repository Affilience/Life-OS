/**
 * Regenerate boot sprites with:
 * - Wide V-stance angled outward like stage 10 swordsman
 * - Feet spread apart, pointing outward
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment/boots');

const NEGATIVE_PROMPT = 'legs together, closed stance, side view, single boot, full body, torso, head, arms, realistic, 3d, blurry';

const BOOTS_PIECES = [
  {
    filename: 'cloth_shoes.png',
    prompt: 'pixel art pair of brown cloth shoes, two separate shoes in wide V-shape stance angled outward 45 degrees apart, simple peasant footwear, front facing view, TRANSPARENT BACKGROUND, equipment sprite, RPG game asset, 64x64',
  },
  {
    filename: 'leather_boots.png',
    prompt: 'pixel art pair of brown leather boots, two separate boots in wide V-shape stance angled outward 45 degrees apart, adventurer traveling boots, front facing view, TRANSPARENT BACKGROUND, equipment sprite, RPG game asset, 64x64',
  },
  {
    filename: 'iron_boots.png',
    prompt: 'pixel art pair of iron armored boots, two separate metal boots in wide V-shape stance angled outward 45 degrees apart, grey steel plated footwear, front facing view, TRANSPARENT BACKGROUND, equipment sprite, RPG game asset, 64x64',
  },
  {
    filename: 'steel_greaves_boots.png',
    prompt: 'pixel art pair of steel greaves boots, two separate armored boots in wide V-shape stance angled outward 45 degrees apart, shiny polished knight boots, front facing view, TRANSPARENT BACKGROUND, equipment sprite, RPG game asset, 64x64',
  },
  {
    filename: 'phoenix_boots.png',
    prompt: 'pixel art pair of phoenix flame boots, two separate golden boots in wide V-shape stance angled outward 45 degrees apart, fiery orange legendary boots with flame details, front facing view, TRANSPARENT BACKGROUND, equipment sprite, RPG game asset, 64x64',
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

  console.log(`Regenerating ${BOOTS_PIECES.length} boot sprites...`);
  console.log('Requirements:');
  console.log('  - Wide V-stance angled outward like stage 10 swordsman');
  console.log('  - Feet spread apart, pointing outward 45 degrees');
  console.log('');

  let successCount = 0;
  let totalCost = 0;

  for (const item of BOOTS_PIECES) {
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

  console.log(`\nComplete: ${successCount}/${BOOTS_PIECES.length} boots regenerated`);
  if (totalCost > 0) console.log(`Total cost: $${totalCost.toFixed(4)}`);
}

main().catch(console.error);
