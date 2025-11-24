/**
 * GSAP animation timelines for avatar
 * XP pulse, level up, season change, mood transitions
 */

import { useRef, useCallback } from 'react';
import gsap from 'gsap';
import type { AvatarRefs, Mood, Season } from './types';

export function useAvatarTimeline(
  refs: AvatarRefs,
  opts: { reducedMotion: boolean }
) {
  const timelineRefs = useRef<{ [key: string]: gsap.core.Timeline }>({});

  /**
   * XP Pulse - 1.2s aura+tree bump + particle burst
   */
  const pulseXp = useCallback(() => {
    if (opts.reducedMotion) return;

    // Kill existing pulse
    timelineRefs.current.xp?.kill();

    const tl = gsap.timeline();

    if (refs.aura) {
      tl.to(refs.aura.scale, {
        x: 1.15,
        y: 1.15,
        duration: 0.3,
        ease: 'power2.out'
      }, 0);
      tl.to(refs.aura.scale, {
        x: 1.0,
        y: 1.0,
        duration: 0.9,
        ease: 'power2.inOut'
      }, 0.3);
      tl.to(refs.aura, {
        alpha: 1.0,
        duration: 0.2,
        ease: 'power2.out'
      }, 0);
      tl.to(refs.aura, {
        alpha: 0.8,
        duration: 1.0,
        ease: 'power2.inOut'
      }, 0.2);
    }

    if (refs.tree) {
      tl.to(refs.tree.scale, {
        x: 1.08,
        y: 1.08,
        duration: 0.3,
        ease: 'back.out(1.2)'
      }, 0);
      tl.to(refs.tree.scale, {
        x: 1.0,
        y: 1.0,
        duration: 0.9,
        ease: 'power2.inOut'
      }, 0.3);
    }

    // Trigger XP burst emitter
    if (refs.particles?.xp) {
      refs.particles.xp.burst();
    }

    timelineRefs.current.xp = tl;
  }, [refs, opts.reducedMotion]);

  /**
   * Level Up - 1.6s crescendo with scale/brightness + leaf confetti
   */
  const levelUp = useCallback(() => {
    if (opts.reducedMotion) {
      // Just show confetti particles
      if (refs.particles?.leaf) {
        refs.particles.leaf.start();
        setTimeout(() => refs.particles?.leaf?.stop(), 2000);
      }
      return;
    }

    timelineRefs.current.levelUp?.kill();

    const tl = gsap.timeline();

    if (refs.tree) {
      tl.to(refs.tree.scale, {
        x: 1.3,
        y: 1.3,
        duration: 0.8,
        ease: 'power2.out'
      }, 0);
      tl.to(refs.tree.scale, {
        x: 1.0,
        y: 1.0,
        duration: 0.8,
        ease: 'back.out(1.5)'
      }, 0.8);

      tl.to(refs.tree, {
        alpha: 1.0,
        duration: 0.4,
        ease: 'power2.out'
      }, 0);
    }

    if (refs.aura) {
      tl.to(refs.aura.scale, {
        x: 1.5,
        y: 1.5,
        duration: 0.8,
        ease: 'power2.out'
      }, 0);
      tl.to(refs.aura.scale, {
        x: 1.0,
        y: 1.0,
        duration: 0.8,
        ease: 'back.out(1.5)'
      }, 0.8);
    }

    // Leaf confetti burst
    if (refs.particles?.leaf) {
      tl.call(() => {
        refs.particles?.leaf?.start();
      }, [], 0.2);
      tl.call(() => {
        refs.particles?.leaf?.stop();
      }, [], 2.2);
    }

    timelineRefs.current.levelUp = tl;
  }, [refs, opts.reducedMotion]);

  /**
   * Season Change - smooth tint crossfade
   */
  const seasonChange = useCallback((to: Season) => {
    if (opts.reducedMotion) return;

    timelineRefs.current.season?.kill();

    const tl = gsap.timeline();

    // Fade out then fade in with new tint
    if (refs.tree) {
      tl.to(refs.tree, {
        alpha: 0.7,
        duration: 0.4,
        ease: 'power2.inOut'
      });
      tl.to(refs.tree, {
        alpha: 1.0,
        duration: 0.4,
        ease: 'power2.inOut'
      });
    }

    timelineRefs.current.season = tl;
  }, [refs, opts.reducedMotion]);

  /**
   * Set Mood - adjust idle sway amplitude/frequency
   */
  const setMood = useCallback((m: Mood) => {
    if (opts.reducedMotion || !refs.tree) return;

    timelineRefs.current.mood?.kill();

    const settings = {
      calm: { amp: 0.01, duration: 3 },
      focused: { amp: 0.005, duration: 2 },
      stressed: { amp: 0.02, duration: 1.5 }
    };

    const { amp, duration } = settings[m];

    // Gentle sway animation
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(refs.tree, {
      rotation: amp,
      duration: duration,
      ease: 'sine.inOut'
    });
    tl.to(refs.tree, {
      rotation: -amp,
      duration: duration,
      ease: 'sine.inOut'
    });

    timelineRefs.current.mood = tl;
  }, [refs, opts.reducedMotion]);

  return {
    pulseXp,
    levelUp,
    seasonChange,
    setMood
  };
}
