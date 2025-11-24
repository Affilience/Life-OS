/**
 * Regenerate Missing V3 Stages 36, 37, 38
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Character continuity
const CHARACTER_BASE = `athletic male hero with short brown hair and brown eyes`;

// Missing Stages 36, 37, 38
const MISSING_STAGES = [
  {
    level: 36,
    name: 'Elemental Lord',
    description: `epic pixel art of ${CHARACTER_BASE} commanding all elements wearing armor that cycles through fire, water, earth, and air, staff channeling all four elements simultaneously creating primordial chaos, crown with four elemental gems, elemental fusion pose - all elements spiraling, primordial master aesthetic, fire water earth air orbiting in perfect harmony, elemental chaos and order, natural disasters converging, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 37,
    name: 'Immortal Champion',
    description: `epic pixel art of ${CHARACTER_BASE} achieving eternal warrior state wearing timeless armor covered in glowing eternal runes that never fade, ageless sword that exists in all time periods simultaneously, time crystal embedded in chest, eternal crown, timeless warrior pose - standing across all eras, immortal champion aesthetic, time streams flowing around body, past and future selves as echoes, clock faces and hourglasses floating, temporal energy, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  },
  {
    level: 38,
    name: 'Godslayer',
    description: `epic pixel art of ${CHARACTER_BASE} wielding deicide power wearing armor forged from slain gods' divine essence, godkiller blade crackling with stolen divinity, fragments of shattered halos orbiting, broken divine crown repurposed, god-killing stance - blade piercing heavens, divine slayer aesthetic, divine blood dripping from weapon, shattered god essences swirling, divine thunder and destruction, pantheon-ending energy, isometric view, highly detailed 128x128 pixel art`,
    style: { detail: 'highly detailed', shading: 'detailed shading', outline: 'single color outline' }
  }
];

const OUTPUT_DIR = path.join(__dirname, '../public/assets/avatar/evolution');

async function generateStage(stage) {
  console.log(`\n🎨 Generating Stage ${stage.level}: ${stage.name}`);
  console.log(`📝 Prompt: ${stage.description.substring(0, 100)}...`);

  const NEGATIVE_PROMPT = `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines,
distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors, flat shading,
bad proportions, deformed, ugly, cropped, low quality, normal quality, worst quality,
different person, female, woman, girl, long hair, blonde hair, red hair, black hair, different hair color, different face, different character`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: stage.description,
        negative_description: NEGATIVE_PROMPT,
        image_size: {
          width: 128,
          height: 128
        },
        text_guidance_scale: 8.5,
        no_background: true,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    console.log(`💰 Cost: $${data.usage.usd.toFixed(4)}`);

    // Extract base64 image data
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');

    // Save the image
    const filename = `hero_v3_stage_${stage.level}_${stage.name.toLowerCase().replace(/\s+/g, '_')}.png`;

    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Save to public folder
    const publicPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(publicPath, imageBuffer);

    // Also save to dist folder
    const distPath = path.join(__dirname, '../dist/assets/avatar/evolution', filename);
    const distDir = path.dirname(distPath);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    fs.writeFileSync(distPath, imageBuffer);

    console.log(`✅ Saved: ${filename}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed Stage ${stage.level}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Regenerating Missing V3 Stages 36, 37, 38');
  console.log('================================================\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let successCount = 0;
  let failCount = 0;

  for (const stage of MISSING_STAGES) {
    const success = await generateStage(stage);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Wait 2 seconds between generations
    if (stage !== MISSING_STAGES[MISSING_STAGES.length - 1]) {
      console.log('⏳ Waiting 2 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n================================================');
  console.log(`✨ Generation Complete!`);
  console.log(`✅ Success: ${successCount}/${MISSING_STAGES.length}`);
  console.log(`❌ Failed: ${failCount}/${MISSING_STAGES.length}`);
  console.log(`\n📁 Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
