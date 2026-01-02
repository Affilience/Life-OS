'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Module data sources that feed into Nova
const DATA_SOURCES = [
  { id: 'productivity', icon: '✓', label: 'Tasks', color: '#8b5cf6', insight: '87% completion rate' },
  { id: 'health', icon: '💪', label: 'Workouts', color: '#22d3ee', insight: '12 sessions this week' },
  { id: 'journal', icon: '📝', label: 'Mood', color: '#fb7185', insight: 'Trending positive' },
  { id: 'financial', icon: '💰', label: 'Spending', color: '#34d399', insight: '15% under budget' },
  { id: 'sleep', icon: '🌙', label: 'Sleep', color: '#a78bfa', insight: '7.2hr average' },
  { id: 'learning', icon: '📚', label: 'Learning', color: '#fbbf24', insight: '3 books this month' },
];

// AI-generated insights that appear - 4 cards, 2 on each side
// These match what the correlationEngine.js actually detects
const AI_INSIGHTS = [
  {
    title: 'Pattern Spotted',
    content: 'Productivity peaks on Tuesdays (87%) and dips on Fridays (54%).',
    icon: '🔍',
    side: 'left',
    yPos: -80,
  },
  {
    title: 'Hidden Connection',
    content: 'Your workouts are improving your sleep. Keep the 3x/week routine.',
    icon: '🔗',
    side: 'left',
    yPos: 100,
  },
  {
    title: 'Momentum Building',
    content: '7-day streak active. This consistency is spilling into other areas.',
    icon: '🔥',
    side: 'right',
    yPos: -80,
  },
  {
    title: 'Worth Noting',
    content: 'Budget stress may be affecting focus. Review spending this week.',
    icon: '💡',
    side: 'right',
    yPos: 100,
  },
];

// Calculate position on circle - offset upward so sources appear around Nova
const getSourcePosition = (index: number, total: number, radius: number) => {
  // Start from top and go clockwise
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
};

export function AIShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const novaRef = useRef<HTMLDivElement>(null);
  const novaGlowRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const insightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const processingTextRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentInsight, setCurrentInsight] = useState(0);

  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    const RADIUS = 220; // Larger orbit for more impressive visuals
    const isMobile = window.innerWidth < 768;

    // On mobile, show content immediately without pinned scrolling
    if (isMobile) {
      if (titleRef.current) titleRef.current.style.opacity = '1';
      if (subtitleRef.current) subtitleRef.current.style.opacity = '1';
      if (novaRef.current) {
        novaRef.current.style.opacity = '1';
        novaRef.current.style.transform = 'none';
      }
      if (novaGlowRef.current) {
        novaGlowRef.current.style.opacity = '1';
        novaGlowRef.current.style.transform = 'none';
      }
      sourceRefs.current.forEach((ref, i) => {
        if (ref) {
          const pos = getSourcePosition(i, DATA_SOURCES.length, RADIUS);
          ref.style.opacity = '1';
          ref.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        }
      });
      insightRefs.current.forEach((ref, i) => {
        if (ref) {
          ref.style.opacity = '1';
          // Don't position insights on mobile - they'll be in normal flow
        }
      });
      return;
    }

    const ctx = gsap.context(() => {
      // Master timeline with scroll trigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=300%',
          scrub: 1.5,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        },
      });

      // ===== PHASE 1: Title & Subtitle (0.20-0.28) - delayed more to let Modules fully finish =====
      if (titleRef.current) {
        // Simple fade-in animation (matching CharacterReveal pattern - no DOM manipulation)
        tl.fromTo(titleRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.10, ease: 'power3.out' },
          0.20
        );
      }

      if (subtitleRef.current) {
        tl.fromTo(subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.06, ease: 'power3.out' },
          0.26
        );
      }

      // ===== PHASE 2: Nova Core Appears (0.28-0.34) - delayed to avoid overlap with Modules =====
      if (novaRef.current) {
        tl.fromTo(novaRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.08, ease: 'elastic.out(1, 0.5)' },
          0.28
        );
      }

      if (novaGlowRef.current) {
        tl.fromTo(novaGlowRef.current,
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.08, ease: 'power2.out' },
          0.30
        );
      }

      // ===== PHASE 3: Data Sources Appear (0.32-0.40) =====
      DATA_SOURCES.forEach((source, i) => {
        const ref = sourceRefs.current[i];
        if (!ref) return;

        const pos = getSourcePosition(i, DATA_SOURCES.length, RADIUS);

        gsap.set(ref, {
          x: pos.x * 0.3,
          y: pos.y * 0.3,
          scale: 0,
          opacity: 0,
        });

        tl.to(ref, {
          x: pos.x,
          y: pos.y,
          scale: 1,
          opacity: 1,
          duration: 0.05,
          ease: 'back.out(1.7)',
        }, 0.32 + (i * 0.012));
      });

      // ===== PHASE 4: Connection Paths Draw (0.38-0.46) =====
      pathRefs.current.forEach((path, i) => {
        if (!path) return;
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

        tl.to(path, {
          strokeDashoffset: 0,
          duration: 0.06,
          ease: 'power2.inOut',
        }, 0.38 + (i * 0.008));
      });

      // ===== PHASE 5: Data Flows to Nova (0.44-0.52) - Particles =====
      particleRefs.current.forEach((particle, i) => {
        if (!particle) return;
        const sourceIndex = i % DATA_SOURCES.length;
        const pos = getSourcePosition(sourceIndex, DATA_SOURCES.length, RADIUS);
        const waveOffset = Math.floor(i / DATA_SOURCES.length) * 0.02;

        // Particle travels from source to center
        tl.fromTo(particle,
          { x: pos.x, y: pos.y, scale: 1.2, opacity: 1 },
          { x: 0, y: 0, scale: 0, opacity: 0, duration: 0.06, ease: 'power3.in' },
          0.44 + (i * 0.005) + waveOffset
        );
      });

      // ===== PHASE 6: Processing Text Appears (0.48-0.54) =====
      if (processingTextRef.current) {
        tl.fromTo(processingTextRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.04, ease: 'power2.out' },
          0.48
        );

        tl.to(processingTextRef.current,
          { opacity: 0, duration: 0.03 },
          0.54
        );
      }

      // ===== PHASE 7: Insight Cards Fly Out (0.46-0.58) =====
      insightRefs.current.forEach((insight, i) => {
        if (!insight) return;

        // Position insights on sides - 2 left, 2 right (further out for larger layout)
        const insightData = AI_INSIGHTS[i];
        const xOffset = insightData.side === 'left' ? -380 : 380;
        const yOffset = insightData.yPos;

        gsap.set(insight, {
          x: 0,
          y: 0,
          scale: 0,
          opacity: 0,
        });

        tl.to(insight, {
          x: xOffset,
          y: yOffset,
          scale: 1,
          opacity: 1,
          duration: 0.08,
          ease: 'back.out(1.4)',
        }, 0.46 + (i * 0.025));
      });

      // ===== PHASE 8: Hold for reading (0.58-0.68) =====
      // No animations - let users read the insights

      // ===== PHASE 9: Dismantling (0.68-0.85) - earlier exit to avoid overlap =====

      // Insights fade out - fly outward
      insightRefs.current.forEach((insight, i) => {
        if (!insight) return;
        const insightData = AI_INSIGHTS[i];
        const xDirection = insightData.side === 'left' ? -100 : 100;
        tl.to(insight, {
          x: `+=${xDirection}`,
          opacity: 0,
          scale: 0.8,
          duration: 0.05,
          ease: 'power2.in',
        }, 0.68 + (i * 0.008));
      });

      // Paths retract
      pathRefs.current.forEach((path, i) => {
        if (!path) return;
        const length = path.getTotalLength();
        tl.to(path, {
          strokeDashoffset: length,
          duration: 0.04,
          ease: 'power2.in',
        }, 0.70 + (i * 0.003));
      });

      // Sources scatter outward
      DATA_SOURCES.forEach((source, i) => {
        const ref = sourceRefs.current[i];
        if (!ref) return;
        const pos = getSourcePosition(i, DATA_SOURCES.length, RADIUS);

        tl.to(ref, {
          x: pos.x * 2.5,
          y: pos.y * 2.5,
          scale: 0.3,
          opacity: 0,
          duration: 0.05,
          ease: 'power2.in',
        }, 0.72 + (i * 0.006));
      });

      // Nova shrinks - exit earlier to avoid overlap when scrolling back
      if (novaRef.current) {
        tl.to(novaRef.current, {
          scale: 0,
          opacity: 0,
          duration: 0.06,
          ease: 'power2.in',
        }, 0.74);
      }

      if (novaGlowRef.current) {
        tl.to(novaGlowRef.current, {
          scale: 0,
          opacity: 0,
          duration: 0.05,
          ease: 'power2.in',
        }, 0.73);
      }

      // Title fades out upward
      if (titleRef.current) {
        tl.to(titleRef.current, {
          y: -80,
          opacity: 0,
          duration: 0.08,
          ease: 'power2.in',
        }, 0.76);
      }

      if (subtitleRef.current) {
        tl.to(subtitleRef.current, {
          y: -60,
          opacity: 0,
          duration: 0.04,
          ease: 'power2.in',
        }, 0.78);
      }

      // Everything should be gone by 0.82

    }, section);

    return () => ctx.revert();
  }, []);

  const RADIUS = 220; // Larger orbit for impressive visuals
  const NODE_SIZE = 64; // Larger source nodes
  const CONTAINER_SIZE = RADIUS * 2 + 180; // More spacious container
  const CENTER = CONTAINER_SIZE / 2;

  return (
    <section
      id="ai"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background Effects - Multiple layers for depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary glow behind Nova */}
        <motion.div
          className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(34,211,238,0.05) 40%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Secondary accent glow */}
        <motion.div
          className="absolute top-[20%] left-[45%] w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 60%)',
          }}
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Floating particles in background */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`bg-particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-purple-400/30"
            style={{
              left: `${20 + (i * 5)}%`,
              top: `${10 + (i * 5)}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 5 + (i * 0.5),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="container-wide relative z-10 min-h-screen flex flex-col items-center justify-start pt-10 pb-16">
        {/* Title */}
        <div className="text-center mb-6">
          <h2
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{ opacity: 0 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400">Nova</span>
            <span className="text-white"> Sees What You Miss</span>
          </h2>
          <p
            ref={subtitleRef}
            className="text-lg text-white/50 max-w-2xl mx-auto"
            style={{ opacity: 0 }}
          >
            Your AI companion connects the dots across all 8 modules. "You're 40% more productive after morning workouts" — insights like this, automatically.
          </p>
        </div>

        {/* Nova Visualization Container - centered properly, scaled on mobile */}
        <div
          className="relative flex-shrink-0 scale-[0.65] md:scale-75 lg:scale-100 origin-center -mt-16 md:-mt-8 lg:mt-0"
          style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
        >
          {/* SVG for connection paths - properly centered */}
          <svg
            className="absolute pointer-events-none"
            style={{
              width: CONTAINER_SIZE,
              height: CONTAINER_SIZE,
              top: 0,
              left: 0,
              overflow: 'visible'
            }}
          >
            <defs>
              {DATA_SOURCES.map((source, i) => (
                <linearGradient
                  key={`gradient-${i}`}
                  id={`pathGradient-${i}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={source.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.5" />
                </linearGradient>
              ))}
              <filter id="pathGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {/* Energy flow filter */}
              <filter id="energyGlow">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Connection paths from sources to Nova center */}
            {DATA_SOURCES.map((source, i) => {
              const pos = getSourcePosition(i, DATA_SOURCES.length, RADIUS);
              const startX = CENTER + pos.x;
              const startY = CENTER + pos.y;
              const endX = CENTER;
              const endY = CENTER;

              // Create smooth curved path with control point
              const controlX = CENTER + pos.x * 0.4;
              const controlY = CENTER + pos.y * 0.4;

              return (
                <path
                  key={`path-${i}`}
                  ref={el => { pathRefs.current[i] = el; }}
                  d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                  stroke={`url(#pathGradient-${i})`}
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Data Particles (animated dots traveling to center) - more particles */}
          {[...Array(18)].map((_, i) => {
            const sourceIndex = i % DATA_SOURCES.length;
            const source = DATA_SOURCES[sourceIndex];
            return (
              <div
                key={`particle-${i}`}
                ref={el => { particleRefs.current[i] = el; }}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: CENTER,
                  top: CENTER,
                  width: 6 + (i % 3) * 2,
                  height: 6 + (i % 3) * 2,
                  marginLeft: -(3 + (i % 3)),
                  marginTop: -(3 + (i % 3)),
                  backgroundColor: source.color,
                  boxShadow: `0 0 20px ${source.color}, 0 0 40px ${source.color}50`,
                  opacity: 0,
                }}
              />
            );
          })}

          {/* Nova Core - properly centered */}
          <div
            className="absolute"
            style={{
              left: CENTER,
              top: CENTER,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Outer Glow Rings - Larger and more dramatic */}
            <div
              ref={novaGlowRef}
              className="absolute rounded-full opacity-0"
              style={{
                width: 380,
                height: 380,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(34,211,238,0.2) 35%, rgba(139,92,246,0.1) 55%, transparent 70%)',
                animation: isProcessing ? 'pulse 1.5s ease-in-out infinite' : 'none',
              }}
            />

            {/* Nova Character Container - Larger */}
            <motion.div
              ref={novaRef}
              className="relative flex items-center justify-center"
              style={{
                width: 180,
                height: 180,
                opacity: 0,
              }}
              animate={isProcessing ? {
                scale: [1, 1.05, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Glowing backdrop */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(34,211,238,0.2) 60%, transparent 80%)',
                  boxShadow: `
                    0 0 60px rgba(139,92,246,0.6),
                    0 0 120px rgba(139,92,246,0.3),
                    inset 0 0 40px rgba(255,255,255,0.1)
                  `,
                  animation: isProcessing ? 'novaGlow 2s ease-in-out infinite' : 'novaGlow 4s ease-in-out infinite',
                }}
              />

              {/* Nova Character Sprite - Larger */}
              <div className="relative z-10" style={{ imageRendering: 'pixelated' }}>
                <Image
                  src="/assets/nova/nova_stellar.png"
                  alt="Nova AI Companion"
                  width={140}
                  height={140}
                  className="drop-shadow-[0_0_40px_rgba(139,92,246,0.9)]"
                  style={{ imageRendering: 'pixelated' }}
                  priority
                />
              </div>

              {/* Orbiting rings - Larger and more dramatic */}
              <div
                className="absolute rounded-full border-2 border-purple-400/50"
                style={{
                  inset: -35,
                  animation: 'spin 12s linear infinite',
                  boxShadow: '0 0 30px rgba(139,92,246,0.4)',
                }}
              />
              <div
                className="absolute rounded-full border-2 border-cyan-400/40"
                style={{
                  inset: -60,
                  animation: 'spin 18s linear infinite reverse',
                  boxShadow: '0 0 25px rgba(34,211,238,0.3)',
                }}
              />
              <div
                className="absolute rounded-full border border-purple-300/20"
                style={{
                  inset: -85,
                  animation: 'spin 25s linear infinite',
                  boxShadow: '0 0 20px rgba(139,92,246,0.2)',
                }}
              />
              {/* Orbiting dots on the rings - more of them */}
              <div
                className="absolute w-3 h-3 rounded-full bg-purple-400"
                style={{
                  top: -35,
                  left: '50%',
                  marginLeft: -6,
                  animation: 'spin 12s linear infinite',
                  transformOrigin: '6px 125px',
                  boxShadow: '0 0 15px rgba(139,92,246,0.9)',
                }}
              />
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400"
                style={{
                  bottom: -60,
                  left: '50%',
                  marginLeft: -5,
                  animation: 'spin 18s linear infinite reverse',
                  transformOrigin: '5px -145px',
                  boxShadow: '0 0 15px rgba(34,211,238,0.9)',
                }}
              />
              <div
                className="absolute w-2 h-2 rounded-full bg-purple-300"
                style={{
                  top: -85,
                  left: '50%',
                  marginLeft: -4,
                  animation: 'spin 25s linear infinite',
                  transformOrigin: '4px 175px',
                  boxShadow: '0 0 12px rgba(139,92,246,0.7)',
                }}
              />
            </motion.div>

            {/* Processing Text */}
            <div
              ref={processingTextRef}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{ opacity: 0, top: 200 }}
            >
              <motion.span
                className="text-sm text-purple-300 font-medium"
                animate={isProcessing ? { opacity: [0.5, 1, 0.5] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨ Analyzing patterns across your data...
              </motion.span>
            </div>
          </div>

          {/* Data Source Nodes - positioned relative to center, larger */}
          {DATA_SOURCES.map((source, i) => {
            return (
              <div
                key={source.id}
                ref={el => { sourceRefs.current[i] = el; }}
                className="absolute flex flex-col items-center text-center"
                style={{
                  opacity: 0,
                  left: CENTER - 36, // Half of node width (72/2)
                  top: CENTER - 36, // Center the icon (72/2)
                  width: 72,
                }}
              >
                {/* Source Icon with enhanced styling - larger */}
                <motion.div
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-2xl mb-2 relative"
                  style={{
                    backgroundColor: `${source.color}25`,
                    border: `2px solid ${source.color}70`,
                    boxShadow: `0 0 35px ${source.color}50, inset 0 0 20px ${source.color}20`,
                  }}
                  whileHover={{
                    scale: 1.15,
                    boxShadow: `0 0 50px ${source.color}70, inset 0 0 30px ${source.color}30`,
                    borderColor: source.color,
                  }}
                >
                  <span className="relative z-10">{source.icon}</span>
                </motion.div>
                {/* Source Label - larger */}
                <span className="text-xs text-white/90 font-semibold whitespace-nowrap">{source.label}</span>
                <span className="text-[10px] text-white/50 whitespace-nowrap hidden md:block">{source.insight}</span>
              </div>
            );
          })}

          {/* AI Insight Cards - positioned on sides, hidden on mobile/tablet, larger */}
          {AI_INSIGHTS.map((insight, i) => (
            <div
              key={i}
              ref={el => { insightRefs.current[i] = el; }}
              className="absolute w-64 hidden lg:block"
              style={{
                opacity: 0,
                left: CENTER - 128,
                top: CENTER - 70,
              }}
            >
              <div
                className="bg-[#1a1625]/95 backdrop-blur-sm rounded-2xl p-5 border border-white/20 relative overflow-hidden"
                style={{
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.15)',
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    background: 'linear-gradient(90deg, #8b5cf6, #22d3ee, #8b5cf6)',
                  }}
                />
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(34,211,238,0.25))',
                      border: '1px solid rgba(139,92,246,0.4)',
                      boxShadow: '0 0 20px rgba(139,92,246,0.2)',
                    }}
                  >
                    {insight.icon}
                  </div>
                  <span className="text-purple-300 font-bold text-sm tracking-wide">{insight.title}</span>
                </div>
                <p className="text-white/85 text-sm leading-relaxed">
                  {insight.content}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }
        @keyframes novaGlow {
          0%, 100% {
            box-shadow: 0 0 80px rgba(139,92,246,0.7), 0 0 150px rgba(139,92,246,0.4), 0 0 200px rgba(34,211,238,0.2), inset 0 0 50px rgba(255,255,255,0.1);
          }
          50% {
            box-shadow: 0 0 100px rgba(139,92,246,0.9), 0 0 200px rgba(139,92,246,0.5), 0 0 250px rgba(34,211,238,0.3), inset 0 0 70px rgba(255,255,255,0.15);
          }
        }
      `}</style>
    </section>
  );
}
