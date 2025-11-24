/**
 * Navbar Icon Sprite Generator - PixelLab API
 * Generates cosmic-themed pixel art icons for the sidebar navigation
 * Matching the Cosmic Violet theme of LifeOS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';
const API_URL = 'https://api.pixellab.ai/v1/generate-image-pixflux';

// Base negative prompt for all icons
const BASE_NEGATIVE = `blurry, low quality, distorted, deformed, ugly, realistic photo,
text, watermark, signature, duplicate, too detailed, cluttered, messy,
photorealistic, 3D render, gradients, anti-aliasing artifacts`;

// Navbar icons with cosmic/space theme matching the violet aesthetic
const NAV_ICONS = {
  home: {
    name: 'Home',
    filename: 'nav_home.png',
    size: 32,
    prompt: `highly detailed pixel art cosmic home base icon, futuristic space station dwelling,
purple and cyan glowing edges, sleek sci-fi building silhouette with antenna,
glowing windows with violet light, small floating particles around,
clean iconographic design, centered composition, game UI icon style,
single color black outline, vibrant purple and cyan color palette,
professional pixel art, polished indie game quality, transparent background`,
  },

  modules: {
    name: 'Modules',
    filename: 'nav_modules.png',
    size: 32,
    prompt: `highly detailed pixel art cosmic data cube grid icon, glowing 3D cube made of smaller cubes,
purple crystal energy matrix, holographic tech aesthetic, interconnected nodes,
sci-fi modular system visualization, glowing violet and cyan edges,
clean iconographic design, centered composition, game UI icon style,
single color black outline, vibrant purple and cyan color palette,
professional pixel art, polished indie game quality, transparent background`,
  },

  character: {
    name: 'Character',
    filename: 'nav_character.png',
    size: 32,
    prompt: `highly detailed pixel art futuristic astronaut helmet icon, sleek space helmet front view,
glowing purple visor reflection, small cyan accent lights on sides,
sci-fi explorer aesthetic, clean helmet silhouette,
clean iconographic design, centered composition, game UI icon style,
single color black outline, vibrant purple and cyan color palette,
professional pixel art, polished indie game quality, transparent background`,
  },

  social: {
    name: 'Social',
    filename: 'nav_social.png',
    size: 32,
    prompt: `highly detailed pixel art cosmic connection icon, two small astronaut figures connected by glowing energy beam,
purple and cyan glowing link between them, friendship and teamwork symbol,
sci-fi social network aesthetic, human silhouettes with helmet outlines,
clean iconographic design, centered composition, game UI icon style,
single color black outline, vibrant purple and cyan color palette,
professional pixel art, polished indie game quality, transparent background`,
  },

  quests: {
    name: 'Quests',
    filename: 'nav_quests.png',
    size: 32,
    prompt: `highly detailed pixel art cosmic quest marker icon, glowing compass star with target crosshair,
purple and gold energy radiating outward, adventure waypoint beacon,
sci-fi mission objective aesthetic, four-pointed star design,
clean iconographic design, centered composition, game UI icon style,
single color black outline, vibrant purple gold and cyan color palette,
professional pixel art, polished indie game quality, transparent background`,
  },

  settings: {
    name: 'Settings',
    filename: 'nav_settings.png',
    size: 32,
    prompt: `highly detailed pixel art futuristic gear cog icon, sleek mechanical gear with glowing center,
purple energy core in middle, cyan accent teeth on gear edges,
sci-fi technology aesthetic, smooth gear silhouette,
clean iconographic design, centered composition, game UI icon style,
single color black outline, vibrant purple and cyan color palette,
professional pixel art, polished indie game quality, transparent background`,
  },
};

/**
 * Generate a single navbar icon sprite
 */
async function generateNavIcon(iconKey, config) {
  console.log(`\n🎨 Generating ${config.name} icon...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: config.prompt,
        negative_description: BASE_NEGATIVE,
        image_size: {
          width: config.size,
          height: config.size
        },
        text_guidance_scale: 8.5,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Save sprite
    const outputDir = path.join(__dirname, '..', 'public', 'assets', 'icons', 'nav');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, config.filename);
    const base64Data = data.image.base64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    fs.writeFileSync(outputPath, imageBuffer);

    const cost = data.cost || data.usage?.usd || 0;
    console.log(`✅ ${config.name} saved to ${config.filename}`);
    console.log(`   Cost: $${cost.toFixed(4)}`);

    return cost;
  } catch (error) {
    console.error(`❌ Failed to generate ${config.name}:`, error.message);
    return 0;
  }
}

/**
 * Generate all navbar icons
 */
async function generateAllNavIcons() {
  console.log('🚀 Starting Navbar Icon Generation\n');
  console.log('━'.repeat(60));
  console.log('  Theme: Cosmic Violet');
  console.log('  Style: Futuristic Sci-Fi Pixel Art');
  console.log('  Size: 32x32 pixels');
  console.log('━'.repeat(60));

  let totalCost = 0;
  const icons = Object.entries(NAV_ICONS);

  for (let i = 0; i < icons.length; i++) {
    const [key, config] = icons[i];
    const cost = await generateNavIcon(key, config);
    totalCost += cost;

    // Progress
    console.log(`   📈 Progress: ${i + 1}/${icons.length}`);

    // Rate limiting: wait 2 seconds between requests
    if (i < icons.length - 1) {
      console.log('   ⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log(`\n✨ Generation Complete!`);
  console.log(`   Total Icons: ${icons.length}`);
  console.log(`   Total Cost: $${totalCost.toFixed(4)}`);
  console.log(`   Saved to: public/assets/icons/nav/\n`);

  // Create metadata file
  const metadata = {
    generated: new Date().toISOString(),
    theme: 'Cosmic Violet',
    totalIcons: icons.length,
    icons: Object.entries(NAV_ICONS).map(([key, config]) => ({
      key,
      name: config.name,
      filename: config.filename,
      path: `/assets/icons/nav/${config.filename}`
    }))
  };

  const metadataPath = path.join(__dirname, '..', 'public', 'assets', 'icons', 'nav', 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log('📄 Metadata saved to public/assets/icons/nav/metadata.json');
}

// Run generation
generateAllNavIcons().catch(console.error);
