import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

async function generateSteelTowerShield() {
  console.log('🛡️  Generating Steel Tower Shield...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'steel tower shield, large rectangular medieval kite shield, reinforced steel plates with rivets, cross emblem in center, battle-worn metal surface, fantasy RPG shield equipment item, transparent background, pixel art style, 64x64',
        negative_description: 'character, person, arm, holding, hand, body, worn, equipped',
        image_size: {
          width: 64,
          height: 64,
        },
        text_guidance_scale: 8.5,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Generated successfully');
    console.log(`💰 Cost: $${data.usage.usd.toFixed(4)}`);

    const outputDir = path.join(__dirname, '../public/assets/equipment/shields');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(outputDir, 'steel_tower_shield.png');

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);
    console.log('\n✨ Done!');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

generateSteelTowerShield();
