'use client';

/**
 * Screenshots Section - Horizontal Scroll Cinema Gallery
 *
 * Uses GSAP ScrollTrigger with pinSpacing: false.
 * Has slightly longer scroll distance (600%) than Gamification (500%) so it
 * progresses slower, allowing Gamification to fully dismantle before Screenshots builds.
 *
 * Phases:
 * - Cinematic Build (0.55-0.62): Title emerges, cards stagger in
 * - Horizontal Scroll (0.62-0.78): Smooth gallery scroll with synced progress bar
 * - Cinematic Dismantle (0.78-0.88): 3D exit with blur
 */

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Screenshot data - curated selection for best visual impact
const screenshots = [
  {
    id: 'dashboard',
    title: 'Command Center',
    subtitle: 'Dashboard',
    description: 'Your unified view of everything. Track progress, see insights, and stay motivated.',
    image: '/assets/screenshots/dashboard.png',
    color: '#8b5cf6', // purple
  },
  {
    id: 'character',
    title: 'Your Hero',
    subtitle: 'Character',
    description: 'Watch your pixel art avatar evolve as you level up and unlock new equipment.',
    image: '/assets/screenshots/character.png',
    color: '#06b6d4', // cyan
  },
  {
    id: 'quests',
    title: 'Daily Quests',
    subtitle: 'Missions',
    description: 'Complete daily quests, track your tasks, and earn XP for staying consistent.',
    image: '/assets/screenshots/quests.png',
    color: '#f59e0b', // amber
  },
  {
    id: 'journal',
    title: 'Beautiful Journaling',
    subtitle: 'Journal',
    description: 'A stunning book-style interface that makes daily reflection a joy.',
    image: '/assets/screenshots/journal.png',
    color: '#fb7185', // rose
  },
  {
    id: 'streaks',
    title: 'Streak Flames',
    subtitle: 'Daily Streaks',
    description: 'Build powerful habits with visual streak tracking that keeps you motivated.',
    image: '/assets/screenshots/streaks.png',
    color: '#f97316', // orange
  },
  {
    id: 'achievements',
    title: 'Epic Achievements',
    subtitle: 'Unlockables',
    description: 'Unlock achievements as you progress and showcase your accomplishments.',
    image: '/assets/screenshots/achievements.png',
    color: '#10b981', // emerald
  },
];

export function Screenshots() {
  const sectionRef = useRef<HTMLElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLParagraphElement>(null);
  const ctaCardRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!sectionRef.current || !horizontalRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    const horizontal = horizontalRef.current;
    const isMobile = window.innerWidth < 768;

    // On mobile, show content immediately without pinned scrolling
    if (isMobile) {
      if (titleRef.current) titleRef.current.style.opacity = '1';
      if (subtitleRef.current) subtitleRef.current.style.opacity = '1';
      horizontal.style.opacity = '1';
      horizontal.style.transform = 'none';
      if (progressRef.current) progressRef.current.style.opacity = '1';
      if (scrollHintRef.current) scrollHintRef.current.style.opacity = '1';

      // Show all cards
      const cards = horizontal.querySelectorAll('.screenshot-card');
      cards.forEach((card) => {
        (card as HTMLElement).style.opacity = '1';
        (card as HTMLElement).style.transform = 'none';
      });
      return;
    }

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
          onUpdate: (self) => {
            // Calculate which screenshot is active based on scroll progress
            // Scroll phase runs from 0.62-0.78 (duration 0.16) for smoother pacing
            const scrollPhaseStart = 0.62;
            const scrollPhaseDuration = 0.16;
            const scrollPhaseProgress = Math.max(0, Math.min(1, (self.progress - scrollPhaseStart) / scrollPhaseDuration));
            const newIndex = Math.min(
              Math.floor(scrollPhaseProgress * screenshots.length),
              screenshots.length - 1
            );
            setActiveIndex(newIndex);

            // Update progress bar
            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${scrollPhaseProgress * 100}%`;
            }
          },
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

      // Individual screenshot cards stagger in
      const cards = horizontal.querySelectorAll('.screenshot-card');
      cards.forEach((card, index) => {
        gsap.set(card, {
          opacity: 0,
          y: 60,
          scale: 0.9,
          rotateY: -15
        });
        tl.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateY: 0,
          duration: 0.025,
          ease: 'power3.out',
        }, BUILD_OFFSET + 0.07 + (index * 0.005)); // Staggered entrance
      });

      // Progress indicator: fade up from below
      if (progressRef.current) {
        gsap.set(progressRef.current, { opacity: 0, y: 40, scale: 0.95 });
        tl.to(progressRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.025,
          ease: 'power3.out',
        }, BUILD_OFFSET + 0.10);
      }

      // Scroll hint: subtle fade in
      if (scrollHintRef.current) {
        gsap.set(scrollHintRef.current, { opacity: 0, y: 10 });
        tl.to(scrollHintRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.02,
          ease: 'power3.out',
        }, BUILD_OFFSET + 0.12);
      }

      // ===== PHASE 2: Horizontal Scroll (0.62-0.78) =====
      tl.to(horizontal, {
        x: -scrollDistance,
        ease: 'none',
        duration: 0.16, // Scroll phase (0.62 to 0.78) - longer for smoother pacing
      }, 0.62);

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

      // Fade out scroll hint first
      if (scrollHintRef.current) {
        tl.to(scrollHintRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.02,
          ease: 'power2.in',
        }, 0.78);
      }

      // Progress indicator fades with scale
      if (progressRef.current) {
        tl.to(progressRef.current, {
          opacity: 0,
          y: -30,
          scale: 0.9,
          filter: 'blur(5px)',
          duration: 0.02,
          ease: 'power2.in',
        }, 0.79);
      }

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
      className="relative min-h-screen overflow-hidden"
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{ opacity: 0 }}
          >
            See{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              LifeOS
            </span>{' '}
            in Action
          </h2>
          <p
            ref={subtitleRef}
            className="text-white/50 text-lg max-w-xl mx-auto"
            style={{ opacity: 0 }}
          >
            Scroll to explore every corner of your new personal operating system
          </p>
        </div>

        {/* Horizontal Scroll Container - Positioned higher, vertical on mobile */}
        <div className="flex-1 flex items-start pt-4 overflow-hidden md:overflow-visible w-full" style={{ perspective: '1200px' }}>
          <div
            ref={horizontalRef}
            className="flex flex-col md:flex-row gap-8 px-4 md:pl-8 md:pr-[50vw] w-full md:w-auto"
            style={{ opacity: 0, willChange: 'transform', transformStyle: 'preserve-3d' }}
          >
            {screenshots.map((screenshot, index) => (
              <div
                key={screenshot.id}
                className="screenshot-card flex-shrink-0 w-full md:w-[65vw] lg:w-[55vw] max-w-[950px]"
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

        {/* Progress Indicator - Hidden on mobile */}
        <div
          ref={progressRef}
          className="hidden md:block absolute bottom-8 left-8 right-8 z-20"
          style={{ opacity: 0 }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Screenshot Navigation Dots */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {screenshots.map((screenshot, index) => (
                  <div
                    key={screenshot.id}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? 'w-8 bg-gradient-to-r from-purple-500 to-cyan-500'
                        : index < activeIndex
                          ? 'w-2 bg-white/40'
                          : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Current Screenshot Label */}
              <div className="text-right">
                <p className="text-white/40 text-sm">
                  <span className="text-white font-medium">{String(activeIndex + 1).padStart(2, '0')}</span>
                  {' / '}
                  {String(screenshots.length).padStart(2, '0')}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-none"
                style={{ width: '0%' }}
              />
            </div>

            {/* Scroll Hint */}
            <p
              ref={scrollHintRef}
              className="text-white/30 text-sm mt-4 text-center"
              style={{ opacity: 0 }}
            >
              <span className="inline-flex items-center gap-2">
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
                Scroll to explore
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
