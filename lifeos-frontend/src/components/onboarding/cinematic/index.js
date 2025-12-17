/**
 * Cinematic Onboarding
 *
 * A scroll-based, immersive onboarding experience combining:
 * - GSAP ScrollTrigger for scroll-driven animations with pinning
 * - Lenis for buttery smooth scrolling
 * - Anime.js for micro-animations
 * - Parallax depth layers
 */

// New immersive onboarding (recommended)
export { default as ImmersiveOnboarding } from './ImmersiveOnboarding';

// Legacy onboarding (kept for reference)
export { default as CinematicOnboarding } from './CinematicOnboarding';
export { default as CosmicBackground3D } from './CosmicBackground3D';
export * from './sections';

// Immersive section components
export * from './immersive';
