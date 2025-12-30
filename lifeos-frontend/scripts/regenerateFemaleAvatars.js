/**
 * Regenerate Brown and Black Female Avatars
 * Very detailed prompts matching white heroine exactly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Exact white prompt for reference:
// 'PALE WHITE SKIN woman, European Caucasian complexion, pixel art RPG warrior, long brown hair in ponytail, athletic feminine build, brown sleeveless tunic and brown cloth pants, leather sandals, combat ready stance with feet apart, front facing view, 128x128 game sprite, transparent background'

// Generate very dark black avatar matching brown avatar pose
const AVATARS = [
  {
    filename: 'heroine_stage_10_black.png',
    // Match the brown avatar (v1) - standing straight, brown top, brown/khaki pants, arms at sides
    prompt: 'VERY DARK BLACK SKIN woman, deep dark ebony African complexion, pixel art RPG warrior, long dark braided hair, athletic feminine build, brown crop top and khaki brown pants, brown boots, standing straight neutral pose arms at sides feet apart, front facing view, 128x128 game sprite, transparent background',
  },
];

const NEGATIVE = 'white skin, pale skin, light skin, brown skin, medium skin, tan skin, red hair, blonde hair';

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
      image_size: { width: 128, height: 128 },
      text_guidance_scale: 12,
      no_background: true,
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }

  const data = await res.json();
  console.log(`💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);
  return data.image.base64.replace(/^data:image\/png;base64,/, '');
}

async function main() {
  console.log('🎨 REGENERATING FEMALE AVATARS');
  console.log('Generating 3 variations each - pick the best');
  console.log('═'.repeat(50));

  for (const avatar of AVATARS) {
    const baseName = avatar.filename.replace('.png', '');

    for (let i = 1; i <= 3; i++) {
      console.log(`\nGenerating ${baseName}_v${i}.png...`);
      try {
        const img = await generate(avatar.prompt);
        const outputPath = path.join(__dirname, '../public/assets/avatar/diverse', `${baseName}_v${i}.png`);
        fs.writeFileSync(outputPath, Buffer.from(img, 'base64'));
        console.log(`✅ Saved: ${baseName}_v${i}.png`);
        await new Promise(r => setTimeout(r, 3000));
      } catch (e) {
        console.log(`❌ Error: ${e.message}`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('Done! Review the _v1, _v2, _v3 files and rename the best one.');
}

main();
