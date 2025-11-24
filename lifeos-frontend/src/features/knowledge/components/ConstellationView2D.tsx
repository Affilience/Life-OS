import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { CosmicBackground } from './CosmicBackground';
import type { Constellation, KnowledgeStar } from '../types/constellation';

interface ConstellationView2DProps {
  constellations: Constellation[];
  onStarClick: (star: KnowledgeStar) => void;
  selectedStarId?: string | null;
}

/**
 * 2D Constellation Viewer inspired by Skyrim's skill trees
 * Features authentic constellation patterns, beautiful cosmic background,
 * and smooth navigation between knowledge constellations
 */
export function ConstellationView2D({
  constellations,
  onStarClick,
  selectedStarId
}: ConstellationView2DProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredStar, setHoveredStar] = useState<KnowledgeStar | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 3);
    setZoom(newZoom);
  };

  // Handle mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const zoomIn = () => setZoom(Math.min(3, zoom + 0.3));
  const zoomOut = () => setZoom(Math.max(0.5, zoom - 0.3));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Cosmic Background */}
      <CosmicBackground />

      {/* Constellation Canvas */}
      <div
        className="absolute inset-0 transition-transform duration-200"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center'
        }}
      >
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0"
          style={{ minWidth: '200%', minHeight: '200%', left: '-50%', top: '-50%' }}
        >
          {/* Render each constellation */}
          {constellations.map((constellation, index) => (
            <ConstellationGroup
              key={constellation.id}
              constellation={constellation}
              index={index}
              totalCount={constellations.length}
              onStarClick={onStarClick}
              onStarHover={setHoveredStar}
              selectedStarId={selectedStarId}
              hoveredStarId={hoveredStar?.id}
            />
          ))}
        </svg>
      </div>

      {/* Constellation Names Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center'
        }}
      >
        {constellations.map((constellation, index) => {
          const position = getConstellationPosition(index, constellations.length);
          return (
            <motion.div
              key={`label-${constellation.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="absolute"
              style={{
                left: `${position.x}px`,
                top: `${position.y - 100}px`,
                transform: 'translate(-50%, 0)'
              }}
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold cosmic-title mb-2">
                  {constellation.name}
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: constellation.color }}
                  />
                  <span className="text-sm text-white/60">
                    {constellation.stars.length} {constellation.stars.length === 1 ? 'star' : 'stars'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={zoomIn}
          className="p-3 rounded-xl cosmic-panel cosmic-border cosmic-glow backdrop-blur-md"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={zoomOut}
          className="p-3 rounded-xl cosmic-panel cosmic-border cosmic-glow backdrop-blur-md"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetView}
          className="p-3 rounded-xl cosmic-panel cosmic-border cosmic-glow backdrop-blur-md"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Hovered Star Tooltip */}
      <AnimatePresence>
        {hoveredStar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
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

      {/* Instructions */}
      <div className="absolute top-6 left-6 z-10">
        <div className="cosmic-panel cosmic-border rounded-xl p-4 backdrop-blur-md max-w-xs">
          <h3 className="text-lg font-bold cosmic-title mb-2">Navigation</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>🖱️ Drag to pan</p>
            <p>🔍 Scroll to zoom</p>
            <p>✨ Click stars to view details</p>
            <p>🎯 Hover stars for info</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual constellation group with stars and connecting lines
 */
function ConstellationGroup({
  constellation,
  index,
  totalCount,
  onStarClick,
  onStarHover,
  selectedStarId,
  hoveredStarId
}: {
  constellation: Constellation;
  index: number;
  totalCount: number;
  onStarClick: (star: KnowledgeStar) => void;
  onStarHover: (star: KnowledgeStar | null) => void;
  selectedStarId?: string | null;
  hoveredStarId?: string;
}) {
  const basePosition = getConstellationPosition(index, totalCount);

  // Generate constellation pattern (authentic astronomical patterns)
  const pattern = generateConstellationPattern(constellation.stars.length);

  return (
    <g>
      {/* Connection Lines */}
      {pattern.connections.map((connection, i) => {
        const star1 = constellation.stars[connection.from];
        const star2 = constellation.stars[connection.to];
        if (!star1 || !star2) return null;

        const pos1 = pattern.positions[connection.from];
        const pos2 = pattern.positions[connection.to];

        return (
          <motion.line
            key={`line-${i}`}
            x1={basePosition.x + pos1.x}
            y1={basePosition.y + pos1.y}
            x2={basePosition.x + pos2.x}
            y2={basePosition.y + pos2.y}
            stroke={constellation.color}
            strokeWidth="2"
            strokeOpacity="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 1, delay: index * 0.2 + i * 0.05 }}
          />
        );
      })}

      {/* Stars */}
      {constellation.stars.map((star, starIndex) => {
        const position = pattern.positions[starIndex];
        if (!position) return null;

        const isSelected = selectedStarId === star.id;
        const isHovered = hoveredStarId === star.id;
        const starSize = 4 + star.size * 3;

        return (
          <g
            key={star.id}
            transform={`translate(${basePosition.x + position.x}, ${basePosition.y + position.y})`}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onStarClick(star);
            }}
            onMouseEnter={() => onStarHover(star)}
            onMouseLeave={() => onStarHover(null)}
          >
            {/* Star glow (large) */}
            <motion.circle
              r={starSize * 4}
              fill={star.color}
              opacity={isSelected ? 0.3 : isHovered ? 0.25 : 0.15}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.2 + starIndex * 0.05, type: 'spring' }}
            />

            {/* Star glow (medium) */}
            <motion.circle
              r={starSize * 2}
              fill={star.color}
              opacity={isSelected ? 0.5 : isHovered ? 0.4 : 0.3}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.2 + starIndex * 0.05, type: 'spring' }}
            >
              <animate
                attributeName="opacity"
                values={isSelected ? "0.5;0.7;0.5" : "0.3;0.4;0.3"}
                dur="3s"
                repeatCount="indefinite"
              />
            </motion.circle>

            {/* Star core */}
            <motion.circle
              r={starSize}
              fill="white"
              initial={{ scale: 0 }}
              animate={{ scale: isSelected ? 1.3 : isHovered ? 1.2 : 1 }}
              transition={{ delay: index * 0.2 + starIndex * 0.05, type: 'spring' }}
            >
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </motion.circle>

            {/* Selection ring */}
            {isSelected && (
              <motion.circle
                r={starSize * 2.5}
                fill="none"
                stroke={star.color}
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                transition={{ type: 'spring' }}
              >
                <animate
                  attributeName="r"
                  values={`${starSize * 2.5};${starSize * 3};${starSize * 2.5}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </motion.circle>
            )}
          </g>
        );
      })}
    </g>
  );
}

/**
 * Calculate base position for each constellation in a circular layout
 */
function getConstellationPosition(index: number, total: number) {
  const centerX = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const centerY = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const radius = Math.min(centerX, centerY) * 0.6;

  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;

  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius
  };
}

/**
 * Generate authentic constellation pattern based on number of stars
 * Creates patterns similar to real astronomical constellations
 */
function generateConstellationPattern(starCount: number) {
  const positions: Array<{ x: number; y: number }> = [];
  const connections: Array<{ from: number; to: number }> = [];

  // Different patterns based on star count
  if (starCount <= 3) {
    // Triangle pattern
    positions.push({ x: 0, y: -60 });
    positions.push({ x: -52, y: 30 });
    positions.push({ x: 52, y: 30 });
    if (starCount >= 2) connections.push({ from: 0, to: 1 });
    if (starCount === 3) {
      connections.push({ from: 1, to: 2 });
      connections.push({ from: 2, to: 0 });
    }
  } else if (starCount <= 5) {
    // W or M pattern (like Cassiopeia)
    for (let i = 0; i < starCount; i++) {
      const x = (i - starCount / 2) * 50;
      const y = i % 2 === 0 ? -30 : 30;
      positions.push({ x, y });
      if (i > 0) connections.push({ from: i - 1, to: i });
    }
  } else if (starCount <= 7) {
    // Dipper pattern (like Big Dipper)
    const dipperPoints = [
      { x: -80, y: 0 },
      { x: -60, y: -40 },
      { x: -20, y: -50 },
      { x: 20, y: -40 },
      { x: 40, y: 0 },
      { x: 60, y: 40 },
      { x: 80, y: 60 }
    ];
    for (let i = 0; i < starCount; i++) {
      positions.push(dipperPoints[i] || { x: Math.random() * 100 - 50, y: Math.random() * 100 - 50 });
      if (i > 0) connections.push({ from: i - 1, to: i });
    }
  } else {
    // Complex pattern with branching
    const angleStep = (Math.PI * 2) / Math.ceil(starCount / 2);
    let currentAngle = 0;

    for (let i = 0; i < starCount; i++) {
      const radius = 40 + (i % 3) * 30;
      const x = Math.cos(currentAngle) * radius;
      const y = Math.sin(currentAngle) * radius;
      positions.push({ x, y });

      if (i > 0) {
        connections.push({ from: i - 1, to: i });
      }
      if (i > 2 && i % 3 === 0) {
        connections.push({ from: 0, to: i });
      }

      currentAngle += angleStep;
    }
  }

  // Fill remaining positions if needed
  while (positions.length < starCount) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 40 + Math.random() * 60;
    positions.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
  }

  return { positions, connections };
}
