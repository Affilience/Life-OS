import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { ShockwaveFilter } from '@pixi/filter-shockwave';
import { sounds } from '../../services/microInteractions/sounds';
import {
  weaponAbilitySounds,
  elementalSounds,
  weaponAttackSounds,
  combatStateSounds,
  legendaryWeaponSounds,
  playCombatSound
} from '../../services/combatSounds';

/**
 * CombatCanvas - Professional GPU-accelerated combat effects
 *
 * Inspired by games like Hades, Dead Cells, and Hollow Knight
 * Features: Bezier slashes, flying projectiles, layered particles, screen juice
 */
const CombatCanvas = forwardRef(({
  width = 600,
  height = 400,
  onReady,
  className = ''
}, ref) => {
  const containerRef = useRef(null);
  const appRef = useRef(null);

  // Initialize PixiJS
  useEffect(() => {
    if (!containerRef.current || appRef.current) return;

    const app = new PIXI.Application({
      width,
      height,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    containerRef.current.appendChild(app.view);
    appRef.current = app;

    // Create render layers
    const layers = {
      background: new PIXI.Container(),
      projectiles: new PIXI.Container(),
      effects: new PIXI.Container(),
      particles: new PIXI.Container(),
      flash: new PIXI.Container(),
    };

    Object.values(layers).forEach(layer => app.stage.addChild(layer));
    appRef.current.layers = layers;

    // Screen flash overlay
    const flashOverlay = new PIXI.Graphics();
    flashOverlay.beginFill(0xffffff, 1);
    flashOverlay.drawRect(0, 0, width, height);
    flashOverlay.endFill();
    flashOverlay.alpha = 0;
    layers.flash.addChild(flashOverlay);
    appRef.current.flashOverlay = flashOverlay;

    if (onReady) onReady(app);

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, [width, height, onReady]);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  // Quadratic bezier point
  const getBezierPoint = (t, p0, p1, p2) => {
    const mt = 1 - t;
    return {
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    };
  };

  // Get perpendicular vector for thickness
  const getPerpendicular = (p1, p2, thickness) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return {
      x: (-dy / len) * thickness,
      y: (dx / len) * thickness,
    };
  };

  // Ease functions
  const easeOutQuad = (t) => t * (2 - t);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  // ============================================
  // SCREEN EFFECTS
  // ============================================

  const screenShake = useCallback((intensity = 10, duration = 200) => {
    const app = appRef.current;
    if (!app) return;

    const startTime = Date.now();
    const originalX = app.stage.x;
    const originalY = app.stage.y;

    const shake = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const decay = 1 - easeOutQuad(progress);
        const currentIntensity = intensity * decay;
        // Add some randomness to shake pattern
        const angle = Math.random() * Math.PI * 2;
        app.stage.x = originalX + Math.cos(angle) * currentIntensity;
        app.stage.y = originalY + Math.sin(angle) * currentIntensity;
        requestAnimationFrame(shake);
      } else {
        app.stage.x = originalX;
        app.stage.y = originalY;
      }
    };
    shake();
  }, []);

  const screenFlash = useCallback((color = 0xffffff, duration = 100, maxAlpha = 0.6) => {
    const app = appRef.current;
    if (!app || !app.flashOverlay) return;

    const flash = app.flashOverlay;
    flash.clear();
    flash.beginFill(color, 1);
    flash.drawRect(0, 0, width, height);
    flash.endFill();
    flash.alpha = maxAlpha;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        flash.alpha = maxAlpha * (1 - easeOutCubic(elapsed / duration));
        requestAnimationFrame(animate);
      } else {
        flash.alpha = 0;
      }
    };
    animate();
  }, [width, height]);

  // Freeze frame effect (brief pause for impact)
  const freezeFrame = useCallback((duration = 50) => {
    const app = appRef.current;
    if (!app) return;

    app.ticker.speed = 0.1;
    setTimeout(() => {
      app.ticker.speed = 1;
    }, duration);
  }, []);

  // ============================================
  // DYNAMIC SLASH EFFECTS
  // ============================================

  // Create an animated slash that "draws" across the screen with motion trails
  const createDynamicSlash = useCallback((startX, startY, endX, endY, options = {}) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const {
      color = 0x00ffff,
      glowColor = 0x00ffff,
      coreColor = 0xffffff,
      maxThickness = 25,
      minThickness = 3,
      duration = 300,
      curvature = 0.4,
      swingSpeed = 0.08, // How fast the slash animates (0-1 per frame)
    } = options;

    const container = new PIXI.Container();
    app.layers.effects.addChild(container);

    // Calculate bezier control points - add some randomness for organic feel
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const dx = endX - startX;
    const dy = endY - startY;
    const len = Math.sqrt(dx * dx + dy * dy);

    // Randomize curve direction and intensity
    const curveDir = Math.random() > 0.5 ? 1 : -1;
    const curveOffset = len * curvature * curveDir * (0.8 + Math.random() * 0.4);
    const controlX = midX + (-dy / len) * curveOffset;
    const controlY = midY + (dx / len) * curveOffset;

    const p0 = { x: startX, y: startY };
    const p1 = { x: controlX, y: controlY };
    const p2 = { x: endX, y: endY };

    // Main slash graphics
    const mainSlash = new PIXI.Graphics();
    const coreSlash = new PIXI.Graphics();
    const glowSlash = new PIXI.Graphics();

    container.addChild(glowSlash);
    container.addChild(mainSlash);
    container.addChild(coreSlash);

    // Speed lines container
    const speedLines = new PIXI.Container();
    container.addChild(speedLines);

    let currentT = 0;
    let phase = 'drawing'; // drawing, holding, fading
    let fadeProgress = 0;

    const drawSlashAtT = (t) => {
      mainSlash.clear();
      coreSlash.clear();
      glowSlash.clear();

      if (t <= 0) return;

      const segments = Math.floor(t * 30) + 1;
      const topPoints = [];
      const bottomPoints = [];
      const coreTopPoints = [];
      const coreBottomPoints = [];

      for (let i = 0; i <= segments; i++) {
        const segT = (i / 30) * (t / 1);
        if (segT > t) break;

        const point = getBezierPoint(segT, p0, p1, p2);

        // Asymmetric thickness - sharper on one side
        const thicknessCurve = Math.pow(Math.sin(segT * Math.PI), 0.7);
        // Taper more at the end
        const endTaper = segT > 0.7 ? 1 - ((segT - 0.7) / 0.3) * 0.8 : 1;
        const thickness = (minThickness + (maxThickness - minThickness) * thicknessCurve) * endTaper;

        // Add slight waviness
        const wave = Math.sin(segT * Math.PI * 4) * 2;

        const nextT = Math.min(1, segT + 0.05);
        const nextPoint = getBezierPoint(nextT, p0, p1, p2);
        const perp = getPerpendicular(point, nextPoint, thickness / 2);

        // Asymmetric - one side sharper
        topPoints.push({ x: point.x + perp.x * 1.2 + wave, y: point.y + perp.y * 1.2 });
        bottomPoints.push({ x: point.x - perp.x * 0.8, y: point.y - perp.y * 0.8 });

        // Core (inner bright line)
        const corePerp = getPerpendicular(point, nextPoint, thickness * 0.2);
        coreTopPoints.push({ x: point.x + corePerp.x, y: point.y + corePerp.y });
        coreBottomPoints.push({ x: point.x - corePerp.x, y: point.y - corePerp.y });
      }

      if (topPoints.length < 2) return;

      // Draw glow layer (larger, more diffuse)
      glowSlash.beginFill(glowColor, 0.3);
      glowSlash.moveTo(topPoints[0].x, topPoints[0].y);
      topPoints.forEach(p => glowSlash.lineTo(p.x, p.y));
      [...bottomPoints].reverse().forEach(p => glowSlash.lineTo(p.x, p.y));
      glowSlash.closePath();
      glowSlash.endFill();

      // Draw main slash
      mainSlash.beginFill(color, 0.9);
      mainSlash.moveTo(topPoints[0].x, topPoints[0].y);
      topPoints.forEach(p => mainSlash.lineTo(p.x, p.y));
      [...bottomPoints].reverse().forEach(p => mainSlash.lineTo(p.x, p.y));
      mainSlash.closePath();
      mainSlash.endFill();

      // Draw bright core
      if (coreTopPoints.length >= 2) {
        coreSlash.beginFill(coreColor, 1);
        coreSlash.moveTo(coreTopPoints[0].x, coreTopPoints[0].y);
        coreTopPoints.forEach(p => coreSlash.lineTo(p.x, p.y));
        [...coreBottomPoints].reverse().forEach(p => coreSlash.lineTo(p.x, p.y));
        coreSlash.closePath();
        coreSlash.endFill();
      }
    };

    // Add filters
    mainSlash.filters = [new GlowFilter({
      distance: 20,
      outerStrength: 3,
      innerStrength: 1,
      color: glowColor,
      quality: 0.5,
    })];

    glowSlash.filters = [new GlowFilter({
      distance: 35,
      outerStrength: 2,
      innerStrength: 0,
      color: glowColor,
      quality: 0.3,
    })];

    // Spawn speed lines during animation
    const spawnSpeedLine = (t) => {
      const point = getBezierPoint(t, p0, p1, p2);
      const line = new PIXI.Graphics();

      // Get direction of movement
      const nextPoint = getBezierPoint(Math.min(1, t + 0.1), p0, p1, p2);
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);

      // Draw speed line
      const lineLen = 15 + Math.random() * 25;
      line.lineStyle(1 + Math.random() * 2, color, 0.6);
      line.moveTo(0, 0);
      line.lineTo(-lineLen, 0);
      line.x = point.x;
      line.y = point.y;
      line.rotation = angle;

      line.filters = [new GlowFilter({
        distance: 8,
        outerStrength: 1.5,
        color: glowColor,
        quality: 0.3,
      })];

      speedLines.addChild(line);

      // Fade out
      let life = 1;
      const fadeLine = () => {
        life -= 0.08;
        line.alpha = life;
        if (life > 0) {
          requestAnimationFrame(fadeLine);
        } else {
          speedLines.removeChild(line);
          line.destroy();
        }
      };
      fadeLine();
    };

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;

      if (phase === 'drawing') {
        currentT += swingSpeed;
        if (currentT >= 1) {
          currentT = 1;
          phase = 'holding';
        }
        drawSlashAtT(currentT);

        // Spawn speed lines and sparks
        if (Math.random() > 0.5) {
          spawnSpeedLine(currentT);
        }
        if (Math.random() > 0.7) {
          const point = getBezierPoint(currentT, p0, p1, p2);
          createSparkParticle(point.x, point.y, color, glowColor);
        }

        requestAnimationFrame(animate);
      } else if (phase === 'holding') {
        if (elapsed > duration * 0.4) {
          phase = 'fading';
        }
        requestAnimationFrame(animate);
      } else if (phase === 'fading') {
        fadeProgress += 0.06;
        container.alpha = 1 - easeOutCubic(fadeProgress);

        if (fadeProgress >= 1) {
          app.layers.effects.removeChild(container);
          container.destroy();
          return;
        }
        requestAnimationFrame(animate);
      }
    };
    animate();

    // Spawn extra particles at the end
    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        const t = 0.6 + Math.random() * 0.4;
        const point = getBezierPoint(t, p0, p1, p2);
        createSparkParticle(point.x, point.y, color, glowColor);
      }
    }, duration * 0.3);

  }, []);

  // Create single spark particle
  const createSparkParticle = useCallback((x, y, color, glowColor) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const spark = new PIXI.Graphics();
    const size = 2 + Math.random() * 4;

    // Draw elongated spark shape
    spark.beginFill(color);
    spark.drawEllipse(0, 0, size, size * 0.4);
    spark.endFill();

    spark.x = x;
    spark.y = y;
    spark.rotation = Math.random() * Math.PI * 2;

    spark.filters = [new GlowFilter({
      distance: 6,
      outerStrength: 2,
      color: glowColor,
      quality: 0.3,
    })];

    const vx = (Math.random() - 0.5) * 8;
    const vy = (Math.random() - 0.5) * 8;
    const life = 200 + Math.random() * 200;

    app.layers.particles.addChild(spark);

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < life) {
        spark.x += vx * 0.95;
        spark.y += vy * 0.95;
        spark.alpha = 1 - (elapsed / life);
        spark.scale.set(1 - (elapsed / life) * 0.5);
        requestAnimationFrame(animate);
      } else {
        app.layers.particles.removeChild(spark);
        spark.destroy();
      }
    };
    animate();
  }, []);

  // ============================================
  // PROJECTILE EFFECTS
  // ============================================

  // Create a flying projectile with trail
  const createProjectile = useCallback((startX, startY, targetX, targetY, options = {}) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const {
      color = 0xff6600,
      glowColor = 0xff0000,
      coreColor = 0xffffaa,
      size = 12,
      speed = 8,
      trailLength = 15,
      onImpact = null,
      element = 'fire',
    } = options;

    const container = new PIXI.Container();
    app.layers.projectiles.addChild(container);

    // Calculate direction
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Current position
    let posX = startX;
    let posY = startY;

    // Create main projectile body (irregular shape)
    const projectile = new PIXI.Graphics();

    // Draw irregular, organic projectile shape
    const drawProjectile = () => {
      projectile.clear();

      // Outer glow layer
      projectile.beginFill(color, 0.6);
      const outerPoints = 8;
      for (let i = 0; i < outerPoints; i++) {
        const angle = (i / outerPoints) * Math.PI * 2;
        const wobble = 0.7 + Math.random() * 0.6;
        const r = size * wobble;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) projectile.moveTo(px, py);
        else projectile.lineTo(px, py);
      }
      projectile.closePath();
      projectile.endFill();

      // Inner bright core
      projectile.beginFill(coreColor, 0.9);
      const innerPoints = 6;
      for (let i = 0; i < innerPoints; i++) {
        const angle = (i / innerPoints) * Math.PI * 2;
        const wobble = 0.6 + Math.random() * 0.4;
        const r = size * 0.4 * wobble;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) projectile.moveTo(px, py);
        else projectile.lineTo(px, py);
      }
      projectile.closePath();
      projectile.endFill();
    };

    drawProjectile();
    projectile.x = posX;
    projectile.y = posY;
    projectile.filters = [new GlowFilter({
      distance: 25,
      outerStrength: 3,
      innerStrength: 1,
      color: glowColor,
      quality: 0.5,
    })];

    container.addChild(projectile);

    // Trail particles
    const trailParticles = [];

    const animate = () => {
      // Move projectile
      posX += dirX * speed;
      posY += dirY * speed;
      projectile.x = posX;
      projectile.y = posY;

      // Redraw for wobble effect
      if (Math.random() > 0.7) drawProjectile();

      // Spawn trail particles
      if (Math.random() > 0.3) {
        const trail = new PIXI.Graphics();
        const trailSize = size * (0.3 + Math.random() * 0.5);
        trail.beginFill(color, 0.8);
        trail.drawCircle(0, 0, trailSize);
        trail.endFill();
        trail.x = posX + (Math.random() - 0.5) * size;
        trail.y = posY + (Math.random() - 0.5) * size;
        trail.filters = [new GlowFilter({
          distance: 10,
          outerStrength: 1.5,
          color: glowColor,
          quality: 0.3,
        })];
        container.addChild(trail);
        trailParticles.push({ sprite: trail, life: 1 });
      }

      // Update trail particles
      trailParticles.forEach((t, i) => {
        t.life -= 0.08;
        t.sprite.alpha = t.life;
        t.sprite.scale.set(t.life);
        if (t.life <= 0) {
          container.removeChild(t.sprite);
          t.sprite.destroy();
          trailParticles.splice(i, 1);
        }
      });

      // Check if reached target
      const distToTarget = Math.sqrt(
        (posX - targetX) ** 2 + (posY - targetY) ** 2
      );

      if (distToTarget < speed * 2) {
        // Impact!
        container.removeChild(projectile);
        projectile.destroy();

        // Cleanup trails
        trailParticles.forEach(t => {
          container.removeChild(t.sprite);
          t.sprite.destroy();
        });

        // Remove container after a delay
        setTimeout(() => {
          if (app.layers && app.layers.projectiles) {
            app.layers.projectiles.removeChild(container);
            container.destroy();
          }
        }, 100);

        // Trigger impact effect
        if (onImpact) {
          onImpact(targetX, targetY);
        }
        return;
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  // ============================================
  // PARTICLE BURST EFFECTS
  // ============================================

  const createParticleBurst = useCallback((x, y, options = {}) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const {
      count = 20,
      color = 0xffaa00,
      glowColor = 0xff6600,
      minSpeed = 3,
      maxSpeed = 10,
      minSize = 2,
      maxSize = 8,
      duration = 700,
      gravity = 0.2,
      spread = Math.PI * 2,
      direction = -Math.PI / 2,
      drag = 0.98,
      fadeStart = 0.3, // When to start fading (0-1)
    } = options;

    const particles = [];

    for (let i = 0; i < count; i++) {
      const particle = new PIXI.Graphics();
      const size = minSize + Math.random() * (maxSize - minSize);

      // Draw irregular particle shape
      particle.beginFill(color);
      const points = 5 + Math.floor(Math.random() * 3);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const wobble = 0.7 + Math.random() * 0.6;
        const r = size * wobble;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (j === 0) particle.moveTo(px, py);
        else particle.lineTo(px, py);
      }
      particle.closePath();
      particle.endFill();

      particle.x = x + (Math.random() - 0.5) * 10;
      particle.y = y + (Math.random() - 0.5) * 10;
      particle.rotation = Math.random() * Math.PI * 2;

      particle.filters = [new GlowFilter({
        distance: 10,
        outerStrength: 1.8,
        innerStrength: 0.5,
        color: glowColor,
        quality: 0.3,
      })];

      // Random velocity with spread
      const angle = direction + (Math.random() - 0.5) * spread;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.rotationSpeed = (Math.random() - 0.5) * 0.3;

      app.layers.particles.addChild(particle);
      particles.push(particle);
    }

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += gravity;
          p.vx *= drag;
          p.vy *= drag;
          p.rotation += p.rotationSpeed;

          // Fade out after fadeStart
          if (progress > fadeStart) {
            p.alpha = 1 - ((progress - fadeStart) / (1 - fadeStart));
          }
          p.scale.set(1 - progress * 0.5);
        });
        requestAnimationFrame(animate);
      } else {
        particles.forEach(p => {
          if (app.layers && app.layers.particles) {
            app.layers.particles.removeChild(p);
          }
          p.destroy();
        });
      }
    };
    animate();
  }, []);

  // ============================================
  // SHOCKWAVE EFFECT
  // ============================================

  const createShockwave = useCallback((x, y, options = {}) => {
    const app = appRef.current;
    if (!app) return;

    const {
      radius = 100,
      wavelength = 30,
      amplitude = 30,
      duration = 500,
    } = options;

    const shockwaveFilter = new ShockwaveFilter([x / width, y / height], {
      radius: 0,
      wavelength,
      amplitude,
    });

    const currentFilters = app.stage.filters ? [...app.stage.filters] : [];
    currentFilters.push(shockwaveFilter);
    app.stage.filters = currentFilters;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const progress = easeOutQuad(elapsed / duration);
        shockwaveFilter.radius = radius * progress;
        shockwaveFilter.amplitude = amplitude * (1 - progress);
        requestAnimationFrame(animate);
      } else {
        app.stage.filters = (app.stage.filters || []).filter(f => f !== shockwaveFilter);
      }
    };
    animate();
  }, [width, height]);

  // ============================================
  // ELEMENT-SPECIFIC EFFECTS
  // ============================================

  const createFireExplosion = useCallback((x, y) => {
    // Main burst
    createParticleBurst(x, y, {
      count: 30,
      color: 0xff4400,
      glowColor: 0xff0000,
      minSpeed: 4,
      maxSpeed: 12,
      minSize: 4,
      maxSize: 12,
      gravity: -0.15,
      duration: 800,
      drag: 0.96,
    });

    // Embers
    createParticleBurst(x, y, {
      count: 20,
      color: 0xffaa00,
      glowColor: 0xff6600,
      minSpeed: 2,
      maxSpeed: 6,
      minSize: 2,
      maxSize: 5,
      gravity: -0.08,
      duration: 1200,
      drag: 0.99,
    });

    // Smoke (dark particles rising)
    createParticleBurst(x, y, {
      count: 10,
      color: 0x333333,
      glowColor: 0x111111,
      minSpeed: 1,
      maxSpeed: 3,
      minSize: 8,
      maxSize: 15,
      gravity: -0.05,
      duration: 1500,
      drag: 0.995,
    });

    createShockwave(x, y, { radius: 80, duration: 300, amplitude: 20 });
    screenFlash(0xff4400, 120, 0.4);
    screenShake(12, 250);
    freezeFrame(40);
  }, [createParticleBurst, createShockwave, screenFlash, screenShake, freezeFrame]);

  const createIceExplosion = useCallback((x, y) => {
    // Ice shards (sharp, fast)
    createParticleBurst(x, y, {
      count: 25,
      color: 0x88ddff,
      glowColor: 0x0088ff,
      minSpeed: 6,
      maxSpeed: 15,
      minSize: 3,
      maxSize: 10,
      gravity: 0.1,
      duration: 600,
      drag: 0.94,
    });

    // Frost mist
    createParticleBurst(x, y, {
      count: 35,
      color: 0xffffff,
      glowColor: 0xaaddff,
      minSpeed: 1,
      maxSpeed: 4,
      minSize: 4,
      maxSize: 8,
      gravity: 0,
      duration: 1000,
      drag: 0.98,
    });

    // Sparkles
    createParticleBurst(x, y, {
      count: 15,
      color: 0xffffff,
      glowColor: 0x88ddff,
      minSpeed: 2,
      maxSpeed: 5,
      minSize: 1,
      maxSize: 3,
      gravity: 0.05,
      duration: 800,
    });

    screenFlash(0x88ddff, 100, 0.5);
    screenShake(8, 200);
    freezeFrame(60);
  }, [createParticleBurst, screenFlash, screenShake, freezeFrame]);

  // Create a dramatic lightning bolt from sky to target
  const createLightningBolt = useCallback((targetX, targetY) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const container = new PIXI.Container();
    app.layers.effects.addChild(container);

    const startY = -20; // Above screen
    const segments = 12 + Math.floor(Math.random() * 6);
    const baseDeviation = 40;

    // Generate jagged lightning path
    const generateBoltPath = (sx, sy, ex, ey, deviation) => {
      const points = [{ x: sx, y: sy }];
      const totalDist = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2);
      const segmentCount = Math.max(4, Math.floor(totalDist / 30));

      for (let i = 1; i < segmentCount; i++) {
        const t = i / segmentCount;
        const baseX = sx + (ex - sx) * t;
        const baseY = sy + (ey - sy) * t;
        // More deviation in middle, less at ends
        const devFactor = Math.sin(t * Math.PI) * deviation;
        const offsetX = (Math.random() - 0.5) * devFactor * 2;
        points.push({ x: baseX + offsetX, y: baseY });
      }
      points.push({ x: ex, y: ey });
      return points;
    };

    // Draw a single bolt segment
    const drawBolt = (points, thickness, color, alpha = 1) => {
      const bolt = new PIXI.Graphics();
      bolt.lineStyle(thickness, color, alpha);
      bolt.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        bolt.lineTo(points[i].x, points[i].y);
      }
      return bolt;
    };

    // Main bolt path
    const mainPath = generateBoltPath(targetX, startY, targetX, targetY, baseDeviation);

    // Create multiple layers for main bolt (glow effect)
    const glowBolt = drawBolt(mainPath, 20, 0xffffaa, 0.3);
    const outerBolt = drawBolt(mainPath, 12, 0xffff00, 0.5);
    const middleBolt = drawBolt(mainPath, 6, 0xffffcc, 0.8);
    const coreBolt = drawBolt(mainPath, 2, 0xffffff, 1);

    glowBolt.filters = [new GlowFilter({
      distance: 40,
      outerStrength: 3,
      color: 0xffff00,
      quality: 0.3,
    })];

    container.addChild(glowBolt);
    container.addChild(outerBolt);
    container.addChild(middleBolt);
    container.addChild(coreBolt);

    // Create branching bolts
    const branchCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < branchCount; i++) {
      // Branch from random point on main bolt
      const branchIndex = Math.floor(Math.random() * (mainPath.length - 2)) + 1;
      const branchStart = mainPath[branchIndex];
      const branchDir = Math.random() > 0.5 ? 1 : -1;
      const branchEndX = branchStart.x + branchDir * (30 + Math.random() * 50);
      const branchEndY = branchStart.y + 30 + Math.random() * 60;

      const branchPath = generateBoltPath(
        branchStart.x, branchStart.y,
        branchEndX, branchEndY,
        baseDeviation * 0.5
      );

      const branchGlow = drawBolt(branchPath, 8, 0xffffaa, 0.3);
      const branchMid = drawBolt(branchPath, 4, 0xffff00, 0.6);
      const branchCore = drawBolt(branchPath, 1.5, 0xffffff, 0.9);

      container.addChild(branchGlow);
      container.addChild(branchMid);
      container.addChild(branchCore);
    }

    // Animate bolt (flash in, flicker, fade out)
    let phase = 'strike'; // strike, flicker, fade
    let flickerCount = 0;
    const maxFlickers = 3 + Math.floor(Math.random() * 2);
    let fadeProgress = 0;

    const animate = () => {
      if (phase === 'strike') {
        container.alpha = 1;
        phase = 'flicker';
        setTimeout(() => requestAnimationFrame(animate), 40);
      } else if (phase === 'flicker') {
        flickerCount++;
        container.alpha = Math.random() > 0.3 ? 1 : 0.4;
        if (flickerCount >= maxFlickers) {
          phase = 'fade';
        }
        setTimeout(() => requestAnimationFrame(animate), 30 + Math.random() * 40);
      } else if (phase === 'fade') {
        fadeProgress += 0.12;
        container.alpha = 1 - easeOutCubic(fadeProgress);
        if (fadeProgress >= 1) {
          app.layers.effects.removeChild(container);
          container.destroy();
          return;
        }
        requestAnimationFrame(animate);
      }
    };
    animate();

    return container;
  }, []);

  const createLightningExplosion = useCallback((x, y) => {
    // Create the dramatic lightning bolt first
    createLightningBolt(x, y);

    // Ground impact circle (expanding)
    const app = appRef.current;
    if (app && app.layers) {
      const impactRing = new PIXI.Graphics();
      impactRing.lineStyle(3, 0xffff00, 1);
      impactRing.drawCircle(0, 0, 5);
      impactRing.x = x;
      impactRing.y = y;
      impactRing.filters = [new GlowFilter({
        distance: 15,
        outerStrength: 2,
        color: 0xffffaa,
        quality: 0.3,
      })];
      app.layers.particles.addChild(impactRing);

      let ringProgress = 0;
      const animateRing = () => {
        ringProgress += 0.08;
        const scale = 1 + ringProgress * 8;
        impactRing.scale.set(scale);
        impactRing.alpha = 1 - ringProgress;
        if (ringProgress < 1) {
          requestAnimationFrame(animateRing);
        } else {
          app.layers.particles.removeChild(impactRing);
          impactRing.destroy();
        }
      };
      animateRing();
    }

    // Electric sparks at impact point
    createParticleBurst(x, y, {
      count: 35,
      color: 0xffff00,
      glowColor: 0xffffaa,
      minSpeed: 6,
      maxSpeed: 18,
      minSize: 2,
      maxSize: 5,
      gravity: 0.15,
      duration: 400,
      drag: 0.92,
    });

    // Ground sparks (spread horizontally)
    createParticleBurst(x, y, {
      count: 20,
      color: 0xffffff,
      glowColor: 0xffff88,
      minSpeed: 4,
      maxSpeed: 10,
      minSize: 1,
      maxSize: 3,
      gravity: 0.3,
      duration: 350,
      spread: Math.PI * 0.6,
      direction: -Math.PI / 2,
      drag: 0.95,
    });

    // Secondary electric discharge
    setTimeout(() => {
      createParticleBurst(x + (Math.random() - 0.5) * 20, y, {
        count: 12,
        color: 0xffff00,
        glowColor: 0xffffaa,
        minSpeed: 3,
        maxSpeed: 8,
        duration: 300,
      });
    }, 60);

    screenFlash(0xffffaa, 50, 0.9);
    screenShake(18, 200);
    freezeFrame(45);
  }, [createLightningBolt, createParticleBurst, screenFlash, screenShake, freezeFrame]);

  const createDarkExplosion = useCallback((x, y) => {
    // Void energy
    createParticleBurst(x, y, {
      count: 30,
      color: 0x8800ff,
      glowColor: 0x4400aa,
      minSpeed: 2,
      maxSpeed: 8,
      minSize: 5,
      maxSize: 12,
      gravity: -0.03,
      duration: 1000,
      drag: 0.97,
    });

    // Dark wisps
    createParticleBurst(x, y, {
      count: 20,
      color: 0x220044,
      glowColor: 0x6600aa,
      minSpeed: 1,
      maxSpeed: 4,
      minSize: 8,
      maxSize: 15,
      gravity: -0.02,
      duration: 1300,
      drag: 0.99,
    });

    createShockwave(x, y, { radius: 100, wavelength: 50, duration: 600 });
    screenFlash(0x4400aa, 200, 0.6);
    screenShake(8, 350);
  }, [createParticleBurst, createShockwave, screenFlash, screenShake]);

  // ============================================
  // NEW ELEMENTAL EFFECTS
  // ============================================

  const createEarthExplosion = useCallback((x, y) => {
    // Rock chunks (heavy, falling)
    createParticleBurst(x, y, {
      count: 25,
      color: 0x8b7355,
      glowColor: 0x5c4033,
      minSpeed: 5,
      maxSpeed: 15,
      minSize: 6,
      maxSize: 14,
      gravity: 0.5,
      duration: 800,
      drag: 0.95,
      spread: Math.PI,
      direction: -Math.PI / 2,
    });

    // Dirt particles
    createParticleBurst(x, y, {
      count: 40,
      color: 0x654321,
      glowColor: 0x3d2817,
      minSpeed: 3,
      maxSpeed: 10,
      minSize: 2,
      maxSize: 6,
      gravity: 0.3,
      duration: 1000,
      drag: 0.97,
    });

    // Dust cloud (slow, lingering)
    createParticleBurst(x, y, {
      count: 20,
      color: 0x9b8b7a,
      glowColor: 0x7a6b5a,
      minSpeed: 0.5,
      maxSpeed: 2,
      minSize: 10,
      maxSize: 20,
      gravity: -0.02,
      duration: 1500,
      drag: 0.995,
    });

    createShockwave(x, y, { radius: 80, wavelength: 40, amplitude: 35, duration: 400 });
    screenShake(20, 350);
    freezeFrame(60);
  }, [createParticleBurst, createShockwave, screenShake, freezeFrame]);

  const createWindExplosion = useCallback((x, y) => {
    // Wind streaks (fast, horizontal)
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        createParticleBurst(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 40, {
          count: 8,
          color: 0xaaddff,
          glowColor: 0x88bbdd,
          minSpeed: 8,
          maxSpeed: 20,
          minSize: 2,
          maxSize: 5,
          gravity: 0,
          duration: 400,
          drag: 0.92,
          spread: Math.PI / 4,
          direction: Math.random() * Math.PI * 2,
        });
      }, i * 40);
    }

    // Swirl particles
    createParticleBurst(x, y, {
      count: 30,
      color: 0xffffff,
      glowColor: 0xccddee,
      minSpeed: 3,
      maxSpeed: 8,
      minSize: 1,
      maxSize: 4,
      gravity: -0.05,
      duration: 800,
      drag: 0.96,
    });

    // Leaves/debris
    createParticleBurst(x, y, {
      count: 15,
      color: 0x88aa66,
      glowColor: 0x668844,
      minSpeed: 2,
      maxSpeed: 6,
      minSize: 3,
      maxSize: 6,
      gravity: 0.02,
      duration: 1200,
      drag: 0.98,
    });

    screenShake(6, 200);
  }, [createParticleBurst, screenShake]);

  const createWaterExplosion = useCallback((x, y) => {
    // Water droplets (arcing outward)
    createParticleBurst(x, y, {
      count: 35,
      color: 0x4488cc,
      glowColor: 0x2266aa,
      minSpeed: 5,
      maxSpeed: 14,
      minSize: 3,
      maxSize: 8,
      gravity: 0.25,
      duration: 900,
      drag: 0.97,
    });

    // Mist/spray
    createParticleBurst(x, y, {
      count: 25,
      color: 0x88ccff,
      glowColor: 0x66aadd,
      minSpeed: 1,
      maxSpeed: 4,
      minSize: 5,
      maxSize: 12,
      gravity: -0.03,
      duration: 1100,
      drag: 0.99,
    });

    // Bubbles
    createParticleBurst(x, y, {
      count: 15,
      color: 0xaaddff,
      glowColor: 0xffffff,
      minSpeed: 0.5,
      maxSpeed: 3,
      minSize: 2,
      maxSize: 5,
      gravity: -0.1,
      duration: 1400,
      drag: 0.995,
    });

    createShockwave(x, y, { radius: 70, wavelength: 35, amplitude: 20, duration: 500 });
    screenFlash(0x4488cc, 100, 0.3);
    screenShake(8, 200);
  }, [createParticleBurst, createShockwave, screenFlash, screenShake]);

  const createPoisonExplosion = useCallback((x, y) => {
    // Toxic bubbles
    createParticleBurst(x, y, {
      count: 30,
      color: 0x44cc44,
      glowColor: 0x22aa22,
      minSpeed: 2,
      maxSpeed: 7,
      minSize: 4,
      maxSize: 10,
      gravity: -0.08,
      duration: 1200,
      drag: 0.98,
    });

    // Poison mist (lingering)
    createParticleBurst(x, y, {
      count: 25,
      color: 0x88ff88,
      glowColor: 0x44dd44,
      minSpeed: 0.5,
      maxSpeed: 2,
      minSize: 8,
      maxSize: 18,
      gravity: -0.02,
      duration: 1800,
      drag: 0.995,
    });

    // Dripping droplets
    createParticleBurst(x, y, {
      count: 15,
      color: 0x22aa22,
      glowColor: 0x118811,
      minSpeed: 1,
      maxSpeed: 4,
      minSize: 2,
      maxSize: 5,
      gravity: 0.15,
      duration: 1000,
      drag: 0.99,
    });

    screenFlash(0x44cc44, 150, 0.4);
    screenShake(5, 250);
  }, [createParticleBurst, screenFlash, screenShake]);

  const createArcaneExplosion = useCallback((x, y) => {
    // Magic symbols/runes (rotating outward)
    createParticleBurst(x, y, {
      count: 25,
      color: 0xff44ff,
      glowColor: 0xcc22cc,
      minSpeed: 3,
      maxSpeed: 10,
      minSize: 4,
      maxSize: 10,
      gravity: 0,
      duration: 1000,
      drag: 0.96,
    });

    // Sparkles
    createParticleBurst(x, y, {
      count: 40,
      color: 0xffaaff,
      glowColor: 0xff66ff,
      minSpeed: 1,
      maxSpeed: 6,
      minSize: 1,
      maxSize: 4,
      gravity: -0.02,
      duration: 1200,
      drag: 0.98,
    });

    // Mystic orbs
    createParticleBurst(x, y, {
      count: 8,
      color: 0xaa44ff,
      glowColor: 0x8822dd,
      minSpeed: 1,
      maxSpeed: 3,
      minSize: 6,
      maxSize: 12,
      gravity: -0.05,
      duration: 1400,
      drag: 0.99,
    });

    createShockwave(x, y, { radius: 90, wavelength: 45, duration: 550 });
    screenFlash(0xff44ff, 120, 0.5);
    screenShake(10, 250);
  }, [createParticleBurst, createShockwave, screenFlash, screenShake]);

  // ============================================
  // SPECIALIZED ABILITY EFFECTS
  // ============================================

  // Meteor falling from sky
  const createMeteor = useCallback((targetX, targetY) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const startX = targetX - 150;
    const startY = -50;

    createProjectile(startX, startY, targetX, targetY, {
      color: 0xff4400,
      glowColor: 0xff0000,
      coreColor: 0xffffaa,
      size: 25,
      speed: 12,
      element: 'fire',
      onImpact: (ix, iy) => {
        createFireExplosion(ix, iy);
        createEarthExplosion(ix, iy);
        screenShake(25, 400);
        freezeFrame(80);
      },
    });
  }, [createProjectile, createFireExplosion, createEarthExplosion, screenShake, freezeFrame]);

  // Chain lightning between multiple points - reaches across full canvas
  const createChainLightning = useCallback((startX, startY, targets = []) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    // Chain lightning reaches across the full canvas width
    const canvasWidth = width || 1000;
    const targetX = canvasWidth - 80; // Near right edge where boss is
    const segmentWidth = (targetX - startX) / 5;

    const defaultTargets = targets.length > 0 ? targets : [
      { x: startX + segmentWidth, y: startY + 30 },
      { x: startX + segmentWidth * 2, y: startY - 50 },
      { x: startX + segmentWidth * 3, y: startY + 40 },
      { x: startX + segmentWidth * 4, y: startY - 60 },
      { x: targetX, y: startY - 80 },  // Finish higher up where boss is
    ];

    let currentX = startX;
    let currentY = startY;

    defaultTargets.forEach((target, i) => {
      setTimeout(() => {
        // Draw lightning arc between points
        const container = new PIXI.Container();
        app.layers.effects.addChild(container);

        const points = [{ x: currentX, y: currentY }];
        const segments = 6;
        const dx = target.x - currentX;
        const dy = target.y - currentY;

        for (let j = 1; j < segments; j++) {
          const t = j / segments;
          points.push({
            x: currentX + dx * t + (Math.random() - 0.5) * 30,
            y: currentY + dy * t + (Math.random() - 0.5) * 30,
          });
        }
        points.push({ x: target.x, y: target.y });

        // Draw bolt
        const bolt = new PIXI.Graphics();
        bolt.lineStyle(4, 0xffff00, 1);
        bolt.moveTo(points[0].x, points[0].y);
        points.forEach(p => bolt.lineTo(p.x, p.y));
        bolt.filters = [new GlowFilter({ distance: 20, outerStrength: 3, color: 0xffffaa, quality: 0.3 })];
        container.addChild(bolt);

        // Core
        const core = new PIXI.Graphics();
        core.lineStyle(1.5, 0xffffff, 1);
        core.moveTo(points[0].x, points[0].y);
        points.forEach(p => core.lineTo(p.x, p.y));
        container.addChild(core);

        // Impact spark
        createParticleBurst(target.x, target.y, {
          count: 12,
          color: 0xffff00,
          glowColor: 0xffffaa,
          minSpeed: 3,
          maxSpeed: 8,
          duration: 300,
        });

        // Fade out
        let alpha = 1;
        const fade = () => {
          alpha -= 0.15;
          container.alpha = alpha;
          if (alpha > 0) {
            requestAnimationFrame(fade);
          } else {
            app.layers.effects.removeChild(container);
            container.destroy();
          }
        };
        setTimeout(fade, 80);

        currentX = target.x;
        currentY = target.y;
      }, i * 100);
    });

    screenFlash(0xffffaa, 40, 0.7);
  }, [createParticleBurst, screenFlash]);

  // Tornado/vortex effect
  const createTornado = useCallback((x, y) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const container = new PIXI.Container();
    app.layers.effects.addChild(container);

    const particles = [];
    const duration = 2000;
    const startTime = Date.now();

    // Spawn swirling particles
    for (let i = 0; i < 60; i++) {
      const particle = new PIXI.Graphics();
      const size = 2 + Math.random() * 4;
      particle.beginFill(0xaaddff, 0.8);
      particle.drawCircle(0, 0, size);
      particle.endFill();

      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 40;
      const height = Math.random() * 100;
      const speed = 0.05 + Math.random() * 0.05;

      particle.filters = [new GlowFilter({ distance: 8, outerStrength: 1.5, color: 0x88bbdd, quality: 0.3 })];
      container.addChild(particle);

      particles.push({ sprite: particle, angle, radius, height, speed, baseRadius: radius });
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;

        particles.forEach(p => {
          p.angle += p.speed;
          // Spiral inward then outward
          const radiusMod = progress < 0.5
            ? 1 - progress
            : progress;
          const currentRadius = p.baseRadius * radiusMod * 2;

          p.sprite.x = x + Math.cos(p.angle) * currentRadius;
          p.sprite.y = y - p.height * (1 - progress * 0.5) + Math.sin(p.angle * 2) * 10;
          p.sprite.alpha = progress < 0.8 ? 1 : 1 - (progress - 0.8) / 0.2;
        });

        requestAnimationFrame(animate);
      } else {
        app.layers.effects.removeChild(container);
        container.destroy();
      }
    };
    animate();

    // Wind bursts during tornado
    for (let i = 0; i < 4; i++) {
      setTimeout(() => createWindExplosion(x, y - 30), i * 400);
    }

    screenShake(4, 2000);
  }, [createWindExplosion, screenShake]);

  // Healing/restoration effect
  const createHealEffect = useCallback((x, y) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    // Rising sparkles
    createParticleBurst(x, y, {
      count: 30,
      color: 0x44ff88,
      glowColor: 0x22dd66,
      minSpeed: 1,
      maxSpeed: 4,
      minSize: 2,
      maxSize: 5,
      gravity: -0.15,
      duration: 1200,
      drag: 0.98,
      direction: -Math.PI / 2,
      spread: Math.PI / 2,
    });

    // Plus symbols (healing icons)
    for (let i = 0; i < 5; i++) {
      const plus = new PIXI.Graphics();
      plus.beginFill(0x88ffaa, 0.9);
      plus.drawRect(-6, -2, 12, 4);
      plus.drawRect(-2, -6, 4, 12);
      plus.endFill();
      plus.x = x + (Math.random() - 0.5) * 40;
      plus.y = y;
      plus.filters = [new GlowFilter({ distance: 10, outerStrength: 2, color: 0x44ff88, quality: 0.3 })];
      app.layers.particles.addChild(plus);

      let progress = 0;
      const animatePlus = () => {
        progress += 0.02;
        plus.y = y - progress * 80;
        plus.alpha = 1 - progress;
        plus.scale.set(1 - progress * 0.5);
        if (progress < 1) {
          requestAnimationFrame(animatePlus);
        } else {
          app.layers.particles.removeChild(plus);
          plus.destroy();
        }
      };
      setTimeout(animatePlus, i * 100);
    }

    screenFlash(0x44ff88, 200, 0.3);
  }, [createParticleBurst, screenFlash]);

  // Shield/barrier effect
  const createShieldEffect = useCallback((x, y) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const container = new PIXI.Container();
    app.layers.effects.addChild(container);

    // Hexagonal shield
    const shield = new PIXI.Graphics();
    const radius = 50;
    shield.lineStyle(3, 0x44aaff, 0.8);
    shield.beginFill(0x2288dd, 0.2);

    // Draw hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) shield.moveTo(px, py);
      else shield.lineTo(px, py);
    }
    shield.closePath();
    shield.endFill();
    shield.x = x;
    shield.y = y;
    shield.filters = [new GlowFilter({ distance: 20, outerStrength: 2, color: 0x44aaff, quality: 0.3 })];
    container.addChild(shield);

    // Animate shield appearance
    shield.scale.set(0);
    let progress = 0;
    const animate = () => {
      progress += 0.08;
      if (progress < 1) {
        shield.scale.set(easeOutCubic(progress));
        shield.rotation += 0.02;
        requestAnimationFrame(animate);
      } else {
        // Hold then fade
        setTimeout(() => {
          let fade = 0;
          const fadeOut = () => {
            fade += 0.05;
            container.alpha = 1 - fade;
            if (fade < 1) {
              requestAnimationFrame(fadeOut);
            } else {
              app.layers.effects.removeChild(container);
              container.destroy();
            }
          };
          fadeOut();
        }, 500);
      }
    };
    animate();

    // Sparkles around shield
    createParticleBurst(x, y, {
      count: 20,
      color: 0x88ccff,
      glowColor: 0x44aaff,
      minSpeed: 1,
      maxSpeed: 3,
      minSize: 1,
      maxSize: 3,
      gravity: 0,
      duration: 800,
    });

    screenFlash(0x44aaff, 80, 0.3);
  }, [createParticleBurst, screenFlash]);

  // Buff/power-up effect
  const createBuffEffect = useCallback((x, y, color = 0xffaa00) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    // Rising energy column
    const container = new PIXI.Container();
    app.layers.effects.addChild(container);

    for (let i = 0; i < 20; i++) {
      const particle = new PIXI.Graphics();
      const size = 3 + Math.random() * 5;
      particle.beginFill(color, 0.8);
      particle.drawCircle(0, 0, size);
      particle.endFill();
      particle.x = x + (Math.random() - 0.5) * 30;
      particle.y = y + 50;
      particle.filters = [new GlowFilter({ distance: 10, outerStrength: 2, color, quality: 0.3 })];
      container.addChild(particle);

      const speed = 2 + Math.random() * 3;
      const delay = Math.random() * 500;

      setTimeout(() => {
        let py = particle.y;
        const rise = () => {
          py -= speed;
          particle.y = py;
          particle.alpha = Math.max(0, 1 - (y - 80 - py) / 100);
          if (py > y - 100 && particle.alpha > 0) {
            requestAnimationFrame(rise);
          }
        };
        rise();
      }, delay);
    }

    setTimeout(() => {
      app.layers.effects.removeChild(container);
      container.destroy();
    }, 1500);

    screenFlash(color, 150, 0.4);
  }, [screenFlash]);

  // Debuff/curse effect
  const createDebuffEffect = useCallback((x, y) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    // Skull/death icon descending
    createParticleBurst(x, y, {
      count: 25,
      color: 0x880088,
      glowColor: 0x440044,
      minSpeed: 0.5,
      maxSpeed: 2,
      minSize: 4,
      maxSize: 10,
      gravity: 0.05,
      duration: 1500,
      drag: 0.995,
    });

    // Dark chains/tendrils
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const tendril = new PIXI.Graphics();
      tendril.lineStyle(3, 0x660066, 0.7);

      const segments = 8;
      tendril.moveTo(x, y);
      for (let j = 1; j <= segments; j++) {
        const dist = j * 8;
        const wobble = Math.sin(j * 0.8) * 10;
        tendril.lineTo(
          x + Math.cos(angle) * dist + wobble,
          y + Math.sin(angle) * dist
        );
      }

      tendril.filters = [new GlowFilter({ distance: 8, outerStrength: 1.5, color: 0x880088, quality: 0.3 })];
      app.layers.particles.addChild(tendril);

      let progress = 0;
      const animateTendril = () => {
        progress += 0.03;
        tendril.alpha = 1 - progress;
        if (progress < 1) {
          requestAnimationFrame(animateTendril);
        } else {
          app.layers.particles.removeChild(tendril);
          tendril.destroy();
        }
      };
      animateTendril();
    }

    screenFlash(0x440044, 200, 0.5);
    screenShake(6, 300);
  }, [createParticleBurst, screenFlash, screenShake]);

  // Explosion combo (multiple hits)
  const createComboExplosion = useCallback((x, y, count = 5) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const offsetX = (Math.random() - 0.5) * 80;
        const offsetY = (Math.random() - 0.5) * 60;

        createParticleBurst(x + offsetX, y + offsetY, {
          count: 15,
          color: 0xffaa00,
          glowColor: 0xff6600,
          minSpeed: 4,
          maxSpeed: 12,
          minSize: 3,
          maxSize: 8,
          gravity: 0.1,
          duration: 500,
          drag: 0.95,
        });

        screenShake(8, 100);
        if (i === count - 1) {
          // Final big explosion
          createFireExplosion(x, y);
        }
      }, i * 80);
    }
  }, [createParticleBurst, createFireExplosion, screenShake]);

  // Laser beam effect
  const createLaserBeam = useCallback((startX, startY, endX, endY, color = 0xff0000) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const container = new PIXI.Container();
    app.layers.effects.addChild(container);

    // Draw beam
    const beam = new PIXI.Graphics();
    beam.lineStyle(8, color, 0.6);
    beam.moveTo(startX, startY);
    beam.lineTo(endX, endY);

    const core = new PIXI.Graphics();
    core.lineStyle(2, 0xffffff, 1);
    core.moveTo(startX, startY);
    core.lineTo(endX, endY);

    beam.filters = [new GlowFilter({ distance: 25, outerStrength: 3, color, quality: 0.3 })];
    container.addChild(beam);
    container.addChild(core);

    // Impact at end
    createParticleBurst(endX, endY, {
      count: 20,
      color,
      glowColor: color,
      minSpeed: 3,
      maxSpeed: 10,
      duration: 400,
    });

    // Fade out
    let alpha = 1;
    const fade = () => {
      alpha -= 0.1;
      container.alpha = alpha;
      if (alpha > 0) {
        requestAnimationFrame(fade);
      } else {
        app.layers.effects.removeChild(container);
        container.destroy();
      }
    };
    setTimeout(fade, 150);

    screenFlash(color, 60, 0.5);
    screenShake(10, 150);
  }, [createParticleBurst, screenFlash, screenShake]);

  // Black hole / gravity well effect
  const createBlackHole = useCallback((x, y) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const container = new PIXI.Container();
    app.layers.effects.addChild(container);

    // Event horizon (dark center)
    const hole = new PIXI.Graphics();
    hole.beginFill(0x000011, 1);
    hole.drawCircle(0, 0, 20);
    hole.endFill();
    hole.x = x;
    hole.y = y;
    container.addChild(hole);

    // Accretion disk particles
    const diskParticles = [];
    for (let i = 0; i < 40; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(0x8844ff, 0.8);
      particle.drawCircle(0, 0, 2 + Math.random() * 3);
      particle.endFill();

      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 50;

      particle.filters = [new GlowFilter({ distance: 8, outerStrength: 2, color: 0x6622cc, quality: 0.3 })];
      container.addChild(particle);
      diskParticles.push({ sprite: particle, angle, radius, speed: 0.03 + Math.random() * 0.04 });
    }

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;

        // Grow then shrink
        const scale = progress < 0.2
          ? progress / 0.2
          : progress > 0.8
            ? 1 - (progress - 0.8) / 0.2
            : 1;
        hole.scale.set(scale);

        diskParticles.forEach(p => {
          p.angle += p.speed;
          // Spiral inward
          p.radius *= 0.995;
          p.sprite.x = x + Math.cos(p.angle) * p.radius;
          p.sprite.y = y + Math.sin(p.angle) * p.radius * 0.4; // Elliptical
          p.sprite.alpha = scale;
        });

        requestAnimationFrame(animate);
      } else {
        // Final collapse explosion
        createDarkExplosion(x, y);
        app.layers.effects.removeChild(container);
        container.destroy();
      }
    };
    animate();

    screenShake(3, 2000);
  }, [createDarkExplosion, screenShake]);

  // Create a divine beam of light descending from above
  const createHolyBeam = useCallback((targetX, targetY) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const container = new PIXI.Container();
    app.layers.effects.addChild(container);

    const beamWidth = 60;
    const startY = -30;

    // Main beam (gradient from wide at top to narrow at bottom)
    const beam = new PIXI.Graphics();

    // Draw tapered beam shape
    const drawBeam = (progress = 1) => {
      beam.clear();

      // Outer glow beam
      beam.beginFill(0xffffcc, 0.2);
      beam.moveTo(targetX - beamWidth, startY);
      beam.lineTo(targetX + beamWidth, startY);
      beam.lineTo(targetX + beamWidth * 0.3, targetY);
      beam.lineTo(targetX - beamWidth * 0.3, targetY);
      beam.closePath();
      beam.endFill();

      // Main beam
      beam.beginFill(0xffffaa, 0.4);
      beam.moveTo(targetX - beamWidth * 0.6, startY);
      beam.lineTo(targetX + beamWidth * 0.6, startY);
      beam.lineTo(targetX + beamWidth * 0.15, targetY);
      beam.lineTo(targetX - beamWidth * 0.15, targetY);
      beam.closePath();
      beam.endFill();

      // Core beam (brightest)
      beam.beginFill(0xffffff, 0.7);
      beam.moveTo(targetX - beamWidth * 0.2, startY);
      beam.lineTo(targetX + beamWidth * 0.2, startY);
      beam.lineTo(targetX + 3, targetY);
      beam.lineTo(targetX - 3, targetY);
      beam.closePath();
      beam.endFill();
    };

    drawBeam();
    beam.filters = [new GlowFilter({
      distance: 30,
      outerStrength: 2,
      color: 0xffff88,
      quality: 0.3,
    })];
    container.addChild(beam);

    // Create radiating light rays from impact point
    const rayContainer = new PIXI.Container();
    container.addChild(rayContainer);

    const rayCount = 8;
    for (let i = 0; i < rayCount; i++) {
      const ray = new PIXI.Graphics();
      const angle = (i / rayCount) * Math.PI * 2;
      const rayLength = 50 + Math.random() * 40;
      const rayWidth = 3 + Math.random() * 4;

      // Draw ray pointing outward
      ray.beginFill(0xffffcc, 0.7);
      ray.moveTo(0, -rayWidth / 2);
      ray.lineTo(rayLength, 0);
      ray.lineTo(0, rayWidth / 2);
      ray.closePath();
      ray.endFill();

      ray.x = targetX;
      ray.y = targetY;
      ray.rotation = angle;
      ray.alpha = 0;

      ray.filters = [new GlowFilter({
        distance: 12,
        outerStrength: 1.5,
        color: 0xffffaa,
        quality: 0.3,
      })];

      rayContainer.addChild(ray);
    }

    // Create expanding halo rings
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new PIXI.Graphics();
      ring.lineStyle(2, 0xffffcc, 0.8);
      ring.drawCircle(0, 0, 10);
      ring.x = targetX;
      ring.y = targetY;
      ring.alpha = 0;
      ring.filters = [new GlowFilter({
        distance: 8,
        outerStrength: 1.5,
        color: 0xffffaa,
        quality: 0.3,
      })];
      container.addChild(ring);
      rings.push({ sprite: ring, delay: i * 100, started: false });
    }

    // Animation
    let phase = 'descend'; // descend, impact, radiate, fade
    let progress = 0;
    let fadeProgress = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;

      if (phase === 'descend') {
        progress += 0.15;
        // Beam appears from top
        beam.alpha = Math.min(1, progress * 2);
        if (progress >= 1) {
          phase = 'impact';
          progress = 0;
        }
        requestAnimationFrame(animate);
      } else if (phase === 'impact') {
        // Flash the rays outward
        const rays = rayContainer.children;
        rays.forEach((ray, i) => {
          ray.alpha = 1 - progress * 0.3;
          ray.scale.set(1 + progress * 2);
        });

        // Expand rings with stagger
        rings.forEach((r, i) => {
          if (elapsed > r.delay && !r.started) {
            r.started = true;
          }
          if (r.started) {
            const ringProgress = Math.min(1, (elapsed - r.delay) / 400);
            r.sprite.alpha = 1 - ringProgress;
            r.sprite.scale.set(1 + ringProgress * 6);
          }
        });

        progress += 0.06;
        if (progress >= 1) {
          phase = 'radiate';
          progress = 0;
        }
        requestAnimationFrame(animate);
      } else if (phase === 'radiate') {
        progress += 0.04;
        // Beam pulses
        beam.alpha = 0.6 + Math.sin(progress * Math.PI * 4) * 0.3;
        if (progress >= 1) {
          phase = 'fade';
        }
        requestAnimationFrame(animate);
      } else if (phase === 'fade') {
        fadeProgress += 0.08;
        container.alpha = 1 - easeOutCubic(fadeProgress);
        if (fadeProgress >= 1) {
          app.layers.effects.removeChild(container);
          container.destroy();
          return;
        }
        requestAnimationFrame(animate);
      }
    };
    animate();

    return container;
  }, []);

  const createHolyExplosion = useCallback((x, y) => {
    // Create the divine beam first
    createHolyBeam(x, y);

    // Delayed particle effects (after beam reaches ground)
    setTimeout(() => {
      // Light rays (rising)
      createParticleBurst(x, y, {
        count: 35,
        color: 0xffffcc,
        glowColor: 0xffff00,
        minSpeed: 2,
        maxSpeed: 8,
        minSize: 3,
        maxSize: 7,
        gravity: -0.15,
        duration: 1000,
        drag: 0.97,
        direction: -Math.PI / 2,
        spread: Math.PI * 0.8,
      });

      // Sparkles (slow, floating)
      createParticleBurst(x, y, {
        count: 25,
        color: 0xffffff,
        glowColor: 0xffffaa,
        minSpeed: 0.5,
        maxSpeed: 3,
        minSize: 1,
        maxSize: 4,
        gravity: -0.08,
        duration: 1400,
      });

      // Golden dust
      createParticleBurst(x, y, {
        count: 20,
        color: 0xffdd44,
        glowColor: 0xffaa00,
        minSpeed: 1,
        maxSpeed: 4,
        minSize: 2,
        maxSize: 5,
        gravity: -0.03,
        duration: 1200,
        drag: 0.99,
      });
    }, 150);

    screenFlash(0xffffcc, 200, 0.6);
    screenShake(6, 250);
  }, [createHolyBeam, createParticleBurst, screenFlash, screenShake]);

  // ============================================
  // HIGH-LEVEL COMBAT ACTIONS
  // ============================================

  const playWeaponAttack = useCallback((options = {}) => {
    const {
      element = 'physical',
      attackType = 'slash',
      startX = width * 0.3,
      startY = height * 0.5,
      targetX = width * 0.7,
      targetY = height * 0.5,
    } = options;

    const elementColors = {
      physical: { main: 0xffffff, glow: 0xaaaaaa },
      fire: { main: 0xff6600, glow: 0xff0000 },
      ice: { main: 0x00ddff, glow: 0x0088ff },
      lightning: { main: 0xffff00, glow: 0xffaa00 },
      dark: { main: 0x8800ff, glow: 0x440088 },
      holy: { main: 0xffffaa, glow: 0xffff00 },
      earth: { main: 0x8b7355, glow: 0x5c4033 },
      wind: { main: 0xaaddff, glow: 0x88bbdd },
      water: { main: 0x4488cc, glow: 0x2266aa },
      poison: { main: 0x44cc44, glow: 0x22aa22 },
      arcane: { main: 0xff44ff, glow: 0xcc22cc },
    };

    const colors = elementColors[element] || elementColors.physical;
    const cx = targetX; // center x for effects
    const cy = targetY; // center y for effects

    switch (attackType) {
      // ========== BASIC SLASHES ==========
      case 'slash':
        weaponAttackSounds.sword_slash();
        createDynamicSlash(startX, startY, targetX, targetY, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 25,
          curvature: 0.4,
        });
        setTimeout(() => {
          screenShake(12, 200);
          createParticleBurst(cx, cy, { count: 15, color: colors.main, glowColor: colors.glow });
        }, 100);
        break;

      case 'horizontal_slash':
        weaponAttackSounds.sword_slash();
        createDynamicSlash(cx - 80, cy, cx + 80, cy, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 22,
          curvature: 0.15,
        });
        setTimeout(() => {
          screenShake(10, 180);
          createParticleBurst(cx, cy, { count: 12, color: colors.main, glowColor: colors.glow });
        }, 80);
        break;

      case 'vertical_slash':
        weaponAttackSounds.sword_slash();
        createDynamicSlash(cx, cy - 80, cx, cy + 60, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 22,
          curvature: 0.1,
        });
        setTimeout(() => {
          screenShake(10, 180);
          createParticleBurst(cx, cy, { count: 12, color: colors.main, glowColor: colors.glow });
        }, 80);
        break;

      case 'diagonal_slash':
        weaponAttackSounds.sword_slash();
        createDynamicSlash(cx - 60, cy - 60, cx + 60, cy + 60, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 24,
          curvature: 0.3,
        });
        setTimeout(() => {
          screenShake(11, 190);
          createParticleBurst(cx, cy, { count: 14, color: colors.main, glowColor: colors.glow });
        }, 90);
        break;

      case 'rising_slash':
        // Upward sweeping attack
        createDynamicSlash(cx - 40, cy + 50, cx + 30, cy - 70, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 26,
          curvature: 0.5,
        });
        setTimeout(() => {
          screenShake(14, 200);
          createParticleBurst(cx, cy - 40, {
            count: 18,
            color: colors.main,
            glowColor: colors.glow,
            direction: -Math.PI / 2,
            spread: Math.PI / 2,
          });
        }, 100);
        break;

      case 'falling_slash':
        // Downward heavy slash
        createDynamicSlash(cx + 30, cy - 70, cx - 20, cy + 50, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 28,
          curvature: 0.4,
        });
        setTimeout(() => {
          screenShake(16, 250);
          createParticleBurst(cx, cy + 30, {
            count: 20,
            color: colors.main,
            glowColor: colors.glow,
            direction: Math.PI / 2,
            spread: Math.PI / 2,
          });
        }, 100);
        break;

      // ========== MULTI-HIT ATTACKS ==========
      case 'x_slash':
        // Cross slash pattern
        createDynamicSlash(cx - 60, cy - 50, cx + 60, cy + 50, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 20,
          curvature: 0.2,
        });
        setTimeout(() => {
          createDynamicSlash(cx + 60, cy - 50, cx - 60, cy + 50, {
            color: colors.main,
            glowColor: colors.glow,
            maxThickness: 20,
            curvature: 0.2,
          });
        }, 80);
        setTimeout(() => {
          screenShake(15, 250);
          screenFlash(colors.main, 80, 0.4);
          createParticleBurst(cx, cy, { count: 25, color: colors.main, glowColor: colors.glow });
        }, 160);
        break;

      case 'double_slash':
        // Two quick slashes
        createDynamicSlash(cx - 70, cy - 30, cx + 50, cy + 20, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 20,
          curvature: 0.35,
        });
        setTimeout(() => {
          createDynamicSlash(cx - 50, cy + 30, cx + 70, cy - 20, {
            color: colors.main,
            glowColor: colors.glow,
            maxThickness: 20,
            curvature: 0.35,
          });
          screenShake(10, 150);
        }, 120);
        setTimeout(() => {
          createParticleBurst(cx, cy, { count: 18, color: colors.main, glowColor: colors.glow });
        }, 200);
        break;

      case 'triple_slash':
        // Three rapid slashes
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const angle = -Math.PI / 4 + (i * Math.PI / 4);
            createDynamicSlash(
              cx - 50 * Math.cos(angle), cy - 50 * Math.sin(angle),
              cx + 50 * Math.cos(angle), cy + 50 * Math.sin(angle),
              { color: colors.main, glowColor: colors.glow, maxThickness: 18, curvature: 0.3 }
            );
            screenShake(8, 100);
          }, i * 100);
        }
        setTimeout(() => {
          createParticleBurst(cx, cy, { count: 22, color: colors.main, glowColor: colors.glow });
          screenFlash(colors.main, 60, 0.3);
        }, 300);
        break;

      case 'combo':
        // 5-hit combo
        const comboAngles = [0, Math.PI / 3, -Math.PI / 4, Math.PI / 2, 0];
        comboAngles.forEach((angle, i) => {
          setTimeout(() => {
            createDynamicSlash(
              cx - 40 * Math.cos(angle), cy - 40 * Math.sin(angle),
              cx + 40 * Math.cos(angle), cy + 40 * Math.sin(angle),
              { color: colors.main, glowColor: colors.glow, maxThickness: 15 + i * 2, curvature: 0.25, duration: 200 }
            );
            screenShake(6 + i * 2, 80);
            if (i === comboAngles.length - 1) {
              setTimeout(() => {
                screenFlash(colors.main, 100, 0.5);
                createParticleBurst(cx, cy, { count: 30, color: colors.main, glowColor: colors.glow, minSpeed: 5, maxSpeed: 15 });
                freezeFrame(40);
              }, 50);
            }
          }, i * 80);
        });
        break;

      case 'flurry':
        // Many rapid small hits
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            const ox = (Math.random() - 0.5) * 60;
            const oy = (Math.random() - 0.5) * 60;
            const angle = Math.random() * Math.PI * 2;
            createDynamicSlash(
              cx + ox - 25 * Math.cos(angle), cy + oy - 25 * Math.sin(angle),
              cx + ox + 25 * Math.cos(angle), cy + oy + 25 * Math.sin(angle),
              { color: colors.main, glowColor: colors.glow, maxThickness: 12, curvature: 0.2, duration: 150 }
            );
            screenShake(4, 50);
          }, i * 50);
        }
        setTimeout(() => {
          createParticleBurst(cx, cy, { count: 35, color: colors.main, glowColor: colors.glow });
        }, 450);
        break;

      // ========== THRUST/PIERCE ATTACKS ==========
      case 'thrust':
        weaponAttackSounds.sword_thrust();
        createDynamicSlash(startX, startY, targetX, targetY, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 15,
          minThickness: 8,
          curvature: 0.05,
          duration: 200,
        });
        setTimeout(() => {
          screenShake(10, 150);
          createShockwave(cx, cy, { radius: 60, duration: 250 });
          createParticleBurst(cx, cy, {
            count: 20,
            color: colors.main,
            glowColor: colors.glow,
            spread: Math.PI / 2,
            direction: Math.atan2(targetY - startY, targetX - startX),
          });
        }, 80);
        break;

      case 'quick_stab':
        // Fast piercing attack
        createDynamicSlash(cx - 60, cy, cx + 40, cy, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 10,
          minThickness: 6,
          curvature: 0.02,
          duration: 120,
          swingSpeed: 0.15,
        });
        setTimeout(() => {
          screenShake(6, 80);
          createParticleBurst(cx + 30, cy, {
            count: 10,
            color: colors.main,
            glowColor: colors.glow,
            spread: Math.PI / 3,
            direction: 0,
            minSpeed: 5,
            maxSpeed: 12,
          });
        }, 60);
        break;

      case 'rapid_stab':
        // Multiple quick stabs
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const oy = (i - 2) * 15;
            createDynamicSlash(cx - 50, cy + oy, cx + 30, cy + oy, {
              color: colors.main,
              glowColor: colors.glow,
              maxThickness: 8,
              minThickness: 5,
              curvature: 0.01,
              duration: 100,
              swingSpeed: 0.2,
            });
            screenShake(4, 50);
          }, i * 60);
        }
        setTimeout(() => {
          createParticleBurst(cx + 20, cy, { count: 20, color: colors.main, glowColor: colors.glow });
        }, 350);
        break;

      case 'lunge':
        // Dashing thrust
        createDynamicSlash(cx - 120, cy, cx + 60, cy, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 18,
          minThickness: 10,
          curvature: 0.03,
          duration: 250,
        });
        setTimeout(() => {
          screenShake(14, 200);
          createShockwave(cx + 40, cy, { radius: 80, duration: 300 });
          createParticleBurst(cx + 40, cy, { count: 22, color: colors.main, glowColor: colors.glow, spread: Math.PI / 2, direction: 0 });
        }, 120);
        break;

      // ========== HEAVY ATTACKS ==========
      case 'smash':
        weaponAttackSounds.hammer_smash();
        createDynamicSlash(cx, cy - 100, cx, cy + 30, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 30,
          curvature: 0.1,
          duration: 300,
        });
        setTimeout(() => {
          screenShake(18, 300);
          screenFlash(colors.main, 150, 0.5);
          createShockwave(cx, cy, { radius: 120, amplitude: 40, duration: 450 });
          createParticleBurst(cx, cy, {
            count: 35,
            color: colors.main,
            glowColor: colors.glow,
            spread: Math.PI,
            direction: -Math.PI / 2,
            minSpeed: 5,
            maxSpeed: 15,
          });
          freezeFrame(50);
        }, 100);
        break;

      case 'heavy_strike':
        // Slow but powerful
        createDynamicSlash(cx - 80, cy - 60, cx + 80, cy + 40, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 35,
          curvature: 0.35,
          duration: 350,
          swingSpeed: 0.06,
        });
        setTimeout(() => {
          screenShake(22, 350);
          screenFlash(colors.main, 180, 0.6);
          createParticleBurst(cx, cy, { count: 40, color: colors.main, glowColor: colors.glow, minSpeed: 6, maxSpeed: 18 });
          freezeFrame(70);
        }, 180);
        break;

      case 'overhead_slam':
        // Overhead strike
        createDynamicSlash(cx, cy - 120, cx, cy + 40, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 35,
          curvature: 0.08,
          duration: 320,
        });
        setTimeout(() => {
          screenShake(25, 400);
          screenFlash(colors.main, 200, 0.6);
          createShockwave(cx, cy + 20, { radius: 140, amplitude: 50, duration: 500 });
          createParticleBurst(cx, cy + 20, { count: 45, color: colors.main, glowColor: colors.glow, spread: Math.PI, direction: Math.PI / 2 });
          freezeFrame(80);
        }, 150);
        break;

      case 'ground_pound':
        // AoE ground impact
        {
          const app = appRef.current;
          if (app && app.layers) {
            // Fist/weapon coming down
            const impact = new PIXI.Graphics();
            impact.beginFill(colors.main, 0.8);
            impact.drawCircle(0, 0, 20);
            impact.endFill();
            impact.x = cx;
            impact.y = cy - 100;
            impact.filters = [new GlowFilter({ distance: 20, outerStrength: 3, color: colors.glow, quality: 0.3 })];
            app.layers.effects.addChild(impact);

            let impactProgress = 0;
            const animateImpact = () => {
              impactProgress += 0.12;
              impact.y = cy - 100 + impactProgress * 120;
              if (impactProgress < 1) {
                requestAnimationFrame(animateImpact);
              } else {
                app.layers.effects.removeChild(impact);
                impact.destroy();
                // Big ground explosion
                screenShake(30, 450);
                screenFlash(colors.main, 200, 0.7);
                createShockwave(cx, cy + 20, { radius: 160, amplitude: 60, duration: 550 });
                createParticleBurst(cx, cy + 20, { count: 50, color: colors.main, glowColor: colors.glow, spread: Math.PI, direction: -Math.PI / 2, gravity: 0.3 });
                freezeFrame(100);
              }
            };
            animateImpact();
          }
        }
        break;

      case 'cleave':
        // Wide sweeping attack
        weaponAttackSounds.axe_chop();
        createDynamicSlash(cx - 100, cy - 20, cx + 100, cy + 20, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 30,
          curvature: 0.5,
          duration: 280,
        });
        setTimeout(() => {
          screenShake(16, 280);
          createParticleBurst(cx, cy, { count: 30, color: colors.main, glowColor: colors.glow, spread: Math.PI, direction: 0 });
        }, 120);
        break;

      // ========== SPECIAL ATTACKS ==========
      case 'spin_attack':
        // 360 degree spin
        {
          const spinAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
          spinAngles.forEach((angle, i) => {
            setTimeout(() => {
              createDynamicSlash(
                cx + Math.cos(angle) * 60, cy + Math.sin(angle) * 40,
                cx + Math.cos(angle + Math.PI) * 60, cy + Math.sin(angle + Math.PI) * 40,
                { color: colors.main, glowColor: colors.glow, maxThickness: 20, curvature: 0.6, duration: 180 }
              );
              screenShake(8, 80);
            }, i * 60);
          });
          setTimeout(() => {
            createShockwave(cx, cy, { radius: 100, duration: 350 });
            createParticleBurst(cx, cy, { count: 35, color: colors.main, glowColor: colors.glow });
          }, 280);
        }
        break;

      case 'uppercut':
        // Rising strike
        createDynamicSlash(cx - 20, cy + 40, cx + 20, cy - 80, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 28,
          curvature: 0.6,
        });
        setTimeout(() => {
          screenShake(16, 220);
          createParticleBurst(cx, cy - 50, {
            count: 25,
            color: colors.main,
            glowColor: colors.glow,
            direction: -Math.PI / 2,
            spread: Math.PI / 3,
            minSpeed: 8,
            maxSpeed: 18,
          });
        }, 100);
        break;

      case 'backstab':
        // Quick lethal strike with crit effect
        {
          const app = appRef.current;
          if (app && app.layers) {
            // Dagger/blade appearing
            createDynamicSlash(cx + 30, cy - 20, cx - 30, cy + 20, {
              color: colors.main,
              glowColor: colors.glow,
              maxThickness: 16,
              curvature: 0.1,
              duration: 150,
              swingSpeed: 0.15,
            });

            // "CRITICAL" flash effect
            setTimeout(() => {
              screenFlash(0xff0000, 100, 0.6);
              screenShake(14, 180);
              freezeFrame(60);

              // Blood splatter (red particles)
              createParticleBurst(cx, cy, {
                count: 25,
                color: 0xff0000,
                glowColor: 0xaa0000,
                minSpeed: 5,
                maxSpeed: 15,
                gravity: 0.2,
                duration: 600,
              });
            }, 80);
          }
        }
        break;

      case 'critical_hit':
        // Emphasized critical strike
        combatStateSounds.critical_hit();
        createDynamicSlash(cx - 60, cy - 40, cx + 60, cy + 40, {
          color: 0xffff00,
          glowColor: 0xffaa00,
          maxThickness: 30,
          curvature: 0.4,
        });
        setTimeout(() => {
          screenFlash(0xffff00, 150, 0.8);
          screenShake(20, 300);
          freezeFrame(80);
          createShockwave(cx, cy, { radius: 100, amplitude: 40, duration: 400 });
          // Star burst pattern
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            createParticleBurst(cx, cy, {
              count: 5,
              color: 0xffff00,
              glowColor: 0xffaa00,
              direction: angle,
              spread: Math.PI / 8,
              minSpeed: 10,
              maxSpeed: 20,
            });
          }
        }, 100);
        break;

      case 'parry':
        // Defensive counter spark
        {
          const app = appRef.current;
          if (app && app.layers) {
            // Shield/parry spark
            const spark = new PIXI.Graphics();
            spark.beginFill(0xffffff, 1);
            spark.drawCircle(0, 0, 5);
            spark.endFill();
            spark.x = cx;
            spark.y = cy;
            spark.filters = [new GlowFilter({ distance: 30, outerStrength: 4, color: 0xaaaaff, quality: 0.3 })];
            app.layers.effects.addChild(spark);

            // Clashing lines
            for (let i = 0; i < 6; i++) {
              const line = new PIXI.Graphics();
              const angle = (i / 6) * Math.PI * 2;
              line.lineStyle(3, 0xffffff, 1);
              line.moveTo(0, 0);
              line.lineTo(Math.cos(angle) * 40, Math.sin(angle) * 40);
              line.x = cx;
              line.y = cy;
              line.filters = [new GlowFilter({ distance: 10, outerStrength: 2, color: 0xaaaaff, quality: 0.3 })];
              app.layers.effects.addChild(line);

              let lineProgress = 0;
              const animateLine = () => {
                lineProgress += 0.15;
                line.alpha = 1 - lineProgress;
                if (lineProgress < 1) {
                  requestAnimationFrame(animateLine);
                } else {
                  app.layers.effects.removeChild(line);
                  line.destroy();
                }
              };
              animateLine();
            }

            screenFlash(0xaaaaff, 60, 0.7);
            screenShake(8, 100);

            let sparkProgress = 0;
            const animateSpark = () => {
              sparkProgress += 0.1;
              spark.scale.set(1 + sparkProgress * 2);
              spark.alpha = 1 - sparkProgress;
              if (sparkProgress < 1) {
                requestAnimationFrame(animateSpark);
              } else {
                app.layers.effects.removeChild(spark);
                spark.destroy();
              }
            };
            animateSpark();
          }
        }
        break;

      case 'counter':
        // Parry into counter attack
        {
          // First the parry spark
          const app = appRef.current;
          if (app && app.layers) {
            screenFlash(0xaaaaff, 40, 0.5);
            createParticleBurst(cx - 20, cy, { count: 10, color: 0xffffff, glowColor: 0xaaaaff, minSpeed: 3, maxSpeed: 8 });
          }
          // Then the counter slash
          setTimeout(() => {
            createDynamicSlash(cx - 40, cy + 20, cx + 80, cy - 30, {
              color: colors.main,
              glowColor: colors.glow,
              maxThickness: 26,
              curvature: 0.45,
            });
            screenShake(14, 200);
            setTimeout(() => {
              createParticleBurst(cx + 50, cy, { count: 20, color: colors.main, glowColor: colors.glow });
            }, 80);
          }, 150);
        }
        break;

      case 'execute':
        // Finishing move - very dramatic
        screenFlash(0x000000, 100, 0.5); // Dark flash first
        setTimeout(() => {
          createDynamicSlash(cx - 80, cy - 60, cx + 80, cy + 60, {
            color: 0xff0000,
            glowColor: 0xaa0000,
            maxThickness: 35,
            curvature: 0.3,
          });
        }, 100);
        setTimeout(() => {
          screenFlash(0xff0000, 250, 0.8);
          screenShake(28, 400);
          freezeFrame(120);
          createShockwave(cx, cy, { radius: 130, amplitude: 50, duration: 500 });
          // Blood explosion
          createParticleBurst(cx, cy, {
            count: 50,
            color: 0xff0000,
            glowColor: 0x880000,
            minSpeed: 8,
            maxSpeed: 20,
            gravity: 0.2,
            duration: 800,
          });
        }, 200);
        break;

      // ========== UNARMED/BLUNT ATTACKS ==========
      case 'punch':
        {
          weaponAttackSounds.punch();
          const app = appRef.current;
          if (app && app.layers) {
            // Fist impact
            const fist = new PIXI.Graphics();
            fist.beginFill(colors.main, 0.9);
            fist.drawCircle(0, 0, 15);
            fist.endFill();
            fist.x = cx - 60;
            fist.y = cy;
            fist.filters = [new GlowFilter({ distance: 15, outerStrength: 2, color: colors.glow, quality: 0.3 })];
            app.layers.effects.addChild(fist);

            let punchProgress = 0;
            const animatePunch = () => {
              punchProgress += 0.15;
              fist.x = cx - 60 + punchProgress * 80;
              if (punchProgress < 1) {
                requestAnimationFrame(animatePunch);
              } else {
                app.layers.effects.removeChild(fist);
                fist.destroy();
                screenShake(12, 150);
                createParticleBurst(cx + 20, cy, {
                  count: 15,
                  color: colors.main,
                  glowColor: colors.glow,
                  spread: Math.PI / 2,
                  direction: 0,
                });
              }
            };
            animatePunch();
          }
        }
        break;

      case 'kick':
        // Sweeping kick arc
        createDynamicSlash(cx - 60, cy + 40, cx + 60, cy + 30, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 20,
          curvature: 0.7,
        });
        setTimeout(() => {
          screenShake(14, 180);
          createParticleBurst(cx + 40, cy + 30, { count: 15, color: colors.main, glowColor: colors.glow });
        }, 100);
        break;

      case 'headbutt':
        {
          const app = appRef.current;
          if (app && app.layers) {
            screenFlash(colors.main, 80, 0.5);
            screenShake(18, 250);
            // Impact stars
            for (let i = 0; i < 5; i++) {
              const star = new PIXI.Graphics();
              star.beginFill(0xffff00, 1);
              const starX = cx + (Math.random() - 0.5) * 40;
              const starY = cy + (Math.random() - 0.5) * 30;
              // 4-point star
              star.moveTo(0, -8);
              star.lineTo(2, -2);
              star.lineTo(8, 0);
              star.lineTo(2, 2);
              star.lineTo(0, 8);
              star.lineTo(-2, 2);
              star.lineTo(-8, 0);
              star.lineTo(-2, -2);
              star.closePath();
              star.endFill();
              star.x = starX;
              star.y = starY;
              star.filters = [new GlowFilter({ distance: 8, outerStrength: 2, color: 0xffff00, quality: 0.3 })];
              app.layers.particles.addChild(star);

              star.rotation = Math.random() * Math.PI;
              let starProgress = 0;
              const animateStar = () => {
                starProgress += 0.04;
                star.rotation += 0.1;
                star.alpha = 1 - starProgress;
                star.scale.set(1 - starProgress * 0.5);
                if (starProgress < 1) {
                  requestAnimationFrame(animateStar);
                } else {
                  app.layers.particles.removeChild(star);
                  star.destroy();
                }
              };
              setTimeout(animateStar, i * 50);
            }
            freezeFrame(50);
          }
        }
        break;

      case 'body_slam':
        // Full body impact
        {
          const app = appRef.current;
          if (app && app.layers) {
            // Body flying in
            const body = new PIXI.Graphics();
            body.beginFill(colors.main, 0.7);
            body.drawEllipse(0, 0, 30, 20);
            body.endFill();
            body.x = cx - 100;
            body.y = cy - 50;
            body.filters = [new GlowFilter({ distance: 20, outerStrength: 2, color: colors.glow, quality: 0.3 })];
            app.layers.effects.addChild(body);

            let slamProgress = 0;
            const animateSlam = () => {
              slamProgress += 0.1;
              body.x = cx - 100 + slamProgress * 100;
              body.y = cy - 50 + slamProgress * 50;
              body.rotation += 0.2;
              if (slamProgress < 1) {
                requestAnimationFrame(animateSlam);
              } else {
                app.layers.effects.removeChild(body);
                body.destroy();
                // Massive impact
                screenShake(25, 400);
                screenFlash(colors.main, 200, 0.6);
                createShockwave(cx, cy, { radius: 130, amplitude: 45, duration: 500 });
                createParticleBurst(cx, cy, { count: 40, color: colors.main, glowColor: colors.glow, gravity: 0.2 });
                freezeFrame(80);
              }
            };
            animateSlam();
          }
        }
        break;

      case 'dash_strike':
        // Fast dashing attack
        {
          const app = appRef.current;
          if (app && app.layers) {
            // Speed lines
            for (let i = 0; i < 6; i++) {
              const line = new PIXI.Graphics();
              line.lineStyle(2, colors.main, 0.6);
              const ly = cy - 30 + i * 12;
              line.moveTo(cx - 100, ly);
              line.lineTo(cx + 50, ly);
              line.filters = [new GlowFilter({ distance: 8, outerStrength: 1, color: colors.glow, quality: 0.3 })];
              app.layers.effects.addChild(line);

              let lineProgress = 0;
              const animateLine = () => {
                lineProgress += 0.1;
                line.alpha = 1 - lineProgress;
                if (lineProgress < 1) {
                  requestAnimationFrame(animateLine);
                } else {
                  app.layers.effects.removeChild(line);
                  line.destroy();
                }
              };
              setTimeout(animateLine, i * 20);
            }
          }
          setTimeout(() => {
            createDynamicSlash(cx - 30, cy, cx + 50, cy, {
              color: colors.main,
              glowColor: colors.glow,
              maxThickness: 20,
              curvature: 0.1,
              duration: 150,
            });
            screenShake(12, 150);
            createParticleBurst(cx + 40, cy, { count: 18, color: colors.main, glowColor: colors.glow, direction: 0, spread: Math.PI / 2 });
          }, 100);
        }
        break;

      // ========== LEGENDARY WEAPON SIGNATURE ATTACKS ==========

      case 'dragon_soul_slash':
        // Dragon Blade - Summons a dragon spirit that attacks with you
        {
          legendaryWeaponSounds.dragon_soul_slash();
          const app = appRef.current;
          if (app && app.layers) {
            // Dragon spirit emerges
            const dragonContainer = new PIXI.Container();
            app.layers.effects.addChild(dragonContainer);

            // Dragon head shape
            const dragonHead = new PIXI.Graphics();
            dragonHead.beginFill(0xff4400, 0.8);
            dragonHead.moveTo(0, -20);
            dragonHead.lineTo(40, 0);
            dragonHead.lineTo(30, 15);
            dragonHead.lineTo(0, 10);
            dragonHead.lineTo(-30, 15);
            dragonHead.lineTo(-40, 0);
            dragonHead.closePath();
            dragonHead.endFill();
            dragonHead.filters = [new GlowFilter({ distance: 30, outerStrength: 4, color: 0xff6600, quality: 0.3 })];
            dragonContainer.addChild(dragonHead);

            // Dragon body trail
            for (let i = 0; i < 8; i++) {
              const segment = new PIXI.Graphics();
              segment.beginFill(0xff4400, 0.6 - i * 0.06);
              segment.drawCircle(0, 0, 20 - i * 2);
              segment.endFill();
              segment.x = -i * 25;
              segment.y = Math.sin(i * 0.5) * 10;
              segment.filters = [new GlowFilter({ distance: 15, outerStrength: 2, color: 0xff2200, quality: 0.2 })];
              dragonContainer.addChild(segment);
            }

            dragonContainer.x = cx - 200;
            dragonContainer.y = cy - 50;

            // Fire breath particles
            const fireParticles = [];
            for (let i = 0; i < 30; i++) {
              const particle = new PIXI.Graphics();
              particle.beginFill([0xff4400, 0xff6600, 0xffaa00][Math.floor(Math.random() * 3)], 0.8);
              particle.drawCircle(0, 0, 3 + Math.random() * 5);
              particle.endFill();
              particle.x = 40;
              particle.y = (Math.random() - 0.5) * 20;
              particle.vx = 8 + Math.random() * 10;
              particle.vy = (Math.random() - 0.5) * 4;
              particle.life = 1;
              dragonContainer.addChild(particle);
              fireParticles.push(particle);
            }

            let dragonProgress = 0;
            const animateDragon = () => {
              dragonProgress += 0.025;
              const eased = easeOutCubic(Math.min(dragonProgress, 1));
              dragonContainer.x = cx - 200 + eased * 280;
              dragonContainer.y = cy - 50 + Math.sin(dragonProgress * 10) * 20;
              dragonHead.rotation = Math.sin(dragonProgress * 8) * 0.1;

              // Animate fire particles
              fireParticles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.03;
                p.alpha = p.life;
                if (p.life <= 0) {
                  p.x = 40;
                  p.y = (Math.random() - 0.5) * 20;
                  p.life = 1;
                }
              });

              if (dragonProgress < 1.2) {
                requestAnimationFrame(animateDragon);
              } else {
                // Impact explosion
                screenShake(30, 500);
                screenFlash(0xff4400, 200, 0.8);
                freezeFrame(100);
                createShockwave(cx + 60, cy, { radius: 180, amplitude: 60, duration: 600 });

                // Massive fire explosion
                for (let i = 0; i < 40; i++) {
                  createParticleBurst(cx + 60 + (Math.random() - 0.5) * 60, cy + (Math.random() - 0.5) * 40, {
                    count: 3,
                    color: [0xff4400, 0xff6600, 0xffaa00][Math.floor(Math.random() * 3)],
                    glowColor: 0xff0000,
                    minSpeed: 5,
                    maxSpeed: 20,
                    gravity: -0.1,
                  });
                }

                // Dragon slashes
                createDynamicSlash(cx - 40, cy - 60, cx + 100, cy + 40, {
                  color: 0xff4400,
                  glowColor: 0xff0000,
                  maxThickness: 40,
                  curvature: 0.5,
                });
                setTimeout(() => {
                  createDynamicSlash(cx + 100, cy - 50, cx - 40, cy + 50, {
                    color: 0xff6600,
                    glowColor: 0xff2200,
                    maxThickness: 35,
                    curvature: 0.4,
                  });
                }, 100);

                app.layers.effects.removeChild(dragonContainer);
                dragonContainer.destroy({ children: true });
              }
            };
            animateDragon();
          }
        }
        break;

      case 'crimson_rampage':
        // Bloodfang - Blood-fueled frenzy attack
        {
          legendaryWeaponSounds.soulreaper_harvest();
          const app = appRef.current;
          if (app && app.layers) {
            screenFlash(0x880000, 100, 0.4);

            // Blood aura buildup
            const aura = new PIXI.Graphics();
            aura.beginFill(0xff0000, 0.3);
            aura.drawCircle(0, 0, 60);
            aura.endFill();
            aura.x = cx;
            aura.y = cy;
            aura.filters = [new GlowFilter({ distance: 40, outerStrength: 4, color: 0xff0000, quality: 0.3 })];
            app.layers.effects.addChild(aura);

            let auraProgress = 0;
            const animateAura = () => {
              auraProgress += 0.08;
              aura.scale.set(1 + Math.sin(auraProgress * 10) * 0.2);
              aura.alpha = 0.3 + Math.sin(auraProgress * 15) * 0.2;
              if (auraProgress < 0.5) {
                requestAnimationFrame(animateAura);
              } else {
                app.layers.effects.removeChild(aura);
                aura.destroy();
              }
            };
            animateAura();

            // Rapid blood slashes
            const slashAngles = [0, Math.PI/3, -Math.PI/4, Math.PI/2, -Math.PI/3, Math.PI/4, -Math.PI/2];
            slashAngles.forEach((angle, i) => {
              setTimeout(() => {
                const intensity = 1 + i * 0.15;
                createDynamicSlash(
                  cx - 50 * Math.cos(angle), cy - 50 * Math.sin(angle),
                  cx + 50 * Math.cos(angle), cy + 50 * Math.sin(angle),
                  {
                    color: 0xff0000,
                    glowColor: 0x880000,
                    maxThickness: 18 + i * 3,
                    curvature: 0.3,
                    duration: 150,
                  }
                );
                screenShake(8 + i * 2, 100);

                // Blood splatter
                createParticleBurst(cx + (Math.random() - 0.5) * 40, cy + (Math.random() - 0.5) * 40, {
                  count: 8,
                  color: 0xff0000,
                  glowColor: 0x880000,
                  minSpeed: 4,
                  maxSpeed: 12,
                  gravity: 0.3,
                  duration: 500,
                });
              }, i * 70);
            });

            // Final blood explosion
            setTimeout(() => {
              screenFlash(0xff0000, 200, 0.7);
              screenShake(25, 400);
              freezeFrame(80);
              createShockwave(cx, cy, { radius: 140, amplitude: 50, duration: 500 });

              // Blood rain
              for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                  createParticleBurst(cx + (Math.random() - 0.5) * 150, cy - 50, {
                    count: 2,
                    color: 0xff0000,
                    glowColor: 0x660000,
                    minSpeed: 2,
                    maxSpeed: 8,
                    direction: Math.PI / 2,
                    spread: Math.PI / 6,
                    gravity: 0.4,
                    duration: 800,
                  });
                }, i * 15);
              }
            }, 550);
          }
        }
        break;

      case 'temporal_rift':
        // Eternity Edge - Time distortion slash
        {
          legendaryWeaponSounds.temporal_cascade();
          const app = appRef.current;
          if (app && app.layers) {
            // Time freeze effect - everything goes grayscale briefly
            screenFlash(0x4488ff, 50, 0.3);

            // Create time rift portal
            const riftContainer = new PIXI.Container();
            app.layers.effects.addChild(riftContainer);

            // Swirling time vortex
            for (let ring = 0; ring < 5; ring++) {
              const rift = new PIXI.Graphics();
              rift.lineStyle(3 - ring * 0.4, [0x4488ff, 0x88ccff, 0xffffff][ring % 3], 0.8 - ring * 0.1);
              rift.drawEllipse(0, 0, 50 + ring * 15, 30 + ring * 10);
              rift.x = cx;
              rift.y = cy;
              rift.filters = [new GlowFilter({ distance: 15, outerStrength: 2, color: 0x4488ff, quality: 0.3 })];
              riftContainer.addChild(rift);
            }

            // Clock symbols floating
            const clockSymbols = ['⏰', '⌛', '🕐'];
            for (let i = 0; i < 8; i++) {
              const symbol = new PIXI.Graphics();
              symbol.beginFill(0x88ccff, 0.7);
              symbol.drawCircle(0, 0, 5);
              symbol.endFill();
              const angle = (i / 8) * Math.PI * 2;
              symbol.x = cx + Math.cos(angle) * 80;
              symbol.y = cy + Math.sin(angle) * 50;
              symbol.startAngle = angle;
              symbol.filters = [new GlowFilter({ distance: 10, outerStrength: 2, color: 0x88ccff, quality: 0.3 })];
              riftContainer.addChild(symbol);
            }

            let riftProgress = 0;
            const animateRift = () => {
              riftProgress += 0.03;

              // Rotate rift rings
              riftContainer.children.forEach((child, i) => {
                if (i < 5) {
                  child.rotation += 0.05 * (i % 2 === 0 ? 1 : -1);
                  child.scale.set(1 + Math.sin(riftProgress * 5 + i) * 0.1);
                } else {
                  // Orbit clock symbols
                  const angle = child.startAngle + riftProgress * 3;
                  child.x = cx + Math.cos(angle) * (80 - riftProgress * 40);
                  child.y = cy + Math.sin(angle) * (50 - riftProgress * 25);
                }
              });

              if (riftProgress < 1) {
                requestAnimationFrame(animateRift);
              } else {
                // Time slash - multiple afterimages
                for (let i = 0; i < 5; i++) {
                  setTimeout(() => {
                    createDynamicSlash(
                      cx - 80 + i * 10, cy - 40,
                      cx + 80 - i * 10, cy + 40,
                      {
                        color: [0x4488ff, 0x88ccff, 0xffffff][i % 3],
                        glowColor: 0x4488ff,
                        maxThickness: 25 - i * 3,
                        curvature: 0.3,
                        duration: 200,
                      }
                    );
                  }, i * 30);
                }

                setTimeout(() => {
                  screenFlash(0xffffff, 150, 0.9);
                  screenShake(20, 350);
                  freezeFrame(150); // Longer freeze for time effect
                  createShockwave(cx, cy, { radius: 160, amplitude: 40, duration: 600 });

                  app.layers.effects.removeChild(riftContainer);
                  riftContainer.destroy({ children: true });
                }, 180);
              }
            };
            animateRift();
          }
        }
        break;

      case 'divine_annihilation':
        // Godslayer - Ultimate cosmic destruction
        {
          legendaryWeaponSounds.cosmic_singularity();
          const app = appRef.current;
          if (app && app.layers) {
            // Dark buildup
            screenFlash(0x000000, 300, 0.6);

            const cosmicContainer = new PIXI.Container();
            app.layers.effects.addChild(cosmicContainer);

            // Gathering cosmic energy
            for (let i = 0; i < 20; i++) {
              const star = new PIXI.Graphics();
              star.beginFill([0xffffff, 0xffffaa, 0xaaaaff][Math.floor(Math.random() * 3)], 0.8);
              star.drawCircle(0, 0, 2 + Math.random() * 3);
              star.endFill();
              const angle = Math.random() * Math.PI * 2;
              const dist = 150 + Math.random() * 100;
              star.x = cx + Math.cos(angle) * dist;
              star.y = cy + Math.sin(angle) * dist;
              star.targetX = cx;
              star.targetY = cy;
              star.filters = [new GlowFilter({ distance: 10, outerStrength: 3, color: 0xffffff, quality: 0.3 })];
              cosmicContainer.addChild(star);
            }

            let gatherProgress = 0;
            const animateGather = () => {
              gatherProgress += 0.02;

              cosmicContainer.children.forEach(star => {
                star.x += (star.targetX - star.x) * 0.05;
                star.y += (star.targetY - star.y) * 0.05;
              });

              if (gatherProgress < 1) {
                requestAnimationFrame(animateGather);
              } else {
                // MASSIVE explosion
                app.layers.effects.removeChild(cosmicContainer);
                cosmicContainer.destroy({ children: true });

                // Core explosion
                const core = new PIXI.Graphics();
                core.beginFill(0xffffff, 1);
                core.drawCircle(0, 0, 10);
                core.endFill();
                core.x = cx;
                core.y = cy;
                core.filters = [new GlowFilter({ distance: 50, outerStrength: 6, color: 0xffffaa, quality: 0.3 })];
                app.layers.effects.addChild(core);

                let explodeProgress = 0;
                const animateExplode = () => {
                  explodeProgress += 0.04;
                  core.scale.set(1 + explodeProgress * 15);
                  core.alpha = 1 - explodeProgress;

                  if (explodeProgress < 1) {
                    requestAnimationFrame(animateExplode);
                  } else {
                    app.layers.effects.removeChild(core);
                    core.destroy();
                  }
                };
                animateExplode();

                screenFlash(0xffffff, 400, 1);
                screenShake(40, 600);
                freezeFrame(200);
                createShockwave(cx, cy, { radius: 250, amplitude: 80, duration: 800 });
                createShockwave(cx, cy, { radius: 180, amplitude: 60, duration: 600 });

                // Multiple cosmic slashes
                for (let i = 0; i < 8; i++) {
                  setTimeout(() => {
                    const angle = (i / 8) * Math.PI * 2;
                    createDynamicSlash(
                      cx, cy,
                      cx + Math.cos(angle) * 120, cy + Math.sin(angle) * 80,
                      {
                        color: [0xffffff, 0xffffaa, 0xffaaff][i % 3],
                        glowColor: 0xffffff,
                        maxThickness: 30,
                        curvature: 0.2,
                        duration: 300,
                      }
                    );
                  }, i * 40);
                }

                // Star burst particles
                for (let wave = 0; wave < 3; wave++) {
                  setTimeout(() => {
                    for (let i = 0; i < 16; i++) {
                      const angle = (i / 16) * Math.PI * 2;
                      createParticleBurst(cx, cy, {
                        count: 5,
                        color: [0xffffff, 0xffffaa, 0xaaaaff][wave],
                        glowColor: 0xffffff,
                        direction: angle,
                        spread: Math.PI / 8,
                        minSpeed: 10 + wave * 5,
                        maxSpeed: 20 + wave * 5,
                      });
                    }
                  }, wave * 100);
                }
              }
            };
            animateGather();
          }
        }
        break;

      case 'reapers_harvest':
        // Void Scythe - Death scythe sweeping attack
        {
          legendaryWeaponSounds.void_scythe_rend();
          const app = appRef.current;
          if (app && app.layers) {
            // Dark mist rises
            for (let i = 0; i < 15; i++) {
              const mist = new PIXI.Graphics();
              mist.beginFill(0x220044, 0.4);
              mist.drawEllipse(0, 0, 20 + Math.random() * 30, 10 + Math.random() * 15);
              mist.endFill();
              mist.x = cx + (Math.random() - 0.5) * 200;
              mist.y = cy + 60;
              mist.vy = -1 - Math.random() * 2;
              mist.filters = [new GlowFilter({ distance: 10, outerStrength: 1, color: 0x8800ff, quality: 0.2 })];
              app.layers.effects.addChild(mist);

              let mistProgress = 0;
              const animateMist = () => {
                mistProgress += 0.02;
                mist.y += mist.vy;
                mist.alpha = 0.4 - mistProgress * 0.4;
                if (mistProgress < 1) {
                  requestAnimationFrame(animateMist);
                } else {
                  app.layers.effects.removeChild(mist);
                  mist.destroy();
                }
              };
              setTimeout(animateMist, i * 30);
            }

            // Scythe arc slashes (3 massive sweeps)
            const scytheAngles = [-60, 0, 60];
            scytheAngles.forEach((startAngle, i) => {
              setTimeout(() => {
                // Large curved scythe swing
                const startRad = (startAngle - 90) * Math.PI / 180;
                const endRad = (startAngle + 90) * Math.PI / 180;
                createDynamicSlash(
                  cx + Math.cos(startRad) * 100, cy + Math.sin(startRad) * 60,
                  cx + Math.cos(endRad) * 100, cy + Math.sin(endRad) * 60,
                  {
                    color: 0x8800ff,
                    glowColor: 0x440088,
                    maxThickness: 35,
                    curvature: 0.8,
                    duration: 350,
                  }
                );
                screenShake(15, 200);

                // Soul particles being reaped
                for (let j = 0; j < 8; j++) {
                  const soul = new PIXI.Graphics();
                  soul.beginFill(0xaaaaff, 0.6);
                  soul.drawCircle(0, 0, 4);
                  soul.endFill();
                  soul.x = cx + (Math.random() - 0.5) * 120;
                  soul.y = cy + (Math.random() - 0.5) * 80;
                  soul.filters = [new GlowFilter({ distance: 8, outerStrength: 2, color: 0x8800ff, quality: 0.3 })];
                  app.layers.particles.addChild(soul);

                  let soulProgress = 0;
                  const animateSoul = () => {
                    soulProgress += 0.05;
                    soul.y -= 3;
                    soul.alpha = 0.6 - soulProgress * 0.6;
                    soul.scale.set(1 - soulProgress * 0.5);
                    if (soulProgress < 1) {
                      requestAnimationFrame(animateSoul);
                    } else {
                      app.layers.particles.removeChild(soul);
                      soul.destroy();
                    }
                  };
                  setTimeout(animateSoul, j * 40);
                }
              }, i * 250);
            });

            // Final death mark
            setTimeout(() => {
              screenFlash(0x8800ff, 200, 0.6);
              freezeFrame(100);
              createShockwave(cx, cy, { radius: 150, amplitude: 40, duration: 500 });

              // Skull symbol flash (simplified)
              const skull = new PIXI.Graphics();
              skull.beginFill(0xffffff, 0.8);
              skull.drawCircle(0, -5, 20);
              skull.drawRect(-15, 10, 30, 15);
              skull.endFill();
              skull.beginFill(0x000000, 1);
              skull.drawCircle(-7, -8, 5);
              skull.drawCircle(7, -8, 5);
              skull.endFill();
              skull.x = cx;
              skull.y = cy;
              skull.filters = [new GlowFilter({ distance: 20, outerStrength: 3, color: 0x8800ff, quality: 0.3 })];
              app.layers.effects.addChild(skull);

              let skullProgress = 0;
              const animateSkull = () => {
                skullProgress += 0.04;
                skull.scale.set(1 + skullProgress);
                skull.alpha = 1 - skullProgress;
                if (skullProgress < 1) {
                  requestAnimationFrame(animateSkull);
                } else {
                  app.layers.effects.removeChild(skull);
                  skull.destroy();
                }
              };
              animateSkull();
            }, 800);
          }
        }
        break;

      case 'glacial_sunder':
        // Frostbite Blade - Ice crystal explosion slash
        {
          legendaryWeaponSounds.frostbane_cleave();
          const app = appRef.current;
          if (app && app.layers) {
            // Ice crystals form around target
            const crystals = [];
            for (let i = 0; i < 12; i++) {
              const crystal = new PIXI.Graphics();
              crystal.beginFill(0x88ffff, 0.8);
              // Diamond shape
              crystal.moveTo(0, -15);
              crystal.lineTo(8, 0);
              crystal.lineTo(0, 15);
              crystal.lineTo(-8, 0);
              crystal.closePath();
              crystal.endFill();

              const angle = (i / 12) * Math.PI * 2;
              crystal.x = cx + Math.cos(angle) * 100;
              crystal.y = cy + Math.sin(angle) * 70;
              crystal.rotation = angle;
              crystal.targetX = cx + Math.cos(angle) * 30;
              crystal.targetY = cy + Math.sin(angle) * 20;
              crystal.filters = [new GlowFilter({ distance: 15, outerStrength: 2, color: 0x00aaff, quality: 0.3 })];
              app.layers.effects.addChild(crystal);
              crystals.push(crystal);
            }

            // Frost mist
            for (let i = 0; i < 20; i++) {
              setTimeout(() => {
                createParticleBurst(cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 60, {
                  count: 3,
                  color: 0xaaffff,
                  glowColor: 0x44aaff,
                  minSpeed: 1,
                  maxSpeed: 3,
                  gravity: -0.05,
                  duration: 600,
                });
              }, i * 30);
            }

            let crystalProgress = 0;
            const animateCrystals = () => {
              crystalProgress += 0.04;

              crystals.forEach(crystal => {
                crystal.x += (crystal.targetX - crystal.x) * 0.1;
                crystal.y += (crystal.targetY - crystal.y) * 0.1;
                crystal.rotation += 0.05;
              });

              if (crystalProgress < 1) {
                requestAnimationFrame(animateCrystals);
              } else {
                // Ice explosion!
                crystals.forEach(crystal => {
                  app.layers.effects.removeChild(crystal);
                  crystal.destroy();
                });

                // Shatter slashes
                for (let i = 0; i < 6; i++) {
                  const angle = (i / 6) * Math.PI * 2;
                  createDynamicSlash(
                    cx, cy,
                    cx + Math.cos(angle) * 80, cy + Math.sin(angle) * 50,
                    {
                      color: 0x88ffff,
                      glowColor: 0x00aaff,
                      maxThickness: 20,
                      curvature: 0.2,
                      duration: 200,
                    }
                  );
                }

                screenFlash(0x88ffff, 150, 0.7);
                screenShake(22, 350);
                freezeFrame(80);
                createShockwave(cx, cy, { radius: 140, amplitude: 45, duration: 450 });

                // Ice shards flying outward
                for (let i = 0; i < 30; i++) {
                  createParticleBurst(cx, cy, {
                    count: 2,
                    color: [0x88ffff, 0xaaffff, 0xffffff][Math.floor(Math.random() * 3)],
                    glowColor: 0x00aaff,
                    minSpeed: 8,
                    maxSpeed: 18,
                    duration: 500,
                  });
                }
              }
            };
            animateCrystals();
          }
        }
        break;

      case 'starfall_smash':
        // Celestial Mace - Constellation strike from above
        {
          legendaryWeaponSounds.celestial_judgment();
          const app = appRef.current;
          if (app && app.layers) {
            // Stars gather in constellation pattern
            const constellationPoints = [
              { x: -40, y: -80 }, { x: 0, y: -100 }, { x: 40, y: -80 },
              { x: -60, y: -40 }, { x: 60, y: -40 }, { x: 0, y: 0 },
            ];

            const stars = [];
            constellationPoints.forEach((point, i) => {
              setTimeout(() => {
                const star = new PIXI.Graphics();
                star.beginFill(0xffffaa, 0.9);
                star.drawCircle(0, 0, 6);
                star.endFill();
                star.x = cx + point.x;
                star.y = cy + point.y - 50;
                star.filters = [new GlowFilter({ distance: 20, outerStrength: 3, color: 0xffff00, quality: 0.3 })];
                app.layers.effects.addChild(star);
                stars.push(star);

                // Twinkle effect
                let twinkle = 0;
                const animateTwinkle = () => {
                  twinkle += 0.2;
                  star.scale.set(1 + Math.sin(twinkle) * 0.3);
                  if (star.parent) {
                    requestAnimationFrame(animateTwinkle);
                  }
                };
                animateTwinkle();
              }, i * 100);
            });

            // Draw constellation lines
            setTimeout(() => {
              const lines = new PIXI.Graphics();
              lines.lineStyle(2, 0xffffaa, 0.6);
              constellationPoints.forEach((point, i) => {
                if (i === 0) lines.moveTo(cx + point.x, cy + point.y - 50);
                else lines.lineTo(cx + point.x, cy + point.y - 50);
              });
              lines.lineTo(cx + constellationPoints[0].x, cy + constellationPoints[0].y - 50);
              lines.filters = [new GlowFilter({ distance: 10, outerStrength: 1, color: 0xffffaa, quality: 0.3 })];
              app.layers.effects.addChild(lines);

              // Stars fall down
              setTimeout(() => {
                stars.forEach((star, i) => {
                  let fallProgress = 0;
                  const startY = star.y;
                  const animateFall = () => {
                    fallProgress += 0.08;
                    star.y = startY + fallProgress * (cy - startY + 50);
                    star.scale.set(1 + fallProgress * 2);

                    if (fallProgress < 1) {
                      requestAnimationFrame(animateFall);
                    } else {
                      app.layers.effects.removeChild(star);
                      star.destroy();
                    }
                  };
                  setTimeout(animateFall, i * 30);
                });

                app.layers.effects.removeChild(lines);
                lines.destroy();

                // Massive celestial impact
                setTimeout(() => {
                  screenFlash(0xffffaa, 250, 0.9);
                  screenShake(35, 500);
                  freezeFrame(120);
                  createShockwave(cx, cy, { radius: 180, amplitude: 60, duration: 600 });
                  createShockwave(cx, cy, { radius: 120, amplitude: 40, duration: 400 });

                  // Ground crack slashes
                  for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    createDynamicSlash(
                      cx, cy,
                      cx + Math.cos(angle) * 100, cy + Math.sin(angle) * 60,
                      {
                        color: 0xffffaa,
                        glowColor: 0xffff00,
                        maxThickness: 25,
                        curvature: 0.1,
                        duration: 300,
                      }
                    );
                  }

                  // Star dust particles
                  for (let i = 0; i < 50; i++) {
                    createParticleBurst(cx + (Math.random() - 0.5) * 80, cy + (Math.random() - 0.5) * 50, {
                      count: 2,
                      color: [0xffffaa, 0xffffff, 0xffff88][Math.floor(Math.random() * 3)],
                      glowColor: 0xffff00,
                      minSpeed: 3,
                      maxSpeed: 12,
                      gravity: 0.1,
                    });
                  }
                }, 250);
              }, 500);
            }, 700);
          }
        }
        break;

      case 'maelstrom':
        // Abyssal Trident - Oceanic whirlpool attack
        {
          legendaryWeaponSounds.abyssal_maelstrom();
          const app = appRef.current;
          if (app && app.layers) {
            // Water vortex forms
            const vortexContainer = new PIXI.Container();
            app.layers.effects.addChild(vortexContainer);

            // Multiple spinning water rings
            for (let ring = 0; ring < 6; ring++) {
              const waterRing = new PIXI.Graphics();
              waterRing.lineStyle(4 - ring * 0.5, 0x4488cc, 0.7 - ring * 0.1);
              waterRing.drawEllipse(0, 0, 30 + ring * 20, 20 + ring * 12);
              waterRing.y = ring * 8;
              waterRing.filters = [new GlowFilter({ distance: 10, outerStrength: 1, color: 0x2266aa, quality: 0.2 })];
              vortexContainer.addChild(waterRing);
            }
            vortexContainer.x = cx;
            vortexContainer.y = cy;

            // Water droplets swirling
            const droplets = [];
            for (let i = 0; i < 25; i++) {
              const drop = new PIXI.Graphics();
              drop.beginFill([0x4488cc, 0x66aadd, 0x88ccff][Math.floor(Math.random() * 3)], 0.8);
              drop.drawCircle(0, 0, 3 + Math.random() * 4);
              drop.endFill();
              drop.angle = Math.random() * Math.PI * 2;
              drop.dist = 40 + Math.random() * 80;
              drop.speed = 0.08 + Math.random() * 0.04;
              drop.x = cx + Math.cos(drop.angle) * drop.dist;
              drop.y = cy + Math.sin(drop.angle) * drop.dist * 0.6;
              drop.filters = [new GlowFilter({ distance: 6, outerStrength: 1, color: 0x4488cc, quality: 0.2 })];
              vortexContainer.addChild(drop);
              droplets.push(drop);
            }

            let vortexProgress = 0;
            const animateVortex = () => {
              vortexProgress += 0.015;

              // Spin the rings
              vortexContainer.children.forEach((child, i) => {
                if (i < 6) {
                  child.rotation += 0.1 * (i % 2 === 0 ? 1 : -1);
                }
              });

              // Swirl droplets inward
              droplets.forEach(drop => {
                drop.angle += drop.speed;
                drop.dist -= 0.8;
                if (drop.dist < 10) drop.dist = 80;
                drop.x = Math.cos(drop.angle) * drop.dist;
                drop.y = Math.sin(drop.angle) * drop.dist * 0.6;
              });

              vortexContainer.scale.set(1 + vortexProgress * 0.5);

              if (vortexProgress < 1.5) {
                requestAnimationFrame(animateVortex);
              } else {
                // Trident strike from vortex
                app.layers.effects.removeChild(vortexContainer);
                vortexContainer.destroy({ children: true });

                // Trident thrust
                createDynamicSlash(cx, cy - 80, cx, cy + 50, {
                  color: 0x4488cc,
                  glowColor: 0x2266aa,
                  maxThickness: 30,
                  curvature: 0.05,
                  duration: 250,
                });

                screenFlash(0x4488cc, 180, 0.7);
                screenShake(28, 400);
                freezeFrame(90);
                createShockwave(cx, cy, { radius: 160, amplitude: 50, duration: 550 });

                // Water explosion
                for (let i = 0; i < 40; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  createParticleBurst(cx, cy, {
                    count: 2,
                    color: [0x4488cc, 0x66aadd, 0x88ccff][Math.floor(Math.random() * 3)],
                    glowColor: 0x2266aa,
                    direction: angle,
                    spread: Math.PI / 4,
                    minSpeed: 6,
                    maxSpeed: 16,
                    gravity: 0.15,
                    duration: 600,
                  });
                }
              }
            };
            animateVortex();
          }
        }
        break;

      case 'storm_cleaver':
        // Thunderstrike Axe - Lightning-infused axe combo
        {
          legendaryWeaponSounds.thunderlord_strike();
          const app = appRef.current;
          if (app && app.layers) {
            // Electric charge buildup
            for (let i = 0; i < 10; i++) {
              setTimeout(() => {
                const spark = new PIXI.Graphics();
                spark.lineStyle(2, 0xffff00, 0.8);
                const startX = cx + (Math.random() - 0.5) * 100;
                const startY = cy + (Math.random() - 0.5) * 60;
                spark.moveTo(0, 0);
                for (let j = 0; j < 4; j++) {
                  spark.lineTo(
                    (Math.random() - 0.5) * 30,
                    j * 8 + (Math.random() - 0.5) * 10
                  );
                }
                spark.x = startX;
                spark.y = startY;
                spark.filters = [new GlowFilter({ distance: 8, outerStrength: 2, color: 0xffff00, quality: 0.3 })];
                app.layers.effects.addChild(spark);

                let sparkProgress = 0;
                const animateSpark = () => {
                  sparkProgress += 0.15;
                  spark.alpha = 1 - sparkProgress;
                  if (sparkProgress < 1) {
                    requestAnimationFrame(animateSpark);
                  } else {
                    app.layers.effects.removeChild(spark);
                    spark.destroy();
                  }
                };
                animateSpark();
              }, i * 50);
            }

            // Three massive axe cleaves with lightning
            const cleaveData = [
              { startAngle: -120, endAngle: 60, delay: 300 },
              { startAngle: 120, endAngle: -60, delay: 550 },
              { startAngle: -90, endAngle: 90, delay: 800 },
            ];

            cleaveData.forEach((cleave, i) => {
              setTimeout(() => {
                const startRad = cleave.startAngle * Math.PI / 180;
                const endRad = cleave.endAngle * Math.PI / 180;
                createDynamicSlash(
                  cx + Math.cos(startRad) * 80, cy + Math.sin(startRad) * 50,
                  cx + Math.cos(endRad) * 80, cy + Math.sin(endRad) * 50,
                  {
                    color: 0xffff00,
                    glowColor: 0xffaa00,
                    maxThickness: 32 + i * 3,
                    curvature: 0.7,
                    duration: 280,
                  }
                );
                screenShake(14 + i * 4, 200);
                screenFlash(0xffff00, 50, 0.4);

                // Lightning bolt with each cleave
                const bolt = new PIXI.Graphics();
                bolt.lineStyle(4, 0xffffff, 1);
                bolt.moveTo(cx, cy - 150);
                let boltX = cx;
                let boltY = cy - 150;
                for (let j = 0; j < 8; j++) {
                  boltX += (Math.random() - 0.5) * 40;
                  boltY += 20;
                  bolt.lineTo(boltX, boltY);
                }
                bolt.filters = [new GlowFilter({ distance: 15, outerStrength: 3, color: 0xffff00, quality: 0.3 })];
                app.layers.effects.addChild(bolt);

                let boltProgress = 0;
                const animateBolt = () => {
                  boltProgress += 0.1;
                  bolt.alpha = 1 - boltProgress;
                  if (boltProgress < 1) {
                    requestAnimationFrame(animateBolt);
                  } else {
                    app.layers.effects.removeChild(bolt);
                    bolt.destroy();
                  }
                };
                animateBolt();
              }, cleave.delay);
            });

            // Final thunder explosion
            setTimeout(() => {
              screenFlash(0xffffff, 200, 0.9);
              screenShake(30, 450);
              freezeFrame(100);
              createShockwave(cx, cy, { radius: 170, amplitude: 55, duration: 550 });

              // Electric particle burst
              for (let i = 0; i < 35; i++) {
                createParticleBurst(cx + (Math.random() - 0.5) * 60, cy + (Math.random() - 0.5) * 40, {
                  count: 3,
                  color: [0xffff00, 0xffffaa, 0xffffff][Math.floor(Math.random() * 3)],
                  glowColor: 0xffaa00,
                  minSpeed: 5,
                  maxSpeed: 15,
                });
              }
            }, 1100);
          }
        }
        break;

      case 'hellfire_execution':
        // Infernal Greatsword - Demonic flames execution
        {
          legendaryWeaponSounds.infernal_eruption();
          const app = appRef.current;
          if (app && app.layers) {
            // Demonic symbols appear
            const pentagram = new PIXI.Graphics();
            pentagram.lineStyle(3, 0xff0000, 0.7);
            const pentPoints = [];
            for (let i = 0; i < 5; i++) {
              const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
              pentPoints.push({
                x: Math.cos(angle) * 60,
                y: Math.sin(angle) * 60
              });
            }
            pentagram.moveTo(pentPoints[0].x, pentPoints[0].y);
            for (let i = 1; i <= 5; i++) {
              pentagram.lineTo(pentPoints[i % 5].x, pentPoints[i % 5].y);
            }
            pentagram.x = cx;
            pentagram.y = cy;
            pentagram.filters = [new GlowFilter({ distance: 20, outerStrength: 3, color: 0xff0000, quality: 0.3 })];
            app.layers.background.addChild(pentagram);

            // Rotating pentagram
            let pentProgress = 0;
            const animatePent = () => {
              pentProgress += 0.02;
              pentagram.rotation += 0.03;
              pentagram.alpha = 0.7 + Math.sin(pentProgress * 10) * 0.3;

              if (pentProgress < 1.5) {
                requestAnimationFrame(animatePent);
              } else {
                app.layers.background.removeChild(pentagram);
                pentagram.destroy();
              }
            };
            animatePent();

            // Hellfire rises from below
            for (let i = 0; i < 30; i++) {
              setTimeout(() => {
                const flame = new PIXI.Graphics();
                flame.beginFill([0xff0000, 0xff4400, 0xff6600][Math.floor(Math.random() * 3)], 0.8);
                flame.moveTo(0, 0);
                flame.lineTo(-8, 20);
                flame.lineTo(0, 15);
                flame.lineTo(8, 20);
                flame.closePath();
                flame.endFill();
                flame.x = cx + (Math.random() - 0.5) * 120;
                flame.y = cy + 80;
                flame.filters = [new GlowFilter({ distance: 10, outerStrength: 2, color: 0xff0000, quality: 0.2 })];
                app.layers.effects.addChild(flame);

                let flameProgress = 0;
                const animateFlame = () => {
                  flameProgress += 0.03;
                  flame.y -= 3;
                  flame.scale.y = 1 + Math.sin(flameProgress * 10) * 0.3;
                  flame.alpha = 0.8 - flameProgress * 0.8;
                  if (flameProgress < 1) {
                    requestAnimationFrame(animateFlame);
                  } else {
                    app.layers.effects.removeChild(flame);
                    flame.destroy();
                  }
                };
                animateFlame();
              }, i * 40);
            }

            // Massive demon slash
            setTimeout(() => {
              // X pattern demonic slash
              createDynamicSlash(cx - 100, cy - 70, cx + 100, cy + 70, {
                color: 0xff0000,
                glowColor: 0x880000,
                maxThickness: 40,
                curvature: 0.3,
              });
              setTimeout(() => {
                createDynamicSlash(cx + 100, cy - 70, cx - 100, cy + 70, {
                  color: 0xff4400,
                  glowColor: 0xaa0000,
                  maxThickness: 40,
                  curvature: 0.3,
                });
              }, 100);

              screenFlash(0xff0000, 250, 0.8);
              screenShake(35, 500);
              freezeFrame(150);
            }, 800);

            // Hellfire explosion
            setTimeout(() => {
              createShockwave(cx, cy, { radius: 180, amplitude: 60, duration: 600 });

              // Fire eruption
              for (let i = 0; i < 60; i++) {
                createParticleBurst(cx + (Math.random() - 0.5) * 80, cy + (Math.random() - 0.5) * 50, {
                  count: 2,
                  color: [0xff0000, 0xff4400, 0xff6600, 0xffaa00][Math.floor(Math.random() * 4)],
                  glowColor: 0xff0000,
                  minSpeed: 4,
                  maxSpeed: 18,
                  gravity: -0.1,
                  duration: 700,
                });
              }
            }, 1000);
          }
        }
        break;

      case 'prismatic_cascade':
        // Crystal Wand - Rainbow magic cascade
        {
          legendaryWeaponSounds.prismatic_cascade();
          const app = appRef.current;
          if (app && app.layers) {
            const rainbowColors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff, 0xff00ff];

            // Crystal prism forms
            const prism = new PIXI.Graphics();
            prism.beginFill(0xffffff, 0.9);
            prism.moveTo(0, -30);
            prism.lineTo(25, 20);
            prism.lineTo(-25, 20);
            prism.closePath();
            prism.endFill();
            prism.x = cx - 100;
            prism.y = cy;
            prism.filters = [new GlowFilter({ distance: 20, outerStrength: 3, color: 0xffffff, quality: 0.3 })];
            app.layers.effects.addChild(prism);

            // Light beam enters prism
            const beam = new PIXI.Graphics();
            beam.lineStyle(6, 0xffffff, 0.8);
            beam.moveTo(-150, 0);
            beam.lineTo(0, 0);
            beam.x = cx - 100;
            beam.y = cy;
            beam.filters = [new GlowFilter({ distance: 15, outerStrength: 2, color: 0xffffff, quality: 0.3 })];
            app.layers.effects.addChild(beam);

            // Rainbow beams shoot out
            setTimeout(() => {
              rainbowColors.forEach((color, i) => {
                setTimeout(() => {
                  const rainbowBeam = new PIXI.Graphics();
                  rainbowBeam.lineStyle(4, color, 0.9);
                  const angle = -Math.PI / 4 + (i / rainbowColors.length) * Math.PI / 2;
                  rainbowBeam.moveTo(0, 0);
                  rainbowBeam.lineTo(Math.cos(angle) * 200, Math.sin(angle) * 120);
                  rainbowBeam.x = cx - 75;
                  rainbowBeam.y = cy;
                  rainbowBeam.filters = [new GlowFilter({ distance: 12, outerStrength: 2, color: color, quality: 0.3 })];
                  app.layers.effects.addChild(rainbowBeam);

                  // Particles along beam
                  for (let j = 0; j < 8; j++) {
                    setTimeout(() => {
                      createParticleBurst(
                        cx - 75 + Math.cos(angle) * (j * 25),
                        cy + Math.sin(angle) * (j * 15),
                        {
                          count: 3,
                          color: color,
                          glowColor: color,
                          minSpeed: 2,
                          maxSpeed: 6,
                        }
                      );
                    }, j * 30);
                  }

                  let beamProgress = 0;
                  const animateBeam = () => {
                    beamProgress += 0.03;
                    rainbowBeam.alpha = 0.9 - beamProgress * 0.9;
                    if (beamProgress < 1) {
                      requestAnimationFrame(animateBeam);
                    } else {
                      app.layers.effects.removeChild(rainbowBeam);
                      rainbowBeam.destroy();
                    }
                  };
                  animateBeam();
                }, i * 60);
              });
            }, 300);

            // Rainbow slashes at impact
            setTimeout(() => {
              rainbowColors.forEach((color, i) => {
                setTimeout(() => {
                  const angle = (i / rainbowColors.length) * Math.PI - Math.PI / 2;
                  createDynamicSlash(
                    cx + 50 + Math.cos(angle) * 20, cy + Math.sin(angle) * 20,
                    cx + 50 + Math.cos(angle + Math.PI) * 60, cy + Math.sin(angle + Math.PI) * 40,
                    {
                      color: color,
                      glowColor: color,
                      maxThickness: 15,
                      curvature: 0.4,
                      duration: 200,
                    }
                  );
                  screenShake(6, 80);
                }, i * 40);
              });

              // Cleanup
              app.layers.effects.removeChild(prism);
              app.layers.effects.removeChild(beam);
              prism.destroy();
              beam.destroy();

              // Final prismatic explosion
              setTimeout(() => {
                screenFlash(0xffffff, 150, 0.7);
                screenShake(20, 300);
                createShockwave(cx + 50, cy, { radius: 130, amplitude: 40, duration: 450 });

                // Rainbow particle burst
                rainbowColors.forEach((color, i) => {
                  createParticleBurst(cx + 50, cy, {
                    count: 8,
                    color: color,
                    glowColor: color,
                    direction: (i / rainbowColors.length) * Math.PI * 2,
                    spread: Math.PI / 4,
                    minSpeed: 6,
                    maxSpeed: 14,
                  });
                });
              }, 300);
            }, 600);
          }
        }
        break;

      case 'forbidden_knowledge':
        // Scholar's Tome - Reality-warping spell
        {
          legendaryWeaponSounds.storm_caller_tempest();
          const app = appRef.current;
          if (app && app.layers) {
            // Ancient tome opens
            const tome = new PIXI.Graphics();
            tome.beginFill(0x442200, 0.9);
            tome.drawRect(-30, -40, 60, 80);
            tome.endFill();
            tome.beginFill(0xffffcc, 0.9);
            tome.drawRect(-25, -35, 50, 70);
            tome.endFill();
            tome.x = cx - 80;
            tome.y = cy;
            tome.filters = [new GlowFilter({ distance: 15, outerStrength: 2, color: 0xffaa00, quality: 0.3 })];
            app.layers.effects.addChild(tome);

            // Glowing runes float up from tome
            const runes = ['◊', '○', '△', '□', '☆', '◇'];
            for (let i = 0; i < 12; i++) {
              setTimeout(() => {
                const rune = new PIXI.Graphics();
                rune.beginFill([0xff00ff, 0x00ffff, 0xffff00][Math.floor(Math.random() * 3)], 0.8);
                rune.drawCircle(0, 0, 8);
                rune.endFill();
                rune.x = cx - 80 + (Math.random() - 0.5) * 40;
                rune.y = cy;
                rune.targetX = cx + (Math.random() - 0.5) * 150;
                rune.targetY = cy + (Math.random() - 0.5) * 100;
                rune.filters = [new GlowFilter({ distance: 12, outerStrength: 2, color: 0xff00ff, quality: 0.3 })];
                app.layers.particles.addChild(rune);

                let runeProgress = 0;
                const animateRune = () => {
                  runeProgress += 0.03;
                  rune.x += (rune.targetX - rune.x) * 0.05;
                  rune.y += (rune.targetY - rune.y) * 0.05;
                  rune.rotation += 0.1;
                  rune.alpha = 0.8 - runeProgress * 0.4;

                  if (runeProgress < 1.5) {
                    requestAnimationFrame(animateRune);
                  } else {
                    app.layers.particles.removeChild(rune);
                    rune.destroy();
                  }
                };
                animateRune();
              }, i * 80);
            }

            // Reality distortion waves
            setTimeout(() => {
              app.layers.effects.removeChild(tome);
              tome.destroy();

              // Multiple shockwaves of different colors
              createShockwave(cx, cy, { radius: 100, amplitude: 30, duration: 400 });
              setTimeout(() => createShockwave(cx, cy, { radius: 140, amplitude: 25, duration: 450 }), 100);
              setTimeout(() => createShockwave(cx, cy, { radius: 180, amplitude: 20, duration: 500 }), 200);

              // Arcane slashes
              const arcaneColors = [0xff00ff, 0x00ffff, 0xffff00];
              arcaneColors.forEach((color, i) => {
                setTimeout(() => {
                  const angle = (i / arcaneColors.length) * Math.PI * 2;
                  createDynamicSlash(
                    cx, cy,
                    cx + Math.cos(angle) * 100, cy + Math.sin(angle) * 60,
                    {
                      color: color,
                      glowColor: color,
                      maxThickness: 25,
                      curvature: 0.5,
                      duration: 300,
                    }
                  );
                }, i * 80);
              });

              screenFlash(0xff00ff, 180, 0.7);
              screenShake(25, 400);
              freezeFrame(80);

              // Reality fragment particles
              for (let i = 0; i < 40; i++) {
                createParticleBurst(cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 60, {
                  count: 2,
                  color: [0xff00ff, 0x00ffff, 0xffff00][Math.floor(Math.random() * 3)],
                  glowColor: 0xff00ff,
                  minSpeed: 4,
                  maxSpeed: 12,
                });
              }
            }, 1000);
          }
        }
        break;

      case 'knights_honor':
        // Steel Longsword - Noble 3-slash sword art
        {
          weaponAbilitySounds.blade_dance();
          // Stance flash
          screenFlash(0xaaaaff, 30, 0.3);

          // Three elegant, precise slashes
          const honorSlashes = [
            { x1: -80, y1: -40, x2: 80, y2: 40, curve: 0.3, thick: 22, delay: 0 },
            { x1: 80, y1: -30, x2: -60, y2: 50, curve: 0.35, thick: 24, delay: 200 },
            { x1: 0, y1: -80, x2: 0, y2: 60, curve: 0.1, thick: 28, delay: 400 },
          ];

          honorSlashes.forEach((slash, i) => {
            setTimeout(() => {
              createDynamicSlash(
                cx + slash.x1, cy + slash.y1,
                cx + slash.x2, cy + slash.y2,
                {
                  color: 0xaabbff,
                  glowColor: 0x6688cc,
                  maxThickness: slash.thick,
                  curvature: slash.curve,
                }
              );
              screenShake(10 + i * 4, 150);

              // Sparkle trail
              createParticleBurst(cx, cy, {
                count: 12,
                color: 0xaabbff,
                glowColor: 0x6688cc,
                minSpeed: 3,
                maxSpeed: 8,
              });
            }, slash.delay);
          });

          // Final noble burst
          setTimeout(() => {
            screenFlash(0xffffff, 120, 0.6);
            screenShake(18, 280);
            freezeFrame(60);
            createShockwave(cx, cy, { radius: 120, amplitude: 35, duration: 400 });

            // Noble crest particles (4-point star pattern)
            for (let i = 0; i < 4; i++) {
              const angle = (i / 4) * Math.PI * 2;
              createParticleBurst(cx, cy, {
                count: 8,
                color: 0xaabbff,
                glowColor: 0xffffff,
                direction: angle,
                spread: Math.PI / 6,
                minSpeed: 8,
                maxSpeed: 15,
              });
            }
          }, 550);
        }
        break;

      case 'arcane_singularity':
        // Archmage Staff - Concentrated cosmic beam
        {
          weaponAbilitySounds.arcane_nova();
          const app = appRef.current;
          if (app && app.layers) {
            // Charge up
            const chargeContainer = new PIXI.Container();
            app.layers.effects.addChild(chargeContainer);

            // Energy rings converging
            for (let i = 0; i < 5; i++) {
              const ring = new PIXI.Graphics();
              ring.lineStyle(3, [0xaa44ff, 0x8800ff, 0xff44ff][i % 3], 0.7);
              ring.drawCircle(0, 0, 80 + i * 20);
              ring.x = cx;
              ring.y = cy;
              ring.targetScale = 0.1;
              ring.filters = [new GlowFilter({ distance: 10, outerStrength: 2, color: 0xaa44ff, quality: 0.3 })];
              chargeContainer.addChild(ring);
            }

            let chargeProgress = 0;
            const animateCharge = () => {
              chargeProgress += 0.025;
              chargeContainer.children.forEach((ring, i) => {
                ring.scale.set(1 - chargeProgress * 0.9);
                ring.rotation += 0.05 * (i % 2 === 0 ? 1 : -1);
              });

              if (chargeProgress < 1) {
                requestAnimationFrame(animateCharge);
              } else {
                app.layers.effects.removeChild(chargeContainer);
                chargeContainer.destroy({ children: true });

                // Fire the beam!
                const beam = new PIXI.Graphics();
                beam.beginFill(0xffffff, 1);
                beam.drawRect(0, -8, 0, 16);
                beam.endFill();
                beam.x = cx;
                beam.y = cy;
                beam.filters = [new GlowFilter({ distance: 30, outerStrength: 5, color: 0xaa44ff, quality: 0.3 })];
                app.layers.effects.addChild(beam);

                let beamProgress = 0;
                const animateBeam = () => {
                  beamProgress += 0.08;
                  beam.clear();
                  beam.beginFill(0xffffff, 1);
                  beam.drawRect(0, -8, beamProgress * 300, 16);
                  beam.endFill();
                  beam.beginFill(0xaa44ff, 0.6);
                  beam.drawRect(0, -12, beamProgress * 300, 24);
                  beam.endFill();

                  if (beamProgress < 1) {
                    requestAnimationFrame(animateBeam);
                  } else {
                    // Beam sustain and fade
                    let fadeProgress = 0;
                    const fadeBeam = () => {
                      fadeProgress += 0.05;
                      beam.alpha = 1 - fadeProgress;
                      if (fadeProgress < 1) {
                        requestAnimationFrame(fadeBeam);
                      } else {
                        app.layers.effects.removeChild(beam);
                        beam.destroy();
                      }
                    };
                    fadeBeam();
                  }
                };
                animateBeam();

                screenFlash(0xaa44ff, 200, 0.8);
                screenShake(30, 500);
                freezeFrame(80);

                // Particles along beam
                for (let i = 0; i < 20; i++) {
                  setTimeout(() => {
                    createParticleBurst(cx + i * 15, cy + (Math.random() - 0.5) * 20, {
                      count: 4,
                      color: [0xaa44ff, 0xff44ff, 0xffffff][Math.floor(Math.random() * 3)],
                      glowColor: 0xaa44ff,
                      minSpeed: 2,
                      maxSpeed: 8,
                    });
                  }, i * 20);
                }
              }
            };
            animateCharge();
          }
        }
        break;

      case 'soul_harvest':
        // Warlock Scepter - Dark energy soul drain ultimate
        {
          weaponAbilitySounds.soul_drain();
          const app = appRef.current;
          if (app && app.layers) {
            // Dark ritual circle
            const ritual = new PIXI.Graphics();
            ritual.lineStyle(3, 0x44ff44, 0.8);
            ritual.drawCircle(0, 0, 80);
            ritual.lineStyle(2, 0x44ff44, 0.6);
            ritual.drawCircle(0, 0, 60);
            ritual.drawCircle(0, 0, 100);
            ritual.x = cx;
            ritual.y = cy;
            ritual.filters = [new GlowFilter({ distance: 20, outerStrength: 3, color: 0x44ff44, quality: 0.3 })];
            app.layers.background.addChild(ritual);

            // Soul tendrils reaching out
            const tendrils = [];
            for (let i = 0; i < 8; i++) {
              const tendril = new PIXI.Graphics();
              const angle = (i / 8) * Math.PI * 2;
              tendril.lineStyle(3, 0x44ff44, 0.7);
              tendril.moveTo(0, 0);
              tendril.bezierCurveTo(
                Math.cos(angle) * 40, Math.sin(angle) * 40,
                Math.cos(angle) * 80 + (Math.random() - 0.5) * 30, Math.sin(angle) * 80,
                Math.cos(angle) * 120, Math.sin(angle) * 80
              );
              tendril.x = cx;
              tendril.y = cy;
              tendril.angle = angle;
              tendril.filters = [new GlowFilter({ distance: 8, outerStrength: 2, color: 0x44ff44, quality: 0.2 })];
              app.layers.effects.addChild(tendril);
              tendrils.push(tendril);
            }

            // Animate tendrils
            let tendrilProgress = 0;
            const animateTendrils = () => {
              tendrilProgress += 0.015;
              ritual.rotation += 0.02;

              tendrils.forEach(tendril => {
                tendril.rotation += 0.01;
              });

              if (tendrilProgress < 1.5) {
                requestAnimationFrame(animateTendrils);
              } else {
                // Soul absorption
                tendrils.forEach(tendril => {
                  app.layers.effects.removeChild(tendril);
                  tendril.destroy();
                });
                app.layers.background.removeChild(ritual);
                ritual.destroy();

                // Green soul explosion
                screenFlash(0x44ff44, 200, 0.7);
                screenShake(25, 400);
                freezeFrame(100);
                createShockwave(cx, cy, { radius: 150, amplitude: 45, duration: 500 });

                // Soul fragments flying inward then exploding out
                for (let i = 0; i < 30; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  createParticleBurst(cx + Math.cos(angle) * 100, cy + Math.sin(angle) * 60, {
                    count: 3,
                    color: [0x44ff44, 0x88ff88, 0xaaffaa][Math.floor(Math.random() * 3)],
                    glowColor: 0x44ff44,
                    direction: angle + Math.PI,
                    spread: Math.PI / 4,
                    minSpeed: 5,
                    maxSpeed: 12,
                  });
                }

                // Dark slash
                createDynamicSlash(cx - 60, cy - 40, cx + 60, cy + 40, {
                  color: 0x44ff44,
                  glowColor: 0x228822,
                  maxThickness: 30,
                  curvature: 0.4,
                });
              }
            };
            animateTendrils();
          }
        }
        break;

      case 'berserkers_fury':
        // Battle Axe - Multi-swing rampage attack
        {
          weaponAbilitySounds.cleaving_blow();
          // Rage aura
          screenFlash(0xff4400, 80, 0.4);

          // 6 rapid heavy swings
          const furyAngles = [-90, 45, -45, 90, 0, -135];
          furyAngles.forEach((angle, i) => {
            setTimeout(() => {
              const rad = angle * Math.PI / 180;
              createDynamicSlash(
                cx + Math.cos(rad) * 60, cy + Math.sin(rad) * 40,
                cx + Math.cos(rad + Math.PI) * 60, cy + Math.sin(rad + Math.PI) * 40,
                {
                  color: 0xff4400,
                  glowColor: 0xaa2200,
                  maxThickness: 28 + i * 2,
                  curvature: 0.6,
                  duration: 200,
                }
              );
              screenShake(10 + i * 2, 120);

              // Sparks flying
              createParticleBurst(cx, cy, {
                count: 10,
                color: 0xff4400,
                glowColor: 0xff0000,
                minSpeed: 4,
                maxSpeed: 12,
              });
            }, i * 100);
          });

          // Final devastating blow
          setTimeout(() => {
            createDynamicSlash(cx, cy - 100, cx, cy + 60, {
              color: 0xff0000,
              glowColor: 0xaa0000,
              maxThickness: 45,
              curvature: 0.1,
            });
            screenFlash(0xff4400, 200, 0.8);
            screenShake(35, 450);
            freezeFrame(120);
            createShockwave(cx, cy, { radius: 160, amplitude: 55, duration: 550 });

            // Rage burst
            for (let j = 0; j < 8; j++) {
              const angle = (j / 8) * Math.PI * 2;
              createParticleBurst(cx, cy, {
                count: 6,
                color: [0xff4400, 0xff0000, 0xffaa00][Math.floor(Math.random() * 3)],
                glowColor: 0xff0000,
                direction: angle,
                spread: Math.PI / 6,
                minSpeed: 8,
                maxSpeed: 18,
              });
            }
          }, 700);
        }
        break;

      case 'elemental_blade_storm':
        // Enchanted Blade - 4-element combo attack
        {
          legendaryWeaponSounds.elemental_blade_storm();
          const elements = [
            { color: 0xff4400, glow: 0xff0000, name: 'fire' },
            { color: 0x00ddff, glow: 0x0088ff, name: 'ice' },
            { color: 0xffff00, glow: 0xffaa00, name: 'lightning' },
            { color: 0x8b7355, glow: 0x5c4033, name: 'earth' },
          ];

          elements.forEach((elem, i) => {
            setTimeout(() => {
              // Element-specific slash pattern
              const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
              createDynamicSlash(
                cx + Math.cos(angle) * 50, cy + Math.sin(angle) * 30,
                cx + Math.cos(angle + Math.PI) * 70, cy + Math.sin(angle + Math.PI) * 45,
                {
                  color: elem.color,
                  glowColor: elem.glow,
                  maxThickness: 25,
                  curvature: 0.5,
                }
              );
              screenShake(12, 150);
              screenFlash(elem.color, 40, 0.3);

              // Element particles
              createParticleBurst(cx, cy, {
                count: 15,
                color: elem.color,
                glowColor: elem.glow,
                minSpeed: 4,
                maxSpeed: 10,
                gravity: elem.name === 'fire' ? -0.1 : (elem.name === 'earth' ? 0.2 : 0),
              });
            }, i * 180);
          });

          // Final combined elemental explosion
          setTimeout(() => {
            screenFlash(0xffffff, 180, 0.8);
            screenShake(28, 400);
            freezeFrame(100);
            createShockwave(cx, cy, { radius: 150, amplitude: 50, duration: 500 });

            // Multi-colored burst
            elements.forEach(elem => {
              for (let i = 0; i < 10; i++) {
                createParticleBurst(cx + (Math.random() - 0.5) * 60, cy + (Math.random() - 0.5) * 40, {
                  count: 3,
                  color: elem.color,
                  glowColor: elem.glow,
                  minSpeed: 6,
                  maxSpeed: 14,
                });
              }
            });
          }, 800);
        }
        break;

      case 'mjolnir_strike':
        // Thunder Hammer - Legendary thunder god strike
        {
          weaponAbilitySounds.thunderous_blow();
          const app = appRef.current;
          if (app && app.layers) {
            // Hammer rises with lightning
            const hammer = new PIXI.Graphics();
            hammer.beginFill(0xaaaaaa, 1);
            hammer.drawRect(-20, -10, 40, 20);
            hammer.endFill();
            hammer.beginFill(0x664422, 1);
            hammer.drawRect(-5, 10, 10, 40);
            hammer.endFill();
            hammer.x = cx;
            hammer.y = cy - 100;
            hammer.filters = [new GlowFilter({ distance: 25, outerStrength: 4, color: 0xffff00, quality: 0.3 })];
            app.layers.effects.addChild(hammer);

            // Lightning gathering around hammer
            for (let i = 0; i < 15; i++) {
              setTimeout(() => {
                const bolt = new PIXI.Graphics();
                bolt.lineStyle(2, [0xffff00, 0xffffff, 0x88ccff][Math.floor(Math.random() * 3)], 0.8);
                const startX = (Math.random() - 0.5) * 200;
                const startY = -150 + Math.random() * 50;
                bolt.moveTo(startX, startY);
                let bx = startX, by = startY;
                for (let j = 0; j < 5; j++) {
                  bx += (cx - bx) * 0.3 + (Math.random() - 0.5) * 20;
                  by += 20;
                  bolt.lineTo(bx - cx, by - cy + 100);
                }
                bolt.x = cx;
                bolt.y = cy - 100;
                bolt.filters = [new GlowFilter({ distance: 8, outerStrength: 2, color: 0xffff00, quality: 0.2 })];
                app.layers.effects.addChild(bolt);

                let boltProgress = 0;
                const animateBolt = () => {
                  boltProgress += 0.15;
                  bolt.alpha = 1 - boltProgress;
                  if (boltProgress < 1) {
                    requestAnimationFrame(animateBolt);
                  } else {
                    app.layers.effects.removeChild(bolt);
                    bolt.destroy();
                  }
                };
                animateBolt();
              }, i * 60);
            }

            // Hammer descends with devastating force
            setTimeout(() => {
              let hammerProgress = 0;
              const startY = hammer.y;
              const animateHammer = () => {
                hammerProgress += 0.08;
                hammer.y = startY + hammerProgress * 120;
                hammer.rotation = hammerProgress * Math.PI * 2;

                if (hammerProgress < 1) {
                  requestAnimationFrame(animateHammer);
                } else {
                  app.layers.effects.removeChild(hammer);
                  hammer.destroy();

                  // MASSIVE thunder impact
                  screenFlash(0xffffff, 300, 1);
                  screenShake(45, 600);
                  freezeFrame(180);
                  createShockwave(cx, cy, { radius: 200, amplitude: 70, duration: 700 });
                  createShockwave(cx, cy, { radius: 140, amplitude: 50, duration: 500 });

                  // Lightning bursts in all directions
                  for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    createDynamicSlash(
                      cx, cy,
                      cx + Math.cos(angle) * 120, cy + Math.sin(angle) * 80,
                      {
                        color: [0xffff00, 0xffffff][i % 2],
                        glowColor: 0xffff00,
                        maxThickness: 20,
                        curvature: 0.1,
                        duration: 300,
                      }
                    );
                  }

                  // Electric explosion
                  for (let i = 0; i < 50; i++) {
                    createParticleBurst(cx + (Math.random() - 0.5) * 80, cy + (Math.random() - 0.5) * 50, {
                      count: 2,
                      color: [0xffff00, 0xffffff, 0x88ccff][Math.floor(Math.random() * 3)],
                      glowColor: 0xffff00,
                      minSpeed: 5,
                      maxSpeed: 20,
                    });
                  }
                }
              };
              animateHammer();
            }, 900);
          }
        }
        break;

      case 'final_verdict':
        // Executioner's Axe - Dramatic execution finisher
        {
          weaponAbilitySounds.berserker_rage();
          const app = appRef.current;
          if (app && app.layers) {
            // Dark dramatic buildup
            screenFlash(0x000000, 400, 0.7);

            // Red judgment text effect (simplified as particles)
            setTimeout(() => {
              // Dramatic pause particles
              for (let i = 0; i < 20; i++) {
                const spark = new PIXI.Graphics();
                spark.beginFill(0xff0000, 0.8);
                spark.drawCircle(0, 0, 3);
                spark.endFill();
                spark.x = cx + (Math.random() - 0.5) * 100;
                spark.y = cy - 80 + (Math.random() - 0.5) * 20;
                spark.filters = [new GlowFilter({ distance: 8, outerStrength: 2, color: 0xff0000, quality: 0.3 })];
                app.layers.particles.addChild(spark);

                let sparkProg = 0;
                const animSpark = () => {
                  sparkProg += 0.02;
                  spark.alpha = 0.8 - sparkProg * 0.8;
                  spark.y -= 0.5;
                  if (sparkProg < 1) {
                    requestAnimationFrame(animSpark);
                  } else {
                    app.layers.particles.removeChild(spark);
                    spark.destroy();
                  }
                };
                animSpark();
              }
            }, 200);

            // The execution strike
            setTimeout(() => {
              // Massive downward axe strike
              createDynamicSlash(cx, cy - 120, cx, cy + 50, {
                color: 0xff0000,
                glowColor: 0x880000,
                maxThickness: 50,
                curvature: 0.05,
                duration: 350,
              });

              screenFlash(0xff0000, 300, 0.9);
              screenShake(40, 550);
              freezeFrame(200);
              createShockwave(cx, cy, { radius: 170, amplitude: 60, duration: 600 });

              // Blood spray
              for (let i = 0; i < 60; i++) {
                createParticleBurst(cx, cy, {
                  count: 2,
                  color: 0xff0000,
                  glowColor: 0x880000,
                  minSpeed: 5,
                  maxSpeed: 20,
                  gravity: 0.25,
                  duration: 800,
                });
              }

              // Ground crack effect (slashes radiating from impact)
              for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                  const angle = (i / 6) * Math.PI - Math.PI / 2;
                  createDynamicSlash(
                    cx, cy,
                    cx + Math.cos(angle) * 80, cy + 30 + Math.sin(angle) * 20,
                    {
                      color: 0x880000,
                      glowColor: 0x440000,
                      maxThickness: 15,
                      curvature: 0.05,
                      duration: 400,
                    }
                  );
                }, i * 30);
              }
            }, 700);
          }
        }
        break;

      default:
        // Fallback to basic slash
        createDynamicSlash(startX, startY, targetX, targetY, {
          color: colors.main,
          glowColor: colors.glow,
          maxThickness: 25,
          curvature: 0.4,
        });
        setTimeout(() => {
          screenShake(12, 200);
          createParticleBurst(cx, cy, { count: 15, color: colors.main, glowColor: colors.glow });
        }, 100);
    }
  }, [width, height, createDynamicSlash, createParticleBurst, createShockwave,
      screenShake, screenFlash, freezeFrame, easeOutCubic]);

  const playAbility = useCallback((abilityType, x = width / 2, y = height / 2) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const targetX = x;
    const targetY = y;
    const leftEdge = width * 0.15;

    switch (abilityType) {
      // ========== FIRE ABILITIES ==========
      case 'fireball':
        elementalSounds.fire_burst();
        createProjectile(leftEdge, centerY, targetX, targetY, {
          color: 0xff4400,
          glowColor: 0xff0000,
          coreColor: 0xffffaa,
          size: 15,
          speed: 10,
          element: 'fire',
          onImpact: (ix, iy) => createFireExplosion(ix, iy),
        });
        break;

      case 'meteor':
        elementalSounds.meteor_shower();
        createMeteor(targetX, targetY);
        break;

      case 'inferno':
        // Multiple fireballs
        elementalSounds.blazing_fury();
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            createProjectile(leftEdge, centerY + (Math.random() - 0.5) * 100,
              targetX + (Math.random() - 0.5) * 60, targetY + (Math.random() - 0.5) * 60, {
              color: 0xff4400,
              glowColor: 0xff0000,
              coreColor: 0xffffaa,
              size: 10 + Math.random() * 8,
              speed: 8 + Math.random() * 4,
              onImpact: (ix, iy) => createFireExplosion(ix, iy),
            });
          }, i * 120);
        }
        break;

      case 'flame_burst':
        elementalSounds.inferno_blast();
        createFireExplosion(targetX, targetY);
        break;

      case 'blazing_combo':
        elementalSounds.phoenix_flame();
        createComboExplosion(targetX, targetY, 6);
        break;

      // ========== ICE ABILITIES ==========
      case 'ice_spike':
        elementalSounds.glacial_spike();
        createProjectile(leftEdge, centerY, targetX, targetY, {
          color: 0x88ddff,
          glowColor: 0x0088ff,
          coreColor: 0xffffff,
          size: 12,
          speed: 14,
          element: 'ice',
          onImpact: (ix, iy) => createIceExplosion(ix, iy),
        });
        break;

      case 'blizzard':
        elementalSounds.blizzard();
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            const offsetX = (Math.random() - 0.5) * 120;
            const offsetY = (Math.random() - 0.5) * 80;
            createIceExplosion(targetX + offsetX, targetY + offsetY);
          }, i * 150);
        }
        screenShake(5, 1500);
        break;

      case 'frost_nova':
        elementalSounds.ice_shatter();
        createIceExplosion(targetX, targetY);
        createShockwave(targetX, targetY, { radius: 120, wavelength: 40, amplitude: 25, duration: 600 });
        freezeFrame(80);
        break;

      case 'ice_beam':
        elementalSounds.absolute_zero();
        createLaserBeam(leftEdge, centerY, targetX, targetY, 0x00ddff);
        setTimeout(() => createIceExplosion(targetX, targetY), 100);
        break;

      // ========== LIGHTNING ABILITIES ==========
      case 'lightning_strike':
        elementalSounds.lightning_strike();
        screenFlash(0xffffaa, 50, 0.9);
        setTimeout(() => {
          createLightningExplosion(targetX, targetY);
        }, 30);
        break;

      case 'chain_lightning':
        elementalSounds.storm_surge();
        createChainLightning(leftEdge, centerY);
        break;

      case 'thunder_storm':
        elementalSounds.thundergod_wrath();
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            const offsetX = (Math.random() - 0.5) * 150;
            createLightningExplosion(targetX + offsetX, targetY);
          }, i * 200);
        }
        break;

      case 'static_shock':
        elementalSounds.static_discharge();
        createParticleBurst(targetX, targetY, {
          count: 50,
          color: 0xffff00,
          glowColor: 0xffffaa,
          minSpeed: 10,
          maxSpeed: 25,
          minSize: 1,
          maxSize: 4,
          gravity: 0,
          duration: 300,
          drag: 0.85,
        });
        screenFlash(0xffffaa, 40, 0.8);
        screenShake(12, 100);
        break;

      // ========== DARK/SHADOW ABILITIES ==========
      case 'shadow_burst':
        elementalSounds.shadow_bolt();
        createProjectile(leftEdge, centerY, targetX, targetY, {
          color: 0x8800ff,
          glowColor: 0x4400aa,
          coreColor: 0xcc88ff,
          size: 18,
          speed: 7,
          element: 'dark',
          onImpact: (ix, iy) => createDarkExplosion(ix, iy),
        });
        break;

      case 'black_hole':
        elementalSounds.oblivion();
        createBlackHole(targetX, targetY);
        break;

      case 'soul_drain':
        elementalSounds.nightmare_grasp();
        createDebuffEffect(targetX, targetY);
        break;

      case 'void_rift':
        elementalSounds.void_rupture();
        createDarkExplosion(targetX, targetY);
        createShockwave(targetX, targetY, { radius: 100, wavelength: 60, amplitude: 40, duration: 800 });
        break;

      case 'dark_tendrils':
        elementalSounds.dark_pulse();
        createDebuffEffect(targetX, targetY);
        setTimeout(() => createDarkExplosion(targetX, targetY), 300);
        break;

      // ========== HOLY/LIGHT ABILITIES ==========
      case 'holy_light':
        // Gentle healing beam - soft, warm glow
        elementalSounds.holy_light();
        screenFlash(0xffffcc, 100, 0.4);
        createHolyBeam(targetX, targetY);
        // Floating sparkles rising upward
        setTimeout(() => {
          createParticleBurst(targetX, targetY, {
            count: 25,
            color: 0xffffaa,
            glowColor: 0xffff66,
            minSpeed: 0.5,
            maxSpeed: 2,
            minSize: 2,
            maxSize: 5,
            gravity: -0.12,
            duration: 1500,
            drag: 0.995,
          });
        }, 200);
        break;

      case 'divine_judgment':
        // Multiple pillars of light crashing down
        elementalSounds.judgment();
        screenFlash(0xffffff, 150, 0.8);
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const offsetX = (i - 2) * 40;
            createHolyBeam(targetX + offsetX, targetY);
            if (i === 2) {
              // Center pillar is biggest
              screenShake(20, 400);
              freezeFrame(80);
            }
          }, i * 100);
        }
        // Massive golden shockwave at the end
        setTimeout(() => {
          createShockwave(targetX, targetY, { radius: 180, wavelength: 50, amplitude: 40, duration: 700 });
          createParticleBurst(targetX, targetY, {
            count: 50,
            color: 0xffffcc,
            glowColor: 0xffaa00,
            minSpeed: 5,
            maxSpeed: 15,
            gravity: -0.1,
            duration: 1000,
          });
        }, 500);
        break;

      case 'smite':
        // Fast golden cross/star strike from above
        elementalSounds.divine_smite();
        {
          const app = appRef.current;
          if (app && app.layers) {
            // Draw golden cross shape
            const cross = new PIXI.Graphics();
            cross.lineStyle(6, 0xffffaa, 1);
            // Vertical line
            cross.moveTo(targetX, targetY - 80);
            cross.lineTo(targetX, targetY + 40);
            // Horizontal line
            cross.moveTo(targetX - 50, targetY - 20);
            cross.lineTo(targetX + 50, targetY - 20);
            cross.filters = [new GlowFilter({ distance: 30, outerStrength: 4, color: 0xffff00, quality: 0.3 })];
            app.layers.effects.addChild(cross);

            // Animate cross (flash in, expand, fade)
            cross.scale.set(0);
            cross.alpha = 1;
            let progress = 0;
            const animateCross = () => {
              progress += 0.1;
              if (progress < 1) {
                cross.scale.set(easeOutCubic(progress));
                requestAnimationFrame(animateCross);
              } else {
                // Hold then fade
                setTimeout(() => {
                  let fade = 0;
                  const fadeOut = () => {
                    fade += 0.1;
                    cross.alpha = 1 - fade;
                    cross.scale.set(1 + fade * 0.5);
                    if (fade < 1) {
                      requestAnimationFrame(fadeOut);
                    } else {
                      app.layers.effects.removeChild(cross);
                      cross.destroy();
                    }
                  };
                  fadeOut();
                }, 150);
              }
            };
            animateCross();
          }
        }
        screenFlash(0xffffaa, 80, 0.9);
        screenShake(12, 200);
        // Golden sparks at impact
        createParticleBurst(targetX, targetY, {
          count: 30,
          color: 0xffdd44,
          glowColor: 0xffaa00,
          minSpeed: 5,
          maxSpeed: 15,
          minSize: 2,
          maxSize: 6,
          gravity: 0.1,
          duration: 600,
        });
        freezeFrame(40);
        break;

      case 'radiant_burst':
        // Expanding rings of golden light
        elementalSounds.radiant_burst();
        {
          const app = appRef.current;
          if (app && app.layers) {
            for (let i = 0; i < 4; i++) {
              setTimeout(() => {
                const ring = new PIXI.Graphics();
                ring.lineStyle(3, 0xffffaa, 0.9);
                ring.drawCircle(0, 0, 10);
                ring.x = targetX;
                ring.y = targetY;
                ring.filters = [new GlowFilter({ distance: 15, outerStrength: 2, color: 0xffff00, quality: 0.3 })];
                app.layers.effects.addChild(ring);

                let ringProgress = 0;
                const animateRing = () => {
                  ringProgress += 0.04;
                  ring.scale.set(1 + ringProgress * 10);
                  ring.alpha = 1 - ringProgress;
                  if (ringProgress < 1) {
                    requestAnimationFrame(animateRing);
                  } else {
                    app.layers.effects.removeChild(ring);
                    ring.destroy();
                  }
                };
                animateRing();
              }, i * 120);
            }

            // Light rays shooting outward
            const rayCount = 12;
            for (let i = 0; i < rayCount; i++) {
              const ray = new PIXI.Graphics();
              const angle = (i / rayCount) * Math.PI * 2;
              ray.lineStyle(2, 0xffffcc, 0.8);
              ray.moveTo(0, 0);
              ray.lineTo(Math.cos(angle) * 100, Math.sin(angle) * 100);
              ray.x = targetX;
              ray.y = targetY;
              ray.filters = [new GlowFilter({ distance: 10, outerStrength: 1.5, color: 0xffff66, quality: 0.3 })];
              app.layers.effects.addChild(ray);

              ray.scale.set(0);
              let rayProgress = 0;
              setTimeout(() => {
                const animateRay = () => {
                  rayProgress += 0.08;
                  ray.scale.set(easeOutCubic(Math.min(1, rayProgress)));
                  ray.alpha = rayProgress > 0.5 ? 1 - (rayProgress - 0.5) * 2 : 1;
                  if (rayProgress < 1) {
                    requestAnimationFrame(animateRay);
                  } else {
                    app.layers.effects.removeChild(ray);
                    ray.destroy();
                  }
                };
                animateRay();
              }, 100);
            }
          }
        }
        screenFlash(0xffffcc, 150, 0.6);
        break;

      case 'sanctuary':
        // Protective dome of golden light
        elementalSounds.angelic_chorus();
        {
          const app = appRef.current;
          if (app && app.layers) {
            const container = new PIXI.Container();
            app.layers.effects.addChild(container);

            // Draw dome (half circle)
            const dome = new PIXI.Graphics();
            dome.lineStyle(4, 0xffffaa, 0.8);
            dome.beginFill(0xffffcc, 0.15);
            dome.arc(0, 0, 70, Math.PI, 0);
            dome.lineTo(70, 0);
            dome.lineTo(-70, 0);
            dome.closePath();
            dome.endFill();
            dome.x = targetX;
            dome.y = targetY + 20;
            dome.filters = [new GlowFilter({ distance: 20, outerStrength: 2, color: 0xffff00, quality: 0.3 })];
            container.addChild(dome);

            // Rising particles inside dome
            for (let i = 0; i < 15; i++) {
              setTimeout(() => {
                const sparkle = new PIXI.Graphics();
                sparkle.beginFill(0xffffaa, 0.9);
                sparkle.drawCircle(0, 0, 2 + Math.random() * 2);
                sparkle.endFill();
                sparkle.x = targetX + (Math.random() - 0.5) * 100;
                sparkle.y = targetY + 20;
                container.addChild(sparkle);

                let sparkProgress = 0;
                const animateSparkle = () => {
                  sparkProgress += 0.02;
                  sparkle.y -= 1.5;
                  sparkle.alpha = 1 - sparkProgress;
                  if (sparkProgress < 1 && sparkle.y > targetY - 50) {
                    requestAnimationFrame(animateSparkle);
                  }
                };
                animateSparkle();
              }, i * 100);
            }

            // Animate dome
            dome.scale.set(0, 0);
            let domeProgress = 0;
            const animateDome = () => {
              domeProgress += 0.05;
              if (domeProgress < 1) {
                dome.scale.set(easeOutCubic(domeProgress));
                requestAnimationFrame(animateDome);
              } else {
                // Hold then fade
                setTimeout(() => {
                  let fade = 0;
                  const fadeOut = () => {
                    fade += 0.03;
                    container.alpha = 1 - fade;
                    if (fade < 1) {
                      requestAnimationFrame(fadeOut);
                    } else {
                      app.layers.effects.removeChild(container);
                      container.destroy();
                    }
                  };
                  fadeOut();
                }, 1000);
              }
            };
            animateDome();
          }
        }
        screenFlash(0xffffcc, 100, 0.3);
        break;

      case 'consecrate':
        // Ground-based holy effect with rising energy
        {
          const app = appRef.current;
          if (app && app.layers) {
            // Golden circle on ground
            const circle = new PIXI.Graphics();
            circle.lineStyle(3, 0xffdd44, 0.9);
            circle.drawCircle(0, 0, 60);
            // Inner pattern
            circle.lineStyle(2, 0xffffaa, 0.6);
            circle.drawCircle(0, 0, 40);
            circle.drawCircle(0, 0, 20);
            // Cross pattern
            circle.moveTo(-60, 0);
            circle.lineTo(60, 0);
            circle.moveTo(0, -60);
            circle.lineTo(0, 60);
            circle.x = targetX;
            circle.y = targetY + 30;
            circle.filters = [new GlowFilter({ distance: 15, outerStrength: 2, color: 0xffaa00, quality: 0.3 })];
            app.layers.effects.addChild(circle);

            // Appear animation
            circle.alpha = 0;
            circle.scale.set(0.5);
            let circleProgress = 0;
            const animateCircle = () => {
              circleProgress += 0.06;
              circle.alpha = Math.min(1, circleProgress * 2);
              circle.scale.set(0.5 + circleProgress * 0.5);
              circle.rotation += 0.02;
              if (circleProgress < 1) {
                requestAnimationFrame(animateCircle);
              }
            };
            animateCircle();

            // Rising holy pillars from the circle
            setTimeout(() => {
              for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                  const angle = (i / 8) * Math.PI * 2;
                  const px = targetX + Math.cos(angle) * 45;
                  const py = targetY + 30;

                  const pillar = new PIXI.Graphics();
                  pillar.beginFill(0xffffaa, 0.7);
                  pillar.drawRect(-3, 0, 6, -80);
                  pillar.endFill();
                  pillar.x = px;
                  pillar.y = py;
                  pillar.filters = [new GlowFilter({ distance: 10, outerStrength: 2, color: 0xffff00, quality: 0.3 })];
                  app.layers.effects.addChild(pillar);

                  pillar.scale.y = 0;
                  let pillarProgress = 0;
                  const animatePillar = () => {
                    pillarProgress += 0.08;
                    pillar.scale.y = easeOutCubic(Math.min(1, pillarProgress));
                    pillar.alpha = pillarProgress > 0.6 ? 1 - (pillarProgress - 0.6) * 2.5 : 1;
                    if (pillarProgress < 1) {
                      requestAnimationFrame(animatePillar);
                    } else {
                      app.layers.effects.removeChild(pillar);
                      pillar.destroy();
                    }
                  };
                  animatePillar();
                }, i * 50);
              }
            }, 200);

            // Fade out circle
            setTimeout(() => {
              let fade = 0;
              const fadeCircle = () => {
                fade += 0.03;
                circle.alpha = 1 - fade;
                if (fade < 1) {
                  requestAnimationFrame(fadeCircle);
                } else {
                  app.layers.effects.removeChild(circle);
                  circle.destroy();
                }
              };
              fadeCircle();
            }, 1200);
          }
        }
        screenFlash(0xffffaa, 80, 0.4);
        break;

      case 'angels_wrath':
        // Wings of light that release feather projectiles
        {
          const app = appRef.current;
          if (app && app.layers) {
            const container = new PIXI.Container();
            app.layers.effects.addChild(container);

            // Draw wing shapes
            const leftWing = new PIXI.Graphics();
            const rightWing = new PIXI.Graphics();

            const drawWing = (g, flip = false) => {
              g.beginFill(0xffffcc, 0.6);
              g.lineStyle(2, 0xffffaa, 0.9);
              // Wing shape using curves
              g.moveTo(0, 0);
              g.quadraticCurveTo(flip ? 40 : -40, -30, flip ? 80 : -80, -20);
              g.quadraticCurveTo(flip ? 100 : -100, -10, flip ? 90 : -90, 20);
              g.quadraticCurveTo(flip ? 60 : -60, 30, 0, 20);
              g.closePath();
              g.endFill();
            };

            drawWing(leftWing, false);
            drawWing(rightWing, true);
            leftWing.x = targetX - 10;
            leftWing.y = targetY - 20;
            rightWing.x = targetX + 10;
            rightWing.y = targetY - 20;

            leftWing.filters = [new GlowFilter({ distance: 20, outerStrength: 2, color: 0xffff00, quality: 0.3 })];
            rightWing.filters = [new GlowFilter({ distance: 20, outerStrength: 2, color: 0xffff00, quality: 0.3 })];

            container.addChild(leftWing);
            container.addChild(rightWing);

            // Wings expand animation
            leftWing.scale.set(0);
            rightWing.scale.set(0);
            let wingProgress = 0;
            const animateWings = () => {
              wingProgress += 0.08;
              const scale = easeOutCubic(Math.min(1, wingProgress));
              leftWing.scale.set(scale);
              rightWing.scale.set(scale);
              if (wingProgress < 1) {
                requestAnimationFrame(animateWings);
              }
            };
            animateWings();

            // Release feather projectiles after wings appear
            setTimeout(() => {
              for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                  const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
                  const feather = new PIXI.Graphics();
                  feather.beginFill(0xffffaa, 0.9);
                  feather.drawEllipse(0, 0, 3, 8);
                  feather.endFill();
                  feather.x = targetX + (Math.random() - 0.5) * 60;
                  feather.y = targetY - 10;
                  feather.rotation = angle;
                  feather.filters = [new GlowFilter({ distance: 8, outerStrength: 1.5, color: 0xffff66, quality: 0.3 })];
                  app.layers.particles.addChild(feather);

                  const speed = 8 + Math.random() * 6;
                  const vx = Math.cos(angle) * speed;
                  const vy = Math.sin(angle) * speed;
                  let featherLife = 0;

                  const animateFeather = () => {
                    featherLife += 0.02;
                    feather.x += vx;
                    feather.y += vy * 0.5 + featherLife * 2; // Arc down
                    feather.alpha = 1 - featherLife;
                    feather.rotation += 0.1;
                    if (featherLife < 1) {
                      requestAnimationFrame(animateFeather);
                    } else {
                      app.layers.particles.removeChild(feather);
                      feather.destroy();
                    }
                  };
                  animateFeather();
                }, i * 40);
              }
            }, 300);

            // Fade out wings
            setTimeout(() => {
              let fade = 0;
              const fadeWings = () => {
                fade += 0.05;
                container.alpha = 1 - fade;
                if (fade < 1) {
                  requestAnimationFrame(fadeWings);
                } else {
                  app.layers.effects.removeChild(container);
                  container.destroy();
                }
              };
              fadeWings();
            }, 800);
          }
        }
        screenFlash(0xffffcc, 120, 0.5);
        screenShake(8, 200);
        break;

      // ========== EARTH ABILITIES ==========
      case 'earthquake':
        elementalSounds.earthquake();
        createEarthExplosion(targetX, targetY);
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            screenShake(15 - i * 3, 200);
            createParticleBurst(targetX + (Math.random() - 0.5) * 100, targetY, {
              count: 10,
              color: 0x8b7355,
              glowColor: 0x5c4033,
              minSpeed: 3,
              maxSpeed: 8,
              gravity: 0.4,
              duration: 600,
            });
          }, i * 200);
        }
        break;

      case 'rock_throw':
        elementalSounds.rock_throw();
        createProjectile(leftEdge, centerY, targetX, targetY, {
          color: 0x8b7355,
          glowColor: 0x5c4033,
          coreColor: 0xaaaaaa,
          size: 20,
          speed: 8,
          onImpact: (ix, iy) => createEarthExplosion(ix, iy),
        });
        break;

      case 'stone_spike':
        elementalSounds.tectonic_slam();
        createEarthExplosion(targetX, targetY);
        freezeFrame(50);
        break;

      case 'landslide':
        elementalSounds.meteor_shower();
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            createProjectile(leftEdge - 50 + i * 30, -30, targetX + (i - 2) * 30, targetY, {
              color: 0x8b7355,
              glowColor: 0x5c4033,
              size: 15 + Math.random() * 10,
              speed: 10,
              onImpact: (ix, iy) => createEarthExplosion(ix, iy),
            });
          }, i * 100);
        }
        break;

      // ========== WIND ABILITIES ==========
      case 'wind_slash':
        elementalSounds.vine_whip(); // Fast swoosh sound for wind slash
        createDynamicSlash(leftEdge, centerY - 50, targetX, targetY + 50, {
          color: 0xaaddff,
          glowColor: 0x88bbdd,
          maxThickness: 20,
          curvature: 0.5,
        });
        createWindExplosion(targetX, targetY);
        break;

      case 'tornado':
        elementalSounds.whirlpool(); // Swirling wind sound
        createTornado(targetX, targetY);
        break;

      case 'gale_force':
        elementalSounds.wave_crash(); // Powerful gust sound
        createWindExplosion(targetX, targetY);
        createShockwave(targetX, targetY, { radius: 100, wavelength: 25, amplitude: 15, duration: 400 });
        break;

      case 'air_cutter':
        elementalSounds.thorn_spray(); // Multiple quick whooshes
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            createDynamicSlash(leftEdge, centerY - 30 + i * 30, targetX, centerY - 30 + i * 30, {
              color: 0xaaddff,
              glowColor: 0x88bbdd,
              maxThickness: 15,
              curvature: 0.2,
            });
          }, i * 80);
        }
        break;

      // ========== WATER ABILITIES ==========
      case 'water_blast':
        elementalSounds.water_splash();
        createProjectile(leftEdge, centerY, targetX, targetY, {
          color: 0x4488cc,
          glowColor: 0x2266aa,
          coreColor: 0xaaddff,
          size: 14,
          speed: 11,
          onImpact: (ix, iy) => createWaterExplosion(ix, iy),
        });
        break;

      case 'tidal_wave':
        elementalSounds.tsunami();
        createWaterExplosion(targetX, targetY);
        createShockwave(targetX, targetY, { radius: 120, wavelength: 50, amplitude: 30, duration: 700 });
        screenShake(12, 400);
        break;

      case 'hydro_pump':
        elementalSounds.tidal_surge();
        createLaserBeam(leftEdge, centerY, targetX, targetY, 0x4488cc);
        setTimeout(() => createWaterExplosion(targetX, targetY), 100);
        break;

      case 'bubble_storm':
        elementalSounds.whirlpool();
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            createParticleBurst(targetX + (Math.random() - 0.5) * 80, targetY + (Math.random() - 0.5) * 60, {
              count: 12,
              color: 0xaaddff,
              glowColor: 0x88ccff,
              minSpeed: 0.5,
              maxSpeed: 3,
              minSize: 3,
              maxSize: 8,
              gravity: -0.1,
              duration: 1000,
            });
          }, i * 100);
        }
        break;

      // ========== POISON ABILITIES ==========
      case 'poison_cloud':
        combatStateSounds.poison_tick();
        createPoisonExplosion(targetX, targetY);
        break;

      case 'toxic_spit':
        elementalSounds.nature_burst();
        createProjectile(leftEdge, centerY, targetX, targetY, {
          color: 0x44cc44,
          glowColor: 0x22aa22,
          coreColor: 0x88ff88,
          size: 12,
          speed: 9,
          onImpact: (ix, iy) => createPoisonExplosion(ix, iy),
        });
        break;

      case 'venom_spray':
        elementalSounds.thorn_spray();
        for (let i = 0; i < 5; i++) {
          const angle = -Math.PI / 6 + (i / 4) * Math.PI / 3;
          const endX = leftEdge + Math.cos(angle) * 300;
          const endY = centerY + Math.sin(angle) * 150;
          setTimeout(() => {
            createProjectile(leftEdge, centerY, endX, endY, {
              color: 0x44cc44,
              glowColor: 0x22aa22,
              size: 8,
              speed: 12,
              onImpact: (ix, iy) => createPoisonExplosion(ix, iy),
            });
          }, i * 50);
        }
        break;

      case 'plague':
        combatStateSounds.debuff_apply();
        createDebuffEffect(targetX, targetY);
        setTimeout(() => createPoisonExplosion(targetX, targetY), 200);
        break;

      // ========== ARCANE ABILITIES ==========
      case 'arcane_blast':
        elementalSounds.arcane_pulse();
        createProjectile(leftEdge, centerY, targetX, targetY, {
          color: 0xff44ff,
          glowColor: 0xcc22cc,
          coreColor: 0xffaaff,
          size: 14,
          speed: 12,
          onImpact: (ix, iy) => createArcaneExplosion(ix, iy),
        });
        break;

      case 'magic_missile':
        elementalSounds.arcane_torrent();
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            createProjectile(leftEdge, centerY + (i - 1.5) * 30, targetX, targetY, {
              color: 0xff44ff,
              glowColor: 0xcc22cc,
              size: 8,
              speed: 15,
              onImpact: (ix, iy) => {
                createParticleBurst(ix, iy, {
                  count: 10,
                  color: 0xff44ff,
                  glowColor: 0xcc22cc,
                  duration: 400,
                });
              },
            });
          }, i * 80);
        }
        break;

      case 'arcane_beam':
        elementalSounds.celestial_beam();
        createLaserBeam(leftEdge, centerY, targetX, targetY, 0xff44ff);
        setTimeout(() => createArcaneExplosion(targetX, targetY), 100);
        break;

      case 'mystic_explosion':
        elementalSounds.mana_burst();
        createArcaneExplosion(targetX, targetY);
        createShockwave(targetX, targetY, { radius: 100, amplitude: 35, duration: 500 });
        freezeFrame(50);
        break;

      // ========== SUPPORT ABILITIES ==========
      case 'heal':
        combatStateSounds.heal();
        createHealEffect(targetX, targetY);
        break;

      case 'greater_heal':
        combatStateSounds.revive();
        createHealEffect(targetX, targetY);
        createHolyExplosion(targetX, targetY);
        break;

      case 'shield':
        combatStateSounds.block();
        createShieldEffect(targetX, targetY);
        break;

      case 'power_buff':
        combatStateSounds.buff_apply();
        createBuffEffect(targetX, targetY, 0xffaa00);
        break;

      case 'speed_buff':
        combatStateSounds.buff_apply();
        createBuffEffect(targetX, targetY, 0x00ffaa);
        break;

      case 'magic_buff':
        combatStateSounds.buff_apply();
        createBuffEffect(targetX, targetY, 0xaa44ff);
        break;

      case 'curse':
        combatStateSounds.debuff_apply();
        createDebuffEffect(targetX, targetY);
        break;

      // ========== ULTIMATE ABILITIES ==========
      case 'supernova':
        elementalSounds.phoenix_flame();
        screenFlash(0xffffff, 300, 0.9);
        setTimeout(() => {
          elementalSounds.inferno_blast();
          createFireExplosion(targetX, targetY);
          createShockwave(targetX, targetY, { radius: 200, wavelength: 60, amplitude: 50, duration: 800 });
          screenShake(30, 500);
          freezeFrame(100);
        }, 150);
        setTimeout(() => {
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 60;
            createFireExplosion(
              targetX + Math.cos(angle) * dist,
              targetY + Math.sin(angle) * dist
            );
          }
        }, 300);
        break;

      case 'absolute_zero':
        elementalSounds.absolute_zero();
        screenFlash(0x88ddff, 400, 0.8);
        setTimeout(() => {
          createIceExplosion(targetX, targetY);
          createShockwave(targetX, targetY, { radius: 180, wavelength: 50, amplitude: 45, duration: 700 });
          freezeFrame(150);
        }, 200);
        break;

      case 'divine_storm':
        elementalSounds.angelic_chorus();
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            elementalSounds.thunder_crash();
            const offsetX = (Math.random() - 0.5) * 150;
            createLightningExplosion(targetX + offsetX, targetY);
            createHolyExplosion(targetX + offsetX, targetY);
          }, i * 150);
        }
        screenShake(20, 1000);
        break;

      case 'void_collapse':
        elementalSounds.black_hole();
        createBlackHole(targetX, targetY);
        setTimeout(() => {
          elementalSounds.black_hole_collapse();
          screenFlash(0x8800ff, 300, 0.9);
          createDarkExplosion(targetX, targetY);
          createShockwave(targetX, targetY, { radius: 150, wavelength: 70, amplitude: 50, duration: 900 });
          screenShake(25, 600);
          freezeFrame(100);
        }, 2000);
        break;

      case 'elemental_fury':
        // All elements at once
        elementalSounds.fire_burst();
        createFireExplosion(targetX - 40, targetY - 30);
        setTimeout(() => {
          elementalSounds.ice_shatter();
          createIceExplosion(targetX + 40, targetY - 30);
        }, 100);
        setTimeout(() => {
          elementalSounds.thunder_crash();
          createLightningExplosion(targetX, targetY + 30);
        }, 200);
        setTimeout(() => {
          elementalSounds.earth_rumble();
          createEarthExplosion(targetX - 40, targetY + 30);
        }, 300);
        setTimeout(() => {
          elementalSounds.wave_crash();
          createWindExplosion(targetX + 40, targetY + 30);
        }, 400);
        setTimeout(() => {
          elementalSounds.mana_burst();
          createArcaneExplosion(targetX, targetY);
          screenShake(20, 400);
          freezeFrame(80);
        }, 500);
        break;

      default:
        createParticleBurst(targetX, targetY, { count: 25 });
        screenFlash(0xffffff, 80, 0.3);
    }
  }, [width, height, createProjectile, createFireExplosion, createIceExplosion,
      createLightningExplosion, createDarkExplosion, createHolyExplosion,
      createEarthExplosion, createWindExplosion, createWaterExplosion,
      createPoisonExplosion, createArcaneExplosion, createMeteor, createChainLightning,
      createTornado, createHealEffect, createShieldEffect, createBuffEffect,
      createDebuffEffect, createComboExplosion, createLaserBeam, createBlackHole,
      createHolyBeam, createLightningBolt, createDynamicSlash, createParticleBurst,
      createShockwave, screenFlash, screenShake, freezeFrame]);

  // ============================================
  // BOSS ATTACK VISUALS
  // ============================================
  const playBossAttack = useCallback((attackAnimation, targetX = width / 2, targetY = height / 2) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const cx = targetX;
    const cy = targetY;

    switch (attackAnimation) {
      case 'bounce':
        // Shadow Slime - Despair Glob: Purple gooey projectile that splashes
        {
          const slime = new PIXI.Graphics();
          slime.beginFill(0x6b21a8, 0.9);
          slime.drawCircle(0, 0, 25);
          slime.endFill();
          slime.beginFill(0x9333ea, 0.6);
          slime.drawCircle(-5, -5, 10);
          slime.endFill();
          slime.x = cx;
          slime.y = cy - 150;
          slime.filters = [new GlowFilter({ distance: 20, outerStrength: 3, color: 0x6b21a8, quality: 0.3 })];
          app.layers.effects.addChild(slime);

          let bouncePhase = 0;
          const animateBounce = () => {
            bouncePhase += 0.05;
            const bounceY = Math.abs(Math.sin(bouncePhase * Math.PI)) * 80;
            slime.y = cy - 70 + bounceY;
            slime.x = cx - 100 + bouncePhase * 200;
            slime.scale.set(1 + Math.sin(bouncePhase * Math.PI * 2) * 0.2, 1 - Math.sin(bouncePhase * Math.PI * 2) * 0.15);

            if (bouncePhase < 1) {
              requestAnimationFrame(animateBounce);
            } else {
              app.layers.effects.removeChild(slime);
              slime.destroy();
              screenShake(12, 200);
              createShockwave(cx + 100, cy, { radius: 80, amplitude: 25, duration: 300 });
              for (let i = 0; i < 20; i++) {
                createParticleBurst(cx + 100, cy, {
                  count: 2,
                  color: [0x6b21a8, 0x9333ea, 0x7c3aed][Math.floor(Math.random() * 3)],
                  glowColor: 0x6b21a8,
                  minSpeed: 4,
                  maxSpeed: 10,
                  gravity: 0.2,
                  duration: 500,
                });
              }
            }
          };
          animateBounce();
        }
        break;

      case 'stab':
        // Goblin Chief - Quick sneaky stabs
        {
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              const offsetX = (i - 1) * 30;
              createDynamicSlash(cx - 60 + offsetX, cy, cx + 40 + offsetX, cy + (i - 1) * 15, {
                color: 0x84cc16,
                glowColor: 0x65a30d,
                maxThickness: 12,
                curvature: 0.1,
                duration: 120,
              });
              createParticleBurst(cx + 40 + offsetX, cy + (i - 1) * 15, {
                count: 5,
                color: 0x84cc16,
                glowColor: 0x65a30d,
                minSpeed: 3,
                maxSpeed: 8,
              });
              if (i === 2) screenShake(8, 150);
            }, i * 100);
          }
        }
        break;

      case 'slash':
        // Skeleton Knight - Heavy cursed sword slash
        {
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              const ghost = new PIXI.Graphics();
              ghost.beginFill(0x94a3b8, 0.3);
              ghost.drawRect(-40, -5, 80, 10);
              ghost.endFill();
              ghost.x = cx - 80 + i * 20;
              ghost.y = cy - 30;
              ghost.rotation = -0.3;
              app.layers.effects.addChild(ghost);
              let fadeOut = 0;
              const fadeGhost = () => {
                fadeOut += 0.1;
                ghost.alpha = 0.3 - fadeOut * 0.3;
                if (fadeOut < 1) requestAnimationFrame(fadeGhost);
                else { app.layers.effects.removeChild(ghost); ghost.destroy(); }
              };
              fadeGhost();
            }, i * 40);
          }
          setTimeout(() => {
            createDynamicSlash(cx - 100, cy - 50, cx + 100, cy + 50, {
              color: 0x94a3b8, glowColor: 0x64748b, maxThickness: 35, curvature: 0.3, duration: 250,
            });
            screenFlash(0x94a3b8, 100, 0.4);
            screenShake(18, 300);
            freezeFrame(60);
            for (let i = 0; i < 15; i++) {
              createParticleBurst(cx, cy, {
                count: 2,
                color: [0x94a3b8, 0xffffff, 0x64748b][Math.floor(Math.random() * 3)],
                glowColor: 0x64748b, minSpeed: 5, maxSpeed: 12,
              });
            }
          }, 200);
        }
        break;

      case 'smash':
        // Forest Troll - Massive overhead club smash
        {
          const club = new PIXI.Graphics();
          club.beginFill(0x65a30d, 0.8);
          club.drawRoundedRect(-15, -60, 30, 80, 8);
          club.endFill();
          club.beginFill(0x422006, 0.9);
          club.drawRoundedRect(-20, -70, 40, 30, 5);
          club.endFill();
          club.x = cx;
          club.y = cy - 100;
          club.pivot.set(0, 40);
          club.rotation = -1.5;
          club.filters = [new GlowFilter({ distance: 10, outerStrength: 1, color: 0x65a30d, quality: 0.2 })];
          app.layers.effects.addChild(club);

          let swingProgress = 0;
          const animateSwing = () => {
            swingProgress += 0.08;
            club.rotation = -1.5 + swingProgress * 3;
            club.y = cy - 100 + swingProgress * 80;
            if (swingProgress < 1) requestAnimationFrame(animateSwing);
            else {
              app.layers.effects.removeChild(club);
              club.destroy();
              screenFlash(0x65a30d, 150, 0.5);
              screenShake(30, 500);
              freezeFrame(100);
              createShockwave(cx, cy + 20, { radius: 120, amplitude: 40, duration: 400 });
              createEarthExplosion(cx, cy + 20);
              for (let i = 0; i < 25; i++) {
                createParticleBurst(cx + (Math.random() - 0.5) * 60, cy + 20, {
                  count: 2,
                  color: [0x65a30d, 0x422006, 0x84cc16][Math.floor(Math.random() * 3)],
                  glowColor: 0x65a30d, minSpeed: 4, maxSpeed: 14, gravity: 0.25,
                });
              }
            }
          };
          animateSwing();
        }
        break;

      case 'pound':
        // Stone Golem - Devastating ground pound
        {
          const fists = [];
          for (let i = 0; i < 2; i++) {
            const fist = new PIXI.Graphics();
            fist.beginFill(0x78716c, 0.9);
            fist.drawRoundedRect(-20, -25, 40, 50, 10);
            fist.endFill();
            fist.beginFill(0x57534e, 0.8);
            fist.drawCircle(-8, -10, 8);
            fist.drawCircle(8, -10, 8);
            fist.drawCircle(0, 5, 10);
            fist.endFill();
            fist.x = cx + (i === 0 ? -50 : 50);
            fist.y = cy - 120;
            fist.filters = [new GlowFilter({ distance: 8, outerStrength: 1, color: 0x78716c, quality: 0.2 })];
            app.layers.effects.addChild(fist);
            fists.push(fist);
          }
          let poundProgress = 0;
          const animatePound = () => {
            poundProgress += 0.06;
            fists.forEach((fist, i) => {
              fist.y = cy - 120 + poundProgress * 140;
              fist.x = cx + (i === 0 ? -50 : 50) + (i === 0 ? -1 : 1) * poundProgress * 20;
            });
            if (poundProgress < 1) requestAnimationFrame(animatePound);
            else {
              fists.forEach(fist => { app.layers.effects.removeChild(fist); fist.destroy(); });
              screenFlash(0x78716c, 200, 0.6);
              screenShake(40, 600);
              freezeFrame(120);
              createShockwave(cx, cy, { radius: 150, amplitude: 55, duration: 500 });
              createShockwave(cx, cy, { radius: 100, amplitude: 35, duration: 350 });
              createEarthExplosion(cx, cy);
              for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                createDynamicSlash(cx, cy, cx + Math.cos(angle) * 90, cy + Math.sin(angle) * 60, {
                  color: 0x78716c, glowColor: 0x57534e, maxThickness: 15, curvature: 0.1, duration: 300,
                });
              }
              for (let i = 0; i < 35; i++) {
                createParticleBurst(cx + (Math.random() - 0.5) * 80, cy, {
                  count: 2,
                  color: [0x78716c, 0x57534e, 0xa8a29e][Math.floor(Math.random() * 3)],
                  glowColor: 0x78716c, minSpeed: 6, maxSpeed: 18, gravity: 0.3,
                });
              }
            }
          };
          animatePound();
        }
        break;

      case 'fireball':
        // Flame Demon - Burnout Blaze
        {
          const fireCore = new PIXI.Graphics();
          fireCore.beginFill(0xef4444, 0.9);
          fireCore.drawCircle(0, 0, 5);
          fireCore.endFill();
          fireCore.x = cx - 80;
          fireCore.y = cy - 40;
          fireCore.filters = [new GlowFilter({ distance: 30, outerStrength: 4, color: 0xff6600, quality: 0.3 })];
          app.layers.effects.addChild(fireCore);

          const chargeInterval = setInterval(() => {
            createParticleBurst(cx - 80 + (Math.random() - 0.5) * 40, cy - 40 + (Math.random() - 0.5) * 40, {
              count: 3, color: [0xff6600, 0xef4444, 0xfbbf24][Math.floor(Math.random() * 3)],
              glowColor: 0xff6600, minSpeed: 1, maxSpeed: 3, duration: 300,
            });
          }, 50);

          let chargeProgress = 0;
          const animateCharge = () => {
            chargeProgress += 0.02;
            fireCore.scale.set(1 + chargeProgress * 5);
            if (chargeProgress < 1) requestAnimationFrame(animateCharge);
            else {
              clearInterval(chargeInterval);
              let launchProgress = 0;
              const animateLaunch = () => {
                launchProgress += 0.08;
                fireCore.x = cx - 80 + launchProgress * 180;
                fireCore.y = cy - 40 + Math.sin(launchProgress * Math.PI) * -20;
                createParticleBurst(fireCore.x, fireCore.y, {
                  count: 3, color: [0xff6600, 0xef4444][Math.floor(Math.random() * 2)],
                  glowColor: 0xff6600, minSpeed: 1, maxSpeed: 4, duration: 300,
                });
                if (launchProgress < 1) requestAnimationFrame(animateLaunch);
                else {
                  app.layers.effects.removeChild(fireCore);
                  fireCore.destroy();
                  screenFlash(0xff6600, 200, 0.7);
                  screenShake(25, 400);
                  freezeFrame(80);
                  createFireExplosion(cx + 100, cy - 20);
                  createShockwave(cx + 100, cy - 20, { radius: 100, amplitude: 35, duration: 350 });
                }
              };
              animateLaunch();
            }
          };
          animateCharge();
        }
        break;

      case 'breath':
        // Ice Drake - Comfort Zone Freeze
        {
          for (let i = 0; i < 10; i++) {
            setTimeout(() => {
              const angle = (Math.random() - 0.5) * Math.PI;
              const dist = 60 + Math.random() * 40;
              createParticleBurst(cx - 60 + Math.cos(angle) * dist, cy + Math.sin(angle) * dist * 0.6, {
                count: 2, color: 0x22d3ee, glowColor: 0x0891b2, direction: Math.PI, spread: Math.PI / 6,
                minSpeed: 3, maxSpeed: 6, duration: 400,
              });
            }, i * 40);
          }
          setTimeout(() => {
            const breathContainer = new PIXI.Container();
            app.layers.effects.addChild(breathContainer);
            breathContainer.x = cx - 40;
            breathContainer.y = cy;
            for (let wave = 0; wave < 8; wave++) {
              setTimeout(() => {
                const breath = new PIXI.Graphics();
                breath.beginFill(0x22d3ee, 0.5);
                breath.moveTo(0, 0);
                breath.lineTo(120, -40 - wave * 3);
                breath.lineTo(120, 40 + wave * 3);
                breath.closePath();
                breath.endFill();
                breath.filters = [new GlowFilter({ distance: 15, outerStrength: 2, color: 0x0891b2, quality: 0.3 })];
                breathContainer.addChild(breath);
                let breathProgress = 0;
                const animateBreath = () => {
                  breathProgress += 0.06;
                  breath.alpha = 0.5 - breathProgress * 0.5;
                  breath.scale.x = 1 + breathProgress;
                  if (breathProgress < 1) requestAnimationFrame(animateBreath);
                  else { breathContainer.removeChild(breath); breath.destroy(); }
                };
                animateBreath();
                for (let i = 0; i < 5; i++) {
                  createParticleBurst(cx + 40 + Math.random() * 60, cy + (Math.random() - 0.5) * 60, {
                    count: 2, color: [0x22d3ee, 0x67e8f9, 0xffffff][Math.floor(Math.random() * 3)],
                    glowColor: 0x0891b2, minSpeed: 2, maxSpeed: 6, gravity: -0.05,
                  });
                }
                if (wave === 4) { screenShake(15, 300); createIceExplosion(cx + 80, cy); }
              }, wave * 80);
            }
            setTimeout(() => { app.layers.effects.removeChild(breathContainer); breathContainer.destroy({ children: true }); }, 1000);
          }, 500);
        }
        break;

      case 'spell':
        // Dark Wizard - Imposter Hex
        {
          const magicCircle = new PIXI.Graphics();
          magicCircle.lineStyle(3, 0x7c3aed, 0.8);
          magicCircle.drawCircle(0, 0, 60);
          magicCircle.drawCircle(0, 0, 45);
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            magicCircle.moveTo(Math.cos(angle) * 45, Math.sin(angle) * 45);
            magicCircle.lineTo(Math.cos(angle) * 60, Math.sin(angle) * 60);
          }
          magicCircle.x = cx;
          magicCircle.y = cy;
          magicCircle.filters = [new GlowFilter({ distance: 20, outerStrength: 3, color: 0x7c3aed, quality: 0.3 })];
          app.layers.effects.addChild(magicCircle);
          for (let i = 0; i < 20; i++) {
            setTimeout(() => {
              const angle = Math.random() * Math.PI * 2;
              createParticleBurst(cx + Math.cos(angle) * 50, cy + Math.sin(angle) * 50, {
                count: 2, color: [0x7c3aed, 0xa855f7, 0xc084fc][Math.floor(Math.random() * 3)],
                glowColor: 0x7c3aed, minSpeed: 1, maxSpeed: 3, gravity: -0.1, duration: 600,
              });
            }, i * 40);
          }
          let circleProgress = 0;
          const animateCircle = () => {
            circleProgress += 0.02;
            magicCircle.rotation += 0.05;
            magicCircle.scale.set(1 + Math.sin(circleProgress * Math.PI * 4) * 0.1);
            if (circleProgress < 1) requestAnimationFrame(animateCircle);
            else {
              app.layers.effects.removeChild(magicCircle);
              magicCircle.destroy();
              screenFlash(0x7c3aed, 180, 0.6);
              screenShake(20, 350);
              freezeFrame(70);
              createDarkExplosion(cx, cy);
              createShockwave(cx, cy, { radius: 100, amplitude: 30, duration: 400 });
              for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                setTimeout(() => {
                  createLightningBolt(cx, cy, cx + Math.cos(angle) * 100, cy + Math.sin(angle) * 70, {
                    color: 0x7c3aed, glowColor: 0xa855f7, branches: 2,
                  });
                }, i * 50);
              }
            }
          };
          animateCircle();
        }
        break;

      case 'tentacle':
        // Void Watcher - Timeline Terror
        {
          const portal = new PIXI.Graphics();
          portal.beginFill(0x1e1b4b, 0.8);
          portal.drawEllipse(0, 0, 80, 40);
          portal.endFill();
          portal.beginFill(0x000000, 0.9);
          portal.drawEllipse(0, 0, 60, 30);
          portal.endFill();
          portal.x = cx;
          portal.y = cy + 30;
          portal.scale.set(0);
          portal.filters = [new GlowFilter({ distance: 25, outerStrength: 3, color: 0x4c1d95, quality: 0.3 })];
          app.layers.effects.addChild(portal);

          let portalProgress = 0;
          const animatePortal = () => {
            portalProgress += 0.04;
            portal.scale.set(Math.min(portalProgress * 1.2, 1));
            portal.rotation += 0.02;
            if (portalProgress < 1) requestAnimationFrame(animatePortal);
            else {
              for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                  const tentacle = new PIXI.Graphics();
                  const offsetX = (i - 2) * 25;
                  tentacle.lineStyle(8 - i, 0x4c1d95, 0.8);
                  tentacle.moveTo(0, 0);
                  tentacle.quadraticCurveTo(offsetX * 0.5, -40, offsetX, -80 - i * 10);
                  tentacle.x = cx;
                  tentacle.y = cy + 30;
                  tentacle.filters = [new GlowFilter({ distance: 10, outerStrength: 2, color: 0x1e1b4b, quality: 0.2 })];
                  app.layers.effects.addChild(tentacle);
                  let whipProgress = 0;
                  const animateWhip = () => {
                    whipProgress += 0.08;
                    tentacle.scale.y = 1 + Math.sin(whipProgress * Math.PI) * 0.3;
                    tentacle.rotation = Math.sin(whipProgress * Math.PI * 2) * 0.2;
                    if (whipProgress < 1.5) requestAnimationFrame(animateWhip);
                    else { app.layers.effects.removeChild(tentacle); tentacle.destroy(); }
                  };
                  animateWhip();
                  if (i === 2) screenShake(15, 250);
                }, i * 100);
              }
              setTimeout(() => {
                screenFlash(0x4c1d95, 150, 0.5);
                screenShake(25, 400);
                createDarkExplosion(cx, cy - 40);
                for (let i = 0; i < 20; i++) {
                  createParticleBurst(cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 60, {
                    count: 2, color: [0x1e1b4b, 0x4c1d95, 0x7c3aed][Math.floor(Math.random() * 3)],
                    glowColor: 0x1e1b4b, minSpeed: 2, maxSpeed: 8,
                  });
                }
              }, 600);
              setTimeout(() => {
                let closeProgress = 0;
                const animateClose = () => {
                  closeProgress += 0.06;
                  portal.scale.set(1 - closeProgress);
                  if (closeProgress < 1) requestAnimationFrame(animateClose);
                  else { app.layers.effects.removeChild(portal); portal.destroy(); }
                };
                animateClose();
              }, 1000);
            }
          };
          animatePortal();
        }
        break;

      case 'dragonfire':
        // Dragon Lord - Destiny's Wrath
        {
          screenShake(10, 300);
          createShockwave(cx - 100, cy, { radius: 60, amplitude: 20, duration: 300 });
          const chargePoint = { x: cx - 80, y: cy - 20 };
          for (let i = 0; i < 15; i++) {
            setTimeout(() => {
              const angle = Math.random() * Math.PI * 2;
              const dist = 40 + Math.random() * 30;
              createParticleBurst(chargePoint.x + Math.cos(angle) * dist, chargePoint.y + Math.sin(angle) * dist, {
                count: 2, color: [0xfbbf24, 0xf59e0b, 0xef4444][Math.floor(Math.random() * 3)],
                glowColor: 0xfbbf24, direction: angle + Math.PI, spread: Math.PI / 8,
                minSpeed: 2, maxSpeed: 5, duration: 400,
              });
            }, i * 50);
          }
          setTimeout(() => {
            const breathContainer = new PIXI.Container();
            app.layers.effects.addChild(breathContainer);
            for (let wave = 0; wave < 12; wave++) {
              setTimeout(() => {
                const fireWave = new PIXI.Graphics();
                const waveWidth = 30 + wave * 15;
                fireWave.beginFill([0xfbbf24, 0xf59e0b, 0xef4444][wave % 3], 0.7);
                fireWave.moveTo(0, 0);
                fireWave.lineTo(200, -waveWidth);
                fireWave.lineTo(200, waveWidth);
                fireWave.closePath();
                fireWave.endFill();
                fireWave.x = cx - 80;
                fireWave.y = cy - 20;
                fireWave.filters = [new GlowFilter({ distance: 20, outerStrength: 3, color: 0xff6600, quality: 0.3 })];
                breathContainer.addChild(fireWave);
                let waveProgress = 0;
                const animateWave = () => {
                  waveProgress += 0.04;
                  fireWave.alpha = 0.7 - waveProgress * 0.7;
                  fireWave.scale.x = 1 + waveProgress * 0.5;
                  if (waveProgress < 1) requestAnimationFrame(animateWave);
                  else { breathContainer.removeChild(fireWave); fireWave.destroy(); }
                };
                animateWave();
                for (let i = 0; i < 8; i++) {
                  createParticleBurst(cx - 40 + Math.random() * 160, cy - 20 + (Math.random() - 0.5) * 80, {
                    count: 2, color: [0xfbbf24, 0xf59e0b, 0xef4444, 0xffffff][Math.floor(Math.random() * 4)],
                    glowColor: 0xff6600, minSpeed: 3, maxSpeed: 10, gravity: -0.1, duration: 400,
                  });
                }
                if (wave === 3) screenShake(20, 400);
                if (wave === 6) { screenFlash(0xfbbf24, 150, 0.5); createFireExplosion(cx + 100, cy - 20); }
                if (wave === 9) { screenShake(30, 500); createShockwave(cx + 80, cy, { radius: 120, amplitude: 40, duration: 450 }); }
              }, wave * 70);
            }
            setTimeout(() => {
              screenFlash(0xfbbf24, 300, 0.8);
              screenShake(40, 700);
              freezeFrame(150);
              createFireExplosion(cx + 60, cy);
              createFireExplosion(cx + 100, cy - 30);
              createFireExplosion(cx + 100, cy + 30);
              createShockwave(cx + 80, cy, { radius: 180, amplitude: 60, duration: 600 });
              for (let i = 0; i < 40; i++) {
                setTimeout(() => {
                  createParticleBurst(cx + 40 + Math.random() * 120, cy + (Math.random() - 0.5) * 80, {
                    count: 2, color: [0xfbbf24, 0xf59e0b, 0xef4444][Math.floor(Math.random() * 3)],
                    glowColor: 0xff6600, minSpeed: 1, maxSpeed: 4, gravity: -0.05, duration: 800,
                  });
                }, i * 30);
              }
            }, 1000);
            setTimeout(() => { app.layers.effects.removeChild(breathContainer); breathContainer.destroy({ children: true }); }, 1500);
          }, 800);
        }
        break;

      default:
        createParticleBurst(cx, cy, { count: 30, color: 0xff4444 });
        screenShake(15, 300);
        screenFlash(0xff4444, 100, 0.4);
    }
  }, [width, height, createDynamicSlash, createParticleBurst, createShockwave,
      createFireExplosion, createIceExplosion, createDarkExplosion, createEarthExplosion,
      createLightningBolt, screenFlash, screenShake, freezeFrame]);

  // ========== SPECTACULAR BOSS PROJECTILE ==========
  // Creates unique visually impressive projectiles for each boss attack type
  const createBossProjectile = useCallback((startX, startY, targetX, targetY, options = {}) => {
    const app = appRef.current;
    if (!app || !app.layers) return;

    const {
      color = 0xff0000,
      size = 30,
      speed = 10,
      onImpact = null,
      attackType = 'default',
    } = options;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / distance;
    const dirY = dy / distance;
    const angle = Math.atan2(dy, dx);

    // Helper for impact effects
    const createImpactEffect = () => {
      screenShake(25, 400);
      screenFlash(color, 150, 0.6);
      freezeFrame(80);
      createShockwave(targetX, targetY, { radius: 150, duration: 400 });
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * Math.PI * 2;
        const vel = 6 + Math.random() * 12;
        const exp = new PIXI.Graphics();
        exp.beginFill(i % 2 === 0 ? color : 0xffffff, 0.9);
        exp.drawCircle(0, 0, 4 + Math.random() * 8);
        exp.endFill();
        exp.x = targetX; exp.y = targetY;
        exp.vx = Math.cos(a) * vel; exp.vy = Math.sin(a) * vel;
        exp.filters = [new GlowFilter({ distance: 10, outerStrength: 2, color })];
        app.layers.effects.addChild(exp);
        const animateExp = () => {
          exp.x += exp.vx; exp.y += exp.vy;
          exp.vx *= 0.93; exp.vy *= 0.93;
          exp.alpha -= 0.035;
          if (exp.alpha > 0) requestAnimationFrame(animateExp);
          else { app.layers.effects.removeChild(exp); exp.destroy(); }
        };
        setTimeout(animateExp, i * 8);
      }
      if (onImpact) onImpact();
    };

    switch (attackType) {
      // ===== BOUNCE (Shadow Slime) - Bouncing blob =====
      case 'bounce': {
        const blob = new PIXI.Container();
        app.layers.projectiles.addChild(blob);
        const core = new PIXI.Graphics();
        core.beginFill(color, 0.9);
        core.drawEllipse(0, 0, size * 1.2, size * 0.8);
        core.endFill();
        core.beginFill(0xffffff, 0.4);
        core.drawEllipse(-size * 0.3, -size * 0.2, size * 0.3, size * 0.2);
        core.endFill();
        core.filters = [new GlowFilter({ distance: 20, outerStrength: 3, color })];
        blob.addChild(core);
        let posX = startX, posY = startY, frame = 0, bounceCount = 0;
        const bounceHeight = 80;
        const animate = () => {
          frame++;
          const progress = Math.min(1, (frame * speed * 0.7) / distance);
          posX = startX + dx * progress;
          const bouncePhase = (progress * 4 + bounceCount) * Math.PI;
          const bounce = Math.abs(Math.sin(bouncePhase)) * bounceHeight * (1 - progress * 0.5);
          posY = startY + dy * progress - bounce;
          blob.x = posX; blob.y = posY;
          const squash = 1 + Math.sin(bouncePhase) * 0.3;
          core.scale.set(1 / squash, squash);
          // Drip particles
          if (frame % 4 === 0) {
            const drip = new PIXI.Graphics();
            drip.beginFill(color, 0.7);
            drip.drawCircle(0, 0, 3 + Math.random() * 4);
            drip.endFill();
            drip.x = posX + (Math.random() - 0.5) * 20;
            drip.y = posY + size * 0.5;
            drip.vy = 2;
            app.layers.effects.addChild(drip);
            const animDrip = () => {
              drip.y += drip.vy; drip.vy += 0.3;
              drip.alpha -= 0.04;
              if (drip.alpha > 0) requestAnimationFrame(animDrip);
              else { app.layers.effects.removeChild(drip); drip.destroy(); }
            };
            animDrip();
          }
          if (progress >= 1) {
            app.layers.projectiles.removeChild(blob); blob.destroy();
            // Splat effect
            for (let i = 0; i < 12; i++) {
              const splat = new PIXI.Graphics();
              splat.beginFill(color, 0.8);
              splat.drawEllipse(0, 0, 8 + Math.random() * 12, 4 + Math.random() * 6);
              splat.endFill();
              splat.x = targetX; splat.y = targetY;
              const a = (i / 12) * Math.PI * 2;
              splat.vx = Math.cos(a) * (5 + Math.random() * 8);
              splat.vy = Math.sin(a) * (3 + Math.random() * 5);
              splat.filters = [new GlowFilter({ distance: 8, outerStrength: 2, color })];
              app.layers.effects.addChild(splat);
              const animSplat = () => {
                splat.x += splat.vx; splat.y += splat.vy;
                splat.vy += 0.2;
                splat.alpha -= 0.03;
                if (splat.alpha > 0) requestAnimationFrame(animSplat);
                else { app.layers.effects.removeChild(splat); splat.destroy(); }
              };
              animSplat();
            }
            createImpactEffect();
            return;
          }
          requestAnimationFrame(animate);
        };
        animate();
        break;
      }

      // ===== STAB (Goblin Chief) - Fast dagger thrust =====
      case 'stab': {
        const dagger = new PIXI.Container();
        app.layers.projectiles.addChild(dagger);
        // Dagger blade
        const blade = new PIXI.Graphics();
        blade.beginFill(0xc0c0c0, 1);
        blade.moveTo(30, 0);
        blade.lineTo(-10, -8);
        blade.lineTo(-10, 8);
        blade.closePath();
        blade.endFill();
        blade.beginFill(0xffffff, 0.6);
        blade.moveTo(25, 0);
        blade.lineTo(0, -3);
        blade.lineTo(0, 3);
        blade.closePath();
        blade.endFill();
        // Handle
        blade.beginFill(0x8b4513, 1);
        blade.drawRect(-20, -5, 12, 10);
        blade.endFill();
        blade.beginFill(color, 1);
        blade.drawCircle(-14, 0, 6);
        blade.endFill();
        blade.filters = [new GlowFilter({ distance: 15, outerStrength: 2, color: 0xc0c0c0 })];
        dagger.addChild(blade);
        dagger.rotation = angle;
        dagger.x = startX; dagger.y = startY;
        let posX = startX, posY = startY, frame = 0;
        const fastSpeed = speed * 2.5;
        // Wind-up
        screenShake(5, 100);
        const animate = () => {
          frame++;
          posX += dirX * fastSpeed;
          posY += dirY * fastSpeed;
          dagger.x = posX; dagger.y = posY;
          // Motion blur trail
          if (frame % 2 === 0) {
            const trail = new PIXI.Graphics();
            trail.beginFill(0xc0c0c0, 0.5);
            trail.moveTo(20, 0); trail.lineTo(-10, -6); trail.lineTo(-10, 6);
            trail.closePath();
            trail.endFill();
            trail.x = posX; trail.y = posY;
            trail.rotation = angle;
            app.layers.effects.addChild(trail);
            const animTrail = () => {
              trail.alpha -= 0.15;
              if (trail.alpha > 0) requestAnimationFrame(animTrail);
              else { app.layers.effects.removeChild(trail); trail.destroy(); }
            };
            animTrail();
          }
          const dist = Math.sqrt((targetX - posX) ** 2 + (targetY - posY) ** 2);
          if (dist < fastSpeed * 2) {
            app.layers.projectiles.removeChild(dagger); dagger.destroy();
            // Stab impact - sparks
            for (let i = 0; i < 20; i++) {
              const spark = new PIXI.Graphics();
              spark.beginFill(0xffffff, 1);
              spark.drawRect(0, 0, 8, 2);
              spark.endFill();
              spark.x = targetX; spark.y = targetY;
              spark.rotation = Math.random() * Math.PI * 2;
              spark.vx = (Math.random() - 0.5) * 20;
              spark.vy = (Math.random() - 0.5) * 20;
              app.layers.effects.addChild(spark);
              const animSpark = () => {
                spark.x += spark.vx; spark.y += spark.vy;
                spark.alpha -= 0.08;
                if (spark.alpha > 0) requestAnimationFrame(animSpark);
                else { app.layers.effects.removeChild(spark); spark.destroy(); }
              };
              animSpark();
            }
            createImpactEffect();
            return;
          }
          requestAnimationFrame(animate);
        };
        setTimeout(animate, 150);
        break;
      }

      // ===== SLASH (Skeleton Knight) - Sword arc =====
      case 'slash': {
        const slashContainer = new PIXI.Container();
        app.layers.projectiles.addChild(slashContainer);
        // Create arc that travels
        const arcWidth = 120;
        let posX = startX, posY = startY, frame = 0;
        let arcAngle = -Math.PI / 3;
        screenShake(8, 200);
        const animate = () => {
          frame++;
          posX += dirX * speed * 1.5;
          posY += dirY * speed * 1.5;
          slashContainer.x = posX;
          slashContainer.y = posY;
          arcAngle += 0.15;
          // Draw arc slash
          slashContainer.removeChildren();
          for (let i = 0; i < 8; i++) {
            const arc = new PIXI.Graphics();
            const a = arcAngle - i * 0.1;
            arc.lineStyle(6 - i * 0.5, i === 0 ? 0xffffff : color, 1 - i * 0.1);
            arc.arc(0, 0, arcWidth - i * 5, a - 0.8, a + 0.8);
            arc.filters = [new GlowFilter({ distance: 12, outerStrength: 2, color })];
            slashContainer.addChild(arc);
          }
          // Bone particles
          if (frame % 3 === 0) {
            const bone = new PIXI.Graphics();
            bone.beginFill(0xe8e8e8, 0.8);
            bone.drawEllipse(0, 0, 4, 2);
            bone.endFill();
            bone.x = posX + (Math.random() - 0.5) * 60;
            bone.y = posY + (Math.random() - 0.5) * 60;
            bone.vx = (Math.random() - 0.5) * 5;
            bone.vy = (Math.random() - 0.5) * 5;
            bone.rotation = Math.random() * Math.PI;
            app.layers.effects.addChild(bone);
            const animBone = () => {
              bone.x += bone.vx; bone.y += bone.vy;
              bone.rotation += 0.1;
              bone.alpha -= 0.04;
              if (bone.alpha > 0) requestAnimationFrame(animBone);
              else { app.layers.effects.removeChild(bone); bone.destroy(); }
            };
            animBone();
          }
          const dist = Math.sqrt((targetX - posX) ** 2 + (targetY - posY) ** 2);
          if (dist < speed * 3) {
            app.layers.projectiles.removeChild(slashContainer);
            slashContainer.destroy();
            // Final slash impact
            const finalArc = new PIXI.Graphics();
            finalArc.lineStyle(10, 0xffffff, 1);
            finalArc.arc(0, 0, 100, -1, 1);
            finalArc.x = targetX; finalArc.y = targetY;
            finalArc.filters = [new GlowFilter({ distance: 25, outerStrength: 4, color })];
            app.layers.effects.addChild(finalArc);
            let scale = 1;
            const animFinal = () => {
              scale += 0.15;
              finalArc.scale.set(scale);
              finalArc.alpha -= 0.08;
              if (finalArc.alpha > 0) requestAnimationFrame(animFinal);
              else { app.layers.effects.removeChild(finalArc); finalArc.destroy(); }
            };
            animFinal();
            createImpactEffect();
            return;
          }
          requestAnimationFrame(animate);
        };
        animate();
        break;
      }

      // ===== SMASH (Forest Troll) - Ground pound shockwave =====
      case 'smash': {
        // Troll fist comes down then shockwave travels
        const fist = new PIXI.Graphics();
        fist.beginFill(0x65a30d, 1);
        fist.drawEllipse(0, 0, size * 1.5, size * 1.2);
        fist.endFill();
        fist.beginFill(0x4d7c0f, 1);
        for (let i = 0; i < 4; i++) {
          fist.drawEllipse(-15 + i * 12, -size * 0.8, 8, 15);
        }
        fist.endFill();
        fist.filters = [new GlowFilter({ distance: 15, outerStrength: 2, color })];
        fist.x = startX; fist.y = startY - 100;
        app.layers.projectiles.addChild(fist);
        // Fist comes down
        let fistY = startY - 100;
        const animateFist = () => {
          fistY += 20;
          fist.y = fistY;
          fist.scale.set(1 + (fistY - startY + 100) / 200 * 0.3);
          if (fistY < startY + 20) {
            requestAnimationFrame(animateFist);
          } else {
            app.layers.projectiles.removeChild(fist);
            fist.destroy();
            screenShake(30, 500);
            // Ground crack and shockwave travels to player
            const shockwave = new PIXI.Container();
            app.layers.projectiles.addChild(shockwave);
            let posX = startX, posY = startY;
            let waveFrame = 0;
            const animateWave = () => {
              waveFrame++;
              posX += dirX * speed * 1.8;
              posY += dirY * speed * 1.8;
              shockwave.x = posX; shockwave.y = posY;
              // Ground cracks
              shockwave.removeChildren();
              for (let i = 0; i < 5; i++) {
                const crack = new PIXI.Graphics();
                crack.lineStyle(4 - i * 0.5, i === 0 ? 0xffffff : color, 1 - i * 0.15);
                crack.moveTo(-30 - i * 5, 0);
                crack.lineTo(30 + i * 5, 0);
                crack.moveTo(0, -20 - i * 3);
                crack.lineTo(0, 20 + i * 3);
                crack.y = i * 2;
                crack.filters = [new GlowFilter({ distance: 8, outerStrength: 2, color })];
                shockwave.addChild(crack);
              }
              // Debris
              if (waveFrame % 3 === 0) {
                const debris = new PIXI.Graphics();
                debris.beginFill([0x65a30d, 0x4d7c0f, 0x84cc16][Math.floor(Math.random() * 3)], 0.9);
                debris.drawPolygon([0, -8, 6, 4, -6, 4]);
                debris.endFill();
                debris.x = posX + (Math.random() - 0.5) * 40;
                debris.y = posY;
                debris.vy = -8 - Math.random() * 6;
                debris.vx = (Math.random() - 0.5) * 4;
                debris.rotation = Math.random() * Math.PI;
                app.layers.effects.addChild(debris);
                const animDebris = () => {
                  debris.x += debris.vx; debris.y += debris.vy;
                  debris.vy += 0.5;
                  debris.rotation += 0.1;
                  debris.alpha -= 0.02;
                  if (debris.alpha > 0) requestAnimationFrame(animDebris);
                  else { app.layers.effects.removeChild(debris); debris.destroy(); }
                };
                animDebris();
              }
              const dist = Math.sqrt((targetX - posX) ** 2 + (targetY - posY) ** 2);
              if (dist < speed * 3) {
                app.layers.projectiles.removeChild(shockwave);
                shockwave.destroy();
                createImpactEffect();
                return;
              }
              requestAnimationFrame(animateWave);
            };
            animateWave();
          }
        };
        animateFist();
        break;
      }

      // ===== POUND (Stone Golem) - Heavy boulder =====
      case 'pound': {
        const boulder = new PIXI.Container();
        app.layers.projectiles.addChild(boulder);
        // Rocky texture
        const rock = new PIXI.Graphics();
        rock.beginFill(0x78716c, 1);
        rock.drawPolygon([0, -size, size * 0.8, -size * 0.3, size * 0.6, size * 0.6, -size * 0.5, size * 0.7, -size * 0.9, 0]);
        rock.endFill();
        rock.beginFill(0x57534e, 1);
        rock.drawPolygon([-5, -size * 0.5, size * 0.3, -size * 0.2, size * 0.2, size * 0.3, -size * 0.3, size * 0.2]);
        rock.endFill();
        rock.beginFill(0xa8a29e, 0.6);
        rock.drawPolygon([size * 0.2, -size * 0.6, size * 0.5, -size * 0.2, size * 0.3, 0]);
        rock.endFill();
        rock.filters = [new GlowFilter({ distance: 10, outerStrength: 1.5, color: 0x78716c })];
        boulder.addChild(rock);
        boulder.x = startX; boulder.y = startY;
        let posX = startX, posY = startY, frame = 0;
        const heavySpeed = speed * 0.8;
        screenShake(10, 200);
        const animate = () => {
          frame++;
          posX += dirX * heavySpeed;
          posY += dirY * heavySpeed;
          boulder.x = posX; boulder.y = posY;
          rock.rotation += 0.08;
          rock.scale.set(1 + Math.sin(frame * 0.2) * 0.05);
          // Dust trail
          if (frame % 3 === 0) {
            const dust = new PIXI.Graphics();
            dust.beginFill(0xa8a29e, 0.6);
            dust.drawCircle(0, 0, 5 + Math.random() * 8);
            dust.endFill();
            dust.x = posX + (Math.random() - 0.5) * 30;
            dust.y = posY + (Math.random() - 0.5) * 30;
            app.layers.effects.addChild(dust);
            const animDust = () => {
              dust.scale.set(dust.scale.x * 1.05);
              dust.alpha -= 0.04;
              if (dust.alpha > 0) requestAnimationFrame(animDust);
              else { app.layers.effects.removeChild(dust); dust.destroy(); }
            };
            animDust();
          }
          // Small rocks
          if (frame % 5 === 0) {
            const pebble = new PIXI.Graphics();
            pebble.beginFill([0x78716c, 0x57534e, 0xa8a29e][Math.floor(Math.random() * 3)], 0.9);
            pebble.drawPolygon([0, -4, 4, 2, -4, 2]);
            pebble.endFill();
            pebble.x = posX; pebble.y = posY;
            pebble.vx = (Math.random() - 0.5) * 6;
            pebble.vy = -3 - Math.random() * 4;
            app.layers.effects.addChild(pebble);
            const animPebble = () => {
              pebble.x += pebble.vx; pebble.y += pebble.vy;
              pebble.vy += 0.3;
              pebble.rotation += 0.15;
              pebble.alpha -= 0.025;
              if (pebble.alpha > 0) requestAnimationFrame(animPebble);
              else { app.layers.effects.removeChild(pebble); pebble.destroy(); }
            };
            animPebble();
          }
          const dist = Math.sqrt((targetX - posX) ** 2 + (targetY - posY) ** 2);
          if (dist < heavySpeed * 3) {
            app.layers.projectiles.removeChild(boulder);
            boulder.destroy();
            screenShake(40, 600);
            // Rock shatter
            for (let i = 0; i < 15; i++) {
              const shard = new PIXI.Graphics();
              shard.beginFill([0x78716c, 0x57534e][i % 2], 1);
              shard.drawPolygon([0, -12 - Math.random() * 8, 8, 4, -8, 4]);
              shard.endFill();
              shard.x = targetX; shard.y = targetY;
              const a = (i / 15) * Math.PI * 2;
              shard.vx = Math.cos(a) * (8 + Math.random() * 10);
              shard.vy = Math.sin(a) * (8 + Math.random() * 10);
              shard.rotation = Math.random() * Math.PI;
              app.layers.effects.addChild(shard);
              const animShard = () => {
                shard.x += shard.vx; shard.y += shard.vy;
                shard.vy += 0.4;
                shard.rotation += 0.1;
                shard.alpha -= 0.02;
                if (shard.alpha > 0) requestAnimationFrame(animShard);
                else { app.layers.effects.removeChild(shard); shard.destroy(); }
              };
              animShard();
            }
            createImpactEffect();
            return;
          }
          requestAnimationFrame(animate);
        };
        animate();
        break;
      }

      // ===== FIREBALL (Flame Demon) - Classic fire projectile =====
      case 'fireball': {
        const fireball = new PIXI.Container();
        app.layers.projectiles.addChild(fireball);
        const core = new PIXI.Graphics();
        core.beginFill(0xffffff, 1);
        core.drawCircle(0, 0, size * 0.4);
        core.endFill();
        core.beginFill(0xfbbf24, 0.9);
        core.drawCircle(0, 0, size * 0.7);
        core.endFill();
        core.beginFill(0xef4444, 0.7);
        core.drawCircle(0, 0, size);
        core.endFill();
        core.filters = [new GlowFilter({ distance: 30, outerStrength: 4, color: 0xef4444 })];
        fireball.addChild(core);
        fireball.x = startX; fireball.y = startY;
        let posX = startX, posY = startY, frame = 0;
        screenShake(8, 150);
        const animate = () => {
          frame++;
          posX += dirX * speed * 1.3;
          posY += dirY * speed * 1.3;
          fireball.x = posX; fireball.y = posY;
          core.scale.set(1 + Math.sin(frame * 0.4) * 0.2);
          core.rotation += 0.1;
          // Fire particles
          if (frame % 2 === 0) {
            for (let i = 0; i < 3; i++) {
              const flame = new PIXI.Graphics();
              flame.beginFill([0xfbbf24, 0xf59e0b, 0xef4444, 0xffffff][Math.floor(Math.random() * 4)], 0.9);
              flame.drawCircle(0, 0, 4 + Math.random() * 8);
              flame.endFill();
              flame.x = posX + (Math.random() - 0.5) * 20 - dirX * 15;
              flame.y = posY + (Math.random() - 0.5) * 20 - dirY * 15;
              flame.filters = [new GlowFilter({ distance: 10, outerStrength: 2, color: 0xef4444 })];
              app.layers.effects.addChild(flame);
              const animFlame = () => {
                flame.x -= dirX * 2;
                flame.y -= dirY * 2 - 1;
                flame.scale.set(flame.scale.x * 0.92);
                flame.alpha -= 0.06;
                if (flame.alpha > 0) requestAnimationFrame(animFlame);
                else { app.layers.effects.removeChild(flame); flame.destroy(); }
              };
              animFlame();
            }
          }
          const dist = Math.sqrt((targetX - posX) ** 2 + (targetY - posY) ** 2);
          if (dist < speed * 2.5) {
            app.layers.projectiles.removeChild(fireball);
            fireball.destroy();
            createFireExplosion(targetX, targetY);
            createImpactEffect();
            return;
          }
          requestAnimationFrame(animate);
        };
        animate();
        break;
      }

      // ===== BREATH (Ice Drake) - Ice cone breath =====
      case 'breath': {
        const breathContainer = new PIXI.Container();
        app.layers.projectiles.addChild(breathContainer);
        let frame = 0;
        const totalFrames = Math.floor(distance / (speed * 1.5));
        screenShake(5, 100);
        const animate = () => {
          frame++;
          const progress = frame / totalFrames;
          breathContainer.removeChildren();
          // Expanding ice cone
          const coneLength = distance * progress;
          const coneWidth = 30 + progress * 80;
          for (let layer = 0; layer < 5; layer++) {
            const cone = new PIXI.Graphics();
            cone.beginFill([0x67e8f9, 0x22d3ee, 0x0891b2, 0xffffff, 0xa5f3fc][layer], 0.7 - layer * 0.1);
            cone.moveTo(startX, startY);
            cone.lineTo(
              startX + dirX * coneLength - dirY * (coneWidth - layer * 10),
              startY + dirY * coneLength + dirX * (coneWidth - layer * 10)
            );
            cone.lineTo(
              startX + dirX * coneLength + dirY * (coneWidth - layer * 10),
              startY + dirY * coneLength - dirX * (coneWidth - layer * 10)
            );
            cone.closePath();
            cone.endFill();
            cone.filters = [new GlowFilter({ distance: 15 - layer * 2, outerStrength: 3 - layer * 0.4, color: 0x22d3ee })];
            breathContainer.addChild(cone);
          }
          // Ice crystals
          if (frame % 3 === 0) {
            const crystal = new PIXI.Graphics();
            crystal.beginFill([0x67e8f9, 0xffffff, 0x22d3ee][Math.floor(Math.random() * 3)], 0.9);
            crystal.drawPolygon([0, -10, 6, 0, 0, 10, -6, 0]);
            crystal.endFill();
            const offset = (Math.random() - 0.5) * coneWidth * 1.5;
            crystal.x = startX + dirX * coneLength * Math.random() - dirY * offset;
            crystal.y = startY + dirY * coneLength * Math.random() + dirX * offset;
            crystal.rotation = Math.random() * Math.PI;
            crystal.filters = [new GlowFilter({ distance: 8, outerStrength: 2, color: 0x67e8f9 })];
            app.layers.effects.addChild(crystal);
            const animCrystal = () => {
              crystal.rotation += 0.1;
              crystal.alpha -= 0.03;
              crystal.scale.set(crystal.scale.x * 0.98);
              if (crystal.alpha > 0) requestAnimationFrame(animCrystal);
              else { app.layers.effects.removeChild(crystal); crystal.destroy(); }
            };
            animCrystal();
          }
          if (progress >= 1) {
            app.layers.projectiles.removeChild(breathContainer);
            breathContainer.destroy();
            createIceExplosion(targetX, targetY);
            createImpactEffect();
            return;
          }
          requestAnimationFrame(animate);
        };
        animate();
        break;
      }

      // ===== SPELL (Dark Wizard) - Magic orb with runes =====
      case 'spell': {
        const spellOrb = new PIXI.Container();
        app.layers.projectiles.addChild(spellOrb);
        // Core orb
        const core = new PIXI.Graphics();
        core.beginFill(0xffffff, 0.9);
        core.drawCircle(0, 0, size * 0.3);
        core.endFill();
        core.beginFill(color, 0.8);
        core.drawCircle(0, 0, size * 0.6);
        core.endFill();
        core.beginFill(color, 0.4);
        core.drawCircle(0, 0, size);
        core.endFill();
        core.filters = [new GlowFilter({ distance: 25, outerStrength: 4, color })];
        spellOrb.addChild(core);
        // Orbiting runes as simple geometric shapes
        const runeGraphics = [];
        for (let i = 0; i < 5; i++) {
          const runeContainer = new PIXI.Container();
          const rune = new PIXI.Graphics();
          rune.beginFill(0xffffff, 0.9);
          // Draw rune symbol as geometric shape (no drawStar for compatibility)
          if (i === 0) {
            // Star shape manually
            for (let p = 0; p < 5; p++) {
              const outerAngle = (p * 2 * Math.PI / 5) - Math.PI / 2;
              const innerAngle = outerAngle + Math.PI / 5;
              if (p === 0) rune.moveTo(Math.cos(outerAngle) * 10, Math.sin(outerAngle) * 10);
              else rune.lineTo(Math.cos(outerAngle) * 10, Math.sin(outerAngle) * 10);
              rune.lineTo(Math.cos(innerAngle) * 4, Math.sin(innerAngle) * 4);
            }
            rune.closePath();
          } else if (i === 1) {
            rune.drawPolygon([0, -10, 8, 0, 0, 10, -8, 0]); // Diamond
          } else if (i === 2) {
            rune.drawCircle(0, 0, 6); // Circle
          } else if (i === 3) {
            rune.drawPolygon([0, -10, 8, 8, -8, 8]); // Triangle
          } else {
            rune.drawRect(-6, -6, 12, 12); // Square
          }
          rune.endFill();
          rune.filters = [new GlowFilter({ distance: 10, outerStrength: 2, color })];
          runeContainer.addChild(rune);
          runeContainer.orbitAngle = (i / 5) * Math.PI * 2;
          runeContainer.orbitRadius = size * 1.5;
          runeContainer.orbitSpeed = 0.08 + i * 0.01;
          spellOrb.addChild(runeContainer);
          runeGraphics.push(runeContainer);
        }
        spellOrb.x = startX; spellOrb.y = startY;
        let posX = startX, posY = startY, frame = 0;
        // Charge effect
        for (let i = 0; i < 15; i++) {
          setTimeout(() => {
            if (!app || !app.layers) return;
            const chargeP = new PIXI.Graphics();
            chargeP.beginFill(color, 0.8);
            chargeP.drawCircle(0, 0, 3);
            chargeP.endFill();
            const a = Math.random() * Math.PI * 2;
            chargeP.x = startX + Math.cos(a) * 60;
            chargeP.y = startY + Math.sin(a) * 60;
            chargeP.filters = [new GlowFilter({ distance: 6, outerStrength: 2, color })];
            app.layers.effects.addChild(chargeP);
            const animCharge = () => {
              const cdx = startX - chargeP.x;
              const cdy = startY - chargeP.y;
              chargeP.x += cdx * 0.15;
              chargeP.y += cdy * 0.15;
              if (Math.sqrt(cdx * cdx + cdy * cdy) > 5) requestAnimationFrame(animCharge);
              else {
                if (app && app.layers) app.layers.effects.removeChild(chargeP);
                chargeP.destroy();
              }
            };
            animCharge();
          }, i * 20);
        }
        setTimeout(() => {
          if (!app || !app.layers) return;
          screenShake(8, 150);
          const animate = () => {
            if (!app || !app.layers) return;
            frame++;
            posX += dirX * speed;
            posY += dirY * speed;
            spellOrb.x = posX; spellOrb.y = posY;
            core.scale.set(1 + Math.sin(frame * 0.3) * 0.1);
            core.rotation += 0.05;
            // Rotate runes
            runeGraphics.forEach(r => {
              r.orbitAngle += r.orbitSpeed;
              r.x = Math.cos(r.orbitAngle) * r.orbitRadius;
              r.y = Math.sin(r.orbitAngle) * r.orbitRadius;
              r.rotation += 0.1;
            });
            // Magic trail
            if (frame % 2 === 0 && app && app.layers) {
              const trail = new PIXI.Graphics();
              trail.beginFill(color, 0.6);
              trail.drawCircle(0, 0, size * 0.4 + Math.random() * 5);
              trail.endFill();
              trail.x = posX + (Math.random() - 0.5) * 15;
              trail.y = posY + (Math.random() - 0.5) * 15;
              trail.filters = [new GlowFilter({ distance: 12, outerStrength: 2, color })];
              app.layers.effects.addChild(trail);
              const animTrail = () => {
                trail.scale.set(trail.scale.x * 0.9);
                trail.alpha -= 0.08;
                if (trail.alpha > 0) requestAnimationFrame(animTrail);
                else {
                  if (app && app.layers) app.layers.effects.removeChild(trail);
                  trail.destroy();
                }
              };
              animTrail();
            }
            const dist = Math.sqrt((targetX - posX) ** 2 + (targetY - posY) ** 2);
            if (dist < speed * 2) {
              if (app && app.layers) app.layers.projectiles.removeChild(spellOrb);
              spellOrb.destroy();
              // Magic explosion with runes
              for (let i = 0; i < 8; i++) {
                if (!app || !app.layers) continue;
                const expRune = new PIXI.Graphics();
                expRune.beginFill(0xffffff, 1);
                // Draw star manually for explosion runes
                for (let p = 0; p < 5; p++) {
                  const outerAngle = (p * 2 * Math.PI / 5) - Math.PI / 2;
                  const innerAngle = outerAngle + Math.PI / 5;
                  if (p === 0) expRune.moveTo(Math.cos(outerAngle) * 12, Math.sin(outerAngle) * 12);
                  else expRune.lineTo(Math.cos(outerAngle) * 12, Math.sin(outerAngle) * 12);
                  expRune.lineTo(Math.cos(innerAngle) * 5, Math.sin(innerAngle) * 5);
                }
                expRune.closePath();
                expRune.endFill();
                expRune.x = targetX; expRune.y = targetY;
                const a = (i / 8) * Math.PI * 2;
                expRune.vx = Math.cos(a) * 12;
                expRune.vy = Math.sin(a) * 12;
                expRune.filters = [new GlowFilter({ distance: 15, outerStrength: 3, color })];
                app.layers.effects.addChild(expRune);
                const animExpRune = () => {
                  expRune.x += expRune.vx; expRune.y += expRune.vy;
                  expRune.rotation += 0.2;
                  expRune.vx *= 0.92; expRune.vy *= 0.92;
                  expRune.alpha -= 0.04;
                  if (expRune.alpha > 0) requestAnimationFrame(animExpRune);
                  else {
                    if (app && app.layers) app.layers.effects.removeChild(expRune);
                    expRune.destroy();
                  }
                };
                animExpRune();
              }
              createDarkExplosion(targetX, targetY);
              createImpactEffect();
              return;
            }
            requestAnimationFrame(animate);
          };
          animate();
        }, 350);
        break;
      }

      // ===== TENTACLE (Void Watcher) - Dark tendrils =====
      case 'tentacle': {
        const tentacleContainer = new PIXI.Container();
        app.layers.projectiles.addChild(tentacleContainer);
        const numTendrils = 5;
        const tendrils = [];
        for (let i = 0; i < numTendrils; i++) {
          tendrils.push({
            offsetAngle: (i - 2) * 0.3,
            phase: Math.random() * Math.PI * 2,
            speed: 0.8 + Math.random() * 0.4
          });
        }
        let frame = 0;
        const totalFrames = Math.floor(distance / (speed * 1.2));
        screenShake(10, 200);
        const animate = () => {
          frame++;
          const progress = Math.min(1, frame / totalFrames);
          tentacleContainer.removeChildren();
          tendrils.forEach((t, ti) => {
            const tendril = new PIXI.Graphics();
            const segments = 20;
            tendril.lineStyle(8 - ti * 0.5, ti === 0 ? 0x1e1b4b : color, 0.8);
            const points = [];
            for (let s = 0; s <= segments; s++) {
              const segProgress = s / segments * progress;
              const wave = Math.sin(segProgress * 8 + frame * 0.1 + t.phase) * (20 + ti * 5);
              const px = startX + dx * segProgress + Math.cos(angle + Math.PI / 2 + t.offsetAngle) * wave;
              const py = startY + dy * segProgress + Math.sin(angle + Math.PI / 2 + t.offsetAngle) * wave;
              points.push({ x: px, y: py });
            }
            tendril.moveTo(points[0].x, points[0].y);
            for (let p = 1; p < points.length; p++) {
              tendril.lineTo(points[p].x, points[p].y);
            }
            tendril.filters = [new GlowFilter({ distance: 12, outerStrength: 2, color })];
            tentacleContainer.addChild(tendril);
            // Tendril tip
            if (progress > 0.1) {
              const tip = new PIXI.Graphics();
              tip.beginFill(ti === 0 ? 0xffffff : color, 0.9);
              tip.drawCircle(0, 0, 6 - ti * 0.5);
              tip.endFill();
              tip.x = points[points.length - 1].x;
              tip.y = points[points.length - 1].y;
              tip.filters = [new GlowFilter({ distance: 10, outerStrength: 2, color })];
              tentacleContainer.addChild(tip);
            }
          });
          // Dark particles
          if (frame % 4 === 0) {
            const dark = new PIXI.Graphics();
            dark.beginFill(color, 0.7);
            dark.drawCircle(0, 0, 4 + Math.random() * 6);
            dark.endFill();
            dark.x = startX + dx * progress * Math.random();
            dark.y = startY + dy * progress * Math.random();
            dark.filters = [new GlowFilter({ distance: 8, outerStrength: 2, color })];
            app.layers.effects.addChild(dark);
            const animDark = () => {
              dark.scale.set(dark.scale.x * 1.03);
              dark.alpha -= 0.04;
              if (dark.alpha > 0) requestAnimationFrame(animDark);
              else { app.layers.effects.removeChild(dark); dark.destroy(); }
            };
            animDark();
          }
          if (progress >= 1) {
            app.layers.projectiles.removeChild(tentacleContainer);
            tentacleContainer.destroy();
            // Void explosion
            for (let i = 0; i < 8; i++) {
              const void_ = new PIXI.Graphics();
              void_.beginFill(0x1e1b4b, 0.9);
              void_.drawCircle(0, 0, 15);
              void_.endFill();
              void_.beginFill(color, 0.5);
              void_.drawCircle(0, 0, 25);
              void_.endFill();
              void_.x = targetX + (Math.random() - 0.5) * 60;
              void_.y = targetY + (Math.random() - 0.5) * 60;
              void_.filters = [new GlowFilter({ distance: 20, outerStrength: 3, color })];
              app.layers.effects.addChild(void_);
              const animVoid = () => {
                void_.scale.set(void_.scale.x * 0.95);
                void_.alpha -= 0.04;
                if (void_.alpha > 0) requestAnimationFrame(animVoid);
                else { app.layers.effects.removeChild(void_); void_.destroy(); }
              };
              setTimeout(animVoid, i * 50);
            }
            createDarkExplosion(targetX, targetY);
            createImpactEffect();
            return;
          }
          requestAnimationFrame(animate);
        };
        animate();
        break;
      }

      // ===== DRAGONFIRE (Dragon Lord) - Massive fire breath =====
      case 'dragonfire': {
        const fireContainer = new PIXI.Container();
        app.layers.projectiles.addChild(fireContainer);
        let frame = 0;
        const totalFrames = Math.floor(distance / (speed * 1.0));
        screenShake(15, 300);
        const animate = () => {
          frame++;
          const progress = Math.min(1, frame / totalFrames);
          fireContainer.removeChildren();
          // Massive expanding fire cone
          const coneLength = distance * progress;
          const baseWidth = 40;
          const coneWidth = baseWidth + progress * 150;
          // Multiple fire layers with different colors
          const fireColors = [0xfbbf24, 0xf59e0b, 0xef4444, 0xdc2626, 0xffffff];
          for (let layer = 0; layer < 5; layer++) {
            const cone = new PIXI.Graphics();
            cone.beginFill(fireColors[layer], 0.8 - layer * 0.12);
            cone.moveTo(startX, startY);
            const layerWidth = coneWidth - layer * 20;
            const layerLength = coneLength - layer * 10;
            // Wavy edges
            const points = [];
            const waveCount = 8;
            for (let w = 0; w <= waveCount; w++) {
              const t = w / waveCount;
              const wave = Math.sin(w * 2 + frame * 0.2) * (10 + layer * 3);
              const px = startX + dirX * layerLength * t - dirY * (layerWidth * t + wave);
              const py = startY + dirY * layerLength * t + dirX * (layerWidth * t + wave);
              points.push({ x: px, y: py });
            }
            for (let w = waveCount; w >= 0; w--) {
              const t = w / waveCount;
              const wave = Math.sin(w * 2 + frame * 0.2 + Math.PI) * (10 + layer * 3);
              const px = startX + dirX * layerLength * t + dirY * (layerWidth * t + wave);
              const py = startY + dirY * layerLength * t - dirX * (layerWidth * t + wave);
              points.push({ x: px, y: py });
            }
            cone.moveTo(startX, startY);
            points.forEach(p => cone.lineTo(p.x, p.y));
            cone.closePath();
            cone.endFill();
            cone.filters = [new GlowFilter({ distance: 20 - layer * 3, outerStrength: 4 - layer * 0.6, color: fireColors[layer] })];
            fireContainer.addChild(cone);
          }
          // Intense fire particles
          if (frame % 2 === 0) {
            for (let i = 0; i < 5; i++) {
              const fire = new PIXI.Graphics();
              fire.beginFill(fireColors[Math.floor(Math.random() * 5)], 0.9);
              fire.drawCircle(0, 0, 6 + Math.random() * 12);
              fire.endFill();
              const offset = (Math.random() - 0.5) * coneWidth * 1.2;
              fire.x = startX + dirX * coneLength * Math.random() - dirY * offset;
              fire.y = startY + dirY * coneLength * Math.random() + dirX * offset;
              fire.filters = [new GlowFilter({ distance: 12, outerStrength: 2, color: 0xef4444 })];
              app.layers.effects.addChild(fire);
              const animFire = () => {
                fire.y -= 2;
                fire.x += (Math.random() - 0.5) * 3;
                fire.scale.set(fire.scale.x * 0.94);
                fire.alpha -= 0.05;
                if (fire.alpha > 0) requestAnimationFrame(animFire);
                else { app.layers.effects.removeChild(fire); fire.destroy(); }
              };
              animFire();
            }
          }
          // Screen shake during breath
          if (frame % 10 === 0) {
            screenShake(10, 150);
          }
          if (progress >= 1) {
            app.layers.projectiles.removeChild(fireContainer);
            fireContainer.destroy();
            // Massive explosion at target
            screenShake(50, 800);
            screenFlash(0xfbbf24, 200, 0.7);
            freezeFrame(120);
            createFireExplosion(targetX, targetY);
            createFireExplosion(targetX - 40, targetY - 30);
            createFireExplosion(targetX + 40, targetY + 30);
            createShockwave(targetX, targetY, { radius: 250, duration: 500 });
            createImpactEffect();
            return;
          }
          requestAnimationFrame(animate);
        };
        animate();
        break;
      }

      // ===== DEFAULT - Generic orb =====
      default: {
        const container = new PIXI.Container();
        app.layers.projectiles.addChild(container);
        const orb = new PIXI.Graphics();
        orb.beginFill(0xffffff, 1);
        orb.drawCircle(0, 0, size * 0.4);
        orb.endFill();
        orb.beginFill(color, 0.9);
        orb.drawCircle(0, 0, size * 0.7);
        orb.endFill();
        orb.beginFill(color, 0.5);
        orb.drawCircle(0, 0, size);
        orb.endFill();
        orb.filters = [new GlowFilter({ distance: 25, outerStrength: 4, color })];
        container.addChild(orb);
        let posX = startX, posY = startY, frame = 0;
        screenShake(8, 150);
        const animate = () => {
          frame++;
          posX += dirX * speed;
          posY += dirY * speed;
          container.x = posX; container.y = posY;
          orb.scale.set(1 + Math.sin(frame * 0.3) * 0.15);
          if (frame % 2 === 0) {
            const trail = new PIXI.Graphics();
            trail.beginFill(color, 0.7);
            trail.drawCircle(0, 0, size * 0.5);
            trail.endFill();
            trail.x = posX; trail.y = posY;
            trail.filters = [new GlowFilter({ distance: 15, outerStrength: 2, color })];
            app.layers.effects.addChild(trail);
            const animTrail = () => {
              trail.alpha -= 0.08;
              trail.scale.set(trail.scale.x * 0.92);
              if (trail.alpha > 0) requestAnimationFrame(animTrail);
              else { app.layers.effects.removeChild(trail); trail.destroy(); }
            };
            animTrail();
          }
          const dist = Math.sqrt((targetX - posX) ** 2 + (targetY - posY) ** 2);
          if (dist < speed * 2) {
            app.layers.projectiles.removeChild(container);
            container.destroy();
            createImpactEffect();
            return;
          }
          requestAnimationFrame(animate);
        };
        animate();
        break;
      }
    }
  }, [screenShake, screenFlash, freezeFrame, createShockwave, createFireExplosion, createIceExplosion, createDarkExplosion]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    // Screen effects
    screenShake,
    screenFlash,
    freezeFrame,
    // Core effects
    createDynamicSlash,
    createProjectile,
    createParticleBurst,
    createShockwave,
    createLightningBolt,
    createHolyBeam,
    createLaserBeam,
    // Elemental explosions
    createFireExplosion,
    createIceExplosion,
    createLightningExplosion,
    createDarkExplosion,
    createHolyExplosion,
    createEarthExplosion,
    createWindExplosion,
    createWaterExplosion,
    createPoisonExplosion,
    createArcaneExplosion,
    // Specialized effects
    createMeteor,
    createChainLightning,
    createTornado,
    createBlackHole,
    createComboExplosion,
    // Support effects
    createHealEffect,
    createShieldEffect,
    createBuffEffect,
    createDebuffEffect,
    // High-level actions
    playWeaponAttack,
    playAbility,
    playBossAttack,
    createBossProjectile,
    getApp: () => appRef.current,
  }), [screenShake, screenFlash, freezeFrame, createDynamicSlash, createProjectile, createBossProjectile,
      createParticleBurst, createShockwave, createLightningBolt, createHolyBeam,
      createLaserBeam, createFireExplosion, createIceExplosion, createLightningExplosion,
      createDarkExplosion, createHolyExplosion, createEarthExplosion, createWindExplosion,
      createWaterExplosion, createPoisonExplosion, createArcaneExplosion, createMeteor,
      createChainLightning, createTornado, createBlackHole, createComboExplosion,
      createHealEffect, createShieldEffect, createBuffEffect, createDebuffEffect,
      playWeaponAttack, playAbility, playBossAttack]);

  return (
    <div
      ref={containerRef}
      className={`combat-canvas ${className}`}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  );
});

CombatCanvas.displayName = 'CombatCanvas';

export default CombatCanvas;
