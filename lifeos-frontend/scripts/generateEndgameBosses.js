/**
 * Generate Endgame Boss Sprites using PixelLab API
 * Creates terrifying boss sprites for level 50+ endgame bosses
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BOSSES = [
  {
    filename: 'boss_void_titan.png',
    prompt: 'pixel art RPG boss monster, Void Titan, colossal humanoid entity made of swirling void energy and darkness, massive muscular intimidating form with glowing purple cracks throughout body, empty void face with glowing purple eyes, cosmic horror eldritch aesthetic, dark purple and black color scheme with ethereal purple glow, front facing view, 128x128 game sprite, transparent background',
    negative: 'cute, friendly, small, weak, cartoony, chibi',
  },
  {
    filename: 'boss_celestial_guardian.png',
    prompt: 'pixel art RPG boss monster, Celestial Guardian, majestic angelic warrior in brilliant shining golden armor, large magnificent white feathered wings spread wide, glowing golden halo above head, wielding radiant sword of pure light, divine holy appearance, white and gold color scheme with bright yellow divine glow effects, front facing view, 128x128 game sprite, transparent background',
    negative: 'dark, evil, demonic, corrupted, black',
  },
  {
    filename: 'boss_archangel.png',
    prompt: 'pixel art RPG boss monster, Archangel, supreme celestial being with six magnificent glowing white wings, ornate golden battle armor with holy symbols and engravings, flaming sword of divine fire in hand, intense radiance emanating from body, crown of pure light, white gold and orange holy fire colors, front facing view, 128x128 game sprite, transparent background',
    negative: 'dark, evil, fallen, corrupted, demonic',
  },
  {
    filename: 'boss_solar_emperor.png',
    prompt: 'pixel art RPG boss monster, Solar Emperor, humanoid sun god entity, body made of molten solar plasma and raging fire, wearing imperial crown of solar flares and prominences, intense orange and yellow flames surrounding entire body, regal powerful imperial stance, radiating intense heat and blinding light, orange red yellow and white hot colors, front facing view, 128x128 game sprite, transparent background',
    negative: 'cold, ice, dark, water, blue',
  },
  {
    filename: 'boss_frost_monarch.png',
    prompt: 'pixel art RPG boss monster, Frost Monarch, elegant ice king with majestic crown of sharp icicles, body partially made of translucent crystalline ice, flowing frozen cape of snow, holding ornate staff topped with giant snowflake crystal, cold freezing mist emanating from body, pale blue white and cyan ice colors with cold glow, front facing view, 128x128 game sprite, transparent background',
    negative: 'fire, warm, red, orange, flames',
  },
  {
    filename: 'boss_storm_lord.png',
    prompt: 'pixel art RPG boss monster, Storm Lord, powerful elemental entity of lightning and thunder, muscular body crackling with purple and blue electricity, dark storm clouds swirling around shoulders and head, holding massive crackling lightning bolt as weapon, glowing electric eyes, dark purple gray and bright electric blue colors with electric glow, front facing view, 128x128 game sprite, transparent background',
    negative: 'calm, peaceful, sunny, fire, ice',
  },
  {
    filename: 'boss_elemental_king.png',
    prompt: 'pixel art RPG boss monster, Elemental King, ultimate elemental master, body divided into four quadrants representing fire ice lightning and earth elements, wearing magnificent crown that combines all four elements, each arm channeling different elemental power, swirling chaotic elemental energy around entire body, rainbow of elemental colors red orange blue cyan purple green brown, front facing view, 128x128 game sprite, transparent background',
    negative: 'simple, plain, single color, mundane',
  },
];

async function generate(prompt, negative) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: prompt,
      negative_description: negative,
      image_size: { width: 128, height: 128 },
      text_guidance_scale: 10,
      no_background: true,
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }

  const data = await res.json();
  console.log(`   Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);
  return data.image.base64.replace(/^data:image\/png;base64,/, '');
}

async function main() {
  console.log('========================================');
  console.log('  GENERATING ENDGAME BOSS SPRITES');
  console.log('  Level 50+ Terrifying Bosses');
  console.log('========================================\n');

  const outputDir = path.join(__dirname, '../public/assets/bosses');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let totalCost = 0;

  for (const boss of BOSSES) {
    console.log(`Generating: ${boss.filename}...`);
    try {
      const img = await generate(boss.prompt, boss.negative);
      const outputPath = path.join(outputDir, boss.filename);
      fs.writeFileSync(outputPath, Buffer.from(img, 'base64'));
      console.log(`   ✅ Saved: ${boss.filename}\n`);

      // Rate limit - wait between requests
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}\n`);
      // Continue with next boss even if one fails
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('========================================');
  console.log('  GENERATION COMPLETE!');
  console.log(`  Generated ${BOSSES.length} boss sprites`);
  console.log('========================================');
}

main();
