import React, { useMemo } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';
import type { CosmicBackgroundProps } from '../avatar/types';
import { dashboardParticlesConfig } from './particles.config';

let particlesInit: ((engine: Engine) => Promise<void>) | undefined;

export function CosmicBackground({
  id = 'cosmic-bg',
  preset = 'dashboard',
  className = '',
  reducedMotion = false
}: CosmicBackgroundProps) {
  const init = useMemo(() => {
    if (!particlesInit) {
      particlesInit = async (engine: Engine) => {
        await loadSlim(engine);
      };
    }
    return particlesInit;
  }, []);

  if (reducedMotion) return null;

  return (
    <Particles
      id={id}
      init={init}
      options={dashboardParticlesConfig}
      className={className}
    />
  );
}
