/**
 * Analyze pixel colors in sprite to find skin vs clothing colors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

async function analyzeSprite(spritePath, label) {
  console.log(`\n📊 Analyzing: ${label}`);
  console.log('─'.repeat(50));

  const image = await loadImage(spritePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Collect unique colors
  const colorMap = new Map();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 128) continue; // Skip transparent

    const key = `${r},${g},${b}`;
    if (!colorMap.has(key)) {
      const hsl = rgbToHsl(r, g, b);
      colorMap.set(key, {
        r, g, b,
        hsl,
        count: 1,
        rMinusG: r - g,
        rMinusB: r - b,
      });
    } else {
      colorMap.get(key).count++;
    }
  }

  // Sort by count
  const colors = Array.from(colorMap.values()).sort((a, b) => b.count - a.count);

  // Categorize
  const skinLike = colors.filter(c =>
    c.r > c.g && c.r > c.b && // Warm
    c.hsl.h >= 0 && c.hsl.h <= 40 && // Red-orange hue
    c.hsl.l >= 30 && c.hsl.l <= 85 // Mid lightness
  );

  const brownLike = colors.filter(c =>
    c.r >= c.g && c.r > c.b &&
    c.hsl.h >= 20 && c.hsl.h <= 50 &&
    c.hsl.s >= 30
  );

  console.log('\n🎨 Top 15 colors by pixel count:');
  colors.slice(0, 15).forEach((c, i) => {
    const type = c.rMinusG > 15 ? '🟢 SKIN?' : c.rMinusG > 5 ? '🟡 MAYBE' : '🔴 CLOTH?';
    console.log(`${i + 1}. RGB(${c.r},${c.g},${c.b}) HSL(${c.hsl.h}°,${c.hsl.s}%,${c.hsl.l}%) x${c.count} R-G=${c.rMinusG} ${type}`);
  });

  console.log('\n📍 Likely SKIN colors (R-G > 15):');
  skinLike.filter(c => c.rMinusG > 15).slice(0, 10).forEach(c => {
    console.log(`   RGB(${c.r},${c.g},${c.b}) HSL(${c.hsl.h}°,${c.hsl.s}%,${c.hsl.l}%) x${c.count}`);
  });

  console.log('\n👕 Likely CLOTH colors (R-G <= 5):');
  colors.filter(c => c.rMinusG <= 5 && c.hsl.l > 20).slice(0, 10).forEach(c => {
    console.log(`   RGB(${c.r},${c.g},${c.b}) HSL(${c.hsl.h}°,${c.hsl.s}%,${c.hsl.l}%) x${c.count}`);
  });
}

async function main() {
  await analyzeSprite(
    path.join(__dirname, '..', 'public', 'assets', 'avatar', 'base-evolution', 'heroine_base_stage_20_veteran.png'),
    'Heroine Stage 20'
  );

  await analyzeSprite(
    path.join(__dirname, '..', 'public', 'assets', 'avatar', 'base-evolution', 'hero_base_stage_10_swordsman.png'),
    'Hero Stage 10'
  );
}

main().catch(console.error);
