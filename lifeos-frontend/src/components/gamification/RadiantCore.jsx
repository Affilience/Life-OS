/**
 * Radiant Core - Premium Central Star
 * Stunning gradient core with glass shell - the heart of the constellation system
 * PREMIUM VERSION: Gradient shader + Glass shell + Particle ring + Light rays
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom gradient shader for radiant core
const GradientCoreMaterial = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float intensity;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Distance from center (0.0 at center, 1.0 at edge)
      float distanceFromCenter = length(vPosition) / 1.8;

      // Animated rotation angle
      float angle = atan(vPosition.z, vPosition.x) + time * 0.1;
      float wave = sin(angle * 3.0) * 0.5 + 0.5;

      // Gradient colors: white -> cyan -> purple
      vec3 centerColor = vec3(1.0, 1.0, 1.0); // White
      vec3 midColor = vec3(0.0, 0.831, 1.0); // Cyan (#00d4ff)
      vec3 edgeColor = vec3(0.659, 0.333, 0.969); // Purple (#a855f7)

      // Blend colors based on distance
      vec3 color;
      if (distanceFromCenter < 0.5) {
        color = mix(centerColor, midColor, distanceFromCenter * 2.0);
      } else {
        color = mix(midColor, edgeColor, (distanceFromCenter - 0.5) * 2.0);
      }

      // Add animated variation
      color = mix(color, edgeColor, wave * 0.2);

      // Fresnel glow effect
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      color += fresnel * 0.3;

      gl_FragColor = vec4(color * intensity, 1.0);
    }
  `,
};

export default function RadiantCore({ level = 1 }) {
  const coreRef = useRef();
  const glassShellRef = useRef();
  const wireframeRef = useRef();
  const particleRingRef = useRef();
  const lightRaysRef = useRef();

  // Size calculation based on level
  const coreSize = useMemo(() => {
    return 1.8 + Math.min(level / 50, 0.5);
  }, [level]);

  const glassSize = useMemo(() => {
    return coreSize + 0.8;
  }, [coreSize]);

  // Custom shader material
  const gradientMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: 5.0 },
      },
      vertexShader: GradientCoreMaterial.vertexShader,
      fragmentShader: GradientCoreMaterial.fragmentShader,
      transparent: true,
    });
  }, []);

  // Organized particle ring (50 particles in rings)
  const particleRing = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const ringRadius = 3.5;
      const verticalOffset = Math.sin(angle * 3) * 0.3;

      positions[i * 3] = Math.cos(angle) * ringRadius;
      positions[i * 3 + 1] = verticalOffset;
      positions[i * 3 + 2] = Math.sin(angle) * ringRadius;

      sizes[i] = 0.08 + Math.random() * 0.04;
    }

    return { positions, sizes, count };
  }, []);

  // Light rays geometry (6 rays)
  const lightRays = useMemo(() => {
    const rays = [];
    const rayCount = 6;

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const points = [];

      // Ray from core outward
      for (let j = 0; j < 20; j++) {
        const dist = 2.0 + j * 0.5;
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * dist,
            0,
            Math.sin(angle) * dist
          )
        );
      }

      rays.push(new THREE.BufferGeometry().setFromPoints(points));
    }

    return rays;
  }, []);

  // Premium animations
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Core: Gentle pulse + shader time update
    if (coreRef.current) {
      const pulse = 0.98 + Math.sin(t * (Math.PI * 2 / 3)) * 0.02;
      coreRef.current.scale.setScalar(pulse);

      if (gradientMaterial.uniforms) {
        gradientMaterial.uniforms.time.value = t;
      }
    }

    // Glass shell: Slow rotation
    if (glassShellRef.current) {
      glassShellRef.current.rotation.y = t * 0.05;
    }

    // Wireframe: Counter-rotation
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = -t * 0.03;
      wireframeRef.current.rotation.x = t * 0.02;
    }

    // Particle ring: Orbital motion
    if (particleRingRef.current) {
      particleRingRef.current.rotation.y = t * 0.08;
      particleRingRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }

    // Light rays: Slow rotation
    if (lightRaysRef.current) {
      lightRaysRef.current.rotation.y = t * 0.02;
    }
  });

  return (
    <group>
      {/* ========== LAYER 1: GRADIENT CORE ========== */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[coreSize, 64, 64]} />
        <primitive object={gradientMaterial} attach="material" />
      </mesh>

      {/* Core point light - strong and bright */}
      <pointLight position={[0, 0, 0]} intensity={12} color="#ffffff" distance={35} decay={1.5} />

      {/* Colored accent lights */}
      <pointLight position={[2, 0, 0]} intensity={3} color="#00d4ff" distance={10} />
      <pointLight position={[-2, 0, 0]} intensity={3} color="#a855f7" distance={10} />

      {/* ========== LAYER 2: GLASS SHELL ========== */}
      <mesh ref={glassShellRef}>
        <sphereGeometry args={[glassSize, 32, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          roughness={0.0}
          metalness={0.1}
          transmission={0.9}
          thickness={0.5}
          envMapIntensity={1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Wireframe overlay on glass */}
      <mesh ref={wireframeRef}>
        <sphereGeometry args={[glassSize + 0.05, 16, 16]} />
        <meshBasicMaterial
          color="#6366f1"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* ========== LAYER 3: PARTICLE RING ========== */}
      <points ref={particleRingRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleRing.count}
            array={particleRing.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleRing.count}
            array={particleRing.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.12}
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ========== LAYER 4: LIGHT RAYS ========== */}
      <group ref={lightRaysRef}>
        {lightRays.map((geometry, index) => (
          <line key={`ray-${index}`} geometry={geometry}>
            <lineBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.05}
              linewidth={1}
            />
          </line>
        ))}
      </group>
    </group>
  );
}
