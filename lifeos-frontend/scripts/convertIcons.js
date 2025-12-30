import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resourcesDir = path.join(__dirname, '../resources');

async function convertIcons() {
  console.log('🎨 Converting SVG icons to PNG...\n');

  // Convert icon.svg to icon.png (1024x1024)
  const iconSvg = fs.readFileSync(path.join(resourcesDir, 'icon.svg'));
  await sharp(iconSvg)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(resourcesDir, 'icon.png'));
  console.log('✅ Created icon.png (1024x1024)');

  // Create icon-foreground.png (for Android adaptive icons)
  // Same icon but with transparent background
  const foregroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="crystal" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="50%" style="stop-color:#8b5cf6"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
  </defs>
  <!-- Main arrow/crystal shape - ascending (scaled down to fit safe zone) -->
  <polygon points="512,220 640,440 590,440 590,800 434,800 434,440 384,440" fill="url(#crystal)"/>
  <!-- Highlight -->
  <polygon points="512,220 512,440 434,440 434,800 475,800 475,425 512,425" fill="white" opacity="0.2"/>
</svg>`;

  await sharp(Buffer.from(foregroundSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(resourcesDir, 'icon-foreground.png'));
  console.log('✅ Created icon-foreground.png (1024x1024)');

  // Create icon-background.png (solid dark color for Android adaptive icons)
  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
    <rect width="1024" height="1024" fill="#0c0a10"/>
  </svg>`;

  await sharp(Buffer.from(bgSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(resourcesDir, 'icon-background.png'));
  console.log('✅ Created icon-background.png (1024x1024)');

  // Convert splash.svg to splash.png (2732x2732 for iPad Pro)
  const splashSvg = fs.readFileSync(path.join(resourcesDir, 'splash.svg'));
  await sharp(splashSvg)
    .resize(2732, 2732)
    .png()
    .toFile(path.join(resourcesDir, 'splash.png'));
  console.log('✅ Created splash.png (2732x2732)');

  // Create splash-dark.png (same as splash for dark mode)
  await sharp(splashSvg)
    .resize(2732, 2732)
    .png()
    .toFile(path.join(resourcesDir, 'splash-dark.png'));
  console.log('✅ Created splash-dark.png (2732x2732)');

  console.log('\n✨ All icons created! Now run: npx @capacitor/assets generate');
}

convertIcons().catch(console.error);
