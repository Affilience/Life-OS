/**
 * Boss Battle Arena
 * Real-time tap-to-attack PvE combat component with weapon-based attacks
 * Features anime.js powered attack animations
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Heart, Zap, Trophy, Skull, Star, Sparkles, Flame, AlertTriangle } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { useBossStore } from '../../stores/bossStore';
import { useAvatarStore } from '../../stores/avatarStore';
import { usePetStore } from '../../stores/petStore';
import useElementalAbilityStore from '../../stores/elementalAbilityStore';
import { BOSS_DATABASE, BOSS_DIFFICULTY } from '../../data/bossDatabase';
import { WEAPON_ATTACKS, ATTACK_ANIMATIONS } from '../../data/weaponAttacks';
import { ABILITY_TYPES, getWeaponAbility, isAbilityReady, calculateAbilityDamage } from '../../data/weaponAbilities';
import { getAbilityById, calculateAbilityDamage as calcElementalDamage } from '../../data/elementalAbilities';
import { sounds } from '../../services/microInteractions';
import { playBossAttack } from '../../services/combatSounds';
import AvatarRenderer from '../avatar/AvatarRenderer';
import AbilityAnimation from '../combat/AbilityAnimation';
import CombatCanvas from '../combat/CombatCanvas';
import { Confetti, Fireworks, ScreenFlash, Starburst } from '../ui/Celebration';

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

// Ability cooldown indicator component
const AbilityCooldownIndicator = ({ ability, lastUsedTime, canUse }) => {
  const [progress, setProgress] = useState(canUse ? 1 : 0);

  useEffect(() => {
    if (!ability || canUse) {
      setProgress(1);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastUsedTime;
      const prog = Math.min(1, elapsed / ability.cooldown);
      setProgress(prog);
    }, 50);

    return () => clearInterval(interval);
  }, [ability, lastUsedTime, canUse]);

  if (!ability) return null;

  const percentage = Math.min(100, progress * 100);
  const remainingMs = Math.max(0, ability.cooldown - (Date.now() - lastUsedTime));

  return (
    <div className="w-full max-w-xs mx-auto mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-white/60 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" style={{ color: ability.color }} />
          {ability.name}
        </span>
        {canUse ? (
          <span className="font-bold animate-pulse" style={{ color: ability.color }}>READY!</span>
        ) : (
          <span className="text-white/40">{(remainingMs / 1000).toFixed(1)}s</span>
        )}
      </div>
      <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/20">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            background: canUse
              ? `linear-gradient(90deg, ${ability.color}, ${ability.trailColor || ability.color})`
              : 'linear-gradient(90deg, #4b5563, #6b7280)',
          }}
          animate={canUse ? { opacity: [1, 0.6, 1] } : {}}
          transition={canUse ? { duration: 0.5, repeat: Infinity } : {}}
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

  // IMPRESSIVE projectile styles for each boss attack type
  const getProjectileStyle = () => {
    switch (attackAnimation) {
      // Shadow Slime - Despair Glob: Pulsating dark mass with shadow tendrils
      case 'bounce':
        return (
          <motion.div className="relative w-20 h-20">
            {/* Main glob body */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${color} 0%, #1a0a2e 60%, #000 100%)`,
                boxShadow: `0 0 40px ${color}, 0 0 80px ${color}50, inset 0 0 20px #000`,
              }}
              animate={{
                scale: [1, 1.2, 0.9, 1.1, 1],
                borderRadius: ['50%', '45%', '55%', '48%', '50%']
              }}
              transition={{ duration: 0.4, repeat: 0 }}
            />
            {/* Shadow tendrils */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-8 rounded-full origin-bottom"
                style={{
                  background: `linear-gradient(to top, ${color}, transparent)`,
                  left: '50%',
                  bottom: '50%',
                  transform: `rotate(${i * 45}deg)`,
                }}
                animate={{
                  scaleY: [0.5, 1.5, 0.5],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              />
            ))}
            {/* Dripping effect */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`drip-${i}`}
                className="absolute w-3 h-6 rounded-full"
                style={{
                  backgroundColor: color,
                  left: `${30 + i * 20}%`,
                  top: '80%',
                }}
                animate={{ y: [0, 30, 60], opacity: [1, 0.5, 0], scaleY: [1, 1.5, 0.5] }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              />
            ))}
          </motion.div>
        );

      // Goblin Chief - Distraction Dagger: Multiple spinning daggers
      case 'stab':
        return (
          <motion.div className="relative w-24 h-24">
            {/* Multiple daggers spinning in formation */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: `30px solid ${color}`,
                  filter: `drop-shadow(0 0 8px ${color})`,
                }}
                animate={{
                  rotate: [0, 360],
                  x: Math.cos((i * 120) * Math.PI / 180) * 25 - 8,
                  y: Math.sin((i * 120) * Math.PI / 180) * 25 - 15,
                }}
                transition={{ duration: 0.3, repeat: 0 }}
              />
            ))}
            {/* Poison trail */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`trail-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: '#22ff22',
                  boxShadow: '0 0 10px #22ff22',
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: (Math.random() - 0.5) * 60,
                  y: -30 - i * 10,
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              />
            ))}
          </motion.div>
        );

      // Skeleton Knight - Oath Breaker: Ghostly sword slash with bones
      case 'slash':
        return (
          <motion.div className="relative w-32 h-20">
            {/* Main slash arc */}
            <motion.div
              className="absolute w-full h-4 rounded-full origin-left"
              style={{
                background: `linear-gradient(90deg, transparent, ${color}, #fff, ${color}, transparent)`,
                boxShadow: `0 0 20px ${color}, 0 0 40px ${color}50`,
                top: '40%',
              }}
              animate={{
                scaleX: [0, 1.2, 1],
                opacity: [0, 1, 0.7],
              }}
              transition={{ duration: 0.25 }}
            />
            {/* Ghostly trail */}
            <motion.div
              className="absolute w-full h-3 rounded-full origin-left"
              style={{
                background: `linear-gradient(90deg, transparent, #88888850, transparent)`,
                top: '45%',
              }}
              animate={{ scaleX: [0, 1], opacity: [0.8, 0] }}
              transition={{ duration: 0.35, delay: 0.1 }}
            />
            {/* Bone fragments */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-4 rounded-sm"
                style={{
                  backgroundColor: '#e0e0e0',
                  boxShadow: '0 0 5px #888',
                  left: `${20 + i * 15}%`,
                  top: '50%',
                }}
                animate={{
                  y: [-10, -40 - Math.random() * 20],
                  x: (Math.random() - 0.5) * 30,
                  rotate: [0, 360 + Math.random() * 360],
                  opacity: [1, 0],
                }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
              />
            ))}
          </motion.div>
        );

      // Forest Troll - Excuse Avalanche: Massive boulder with debris
      case 'smash':
        return (
          <motion.div className="relative w-28 h-28">
            {/* Main boulder */}
            <motion.div
              className="absolute inset-2 rounded-2xl"
              style={{
                background: `radial-gradient(circle at 30% 30%, #8b7355 0%, #5c4033 50%, #2a1810 100%)`,
                boxShadow: `0 0 30px ${color}, 0 8px 20px #00000080`,
              }}
              animate={{
                rotate: [0, 45, 90],
                scale: [0.8, 1.1, 1],
              }}
              transition={{ duration: 0.35 }}
            />
            {/* Cracks on boulder */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <motion.path
                d="M30,20 L50,50 L70,30 M50,50 L40,80 M50,50 L80,60"
                stroke="#3a2515"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
            </svg>
            {/* Flying debris */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-sm"
                style={{
                  width: 4 + Math.random() * 8,
                  height: 4 + Math.random() * 8,
                  backgroundColor: i % 2 === 0 ? '#8b7355' : '#5c4033',
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: (Math.random() - 0.5) * 100,
                  y: -20 - Math.random() * 60,
                  rotate: [0, 360],
                  opacity: [1, 0],
                }}
                transition={{ duration: 0.5, delay: i * 0.02 }}
              />
            ))}
            {/* Dust clouds */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`dust-${i}`}
                className="absolute w-8 h-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #8b735580, transparent)',
                  left: `${20 + i * 20}%`,
                  top: '70%',
                }}
                animate={{
                  scale: [0, 2],
                  opacity: [0.6, 0],
                  y: [0, -20],
                }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              />
            ))}
          </motion.div>
        );

      // Stone Golem - Stagnation Slam: Giant stone fist with shockwaves
      case 'pound':
        return (
          <motion.div className="relative w-32 h-32">
            {/* Giant fist */}
            <motion.div
              className="absolute w-20 h-24 rounded-t-3xl rounded-b-lg left-1/2 top-0"
              style={{
                background: `linear-gradient(180deg, #a0a0a0 0%, #606060 50%, #404040 100%)`,
                boxShadow: `0 0 30px ${color}, 0 10px 30px #00000080`,
                transform: 'translateX(-50%)',
              }}
              animate={{
                y: [0, 20],
                scale: [1, 1.1],
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Knuckle details */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-3 rounded-full bg-gray-500"
                  style={{ left: `${10 + i * 20}%`, top: '10%' }}
                />
              ))}
            </motion.div>
            {/* Shockwave rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 bottom-0 rounded-full border-4"
                style={{
                  width: 40,
                  height: 20,
                  borderColor: color,
                  transform: 'translateX(-50%)',
                }}
                animate={{
                  scale: [1, 3 + i],
                  opacity: [0.8, 0],
                }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            ))}
            {/* Ground cracks */}
            <svg className="absolute bottom-0 left-0 w-full h-8" viewBox="0 0 100 30">
              {[...Array(5)].map((_, i) => (
                <motion.line
                  key={i}
                  x1="50"
                  y1="15"
                  x2={20 + i * 15}
                  y2={25 + (Math.random() - 0.5) * 10}
                  stroke={color}
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
              ))}
            </svg>
          </motion.div>
        );

      // Flame Demon - Burnout Blaze: Raging inferno with multiple fireballs
      case 'fireball':
        return (
          <motion.div className="relative w-28 h-28">
            {/* Main fireball */}
            <motion.div
              className="absolute inset-4 rounded-full"
              style={{
                background: `radial-gradient(circle at 40% 40%, #fff 0%, #ffff00 20%, ${color} 50%, #8b0000 80%, #000 100%)`,
                boxShadow: `0 0 50px ${color}, 0 0 100px ${color}80, 0 0 150px ${color}40`,
              }}
              animate={{
                scale: [1, 1.3, 1.1, 1.2, 1],
                rotate: [0, 10, -10, 5, 0],
              }}
              transition={{ duration: 0.4 }}
            />
            {/* Orbiting smaller fireballs */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  background: `radial-gradient(circle, #fff, #ff6600)`,
                  boxShadow: `0 0 15px #ff6600`,
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [
                    Math.cos((i * 90) * Math.PI / 180) * 35,
                    Math.cos((i * 90 + 180) * Math.PI / 180) * 35,
                  ],
                  y: [
                    Math.sin((i * 90) * Math.PI / 180) * 35,
                    Math.sin((i * 90 + 180) * Math.PI / 180) * 35,
                  ],
                }}
                transition={{ duration: 0.4 }}
              />
            ))}
            {/* Fire particles rising */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 3 + Math.random() * 6,
                  height: 3 + Math.random() * 6,
                  backgroundColor: i % 3 === 0 ? '#ff0000' : i % 3 === 1 ? '#ff6600' : '#ffff00',
                  left: `${30 + Math.random() * 40}%`,
                  top: '60%',
                }}
                animate={{
                  y: [-20, -80 - Math.random() * 40],
                  x: (Math.random() - 0.5) * 40,
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{ duration: 0.5, delay: i * 0.02 }}
              />
            ))}
            {/* Heat distortion rings */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={`heat-${i}`}
                className="absolute inset-0 rounded-full border-2 border-orange-500/30"
                animate={{
                  scale: [1, 1.8],
                  opacity: [0.5, 0],
                }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
              />
            ))}
          </motion.div>
        );

      // Ice Drake - Comfort Zone Freeze: Crystalline ice beam
      case 'breath':
        return (
          <motion.div className="relative w-36 h-24">
            {/* Main ice breath cone */}
            <motion.div
              className="absolute left-0 top-1/2 w-full h-12 -translate-y-1/2 origin-left"
              style={{
                background: `linear-gradient(90deg, ${color} 0%, #88ddff 30%, #ffffff 60%, #88ddff 80%, transparent 100%)`,
                clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)',
                boxShadow: `0 0 40px ${color}`,
              }}
              animate={{
                scaleX: [0.5, 1.2, 1],
                opacity: [0.5, 1, 0.9],
              }}
              transition={{ duration: 0.35 }}
            />
            {/* Ice crystals */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${35 + (Math.random() - 0.5) * 30}%`,
                  width: 0,
                  height: 0,
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: `${12 + Math.random() * 8}px solid #aaeeff`,
                  filter: 'drop-shadow(0 0 5px #88ddff)',
                  transform: `rotate(${Math.random() * 60 - 30}deg)`,
                }}
                animate={{
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 0.8],
                }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              />
            ))}
            {/* Frost particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`frost-${i}`}
                className="absolute w-2 h-2 rounded-full bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${30 + Math.random() * 40}%`,
                  boxShadow: '0 0 8px #88ddff',
                }}
                animate={{
                  x: [0, 20 + Math.random() * 30],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.5],
                }}
                transition={{ duration: 0.5, delay: i * 0.02 }}
              />
            ))}
          </motion.div>
        );

      // Dark Wizard - Imposter Hex: Swirling dark magic with runes
      case 'spell':
        return (
          <motion.div className="relative w-28 h-28">
            {/* Central dark orb */}
            <motion.div
              className="absolute inset-6 rounded-full"
              style={{
                background: `radial-gradient(circle, ${color} 0%, #1a0030 60%, #000 100%)`,
                boxShadow: `0 0 40px ${color}, inset 0 0 20px #ff00ff40`,
              }}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 0.3 }}
            />
            {/* Rotating magic circles */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: i === 0 ? color : '#ff00ff',
                  borderStyle: 'dashed',
                }}
                animate={{
                  rotate: i === 0 ? [0, 360] : [360, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.5 }}
              />
            ))}
            {/* Floating runes */}
            {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ'].map((rune, i) => (
              <motion.div
                key={i}
                className="absolute text-lg font-bold"
                style={{
                  color: color,
                  textShadow: `0 0 10px ${color}`,
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: Math.cos((i * 60) * Math.PI / 180) * 45 - 6,
                  y: Math.sin((i * 60) * Math.PI / 180) * 45 - 10,
                  opacity: [0, 1, 0.7],
                  scale: [0.5, 1.2, 1],
                }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                {rune}
              </motion.div>
            ))}
            {/* Dark energy wisps */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`wisp-${i}`}
                className="absolute w-3 h-8 rounded-full origin-bottom"
                style={{
                  background: `linear-gradient(to top, ${color}, transparent)`,
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  rotate: [i * 60, i * 60 + 30, i * 60],
                  scaleY: [0.5, 1.5, 0.5],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              />
            ))}
          </motion.div>
        );

      // Void Watcher - Timeline Terror: Eldritch tentacles with eyes
      case 'tentacle':
        return (
          <motion.div className="relative w-32 h-32">
            {/* Central void */}
            <motion.div
              className="absolute inset-8 rounded-full"
              style={{
                background: `radial-gradient(circle, #000 0%, ${color} 100%)`,
                boxShadow: `0 0 50px ${color}, inset 0 0 30px #000`,
              }}
              animate={{
                scale: [1, 0.8, 1.1, 1],
              }}
              transition={{ duration: 0.4 }}
            />
            {/* Multiple tentacles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 origin-bottom"
                style={{
                  height: 40 + Math.random() * 20,
                  background: `linear-gradient(to top, ${color}, #1e1b4b, transparent)`,
                  borderRadius: '50%',
                  left: '50%',
                  bottom: '50%',
                  boxShadow: `0 0 10px ${color}`,
                }}
                animate={{
                  rotate: [i * 60 - 30, i * 60 + 30, i * 60 - 30],
                  scaleY: [0.8, 1.2, 0.8],
                }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />
            ))}
            {/* Floating eyes */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`eye-${i}`}
                className="absolute rounded-full bg-white flex items-center justify-center"
                style={{
                  width: 12,
                  height: 12,
                  boxShadow: `0 0 10px ${color}`,
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: Math.cos((i * 90 + 45) * Math.PI / 180) * 40 - 6,
                  y: Math.sin((i * 90 + 45) * Math.PI / 180) * 40 - 6,
                  scale: [0, 1.2, 1],
                }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
              >
                <div className="w-2 h-2 rounded-full bg-red-600" />
              </motion.div>
            ))}
            {/* Reality distortion */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${color}`,
                borderStyle: 'dotted',
              }}
              animate={{
                rotate: [0, -360],
                scale: [1, 1.3, 1],
              }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        );

      // Dragon Lord - Destiny's Wrath: ULTIMATE dragon breath attack
      case 'dragonfire':
        return (
          <motion.div className="relative w-40 h-36">
            {/* Massive dragon head silhouette */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-16"
              style={{
                background: `linear-gradient(180deg, #fbbf24 0%, #f97316 50%, #000 100%)`,
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 40%, 85% 100%, 15% 100%, 0% 40%)',
                boxShadow: `0 0 30px #fbbf24`,
              }}
              animate={{ scale: [0.8, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              {/* Dragon eyes */}
              <div className="absolute w-2 h-2 rounded-full bg-red-500 left-[30%] top-[30%]" style={{ boxShadow: '0 0 10px #ff0000' }} />
              <div className="absolute w-2 h-2 rounded-full bg-red-500 left-[60%] top-[30%]" style={{ boxShadow: '0 0 10px #ff0000' }} />
            </motion.div>
            {/* Main breath cone - golden fire */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-24 origin-top"
              style={{
                background: `linear-gradient(180deg, #fbbf24 0%, #f97316 30%, #ef4444 60%, #7c2d12 90%, transparent 100%)`,
                clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
                boxShadow: `0 0 60px #fbbf24, 0 0 120px #f9731680`,
              }}
              animate={{
                scaleY: [0.5, 1.2, 1],
                scaleX: [0.8, 1.1, 1],
              }}
              transition={{ duration: 0.4 }}
            />
            {/* Inner white-hot core */}
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 origin-top"
              style={{
                background: `linear-gradient(180deg, #fff 0%, #fef08a 50%, transparent 100%)`,
                clipPath: 'polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)',
              }}
              animate={{
                scaleY: [0.3, 1, 0.8],
                opacity: [0.5, 1, 0.8],
              }}
              transition={{ duration: 0.35, delay: 0.05 }}
            />
            {/* Massive fire particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 4 + Math.random() * 8,
                  height: 4 + Math.random() * 8,
                  backgroundColor: ['#fbbf24', '#f97316', '#ef4444', '#fff'][Math.floor(Math.random() * 4)],
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 50}%`,
                  boxShadow: '0 0 10px currentColor',
                }}
                animate={{
                  y: [0, 40 + Math.random() * 40],
                  x: (Math.random() - 0.5) * 60,
                  opacity: [1, 0],
                  scale: [1, 0.5],
                }}
                transition={{ duration: 0.5, delay: i * 0.015 }}
              />
            ))}
            {/* Spiraling energy rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute left-1/2 rounded-full border-2"
                style={{
                  width: 30 + i * 15,
                  height: 15 + i * 8,
                  borderColor: '#fbbf24',
                  top: `${40 + i * 15}%`,
                  transform: 'translateX(-50%)',
                }}
                animate={{
                  scale: [0.5, 1.5],
                  opacity: [1, 0],
                  y: [0, 20],
                }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            ))}
          </motion.div>
        );

      default:
        // Default slash/strike - Enhanced version
        return (
          <motion.div className="relative w-20 h-20">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, #fff 0%, ${color} 40%, ${color}80 70%, transparent 100%)`,
                boxShadow: `0 0 30px ${color}, 0 0 60px ${color}50`,
              }}
              animate={{ scale: [0.5, 1.3, 1], rotate: [0, 180] }}
              transition={{ duration: 0.3 }}
            />
            {/* Impact lines */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-8 origin-bottom"
                style={{
                  background: `linear-gradient(to top, ${color}, transparent)`,
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 45}deg)`,
                }}
                animate={{
                  scaleY: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
              />
            ))}
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      className="absolute left-1/2 pointer-events-none z-30"
      initial={{ top: '25%', x: '-50%', scale: 0.3, opacity: 0 }}
      animate={{ top: '70%', x: '-50%', scale: 1, opacity: [0, 1, 1, 0.8] }}
      transition={{ duration: 0.5, ease: 'easeIn' }}
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

// Rage Mode Overlay - pulsing red vignette when boss is enraged
const RageModeOverlay = ({ active, intensity = 1 }) => {
  if (!active) return null;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 0.5, repeat: Infinity }}
    >
      {/* Red vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, transparent 30%, rgba(220, 38, 38, ${0.4 * intensity}) 100%)`,
        }}
      />
      {/* Pulsing border */}
      <div
        className="absolute inset-0 border-4 border-red-500/50"
        style={{
          boxShadow: 'inset 0 0 60px rgba(220, 38, 38, 0.4)',
        }}
      />
      {/* Floating rage particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-red-500 rounded-full"
          style={{
            left: `${10 + Math.random() * 80}%`,
            bottom: '0%',
          }}
          animate={{
            y: [0, -200 - Math.random() * 200],
            opacity: [0.8, 0],
            scale: [1, 0.3],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  );
};

// Rage Mode Warning - appears when boss enters rage
const RageModeWarning = ({ show, bossName }) => {
  if (!show) return null;

  return (
    <motion.div
      className="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-900/90 to-red-700/90 rounded-xl border-2 border-red-500"
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', duration: 0.5 }}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
        transition={{ duration: 0.5, repeat: 3 }}
      >
        <Flame className="w-6 h-6 text-orange-400" />
      </motion.div>
      <div className="text-center">
        <p className="text-red-300 text-xs font-medium uppercase tracking-wider">Rage Mode Activated!</p>
        <p className="text-white font-bold">{bossName} grows stronger!</p>
      </div>
      <motion.div
        animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: 3 }}
      >
        <AlertTriangle className="w-6 h-6 text-yellow-400" />
      </motion.div>
    </motion.div>
  );
};

// Boss Disintegration Effect - when boss is defeated
const BossDisintegration = ({ active, bossSprite, onComplete }) => {
  const containerRef = useRef(null);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) return;

    // Create disintegration particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 80,
      y: 40 + Math.random() * 80,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 0.5,
      angle: Math.random() * 360,
      distance: 50 + Math.random() * 100,
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-40">
      {/* Fading boss sprite */}
      <motion.img
        src={bossSprite}
        alt="Defeated boss"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 object-contain"
        style={{ imageRendering: 'pixelated' }}
        initial={{ opacity: 1, filter: 'brightness(1)' }}
        animate={{
          opacity: [1, 1, 0],
          filter: ['brightness(1)', 'brightness(3)', 'brightness(0)'],
          scale: [1, 1.1, 0.8],
        }}
        transition={{ duration: 1.5 }}
      />

      {/* Disintegration particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: p.size,
            height: p.size,
            background: 'linear-gradient(135deg, #ff6b6b, #ffa500, #ff0000)',
          }}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{
            x: Math.cos(p.angle * Math.PI / 180) * p.distance,
            y: Math.sin(p.angle * Math.PI / 180) * p.distance - 50,
            opacity: 0,
            scale: 0,
            rotate: p.angle * 2,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Central explosion flash */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,200,0,0.8) 0%, rgba(255,100,0,0.4) 40%, transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2, 3], opacity: [1, 0.6, 0] }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
};

// Epic Victory Celebration Overlay
const VictoryCelebration = ({ active }) => {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-45">
      {/* Golden rays */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 w-2 h-40 origin-bottom"
          style={{
            background: 'linear-gradient(to top, rgba(251,191,36,0.6), transparent)',
            transform: `rotate(${(360 / 12) * i}deg)`,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.5, delay: 0.3 + i * 0.05 }}
        />
      ))}

      {/* Floating coins/stars */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${60 + Math.random() * 30}%`,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: -300 - Math.random() * 200,
            opacity: [0, 1, 1, 0],
            rotate: [0, 360],
          }}
          transition={{ duration: 2 + Math.random(), delay: i * 0.1 }}
        >
          {i % 3 === 0 ? '⭐' : i % 3 === 1 ? '🪙' : '✨'}
        </motion.div>
      ))}
    </div>
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

// Victory/Defeat overlay - Enhanced with epic effects
const BattleResultOverlay = ({ isVictory, rewards, boss, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 overflow-hidden"
  >
    {/* Background particles for victory */}
    {isVictory && (
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    )}

    {/* Rotating light rays for victory */}
    {isVictory && (
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-1 h-96 origin-bottom opacity-20"
            style={{
              background: 'linear-gradient(to top, rgba(251,191,36,0.5), transparent)',
              transform: `rotate(${(360 / 8) * i}deg) translateY(-50%)`,
            }}
          />
        ))}
      </motion.div>
    )}

    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
      className="text-center p-8 max-w-sm relative"
    >
      {isVictory ? (
        <>
          {/* Glowing backdrop */}
          <div className="absolute inset-0 -z-10">
            <motion.div
              className="absolute left-1/2 top-1/4 -translate-x-1/2 w-64 h-64 rounded-full bg-yellow-400/20 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Trophy with sparkles */}
          <motion.div
            className="relative"
            animate={{ rotate: [0, -5, 5, -5, 5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 text-yellow-300"
                  style={{
                    transform: `rotate(${(360 / 6) * i}deg) translateY(-60px)`,
                  }}
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                >
                  ✦
                </motion.div>
              ))}
            </motion.div>
            <Trophy className="w-32 h-32 mx-auto text-yellow-400 mb-4 drop-shadow-[0_0_40px_rgba(250,204,21,0.8)]" />
          </motion.div>

          <motion.h2
            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 mb-2 drop-shadow-lg"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            VICTORY!
          </motion.h2>
          <p className="text-white/70 mb-6 text-lg">{boss?.name} has been vanquished!</p>

          <motion.div
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 mb-6 border-2 border-yellow-500/40 backdrop-blur-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-bold text-yellow-300 mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Rewards Earned
              <Sparkles className="w-5 h-5" />
            </h3>
            <div className="flex justify-center gap-10">
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', bounce: 0.5 }}
              >
                <div className="flex items-center justify-center gap-2 text-purple-400">
                  <Star className="w-7 h-7" />
                  <span className="text-4xl font-black">+{rewards?.xp || 0}</span>
                </div>
                <span className="text-sm text-white/60">Experience</span>
              </motion.div>
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: 'spring', bounce: 0.5 }}
              >
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Zap className="w-7 h-7" />
                  <span className="text-4xl font-black">+{rewards?.credits || 0}</span>
                </div>
                <span className="text-sm text-white/60">Credits</span>
              </motion.div>
            </div>
          </motion.div>
        </>
      ) : (
        <>
          {/* Red glow for defeat */}
          <div className="absolute inset-0 -z-10">
            <motion.div
              className="absolute left-1/2 top-1/4 -translate-x-1/2 w-48 h-48 rounded-full bg-red-500/20 blur-3xl"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Skull className="w-32 h-32 mx-auto text-red-500 mb-4 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]" />
          </motion.div>
          <h2 className="text-6xl font-black text-red-500 mb-2 drop-shadow-lg">DEFEAT</h2>
          <p className="text-white/70 mb-4 text-lg">{boss?.name} was too powerful...</p>
          <p className="text-white/50 text-sm mb-2">Don't give up! Train harder and return stronger.</p>
          <div className="flex items-center justify-center gap-2 text-red-400/60 text-xs">
            <Heart className="w-4 h-4" />
            <span>Your progress is still saved</span>
          </div>
        </>
      )}

      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(168,85,247,0.5)' }}
        whileTap={{ scale: 0.95 }}
        className={`mt-6 px-12 py-4 rounded-2xl font-bold text-white text-lg shadow-xl transition-all ${
          isVictory
            ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 shadow-amber-500/30'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-500/30'
        }`}
      >
        {isVictory ? 'Claim Victory' : 'Try Again'}
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

  // Elemental Ability Store
  const {
    equippedAbilities,
    useAbility: useElementalAbility,
    isAbilityReady: isElementalAbilityReady,
    getCooldownProgress: getElementalCooldownProgress,
    getEquippedAbility,
    resetCooldowns: resetElementalCooldowns,
  } = useElementalAbilityStore();

  const [damageNumbers, setDamageNumbers] = useState([]);
  const [attackEffects, setAttackEffects] = useState([]);
  const [battleResult, setBattleResult] = useState(null);
  const [isCountdown, setIsCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [battleEnded, setBattleEnded] = useState(false);
  const [cooldownProgress, setCooldownProgress] = useState(1);
  const [isAttackReady, setIsAttackReady] = useState(true);

  // Ability system state
  const [abilityLastUsed, setAbilityLastUsed] = useState(0);
  const [isAbilityAnimating, setIsAbilityAnimating] = useState(false);
  const [activeAbilityAnimation, setActiveAbilityAnimation] = useState(null);

  // Elemental ability cooldown state (for real-time UI updates)
  const [elementalCooldowns, setElementalCooldowns] = useState([1, 1]); // progress 0-1 for each slot

  // Anime.js projectile and impact states
  const [playerProjectiles, setPlayerProjectiles] = useState([]);
  const [bossProjectiles, setBossProjectiles] = useState([]);
  const [impactEffects, setImpactEffects] = useState([]);

  // Epic battle effects state
  const [isRageMode, setIsRageMode] = useState(false);
  const [showRageWarning, setShowRageWarning] = useState(false);
  const [showBossDisintegration, setShowBossDisintegration] = useState(false);
  const [showVictoryCelebration, setShowVictoryCelebration] = useState(false);
  const [showVictoryConfetti, setShowVictoryConfetti] = useState(false);
  const [showVictoryFireworks, setShowVictoryFireworks] = useState(false);
  const [showVictoryFlash, setShowVictoryFlash] = useState(false);

  const bossRef = useRef(null);
  const battleIntervalRef = useRef(null);
  const cooldownIntervalRef = useRef(null);
  const damageIdRef = useRef(0);
  const effectIdRef = useRef(0);
  const projectileIdRef = useRef(0);
  const arenaRef = useRef(null);
  const particleContainerRef = useRef(null);
  const combatCanvasRef = useRef(null);

  // Initialize anime.js hooks
  const triggerShake = useScreenShake(arenaRef);
  const burstParticles = useParticleBurst(particleContainerRef);

  const boss = BOSS_DATABASE[bossId];
  const difficulty = BOSS_DIFFICULTY[boss?.difficulty] || BOSS_DIFFICULTY.normal;
  const currentWeapon = weaponAttack || WEAPON_ATTACKS.unarmed;

  // Get the ability for the equipped weapon
  const equippedWeaponId = equipped?.mainHand;
  const weaponAbility = equippedWeaponId ? getWeaponAbility(equippedWeaponId) : null;
  const canUseAbility = weaponAbility && isAbilityReady(abilityLastUsed, weaponAbility.cooldown) && !isAbilityAnimating;

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
      // Calculate positions based on screen dimensions
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const centerX = screenWidth / 2;

      // Boss is at ~20% from top, player at ~80% from top
      const bossY = screenHeight * 0.18;
      const playerY = screenHeight * 0.78;

      // Use PixiJS createBossProjectile for spectacular effects
      const colorHex = parseInt((boss?.attackColor || '#ff0000').replace('#', ''), 16);

      if (combatCanvasRef.current) {
        // Play boss-specific attack sound
        playBossAttack(boss?.attackAnimation || 'default');

        combatCanvasRef.current.createBossProjectile(centerX, bossY, centerX, playerY, {
          color: colorHex,
          size: 35,
          speed: 14,
          attackType: boss?.attackAnimation || 'default',
          onImpact: () => {
            // Apply damage when projectile hits
            bossAttack();

            // Show damage number on player side
            const id = damageIdRef.current++;
            setDamageNumbers(prev => [...prev, {
              id,
              damage: currentBattle?.boss?.damage || boss?.damage || 0,
              position: { x: '30%', y: '70%' },
              isPlayer: true,
              attackName: boss?.attackName || 'Attack',
            }]);

            setTimeout(() => {
              setDamageNumbers(prev => prev.filter(d => d.id !== id));
            }, 800);
          }
        });
      } else {
        // Fallback to old system if canvas not ready
        const projId = projectileIdRef.current++;
        setBossProjectiles(prev => [...prev, {
          id: projId,
          boss,
          startY: 150,
          endY: 450,
        }]);

        setTimeout(() => {
          bossAttack();
          playBossAttack(boss?.attackAnimation || 'default');
          setBossProjectiles(prev => prev.filter(p => p.id !== projId));
          triggerShake('normal');

          const id = damageIdRef.current++;
          setDamageNumbers(prev => [...prev, {
            id,
            damage: currentBattle?.boss?.damage || boss?.damage || 0,
            position: { x: '30%', y: '70%' },
            isPlayer: true,
            attackName: boss?.attackName || 'Attack',
          }]);

          setTimeout(() => {
            setDamageNumbers(prev => prev.filter(d => d.id !== id));
          }, 800);
        }, 350);
      }
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
      // Weapon cooldown
      const progress = getCooldownProgress();
      const ready = canAttack();
      setCooldownProgress(progress);
      setIsAttackReady(ready);

      // Elemental ability cooldowns
      const newElementalCooldowns = equippedAbilities.map((_, slot) => {
        return getElementalCooldownProgress(slot);
      });
      setElementalCooldowns(newElementalCooldowns);
    }, 50);

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [isBattleActive, isCountdown, battleEnded, getCooldownProgress, canAttack, equippedAbilities, getElementalCooldownProgress]);

  // Check for rage mode (boss below 30% health)
  useEffect(() => {
    if (!currentBattle || battleEnded) return;

    const healthPercent = currentBattle.bossCurrentHealth / currentBattle.bossMaxHealth;

    // Trigger rage mode at 30% health
    if (healthPercent <= 0.3 && healthPercent > 0 && !isRageMode) {
      setIsRageMode(true);
      setShowRageWarning(true);

      // Heavy screen shake when entering rage
      triggerShake('heavy');

      // Flash the screen red
      setTimeout(() => setShowRageWarning(false), 3000);
    }
  }, [currentBattle, battleEnded, isRageMode, triggerShake]);

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

      if (isVictory) {
        // Epic victory sequence
        // 1. Screen flash
        setShowVictoryFlash(true);

        // 2. Boss disintegration
        setTimeout(() => setShowBossDisintegration(true), 200);

        // 3. Victory celebration
        setTimeout(() => {
          setShowVictoryCelebration(true);
          setShowVictoryConfetti(true);
        }, 800);

        // 4. Fireworks
        setTimeout(() => setShowVictoryFireworks(true), 1200);

        // 5. Heavy screen shake
        triggerShake('crit');

        // 6. Show result after animations
        setTimeout(async () => {
          const result = await endBattle('victory');

          setBattleResult({
            isVictory: true,
            rewards: {
              xp: currentBattle.boss.xpReward,
              credits: currentBattle.boss.creditsReward,
            },
          });
        }, 2000);
      } else {
        // Defeat sequence
        triggerShake('heavy');

        const result = await endBattle('defeat');

        setBattleResult({
          isVictory: false,
          rewards: null,
        });
      }
    };

    if (currentBattle.bossCurrentHealth <= 0) {
      handleBattleEnd(true);
    } else if (currentBattle.playerCurrentHealth <= 0) {
      handleBattleEnd(false);
    }
  }, [currentBattle, battleEnded, endBattle, triggerShake]);

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
    const element = currentWeapon?.element || 'physical';
    const attackType = currentWeapon?.animation || 'slash';

    // Calculate boss position for PixiJS effects
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const bossX = screenWidth / 2;
    const bossY = screenHeight * 0.22; // Slightly lower than attack origin

    // Use PixiJS for spectacular weapon attack effects
    if (combatCanvasRef.current) {
      combatCanvasRef.current.playWeaponAttack({
        element,
        attackType,
        targetX: bossX,
        targetY: bossY,
      });

      // Show damage number on boss
      const id = damageIdRef.current++;
      const randomX = 40 + Math.random() * 80;
      const randomY = 40 + Math.random() * 80;

      setTimeout(() => {
        setDamageNumbers(prev => [...prev, {
          id,
          damage,
          position: { x: `${randomX}px`, y: `${randomY}px` },
          isPlayer: false,
          isCrit,
          color,
        }]);

        setTimeout(() => {
          setDamageNumbers(prev => prev.filter(d => d.id !== id));
        }, isCrit ? 1000 : 600);
      }, 150);
    } else {
      // Fallback to anime.js projectiles
      const projId = projectileIdRef.current++;
      setPlayerProjectiles(prev => [...prev, {
        id: projId,
        startX: 150,
        startY: 480,
        endX: 200,
        endY: 180,
        color,
        trailColor,
        isMagic,
        isCrit,
      }]);

      setTimeout(() => {
        setPlayerProjectiles(prev => prev.filter(p => p.id !== projId));
        triggerShake(isCrit ? 'crit' : 'light');
        burstParticles(200, 200, {
          colors: isCrit ? ['#fbbf24', '#ffffff', color] : [color, trailColor, '#ffffff'],
          count: isCrit ? 20 : 10,
          spread: isCrit ? 180 : 100,
          size: isCrit ? 8 : 5,
        });

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

        setTimeout(() => {
          setDamageNumbers(prev => prev.filter(d => d.id !== id));
        }, isCrit ? 1000 : 600);
      }, 250);
    }
  }, [isBattleActive, isCountdown, battleResult, battleEnded, isAttackReady, playerAttack, currentBattle, lastAttackResult, currentWeapon, triggerShake, burstParticles]);

  // Handle ability use
  const handleAbility = useCallback(() => {
    if (!isBattleActive || isCountdown || battleResult || battleEnded || !canUseAbility || !weaponAbility) return;

    // Set ability as used
    setAbilityLastUsed(Date.now());
    setIsAbilityAnimating(true);

    // Calculate ability damage
    const baseDamage = currentBattle?.playerDamage || 10;
    const abilityDamage = calculateAbilityDamage(baseDamage, weaponAbility);

    // Calculate boss position for PixiJS effects
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const bossX = screenWidth / 2;
    const bossY = screenHeight * 0.22;

    // Use PixiJS for spectacular ability effects
    if (combatCanvasRef.current && weaponAbility.abilityId) {
      combatCanvasRef.current.playAbility(weaponAbility.abilityId, bossX, bossY);
    } else {
      // Fallback to old animation system
      setActiveAbilityAnimation({
        ability: weaponAbility,
        position: { x: 200, y: 200 },
      });
    }

    // Play ability sound (if available)
    if (sounds.powerAttack) {
      sounds.powerAttack();
    } else {
      sounds.attackHit();
    }

    // Apply damage after animation duration
    setTimeout(() => {
      // Show damage number
      const id = damageIdRef.current++;
      setDamageNumbers(prev => [...prev, {
        id,
        damage: abilityDamage,
        position: { x: '60px', y: '60px' },
        isPlayer: false,
        isCrit: true,
        color: weaponAbility.color,
      }]);

      // Apply damage to boss
      const attacksNeeded = Math.ceil(weaponAbility.damage);
      for (let i = 0; i < attacksNeeded; i++) {
        playerAttack();
      }

      // Clean up
      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(d => d.id !== id));
        setActiveAbilityAnimation(null);
        setIsAbilityAnimating(false);
      }, 1000);
    }, weaponAbility.duration || 600);
  }, [isBattleActive, isCountdown, battleResult, battleEnded, canUseAbility, weaponAbility, currentBattle, playerAttack]);

  // Handle elemental ability use
  const handleElementalAbility = useCallback((slot) => {
    if (!isBattleActive || isCountdown || battleResult || battleEnded) return;

    // Check if ability is ready
    if (!isElementalAbilityReady(slot)) return;

    // Use the ability (starts cooldown)
    const ability = useElementalAbility(slot);
    if (!ability) return;

    // Calculate boss position for PixiJS effects
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const bossX = screenWidth / 2;
    const bossY = screenHeight * 0.22;

    // Play PixiJS effect
    if (combatCanvasRef.current) {
      combatCanvasRef.current.playAbility(ability.id, bossX, bossY);
    }

    // Play sound
    if (sounds.powerAttack) {
      sounds.powerAttack();
    } else {
      sounds.attackHit();
    }

    // Calculate and apply damage
    const baseDamage = currentBattle?.playerDamage || 10;
    const abilityDamage = calcElementalDamage(ability, baseDamage);

    // Apply damage after animation
    setTimeout(() => {
      // Show damage number
      const id = damageIdRef.current++;
      setDamageNumbers(prev => [...prev, {
        id,
        damage: abilityDamage,
        position: { x: '60px', y: '60px' },
        isPlayer: false,
        isCrit: true,
        color: ability.elementColor || ability.color,
      }]);

      // Screen shake
      triggerShake(ability.damage >= 4.0 ? 'heavy' : 'normal');

      // Apply damage to boss
      const attacksNeeded = Math.ceil(ability.damage);
      for (let i = 0; i < attacksNeeded; i++) {
        playerAttack();
      }

      // Clean up damage number
      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(d => d.id !== id));
      }, 1000);
    }, 400);
  }, [isBattleActive, isCountdown, battleResult, battleEnded, isElementalAbilityReady, useElementalAbility, currentBattle, playerAttack, triggerShake]);

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

      {/* PixiJS Combat Canvas for spectacular effects - must be above all battle content */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 200 }}>
        <CombatCanvas
          ref={combatCanvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          className="w-full h-full"
        />
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />

      {/* Rage Mode Overlay - pulsing red when boss is enraged */}
      <RageModeOverlay active={isRageMode && !battleEnded} intensity={1} />

      {/* Rage Mode Warning */}
      <AnimatePresence>
        {showRageWarning && (
          <RageModeWarning show={showRageWarning} bossName={boss?.name} />
        )}
      </AnimatePresence>

      {/* Victory Effects */}
      <ScreenFlash active={showVictoryFlash} color="#fbbf24" intensity={0.5} />
      <VictoryCelebration active={showVictoryCelebration} />
      <Confetti active={showVictoryConfetti} particleCount={100} intensity="epic" duration={4000} />
      <Fireworks active={showVictoryFireworks} burstCount={8} duration={3000} />

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
        <div className="h-full flex flex-col p-4 max-w-lg mx-auto relative overflow-hidden">
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
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center relative pt-4 overflow-hidden">
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
              {/* Boss Disintegration Effect */}
              {showBossDisintegration && (
                <BossDisintegration
                  active={showBossDisintegration}
                  bossSprite={boss?.sprite}
                  onComplete={() => setShowBossDisintegration(false)}
                />
              )}

              {/* Boss sprite - hidden when disintegrating */}
              {!showBossDisintegration && (
                <motion.div
                  animate={!battleResult ? {
                    y: [0, -8, 0],
                    // Rage mode: faster bounce, red glow
                    ...(isRageMode && !battleEnded ? {
                      scale: [1, 1.05, 1],
                    } : {}),
                  } : {}}
                  transition={{
                    duration: isRageMode ? 0.8 : 1.5,
                    repeat: Infinity,
                  }}
                >
                  <img
                    src={boss?.sprite}
                    alt={boss?.name}
                    className={`w-40 h-40 sm:w-52 sm:h-52 object-contain ${
                      isRageMode && !battleEnded
                        ? 'drop-shadow-[0_0_40px_rgba(255,0,0,0.6)]'
                        : 'drop-shadow-[0_0_30px_rgba(255,0,0,0.3)]'
                    }`}
                    style={{
                      imageRendering: 'pixelated',
                      filter: isRageMode && !battleEnded ? 'brightness(1.2) saturate(1.3)' : undefined,
                    }}
                    onError={(e) => {
                      e.target.src = '/assets/icons/placeholder.png';
                    }}
                  />
                  {/* Rage aura effect */}
                  {isRageMode && !battleEnded && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle, transparent 40%, rgba(255,0,0,0.3) 100%)',
                      }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              )}

              {/* Attack effects */}
              <AnimatePresence>
                {attackEffects.map(effect => (
                  <AttackEffect key={effect.id} attackResult={effect} position={effect.position} />
                ))}
              </AnimatePresence>

              {/* Ability Animation */}
              <AnimatePresence>
                {activeAbilityAnimation && (
                  <AbilityAnimation
                    ability={activeAbilityAnimation.ability}
                    position={activeAbilityAnimation.position}
                    containerRef={arenaRef}
                    onComplete={() => setActiveAbilityAnimation(null)}
                  />
                )}
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
          </div>

          {/* Battle Controls - Fixed height section between boss and player */}
          {isBattleActive && !battleResult && (
            <div className="flex-shrink-0 py-2">
              {/* Attack and Ability Buttons */}
              <div className="flex gap-3 justify-center">
                {/* Attack Button */}
                <motion.button
                  onClick={handleAttack}
                  disabled={!isAttackReady}
                  whileHover={isAttackReady ? { scale: 1.05 } : {}}
                  whileTap={isAttackReady ? { scale: 0.95 } : {}}
                  className={`px-6 py-3 rounded-2xl font-bold text-base transition-all ${
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

                {/* Ability Button (if weapon has ability) */}
                {weaponAbility && (
                  <motion.button
                    onClick={handleAbility}
                    disabled={!canUseAbility}
                    whileHover={canUseAbility ? { scale: 1.05 } : {}}
                    whileTap={canUseAbility ? { scale: 0.95 } : {}}
                    className={`px-6 py-3 rounded-2xl font-bold text-base transition-all ${
                      canUseAbility
                        ? 'text-white shadow-lg cursor-pointer'
                        : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                    }`}
                    style={{
                      touchAction: 'manipulation',
                      background: canUseAbility
                        ? `linear-gradient(135deg, ${weaponAbility.color}, ${weaponAbility.trailColor || weaponAbility.color})`
                        : undefined,
                      borderColor: canUseAbility ? weaponAbility.color : 'transparent',
                      borderWidth: '2px',
                      boxShadow: canUseAbility ? `0 0 25px ${weaponAbility.color}60` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      <span>{weaponAbility.name}</span>
                    </div>
                  </motion.button>
                )}
              </div>

              {/* Elemental Ability Slots */}
              {equippedAbilities.some(a => a !== null) && (
                <div className="flex gap-2 justify-center mt-2">
                  {equippedAbilities.map((abilityId, slot) => {
                    if (!abilityId) return null;
                    const ability = getEquippedAbility(slot);
                    if (!ability) return null;

                    // Use state-tracked progress for real-time updates
                    const progress = elementalCooldowns[slot] ?? 1;
                    const isReady = progress >= 1;

                    return (
                      <motion.button
                        key={slot}
                        onClick={() => handleElementalAbility(slot)}
                        disabled={!isReady}
                        whileHover={isReady ? { scale: 1.05 } : {}}
                        whileTap={isReady ? { scale: 0.95 } : {}}
                        className="relative p-2 rounded-xl transition-all"
                        style={{
                          touchAction: 'manipulation',
                          background: isReady
                            ? `linear-gradient(135deg, ${ability.elementColor}cc, ${ability.elementColor}66)`
                            : 'rgba(55, 65, 81, 0.5)',
                          borderColor: isReady ? ability.elementColor : 'transparent',
                          borderWidth: '2px',
                          boxShadow: isReady ? `0 0 15px ${ability.elementColor}60` : 'none',
                          minWidth: '60px',
                        }}
                      >
                        {/* Cooldown overlay */}
                        {!isReady && (
                          <div
                            className="absolute inset-0 rounded-xl overflow-hidden"
                            style={{
                              background: `linear-gradient(to top, transparent ${progress * 100}%, rgba(0,0,0,0.6) ${progress * 100}%)`,
                            }}
                          />
                        )}
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xl">{ability.icon}</span>
                          <span className={`text-xs font-bold ${isReady ? 'text-white' : 'text-gray-400'}`}>
                            {ability.name.split(' ')[0]}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Cooldown indicators */}
              <div className="w-full max-w-xs mx-auto mt-2">
                <CooldownIndicator
                  progress={cooldownProgress}
                  weaponAttack={currentWeapon}
                  canAttack={isAttackReady}
                />
                {weaponAbility && (
                  <AbilityCooldownIndicator
                    ability={weaponAbility}
                    lastUsedTime={abilityLastUsed}
                    canUse={canUseAbility}
                  />
                )}
              </div>

              {/* Status text */}
              <motion.p
                animate={isAttackReady ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.4 }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className={`mt-1 text-xs font-medium text-center ${isAttackReady ? 'text-green-400' : 'text-white/40'}`}
              >
                {isAttackReady
                  ? 'READY!'
                  : `Cooldown: ${Math.ceil((1 - cooldownProgress) * (currentWeapon?.cooldown || 500))}ms`}
              </motion.p>
            </div>
          )}

          {/* Divider */}
          <div className="flex-shrink-0 flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <Swords className="w-6 h-6 text-white/40" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          {/* Player section */}
          <div className="flex-shrink-0 flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm relative">
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
