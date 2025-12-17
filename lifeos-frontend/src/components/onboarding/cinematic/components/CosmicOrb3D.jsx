/**
 * Cosmic Orb 3D
 *
 * A beautiful floating 3D orb that serves as a visual centerpiece.
 * Uses React Three Fiber for smooth WebGL rendering.
 *
 * Features:
 * - Glowing core with pulsing animation
 * - Rotating rings (like Saturn)
 * - Particle aura
 * - Mouse/scroll reactivity
 */

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Inner glowing core
function Core({ phase = 0 }) {
  const meshRef = useRef();
  const materialRef = useRef();

  // Phase colors
  const phaseColors = [
    new THREE.Color('#4c1d95'), // dormant
    new THREE.Color('#7c3aed'), // awakening
    new THREE.Color('#a855f7'), // active
    new THREE.Color('#f0abfc'), // transcendent
  ];

  const targetColor = phaseColors[Math.min(phase, 3)];
  const targetScale = 0.5 + phase * 0.15;

  useFrame((state) => {
    if (!meshRef.current) return;

    // Pulsing scale
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
    meshRef.current.scale.setScalar(targetScale * pulse);

    // Slow rotation
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

    // Color lerp
    if (materialRef.current) {
      materialRef.current.color.lerp(targetColor, 0.02);
      materialRef.current.emissive.lerp(targetColor, 0.02);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#7c3aed"
        emissive="#7c3aed"
        emissiveIntensity={0.6}
        roughness={0.1}
        metalness={0.9}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

// Outer glow effect
function Glow({ phase = 0 }) {
  const meshRef = useRef();
  const scale = 1.8 + phase * 0.3;

  useFrame((state) => {
    if (!meshRef.current) return;

    // Breathing glow
    const breath = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    meshRef.current.scale.setScalar(scale * breath);
    meshRef.current.material.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        color="#a855f7"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Orbiting ring (Saturn-like)
function Ring({ radius = 1.5, speed = 1, tilt = 0.3, color = '#ec4899', opacity = 0.4 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z = state.clock.elapsedTime * speed * 0.2;
  });

  return (
    <mesh ref={meshRef} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

// Particle halo around the orb
function ParticleHalo({ count = 50, phase = 0 }) {
  const pointsRef = useRef();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribute in a shell around the orb
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 1.5 + Math.random() * 1;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      // Purple/pink/blue colors
      const colorChoice = Math.random();
      if (colorChoice < 0.4) {
        col[i * 3] = 0.659; col[i * 3 + 1] = 0.333; col[i * 3 + 2] = 0.968;
      } else if (colorChoice < 0.7) {
        col[i * 3] = 0.925; col[i * 3 + 1] = 0.282; col[i * 3 + 2] = 0.6;
      } else {
        col[i * 3] = 0.231; col[i * 3 + 1] = 0.510; col[i * 3 + 2] = 0.965;
      }
    }

    return { positions: pos, colors: col };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    // Slow rotation
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
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
      </bufferGeometry>
      <pointsMaterial
        size={0.04 + phase * 0.01}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// Distorted outer shell (nebula effect)
function NebulaShell({ phase = 0 }) {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.x = state.clock.elapsedTime * 0.05;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;

    if (materialRef.current) {
      materialRef.current.distort = 0.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} scale={2.5 + phase * 0.3}>
      <icosahedronGeometry args={[1, 4]} />
      <MeshDistortMaterial
        ref={materialRef}
        color="#4c1d95"
        transparent
        opacity={0.08}
        distort={0.3}
        speed={1.5}
      />
    </mesh>
  );
}

// Complete orb scene
function OrbScene({ phase = 0, mousePosition = { x: 0, y: 0 } }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;

    // Subtle mouse reactivity
    groupRef.current.rotation.y += (mousePosition.x * 0.5 - groupRef.current.rotation.y) * 0.02;
    groupRef.current.rotation.x += (mousePosition.y * 0.3 - groupRef.current.rotation.x) * 0.02;
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Core */}
        <Core phase={phase} />

        {/* Glow */}
        <Glow phase={phase} />

        {/* Rings */}
        <Ring radius={1.4} speed={1} tilt={0.5} color="#a855f7" opacity={0.3} />
        <Ring radius={1.7} speed={-0.7} tilt={0.8} color="#ec4899" opacity={0.25} />
        <Ring radius={2.0} speed={0.5} tilt={1.2} color="#3b82f6" opacity={0.2} />

        {/* Particle halo */}
        <ParticleHalo count={60} phase={phase} />

        {/* Nebula shell */}
        <NebulaShell phase={phase} />
      </group>
    </Float>
  );
}

// Loading placeholder
function LoadingFallback() {
  return null;
}

// Main component
export default function CosmicOrb3D({
  phase = 0,
  size = 280,
  className = '',
  style = {},
}) {
  const containerRef = useRef();
  const mousePosition = useRef({ x: 0, y: 0 });

  // Track mouse position for interactivity
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    mousePosition.current = { x, y };
  };

  return (
    <div
      ref={containerRef}
      className={`cosmic-orb-container ${className}`}
      style={{
        width: size,
        height: size,
        ...style,
      }}
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.6} color="#a855f7" />
        <pointLight position={[-5, -5, 5]} intensity={0.4} color="#ec4899" />
        <pointLight position={[0, 0, -5]} intensity={0.3} color="#3b82f6" />

        <Suspense fallback={<LoadingFallback />}>
          <OrbScene phase={phase} mousePosition={mousePosition.current} />
        </Suspense>
      </Canvas>

      <style>{`
        .cosmic-orb-container {
          position: relative;
          pointer-events: auto;
        }

        .cosmic-orb-container canvas {
          display: block;
        }
      `}</style>
    </div>
  );
}
