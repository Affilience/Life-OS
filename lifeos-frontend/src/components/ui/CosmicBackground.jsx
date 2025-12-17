/**
 * Cosmic Background Component
 * Enhanced with subtle star particles and improved cosmic gradients
 * Research-based: 3-5% opacity gradients, minimal distraction
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CosmicBackground({ variant = 'default', className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create subtle stars
    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    let animationFrame;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const opacity = star.opacity + twinkle * 0.15;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const variants = {
    // Default - Purple/Pink/Blue cosmic gradients
    default: (
      <>
        <motion.div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.10] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #a855f7 0%, #ec4899 40%, transparent 70%)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, #8b5cf6 40%, transparent 70%)',
          }}
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 20, -30, 0],
            scale: [1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 25, -15, 0],
            y: [0, -15, 25, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </>
    ),

    // Purple - Purple/Violet cosmic gradient
    purple: (
      <>
        <motion.div
          className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.10] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, #a855f7 50%, transparent 70%)',
          }}
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -20, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #f59e0b 0%, #fb923c 50%, transparent 70%)',
          }}
          animate={{
            x: [0, -15, 15, 0],
            y: [0, 15, -15, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </>
    ),

    // Pink - Pink/Purple cosmic gradient
    pink: (
      <>
        <motion.div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.10] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #ec4899 0%, #f472b6 50%, transparent 70%)',
          }}
          animate={{
            x: [0, 25, -15, 0],
            y: [0, -15, 25, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, #a855f7 50%, transparent 70%)',
          }}
          animate={{
            x: [0, -20, 20, 0],
            y: [0, 20, -20, 0],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </>
    ),

    // Blue - Blue/Cyan cosmic gradient
    blue: (
      <>
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.10] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, #60a5fa 50%, transparent 70%)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #06b6d4 0%, #22d3ee 50%, transparent 70%)',
          }}
          animate={{
            x: [0, -25, 15, 0],
            y: [0, 15, -25, 0],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </>
    ),

    // None - No background (for minimal pages)
    none: null,
  };

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 ${className}`}>
      {/* Animated star particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Cosmic gradients */}
      {variants[variant]}
    </div>
  );
}
