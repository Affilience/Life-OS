import React from 'react';
import { motion } from 'framer-motion';
import { PET_DATABASE, TIER_INFO } from '../../stores/petStore';
import { useGamificationModeStore } from '../../stores/gamificationModeStore';
import AvatarRenderer from './AvatarRenderer';

/**
 * AvatarWithCompanions - Natural companion display around the avatar
 * Pets are positioned organically with subtle animations
 *
 * Mode-aware:
 * - COSMIC: Full pet sprites with animations and glow effects
 * - PROFESSIONAL: Pets hidden (bonuses still apply)
 * - MINIMAL: Avatar and pets hidden completely
 */
export function AvatarWithCompanions({
  avatarSrc,
  avatarAlt = 'Avatar',
  activePets = [],
  avatarSize = 224, // 56 * 4 = 224px (w-56)
  className = '',
  useEquipment = true, // Use AvatarRenderer by default
}) {
  const { isVisible, mode } = useGamificationModeStore();

  const showAvatar = isVisible('showAvatar');
  const showPets = isVisible('showPets');
  const showPetSprites = isVisible('showPetSprites');
  const showAvatarEffects = isVisible('showAvatarEffects');

  // In MINIMAL mode, don't render anything
  if (!showAvatar) {
    return null;
  }
  // Get pet data for active pets
  const pets = activePets
    .map(petId => PET_DATABASE[petId])
    .filter(Boolean);

  // Define natural positions for up to 6 pets
  // Positions are relative to avatar center, with more padding
  // All pets stay large and visible (minimum 0.9 scale)
  // Order matches dashboard widget: first pet on right, second on left, etc.
  const petPositions = [
    // Ground level - loyal companion at feet (more spread out)
    { x: 155, y: 95, scale: 1.0, zIndex: 5, animation: 'ground-right' },   // 1st pet - right
    { x: -160, y: 90, scale: 1.0, zIndex: 5, animation: 'ground-left' },   // 2nd pet - left
    // Shoulder height - floating familiars (more padding)
    { x: 175, y: -25, scale: 0.95, zIndex: 15, animation: 'float-right' },
    { x: -180, y: -20, scale: 0.95, zIndex: 15, animation: 'float-left' },
    // Above head - mystical orbiters (more space)
    { x: 105, y: -135, scale: 0.9, zIndex: 20, animation: 'orbit-top-right' },
    { x: -100, y: -140, scale: 0.9, zIndex: 20, animation: 'orbit-top' },
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
        width: avatarSize + 360,
        height: avatarSize + 220,
      }}
    >
      {/* Ambient glow behind avatar - only in cosmic mode */}
      {showAvatarEffects && (
        <div
          className="absolute rounded-full blur-3xl opacity-30"
          style={{
            width: avatarSize * 1.5,
            height: avatarSize * 1.5,
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 70%)',
          }}
        />
      )}

      {/* Pets rendered at their positions - only if pets and sprites are visible */}
      {showPets && showPetSprites && pets.map((pet, index) => {
        if (index >= petPositions.length) return null;

        const pos = petPositions[index];
        const tierColor = TIER_INFO[pet.tier]?.color || '#8b5cf6';
        const petSize = 96 * pos.scale; // Larger base size for better visibility

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
            animate={showAvatarEffects ? animationVariants[pos.animation] : undefined}
          >
            {/* Pet sprite */}
            <img
              src={pet.sprite}
              alt={pet.name}
              className="pixelated"
              style={{
                width: petSize,
                height: petSize,
                imageRendering: 'pixelated',
              }}
              title={`${pet.name} - ${pet.bonusDescription}`}
            />
          </motion.div>
        );
      })}

      {/* Main Avatar - use AvatarRenderer with equipment or fallback to img */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {useEquipment ? (
          <AvatarRenderer size={avatarSize} animate={true} showStats={false} />
        ) : (
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
        )}
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
 * Mode-aware: respects gamification mode visibility settings
 */
export function CompactAvatarWithPets({
  avatarSrc,
  avatarAlt = 'Avatar',
  activePets = [],
  size = 64,
  className = ''
}) {
  const { isVisible } = useGamificationModeStore();

  const showAvatar = isVisible('showAvatar');
  const showPets = isVisible('showPets');
  const showPetSprites = isVisible('showPetSprites');
  const showAvatarEffects = isVisible('showAvatarEffects');

  // In MINIMAL mode, don't render anything
  if (!showAvatar) {
    return null;
  }

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

      {/* Pets - only if pets and sprites are visible */}
      {/* First pet on right, second on left - matches dashboard widget */}
      {showPets && showPetSprites && pets.map((pet, index) => {
        const petSize = size * 0.5; // Larger pets in compact view
        const xPos = index === 0 ? size + 28 : -8; // First pet on right
        const yPos = size - petSize + 8;

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
            animate={showAvatarEffects ? { y: [0, -3, 0] } : undefined}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          />
        );
      })}
    </div>
  );
}

/**
 * MediumAvatarWithPets - Medium version for character page
 * Supports up to 6 pets arranged around the avatar
 * Responsive: shrinks on mobile to fit screen width
 *
 * @param useEquipment - If true, uses AvatarRenderer to show equipped items (default: true)
 * @param avatarSrc - Fallback sprite src if useEquipment is false
 */
export function MediumAvatarWithPets({
  avatarSrc,
  avatarAlt = 'Avatar',
  activePets = [],
  size = 240,
  className = '',
  useEquipment = true, // New prop - use AvatarRenderer by default
}) {
  const { isVisible } = useGamificationModeStore();

  const showAvatar = isVisible('showAvatar');
  const showPets = isVisible('showPets');
  const showPetSprites = isVisible('showPetSprites');
  const showAvatarEffects = isVisible('showAvatarEffects');

  if (!showAvatar) {
    return null;
  }

  const pets = activePets
    .map(petId => PET_DATABASE[petId])
    .filter(Boolean)
    .slice(0, 6); // Max 6 pets

  // Scale factor for pet positions based on avatar size
  const scaleFactor = size / 240;

  // Pet positions relative to center - arranged around avatar (scaled based on avatar size)
  // Spread out more to accommodate larger pet sprites
  // Order matches dashboard widget: first pet on right, second on left, etc.
  const petPositions = [
    { x: 120 * scaleFactor, y: 85 * scaleFactor, scale: 1.0 },     // Bottom right (1st pet)
    { x: -120 * scaleFactor, y: 85 * scaleFactor, scale: 1.0 },    // Bottom left (2nd pet)
    { x: 140 * scaleFactor, y: -15 * scaleFactor, scale: 0.95 },   // Middle right
    { x: -140 * scaleFactor, y: -15 * scaleFactor, scale: 0.95 },  // Middle left
    { x: 90 * scaleFactor, y: -100 * scaleFactor, scale: 0.9 },    // Top right
    { x: -90 * scaleFactor, y: -100 * scaleFactor, scale: 0.9 },   // Top left
  ];

  // Responsive container sizing - smaller on mobile
  const containerWidth = Math.min(size + 200 * scaleFactor, size + 220);
  const containerHeight = size + 140 * scaleFactor;
  const petBaseSize = 100 * scaleFactor; // Increased from 80 for bigger pets

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
    >
      {/* Ambient glow */}
      {showAvatarEffects && (
        <div
          className="absolute rounded-full blur-2xl opacity-20"
          style={{
            width: size * 0.8,
            height: size * 0.8,
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Pets */}
      {showPets && showPetSprites && pets.map((pet, index) => {
        const pos = petPositions[index];
        if (!pos) return null;

        const tierColor = TIER_INFO[pet.tier]?.color || '#8b5cf6';
        const petSize = petBaseSize * pos.scale;

        return (
          <motion.div
            key={pet.id}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: pos.x - petSize / 2,
              marginTop: pos.y - petSize / 2,
              zIndex: pos.y > 0 ? 15 : 5,
            }}
            animate={showAvatarEffects ? { y: [0, -4, 0] } : undefined}
            transition={{ duration: 2 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src={pet.sprite}
              alt={pet.name}
              className="pixelated"
              style={{
                width: petSize,
                height: petSize,
                imageRendering: 'pixelated',
              }}
              title={`${pet.name} - ${pet.bonusDescription}`}
            />
          </motion.div>
        );
      })}

      {/* Main Avatar - use AvatarRenderer with equipment or fallback to img */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {useEquipment ? (
          <AvatarRenderer size={size} animate={true} showStats={false} />
        ) : (
          <img
            src={avatarSrc}
            alt={avatarAlt}
            className="pixelated"
            style={{
              width: size,
              height: size,
              imageRendering: 'pixelated',
            }}
          />
        )}
      </motion.div>

      {/* Ground shadow */}
      <div
        className="absolute rounded-full opacity-15"
        style={{
          width: size * 0.6,
          height: 12,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.8) 0%, transparent 70%)',
          bottom: 15,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
}

export default AvatarWithCompanions;
