'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

// DEV MODE: Set to true to enable dragging icons into position
const DEV_DRAG_MODE = false;

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const modules = [
  { name: "Productivity", icon: "/assets/icons/module_productivity.png", color: "#8b5cf6", description: "Tasks that get done", iconOffset: { x: -22, y: -26 } },
  { name: "Health", icon: "/assets/icons/module_health.png", color: "#22d3ee", description: "Workouts + nutrition", iconOffset: { x: -1, y: -29 } },
  { name: "Financial", icon: "/assets/icons/module_financial.png", color: "#34d399", description: "Track every pound", iconOffset: { x: 10, y: 0 } },
  { name: "Knowledge", icon: "/assets/icons/module_knowledge.png", color: "#fbbf24", description: "Books + ideas", iconOffset: { x: 22, y: 26 } },
  { name: "Journal", icon: "/assets/icons/module_journal.png", color: "#fb7185", description: "Thoughts + mood", iconOffset: { x: -19, y: 32 } },
  { name: "Calendar", icon: "/assets/icons/module_calendar.png", color: "#a78bfa", description: "Time blocking", iconOffset: { x: -31, y: 27 } },
  { name: "Skills", icon: "/assets/icons/module_skills.png", color: "#f472b6", description: "Practice + mastery", iconOffset: { x: -53, y: -2 } },
  { name: "Purpose", icon: "/assets/icons/module_purpose.png", color: "#818cf8", description: "Vision + direction", iconOffset: { x: -43, y: -25 } },
];

// Cross-connections between related modules (pairs of indices) - spider web pattern
const CONNECTIONS = [
  // Outer ring (adjacent modules)
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  // Inner web (skip one)
  [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 0], [7, 1],
  // Deep connections (skip two)
  [0, 3], [1, 4], [2, 5], [3, 6], [4, 7], [5, 0], [6, 1], [7, 2],
  // Cross connections (opposite sides)
  [0, 4], [1, 5], [2, 6], [3, 7],
];

// Calculate position on circle
const getModulePosition = (index: number, total: number, radius: number) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2; // Start from top
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
};

export function Modules() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const moduleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGPathElement | null)[]>([]);
  const crossLineRefs = useRef<(SVGPathElement | null)[]>([]);

  // DEV MODE: Draggable icon offsets
  const [iconOffsets, setIconOffsets] = useState<{ x: number; y: number }[]>(
    modules.map(m => m.iconOffset || { x: 0, y: 0 })
  );
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  // DEV MODE: Drag handlers
  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    if (!DEV_DRAG_MODE) return;
    e.preventDefault();
    e.stopPropagation();
    setDraggingIndex(index);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: iconOffsets[index].x,
      offsetY: iconOffsets[index].y,
    };
  };

  useEffect(() => {
    if (!DEV_DRAG_MODE || draggingIndex === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dragStart = dragStartRef.current;
      if (dragStart === null) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const newX = Math.round(dragStart.offsetX + dx);
      const newY = Math.round(dragStart.offsetY + dy);
      setIconOffsets(prev => {
        const newOffsets = [...prev];
        newOffsets[draggingIndex] = { x: newX, y: newY };
        return newOffsets;
      });
    };

    const handleMouseUp = () => {
      setDraggingIndex(null);
      dragStartRef.current = null;
      // Log all offsets to console
      console.log('📍 Current icon offsets:');
      console.log(JSON.stringify(iconOffsets.map((o, i) => ({ name: modules[i].name, ...o })), null, 2));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingIndex, iconOffsets]);

  useEffect(() => {
    // Skip GSAP animations in dev drag mode
    if (DEV_DRAG_MODE) return;

    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    const RADIUS = 280; // Radius for module positions
    const isMobile = window.innerWidth < 768;

    // On mobile, show content immediately without pinned scrolling
    if (isMobile) {
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.title-word');
        words.forEach((word) => {
          (word as HTMLElement).style.opacity = '1';
          (word as HTMLElement).style.transform = 'none';
        });
      }
      if (subtitleRef.current) subtitleRef.current.style.opacity = '1';
      if (hubRef.current) {
        hubRef.current.style.opacity = '1';
        hubRef.current.style.transform = 'none';
      }
      moduleRefs.current.forEach((mod) => {
        if (mod) {
          mod.style.opacity = '1';
          mod.style.transform = 'none';
        }
      });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=200%',
          scrub: 1.5, // Smoother catch-up synced with Lenis
          pin: true,
          pinSpacing: false, // Seamless transition - AIShowcase pulls in as Modules pushes off
          anticipatePin: 1,
        },
      });

      // BUILD OFFSET: Delay all build animations to allow CharacterReveal to dismantle first
      // CharacterReveal dismantles from 0.68-0.95, and with pinSpacing: false,
      // we need to wait before Modules starts appearing
      const BUILD_OFFSET = 0.12;

      // Phase 1: Title emerges (0.12-0.22) - Delayed start for seamless transition
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.title-word');
        words.forEach((word, i) => {
          tl.fromTo(word,
            { opacity: 0, y: 50, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 0.08, ease: 'back.out(1.7)' },
            BUILD_OFFSET + (i * 0.018)
          );
        });
      }

      if (subtitleRef.current) {
        tl.fromTo(subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.08, ease: 'power3.out' },
          BUILD_OFFSET + 0.08
        );
      }

      // Phase 2: Central hub pulses into existence (0.22-0.32)
      if (hubRef.current) {
        tl.fromTo(hubRef.current,
          { scale: 0, opacity: 0, filter: 'blur(20px)' },
          { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.12, ease: 'elastic.out(1, 0.5)' },
          BUILD_OFFSET + 0.10
        );
      }

      // Phase 3: Connection lines draw from center outward FIRST
      lineRefs.current.forEach((line, i) => {
        if (!line) return;
        const length = line.getTotalLength();
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });

        tl.to(line, {
          strokeDashoffset: 0,
          duration: 0.12,
          ease: 'power2.out',
        }, BUILD_OFFSET + 0.14 + (i * 0.015));
      });

      // Phase 4: Modules fly outward from center along the lines
      moduleRefs.current.forEach((mod, i) => {
        if (!mod) return;
        const pos = getModulePosition(i, modules.length, RADIUS);

        // Start modules at center, hidden
        gsap.set(mod, {
          x: 0,
          y: 0,
          scale: 0,
          opacity: 0,
        });

        // Modules fly out to their positions as lines draw
        tl.to(mod, {
          x: pos.x,
          y: pos.y,
          scale: 1,
          opacity: 1,
          duration: 0.12,
          ease: 'power2.out',
        }, BUILD_OFFSET + 0.16 + (i * 0.015));
      });

      // Phase 5: Cross-connections draw between modules
      crossLineRefs.current.forEach((line, i) => {
        if (!line) return;
        const length = line.getTotalLength();
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });

        tl.to(line, {
          strokeDashoffset: 0,
          duration: 0.08,
          ease: 'power1.inOut',
        }, BUILD_OFFSET + 0.32 + (i * 0.004));
      });

      // ===== DISMANTLING PHASE (0.72-0.95) - Adjusted for BUILD_OFFSET =====

      // Title scatters
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.title-word');
        words.forEach((word, i) => {
          tl.to(word, {
            y: -150 - (i * 30),
            x: (i - 2) * 80,
            opacity: 0,
            rotation: (i - 2) * 15,
            duration: 0.14,
            ease: 'power2.inOut',
          }, 0.72 + (i * 0.015));
        });
      }

      if (subtitleRef.current) {
        tl.to(subtitleRef.current, {
          y: -80,
          opacity: 0,
          duration: 0.12,
          ease: 'power2.inOut',
        }, 0.74);
      }

      // Hub shrinks
      if (hubRef.current) {
        tl.to(hubRef.current, {
          scale: 0,
          opacity: 0,
          filter: 'blur(20px)',
          duration: 0.14,
          ease: 'power2.inOut',
        }, 0.76);
      }

      // Connection lines retract
      lineRefs.current.forEach((line, i) => {
        if (!line) return;
        const length = line.getTotalLength();
        tl.to(line, {
          strokeDashoffset: length,
          duration: 0.12,
          ease: 'power2.inOut',
        }, 0.75 + (i * 0.006));
      });

      // Cross-connections retract
      crossLineRefs.current.forEach((line, i) => {
        if (!line) return;
        const length = line.getTotalLength();
        tl.to(line, {
          strokeDashoffset: length,
          duration: 0.08,
          ease: 'power2.inOut',
        }, 0.74 + (i * 0.003));
      });

      // Modules scatter outward
      moduleRefs.current.forEach((mod, i) => {
        if (!mod) return;
        const pos = getModulePosition(i, modules.length, RADIUS);

        tl.to(mod, {
          x: pos.x * 3,
          y: pos.y * 3,
          scale: 0.3,
          opacity: 0,
          rotation: pos.x > 0 ? 30 : -30,
          duration: 0.14,
          ease: 'power2.inOut',
        }, 0.78 + (i * 0.010));
      });

    }, section);

    return () => ctx.revert();
  }, []);

  const RADIUS = 280;

  // Split title into words
  const titleWords = ["Everything", "Connects.", "Everything", "Counts."];

  return (
    <section
      id="modules"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background effects - matching CharacterReveal for seamless transition */}
      <motion.div
        className="absolute top-[40%] left-[20%] w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[50%] right-[15%] w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="container-wide relative z-10 min-h-screen flex flex-col items-center justify-center">
        {/* Title Section */}
        <div className="text-center mb-4">
          <h2
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            {titleWords.map((word, i) => (
              <span
                key={i}
                className="title-word inline-block mx-2"
                style={{
                  opacity: DEV_DRAG_MODE ? 1 : 0,
                  color: i >= 2 ? (i === 2 ? '#a78bfa' : '#22d3ee') : 'white',
                }}
              >
                {word}
              </span>
            ))}
          </h2>
          <p
            ref={subtitleRef}
            className="text-lg text-white/50 max-w-xl mx-auto"
            style={{ opacity: DEV_DRAG_MODE ? 1 : 0 }}
          >
            Your workout affects your focus. Your sleep affects your mood. Ascnt reveals the connections you'd never spot alone.
          </p>
        </div>

        {/* Constellation Container - scaled down on mobile, extra height for labels */}
        <div className="relative scale-50 md:scale-75 lg:scale-100 origin-center -mt-8" style={{ width: RADIUS * 2 + 200, height: RADIUS * 2 + 280 }}>
          {/* SVG for connection lines */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="hubLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="crossLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Lines from hub to each module */}
            {modules.map((_, i) => {
              const pos = getModulePosition(i, modules.length, RADIUS);
              const centerX = (RADIUS * 2 + 200) / 2; // Match CSS 50%
              const centerY = (RADIUS * 2 + 280) / 2; // Match CSS 50%
              return (
                <path
                  key={`line-${i}`}
                  ref={el => { lineRefs.current[i] = el; }}
                  d={`M ${centerX} ${centerY} L ${centerX + pos.x} ${centerY + pos.y}`}
                  stroke="url(#hubLineGradient)"
                  strokeWidth="2"
                  fill="none"
                  filter="url(#glow)"
                  style={DEV_DRAG_MODE ? { strokeDasharray: 'none', strokeDashoffset: 0 } : undefined}
                />
              );
            })}

            {/* Cross-connections between modules - curved lines */}
            {CONNECTIONS.map(([from, to], i) => {
              const posFrom = getModulePosition(from, modules.length, RADIUS);
              const posTo = getModulePosition(to, modules.length, RADIUS);
              const centerX = (RADIUS * 2 + 200) / 2;
              const centerY = (RADIUS * 2 + 280) / 2;
              // Curved path using quadratic bezier - curve inward toward center
              const midX = (posFrom.x + posTo.x) / 2;
              const midY = (posFrom.y + posTo.y) / 2;
              // Pull the curve toward the center for a web effect
              const curveStrength = 0.3;
              const controlX = midX * (1 - curveStrength);
              const controlY = midY * (1 - curveStrength);
              return (
                <path
                  key={`cross-${i}`}
                  ref={el => { crossLineRefs.current[i] = el; }}
                  d={`M ${centerX + posFrom.x} ${centerY + posFrom.y} Q ${centerX + controlX} ${centerY + controlY} ${centerX + posTo.x} ${centerY + posTo.y}`}
                  stroke="url(#crossLineGradient)"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.6"
                  style={DEV_DRAG_MODE ? { strokeDasharray: 'none', strokeDashoffset: 0 } : undefined}
                />
              );
            })}
          </svg>

          {/* Central Hub */}
          <div
            ref={hubRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, rgba(34,211,238,0.1) 70%, transparent 100%)',
              boxShadow: '0 0 60px rgba(167,139,250,0.4), inset 0 0 30px rgba(167,139,250,0.2)',
              opacity: DEV_DRAG_MODE ? 1 : 0,
            }}
          >
            <div className="text-2xl font-bold text-white/80">OS</div>
          </div>

          {/* Module Nodes - Icon centered on line endpoint, label below */}
          {modules.map((module, i) => {
            const offset = DEV_DRAG_MODE ? iconOffsets[i] : (module.iconOffset || { x: 0, y: 0 });
            const pos = getModulePosition(i, modules.length, RADIUS);
            return (
              <div
                key={module.name}
                ref={el => { moduleRefs.current[i] = el; }}
                className="absolute flex flex-col items-center"
                style={{
                  opacity: DEV_DRAG_MODE ? 1 : 0,
                  // Position so ICON CENTER is at the line endpoint, with per-icon adjustments
                  left: (RADIUS * 2 + 200) / 2 - 32 + offset.x,
                  top: (RADIUS * 2 + 280) / 2 - 32 + offset.y,
                  // In dev mode, show at final position immediately
                  transform: DEV_DRAG_MODE ? `translate(${pos.x}px, ${pos.y}px)` : undefined,
                  cursor: DEV_DRAG_MODE ? 'grab' : 'pointer',
                  zIndex: draggingIndex === i ? 100 : 1,
                }}
                onMouseDown={(e) => handleMouseDown(i, e)}
              >
                {/* DEV MODE: Show offset values */}
                {DEV_DRAG_MODE && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-green-400 px-2 py-0.5 rounded whitespace-nowrap font-mono">
                    x:{offset.x} y:{offset.y}
                  </div>
                )}
                {/* Module Icon - exactly at line endpoint */}
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center p-2"
                  style={{
                    backgroundColor: `${module.color}20`,
                    border: `2px solid ${module.color}40`,
                    boxShadow: `0 0 30px ${module.color}30`,
                  }}
                  whileHover={DEV_DRAG_MODE ? {} : {
                    scale: 1.15,
                    boxShadow: `0 0 50px ${module.color}50`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <img
                    src={module.icon}
                    alt={module.name}
                    className="w-10 h-10 object-contain pointer-events-none"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </motion.div>
                {/* Module Label - positioned below icon */}
                <div className="text-center mt-2 pointer-events-none">
                  <div className="text-sm font-semibold text-white">{module.name}</div>
                  <div className="text-xs text-white/40">{module.description}</div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
