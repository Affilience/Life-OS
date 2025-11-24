/**
 * Placeholder Sprite Generator
 * Generates simple colored rectangles as temporary sprites until real pixel art is added
 */

import { AVATAR_TIERS, EQUIPMENT_RARITY } from '../data/avatarData';
import { getStageByLevel } from '../data/avatarEvolution';

const SPRITE_SIZE = 256; // Increased for better quality when scaled

// Create a canvas element for drawing
function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

// Generate base character sprite based on level (NEW - uses evolution stages!)
export function generateSpriteByLevel(level, prestige = 0) {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');

  // Get the appropriate evolution stage for this level
  const stage = getStageByLevel(level, prestige);

  // Background (transparent)
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  const spriteSheetPath = `/assets/avatar/${stage.sprite}`;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // AI-generated sprites are 128x128, single frame
      const spriteWidth = 128;
      const spriteHeight = 128;

      // Draw the sprite
      ctx.drawImage(
        img,
        0, 0,
        spriteWidth, spriteHeight,
        0, 0,
        SPRITE_SIZE, SPRITE_SIZE
      );

      resolve(canvas.toDataURL());
    };
    img.onerror = () => {
      // Fallback to placeholder if image fails to load
      console.warn(`Failed to load stage sprite: ${stage.sprite}`);
      // Draw simple placeholder
      ctx.fillStyle = stage.colors.primary;
      ctx.fillRect(64, 96, 128, 112);
      ctx.beginPath();
      ctx.arc(128, 64, 48, 0, Math.PI * 2);
      ctx.fillStyle = stage.colors.secondary;
      ctx.fill();
      resolve(canvas.toDataURL());
    };
    img.src = spriteSheetPath;
  });
}

// OLD FUNCTION - Keep for backwards compatibility but deprecated
export function generateTierSprite(tier, frame = 0) {
  // Map old tiers to approximate levels
  const levelMap = { 1: 9, 2: 15, 3: 26, 4: 51 };
  return generateSpriteByLevel(levelMap[tier] || 1);
}

// Generate equipment sprite
export function generateEquipmentSprite(equipmentId, slot, tier, rarity) {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  const rarityData = EQUIPMENT_RARITY[rarity];

  // Scale factor for equipment (256 / 32 = 8x)
  const scale = SPRITE_SIZE / 32;

  // Draw equipment based on slot
  switch (slot) {
    case 'helmet':
      // Enhanced helmet overlay
      ctx.strokeStyle = rarityData.color;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(16 * scale, 8 * scale, 7 * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Add detail lines for higher tiers
      if (tier >= 2) {
        ctx.strokeStyle = rarityData.color;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(10 * scale, 8 * scale);
        ctx.lineTo(22 * scale, 8 * scale);
        ctx.stroke();
      }
      break;

    case 'suit':
      // Chest plate overlay
      ctx.fillStyle = rarityData.color;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(9 * scale, 13 * scale, 14 * scale, 12 * scale);
      ctx.globalAlpha = 1;

      // Panel lines
      ctx.strokeStyle = rarityData.color;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(16 * scale, 13 * scale);
      ctx.lineTo(16 * scale, 25 * scale);
      ctx.stroke();
      break;

    case 'backpack':
      // Backpack behind character
      ctx.fillStyle = rarityData.color;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(11 * scale, 14 * scale, 10 * scale, 10 * scale);
      ctx.globalAlpha = 1;

      // Straps
      ctx.strokeStyle = rarityData.color;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(12 * scale, 15 * scale);
      ctx.lineTo(12 * scale, 23 * scale);
      ctx.moveTo(20 * scale, 15 * scale);
      ctx.lineTo(20 * scale, 23 * scale);
      ctx.stroke();
      break;

    case 'tool':
      // Tool in hand
      ctx.fillStyle = rarityData.color;
      ctx.fillRect(22 * scale, 18 * scale, 4 * scale, 6 * scale);

      // Tool detail
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(23 * scale, 19 * scale, 2 * scale, 2 * scale);
      break;

    case 'badge':
      // Badge on chest
      ctx.beginPath();
      ctx.arc(14 * scale, 18 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fillStyle = rarityData.color;
      ctx.fill();

      // Star shape for higher tiers
      if (tier >= 3) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(13 * scale, 18 * scale, 2 * scale, 1 * scale);
        ctx.fillRect(14 * scale, 17 * scale, 1 * scale, 2 * scale);
      }
      break;
  }

  // Add glow for rare+ equipment
  if (rarityData.glow) {
    ctx.shadowBlur = rarityData.glow === 'subtle' ? 3 :
                     rarityData.glow === 'medium' ? 6 :
                     rarityData.glow === 'strong' ? 10 : 15;
    ctx.shadowColor = rarityData.color;
  }

  return canvas.toDataURL();
}

// Generate animated idle frames (simple up/down movement)
export function generateIdleAnimation(tier, equippedItems) {
  const frames = [];

  // 4 frames for breathing animation
  for (let i = 0; i < 4; i++) {
    const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
    const ctx = canvas.getContext('2d');

    // Offset for breathing effect (0, 1, 2, 1 pixels)
    const yOffset = i === 0 ? 0 : i === 1 ? -1 : i === 2 ? -2 : -1;

    ctx.save();
    ctx.translate(0, yOffset);

    // Draw base character
    const baseSprite = new Image();
    baseSprite.src = generateTierSprite(tier);
    ctx.drawImage(baseSprite, 0, 0);

    // Draw equipment layers
    Object.entries(equippedItems).forEach(([slot, item]) => {
      if (item) {
        const equipSprite = new Image();
        equipSprite.src = generateEquipmentSprite(item.id, slot, item.tier, item.rarity);
        ctx.drawImage(equipSprite, 0, 0);
      }
    });

    ctx.restore();

    frames.push(canvas.toDataURL());
  }

  return frames;
}

// Generate sprite sheet (for optimization)
export function generateSpriteSheet(tier, equippedItems) {
  const frames = 4; // idle animation frames
  const canvas = createCanvas(SPRITE_SIZE * frames, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');

  const animFrames = generateIdleAnimation(tier, equippedItems);

  animFrames.forEach((frameData, index) => {
    const img = new Image();
    img.src = frameData;
    ctx.drawImage(img, SPRITE_SIZE * index, 0);
  });

  return {
    spriteSheet: canvas.toDataURL(),
    frameWidth: SPRITE_SIZE,
    frameHeight: SPRITE_SIZE,
    frameCount: frames,
  };
}
