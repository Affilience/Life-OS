/**
 * Fix Mythical Legs Shape
 * Match the WIDE V-STANCE of iron_legguards - legs spread far apart
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment/legs');

// CRITICAL: Wide V-stance like iron_legguards - NOT two separate boots
const BASE_SHAPE = `pixel art leg armor, WIDE V-STANCE with legs spread FAR apart like standing with feet shoulder-width, connected at waist/hip area, baggy armored pants shape with knee plates and shin guards, armored boots at bottom, front facing view, single piece of equipment, RPG game sprite overlay, 64x64 pixels, TRANSPARENT BACKGROUND`;

const NEGATIVE = 'two separate boots, legs together, narrow stance, side view, full body, torso, head, arms, background';

const ITEMS = [
  {
    file: 'void_greaves.png',
    name: 'Void Greaves',
    style: 'dark purple-black shadow metal, glowing violet runes, ethereal void energy wisps',
  },
  {
    file: 'infernal_legguards.png',
    name: 'Infernal Legguards',
    style: 'black demonic iron with molten orange-red lava cracks, hellfire ember glow, charred volcanic metal',
  },
];

async function generate(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: prompt,
      negative_description: NEGATIVE,
      image_size: { width: 64, height: 64 },
      text_guidance_scale: 9,
      no_background: true,
    })
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.image.base64.replace(/^data:image\/png;base64,/, '');
}

async function main() {
  console.log('🔧 FIXING MYTHICAL LEGS SHAPE');
  console.log('Target: Wide V-stance like iron_legguards\n');

  for (const item of ITEMS) {
    const prompt = `${BASE_SHAPE}, ${item.style}`;
    console.log(`Generating ${item.name}...`);

    try {
      const img = await generate(prompt);
      fs.writeFileSync(path.join(BASE_DIR, item.file), Buffer.from(img, 'base64'));
      console.log(`✅ Saved ${item.file}\n`);
      await new Promise(r => setTimeout(r, 4000));
    } catch (e) {
      console.log(`❌ ${e.message}\n`);
    }
  }

  console.log('Done!');
}

main();
