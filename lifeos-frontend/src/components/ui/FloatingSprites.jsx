/**
 * Floating Sprites Component
 * Subtle floating pixel art decorations using PixelLab-generated equipment sprites
 * Adds ambient visual interest without distracting from content
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const SPRITE_ASSETS = [
  '/assets/equipment/weapons/sword_crystal.png',
  '/assets/equipment/weapons/sword_celestial.png',
  '/assets/equipment/helmets/celestial_circlet.png',
  '/assets/equipment/shields/phoenix_wing_shield.png',
  '/assets/equipment/capes/cloak_shadows.png',
  '/assets/equipment/rings/ring_focus.png',
  '/assets/equipment/amulets/amulet_vitality.png',
  '/assets/pets/pet_phoenix.png',
  '/assets/pets/pet_dragon.png',
];

export default function FloatingSprites({ count = 6, opacity = 0.08, className = '' }) {
  const sprites = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const sprite = SPRITE_ASSETS[i % SPRITE_ASSETS.length];
      return {
        id: i,
        src: sprite,
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // percentage
        size: Math.random() * 60 + 40, // 40-100px
        duration: Math.random() * 30 + 40, // 40-70 seconds
        delay: Math.random() * -20, // stagger start times
        rotation: Math.random() * 360,
      };
    });
  }, [count]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 ${className}`}>
      {sprites.map((sprite) => (
        <motion.div
          key={sprite.id}
          className="absolute"
          style={{
            left: `${sprite.x}%`,
            top: `${sprite.y}%`,
            width: `${sprite.size}px`,
            height: `${sprite.size}px`,
            opacity,
          }}
          initial={{
            rotate: sprite.rotation,
            scale: 0.8,
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 20, -10, 20, 0],
            rotate: [sprite.rotation, sprite.rotation + 15, sprite.rotation - 10, sprite.rotation + 15, sprite.rotation],
            scale: [0.8, 1, 0.9, 1, 0.8],
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
            className="w-full h-full object-contain filter blur-[1px]"
            style={{
              imageRendering: 'pixelated',
              filter: 'blur(1px) brightness(0.6)',
            }}
            loading="lazy"
          />
        </motion.div>
      ))}
    </div>
  );
}
