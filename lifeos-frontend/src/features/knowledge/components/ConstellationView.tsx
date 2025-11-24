import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import type { Constellation, KnowledgeStar, ConstellationConnection } from '../types/constellation';

interface ConstellationViewProps {
  constellations: Constellation[];
  connections: ConstellationConnection[];
  onStarClick: (star: KnowledgeStar) => void;
  selectedStarId?: string | null;
}

export function ConstellationView({ constellations, connections, onStarClick, selectedStarId }: ConstellationViewProps) {
  const [hoveredStar, setHoveredStar] = useState<KnowledgeStar | null>(null);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 30, 80], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
        }}
      >
        {/* Deep space background */}
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000814', 50, 300]} />

        {/* Ambient lighting */}
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 50, 50]} intensity={0.5} color="#ffffff" />

        {/* Distant starfield for depth */}
        <Stars
          radius={300}
          depth={100}
          count={8000}
          factor={6}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Render all constellations */}
        {constellations.map((constellation) => (
          <ConstellationGroup
            key={constellation.id}
            constellation={constellation}
            onStarClick={onStarClick}
            onStarHover={setHoveredStar}
            selectedStarId={selectedStarId}
            hoveredStarId={hoveredStar?.id}
          />
        ))}

        {/* Connection lines between stars */}
        <ConnectionLines
          constellations={constellations}
          connections={connections}
          selectedStarId={selectedStarId}
        />

        {/* Nebula clouds for atmosphere */}
        <NebulaCloud position={[30, 10, -40]} color="#8b5cf6" />
        <NebulaCloud position={[-40, -10, 30]} color="#ec4899" />
        <NebulaCloud position={[20, -20, 50]} color="#3b82f6" />

        {/* Camera controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          minDistance={20}
          maxDistance={200}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>

      {/* Tooltip for hovered star */}
      <AnimatePresence>
        {hoveredStar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="cosmic-panel cosmic-border cosmic-glow px-6 py-4 rounded-xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: hoveredStar.color }}
                />
                <div>
                  <h3 className="text-white font-semibold">{hoveredStar.title}</h3>
                  <p className="text-xs text-white/60">{hoveredStar.collectionName}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay */}
      <div className="absolute top-6 left-6 z-10">
        <div className="cosmic-panel cosmic-border rounded-xl p-4 backdrop-blur-md">
          <h2 className="text-xl font-bold cosmic-title mb-2">Knowledge Cosmos</h2>
          <p className="text-sm text-white/60 mb-3">
            {constellations.reduce((sum, c) => sum + c.stars.length, 0)} stars across{' '}
            {constellations.length} constellations
          </p>
          <div className="space-y-2">
            {constellations.map((constellation) => (
              <div key={constellation.id} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: constellation.color }}
                />
                <span className="text-xs text-gray-300">{constellation.name}</span>
                <span className="text-xs text-white/50">({constellation.stars.length})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className="cosmic-panel cosmic-border rounded-xl p-4 backdrop-blur-md">
          <p className="text-xs text-white/60 mb-2">Controls:</p>
          <p className="text-xs text-gray-300">🖱️ Drag to rotate</p>
          <p className="text-xs text-gray-300">🔍 Scroll to zoom</p>
          <p className="text-xs text-gray-300">✨ Click stars to expand</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual constellation group with its stars
 */
function ConstellationGroup({
  constellation,
  onStarClick,
  onStarHover,
  selectedStarId,
  hoveredStarId
}: {
  constellation: Constellation;
  onStarClick: (star: KnowledgeStar) => void;
  onStarHover: (star: KnowledgeStar | null) => void;
  selectedStarId?: string | null;
  hoveredStarId?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle floating animation for the constellation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = constellation.centerPosition[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={constellation.centerPosition}>
      {constellation.stars.map((star) => (
        <Star
          key={star.id}
          star={star}
          onClick={() => onStarClick(star)}
          onHover={() => onStarHover(star)}
          onUnhover={() => onStarHover(null)}
          isSelected={selectedStarId === star.id}
          isHovered={hoveredStarId === star.id}
        />
      ))}

      {/* Constellation name label */}
      <ConstellationLabel
        text={constellation.name}
        position={[0, constellation.radius + 5, 0]}
        color={constellation.color}
      />
    </group>
  );
}

/**
 * Individual star (knowledge piece)
 */
function Star({
  star,
  onClick,
  onHover,
  onUnhover,
  isSelected,
  isHovered
}: {
  star: KnowledgeStar;
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
  isSelected: boolean;
  isHovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Pulsing animation
  useFrame((state) => {
    if (meshRef.current && glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + star.position[0]) * 0.1 + 1;
      const scale = isSelected ? 1.5 : isHovered ? 1.3 : 1;

      meshRef.current.scale.setScalar(scale * pulse);
      glowRef.current.scale.setScalar(scale * pulse * 2);

      // Rotate glow for shimmer effect
      glowRef.current.rotation.z += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={star.position}>
        {/* Main star sphere */}
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
            onHover();
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
            onUnhover();
          }}
        >
          <sphereGeometry args={[star.size, 16, 16]} />
          <meshBasicMaterial
            color={star.color}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Glow effect */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[star.size * 1.5, 16, 16]} />
          <meshBasicMaterial
            color={star.color}
            transparent
            opacity={isSelected ? 0.4 : isHovered ? 0.3 : 0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Lens flare effect for larger stars */}
        {star.size > 1 && (
          <sprite scale={[star.size * 3, star.size * 3, 1]}>
            <spriteMaterial
              map={createLensFlareTexture(star.color)}
              blending={THREE.AdditiveBlending}
              transparent
              opacity={0.6}
            />
          </sprite>
        )}

        {/* Selection ring */}
        {isSelected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[star.size * 2, star.size * 2.2, 32]} />
            <meshBasicMaterial
              color={star.color}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
}

/**
 * Connection lines between related stars
 */
function ConnectionLines({
  constellations,
  connections,
  selectedStarId
}: {
  constellations: Constellation[];
  connections: ConstellationConnection[];
  selectedStarId?: string | null;
}) {
  const allStars = useMemo(
    () => constellations.flatMap(c =>
      c.stars.map(star => ({
        ...star,
        worldPosition: new THREE.Vector3(
          star.position[0] + c.centerPosition[0],
          star.position[1] + c.centerPosition[1],
          star.position[2] + c.centerPosition[2]
        )
      }))
    ),
    [constellations]
  );

  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const colors: number[] = [];

    connections.forEach(conn => {
      const sourceStar = allStars.find(s => s.id === conn.sourceId);
      const targetStar = allStars.find(s => s.id === conn.targetId);

      if (sourceStar && targetStar) {
        // Only show connections within same constellation or if star is selected
        const sameConstellation = sourceStar.collectionId === targetStar.collectionId;
        const isRelevant = selectedStarId === sourceStar.id || selectedStarId === targetStar.id;

        if (sameConstellation || isRelevant) {
          points.push(sourceStar.worldPosition);
          points.push(targetStar.worldPosition);

          const color = new THREE.Color(sourceStar.color);
          colors.push(color.r, color.g, color.b);
          colors.push(color.r, color.g, color.b);
        }
      }
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, [connections, allStars, selectedStarId]);

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        linewidth={2}
      />
    </lineSegments>
  );
}

/**
 * Constellation name label floating above
 */
function ConstellationLabel({ text, position, color }: { text: string; position: [number, number, number]; color: string }) {
  return null; // Will implement with Text component if needed
}

/**
 * Nebula cloud for atmospheric effect
 */
function NebulaCloud({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005;
      meshRef.current.rotation.z += 0.0003;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[20, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.03}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/**
 * Create lens flare texture for bright stars
 */
function createLensFlareTexture(color: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.2, color + '88');
  gradient.addColorStop(0.5, color + '22');
  gradient.addColorStop(1, 'transparent');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
