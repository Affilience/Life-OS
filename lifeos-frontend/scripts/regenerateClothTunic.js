/**
 * Regenerate cloth_tunic with flat 2D pixel art style (no 3D effects)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const BASE_DIR = path.join(__dirname, '../public/assets/equipment');

async function generateClothTunic() {
  console.log('🎨 Regenerating cloth_tunic with flat 2D style...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'minimal flat pixel art tunic icon, solid brown fill with black outline only, no shading no details no buttons, simple T-shirt silhouette shape, zelda NES inventory item style, 64x64',
        negative_description: '3d, shading, shadows, highlights, depth, lighting, gradient, buttons, details, folds, wrinkles, texture, realistic, modern',
        image_size: { width: 64, height: 64 },
        text_guidance_scale: 15,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Generated successfully');
    console.log(`💰 Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(BASE_DIR, 'chests', 'cloth_tunic.png');

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);

  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
  }
}

generateClothTunic().catch(console.error);
