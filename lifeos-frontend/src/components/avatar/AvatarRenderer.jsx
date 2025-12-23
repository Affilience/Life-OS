import React, { useEffect, useRef, useState } from 'react';
import { useAvatarStore } from '../../stores/avatarStore';
import { generateSpriteByLevel, generateEquipmentSprite } from '../../utils/spriteGenerator';
import {
  getEquipmentLayerOrder,
  renderEquipmentLayer,
  renderEquipmentParticles,
  renderEquipmentAura,
  getRarityEffects,
} from '../../utils/equipmentRenderer';
import { EQUIPMENT_DATABASE } from '../../data/equipmentDatabase';
import { useGamificationModeStore } from '../../stores/gamificationModeStore';
import { supabase } from '../../lib/supabase';
import { User } from 'lucide-react';
import './AvatarRenderer.css';

// Cache for preloaded images to prevent re-loading on every render
const imageCache = new Map();

// Storage key for saved equipment positions (same as EquipmentTest page)
const POSITIONS_STORAGE_KEY = 'lifeos-equipment-positions';

// Global positions cache (loaded from Supabase once)
let globalPositionsCache = null;
let globalPositionsLoading = false;
let globalPositionsListeners = [];

// Load global positions from Supabase (cached)
async function loadGlobalPositions() {
  // Return cached if available
  if (globalPositionsCache !== null) {
    return globalPositionsCache;
  }

  // If already loading, wait for it
  if (globalPositionsLoading) {
    return new Promise(resolve => {
      globalPositionsListeners.push(resolve);
    });
  }

  globalPositionsLoading = true;

  try {
    const { data, error } = await supabase
      .from('equipment_default_positions')
      .select('position_key, x, y, scale');

    if (error) {
      console.error('[AvatarRenderer] Failed to load global positions:', error);
      globalPositionsCache = {};
    } else if (data && data.length > 0) {
      globalPositionsCache = {};
      data.forEach(row => {
        globalPositionsCache[row.position_key] = {
          x: parseFloat(row.x),
          y: parseFloat(row.y),
          scale: parseFloat(row.scale)
        };
      });
    } else {
      globalPositionsCache = {};
    }
  } catch (err) {
    console.error('[AvatarRenderer] Error loading global positions:', err);
    globalPositionsCache = {};
  }

  globalPositionsLoading = false;

  // Notify all waiting listeners
  globalPositionsListeners.forEach(resolve => resolve(globalPositionsCache));
  globalPositionsListeners = [];

  return globalPositionsCache;
}

// Helper to load an image with caching
function loadImage(src) {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src));
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

// Get saved positions from localStorage (fallback only)
function getLocalPositions() {
  try {
    const saved = localStorage.getItem(POSITIONS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// Always use Stage 10 Swordsman as base avatar
const BASE_AVATAR_PATH = '/assets/avatar/base-evolution/hero_base_stage_10_swordsman.png';

// Default positions for equipment slots (on 256x256 canvas)
// Character's right hand ≈ x:60 (viewer's left), left hand ≈ x:90 (viewer's right)
const DEFAULT_POSITIONS = {
  capes: { x: 75, y: 50, scale: 0.5 },
  legs: { x: 80, y: 140, scale: 0.45 },
  chests: { x: 70, y: 70, scale: 0.55 },
  shields_left: { x: 90, y: 80, scale: 0.4 },
  shields_right: { x: 60, y: 80, scale: 0.4 },
  helmets: { x: 80, y: 10, scale: 0.45 },
  weapons_left: { x: 90, y: 50, scale: 0.5 },
  weapons_right: { x: 60, y: 50, scale: 0.5 },
};

/**
 * AvatarRenderer - Renders the character avatar with equipment
 *
 * Supports gamification modes:
 * - Cosmic: Full pixel art avatar with effects
 * - Professional: Simplified avatar or initials-based
 * - Minimal: Hidden (shows placeholder)
 */
export default function AvatarRenderer({
  size = 128,
  animate = true,
  showStats = false,
  className = '',
}) {
  const canvasRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [globalPositions, setGlobalPositions] = useState({});

  // Load global positions from Supabase on mount
  useEffect(() => {
    loadGlobalPositions().then(positions => {
      setGlobalPositions(positions);
    });
  }, []);

  // Get gamification mode settings
  const { mode, isVisible, getTerm } = useGamificationModeStore();
  const showAvatar = isVisible('showAvatar');
  const showAvatarEffects = isVisible('showAvatarEffects');
  const showParticleEffects = isVisible('showParticleEffects');

  const {
    level,
    prestige,
    currentTier,
    equipped,
    stats,
    getCurrentTierData,
    getEquippedItems,
    getVisualEquipment,
  } = useAvatarStore();

  const tierData = getCurrentTierData();
  const equippedItems = getEquippedItems();
  const visualEquipment = getVisualEquipment();

  // If avatar is hidden in current mode, show a minimal placeholder
  if (!showAvatar) {
    return (
      <div className={`avatar-renderer ${className}`}>
        <div
          className="flex items-center justify-center rounded-xl"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <div className="text-center">
            <User className="w-12 h-12 mx-auto mb-2 text-blue-400" />
            <div className="text-lg font-bold text-blue-400">
              {getTerm('level')} {level}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Animation loop - just use breathing effect, not walking frames
  useEffect(() => {
    if (!animate) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 2); // 2 frames for breathing only
    }, 500); // Slower breathing effect

    return () => clearInterval(interval);
  }, [animate]);

  // Render sprite - preload ALL images first, then render synchronously
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Match EquipmentTest: no padding, avatar fills full canvas at 256x256 base
    const baseSize = 256;
    const padding = 0; // No padding - matches EquipmentTest behavior
    const availableSize = size;

    // No offset needed - draw at origin like EquipmentTest
    const offsetX = 0;
    // Subtle breathing animation - just moves up and down slightly
    const breathingOffset = animate ? (currentFrame === 0 ? 0 : -2) : 0;
    const offsetY = breathingOffset;

    // Collect all equipment sprite paths that need to be loaded
    const facing = 'down';
    const layerOrder = getEquipmentLayerOrder(facing);
    const layerToSlot = {
      helmet: 'helmet',
      suit: 'chest',
      legs: 'legs',
      mainHand: 'mainHand',
      offHand: 'offHand',
      cape: 'cape',
      cape_back: 'cape',
      backpack: null,
    };

    // Get positions: Global (Supabase) > Local (localStorage) > Defaults
    const localPositions = getLocalPositions();
    const savedPositions = { ...localPositions, ...globalPositions };
    const savedKeys = Object.keys(savedPositions);

    // Helper to extract base name from ID (remove prefix like "weapon_", "shield_", etc.)
    const getBaseName = (id, prefix) => {
      if (id && id.startsWith(prefix + '_')) {
        return id.substring(prefix.length + 1);
      }
      return id;
    };

    // Determine weapon hand position (to know where shield should go)
    // Weapons are saved WITHOUT hand suffix - hand is determined by x position
    // Right hand ≈ x:60 (viewer's left), Left hand ≈ x:90 (viewer's right)
    const getWeaponHand = () => {
      const weaponData = visualEquipment.mainHand;
      if (!weaponData || !weaponData.item) return 'right'; // Default

      const weaponId = weaponData.item.id;
      // Extract base name to match saved position keys
      const baseName = getBaseName(weaponId, 'weapon');

      // Weapons are saved without hand suffix (e.g., "weapons/sword_iron")
      const savedPos = savedPositions[`weapons/${baseName}`];
      if (savedPos) {
        // x < 75 = right hand (viewer's left), x >= 75 = left hand (viewer's right)
        return savedPos.x < 75 ? 'right' : 'left';
      }

      return 'right'; // Default to right hand
    };

    const weaponHand = getWeaponHand();
    const shieldHand = weaponHand === 'right' ? 'left' : 'right';

    // Build list of equipment to render with their sprite paths
    // Use the same path construction as EquipmentTest: /assets/equipment/${folder}/${baseName}.png
    const equipmentToRender = [];
    layerOrder.forEach(layerName => {
      const slot = layerToSlot[layerName];
      if (!slot) return;

      const equipmentData = visualEquipment[slot];
      if (!equipmentData || !equipmentData.item) return;

      const item = equipmentData.item;

      // Determine folder, baseName, and spritePath
      // Use sprite.path from database when available (it's the actual correct file path)
      // Extract the filename from sprite.path for position lookup (matches EquipmentTest keys)
      let folder;
      let baseName;
      let positionKey;
      let spritePath;

      // Helper to extract filename without extension from a path
      const extractFilename = (path) => {
        const parts = path.split('/');
        const filename = parts[parts.length - 1];
        return filename.replace('.png', '');
      };

      if (slot === 'mainHand') {
        folder = 'weapons';
        if (item.sprite?.path) {
          spritePath = item.sprite.path;
          baseName = extractFilename(spritePath);
        } else {
          baseName = getBaseName(item.id, 'weapon');
          spritePath = `/assets/equipment/${folder}/${baseName}.png`;
        }
        positionKey = `weapons/${baseName}`;
      } else if (slot === 'offHand') {
        folder = 'shields';
        if (item.sprite?.path) {
          spritePath = item.sprite.path;
          baseName = extractFilename(spritePath);
        } else {
          baseName = getBaseName(item.id, 'shield');
          spritePath = `/assets/equipment/${folder}/${baseName}.png`;
        }
        positionKey = `shields/${baseName}_${shieldHand}`;
      } else if (slot === 'helmet') {
        folder = 'helmets';
        if (item.sprite?.path) {
          spritePath = item.sprite.path;
          baseName = extractFilename(spritePath);
        } else {
          baseName = getBaseName(item.id, 'helmet');
          spritePath = `/assets/equipment/${folder}/${baseName}.png`;
        }
        positionKey = `helmets/${baseName}`;
      } else if (slot === 'chest') {
        folder = 'chests';
        if (item.sprite?.path) {
          spritePath = item.sprite.path;
          baseName = extractFilename(spritePath);
        } else {
          baseName = getBaseName(item.id, 'chest');
          spritePath = `/assets/equipment/${folder}/${baseName}.png`;
        }
        positionKey = `chests/${baseName}`;
      } else if (slot === 'legs') {
        folder = 'legs';
        if (item.sprite?.path) {
          spritePath = item.sprite.path;
          baseName = extractFilename(spritePath);
        } else {
          baseName = getBaseName(item.id, 'legs');
          spritePath = `/assets/equipment/${folder}/${baseName}.png`;
        }
        positionKey = `legs/${baseName}`;
      } else if (slot === 'cape') {
        folder = 'capes';
        if (item.sprite?.path) {
          spritePath = item.sprite.path;
          baseName = extractFilename(spritePath);
        } else {
          baseName = getBaseName(item.id, 'cape');
          spritePath = `/assets/equipment/${folder}/${baseName}.png`;
        }
        positionKey = `capes/${baseName}`;
      } else {
        folder = slot;
        baseName = item.id;
        positionKey = `${slot}/${item.id}`;
        spritePath = `/assets/equipment/${folder}/${baseName}.png`;
      }
      // Get saved position or default
      const savedPos = savedPositions[positionKey];
      const defaultKey = slot === 'offHand'
        ? `shields_${shieldHand}`
        : slot === 'mainHand'
          ? `weapons_${weaponHand}`
          : folder;
      const defaultPos = DEFAULT_POSITIONS[defaultKey] || { x: 0, y: 0, scale: 1 };

      let position;

      // For shields, prefer saved position with hand suffix, but don't force x if saved position exists
      if (slot === 'offHand') {
        if (savedPos) {
          // Use saved position entirely - it was positioned correctly in EquipmentTest
          position = savedPos;
        } else {
          // Use default with forced x for correct hand
          const forcedX = shieldHand === 'left' ? 90 : 60;
          position = { ...defaultPos, x: forcedX };
        }
      } else {
        position = savedPos || defaultPos;
      }

      equipmentToRender.push({
        layerName,
        slot,
        item,
        spritePath,
        dyeColor: equipmentData.dye,
        position,
        shieldHand: slot === 'offHand' ? shieldHand : null,
      });
    });

    // Load base sprite and all equipment sprites in parallel
    let isCancelled = false;
    const loadAllImages = async () => {
      try {
        // Check if cancelled before starting
        if (isCancelled) return;
        // Always use stage 10 swordsman as base avatar
        const baseSpriteUrl = BASE_AVATAR_PATH;

        // Load all images in parallel
        const loadPromises = [
          loadImage(baseSpriteUrl),
          ...equipmentToRender.map(eq => loadImage(eq.spritePath).catch(err => {
            console.warn(`[AvatarRenderer] Failed to load equipment sprite: ${eq.spritePath}`, err);
            return null;
          }))
        ];

        const [baseImg, ...equipmentImages] = await Promise.all(loadPromises);

        // Check if cancelled after loading (component might have unmounted)
        if (isCancelled) return;

        // Now render everything synchronously
        ctx.clearRect(0, 0, size, size);

        const timestamp = Date.now();
        const baseRenderSize = 256; // Base canvas size for position calculations
        const scaleFactor = availableSize / baseRenderSize;

        // Helper function to render equipment
        const renderEquipment = (eq, index) => {
          const equipSprite = equipmentImages[index];
          if (!equipSprite) return; // Skip failed loads

          const effects = getRarityEffects(eq.item.rarity);

          // Get position from saved data
          const pos = eq.position || { x: 0, y: 0, scale: 1 };

          // Calculate actual render position (scale from 256 base to actual size)
          const renderX = padding + (pos.x * scaleFactor);
          const renderY = padding + breathingOffset + (pos.y * scaleFactor);
          const renderWidth = equipSprite.width * pos.scale * scaleFactor;
          const renderHeight = equipSprite.height * pos.scale * scaleFactor;

          // Aura rendering disabled for performance
          // Equipment auras are shown on inventory icons instead

          // Render equipment layer with position
          ctx.save();
          ctx.drawImage(equipSprite, renderX, renderY, renderWidth, renderHeight);
          ctx.restore();

          // Render particles (if epic/legendary and effects enabled)
          if (effects.hasParticles && showParticleEffects) {
            renderEquipmentParticles(
              ctx,
              renderX + renderWidth / 2,
              renderY + renderHeight / 2,
              {
                color: effects.glowColor || eq.item.effects?.[0]?.color || '#ffaa00',
                count: effects.particleCount || 3,
                spread: 20,
                hasParticles: true,
              },
              timestamp
            );
          }
        };

        // Split equipment into back layers (render before character) and front layers (render after)
        // Cape should always render BEHIND the character
        const backLayers = ['cape', 'cape_back'];
        const backEquipment = equipmentToRender.filter(eq => backLayers.includes(eq.layerName) || eq.slot === 'cape');
        const frontEquipment = equipmentToRender.filter(eq => !backLayers.includes(eq.layerName) && eq.slot !== 'cape');

        // 1. Draw back equipment (cape) FIRST - behind character
        backEquipment.forEach((eq) => {
          const index = equipmentToRender.indexOf(eq);
          renderEquipment(eq, index);
        });

        // 2. Draw base character
        ctx.save();
        ctx.drawImage(baseImg, offsetX, offsetY, availableSize, availableSize);
        ctx.restore();

        // 3. Draw front equipment layers (everything except cape)
        frontEquipment.forEach((eq) => {
          const index = equipmentToRender.indexOf(eq);
          renderEquipment(eq, index);
        });
      } catch (err) {
        console.error('Error rendering avatar:', err);
      }
    };

    loadAllImages();

    // Cleanup function to cancel async operations on unmount/re-render
    return () => {
      isCancelled = true;
    };
  }, [currentFrame, level, prestige, equippedItems, visualEquipment, size, animate, showAvatarEffects, showParticleEffects, globalPositions]);

  return (
    <div className={`avatar-renderer ${className}`}>
      <div className="avatar-canvas-container">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="avatar-canvas"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {/* Stats display (optional) */}
      {showStats && (
        <div className="avatar-stats">
          <div className="stat-item">
            <span className="stat-icon">🛡️</span>
            <span className="stat-value">{stats.defense}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💪</span>
            <span className="stat-value">{stats.strength}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{stats.vitality}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🧠</span>
            <span className="stat-value">{stats.intelligence}</span>
          </div>
          {stats.wisdom > 0 && (
            <div className="stat-item">
              <span className="stat-icon">✨</span>
              <span className="stat-value">{stats.wisdom}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
