/**
 * Enhanced Canvas Renderers for Cosmic Evolution Stages
 * Each renderer creates a visually STUNNING 2D representation with dramatic effects
 */

import type { LevelData } from '../types/level.types';

// Pre-generated star positions for spiral galaxy (performance optimization)
const spiralGalaxyStars = Array.from({ length: 200 }, (_, i) => {
  // Seeded random for consistent star positions
  const seed = i * 9301 + 49297;
  const random1 = (seed % 233280) / 233280;
  const seed2 = (seed * 2) % 233280;
  const random2 = (seed2 % 233280) / 233280;
  const seed3 = (seed * 3) % 233280;
  const random3 = (seed3 % 233280) / 233280;

  return {
    angle: random1 * Math.PI * 2,
    distance: random2 * 160,
    brightness: random3,
    twinkleOffset: i
  };
});

// Utility: Create radial gradient
const createRadialGradient = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  stops: Array<{ offset: number; color: string }>
) => {
  const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
  stops.forEach(({ offset, color }) => gradient.addColorStop(offset, color));
  return gradient;
};

// Utility: Draw circle
const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
};

// Utility: Draw glow effect
const drawGlow = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, intensity: number = 1) => {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color.replace(')', `, ${0.8 * intensity})`).replace('rgb', 'rgba'));
  gradient.addColorStop(0.5, color.replace(')', `, ${0.3 * intensity})`).replace('rgb', 'rgba'));
  gradient.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
};

/**
 * STAGE 1: QUANTUM FLUCTUATION - Tiny pulsating point of light (the beginning)
 */
export const quantumFluctuation = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  // Very small, rapid pulsing - the first spark of existence
  const pulse = 0.7 + Math.sin(time * 8) * 0.3;
  const erraticPulse = 0.85 + Math.sin(time * 15 + Math.cos(time * 7)) * 0.15;

  // Tiny quantum uncertainty field (very subtle)
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 40 * pulse, [
    { offset: 0, color: 'rgba(200, 210, 255, 0)' },
    { offset: 0.7, color: `rgba(155, 176, 255, ${0.05 * erraticPulse})` },
    { offset: 1, color: 'rgba(155, 176, 255, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 40 * pulse);

  // Middle glow layer
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 15 * pulse * erraticPulse, [
    { offset: 0, color: `rgba(200, 220, 255, ${0.6 * pulse})` },
    { offset: 0.5, color: `rgba(155, 176, 255, ${0.4 * pulse})` },
    { offset: 1, color: 'rgba(155, 176, 255, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 15 * pulse * erraticPulse);

  // The core - a tiny point of light (VERY small - this is where it all begins)
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 4 * pulse * erraticPulse, [
    { offset: 0, color: '#FFFFFF' },
    { offset: 0.5, color: '#E0E8FF' },
    { offset: 1, color: '#9BB0FF' }
  ]);
  drawCircle(ctx, centerX, centerY, 4 * pulse * erraticPulse);

  // Occasional flicker (quantum uncertainty)
  const flicker = Math.sin(time * 20) > 0.7 ? 1.3 : 1;
  ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * flicker * pulse})`;
  drawCircle(ctx, centerX, centerY, 2 * pulse * erraticPulse);
};

/**
 * STAGE 2: FUNDAMENTAL PARTICLE - Growing energy particle
 */
export const fundamentalParticle = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  // Slightly larger, more stable pulsing
  const pulse = 0.92 + Math.sin(time * 3) * 0.08;
  const energyPulse = 0.9 + Math.sin(time * 5) * 0.1;

  // Energy field (warmer colors - more energetic)
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 60 * pulse, [
    { offset: 0, color: 'rgba(255, 244, 234, 0)' },
    { offset: 0.6, color: `rgba(255, 210, 161, ${0.15 * energyPulse})` },
    { offset: 1, color: 'rgba(255, 210, 161, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 60 * pulse);

  // Middle layer - glowing aura
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 25 * pulse * energyPulse, [
    { offset: 0, color: `rgba(255, 240, 220, ${0.7 * pulse})` },
    { offset: 0.5, color: `rgba(255, 210, 161, ${0.5 * pulse})` },
    { offset: 1, color: 'rgba(255, 210, 161, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 25 * pulse * energyPulse);

  // Core particle (brighter, more defined than stage 1)
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 8 * pulse * energyPulse, [
    { offset: 0, color: '#FFFFFF' },
    { offset: 0.4, color: '#FFF8F0' },
    { offset: 0.7, color: '#FFD2A1' },
    { offset: 1, color: '#FFAA66' }
  ]);
  drawCircle(ctx, centerX, centerY, 8 * pulse * energyPulse);

  // Bright center
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 3 * pulse, [
    { offset: 0, color: '#FFFFFF' },
    { offset: 0.6, color: '#FFF4EA' },
    { offset: 1, color: '#FFD2A1' }
  ]);
  drawCircle(ctx, centerX, centerY, 3 * pulse);
};

/**
 * STAGE 3: ATOMS - Orbital mechanics with glowing nucleus
 */
export const atoms = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  // Draw orbital rings (faint, pulsing)
  const orbitalRadii = [50, 85, 125];
  const pulse = 0.3 + Math.sin(time * 2) * 0.1;

  orbitalRadii.forEach((radius, idx) => {
    ctx.strokeStyle = `rgba(155, 176, 255, ${pulse * (0.3 - idx * 0.05)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Draw nucleus (bright golden core with multiple layers)
  const nucleusPulse = 0.95 + Math.sin(time * 1.5) * 0.05;

  // Outer glow
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 35 * nucleusPulse, [
    { offset: 0, color: 'rgba(255, 215, 0, 0)' },
    { offset: 0.3, color: 'rgba(255, 210, 161, 0.3)' },
    { offset: 0.7, color: 'rgba(255, 200, 150, 0.1)' },
    { offset: 1, color: 'rgba(255, 210, 161, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 35 * nucleusPulse);

  // Middle layer
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 22 * nucleusPulse, [
    { offset: 0, color: '#FFFFFF' },
    { offset: 0.4, color: '#FFD2A1' },
    { offset: 0.7, color: '#FFB366' },
    { offset: 1, color: 'rgba(255, 179, 102, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 22 * nucleusPulse);

  // Core
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 12 * nucleusPulse, [
    { offset: 0, color: '#FFFFFF' },
    { offset: 0.6, color: '#FFE4B5' },
    { offset: 1, color: '#FFD700' }
  ]);
  drawCircle(ctx, centerX, centerY, 12 * nucleusPulse);

  // Draw electrons orbiting with trails
  const electrons = [
    { orbit: 0, speed: 1.2, phase: 0, color: '#9BB0FF' },
    { orbit: 0, speed: 1.2, phase: Math.PI, color: '#B8C5FF' },
    { orbit: 1, speed: 0.9, phase: 0, color: '#AABfFF' },
    { orbit: 1, speed: 0.9, phase: Math.PI * 0.66, color: '#9BB0FF' },
    { orbit: 1, speed: 0.9, phase: Math.PI * 1.33, color: '#B8C5FF' },
    { orbit: 2, speed: 0.7, phase: 0, color: '#9BB0FF' },
    { orbit: 2, speed: 0.7, phase: Math.PI * 0.5, color: '#AABfFF' },
    { orbit: 2, speed: 0.7, phase: Math.PI, color: '#B8C5FF' },
    { orbit: 2, speed: 0.7, phase: Math.PI * 1.5, color: '#9BB0FF' }
  ];

  electrons.forEach(electron => {
    const radius = orbitalRadii[electron.orbit];
    const angle = (time * electron.speed + electron.phase) % (Math.PI * 2);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // Trail effect
    for (let i = 5; i > 0; i--) {
      const trailAngle = angle - (i * 0.15);
      const trailX = centerX + radius * Math.cos(trailAngle);
      const trailY = centerY + radius * Math.sin(trailAngle);
      const trailOpacity = (6 - i) / 15;

      ctx.fillStyle = electron.color.replace(')', `, ${trailOpacity})`).replace('rgb', 'rgba');
      drawCircle(ctx, trailX, trailY, 3);
    }

    // Electron glow
    ctx.fillStyle = createRadialGradient(ctx, x, y, 0, 10, [
      { offset: 0, color: electron.color },
      { offset: 0.4, color: electron.color },
      { offset: 1, color: electron.color.replace(')', ', 0)').replace('rgb', 'rgba') }
    ]);
    drawCircle(ctx, x, y, 10);

    // Electron core
    ctx.fillStyle = createRadialGradient(ctx, x, y, 0, 4, [
      { offset: 0, color: '#FFFFFF' },
      { offset: 0.7, color: electron.color },
      { offset: 1, color: electron.color }
    ]);
    drawCircle(ctx, x, y, 4);
  });
};

/**
 * STAGE 4: MOLECULES - Enhanced molecular structures with glow
 */
export const molecules = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);

  // Water molecule (H2O) - bent shape with enhanced glow
  const drawWater = (centerX: number, centerY: number, rotation: number, scale: number = 1) => {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    const bondGlow = 0.8 + Math.sin(time * 2) * 0.2;

    // Bond glow
    ctx.strokeStyle = `rgba(100, 180, 255, ${bondGlow * 0.3})`;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-25, -15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(25, -15);
    ctx.stroke();

    // Bonds
    ctx.strokeStyle = `rgba(200, 220, 255, ${bondGlow * 0.7})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-25, -15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(25, -15);
    ctx.stroke();

    // Oxygen (red, larger) with glow
    ctx.fillStyle = createRadialGradient(ctx, 0, 0, 0, 20, [
      { offset: 0, color: '#FF0000' },
      { offset: 0.5, color: '#FF3333' },
      { offset: 0.8, color: '#CC0000' },
      { offset: 1, color: 'rgba(204, 0, 0, 0)' }
    ]);
    drawCircle(ctx, 0, 0, 20);

    ctx.fillStyle = createRadialGradient(ctx, 0, 0, 0, 12, [
      { offset: 0, color: '#FFFFFF' },
      { offset: 0.3, color: '#FF4444' },
      { offset: 0.7, color: '#FF0000' },
      { offset: 1, color: '#CC0000' }
    ]);
    drawCircle(ctx, 0, 0, 12);

    // Hydrogen atoms (white, smaller) with glow
    [-25, 25].forEach(xPos => {
      ctx.fillStyle = createRadialGradient(ctx, xPos, -15, 0, 14, [
        { offset: 0, color: '#FFFFFF' },
        { offset: 0.5, color: '#E0E0FF' },
        { offset: 1, color: 'rgba(224, 224, 255, 0)' }
      ]);
      drawCircle(ctx, xPos, -15, 14);

      ctx.fillStyle = createRadialGradient(ctx, xPos, -15, 0, 8, [
        { offset: 0, color: '#FFFFFF' },
        { offset: 0.7, color: '#EEEEEE' },
        { offset: 1, color: '#DDDDDD' }
      ]);
      drawCircle(ctx, xPos, -15, 8);
    });

    ctx.restore();
  };

  // Benzene ring (C6H6) - hexagon with enhanced effects
  const drawBenzene = (centerX: number, centerY: number, rotation: number, scale: number = 1) => {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    const radius = 30;
    const angles = [0, 1, 2, 3, 4, 5].map(i => (i * Math.PI * 2) / 6);

    // Outer glow
    ctx.strokeStyle = 'rgba(128, 128, 200, 0.2)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    angles.forEach((angle, i) => {
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();

    // Ring bonds
    ctx.strokeStyle = 'rgba(160, 160, 160, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    angles.forEach((angle, i) => {
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();

    // Inner ring (aromatic)
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Carbon atoms with glow
    angles.forEach(angle => {
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      // Glow
      ctx.fillStyle = createRadialGradient(ctx, x, y, 0, 14, [
        { offset: 0, color: 'rgba(128, 128, 128, 0.4)' },
        { offset: 0.7, color: 'rgba(128, 128, 128, 0.2)' },
        { offset: 1, color: 'rgba(128, 128, 128, 0)' }
      ]);
      drawCircle(ctx, x, y, 14);

      // Atom
      ctx.fillStyle = createRadialGradient(ctx, x, y, 0, 8, [
        { offset: 0, color: '#A0A0A0' },
        { offset: 0.7, color: '#808080' },
        { offset: 1, color: '#666666' }
      ]);
      drawCircle(ctx, x, y, 8);
    });

    ctx.restore();
  };

  // CO2 molecule - linear with glow
  const drawCO2 = (centerX: number, centerY: number, rotation: number, scale: number = 1) => {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    // Bond glow
    ctx.strokeStyle = 'rgba(200, 200, 255, 0.3)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();

    // Bonds
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();

    // Carbon (gray, center) with glow
    ctx.fillStyle = createRadialGradient(ctx, 0, 0, 0, 16, [
      { offset: 0, color: 'rgba(128, 128, 128, 0.3)' },
      { offset: 0.7, color: 'rgba(128, 128, 128, 0.1)' },
      { offset: 1, color: 'rgba(128, 128, 128, 0)' }
    ]);
    drawCircle(ctx, 0, 0, 16);

    ctx.fillStyle = createRadialGradient(ctx, 0, 0, 0, 10, [
      { offset: 0, color: '#A0A0A0' },
      { offset: 0.7, color: '#808080' },
      { offset: 1, color: '#666666' }
    ]);
    drawCircle(ctx, 0, 0, 10);

    // Oxygen atoms (red) with glow
    [-30, 30].forEach(xPos => {
      ctx.fillStyle = createRadialGradient(ctx, xPos, 0, 0, 16, [
        { offset: 0, color: 'rgba(255, 0, 0, 0.4)' },
        { offset: 0.7, color: 'rgba(255, 0, 0, 0.2)' },
        { offset: 1, color: 'rgba(255, 0, 0, 0)' }
      ]);
      drawCircle(ctx, xPos, 0, 16);

      ctx.fillStyle = createRadialGradient(ctx, xPos, 0, 0, 10, [
        { offset: 0, color: '#FF4444' },
        { offset: 0.7, color: '#FF0000' },
        { offset: 1, color: '#CC0000' }
      ]);
      drawCircle(ctx, xPos, 0, 10);
    });

    ctx.restore();
  };

  // Draw multiple molecules at different positions with rotation and floating animation
  const float1 = Math.sin(time * 0.5) * 10;
  const float2 = Math.cos(time * 0.6) * 12;
  const float3 = Math.sin(time * 0.4) * 8;
  const float4 = Math.cos(time * 0.7) * 15;

  drawWater(width * 0.25, height * 0.3 + float1, time * 0.3, 1.2);
  drawBenzene(width * 0.65, height * 0.4 + float2, time * 0.2, 1.3);
  drawCO2(width * 0.45, height * 0.65 + float3, time * 0.25, 1.1);
  drawWater(width * 0.75, height * 0.7 + float4, time * 0.35, 1.0);
  drawBenzene(width * 0.15, height * 0.6 + float1, time * 0.28, 0.9);
};

/**
 * STAGE 5: COSMIC DUST GRAIN - Single growing dust particle
 */
export const cosmicDustGrain = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  // Slow rotation
  const rotation = time * 0.3;
  const pulse = 0.95 + Math.sin(time * 1.5) * 0.05;

  // Dust particle is getting denser, more material
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);

  // Outer dust haze
  ctx.fillStyle = createRadialGradient(ctx, 0, 0, 0, 50 * pulse, [
    { offset: 0, color: 'rgba(139, 69, 19, 0)' },
    { offset: 0.5, color: 'rgba(160, 82, 45, 0.15)' },
    { offset: 0.8, color: 'rgba(139, 69, 19, 0.08)' },
    { offset: 1, color: 'rgba(139, 69, 19, 0)' }
  ]);
  drawCircle(ctx, 0, 0, 50 * pulse);

  // Middle dust layer
  ctx.fillStyle = createRadialGradient(ctx, 0, 0, 0, 20 * pulse, [
    { offset: 0, color: 'rgba(205, 133, 63, 0.5)' },
    { offset: 0.6, color: 'rgba(160, 82, 45, 0.4)' },
    { offset: 1, color: 'rgba(139, 69, 19, 0)' }
  ]);
  drawCircle(ctx, 0, 0, 20 * pulse);

  // Dense core (irregular shape - not perfectly round)
  const dustParticles = 8;
  for (let i = 0; i < dustParticles; i++) {
    const angle = (i / dustParticles) * Math.PI * 2;
    const distance = 8 + Math.sin(i * 2 + time) * 3;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const size = 3 + Math.sin(i + time * 2) * 1;

    ctx.fillStyle = `rgba(${139 + i * 5}, ${69 + i * 3}, 19, 0.7)`;
    drawCircle(ctx, x, y, size);
  }

  // Central grain
  ctx.fillStyle = createRadialGradient(ctx, 0, 0, 0, 8, [
    { offset: 0, color: '#A0522D' },
    { offset: 0.6, color: '#8B4513' },
    { offset: 1, color: '#654321' }
  ]);
  drawCircle(ctx, 0, 0, 8);

  ctx.restore();
};

/**
 * STAGE 6: DUST CLOUDS - Enhanced nebula-like wispy clouds
 */
export const dustClouds = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);

  // Apply heavy blur for cloud effect
  ctx.filter = 'blur(30px)';

  // Create multiple overlapping cloud regions with more variety
  const clouds = [
    { x: width * 0.35, y: height * 0.4, radius: 120, color: 'rgba(139, 69, 19, 0.6)', speed: 0.2 },
    { x: width * 0.55, y: height * 0.5, radius: 140, color: 'rgba(160, 82, 45, 0.5)', speed: 0.15 },
    { x: width * 0.45, y: height * 0.6, radius: 110, color: 'rgba(205, 133, 63, 0.55)', speed: 0.18 },
    { x: width * 0.65, y: height * 0.4, radius: 100, color: 'rgba(210, 105, 30, 0.45)', speed: 0.22 },
    { x: width * 0.3, y: height * 0.6, radius: 90, color: 'rgba(184, 134, 11, 0.4)', speed: 0.25 },
    { x: width * 0.7, y: height * 0.55, radius: 85, color: 'rgba(165, 42, 42, 0.35)', speed: 0.17 },
    { x: width * 0.25, y: height * 0.45, radius: 75, color: 'rgba(178, 34, 34, 0.3)', speed: 0.20 }
  ];

  clouds.forEach((cloud, index) => {
    const offsetX = Math.sin(time * cloud.speed + index) * 15;
    const offsetY = Math.cos(time * (cloud.speed * 0.8) + index) * 15;
    const pulse = 0.9 + Math.sin(time * 0.5 + index) * 0.1;

    ctx.fillStyle = createRadialGradient(
      ctx,
      cloud.x + offsetX,
      cloud.y + offsetY,
      0,
      cloud.radius * pulse,
      [
        { offset: 0, color: cloud.color },
        { offset: 0.4, color: cloud.color.replace(/[\d.]+\)/, '0.4)') },
        { offset: 0.7, color: cloud.color.replace(/[\d.]+\)/, '0.15)') },
        { offset: 1, color: 'rgba(139, 69, 19, 0)' }
      ]
    );
    drawCircle(ctx, cloud.x + offsetX, cloud.y + offsetY, cloud.radius * pulse);
  });

  // Add brighter orange regions (illuminated by nearby stars)
  const hotSpots = [
    { x: width * 0.5, y: height * 0.35, radius: 70, color: 'rgba(255, 107, 53, 0.5)' },
    { x: width * 0.4, y: height * 0.55, radius: 60, color: 'rgba(255, 140, 0, 0.4)' }
  ];

  hotSpots.forEach((spot, index) => {
    const pulse = 0.95 + Math.sin(time * 0.8 + index) * 0.05;
    ctx.fillStyle = createRadialGradient(ctx, spot.x, spot.y, 0, spot.radius * pulse, [
      { offset: 0, color: spot.color },
      { offset: 0.5, color: spot.color.replace(/[\d.]+\)/, '0.25)') },
      { offset: 1, color: 'rgba(255, 107, 53, 0)' }
    ]);
    drawCircle(ctx, spot.x, spot.y, spot.radius * pulse);
  });

  ctx.filter = 'none';
};

/**
 * STAGE 7: PLANETESIMALS - Enhanced tumbling asteroids with debris
 */
export const planetesimals = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);

  // Define asteroid positions and properties
  const asteroids = [
    { x: width * 0.2, y: height * 0.3, size: 25, rotationSpeed: 0.5, debris: 8 },
    { x: width * 0.5, y: height * 0.25, size: 32, rotationSpeed: 0.7, debris: 12 },
    { x: width * 0.7, y: height * 0.4, size: 22, rotationSpeed: 0.4, debris: 6 },
    { x: width * 0.35, y: height * 0.6, size: 28, rotationSpeed: 0.6, debris: 10 },
    { x: width * 0.65, y: height * 0.65, size: 20, rotationSpeed: 0.8, debris: 7 },
    { x: width * 0.8, y: height * 0.7, size: 24, rotationSpeed: 0.55, debris: 9 },
    { x: width * 0.15, y: height * 0.55, size: 18, rotationSpeed: 0.45, debris: 5 }
  ];

  asteroids.forEach((asteroid, index) => {
    // Draw debris field around asteroid
    for (let i = 0; i < asteroid.debris; i++) {
      const angle = (i / asteroid.debris) * Math.PI * 2;
      const distance = asteroid.size * 2.5 + Math.sin(time + i) * 10;
      const debrisX = asteroid.x + Math.cos(angle + time * 0.3) * distance;
      const debrisY = asteroid.y + Math.sin(angle + time * 0.3) * distance;
      const debrisSize = 2 + Math.sin(time + i) * 1;

      ctx.fillStyle = `rgba(${105 + i * 5}, ${105 + i * 5}, ${105 + i * 5}, 0.6)`;
      drawCircle(ctx, debrisX, debrisY, debrisSize);
    }

    ctx.save();
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(time * asteroid.rotationSpeed + index);

    // Shadow/glow effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    // Draw irregular polygon (8 sides with random variation)
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, asteroid.size);
    gradient.addColorStop(0, '#888888');
    gradient.addColorStop(0.6, '#696969');
    gradient.addColorStop(1, '#555555');
    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const radiusVariation = 0.7 + (Math.sin(index * 10 + i * 2) * 0.3);
      const r = asteroid.size * radiusVariation;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Add some crater details
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    const craters = [
      { x: asteroid.size * 0.3, y: asteroid.size * 0.2, r: 3 },
      { x: -asteroid.size * 0.4, y: -asteroid.size * 0.3, r: 4 },
      { x: asteroid.size * 0.1, y: -asteroid.size * 0.4, r: 2 }
    ];
    craters.forEach(crater => {
      drawCircle(ctx, crater.x, crater.y, crater.r);
    });

    ctx.restore();
  });
};

/**
 * STAGE 8: PROTOPLANETS - Enhanced molten spheres with dramatic accretion disk
 */
export const protoplanets = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  // Dramatic pulsing
  const pulse = 0.96 + Math.sin(time * 1.2) * 0.04;
  const heatPulse = 0.9 + Math.sin(time * 2.5) * 0.1;

  // Outer heat distortion glow
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 140 * pulse, [
    { offset: 0, color: 'rgba(255, 69, 0, 0)' },
    { offset: 0.6, color: `rgba(255, 100, 50, ${0.15 * heatPulse})` },
    { offset: 0.85, color: `rgba(255, 69, 0, ${0.08 * heatPulse})` },
    { offset: 1, color: 'rgba(255, 69, 0, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 140 * pulse);

  // Accretion disk (enhanced with particles)
  ctx.save();
  ctx.translate(centerX, centerY);

  // Draw disk rings
  for (let ring = 8; ring > 0; ring--) {
    const ringRadius = 60 + ring * 12;
    const ringOpacity = (9 - ring) / 18;
    const ringThickness = 8;

    // Disk rotation
    ctx.rotate(time * 0.3 / ring);

    for (let i = 0; i < 360; i += 3) {
      const angle = (i * Math.PI) / 180;
      const x = ringRadius * Math.cos(angle);
      const y = ringRadius * Math.sin(angle) * 0.3; // Flatten for disk perspective
      const particleSize = 1 + Math.random() * 2;

      ctx.fillStyle = `rgba(${128 + ring * 10}, ${80 + ring * 5}, ${60}, ${ringOpacity})`;
      drawCircle(ctx, x, y, particleSize);
    }
  }
  ctx.restore();

  // Main protoplanet body - multiple atmospheric layers
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 90 * pulse, [
    { offset: 0, color: 'rgba(255, 100, 50, 0.2)' },
    { offset: 0.7, color: 'rgba(255, 69, 0, 0.4)' },
    { offset: 1, color: 'rgba(255, 69, 0, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 90 * pulse);

  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 70 * pulse, [
    { offset: 0, color: '#FFAA00' },
    { offset: 0.5, color: '#FF6347' },
    { offset: 0.8, color: '#FF4500' },
    { offset: 1, color: '#CC3300' }
  ]);
  drawCircle(ctx, centerX, centerY, 70 * pulse);

  // Molten core with bright spots
  const hotspots = [
    { x: centerX - 15, y: centerY - 10, r: 12 },
    { x: centerX + 20, y: centerY + 15, r: 15 },
    { x: centerX + 5, y: centerY - 20, r: 10 }
  ];

  hotspots.forEach((spot, idx) => {
    const spotPulse = 0.9 + Math.sin(time * 3 + idx) * 0.1;
    ctx.fillStyle = createRadialGradient(ctx, spot.x, spot.y, 0, spot.r * spotPulse, [
      { offset: 0, color: '#FFFFFF' },
      { offset: 0.4, color: '#FFFF88' },
      { offset: 0.8, color: '#FFAA00' },
      { offset: 1, color: 'rgba(255, 170, 0, 0)' }
    ]);
    drawCircle(ctx, spot.x, spot.y, spot.r * spotPulse);
  });

  // Surface cracks (molten veins)
  ctx.strokeStyle = `rgba(255, 255, 100, ${0.6 * heatPulse})`;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  const cracks = [
    [centerX - 30, centerY - 20, centerX - 10, centerY + 10],
    [centerX + 25, centerY - 15, centerX + 15, centerY + 20],
    [centerX, centerY - 35, centerX - 15, centerY - 10]
  ];

  cracks.forEach(crack => {
    ctx.beginPath();
    ctx.moveTo(crack[0], crack[1]);
    ctx.lineTo(crack[2], crack[3]);
    ctx.stroke();
  });

  // Particle jets/ejecta
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const distance = 75 + (time * 20 + i * 10) % 60;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const opacity = 1 - ((time * 20 + i * 10) % 60) / 60;

    ctx.fillStyle = `rgba(255, ${200 - distance}, 50, ${opacity * 0.6})`;
    drawCircle(ctx, x, y, 2);
  }
};

/**
 * STAGE 9: PLANETS - Enhanced diverse planet types
 */
export const planets = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  // Determine planet type based on level
  const planetTypes = ['terrestrial', 'gas-giant', 'ice-giant', 'ringed'];
  const planetType = planetTypes[Math.floor(levelData.level / 3) % 4];

  const rotation = time * 0.2;

  if (planetType === 'terrestrial') {
    // Earth-like planet with continents and atmosphere

    // Outer atmosphere glow
    ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 110, [
      { offset: 0, color: 'rgba(135, 206, 235, 0)' },
      { offset: 0.75, color: 'rgba(100, 180, 255, 0.3)' },
      { offset: 0.9, color: 'rgba(70, 130, 180, 0.5)' },
      { offset: 1, color: 'rgba(70, 130, 180, 0)' }
    ]);
    drawCircle(ctx, centerX, centerY, 110);

    // Planet body - ocean
    ctx.fillStyle = createRadialGradient(ctx, centerX - 20, centerY - 20, 0, 100, [
      { offset: 0, color: '#87CEEB' },
      { offset: 0.5, color: '#4682B4' },
      { offset: 1, color: '#1E4D7B' }
    ]);
    drawCircle(ctx, centerX, centerY, 80);

    // Continents (procedural)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    ctx.fillStyle = '#228B22';
    const continents = [
      { x: -30, y: -20, r: 25, rx: 35, ry: 20 },
      { x: 25, y: 10, r: 20, rx: 28, ry: 22 },
      { x: -15, y: 35, r: 18, rx: 25, ry: 15 }
    ];

    continents.forEach(cont => {
      ctx.beginPath();
      ctx.ellipse(cont.x, cont.y, cont.rx, cont.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ice caps
    ctx.fillStyle = '#FFFFFF';
    drawCircle(ctx, 0, -70, 15);
    drawCircle(ctx, 0, 70, 12);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const clouds = [
      { x: 40, y: -30, r: 15 },
      { x: -35, y: 25, r: 18 },
      { x: 10, y: -45, r: 12 }
    ];
    clouds.forEach(cloud => {
      drawCircle(ctx, cloud.x, cloud.y, cloud.r);
    });

    ctx.restore();

  } else if (planetType === 'gas-giant') {
    // Jupiter-like gas giant with bands

    // Outer glow
    ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 130, [
      { offset: 0, color: 'rgba(255, 200, 150, 0)' },
      { offset: 0.8, color: 'rgba(255, 180, 120, 0.2)' },
      { offset: 1, color: 'rgba(255, 160, 100, 0)' }
    ]);
    drawCircle(ctx, centerX, centerY, 130);

    // Planet body
    ctx.fillStyle = createRadialGradient(ctx, centerX - 30, centerY - 30, 0, 120, [
      { offset: 0, color: '#FFE4B5' },
      { offset: 0.6, color: '#DEB887' },
      { offset: 1, color: '#A0826D' }
    ]);
    drawCircle(ctx, centerX, centerY, 90);

    // Atmospheric bands
    ctx.save();
    ctx.translate(centerX, centerY);

    const bands = [
      { y: -50, height: 15, color: 'rgba(210, 180, 140, 0.6)' },
      { y: -25, height: 18, color: 'rgba(255, 200, 150, 0.5)' },
      { y: 0, height: 20, color: 'rgba(200, 160, 120, 0.7)' },
      { y: 25, height: 18, color: 'rgba(255, 190, 140, 0.5)' },
      { y: 50, height: 15, color: 'rgba(190, 150, 110, 0.6)' }
    ];

    bands.forEach((band, idx) => {
      const offset = Math.sin(time * (0.3 + idx * 0.1)) * 5;
      ctx.fillStyle = band.color;
      ctx.fillRect(-90 + offset, band.y - band.height / 2, 180, band.height);
    });

    // Great Red Spot
    const spotPulse = 0.95 + Math.sin(time * 0.8) * 0.05;
    ctx.fillStyle = createRadialGradient(ctx, 30, 10, 0, 25 * spotPulse, [
      { offset: 0, color: 'rgba(205, 92, 92, 0.8)' },
      { offset: 0.7, color: 'rgba(178, 34, 34, 0.6)' },
      { offset: 1, color: 'rgba(139, 0, 0, 0)' }
    ]);
    ctx.beginPath();
    ctx.ellipse(30, 10, 25 * spotPulse, 18 * spotPulse, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

  } else if (planetType === 'ice-giant') {
    // Neptune-like ice giant

    // Outer atmosphere
    ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 120, [
      { offset: 0, color: 'rgba(70, 130, 180, 0)' },
      { offset: 0.75, color: 'rgba(100, 149, 237, 0.3)' },
      { offset: 0.95, color: 'rgba(65, 105, 225, 0.4)' },
      { offset: 1, color: 'rgba(25, 25, 112, 0)' }
    ]);
    drawCircle(ctx, centerX, centerY, 120);

    // Planet body
    ctx.fillStyle = createRadialGradient(ctx, centerX - 25, centerY - 25, 0, 110, [
      { offset: 0, color: '#87CEEB' },
      { offset: 0.5, color: '#4682B4' },
      { offset: 1, color: '#191970' }
    ]);
    drawCircle(ctx, centerX, centerY, 85);

    // Atmospheric features (storms)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation * 0.8);

    // Dark spots
    const spots = [
      { x: -20, y: -30, r: 15 },
      { x: 35, y: 20, r: 12 }
    ];

    spots.forEach(spot => {
      ctx.fillStyle = 'rgba(25, 25, 112, 0.5)';
      drawCircle(ctx, spot.x, spot.y, spot.r);
    });

    // Bright clouds
    ctx.fillStyle = 'rgba(173, 216, 230, 0.4)';
    drawCircle(ctx, 10, -40, 18);
    drawCircle(ctx, -30, 25, 14);

    ctx.restore();

  } else {
    // Ringed planet (Saturn-like)

    // Draw rings first (behind planet)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation * 0.3);

    // Ring shadow on planet
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(-100, -5, 200, 10);

    // Rings
    const rings = [
      { inner: 95, outer: 110, color: 'rgba(210, 180, 140, 0.8)' },
      { inner: 112, outer: 118, color: 'rgba(160, 130, 100, 0.6)' },
      { inner: 120, outer: 140, color: 'rgba(220, 190, 150, 0.7)' },
      { inner: 142, outer: 155, color: 'rgba(180, 150, 120, 0.5)' }
    ];

    rings.forEach(ring => {
      ctx.beginPath();
      ctx.ellipse(0, 0, ring.outer, ring.outer * 0.15, 0, 0, Math.PI * 2);
      ctx.clip();

      ctx.beginPath();
      ctx.ellipse(0, 0, ring.inner, ring.inner * 0.15, 0, 0, Math.PI * 2);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = ring.color;
      ctx.fillRect(-ring.outer, -ring.outer * 0.15, ring.outer * 2, ring.outer * 0.3);

      ctx.restore();
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation * 0.3);
    });

    ctx.restore();

    // Planet body (pale yellow)
    ctx.fillStyle = createRadialGradient(ctx, centerX - 20, centerY - 20, 0, 100, [
      { offset: 0, color: '#FFFACD' },
      { offset: 0.6, color: '#FFE4B5' },
      { offset: 1, color: '#DEB887' }
    ]);
    drawCircle(ctx, centerX, centerY, 75);

    // Subtle bands
    ctx.fillStyle = 'rgba(210, 180, 140, 0.2)';
    ctx.fillRect(centerX - 75, centerY - 20, 150, 8);
    ctx.fillRect(centerX - 75, centerY + 15, 150, 8);
  }
};

/**
 * STAGE 10: PROTOSTAR - Enhanced pulsing stellar nebula with jets
 */
export const protostar = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  const pulse = 0.92 + Math.sin(time * 1.5) * 0.08;
  const intensePulse = 0.85 + Math.sin(time * 3) * 0.15;

  // Surrounding nebula
  ctx.filter = 'blur(20px)';
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 180 * pulse, [
    { offset: 0, color: 'rgba(139, 0, 0, 0)' },
    { offset: 0.5, color: 'rgba(178, 34, 34, 0.3)' },
    { offset: 0.8, color: 'rgba(205, 92, 92, 0.15)' },
    { offset: 1, color: 'rgba(205, 92, 92, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 180 * pulse);
  ctx.filter = 'none';

  // Bipolar jets (dramatic)
  ctx.save();
  ctx.translate(centerX, centerY);

  // Top jet
  const jetGradientTop = ctx.createLinearGradient(0, -100, 0, -height / 2);
  jetGradientTop.addColorStop(0, `rgba(255, 100, 50, ${0.6 * intensePulse})`);
  jetGradientTop.addColorStop(0.3, `rgba(255, 69, 0, ${0.4 * intensePulse})`);
  jetGradientTop.addColorStop(0.7, `rgba(205, 92, 92, ${0.2 * intensePulse})`);
  jetGradientTop.addColorStop(1, 'rgba(205, 92, 92, 0)');
  ctx.fillStyle = jetGradientTop;
  ctx.fillRect(-15 * pulse, -height / 2, 30 * pulse, height / 2 - 100);

  // Bottom jet
  const jetGradientBottom = ctx.createLinearGradient(0, 100, 0, height / 2);
  jetGradientBottom.addColorStop(0, `rgba(255, 100, 50, ${0.6 * intensePulse})`);
  jetGradientBottom.addColorStop(0.3, `rgba(255, 69, 0, ${0.4 * intensePulse})`);
  jetGradientBottom.addColorStop(0.7, `rgba(205, 92, 92, ${0.2 * intensePulse})`);
  jetGradientBottom.addColorStop(1, 'rgba(205, 92, 92, 0)');
  ctx.fillStyle = jetGradientBottom;
  ctx.fillRect(-15 * pulse, 100, 30 * pulse, height / 2 - 100);

  // Jet particles
  for (let i = 0; i < 20; i++) {
    const jetTime = (time * 40 + i * 15) % 150;
    const opacity = 1 - jetTime / 150;

    // Top jet particles
    ctx.fillStyle = `rgba(255, ${150 - jetTime}, 50, ${opacity * 0.8})`;
    drawCircle(ctx, (Math.sin(i) * 10), -100 - jetTime, 3);

    // Bottom jet particles
    drawCircle(ctx, (Math.sin(i + 5) * 10), 100 + jetTime, 3);
  }

  ctx.restore();

  // Accretion disk
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(time * 0.4);

  for (let r = 70; r < 140; r += 5) {
    const diskOpacity = (140 - r) / 140;
    for (let angle = 0; angle < 360; angle += 2) {
      const rad = (angle * Math.PI) / 180;
      const x = r * Math.cos(rad);
      const y = r * Math.sin(rad) * 0.25;

      ctx.fillStyle = `rgba(${200 + (r - 70) / 2}, ${100 - (r - 70) / 3}, 50, ${diskOpacity * 0.3})`;
      drawCircle(ctx, x, y, 1.5);
    }
  }

  ctx.restore();

  // Protostar core - intense pulsing
  // Outer corona
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 90 * pulse, [
    { offset: 0, color: 'rgba(255, 140, 0, 0)' },
    { offset: 0.6, color: `rgba(255, 100, 50, ${0.5 * intensePulse})` },
    { offset: 0.85, color: `rgba(255, 69, 0, ${0.3 * intensePulse})` },
    { offset: 1, color: 'rgba(255, 69, 0, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 90 * pulse);

  // Middle layer
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 60 * pulse, [
    { offset: 0, color: '#FFAA00' },
    { offset: 0.4, color: '#FF6347' },
    { offset: 0.7, color: '#FF4500' },
    { offset: 1, color: '#CD5C5C' }
  ]);
  drawCircle(ctx, centerX, centerY, 60 * pulse);

  // Core - brilliant center
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 35 * intensePulse, [
    { offset: 0, color: '#FFFFFF' },
    { offset: 0.3, color: '#FFFACD' },
    { offset: 0.6, color: '#FFD700' },
    { offset: 1, color: '#FFA500' }
  ]);
  drawCircle(ctx, centerX, centerY, 35 * intensePulse);

  // Hotspots
  const hotspots = [
    { x: centerX - 10, y: centerY - 8, r: 8 },
    { x: centerX + 12, y: centerY + 6, r: 10 }
  ];

  hotspots.forEach((spot, idx) => {
    const spotPulse = 0.9 + Math.sin(time * 4 + idx) * 0.1;
    ctx.fillStyle = createRadialGradient(ctx, spot.x, spot.y, 0, spot.r * spotPulse, [
      { offset: 0, color: '#FFFFFF' },
      { offset: 0.5, color: '#FFFFE0' },
      { offset: 1, color: 'rgba(255, 255, 224, 0)' }
    ]);
    drawCircle(ctx, spot.x, spot.y, spot.r * spotPulse);
  });
};

/**
 * STAGE 11: MAIN SEQUENCE STAR - Enhanced brilliant star with corona
 */
export const mainSequenceStar = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  const pulse = 0.97 + Math.sin(time * 0.8) * 0.03;
  const coronaPulse = 0.94 + Math.sin(time * 1.2) * 0.06;

  // Solar wind particles
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * Math.PI * 2;
    const distance = 90 + (time * 30 + i * 8) % 120;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const opacity = 1 - ((time * 30 + i * 8) % 120) / 120;

    ctx.fillStyle = `rgba(255, 255, ${150 + distance / 2}, ${opacity * 0.5})`;
    drawCircle(ctx, x, y, 2);
  }

  // Corona Layer 4 (outermost - very faint)
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 100, 220 * coronaPulse, [
    { offset: 0, color: 'rgba(255, 255, 255, 0)' },
    { offset: 0.2, color: 'rgba(255, 250, 240, 0.08)' },
    { offset: 0.6, color: 'rgba(255, 245, 220, 0.05)' },
    { offset: 1, color: 'rgba(255, 245, 220, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 220 * coronaPulse);

  // Corona Layer 3
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 80, 170 * coronaPulse, [
    { offset: 0, color: 'rgba(255, 255, 255, 0)' },
    { offset: 0.3, color: 'rgba(255, 235, 205, 0.15)' },
    { offset: 0.7, color: 'rgba(255, 228, 196, 0.1)' },
    { offset: 1, color: 'rgba(255, 228, 196, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 170 * coronaPulse);

  // Corona Layer 2
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 60, 130 * pulse, [
    { offset: 0, color: 'rgba(255, 255, 255, 0)' },
    { offset: 0.4, color: 'rgba(255, 250, 205, 0.3)' },
    { offset: 0.8, color: 'rgba(255, 239, 181, 0.2)' },
    { offset: 1, color: 'rgba(255, 239, 181, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 130 * pulse);

  // Corona Layer 1 (inner)
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 40, 100 * pulse, [
    { offset: 0, color: 'rgba(255, 255, 255, 0.2)' },
    { offset: 0.5, color: 'rgba(255, 250, 220, 0.4)' },
    { offset: 0.85, color: 'rgba(255, 245, 200, 0.2)' },
    { offset: 1, color: 'rgba(255, 245, 200, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 100 * pulse);

  // Chromosphere
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 70 * pulse, [
    { offset: 0, color: '#FFFEF0' },
    { offset: 0.6, color: '#FFF8DC' },
    { offset: 0.85, color: '#FFD700' },
    { offset: 1, color: '#FFA500' }
  ]);
  drawCircle(ctx, centerX, centerY, 70 * pulse);

  // Photosphere (surface)
  ctx.fillStyle = createRadialGradient(ctx, centerX - 15, centerY - 15, 0, 60 * pulse, [
    { offset: 0, color: '#FFFFFF' },
    { offset: 0.4, color: '#FFFACD' },
    { offset: 0.7, color: '#FFEFD5' },
    { offset: 1, color: '#FFD700' }
  ]);
  drawCircle(ctx, centerX, centerY, 50 * pulse);

  // Core (brilliant white-yellow)
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 35 * pulse, [
    { offset: 0, color: '#FFFFFF' },
    { offset: 0.5, color: '#FFFEF0' },
    { offset: 0.8, color: '#FFFACD' },
    { offset: 1, color: '#FFD700' }
  ]);
  drawCircle(ctx, centerX, centerY, 35 * pulse);

  // Sunspots (cooler regions)
  const sunspots = [
    { x: centerX + 20, y: centerY - 15, r: 5 },
    { x: centerX - 18, y: centerY + 12, r: 4 },
    { x: centerX + 8, y: centerY + 20, r: 3 }
  ];

  sunspots.forEach(spot => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    drawCircle(ctx, spot.x, spot.y, spot.r);
  });

  // Solar flares (occasional bright flashes)
  const flareIntensity = Math.max(0, Math.sin(time * 2.5) * 0.8);
  if (flareIntensity > 0.5) {
    const flareAngle = time * 2;
    const flareX = centerX + Math.cos(flareAngle) * 55;
    const flareY = centerY + Math.sin(flareAngle) * 55;

    ctx.fillStyle = createRadialGradient(ctx, flareX, flareY, 0, 25 * flareIntensity, [
      { offset: 0, color: `rgba(255, 255, 255, ${flareIntensity})` },
      { offset: 0.5, color: `rgba(255, 245, 200, ${flareIntensity * 0.6})` },
      { offset: 1, color: 'rgba(255, 245, 200, 0)' }
    ]);
    drawCircle(ctx, flareX, flareY, 25 * flareIntensity);
  }
};

/**
 * STAGE 12: BINARY STARS - Enhanced orbiting pair with gravitational effects
 */
export const binaryStars = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  // Orbital parameters
  const orbitRadius = 70;
  const angle1 = time * 0.6;
  const angle2 = angle1 + Math.PI; // 180 degrees apart

  const star1X = centerX + Math.cos(angle1) * orbitRadius;
  const star1Y = centerY + Math.sin(angle1) * orbitRadius;
  const star2X = centerX + Math.cos(angle2) * orbitRadius;
  const star2Y = centerY + Math.sin(angle2) * orbitRadius;

  // Gravitational bridge (matter stream between stars)
  const bridgeGradient = ctx.createLinearGradient(star1X, star1Y, star2X, star2Y);
  bridgeGradient.addColorStop(0, 'rgba(255, 210, 161, 0.3)');
  bridgeGradient.addColorStop(0.5, 'rgba(255, 204, 111, 0.15)');
  bridgeGradient.addColorStop(1, 'rgba(255, 210, 161, 0.3)');

  ctx.strokeStyle = bridgeGradient;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(star1X, star1Y);

  // Curved bridge
  const midX = (star1X + star2X) / 2;
  const midY = (star1Y + star2Y) / 2;
  const perpAngle = Math.atan2(star2Y - star1Y, star2X - star1X) + Math.PI / 2;
  const curveOffset = 20;
  const controlX = midX + Math.cos(perpAngle) * curveOffset;
  const controlY = midY + Math.sin(perpAngle) * curveOffset;

  ctx.quadraticCurveTo(controlX, controlY, star2X, star2Y);
  ctx.stroke();

  // Accretion stream particles
  for (let i = 0; i < 30; i++) {
    const t = (time * 5 + i * 3) % 10 / 10;
    const streamX = star1X + (star2X - star1X) * t;
    const streamY = star1Y + (star2Y - star1Y) * t + Math.sin(t * Math.PI * 2) * curveOffset;
    const opacity = Math.sin(t * Math.PI);

    ctx.fillStyle = `rgba(255, 220, 150, ${opacity * 0.6})`;
    drawCircle(ctx, streamX, streamY, 2);
  }

  // Draw orbit path (faint)
  ctx.strokeStyle = 'rgba(255, 210, 161, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
  ctx.stroke();

  const pulse1 = 0.96 + Math.sin(time * 2) * 0.04;
  const pulse2 = 0.96 + Math.sin(time * 2.3) * 0.04;

  // Star 1 (Yellow-white, slightly larger)
  // Outer corona
  ctx.fillStyle = createRadialGradient(ctx, star1X, star1Y, 0, 80 * pulse1, [
    { offset: 0, color: 'rgba(255, 255, 255, 0)' },
    { offset: 0.5, color: 'rgba(255, 240, 200, 0.25)' },
    { offset: 0.85, color: 'rgba(255, 230, 180, 0.12)' },
    { offset: 1, color: 'rgba(255, 230, 180, 0)' }
  ]);
  drawCircle(ctx, star1X, star1Y, 80 * pulse1);

  // Middle layer
  ctx.fillStyle = createRadialGradient(ctx, star1X, star1Y, 0, 50 * pulse1, [
    { offset: 0, color: '#FFFFFF' },
    { offset: 0.5, color: '#FFFACD' },
    { offset: 0.8, color: '#FFD2A1' },
    { offset: 1, color: '#FFA500' }
  ]);
  drawCircle(ctx, star1X, star1Y, 40 * pulse1);

  // Core
  ctx.fillStyle = createRadialGradient(ctx, star1X, star1Y, 0, 25 * pulse1, [
    { offset: 0, color: '#FFFFFF' },
    { offset: 0.6, color: '#FFFEF0' },
    { offset: 1, color: '#FFD700' }
  ]);
  drawCircle(ctx, star1X, star1Y, 25 * pulse1);

  // Star 2 (Orange, slightly smaller)
  // Outer corona
  ctx.fillStyle = createRadialGradient(ctx, star2X, star2Y, 0, 70 * pulse2, [
    { offset: 0, color: 'rgba(255, 165, 0, 0)' },
    { offset: 0.5, color: 'rgba(255, 200, 100, 0.25)' },
    { offset: 0.85, color: 'rgba(255, 180, 80, 0.12)' },
    { offset: 1, color: 'rgba(255, 180, 80, 0)' }
  ]);
  drawCircle(ctx, star2X, star2Y, 70 * pulse2);

  // Middle layer
  ctx.fillStyle = createRadialGradient(ctx, star2X, star2Y, 0, 45 * pulse2, [
    { offset: 0, color: '#FFEEAA' },
    { offset: 0.5, color: '#FFD2A1' },
    { offset: 0.8, color: '#FFCC6F' },
    { offset: 1, color: '#FF8C00' }
  ]);
  drawCircle(ctx, star2X, star2Y, 35 * pulse2);

  // Core
  ctx.fillStyle = createRadialGradient(ctx, star2X, star2Y, 0, 22 * pulse2, [
    { offset: 0, color: '#FFF8DC' },
    { offset: 0.6, color: '#FFD700' },
    { offset: 1, color: '#FFA500' }
  ]);
  drawCircle(ctx, star2X, star2Y, 22 * pulse2);

  // Barycenter marker (subtle)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  drawCircle(ctx, centerX, centerY, 5);
};

/**
 * STAGE 13: STAR CLUSTER - Central star with companions
 */
export const starCluster = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  // Define companion stars orbiting the central star
  const companions = [
    { distance: 60, speed: 0.4, size: 15, color: '#AABfFF', phase: 0 },
    { distance: 90, speed: 0.3, size: 12, color: '#FFE4B5', phase: Math.PI * 0.5 },
    { distance: 110, speed: 0.25, size: 14, color: '#FFA07A', phase: Math.PI },
    { distance: 130, speed: 0.2, size: 11, color: '#FFFFFF', phase: Math.PI * 1.5 },
    { distance: 75, speed: 0.35, size: 10, color: '#87CEEB', phase: Math.PI * 0.25 }
  ];

  // Draw companion stars first (behind central star visually)
  companions.forEach((star, idx) => {
    const angle = time * star.speed + star.phase;
    const x = centerX + Math.cos(angle) * star.distance;
    const y = centerY + Math.sin(angle) * star.distance;
    const twinkle = 0.9 + Math.sin(time * 3 + idx) * 0.1;

    // Star glow
    ctx.fillStyle = createRadialGradient(ctx, x, y, 0, star.size * 3 * twinkle, [
      { offset: 0, color: star.color.replace(')', ', 0)').replace('rgb', 'rgba') },
      { offset: 0.4, color: star.color.replace(')', ', 0.3)').replace('rgb', 'rgba') },
      { offset: 0.8, color: star.color.replace(')', ', 0.1)').replace('rgb', 'rgba') },
      { offset: 1, color: star.color.replace(')', ', 0)').replace('rgb', 'rgba') }
    ]);
    drawCircle(ctx, x, y, star.size * 3 * twinkle);

    // Star core
    ctx.fillStyle = createRadialGradient(ctx, x, y, 0, star.size * twinkle, [
      { offset: 0, color: '#FFFFFF' },
      { offset: 0.5, color: star.color },
      { offset: 1, color: star.color }
    ]);
    drawCircle(ctx, x, y, star.size * twinkle);

    // Bright center
    ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * twinkle})`;
    drawCircle(ctx, x, y, star.size * 0.4 * twinkle);
  });

  // Central dominant star (brightest)
  const centralPulse = 0.96 + Math.sin(time * 0.8) * 0.04;

  // Outer corona
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 100 * centralPulse, [
    { offset: 0, color: 'rgba(255, 255, 255, 0)' },
    { offset: 0.5, color: 'rgba(255, 245, 220, 0.2)' },
    { offset: 0.8, color: 'rgba(255, 235, 200, 0.1)' },
    { offset: 1, color: 'rgba(255, 235, 200, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 100 * centralPulse);

  // Middle glow
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 60 * centralPulse, [
    { offset: 0, color: '#FFFEF0' },
    { offset: 0.5, color: '#FFF8DC' },
    { offset: 0.8, color: '#FFD700' },
    { offset: 1, color: 'rgba(255, 215, 0, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 60 * centralPulse);

  // Core
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 30 * centralPulse, [
    { offset: 0, color: '#FFFFFF' },
    { offset: 0.5, color: '#FFFEF0' },
    { offset: 0.8, color: '#FFFACD' },
    { offset: 1, color: '#FFD700' }
  ]);
  drawCircle(ctx, centerX, centerY, 30 * centralPulse);

  // Brilliant white center
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 12 * centralPulse, [
    { offset: 0, color: '#FFFFFF' },
    { offset: 0.7, color: '#FFFEF0' },
    { offset: 1, color: '#FFF8DC' }
  ]);
  drawCircle(ctx, centerX, centerY, 12 * centralPulse);

  // Cluster glow (overall cluster atmosphere)
  ctx.fillStyle = createRadialGradient(ctx, centerX, centerY, 0, 160, [
    { offset: 0, color: 'rgba(170, 191, 255, 0)' },
    { offset: 0.7, color: 'rgba(170, 191, 255, 0.03)' },
    { offset: 1, color: 'rgba(170, 191, 255, 0)' }
  ]);
  drawCircle(ctx, centerX, centerY, 160);
};

/**
 * STAGE 14: EMISSION NEBULA - Enhanced vibrant cosmic clouds
 */
export const emissionNebula = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);

  ctx.filter = 'blur(25px)';

  // Layer 1: Red hydrogen emission (H-alpha) - Enhanced
  const redClouds = [
    { x: width * 0.3, y: height * 0.4, r: 140, intensity: 0.7 },
    { x: width * 0.5, y: height * 0.6, r: 120, intensity: 0.6 },
    { x: width * 0.7, y: height * 0.35, r: 100, intensity: 0.5 }
  ];

  redClouds.forEach((cloud, idx) => {
    const offset = Math.sin(time * 0.15 + idx) * 15;
    const pulse = 0.95 + Math.sin(time * 0.3 + idx) * 0.05;

    ctx.fillStyle = createRadialGradient(
      ctx,
      cloud.x + offset,
      cloud.y + Math.cos(time * 0.12 + idx) * 15,
      0,
      cloud.r * pulse,
      [
        { offset: 0, color: `rgba(255, 0, 64, ${cloud.intensity})` },
        { offset: 0.4, color: `rgba(255, 105, 106, ${cloud.intensity * 0.6})` },
        { offset: 0.7, color: `rgba(220, 80, 90, ${cloud.intensity * 0.3})` },
        { offset: 1, color: 'rgba(255, 0, 64, 0)' }
      ]
    );
    drawCircle(ctx, cloud.x + offset, cloud.y + Math.cos(time * 0.12 + idx) * 15, cloud.r * pulse);
  });

  // Layer 2: Cyan/green oxygen emission (OIII) - Enhanced
  const cyanClouds = [
    { x: width * 0.45, y: height * 0.3, r: 110, intensity: 0.6 },
    { x: width * 0.65, y: height * 0.55, r: 95, intensity: 0.55 },
    { x: width * 0.25, y: height * 0.65, r: 85, intensity: 0.5 }
  ];

  cyanClouds.forEach((cloud, idx) => {
    const offset = Math.sin(time * 0.18 + idx + 2) * 12;
    const pulse = 0.96 + Math.sin(time * 0.35 + idx + 1) * 0.04;

    ctx.fillStyle = createRadialGradient(
      ctx,
      cloud.x + offset,
      cloud.y + Math.cos(time * 0.14 + idx + 2) * 12,
      0,
      cloud.r * pulse,
      [
        { offset: 0, color: `rgba(0, 255, 178, ${cloud.intensity})` },
        { offset: 0.4, color: `rgba(100, 240, 200, ${cloud.intensity * 0.6})` },
        { offset: 0.7, color: `rgba(50, 200, 180, ${cloud.intensity * 0.3})` },
        { offset: 1, color: 'rgba(0, 255, 178, 0)' }
      ]
    );
    drawCircle(ctx, cloud.x + offset, cloud.y + Math.cos(time * 0.14 + idx + 2) * 12, cloud.r * pulse);
  });

  // Layer 3: Magenta/pink sulfur emission - Enhanced
  const magentaClouds = [
    { x: width * 0.55, y: height * 0.45, r: 100, intensity: 0.55 },
    { x: width * 0.35, y: height * 0.55, r: 90, intensity: 0.5 },
    { x: width * 0.75, y: height * 0.6, r: 75, intensity: 0.45 }
  ];

  magentaClouds.forEach((cloud, idx) => {
    const offset = Math.sin(time * 0.12 + idx + 4) * 18;
    const pulse = 0.94 + Math.sin(time * 0.4 + idx + 2) * 0.06;

    ctx.fillStyle = createRadialGradient(
      ctx,
      cloud.x + offset,
      cloud.y + Math.cos(time * 0.1 + idx + 4) * 18,
      0,
      cloud.r * pulse,
      [
        { offset: 0, color: `rgba(255, 0, 178, ${cloud.intensity})` },
        { offset: 0.4, color: `rgba(255, 106, 186, ${cloud.intensity * 0.6})` },
        { offset: 0.7, color: `rgba(200, 80, 160, ${cloud.intensity * 0.3})` },
        { offset: 1, color: 'rgba(255, 0, 178, 0)' }
      ]
    );
    drawCircle(ctx, cloud.x + offset, cloud.y + Math.cos(time * 0.1 + idx + 4) * 18, cloud.r * pulse);
  });

  // Add pillars effect (darker dense regions)
  ctx.filter = 'blur(15px)';
  const pillars = [
    { x: width * 0.4, y: height * 0.5, width: 40, height: 120 },
    { x: width * 0.6, y: height * 0.45, width: 35, height: 140 }
  ];

  pillars.forEach((pillar, idx) => {
    const sway = Math.sin(time * 0.2 + idx) * 10;
    ctx.fillStyle = `rgba(60, 20, 40, 0.5)`;
    ctx.fillRect(
      pillar.x - pillar.width / 2 + sway,
      pillar.y - pillar.height / 2,
      pillar.width,
      pillar.height
    );
  });

  // Embedded stars (bright points)
  ctx.filter = 'none';
  const stars = [
    { x: width * 0.35, y: height * 0.3 },
    { x: width * 0.55, y: height * 0.5 },
    { x: width * 0.7, y: height * 0.65 },
    { x: width * 0.25, y: height * 0.7 },
    { x: width * 0.65, y: height * 0.4 }
  ];

  stars.forEach((star, idx) => {
    const twinkle = 0.7 + Math.sin(time * 3 + idx) * 0.3;
    ctx.fillStyle = createRadialGradient(ctx, star.x, star.y, 0, 8 * twinkle, [
      { offset: 0, color: '#FFFFFF' },
      { offset: 0.5, color: 'rgba(255, 255, 255, 0.8)' },
      { offset: 1, color: 'rgba(255, 255, 255, 0)' }
    ]);
    drawCircle(ctx, star.x, star.y, 8 * twinkle);
  });

  ctx.filter = 'none';
};

/**
 * STAGE 15: SPIRAL GALAXY - Enhanced majestic rotating galaxy
 */
export const spiralGalaxy = (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(centerX, centerY);
  const rotation = time * 0.08;
  ctx.rotate(rotation);

  // Draw galactic halo (faint outer glow)
  ctx.fillStyle = createRadialGradient(ctx, 0, 0, 0, 200, [
    { offset: 0, color: 'rgba(170, 191, 255, 0.05)' },
    { offset: 0.5, color: 'rgba(170, 191, 255, 0.02)' },
    { offset: 1, color: 'rgba(170, 191, 255, 0)' }
  ]);
  drawCircle(ctx, 0, 0, 200);

  // Draw spiral arms
  const drawSpiralArm = (startAngle: number, color: string, blur: number, density: number = 1) => {
    const a = 5;
    const b = 0.18;

    ctx.filter = `blur(${blur}px)`;

    for (let theta = 0; theta < Math.PI * 4.5; theta += 0.05 / density) {
      const r = a * Math.exp(b * theta);
      if (r > 180) break;

      const x = r * Math.cos(theta + startAngle);
      const y = r * Math.sin(theta + startAngle);

      // Variation in star density
      const variance = Math.sin(theta * 10) * 0.5 + 0.5;
      const opacity = 0.3 + variance * 0.4;
      const size = 1 + variance * 2;

      ctx.fillStyle = color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
      drawCircle(ctx, x, y, size);
    }

    ctx.filter = 'none';
  };

  // Background arms (wider, blurrier)
  drawSpiralArm(0, 'rgb(100, 120, 180)', 12, 0.7);
  drawSpiralArm(Math.PI, 'rgb(100, 120, 180)', 12, 0.7);

  // Main spiral arms (two primary arms)
  drawSpiralArm(0, 'rgb(170, 191, 255)', 8, 1.2);
  drawSpiralArm(Math.PI, 'rgb(170, 191, 255)', 8, 1.2);

  // Dust lanes (darker regions between arms)
  drawSpiralArm(Math.PI * 0.5, 'rgb(80, 60, 50)', 15, 0.5);
  drawSpiralArm(Math.PI * 1.5, 'rgb(80, 60, 50)', 15, 0.5);

  // Star forming regions (pink/red knots)
  const starFormingRegions = [
    { theta: 2, r: 60, color: 'rgba(255, 100, 150, 0.6)' },
    { theta: 3.5, r: 90, color: 'rgba(255, 120, 140, 0.5)' },
    { theta: 5, r: 120, color: 'rgba(255, 110, 160, 0.6)' },
    { theta: 6.5, r: 150, color: 'rgba(255, 100, 155, 0.5)' }
  ];

  starFormingRegions.forEach((region, idx) => {
    const pulse = 0.9 + Math.sin(time + idx) * 0.1;
    const a = 5;
    const b = 0.18;
    const r = a * Math.exp(b * region.theta);
    const x = r * Math.cos(region.theta);
    const y = r * Math.sin(region.theta);

    ctx.filter = 'blur(10px)';
    ctx.fillStyle = region.color;
    drawCircle(ctx, x, y, 15 * pulse);
    ctx.filter = 'none';
  });

  // Individual bright stars scattered throughout (pre-generated for performance)
  spiralGalaxyStars.forEach((star) => {
    const x = star.distance * Math.cos(star.angle);
    const y = star.distance * Math.sin(star.angle);

    if (star.brightness > 0.85) {
      const twinkle = 0.7 + Math.sin(time * 5 + star.twinkleOffset) * 0.3;
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`;
      drawCircle(ctx, x, y, 1.5);
    }
  });

  // Central bulge (dense core with supermassive black hole region)
  ctx.filter = 'blur(8px)';
  ctx.fillStyle = createRadialGradient(ctx, 0, 0, 0, 60, [
    { offset: 0, color: 'rgba(255, 240, 200, 0.8)' },
    { offset: 0.4, color: 'rgba(255, 220, 180, 0.6)' },
    { offset: 0.7, color: 'rgba(200, 180, 150, 0.4)' },
    { offset: 1, color: 'rgba(170, 191, 255, 0)' }
  ]);
  drawCircle(ctx, 0, 0, 60);
  ctx.filter = 'none';

  ctx.fillStyle = createRadialGradient(ctx, 0, 0, 0, 35, [
    { offset: 0, color: 'rgba(255, 245, 220, 0.9)' },
    { offset: 0.6, color: 'rgba(255, 235, 200, 0.7)' },
    { offset: 1, color: 'rgba(255, 220, 180, 0)' }
  ]);
  drawCircle(ctx, 0, 0, 35);

  // Bright core
  const corePulse = 0.95 + Math.sin(time * 0.5) * 0.05;
  ctx.fillStyle = createRadialGradient(ctx, 0, 0, 0, 20 * corePulse, [
    { offset: 0, color: 'rgba(255, 255, 255, 1)' },
    { offset: 0.5, color: 'rgba(255, 250, 220, 0.9)' },
    { offset: 1, color: 'rgba(255, 240, 200, 0)' }
  ]);
  drawCircle(ctx, 0, 0, 20 * corePulse);

  ctx.restore();
};

// Export all renderers
export const CanvasRenderers = {
  quantumFluctuation,
  fundamentalParticle,
  atoms,
  molecules,
  cosmicDustGrain,
  dustClouds,
  planetesimals,
  protoplanets,
  planets,
  protostar,
  mainSequenceStar,
  binaryStars,
  starCluster,
  emissionNebula,
  spiralGalaxy
};
