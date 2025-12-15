const fs = require('fs');
const path = require('path');

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-game-asset';

const LEGS = [
  { name: 'cloth_pants', description: 'simple brown cloth pants, peasant trousers' },
  { name: 'leather_leggings', description: 'brown leather leggings, adventurer pants with stitching' },
  { name: 'chainmail_leggings', description: 'silver chainmail leg armor, metal mesh leggings' },
  { name: 'iron_legguards', description: 'iron plate leg armor, grey metal legguards with knee protection' },
  { name: 'dragon_legguards', description: 'dark red dragon scale leg armor, epic legguards with golden trim' },
  { name: 'phoenix_legguards', description: 'fiery orange and gold phoenix leg armor, legendary glowing legguards' },
];

async function generateLegs(item) {
  const prompt = `Pixel art RPG leg armor, ${item.description}, front-facing view, legs spread apart in standing pose matching a warrior stance, NO BOOTS OR FEET - legs end at ankles, transparent background, 64x64 sprite, game asset`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      negative_prompt: 'boots, feet, shoes, footwear, closed legs, legs together, side view, blurry, low quality',
      width: 64,
      height: 64,
      style: 'pixel-art',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data;
}

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function main() {
  const outputDir = path.join(__dirname, '../public/assets/equipment/legs');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Regenerating ${LEGS.length} leg sprites...`);
  console.log('Requirements: NO boots/feet, legs angled out in warrior stance\n');

  let successCount = 0;
  let totalCost = 0;

  for (const item of LEGS) {
    try {
      console.log(`Generating: ${item.name}...`);
      const result = await generateLegs(item);

      if (result.image_url) {
        const filepath = path.join(outputDir, `${item.name}.png`);
        await downloadImage(result.image_url, filepath);
        console.log(`  ✓ Saved: ${item.name}.png`);
        successCount++;
        if (result.cost) totalCost += result.cost;
      } else if (result.error) {
        console.log(`  ✗ Error: ${result.error}`);
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.log(`  ✗ Failed: ${err.message}`);
    }
  }

  console.log(`\nComplete: ${successCount}/${LEGS.length} legs regenerated`);
  if (totalCost > 0) console.log(`Total cost: $${totalCost.toFixed(4)}`);
}

main().catch(console.error);
