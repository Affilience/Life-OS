/**
 * Regenerate Productivity Icon - PixelLab API
 * Fixes the double-box issue by regenerating with transparent background
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Base negative prompt
const BASE_NEGATIVE = `blurry, low quality, distorted, deformed, ugly, realistic photo,
text, watermark, signature, duplicate, too detailed, cluttered, messy,
photorealistic, 3D render, gradients, anti-aliasing artifacts`;

const config = {
  name: 'Productivity & Business',
  filename: 'module_productivity.png',
  size: 48,
  prompt: `highly detailed pixel art cosmic lightning bolt energy icon,
purple electric bolt with indigo glow, surging power energy symbol,
cosmic force emanating sparkles, focused energy beam design,
sci-fi productivity power aesthetic, sleek lightning silhouette,
clean iconographic design, centered composition, game UI icon style,
single color black outline, vibrant indigo and violet color palette,
professional pixel art, polished indie game quality, transparent background`,
};

async function regenerateIcon() {
  console.log(`\n🎨 Regenerating ${config.name} icon...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: config.prompt,
        negative_description: BASE_NEGATIVE,
        image_size: {
          width: config.size,
          height: config.size
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

    // Save sprite
    const outputDir = path.join(__dirname, '..', 'public', 'assets', 'icons', 'modules');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, config.filename);
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    fs.writeFileSync(outputPath, imageBuffer);

    const cost = data.cost || data.usage?.usd || 0;
    console.log(`✅ ${config.name} saved to ${config.filename}`);
    console.log(`   Cost: $${cost.toFixed(4)}`);
    console.log(`   Path: ${outputPath}`);

  } catch (error) {
    console.error(`❌ Failed to generate ${config.name}:`, error.message);
  }
}

// Run
regenerateIcon().catch(console.error);
