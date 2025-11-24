/**
 * Neural Dendrites - Organic branching connections from consciousness core
 * Living, breathing neural network that grows naturally like neurons
 * V3: ULTRA-PREMIUM - Dense, organic, alive
 */

import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Helper: Generate organic curve points for dendrite growth
function generateOrganicPath(startPos, endPos, branchPoint = 0.5, curviness = 1.5) {
  const start = new THREE.Vector3(...startPos);
  const end = new THREE.Vector3(...endPos);

  // Create natural curving midpoint
  const mid1 = new THREE.Vector3().lerpVectors(start, end, 0.33);
  const mid2 = new THREE.Vector3().lerpVectors(start, end, 0.66);

  // Add randomized offset for organic feel
  const perpendicular = new THREE.Vector3()
    .crossVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(end, start).normalize()
    )
    .normalize();

  mid1.add(perpendicular.clone().multiplyScalar((Math.random() - 0.5) * curviness));
  mid1.y += (Math.random() - 0.5) * curviness * 0.8;

  mid2.add(perpendicular.clone().multiplyScalar((Math.random() - 0.5) * curviness * 0.7));
  mid2.y += (Math.random() - 0.5) * curviness * 0.5;

  return new THREE.CatmullRomCurve3([start, mid1, mid2, end]);
}

// Main organic dendrite component with branching
function OrganicDendrite({ module }) {
  const mainDendriteRef = useRef();
  const pulseRefs = useRef([]);
  const branchRefs = useRef([]);
  const branchPulseRefs = useRef([]);
  const moduleNodeRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  const { position, color, level = 1 } = module;

  // Pulse configuration - scales with level
  const pulseCount = useMemo(() => Math.min(5, 2 + Math.floor(level / 5)), [level]);
  const pulseSpeed = useMemo(() => 0.15 + (level / 100) * 0.1, [level]); // Faster at higher levels

  // Core surface starting point (from Layer 6 geometric shell)
  const coreRadius = 4.5;
  const startPos = useMemo(() => {
    // Normalize and scale to core surface
    const vec = new THREE.Vector3(...position).normalize();
    return [vec.x * coreRadius, vec.y * coreRadius, vec.z * coreRadius];
  }, [position]);

  // Main dendrite curve - organic growth from core to module area
  const mainCurve = useMemo(() => {
    return generateOrganicPath(startPos, position, 0.5, 2.0);
  }, [startPos, position]);

  // Generate 3-5 branch points along main dendrite
  const branches = useMemo(() => {
    const branchCount = 3 + Math.floor(level / 10); // 3-5 branches based on level
    const branchData = [];

    for (let i = 0; i < Math.min(branchCount, 5); i++) {
      // Branch split occurs at 30-70% along main dendrite
      const splitPoint = 0.3 + (i / branchCount) * 0.4;
      const branchStart = mainCurve.getPointAt(splitPoint);

      // Branch angle: 25-40 degrees from main
      const angle = (25 + Math.random() * 15) * (Math.PI / 180);
      const rotationAxis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();

      // Branch direction
      const mainDirection = mainCurve.getTangentAt(splitPoint);
      const branchDirection = mainDirection.clone()
        .applyAxisAngle(rotationAxis, angle)
        .normalize();

      // Branch length: 2-4 units
      const branchLength = 2 + Math.random() * 2;
      const branchEnd = branchStart.clone().add(branchDirection.multiplyScalar(branchLength));

      branchData.push({
        curve: generateOrganicPath(
          [branchStart.x, branchStart.y, branchStart.z],
          [branchEnd.x, branchEnd.y, branchEnd.z],
          0.5,
          1.0
        ),
        splitPoint
      });
    }

    return branchData;
  }, [mainCurve, level]);

  // Multi-layer geometries: inner core, middle layer, outer glow
  const layerGeometries = useMemo(() => {
    const baseWidth = 0.08 + (level / 50) * 0.07; // Scales with level

    return {
      outerGlow: new THREE.TubeGeometry(mainCurve, 64, baseWidth * 3, 8, false),
      middleLayer: new THREE.TubeGeometry(mainCurve, 64, baseWidth, 8, false),
      innerCore: new THREE.TubeGeometry(mainCurve, 64, baseWidth * 0.4, 8, false)
    };
  }, [mainCurve, level]);

  // Branch geometries
  const branchGeometries = useMemo(() => {
    return branches.map(branch => {
      const branchWidth = 0.04; // Thinner than main
      return {
        outer: new THREE.TubeGeometry(branch.curve, 32, branchWidth * 2, 6, false),
        middle: new THREE.TubeGeometry(branch.curve, 32, branchWidth, 6, false),
        inner: new THREE.TubeGeometry(branch.curve, 32, branchWidth * 0.4, 6, false)
      };
    });
  }, [branches]);

  // Pulse data - staggered phase offsets for continuous flow
  const pulses = useMemo(() => {
    return Array.from({ length: pulseCount }, (_, i) => ({
      id: `pulse-${i}`,
      phase: (i / pulseCount) * Math.PI * 2, // Evenly distributed around cycle
      size: 0.12 + Math.random() * 0.06,
    }));
  }, [pulseCount]);

  // Branch pulses - 1-2 pulses per branch
  const branchPulses = useMemo(() => {
    return branches.map((branch, branchIdx) => {
      const branchPulseCount = 1 + Math.floor(Math.random() * 2); // 1-2 pulses
      return Array.from({ length: branchPulseCount }, (_, i) => ({
        id: `branch-${branchIdx}-pulse-${i}`,
        phase: Math.random() * Math.PI * 2,
        size: 0.08 + Math.random() * 0.04,
      }));
    });
  }, [branches]);

  // Animation: electrical pulses, sway
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Gentle sway - underwater plant effect
    if (mainDendriteRef.current) {
      const swayX = Math.sin(t * 0.5 + position[0]) * 0.02;
      const swayZ = Math.cos(t * 0.6 + position[2]) * 0.02;
      mainDendriteRef.current.rotation.x = swayX;
      mainDendriteRef.current.rotation.z = swayZ;
    }

    // Module node hover effect
    if (moduleNodeRef.current) {
      const targetScale = isHovered ? 1.4 : 1.0;
      moduleNodeRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }

    // Main dendrite electrical pulses - travel along curve
    pulses.forEach((pulse, idx) => {
      if (pulseRefs.current[idx]) {
        // Calculate position along curve (0 to 1)
        const progress = ((t * pulseSpeed + pulse.phase) % (Math.PI * 2)) / (Math.PI * 2);
        const point = mainCurve.getPointAt(progress);

        pulseRefs.current[idx].position.copy(point);

        // Pulse size variation - grows and shrinks slightly
        const sizeVariation = 1 + Math.sin(t * 3 + pulse.phase) * 0.2;
        pulseRefs.current[idx].scale.setScalar(sizeVariation);

        // Flash effect when reaching module node (progress > 0.95)
        const flashIntensity = progress > 0.95 ? 2.0 : 1.0;
        if (pulseRefs.current[idx].material) {
          pulseRefs.current[idx].material.emissiveIntensity = 4.0 * flashIntensity;
        }
      }
    });

    // Branch pulses - travel along each branch curve
    branches.forEach((branch, branchIdx) => {
      branchPulses[branchIdx]?.forEach((pulse, pulseIdx) => {
        const refIdx = branchIdx * 10 + pulseIdx; // Unique index
        if (branchPulseRefs.current[refIdx]) {
          // Calculate position along branch curve
          const progress = ((t * pulseSpeed * 0.8 + pulse.phase) % (Math.PI * 2)) / (Math.PI * 2);
          const point = branch.curve.getPointAt(progress);

          branchPulseRefs.current[refIdx].position.copy(point);

          // Pulse size variation
          const sizeVariation = 1 + Math.sin(t * 3 + pulse.phase) * 0.15;
          branchPulseRefs.current[refIdx].scale.setScalar(sizeVariation);
        }
      });
    });
  });

  return (
    <group ref={mainDendriteRef}>
      {/* ===== MAIN DENDRITE - Multi-layer rendering ===== */}

      {/* Layer 1: Outer glow - soft wide halo */}
      <mesh geometry={layerGeometries.outerGlow}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Layer 2: Middle layer - main visible tube */}
      <mesh geometry={layerGeometries.middleLayer}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.0}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Layer 3: Inner core - bright energy stream */}
      <mesh geometry={layerGeometries.innerCore}>
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={4.0}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* ===== SECONDARY BRANCHES ===== */}
      {branches.map((branch, idx) => (
        <group key={`branch-${idx}`} ref={el => branchRefs.current[idx] = el}>
          {/* Branch outer glow */}
          <mesh geometry={branchGeometries[idx].outer}>
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Branch middle layer */}
          <mesh geometry={branchGeometries[idx].middle}>
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.5}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Branch inner core */}
          <mesh geometry={branchGeometries[idx].inner}>
            <meshStandardMaterial
              color="#ffffff"
              emissive={color}
              emissiveIntensity={3.0}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* ===== MODULE NODE at end ===== */}
      <mesh
        ref={moduleNodeRef}
        position={position}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 4.0 : 2.8}
          transparent
          opacity={isHovered ? 1.0 : 0.9}
        />
        <pointLight
          position={[0, 0, 0]}
          intensity={isHovered ? 4.0 : 2.5}
          color={color}
          distance={12}
        />
      </mesh>

      {/* ===== ELECTRICAL PULSES - Main dendrite ===== */}
      {pulses.map((pulse, idx) => (
        <group key={pulse.id} ref={el => pulseRefs.current[idx] = el}>
          {/* Main pulse sphere */}
          <mesh>
            <sphereGeometry args={[pulse.size, 12, 12]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={4.0}
              transparent
              opacity={0.95}
            />
          </mesh>

          {/* Outer glow for pulse */}
          <mesh>
            <sphereGeometry args={[pulse.size * 2, 12, 12]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.3}
            />
          </mesh>

          {/* Point light for dynamic lighting */}
          <pointLight
            position={[0, 0, 0]}
            intensity={1.5}
            color={color}
            distance={3}
          />
        </group>
      ))}

      {/* ===== ELECTRICAL PULSES - Branch dendrites ===== */}
      {branches.map((branch, branchIdx) => (
        branchPulses[branchIdx]?.map((pulse, pulseIdx) => {
          const refIdx = branchIdx * 10 + pulseIdx;
          return (
            <group key={pulse.id} ref={el => branchPulseRefs.current[refIdx] = el}>
              {/* Branch pulse sphere */}
              <mesh>
                <sphereGeometry args={[pulse.size, 10, 10]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={3.5}
                  transparent
                  opacity={0.9}
                />
              </mesh>

              {/* Outer glow */}
              <mesh>
                <sphereGeometry args={[pulse.size * 1.8, 10, 10]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.25}
                />
              </mesh>

              {/* Small point light */}
              <pointLight
                position={[0, 0, 0]}
                intensity={0.8}
                color={color}
                distance={2}
              />
            </group>
          );
        })
      ))}
    </group>
  );
}

// Cross-Connection Component - Thin bridges between nearby modules
function CrossConnection({ start, end, color1, color2 }) {
  const connectionRef = useRef();
  const pulseRef = useRef();

  // Generate organic curve between two module positions
  const connectionCurve = useMemo(() => {
    return generateOrganicPath(start, end, 0.5, 1.2);
  }, [start, end]);

  // Connection geometry - very thin tube
  const connectionGeometry = useMemo(() => {
    return new THREE.TubeGeometry(connectionCurve, 32, 0.025, 6, false);
  }, [connectionCurve]);

  // Blended color for connection
  const blendedColor = useMemo(() => {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    return '#' + c1.lerp(c2, 0.5).getHexString();
  }, [color1, color2]);

  // Single pulse traveling along connection
  const [pulsePhase] = useState(Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Gentle sway animation
    if (connectionRef.current) {
      const sway = Math.sin(t * 0.3 + pulsePhase) * 0.01;
      connectionRef.current.rotation.z = sway;
    }

    // Pulse animation - slower than main dendrite pulses
    if (pulseRef.current) {
      const progress = ((t * 0.1 + pulsePhase) % (Math.PI * 2)) / (Math.PI * 2);
      const point = connectionCurve.getPointAt(progress);
      pulseRef.current.position.copy(point);

      // Subtle size variation
      const sizeVariation = 1 + Math.sin(t * 2 + pulsePhase) * 0.15;
      pulseRef.current.scale.setScalar(sizeVariation);
    }
  });

  return (
    <group ref={connectionRef}>
      {/* Outer glow layer */}
      <mesh geometry={connectionGeometry}>
        <meshStandardMaterial
          color={blendedColor}
          emissive={blendedColor}
          emissiveIntensity={0.4}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner core layer */}
      <mesh geometry={connectionGeometry}>
        <meshStandardMaterial
          color={blendedColor}
          emissive={blendedColor}
          emissiveIntensity={1.0}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Traveling pulse */}
      <group ref={pulseRef}>
        <mesh>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color={blendedColor}
            emissive={blendedColor}
            emissiveIntensity={2.5}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Pulse glow */}
        <mesh>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial
            color={blendedColor}
            transparent
            opacity={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

// Export: Render all organic dendrites for each module + cross-connections
export default function NeuralPathways({ modules }) {
  // Calculate cross-connections between nearby modules
  const crossConnections = useMemo(() => {
    const connections = [];
    const maxDistance = 12; // Only connect modules within this distance

    for (let i = 0; i < modules.length; i++) {
      for (let j = i + 1; j < modules.length; j++) {
        const mod1 = modules[i];
        const mod2 = modules[j];

        // Calculate distance between modules
        const dx = mod1.position[0] - mod2.position[0];
        const dy = mod1.position[1] - mod2.position[1];
        const dz = mod1.position[2] - mod2.position[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Create connection if within range
        if (distance < maxDistance) {
          connections.push({
            id: `connection-${mod1.id}-${mod2.id}`,
            start: mod1.position,
            end: mod2.position,
            color1: mod1.color,
            color2: mod2.color,
          });
        }
      }
    }

    return connections;
  }, [modules]);

  return (
    <group>
      {/* Main dendrites from core to each module */}
      {modules.map((module) => (
        <OrganicDendrite key={module.id} module={module} />
      ))}

      {/* Cross-connections between nearby modules */}
      {crossConnections.map((connection) => (
        <CrossConnection
          key={connection.id}
          start={connection.start}
          end={connection.end}
          color1={connection.color1}
          color2={connection.color2}
        />
      ))}
    </group>
  );
}
