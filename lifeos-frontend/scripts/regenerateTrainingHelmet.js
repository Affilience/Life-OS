/**
 * Regenerate Training Helmet - fixes the 3D face hole issue
 * Makes a flat 2D helmet overlay that works on character sprites
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

async function generateHelmet() {
  console.log('Regenerating training helmet...');

  const description = `pixel art leather training helmet, simple padded headgear cap, brown leather with metal studs, medieval RPG equipment, front-facing, flat 2D sprite overlay for character head, open face style cap that sits on top of head, single color outline, game asset style`;

  const negativeDescription = `3D effect, hollow inside, black void, face hole opening, dark interior, visor slit, full body, character, person wearing it, background, photorealistic, blurry, low quality, full face coverage`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        description: description,
        negative_description: negativeDescription,
        image_size: { width: 64, height: 64 },
        text_guidance_scale: 8.5,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return;
    }

    const data = await response.json();

    if (data.image && data.image.base64) {
      // Save the image
      const outputPath = path.join(__dirname, '../public/assets/equipment/helmets/training_helmet.png');
      const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(outputPath, imageBuffer);
      console.log('Saved new training helmet to:', outputPath);
      console.log('Cost: $' + (data.usage?.usd?.toFixed(4) || 'N/A'));
    } else {
      console.log('Unexpected response format:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Failed to generate helmet:', error.message);
  }
}

generateHelmet();
