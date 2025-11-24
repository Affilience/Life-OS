/**
 * Neural Core - Central Consciousness Visualization (PREMIUM V2)
 * Evolves from simple sphere to complex multi-layer geometry as user levels up
 * Features custom shaders with fresnel effects and animated noise
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom shader for core with fresnel and noise effects
const coreVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewDirection;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coreFragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform float noiseScale;
  uniform float noiseSpeed;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewDirection;

  // Simplex 3D Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    // Fresnel effect - bright edges, darker center
    float fresnel = pow(1.0 - dot(vNormal, vViewDirection), 3.0);

    // Layered animated noise for energy swirls
    float noise1 = snoise(vPosition * noiseScale + time * noiseSpeed);
    float noise2 = snoise(vPosition * noiseScale * 2.0 - time * noiseSpeed * 0.7);
    float noise3 = snoise(vPosition * noiseScale * 0.5 + time * noiseSpeed * 0.3);

    // Combine noise layers for complex pattern
    float noiseValue = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2);

    // Color gradient based on noise
    vec3 baseColor = mix(color1, color2, noiseValue * 0.5 + 0.5);

    // Add fresnel glow (cyan-white glow on edges)
    vec3 fresnelColor = vec3(0.4, 0.7, 1.0);
    baseColor += fresnel * fresnelColor * 2.5;

    // Add subtle pulsing brightness based on noise
    float brightness = 1.0 + noiseValue * 0.3;
    baseColor *= brightness;

    // Ensure minimum brightness
    baseColor = max(baseColor, vec3(0.1));

    gl_FragColor = vec4(baseColor, 0.95);
  }
`;

export default function NeuralCore({ level = 1 }) {
  // Layer references for 8-layer consciousness core
  const singularityRef = useRef();
  const innerNucleusRef = useRef();
  const geo1Ref = useRef(); // Icosahedron
  const geo2Ref = useRef(); // Dodecahedron
  const geo3Ref = useRef(); // Octahedron
  const dataStreamsRef = useRef();
  const particleFieldRef = useRef();
  const geometricShellRef = useRef();
  const energyMembraneRef = useRef();
  const coronaRef = useRef();

  // Determine visual tier based on level
  const tier = useMemo(() => {
    if (level <= 10) return 1; // The Spark
    if (level <= 25) return 2; // Emerging Form
    if (level <= 40) return 3; // Complex Geometry
    return 4; // Full Consciousness
  }, [level]);

  // 8-Layer system size calculations
  const layerSizes = useMemo(() => ({
    singularity: 0.1,           // Layer 1: Tiny ultra-bright sphere
    innerNucleus: 0.8,          // Layer 2: Energy nucleus with shader
    geo1: 1.5,                  // Layer 3A: Inner icosahedron
    geo2: 1.8,                  // Layer 3B: Middle dodecahedron
    geo3: 2.2,                  // Layer 3C: Outer octahedron
    particleFieldInner: 2.5,    // Layer 5: Particle field inner radius
    particleFieldOuter: 4.0,    // Layer 5: Particle field outer radius
    geometricShell: 4.0,        // Layer 6: Geodesic shell
    energyMembrane: 4.5,        // Layer 7: Volumetric membrane
    outerCorona: 5.5            // Layer 8: God rays
  }), []);

  // Massive particle field (300-800 particles based on level)
  const particleCount = useMemo(() => {
    const base = 300;
    const levelBonus = Math.floor(level * 10);
    return Math.min(800, base + levelBonus);
  }, [level]);

  // Data stream count (20-30 streams flowing inward)
  const dataStreamCount = 25;

  // Custom shader material for main core with animated noise
  const coreMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: coreVertexShader,
      fragmentShader: coreFragmentShader,
      uniforms: {
        time: { value: 0.0 },
        color1: { value: new THREE.Color(0.545, 0.361, 0.965) }, // #8b5cf6 (violet)
        color2: { value: new THREE.Color(0.376, 0.510, 0.980) }, // #60a5fa (blue)
        noiseScale: { value: 2.0 },
        noiseSpeed: { value: 0.3 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });
  }, []);

  // Layer 5: Massive organized particle field (300-800 particles)
  const particleField = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const types = new Float32Array(particleCount); // 0 = normal, 1 = memory node

    const innerRadius = layerSizes.particleFieldInner;
    const outerRadius = layerSizes.particleFieldOuter;

    for (let i = 0; i < particleCount; i++) {
      // Fibonacci sphere distribution for even spacing
      const theta = Math.acos(-1 + (2 * i) / particleCount);
      const phi = Math.sqrt(particleCount * Math.PI) * theta;

      // Distance varies between inner and outer radius
      const radiusFactor = innerRadius + (outerRadius - innerRadius) * Math.random();

      positions[i * 3] = radiusFactor * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radiusFactor * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = radiusFactor * Math.cos(theta);

      // 10% are "memory nodes" - larger and brighter
      const isMemoryNode = Math.random() < 0.1;
      types[i] = isMemoryNode ? 1.0 : 0.0;
      sizes[i] = isMemoryNode ? 0.08 : (0.03 + Math.random() * 0.02);

      // Color gradient based on distance from center
      const distanceRatio = (radiusFactor - innerRadius) / (outerRadius - innerRadius);

      if (distanceRatio < 0.5) {
        // Inner: Warm colors (orange, yellow)
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.6 + distanceRatio * 0.4;
        colors[i * 3 + 2] = 0.2 + distanceRatio * 0.3;
      } else {
        // Outer: Cool colors (cyan, purple)
        const coolRatio = (distanceRatio - 0.5) * 2;
        colors[i * 3] = 0.6 - coolRatio * 0.3;
        colors[i * 3 + 1] = 0.7 + coolRatio * 0.2;
        colors[i * 3 + 2] = 1.0;
      }
    }

    return { positions, colors, sizes, types };
  }, [particleCount, layerSizes]);

  // Layer 4: Holographic data streams (particles flowing inward)
  const dataStreams = useMemo(() => {
    const streamPositions = new Float32Array(dataStreamCount * 3);
    const streamColors = new Float32Array(dataStreamCount * 3);
    const streamPhases = new Float32Array(dataStreamCount);

    for (let i = 0; i < dataStreamCount; i++) {
      // Start positions distributed around outer sphere
      const theta = Math.acos(-1 + (2 * i) / dataStreamCount);
      const phi = Math.sqrt(dataStreamCount * Math.PI) * theta;
      const startRadius = 6.0;

      streamPositions[i * 3] = startRadius * Math.sin(theta) * Math.cos(phi);
      streamPositions[i * 3 + 1] = startRadius * Math.sin(theta) * Math.sin(phi);
      streamPositions[i * 3 + 2] = startRadius * Math.cos(theta);

      // Cyan-purple colors for data streams
      streamColors[i * 3] = 0.3 + Math.random() * 0.4;
      streamColors[i * 3 + 1] = 0.6 + Math.random() * 0.3;
      streamColors[i * 3 + 2] = 1.0;

      // Phase offset for staggered animation
      streamPhases[i] = Math.random() * Math.PI * 2;
    }

    return { streamPositions, streamColors, streamPhases };
  }, [dataStreamCount]);

  // Ultra-premium 8-layer animation system
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Layer 1: Singularity pulse (constant ultra-bright pulsing)
    if (singularityRef.current) {
      const pulse = 0.8 + Math.sin(t * 2.5) * 0.2; // 1.5s cycle
      singularityRef.current.scale.setScalar(pulse);
    }

    // Layer 2: Inner nucleus shader animation
    if (coreMaterial) {
      coreMaterial.uniforms.time.value = t;
    }

    // Gentle breathing for nucleus
    if (innerNucleusRef.current) {
      const breathe = 1 + Math.sin(t * 0.8) * 0.03;
      innerNucleusRef.current.scale.setScalar(breathe);
      innerNucleusRef.current.rotation.y = t * 0.001; // Very slow
    }

    // Layer 3: Rotating geometric shells
    if (geo1Ref.current) {
      geo1Ref.current.rotation.y = t * 0.3;
      geo1Ref.current.rotation.x = t * 0.2;
    }

    if (geo2Ref.current) {
      geo2Ref.current.rotation.y = -t * 0.25;
      geo2Ref.current.rotation.z = t * 0.15;
    }

    if (geo3Ref.current) {
      geo3Ref.current.rotation.y = t * 0.2;
      geo3Ref.current.rotation.x = -t * 0.15;
    }

    // Layer 4: Data streams flowing inward
    if (dataStreamsRef.current) {
      const positions = dataStreamsRef.current.geometry.attributes.position;

      for (let i = 0; i < dataStreamCount; i++) {
        // Get phase for this stream
        const phase = dataStreams.streamPhases[i];

        // Calculate progress (0 = outer, 1 = core)
        const progress = ((t * 0.3 + phase) % (Math.PI * 2)) / (Math.PI * 2);

        // Interpolate from start position to core center
        const startX = dataStreams.streamPositions[i * 3];
        const startY = dataStreams.streamPositions[i * 3 + 1];
        const startZ = dataStreams.streamPositions[i * 3 + 2];

        positions.array[i * 3] = startX * (1 - progress);
        positions.array[i * 3 + 1] = startY * (1 - progress);
        positions.array[i * 3 + 2] = startZ * (1 - progress);
      }

      positions.needsUpdate = true;
    }

    // Layer 5: Particle field orbital motion
    if (particleFieldRef.current) {
      particleFieldRef.current.rotation.y = t * 0.05;
      particleFieldRef.current.rotation.x = Math.sin(t * 0.3) * 0.05;
    }

    // Layer 6: Geometric shell slow rotation with scan lines
    if (geometricShellRef.current) {
      geometricShellRef.current.rotation.y = t * 0.03;
    }

    // Layer 7: Energy membrane morphing (handled by shader if implemented)

    // Layer 8: Corona god rays rotation
    if (coronaRef.current) {
      coronaRef.current.rotation.z = t * 0.02;
    }
  });

  return (
    <group>
      {/* ========== LAYER 1: SINGULARITY POINT ========== */}
      <mesh ref={singularityRef}>
        <sphereGeometry args={[layerSizes.singularity, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={10.0}
          transparent
          opacity={1.0}
        />
      </mesh>

      {/* Ultra-bright point light from singularity */}
      <pointLight position={[0, 0, 0]} intensity={8} color="#ffffff" distance={30} decay={1.5} />

      {/* ========== LAYER 2: INNER ENERGY NUCLEUS ========== */}
      <mesh ref={innerNucleusRef}>
        <sphereGeometry args={[layerSizes.innerNucleus, 64, 64]} />
        <primitive object={coreMaterial} attach="material" />
      </mesh>

      {/* ========== LAYER 3: ROTATING CORE GEOMETRIES ========== */}

      {/* 3A: Inner Icosahedron */}
      <mesh ref={geo1Ref}>
        <icosahedronGeometry args={[layerSizes.geo1, 0]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={1.5}
          wireframe
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3B: Middle Dodecahedron */}
      <mesh ref={geo2Ref}>
        <dodecahedronGeometry args={[layerSizes.geo2, 0]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#8b5cf6"
          emissiveIntensity={1.3}
          wireframe
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3C: Outer Octahedron */}
      <mesh ref={geo3Ref}>
        <octahedronGeometry args={[layerSizes.geo3, 0]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#2563eb"
          emissiveIntensity={1.1}
          wireframe
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ========== LAYER 4: HOLOGRAPHIC DATA STREAMS ========== */}
      <points ref={dataStreamsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dataStreamCount}
            array={dataStreams.streamPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={dataStreamCount}
            array={dataStreams.streamColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ========== LAYER 5: MASSIVE PARTICLE FIELD ========== */}
      <points ref={particleFieldRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particleField.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={particleField.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleCount}
            array={particleField.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.7}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ========== LAYER 6: GEOMETRIC SHELL ========== */}
      <mesh ref={geometricShellRef}>
        <icosahedronGeometry args={[layerSizes.geometricShell, 2]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#7c3aed"
          emissiveIntensity={0.4}
          transparent
          opacity={0.15}
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ========== LAYER 7: ENERGY MEMBRANE ========== */}
      {/* Subtle outer glow sphere */}
      <mesh>
        <sphereGeometry args={[layerSizes.energyMembrane, 32, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#7c3aed"
          emissiveIntensity={0.3}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ========== LAYER 8: OUTER CORONA (God Rays) ========== */}
      {/* Will be enhanced with volumetric light later */}
      <group ref={coronaRef}>
        {/* Subtle outer dust particles */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const distance = layerSizes.outerCorona;
          return (
            <mesh
              key={`corona-${i}`}
              position={[
                Math.cos(angle) * distance,
                Math.sin(angle * 0.5) * distance * 0.3,
                Math.sin(angle) * distance
              ]}
            >
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#7c3aed"
                emissiveIntensity={1.5}
                transparent
                opacity={0.4}
              />
            </mesh>
          );
        })}
      </group>

      {/* Central illumination light */}
      <pointLight position={[0, 0, 0]} intensity={5} color="#8b5cf6" distance={35} decay={1.5} />
    </group>
  );
}
