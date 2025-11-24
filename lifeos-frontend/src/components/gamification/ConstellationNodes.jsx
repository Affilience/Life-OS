/**
 * Constellation Nodes - Star-like skill nodes
 * Simple glowing spheres arranged in recognizable constellation patterns
 * Each module forms a unique shape (plus, arrow, brain, graph, clock, star)
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Constellation pattern definitions for each module
const CONSTELLATION_PATTERNS = {
  health: [ // Plus/Cross pattern (5 nodes)
    [0, 1, 0],
    [-0.7, 0, 0],
    [0, 0, 0],
    [0.7, 0, 0],
    [0, -1, 0],
  ],
  productivity: [ // Upward arrow (7 nodes)
    [0, 1.2, 0],
    [-0.5, 0.6, 0],
    [0.5, 0.6, 0],
    [-0.3, 0, 0],
    [0.3, 0, 0],
    [-0.5, -0.6, 0],
    [0.5, -0.6, 0],
  ],
  knowledge: [ // Brain/book cluster (8 nodes)
    [-0.6, 0.6, 0],
    [0, 0.6, 0],
    [0.6, 0.6, 0],
    [-0.8, 0, 0],
    [0.8, 0, 0],
    [-0.6, -0.6, 0],
    [0, -0.6, 0],
    [0.6, -0.6, 0],
  ],
  financial: [ // Upward graph trend (6 nodes)
    [-1, -0.8, 0],
    [-0.6, -0.4, 0],
    [-0.2, 0, 0],
    [0.2, 0.4, 0],
    [0.6, 0.8, 0],
    [1, 1.2, 0],
  ],
  calendar: [ // Clock circle (8 nodes)
    [0, 1, 0],
    [0.707, 0.707, 0],
    [1, 0, 0],
    [0.707, -0.707, 0],
    [0, -1, 0],
    [-0.707, -0.707, 0],
    [-1, 0, 0],
    [-0.707, 0.707, 0],
  ],
  goals: [ // Star pattern (7 nodes)
    [0, 1, 0],
    [-0.3, 0.3, 0],
    [-0.9, 0.3, 0],
    [-0.5, -0.2, 0],
    [-0.6, -0.9, 0],
    [0, -0.5, 0],
    [0.6, -0.9, 0],
    [0.5, -0.2, 0],
    [0.9, 0.3, 0],
    [0.3, 0.3, 0],
  ],
};

// Premium three-layer star node
function StarNode({ position, color, size, state = 'available' }) {
  const groupRef = useRef();
  const innerGlowRef = useRef();
  const middleSphereRef = useRef();
  const outerHaloRef = useRef();

  // State-based properties
  const nodeProps = useMemo(() => {
    switch (state) {
      case 'locked':
        return {
          opacity: 0.2,
          emissiveIntensity: 0.1,
          innerScale: 0.08,
          middleScale: 0.12,
          haloScale: 0.18,
          haloOpacity: 0.05
        };
      case 'available':
        return {
          opacity: 0.8,
          emissiveIntensity: 1.5,
          innerScale: 0.12,
          middleScale: 0.18,
          haloScale: 0.28,
          haloOpacity: 0.15
        };
      case 'active':
        return {
          opacity: 1.0,
          emissiveIntensity: 3.0,
          innerScale: 0.15,
          middleScale: 0.22,
          haloScale: 0.35,
          haloOpacity: 0.25
        };
      case 'completed':
        return {
          opacity: 1.0,
          emissiveIntensity: 2.5,
          innerScale: 0.14,
          middleScale: 0.21,
          haloScale: 0.32,
          haloOpacity: 0.2
        };
      case 'mastered':
        return {
          opacity: 1.0,
          emissiveIntensity: 3.5,
          innerScale: 0.16,
          middleScale: 0.24,
          haloScale: 0.38,
          haloOpacity: 0.3
        };
      default:
        return {
          opacity: 0.8,
          emissiveIntensity: 1.5,
          innerScale: 0.12,
          middleScale: 0.18,
          haloScale: 0.28,
          haloOpacity: 0.15
        };
    }
  }, [state]);

  // Premium animations - gentle pulse and rotation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (state === 'active' && groupRef.current) {
      // Pulse animation for active nodes
      const pulse = 1.0 + Math.sin(t * 3) * 0.12;
      groupRef.current.scale.setScalar(pulse);
    }

    // Inner glow subtle pulse
    if (innerGlowRef.current) {
      const glowPulse = 1.0 + Math.sin(t * 2.5) * 0.08;
      innerGlowRef.current.scale.setScalar(glowPulse);
    }

    // Outer halo gentle rotation
    if (outerHaloRef.current && state !== 'locked') {
      outerHaloRef.current.rotation.y = t * 0.3;
      outerHaloRef.current.rotation.x = t * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* LAYER 1: INNER GLOW (bright white core) */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[nodeProps.innerScale, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={state === 'locked' ? 0.1 : 1.0}
        />
      </mesh>

      {/* LAYER 2: MIDDLE SPHERE (module color) */}
      <mesh ref={middleSphereRef}>
        <sphereGeometry args={[nodeProps.middleScale, 20, 20]} />
        <meshStandardMaterial
          color={state === 'locked' ? '#666666' : color}
          emissive={state === 'locked' ? '#333333' : color}
          emissiveIntensity={nodeProps.emissiveIntensity}
          transparent
          opacity={nodeProps.opacity}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* LAYER 3: OUTER HALO (transparent glow) */}
      <mesh ref={outerHaloRef}>
        <sphereGeometry args={[nodeProps.haloScale, 16, 16]} />
        <meshBasicMaterial
          color={state === 'locked' ? '#666666' : color}
          transparent
          opacity={nodeProps.haloOpacity}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Point light for glow effect */}
      {state !== 'locked' && (
        <pointLight
          position={[0, 0, 0]}
          color={color}
          intensity={nodeProps.emissiveIntensity * 0.6}
          distance={2.5}
          decay={2}
        />
      )}
    </group>
  );
}

// Constellation lines connecting nodes
function ConstellationStructure({ nodes, color }) {
  const lineGeometry = useMemo(() => {
    const points = nodes.map(pos => new THREE.Vector3(...pos));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [nodes]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        linewidth={1}
      />
    </line>
  );
}

// Main constellation for a single module
function Constellation({ module }) {
  const groupRef = useRef();
  const { position, color, id, level = 1 } = module;

  // Get pattern for this module
  const pattern = CONSTELLATION_PATTERNS[id] || CONSTELLATION_PATTERNS.goals;

  // Mock node states (in real app, this would come from data)
  const nodeStates = useMemo(() => {
    return pattern.map((_, index) => {
      if (index === 0 && level > 15) return 'active';
      if (index < Math.floor(level / 3)) return 'completed';
      if (index < Math.floor(level / 2)) return 'available';
      return 'locked';
    });
  }, [pattern, level]);

  return (
    <group ref={groupRef} position={position}>
      {/* Constellation structure lines */}
      <ConstellationStructure nodes={pattern} color={color} />

      {/* Star nodes */}
      {pattern.map((nodePos, index) => (
        <StarNode
          key={`node-${index}`}
          position={nodePos}
          color={color}
          state={nodeStates[index]}
        />
      ))}
    </group>
  );
}

// Main component - creates constellations for all modules
export default function ConstellationNodes({ modules }) {
  return (
    <group>
      {modules.map((module) => (
        <Constellation key={module.id} module={module} />
      ))}
    </group>
  );
}
