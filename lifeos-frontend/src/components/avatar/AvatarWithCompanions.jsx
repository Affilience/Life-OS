import React from 'react';
import { motion } from 'framer-motion';
import { PET_DATABASE, TIER_INFO } from '../../stores/petStore';

/**
 * AvatarWithCompanions - Natural companion display around the avatar
 * Pets are positioned organically with subtle animations
 */
export function AvatarWithCompanions({
  avatarSrc,
  avatarAlt = 'Avatar',
  activePets = [],
  avatarSize = 224, // 56 * 4 = 224px (w-56)
  className = ''
}) {
  // Get pet data for active pets
  const pets = activePets
    .map(petId => PET_DATABASE[petId])
    .filter(Boolean);

  // Define natural positions for up to 6 pets
  // Positions are relative to avatar center, with variety
  const petPositions = [
    // Ground level - loyal companion at feet
    { x: -100, y: 60, scale: 1.0, zIndex: 5, animation: 'ground-left' },
    { x: 95, y: 65, scale: 0.95, zIndex: 5, animation: 'ground-right' },
    // Shoulder height - floating familiars
    { x: -130, y: -10, scale: 0.8, zIndex: 15, animation: 'float-left' },
    { x: 125, y: -15, scale: 0.75, zIndex: 15, animation: 'float-right' },
    // Above head - mystical orbiters
    { x: -60, y: -100, scale: 0.65, zIndex: 20, animation: 'orbit-top' },
    { x: 65, y: -95, scale: 0.6, zIndex: 20, animation: 'orbit-top-right' },
  ];

  // Animation variants for different pet positions
  const animationVariants = {
    'ground-left': {
      y: [0, -4, 0],
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
    },
    'ground-right': {
      y: [0, -5, 0],
      transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }
    },
    'float-left': {
      y: [0, -8, 0],
      x: [0, 3, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
    },
    'float-right': {
      y: [0, -10, 0],
      x: [0, -4, 0],
      transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }
    },
    'orbit-top': {
      y: [0, -6, 0],
      rotate: [0, 5, 0, -5, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
    },
    'orbit-top-right': {
      y: [0, -8, 0],
      rotate: [0, -5, 0, 5, 0],
      transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: avatarSize + 220,
        height: avatarSize + 100,
      }}
    >
      {/* Ambient glow behind avatar */}
      <div
        className="absolute rounded-full blur-3xl opacity-30"
        style={{
          width: avatarSize * 1.5,
          height: avatarSize * 1.5,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 70%)',
        }}
      />

      {/* Pets rendered at their positions */}
      {pets.map((pet, index) => {
        if (index >= petPositions.length) return null;

        const pos = petPositions[index];
        const tierColor = TIER_INFO[pet.tier]?.color || '#8b5cf6';
        const petSize = 80 * pos.scale;

        return (
          <motion.div
            key={pet.id}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: pos.x - petSize / 2,
              marginTop: pos.y - petSize / 2,
              zIndex: pos.zIndex,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              ...animationVariants[pos.animation]
            }}
            transition={{
              opacity: { duration: 0.5, delay: index * 0.1 },
              scale: { duration: 0.5, delay: index * 0.1, type: 'spring' }
            }}
          >
            {/* Pet glow effect based on tier */}
            <div
              className="absolute inset-0 rounded-full blur-md opacity-50"
              style={{
                background: `radial-gradient(circle, ${tierColor}40 0%, transparent 70%)`,
                transform: 'scale(1.5)',
              }}
            />

            {/* Pet sprite */}
            <img
              src={pet.sprite}
              alt={pet.name}
              className="relative pixelated drop-shadow-lg"
              style={{
                width: petSize,
                height: petSize,
                imageRendering: 'pixelated',
                filter: `drop-shadow(0 0 8px ${tierColor}50)`,
              }}
              title={`${pet.name} - ${pet.bonusDescription}`}
            />
          </motion.div>
        );
      })}

      {/* Main Avatar */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={avatarSrc}
          alt={avatarAlt}
          className="pixelated"
          style={{
            width: avatarSize,
            height: avatarSize,
            imageRendering: 'pixelated',
          }}
        />
      </motion.div>

      {/* Ground shadow */}
      <div
        className="absolute bottom-0 rounded-full opacity-20"
        style={{
          width: avatarSize * 0.8,
          height: 20,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.8) 0%, transparent 70%)',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
}

/**
 * CompactAvatarWithPets - Smaller version for headers/cards
 */
export function CompactAvatarWithPets({
  avatarSrc,
  avatarAlt = 'Avatar',
  activePets = [],
  size = 64,
  className = ''
}) {
  const pets = activePets
    .map(petId => PET_DATABASE[petId])
    .filter(Boolean)
    .slice(0, 2); // Max 2 pets in compact view

  return (
    <div className={`relative ${className}`} style={{ width: size + 40, height: size + 20 }}>
      {/* Main Avatar */}
      <img
        src={avatarSrc}
        alt={avatarAlt}
        className="pixelated relative z-10"
        style={{
          width: size,
          height: size,
          imageRendering: 'pixelated',
          marginLeft: 20,
        }}
      />

      {/* Pets */}
      {pets.map((pet, index) => {
        const petSize = size * 0.4;
        const xPos = index === 0 ? -5 : size + 25;
        const yPos = size - petSize + 5;

        return (
          <motion.img
            key={pet.id}
            src={pet.sprite}
            alt={pet.name}
            className="absolute pixelated"
            style={{
              width: petSize,
              height: petSize,
              imageRendering: 'pixelated',
              left: xPos,
              top: yPos,
              zIndex: 5,
            }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          />
        );
      })}
    </div>
  );
}

export default AvatarWithCompanions;
