import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG icon and save it
const createSvgIcon = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#12101a"/>
      <stop offset="100%" style="stop-color:#0c0a10"/>
    </linearGradient>
    <linearGradient id="crystal" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="50%" style="stop-color:#8b5cf6"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="25" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bg)" rx="180"/>
  <!-- Glow effect -->
  <polygon points="512,150 700,480 630,480 630,874 394,874 394,480 324,480" fill="#8b5cf6" opacity="0.4" filter="url(#glow)"/>
  <!-- Main arrow/crystal shape - ascending -->
  <polygon points="512,180 670,450 610,450 610,850 414,850 414,450 354,450" fill="url(#crystal)"/>
  <!-- Highlight -->
  <polygon points="512,180 512,450 414,450 414,850 460,850 460,430 512,430" fill="white" opacity="0.2"/>
</svg>`;

  const outputDir = path.join(__dirname, '../resources');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(outputDir, 'icon.svg'), svg);
  console.log('✅ Created icon.svg');

  // Create splash SVG (simple dark background with subtle glow)
  const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:#0c0a10;stop-opacity:0"/>
    </radialGradient>
  </defs>
  <rect width="2732" height="2732" fill="#0c0a10"/>
  <circle cx="1366" cy="1366" r="800" fill="url(#glow)"/>
</svg>`;

  fs.writeFileSync(path.join(outputDir, 'splash.svg'), splashSvg);
  console.log('✅ Created splash.svg');

  console.log('\n📁 SVG files created in resources/');
  console.log('To generate PNG icons, you need to convert these SVGs.');
  console.log('Options:');
  console.log('  1. Use an online SVG to PNG converter');
  console.log('  2. Install sharp: npm install sharp');
  console.log('  3. Use Inkscape: inkscape -w 1024 -h 1024 icon.svg -o icon.png');
};

createSvgIcon();
