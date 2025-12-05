import fs from 'fs';
import path from 'path';

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const OUTPUT_DIR = './public/assets/nova';

// Base character - wise oracle figure, NOT childlike
const BASE_CHARACTER = `mystical wise oracle figure, ethereal cosmic entity, ancient sage spirit, glowing eyes`;

const BASE_NEGATIVE = `childish, cute, chibi, baby, young, cartoon, silly,
blurry, low quality, distorted, deformed, ugly, realistic photo,
text, watermark, signature, duplicate, too detailed, cluttered, messy,
photorealistic, 3D render, gradients, anti-aliasing artifacts,
background, solid background, colored background`;

// 4 Evolution stages - all wise/mature looking
const STAGES = [
  {
    name: 'spark',
    filename: 'nova_spark.png',
    description: `${BASE_CHARACTER},
young mystical oracle apprentice, hooded figure with glowing runes,
deep blue robes with silver trim, floating ethereal wisps around,
mysterious but approachable, subtle cosmic energy aura,
front facing pixel art portrait, detailed shading,
indigo and silver color palette, magical atmosphere,
professional pixel art, 64x64, transparent background`
  },
  {
    name: 'teen',
    filename: 'nova_teen.png',
    description: `${BASE_CHARACTER},
mystical oracle sage, hooded cosmic seer, arcane robe with constellation patterns,
floating orbs of starlight, third eye marking on forehead, wise expression,
purple and gold robes, ethereal energy flowing from hands,
front facing pixel art portrait, detailed shading,
deep purple and gold color palette, cosmic magical energy,
professional pixel art, 64x64, transparent background`
  },
  {
    name: 'stellar',
    filename: 'nova_stellar.png',
    description: `${BASE_CHARACTER},
powerful cosmic oracle, elder sage with flowing ethereal beard of starlight,
ornate robes with galaxy patterns, multiple floating crystals,
eyes glowing with cosmic knowledge, staff with star atop,
majestic and wise presence, aurora borealis energy aura,
front facing pixel art portrait, detailed shading,
cosmic purple blue and starlight gold color palette,
professional pixel art, 64x64, transparent background`
  },
  {
    name: 'cosmos',
    filename: 'nova_cosmos.png',
    description: `${BASE_CHARACTER},
transcendent cosmic being, ultimate oracle avatar, ethereal form made of galaxies and stardust,
crown of floating stars, robes are nebula and cosmos itself,
all-seeing cosmic eyes, radiating infinite wisdom,
godlike cosmic presence, reality-bending aura, multiple arms holding cosmic artifacts,
front facing pixel art portrait, detailed shading,
cosmic rainbow nebula colors with gold highlights,
professional pixel art, 64x64, transparent background`
  }
];

async function generateSprite(stage) {
  const outputPath = path.join(OUTPUT_DIR, stage.filename);

  console.log(`Generating ${stage.name}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: stage.description,
        negative_description: BASE_NEGATIVE,
        image_size: {
          width: 64,
          height: 64
        },
        text_guidance_scale: 8.5,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    fs.writeFileSync(outputPath, imageBuffer);

    console.log(`  ✅ ${stage.name} saved to ${stage.filename}`);
    return { name: stage.name, success: true };
  } catch (error) {
    console.error(`  ❌ ${stage.name} failed: ${error.message}`);
    return { name: stage.name, success: false, error: error.message };
  }
}

async function generateAll() {
  console.log('='.repeat(50));
  console.log('Nova Oracle Sprite Generator');
  console.log('='.repeat(50));
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];

  for (const stage of STAGES) {
    const result = await generateSprite(stage);
    results.push(result);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('COMPLETE');
  console.log('='.repeat(50));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Successful: ${successful}/${STAGES.length}`);
  if (failed > 0) {
    console.log('Failed stages:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
}

generateAll().catch(console.error);
