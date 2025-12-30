/**
 * Regenerate Mythical Legs V3
 * Match iron_legguards/dragon_legguards style:
 * - Wide V-stance legs spread far apart
 * - Armored plating with knee guards
 * - Boots at bottom (NOT bare feet)
 * - Connected at waist/hip
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment/legs');

const NEGATIVE = 'tight pants, skinny, legs together, narrow stance, side view, single leg, full body, torso, chest, head, face, arms, hands, bare feet, no boots, sandals';

// Match iron_legguards style - baggy armored pants with boots in wide V-stance
const ITEMS = [
  {
    file: 'void_greaves.png',
    name: 'Void Greaves',
    prompt: 'pixel art wide baggy void armor pants with boots, two legs spread very far apart in wide V-stance, loose dark purple-black shadow metal armored leggings with knee plates, glowing violet runes, armored boots, connected at waist, front facing view, TRANSPARENT BACKGROUND, RPG leg armor sprite, 64x64',
  },
  {
    file: 'crystal_legguards.png',
    name: 'Crystal Legguards',
    prompt: 'pixel art wide baggy crystal ice armor pants with boots, two legs spread very far apart in wide V-stance, loose cyan crystalline metal armored leggings with knee plates, glowing frost crystals, armored boots, connected at waist, front facing view, TRANSPARENT BACKGROUND, RPG leg armor sprite, 64x64',
  },
  {
    file: 'celestial_tassets.png',
    name: 'Celestial Tassets',
    prompt: 'pixel art wide baggy celestial armor pants with boots, two legs spread very far apart in wide V-stance, loose golden divine metal armored leggings with knee plates, angelic feather engravings, holy glow, armored boots, connected at waist, front facing view, TRANSPARENT BACKGROUND, RPG leg armor sprite, 64x64',
  },
  {
    file: 'abyssal_cuisses.png',
    name: 'Abyssal Cuisses',
    prompt: 'pixel art wide baggy abyssal armor pants with boots, two legs spread very far apart in wide V-stance, loose dark teal deep sea metal armored leggings with knee plates, bioluminescent aqua glow, armored boots, connected at waist, front facing view, TRANSPARENT BACKGROUND, RPG leg armor sprite, 64x64',
  },
  {
    file: 'stormforged_greaves.png',
    name: 'Stormforged Greaves',
    prompt: 'pixel art wide baggy storm armor pants with boots, two legs spread very far apart in wide V-stance, loose dark steel electrified metal armored leggings with knee plates, blue lightning crackling, armored boots, connected at waist, front facing view, TRANSPARENT BACKGROUND, RPG leg armor sprite, 64x64',
  },
  {
    file: 'infernal_legguards.png',
    name: 'Infernal Legguards',
    prompt: 'pixel art wide baggy infernal armor pants with boots, two legs spread very far apart in wide V-stance, loose black demon iron armored leggings with knee plates, molten orange-red lava cracks glowing, armored boots, connected at waist, front facing view, TRANSPARENT BACKGROUND, RPG leg armor sprite, 64x64',
  },
];

async function generate(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: prompt,
      negative_description: NEGATIVE,
      image_size: { width: 64, height: 64 },
      text_guidance_scale: 9,
      no_background: true,
    }),
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.image.base64.replace(/^data:image\/png;base64,/, '');
}

async function main() {
  console.log('🦵 MYTHICAL LEGS V3 - Matching iron_legguards style');
  console.log('Wide V-stance + armor plating + boots\n');

  const args = process.argv.slice(2);
  let items = ITEMS;
  if (args.length > 0) {
    items = ITEMS.filter(i => args.some(a =>
      i.file.includes(a) || i.name.toLowerCase().includes(a.toLowerCase())
    ));
  }

  console.log(`Generating ${items.length} items...\n`);

  for (const item of items) {
    process.stdout.write(`${item.name}... `);
    try {
      const img = await generate(item.prompt);
      fs.writeFileSync(path.join(BASE_DIR, item.file), Buffer.from(img, 'base64'));
      console.log('✅');
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      console.log(`❌ ${e.message}`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log('\nDone!');
}

main();
