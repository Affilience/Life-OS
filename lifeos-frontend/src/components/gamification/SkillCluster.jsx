/**
 * Skill Cluster - Individual skill nodes arranged around a module
 * Each node represents a specific skill/activity within the module
 * Connected by dendrite-like branches to create organic neural appearance
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Individual Skill Node Component - Neural Terminal
function SkillNode({ position, color, state, size = 0.15 }) {
  const nodeRef = useRef();
  const innerGeoRef = useRef();
  const outerGeoRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const tendrilRefs = useRef([]);
  const [isHovered, setIsHovered] = React.useState(false);

  // Generate data tendrils - organic strands emanating from terminal
  const tendrils = useMemo(() => {
    const tendrilCount = state === 'locked' ? 0 : state === 'mastered' ? 8 : state === 'completed' ? 6 : 4;
    const strands = [];

    for (let i = 0; i < tendrilCount; i++) {
      const angle = (i / tendrilCount) * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI * 0.4;

      // Direction vector
      const dir = new THREE.Vector3(
        Math.cos(angle) * Math.cos(elevation),
        Math.sin(elevation),
        Math.sin(angle) * Math.cos(elevation)
      );

      const length = size * (3 + Math.random() * 2); // 3-5x terminal size
      const endPoint = dir.multiplyScalar(length);

      strands.push({
        id: `tendril-${i}`,
        end: [endPoint.x, endPoint.y, endPoint.z],
        phase: Math.random() * Math.PI * 2,
      });
    }

    return strands;
  }, [state, size]);

  // Visual properties based on state
  const { nodeColor, emissiveIntensity, opacity, geometry, ringCount } = useMemo(() => {
    const baseIntensity = isHovered ? 1.5 : 1.0;

    switch (state) {
      case 'mastered':
        return {
          nodeColor: '#fbbf24', // Gold for mastered
          emissiveIntensity: 3.5 * baseIntensity,
          opacity: 1.0,
          geometry: 'dodecahedron', // Most complex
          ringCount: 3, // Three orbital rings for mastered
        };
      case 'completed':
        return {
          nodeColor: '#10b981', // Green for completed
          emissiveIntensity: 2.5 * baseIntensity,
          opacity: 1.0,
          geometry: 'icosahedron',
          ringCount: 2, // Two rings for completed
        };
      case 'in_progress':
        return {
          nodeColor: '#3b82f6', // Blue for in progress
          emissiveIntensity: 2.0 * baseIntensity,
          opacity: 0.95,
          geometry: 'octahedron',
          ringCount: 1, // One ring for in progress
        };
      case 'unlocked':
        return {
          nodeColor: color,
          emissiveIntensity: 1.5 * baseIntensity,
          opacity: 0.9,
          geometry: 'octahedron',
          ringCount: 1, // One ring for unlocked
        };
      case 'locked':
      default:
        return {
          nodeColor: '#3f3f46', // Zinc-700 for locked
          emissiveIntensity: 0.3 * baseIntensity,
          opacity: 0.4,
          geometry: 'tetrahedron', // Simplest
          ringCount: 0, // No rings for locked
        };
    }
  }, [state, color, isHovered]);

  // Animation: pulsing, rotation, hover
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Main group pulsing and hover scaling
    if (nodeRef.current && state !== 'locked') {
      const pulse = 1 + Math.sin(t * 2 + position[0] + position[2]) * 0.08;
      const hoverScale = isHovered ? 1.4 : 1.0;
      nodeRef.current.scale.setScalar(pulse * hoverScale);
    } else if (nodeRef.current && isHovered) {
      // Even locked nodes get slight hover effect
      nodeRef.current.scale.setScalar(1.2);
    } else if (nodeRef.current) {
      nodeRef.current.scale.setScalar(1.0);
    }

    // Inner geometry rotation - faster rotation for active nodes
    if (innerGeoRef.current) {
      const speed = state === 'locked' ? 0.2 : state === 'mastered' ? 1.0 : 0.5;
      innerGeoRef.current.rotation.y = t * speed;
      innerGeoRef.current.rotation.x = t * speed * 0.5;
    }

    // Outer geometry counter-rotation - slower
    if (outerGeoRef.current) {
      const speed = state === 'locked' ? 0.15 : state === 'mastered' ? 0.7 : 0.35;
      outerGeoRef.current.rotation.y = -t * speed;
      outerGeoRef.current.rotation.z = t * speed * 0.3;
    }

    // Orbital rings rotation - each ring has different rotation axis and speed
    if (ring1Ref.current && ringCount >= 1) {
      ring1Ref.current.rotation.y = t * 0.8;
      ring1Ref.current.rotation.x = Math.PI / 4; // 45° tilt
    }
    if (ring2Ref.current && ringCount >= 2) {
      ring2Ref.current.rotation.y = -t * 0.6;
      ring2Ref.current.rotation.x = -Math.PI / 4; // -45° tilt
    }
    if (ring3Ref.current && ringCount >= 3) {
      ring3Ref.current.rotation.z = t * 0.7;
      ring3Ref.current.rotation.x = Math.PI / 2; // 90° tilt (horizontal)
    }

    // Data tendrils gentle wave animation
    tendrils.forEach((tendril, idx) => {
      if (tendrilRefs.current[idx]) {
        const wave = Math.sin(t * 1.5 + tendril.phase) * 0.03;
        tendrilRefs.current[idx].rotation.z = wave;
        tendrilRefs.current[idx].rotation.x = Math.cos(t * 1.2 + tendril.phase) * 0.02;
      }
    });
  });

  // Helper to render appropriate geometry
  const renderGeometry = (geoType, scale = 1) => {
    const s = size * scale;
    switch (geoType) {
      case 'tetrahedron':
        return <tetrahedronGeometry args={[s, 0]} />;
      case 'octahedron':
        return <octahedronGeometry args={[s, 0]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[s, 0]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[s, 0]} />;
      default:
        return <octahedronGeometry args={[s, 0]} />;
    }
  };

  return (
    <group position={position}>
      {/* Main neural terminal group with hover interaction */}
      <group
        ref={nodeRef}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        {/* Inner rotating geometry - wireframe for depth */}
        <mesh ref={innerGeoRef}>
          {renderGeometry(geometry, 0.8)}
          <meshStandardMaterial
            color={nodeColor}
            emissive={nodeColor}
            emissiveIntensity={emissiveIntensity * 0.6}
            wireframe
            transparent
            opacity={opacity * 0.5}
          />
        </mesh>

        {/* Outer rotating geometry - solid */}
        <mesh ref={outerGeoRef}>
          {renderGeometry(geometry, 1.0)}
          <meshStandardMaterial
            color={nodeColor}
            emissive={nodeColor}
            emissiveIntensity={emissiveIntensity}
            transparent
            opacity={opacity}
            flatShading
          />
        </mesh>

        {/* Core sphere for extra glow */}
        <mesh>
          <sphereGeometry args={[size * 0.4, 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={nodeColor}
            emissiveIntensity={emissiveIntensity * 1.5}
            transparent
            opacity={opacity * 0.8}
          />
        </mesh>
      </group>

      {/* Information field - energy glow for active nodes */}
      {state !== 'locked' && (
        <mesh>
          <sphereGeometry args={[size * 2.2, 16, 16]} />
          <meshBasicMaterial
            color={nodeColor}
            transparent
            opacity={0.12}
          />
        </mesh>
      )}

      {/* Enhanced point light for active terminals */}
      {state !== 'locked' && (
        <pointLight
          position={[0, 0, 0]}
          intensity={state === 'mastered' ? 1.2 : 0.6}
          color={nodeColor}
          distance={state === 'mastered' ? 3 : 2}
        />
      )}

      {/* Orbital Ring 1 */}
      {ringCount >= 1 && (
        <group ref={ring1Ref}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[size * 1.8, size * 0.02, 8, 32]} />
            <meshStandardMaterial
              color={nodeColor}
              emissive={nodeColor}
              emissiveIntensity={emissiveIntensity * 0.8}
              transparent
              opacity={opacity * 0.6}
            />
          </mesh>
        </group>
      )}

      {/* Orbital Ring 2 */}
      {ringCount >= 2 && (
        <group ref={ring2Ref}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[size * 2.2, size * 0.02, 8, 32]} />
            <meshStandardMaterial
              color={nodeColor}
              emissive={nodeColor}
              emissiveIntensity={emissiveIntensity * 0.7}
              transparent
              opacity={opacity * 0.5}
            />
          </mesh>
        </group>
      )}

      {/* Orbital Ring 3 - Only for mastered */}
      {ringCount >= 3 && (
        <group ref={ring3Ref}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[size * 2.6, size * 0.02, 8, 32]} />
            <meshStandardMaterial
              color={nodeColor}
              emissive={nodeColor}
              emissiveIntensity={emissiveIntensity * 0.6}
              transparent
              opacity={opacity * 0.4}
            />
          </mesh>
        </group>
      )}

      {/* Data Tendrils - Organic strands */}
      {tendrils.map((tendril, idx) => {
        const points = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(...tendril.end).multiplyScalar(0.5),
          new THREE.Vector3(...tendril.end)
        ];
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeo = new THREE.TubeGeometry(curve, 16, size * 0.01, 6, false);

        return (
          <group key={tendril.id} ref={el => tendrilRefs.current[idx] = el}>
            {/* Tendril tube */}
            <mesh geometry={tubeGeo}>
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={emissiveIntensity * 0.5}
                transparent
                opacity={opacity * 0.4}
              />
            </mesh>
            {/* Tendril endpoint particle */}
            <mesh position={tendril.end}>
              <sphereGeometry args={[size * 0.08, 8, 8]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={emissiveIntensity * 0.7}
                transparent
                opacity={opacity * 0.6}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Dendrite Branch - Thin connection between skill nodes
function DendriteBranch({ start, end, color }) {
  const geometry = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);

    // Simple straight line for dendrite
    const points = [startVec, endVec];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [start, end]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        linewidth={1}
      />
    </line>
  );
}

// Main Skill Cluster Component
export default function SkillCluster({ module }) {
  const { position, color, skills = [] } = module;

  // Generate skill node positions in a cluster pattern around module position
  const skillPositions = useMemo(() => {
    if (skills.length === 0) {
      // Default: create 5 placeholder skills in a spherical arrangement
      return Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 1.5;
        const elevation = (Math.random() - 0.5) * 1;

        return {
          id: `skill-${i}`,
          position: [
            position[0] + Math.cos(angle) * radius,
            position[1] + elevation,
            position[2] + Math.sin(angle) * radius,
          ],
          state: i < 2 ? 'completed' : i < 4 ? 'unlocked' : 'locked',
        };
      });
    }

    // Use provided skills data
    return skills.map((skill, i) => {
      const angle = (i / skills.length) * Math.PI * 2;
      const radius = 1.5;
      const elevation = (Math.random() - 0.5) * 1;

      return {
        id: skill.id,
        position: [
          position[0] + Math.cos(angle) * radius,
          position[1] + elevation,
          position[2] + Math.sin(angle) * radius,
        ],
        state: skill.state || 'locked',
      };
    });
  }, [position, skills]);

  // Generate dendrite branches connecting adjacent nodes
  const dendriteBranches = useMemo(() => {
    const branches = [];

    // Connect each skill node to the next one (circular pattern)
    for (let i = 0; i < skillPositions.length; i++) {
      const current = skillPositions[i];
      const next = skillPositions[(i + 1) % skillPositions.length];

      branches.push({
        key: `branch-${i}`,
        start: current.position,
        end: next.position,
      });
    }

    // Also connect to module center for some nodes
    skillPositions.forEach((skill, i) => {
      if (i % 2 === 0) {
        branches.push({
          key: `center-branch-${i}`,
          start: skill.position,
          end: position,
        });
      }
    });

    return branches;
  }, [skillPositions, position]);

  return (
    <group>
      {/* Dendrite branches */}
      {dendriteBranches.map((branch) => (
        <DendriteBranch
          key={branch.key}
          start={branch.start}
          end={branch.end}
          color={color}
        />
      ))}

      {/* Skill nodes */}
      {skillPositions.map((skill) => (
        <SkillNode
          key={skill.id}
          position={skill.position}
          color={color}
          state={skill.state}
        />
      ))}
    </group>
  );
}
