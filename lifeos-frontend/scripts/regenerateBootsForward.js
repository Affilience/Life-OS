#!/usr/bin/env node

/**
 * Regenerate boots with more forward-facing perspective, only slightly angled outward
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.PIXELLAB_API_KEY || 'a611b2e1-f82b-41b4-b50a-4babde321f7d';

const BOOTS = [
  { name: 'cloth_shoes', description: 'simple cloth shoes, brown fabric, flat soles, medieval peasant footwear' },
  { name: 'leather_boots', description: 'brown leather boots, sturdy construction, adventurer style, buckles' },
  { name: 'iron_boots', description: 'iron plated boots, metallic gray, armored footwear, reinforced toe caps' },
  { name: 'steel_greaves_boots', description: 'steel greaves with boots, shiny silver metal, knight armor, protective plating' },
  { name: 'phoenix_boots', description: 'legendary phoenix boots, orange and gold flames, ember glow, fiery magical footwear' },
];

async function generateBoot(boot) {
  // Generate ONE single boot - flat 2D front view, very slightly angled outward
  // Like the stage 10 swordsman boots - simple flat front-facing boot
  const response = await fetch('https://api.pixellab.ai/v1/generate-image-pixflux', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      description: `single ${boot.description}, flat 2D front view, completely flat pixel art boot sprite, front-facing with toe pointing very slightly to the right, simple flat silhouette, no depth, transparent background`,
      negative_description: 'pair, two boots, 3D, depth, perspective, opening, hole, top view, side view, isometric, shading, shadow, multiple, leg, foot, ankle',
      image_size: { width: 32, height: 32 },
      style: 'pixel_art',
      no_background: true,
      text_guidance_scale: 12,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${error}`);
  }

  const data = await response.json();
  return Buffer.from(data.image.base64, 'base64');
}

async function flipImageHorizontally(imageBuffer) {
  const img = await loadImage(imageBuffer);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');

  ctx.translate(img.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0);

  return canvas.toBuffer('image/png');
}

async function main() {
  console.log('Generating boots - one generated, mirrored for other side...\n');

  const leftDir = path.join(__dirname, '../public/assets/equipment/boots_left');
  const rightDir = path.join(__dirname, '../public/assets/equipment/boots_right');

  // Ensure directories exist
  if (!fs.existsSync(leftDir)) fs.mkdirSync(leftDir, { recursive: true });
  if (!fs.existsSync(rightDir)) fs.mkdirSync(rightDir, { recursive: true });

  let totalCost = 0;

  for (const boot of BOOTS) {
    process.stdout.write(`${boot.name}... `);
    try {
      // Generate ONE boot (facing slightly right) - this becomes the RIGHT boot
      const rightBuffer = await generateBoot(boot);
      fs.writeFileSync(path.join(rightDir, `${boot.name}.png`), rightBuffer);

      // Mirror it horizontally for LEFT boot (will face slightly left)
      const leftBuffer = await flipImageHorizontally(rightBuffer);
      fs.writeFileSync(path.join(leftDir, `${boot.name}.png`), leftBuffer);

      console.log('done');
      totalCost += 0.006;
    } catch (error) {
      console.log(`FAILED: ${error.message}`);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nCost: $${totalCost.toFixed(4)}`);
}

main().catch(console.error);
