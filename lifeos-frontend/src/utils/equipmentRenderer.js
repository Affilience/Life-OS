/**
 * Equipment Layer Rendering System
 * Handles layered sprite composition for equipment on character
 */

/**
 * Get layer rendering order based on character facing direction
 * Different facing directions require different z-ordering for realistic appearance
 */
export function getEquipmentLayerOrder(facing = 'down', animationState = 'idle') {
  const layerOrders = {
    down: {
      // Facing toward camera
      back: ['cape_back', 'backpack'],
      middle: ['body', 'suit', 'legs', 'boots'],
      front: ['mainHand', 'offHand', 'helmet', 'badge'],
    },
    up: {
      // Facing away from camera
      back: ['mainHand', 'offHand', 'backpack'],
      middle: ['body', 'suit', 'legs', 'boots', 'cape'],
      front: ['helmet'],
    },
    left: {
      // Facing left
      back: ['cape', 'backpack', 'offHand'],
      middle: ['body', 'suit', 'legs', 'boots'],
      front: ['mainHand', 'helmet', 'badge'],
    },
    right: {
      // Facing right (mirror of left)
      back: ['cape', 'backpack', 'mainHand'],
      middle: ['body', 'suit', 'legs', 'boots'],
      front: ['offHand', 'helmet', 'badge'],
    },
  };

  const order = layerOrders[facing] || layerOrders.down;

  // Flatten into single array
  return [...order.back, ...order.middle, ...order.front];
}

/**
 * Map equipment slots to layer names for rendering
 */
export const EQUIPMENT_TO_LAYER_MAP = {
  helmet: 'helmet',
  chest: 'suit',
  legs: 'legs',
  boots: 'boots',
  mainHand: 'mainHand',
  offHand: 'offHand',
  cape: 'cape',
  ring1: null, // Rings don't have visual representation
  ring2: null,
  amulet: 'badge', // Amulet shows as badge on chest
  backpack: 'backpack',
  tool: 'mainHand', // Tools are held in main hand
  badge: 'badge',
  suit: 'suit',
};

/**
 * Get sprite path for equipped item
 * Handles fallback to placeholder if sprite doesn't exist
 */
export function getEquipmentSpritePath(equipmentId, slot) {
  if (!equipmentId) return null;

  // Equipment sprites should match this pattern
  const basePath = `/assets/equipment/${slot}s`; // helmets, weapons, etc.
  const fileName = `${equipmentId}.png`;

  return `${basePath}/${fileName}`;
}

/**
 * Render equipment layer on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Image} sprite - Equipment sprite image
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Render size
 * @param {Object} effects - Visual effects (glow, particles, etc.)
 * @param {string} dyeColor - Optional color tint
 */
export function renderEquipmentLayer(ctx, sprite, x, y, size, effects = {}, dyeColor = null) {
  if (!sprite) return;

  ctx.save();

  // Apply glow effect if equipment has it
  if (effects.glow) {
    const glowStrength = {
      subtle: 5,
      medium: 10,
      strong: 15,
      intense: 20,
    }[effects.glow] || 0;

    if (glowStrength > 0) {
      ctx.shadowBlur = glowStrength;
      ctx.shadowColor = effects.glowColor || '#ffffff';
    }
  }

  // Apply dye color tint if present
  if (dyeColor) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = dyeColor;
  }

  // Draw the equipment sprite
  ctx.drawImage(sprite, Math.floor(x), Math.floor(y), size, size);

  // Reset composite operation
  if (dyeColor) {
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.restore();
}

/**
 * Render particle effects for legendary equipment
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {Object} particleConfig - Particle configuration
 * @param {number} time - Current timestamp for animation
 */
export function renderEquipmentParticles(ctx, x, y, particleConfig, time) {
  if (!particleConfig || !particleConfig.hasParticles) return;

  const { color = '#ffaa00', count = 3, spread = 20 } = particleConfig;

  ctx.save();

  for (let i = 0; i < count; i++) {
    // Calculate particle position with sine wave movement
    const offset = (time / 1000 + i) * 2; // 2 rad/s movement
    const particleX = x + Math.sin(offset) * spread;
    const particleY = y + Math.cos(offset) * spread - 10;

    // Particle size varies with time
    const size = 2 + Math.sin(time / 200 + i) * 1;

    // Draw sparkle
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6 + Math.sin(time / 300 + i) * 0.3;
    ctx.fillRect(Math.floor(particleX), Math.floor(particleY), size, size);
  }

  ctx.restore();
}

/**
 * Render aura effect for legendary equipment
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Center X position
 * @param {number} y - Center Y position
 * @param {number} radius - Aura radius
 * @param {string} color - Aura color
 * @param {number} time - Current timestamp for pulsing animation
 */
export function renderEquipmentAura(ctx, x, y, radius, color, time) {
  const pulsePhase = time / 1000; // 1 cycle per second
  const alpha = 0.2 + Math.sin(pulsePhase * 2) * 0.1; // Pulse between 0.1 and 0.3
  const currentRadius = radius + Math.sin(pulsePhase * 2) * 3;

  ctx.save();

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius);
  gradient.addColorStop(0, `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
  gradient.addColorStop(0.5, `${color}${Math.floor(alpha * 0.5 * 255).toString(16).padStart(2, '0')}`);
  gradient.addColorStop(1, `${color}00`);

  ctx.fillStyle = gradient;
  ctx.fillRect(
    Math.floor(x - currentRadius),
    Math.floor(y - currentRadius),
    currentRadius * 2,
    currentRadius * 2
  );

  ctx.restore();
}

/**
 * Apply palette swap / dye to equipment sprite
 * Creates a new colored version of a grayscale sprite
 * @param {HTMLImageElement} sourceImage - Source grayscale sprite
 * @param {string} targetColor - Hex color to apply
 * @returns {HTMLCanvasElement} - New canvas with colored sprite
 */
export function applyEquipmentDye(sourceImage, targetColor) {
  const canvas = document.createElement('canvas');
  canvas.width = sourceImage.width;
  canvas.height = sourceImage.height;
  const ctx = canvas.getContext('2d');

  // Draw source image
  ctx.drawImage(sourceImage, 0, 0);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Parse target color
  const r = parseInt(targetColor.slice(1, 3), 16);
  const g = parseInt(targetColor.slice(3, 5), 16);
  const b = parseInt(targetColor.slice(5, 7), 16);

  // Apply color to grayscale
  for (let i = 0; i < pixels.length; i += 4) {
    const gray = pixels[i]; // Use red channel as grayscale reference
    const alpha = pixels[i + 3];

    if (alpha > 0) {
      // Apply color based on gray value
      const intensity = gray / 255;
      pixels[i] = r * intensity;
      pixels[i + 1] = g * intensity;
      pixels[i + 2] = b * intensity;
    }
  }

  // Write back
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Pre-composite all equipment layers into single cached image
 * This optimization should be used when equipment doesn't change frequently
 * @param {Object} equippedItems - Map of slot -> equipment data
 * @param {Object} sprites - Loaded sprite images
 * @param {number} size - Render size
 * @param {string} facing - Character facing direction
 * @returns {HTMLCanvasElement} - Cached composite
 */
export function createEquipmentComposite(equippedItems, sprites, size, facing = 'down') {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Get proper layer order
  const layerOrder = getEquipmentLayerOrder(facing);

  // Render each equipment piece in order
  layerOrder.forEach(layerName => {
    const equipment = findEquipmentForLayer(equippedItems, layerName);
    if (equipment && sprites[equipment.id]) {
      renderEquipmentLayer(
        ctx,
        sprites[equipment.id],
        0,
        0,
        size,
        equipment.effects || {}
      );
    }
  });

  return canvas;
}

/**
 * Find equipment item that corresponds to a rendering layer
 * @param {Object} equippedItems - Equipped items by slot
 * @param {string} layerName - Layer name (helmet, suit, etc.)
 * @returns {Object|null} - Equipment item or null
 */
function findEquipmentForLayer(equippedItems, layerName) {
  // Reverse lookup from layer name to equipment slot
  const layerToSlot = {
    helmet: 'helmet',
    suit: 'chest',
    legs: 'legs',
    boots: 'boots',
    mainHand: 'mainHand',
    offHand: 'offHand',
    cape: 'cape',
    badge: 'badge',
    backpack: 'backpack',
  };

  const slot = layerToSlot[layerName];
  return equippedItems[slot] || null;
}

/**
 * Calculate rarity visual effects for equipment
 * @param {string} rarity - Equipment rarity (common, uncommon, rare, epic, legendary)
 * @returns {Object} - Visual effect configuration
 */
export function getRarityEffects(rarity) {
  const effects = {
    common: {
      glow: false,
      glowColor: null,
      hasParticles: false,
      hasAura: false,
    },
    uncommon: {
      glow: false,
      glowColor: '#1eff00',
      hasParticles: false,
      hasAura: false,
    },
    rare: {
      glow: 'subtle',
      glowColor: '#0070dd',
      hasParticles: false,
      hasAura: false,
    },
    epic: {
      glow: 'medium',
      glowColor: '#a335ee',
      hasParticles: true,
      particleCount: 2,
      hasAura: false,
    },
    legendary: {
      glow: 'strong',
      glowColor: '#ff8000',
      hasParticles: true,
      particleCount: 5,
      hasAura: true,
      auraRadius: 30,
    },
  };

  return effects[rarity] || effects.common;
}
