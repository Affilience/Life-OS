/**
 * Boss Battle Arena
 * Real-time tap-to-attack PvE combat component with weapon-based attacks
 * Features anime.js powered attack animations
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Heart, Zap, Trophy, Skull, Star, Sparkles } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { useBossStore } from '../../stores/bossStore';
import { useAvatarStore } from '../../stores/avatarStore';
import { usePetStore } from '../../stores/petStore';
import { BOSS_DATABASE, BOSS_DIFFICULTY } from '../../data/bossDatabase';
import { WEAPON_ATTACKS, ATTACK_ANIMATIONS } from '../../data/weaponAttacks';
import { sounds } from '../../services/microInteractions';
import AvatarRenderer from '../avatar/AvatarRenderer';

// Custom hook for anime.js screen shake
const useScreenShake = (containerRef) => {
  const shake = useCallback((intensity = 'normal') => {
    if (!containerRef.current) return;

    const intensities = {
      light: { x: 3, y: 2, duration: 200 },
      normal: { x: 8, y: 5, duration: 300 },
      heavy: { x: 15, y: 10, duration: 400 },
      crit: { x: 20, y: 12, duration: 500 },
    };

    const config = intensities[intensity] || intensities.normal;

    animate(containerRef.current, {
      translateX: [0, -config.x, config.x, -config.x / 2, config.x / 2, 0],
      translateY: [0, config.y / 2, -config.y / 2, config.y / 3, -config.y / 3, 0],
      duration: config.duration,
      easing: 'easeOutElastic(1, 0.5)',
    });
  }, [containerRef]);

  return shake;
};

// Custom hook for anime.js particle burst
const useParticleBurst = (containerRef) => {
  const burst = useCallback((x, y, options = {}) => {
    if (!containerRef.current) return;

    const {
      count = 12,
      colors = ['#ffaa00', '#ff6600', '#ff3300'],
      spread = 150,
      duration = 600,
      size = 6,
    } = options;

    const container = containerRef.current;
    const particles = [];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.cssText = `
        position: absolute;
        width: ${size + Math.random() * size}px;
        height: ${size + Math.random() * size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        left: ${x}px;
        top: ${y}px;
        z-index: 100;
        box-shadow: 0 0 ${size}px ${color};
      `;
      container.appendChild(particle);
      particles.push(particle);
    }

    const angle = (index) => (360 / count) * index * (Math.PI / 180);

    animate(particles, {
      translateX: (el, i) => Math.cos(angle(i)) * (spread * (0.5 + Math.random() * 0.5)),
      translateY: (el, i) => Math.sin(angle(i)) * (spread * (0.5 + Math.random() * 0.5)),
      scale: [1, 0],
      opacity: [1, 0],
      duration: () => duration + Math.random() * 200,
      easing: 'easeOutExpo',
      delay: stagger(20),
      complete: () => {
        particles.forEach(p => p.remove());
      },
    });
  }, [containerRef]);

  return burst;
};

// Anime.js powered projectile component for player attacks
const AnimeProjectile = ({ startX, startY, endX, endY, color, trailColor, isMagic, isCrit, onComplete }) => {
  const projectileRef = useRef(null);
  const trailContainerRef = useRef(null);

  useEffect(() => {
    if (!projectileRef.current) return;

    // Create trail particles
    const createTrail = () => {
      if (!trailContainerRef.current || !projectileRef.current) return;

      const rect = projectileRef.current.getBoundingClientRect();
      const containerRect = trailContainerRef.current.getBoundingClientRect();

      const trail = document.createElement('div');
      trail.style.cssText = `
        position: absolute;
        width: ${isCrit ? 8 : 5}px;
        height: ${isCrit ? 8 : 5}px;
        background: ${trailColor || color};
        border-radius: 50%;
        pointer-events: none;
        left: ${rect.left - containerRect.left + rect.width / 2}px;
        top: ${rect.top - containerRect.top + rect.height / 2}px;
        opacity: 0.8;
      `;
      trailContainerRef.current.appendChild(trail);

      animate(trail, {
        scale: [1, 0],
        opacity: [0.8, 0],
        duration: 300,
        easing: 'easeOutQuad',
        complete: () => trail.remove(),
      });
    };

    const trailInterval = setInterval(createTrail, 30);

    // Animate projectile movement
    animate(projectileRef.current, {
      translateX: [0, endX - startX],
      translateY: [0, endY - startY],
      scale: isCrit ? [1, 1.5] : [1, 1],
      duration: 250,
      easing: 'easeInQuad',
      complete: () => {
        clearInterval(trailInterval);
        onComplete?.();
      },
    });

    return () => clearInterval(trailInterval);
  }, [startX, startY, endX, endY, color, trailColor, isCrit, onComplete]);

  return (
    <div
      ref={trailContainerRef}
      className="absolute inset-0 pointer-events-none z-40"
    >
      <div
        ref={projectileRef}
        className="absolute"
        style={{
          left: startX,
          top: startY,
          width: isCrit ? 20 : 14,
          height: isCrit ? 20 : 14,
        }}
      >
        {isMagic ? (
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle, ${color} 0%, ${trailColor} 60%, transparent 100%)`,
              boxShadow: `0 0 ${isCrit ? 25 : 15}px ${color}, 0 0 ${isCrit ? 50 : 30}px ${trailColor}`,
            }}
          />
        ) : (
          <div
            className="w-full h-full rotate-45"
            style={{
              background: `linear-gradient(135deg, ${color}, ${trailColor})`,
              boxShadow: `0 0 ${isCrit ? 20 : 10}px ${color}`,
            }}
          />
        )}
      </div>
    </div>
  );
};

// Anime.js powered boss attack projectile
const BossProjectile = ({ boss, startY, endY, onComplete, onHit }) => {
  const projectileRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!projectileRef.current) return;

    const color = boss?.attackColor || '#ff0000';
    const attackType = boss?.attackAnimation || 'fireball';

    // Pulse animation for the projectile
    animate(projectileRef.current.querySelector('.projectile-core'), {
      scale: [1, 1.3, 1],
      rotate: attackType === 'spell' ? [0, 360] : 0,
      duration: 400,
      easing: 'easeInOutQuad',
      loop: true,
    });

    // Main movement animation
    animate(projectileRef.current, {
      translateY: [0, endY - startY],
      duration: 350,
      easing: 'easeInQuad',
      complete: () => {
        onHit?.();
        onComplete?.();
      },
    });
  }, [boss, startY, endY, onComplete, onHit]);

  const color = boss?.attackColor || '#ff0000';
  const attackType = boss?.attackAnimation || 'fireball';

  const getProjectileStyle = () => {
    switch (attackType) {
      case 'fireball':
        return (
          <>
            <div
              className="projectile-core w-12 h-12 rounded-full"
              style={{
                background: `radial-gradient(circle, #ffff00 0%, ${color} 50%, #000 100%)`,
                boxShadow: `0 0 30px ${color}, 0 0 60px ${color}`,
              }}
            />
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full animate-ping"
                style={{
                  backgroundColor: i % 2 === 0 ? '#ff6600' : '#ffaa00',
                  top: `${Math.sin(i * 60 * Math.PI / 180) * 15 + 20}px`,
                  left: `${Math.cos(i * 60 * Math.PI / 180) * 15 + 20}px`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </>
        );
      case 'breath':
        return (
          <div
            className="projectile-core w-20 h-10 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${color}00, ${color}, ${color}00)`,
              boxShadow: `0 0 25px ${color}`,
            }}
          />
        );
      case 'spell':
      case 'dark_pulse':
        return (
          <div className="projectile-core relative w-10 h-10">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 15px ${color}`,
                  top: `${Math.sin(i * 90 * Math.PI / 180) * 12 + 16}px`,
                  left: `${Math.cos(i * 90 * Math.PI / 180) * 12 + 16}px`,
                }}
              />
            ))}
          </div>
        );
      case 'tentacle':
        return (
          <div
            className="projectile-core w-6 h-20 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${color}, #1e1b4b)`,
              boxShadow: `0 0 20px ${color}`,
            }}
          />
        );
      default:
        return (
          <div
            className="projectile-core w-10 h-10 rounded-full"
            style={{
              background: `radial-gradient(circle, #fff 0%, ${color} 50%, transparent 100%)`,
              boxShadow: `0 0 25px ${color}`,
            }}
          />
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-40"
    >
      <div
        ref={projectileRef}
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: startY }}
      >
        {getProjectileStyle()}
      </div>
    </div>
  );
};

// Impact flash effect using anime.js
const ImpactFlash = ({ x, y, color, size = 'normal', onComplete }) => {
  const flashRef = useRef(null);

  useEffect(() => {
    if (!flashRef.current) return;

    const sizePx = size === 'large' ? 120 : size === 'small' ? 60 : 90;

    animate(flashRef.current, {
      scale: [0, 1.5],
      opacity: [1, 0],
      duration: 300,
      easing: 'easeOutExpo',
      complete: onComplete,
    });

    // Animate inner rings
    const rings = flashRef.current.querySelectorAll('.impact-ring');
    animate(rings, {
      scale: [0.5, 2],
      opacity: [0.8, 0],
      duration: 400,
      delay: stagger(50),
      easing: 'easeOutExpo',
    });
  }, [size, onComplete]);

  const sizePx = size === 'large' ? 120 : size === 'small' ? 60 : 90;

  return (
    <div
      ref={flashRef}
      className="absolute pointer-events-none z-50"
      style={{
        left: x,
        top: y,
        width: sizePx,
        height: sizePx,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
      />
      <div
        className="impact-ring absolute inset-2 rounded-full border-2"
        style={{ borderColor: color }}
      />
      <div
        className="impact-ring absolute inset-4 rounded-full border"
        style={{ borderColor: color }}
      />
    </div>
  );
};

// Damage number popup component with critical hit support
const DamageNumber = ({ damage, position, isPlayer, isCrit = false, color }) => (
  <motion.div
    initial={{ opacity: 1, y: 0, scale: isCrit ? 1.5 : 1 }}
    animate={{
      opacity: 0,
      y: isCrit ? -80 : -50,
      scale: isCrit ? 2.5 : 1.5,
      rotate: isCrit ? [0, -10, 10, 0] : 0,
    }}
    exit={{ opacity: 0 }}
    transition={{ duration: isCrit ? 1 : 0.8 }}
    className={`absolute font-bold pointer-events-none ${
      isPlayer
        ? 'text-red-500 text-2xl'
        : isCrit
          ? 'text-4xl'
          : 'text-2xl'
    }`}
    style={{
      left: position.x,
      top: position.y,
      color: isPlayer ? undefined : (isCrit ? '#fbbf24' : color || '#facc15'),
      textShadow: isCrit ? '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.5)' : undefined,
    }}
  >
    {isCrit && <span className="text-xs absolute -top-4 left-1/2 -translate-x-1/2 text-orange-400">CRIT!</span>}
    -{damage}
  </motion.div>
);

// Weapon cooldown indicator component
const CooldownIndicator = ({ progress, weaponAttack, canAttack }) => {
  const percentage = Math.min(100, progress * 100);
  const isReady = canAttack;

  return (
    <div className="w-full max-w-xs mx-auto mt-4">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-white/60 font-medium flex items-center gap-1">
          <Swords className="w-3 h-3" />
          {weaponAttack?.attackName || 'Attack'}
        </span>
        {isReady ? (
          <span className="text-green-400 font-bold animate-pulse">READY!</span>
        ) : (
          <span className="text-white/40">{Math.ceil((1 - progress) * (weaponAttack?.cooldown || 500))}ms</span>
        )}
      </div>
      <div className="h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/20">
        <motion.div
          className={`h-full rounded-full ${
            isReady
              ? 'bg-gradient-to-r from-green-500 to-emerald-400'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
          style={{ width: `${percentage}%` }}
          animate={isReady ? { opacity: [1, 0.7, 1] } : {}}
          transition={isReady ? { duration: 0.5, repeat: Infinity } : {}}
        />
      </div>
    </div>
  );
};

// Attack effect overlay component for player attacks
const AttackEffect = ({ attackResult, position }) => {
  if (!attackResult) return null;

  const { animation, color, trailColor, isCrit } = attackResult;
  const animConfig = ATTACK_ANIMATIONS[animation] || ATTACK_ANIMATIONS.slash;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position?.x || '50%',
        top: position?.y || '50%',
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 1, 0],
        scale: isCrit ? [0.5, 2, 2.5] : [0.5, 1.5, 2],
        rotate: animConfig.keyframes?.[0]?.rotate ? [animConfig.keyframes[0].rotate, animConfig.keyframes[1]?.rotate || 0] : 0,
      }}
      transition={{ duration: (animConfig.duration || 300) / 1000 }}
    >
      {/* Main effect */}
      <div
        className="w-16 h-16 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color || '#ffffff'} 0%, ${trailColor || '#88aaff'} 50%, transparent 70%)`,
          boxShadow: `0 0 ${isCrit ? 40 : 20}px ${color || '#ffffff'}`,
        }}
      />

      {/* Particles for crits */}
      {isCrit && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: trailColor || '#ffaa00',
                top: '50%',
                left: '50%',
              }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos(i * 60 * Math.PI / 180) * 60,
                y: Math.sin(i * 60 * Math.PI / 180) * 60,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

// Player attack projectile - travels from bottom to boss
const PlayerAttackProjectile = ({ weaponAttack, isCrit, onComplete }) => {
  const color = weaponAttack?.color || '#ffaa00';
  const trailColor = weaponAttack?.trailColor || '#ff6600';
  const isMagic = weaponAttack?.isMagic;

  return (
    <motion.div
      className="absolute left-1/2 pointer-events-none z-30"
      initial={{ bottom: '20%', x: '-50%', scale: 1, opacity: 1 }}
      animate={{ bottom: '60%', x: '-50%', scale: isCrit ? 1.5 : 1, opacity: [1, 1, 0] }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      {isMagic ? (
        // Magic projectile (orb)
        <div className="relative">
          <motion.div
            className="w-8 h-8 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color} 0%, ${trailColor} 60%, transparent 100%)`,
              boxShadow: `0 0 20px ${color}, 0 0 40px ${trailColor}`,
            }}
            animate={{ scale: [1, 1.2, 1], rotate: 360 }}
            transition={{ duration: 0.3, repeat: 0 }}
          />
          {/* Magic trail particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: trailColor,
                left: '50%',
                top: '50%',
              }}
              initial={{ x: 0, y: 0, opacity: 0.8 }}
              animate={{
                y: 20 + i * 10,
                opacity: 0,
                scale: 0.5,
              }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            />
          ))}
        </div>
      ) : (
        // Physical projectile (slash/strike)
        <motion.div
          className="w-12 h-3 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, ${trailColor}, transparent)`,
            boxShadow: `0 0 15px ${color}`,
          }}
          animate={{ scaleX: [1, 1.5, 1], rotate: [-10, 10, -10] }}
          transition={{ duration: 0.15, repeat: 1 }}
        />
      )}
    </motion.div>
  );
};

// Boss attack projectile - travels from boss to player
const BossAttackProjectile = ({ boss, onComplete }) => {
  const color = boss?.attackColor || '#ff0000';
  const attackAnimation = boss?.attackAnimation || 'fireball';

  // Different projectile styles based on boss attack type
  const getProjectileStyle = () => {
    switch (attackAnimation) {
      case 'fireball':
        return (
          <motion.div
            className="w-10 h-10 rounded-full relative"
            style={{
              background: `radial-gradient(circle, #ffff00 0%, ${color} 50%, #000 100%)`,
              boxShadow: `0 0 30px ${color}, 0 0 60px ${color}`,
            }}
            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 0.4, repeat: 0 }}
          >
            {/* Fire particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: i % 2 === 0 ? '#ff6600' : '#ffaa00',
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: Math.cos(i * 60 * Math.PI / 180) * 15,
                  y: Math.sin(i * 60 * Math.PI / 180) * 15 - 20,
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
              />
            ))}
          </motion.div>
        );
      case 'breath':
        return (
          <motion.div
            className="w-16 h-8 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${color}00, ${color}, ${color}00)`,
              boxShadow: `0 0 20px ${color}`,
            }}
            animate={{ scaleX: [1, 2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.3 }}
          />
        );
      case 'spell':
      case 'dark_pulse':
        return (
          <motion.div
            className="w-8 h-8 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.4 }}
          >
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}`,
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: Math.cos(i * 90 * Math.PI / 180) * 12,
                  y: Math.sin(i * 90 * Math.PI / 180) * 12,
                }}
              />
            ))}
          </motion.div>
        );
      case 'tentacle':
        return (
          <motion.div
            className="w-4 h-16 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${color}, #1e1b4b)`,
              boxShadow: `0 0 15px ${color}`,
            }}
            animate={{ scaleY: [1, 1.3, 1], rotate: [-20, 20, -20] }}
            transition={{ duration: 0.3 }}
          />
        );
      default:
        // Default slash/strike
        return (
          <motion.div
            className="w-10 h-10 rounded-full"
            style={{
              background: `radial-gradient(circle, #fff 0%, ${color} 50%, transparent 100%)`,
              boxShadow: `0 0 20px ${color}`,
            }}
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 0.3 }}
          />
        );
    }
  };

  return (
    <motion.div
      className="absolute left-1/2 pointer-events-none z-30"
      initial={{ top: '35%', x: '-50%', scale: 0.5, opacity: 0 }}
      animate={{ top: '75%', x: '-50%', scale: 1, opacity: [0, 1, 1, 0.5] }}
      transition={{ duration: 0.4, ease: 'easeIn' }}
      onAnimationComplete={onComplete}
    >
      {getProjectileStyle()}
    </motion.div>
  );
};

// Impact effect when hit
const ImpactEffect = ({ color, position, size = 'normal' }) => {
  const effectSize = size === 'large' ? 'w-24 h-24' : 'w-16 h-16';

  return (
    <motion.div
      className={`absolute ${effectSize} pointer-events-none`}
      style={{
        left: position?.x || '50%',
        top: position?.y || '50%',
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: [0, 1.5, 2], opacity: [1, 0.8, 0] }}
      transition={{ duration: 0.3 }}
    >
      {/* Shockwave ring */}
      <div
        className="absolute inset-0 rounded-full border-4"
        style={{ borderColor: color || '#ff0000' }}
      />
      {/* Inner flash */}
      <motion.div
        className="absolute inset-2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color || '#ff0000'} 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 0.5], opacity: [1, 0] }}
        transition={{ duration: 0.2 }}
      />
      {/* Sparks */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-3 rounded-full"
          style={{
            backgroundColor: color || '#ff0000',
            top: '50%',
            left: '50%',
            transformOrigin: 'center',
          }}
          initial={{ rotate: i * 45, y: 0, opacity: 1 }}
          animate={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.3, delay: i * 0.02 }}
        />
      ))}
    </motion.div>
  );
};

// Screen shake wrapper
const ScreenShake = ({ shake, children }) => {
  return (
    <motion.div
      animate={shake ? {
        x: [0, -5, 5, -5, 5, 0],
        y: [0, 3, -3, 3, -3, 0],
      } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Health bar component
const HealthBar = ({ current, max, label, isPlayer = false }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  const getBarColor = () => {
    if (percentage > 60) return 'from-green-500 to-green-400';
    if (percentage > 30) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-red-400';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/70 font-medium">{label}</span>
        <span className="text-white font-bold">{Math.max(0, current)} / {max}</span>
      </div>
      <div className="h-5 bg-black/60 rounded-full overflow-hidden border-2 border-white/20">
        <motion.div
          className={`h-full bg-gradient-to-r ${getBarColor()} rounded-full relative`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
};

// Full-screen countdown with avatar vs boss standoff
const CountdownOverlay = ({ countdown, boss, characterGender, equipped }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-gradient-to-b from-red-900/90 via-black to-purple-900/90 flex flex-col items-center justify-center z-50"
  >
    {/* VS Text */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative"
      >
        {countdown > 0 ? (
          <motion.span
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
          >
            {countdown}
          </motion.span>
        ) : (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            className="text-6xl font-black text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]"
          >
            FIGHT!
          </motion.span>
        )}
      </motion.div>
    </div>

    {/* Avatar on left */}
    <motion.div
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring' }}
      className="absolute left-8 bottom-1/3"
    >
      <div className="relative">
        <div className="w-32 h-32 sm:w-40 sm:h-40">
          <AvatarRenderer
            equipped={equipped}
            characterGender={characterGender}
            size={160}
            showEffects={true}
          />
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 rounded-full text-xs font-bold text-white"
        >
          YOU
        </motion.div>
      </div>
    </motion.div>

    {/* Boss on right */}
    <motion.div
      initial={{ x: 200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring' }}
      className="absolute right-8 bottom-1/3"
    >
      <div className="relative">
        <motion.img
          src={boss?.sprite}
          alt={boss?.name}
          className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
          style={{ imageRendering: 'pixelated', transform: 'scaleX(-1)' }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500 rounded-full text-xs font-bold text-white whitespace-nowrap"
        >
          {boss?.name}
        </motion.div>
      </div>
    </motion.div>

    {/* Lightning effects */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 bg-gradient-to-b from-yellow-300 via-white to-yellow-300"
          style={{
            left: `${15 + i * 15}%`,
            height: '100%',
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scaleY: [0, 1, 0],
          }}
          transition={{
            duration: 0.3,
            delay: i * 0.15,
            repeat: countdown > 0 ? Infinity : 0,
            repeatDelay: 2,
          }}
        />
      ))}
    </div>
  </motion.div>
);

// Victory/Defeat overlay
const BattleResultOverlay = ({ isVictory, rewards, boss, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-black/90 flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring' }}
      className="text-center p-8 max-w-sm"
    >
      {isVictory ? (
        <>
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Trophy className="w-28 h-28 mx-auto text-yellow-400 mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
          </motion.div>
          <h2 className="text-5xl font-black text-yellow-400 mb-2 drop-shadow-lg">VICTORY!</h2>
          <p className="text-white/70 mb-6 text-lg">{boss?.name} has been defeated!</p>

          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-5 mb-6 border border-yellow-500/30">
            <h3 className="text-lg font-semibold text-white mb-4">Rewards Earned</h3>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-purple-400">
                  <Star className="w-6 h-6" />
                  <span className="text-3xl font-black">+{rewards?.xp || 0}</span>
                </div>
                <span className="text-xs text-white/50">XP</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Zap className="w-6 h-6" />
                  <span className="text-3xl font-black">+{rewards?.credits || 0}</span>
                </div>
                <span className="text-xs text-white/50">Credits</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Skull className="w-28 h-28 mx-auto text-red-500 mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
          </motion.div>
          <h2 className="text-5xl font-black text-red-500 mb-2">DEFEAT</h2>
          <p className="text-white/70 mb-6 text-lg">{boss?.name} was too powerful...</p>
          <p className="text-white/40 text-sm">Level up and try again!</p>
        </>
      )}

      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-white text-lg shadow-lg shadow-purple-500/30"
      >
        Continue
      </motion.button>
    </motion.div>
  </motion.div>
);

export default function BossBattleArena({ bossId, onClose }) {
  const {
    currentBattle,
    isBattleActive,
    playerStats,
    weaponAttack,
    lastAttackResult,
    canAttack,
    getCooldownProgress,
    startBattle,
    playerAttack,
    bossAttack,
    endBattle,
    abandonBattle,
  } = useBossStore();

  const { level, equipped, characterGender } = useAvatarStore();
  const { activePet } = usePetStore();

  const [damageNumbers, setDamageNumbers] = useState([]);
  const [attackEffects, setAttackEffects] = useState([]);
  const [battleResult, setBattleResult] = useState(null);
  const [isCountdown, setIsCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [battleEnded, setBattleEnded] = useState(false);
  const [cooldownProgress, setCooldownProgress] = useState(1);
  const [isAttackReady, setIsAttackReady] = useState(true);

  // Anime.js projectile and impact states
  const [playerProjectiles, setPlayerProjectiles] = useState([]);
  const [bossProjectiles, setBossProjectiles] = useState([]);
  const [impactEffects, setImpactEffects] = useState([]);

  const bossRef = useRef(null);
  const battleIntervalRef = useRef(null);
  const cooldownIntervalRef = useRef(null);
  const damageIdRef = useRef(0);
  const effectIdRef = useRef(0);
  const projectileIdRef = useRef(0);
  const arenaRef = useRef(null);
  const particleContainerRef = useRef(null);

  // Initialize anime.js hooks
  const triggerShake = useScreenShake(arenaRef);
  const burstParticles = useParticleBurst(particleContainerRef);

  const boss = BOSS_DATABASE[bossId];
  const difficulty = BOSS_DIFFICULTY[boss?.difficulty] || BOSS_DIFFICULTY.normal;
  const currentWeapon = weaponAttack || WEAPON_ATTACKS.unarmed;

  // Reset any stuck battle and start countdown
  useEffect(() => {
    let isMounted = true;

    const initBattle = async () => {
      // First, abandon any stuck battle from previous sessions
      if (isBattleActive) {
        console.log('Abandoning stuck battle before starting new one');
        await abandonBattle();
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!isMounted) return;

      // Countdown sequence
      for (let i = 3; i > 0; i--) {
        if (!isMounted) return;
        setCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!isMounted) return;
      setCountdown(0);
      await new Promise(resolve => setTimeout(resolve, 500)); // Show "FIGHT!" briefly

      if (!isMounted) return;
      setIsCountdown(false);

      // Start the actual battle
      const result = await startBattle(bossId, level, equipped, activePet);
      if (result.error) {
        console.error('Failed to start battle:', result.error);
        if (isMounted) onClose();
      }
    };

    initBattle();

    return () => {
      isMounted = false;
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
      }
    };
  }, [bossId]); // Only depend on bossId to prevent re-runs

  // Boss auto-attack interval - uses boss's attackSpeed
  useEffect(() => {
    if (!isBattleActive || isCountdown || battleEnded) return;

    // Boss attacks based on their attackSpeed (ms between attacks)
    const attackSpeed = boss?.attackSpeed || 1000;

    battleIntervalRef.current = setInterval(() => {
      // Spawn boss projectile first
      const projId = projectileIdRef.current++;
      setBossProjectiles(prev => [...prev, {
        id: projId,
        boss,
        startY: 150, // Boss position
        endY: 450, // Player position
      }]);

      // Delay the actual damage until projectile hits
      setTimeout(() => {
        bossAttack();

        // Play boss attack sound
        sounds.bossAttack();

        // Remove projectile
        setBossProjectiles(prev => prev.filter(p => p.id !== projId));

        // Screen shake on player hit
        triggerShake('normal');

        // Particle burst at player position
        burstParticles(120, 480, {
          colors: [boss?.attackColor || '#ff0000', '#ffffff', '#ff6600'],
          count: 8,
          spread: 80,
        });

        // Show damage number on player side
        const id = damageIdRef.current++;
        setDamageNumbers(prev => [...prev, {
          id,
          damage: currentBattle?.boss?.damage || boss?.damage || 0,
          position: { x: '30%', y: '70%' },
          isPlayer: true,
          attackName: boss?.attackName || 'Attack',
        }]);

        // Add impact effect
        const impactId = effectIdRef.current++;
        setImpactEffects(prev => [...prev, {
          id: impactId,
          x: '50%',
          y: '75%',
          color: boss?.attackColor || '#ff0000',
          size: 'normal',
        }]);

        setTimeout(() => {
          setDamageNumbers(prev => prev.filter(d => d.id !== id));
          setImpactEffects(prev => prev.filter(e => e.id !== impactId));
        }, 800);
      }, 350); // Delay matches projectile travel time
    }, attackSpeed);

    return () => {
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
      }
    };
  }, [isBattleActive, isCountdown, battleEnded, bossAttack, currentBattle, boss]);

  // Cooldown progress tracking - updates every 50ms for smooth animation
  useEffect(() => {
    if (!isBattleActive || isCountdown || battleEnded) return;

    cooldownIntervalRef.current = setInterval(() => {
      const progress = getCooldownProgress();
      const ready = canAttack();
      setCooldownProgress(progress);
      setIsAttackReady(ready);
    }, 50);

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [isBattleActive, isCountdown, battleEnded, getCooldownProgress, canAttack]);

  // Check for battle end and explicitly end it
  useEffect(() => {
    if (!currentBattle || battleEnded) return;

    const handleBattleEnd = async (isVictory) => {
      // Prevent multiple calls
      setBattleEnded(true);

      // Stop boss attacks immediately
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
        battleIntervalRef.current = null;
      }

      // Call endBattle in the store to properly close it
      const result = await endBattle(isVictory ? 'victory' : 'defeat');

      // Set local result for UI
      setBattleResult({
        isVictory,
        rewards: isVictory ? {
          xp: currentBattle.boss.xpReward,
          credits: currentBattle.boss.creditsReward,
        } : null,
      });
    };

    if (currentBattle.bossCurrentHealth <= 0) {
      handleBattleEnd(true);
    } else if (currentBattle.playerCurrentHealth <= 0) {
      handleBattleEnd(false);
    }
  }, [currentBattle, battleEnded, endBattle]);

  // Handle player attack via button
  const handleAttack = useCallback(() => {
    if (!isBattleActive || isCountdown || battleResult || battleEnded || !isAttackReady) return;

    const result = playerAttack();

    // If attack was blocked (cooldown), don't show anything
    if (result?.blocked) {
      return;
    }

    const attackData = result || lastAttackResult || {};
    const damage = attackData.damage || currentBattle?.playerDamage || 10;
    const isCrit = attackData.isCrit || false;
    const color = attackData.weapon?.color || currentWeapon?.color || '#ffaa00';
    const trailColor = attackData.weapon?.trailColor || currentWeapon?.trailColor || '#ff6600';
    const isMagic = currentWeapon?.isMagic || false;

    // Spawn player projectile with anime.js
    const projId = projectileIdRef.current++;
    setPlayerProjectiles(prev => [...prev, {
      id: projId,
      startX: 150, // Player center
      startY: 480, // Player Y
      endX: 200, // Boss center
      endY: 180, // Boss Y
      color,
      trailColor,
      isMagic,
      isCrit,
    }]);

    // Delay damage effects until projectile reaches boss
    setTimeout(() => {
      // Remove projectile
      setPlayerProjectiles(prev => prev.filter(p => p.id !== projId));

      // Screen shake on boss hit
      triggerShake(isCrit ? 'crit' : 'light');

      // Particle burst at boss position
      burstParticles(200, 200, {
        colors: isCrit ? ['#fbbf24', '#ffffff', color] : [color, trailColor, '#ffffff'],
        count: isCrit ? 20 : 10,
        spread: isCrit ? 180 : 100,
        size: isCrit ? 8 : 5,
      });

      // Show damage number on boss
      const id = damageIdRef.current++;
      const randomX = 40 + Math.random() * 80;
      const randomY = 40 + Math.random() * 80;

      setDamageNumbers(prev => [...prev, {
        id,
        damage,
        position: { x: `${randomX}px`, y: `${randomY}px` },
        isPlayer: false,
        isCrit,
        color,
      }]);

      // Add impact effect at boss
      const impactId = effectIdRef.current++;
      setImpactEffects(prev => [...prev, {
        id: impactId,
        x: '50%',
        y: '50%',
        color: isCrit ? '#fbbf24' : color,
        size: isCrit ? 'large' : 'normal',
      }]);

      // Add attack effect (for Framer Motion backup)
      const effectId = effectIdRef.current++;
      setAttackEffects(prev => [...prev, {
        id: effectId,
        position: { x: '50%', y: '50%' },
        ...attackData,
        animation: currentWeapon?.animation,
        color,
        trailColor,
        isCrit,
      }]);

      // Remove effects
      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(d => d.id !== id));
        setImpactEffects(prev => prev.filter(e => e.id !== impactId));
        setAttackEffects(prev => prev.filter(e => e.id !== effectId));
      }, isCrit ? 1000 : 600);
    }, 250); // Delay matches projectile travel time
  }, [isBattleActive, isCountdown, battleResult, battleEnded, isAttackReady, playerAttack, currentBattle, lastAttackResult, currentWeapon, triggerShake, burstParticles]);

  // Handle close/abandon - always ensure battle is properly ended
  const handleClose = async () => {
    // Always clear the intervals
    if (battleIntervalRef.current) {
      clearInterval(battleIntervalRef.current);
      battleIntervalRef.current = null;
    }
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }

    // If battle is still marked as active (regardless of local result state), abandon it
    // This handles race conditions and ensures clean state
    if (isBattleActive) {
      console.log('Cleaning up battle on close, isBattleActive:', isBattleActive);
      await abandonBattle();
    }

    onClose();
  };

  // Use portal to render at body level, escaping any parent containers
  return createPortal(
    <div
      ref={arenaRef}
      className="fixed inset-0 bg-gradient-to-b from-slate-900 via-purple-900/30 to-slate-900 overflow-hidden"
      style={{ zIndex: 9999 }}
    >
      {/* Particle container for anime.js burst effects */}
      <div ref={particleContainerRef} className="absolute inset-0 pointer-events-none overflow-hidden" />

      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
        style={{ zIndex: 10000 }}
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Countdown overlay */}
      <AnimatePresence>
        {isCountdown && (
          <CountdownOverlay
            countdown={countdown}
            boss={boss}
            characterGender={characterGender}
            equipped={equipped}
          />
        )}
      </AnimatePresence>

      {/* Battle result overlay */}
      <AnimatePresence>
        {battleResult && (
          <BattleResultOverlay
            isVictory={battleResult.isVictory}
            rewards={battleResult.rewards}
            boss={boss}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Main battle area */}
      {!isCountdown && (
        <div className="h-full flex flex-col p-4 max-w-lg mx-auto relative">
          {/* Anime.js Player Projectiles */}
          {playerProjectiles.map(proj => (
            <AnimeProjectile
              key={proj.id}
              startX={proj.startX}
              startY={proj.startY}
              endX={proj.endX}
              endY={proj.endY}
              color={proj.color}
              trailColor={proj.trailColor}
              isMagic={proj.isMagic}
              isCrit={proj.isCrit}
              onComplete={() => setPlayerProjectiles(prev => prev.filter(p => p.id !== proj.id))}
            />
          ))}

          {/* Anime.js Boss Projectiles */}
          {bossProjectiles.map(proj => (
            <BossProjectile
              key={proj.id}
              boss={proj.boss}
              startY={proj.startY}
              endY={proj.endY}
              onComplete={() => setBossProjectiles(prev => prev.filter(p => p.id !== proj.id))}
            />
          ))}

          {/* Anime.js Impact Effects */}
          {impactEffects.map(impact => (
            <ImpactFlash
              key={impact.id}
              x={impact.x}
              y={impact.y}
              color={impact.color}
              size={impact.size}
              onComplete={() => setImpactEffects(prev => prev.filter(e => e.id !== impact.id))}
            />
          ))}

          {/* Boss section */}
          <div className="flex-1 flex flex-col items-center justify-center relative pt-8">
            {/* Boss name and difficulty */}
            <div className="text-center mb-3">
              <h2 className="text-2xl font-black text-white drop-shadow-lg">{boss?.name}</h2>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: `${difficulty.color}40`, color: difficulty.color }}
              >
                {difficulty.label}
              </span>
            </div>

            {/* Boss health bar */}
            <div className="w-full max-w-sm mb-4 px-4">
              <HealthBar
                current={currentBattle?.bossCurrentHealth ?? boss?.health}
                max={currentBattle?.bossMaxHealth ?? boss?.health}
                label="BOSS HP"
              />
            </div>

            {/* Boss sprite - NOT tappable, attacks via button only */}
            <motion.div
              ref={bossRef}
              className="relative select-none"
            >
              <motion.div
                animate={!battleResult ? { y: [0, -8, 0] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <img
                  src={boss?.sprite}
                  alt={boss?.name}
                  className="w-40 h-40 sm:w-52 sm:h-52 object-contain drop-shadow-[0_0_30px_rgba(255,0,0,0.3)]"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    e.target.src = '/assets/icons/placeholder.png';
                  }}
                />
              </motion.div>

              {/* Attack effects */}
              <AnimatePresence>
                {attackEffects.map(effect => (
                  <AttackEffect key={effect.id} attackResult={effect} position={effect.position} />
                ))}
              </AnimatePresence>

              {/* Damage numbers on boss */}
              <AnimatePresence>
                {damageNumbers.filter(d => !d.isPlayer).map(d => (
                  <DamageNumber
                    key={d.id}
                    damage={d.damage}
                    position={d.position}
                    isPlayer={false}
                    isCrit={d.isCrit}
                    color={d.color}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Attack Button - Only way to attack */}
            {isBattleActive && !battleResult && (
              <motion.button
                onClick={handleAttack}
                disabled={!isAttackReady}
                whileHover={isAttackReady ? { scale: 1.05 } : {}}
                whileTap={isAttackReady ? { scale: 0.95 } : {}}
                className={`mt-4 px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
                  isAttackReady
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 cursor-pointer'
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                }`}
                style={{
                  touchAction: 'manipulation',
                  borderColor: isAttackReady ? (currentWeapon?.color || '#ff6600') : 'transparent',
                  borderWidth: '2px',
                  boxShadow: isAttackReady ? `0 0 20px ${currentWeapon?.color || '#ff6600'}40` : 'none',
                }}
              >
                <div className="flex items-center gap-2">
                  <Swords className="w-5 h-5" />
                  <span>{currentWeapon?.attackName || 'Attack'}</span>
                </div>
              </motion.button>
            )}

            {/* Cooldown indicator */}
            {isBattleActive && !battleResult && (
              <CooldownIndicator
                progress={cooldownProgress}
                weaponAttack={currentWeapon}
                canAttack={isAttackReady}
              />
            )}

            {/* Status text */}
            {isBattleActive && !battleResult && (
              <motion.p
                animate={isAttackReady ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.4 }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className={`mt-2 text-xs font-medium ${isAttackReady ? 'text-green-400' : 'text-white/40'}`}
              >
                {isAttackReady
                  ? 'READY!'
                  : `Cooldown: ${Math.ceil((1 - cooldownProgress) * (currentWeapon?.cooldown || 500))}ms`}
              </motion.p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <Swords className="w-6 h-6 text-white/40" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          {/* Player section */}
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm relative">
            {/* Player avatar */}
            <div className="w-20 h-20 relative flex-shrink-0">
              <AvatarRenderer
                equipped={equipped}
                characterGender={characterGender}
                size={80}
                showEffects={false}
              />

              {/* Player damage numbers */}
              <AnimatePresence>
                {damageNumbers.filter(d => d.isPlayer).map(d => (
                  <DamageNumber key={d.id} damage={d.damage} position={{ x: '50%', y: '0' }} isPlayer={true} />
                ))}
              </AnimatePresence>
            </div>

            {/* Player stats */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-bold">Level {level}</span>
                {activePet && (
                  <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                    + {activePet.name}
                  </span>
                )}
              </div>

              {/* Player health bar */}
              <HealthBar
                current={currentBattle?.playerCurrentHealth ?? playerStats?.maxHealth ?? 100}
                max={currentBattle?.playerMaxHealth ?? playerStats?.maxHealth ?? 100}
                label="YOUR HP"
                isPlayer
              />

              {/* Combat stats */}
              <div className="flex flex-wrap gap-3 mt-2 text-sm">
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <Swords className="w-4 h-4" />
                  <span className="font-bold">{currentBattle?.playerDamage ?? playerStats?.damage ?? 10}</span>
                  <span className="text-white/40 text-xs">DMG</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/50">
                  <span className="font-medium">{currentBattle?.tapCount ?? 0} hits</span>
                </div>
                {(currentBattle?.critCount ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 text-orange-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-bold">{currentBattle?.critCount ?? 0}</span>
                    <span className="text-white/40 text-xs">CRITS</span>
                  </div>
                )}
              </div>

              {/* Weapon info */}
              <div className="mt-2 text-xs text-white/40 flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${currentWeapon?.color || '#ffffff'}20`,
                    color: currentWeapon?.color || '#ffffff',
                  }}
                >
                  {currentWeapon?.name || 'Fists'}
                </span>
                <span>×{currentWeapon?.damageMultiplier?.toFixed(1) || '0.5'}</span>
                <span>{currentWeapon?.cooldown || 500}ms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
