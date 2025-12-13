import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Flame sprites for different streak levels - simplified prompts
const FLAME_VARIANTS = [
  {
    id: 'flame_large',
    name: 'Large Flame (30-99 days)',
    prompt: 'pixel art orange red fire flame icon, bright burning fire, game icon',
    size: 48,
  },
  {
    id: 'flame_epic',
    name: 'Epic Flame (100+ days)',
    prompt: 'pixel art magical purple blue flame with golden center, mystical fire icon',
    size: 48,
  },
  {
    id: 'flame_animated_1',
    name: 'Flame Animation Frame 1',
    prompt: 'pixel art orange fire flame, small compact flame, game sprite',
    size: 48,
  },
  {
    id: 'flame_animated_2',
    name: 'Flame Animation Frame 2',
    prompt: 'pixel art orange fire flame, medium height flame, game sprite',
    size: 48,
  },
  {
    id: 'flame_animated_3',
    name: 'Flame Animation Frame 3',
    prompt: 'pixel art orange fire flame with sparks, tall flame peak, game sprite',
    size: 48,
  },
  {
    id: 'flame_animated_4',
    name: 'Flame Animation Frame 4',
    prompt: 'pixel art orange fire flame, slightly shorter flame, game sprite',
    size: 48,
  },
];

async function generateFlameSprite(item, retries = 3) {
  console.log(`\n🔥 Generating ${item.name}...`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000); // 90 second timeout

      const response = await fetch(API_URL, {
        signal: controller.signal,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: item.prompt,
          negative_description: 'character, body, person, realistic, 3d, blurry, low quality, text, watermark',
          image_size: {
            width: item.size,
            height: item.size,
          },
          text_guidance_scale: 8.5,
          no_background: true,
        }),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Generated successfully (attempt ${attempt})`);
      console.log(`💰 Cost: $${data.usage.usd.toFixed(4)}`);

      // Save sprite
      const outputDir = path.join(__dirname, '../public/assets/streaks');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const outputPath = path.join(outputDir, `${item.id}.png`);

      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`💾 Saved: ${outputPath}`);

      return { success: true, cost: data.usage.usd };
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`⏱️  Attempt ${attempt}/${retries} timed out, ${attempt < retries ? 'retrying...' : 'skipping'}`);
      } else {
        console.error(`❌ Attempt ${attempt}/${retries} failed:`, error.message);
      }

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  return { success: false, cost: 0 };
}

async function generateAllFlames() {
  console.log('🔥 STREAK FLAME SPRITE GENERATION');
  console.log('========================================');

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;

  for (const item of FLAME_VARIANTS) {
    const result = await generateFlameSprite(item);

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
    totalCost += result.cost;

    // Delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n========================================');
  console.log('✨ GENERATION COMPLETE!');
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`❌ Failed/Skipped: ${failCount}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log('📁 Sprites saved to: public/assets/streaks/');
  console.log('========================================\n');
}

// Run generation
generateAllFlames().catch(console.error);
