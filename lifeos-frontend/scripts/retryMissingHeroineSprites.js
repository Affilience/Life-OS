/**
 * Retry Missing Heroine Sprites
 * Regenerates War Chief (22) and Immortal Champion (37)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_CLOTHING = 'simple sleeveless brown tunic and cloth pants, leather belt, leather sandals';
const HEROINE_BASE = 'female warrior with long brown hair in ponytail and brown eyes';

const MISSING_STAGES = [
  { stage: 22, name: 'War Chief', physique: 'commanding tribal leader build', stance: 'chieftain commanding pose', expression: 'ancestral power gaze', effects: 'spirit animals circling, ancestral ghosts', details: 'tribal markings glowing, feathers in hair' },
  { stage: 37, name: 'Immortal Champion', physique: 'timeless eternal warrior form', stance: 'standing across all eras pose', expression: 'eternal champion wisdom', effects: 'time streams flowing, past future echoes', details: 'ageless appearance, temporal marks' },
];

const NEGATIVE_PROMPT = `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines,
distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors, flat shading,
bad proportions, deformed, ugly, cropped, low quality, armor, helmet, weapon, sword, shield,
metal armor, chainmail, plate armor, gauntlets, greaves, pauldrons, cape, cloak,
oversexualized, revealing outfit, covered arms, hidden hands, male`;

function buildPrompt(stage) {
  return `epic pixel art of ${stage.physique} ${HEROINE_BASE} wearing ${BASE_CLOTHING}, ${stage.stance}, ${stage.expression}, ${stage.details}${stage.effects ? ', ' + stage.effects : ''}, arms and hands clearly visible for equipment overlay, fantasy RPG style, front-facing isometric view, highly detailed 128x128 pixel art, clean silhouette`;
}

async function generateSprite(prompt, name, stage) {
  console.log(`\n🎨 Generating Stage ${stage}: ${name}`);
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
      text_guidance_scale: 8.5,
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
  const outputPath = path.join(__dirname, '..', 'public', 'assets', 'avatar', 'base-evolution', filename);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
  console.log(`✅ Saved: base-evolution/${filename}`);
}

async function retryMissing() {
  console.log('🔄 RETRYING MISSING HEROINE SPRITES');
  console.log('===================================\n');

  for (const stage of MISSING_STAGES) {
    const prompt = buildPrompt(stage);
    const filename = `heroine_base_stage_${stage.stage}_${stage.name.toLowerCase().replace(/ /g, '_')}.png`;

    try {
      const imageData = await generateSprite(prompt, stage.name, stage.stage);
      saveSprite(imageData, filename);
      console.log(`✅ Successfully regenerated ${stage.name}!`);

      if (MISSING_STAGES.indexOf(stage) < MISSING_STAGES.length - 1) {
        console.log('⏳ Waiting 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
      }
    } catch (error) {
      console.error(`❌ Failed to generate ${stage.name}: ${error.message}`);
    }
  }

  console.log('\n✅ Retry complete!');
}

retryMissing().catch(console.error);
