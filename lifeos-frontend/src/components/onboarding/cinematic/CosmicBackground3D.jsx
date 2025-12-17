/**
 * Cosmic Background 3D
 *
 * Immersive Three.js starfield and nebula background that responds to scroll.
 * Creates a sense of traveling through space as user progresses through onboarding.
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Floating nebula clouds
function NebulaClouds({ scrollProgress = 0 }) {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.02;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      meshRef.current.position.z = -5 + scrollProgress * 10;
    }
    if (materialRef.current) {
      materialRef.current.distort = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, -5]} scale={3}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          ref={materialRef}
          color="#4c1d95"
          transparent
          opacity={0.15}
          distort={0.3}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

// Animated particle field that reacts to scroll
function ParticleField({ count = 2000, scrollProgress = 0 }) {
  const points = useRef();

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribute in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 5 + Math.random() * 20;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Color gradient from purple to pink to blue
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        // Purple
        colors[i * 3] = 0.545;
        colors[i * 3 + 1] = 0.361;
        colors[i * 3 + 2] = 0.965;
      } else if (colorChoice < 0.66) {
        // Pink
        colors[i * 3] = 0.925;
        colors[i * 3 + 1] = 0.282;
        colors[i * 3 + 2] = 0.6;
      } else {
        // Blue
        colors[i * 3] = 0.231;
        colors[i * 3 + 1] = 0.510;
        colors[i * 3 + 2] = 0.965;
      }
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x = scrollProgress * 0.5;

      // Move forward through the field as user scrolls
      points.current.position.z = scrollProgress * 15;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.positions.length / 3}
          array={particlesPosition.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesPosition.colors.length / 3}
          array={particlesPosition.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Central glowing orb (represents the user's journey)
function CentralOrb({ scrollProgress = 0, phase = 0 }) {
  const meshRef = useRef();
  const glowRef = useRef();

  // Phase determines the orb's appearance
  // 0: dormant (small, dim)
  // 1: awakening (growing, glowing)
  // 2: active (pulsing, bright)
  // 3: transcendent (large, radiant)

  const targetScale = useMemo(() => {
    if (phase === 0) return 0.3;
    if (phase === 1) return 0.6;
    if (phase === 2) return 0.9;
    return 1.2;
  }, [phase]);

  const targetColor = useMemo(() => {
    if (phase === 0) return new THREE.Color('#4c1d95');
    if (phase === 1) return new THREE.Color('#7c3aed');
    if (phase === 2) return new THREE.Color('#a855f7');
    return new THREE.Color('#f0abfc');
  }, [phase]);

  useFrame((state) => {
    if (meshRef.current) {
      // Smooth scale transition
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.05
      );

      // Pulsing effect
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.multiplyScalar(pulse);

      // Color transition
      meshRef.current.material.color.lerp(targetColor, 0.02);
      meshRef.current.material.emissive.lerp(targetColor, 0.02);
    }

    if (glowRef.current) {
      glowRef.current.scale.copy(meshRef.current.scale).multiplyScalar(2);
      glowRef.current.material.opacity = 0.1 + phase * 0.05;
    }
  });

  return (
    <group position={[0, 0, 2]}>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Core orb */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

// Shooting stars that appear randomly
function ShootingStars({ active = true }) {
  const starsRef = useRef([]);
  const groupRef = useRef();

  useFrame((state) => {
    if (!active || !groupRef.current) return;

    groupRef.current.children.forEach((star, i) => {
      star.position.x -= 0.3;
      star.position.y -= 0.15;

      // Reset position when out of view
      if (star.position.x < -15) {
        star.position.x = 15 + Math.random() * 10;
        star.position.y = 5 + Math.random() * 5;
        star.position.z = -5 + Math.random() * 10;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          position={[
            15 + Math.random() * 10,
            5 + Math.random() * 5,
            -5 + Math.random() * 10,
          ]}
          rotation={[0, 0, Math.PI / 4]}
        >
          <boxGeometry args={[0.5, 0.02, 0.02]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// Constellation lines that connect during goals selection
function ConstellationLines({ points = [], visible = false }) {
  const lineRef = useRef();

  const geometry = useMemo(() => {
    if (points.length < 2) return null;

    const positions = [];
    points.forEach(p => positions.push(p.x, p.y, p.z));

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [points]);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = visible
        ? 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2
        : 0;
    }
  });

  if (!geometry) return null;

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#a855f7" transparent opacity={0} linewidth={2} />
    </line>
  );
}

// Camera controller that moves based on scroll
function CameraController({ scrollProgress = 0 }) {
  const { camera } = useThree();

  useFrame(() => {
    // Smooth camera movement through the scene
    const targetZ = 5 - scrollProgress * 3;
    const targetY = scrollProgress * 1;

    camera.position.z += (targetZ - camera.position.z) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;

    // Slight rotation based on scroll
    camera.rotation.x = -scrollProgress * 0.1;
  });

  return null;
}

// Main background component
export default function CosmicBackground3D({
  scrollProgress = 0,
  phase = 0,
  showOrb = true,
  showNebula = true,
  intensity = 1,
}) {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'linear-gradient(to bottom, #030014, #0a0520, #0f0728)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#a855f7" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ec4899" />

        {/* Camera controller */}
        <CameraController scrollProgress={scrollProgress} />

        {/* Background stars (static) */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Animated particle field */}
        <ParticleField count={1500 * intensity} scrollProgress={scrollProgress} />

        {/* Nebula clouds */}
        {showNebula && <NebulaClouds scrollProgress={scrollProgress} />}

        {/* Central orb */}
        {showOrb && <CentralOrb scrollProgress={scrollProgress} phase={phase} />}

        {/* Shooting stars */}
        <ShootingStars active={scrollProgress < 0.8} />
      </Canvas>
    </div>
  );
}

export { ParticleField, CentralOrb, NebulaClouds, ConstellationLines };
