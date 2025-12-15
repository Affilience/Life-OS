import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Capes designed as wide triangular/wing shapes that spread outward
// So they're visible when drawn BEHIND a character
const CAPES = [
  {
    filename: 'ancient_cloak.png',
    description: 'ancient blue magical cape spread wide like wings, triangular shape spreading left and right, tattered mystical cloak with stars, back of cape view, wide flowing fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
  {
    filename: 'basic.png',
    description: 'simple brown cape spread wide like wings, triangular shape spreading left and right, basic traveler cloak, back of cape view, wide flowing fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
  {
    filename: 'cloak_shadows.png',
    description: 'dark purple shadow cape spread wide like wings, triangular shape spreading left and right, wispy dark edges, back of cape view, wide flowing fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
  {
    filename: 'enchanter_mantle.png',
    description: 'blue enchanted cape spread wide like wings, triangular shape spreading left and right, glowing runes and stars pattern, back of cape view, wide magical fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
  {
    filename: 'leather_cape.png',
    description: 'brown leather cape spread wide like wings, triangular shape spreading left and right, rugged leather cloak, back of cape view, wide flowing fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
  {
    filename: 'memory_mantle.png',
    description: 'ethereal blue memory cape spread wide like wings, triangular shape spreading left and right, translucent ghostly fabric, back of cape view, wide flowing fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
  {
    filename: 'mystic_robe.png',
    description: 'purple mystic cape spread wide like wings, triangular shape spreading left and right, arcane patterns glowing, back of cape view, wide magical fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
  {
    filename: 'oracle_shroud.png',
    description: 'purple oracle cape with eye patterns spread wide like wings, triangular shape spreading left and right, mystical shroud, back of cape view, wide flowing fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
  {
    filename: 'sage_cloak.png',
    description: 'white and gold sage cape spread wide like wings, triangular shape spreading left and right, wise elder cloak, back of cape view, wide flowing fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
  {
    filename: 'shadow.png',
    description: 'dark black shadow cape spread wide like bat wings, triangular shape spreading left and right, shadowy wispy edges, back of cape view, wide dark fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
  {
    filename: 'shadow_cloak.png',
    description: 'deep purple shadow cloak spread wide like wings, triangular shape spreading left and right, dark magical edges, back of cape view, wide flowing fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
  {
    filename: 'storyteller_cloak.png',
    description: 'purple starry storyteller cape spread wide like wings, triangular shape spreading left and right, constellation patterns, back of cape view, wide magical fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
  {
    filename: 'traveler_cloak.png',
    description: 'brown hooded traveler cape spread wide like wings, triangular shape spreading left and right, weathered road cloak, back of cape view, wide flowing fabric, fantasy RPG equipment, pixel art, transparent background, 64x64',
  },
];

async function generateItem(item) {
  console.log(`\n🎨 Generating capes/${item.filename}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: item.description,
        negative_description: 'person, character, body, face, front view of person, narrow, thin, vertical',
        image_size: { width: 64, height: 64 },
        text_guidance_scale: 8.5,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Generated - Cost: $${data.usage.usd.toFixed(4)}`);

    const outputDir = path.join(__dirname, '../public/assets/equipment/capes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(outputDir, item.filename);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);

    return { success: true, cost: data.usage.usd };
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🦇 Cape Regeneration Script');
  console.log('   Style: Wide triangular/wing shape (visible behind character)');
  console.log(`📦 ${CAPES.length} capes to regenerate\n`);

  let totalCost = 0;
  let successCount = 0;

  for (const item of CAPES) {
    const result = await generateItem(item);
    if (result.success) {
      totalCost += result.cost;
      successCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ Complete! ${successCount}/${CAPES.length} generated`);
  console.log(`💰 Total Cost: $${totalCost.toFixed(4)}`);
}

main();
