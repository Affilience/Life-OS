/**
 * Regenerate Mythical Legs using Iron Legguards as shape reference
 * Uses PixelLab's image-to-image to maintain exact silhouette
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/rotate-stylize';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment/legs');

// Load reference image (iron_legguards)
const referenceImage = fs.readFileSync(path.join(BASE_DIR, 'iron_legguards.png'));
const referenceBase64 = referenceImage.toString('base64');

const ITEMS = [
  {
    file: 'void_greaves.png',
    name: 'Void Greaves',
    prompt: 'dark purple-black void metal leg armor, glowing violet magical runes, shadow energy wisps, ethereal dark fantasy armor',
  },
  {
    file: 'crystal_legguards.png',
    name: 'Crystal Legguards',
    prompt: 'crystalline ice blue leg armor, glowing cyan frost crystals embedded, translucent icy magical armor, frozen fantasy armor',
  },
  {
    file: 'celestial_tassets.png',
    name: 'Celestial Tassets',
    prompt: 'divine golden ornate leg armor, white angelic feather engravings, holy light glow, sacred celestial paladin armor',
  },
  {
    file: 'abyssal_cuisses.png',
    name: 'Abyssal Cuisses',
    prompt: 'deep sea dark teal leg armor, bioluminescent aqua glowing patterns, underwater coral textures, ocean themed armor',
  },
  {
    file: 'stormforged_greaves.png',
    name: 'Stormforged Greaves',
    prompt: 'electrified dark steel leg armor, crackling blue lightning patterns, electrical storm energy, thunder knight armor',
  },
  {
    file: 'infernal_legguards.png',
    name: 'Infernal Legguards',
    prompt: 'demonic black iron leg armor, molten orange-red lava cracks, hellfire ember glow, volcanic demon armor',
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
      image: { type: 'base64', base64: referenceBase64 },
      from_direction: 'south',
      to_direction: 'south',
      description: prompt,
      image_size: { width: 64, height: 64 },
      guidance: 0.6, // Balance between reference shape and new style
      no_background: true,
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.image.base64.replace(/^data:image\/png;base64,/, '');
}

async function main() {
  console.log('🦵 REGENERATING MYTHICAL LEGS');
  console.log('Using iron_legguards as shape reference\n');

  const args = process.argv.slice(2);
  let items = ITEMS;

  if (args.length > 0) {
    items = ITEMS.filter(i =>
      args.some(a => i.file.includes(a) || i.name.toLowerCase().includes(a.toLowerCase()))
    );
  }

  for (const item of items) {
    console.log(`Generating ${item.name}...`);
    try {
      const img = await generate(item.prompt);
      fs.writeFileSync(path.join(BASE_DIR, item.file), Buffer.from(img, 'base64'));
      console.log(`✅ ${item.file}\n`);
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      console.log(`❌ ${e.message}\n`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log('Done!');
}

main();
