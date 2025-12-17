'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { animate, stagger } from 'animejs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Feature benefits
const benefits = [
  { text: 'Free forever tier', icon: '✓' },
  { text: 'No credit card required', icon: '✓' },
  { text: 'Cancel anytime', icon: '✓' },
];

// Word reveal animation for headline
const headlineWords = ['Ready', 'to', 'Level Up', 'Your', 'Life?'];

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const floatingCard1Ref = useRef<HTMLDivElement>(null);
  const floatingCard2Ref = useRef<HTMLDivElement>(null);
  const userCountRef = useRef<HTMLSpanElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);

  const [userCount, setUserCount] = useState(0);
  const [hasCountStarted, setHasCountStarted] = useState(false);
  const [hasQuoteAnimated, setHasQuoteAnimated] = useState(false);

  // Anime.js count up animation
  const startCountAnimation = useCallback(() => {
    if (hasCountStarted) return;
    setHasCountStarted(true);

    const target = { value: 0 };
    animate(target, {
      value: 12450,
      duration: 2500,
      easing: 'easeOutExpo',
      update: () => {
        setUserCount(Math.floor(target.value));
      },
    });
  }, [hasCountStarted]);

  // Anime.js typewriter effect for testimonial quote
  const startQuoteAnimation = useCallback(() => {
    if (hasQuoteAnimated || !quoteRef.current) return;
    setHasQuoteAnimated(true);

    const quote = quoteRef.current;
    const text = quote.dataset.text || '';
    quote.textContent = '';
    quote.style.opacity = '1';

    // Create character spans
    const chars: HTMLSpanElement[] = [];
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.opacity = '0';
      quote.appendChild(span);
      chars.push(span);
    });

    // Animate characters with stagger
    animate(chars, {
      opacity: [0, 1],
      duration: 50,
      delay: stagger(12),
      easing: 'linear',
    });
  }, [hasQuoteAnimated]);

  // GSAP Scroll-triggered animations with pinning
  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    const isMobile = window.innerWidth < 768;

    // On mobile, show content immediately without pinned scrolling
    if (isMobile) {
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word');
        words.forEach((word) => {
          (word as HTMLElement).style.opacity = '1';
          (word as HTMLElement).style.transform = 'none';
          (word as HTMLElement).style.filter = 'none';
        });
      }
      if (subtitleRef.current) {
        subtitleRef.current.style.opacity = '1';
        subtitleRef.current.style.transform = 'none';
      }
      if (buttonsRef.current) {
        buttonsRef.current.style.opacity = '1';
        buttonsRef.current.style.transform = 'none';
      }
      if (benefitsRef.current) {
        benefitsRef.current.style.opacity = '1';
        const items = benefitsRef.current.querySelectorAll('.benefit-item');
        items.forEach((item) => {
          (item as HTMLElement).style.opacity = '1';
          (item as HTMLElement).style.transform = 'none';
        });
      }
      if (testimonialRef.current) {
        testimonialRef.current.style.opacity = '1';
        testimonialRef.current.style.transform = 'none';
      }
      // Start count animation on mobile
      startCountAnimation();
      return;
    }

    const ctx = gsap.context(() => {
      // BUILD_OFFSET: Delay build animations to allow Screenshots to dismantle first
      // Screenshots dismantles 0.60-0.75, so we start building after that
      const BUILD_OFFSET = 0.40;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=500%', // Match other sections' scroll distance
          pin: true,
          pinSpacing: false, // Match other sections
          scrub: 1.5,
          anticipatePin: 1,
          onEnter: () => {
            startCountAnimation();
          },
          onUpdate: (self) => {
            // Start quote animation at 50% progress (adjusted for BUILD_OFFSET)
            if (self.progress > 0.5 && !hasQuoteAnimated) {
              startQuoteAnimation();
            }
          },
        },
      });

      // ===== PHASE 1: Build (BUILD_OFFSET to BUILD_OFFSET+0.30) =====

      // Headline words enter staggered
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word');
        gsap.set(words, { y: 50, opacity: 0, scale: 0.9, filter: 'blur(8px)' });
        words.forEach((word, i) => {
          tl.to(word, {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.08,
            ease: 'power3.out',
          }, BUILD_OFFSET + (i * 0.02));
        });
      }

      // Subtitle enters
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { y: 30, opacity: 0, filter: 'blur(5px)' });
        tl.to(subtitleRef.current, {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.10,
          ease: 'power3.out',
        }, BUILD_OFFSET + 0.10);
      }

      // Buttons enter
      if (buttonsRef.current) {
        gsap.set(buttonsRef.current, { y: 30, opacity: 0 });
        tl.to(buttonsRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.10,
          ease: 'power3.out',
        }, BUILD_OFFSET + 0.15);
      }

      // Benefits enter with anime.js stagger
      if (benefitsRef.current) {
        const benefitItems = benefitsRef.current.querySelectorAll('.benefit-item');
        gsap.set(benefitsRef.current, { opacity: 0 });
        gsap.set(benefitItems, { y: 20, opacity: 0 });

        tl.to(benefitsRef.current, {
          opacity: 1,
          duration: 0.08,
          onComplete: () => {
            animate(benefitItems, {
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 500,
              delay: stagger(100),
              easing: 'easeOutExpo',
            });
          },
        }, BUILD_OFFSET + 0.20);
      }

      // Testimonial enters from bottom
      if (testimonialRef.current) {
        gsap.set(testimonialRef.current, { y: 60, opacity: 0, scale: 0.95 });
        tl.to(testimonialRef.current, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.12,
          ease: 'power3.out',
        }, BUILD_OFFSET + 0.25);
      }

      // Floating cards enter
      if (floatingCard1Ref.current) {
        gsap.set(floatingCard1Ref.current, { x: -80, opacity: 0 });
        tl.to(floatingCard1Ref.current, {
          x: 0,
          opacity: 0.5,
          duration: 0.10,
          ease: 'power3.out',
        }, BUILD_OFFSET + 0.28);
      }

      if (floatingCard2Ref.current) {
        gsap.set(floatingCard2Ref.current, { x: 80, opacity: 0 });
        tl.to(floatingCard2Ref.current, {
          x: 0,
          opacity: 0.5,
          duration: 0.10,
          ease: 'power3.out',
        }, BUILD_OFFSET + 0.30);
      }

      // ===== PHASE 2: Hold (0.55-0.65) - Content stays visible =====

      // ===== PHASE 3: Dismantle (0.65-0.80) =====

      // Floating cards exit
      if (floatingCard1Ref.current) {
        tl.to(floatingCard1Ref.current, {
          x: -100,
          opacity: 0,
          filter: 'blur(5px)',
          duration: 0.06,
          ease: 'power2.in',
        }, 0.65);
      }

      if (floatingCard2Ref.current) {
        tl.to(floatingCard2Ref.current, {
          x: 100,
          opacity: 0,
          filter: 'blur(5px)',
          duration: 0.06,
          ease: 'power2.in',
        }, 0.67);
      }

      // Testimonial exits
      if (testimonialRef.current) {
        tl.to(testimonialRef.current, {
          y: 40,
          opacity: 0,
          scale: 0.95,
          filter: 'blur(8px)',
          duration: 0.08,
          ease: 'power2.in',
        }, 0.69);
      }

      // Benefits exit
      if (benefitsRef.current) {
        tl.to(benefitsRef.current, {
          y: -20,
          opacity: 0,
          filter: 'blur(5px)',
          duration: 0.06,
          ease: 'power2.in',
        }, 0.72);
      }

      // Buttons exit
      if (buttonsRef.current) {
        tl.to(buttonsRef.current, {
          y: -30,
          opacity: 0,
          filter: 'blur(5px)',
          duration: 0.06,
          ease: 'power2.in',
        }, 0.74);
      }

      // Subtitle exits
      if (subtitleRef.current) {
        tl.to(subtitleRef.current, {
          y: -30,
          opacity: 0,
          filter: 'blur(8px)',
          duration: 0.06,
          ease: 'power2.in',
        }, 0.76);
      }

      // Headline exits with blur
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word');
        words.forEach((word, i) => {
          tl.to(word, {
            y: -40,
            opacity: 0,
            scale: 0.9,
            filter: 'blur(10px)',
            duration: 0.05,
            ease: 'power2.in',
          }, 0.78 + i * 0.01);
        });
      }

    }, section);

    return () => ctx.revert();
  }, [startCountAnimation, startQuoteAnimation, hasQuoteAnimated]);

  // Button hover animation with anime.js
  const handleButtonHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const button = e.currentTarget;
    animate(button, {
      scale: [1, 1.02],
      duration: 200,
      easing: 'easeOutExpo',
    });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0c0a10]" ref={sectionRef}>
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent"
          animate={{
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-cyan-500/10 blur-[80px]"
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="container-wide relative z-10 h-screen flex flex-col justify-center pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Word-by-Word Headline */}
          <h2 ref={headlineRef} className="text-3xl md:text-5xl font-bold mb-6">
            {headlineWords.map((word, index) => (
              <span
                key={index}
                className={`word inline-block mr-3 ${word === 'Level Up' ? 'gradient-text' : ''}`}
              >
                {word}
              </span>
            ))}
          </h2>

          <p ref={subtitleRef} className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
            Join{' '}
            <span ref={userCountRef} className="text-white font-semibold tabular-nums">
              {userCount.toLocaleString()}+
            </span>{' '}
            people who are tracking their way to a better life. Start free, upgrade when you're ready.
          </p>

          {/* CTA Buttons */}
          <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            {/* Primary CTA */}
            <motion.div className="relative" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Link
                href="/signup"
                className="btn-primary text-lg px-10 py-4 relative z-10 inline-block"
                onMouseEnter={handleButtonHover}
              >
                Get Started Free
              </Link>
            </motion.div>

            {/* Secondary CTA */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="#"
                className="btn-secondary text-lg px-10 py-4 inline-flex items-center gap-2"
                onMouseEnter={handleButtonHover}
              >
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ▶
                </motion.span>
                Watch Demo
              </Link>
            </motion.div>
          </div>

          {/* Benefits */}
          <div ref={benefitsRef} className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-white/50">
            {benefits.map((benefit, index) => (
              <div key={benefit.text} className="benefit-item flex items-center gap-2">
                <motion.span
                  className="text-emerald-400"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                >
                  {benefit.icon}
                </motion.span>
                <span className="text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div ref={testimonialRef} className="mt-16 max-w-3xl mx-auto">
          <motion.div
            className="testimonial-card relative overflow-hidden"
            whileHover={{ y: -5, transition: { duration: 0.3 } }}
          >
            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0"
              style={{
                background: 'linear-gradient(90deg, rgba(139,92,246,0.3), rgba(34,211,238,0.3), rgba(139,92,246,0.3))',
                backgroundSize: '200% 100%',
              }}
              animate={{
                opacity: [0, 0.5, 0],
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="flex items-start gap-4 relative z-10">
              {/* Avatar */}
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex-shrink-0 relative"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {/* Level badge */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#1a1724]">
                  42
                </div>
              </motion.div>

              <div className="flex-1">
                <p
                  ref={quoteRef}
                  data-text="&quot;LifeOS completely changed how I approach personal development. The gamification actually makes me excited to log my workouts and complete tasks.&quot;"
                  className="text-white/80 text-lg italic mb-4"
                  style={{ opacity: 0, minHeight: '3rem' }}
                >
                  "LifeOS completely changed how I approach personal development. The gamification
                  actually makes me excited to log my workouts and complete tasks."
                </p>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-white font-medium">Alex K.</p>
                    <p className="text-white/40 text-sm">Software Engineer • Level 42</p>
                  </div>

                  {/* Star rating with anime.js enhancement */}
                  <div className="flex gap-1 star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.svg
                        key={star}
                        className="w-5 h-5 text-amber-400 fill-current"
                        viewBox="0 0 20 20"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: star * 0.1 }}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </motion.svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating decoration cards */}
        <div className="hidden lg:block">
          <div
            ref={floatingCard1Ref}
            className="absolute -left-16 top-1/3 glass-card p-3 opacity-50"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-center gap-2">
                <motion.span
                  className="text-lg"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎯
                </motion.span>
                <span className="text-white/60 text-xs">Goal Achieved!</span>
              </div>
            </motion.div>
          </div>

          <div
            ref={floatingCard2Ref}
            className="absolute -right-16 top-1/2 glass-card p-3 opacity-50"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className="flex items-center gap-2">
                <motion.span
                  className="text-lg"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ⚡
                </motion.span>
                <span className="text-white/60 text-xs">+500 XP</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
