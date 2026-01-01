'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "One App, Zero Excuses",
    description: "Habits, workouts, journal, finances, learning — everything in one place. No more switching between 5 apps and losing momentum.",
    color: "#8b5cf6",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Actually Want to Open It",
    description: "XP bars, loot drops, boss battles, pet companions. The dopamine hits that keep you coming back — now working for you, not against you.",
    color: "#22d3ee",
    gradient: "from-cyan-500 to-cyan-600",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI That Knows You",
    description: "Nova spots patterns you'd miss: 'Your focus peaks after morning workouts' or 'You sleep 23% better when you journal.' Personalized insights, not generic advice.",
    color: "#fbbf24",
    gradient: "from-amber-500 to-amber-600",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Your Data Stays Yours",
    description: "We don't sell your information. Ever. Your journal entries, health stats, and finances are encrypted and private. Self-host option available.",
    color: "#34d399",
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "Always With You",
    description: "Log a workout at the gym, check your streak on the bus, journal before bed. Web, iOS, Android — your progress syncs everywhere instantly.",
    color: "#fb7185",
    gradient: "from-rose-500 to-rose-600",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    title: "Built for Your Brain",
    description: "Drag, drop, resize. Put your daily habits front and center, hide what you don't need. Your dashboard, your rules.",
    color: "#a78bfa",
    gradient: "from-indigo-500 to-indigo-600",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    const isMobile = window.innerWidth < 768;

    // On mobile, show content immediately without pinned scrolling
    if (isMobile) {
      if (titleRef.current) titleRef.current.style.opacity = '1';
      if (subtitleRef.current) subtitleRef.current.style.opacity = '1';
      cardRefs.current.forEach((card) => {
        if (card) {
          card.style.opacity = '1';
          card.style.transform = 'none';
        }
      });
      return;
    }

    const ctx = gsap.context(() => {
      // Master timeline with scroll trigger - matches other section pattern
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=200%',
          scrub: 1.5,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        },
      });

      // ===== PHASE 1: Title Build (0.20-0.30) - delayed to let AIShowcase finish =====
      if (titleRef.current) {
        // Simple fade-in animation (no DOM manipulation)
        tl.fromTo(titleRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.12, ease: 'power3.out' },
          0.20
        );
      }

      if (subtitleRef.current) {
        tl.fromTo(subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.1, ease: 'power3.out' },
          0.26
        );
      }

      // ===== PHASE 2: Cards Build In (0.30-0.50) - sweep in from bottom =====
      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        // Calculate stagger - center cards first, then outward
        const row = Math.floor(i / 3);
        const col = i % 3;
        const centerOffset = Math.abs(col - 1) + row * 0.5;
        const startTime = 0.30 + centerOffset * 0.04;

        gsap.set(card, {
          opacity: 0,
          y: 120,
          scale: 0.8,
        });

        tl.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.12,
          ease: 'back.out(1.4)',
        }, startTime);
      });

      // ===== PHASE 3: Hold (0.45-0.70) =====
      // Let users read the content

      // ===== PHASE 4: Dismantle (0.70-0.90) =====

      // Cards fade out with stagger - sweep upward
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const row = Math.floor(i / 3);
        const col = i % 3;
        const startTime = 0.70 + (row * 0.02) + (col * 0.01);

        tl.to(card, {
          opacity: 0,
          y: -80,
          scale: 0.85,
          duration: 0.10,
          ease: 'power2.in',
        }, startTime);
      });

      // Title fades out upward
      if (titleRef.current) {
        tl.to(titleRef.current, {
          opacity: 0,
          y: -60,
          duration: 0.10,
          ease: 'power2.in',
        }, 0.82);
      }

      if (subtitleRef.current) {
        tl.to(subtitleRef.current, {
          opacity: 0,
          y: -50,
          duration: 0.08,
          ease: 'power2.in',
        }, 0.85);
      }

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)',
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 60%)',
          }}
          animate={{ scale: [1, 1.15, 1], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container-wide relative z-10 min-h-screen flex flex-col items-center justify-center py-20">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            ref={titleRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 features-title"
          >
            Why Ascnd Actually Works
          </h2>
          <p
            ref={subtitleRef}
            className="text-white/50 max-w-2xl mx-auto text-lg features-subtitle"
          >
            Most habit apps get abandoned in 2 weeks. Ascnd is different — it's designed
            around how your brain actually works, not how productivity gurus think it should.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              ref={el => { cardRefs.current[index] = el; }}
              className="group relative"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {/* Card glow effect on hover */}
              <div
                className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}40, transparent)`,
                }}
              />

              {/* Card content */}
              <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-colors duration-300 h-full">
                {/* Icon */}
                <motion.div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 text-white shadow-lg`}
                  style={{
                    boxShadow: `0 8px 24px ${feature.color}30`,
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.4 }
                  }}
                >
                  {feature.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  {feature.description}
                </p>

                {/* Subtle corner accent */}
                <div
                  className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at top right, ${feature.color}15, transparent 70%)`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
