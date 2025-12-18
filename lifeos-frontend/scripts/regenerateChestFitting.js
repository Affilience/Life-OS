/**
 * Regenerate chest armor to fit avatar body shape
 * Focus on overlay design that matches character sprite proportions
 */

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
    description: `pixel art steel plate armor overlay for RPG character sprite, front-facing torso armor, fits on small pixel character body, wide at shoulders tapering to waist, metallic silver with rivets, designed as equipment layer overlay, NO neck area just chest and shoulders, retro 16-bit SNES RPG style, black pixel outline, transparent background`,
  },
  {
    filename: 'cloth_tunic',
    description: `pixel art brown cloth tunic overlay for RPG character sprite, front-facing simple shirt, fits on small pixel character body, loose fabric draping on torso, wide at shoulders narrowing at waist, designed as equipment layer overlay, NO neckline just body coverage, retro 16-bit SNES RPG style like Chrono Trigger, black pixel outline, transparent background`,
  },
];

async function generate(item) {
  console.log(`Regenerating ${item.filename}...`);

  const negativeDescription = `neck, neckhole, collar, neckline, 3D render, 3D effect, depth shading, realistic, full character, head, face, legs, arms, mannequin, person wearing, dark interior, hollow`;

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
        text_guidance_scale: 9,
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
