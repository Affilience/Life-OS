import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

const ITEMS = [
  {
    filename: 'armor_plate',
    description: `pixel art metal breastplate chest armor, steel plate armor torso piece, front view, shaped like a vest to overlay on character sprite, wide shoulders narrow waist, solid metal with rivets, 16-bit SNES Final Fantasy style equipment sprite, single black outline, NO neck opening NO collar, transparent background`,
  },
  {
    filename: 'cloth_tunic',
    description: `pixel art simple brown tunic shirt, cloth fabric torso clothing, front view, shaped like a vest to overlay on character sprite, wide shoulders narrow waist, plain brown fabric with slight shading, 16-bit SNES Chrono Trigger style equipment sprite, single black outline, NO neckline NO collar, transparent background`,
  },
];

async function generate(item) {
  console.log(`Regenerating ${item.filename}...`);

  const negativeDescription = `neck, neckhole, collar, neckline, v-neck, 3D, depth, hollow interior, dark hole, head, face, legs, arms, full body, person, mannequin, realistic, modern`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        description: item.description,
        negative_description: negativeDescription,
        image_size: { width: 64, height: 64 },
        text_guidance_scale: 10,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error for ${item.filename}:`, response.status, errorText);
      return false;
    }

    const data = await response.json();

    if (data.image && data.image.base64) {
      const outputPath = path.join(__dirname, `../public/assets/equipment/chests/${item.filename}.png`);
      const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`✅ Saved ${item.filename} - Cost: $${data.usage?.usd?.toFixed(4) || 'N/A'}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed ${item.filename}:`, error.message);
    return false;
  }
}

async function main() {
  for (const item of ITEMS) {
    await generate(item);
    await new Promise(r => setTimeout(r, 4000));
  }
  console.log('\nDone!');
}

main();
