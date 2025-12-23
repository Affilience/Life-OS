'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Equipment positions from the test page
const DEFAULT_POSITIONS = {
  capes: { x: 47, y: 50, scale: 2.5 },
  legs: { x: 51, y: 109, scale: 2.35 },
  chests: { x: 77, y: 39, scale: 1.5 },
  shields: { x: 125, y: 94, scale: 1.3 },
  helmets: { x: 89, y: -9, scale: 1.1 },
  weapons: { x: 65, y: 58, scale: 0.8 },
};

const CANVAS_SIZE = 256;
const DISPLAY_SCALE = 1.5;

// Equipment to showcase
const SHOWCASE_EQUIPMENT = [
  { slot: 'capes', file: 'shadow_cloak', label: 'Shadow Cloak' },
  { slot: 'legs', file: 'cloth_pants', label: 'Cloth Pants' },
  { slot: 'chests', file: 'aegis_titan', label: 'Aegis Titan' },
  { slot: 'shields', file: 'aegis_of_mastery', label: 'Aegis of Mastery' },
  { slot: 'helmets', file: 'dragon_helm', label: 'Dragon Helm' },
  { slot: 'weapons', file: 'dragon_blade', label: 'Dragon Blade' },
];

// Pets to surround the avatar
const SHOWCASE_PETS = [
  { file: 'pet_phoenix', label: 'Phoenix' },
  { file: 'pet_azure_dragon', label: 'Azure Dragon' },
  { file: 'pet_kitsune_pup', label: 'Kitsune Pup' },
  { file: 'pet_griffin_chick', label: 'Griffin Chick' },
  { file: 'pet_fenrir_pup', label: 'Fenrir Pup' },
  { file: 'pet_pixie', label: 'Pixie' },
];

// Real stats from the app's statsSystem.js
const STAT_BARS = [
  { name: 'Strength', shortName: 'STR', value: 72, color: '#EF4444', icon: '⚔️', description: 'Physical power & fitness' },
  { name: 'Vitality', shortName: 'VIT', value: 85, color: '#10B981', icon: '❤️', description: 'Endurance & health' },
  { name: 'Intelligence', shortName: 'INT', value: 64, color: '#8B5CF6', icon: '🧠', description: 'Learning & knowledge' },
  { name: 'Wisdom', shortName: 'WIS', value: 78, color: '#F59E0B', icon: '✨', description: 'Focus & discipline' },
  { name: 'Defense', shortName: 'DEF', value: 56, color: '#3B82F6', icon: '🛡️', description: 'Resilience & habits' },
];

const LAYER_ORDER = ['capes', 'legs', 'chests', 'shields', 'helmets', 'weapons'];

// Pet positions - spread on sides with even vertical spacing (shifted left to avoid stats overlap)
const PET_POSITIONS = [
  { x: -220, y: -80 },   // Top-left
  { x: -240, y: 60 },    // Mid-left
  { x: -200, y: 180 },   // Bottom-left
  { x: 180, y: -80 },    // Top-right (moved left to avoid stats)
  { x: 200, y: 50 },     // Mid-right (moved left to avoid stats)
  { x: 170, y: 170 },    // Bottom-right (moved left to avoid stats)
];

// Starting positions for equipment spiral-in
const getEquipmentStartPosition = (index: number, total: number) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 400;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    rotation: (index * 60) + 120,
  };
};

export function CharacterReveal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const equipmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const petRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statBarsRef = useRef<HTMLDivElement>(null);
  const statBarFillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const xpBarRef = useRef<HTMLDivElement>(null);
  const xpFillRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
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
      if (subtitleRef.current) {
        subtitleRef.current.style.opacity = '1';
        subtitleRef.current.style.transform = 'none';
      }
      if (avatarRef.current) {
        avatarRef.current.style.opacity = '1';
        avatarRef.current.style.transform = 'none';
        avatarRef.current.style.filter = 'none';
      }
      equipmentRefs.current.forEach((ref) => {
        if (ref) {
          ref.style.opacity = '1';
          ref.style.transform = 'none';
        }
      });
      petRefs.current.forEach((ref) => {
        if (ref) {
          ref.style.opacity = '1';
        }
      });
      if (statBarsRef.current) {
        statBarsRef.current.style.opacity = '1';
        statBarsRef.current.style.transform = 'none';
      }
      statBarFillRefs.current.forEach((ref, i) => {
        if (ref) {
          ref.style.width = `${STAT_BARS[i].value}%`;
        }
      });
      if (xpBarRef.current) {
        xpBarRef.current.style.opacity = '1';
        xpBarRef.current.style.transform = 'none';
      }
      if (xpFillRef.current) {
        xpFillRef.current.style.width = '73%';
      }
      if (statsRef.current) {
        statsRef.current.style.opacity = '1';
        statsRef.current.style.transform = 'none';
      }
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
          pinSpacing: false, // No gap - flows directly into next section
          anticipatePin: 1,
        },
      });

      // Phase 1: Title reveals with split text effect (0-0.12) - START IMMEDIATELY for seamless transition
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.title-word');
        words.forEach((word, i) => {
          tl.fromTo(word,
            { opacity: 0, y: 60, rotationX: -90, transformOrigin: 'top center' },
            { opacity: 1, y: 0, rotationX: 0, duration: 0.08, ease: 'back.out(1.7)' },
            0 + (i * 0.02)  // Start at 0 - no delay
          );
        });
      }

      if (subtitleRef.current) {
        tl.fromTo(subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.08, ease: 'power3.out' },
          0.08  // Tighter timing
        );
      }

      // Phase 2: Avatar zooms in smoothly (0.08-0.25)
      if (avatarRef.current) {
        tl.fromTo(avatarRef.current,
          { scale: 0, opacity: 0, filter: 'blur(40px)' },
          { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.18, ease: 'power2.out' },
          0.08  // Start slightly earlier
        );
      }

      // Phase 3: Equipment spirals in fluidly (0.15-0.38)
      const sortedEquipment = [...SHOWCASE_EQUIPMENT].sort((a, b) =>
        LAYER_ORDER.indexOf(a.slot) - LAYER_ORDER.indexOf(b.slot)
      );

      sortedEquipment.forEach((equipment, sortedIndex) => {
        const originalIndex = SHOWCASE_EQUIPMENT.findIndex(e => e.slot === equipment.slot);
        const ref = equipmentRefs.current[originalIndex];
        if (!ref) return;

        const startPos = getEquipmentStartPosition(originalIndex, SHOWCASE_EQUIPMENT.length);

        gsap.set(ref, {
          x: startPos.x,
          y: startPos.y,
          rotation: startPos.rotation,
          scale: 0.1,
          opacity: 0,
        });

        tl.to(ref, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          duration: 0.1,
          ease: 'back.out(1.4)',
        }, 0.15 + (sortedIndex * 0.03));  // Tighter timing
      });

      // Phase 4: Pets glide in gracefully (0.30-0.45)
      SHOWCASE_PETS.forEach((pet, index) => {
        const ref = petRefs.current[index];
        if (!ref) return;

        const finalPos = PET_POSITIONS[index];
        const startX = finalPos.x * 3;
        const startY = finalPos.y * 3;

        gsap.set(ref, {
          x: startX,
          y: startY,
          scale: 0.2,
          opacity: 0,
          rotation: finalPos.x < 0 ? -30 : 30,
        });

        tl.to(ref, {
          x: finalPos.x,
          y: finalPos.y,
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.1,
          ease: 'power3.out',
        }, 0.30 + (index * 0.022));  // Tighter timing
      });

      // Phase 5: Stat bars slide in with stagger (0.42-0.58)
      if (statBarsRef.current) {
        tl.fromTo(statBarsRef.current,
          { opacity: 0, x: 80 },
          { opacity: 1, x: 0, duration: 0.1, ease: 'power3.out' },
          0.42
        );
      }

      // Animate each stat bar fill smoothly
      statBarFillRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const stat = STAT_BARS[index];
        tl.fromTo(ref,
          { width: '0%' },
          { width: `${stat.value}%`, duration: 0.12, ease: 'power2.out' },
          0.44 + (index * 0.016)
        );
      });

      // XP bar appears after title (0.06-0.15)
      if (xpBarRef.current) {
        tl.fromTo(xpBarRef.current,
          { opacity: 0, y: -30, xPercent: -50, x: -20 },
          { opacity: 1, y: 0, xPercent: -50, x: -20, duration: 0.08, ease: 'power3.out' },
          0.06
        );
      }

      if (xpFillRef.current) {
        tl.fromTo(xpFillRef.current,
          { width: '0%' },
          { width: '73%', duration: 0.15, ease: 'power2.out' },
          0.08
        );
      }

      // Phase 6: Stats counter fade in (0.58-0.68)
      if (statsRef.current) {
        tl.fromTo(statsRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.1, ease: 'power3.out' },
          0.58
        );
      }

      // ===== DISMANTLING PHASE (0.68-0.95) - Smooth and continuous =====

      // Title words scatter upward in different directions
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.title-word');
        const titleExits = [
          { y: -200, x: -150, rotation: -25 },
          { y: -280, x: -50, rotation: 15 },
          { y: -250, x: 80, rotation: -10 },
          { y: -220, x: 180, rotation: 20 },
        ];
        words.forEach((word, i) => {
          const exit = titleExits[i] || titleExits[0];
          tl.to(word, {
            y: exit.y,
            x: exit.x,
            rotation: exit.rotation,
            opacity: 0,
            scale: 0.7,
            duration: 0.18,
            ease: 'power2.inOut',
          }, 0.68 + (i * 0.02));
        });
      }

      // Subtitle fades up
      if (subtitleRef.current) {
        tl.to(subtitleRef.current, {
          y: -100,
          opacity: 0,
          duration: 0.15,
          ease: 'power2.inOut',
        }, 0.70);
      }

      // XP bar slides up and fades
      if (xpBarRef.current) {
        tl.to(xpBarRef.current, {
          y: -150,
          opacity: 0,
          scale: 0.8,
          duration: 0.15,
          ease: 'power2.inOut',
        }, 0.72);
      }

      // Avatar shrinks back with blur
      if (avatarRef.current) {
        tl.to(avatarRef.current, {
          scale: 0.3,
          opacity: 0,
          filter: 'blur(20px)',
          duration: 0.20,
          ease: 'power2.inOut',
        }, 0.74);
      }

      // Equipment spirals outward (reverse of entry)
      sortedEquipment.forEach((equipment, sortedIndex) => {
        const originalIndex = SHOWCASE_EQUIPMENT.findIndex(e => e.slot === equipment.slot);
        const ref = equipmentRefs.current[originalIndex];
        if (!ref) return;

        const exitPos = getEquipmentStartPosition(originalIndex, SHOWCASE_EQUIPMENT.length);
        tl.to(ref, {
          x: exitPos.x * 0.8,
          y: exitPos.y * 0.8,
          rotation: -exitPos.rotation,
          scale: 0.2,
          opacity: 0,
          duration: 0.15,
          ease: 'power2.inOut',
        }, 0.72 + (sortedIndex * 0.02));
      });

      // Pets fly away in amplified directions
      SHOWCASE_PETS.forEach((pet, index) => {
        const ref = petRefs.current[index];
        if (!ref) return;

        const finalPos = PET_POSITIONS[index];
        tl.to(ref, {
          x: finalPos.x * 4,
          y: finalPos.y * 3,
          scale: 0.3,
          opacity: 0,
          rotation: finalPos.x < 0 ? -45 : 45,
          duration: 0.18,
          ease: 'power2.inOut',
        }, 0.75 + (index * 0.018));
      });

      // Stat bars panel slides off to the right
      if (statBarsRef.current) {
        tl.to(statBarsRef.current, {
          x: 300,
          opacity: 0,
          duration: 0.18,
          ease: 'power2.inOut',
        }, 0.78);
      }

      // Quick stats fade down
      if (statsRef.current) {
        tl.to(statsRef.current, {
          y: 80,
          opacity: 0,
          duration: 0.15,
          ease: 'power2.inOut',
        }, 0.80);
      }

    }, section);

    return () => ctx.revert();
  }, []);

  const displaySize = CANVAS_SIZE * DISPLAY_SCALE;

  // Split title into words for animation
  const titleWords = "Become Your Best Self".split(' ');

  return (
    <section
      id="character"
      ref={sectionRef}
      className="relative min-h-screen overflow-x-clip"
    >
      {/* Same background as Hero */}
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

      <div className="container-wide relative z-10 min-h-screen flex flex-col items-center justify-center py-16 overflow-visible">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h2
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 perspective-1000"
          >
            {titleWords.map((word, i) => (
              <span
                key={i}
                className="title-word inline-block mx-2"
                style={{
                  opacity: 0,
                  color: i === 2 ? '#a78bfa' : i === 3 ? '#22d3ee' : 'white',
                }}
              >
                {word}
              </span>
            ))}
          </h2>
          <p
            ref={subtitleRef}
            className="text-lg text-white/50 max-w-xl mx-auto"
            style={{ opacity: 0 }}
          >
            Every action shapes your character. Every habit builds your legend.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col items-center gap-8 relative lg:-translate-x-[100px]">
          {/* XP Bar - Positioned above character area, hidden on mobile */}
          <div
            ref={xpBarRef}
            className="hidden md:block absolute -top-4 w-[300px] lg:w-[500px] z-20"
            style={{ opacity: 0, left: '50%', transform: 'translateX(calc(-50% - 80px))' }}
          >
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span className="font-medium">Level 42</span>
              <span>7,342 / 10,000 XP</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                ref={xpFillRef}
                className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400 rounded-full relative"
                style={{ width: '0%' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            <p className="text-center text-white/40 text-xs mt-1">2,658 XP until next level</p>
          </div>
          {/* Character + Pets Area */}
          <div className="relative flex items-center justify-center w-full lg:w-auto" style={{ maxWidth: displaySize + 500, height: displaySize + 100 }}>
            {/* Pets on sides - hidden on mobile/tablet */}
            {SHOWCASE_PETS.map((pet, index) => {
              const pos = PET_POSITIONS[index];
              return (
                <div
                  key={pet.file}
                  ref={el => { petRefs.current[index] = el; }}
                  className="absolute hidden lg:block"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
                    opacity: 0,
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Image
                      src={`/assets/pets/${pet.file}.png`}
                      alt={pet.label}
                      width={96}
                      height={96}
                      className="[image-rendering:pixelated] drop-shadow-[0_0_20px_rgba(167,139,250,0.6)]"
                      unoptimized
                    />
                  </motion.div>
                </div>
              );
            })}

            {/* Avatar and Equipment */}
            <div
              ref={avatarRef}
              className="relative"
              style={{ width: displaySize, height: displaySize, opacity: 0 }}
            >
              <Image
                src="/assets/avatar/base-evolution/hero_base_stage_10_swordsman.png"
                alt="Stage 10 Swordsman"
                width={displaySize}
                height={displaySize}
                className="[image-rendering:pixelated]"
                priority
                unoptimized
              />

              {/* Equipment Layers */}
              {SHOWCASE_EQUIPMENT.map((equipment, index) => {
                const pos = DEFAULT_POSITIONS[equipment.slot as keyof typeof DEFAULT_POSITIONS];
                const layerIndex = LAYER_ORDER.indexOf(equipment.slot);
                const isBehindAvatar = equipment.slot === 'capes';
                const scaledX = pos.x * DISPLAY_SCALE;
                const scaledY = pos.y * DISPLAY_SCALE;

                return (
                  <div
                    key={equipment.slot}
                    ref={el => { equipmentRefs.current[index] = el; }}
                    className="absolute"
                    style={{
                      left: scaledX,
                      top: scaledY,
                      zIndex: isBehindAvatar ? -1 : layerIndex + 1,
                      opacity: 0,
                    }}
                  >
                    <Image
                      src={`/assets/equipment/${equipment.slot}/${equipment.file}.png`}
                      alt={equipment.label}
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="[image-rendering:pixelated] drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]"
                      style={{
                        width: 'auto',
                        height: 'auto',
                        transform: `scale(${pos.scale * DISPLAY_SCALE})`,
                        transformOrigin: 'top left',
                      }}
                      unoptimized
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stat Bars Panel - hidden on mobile/tablet, positioned to the right on desktop */}
          <div
            ref={statBarsRef}
            className="hidden lg:block lg:absolute lg:right-[-440px] lg:top-1/2 lg:-translate-y-1/2 w-80 space-y-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            style={{ opacity: 0 }}
          >
            <h3 className="text-xl font-bold text-white mb-5">Character Stats</h3>
            {STAT_BARS.map((stat, index) => (
              <div key={stat.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/90 flex items-center gap-2 font-medium">
                    <span className="text-lg">{stat.icon}</span>
                    <span>{stat.name}</span>
                    <span className="text-xs text-white/40 font-normal">({stat.shortName})</span>
                  </span>
                  <span className="text-white font-bold" style={{ color: stat.color }}>{stat.value}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    ref={el => { statBarFillRefs.current[index] = el; }}
                    className="h-full rounded-full transition-all"
                    style={{ width: '0%', backgroundColor: stat.color }}
                  />
                </div>
                <p className="text-xs text-white/40">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div
          ref={statsRef}
          className="flex gap-12 mt-6 text-center lg:-translate-x-[60px]"
          style={{ opacity: 0 }}
        >
          <div>
            <div className="text-3xl font-bold text-purple-400">156</div>
            <div className="text-sm text-white/50">Quests Complete</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-400">23</div>
            <div className="text-sm text-white/50">Day Streak</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-400">12</div>
            <div className="text-sm text-white/50">Achievements</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
}
