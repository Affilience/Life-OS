/**
 * NebulaCluster - Swirling particle clouds around skill constellations
 * Creates a nebula effect for each skill module
 * Density and appearance scale with module level
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function NebulaCluster({ module }) {
  const particleCloudRef = useRef();
  const spiralRef = useRef();
  const glowRingRef = useRef();

  const { position, color, level = 1, id } = module;

  // Calculate cluster properties based on level
  const clusterProps = useMemo(() => {
    const density = Math.min(level / 20, 1.0); // 0.0 to 1.0

    return {
      particleCount: 80 + Math.floor(level * 5),
      cloudRadius: 1.2 + (level / 30),
      spiralParticles: 30 + Math.floor(level * 2),
      glowIntensity: 0.3 + (level / 50),
      rotationSpeed: 0.1 + (level / 100),
      density,
    };
  }, [level]);

  // Parse color string to RGB
  const colorRGB = useMemo(() => {
    const hex = color.replace('#', '');
    return {
      r: parseInt(hex.substr(0, 2), 16) / 255,
      g: parseInt(hex.substr(2, 2), 16) / 255,
      b: parseInt(hex.substr(4, 2), 16) / 255,
    };
  }, [color]);

  // Main particle cloud (spherical distribution)
  const particleCloud = useMemo(() => {
    const count = clusterProps.particleCount;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spherical distribution with clustering
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = clusterProps.cloudRadius * Math.pow(Math.random(), 0.5);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      sizes[i] = 0.02 + Math.random() * 0.04;

      // Color variation (brighter near center)
      const brighten = 1.0 + (1.0 - radius / clusterProps.cloudRadius) * 0.5;
      colors[i * 3] = colorRGB.r * brighten;
      colors[i * 3 + 1] = colorRGB.g * brighten;
      colors[i * 3 + 2] = colorRGB.b * brighten;

      opacities[i] = 0.3 + Math.random() * 0.4;
    }

    return { positions, sizes, colors, opacities, count };
  }, [clusterProps, colorRGB]);

  // Spiral arm particles (creates swirling effect)
  const spiralArm = useMemo(() => {
    const count = clusterProps.spiralParticles;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const progress = i / count;
      const angle = progress * Math.PI * 4; // 2 full rotations
      const radius = progress * clusterProps.cloudRadius * 1.5;
      const height = Math.sin(progress * Math.PI * 2) * 0.5;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      sizes[i] = 0.04 + Math.random() * 0.03;

      // Gradient along spiral
      const fade = 1.0 - progress * 0.5;
      colors[i * 3] = colorRGB.r * fade;
      colors[i * 3 + 1] = colorRGB.g * fade;
      colors[i * 3 + 2] = colorRGB.b * fade;
    }

    return { positions, sizes, colors, count };
  }, [clusterProps, colorRGB]);

  // Glow ring particles (orbital ring around cluster)
  const glowRing = useMemo(() => {
    const count = 24;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = clusterProps.cloudRadius * 1.3;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      sizes[i] = 0.05 + Math.random() * 0.02;
    }

    return { positions, sizes, count };
  }, [clusterProps]);

  // Animations
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Particle cloud: Gentle swirling
    if (particleCloudRef.current) {
      particleCloudRef.current.rotation.y = t * clusterProps.rotationSpeed;
      particleCloudRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;

      // Pulsing opacity effect
      const positions = particleCloudRef.current.geometry.attributes.position;
      for (let i = 0; i < particleCloud.count; i++) {
        const pulse = Math.sin(t * 2 + i * 0.1) * 0.1;
        const baseY = positions.array[i * 3 + 1];
        positions.array[i * 3 + 1] = baseY + pulse;
      }
      positions.needsUpdate = true;
    }

    // Spiral arm: Fast rotation
    if (spiralRef.current) {
      spiralRef.current.rotation.y = t * (clusterProps.rotationSpeed * 2);
      spiralRef.current.rotation.z = Math.cos(t * 0.4) * 0.1;
    }

    // Glow ring: Orbital rotation
    if (glowRingRef.current) {
      const positions = glowRingRef.current.geometry.attributes.position;

      for (let i = 0; i < glowRing.count; i++) {
        const angle = (i / glowRing.count) * Math.PI * 2 + t * 0.5;
        const radius = clusterProps.cloudRadius * 1.3;
        const wobble = Math.sin(t * 2 + i * 0.5) * 0.1;

        positions.array[i * 3] = Math.cos(angle) * (radius + wobble);
        positions.array[i * 3 + 1] = Math.sin(t * 1.5 + i * 0.3) * 0.3;
        positions.array[i * 3 + 2] = Math.sin(angle) * (radius + wobble);
      }

      positions.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      {/* Main particle cloud */}
      <points ref={particleCloudRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCloud.count}
            array={particleCloud.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleCloud.count}
            array={particleCloud.sizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCloud.count}
            array={particleCloud.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          transparent
          opacity={0.4}
          vertexColors
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Spiral arm */}
      <points ref={spiralRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={spiralArm.count}
            array={spiralArm.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={spiralArm.count}
            array={spiralArm.sizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={spiralArm.count}
            array={spiralArm.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          transparent
          opacity={0.5}
          vertexColors
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Glow ring */}
      <points ref={glowRingRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={glowRing.count}
            array={glowRing.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={glowRing.count}
            array={glowRing.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.1}
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Subtle point light for glow effect */}
      <pointLight
        position={[0, 0, 0]}
        color={color}
        intensity={clusterProps.glowIntensity}
        distance={3}
        decay={2}
      />
    </group>
  );
}
