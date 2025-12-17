/**
 * ProfileFrame - Level-based decorative frame around avatars/profiles
 *
 * Features:
 * - Multiple frame tiers (bronze, silver, gold, diamond, legendary, mythic, etc.)
 * - Animated frames for higher tiers
 * - Glow effects
 * - Particle effects for highest tier
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getHighestFrame, getUnlockedFrames, PROFILE_FRAMES } from '../../data/levelProgression';
import useLevelProgressionStore from '../../stores/levelProgressionStore';

// CSS Keyframes for animations
const ANIMATION_STYLES = `
  @keyframes frame-shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes frame-pulse {
    0%, 100% { opacity: 0.8; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.02); }
  }

  @keyframes frame-rainbow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }

  @keyframes frame-cosmic {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes frame-divine {
    0%, 100% {
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.5);
    }
  }

  @keyframes particle-float {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'profile-frame-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = ANIMATION_STYLES;
    document.head.appendChild(style);
  }
}

/**
 * Get animation style for frame type
 */
function getAnimationStyle(animationType) {
  switch (animationType) {
    case 'shimmer':
      return {
        backgroundSize: '200% auto',
        animation: 'frame-shimmer 3s linear infinite',
      };
    case 'pulse':
      return {
        animation: 'frame-pulse 2s ease-in-out infinite',
      };
    case 'rainbow':
      return {
        animation: 'frame-rainbow 5s linear infinite',
      };
    case 'cosmic':
      return {
        backgroundSize: '400% 400%',
        animation: 'frame-cosmic 8s ease infinite',
      };
    case 'divine':
      return {
        animation: 'frame-divine 2s ease-in-out infinite',
      };
    default:
      return {};
  }
}

/**
 * ProfileFrame Component
 */
export default function ProfileFrame({
  level,
  children,
  size = 'md', // 'sm', 'md', 'lg', 'xl', or number for custom size
  shape = 'circle', // 'circle', 'rounded', 'square'
  frameId = null, // Override with specific frame
  showParticles = true,
  allowOverflow = false, // Allow children to overflow (for pets around avatar)
  className = '',
}) {
  const { selectedFrame } = useLevelProgressionStore();

  // Determine which frame to use
  const frame = useMemo(() => {
    if (frameId && PROFILE_FRAMES[frameId]) {
      return PROFILE_FRAMES[frameId];
    }
    if (selectedFrame && PROFILE_FRAMES[selectedFrame] && level >= PROFILE_FRAMES[selectedFrame].minLevel) {
      return PROFILE_FRAMES[selectedFrame];
    }
    return getHighestFrame(level);
  }, [level, frameId, selectedFrame]);

  // Size configurations - support custom numeric size
  const predefinedSizes = {
    sm: { size: 48, borderWidth: Math.max(2, frame.borderWidth - 1), glowSize: 8 },
    md: { size: 64, borderWidth: frame.borderWidth, glowSize: 12 },
    lg: { size: 96, borderWidth: frame.borderWidth + 1, glowSize: 16 },
    xl: { size: 128, borderWidth: frame.borderWidth + 2, glowSize: 24 },
  };

  const sizeConfig = typeof size === 'number'
    ? {
        size,
        borderWidth: Math.max(3, Math.floor(size / 30)),
        glowSize: Math.floor(size / 8)
      }
    : predefinedSizes[size] || predefinedSizes.md;

  // Shape styles
  const shapeStyles = {
    circle: 'rounded-full',
    rounded: 'rounded-2xl',
    square: 'rounded-none',
  }[shape] || 'rounded-full';

  // No frame case
  if (frame.id === 'none' || frame.borderWidth === 0) {
    return (
      <div className={`relative ${className}`} style={{ width: sizeConfig.size, height: sizeConfig.size }}>
        <div className={`w-full h-full ${shapeStyles} ${allowOverflow ? 'overflow-visible' : 'overflow-hidden'}`}>
          {children}
        </div>
      </div>
    );
  }

  // Animation styles
  const animationStyle = frame.animated ? getAnimationStyle(frame.animationType) : {};

  return (
    <div
      className={`relative ${className}`}
      style={{ width: sizeConfig.size + sizeConfig.borderWidth * 2, height: sizeConfig.size + sizeConfig.borderWidth * 2 }}
    >
      {/* Glow effect */}
      {frame.glow && (
        <div
          className={`absolute inset-0 ${shapeStyles} blur-md opacity-60`}
          style={{
            backgroundColor: frame.glowColor || frame.color,
            transform: `scale(${1 + sizeConfig.glowSize / sizeConfig.size})`,
          }}
        />
      )}

      {/* Frame border */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`absolute inset-0 ${shapeStyles}`}
        style={{
          background: frame.gradient || frame.color,
          padding: sizeConfig.borderWidth,
          ...animationStyle,
        }}
      >
        {/* Inner content area */}
        <div
          className={`w-full h-full ${shapeStyles} ${allowOverflow ? 'overflow-visible' : 'overflow-hidden'} bg-[#12101a]`}
          style={{ padding: 0 }}
        >
          {children}
        </div>
      </motion.div>

      {/* Particle effects for highest tier frames */}
      {showParticles && frame.particles && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1.5 h-1.5 ${shapeStyles}`}
              style={{
                backgroundColor: frame.color,
                left: `${20 + Math.random() * 60}%`,
                bottom: '0%',
                animation: `particle-float ${2 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Frame selector for settings/customization
 */
export function FrameSelector({ level, onSelect, className = '' }) {
  const { selectedFrame, selectFrame } = useLevelProgressionStore();
  const unlockedFrames = getUnlockedFrames(level);
  const allFrames = Object.values(PROFILE_FRAMES);

  const handleSelect = async (frameId) => {
    await selectFrame(frameId);
    if (onSelect) onSelect(frameId);
  };

  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      {allFrames.map((frame) => {
        const isUnlocked = level >= frame.minLevel;
        const isSelected = selectedFrame === frame.id;

        return (
          <motion.button
            key={frame.id}
            whileHover={isUnlocked ? { scale: 1.05 } : {}}
            whileTap={isUnlocked ? { scale: 0.95 } : {}}
            onClick={() => isUnlocked && handleSelect(frame.id)}
            className={`relative p-3 rounded-xl border-2 transition-all ${
              isSelected
                ? 'border-purple-500 bg-purple-500/20'
                : isUnlocked
                ? 'border-white/20 bg-white/5 hover:border-white/40'
                : 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
            }`}
          >
            {/* Frame preview */}
            <div className="flex flex-col items-center gap-2">
              <ProfileFrame level={level} size="sm" frameId={frame.id} showParticles={false}>
                <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-blue-500/30" />
              </ProfileFrame>

              <div className="text-xs font-medium text-white/80">{frame.name}</div>

              {!isUnlocked && (
                <div className="text-[10px] text-white/40">Level {frame.minLevel}</div>
              )}
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}

            {/* Lock icon for locked frames */}
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                <svg className="w-6 h-6 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Frame preview card with details
 */
export function FramePreviewCard({ frame, level, className = '' }) {
  const isUnlocked = level >= frame.minLevel;

  return (
    <div
      className={`bg-[#1a1625] border rounded-xl p-4 ${
        isUnlocked ? 'border-white/20' : 'border-white/10 opacity-60'
      } ${className}`}
    >
      <div className="flex items-center gap-4">
        <ProfileFrame level={Math.max(level, frame.minLevel)} size="md" frameId={frame.id} showParticles={false}>
          <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-blue-500/30" />
        </ProfileFrame>

        <div className="flex-1">
          <div className="font-medium text-white">{frame.name}</div>
          <div className="text-sm text-white/50">
            {isUnlocked ? 'Unlocked' : `Unlocks at Level ${frame.minLevel}`}
          </div>

          {/* Frame features */}
          <div className="flex gap-2 mt-2">
            {frame.animated && (
              <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                Animated
              </span>
            )}
            {frame.glow && (
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                Glow
              </span>
            )}
            {frame.particles && (
              <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                Particles
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
