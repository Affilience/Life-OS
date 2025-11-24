import React, { useEffect, useRef } from 'react';

/**
 * Highly impressive cosmic background with layered nebulas, star fields, and atmospheric effects
 * Uses multiple canvas layers and blend modes for photorealistic space
 */
export function ImprovedCosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawImprovedCosmos();
    };

    const drawImprovedCosmos = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Deep black space base
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Multiple layered nebula clouds for depth
      ctx.globalCompositeOperation = 'lighter';

      // Large purple nebula (top-left) - MUCH more subtle
      drawLayeredNebula(ctx, width * 0.25, height * 0.25, 600, [
        { color: '#6366f1', opacity: 0.04 },
        { color: '#8b5cf6', opacity: 0.03 },
        { color: '#a78bfa', opacity: 0.02 }
      ]);

      // Pink nebula (bottom-right) - more subtle
      drawLayeredNebula(ctx, width * 0.75, height * 0.7, 550, [
        { color: '#ec4899', opacity: 0.035 },
        { color: '#f472b6', opacity: 0.025 },
        { color: '#fb923c', opacity: 0.02 }
      ]);

      // Blue nebula (center-right) - very subtle
      drawLayeredNebula(ctx, width * 0.8, height * 0.4, 500, [
        { color: '#3b82f6', opacity: 0.03 },
        { color: '#60a5fa', opacity: 0.02 },
        { color: '#93c5fd', opacity: 0.015 }
      ]);

      // Cyan accent (left-center) - barely visible
      drawLayeredNebula(ctx, width * 0.15, height * 0.6, 450, [
        { color: '#06b6d4', opacity: 0.025 },
        { color: '#22d3ee', opacity: 0.015 }
      ]);

      // Massive central nebula glow - very faint
      drawLayeredNebula(ctx, width * 0.5, height * 0.5, 800, [
        { color: '#7c3aed', opacity: 0.02 },
        { color: '#a855f7', opacity: 0.015 },
        { color: '#d946ef', opacity: 0.01 }
      ]);

      ctx.globalCompositeOperation = 'source-over';

      // Sparser star fields for more black space
      drawDenseStarField(ctx, width, height, 800, 0.2, 1.2);  // Distant stars (less bright)
      drawDenseStarField(ctx, width, height, 300, 0.4, 2.0);  // Mid-range stars
      drawDenseStarField(ctx, width, height, 150, 0.6, 2.5);  // Nearby stars

      // Fewer bright stars
      drawBrightStars(ctx, width, height, 20);

      // Subtle dust lanes
      ctx.globalCompositeOperation = 'multiply';
      drawAtmosphericDust(ctx, width, height);
      ctx.globalCompositeOperation = 'source-over';
    };

    /**
     * Draw layered nebula for realistic cloudy appearance
     */
    const drawLayeredNebula = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      layers: Array<{ color: string; opacity: number }>
    ) => {
      layers.forEach((layer, index) => {
        const numClouds = 12 + index * 3;
        const r = parseInt(layer.color.slice(1, 3), 16);
        const g = parseInt(layer.color.slice(3, 5), 16);
        const b = parseInt(layer.color.slice(5, 7), 16);

        for (let i = 0; i < numClouds; i++) {
          const angle = (i / numClouds) * Math.PI * 2 + index;
          const dist = (Math.random() * 0.6 + 0.2) * radius;
          const cx = x + Math.cos(angle) * dist;
          const cy = y + Math.sin(angle) * dist;
          const cloudRadius = radius * (0.3 + Math.random() * 0.4);

          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cloudRadius);
          gradient.addColorStop(0, `rgba(${r + 40}, ${g + 40}, ${b + 40}, ${layer.opacity})`);
          gradient.addColorStop(0.3, `rgba(${r + 20}, ${g + 20}, ${b + 20}, ${layer.opacity * 0.7})`);
          gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${layer.opacity * 0.4})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(cx, cy, cloudRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    /**
     * Draw a dense field of tiny stars
     */
    const drawDenseStarField = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      count: number,
      minOpacity: number,
      maxSize: number
    ) => {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * maxSize;
        const opacity = minOpacity + Math.random() * (1 - minOpacity);

        // Main star point
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Slight glow for larger stars
        if (size > 1.5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    /**
     * Draw bright stars with cross-flare effect (like lens flare)
     */
    const drawBrightStars = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      count: number
    ) => {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const brightness = 0.5 + Math.random() * 0.5;
        const size = 2 + Math.random() * 3;

        // Core
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 6);
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.4})`);
        glowGradient.addColorStop(0.5, `rgba(200, 220, 255, ${brightness * 0.2})`);
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 6, 0, Math.PI * 2);
        ctx.fill();

        // Cross flare
        ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - size * 4, y);
        ctx.lineTo(x + size * 4, y);
        ctx.moveTo(x, y - size * 4);
        ctx.lineTo(x, y + size * 4);
        ctx.stroke();
      }
    };

    /**
     * Draw subtle atmospheric dust
     */
    const drawAtmosphericDust = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ) => {
      for (let i = 0; i < 8; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const x2 = Math.random() * width;
        const y2 = Math.random() * height;

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 80 + Math.random() * 120;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(
          (x1 + x2) / 2 + (Math.random() - 0.5) * 300,
          (y1 + y2) / 2 + (Math.random() - 0.5) * 300,
          x2,
          y2
        );
        ctx.stroke();
      }
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 0 }}
    />
  );
}
