/**
 * Starfield 3D
 *
 * A lightweight 3D starfield that creates depth without heavy performance impact.
 * Uses React Three Fiber with minimal particles for a subtle cosmic effect.
 */

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Floating stars that slowly drift
function Stars({ count = 200, scrollProgress = 0 }) {
  const pointsRef = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute in a large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 5 + Math.random() * 30;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi) - 15; // Push back

      // Color variations (white, purple, blue, pink)
      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        // White
        col[i * 3] = 1;
        col[i * 3 + 1] = 1;
        col[i * 3 + 2] = 1;
      } else if (colorChoice < 0.7) {
        // Purple
        col[i * 3] = 0.659;
        col[i * 3 + 1] = 0.333;
        col[i * 3 + 2] = 0.968;
      } else if (colorChoice < 0.85) {
        // Blue
        col[i * 3] = 0.231;
        col[i * 3 + 1] = 0.510;
        col[i * 3 + 2] = 0.965;
      } else {
        // Pink
        col[i * 3] = 0.925;
        col[i * 3 + 1] = 0.282;
        col[i * 3 + 2] = 0.6;
      }

      // Random sizes
      siz[i] = 0.02 + Math.random() * 0.06;
    }

    return { positions: pos, colors: col, sizes: siz };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    // Very slow rotation
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.005;

    // Move forward based on scroll
    pointsRef.current.position.z = scrollProgress * 5;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Floating cosmic dust particles
function CosmicDust({ count = 50, scrollProgress = 0 }) {
  const pointsRef = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }

    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    // Gentle floating motion
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;

    // Individual particle animation via shader would be better
    // but for simplicity we just rotate the whole group
    const time = state.clock.elapsedTime;
    pointsRef.current.position.y = Math.sin(time * 0.5) * 0.3;
    pointsRef.current.position.z = scrollProgress * 3;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#a855f7"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Nebula glow (sphere for soft glow effect - no visible edges)
function NebulaGlow({ position = [0, 0, -20], color = '#7c3aed' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;

    // Subtle pulsing
    const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    meshRef.current.scale.setScalar(scale * 8);

    // Breathing opacity
    meshRef.current.material.opacity = 0.03 + Math.sin(state.clock.elapsedTime * 0.3) * 0.015;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.03}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// Main scene
function StarfieldScene({ scrollProgress = 0 }) {
  return (
    <>
      <Stars count={150} scrollProgress={scrollProgress} />
      <CosmicDust count={40} scrollProgress={scrollProgress} />
      <NebulaGlow position={[3, 2, -25]} color="#7c3aed" />
      <NebulaGlow position={[-4, -1, -30]} color="#ec4899" />
    </>
  );
}

// Main component
export default function Starfield3D({
  scrollProgress = 0,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`starfield-3d ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]} // Limit pixel ratio for performance
      >
        <Suspense fallback={null}>
          <StarfieldScene scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
