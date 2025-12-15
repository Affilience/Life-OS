/**
 * Regenerate leg sprites with:
 * 1. NO boots/feet - legs end at ankles
 * 2. Legs angled outward in wide V-stance like stage 10 swordsman
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment/legs');

// Common negative prompt to exclude boots/feet
const NEGATIVE_PROMPT = 'boots, feet, shoes, footwear, socks, ankles showing, toes, full body, torso, head, arms, side view, single leg, legs together, closed stance';

// Legs with very explicit "no feet" and "V-stance" instructions
const LEGS_PIECES = [
  {
    filename: 'cloth_pants.png',
    prompt: 'pixel art brown cloth pants, LEGS ONLY cut off at ankle, two separate pant legs in wide V-shape stance angled outward 45 degrees, simple peasant trousers, TRANSPARENT BACKGROUND, no body above waist, equipment sprite, RPG game asset, 64x64',
  },
  {
    filename: 'leather_leggings.png',
    prompt: 'pixel art brown leather leggings, LEGS ONLY cut off at ankle, two separate leg pieces in wide V-shape stance angled outward 45 degrees, adventurer pants with stitching, TRANSPARENT BACKGROUND, no body above waist, equipment sprite, RPG game asset, 64x64',
  },
  {
    filename: 'chainmail_leggings.png',
    prompt: 'pixel art silver chainmail leggings, LEGS ONLY cut off at ankle, two separate armored legs in wide V-shape stance angled outward 45 degrees, metal mesh leg armor, TRANSPARENT BACKGROUND, no body above waist, equipment sprite, RPG game asset, 64x64',
  },
  {
    filename: 'iron_legguards.png',
    prompt: 'pixel art grey iron plate leg armor, LEGS ONLY cut off at ankle, two separate armored legs in wide V-shape stance angled outward 45 degrees, metal legguards with knee plates, TRANSPARENT BACKGROUND, no body above waist, equipment sprite, RPG game asset, 64x64',
  },
  {
    filename: 'dragon_legguards.png',
    prompt: 'pixel art red dragon scale leg armor, LEGS ONLY cut off at ankle, two separate armored legs in wide V-shape stance angled outward 45 degrees, epic dragon leather legguards with gold trim, TRANSPARENT BACKGROUND, no body above waist, equipment sprite, RPG game asset, 64x64',
  },
  {
    filename: 'phoenix_legguards.png',
    prompt: 'pixel art fiery orange phoenix leg armor, LEGS ONLY cut off at ankle, two separate armored legs in wide V-shape stance angled outward 45 degrees, legendary glowing golden legguards with flame details, TRANSPARENT BACKGROUND, no body above waist, equipment sprite, RPG game asset, 64x64',
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

  console.log(`Regenerating ${LEGS_PIECES.length} leg sprites...`);
  console.log('Requirements:');
  console.log('  - NO boots/feet - legs end at ankles');
  console.log('  - Wide V-stance angled outward like stage 10 swordsman');
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
