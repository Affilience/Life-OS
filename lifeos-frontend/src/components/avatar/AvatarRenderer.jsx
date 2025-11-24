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
import './AvatarRenderer.css';

export default function AvatarRenderer({
  size = 128,
  animate = true,
  showStats = false,
  className = '',
}) {
  const canvasRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(0);

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

  // Animation loop - just use breathing effect, not walking frames
  useEffect(() => {
    if (!animate) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 2); // 2 frames for breathing only
    }, 500); // Slower breathing effect

    return () => clearInterval(interval);
  }, [animate]);

  // Render sprite
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Calculate scale and centering with padding
    const baseSize = 256; // Increased base sprite size for quality
    const padding = size * 0.05; // Reduced to 5% padding so avatar fills more space
    const availableSize = size - (padding * 2);

    // Center the sprite in the canvas with padding
    const offsetX = padding;
    // Subtle breathing animation - just moves up and down slightly
    const breathingOffset = animate ? (currentFrame === 0 ? 0 : -5) : 0;
    const offsetY = padding + breathingOffset;

    // Draw base character centered and scaled (now async)
    // Use level-based evolution stages!
    generateSpriteByLevel(level, prestige || 0).then(spriteDataUrl => {
      const baseImg = new Image();
      baseImg.src = spriteDataUrl;
      baseImg.onload = () => {
        ctx.save();
        // Draw scaled with padding
        ctx.drawImage(baseImg, 0, 0, baseSize, baseSize, offsetX, offsetY, availableSize, availableSize);
        ctx.restore();

        // Render equipment layers with proper z-ordering
        renderEquipmentLayers(ctx, offsetX, offsetY, availableSize);
      };
    }).catch(err => {
      console.error('Error generating sprite:', err);
    });
  }, [currentFrame, level, prestige, equippedItems, visualEquipment, size, animate]);

  // Helper function to render equipment layers
  const renderEquipmentLayers = (ctx, x, y, renderSize) => {
    const timestamp = Date.now();
    const facing = 'down'; // Default facing direction for now

    // Get proper layer order based on facing direction
    const layerOrder = getEquipmentLayerOrder(facing);

    // Map layer names to equipment slots
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

    // Render each layer in order
    layerOrder.forEach(layerName => {
      const slot = layerToSlot[layerName];
      if (!slot) return;

      const equipmentData = visualEquipment[slot];
      if (!equipmentData || !equipmentData.item) return;

      const item = equipmentData.item;
      const dyeColor = equipmentData.dye;

      // Get rarity effects
      const effects = getRarityEffects(item.rarity);

      // Load and render equipment sprite
      const equipSprite = new Image();
      equipSprite.src = item.sprite?.path || '/assets/equipment/placeholder.png';

      equipSprite.onload = () => {
        // Render aura first (if legendary)
        if (effects.hasAura) {
          renderEquipmentAura(
            ctx,
            x + renderSize / 2,
            y + renderSize / 2,
            effects.auraRadius || 30,
            effects.glowColor || item.effects?.[0]?.color || '#ff8000',
            timestamp
          );
        }

        // Render equipment layer
        renderEquipmentLayer(
          ctx,
          equipSprite,
          x,
          y,
          renderSize,
          effects,
          dyeColor
        );

        // Render particles (if epic/legendary)
        if (effects.hasParticles) {
          renderEquipmentParticles(
            ctx,
            x + renderSize / 2,
            y + renderSize / 2,
            {
              color: effects.glowColor || item.effects?.[0]?.color || '#ffaa00',
              count: effects.particleCount || 3,
              spread: 20,
              hasParticles: true,
            },
            timestamp
          );
        }
      };

      equipSprite.onerror = () => {
        console.warn(`Failed to load equipment sprite: ${item.sprite?.path}`);
      };
    });
  };

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
