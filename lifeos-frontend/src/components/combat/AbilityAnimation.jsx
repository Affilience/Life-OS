/**
 * AbilityAnimation Component
 * Renders weapon ability animations for PvP and Boss battles
 * Uses anime.js for smooth, performant animations
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animate, stagger } from 'animejs';
import { ABILITY_TYPES, ABILITY_ANIMATIONS, SHAKE_INTENSITIES } from '../../data/weaponAbilities';

// Create particles for various effects
const createParticle = (container, x, y, options = {}) => {
  const {
    size = 6,
    color = '#ffffff',
    shape = 'circle',
    glow = true,
  } = options;

  const particle = document.createElement('div');
  particle.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    background: ${color};
    ${shape === 'circle' ? 'border-radius: 50%;' : 'transform: rotate(45deg);'}
    pointer-events: none;
    left: ${x}px;
    top: ${y}px;
    z-index: 100;
    ${glow ? `box-shadow: 0 0 ${size * 2}px ${color};` : ''}
  `;
  container.appendChild(particle);
  return particle;
};

// Slash Arc Animation
const SlashArcEffect = ({ ability, position, onComplete }) => {
  const containerRef = useRef(null);
  const slashRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !slashRef.current) return;

    const config = ABILITY_ANIMATIONS[ability.animation];
    const { color, trailColor, particleCount } = ability;

    // Create trail particles
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (180 / particleCount) * i - 90;
      const rad = angle * Math.PI / 180;
      const distance = 80 + Math.random() * 40;
      const px = Math.cos(rad) * distance;
      const py = Math.sin(rad) * distance;

      const particle = createParticle(containerRef.current, 128 + px, 128 + py, {
        size: 4 + Math.random() * 4,
        color: i % 2 === 0 ? color : trailColor,
      });
      particles.push(particle);
    }

    // Animate particles outward
    animate(particles, {
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      translateX: (el, i) => Math.cos((180 / particleCount * i - 90) * Math.PI / 180) * 60,
      translateY: (el, i) => Math.sin((180 / particleCount * i - 90) * Math.PI / 180) * 60,
      duration: ability.duration,
      easing: 'easeOutExpo',
      delay: stagger(20),
      complete: () => particles.forEach(p => p.remove()),
    });

    // Animate main slash
    animate(slashRef.current, {
      rotate: [-90, 90],
      scale: [0.5, 1.3, 1],
      opacity: [0, 1, 0],
      duration: ability.duration,
      easing: 'easeOutQuad',
      complete: onComplete,
    });
  }, [ability, onComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ left: position?.x, top: position?.y }}
    >
      <div
        ref={slashRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 200,
          height: 20,
          background: `linear-gradient(90deg, transparent, ${ability.color}, ${ability.trailColor}, transparent)`,
          borderRadius: 10,
          boxShadow: `0 0 30px ${ability.color}`,
        }}
      />
    </div>
  );
};

// Multi-Slash (Blade Dance) Animation
const MultiSlashEffect = ({ ability, position, onComplete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { color, trailColor, duration } = ability;
    const config = ABILITY_ANIMATIONS[ability.animation];
    const hitCount = config?.hitCount || 4;
    const hitDelay = config?.hitDelay || 150;

    const slashes = [];
    for (let i = 0; i < hitCount; i++) {
      const slash = document.createElement('div');
      const angle = (i % 2 === 0 ? -45 : 45) + (i * 10);
      slash.style.cssText = `
        position: absolute;
        width: 160px;
        height: 8px;
        background: linear-gradient(90deg, transparent, ${color}, ${trailColor}, transparent);
        border-radius: 4px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) rotate(${angle}deg);
        opacity: 0;
        box-shadow: 0 0 20px ${color};
      `;
      containerRef.current.appendChild(slash);
      slashes.push(slash);
    }

    slashes.forEach((slash, i) => {
      setTimeout(() => {
        animate(slash, {
          opacity: [0, 1, 0],
          scale: [0.8, 1.2, 1],
          duration: 200,
          easing: 'easeOutQuad',
          complete: () => {
            slash.remove();
            if (i === slashes.length - 1) onComplete?.();
          },
        });
      }, i * hitDelay);
    });
  }, [ability, onComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ left: position?.x, top: position?.y }}
    />
  );
};

// Blink Strike (Shadow Strike) Animation
const BlinkStrikeEffect = ({ ability, position, onComplete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { color, trailColor, duration } = ability;

    // Create afterimages
    const afterimages = [];
    for (let i = 0; i < 3; i++) {
      const ghost = document.createElement('div');
      ghost.style.cssText = `
        position: absolute;
        width: 60px;
        height: 60px;
        background: radial-gradient(circle, ${color}60 0%, transparent 70%);
        border-radius: 50%;
        left: ${50 - i * 20}%;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0;
      `;
      containerRef.current.appendChild(ghost);
      afterimages.push(ghost);
    }

    // Animate afterimages
    animate(afterimages, {
      opacity: [0, 0.6 - afterimages.indexOf(afterimages[0]) * 0.2, 0],
      scale: [1, 1.2, 0.8],
      duration: 400,
      delay: stagger(100),
      easing: 'easeOutQuad',
    });

    // Create strike effect
    setTimeout(() => {
      const strike = document.createElement('div');
      strike.style.cssText = `
        position: absolute;
        width: 100px;
        height: 100px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, ${trailColor} 0%, ${color}40 50%, transparent 70%);
        border-radius: 50%;
        opacity: 0;
      `;
      containerRef.current.appendChild(strike);

      animate(strike, {
        opacity: [0, 1, 0],
        scale: [0.5, 2],
        duration: 300,
        easing: 'easeOutExpo',
        complete: () => {
          strike.remove();
          afterimages.forEach(a => a.remove());
          onComplete?.();
        },
      });
    }, 300);
  }, [ability, onComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ left: position?.x, top: position?.y }}
    />
  );
};

// Ground Slam (Earthshatter) Animation
const GroundSlamEffect = ({ ability, position, onComplete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { color, trailColor, particleCount, duration } = ability;
    const config = ABILITY_ANIMATIONS[ability.animation];

    // Create falling hammer/weapon
    const weapon = document.createElement('div');
    weapon.style.cssText = `
      position: absolute;
      width: 40px;
      height: 60px;
      background: linear-gradient(180deg, ${color}, ${trailColor});
      border-radius: 8px 8px 2px 2px;
      left: 50%;
      top: -100px;
      transform: translateX(-50%);
      box-shadow: 0 0 30px ${color};
    `;
    containerRef.current.appendChild(weapon);

    // Animate fall
    animate(weapon, {
      translateY: [0, 200],
      rotate: [0, -20, 10, 0],
      duration: 400,
      easing: 'easeInQuad',
      complete: () => {
        weapon.remove();

        // Create shockwave rings
        const rings = [];
        for (let i = 0; i < 3; i++) {
          const ring = document.createElement('div');
          ring.style.cssText = `
            position: absolute;
            width: 40px;
            height: 40px;
            border: 4px solid ${i === 0 ? color : trailColor};
            border-radius: 50%;
            left: 50%;
            top: 60%;
            transform: translate(-50%, -50%);
            opacity: 0;
          `;
          containerRef.current.appendChild(ring);
          rings.push(ring);
        }

        // Animate shockwaves
        rings.forEach((ring, i) => {
          setTimeout(() => {
            animate(ring, {
              scale: [1, 4 + i],
              opacity: [1 - i * 0.3, 0],
              duration: 400,
              easing: 'easeOutQuad',
              complete: () => ring.remove(),
            });
          }, i * 100);
        });

        // Create ground crack particles
        const cracks = [];
        for (let i = 0; i < 8; i++) {
          const crack = document.createElement('div');
          const angle = (360 / 8) * i;
          crack.style.cssText = `
            position: absolute;
            width: 4px;
            height: 60px;
            background: linear-gradient(180deg, ${trailColor}, transparent);
            left: 50%;
            top: 60%;
            transform-origin: top center;
            transform: translateX(-50%) rotate(${angle}deg);
            opacity: 0;
          `;
          containerRef.current.appendChild(crack);
          cracks.push(crack);
        }

        animate(cracks, {
          opacity: [0, 1, 0.5],
          scaleY: [0, 1],
          duration: 500,
          delay: stagger(30),
          easing: 'easeOutQuad',
          complete: () => {
            cracks.forEach(c => c.remove());
            onComplete?.();
          },
        });
      },
    });
  }, [ability, onComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ left: position?.x, top: position?.y }}
    />
  );
};

// Nova Burst (Arcane Nova) Animation
const NovaBurstEffect = ({ ability, position, onComplete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { color, trailColor, particleCount, duration } = ability;

    // Create central glow
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: absolute;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, ${color} 0%, ${trailColor}80 50%, transparent 70%);
      border-radius: 50%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 40px ${color};
    `;
    containerRef.current.appendChild(glow);

    // Animate glow expansion
    animate(glow, {
      scale: [0.1, 1, 3],
      opacity: [0, 1, 0],
      duration: duration,
      easing: 'easeOutExpo',
    });

    // Create nova rings
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.style.cssText = `
        position: absolute;
        width: 80px;
        height: 80px;
        border: 3px solid ${i % 2 === 0 ? color : trailColor};
        border-radius: 50%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
      `;
      containerRef.current.appendChild(ring);
      rings.push(ring);
    }

    rings.forEach((ring, i) => {
      setTimeout(() => {
        animate(ring, {
          scale: [0.5, 3],
          opacity: [1, 0],
          duration: 400,
          easing: 'easeOutQuad',
          complete: () => ring.remove(),
        });
      }, i * 100);
    });

    // Create particles
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (360 / particleCount) * i;
      const rad = angle * Math.PI / 180;
      const particle = createParticle(containerRef.current, 128, 128, {
        size: 5 + Math.random() * 5,
        color: i % 3 === 0 ? color : trailColor,
      });
      particles.push({ el: particle, angle: rad });
    }

    animate(particles.map(p => p.el), {
      translateX: (el, i) => Math.cos(particles[i].angle) * 150,
      translateY: (el, i) => Math.sin(particles[i].angle) * 150,
      scale: [1, 0],
      opacity: [1, 0],
      duration: duration,
      delay: stagger(10),
      easing: 'easeOutQuad',
      complete: () => {
        particles.forEach(p => p.el.remove());
        glow.remove();
        onComplete?.();
      },
    });
  }, [ability, onComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ left: position?.x, top: position?.y }}
    />
  );
};

// Chain Lightning Animation
const ChainLightningEffect = ({ ability, position, onComplete }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { color, trailColor, duration } = ability;
    const config = ABILITY_ANIMATIONS[ability.animation];
    const bounces = config?.bounces || 3;

    let frame = 0;
    const maxFrames = Math.floor(duration / 16);

    const drawLightning = (startX, startY, endX, endY, segments = 8) => {
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      const dx = (endX - startX) / segments;
      const dy = (endY - startY) / segments;

      for (let i = 1; i < segments; i++) {
        const jitterX = (Math.random() - 0.5) * 30;
        const jitterY = (Math.random() - 0.5) * 30;
        ctx.lineTo(startX + dx * i + jitterX, startY + dy * i + jitterY);
      }
      ctx.lineTo(endX, endY);

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;
      ctx.stroke();

      // Inner glow
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const animateFn = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (frame < maxFrames) {
        // Draw main bolt
        drawLightning(64, 200, 192, 80);

        // Draw bounces
        if (frame > maxFrames / 3) {
          drawLightning(192, 80, 256, 120);
        }
        if (frame > (maxFrames * 2) / 3) {
          drawLightning(256, 120, 200, 160);
        }

        frame++;
        requestAnimationFrame(animateFn);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete?.();
      }
    };

    animateFn();
  }, [ability, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={256}
      className="absolute inset-0 pointer-events-none"
      style={{ left: position?.x, top: position?.y }}
    />
  );
};

// Meteor Animation
const MeteorEffect = ({ ability, position, onComplete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { color, trailColor, particleCount, duration } = ability;
    const config = ABILITY_ANIMATIONS[ability.animation];

    // Warning circle
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: absolute;
      width: 120px;
      height: 120px;
      border: 3px dashed ${color};
      border-radius: 50%;
      left: 50%;
      top: 60%;
      transform: translate(-50%, -50%);
      opacity: 0;
    `;
    containerRef.current.appendChild(warning);

    animate(warning, {
      opacity: [0, 0.8, 0.4, 0.8],
      scale: [0.8, 1, 0.9, 1],
      duration: 400,
      easing: 'easeInOutQuad',
    });

    // Create meteor
    setTimeout(() => {
      warning.remove();

      const meteor = document.createElement('div');
      meteor.style.cssText = `
        position: absolute;
        width: 50px;
        height: 50px;
        background: radial-gradient(circle, #ffff00 0%, ${color} 50%, ${trailColor} 100%);
        border-radius: 50%;
        left: 50%;
        top: -100px;
        transform: translateX(-50%);
        box-shadow: 0 0 40px ${color}, 0 0 80px ${trailColor};
      `;
      containerRef.current.appendChild(meteor);

      // Fire trail
      const createTrailParticle = () => {
        const particle = createParticle(containerRef.current,
          meteor.offsetLeft + 25 + (Math.random() - 0.5) * 20,
          meteor.offsetTop + 50 + Math.random() * 30,
          {
            size: 8 + Math.random() * 12,
            color: Math.random() > 0.5 ? color : trailColor,
          }
        );
        animate(particle, {
          translateY: -40,
          scale: [1, 0],
          opacity: [1, 0],
          duration: 300,
          easing: 'easeOutQuad',
          complete: () => particle.remove(),
        });
      };

      const trailInterval = setInterval(createTrailParticle, 30);

      // Animate meteor fall
      animate(meteor, {
        translateY: [0, 280],
        rotate: [0, 720],
        duration: 400,
        easing: 'easeInQuad',
        complete: () => {
          clearInterval(trailInterval);
          meteor.remove();

          // Explosion
          const explosion = document.createElement('div');
          explosion.style.cssText = `
            position: absolute;
            width: 60px;
            height: 60px;
            background: radial-gradient(circle, #ffffff 0%, ${color} 30%, ${trailColor} 60%, transparent 100%);
            border-radius: 50%;
            left: 50%;
            top: 60%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 60px ${color};
          `;
          containerRef.current.appendChild(explosion);

          animate(explosion, {
            scale: [0.5, 4],
            opacity: [1, 0],
            duration: 500,
            easing: 'easeOutExpo',
            complete: () => explosion.remove(),
          });

          // Debris particles
          for (let i = 0; i < 20; i++) {
            const angle = (360 / 20) * i * Math.PI / 180;
            const debris = createParticle(containerRef.current, 128, 150, {
              size: 4 + Math.random() * 8,
              color: i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? color : trailColor,
            });

            animate(debris, {
              translateX: Math.cos(angle) * (80 + Math.random() * 60),
              translateY: Math.sin(angle) * (80 + Math.random() * 60) - 40,
              scale: [1, 0],
              opacity: [1, 0],
              duration: 600 + Math.random() * 200,
              easing: 'easeOutQuad',
              complete: () => debris.remove(),
            });
          }

          setTimeout(onComplete, 600);
        },
      });
    }, 400);
  }, [ability, onComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ left: position?.x, top: position?.y }}
    />
  );
};

// Soul Drain Animation
const SoulDrainEffect = ({ ability, position, onComplete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { color, trailColor, duration } = ability;

    // Create tendrils
    const tendrils = [];
    for (let i = 0; i < 5; i++) {
      const tendril = document.createElement('div');
      const startAngle = -30 + i * 15;
      tendril.style.cssText = `
        position: absolute;
        width: 4px;
        height: 100px;
        background: linear-gradient(180deg, ${color}, ${trailColor}, transparent);
        left: 50%;
        top: 20%;
        transform-origin: bottom center;
        transform: translateX(-50%) rotate(${startAngle}deg);
        opacity: 0;
        border-radius: 2px;
      `;
      containerRef.current.appendChild(tendril);
      tendrils.push({ el: tendril, angle: startAngle });
    }

    // Animate tendrils waving
    tendrils.forEach((tendril, i) => {
      animate(tendril.el, {
        opacity: [0, 0.8, 0.8, 0],
        rotate: [tendril.angle, tendril.angle + 20, tendril.angle - 20, tendril.angle],
        scaleY: [0, 1, 1, 0.5],
        duration: duration,
        delay: i * 50,
        easing: 'easeInOutQuad',
        complete: () => tendril.el.remove(),
      });
    });

    // Create soul particles flowing to player
    setTimeout(() => {
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          const particle = createParticle(containerRef.current, 128, 60, {
            size: 6,
            color: color,
          });

          animate(particle, {
            translateY: 180,
            translateX: (Math.random() - 0.5) * 60,
            scale: [1, 0.5],
            opacity: [1, 0],
            duration: 400,
            easing: 'easeInQuad',
            complete: () => particle.remove(),
          });
        }, i * 40);
      }

      setTimeout(onComplete, 600);
    }, duration / 2);
  }, [ability, onComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ left: position?.x, top: position?.y }}
    />
  );
};

// Main AbilityAnimation Component
export default function AbilityAnimation({
  ability,
  position = { x: 0, y: 0 },
  onComplete,
  containerRef,
}) {
  const abilityData = typeof ability === 'string' ? ABILITY_TYPES[ability] : ability;

  if (!abilityData) return null;

  // Trigger screen shake
  useEffect(() => {
    if (!containerRef?.current || !abilityData.screenShake) return;

    const shake = SHAKE_INTENSITIES[abilityData.screenShake] || SHAKE_INTENSITIES.normal;

    animate(containerRef.current, {
      translateX: [0, -shake.x, shake.x, -shake.x / 2, shake.x / 2, 0],
      translateY: [0, shake.y / 2, -shake.y / 2, shake.y / 3, -shake.y / 3, 0],
      duration: shake.duration,
      easing: 'easeOutElastic(1, 0.5)',
    });
  }, [abilityData, containerRef]);

  // Select animation component based on ability animation type
  const animationType = ABILITY_ANIMATIONS[abilityData.animation]?.type;

  const renderAnimation = () => {
    switch (animationType) {
      case 'slash':
        return <SlashArcEffect ability={abilityData} position={position} onComplete={onComplete} />;
      case 'multi_hit':
        return <MultiSlashEffect ability={abilityData} position={position} onComplete={onComplete} />;
      case 'blink':
        return <BlinkStrikeEffect ability={abilityData} position={position} onComplete={onComplete} />;
      case 'slam':
      case 'overhead':
        return <GroundSlamEffect ability={abilityData} position={position} onComplete={onComplete} />;
      case 'nova':
        return <NovaBurstEffect ability={abilityData} position={position} onComplete={onComplete} />;
      case 'chain':
        return <ChainLightningEffect ability={abilityData} position={position} onComplete={onComplete} />;
      case 'summon':
        return <MeteorEffect ability={abilityData} position={position} onComplete={onComplete} />;
      case 'drain':
        return <SoulDrainEffect ability={abilityData} position={position} onComplete={onComplete} />;
      default:
        // Default nova-style effect
        return <NovaBurstEffect ability={abilityData} position={position} onComplete={onComplete} />;
    }
  };

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      {renderAnimation()}
    </div>
  );
}

// Export individual effects for direct use
export {
  SlashArcEffect,
  MultiSlashEffect,
  BlinkStrikeEffect,
  GroundSlamEffect,
  NovaBurstEffect,
  ChainLightningEffect,
  MeteorEffect,
  SoulDrainEffect,
};
