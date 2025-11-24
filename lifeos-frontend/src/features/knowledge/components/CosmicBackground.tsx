import React, { useEffect, useRef } from 'react';

interface CosmicBackgroundProps {
  className?: string;
}

/**
 * Procedural cosmic background with nebulas, stars, and dust
 * Inspired by real astronomical photography
 */
export function CosmicBackground({ className = '' }: CosmicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawCosmos();
    };

    const drawCosmos = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Deep space black background
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
      gradient.addColorStop(0, '#0a0e1a');
      gradient.addColorStop(0.5, '#050810');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw distant background stars
      drawBackgroundStars(ctx, width, height, 800);

      // Draw multiple nebula clouds
      drawNebula(ctx, width * 0.2, height * 0.3, 400, '#8b5cf6', 0.08);
      drawNebula(ctx, width * 0.7, height * 0.2, 350, '#ec4899', 0.06);
      drawNebula(ctx, width * 0.5, height * 0.7, 500, '#3b82f6', 0.07);
      drawNebula(ctx, width * 0.85, height * 0.6, 300, '#a78bfa', 0.05);
      drawNebula(ctx, width * 0.15, height * 0.8, 380, '#f472b6', 0.06);

      // Draw interstellar dust lanes
      drawDustLanes(ctx, width, height);

      // Draw star clusters
      drawStarCluster(ctx, width * 0.3, height * 0.4, 100, 50);
      drawStarCluster(ctx, width * 0.75, height * 0.65, 80, 40);
    };

    /**
     * Draw tiny background stars across the entire canvas
     */
    const drawBackgroundStars = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      count: number
    ) => {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5;
        const brightness = Math.random();

        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Add subtle glow to brighter stars
        if (brightness > 0.7) {
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.2})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    /**
     * Draw a procedural nebula cloud
     */
    const drawNebula = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      color: string,
      opacity: number
    ) => {
      // Convert hex color to RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      // Create multiple overlapping circles for organic cloud effect
      const numClouds = 8;
      for (let i = 0; i < numClouds; i++) {
        const offsetX = (Math.random() - 0.5) * radius * 0.8;
        const offsetY = (Math.random() - 0.5) * radius * 0.8;
        const cloudRadius = radius * (0.5 + Math.random() * 0.7);

        const gradient = ctx.createRadialGradient(
          x + offsetX, y + offsetY, 0,
          x + offsetX, y + offsetY, cloudRadius
        );

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`);
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${opacity * 0.4})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${opacity * 0.15})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(
          x + offsetX - cloudRadius,
          y + offsetY - cloudRadius,
          cloudRadius * 2,
          cloudRadius * 2
        );
      }

      // Add brighter core
      const coreGradient = ctx.createRadialGradient(
        x, y, 0,
        x, y, radius * 0.3
      );
      coreGradient.addColorStop(0, `rgba(${r + 50}, ${g + 50}, ${b + 50}, ${opacity * 1.2})`);
      coreGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${opacity * 0.6})`);
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGradient;
      ctx.fillRect(x - radius * 0.3, y - radius * 0.3, radius * 0.6, radius * 0.6);
    };

    /**
     * Draw dark dust lanes across the canvas
     */
    const drawDustLanes = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ) => {
      ctx.globalCompositeOperation = 'multiply';

      for (let i = 0; i < 5; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        const endX = Math.random() * width;
        const endY = Math.random() * height;

        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 100 + Math.random() * 100;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(
          (startX + endX) / 2 + (Math.random() - 0.5) * 200,
          (startY + endY) / 2 + (Math.random() - 0.5) * 200,
          endX,
          endY
        );
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    /**
     * Draw a cluster of stars
     */
    const drawStarCluster = (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      count: number
    ) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        const size = Math.random() * 2 + 0.5;
        const brightness = 0.6 + Math.random() * 0.4;

        // Star core
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
        ctx.fill();
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
      className={`fixed inset-0 ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
