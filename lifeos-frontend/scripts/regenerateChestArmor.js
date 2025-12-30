/**
 * Regenerate Chest Armor - Flat 2D Front-Facing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment/chests');

const NEGATIVE = '3D, perspective, angled, tilted, side view, turned, rotated, depth, arms, sleeves, mannequin, body, shoulders';

const ITEMS = [
  {
    file: 'stormforged_breastplate.png',
    name: 'Stormforged Breastplate',
    prompt: 'pixel art FLAT chest armor icon, 2D FRONT VIEW ONLY like inventory icon, sleeveless steel breastplate with blue lightning crackling patterns, NO BODY NO ARMS just the armor piece itself lying flat, RPG game item sprite style, 64x64, transparent background',
  },
  {
    file: 'abyssal_cuirass.png',
    name: 'Abyssal Cuirass',
    prompt: 'pixel art FLAT chest armor icon, 2D FRONT VIEW ONLY like inventory icon, sleeveless dark teal breastplate with bioluminescent aqua glow patterns, NO BODY NO ARMS just the armor piece itself lying flat, RPG game item sprite style, 64x64, transparent background',
  },
];

async function generate(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: prompt,
      negative_description: NEGATIVE,
      image_size: { width: 64, height: 64 },
      text_guidance_scale: 9,
      no_background: true,
    }),
  });
  if (!res.ok) throw new Error('API ' + res.status);
  const data = await res.json();
  return data.image.base64.replace(/^data:image\/png;base64,/, '');
}

async function main() {
  console.log('🛡️ CHEST ARMOR - Flat 2D Front-Facing\n');
  
  for (const item of ITEMS) {
    process.stdout.write(item.name + '... ');
    try {
      const img = await generate(item.prompt);
      fs.writeFileSync(path.join(BASE_DIR, item.file), Buffer.from(img, 'base64'));
      console.log('✅');
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      console.log('❌ ' + e.message);
    }
  }
  console.log('\nDone!');
}

main();
