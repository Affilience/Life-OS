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

// LocalStorage key for positions cache (instant load on mobile)
const POSITIONS_CACHE_KEY = 'lifeos-equipment-positions-cache';

// Get cached positions from localStorage (synchronous - for instant load)
function getCachedPositions() {
  try {
    const cached = localStorage.getItem(POSITIONS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is less than 24 hours old
      if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.positions || {};
      }
    }
  } catch (err) {
    console.warn('[AvatarRenderer] Failed to load cached positions:', err);
  }
  return null;
}

// Save positions to localStorage cache
function setCachedPositions(positions) {
  try {
    localStorage.setItem(POSITIONS_CACHE_KEY, JSON.stringify({
      positions,
      timestamp: Date.now()
    }));
  } catch (err) {
    console.warn('[AvatarRenderer] Failed to cache positions:', err);
  }
}

// Load global positions from Supabase - fetch ALL with pagination
async function loadGlobalPositions() {
  // Return memory cache if available
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
    // Fetch ALL positions using pagination (Supabase limits to 1000 per request)
    const allPositions = {};
    let offset = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('equipment_default_positions')
        .select('position_key, x, y, scale')
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('[AvatarRenderer] Failed to load positions:', error);
        break;
      }

      if (data && data.length > 0) {
        data.forEach(row => {
          allPositions[row.position_key] = {
            x: parseFloat(row.x),
            y: parseFloat(row.y),
            scale: parseFloat(row.scale)
          };
        });
        offset += data.length;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    globalPositionsCache = allPositions;
    console.log(`[AvatarRenderer] Loaded ${Object.keys(allPositions).length} positions`);
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

// Get the correct base avatar path based on gender and skin tone
function getBaseAvatarPath(gender, skinTone) {
  const prefix = gender === 'female' ? 'heroine' : 'hero';

  // For white/default skin tone, use the base-evolution sprites (original high-quality sprites)
  if (skinTone === 'white' || skinTone === 'default' || !skinTone) {
    return `/assets/avatar/base-evolution/${prefix}_base_stage_10_swordsman.png`;
  }

  // For brown/black skin tones, use the diverse avatar sprites
  return `/assets/avatar/diverse/${prefix}_stage_10_${skinTone}.png`;
}

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
  // External data props for rendering other players (e.g., PvP opponents)
  externalEquipped = null,
  externalCharacterGender = null,
  externalLevel = null,
  externalPrestige = null,
  externalTier = null,
  externalDyeColors = null,
  externalSkinTone = null,
}) {
  const canvasRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  // Initialize with cached positions for instant mobile render
  const [globalPositions, setGlobalPositions] = useState(() => {
    return getCachedPositions() || {};
  });

  // Load global positions from Supabase on mount (updates cache)
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
    level: storeLevel,
    prestige: storePrestige,
    currentTier: storeTier,
    equipped: storeEquipped,
    stats,
    characterGender: storeCharacterGender,
    dyeColors: storeDyeColors,
    skinTone: storeSkinTone,
    getCurrentTierData,
    getEquippedItems,
    getVisualEquipment,
  } = useAvatarStore();

  // Use external data if provided, otherwise fall back to store
  const isExternalAvatar = externalEquipped !== null;
  const level = externalLevel ?? storeLevel;
  const prestige = externalPrestige ?? storePrestige;
  const currentTier = externalTier ?? storeTier;
  const equipped = externalEquipped ?? storeEquipped;
  const characterGender = externalCharacterGender ?? storeCharacterGender;
  const dyeColors = externalDyeColors ?? storeDyeColors;
  const skinTone = externalSkinTone ?? storeSkinTone;

  const tierData = getCurrentTierData();
  // For external avatars, compute equipped items directly from the equipped object
  const equippedItems = isExternalAvatar
    ? Object.entries(equipped || {}).reduce((acc, [slot, itemId]) => {
        if (itemId && EQUIPMENT_DATABASE[itemId]) {
          acc[slot] = EQUIPMENT_DATABASE[itemId];
        }
        return acc;
      }, {})
    : getEquippedItems();
  // For external avatars, create visualEquipment in the expected format: { slot: { item, dye } }
  const visualEquipment = isExternalAvatar
    ? Object.entries(equipped || {}).reduce((acc, [slot, itemId]) => {
        if (itemId && EQUIPMENT_DATABASE[itemId]) {
          acc[slot] = { item: EQUIPMENT_DATABASE[itemId], dye: (externalDyeColors || {})[slot] || null };
        }
        return acc;
      }, {})
    : getVisualEquipment();

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
    // Positions are stored with gender_skinTone_ prefix (e.g., "male_white_legs/iron_legguards")
    const localPositions = getLocalPositions();
    const savedPositions = { ...localPositions, ...globalPositions };
    const savedKeys = Object.keys(savedPositions);

    // Helper to get position key with gender/skin tone prefix
    const genderKey = characterGender === 'female' ? 'female' : 'male';
    const skinToneKey = skinTone || 'white';
    const getPositionKey = (baseKey) => `${genderKey}_${skinToneKey}_${baseKey}`;

    // Also try white positions as fallback if no position exists for current skin tone
    const getPositionWithFallback = (baseKey) => {
      const primaryKey = getPositionKey(baseKey);
      if (savedPositions[primaryKey]) {
        return savedPositions[primaryKey];
      }
      // Fallback to white skin tone positions
      const fallbackKey = `${genderKey}_white_${baseKey}`;
      return savedPositions[fallbackKey] || null;
    };

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

      // Weapons are saved with gender/skin tone prefix (e.g., "male_white_weapons/sword_iron")
      const savedPos = getPositionWithFallback(`weapons/${baseName}`);
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
        // Use female legs folder for female characters (narrower stance)
        folder = characterGender === 'female' ? 'legs_female' : 'legs';
        if (item.sprite?.path) {
          // Override sprite path for female characters
          if (characterGender === 'female') {
            baseName = extractFilename(item.sprite.path);
            spritePath = `/assets/equipment/legs_female/${baseName}.png`;
          } else {
            spritePath = item.sprite.path;
            baseName = extractFilename(spritePath);
          }
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
      // Get saved position with gender/skin tone prefix or default
      const savedPos = getPositionWithFallback(positionKey);

      const defaultKey = slot === 'offHand'
        ? `shields_${shieldHand}`
        : slot === 'mainHand'
          ? `weapons_${weaponHand}`
          : folder;
      const defaultPos = DEFAULT_POSITIONS[defaultKey] || { x: 0, y: 0, scale: 1 };

      const position = savedPos || defaultPos;

      // Debug: log position lookup for all equipment (once per session)
      if (!window._equipDebugDone) {
        if (!window._equipDebugData) window._equipDebugData = [];
        window._equipDebugData.push({
          slot,
          positionKey,
          fullKey: `${genderKey}_${skinToneKey}_${positionKey}`,
          hasSavedPos: !!savedPos,
          position
        });
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

    // Output debug data once
    if (!window._equipDebugDone && window._equipDebugData?.length > 0) {
      window._equipDebugDone = true;
      console.log('[AvatarRenderer] Equipment position lookups:', window._equipDebugData);
      console.log('[AvatarRenderer] Total positions loaded:', Object.keys(globalPositions).length);
    }

    // Load base sprite and all equipment sprites in parallel
    let isCancelled = false;
    const loadAllImages = async () => {
      try {
        // Check if cancelled before starting
        if (isCancelled) return;
        // Use the correct base avatar based on gender and skin tone
        const baseSpriteUrl = getBaseAvatarPath(characterGender, skinTone);

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
  }, [currentFrame, level, prestige, equippedItems, visualEquipment, size, animate, showAvatarEffects, showParticleEffects, globalPositions, characterGender, skinTone]);

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
