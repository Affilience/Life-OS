/**
 * StarfieldBackground - High-performance canvas starfield
 * Creates an immersive cosmic background with parallax stars
 */

import React, { useRef, useEffect, useCallback } from 'react';

const StarfieldBackground = React.memo(function StarfieldBackground({
  speed = 0.5,
  density = 200,
  interactive = true
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dimensionsRef = useRef({ width: 0, height: 0 });

  // Initialize stars
  const initStars = useCallback((width, height) => {
    const stars = [];
    for (let i = 0; i < density; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 3 + 0.5, // Depth for parallax
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.8
          ? `rgba(${139 + Math.random() * 50}, ${92 + Math.random() * 60}, 246, `
          : 'rgba(255, 255, 255, ',
      });
    }
    starsRef.current = stars;
  }, [density]);

  // Animation loop
  const animate = useCallback((ctx, time) => {
    const { width, height } = dimensionsRef.current;

    // Clear with fade effect for trails
    ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
    ctx.fillRect(0, 0, width, height);

    const stars = starsRef.current;
    const mouse = mouseRef.current;

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];

      // Parallax movement based on mouse (if interactive)
      let parallaxX = 0;
      let parallaxY = 0;
      if (interactive && mouse.x && mouse.y) {
        const centerX = width / 2;
        const centerY = height / 2;
        parallaxX = (mouse.x - centerX) * star.z * 0.003;
        parallaxY = (mouse.y - centerY) * star.z * 0.003;
      }

      // Move stars slowly downward (cosmic drift)
      star.y += speed * star.z * 0.3;

      // Wrap stars
      if (star.y > height + 10) {
        star.y = -10;
        star.x = Math.random() * width;
      }

      // Twinkle effect
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
      const finalOpacity = star.opacity * twinkle;

      // Draw star with glow
      const x = star.x + parallaxX;
      const y = star.y + parallaxY;

      // Outer glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 4);
      gradient.addColorStop(0, star.color + (finalOpacity * 0.8) + ')');
      gradient.addColorStop(0.5, star.color + (finalOpacity * 0.2) + ')');
      gradient.addColorStop(1, star.color + '0)');

      ctx.beginPath();
      ctx.arc(x, y, star.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = star.color + finalOpacity + ')';
      ctx.fill();
    }

    // Occasional shooting star
    if (Math.random() < 0.001) {
      drawShootingStar(ctx, width, height);
    }

    animationRef.current = requestAnimationFrame((t) => animate(ctx, t));
  }, [speed, interactive]);

  // Draw shooting star
  const drawShootingStar = (ctx, width, height) => {
    const startX = Math.random() * width;
    const startY = Math.random() * height * 0.3;
    const length = 100 + Math.random() * 100;
    const angle = Math.PI / 4 + Math.random() * 0.5;

    const gradient = ctx.createLinearGradient(
      startX, startY,
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.3, 'rgba(139, 92, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    );
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    dimensionsRef.current = { width: rect.width, height: rect.height };
    initStars(rect.width, rect.height);
  }, [initStars]);

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    handleResize();

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    animationRef.current = requestAnimationFrame((t) => animate(ctx, t));

    window.addEventListener('resize', handleResize);
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [animate, handleResize, handleMouseMove, interactive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
});

export default StarfieldBackground;
