/**
 * Generate Heroine Base - Retry script
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const description = `epic pixel art of athletic female heroine with short brown hair and brown eyes wearing simple sleeveless brown tunic and basic cloth pants, bare arms and hands visible, leather sandals, standing in neutral idle pose facing forward with arms slightly away from body ready for equipment, simple peasant villager base character, fantasy RPG style, front-facing isometric view, highly detailed 128x128 pixel art, clean silhouette for armor overlay`;

const NEGATIVE_PROMPT = `blurry, smudged, muddy colors, low contrast, unclear silhouette, messy lines, distorted anatomy, asymmetric, watermark, signature, text, jpeg artifacts, dull colors, flat shading, bad proportions, deformed, ugly, cropped, low quality, normal quality, worst quality, armor, helmet, weapon, sword, shield, cape, gloves, gauntlets, boots, metal armor, chainmail, plate armor, oversexualized, revealing outfit`;

async function generate() {
  console.log('🎨 Generating Heroine Base...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: description,
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
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const outputPath = path.join(__dirname, '..', 'public', 'assets', 'avatar', 'base', 'heroine_base.png');
    fs.writeFileSync(outputPath, buffer);

    console.log('✅ Saved heroine_base.png');
    console.log(`💰 Cost: $${(data.usage?.usd || 0).toFixed(4)}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generate();
