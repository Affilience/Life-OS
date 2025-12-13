import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// New starlight aura - vertical magical beams without star shapes
const AURA_SPRITES = [
  {
    id: 'aura_starlight_v2_1',
    name: 'Starlight Aura V2 Frame 1',
    prompt: 'pixel art anime magical aura, vertical purple light pillars rising upward, soft glowing magical energy columns, ethereal transformation beams, scattered floating sparkle particles, empty center for character, game sprite effect',
    size: 96,
  },
  {
    id: 'aura_starlight_v2_2',
    name: 'Starlight Aura V2 Frame 2',
    prompt: 'pixel art mystic aura, violet white energy beams flowing vertically upward, tall magical light columns, anime transformation power-up effect, floating particle orbs, hollow center silhouette, game sprite',
    size: 96,
  },
];

async function generateAuraSprite(item, retries = 2) {
  console.log(`\n🎨 Generating ${item.name}...`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(API_URL, {
        signal: controller.signal,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: item.prompt,
          negative_description: 'star shape pointed star cross shape person character body face realistic 3d blurry solid background circular orb sphere',
          image_size: {
            width: item.size,
            height: item.size,
          },
          text_guidance_scale: 8,
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
      const outputDir = path.join(__dirname, '../public/assets/auras');
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

async function main() {
  console.log('✨ REGENERATING STARLIGHT AURA');
  console.log('==============================');
  console.log('New design: vertical magical beams without star shapes\n');

  let totalCost = 0;

  for (const item of AURA_SPRITES) {
    const result = await generateAuraSprite(item);
    totalCost += result.cost;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n==============================');
  console.log('✨ COMPLETE!');
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
}

main().catch(console.error);
