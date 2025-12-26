/**
 * NebulaCore - Realistic cosmic nebula visualisation using @flodlc/nebula library
 * Progressive evolution: atom → electrons → molecular → emission → planetary
 */

import React, { useMemo } from 'react';
import { ReactNebula } from '@flodlc/nebula';

export default function NebulaCore({ level = 1 }) {

  // Calculate nebula configuration based on level
  const nebulaConfig = useMemo(() => {
    // Atom stage (1-5): Single bright point, minimal stars
    if (level <= 5) {
      return {
        stage: 'atom',
        starsCount: 0,
        nebulasIntensity: 0,
        sunScale: 0.3,
        planetsScale: 0,
        starsRotationSpeed: 0,
        cometFrequency: 0
      };
    }

    // Electrons stage (6-15): Small electron cloud starting to form
    if (level <= 15) {
      const progress = (level - 5) / 10; // 0.0 to 1.0
      return {
        stage: 'electrons',
        starsCount: Math.floor(20 + progress * 30),
        nebulasIntensity: progress * 0.3,
        sunScale: 0.3,
        planetsScale: 0,
        starsRotationSpeed: 0.05 + progress * 0.05,
        cometFrequency: 0
      };
    }

    // Molecular cloud stage (16-35): Wispy clouds forming
    if (level <= 35) {
      const progress = (level - 15) / 20; // 0.0 to 1.0
      return {
        stage: 'molecular',
        starsCount: Math.floor(50 + progress * 100),
        nebulasIntensity: 0.3 + progress * 0.7,
        sunScale: 0.4 + progress * 0.3,
        planetsScale: 0,
        starsRotationSpeed: 0.1 + progress * 0.1,
        cometFrequency: 0
      };
    }

    // Emission nebula stage (36-65): Full colorful nebula
    if (level <= 65) {
      const progress = (level - 35) / 30; // 0.0 to 1.0
      return {
        stage: 'emission',
        starsCount: Math.floor(150 + progress * 200),
        nebulasIntensity: 1.0 + progress * 1.5,
        sunScale: 0.7 + progress * 0.5,
        planetsScale: 0.1 + progress * 0.2,
        starsRotationSpeed: 0.2 + progress * 0.15,
        cometFrequency: 0.001
      };
    }

    // Planetary nebula stage (66-100): Complex cosmic structure
    const progress = Math.min((level - 65) / 35, 1.0); // 0.0 to 1.0
    return {
      stage: 'planetary',
      starsCount: Math.floor(350 + progress * 650),
      nebulasIntensity: 2.5 + progress * 2.5,
      sunScale: 1.2 + progress * 0.8,
      planetsScale: 0.3 + progress * 0.4,
      starsRotationSpeed: 0.35 + progress * 0.15,
      cometFrequency: 0.003
    };
  }, [level]);

  return (
    <ReactNebula
      config={{
        starsCount: nebulaConfig.starsCount,
        starsColor: '#ffffff',
        starsRotationSpeed: nebulaConfig.starsRotationSpeed,
        nebulasIntensity: nebulaConfig.nebulasIntensity,
        sunScale: nebulaConfig.sunScale,
        planetsScale: nebulaConfig.planetsScale,
        solarSystemOrbitalSpeed: 50,
        solarSystemSpeedMultiplier: 8,
        cometFrequency: nebulaConfig.cometFrequency
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}
    />
  );
}
