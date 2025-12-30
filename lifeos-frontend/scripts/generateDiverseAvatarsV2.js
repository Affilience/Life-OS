/**
 * Diverse Avatar Generator V2
 * More explicit skin tone descriptions with color at the START of prompt
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Very distinct skin tones with exact color descriptions
const AVATARS_TO_GENERATE = [
  // MALE VARIANTS
  {
    id: 'hero_pale',
    filename: 'hero_stage_10_pale.png',
    prompt: 'WHITE SKINNED man, pale European complexion, pixel art RPG warrior, short black hair, athletic build, brown sleeveless tunic and brown pants, leather sandals, standing combat stance feet apart, front view, 128x128 sprite, no background',
  },
  {
    id: 'hero_tan',
    filename: 'hero_stage_10_tan.png',
    prompt: 'TAN SKINNED man, warm brown Latino complexion, pixel art RPG warrior, short black hair, athletic build, brown sleeveless tunic and brown pants, leather sandals, standing combat stance feet apart, front view, 128x128 sprite, no background',
  },
  {
    id: 'hero_brown',
    filename: 'hero_stage_10_brown.png',
    prompt: 'BROWN SKINNED man, dark brown Indian complexion, pixel art RPG warrior, short black hair, athletic build, brown sleeveless tunic and brown pants, leather sandals, standing combat stance feet apart, front view, 128x128 sprite, no background',
  },
  {
    id: 'hero_dark',
    filename: 'hero_stage_10_dark.png',
    prompt: 'BLACK SKINNED man, very dark African complexion, pixel art RPG warrior, short black hair, athletic build, brown sleeveless tunic and brown pants, leather sandals, standing combat stance feet apart, front view, 128x128 sprite, no background',
  },
  // FEMALE VARIANTS
  {
    id: 'heroine_pale',
    filename: 'heroine_stage_10_pale.png',
    prompt: 'WHITE SKINNED woman, pale European complexion, pixel art RPG warrior, long brown hair in ponytail, athletic build, brown sleeveless tunic and brown pants, leather sandals, standing combat stance feet apart, front view, 128x128 sprite, no background',
  },
  {
    id: 'heroine_tan',
    filename: 'heroine_stage_10_tan.png',
    prompt: 'TAN SKINNED woman, warm brown Latina complexion, pixel art RPG warrior, long black hair in ponytail, athletic build, brown sleeveless tunic and brown pants, leather sandals, standing combat stance feet apart, front view, 128x128 sprite, no background',
  },
  {
    id: 'heroine_brown',
    filename: 'heroine_stage_10_brown.png',
    prompt: 'BROWN SKINNED woman, dark brown Indian complexion, pixel art RPG warrior, long black hair in ponytail, athletic build, brown sleeveless tunic and brown pants, leather sandals, standing combat stance feet apart, front view, 128x128 sprite, no background',
  },
  {
    id: 'heroine_dark',
    filename: 'heroine_stage_10_dark.png',
    prompt: 'BLACK SKINNED woman, very dark African complexion, pixel art RPG warrior, long black hair in ponytail, athletic build, brown sleeveless tunic and brown pants, leather sandals, standing combat stance feet apart, front view, 128x128 sprite, no background',
  },
];

const NEGATIVE_PROMPT = 'armor, helmet, weapon, sword, shield, multiple characters, background, white skin on dark character, light skin on dark character';

async function generateSprite(prompt, label) {
  console.log(`\n🎨 Generating: ${label}`);
  console.log(`📝 Prompt: ${prompt.substring(0, 80)}...`);

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
      text_guidance_scale: 10, // Higher guidance for better prompt adherence
      no_background: true,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);
  return data.image.base64.replace(/^data:image\/png;base64,/, '');
}

function saveSprite(base64Data, filename) {
  const outputPath = path.join(__dirname, '..', 'public', 'assets', 'avatar', 'diverse', filename);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
  console.log(`✅ Saved: diverse/${filename}`);
}

async function main() {
  console.log('🚀 DIVERSE AVATAR GENERATION V2');
  console.log('═'.repeat(50));

  const args = process.argv.slice(2);
  const heroOnly = args.includes('--hero');
  const heroineOnly = args.includes('--heroine');

  let avatars = AVATARS_TO_GENERATE;
  if (heroOnly) avatars = avatars.filter(a => a.id.startsWith('hero_'));
  if (heroineOnly) avatars = avatars.filter(a => a.id.startsWith('heroine_'));

  console.log(`\n📦 Generating ${avatars.length} avatars\n`);

  let success = 0;
  for (let i = 0; i < avatars.length; i++) {
    const avatar = avatars[i];
    try {
      const imageData = await generateSprite(avatar.prompt, avatar.id);
      saveSprite(imageData, avatar.filename);
      success++;

      if (i < avatars.length - 1) {
        console.log('⏳ Waiting 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
      }
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      await new Promise(r => setTimeout(r, 8000));
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`✅ Complete: ${success}/${avatars.length}`);
}

main().catch(console.error);
