/**
 * Placeholder Sprite Generator
 * Generates simple colored rectangles as temporary sprites until real pixel art is added
 */

import { AVATAR_TIERS, EQUIPMENT_RARITY } from '../data/avatarData';
import { getStageByLevel } from '../data/avatarEvolution';
import { useAvatarStore } from '../stores/avatarStore';

const SPRITE_SIZE = 256; // Increased for better quality when scaled

// Create a canvas element for drawing
function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

// Generate base character sprite based on level (NEW - uses base evolution sprites for overlay system!)
export function generateSpriteByLevel(level, prestige = 0, gender = null) {
  const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
  const ctx = canvas.getContext('2d');

  // Get the appropriate evolution stage for this level
  const stage = getStageByLevel(level, prestige);

  // Get gender from store if not provided
  const characterGender = gender || useAvatarStore.getState().characterGender || 'male';
  const genderPrefix = characterGender === 'female' ? 'heroine' : 'hero';

  // Background (transparent)
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  // Build base evolution sprite path (no armor - for equipment overlay system)
  const stageName = stage.name.toLowerCase().replace(/ /g, '_');
  const stageNumber = stage.levelRequired || level;
  const baseSpritePath = `/assets/avatar/base-evolution/${genderPrefix}_base_stage_${stageNumber}_${stageName}.png`;

  // Fallback to v3 sprites if base doesn't exist
  const fallbackPath = `/assets/avatar/evolution/hero_v3_stage_${stageNumber}_${stageName}.png`;

  // Second fallback to old path from stage data
  const legacyPath = `/assets/avatar/${stage.sprite}`;

  return new Promise((resolve) => {
    const img = new Image();

    // Try base sprite first (no armor)
    img.onload = () => {
      const spriteWidth = 128;
      const spriteHeight = 128;
      ctx.drawImage(img, 0, 0, spriteWidth, spriteHeight, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
      resolve(canvas.toDataURL());
    };

    img.onerror = () => {
      // Try v3 fallback
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        const spriteWidth = 128;
        const spriteHeight = 128;
        ctx.drawImage(fallbackImg, 0, 0, spriteWidth, spriteHeight, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
        resolve(canvas.toDataURL());
      };
      fallbackImg.onerror = () => {
        // Try legacy path
        const legacyImg = new Image();
        legacyImg.onload = () => {
          const spriteWidth = 128;
          const spriteHeight = 128;
          ctx.drawImage(legacyImg, 0, 0, spriteWidth, spriteHeight, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
          resolve(canvas.toDataURL());
        };
        legacyImg.onerror = () => {
          // Final fallback to placeholder
          console.warn(`Failed to load stage sprite for stage ${stageNumber}: ${stage.name}`);
          ctx.fillStyle = stage.colors?.primary || '#8B7355';
          ctx.fillRect(64, 96, 128, 112);
          ctx.beginPath();
          ctx.arc(128, 64, 48, 0, Math.PI * 2);
          ctx.fillStyle = stage.colors?.secondary || '#A0826D';
          ctx.fill();
          resolve(canvas.toDataURL());
        };
        legacyImg.src = legacyPath;
      };
      fallbackImg.src = fallbackPath;
    };

    img.src = baseSpritePath;
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

// Generate sprite sheet (for optimisation)
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
