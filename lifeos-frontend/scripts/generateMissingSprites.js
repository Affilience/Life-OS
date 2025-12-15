import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Missing sprites to generate
const MISSING_SPRITES = {
  boots: [
    {
      filename: 'mage_slippers.png',
      prompt: 'pixel art purple enchanted wizard slippers, soft magical footwear with glowing runes, fantasy RPG boots icon, transparent background, 32x32',
    },
    {
      filename: 'dragon_boots.png',
      prompt: 'pixel art legendary dragon scale boots, red and black dragon leather boots with fiery glow, fantasy RPG boots icon, transparent background, 32x32',
    },
  ],
  legs: [
    {
      filename: 'steel_legplates.png',
      prompt: 'pixel art polished steel plate leg armor, shiny knight legplates with engravings, fantasy RPG armor icon, transparent background, 32x32',
    },
    {
      filename: 'mage_robes_legs.png',
      prompt: 'pixel art purple arcane wizard leg wraps, flowing magical cloth with mystical runes, fantasy RPG armor icon, transparent background, 32x32',
    },
    {
      filename: 'dragon_legguards.png',
      prompt: 'pixel art legendary dragon scale leg armor, red and black scales with fiery accents, fantasy RPG armor icon, transparent background, 32x32',
    },
    {
      filename: 'phoenix_legguards.png',
      prompt: 'pixel art legendary phoenix feather leg armor, golden orange flames and radiant glow, fantasy RPG armor icon, transparent background, 32x32',
    },
  ],
};

async function generateSprite(category, item) {
  const outputDir = path.join(__dirname, '..', 'public', 'assets', 'equipment', category);
  const outputPath = path.join(outputDir, item.filename);

  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipping ${item.filename} (already exists)`);
    return { success: true, cost: 0 };
  }

  console.log(`\n🎨 Generating ${item.filename}...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const response = await fetch(API_URL, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: item.prompt,
        negative_description: 'character, body, person, realistic, 3d, blurry, low quality, text, watermark',
        image_size: {
          width: 32,
          height: 32,
        },
        text_guidance_scale: 8.5,
        no_background: true,
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Generated successfully`);
    console.log(`💰 Cost: $${data.usage.usd.toFixed(4)}`);

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save base64 image
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);

    return { success: true, cost: data.usage.usd };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏱️  Timeout: ${item.filename} took too long (>60s)`);
    } else {
      console.error(`❌ Error generating ${item.filename}:`, error.message);
    }
    return { success: false, cost: 0 };
  }
}

async function main() {
  console.log('🚀 GENERATING MISSING EQUIPMENT SPRITES');
  console.log('========================================\n');

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;

  for (const [category, items] of Object.entries(MISSING_SPRITES)) {
    console.log(`\n📦 Category: ${category}`);
    console.log('─'.repeat(40));

    for (const item of items) {
      const result = await generateSprite(category, item);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      totalCost += result.cost;

      // Delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n========================================');
  console.log(`✅ Generated: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log('========================================\n');
}

main().catch(console.error);
