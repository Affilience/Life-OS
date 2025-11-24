/**
 * Simplified particle system for avatar effects
 * Custom implementation to avoid library compatibility issues
 */

import * as PIXI from 'pixi.js';

// Particle class
class Particle {
  sprite: PIXI.Sprite;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  rotation: number;

  constructor(texture: PIXI.Texture, x: number, y: number) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.x = x;
    this.sprite.y = y;
    this.vx = 0;
    this.vy = 0;
    this.life = 1;
    this.maxLife = 1;
    this.rotation = 0;
  }

  update(delta: number) {
    this.sprite.x += this.vx * delta;
    this.sprite.y += this.vy * delta;
    this.sprite.rotation += this.rotation * delta;
    this.life -= delta / 60;
    this.sprite.alpha = Math.max(0, this.life / this.maxLife);
    return this.life > 0;
  }
}

// Create particle texture
function createParticleTexture(size: number = 8, color: number = 0xFFFFFF): PIXI.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const r = ((color >> 16) & 0xFF);
  const g = ((color >> 8) & 0xFF);
  const b = (color & 0xFF);

  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return PIXI.Texture.from(canvas);
}

/**
 * Leaf particle emitter
 */
export function createLeafEmitter(container: PIXI.Container, seasonColor: number = 0x6EE7B7) {
  const texture = createParticleTexture(12, seasonColor);
  const particles: Particle[] = [];
  let emitting = false;
  let timer = 0;

  return {
    start: () => { emitting = true; },
    stop: () => { emitting = false; },
    update: (delta: number) => {
      timer += delta;

      // Spawn new particles
      if (emitting && timer > 0.2) {
        timer = 0;
        const p = new Particle(texture, (Math.random() - 0.5) * 80, 20 + Math.random() * 60);
        p.sprite.scale.set(0.4 + Math.random() * 0.3);
        p.vy = -15 - Math.random() * 10;
        p.vx = (Math.random() - 0.5) * 5;
        p.rotation = (Math.random() - 0.5) * 0.1;
        p.maxLife = 3 + Math.random() * 2;
        p.life = p.maxLife;
        container.addChild(p.sprite);
        particles.push(p);
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update(delta * 0.016)) {
          container.removeChild(particles[i].sprite);
          particles[i].sprite.destroy();
          particles.splice(i, 1);
        }
      }
    }
  };
}

/**
 * XP burst emitter
 */
export function createXPBurstEmitter(container: PIXI.Container) {
  const texture = createParticleTexture(10, 0x7A5CFF);
  const particles: Particle[] = [];

  return {
    burst: () => {
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const speed = 100 + Math.random() * 100;
        const p = new Particle(texture, 0, 0);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.maxLife = 0.8 + Math.random() * 0.4;
        p.life = p.maxLife;
        p.sprite.scale.set(0.5);
        container.addChild(p.sprite);
        particles.push(p);
      }
    },
    update: (delta: number) => {
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].vx *= 0.95;
        particles[i].vy *= 0.95;
        if (!particles[i].update(delta * 0.016)) {
          container.removeChild(particles[i].sprite);
          particles[i].sprite.destroy();
          particles.splice(i, 1);
        }
      }
    }
  };
}

/**
 * Nebula/star emitter
 */
export function createNebulaEmitter(container: PIXI.Container) {
  const texture = createParticleTexture(6, 0xFFFFFF);
  const particles: Particle[] = [];
  let emitting = false;
  let timer = 0;

  return {
    start: () => { emitting = true; },
    stop: () => { emitting = false; },
    update: (delta: number) => {
      timer += delta;

      // Spawn stars
      if (emitting && timer > 0.3 && particles.length < 120) {
        timer = 0;
        const p = new Particle(
          texture,
          (Math.random() - 0.5) * 520,
          (Math.random() - 0.5) * 360
        );
        p.sprite.scale.set(0.1 + Math.random() * 0.2);
        p.vy = 5 + Math.random() * 10;
        p.vx = (Math.random() - 0.5) * 3;
        p.maxLife = 8 + Math.random() * 4;
        p.life = p.maxLife;
        p.sprite.alpha = 0.3 + Math.random() * 0.3;
        container.addChild(p.sprite);
        particles.push(p);
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update(delta * 0.016)) {
          container.removeChild(particles[i].sprite);
          particles[i].sprite.destroy();
          particles.splice(i, 1);
        }
      }
    }
  };
}
