import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { ImprovedCosmicBackground } from './ImprovedCosmicBackground';
import type { Constellation, KnowledgeStar } from '../types/constellation';

interface SkyrimConstellationViewProps {
  constellations: Constellation[];
  onStarClick: (star: KnowledgeStar) => void;
  selectedStarId?: string | null;
}

/**
 * Skyrim-style constellation viewer
 * Shows ONE constellation at a time with navigation between them
 */
export function SkyrimConstellationView({
  constellations,
  onStarClick,
  selectedStarId
}: SkyrimConstellationViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [hoveredStar, setHoveredStar] = useState<KnowledgeStar | null>(null);

  const currentConstellation = constellations[currentIndex];

  const nextConstellation = () => {
    setCurrentIndex((prev) => (prev + 1) % constellations.length);
    setZoom(1);
  };

  const prevConstellation = () => {
    setCurrentIndex((prev) => (prev - 1 + constellations.length) % constellations.length);
    setZoom(1);
  };

  const zoomIn = () => setZoom(Math.min(2, zoom + 0.2));
  const zoomOut = () => setZoom(Math.max(0.6, zoom - 0.2));

  if (!currentConstellation) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-white text-xl">No constellations found</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Impressive Cosmic Background */}
      <ImprovedCosmicBackground />

      {/* Constellation Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentConstellation.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: zoom }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative"
          >
            <svg
              width="1000"
              height="800"
              viewBox="0 0 1000 800"
              className="drop-shadow-2xl"
            >
              <SingleConstellation
                constellation={currentConstellation}
                onStarClick={onStarClick}
                onStarHover={setHoveredStar}
                selectedStarId={selectedStarId}
                hoveredStarId={hoveredStar?.id}
              />
            </svg>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Constellation Title */}
      <motion.div
        key={`title-${currentConstellation.id}`}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center z-20"
      >
        <h1 className="text-6xl font-bold cosmic-title mb-3 drop-shadow-2xl">
          {currentConstellation.name}
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div
            className="w-4 h-4 rounded-full shadow-lg"
            style={{
              backgroundColor: currentConstellation.color,
              boxShadow: `0 0 20px ${currentConstellation.color}`
            }}
          />
          <span className="text-lg text-gray-300">
            {currentConstellation.stars.length} {currentConstellation.stars.length === 1 ? 'Star' : 'Stars'}
          </span>
        </div>
      </motion.div>

      {/* Navigation Arrows */}
      {constellations.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevConstellation}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 p-4 rounded-full cosmic-panel cosmic-border cosmic-glow backdrop-blur-md"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextConstellation}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 p-4 rounded-full cosmic-panel cosmic-border cosmic-glow backdrop-blur-md"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </motion.button>
        </>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={zoomIn}
          className="p-4 rounded-xl cosmic-panel cosmic-border cosmic-glow backdrop-blur-md"
        >
          <ZoomIn className="w-6 h-6 text-white" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={zoomOut}
          className="p-4 rounded-xl cosmic-panel cosmic-border cosmic-glow backdrop-blur-md"
        >
          <ZoomOut className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {/* Constellation Tabs */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-2 cosmic-panel cosmic-border rounded-full px-4 py-3 backdrop-blur-md">
          {constellations.map((constellation, index) => (
            <motion.button
              key={constellation.id}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setCurrentIndex(index);
                setZoom(1);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
              }`}
              style={{
                backgroundColor: index === currentIndex ? constellation.color : '#4b5563',
                boxShadow: index === currentIndex ? `0 0 15px ${constellation.color}` : 'none'
              }}
              title={constellation.name}
            />
          ))}
        </div>
      </div>

      {/* Hovered Star Tooltip */}
      <AnimatePresence>
        {hoveredStar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="cosmic-panel cosmic-border cosmic-glow px-6 py-4 rounded-xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{
                    backgroundColor: hoveredStar.color,
                    boxShadow: `0 0 10px ${hoveredStar.color}`
                  }}
                />
                <div>
                  <h3 className="text-white font-semibold text-lg">{hoveredStar.title}</h3>
                  <p className="text-sm text-gray-400">{hoveredStar.type}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute top-8 left-8 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="cosmic-panel cosmic-border rounded-xl p-4 backdrop-blur-md"
        >
          <div className="text-sm text-gray-300 space-y-1">
            <p>← → Navigate constellations</p>
            <p>✨ Click stars to view details</p>
            <p>🔍 Zoom in/out</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Render a single constellation with realistic stars and connections
 */
function SingleConstellation({
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
  const pattern = generateConstellationPattern(constellation.stars.length);
  const centerX = 500;
  const centerY = 400;

  return (
    <g>
      {/* Constellation Lines */}
      {pattern.connections.map((connection, i) => {
        const star1 = constellation.stars[connection.from];
        const star2 = constellation.stars[connection.to];
        if (!star1 || !star2) return null;

        const pos1 = pattern.positions[connection.from];
        const pos2 = pattern.positions[connection.to];

        return (
          <motion.line
            key={`line-${i}`}
            x1={centerX + pos1.x}
            y1={centerY + pos1.y}
            x2={centerX + pos2.x}
            y2={centerY + pos2.y}
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeOpacity="0.7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: i * 0.05 }}
            style={{
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8)) drop-shadow(0 0 8px rgba(255,255,255,0.4))'
            }}
          />
        );
      })}

      {/* Stars */}
      {constellation.stars.map((star, starIndex) => {
        const position = pattern.positions[starIndex];
        if (!position) return null;

        return (
          <RealisticStar
            key={star.id}
            star={star}
            x={centerX + position.x}
            y={centerY + position.y}
            isSelected={selectedStarId === star.id}
            isHovered={hoveredStarId === star.id}
            delay={starIndex * 0.08}
            onClick={() => onStarClick(star)}
            onMouseEnter={() => onStarHover(star)}
            onMouseLeave={() => onStarHover(null)}
          />
        );
      })}
    </g>
  );
}

/**
 * Realistic star component with multi-layer glow and twinkle effect
 * Enhanced with varied colors and stronger glows
 */
function RealisticStar({
  star,
  x,
  y,
  isSelected,
  isHovered,
  delay,
  onClick,
  onMouseEnter,
  onMouseLeave
}: {
  star: KnowledgeStar;
  x: number;
  y: number;
  isSelected: boolean;
  isHovered: boolean;
  delay: number;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const baseSize = 4 + star.size * 5; // Larger base size

  // Pure white stars for constellation visibility
  const coreColor = '#ffffff';

  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Massive outer glow */}
      <motion.circle
        cx={x}
        cy={y}
        r={baseSize * 12}
        fill="url(#starGlowOuter)"
        opacity={isSelected ? 0.7 : isHovered ? 0.6 : 0.5}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: isSelected ? 0.7 : isHovered ? 0.6 : 0.5 }}
        transition={{ delay, duration: 0.8, type: 'spring' }}
      >
        <animate
          attributeName="opacity"
          values={isSelected ? "0.7;0.9;0.7" : "0.5;0.7;0.5"}
          dur="4s"
          repeatCount="indefinite"
        />
      </motion.circle>

      {/* Strong middle glow */}
      <motion.circle
        cx={x}
        cy={y}
        r={baseSize * 6}
        fill="url(#starGlowMiddle)"
        opacity={isSelected ? 0.8 : isHovered ? 0.7 : 0.6}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.6, type: 'spring' }}
      >
        <animate
          attributeName="r"
          values={`${baseSize * 6};${baseSize * 7};${baseSize * 6}`}
          dur="3s"
          repeatCount="indefinite"
        />
      </motion.circle>

      {/* Bright inner glow */}
      <motion.circle
        cx={x}
        cy={y}
        r={baseSize * 3}
        fill={star.color}
        opacity={0.9}
        initial={{ scale: 0 }}
        animate={{ scale: isSelected ? 1.3 : isHovered ? 1.2 : 1 }}
        transition={{ delay: delay + 0.2, type: 'spring' }}
        style={{
          filter: `drop-shadow(0 0 ${baseSize * 2}px ${star.color}) drop-shadow(0 0 ${baseSize * 4}px ${star.color})`
        }}
      />

      {/* Star point shape - 4-pointed diamond */}
      <motion.path
        d={`
          M ${x} ${y - baseSize * 2}
          L ${x + baseSize * 0.5} ${y - baseSize * 0.5}
          L ${x + baseSize * 2} ${y}
          L ${x + baseSize * 0.5} ${y + baseSize * 0.5}
          L ${x} ${y + baseSize * 2}
          L ${x - baseSize * 0.5} ${y + baseSize * 0.5}
          L ${x - baseSize * 2} ${y}
          L ${x - baseSize * 0.5} ${y - baseSize * 0.5}
          Z
        `}
        fill="white"
        opacity={0.95}
        initial={{ scale: 0 }}
        animate={{ scale: isSelected ? 1.5 : isHovered ? 1.4 : 1 }}
        transition={{ delay: delay + 0.25, type: 'spring' }}
        style={{
          transformOrigin: `${x}px ${y}px`,
          filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white)'
        }}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${x} ${y}`}
          to={`360 ${x} ${y}`}
          dur="60s"
          repeatCount="indefinite"
        />
      </motion.path>

      {/* Bright core circle */}
      <motion.circle
        cx={x}
        cy={y}
        r={baseSize * 1.2}
        fill={coreColor}
        initial={{ scale: 0 }}
        animate={{ scale: isSelected ? 1.5 : isHovered ? 1.4 : 1 }}
        transition={{ delay: delay + 0.3, type: 'spring' }}
        style={{
          filter: `drop-shadow(0 0 ${baseSize}px white) drop-shadow(0 0 ${baseSize * 2}px white)`
        }}
      >
        <animate
          attributeName="opacity"
          values="0.95;1;0.95"
          dur="2s"
          repeatCount="indefinite"
        />
      </motion.circle>

      {/* Dramatic cross flare for all stars */}
      <g opacity={isSelected ? 1 : isHovered ? 0.9 : 0.7}>
        <motion.line
          x1={x - baseSize * 5}
          y1={y}
          x2={x + baseSize * 5}
          y2={y}
          stroke={coreColor}
          strokeWidth="2"
          opacity="0.8"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: delay + 0.5 }}
          style={{
            transformOrigin: `${x}px ${y}px`,
            filter: 'blur(1px)'
          }}
        />
        <motion.line
          x1={x}
          y1={y - baseSize * 5}
          x2={x}
          y2={y + baseSize * 5}
          stroke={coreColor}
          strokeWidth="2"
          opacity="0.8"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: delay + 0.5 }}
          style={{
            transformOrigin: `${x}px ${y}px`,
            filter: 'blur(1px)'
          }}
        />
        {/* Diagonal flares for extra drama */}
        <motion.line
          x1={x - baseSize * 4}
          y1={y - baseSize * 4}
          x2={x + baseSize * 4}
          y2={y + baseSize * 4}
          stroke={coreColor}
          strokeWidth="1.5"
          opacity="0.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.6 }}
          style={{
            transformOrigin: `${x}px ${y}px`,
            filter: 'blur(1px)'
          }}
        />
        <motion.line
          x1={x - baseSize * 4}
          y1={y + baseSize * 4}
          x2={x + baseSize * 4}
          y2={y - baseSize * 4}
          stroke={coreColor}
          strokeWidth="1.5"
          opacity="0.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.6 }}
          style={{
            transformOrigin: `${x}px ${y}px`,
            filter: 'blur(1px)'
          }}
        />
      </g>

      {/* Selection ring */}
      {isSelected && (
        <motion.circle
          cx={x}
          cy={y}
          r={baseSize * 3.5}
          fill="none"
          stroke={star.color}
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          style={{
            filter: `drop-shadow(0 0 5px ${star.color})`
          }}
        >
          <animate
            attributeName="r"
            values={`${baseSize * 3.5};${baseSize * 4};${baseSize * 3.5}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </motion.circle>
      )}

      {/* SVG Gradients (defined once) */}
      <defs>
        <radialGradient id="starGlowOuter">
          <stop offset="0%" stopColor={star.color} stopOpacity="0.3" />
          <stop offset="50%" stopColor={star.color} stopOpacity="0.1" />
          <stop offset="100%" stopColor={star.color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="starGlowMiddle">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="30%" stopColor={star.color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={star.color} stopOpacity="0" />
        </radialGradient>
      </defs>
    </g>
  );
}

/**
 * Generate complex, interconnected constellation patterns
 * Creates organic, astronomy-inspired layouts with multiple connection paths
 */
function generateConstellationPattern(starCount: number) {
  const positions: Array<{ x: number; y: number }> = [];
  const connections: Array<{ from: number; to: number }> = [];
  const scale = 2.5;

  // Generate star positions in clusters and arcs for organic feel
  if (starCount <= 4) {
    // Diamond/Square pattern with center connections
    const radius = 80 * scale;
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2 - Math.PI / 4;
      positions.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }
    // Create diamond connections
    for (let i = 0; i < starCount; i++) {
      connections.push({ from: i, to: (i + 1) % starCount });
    }
    // Add diagonal connections for complexity
    if (starCount === 4) {
      connections.push({ from: 0, to: 2 });
      connections.push({ from: 1, to: 3 });
    }
  } else if (starCount <= 7) {
    // Create branching tree-like structure
    const centerX = 0;
    const centerY = 0;

    // Central star
    positions.push({ x: centerX, y: centerY });

    // Create 2-3 main branches
    const numBranches = Math.min(3, Math.ceil(starCount / 2));
    const starsPerBranch = Math.floor((starCount - 1) / numBranches);

    let starIndex = 1;
    for (let branch = 0; branch < numBranches; branch++) {
      const branchAngle = (branch / numBranches) * Math.PI * 2 - Math.PI / 2;

      for (let i = 0; i < starsPerBranch && starIndex < starCount; i++) {
        const distance = (50 + i * 40) * scale;
        const angleVariation = (Math.random() - 0.5) * 0.4;
        positions.push({
          x: Math.cos(branchAngle + angleVariation) * distance,
          y: Math.sin(branchAngle + angleVariation) * distance
        });

        // Connect to previous star in branch or to center
        if (i === 0) {
          connections.push({ from: 0, to: starIndex });
        } else {
          connections.push({ from: starIndex - 1, to: starIndex });
        }

        starIndex++;
      }
    }

    // Add remaining stars
    while (starIndex < starCount) {
      const angle = Math.random() * Math.PI * 2;
      const radius = (60 + Math.random() * 60) * scale;
      positions.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
      // Connect to nearest star
      const nearestStar = starIndex > 2 ? Math.floor(Math.random() * (starIndex - 1)) : 0;
      connections.push({ from: nearestStar, to: starIndex });
      starIndex++;
    }

    // Add cross-connections for complexity
    if (starCount >= 5) {
      connections.push({ from: 1, to: 3 });
    }
    if (starCount >= 7) {
      connections.push({ from: 2, to: 4 });
    }
  } else {
    // Large constellation: Create complex web with multiple connection layers

    // Create circular base layout with variations
    const rings = Math.ceil(starCount / 6);
    let starIndex = 0;

    for (let ring = 0; ring < rings && starIndex < starCount; ring++) {
      const starsInRing = ring === 0 ? 1 : Math.min(6 + ring * 2, starCount - starIndex);
      const ringRadius = ring === 0 ? 0 : (50 + ring * 50) * scale;

      for (let i = 0; i < starsInRing && starIndex < starCount; i++) {
        if (ring === 0) {
          // Center star
          positions.push({ x: 0, y: 0 });
        } else {
          const angle = (i / starsInRing) * Math.PI * 2 + (ring * 0.3);
          const radiusVar = ringRadius + (Math.random() - 0.5) * 20 * scale;
          positions.push({
            x: Math.cos(angle) * radiusVar,
            y: Math.sin(angle) * radiusVar
          });
        }

        // Create connections
        if (starIndex > 0) {
          // Connect to previous star in same ring
          if (i > 0) {
            connections.push({ from: starIndex - 1, to: starIndex });
          }

          // Connect first and last star in ring to close the loop
          if (ring > 0 && i === starsInRing - 1) {
            const firstInRing = starIndex - starsInRing + 1;
            connections.push({ from: starIndex, to: firstInRing });
          }

          // Connect to inner ring
          if (ring > 0) {
            const innerRingStart = ring === 1 ? 0 : 1 + (6 + (ring - 2) * 2);
            const innerRingSize = ring === 1 ? 1 : 6 + (ring - 1) * 2;
            const innerStarIndex = innerRingStart + (i % innerRingSize);
            connections.push({ from: innerStarIndex, to: starIndex });
          }
        }

        starIndex++;
      }
    }

    // Add random cross-connections for complexity
    const extraConnections = Math.floor(starCount / 3);
    for (let i = 0; i < extraConnections; i++) {
      const from = Math.floor(Math.random() * starCount);
      const to = Math.floor(Math.random() * starCount);
      if (from !== to && !connections.some(c =>
        (c.from === from && c.to === to) || (c.from === to && c.to === from)
      )) {
        connections.push({ from, to });
      }
    }
  }

  return { positions, connections };
}
