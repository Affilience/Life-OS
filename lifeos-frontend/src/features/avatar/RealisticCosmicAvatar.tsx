/**
 * Realistic Cosmic Avatar
 * Based on actual NASA Hubble nebula imagery
 * Features: H-alpha/OIII/SII colors, billowing clouds, filaments, dust lanes
 */

import React, { useEffect, useRef } from 'react';
import type { AtomToCosmosAvatarProps } from './types';
import { getLevelStage, getStageIndex, computeXpPercent, computeStreakIntensity } from './avatar.state';
import { useAvatarEvents } from './avatar.events';
import { emitCelebration } from '../effects/useCelebrationBus';

// Realistic nebula colors based on emission spectra
const NEBULA_COLORS = {
  H_ALPHA: '#FF4466',    // Hydrogen emission 656.3nm - deep red
  OIII: '#00DDEE',       // Oxygen emission 500.7nm - cyan/teal
  SII: '#FF66AA',        // Sulfur emission 672.4nm - magenta
  DUST: '#1a0f0a',       // Dark dust lanes
  STAR_CORE: '#FFFFEE',  // Hot star cores
  FILAMENT: '#CC8844'    // Dusty filaments
};

// Perlin-like noise for organic shapes
function noise2D(x: number, y: number, seed = 0): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const hash = (n: number) => {
    n = (n << 13) ^ n;
    return ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 2147483648.0;
  };

  const aa = hash(X + hash(Y + seed));
  const ab = hash(X + hash(Y + 1 + seed));
  const ba = hash(X + 1 + hash(Y + seed));
  const bb = hash(X + 1 + hash(Y + 1 + seed));

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const u = fade(xf);
  const v = fade(yf);

  return aa * (1 - u) * (1 - v) + ba * u * (1 - v) + ab * (1 - u) * v + bb * u * v;
}

export function RealisticCosmicAvatar({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const stage = getLevelStage(level);
  const stageIndex = getStageIndex(stage);
  const xpPercent = computeXpPercent(xp, xpToNext);
  const streakIntensity = computeStreakIntensity(streakDays);

  const seasonColors = {
    discipline: { h: NEBULA_COLORS.H_ALPHA, o: NEBULA_COLORS.OIII, s: NEBULA_COLORS.SII },
    ambition: { h: '#FFAA00', o: '#FFDD66', s: '#FF8800' },
    focus: { h: NEBULA_COLORS.OIII, o: '#00FFFF', s: '#0088DD' },
    evolution: { h: NEBULA_COLORS.SII, o: '#DD88FF', s: '#AA55FF' },
    power: { h: '#4499FF', o: '#66BBFF', s: '#2277DD' }
  };

  const colors = seasonColors[season];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false })!;
    const centerX = width / 2;
    const centerY = height / 2;
    let time = 0;

    const renderFrame = () => {
      time += reducedMotion ? 0 : 0.01;
      ctx.clearRect(0, 0, width, height);

      // Dark space background with stars
      ctx.fillStyle = '#0a0612';
      ctx.fillRect(0, 0, width, height);

      // Add background stars
      if (stageIndex >= 1) {
        const starCount = 30 + stageIndex * 20;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < starCount; i++) {
          const sx = (noise2D(i * 0.1, 0, 1) + 1) * width / 2;
          const sy = (noise2D(i * 0.1, 1, 1) + 1) * height / 2;
          const size = noise2D(i * 0.1, 2, 1) * 1.5;
          const alpha = 0.3 + noise2D(i * 0.1, 3, 1) * 0.7;

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // STAGE 0: ATOM - Single bright point
      if (stageIndex === 0) {
        const pulse = 1 + Math.sin(time * 2) * 0.15;
        const coreSize = (10 + xpPercent * 5) * pulse;

        // Bright core with realistic glow
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize * 4);
        coreGrad.addColorStop(0, NEBULA_COLORS.STAR_CORE);
        coreGrad.addColorStop(0.2, colors.h + 'DD');
        coreGrad.addColorStop(0.5, colors.o + '88');
        coreGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = coreGrad;
        ctx.fillRect(centerX - coreSize * 4, centerY - coreSize * 4, coreSize * 8, coreSize * 8);

        // Energy ring
        ctx.strokeStyle = colors.o + '60';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.o;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // STAGE 1: ORBIT - Electron cloud formation
      else if (stageIndex === 1) {
        // Central nucleus
        const nucGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 18);
        nucGrad.addColorStop(0, NEBULA_COLORS.STAR_CORE);
        nucGrad.addColorStop(0.4, colors.h);
        nucGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = nucGrad;
        ctx.fillRect(centerX - 18, centerY - 18, 36, 36);

        // Electron cloud with billowing edges
        for (let shell = 0; shell < 3; shell++) {
          const orbit = 35 + shell * 20;

          // Draw cloud instead of perfect circle
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 2; a += 0.1) {
            const noiseVal = noise2D(Math.cos(a) * 2 + time * 0.3, Math.sin(a) * 2 + time * 0.3, shell);
            const r = orbit + noiseVal * 8;
            const x = centerX + Math.cos(a) * r;
            const y = centerY + Math.sin(a) * r * 0.7;

            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          const cloudGrad = ctx.createRadialGradient(centerX, centerY, orbit - 10, centerX, centerY, orbit + 10);
          cloudGrad.addColorStop(0, colors.o + '00');
          cloudGrad.addColorStop(0.5, colors.o + '40');
          cloudGrad.addColorStop(1, 'transparent');

          ctx.fillStyle = cloudGrad;
          ctx.fill();
        }
      }

      // STAGE 2: MOLECULE - Billowing cloud cluster
      else if (stageIndex === 2) {
        // Multiple billowing clouds connected by filaments
        const nodes = 6;
        for (let i = 0; i < nodes; i++) {
          const angle = (i / nodes) * Math.PI * 2 + time * 0.2;
          const dist = 45 + noise2D(i, time * 0.5, 0) * 15;
          const nx = centerX + Math.cos(angle) * dist;
          const ny = centerY + Math.sin(angle) * dist;

          // Billowing cloud shape
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 2; a += 0.15) {
            const nVal = noise2D(
              nx / 30 + Math.cos(a) * 0.5,
              ny / 30 + Math.sin(a) * 0.5 + time * 0.1,
              i
            );
            const r = 15 + nVal * 8;
            const x = nx + Math.cos(a) * r;
            const y = ny + Math.sin(a) * r;

            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          const cloudGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, 25);
          cloudGrad.addColorStop(0, colors.h + 'AA');
          cloudGrad.addColorStop(0.6, colors.s + '60');
          cloudGrad.addColorStop(1, 'transparent');

          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.h;
          ctx.fillStyle = cloudGrad;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Filament to center
          ctx.strokeStyle = NEBULA_COLORS.FILAMENT + '40';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }

        // Central bright region
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
        coreGrad.addColorStop(0, NEBULA_COLORS.STAR_CORE);
        coreGrad.addColorStop(0.5, colors.o);
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.fillRect(centerX - 20, centerY - 20, 40, 40);
      }

      // STAGE 3: PROTO-STAR - Stellar birth nebula
      else if (stageIndex === 3) {
        // Billowing protoplanetary disk
        ctx.save();
        ctx.translate(centerX, centerY);

        // Dark dust lanes in disk
        for (let r = 50; r < 110; r += 3) {
          const noiseScale = noise2D(r * 0.05, time * 0.3, 0);
          const alpha = Math.max(0, 0.6 - (r - 50) / 80) * (0.5 + noiseScale * 0.5);

          ctx.save();
          ctx.scale(1, 0.35);

          ctx.beginPath();
          for (let a = 0; a < Math.PI * 2; a += 0.1) {
            const nVal = noise2D(Math.cos(a) * r * 0.02 + time * 0.1, Math.sin(a) * r * 0.02, r);
            const rr = r + nVal * 10;

            if (a === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
            else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
          ctx.closePath();

          // Mix H-alpha and dust
          const dustMix = r > 70 ? NEBULA_COLORS.DUST : colors.h;
          ctx.strokeStyle = dustMix + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.restore();
        }

        ctx.restore();

        // Central protostar with realistic glow
        const starGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 45);
        starGrad.addColorStop(0, NEBULA_COLORS.STAR_CORE);
        starGrad.addColorStop(0.3, colors.o + 'EE');
        starGrad.addColorStop(0.7, colors.h + '88');
        starGrad.addColorStop(1, 'transparent');

        ctx.shadowBlur = 35;
        ctx.shadowColor = colors.o;
        ctx.fillStyle = starGrad;
        ctx.fillRect(centerX - 45, centerY - 45, 90, 90);
        ctx.shadowBlur = 0;

        // Stellar wind filaments
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + time * 0.5;
          const rayLen = 55 + noise2D(i, time, 0) * 15;

          const grad = ctx.createLinearGradient(
            centerX,
            centerY,
            centerX + Math.cos(angle) * rayLen,
            centerY + Math.sin(angle) * rayLen
          );
          grad.addColorStop(0, colors.s + '90');
          grad.addColorStop(0.5, colors.h + '50');
          grad.addColorStop(1, 'transparent');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + Math.cos(angle) * rayLen, centerY + Math.sin(angle) * rayLen);
          ctx.stroke();
        }
      }

      // STAGE 4: SOLAR - Planetary nebula
      else if (stageIndex === 4) {
        // Billowing outer shell
        for (let layer = 0; layer < 3; layer++) {
          const radius = 80 + layer * 25;

          ctx.beginPath();
          for (let a = 0; a < Math.PI * 2; a += 0.08) {
            const n1 = noise2D(Math.cos(a) * 2 + time * 0.2, Math.sin(a) * 2, layer);
            const n2 = noise2D(Math.cos(a * 2) + time * 0.15, Math.sin(a * 2) + 1, layer);
            const r = radius + n1 * 20 + n2 * 10;
            const x = centerX + Math.cos(a) * r;
            const y = centerY + Math.sin(a) * r * 0.75;

            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          const shellGrad = ctx.createRadialGradient(centerX, centerY, radius - 20, centerX, centerY, radius + 30);
          shellGrad.addColorStop(0, 'transparent');
          shellGrad.addColorStop(0.5, (layer === 0 ? colors.o : layer === 1 ? colors.h : colors.s) + '60');
          shellGrad.addColorStop(1, 'transparent');

          ctx.fillStyle = shellGrad;
          ctx.shadowBlur = 25;
          ctx.shadowColor = layer === 0 ? colors.o : layer === 1 ? colors.h : colors.s;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Central star
        const starGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 28);
        starGrad.addColorStop(0, NEBULA_COLORS.STAR_CORE);
        starGrad.addColorStop(0.5, colors.o);
        starGrad.addColorStop(1, 'transparent');

        ctx.shadowBlur = 30;
        ctx.shadowColor = NEBULA_COLORS.STAR_CORE;
        ctx.fillStyle = starGrad;
        ctx.fillRect(centerX - 28, centerY - 28, 56, 56);
        ctx.shadowBlur = 0;
      }

      // STAGE 5: GALAXY - Full emission nebula
      else if (stageIndex >= 5) {
        // Complex billowing nebula clouds
        for (let cloudIdx = 0; cloudIdx < 5; cloudIdx++) {
          const baseAngle = (cloudIdx / 5) * Math.PI * 2;
          const baseDist = 60 + cloudIdx * 12;

          ctx.beginPath();
          for (let a = -Math.PI / 3; a < Math.PI / 3; a += 0.1) {
            const angle = baseAngle + a;
            const n1 = noise2D(
              Math.cos(angle) * 3 + time * 0.15,
              Math.sin(angle) * 3 + time * 0.1,
              cloudIdx
            );
            const n2 = noise2D(
              Math.cos(angle * 1.5) * 2,
              Math.sin(angle * 1.5) * 2 + time * 0.2,
              cloudIdx + 10
            );

            const dist = baseDist + n1 * 35 + n2 * 20;
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist * 0.7;

            if (a === -Math.PI / 3) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          // Determine color channel
          const channelColors = [colors.h, colors.o, colors.s, colors.h, colors.o];
          const cloudColor = channelColors[cloudIdx];

          const cloudGrad = ctx.createRadialGradient(
            centerX + Math.cos(baseAngle) * baseDist,
            centerY + Math.sin(baseAngle) * baseDist * 0.7,
            0,
            centerX + Math.cos(baseAngle) * baseDist,
            centerY + Math.sin(baseAngle) * baseDist * 0.7,
            50
          );
          cloudGrad.addColorStop(0, cloudColor + 'BB');
          cloudGrad.addColorStop(0.6, cloudColor + '60');
          cloudGrad.addColorStop(1, 'transparent');

          ctx.fillStyle = cloudGrad;
          ctx.shadowBlur = 30;
          ctx.shadowColor = cloudColor;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Dark dust lanes (realistic obscuration)
        ctx.globalCompositeOperation = 'multiply';
        for (let dustLane = 0; dustLane < 3; dustLane++) {
          const angle = (dustLane / 3) * Math.PI * 2 + Math.PI / 6;

          ctx.beginPath();
          for (let t = 0; t < 1; t += 0.05) {
            const dist = 40 + t * 80;
            const thickness = 15 + noise2D(t * 5, dustLane, time * 0.1) * 10;
            const x = centerX + Math.cos(angle) * dist + Math.cos(angle + Math.PI / 2) * thickness;
            const y = centerY + Math.sin(angle) * dist * 0.7 + Math.sin(angle + Math.PI / 2) * thickness;

            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          for (let t = 1; t >= 0; t -= 0.05) {
            const dist = 40 + t * 80;
            const thickness = 15 + noise2D(t * 5, dustLane, time * 0.1) * 10;
            const x = centerX + Math.cos(angle) * dist - Math.cos(angle + Math.PI / 2) * thickness;
            const y = centerY + Math.sin(angle) * dist * 0.7 - Math.sin(angle + Math.PI / 2) * thickness;
            ctx.lineTo(x, y);
          }
          ctx.closePath();

          ctx.fillStyle = NEBULA_COLORS.DUST + 'CC';
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';

        // Bright central region
        const galacticCore = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
        galacticCore.addColorStop(0, NEBULA_COLORS.STAR_CORE);
        galacticCore.addColorStop(0.3, colors.o + 'FF');
        galacticCore.addColorStop(0.7, colors.h + 'AA');
        galacticCore.addColorStop(1, 'transparent');

        ctx.shadowBlur = 40;
        ctx.shadowColor = colors.o;
        ctx.fillStyle = galacticCore;
        ctx.fillRect(centerX - 35, centerY - 35, 70, 70);
        ctx.shadowBlur = 0;

        // Embedded stars
        for (let i = 0; i < 40; i++) {
          const angle = (i / 40) * Math.PI * 2 + time * 0.2;
          const dist = 30 + noise2D(i * 0.5, 0, 0) * 90;
          const sx = centerX + Math.cos(angle) * dist;
          const sy = centerY + Math.sin(angle) * dist * 0.7;
          const size = 1 + noise2D(i * 0.5, 1, 0) * 2.5;

          ctx.fillStyle = NEBULA_COLORS.STAR_CORE;
          ctx.shadowBlur = 8;
          ctx.shadowColor = NEBULA_COLORS.STAR_CORE;
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

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
  }, [width, height, stageIndex, xpPercent, colors, reducedMotion]);

  useAvatarEvents({
    onXpClaimed: (amount) => emitCelebration({ type: 'xpBurst', amount }),
    onLevelUp: (level) => emitCelebration({ type: 'levelUp', level }),
    onStreakMilestone: (days) => emitCelebration({ type: 'streakMilestone', days })
  });

  return (
    <div
      className="realistic-cosmic-avatar"
      style={{
        width,
        height,
        position: 'relative',
        cursor: onOpenCoach ? 'pointer' : 'default',
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${colors.h}40`,
        boxShadow: `0 8px 32px ${colors.h}30, 0 0 60px ${colors.o}20`
      }}
      onClick={onOpenCoach}
      role={onOpenCoach ? 'button' : undefined}
      tabIndex={onOpenCoach ? 0 : undefined}
      aria-label={onOpenCoach ? `${stage} stage, Level ${level}` : undefined}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />

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
          textShadow: `0 0 10px ${colors.o}, 0 0 20px ${colors.h}`
        }}
      >
        {stage} • Lv {level}
      </div>
    </div>
  );
}
