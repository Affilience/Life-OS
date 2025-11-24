import React, { useEffect, useRef } from 'react';
import type { LevelData } from '../../types/level.types';

interface CanvasRendererProps {
  width: number;
  height: number;
  renderer: (ctx: CanvasRenderingContext2D, time: number, levelData: LevelData) => void;
  levelData: LevelData;
  className?: string;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  width,
  height,
  renderer,
  levelData,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // FPS limiting (target 60 FPS, minimum frame time ~16.67ms)
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;

    // Animation loop with FPS limiting
    const animate = (currentTimestamp: number) => {
      const elapsed = currentTimestamp - lastFrameTimeRef.current;

      // Only render if enough time has passed
      if (elapsed >= frameTime) {
        lastFrameTimeRef.current = currentTimestamp - (elapsed % frameTime);
        const currentTime = (Date.now() - startTimeRef.current) / 1000; // Convert to seconds
        renderer(ctx, currentTime, levelData);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, renderer, levelData]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    />
  );
};
