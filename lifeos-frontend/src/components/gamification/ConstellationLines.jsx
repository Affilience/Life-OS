/**
 * Constellation Lines - Simple elegant connections
 * Clean straight lines from core to constellation nodes
 * Single thin line (NOT multi-layer dendrites)
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Premium constellation line with glow layers
function ConstellationLine({ module }) {
  const baseLineRef = useRef();
  const glowLineRef = useRef();
  const particlesRef = useRef();
  const trailsRef = useRef();

  const { position, color, level = 1 } = module;

  // Elegant curve from core to constellation position
  const lineCurve = useMemo(() => {
    const start = new THREE.Vector3(0, 0, 0);
    const end = new THREE.Vector3(...position);

    // Graceful upward curve
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid.y += 1.2;

    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [position]);

  // Generate line geometry (higher resolution for smoothness)
  const lineGeometry = useMemo(() => {
    const points = lineCurve.getPoints(100);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [lineCurve]);

  // Enhanced traveling particles with trails (8 particles)
  const travelingParticles = useMemo(() => {
    const count = 8;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      phases[i] = i / count;
      const point = lineCurve.getPointAt(phases[i]);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      sizes[i] = 0.1 + Math.random() * 0.05;
    }

    return { positions, phases, sizes, count };
  }, [lineCurve]);

  // Particle trails (smaller particles following main ones)
  const particleTrails = useMemo(() => {
    const trailLength = 3; // 3 trail particles per main particle
    const count = travelingParticles.count * trailLength;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const mainParticleIndex = Math.floor(i / trailLength);
      const trailOffset = (i % trailLength + 1) * 0.05;
      const progress = (travelingParticles.phases[mainParticleIndex] - trailOffset + 1) % 1.0;
      const point = lineCurve.getPointAt(progress);

      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      sizes[i] = 0.06 - (i % trailLength) * 0.015;
    }

    return { positions, sizes, count, trailLength };
  }, [lineCurve, travelingParticles]);

  // Premium animations
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Animate main traveling particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position;

      for (let i = 0; i < travelingParticles.count; i++) {
        const progress = ((t * 0.15 + travelingParticles.phases[i]) % 1.0);
        const point = lineCurve.getPointAt(progress);

        positions.array[i * 3] = point.x;
        positions.array[i * 3 + 1] = point.y;
        positions.array[i * 3 + 2] = point.z;
      }

      positions.needsUpdate = true;
    }

    // Animate particle trails
    if (trailsRef.current) {
      const positions = trailsRef.current.geometry.attributes.position;

      for (let i = 0; i < particleTrails.count; i++) {
        const mainParticleIndex = Math.floor(i / particleTrails.trailLength);
        const trailOffset = (i % particleTrails.trailLength + 1) * 0.05;
        const progress = ((t * 0.15 + travelingParticles.phases[mainParticleIndex] - trailOffset + 1) % 1.0);
        const point = lineCurve.getPointAt(progress);

        positions.array[i * 3] = point.x;
        positions.array[i * 3 + 1] = point.y;
        positions.array[i * 3 + 2] = point.z;
      }

      positions.needsUpdate = true;
    }

    // Subtle glow pulse
    if (glowLineRef.current) {
      const pulse = 0.4 + Math.sin(t * 1.5) * 0.15;
      glowLineRef.current.material.opacity = pulse;
    }
  });

  return (
    <group>
      {/* LAYER 1: BASE LINE - Thin core line */}
      <line ref={baseLineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={level < 5 ? 0.4 : 0.6}
          linewidth={1}
        />
      </line>

      {/* LAYER 2: GLOW LINE - Additive glow */}
      <line ref={glowLineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          linewidth={2}
          blending={THREE.AdditiveBlending}
        />
      </line>

      {/* LAYER 3: MAIN TRAVELING PARTICLES */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={travelingParticles.count}
            array={travelingParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={travelingParticles.count}
            array={travelingParticles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.12}
          transparent
          opacity={1.0}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* LAYER 4: PARTICLE TRAILS */}
      <points ref={trailsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleTrails.count}
            array={particleTrails.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleTrails.count}
            array={particleTrails.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.08}
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Main component - creates lines for all modules
export default function ConstellationLines({ modules }) {
  return (
    <group>
      {modules.map((module) => (
        <ConstellationLine key={module.id} module={module} />
      ))}
    </group>
  );
}
