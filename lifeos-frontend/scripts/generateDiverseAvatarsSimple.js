/**
 * Simple Diverse Avatar Generator
 * Just 4 key skin tones: White, Asian, Brown, Black
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// 4 distinct skin tones
const AVATARS = [
  // MALE
  {
    id: 'hero_white',
    filename: 'hero_stage_10_white.png',
    prompt: 'PALE WHITE SKIN man, European Caucasian complexion, pixel art RPG warrior, short brown hair, muscular athletic build, brown sleeveless tunic and brown cloth pants, leather sandals, combat ready stance with feet apart, front facing view, 128x128 game sprite, transparent background',
  },
  {
    id: 'hero_asian',
    filename: 'hero_stage_10_asian.png',
    prompt: 'EAST ASIAN SKIN man, light tan Chinese Japanese Korean complexion, pixel art RPG warrior, short black hair, muscular athletic build, brown sleeveless tunic and brown cloth pants, leather sandals, combat ready stance with feet apart, front facing view, 128x128 game sprite, transparent background',
  },
  {
    id: 'hero_brown',
    filename: 'hero_stage_10_brown.png',
    prompt: 'BROWN SKIN man, medium brown South Asian Indian complexion, pixel art RPG warrior, short black hair, muscular athletic build, brown sleeveless tunic and brown cloth pants, leather sandals, combat ready stance with feet apart, front facing view, 128x128 game sprite, transparent background',
  },
  {
    id: 'hero_black',
    filename: 'hero_stage_10_black.png',
    prompt: 'DARK BLACK SKIN man, deep dark African complexion, pixel art RPG warrior, short black hair, muscular athletic build, brown sleeveless tunic and brown cloth pants, leather sandals, combat ready stance with feet apart, front facing view, 128x128 game sprite, transparent background',
  },
  // FEMALE
  {
    id: 'heroine_white',
    filename: 'heroine_stage_10_white.png',
    prompt: 'PALE WHITE SKIN woman, European Caucasian complexion, pixel art RPG warrior, long brown hair in ponytail, athletic feminine build, brown sleeveless tunic and brown cloth pants, leather sandals, combat ready stance with feet apart, front facing view, 128x128 game sprite, transparent background',
  },
  {
    id: 'heroine_asian',
    filename: 'heroine_stage_10_asian.png',
    prompt: 'EAST ASIAN SKIN woman, light tan Chinese Japanese Korean complexion, pixel art RPG warrior, long black hair in ponytail, athletic feminine build, brown sleeveless tunic and brown cloth pants, leather sandals, combat ready stance with feet apart, front facing view, 128x128 game sprite, transparent background',
  },
  {
    id: 'heroine_brown',
    filename: 'heroine_stage_10_brown.png',
    prompt: 'BROWN SKIN woman, medium brown South Asian Indian complexion, pixel art RPG warrior, long black hair in ponytail, athletic feminine build, brown sleeveless tunic and brown cloth pants, leather sandals, combat ready stance with feet apart, front facing view, 128x128 game sprite, transparent background',
  },
  {
    id: 'heroine_black',
    filename: 'heroine_stage_10_black.png',
    prompt: 'DARK BLACK SKIN woman, deep dark African complexion, pixel art RPG warrior, long black hair in ponytail, athletic feminine build, brown sleeveless tunic and brown cloth pants, leather sandals, combat ready stance with feet apart, front facing view, 128x128 game sprite, transparent background',
  },
];

const NEGATIVE_PROMPT = 'armor, helmet, weapon, sword, shield, multiple characters, background, scenery';

async function generateSprite(prompt, label) {
  console.log(`\n🎨 ${label}`);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: prompt,
      negative_description: NEGATIVE_PROMPT,
      image_size: { width: 128, height: 128 },
      text_guidance_scale: 10,
      no_background: true,
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`   💰 $${data.usage?.usd?.toFixed(4) || '?'}`);
  return data.image.base64.replace(/^data:image\/png;base64,/, '');
}

function saveSprite(base64Data, filename) {
  const outputPath = path.join(__dirname, '..', 'public', 'assets', 'avatar', 'diverse', filename);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
  console.log(`   ✅ ${filename}`);
}

async function main() {
  console.log('🎭 DIVERSE AVATARS (4 Skin Tones)');
  console.log('═'.repeat(40));

  const args = process.argv.slice(2);
  let avatars = AVATARS;
  if (args.includes('--hero')) avatars = avatars.filter(a => a.id.startsWith('hero'));
  if (args.includes('--heroine')) avatars = avatars.filter(a => a.id.startsWith('heroine'));

  console.log(`\nGenerating ${avatars.length} avatars...\n`);

  let success = 0;
  for (let i = 0; i < avatars.length; i++) {
    try {
      const img = await generateSprite(avatars[i].prompt, avatars[i].id);
      saveSprite(img, avatars[i].filename);
      success++;
      if (i < avatars.length - 1) await new Promise(r => setTimeout(r, 4000));
    } catch (e) {
      console.log(`   ❌ ${e.message}`);
      await new Promise(r => setTimeout(r, 6000));
    }
  }

  console.log(`\n${'═'.repeat(40)}`);
  console.log(`✅ Done: ${success}/${avatars.length}`);
}

main().catch(console.error);
