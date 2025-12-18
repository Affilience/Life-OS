/**
 * Regenerate Plate Armor - removes 3D effects, cuts off at neck
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

async function generate() {
  console.log('Regenerating armor_plate...');

  const description = `pixel art plate armor torso overlay, medieval steel breastplate, polished metal chest armor with rivets, cuts off cleanly at neck and shoulders, flat 2D sprite for character chest overlay, front-facing, single color black outline, RPG game asset style, torso armor only, knight armor`;

  const negativeDescription = `3D effect, hollow inside, dark interior, full body, head, face, helmet, neck armor, gorget, legs, arms, background, photorealistic, blurry, low quality, person wearing it`;

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
      const outputPath = path.join(__dirname, '../public/assets/equipment/chests/armor_plate.png');
      const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(outputPath, imageBuffer);
      console.log('Saved new armor_plate to:', outputPath);
      console.log('Cost: $' + (data.usage?.usd?.toFixed(4) || 'N/A'));
    } else {
      console.log('Unexpected response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Failed:', error.message);
  }
}

generate();
