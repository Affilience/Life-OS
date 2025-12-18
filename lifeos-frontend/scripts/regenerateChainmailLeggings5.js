import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

async function generate() {
  console.log('Regenerating chainmail_leggings like phoenix pants...');

  const description = `pixel art baggy chainmail pants, puffy billowing wide-legged trousers made of silver chainmail, very baggy loose fabric ballooning outward, same style as phoenix legguards, medieval fantasy pants, front-facing, 16-bit RPG equipment overlay sprite, black outline, transparent background`;

  const negativeDescription = `tight pants, skinny legs, fitted, slim, separate leg pieces, leg guards, armor plates, wide stance spread legs, full body, torso, head, arms, boots, 3D, realistic`;

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
        text_guidance_scale: 10,
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
      const outputPath = path.join(__dirname, '../public/assets/equipment/legs/chainmail_leggings.png');
      const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(outputPath, imageBuffer);
      console.log('✅ Saved chainmail_leggings - Cost: $' + (data.usage?.usd?.toFixed(4) || 'N/A'));
    }
  } catch (error) {
    console.error('Failed:', error.message);
  }
}

generate();
