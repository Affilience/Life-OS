/**
 * Evolving Cosmic Background
 *
 * Background that evolves from pure black to a full cosmos as you scroll.
 *
 * Progression:
 * - 0%: Pure black, no stars
 * - 15%: First faint stars appear
 * - 30%: More stars, hint of purple nebula
 * - 50%: Stars increase, nebula colors grow
 * - 70%: Full nebula, star clusters
 * - 85%+: Complete cosmos with all effects
 *
 * Performance target: 60fps with progressive particle count
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';

// Star particle class
class Star {
  constructor(canvas, intensity = 1) {
    this.canvas = canvas;
    this.intensity = intensity;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.size = 0.5 + Math.random() * 2;
    this.baseOpacity = 0.2 + Math.random() * 0.6;
    this.twinkleSpeed = 0.5 + Math.random() * 2;
    this.twinkleOffset = Math.random() * Math.PI * 2;

    // Color - mostly white with occasional colored stars
    const colorChance = Math.random();
    if (colorChance > 0.9) {
      this.color = { r: 139, g: 92, b: 246 }; // Purple
    } else if (colorChance > 0.8) {
      this.color = { r: 236, g: 72, b: 153 }; // Pink
    } else if (colorChance > 0.7) {
      this.color = { r: 59, g: 130, b: 246 }; // Blue
    } else {
      this.color = { r: 255, g: 255, b: 255 }; // White
    }
  }

  update(time, visibilityFactor) {
    // Twinkle effect
    const twinkle = 0.5 + 0.5 * Math.sin(time * this.twinkleSpeed + this.twinkleOffset);
    this.currentOpacity = this.baseOpacity * twinkle * visibilityFactor * this.intensity;
  }

  draw(ctx) {
    if (this.currentOpacity < 0.01) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity})`;
    ctx.fill();

    // Add glow for brighter stars
    if (this.currentOpacity > 0.4 && this.size > 1) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity * 0.2})`;
      ctx.fill();
    }
  }
}

// Shooting star class
class ShootingStar {
  constructor(canvas) {
    this.canvas = canvas;
    this.active = false;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width * 0.8;
    this.y = Math.random() * this.canvas.height * 0.3;
    this.length = 50 + Math.random() * 100;
    this.speed = 8 + Math.random() * 8;
    this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
    this.opacity = 0;
    this.progress = 0;
    this.active = true;
  }

  update() {
    if (!this.active) return;

    this.progress += this.speed;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Fade in then out
    if (this.progress < 30) {
      this.opacity = this.progress / 30;
    } else if (this.progress > this.length - 30) {
      this.opacity = (this.length - this.progress) / 30;
    } else {
      this.opacity = 1;
    }

    if (this.progress > this.length || this.x > this.canvas.width || this.y > this.canvas.height) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active || this.opacity < 0.01) return;

    const tailLength = 40;
    const gradient = ctx.createLinearGradient(
      this.x, this.y,
      this.x - Math.cos(this.angle) * tailLength,
      this.y - Math.sin(this.angle) * tailLength
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x - Math.cos(this.angle) * tailLength,
      this.y - Math.sin(this.angle) * tailLength
    );
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export default function MinimalBackground({
  scrollProgress = 0,
  phase = 0,
}) {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const lastShootingStarRef = useRef(0);

  // Calculate cosmos intensity based on scroll
  const cosmosIntensity = useMemo(() => {
    // Eased progression - slow start, then accelerates
    const eased = scrollProgress * scrollProgress;
    return Math.min(1, eased * 1.5);
  }, [scrollProgress]);

  // Initialize stars
  const initStars = useCallback((canvas) => {
    starsRef.current = [];
    // More stars = fuller cosmos
    const maxStars = 200;

    for (let i = 0; i < maxStars; i++) {
      // Stars are created with varying intensity thresholds
      const intensityThreshold = i / maxStars;
      starsRef.current.push(new Star(canvas, 1 - intensityThreshold * 0.5));
    }

    // Initialize shooting stars pool
    shootingStarsRef.current = [];
    for (let i = 0; i < 3; i++) {
      shootingStarsRef.current.push(new ShootingStar(canvas));
      shootingStarsRef.current[i].active = false;
    }
  }, []);

  // Animation loop
  const animate = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const time = timestamp * 0.001;

    // Frame limiting
    const deltaTime = timestamp - lastTimeRef.current;
    if (deltaTime < 33) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastTimeRef.current = timestamp;

    // Get current cosmos intensity (from closure)
    const intensity = cosmosIntensity;

    // Clear canvas - darker when less scrolled
    const bgDarkness = Math.max(0, 1 - intensity * 0.3);
    ctx.fillStyle = `rgba(3, 0, ${Math.floor(20 * intensity)}, ${0.1 + bgDarkness * 0.2})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars based on intensity
    const visibleStars = Math.floor(starsRef.current.length * intensity);
    for (let i = 0; i < visibleStars; i++) {
      const star = starsRef.current[i];
      // Stars further in the array fade in more slowly
      const starFadeFactor = i < visibleStars * 0.5 ? 1 :
        (visibleStars - i) / (visibleStars * 0.5);
      star.update(time, intensity * starFadeFactor);
      star.draw(ctx);
    }

    // Shooting stars only when cosmos is developed (50%+)
    if (intensity > 0.5) {
      // Spawn shooting stars occasionally
      if (timestamp - lastShootingStarRef.current > 3000 + Math.random() * 5000) {
        const inactiveStar = shootingStarsRef.current.find(s => !s.active);
        if (inactiveStar) {
          inactiveStar.reset();
          lastShootingStarRef.current = timestamp;
        }
      }

      // Update and draw shooting stars
      shootingStarsRef.current.forEach(star => {
        star.update();
        star.draw(ctx);
      });
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [cosmosIntensity]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, initStars]);

  // Calculate CSS-based effects based on scroll
  const nebulaOpacity = Math.max(0, (cosmosIntensity - 0.2) * 1.25);
  const glowOpacity = Math.max(0, (cosmosIntensity - 0.3) * 1.4);
  const secondaryGlowOpacity = Math.max(0, (cosmosIntensity - 0.5) * 2);
  const vignetteOpacity = 0.6 - cosmosIntensity * 0.3;

  return (
    <div className="cosmic-background">
      {/* Base - pure black that fades to deep space */}
      <div
        className="cosmic-bg-base"
        style={{
          background: `linear-gradient(180deg,
            rgb(${Math.floor(3 + cosmosIntensity * 7)}, 0, ${Math.floor(cosmosIntensity * 20)}) 0%,
            rgb(${Math.floor(cosmosIntensity * 10)}, ${Math.floor(cosmosIntensity * 5)}, ${Math.floor(cosmosIntensity * 32)}) 50%,
            rgb(${Math.floor(cosmosIntensity * 10)}, ${Math.floor(cosmosIntensity * 5)}, ${Math.floor(cosmosIntensity * 20)}) 100%
          )`,
        }}
      />

      {/* Canvas for stars */}
      <canvas ref={canvasRef} className="cosmic-bg-canvas" />

      {/* Nebula layers - fade in as cosmos develops */}
      <div
        className="cosmic-nebula nebula-1"
        style={{ opacity: nebulaOpacity * 0.4 }}
      />
      <div
        className="cosmic-nebula nebula-2"
        style={{ opacity: nebulaOpacity * 0.3 }}
      />

      {/* Primary glow - purple */}
      <div
        className="cosmic-glow glow-primary"
        style={{ opacity: glowOpacity * 0.25 }}
      />

      {/* Secondary glow - pink */}
      <div
        className="cosmic-glow glow-secondary"
        style={{ opacity: secondaryGlowOpacity * 0.2 }}
      />

      {/* Tertiary glow - blue (only at high intensity) */}
      {cosmosIntensity > 0.7 && (
        <div
          className="cosmic-glow glow-tertiary"
          style={{ opacity: (cosmosIntensity - 0.7) * 0.5 }}
        />
      )}

      {/* Vignette - stronger when cosmos is less developed */}
      <div
        className="cosmic-vignette"
        style={{ opacity: vignetteOpacity }}
      />

      <style>{`
        .cosmic-background {
          position: fixed;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          background: #000;
        }

        .cosmic-bg-base {
          position: absolute;
          inset: 0;
          transition: background 0.5s ease;
        }

        .cosmic-bg-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        /* Nebula clouds */
        .cosmic-nebula {
          position: absolute;
          inset: 0;
          pointer-events: none;
          transition: opacity 0.8s ease;
        }

        .nebula-1 {
          background: radial-gradient(
            ellipse 80% 60% at 30% 40%,
            rgba(139, 92, 246, 0.15) 0%,
            rgba(139, 92, 246, 0.05) 40%,
            transparent 70%
          );
        }

        .nebula-2 {
          background: radial-gradient(
            ellipse 70% 50% at 70% 60%,
            rgba(236, 72, 153, 0.1) 0%,
            rgba(236, 72, 153, 0.03) 40%,
            transparent 70%
          );
        }

        /* Glow effects */
        .cosmic-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          transition: opacity 0.8s ease;
        }

        .glow-primary {
          left: 20%;
          top: 20%;
          width: 600px;
          height: 400px;
          background: radial-gradient(
            ellipse at center,
            rgba(139, 92, 246, 0.4) 0%,
            rgba(139, 92, 246, 0.1) 50%,
            transparent 80%
          );
        }

        .glow-secondary {
          right: 10%;
          top: 50%;
          width: 500px;
          height: 350px;
          background: radial-gradient(
            ellipse at center,
            rgba(236, 72, 153, 0.3) 0%,
            rgba(236, 72, 153, 0.08) 50%,
            transparent 80%
          );
        }

        .glow-tertiary {
          left: 40%;
          bottom: 10%;
          width: 400px;
          height: 300px;
          background: radial-gradient(
            ellipse at center,
            rgba(59, 130, 246, 0.25) 0%,
            rgba(59, 130, 246, 0.05) 50%,
            transparent 80%
          );
        }

        /* Vignette - darker edges */
        .cosmic-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 40%,
            rgba(0, 0, 0, 0.7) 100%
          );
          pointer-events: none;
          transition: opacity 0.5s ease;
        }
      `}</style>
    </div>
  );
}
