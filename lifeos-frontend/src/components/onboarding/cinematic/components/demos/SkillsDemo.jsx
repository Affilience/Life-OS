/**
 * Skills Demo - Skyrim-style Constellation
 *
 * Interactive skill constellation using actual perk tree data.
 * Shows the BODY tree constellation as a preview of the skill system.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { animate } from 'animejs';
import { feedback } from '../../../../../services/microInteractions';

// Simplified BODY tree constellation data (from perkTrees.js)
// Warrior/Atlas figure - humanoid shape with spread arms and legs
const SKILL_NODES = [
  // Base/Foundation
  { id: 'foundation', x: 50, y: 85, name: 'Foundation', tier: 'novice', unlocked: true, description: '+10% XP from activities' },
  // Legs (stance)
  { id: 'endurance', x: 35, y: 92, name: 'Endurance', tier: 'novice', unlocked: true, description: 'Cardio gives +20% XP' },
  { id: 'strength', x: 65, y: 92, name: 'Strength', tier: 'novice', unlocked: true, description: 'Training gives +20% XP' },
  // Core
  { id: 'nutrition', x: 50, y: 70, name: 'Nutrition', tier: 'novice', unlocked: true, description: 'Meal logging bonus' },
  { id: 'recovery', x: 50, y: 55, name: 'Recovery', tier: 'adept', unlocked: true, description: 'Sleep tracking XP' },
  // Arms spread
  { id: 'cardio_master', x: 15, y: 45, name: 'Cardio II', tier: 'adept', unlocked: false, description: '+40% cardio XP' },
  { id: 'strength_master', x: 85, y: 45, name: 'Strength II', tier: 'adept', unlocked: false, description: '+40% strength XP' },
  // Heart/Connection
  { id: 'mind_body', x: 50, y: 40, name: 'Mind-Body', tier: 'adept', unlocked: false, description: 'Yoga gives +50% XP' },
  // Neck/Consistency
  { id: 'consistency', x: 50, y: 28, name: 'Consistency', tier: 'expert', unlocked: false, description: '+5% XP per streak day' },
  // Head
  { id: 'peak', x: 50, y: 15, name: 'Peak Form', tier: 'expert', unlocked: false, description: '+50% all activities' },
  // Crown (master)
  { id: 'superhuman', x: 50, y: 2, name: 'Superhuman', tier: 'master', unlocked: false, description: 'Triple XP ultimate' },
];

const CONNECTIONS = [
  // Base to legs
  { from: 'foundation', to: 'endurance' },
  { from: 'foundation', to: 'strength' },
  // Base to core
  { from: 'foundation', to: 'nutrition' },
  // Core progression
  { from: 'nutrition', to: 'recovery' },
  // Arms from recovery
  { from: 'recovery', to: 'cardio_master', dashed: true },
  { from: 'recovery', to: 'strength_master', dashed: true },
  // Heart connection
  { from: 'recovery', to: 'mind_body' },
  // Legs to arms (adept tier)
  { from: 'endurance', to: 'cardio_master' },
  { from: 'strength', to: 'strength_master' },
  // Arms to head path
  { from: 'cardio_master', to: 'consistency', dashed: true },
  { from: 'strength_master', to: 'consistency', dashed: true },
  { from: 'mind_body', to: 'consistency' },
  // Head progression
  { from: 'consistency', to: 'peak' },
  // Crown
  { from: 'peak', to: 'superhuman' },
];

const TIER_COLORS = {
  novice: '#94a3b8',
  adept: '#3b82f6',
  expert: '#a855f7',
  master: '#f59e0b',
};

export default function SkillsDemo({ isActive, onInteract }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const svgRef = useRef(null);
  const linesRef = useRef([]);
  const nodesRef = useRef({});

  // Get node by ID
  const getNodeById = (id) => SKILL_NODES.find((n) => n.id === id);

  // Initial animation
  useEffect(() => {
    if (!isActive || hasAnimated) return;

    const svg = svgRef.current;
    if (!svg) return;

    // Animate lines drawing in
    linesRef.current.forEach((line, index) => {
      if (!line) return;

      const length = line.getTotalLength();
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;

      animate(line, {
        strokeDashoffset: [length, 0],
        opacity: [0, 0.6],
        duration: 600,
        delay: index * 40,
        ease: 'outQuad',
      });
    });

    // Animate nodes appearing
    Object.values(nodesRef.current).forEach((node, index) => {
      if (!node) return;

      animate(node, {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 400,
        delay: 500 + index * 60,
        ease: 'outBack',
      });
    });

    setHasAnimated(true);
  }, [isActive, hasAnimated]);

  // Handle node click
  const handleNodeClick = useCallback((node) => {
    onInteract?.();
    feedback.buttonPress();
    setSelectedNode(selectedNode?.id === node.id ? null : node);

    // Pulse animation on clicked node
    const nodeEl = nodesRef.current[node.id];
    if (nodeEl) {
      animate(nodeEl, {
        scale: [1, 1.4, 1],
        duration: 400,
        ease: 'outBack',
      });
    }
  }, [selectedNode, onInteract]);

  const unlockedCount = SKILL_NODES.filter((n) => n.unlocked).length;

  return (
    <div className="skills-demo">
      {/* Tree Name */}
      <div className="tree-header">
        <span className="tree-name" style={{ color: '#d97757' }}>BODY</span>
        <span className="tree-subtitle">Warrior Constellation</span>
      </div>

      {/* SVG Constellation */}
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="skills-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="bodyLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97757" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
          </linearGradient>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="#d97757" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#d97757" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background nebula glow */}
        <ellipse cx="50" cy="50" rx="40" ry="45" fill="url(#centerGlow)" />

        {/* Background stars */}
        {useMemo(() => [...Array(20)].map((_, i) => (
          <circle
            key={`star-${i}`}
            cx={5 + Math.random() * 90}
            cy={5 + Math.random() * 90}
            r={0.2 + Math.random() * 0.3}
            fill="white"
            opacity={0.15 + Math.random() * 0.25}
          />
        )), [])}

        {/* Connection lines */}
        {CONNECTIONS.map((conn, index) => {
          const from = getNodeById(conn.from);
          const to = getNodeById(conn.to);
          if (!from || !to) return null;

          const isActive = from.unlocked && to.unlocked;

          return (
            <line
              key={`${conn.from}-${conn.to}`}
              ref={(el) => (linesRef.current[index] = el)}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isActive ? '#d97757' : 'url(#bodyLineGradient)'}
              strokeWidth={isActive ? 1.2 : 0.8}
              strokeDasharray={conn.dashed && !isActive ? '2,2' : undefined}
              opacity={0}
            />
          );
        })}

        {/* Skill nodes */}
        {SKILL_NODES.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const tierColor = TIER_COLORS[node.tier];
          const nodeSize = node.tier === 'master' ? 4.5 : node.tier === 'expert' ? 3.5 : 3;

          return (
            <g
              key={node.id}
              ref={(el) => (nodesRef.current[node.id] = el)}
              style={{ cursor: 'pointer', opacity: 0, transformOrigin: `${node.x}px ${node.y}px` }}
              onClick={() => handleNodeClick(node)}
            >
              {/* Glow for unlocked nodes */}
              {node.unlocked && (
                <>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize * 2.5}
                    fill={tierColor}
                    opacity={0.15}
                  >
                    <animate
                      attributeName="opacity"
                      values="0.1;0.25;0.1"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize * 1.5}
                    fill={tierColor}
                    opacity={0.3}
                  />
                </>
              )}

              {/* Main node */}
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeSize}
                fill={node.unlocked ? tierColor : 'rgba(255,255,255,0.15)'}
                stroke={node.unlocked ? 'white' : 'rgba(255,255,255,0.3)'}
                strokeWidth={node.tier === 'master' ? 1 : 0.5}
                filter={node.unlocked ? 'url(#nodeGlow)' : undefined}
              />

              {/* Locked level indicator */}
              {!node.unlocked && (
                <text
                  x={node.x}
                  y={node.y + 1.2}
                  textAnchor="middle"
                  fontSize="3"
                  fill="rgba(255,255,255,0.4)"
                >
                  ?
                </text>
              )}

              {/* Selection ring */}
              {isSelected && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeSize + 3}
                  fill="none"
                  stroke={tierColor}
                  strokeWidth="0.5"
                  opacity={0.8}
                >
                  <animate
                    attributeName="r"
                    values={`${nodeSize + 3};${nodeSize + 5};${nodeSize + 3}`}
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Info panel */}
      {selectedNode ? (
        <div className="skills-info">
          <div className="skills-info-header">
            <div
              className="skills-info-dot"
              style={{ background: TIER_COLORS[selectedNode.tier] }}
            />
            <span className="skills-info-name">{selectedNode.name}</span>
            <span className="skills-info-tier" style={{ color: TIER_COLORS[selectedNode.tier] }}>
              {selectedNode.tier.toUpperCase()}
            </span>
          </div>
          <p className="skills-info-desc">{selectedNode.description}</p>
          {!selectedNode.unlocked && (
            <p className="skills-info-locked">Unlock by leveling up BODY stat</p>
          )}
        </div>
      ) : (
        <div className="skills-info placeholder">
          <p>Tap a star to see perk info</p>
        </div>
      )}

      {/* Stats */}
      <div className="skills-stats">
        <span>{unlockedCount}/{SKILL_NODES.length} perks unlocked</span>
        <span className="skills-stats-hint">6 constellation trees total</span>
      </div>

      <style>{`
        .skills-demo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          height: 100%;
        }

        .tree-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.1rem;
        }

        .tree-name {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-shadow: 0 0 20px currentColor;
        }

        .tree-subtitle {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
        }

        .skills-svg {
          width: 100%;
          max-width: 240px;
          height: auto;
          aspect-ratio: 1;
        }

        .skills-info {
          width: 100%;
          max-width: 260px;
          padding: 0.6rem 0.8rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          min-height: 50px;
        }

        .skills-info.placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .skills-info.placeholder p {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.8rem;
          font-style: italic;
        }

        .skills-info-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.2rem;
        }

        .skills-info-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .skills-info-name {
          font-weight: 700;
          color: white;
          font-size: 0.9rem;
          flex: 1;
        }

        .skills-info-tier {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .skills-info-desc {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
          margin: 0;
        }

        .skills-info-locked {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.65rem;
          font-style: italic;
          margin: 0.3rem 0 0;
        }

        .skills-stats {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.1rem;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .skills-stats-hint {
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
