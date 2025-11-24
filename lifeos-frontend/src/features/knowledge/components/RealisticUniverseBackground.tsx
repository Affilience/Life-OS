import React, { useEffect, useRef } from 'react';

/**
 * Realistic astronomical background mimicking real night sky
 * Features: Milky Way band, varied star density, subtle nebulae
 * Based on real astronomical observations
 */
export function RealisticUniverseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawRealisticUniverse();
    };

    const drawRealisticUniverse = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Pure black space
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw Milky Way band first (subtle grey band across sky)
      drawMilkyWay(ctx, width, height);

      // Draw stars with realistic density distribution
      drawRealisticStarField(ctx, width, height);

      // Emission nebulae with realistic astrophotography colors
      ctx.globalCompositeOperation = 'lighter';
      // Red H-alpha emission nebula (like Orion, Eagle nebula)
      drawEmissionNebula(ctx, width * 0.3, height * 0.25, 500, 'red');
      // Teal OIII planetary nebula (like Ring nebula)
      drawEmissionNebula(ctx, width * 0.7, height * 0.65, 400, 'teal');
      // Pink/magenta mixed emission region
      drawEmissionNebula(ctx, width * 0.5, height * 0.8, 450, 'magenta');
      // Additional red emission region
      drawEmissionNebula(ctx, width * 0.85, height * 0.4, 350, 'red');
      ctx.globalCompositeOperation = 'source-over';

      // Draw knowledge planets - bright celestial bodies for major categories
      drawKnowledgePlanets(ctx, width, height);
    };

    /**
     * Draw Milky Way band - the characteristic bright band of our galaxy
     * In reality, this is millions of stars too faint to see individually
     */
    const drawMilkyWay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Create extremely subtle diagonal band across the sky
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.3, 'rgba(160, 165, 170, 0.015)'); // Much more subtle
      gradient.addColorStop(0.5, 'rgba(170, 175, 180, 0.025)'); // Barely visible
      gradient.addColorStop(0.7, 'rgba(160, 165, 170, 0.015)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-0.3); // Slight diagonal

      ctx.fillStyle = gradient;
      ctx.fillRect(-width, -height * 0.2, width * 2, height * 0.4);

      // Add subtle texture with much fewer, fainter stars
      for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * width * 2;
        const y = (Math.random() - 0.5) * height * 0.4;
        const brightness = Math.random();

        if (brightness > 0.85) { // Much higher threshold
          // Yellow/orange stars like real Milky Way
          const yellowTint = 200 + Math.floor(Math.random() * 55);
          ctx.fillStyle = `rgba(${yellowTint}, ${yellowTint - 20}, 180, ${brightness * 0.08})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      ctx.restore();
    };

    /**
     * Draw realistic star field with varied brightness and density
     * Stars concentrated near Milky Way, sparse elsewhere
     */
    const drawRealisticStarField = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ) => {
      // Calculate distance from Milky Way band for density
      const getMilkyWayDistance = (x: number, y: number) => {
        // Distance from diagonal band
        const cx = width / 2;
        const cy = height / 2;
        const angle = -0.3;
        const rotatedY = (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle);
        return Math.abs(rotatedY) / (height * 0.2);
      };

      // Draw different magnitude stars - dramatic brightness variation
      // Mag 1 stars are 100x brighter than mag 6 stars
      drawStarMagnitude(ctx, width, height, 50, 3, 5, 1.0, getMilkyWayDistance); // Magnitude 1-2: Very bright
      drawStarMagnitude(ctx, width, height, 120, 2, 3, 0.6, getMilkyWayDistance); // Magnitude 3: Bright
      drawStarMagnitude(ctx, width, height, 300, 1.2, 2, 0.35, getMilkyWayDistance); // Magnitude 4: Medium
      drawStarMagnitude(ctx, width, height, 500, 0.8, 1.2, 0.2, getMilkyWayDistance); // Magnitude 5: Dim
      drawStarMagnitude(ctx, width, height, 800, 0.5, 0.8, 0.1, getMilkyWayDistance); // Magnitude 6: Faint
    };

    /**
     * Draw stars of a specific magnitude
     */
    const drawStarMagnitude = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      baseCount: number,
      minSize: number,
      maxSize: number,
      baseOpacity: number,
      getMilkyWayDistance: (x: number, y: number) => number
    ) => {
      for (let i = 0; i < baseCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;

        // Higher density near Milky Way
        const milkyWayDist = getMilkyWayDistance(x, y);
        const densityFactor = 1 - Math.min(milkyWayDist, 1) * 0.7;

        if (Math.random() > densityFactor) continue;

        const size = minSize + Math.random() * (maxSize - minSize);
        const opacity = baseOpacity * (0.7 + Math.random() * 0.3);

        // Realistic star colors: mostly yellow/orange/red, very few blue (<1%)
        const colorRoll = Math.random();
        let r, g, b;

        if (colorRoll < 0.01) {
          // 1% blue stars (hot, young stars)
          r = 200 + Math.floor(Math.random() * 55);
          g = 210 + Math.floor(Math.random() * 45);
          b = 255;
        } else if (colorRoll < 0.35) {
          // 34% yellow-white stars (like our Sun)
          r = 255;
          g = 250 + Math.floor(Math.random() * 5);
          b = 200 + Math.floor(Math.random() * 40);
        } else if (colorRoll < 0.70) {
          // 35% orange stars (cooler than Sun)
          r = 255;
          g = 200 + Math.floor(Math.random() * 40);
          b = 150 + Math.floor(Math.random() * 30);
        } else {
          // 30% red stars (coolest, most common)
          r = 255;
          g = 180 + Math.floor(Math.random() * 30);
          b = 140 + Math.floor(Math.random() * 20);
        }

        // Star core
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow for brighter stars
        if (size > 1.5) {
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.2})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    /**
     * Draw emission nebula with realistic astrophotography colors
     * Red = H-alpha emission (hydrogen), Teal = OIII (oxygen), Magenta = mixed
     */
    const drawEmissionNebula = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      type: 'red' | 'teal' | 'magenta'
    ) => {
      // Define colors based on real emission line wavelengths
      const colors = {
        red: { r: 220, g: 50, b: 80 },      // H-alpha (656.3nm) - deep red
        teal: { r: 50, g: 180, b: 180 },    // OIII (495.9nm, 500.7nm) - teal/cyan
        magenta: { r: 200, g: 80, b: 150 }  // Mixed H-alpha + H-beta
      };

      const color = colors[type];
      const baseOpacity = 0.04; // More visible than before

      // Create wispy, cloud-like structure
      const numClouds = 12;
      for (let i = 0; i < numClouds; i++) {
        const angle = (i / numClouds) * Math.PI * 2 + Math.random() * 0.5;
        const distance = Math.random() * radius * 0.6;
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;
        const cloudRadius = radius * (0.3 + Math.random() * 0.4);
        const cloudOpacity = baseOpacity * (0.6 + Math.random() * 0.4);

        const gradient = ctx.createRadialGradient(
          x + offsetX, y + offsetY, 0,
          x + offsetX, y + offsetY, cloudRadius
        );

        // Realistic emission nebula gradient
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${cloudOpacity})`);
        gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${cloudOpacity * 0.6})`);
        gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${cloudOpacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, cloudRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add some dark dust lanes (silhouettes)
      if (Math.random() > 0.5) {
        const numDustLanes = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numDustLanes; i++) {
          const angle = Math.random() * Math.PI * 2;
          const offsetX = (Math.random() - 0.5) * radius * 0.4;
          const offsetY = (Math.random() - 0.5) * radius * 0.4;
          const dustWidth = radius * 0.15;
          const dustLength = radius * 0.6;

          ctx.save();
          ctx.translate(x + offsetX, y + offsetY);
          ctx.rotate(angle);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(-dustLength / 2, -dustWidth / 2, dustLength, dustWidth);
          ctx.restore();
        }
      }
    };

    /**
     * Draw knowledge planets - subtle celestial bodies like real planet observations
     * Much more muted and realistic than cartoon-style planets
     */
    const drawKnowledgePlanets = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ) => {
      // Planet definitions - very large and dominant
      const planets = [
        { x: width * 0.15, y: height * 0.2, radius: 55, color: '#b87060', name: 'YouTube' },
        { x: width * 0.75, y: height * 0.3, radius: 60, color: '#708db8', name: 'Books' },
        { x: width * 0.25, y: height * 0.7, radius: 50, color: '#70b88a', name: 'Notes' },
        { x: width * 0.85, y: height * 0.75, radius: 52, color: '#b89070', name: 'Folders' },
      ];

      planets.forEach((planet) => {
        // Very subtle outer glow (much less visible)
        const outerGlow = ctx.createRadialGradient(
          planet.x, planet.y, 0,
          planet.x, planet.y, planet.radius * 2.5
        );
        outerGlow.addColorStop(0, `${planet.color}25`);
        outerGlow.addColorStop(0.5, `${planet.color}10`);
        outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Planet body - much more subtle
        const planetGradient = ctx.createRadialGradient(
          planet.x - planet.radius * 0.3,
          planet.y - planet.radius * 0.3,
          planet.radius * 0.1,
          planet.x,
          planet.y,
          planet.radius
        );
        planetGradient.addColorStop(0, `${planet.color}cc`);
        planetGradient.addColorStop(0.7, `${planet.color}99`);
        planetGradient.addColorStop(1, `${planet.color}66`);

        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle highlight (not bright white core)
        const coreGradient = ctx.createRadialGradient(
          planet.x - planet.radius * 0.3,
          planet.y - planet.radius * 0.3,
          0,
          planet.x - planet.radius * 0.3,
          planet.y - planet.radius * 0.3,
          planet.radius * 0.5
        );
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(
          planet.x - planet.radius * 0.3,
          planet.y - planet.radius * 0.3,
          planet.radius * 0.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
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
