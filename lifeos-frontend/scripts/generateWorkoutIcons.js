import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Workout body part icons to generate
const WORKOUT_ICONS = [
  // Primary muscle groups
  {
    id: 'biceps',
    name: 'Biceps',
    prompt: 'pixel art flexed arm bicep muscle, muscular arm curling showing bicep, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'triceps',
    name: 'Triceps',
    prompt: 'pixel art arm showing tricep muscle from back angle, muscular arm extension, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'forearms',
    name: 'Forearms',
    prompt: 'pixel art forearm and wrist muscles, strong grip forearm, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'chest',
    name: 'Chest',
    prompt: 'pixel art muscular chest pectoral muscles front view, strong pecs, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'back',
    name: 'Back',
    prompt: 'pixel art muscular back muscles rear view, V-shaped lats, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    prompt: 'pixel art broad shoulder deltoid muscles, strong shoulders, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'core',
    name: 'Core/Abs',
    prompt: 'pixel art six pack abs abdominal muscles, toned stomach, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'quadriceps',
    name: 'Quadriceps',
    prompt: 'pixel art muscular thigh quadriceps front leg, strong quads, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'hamstrings',
    name: 'Hamstrings',
    prompt: 'pixel art back of leg hamstring muscles, strong hamstrings, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'glutes',
    name: 'Glutes',
    prompt: 'pixel art gluteal hip muscles, strong glutes side view, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'calves',
    name: 'Calves',
    prompt: 'pixel art calf muscle lower leg, strong defined calves, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'legs',
    name: 'Full Legs',
    prompt: 'pixel art full muscular leg thigh and calf, strong leg, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  // Exercise types / categories
  {
    id: 'cardio',
    name: 'Cardio',
    prompt: 'pixel art running person silhouette, dynamic running pose, fitness cardio icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'strength',
    name: 'Strength',
    prompt: 'pixel art barbell dumbbell weight, gym equipment strength icon, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'flexibility',
    name: 'Flexibility',
    prompt: 'pixel art person stretching yoga pose, flexible stretching icon, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  // Equipment icons
  {
    id: 'barbell',
    name: 'Barbell',
    prompt: 'pixel art barbell with weight plates, gym barbell equipment, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'dumbbell',
    name: 'Dumbbell',
    prompt: 'pixel art single dumbbell hand weight, gym dumbbell equipment, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'kettlebell',
    name: 'Kettlebell',
    prompt: 'pixel art kettlebell weight, gym kettlebell equipment, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'cable',
    name: 'Cable Machine',
    prompt: 'pixel art cable pulley handle, gym cable machine equipment, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
  {
    id: 'bodyweight',
    name: 'Bodyweight',
    prompt: 'pixel art person doing push-up, bodyweight exercise icon, fitness icon, simple clean style, transparent background, 48x48',
    size: 48,
  },
];

async function generateWorkoutIcon(item, retryCount = 0) {
  console.log(`\n🏋️ Generating ${item.name}...${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // Increased to 60s

    const response = await fetch(API_URL, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: item.prompt,
        negative_description: 'realistic, 3d, blurry, low quality, text, watermark',
        image_size: {
          width: item.size,
          height: item.size,
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

    // Save sprite
    const outputDir = path.join(__dirname, '../public/assets/workout');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(outputDir, `${item.id}.png`);

    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`💾 Saved: ${outputPath}`);

    return { success: true, cost: data.usage.usd };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`⏱️  Timeout: ${item.name} took too long (>60s)`);
      if (retryCount < 2) {
        console.log(`🔄 Retrying ${item.name}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return generateWorkoutIcon(item, retryCount + 1);
      }
      console.error(`❌ Max retries reached for ${item.name}, skipping...`);
      return { success: false, cost: 0 };
    }
    console.error(`❌ Failed to generate ${item.name}:`, error.message);
    if (retryCount < 2) {
      console.log(`🔄 Retrying ${item.name}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateWorkoutIcon(item, retryCount + 1);
    }
    return { success: false, cost: 0 };
  }
}

async function generateAllWorkoutIcons() {
  console.log('🏋️ WORKOUT ICON SPRITE GENERATION');
  console.log('========================================');

  const outputDir = path.join(__dirname, '../public/assets/workout');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (const item of WORKOUT_ICONS) {
    // Check if already exists
    const outputPath = path.join(outputDir, `${item.id}.png`);
    if (fs.existsSync(outputPath)) {
      console.log(`\n⏭️  Skipping ${item.name} (already exists)`);
      skippedCount++;
      continue;
    }

    const result = await generateWorkoutIcon(item);

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
    totalCost += result.cost;

    // Delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n========================================');
  console.log('✨ GENERATION COMPLETE!');
  console.log(`✅ Successfully generated: ${successCount}`);
  console.log(`⏭️  Skipped (existing): ${skippedCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log('📁 Sprites saved to: public/assets/workout/');
  console.log('========================================\n');
}

// Run generation
generateAllWorkoutIcons().catch(console.error);
