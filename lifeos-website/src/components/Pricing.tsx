'use client';

/**
 * Pricing Section - Cinematic Scroll-Driven Reveal
 *
 * Uses GSAP ScrollTrigger with pinSpacing: false to match
 * the transition pattern of other sections. Features:
 * - 3D card reveals with staggered entrance
 * - Glowing borders and particle effects
 * - Interactive hover states with Anime.js
 * - Smooth dismantle animations
 *
 * Screenshots (600%) dismantles at 0.80-0.88 = 480-528% scroll distance
 * Pricing (900%) at 480% scroll = 480/900 = 0.53 progress
 * So BUILD_OFFSET = 0.45 to start overlapping with Screenshots dismantle
 *
 * Phases:
 * - Build (0.45-0.60): Title, subtitle, cards stagger in
 * - Hold (0.60-0.70): Cards fully visible, interactive
 * - Dismantle (0.70-0.80): Cinematic exit with blur and scale
 */

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { animate, stagger } from 'animejs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Pricing tiers
const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Explorer',
    price: 0,
    period: 'forever',
    description: 'See what you\'ve been missing',
    color: '#8b5cf6',
    features: [
      'All 8 life modules',
      'Basic journaling',
      'XP & levelling system',
      'Single avatar style',
      '7-day streak tracking',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Adventurer',
    price: 9,
    period: 'month',
    description: 'The full system, unleashed',
    color: '#06b6d4',
    features: [
      'Everything in Explorer',
      'Nova AI companion',
      'Equipment & pets system',
      'Skill constellation',
      'Advanced analytics',
      'Unlimited streaks',
      'Priority support',
    ],
    cta: 'Start Adventure',
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Legend',
    price: 149,
    period: 'once',
    description: 'One payment. Forever yours.',
    color: '#f59e0b',
    features: [
      'Everything in Adventurer',
      'Lifetime updates',
      'Exclusive legendary gear',
      'Early access features',
      'Private Discord channel',
      'Personal onboarding call',
    ],
    cta: 'Become Legend',
    popular: false,
  },
];

export function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const guaranteeRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Anime.js hover animation for cards
  const handleCardHover = (cardId: string, entering: boolean) => {
    setHoveredCard(entering ? cardId : null);
    const card = document.querySelector(`[data-card-id="${cardId}"]`);
    if (card) {
      const features = card.querySelectorAll('.feature-item');
      if (entering) {
        animate(features, {
          translateX: [0, 4, 0],
          opacity: [0.7, 1],
          duration: 400,
          delay: stagger(50),
          easing: 'easeOutExpo',
        });
      }
    }
  };

  // GSAP Scroll-triggered animations
  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') return;

    const section = sectionRef.current;
    const isMobile = window.innerWidth < 768;

    // On mobile, show content immediately without pinned scrolling
    if (isMobile) {
      if (titleRef.current) {
        titleRef.current.style.opacity = '1';
        titleRef.current.style.transform = 'none';
        titleRef.current.style.filter = 'none';
      }
      if (subtitleRef.current) {
        subtitleRef.current.style.opacity = '1';
        subtitleRef.current.style.transform = 'none';
        subtitleRef.current.style.filter = 'none';
      }
      if (cardsContainerRef.current) {
        cardsContainerRef.current.style.opacity = '1';
        cardsContainerRef.current.style.transform = 'none';
        const cards = cardsContainerRef.current.querySelectorAll('.pricing-card');
        cards.forEach((card) => {
          (card as HTMLElement).style.opacity = '1';
          (card as HTMLElement).style.transform = 'none';
        });
      }
      if (guaranteeRef.current) {
        guaranteeRef.current.style.opacity = '1';
        guaranteeRef.current.style.transform = 'none';
      }
      return;
    }

    const ctx = gsap.context(() => {
      // BUILD_OFFSET: Start during Screenshots dismantle for smooth overlap
      // Screenshots dismantles 0.80-0.88 of 600% = 480-528% scroll distance
      // Pricing at 480% scroll = 480/900 = 0.53 progress
      // Start at 0.45 to overlap with Screenshots dismantle
      const BUILD_OFFSET = 0.45;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=900%',
          scrub: 1.5,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        },
      });

      // ===== PHASE 1: Cinematic Build (0.45-0.60) =====

      // Title: emerge from blur with cinematic scale
      if (titleRef.current) {
        gsap.set(titleRef.current, {
          opacity: 0,
          y: 80,
          scale: 0.85,
          filter: 'blur(20px)',
          rotateX: -15,
        });
        tl.to(titleRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          rotateX: 0,
          duration: 0.06,
          ease: 'power3.out',
        }, BUILD_OFFSET);
      }

      // Subtitle: slide up with blur clear
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, {
          opacity: 0,
          y: 50,
          filter: 'blur(10px)',
        });
        tl.to(subtitleRef.current, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.05,
          ease: 'power3.out',
        }, BUILD_OFFSET + 0.03);
      }

      // Cards container: 3D perspective entrance
      if (cardsContainerRef.current) {
        gsap.set(cardsContainerRef.current, {
          opacity: 0,
          y: 100,
          scale: 0.8,
          rotateX: -25,
          transformPerspective: 1200,
        });
        tl.to(cardsContainerRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 0.06,
          ease: 'back.out(1.2)',
        }, BUILD_OFFSET + 0.05);

        // Individual cards stagger in with 3D rotation
        const cards = cardsContainerRef.current.querySelectorAll('.pricing-card');
        cards.forEach((card, index) => {
          const isMiddle = index === 1;
          gsap.set(card, {
            opacity: 0,
            y: isMiddle ? 80 : 60,
            scale: isMiddle ? 0.85 : 0.9,
            rotateY: index === 0 ? 15 : index === 2 ? -15 : 0,
          });
          tl.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateY: 0,
            duration: 0.05,
            ease: 'back.out(1.4)',
          }, BUILD_OFFSET + 0.08 + (index * 0.02));
        });
      }

      // Guarantee badge: pop in with bounce
      if (guaranteeRef.current) {
        gsap.set(guaranteeRef.current, {
          opacity: 0,
          scale: 0.5,
          y: 30,
        });
        tl.to(guaranteeRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.05,
          ease: 'back.out(2)',
        }, BUILD_OFFSET + 0.15);
      }

      // ===== PHASE 2: Hold (0.60-0.70) =====
      // Cards are fully visible and interactive

      // ===== PHASE 3: Cinematic Dismantle (0.70-0.80) =====

      // Guarantee fades first
      if (guaranteeRef.current) {
        tl.to(guaranteeRef.current, {
          opacity: 0,
          scale: 0.8,
          y: -20,
          filter: 'blur(5px)',
          duration: 0.03,
          ease: 'power2.in',
        }, 0.70);
      }

      // Cards exit with stagger and 3D rotation
      if (cardsContainerRef.current) {
        const cards = cardsContainerRef.current.querySelectorAll('.pricing-card');
        cards.forEach((card, index) => {
          tl.to(card, {
            opacity: 0,
            y: -60,
            scale: 0.85,
            rotateY: index === 0 ? -20 : index === 2 ? 20 : 0,
            rotateX: 10,
            filter: 'blur(8px)',
            duration: 0.03,
            ease: 'power3.in',
          }, 0.71 + (index * 0.01));
        });

        // Container exits
        tl.to(cardsContainerRef.current, {
          opacity: 0,
          scale: 0.7,
          y: -80,
          rotateX: 20,
          filter: 'blur(15px)',
          duration: 0.03,
          ease: 'power3.in',
        }, 0.75);
      }

      // Subtitle dissolves
      if (subtitleRef.current) {
        tl.to(subtitleRef.current, {
          opacity: 0,
          y: -40,
          filter: 'blur(10px)',
          duration: 0.02,
          ease: 'power3.in',
        }, 0.77);
      }

      // Title: dramatic scale up and blur out
      if (titleRef.current) {
        tl.to(titleRef.current, {
          opacity: 0,
          scale: 1.2,
          y: -60,
          filter: 'blur(15px)',
          rotateX: 15,
          duration: 0.02,
          ease: 'power3.in',
        }, 0.79);
      }

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
      style={{ perspective: '1200px' }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.15, 1], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-amber-500/8 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-10">
        {/* Header */}
        <div className="text-center mb-12" style={{ transformStyle: 'preserve-3d' }}>
          <h2
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{ opacity: 0 }}
          >
            Simple{' '}
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p
            ref={subtitleRef}
            className="text-white/50 text-lg max-w-xl mx-auto"
            style={{ opacity: 0 }}
          >
            Free forever. Pay only when you want the full experience.
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          ref={cardsContainerRef}
          className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 lg:gap-8 w-full max-w-5xl"
          style={{ opacity: 0, transformStyle: 'preserve-3d' }}
        >
          {PRICING_TIERS.map((tier, index) => (
            <motion.div
              key={tier.id}
              data-card-id={tier.id}
              className={`pricing-card relative w-full max-w-sm lg:w-1/3 rounded-2xl p-6 lg:p-8 backdrop-blur-sm transition-all duration-300
                ${tier.popular
                  ? 'bg-gradient-to-b from-white/15 to-white/5 border-2 lg:-mt-4 lg:mb-4 lg:scale-105'
                  : 'bg-white/5 border border-white/10'
                }`}
              style={{
                borderColor: tier.popular ? tier.color : undefined,
                boxShadow: hoveredCard === tier.id
                  ? `0 0 60px ${tier.color}30, 0 25px 50px -12px rgba(0,0,0,0.5)`
                  : tier.popular
                    ? `0 0 40px ${tier.color}20`
                    : 'none',
              }}
              onMouseEnter={() => handleCardHover(tier.id, true)}
              onMouseLeave={() => handleCardHover(tier.id, false)}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${tier.color}, #8b5cf6)` }}
                >
                  MOST POPULAR
                </div>
              )}

              {/* Tier Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                <p className="text-white/40 text-sm">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-white/50 text-xl">£</span>
                  <span
                    className="text-5xl font-bold"
                    style={{ color: tier.color }}
                  >
                    {tier.price}
                  </span>
                  {tier.period !== 'once' && (
                    <span className="text-white/40 text-sm">/{tier.period}</span>
                  )}
                </div>
                {tier.period === 'once' && (
                  <p className="text-white/30 text-xs mt-1">one-time payment</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, fIndex) => (
                  <li
                    key={fIndex}
                    className="feature-item flex items-center gap-3 text-white/70 text-sm"
                  >
                    <span style={{ color: tier.color }}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  tier.popular
                    ? 'text-white shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                style={{
                  background: tier.popular
                    ? `linear-gradient(135deg, ${tier.color}, #8b5cf6)`
                    : undefined,
                  boxShadow: tier.popular
                    ? `0 10px 30px ${tier.color}40`
                    : undefined,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tier.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Guarantee Badge */}
        <div
          ref={guaranteeRef}
          className="mt-8 flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10"
          style={{ opacity: 0 }}
        >
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🛡️
          </motion.span>
          <span className="text-white/60 text-sm">
            <span className="text-white font-medium">30-day money-back guarantee</span>
            {' '}• No questions asked
          </span>
        </div>
      </div>
    </section>
  );
}
