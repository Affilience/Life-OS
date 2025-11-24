/**
 * Script to generate Nova AI companion sprites using PixelLab API
 * Run with: node scripts/generateNovaSprites.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai';

// Nova evolution stages
const NOVA_STAGES = [
  {
    name: 'spark',
    description: 'cute glowing cosmic spirit orb creature baby form with large expressive eyes, happy friendly expression, ethereal glow, floating, purple and blue gradient colors, magical sparkles',
    size: 48,
    detail: 'medium detail',
    shading: 'basic shading',
    outline: 'single color black outline',
    proportions: { type: 'preset', name: 'chibi' }
  },
  {
    name: 'teen',
    description: 'small cute humanoid cosmic sprite creature with star-shaped head, friendly cheerful expression, glowing purple and blue ethereal body, floating magical companion, chibi proportions',
    size: 48,
    detail: 'medium detail',
    shading: 'medium shading',
    outline: 'single color black outline',
    proportions: { type: 'preset', name: 'chibi' }
  },
  {
    name: 'stellar',
    description: 'elegant cosmic humanoid life coach character with wise friendly expression, detailed galaxy pattern body, flowing ethereal energy, purple blue and pink gradient, mature proportions, confident pose',
    size: 64,
    detail: 'high detail',
    shading: 'detailed shading',
    outline: 'selective outline',
    proportions: { type: 'preset', name: 'stylized' }
  },
  {
    name: 'cosmos',
    description: 'majestic cosmic entity with wise serene expression, flowing robes made of stardust and nebula, radiant aura, crown of stars, purple blue gold gradient, dignified wise mentor appearance',
    size: 64,
    detail: 'high detail',
    shading: 'detailed shading',
    outline: 'selective outline',
    proportions: { type: 'preset', name: 'stylized' }
  }
];

async function generateNovaStage(stage) {
  console.log(`\n🌟 Generating Nova ${stage.name} form...`);

  const payload = {
    description: stage.description,
    name: `Nova_${stage.name}`,
    n_directions: 4,
    size: stage.size,
    view: 'high top-down',
    detail: stage.detail,
    shading: stage.shading,
    outline: stage.outline,
    proportions: JSON.stringify(stage.proportions)
  };

  try {
    const response = await fetch(`${API_URL}/v1/generate/character`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed: HTTP ${response.status}`);
      console.error(errorText);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Queued! Character ID: ${data.character_id}`);

    return {
      name: stage.name,
      characterId: data.character_id
    };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🌟 Generating Nova AI Companion Sprites...');
  console.log('==========================================');

  const results = [];

  for (const stage of NOVA_STAGES) {
    const result = await generateNovaStage(stage);
    if (result) {
      results.push(result);
    }
    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save character IDs
  const outputDir = path.join(__dirname, '..', 'public', 'assets', 'nova');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const idsData = {};
  results.forEach(r => {
    idsData[r.name] = r.characterId;
  });

  fs.writeFileSync(
    path.join(outputDir, 'character_ids.json'),
    JSON.stringify(idsData, null, 2)
  );

  console.log('\n==========================================');
  console.log('✅ All Nova forms queued successfully!');
  console.log(`\nCharacter IDs saved to: ${path.join(outputDir, 'character_ids.json')}`);
  console.log('\n⏳ Generation takes ~2-3 minutes per character');
  console.log('\nNext steps:');
  console.log('1. Wait 3-5 minutes for generation to complete');
  console.log('2. Run: node scripts/downloadNovaSprites.js');
}

main().catch(console.error);
