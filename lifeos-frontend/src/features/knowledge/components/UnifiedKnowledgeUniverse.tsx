import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Grid3x3 } from 'lucide-react';
import { RealisticUniverseBackground } from './RealisticUniverseBackground';
import { CosmicKnowledgeCard } from './CosmicKnowledgeCard';
import type { Constellation, KnowledgeStar } from '../types/constellation';

interface UnifiedKnowledgeUniverseProps {
  constellations: Constellation[];
  onStarClick: (star: KnowledgeStar) => void;
}

type ViewMode = 'universe' | 'grid';

/**
 * Unified knowledge universe showing all constellations
 * Click a constellation to zoom into card grid view
 */
export function UnifiedKnowledgeUniverse({ constellations, onStarClick }: UnifiedKnowledgeUniverseProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('universe');
  const [selectedConstellation, setSelectedConstellation] = useState<Constellation | null>(null);

  const handleConstellationClick = (constellation: Constellation) => {
    setSelectedConstellation(constellation);
    setViewMode('grid');
  };

  const handleBackToUniverse = () => {
    setViewMode('universe');
    setSelectedConstellation(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Realistic Astronomical Background */}
      <RealisticUniverseBackground />

      <AnimatePresence mode="wait">
        {viewMode === 'universe' ? (
          <motion.div
            key="universe"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <UniverseView
              constellations={constellations}
              onConstellationClick={handleConstellationClick}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <GridView
              constellation={selectedConstellation!}
              onBack={handleBackToUniverse}
              onStarClick={onStarClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Universe view showing all constellations in a neat grid layout
 */
function UniverseView({
  constellations,
  onConstellationClick
}: {
  constellations: Constellation[];
  onConstellationClick: (constellation: Constellation) => void;
}) {
  // Calculate grid layout
  const cols = Math.ceil(Math.sqrt(constellations.length));
  const cellWidth = 100 / cols;
  const cellHeight = 100 / Math.ceil(constellations.length / cols);

  return (
    <div className="relative w-full h-full p-12">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl font-bold cosmic-title mb-2">
          Knowledge Universe
        </h1>
        <p className="text-white/60 text-lg">
          Click any constellation to explore its knowledge
        </p>
      </motion.div>

      {/* Constellation Grid */}
      <div className="relative w-full h-[calc(100%-120px)]">
        <svg className="w-full h-full" viewBox="0 0 1000 800">
          {constellations.map((constellation, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const x = (col + 0.5) * (1000 / cols);
            const y = (row + 0.5) * (800 / Math.ceil(constellations.length / cols));

            return (
              <MiniConstellation
                key={constellation.id}
                constellation={constellation}
                centerX={x}
                centerY={y}
                scale={1.2}
                index={index}
                onClick={() => onConstellationClick(constellation)}
              />
            );
          })}
        </svg>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="cosmic-panel cosmic-border rounded-full px-6 py-3 backdrop-blur-md">
          <p className="text-sm text-gray-300">
            ✨ Click a constellation to view its contents
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Mini constellation for universe view
 */
function MiniConstellation({
  constellation,
  centerX,
  centerY,
  scale,
  index,
  onClick
}: {
  constellation: Constellation;
  centerX: number;
  centerY: number;
  scale: number;
  index: number;
  onClick: () => void;
}) {
  const pattern = generateSimplePattern(constellation.stars.length);

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring' }}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
    >
      {/* Hover glow */}
      <circle
        cx={centerX}
        cy={centerY}
        r={80 * scale}
        fill={constellation.color}
        opacity="0"
        className="hover:opacity-20 transition-opacity duration-300"
      />

      {/* Connection lines - glowing like energy flowing through constellation */}
      {pattern.connections.map((conn, i) => {
        const pos1 = pattern.positions[conn.from];
        const pos2 = pattern.positions[conn.to];
        if (!pos1 || !pos2) return null;

        return (
          <g key={`line-${i}`}>
            {/* Outer glow */}
            <line
              x1={centerX + pos1.x * scale}
              y1={centerY + pos1.y * scale}
              x2={centerX + pos2.x * scale}
              y2={centerY + pos2.y * scale}
              stroke="#88ccff"
              strokeWidth="3"
              strokeOpacity="0.15"
              strokeLinecap="round"
            />
            {/* Middle glow */}
            <line
              x1={centerX + pos1.x * scale}
              y1={centerY + pos1.y * scale}
              x2={centerX + pos2.x * scale}
              y2={centerY + pos2.y * scale}
              stroke="#aaddff"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />
            {/* Core line */}
            <line
              x1={centerX + pos1.x * scale}
              y1={centerY + pos1.y * scale}
              x2={centerX + pos2.x * scale}
              y2={centerY + pos2.y * scale}
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeOpacity="0.8"
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* Stars - dramatic and beautiful constellation stars */}
      {pattern.positions.map((pos, i) => {
        const starX = centerX + pos.x * scale;
        const starY = centerY + pos.y * scale;
        const brightness = 0.75 + Math.random() * 0.25; // Higher brightness
        const size = 3 + brightness * 4; // Larger stars (3-7)

        // Beautiful star colors with more variety
        const colorRoll = Math.random();
        let starColor, glowColor;
        if (colorRoll < 0.2) {
          starColor = '#ffffff'; // Pure white (bright stars)
          glowColor = '#ccddff';
        } else if (colorRoll < 0.4) {
          starColor = '#fffacd'; // Yellow-white
          glowColor = '#ffffaa';
        } else if (colorRoll < 0.6) {
          starColor = '#ffd580'; // Orange
          glowColor = '#ffcc66';
        } else if (colorRoll < 0.8) {
          starColor = '#ffb366'; // Deep orange
          glowColor = '#ff9944';
        } else {
          starColor = '#aaddff'; // Rare blue-white
          glowColor = '#88bbff';
        }

        return (
          <g key={`star-${i}`}>
            {/* Massive outer glow */}
            <circle
              cx={starX}
              cy={starY}
              r={size * 6}
              fill={glowColor}
              opacity={brightness * 0.12}
              filter="blur(2px)"
            >
              <animate
                attributeName="opacity"
                values={`${brightness * 0.08};${brightness * 0.16};${brightness * 0.08}`}
                dur={`${2 + Math.random() * 3}s`}
                repeatCount="indefinite"
              />
            </circle>
            {/* Middle glow */}
            <circle
              cx={starX}
              cy={starY}
              r={size * 3}
              fill={starColor}
              opacity={brightness * 0.25}
            />
            {/* Inner glow */}
            <circle
              cx={starX}
              cy={starY}
              r={size * 1.5}
              fill={starColor}
              opacity={brightness * 0.6}
            />
            {/* Star core - bright and solid */}
            <circle
              cx={starX}
              cy={starY}
              r={size * 0.8}
              fill="white"
              opacity={brightness}
            >
              <animate
                attributeName="opacity"
                values={`${brightness * 0.9};${brightness};${brightness * 0.9}`}
                dur={`${2 + Math.random() * 2}s`}
                repeatCount="indefinite"
              />
            </circle>
            {/* Dramatic 6-pointed star cross */}
            <line
              x1={starX}
              y1={starY - size * 4}
              x2={starX}
              y2={starY + size * 4}
              stroke={starColor}
              strokeWidth="1"
              opacity={brightness * 0.7}
            />
            <line
              x1={starX - size * 4}
              y1={starY}
              x2={starX + size * 4}
              y2={starY}
              stroke={starColor}
              strokeWidth="1"
              opacity={brightness * 0.7}
            />
            <line
              x1={starX - size * 3}
              y1={starY - size * 3}
              x2={starX + size * 3}
              y2={starY + size * 3}
              stroke={starColor}
              strokeWidth="0.8"
              opacity={brightness * 0.5}
            />
            <line
              x1={starX - size * 3}
              y1={starY + size * 3}
              x2={starX + size * 3}
              y2={starY - size * 3}
              stroke={starColor}
              strokeWidth="0.8"
              opacity={brightness * 0.5}
            />
          </g>
        );
      })}

      {/* Constellation label */}
      <text
        x={centerX}
        y={centerY + 90 * scale}
        textAnchor="middle"
        fill="white"
        fontSize="14"
        className="font-semibold"
      >
        {constellation.name}
      </text>
      <text
        x={centerX}
        y={centerY + 105 * scale}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize="11"
      >
        {constellation.stars.length} items
      </text>
    </motion.g>
  );
}

/**
 * Card grid view for selected constellation
 */
function GridView({
  constellation,
  onBack,
  onStarClick
}: {
  constellation: Constellation;
  onBack: () => void;
  onStarClick: (star: KnowledgeStar) => void;
}) {
  return (
    <div className="relative w-full h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 cosmic-panel cosmic-border-bottom backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="p-3 rounded-xl cosmic-panel cosmic-border cosmic-glow"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
              <div>
                <h2 className="text-3xl font-bold cosmic-title">{constellation.name}</h2>
                <p className="text-white/60">{constellation.stars.length} items in this collection</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: constellation.color,
                  boxShadow: `0 0 15px ${constellation.color}`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {constellation.stars.map((star, index) => (
            <CosmicKnowledgeCard
              key={star.id}
              item={star}
              onClick={() => onStarClick(star)}
              index={index}
            />
          ))}
        </div>

        {/* Empty state */}
        {constellation.stars.length === 0 && (
          <div className="text-center py-20">
            <Grid3x3 className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No items in this constellation yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Complex pattern generator for detailed, intricate constellations
 * Creates patterns similar to real constellations (Orion, Cassiopeia, etc.)
 */
function generateSimplePattern(starCount: number) {
  const positions: Array<{ x: number; y: number }> = [];
  const connections: Array<{ from: number; to: number }> = [];

  // More moderate star count for better visibility
  const actualStarCount = Math.max(starCount + 6, 10);

  // Generate stars in multiple layers for depth - more spread out
  const layers = 3;
  const starsPerLayer = Math.ceil(actualStarCount / layers);

  for (let layer = 0; layer < layers; layer++) {
    const layerRadius = 50 + layer * 40; // Much larger radii for spread
    const starsInThisLayer = Math.min(starsPerLayer, actualStarCount - positions.length);

    for (let i = 0; i < starsInThisLayer; i++) {
      const angle = (i / starsInThisLayer) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const radius = layerRadius + (Math.random() - 0.5) * 20;
      positions.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }
  }

  // Create primary structure - connect stars within each layer
  let currentIndex = 0;
  for (let layer = 0; layer < layers; layer++) {
    const starsInLayer = Math.min(starsPerLayer, actualStarCount - currentIndex);

    for (let i = 0; i < starsInLayer; i++) {
      const starIndex = currentIndex + i;
      const nextIndex = currentIndex + ((i + 1) % starsInLayer);

      if (nextIndex !== currentIndex) {
        connections.push({ from: starIndex, to: nextIndex });
      }
    }

    currentIndex += starsInLayer;
  }

  // Add radial connections between layers
  for (let layer = 0; layer < layers - 1; layer++) {
    const layerStart = layer * starsPerLayer;
    const nextLayerStart = (layer + 1) * starsPerLayer;
    const starsInLayer = Math.min(starsPerLayer, actualStarCount - layerStart);

    for (let i = 0; i < starsInLayer; i += 2) {
      const fromIndex = layerStart + i;
      const toIndex = Math.min(nextLayerStart + i, actualStarCount - 1);
      if (toIndex < actualStarCount) {
        connections.push({ from: fromIndex, to: toIndex });
      }
    }
  }

  // Add cross-connections for complexity (like real constellation patterns)
  const numCrossConnections = Math.floor(actualStarCount * 0.4);
  for (let i = 0; i < numCrossConnections; i++) {
    const from = Math.floor(Math.random() * actualStarCount);
    const to = Math.floor(Math.random() * actualStarCount);

    if (from !== to && !connections.find(c =>
      (c.from === from && c.to === to) || (c.from === to && c.to === from)
    )) {
      // Only add if distance is reasonable (adjusted for larger spread)
      const pos1 = positions[from];
      const pos2 = positions[to];
      const dist = Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);

      if (dist < 120) { // Allow longer connections for spread-out pattern
        connections.push({ from, to });
      }
    }
  }

  return { positions, connections };
}
