'use client';

/**
 * Gamification Sprites Component
 * Floating pixel art sprites specifically for the Gamification section
 * Creates a Habitica-style immersive atmosphere with depth layers
 */

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Seeded random number generator for consistent server/client rendering
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// Equipment sprites from the website's public assets
const EQUIPMENT_SPRITES = [
  '/assets/sprites/equipment/sword_celestial.png',
  '/assets/sprites/equipment/sword_void.png',
  '/assets/sprites/equipment/phoenix_wing_shield.png',
  '/assets/sprites/equipment/dragon_shield.png',
  '/assets/sprites/equipment/armor_cosmic.png',
  '/assets/sprites/equipment/dragon_scale_chestplate.png',
  '/assets/sprites/equipment/aegis_of_mastery.png',
  '/assets/sprites/equipment/guardian_bulwark.png',
];

// Pet sprites for background layer
const PET_SPRITES = [
  '/assets/sprites/pets/pet_phoenix.png',
  '/assets/sprites/pets/pet_azure_dragon.png',
  '/assets/sprites/pets/pet_griffin_chick.png',
  '/assets/sprites/pets/pet_kitsune_pup.png',
  '/assets/sprites/pets/pet_pegasus.png',
  '/assets/sprites/pets/pet_leviathan.png',
];

interface SpriteConfig {
  id: number;
  src: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  layer: 'background' | 'mid' | 'foreground';
  blur: number;
  opacity: number;
}

interface GamificationSpritesProps {
  /** Number of sprites to render */
  count?: number;
  /** Base opacity for sprites */
  baseOpacity?: number;
  /** Optional className for container */
  className?: string;
}

export default function GamificationSprites({
  count = 12,
  baseOpacity = 0.1,
  className = '',
}: GamificationSpritesProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sprites = useMemo(() => {
    const allSprites = [...EQUIPMENT_SPRITES, ...PET_SPRITES];

    return Array.from({ length: count }, (_, i): SpriteConfig => {
      const sprite = allSprites[i % allSprites.length];
      const isPet = PET_SPRITES.includes(sprite);

      // Assign to depth layers
      let layer: 'background' | 'mid' | 'foreground';
      let blur: number;
      let opacity: number;
      let sizeRange: [number, number];

      if (i < count * 0.33) {
        // Background layer - pets and small items
        layer = 'background';
        blur = 2;
        opacity = baseOpacity * 0.6;
        sizeRange = [30, 50];
      } else if (i < count * 0.66) {
        // Mid layer - equipment
        layer = 'mid';
        blur = 1;
        opacity = baseOpacity * 0.8;
        sizeRange = [40, 70];
      } else {
        // Foreground layer - larger items
        layer = 'foreground';
        blur = 0;
        opacity = baseOpacity * 1.2;
        sizeRange = [50, 90];
      }

      // Use seeded random for consistent server/client values
      // Round to 2 decimal places to avoid floating point precision issues
      const seed = i * 1000;
      const round = (n: number) => Math.round(n * 100) / 100;
      return {
        id: i,
        src: sprite,
        x: round(seededRandom(seed + 1) * 100),
        y: round(seededRandom(seed + 2) * 100),
        size: round(seededRandom(seed + 3) * (sizeRange[1] - sizeRange[0]) + sizeRange[0]),
        duration: round(seededRandom(seed + 4) * 30 + 40), // 40-70 seconds
        delay: round(seededRandom(seed + 5) * -20), // stagger start times
        rotation: round(seededRandom(seed + 6) * 360),
        layer,
        blur,
        opacity: round(opacity),
      };
    });
  }, [count, baseOpacity]);

  // Group sprites by layer for proper z-indexing
  const backgroundSprites = sprites.filter((s) => s.layer === 'background');
  const midSprites = sprites.filter((s) => s.layer === 'mid');
  const foregroundSprites = sprites.filter((s) => s.layer === 'foreground');

  const renderSprite = (sprite: SpriteConfig) => (
    <motion.div
      key={sprite.id}
      className="absolute pointer-events-none"
      style={{
        left: `${sprite.x}%`,
        top: `${sprite.y}%`,
        width: `${sprite.size}px`,
        height: `${sprite.size}px`,
        opacity: sprite.opacity,
      }}
      initial={{
        rotate: sprite.rotation,
        scale: 0.8,
      }}
      animate={{
        y: [0, -30, 0, 30, 0],
        x: [0, 15, -15, 15, 0],
        rotate: [
          sprite.rotation,
          sprite.rotation + 5,
          sprite.rotation - 5,
          sprite.rotation + 5,
          sprite.rotation,
        ],
        scale: [0.95, 1.05, 0.95, 1.05, 0.95],
      }}
      transition={{
        duration: sprite.duration,
        delay: sprite.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <img
        src={sprite.src}
        alt=""
        className="w-full h-full object-contain"
        style={{
          imageRendering: 'pixelated',
          filter: sprite.blur > 0
            ? `blur(${sprite.blur}px) brightness(0.7)`
            : 'brightness(0.8)',
        }}
        loading="lazy"
        draggable={false}
      />
    </motion.div>
  );

  // Only render on client to avoid hydration mismatch
  if (!mounted) {
    return <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} />;
  }

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* Background layer - z-index -30 */}
      <div className="absolute inset-0 -z-30">
        {backgroundSprites.map(renderSprite)}
      </div>

      {/* Mid layer - z-index -20 */}
      <div className="absolute inset-0 -z-20">
        {midSprites.map(renderSprite)}
      </div>

      {/* Foreground layer - z-index -10 */}
      <div className="absolute inset-0 -z-10">
        {foregroundSprites.map(renderSprite)}
      </div>
    </div>
  );
}
