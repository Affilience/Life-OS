/**
 * Enhanced Atom → Cosmos Avatar
 * Visually stunning 2D avatar with rich particles, glow effects, and dynamic background
 */

import React, { useEffect, useRef, useState } from 'react';
import { Nebula } from '@flodlc/nebula';
import type { AtomToCosmosAvatarProps } from './types';
import { getLevelStage, getStageIndex, computeXpPercent, computeStreakIntensity } from './avatar.state';
import { useAvatarEvents } from './avatar.events';
import { emitCelebration } from '../effects/useCelebrationBus';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

export function EnhancedAtomCosmosAvatar({
  level,
  xp,
  xpToNext,
  streakDays = 0,
  season = 'discipline',
  mood = 'calm',
  width = 520,
  height = 320,
  onOpenCoach,
  reducedMotion = false
}: AtomToCosmosAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nebulaContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nebulaRef = useRef<any>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  const stage = getLevelStage(level);
  const stageIndex = getStageIndex(stage);
  const xpPercent = computeXpPercent(xp, xpToNext);
  const streakIntensity = computeStreakIntensity(streakDays);

  const seasonColors = {
    discipline: { primary: '#7A5CFF', secondary: '#9D7FFF', accent: '#5CE1E6' },
    ambition: { primary: '#F2C94C', secondary: '#FFD666', accent: '#FF8A00' },
    focus: { primary: '#5CE1E6', secondary: '#7FECF5', accent: '#00B8D4' },
    evolution: { primary: '#D064FF', secondary: '#E08CFF', accent: '#A855F7' },
    power: { primary: '#4F9DFF', secondary: '#6FB0FF', accent: '#2979FF' }
  };

  const colors = seasonColors[season];

  // Initialize nebula background
  useEffect(() => {
    if (!nebulaContainerRef.current || nebulaRef.current || reducedMotion) return;

    const container = nebulaContainerRef.current;
    const nebulaIntensity = Math.min(5, 0.5 + (stageIndex * 0.9));
    const starsCount = Math.min(1000, 50 + (stageIndex * 150));

    // Add a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        nebulaRef.current = new Nebula(container, {
          starsCount,
          starsColor: '#ffffff',
          starsRotationSpeed: 0.03,
          nebulasIntensity: nebulaIntensity,
          sunScale: 0,
          planetsScale: 0,
          cometFrequency: 0
        });
      } catch (error) {
        console.warn('Nebula initialization skipped:', error);
        // Fallback: just show dark background
        container.style.background = 'radial-gradient(circle at center, #0f1729 0%, #0a0e1a 100%)';
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      nebulaRef.current = null;
    };
  }, [stageIndex, reducedMotion]);

  // Canvas particle rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true })!;
    const centerX = width / 2;
    const centerY = height / 2;

    const spawnParticle = (config: Partial<Particle> = {}) => {
      particlesRef.current.push({
        x: centerX,
        y: centerY,
        vx: 0,
        vy: 0,
        life: 1,
        maxLife: 1,
        size: 2,
        color: colors.primary,
        alpha: 1,
        ...config
      });
    };

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      // Render based on stage
      ctx.save();

      // Enhanced glow effect
      ctx.shadowBlur = 20 + (streakIntensity * 30);
      ctx.shadowColor = colors.primary;

      if (stageIndex === 0) {
        // ATOM: Pulsing core with energy rings
        const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.2;
        const coreSize = (8 + xpPercent * 4) * pulse;

        // Core
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize * 3);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(0.5, colors.secondary + '80');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
        ctx.fill();

        // Energy rings
        for (let i = 0; i < 3; i++) {
          const ringPulse = 1 + Math.sin(Date.now() * 0.002 + i) * 0.3;
          ctx.strokeStyle = colors.accent + '40';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, (20 + i * 15) * ringPulse, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      else if (stageIndex === 1) {
        // ORBIT: Electron shells with trails
        const time = Date.now() * 0.001;

        // Nucleus
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, colors.primary);
        gradient.addColorStop(1, colors.secondary + '40');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fill();

        // Electron orbits with glowing electrons
        [30, 50, 70].forEach((orbit, i) => {
          // Orbit path
          ctx.strokeStyle = colors.accent + '20';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, orbit, orbit * 0.6, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Electron
          const angle = time * (0.5 + i * 0.3) + i * (Math.PI * 2 / 3);
          const ex = centerX + Math.cos(angle) * orbit;
          const ey = centerY + Math.sin(angle) * orbit * 0.6;

          const electronGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, 12);
          electronGrad.addColorStop(0, '#ffffff');
          electronGrad.addColorStop(0.3, colors.primary);
          electronGrad.addColorStop(1, 'transparent');

          ctx.fillStyle = electronGrad;
          ctx.beginPath();
          ctx.arc(ex, ey, 12, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      else if (stageIndex === 2) {
        // MOLECULE: Complex bonding patterns
        const nodes = 7;
        const nodePositions: [number, number][] = [];

        // Center node
        nodePositions.push([centerX, centerY]);

        // Surrounding nodes
        for (let i = 0; i < nodes - 1; i++) {
          const angle = (i / (nodes - 1)) * Math.PI * 2;
          const radius = 40 + Math.sin(Date.now() * 0.001 + i) * 10;
          nodePositions.push([
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius
          ]);
        }

        // Draw bonds with glow
        ctx.strokeStyle = colors.accent + '60';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        nodePositions.forEach((pos, i) => {
          if (i === 0) return;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(pos[0], pos[1]);
          ctx.stroke();
        });

        // Draw nodes
        nodePositions.forEach((pos, i) => {
          const size = i === 0 ? 14 : 8;
          const grad = ctx.createRadialGradient(pos[0], pos[1], 0, pos[0], pos[1], size * 2);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.4, colors.primary);
          grad.addColorStop(1, 'transparent');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pos[0], pos[1], size * 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      else if (stageIndex === 3) {
        // PROTO-STAR: Stellar birth with accretion disk
        const time = Date.now() * 0.001;
        const corePulse = 1 + Math.sin(time * 2) * 0.15;

        // Stellar core
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40 * corePulse);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, colors.primary);
        coreGrad.addColorStop(0.6, colors.secondary + '80');
        coreGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40 * corePulse, 0, Math.PI * 2);
        ctx.fill();

        // Accretion disk
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(1, 0.3);

        for (let r = 50; r < 120; r += 15) {
          const alpha = Math.max(0, 0.4 - (r - 50) / 150);
          ctx.strokeStyle = colors.accent + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();

        // Stellar rays
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + time * 0.5;
          const rayLength = 60;
          const ex = centerX + Math.cos(angle) * rayLength;
          const ey = centerY + Math.sin(angle) * rayLength;

          const rayGrad = ctx.createLinearGradient(centerX, centerY, ex, ey);
          rayGrad.addColorStop(0, colors.primary + '80');
          rayGrad.addColorStop(1, 'transparent');

          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
      }

      else if (stageIndex === 4) {
        // SOLAR SYSTEM: Sun with planets and orbital trails
        const time = Date.now() * 0.001;

        // Sun
        const sunGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 25);
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.4, colors.primary);
        sunGrad.addColorStop(1, colors.secondary + '60');

        ctx.shadowBlur = 30;
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
        ctx.fill();

        // Corona
        ctx.shadowBlur = 40;
        ctx.strokeStyle = colors.primary + '40';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
        ctx.stroke();

        // Planets
        const planets = [
          { orbit: 60, size: 6, color: colors.accent, speed: 0.8 },
          { orbit: 85, size: 9, color: colors.secondary, speed: 0.5 },
          { orbit: 115, size: 5, color: colors.primary, speed: 0.3 }
        ];

        planets.forEach((planet, i) => {
          // Orbital path
          ctx.shadowBlur = 0;
          ctx.strokeStyle = planet.color + '15';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, planet.orbit, 0, Math.PI * 2);
          ctx.stroke();

          // Planet position
          const angle = time * planet.speed + i * (Math.PI * 2 / 3);
          const px = centerX + Math.cos(angle) * planet.orbit;
          const py = centerY + Math.sin(angle) * planet.orbit;

          // Planet with glow
          const planetGrad = ctx.createRadialGradient(px, py, 0, px, py, planet.size * 2);
          planetGrad.addColorStop(0, '#ffffff');
          planetGrad.addColorStop(0.5, planet.color);
          planetGrad.addColorStop(1, 'transparent');

          ctx.shadowBlur = 15;
          ctx.fillStyle = planetGrad;
          ctx.beginPath();
          ctx.arc(px, py, planet.size * 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      else if (stageIndex >= 5) {
        // GALAXY: Spiral galaxy with thousands of stars
        const time = Date.now() * 0.0005;

        // Galactic core
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, colors.primary);
        coreGrad.addColorStop(0.7, colors.secondary + 'CC');
        coreGrad.addColorStop(1, colors.accent + '60');

        ctx.shadowBlur = 40;
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
        ctx.fill();

        // Spiral arms with stars
        ctx.shadowBlur = 5;
        for (let arm = 0; arm < 3; arm++) {
          const armOffset = (arm / 3) * Math.PI * 2;

          for (let i = 0; i < 60; i++) {
            const t = i / 60;
            const angle = armOffset + t * Math.PI * 4 + time * 0.5;
            const radius = 40 + t * 80;
            const scatter = (Math.random() - 0.5) * 15;

            const sx = centerX + Math.cos(angle) * (radius + scatter);
            const sy = centerY + Math.sin(angle) * (radius + scatter) * 0.7;
            const starSize = Math.random() * 2 + 0.5;
            const starBrightness = 0.3 + Math.random() * 0.7;

            ctx.fillStyle = `rgba(255, 255, 255, ${starBrightness})`;
            ctx.beginPath();
            ctx.arc(sx, sy, starSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.restore();

      // Update and render particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1 / (p.maxLife * 60);

        if (p.life <= 0) return false;

        ctx.globalAlpha = p.alpha * p.life;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      ctx.globalAlpha = 1;

      if (!reducedMotion) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, stageIndex, xpPercent, colors, streakIntensity, reducedMotion]);

  // Listen to events
  useAvatarEvents({
    onXpClaimed: (amount) => {
      emitCelebration({ type: 'xpBurst', amount });
    },
    onLevelUp: (newLevel) => {
      emitCelebration({ type: 'levelUp', level: newLevel });
    },
    onStreakMilestone: (days) => {
      emitCelebration({ type: 'streakMilestone', days });
    }
  });

  return (
    <div
      ref={containerRef}
      className="enhanced-atom-cosmos-avatar"
      style={{
        width,
        height,
        position: 'relative',
        cursor: onOpenCoach ? 'pointer' : 'default',
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${colors.primary}40`,
        boxShadow: `0 8px 32px ${colors.primary}20`
      }}
      onClick={onOpenCoach}
      role={onOpenCoach ? 'button' : undefined}
      tabIndex={onOpenCoach ? 0 : undefined}
      aria-label={onOpenCoach ? `${stage} stage, Level ${level}` : undefined}
    >
      {/* Nebula background */}
      <div
        ref={nebulaContainerRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0
        }}
      />

      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1
        }}
      />

      {/* Stage label */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          fontSize: 11,
          fontWeight: 600,
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          zIndex: 2,
          textShadow: `0 0 10px ${colors.primary}`
        }}
      >
        {stage} • Lv {level}
      </div>
    </div>
  );
}
