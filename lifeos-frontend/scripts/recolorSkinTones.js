/**
 * Skin Tone Recoloring Script v3
 * - Direct color replacement (not HSL shifting)
 * - Very distinct, obvious color differences
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3 skin tone options (base sprite is already light)
const SKIN_PALETTES = {
  olive: {
    name: 'Olive',
    colors: [
      { r: 220, g: 210, b: 140 },  // Highlight - yellow-green
      { r: 190, g: 185, b: 110 },  // Light - olive yellow
      { r: 160, g: 160, b: 85 },   // Mid - green olive
      { r: 130, g: 135, b: 60 },   // Dark - dark olive
      { r: 100, g: 105, b: 45 },   // Darkest - deep green
    ]
  },
  brown: {
    name: 'Brown',
    colors: [
      { r: 180, g: 120, b: 85 },   // Highlight - caramel
      { r: 150, g: 95, b: 60 },    // Light - milk chocolate
      { r: 120, g: 70, b: 45 },    // Mid - chocolate
      { r: 90, g: 50, b: 30 },     // Dark - dark chocolate
      { r: 65, g: 35, b: 20 },     // Darkest - espresso
    ]
  },
  black: {
    name: 'Black',
    colors: [
      { r: 110, g: 70, b: 50 },    // Highlight - coffee
      { r: 80, g: 50, b: 35 },     // Light - dark coffee
      { r: 55, g: 35, b: 25 },     // Mid - very dark
      { r: 40, g: 25, b: 18 },     // Dark - near black
      { r: 30, g: 20, b: 15 },     // Darkest - ebony
    ]
  }
};

// Known skin colors from sprite analysis (with tolerance matching)
const SKIN_REFERENCE_COLORS = [
  // Heroine skin colors (from analysis)
  { r: 216, g: 155, b: 117 },  // Main skin
  { r: 218, g: 161, b: 122 },  // Light skin
  { r: 214, g: 149, b: 111 },  // Shadow
  { r: 204, g: 141, b: 101 },  // Darker
  { r: 250, g: 229, b: 186 },  // Highlight
  { r: 248, g: 224, b: 183 },  // Highlight 2
  // Hero skin colors (from analysis)
  { r: 250, g: 213, b: 169 },  // Main highlight
  { r: 247, g: 208, b: 165 },  // Light
  { r: 250, g: 212, b: 177 },  // Variant
  { r: 250, g: 218, b: 176 },  // Variant 2
  // Mid tones
  { r: 197, g: 140, b: 100 },
  { r: 190, g: 135, b: 95 },
  { r: 180, g: 125, b: 90 },
  // Additional highlights (often missed)
  { r: 255, g: 240, b: 200 },  // Very bright highlight
  { r: 255, g: 235, b: 195 },
  { r: 255, g: 230, b: 190 },
  { r: 245, g: 220, b: 175 },
  { r: 240, g: 200, b: 160 },
  { r: 235, g: 195, b: 155 },
  { r: 230, g: 185, b: 145 },
  { r: 225, g: 175, b: 135 },
  { r: 220, g: 170, b: 130 },
  // Darker shadow tones
  { r: 170, g: 115, b: 80 },
  { r: 160, g: 105, b: 70 },
  { r: 150, g: 95, b: 65 },
];

// Check if pixel matches any known skin color (with tolerance)
// mode: 'super' for black (catch everything), 'aggressive' for brown, 'conservative' for olive
function isSkinPixel(r, g, b, a, mode = 'aggressive') {
  if (a < 128) return false;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2 / 255;

  // Conservative mode: ALWAYS exclude dark pixels (clothes) regardless of color match
  if (mode === 'conservative' && l < 0.55) return false;

  // Super mode: catch ANY warm pixel that could be skin or skin outline
  if (mode === 'super') {
    // Very permissive - just needs to be warm-ish
    if (r >= g - 10 && r > b && l > 0.25 && l < 0.98) {
      // Hue check - anything in red-orange-yellow range
      let h = 0;
      if (max !== min) {
        const d = max - min;
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
      }
      const hDegrees = h * 360;
      if (hDegrees >= 0 && hDegrees <= 55) return true;
    }
  }

  const tolerance = mode === 'super' ? 60 : (mode === 'aggressive' ? 50 : 25);

  for (const ref of SKIN_REFERENCE_COLORS) {
    const dr = Math.abs(r - ref.r);
    const dg = Math.abs(g - ref.g);
    const db = Math.abs(b - ref.b);

    if (dr <= tolerance && dg <= tolerance && db <= tolerance) {
      // For conservative mode, also check hue even for reference matches
      if (mode === 'conservative') {
        let h = 0;
        if (max !== min) {
          const d = max - min;
          if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        }
        const hDegrees = h * 360;
        if (hDegrees > 28) continue;  // Skip if hue is too yellow (clothes)
      }
      return true;
    }
  }

  // Also catch by characteristics for skin-like colors not in reference
  // (max, min, l already calculated above)

  // Must be warm (R highest or equal)
  if (r < g - 5 || r < b - 5) return false;

  const isVeryBright = l > 0.75;
  const isHighlight = l > 0.60;

  // Aggressive mode: catch more highlights even if some clothes get affected
  // Conservative mode: stricter detection to preserve clothes
  if (mode === 'aggressive') {
    // Very bright warm pixels are almost always skin highlights
    if (isVeryBright && r >= g && r > b) {
      if (r - b > 10) return true;
    }
  }

  let minRGGap, minRBGap;
  if (mode === 'aggressive') {
    if (isVeryBright) {
      minRGGap = 5;
      minRBGap = 10;
    } else if (isHighlight) {
      minRGGap = 10;
      minRBGap = 20;
    } else {
      minRGGap = 25;
      minRBGap = 35;
    }
  } else {
    // Conservative - very strict to exclude clothes
    if (isHighlight) {
      minRGGap = 40;
      minRBGap = 50;
    } else {
      minRGGap = 50;
      minRBGap = 60;
    }
  }

  if (r - g < minRGGap) return false;
  if (r - b < minRBGap) return false;

  // Hue check
  let h = 0;
  if (max !== min) {
    const d = max - min;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  }
  const hDegrees = h * 360;

  const maxHue = mode === 'aggressive'
    ? (isVeryBright ? 50 : (isHighlight ? 45 : 35))
    : 25;  // Very strict hue for conservative - exclude yellow-browns

  if (hDegrees < 3 || hDegrees > maxHue) return false;

  // Good lightness for skin
  if (l < 0.28 || l > 0.98) return false;

  return true;
}

// Get luminance of a pixel (0-1)
function getLuminance(r, g, b) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Map pixel to new palette based on its luminance
function mapTopalette(r, g, b, palette) {
  const lum = getLuminance(r, g, b);

  // Map luminance to palette index (0-4)
  let idx;
  if (lum >= 0.75) idx = 0;       // Highlight
  else if (lum >= 0.60) idx = 1;  // Light
  else if (lum >= 0.45) idx = 2;  // Mid
  else if (lum >= 0.30) idx = 3;  // Dark
  else idx = 4;                    // Darkest

  // Interpolate for smoother gradients
  const color = palette.colors[idx];
  const nextIdx = Math.min(4, idx + 1);
  const nextColor = palette.colors[nextIdx];

  // Calculate blend factor within this band
  const bandStart = [0.75, 0.60, 0.45, 0.30, 0][idx];
  const bandEnd = [1.0, 0.75, 0.60, 0.45, 0.30][idx];
  const t = bandEnd > bandStart ? (lum - bandStart) / (bandEnd - bandStart) : 0;

  return {
    r: Math.round(color.r + t * (nextColor.r - color.r) * 0.5),
    g: Math.round(color.g + t * (nextColor.g - color.g) * 0.5),
    b: Math.round(color.b + t * (nextColor.b - color.b) * 0.5),
  };
}

// Process sprite
async function recolorSprite(inputPath, outputPath, palette, mode = 'aggressive') {
  const image = await loadImage(inputPath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let skinPixelsChanged = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (isSkinPixel(r, g, b, a, mode)) {
      const newColor = mapTopalette(r, g, b, palette);
      data[i] = newColor.r;
      data[i + 1] = newColor.g;
      data[i + 2] = newColor.b;
      skinPixelsChanged++;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));

  return skinPixelsChanged;
}

async function main() {
  console.log('🎨 SKIN TONE RECOLORING v3');
  console.log('===========================');
  console.log('✓ Direct color palette mapping');
  console.log('✓ Very distinct skin tones\n');

  const outputDir = path.join(__dirname, '..', 'public', 'assets', 'avatar', 'skin-tones');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sprites = [
    {
      input: path.join(__dirname, '..', 'public', 'assets', 'avatar', 'base-evolution', 'hero_base_stage_10_swordsman.png'),
      outputPrefix: 'hero_base_stage_10_swordsman',
      label: 'Hero Stage 10'
    },
    {
      input: path.join(__dirname, '..', 'public', 'assets', 'avatar', 'base-evolution', 'heroine_base_stage_20_veteran.png'),
      outputPrefix: 'heroine_base_stage_20_veteran',
      label: 'Heroine Stage 20'
    }
  ];

  for (const sprite of sprites) {
    console.log(`\n📁 Processing: ${sprite.label}`);
    console.log('─'.repeat(40));

    if (!fs.existsSync(sprite.input)) {
      console.log(`❌ Source not found: ${sprite.input}`);
      continue;
    }

    for (const [toneId, palette] of Object.entries(SKIN_PALETTES)) {
      const outputPath = path.join(outputDir, `${sprite.outputPrefix}_${toneId}.png`);
      // Use conservative mode for olive (preserves clothes), super-aggressive for black, aggressive for brown
      const mode = toneId === 'olive' ? 'conservative' : (toneId === 'black' ? 'super' : 'aggressive');

      try {
        const pixelsChanged = await recolorSprite(sprite.input, outputPath, palette, mode);
        console.log(`✅ ${palette.name}: ${pixelsChanged} pixels (${mode})`);
      } catch (error) {
        console.error(`❌ ${palette.name}: ${error.message}`);
      }
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('✅ COMPLETE');
}

main().catch(console.error);
