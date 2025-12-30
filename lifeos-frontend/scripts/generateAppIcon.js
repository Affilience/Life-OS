import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

if (!API_KEY) {
  console.error('❌ PIXELLAB_API_KEY environment variable required');
  process.exit(1);
}

async function generateIcon() {
  console.log('🎨 Generating Ascynt app icon...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'minimalist mobile app icon, glowing violet purple crystal arrow pointing upward, cosmic energy aura, dark background, clean simple geometric design, centered composition, professional app icon',
        negative_description: 'text, letters, words, complex, busy, cluttered, realistic, photo',
        image_size: { width: 400, height: 400 },
        text_guidance_scale: 8,
        no_background: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Generated - Cost: $${data.usage.usd.toFixed(4)}`);

    // Save to resources folder
    const outputDir = path.join(__dirname, '../resources');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(outputDir, 'icon.png');

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);

    // Also create icon-foreground for adaptive icons (Android)
    console.log('\n🎨 Generating foreground icon (transparent)...');

    const fgResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'glowing violet purple crystal arrow pointing upward, cosmic energy, clean geometric shape, centered',
        negative_description: 'text, letters, background, complex, busy',
        image_size: { width: 400, height: 400 },
        text_guidance_scale: 8,
        no_background: true,
      }),
    });

    if (fgResponse.ok) {
      const fgData = await fgResponse.json();
      const fgBase64 = fgData.image.base64.replace(/^data:image\/png;base64,/, '');
      const fgBuffer = Buffer.from(fgBase64, 'base64');
      fs.writeFileSync(path.join(outputDir, 'icon-foreground.png'), fgBuffer);
      console.log(`💾 Saved: ${outputDir}/icon-foreground.png`);
    }

    // Skip splash screen - will create programmatically or use solid color
    console.log('\n✨ Done! Icons generated at 400x400 (will be upscaled by capacitor-assets)');
    console.log('Now run: npx capacitor-assets generate');

  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    process.exit(1);
  }
}

generateIcon();
