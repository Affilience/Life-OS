'use client';

/**
 * Screenshots Section - Horizontal Scroll Cinema Gallery
 *
 * Uses GSAP ScrollTrigger with pinSpacing: false.
 * Has slightly longer scroll distance (600%) than Gamification (500%) so it
 * progresses slower, allowing Gamification to fully dismantle before Screenshots builds.
 *
 * Phases:
 * - Cinematic Build (0.55-0.65): Title emerges, first screenshot prominently visible
 * - Horizontal Scroll (0.65-0.78): Smooth gallery scroll with synced progress bar
 * - Cinematic Dismantle (0.78-0.88): 3D exit with blur
 */

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Screenshot data - curated selection for best visual impact
// Mobile screenshots are separate images optimized for portrait view
const screenshots = [
  {
    id: 'nova',
    title: 'Nova AI',
    subtitle: 'Your AI Companion',
    description: 'Get personalized insights and recommendations from your AI life coach.',
    image: '/assets/screenshots/dashboard.png',
    mobileImage: '/assets/screenshots/mobile/nova.png',
    color: '#8b5cf6', // violet
  },
  {
    id: 'modules',
    title: 'Life Modules',
    subtitle: 'Track Everything',
    description: 'Eight interconnected modules to track every aspect of your life.',
    image: '/assets/screenshots/character.png',
    mobileImage: '/assets/screenshots/mobile/modules.png',
    color: '#06b6d4', // cyan
  },
  {
    id: 'streaks',
    title: 'Streak Flames',
    subtitle: 'Daily Streaks',
    description: 'Build powerful habits with visual streak tracking that keeps you motivated.',
    image: '/assets/screenshots/streaks.png',
    mobileImage: '/assets/screenshots/mobile/streaks.png',
    color: '#f97316', // orange
  },
  {
    id: 'bazaar',
    title: 'Cosmic Bazaar',
    subtitle: 'Shop',
    description: 'Spend your hard-earned credits on gear, potions, and cosmetics.',
    image: '/assets/screenshots/bazaar.png',
    mobileImage: '/assets/screenshots/mobile/bazaar.png',
    color: '#ec4899', // pink
  },
  {
    id: 'boss',
    title: 'Boss Battles',
    subtitle: 'Epic Challenges',
    description: 'Take on weekly boss battles and earn legendary rewards.',
    image: '/assets/screenshots/quests.png',
    mobileImage: '/assets/screenshots/mobile/boss.png',
    color: '#ef4444', // red
  },
  {
    id: 'pvp',
    title: 'PvP Arena',
    subtitle: 'Compete',
    description: 'Challenge friends and climb the ranks in real-time battles.',
    image: '/assets/screenshots/skills.png',
    mobileImage: '/assets/screenshots/mobile/pvp.png',
    color: '#f59e0b', // amber
  },
  {
    id: 'leaderboard',
    title: 'Leaderboards',
    subtitle: 'Rankings',
    description: 'See how you stack up against the community on global leaderboards.',
    image: '/assets/screenshots/achievements.png',
    mobileImage: '/assets/screenshots/mobile/leaderboard.png',
    color: '#10b981', // emerald
  },
];

export function Screenshots() {
  const sectionRef = useRef<HTMLElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number>(0);

  // Handle swipe gestures on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        // Swipe left - next
        setCurrentIndex(prev => (prev + 1) % screenshots.length);
      } else {
        // Swipe right - previous
        setCurrentIndex(prev => (prev - 1 + screenshots.length) % screenshots.length);
      }
    }
  };

  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    const horizontal = horizontalRef.current;
    const isMobile = window.innerWidth < 768;

    // On mobile, use scroll-based carousel progression (like Gamification)
    if (isMobile) {
      const handleScroll = () => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Calculate how far through the section we've scrolled
        const scrollProgress = Math.max(0, Math.min(1,
          (viewportHeight - rect.top) / (sectionHeight + viewportHeight)
        ));

        // Map scroll progress to carousel index
        const newIndex = Math.min(
          screenshots.length - 1,
          Math.floor(scrollProgress * screenshots.length)
        );

        setCurrentIndex(newIndex);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial call

      return () => window.removeEventListener('scroll', handleScroll);
    }

    if (!horizontal) return;

    const ctx = gsap.context(() => {
      // Calculate scroll distance for horizontal movement
      const scrollWidth = horizontal.scrollWidth;
      const viewportWidth = window.innerWidth;
      const scrollDistance = scrollWidth - viewportWidth;

      // Main timeline with ScrollTrigger - matching other sections
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=600%', // Slightly longer than Gamification (500%)
          scrub: 1.5,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        },
      });

      // BUILD_OFFSET: Start during Gamification dismantle for smooth overlap
      // Gamification dismantles 0.68-0.80, start Screenshots at 0.55
      const BUILD_OFFSET = 0.55;

      // ===== PHASE 1: Cinematic Build (0.67 to 0.73) =====

      // Title: emerge from blur with scale
      if (titleRef.current) {
        gsap.set(titleRef.current, {
          opacity: 0,
          y: 80,
          scale: 0.9,
          filter: 'blur(15px)',
          letterSpacing: '-0.05em'
        });
        tl.to(titleRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          letterSpacing: '0em',
          duration: 0.05,
          ease: 'power3.out',
        }, BUILD_OFFSET);
      }

      // Subtitle: slide in with letter spacing expansion
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, {
          opacity: 0,
          y: 50,
          scale: 0.95,
          filter: 'blur(8px)'
        });
        tl.to(subtitleRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.04,
          ease: 'power3.out',
        }, BUILD_OFFSET + 0.03);
      }

      // Horizontal container: dramatic 3D entrance from below with rotation
      gsap.set(horizontal, {
        opacity: 0,
        y: 100,
        scale: 0.8,
        rotateX: -20,
        filter: 'blur(12px)',
        transformPerspective: 1200
      });
      tl.to(horizontal, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        filter: 'blur(0px)',
        duration: 0.05,
        ease: 'back.out(1.2)',
      }, BUILD_OFFSET + 0.05);

      // Individual screenshot cards stagger in - first card appears immediately, rest stagger
      const cards = horizontal.querySelectorAll('.screenshot-card');
      cards.forEach((card, index) => {
        gsap.set(card, {
          opacity: 0,
          y: 60,
          scale: 0.9,
          rotateY: -15
        });
        // First card appears at the same time as the container, giving 10% scroll to view it
        // Other cards appear with slight stagger
        const cardDelay = index === 0 ? 0 : 0.02 + (index * 0.003);
        tl.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateY: 0,
          duration: index === 0 ? 0.05 : 0.02, // First card gets longer animation
          ease: 'power3.out',
        }, BUILD_OFFSET + cardDelay);
      });

      // ===== PHASE 2: Horizontal Scroll (0.65-0.78) =====
      tl.to(horizontal, {
        x: -scrollDistance,
        ease: 'none',
        duration: 0.13, // Scroll phase (0.65 to 0.78)
      }, 0.65);

      // Parallax disabled - was causing right-side gaps
      // const images = horizontal.querySelectorAll('.screenshot-image');
      // images.forEach((image) => {
      //   tl.to(image, {
      //     x: -80,
      //     ease: 'none',
      //     duration: 0.40,
      //   }, 0.40);
      // });

      // ===== PHASE 3: Cinematic Dismantle (0.78-0.88) =====

      // Horizontal container: dramatic exit with 3D rotation and blur
      tl.to(horizontal, {
        opacity: 0,
        scale: 0.75,
        y: -80,
        rotateX: 15,
        filter: 'blur(15px)',
        duration: 0.03,
        ease: 'power3.in',
      }, 0.80);

      // Subtitle: expand and dissolve
      if (subtitleRef.current) {
        tl.to(subtitleRef.current, {
          opacity: 0,
          y: -50,
          scale: 0.95,
          letterSpacing: '0.15em',
          filter: 'blur(6px)',
          duration: 0.02,
          ease: 'power3.in',
        }, 0.82);
      }

      // Title: dramatic scale up and blur out (explosion effect)
      if (titleRef.current) {
        tl.to(titleRef.current, {
          opacity: 0,
          scale: 1.15,
          y: -60,
          filter: 'blur(12px)',
          letterSpacing: '0.1em',
          duration: 0.02,
          ease: 'power3.in',
        }, 0.84);
      }

    }, section);

    // Handle resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section
      id="screenshots"
      ref={sectionRef}
      className="hidden md:block relative min-h-screen overflow-hidden"
    >
      {/* Ambient Background - hidden on mobile */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-start pt-12">
        {/* Fixed Header - Centered */}
        <div className="text-center px-8 mb-6">
          <h2
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 opacity-100 md:opacity-0"
          >
            See{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Ascnd
            </span>{' '}
            in Action
          </h2>
          <p
            ref={subtitleRef}
            className="text-white/50 text-lg max-w-xl mx-auto opacity-100 md:opacity-0"
          >
            Scroll to explore every corner of your new personal operating system
          </p>
        </div>

        {/* Desktop: Horizontal Scroll Container */}
        <div className="hidden md:flex flex-1 items-start pt-4 overflow-visible w-full" style={{ perspective: '1200px' }}>
          <div
            ref={horizontalRef}
            className="flex flex-row gap-8 pl-8 pr-[50vw] w-auto"
            style={{ opacity: 0, willChange: 'transform', transformStyle: 'preserve-3d' }}
          >
            {screenshots.map((screenshot, index) => (
              <div
                key={screenshot.id}
                className="screenshot-card flex-shrink-0 w-[65vw] lg:w-[55vw] max-w-[950px]"
              >
                <div className="screenshot-inner relative">
                  {/* Screenshot Frame - Clean, no browser chrome */}
                  <div
                    className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                    style={{
                      boxShadow: `0 0 80px ${screenshot.color}25, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,
                    }}
                  >
                    {/* Screenshot Image - Full view */}
                    <div className="screenshot-image aspect-[16/9] bg-[#0d0a14] overflow-hidden flex items-center justify-center">
                      <img
                        src={screenshot.image}
                        alt={screenshot.title}
                        className="w-full h-full object-contain"
                        loading={index < 2 ? 'eager' : 'lazy'}
                      />
                    </div>
                  </div>

                  {/* Content Card - Centered below screenshot */}
                  <div className="screenshot-content mt-5 text-center">
                    {/* Index Badge */}
                    <div
                      className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-3"
                      style={{ background: `${screenshot.color}15`, border: `1px solid ${screenshot.color}30` }}
                    >
                      <span className="font-bold" style={{ color: screenshot.color }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-white/60 text-sm">{screenshot.subtitle}</span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-bold text-white mb-2">{screenshot.title}</h3>
                    <p className="text-white/50 max-w-md mx-auto text-sm">{screenshot.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Carousel with phone screenshots */}
        <div
          ref={mobileContainerRef}
          className="md:hidden flex flex-col items-center px-4 w-full pb-8 min-h-[70vh]"
        >
          <AnimatePresence mode="wait">
            {screenshots.map((screenshot, index) => {
              if (index !== currentIndex) return null;

              return (
                <motion.div
                  key={screenshot.id}
                  className="w-full max-w-[240px]"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Phone Frame */}
                  <div
                    className="relative rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-black"
                    style={{
                      boxShadow: `0 0 60px ${screenshot.color}30, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,
                    }}
                  >
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-10" />

                    {/* Screenshot Image */}
                    <div className="aspect-[9/19] bg-[#0d0a14] overflow-hidden">
                      <img
                        src={screenshot.mobileImage}
                        alt={screenshot.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Content below phone */}
                  <div className="mt-4 text-center">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2"
                      style={{ background: `${screenshot.color}15`, border: `1px solid ${screenshot.color}30` }}
                    >
                      <span className="font-bold text-sm" style={{ color: screenshot.color }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-white/60 text-xs">{screenshot.subtitle}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{screenshot.title}</h3>
                    <p className="text-white/50 text-xs">{screenshot.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Mobile Navigation */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setCurrentIndex(prev => (prev - 1 + screenshots.length) % screenshots.length)}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              ←
            </button>
            <div className="flex gap-2">
              {screenshots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex
                      ? 'bg-purple-500 scale-150'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentIndex(prev => (prev + 1) % screenshots.length)}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              →
            </button>
          </div>
          <p className="text-white/40 text-xs mt-2">{currentIndex + 1} of {screenshots.length}</p>
        </div>

      </div>
    </section>
  );
}
