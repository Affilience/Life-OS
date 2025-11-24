/**
 * ONYXOS HoloAvatar
 * Main 3D holographic avatar component with reactive states
 */

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated, config } from '@react-spring/three';
import { HoloSurfaceMaterial } from './HoloMaterials';
import HoloAura from './HoloAura';
import { useAvatarSignals } from '../../hooks/useAvatarSignals';
import { HoloAvatarProps, MoodValue } from '../../types/avatar';

const HoloAvatarMesh: React.FC<HoloAvatarProps> = ({
  level,
  xp,
  xpToNext,
  seasonColor = '#7A5CFF',
  streakDays = 0,
  mood = 'calm',
  onOpenCoach,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const [hovered, setHovered] = useState(false);
  const [xpPulseValue, setXpPulseValue] = useState(0);
  const [levelPulseValue, setLevelPulseValue] = useState(0);

  const signals = useAvatarSignals({
    level,
    xp,
    xpToNext,
    streakDays,
    seasonColor,
    mood,
  });

  // Breathing animation (subtle scale oscillation)
  const { scale } = useSpring({
    from: { scale: 1 },
    to: async (next) => {
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      while (true) {
        await next({ scale: 1.015 });
        await next({ scale: 1.0 });
      }
    },
    config: { duration: 6000 },
  });

  // XP pulse effect
  React.useEffect(() => {
    if (signals.xpPercent > 0) {
      setXpPulseValue(1);
      const timeout = setTimeout(() => setXpPulseValue(0), 1200);
      return () => clearTimeout(timeout);
    }
  }, [xp]); // Trigger on XP change

  // Level pulse effect
  React.useEffect(() => {
    if (signals.hasLeveledUp) {
      setLevelPulseValue(1);
      const timeout = setTimeout(() => setLevelPulseValue(0), 1600);
      return () => clearTimeout(timeout);
    }
  }, [signals.hasLeveledUp]);

  // Update shader uniforms
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.u_xpPulse.value = xpPulseValue;
      materialRef.current.uniforms.u_levelPulse.value = levelPulseValue;
      materialRef.current.uniforms.u_mood.value = signals.moodTint;

      // Ease out pulses
      if (xpPulseValue > 0) {
        setXpPulseValue((prev) => Math.max(0, prev - 0.015));
      }
      if (levelPulseValue > 0) {
        setLevelPulseValue((prev) => Math.max(0, prev - 0.01));
      }
    }
  });

  // Hover intensity boost
  const auraIntensity = hovered
    ? signals.auraIntensity * 1.2
    : signals.auraIntensity;

  return (
    <animated.group
      ref={meshRef}
      scale={scale as any}
      onClick={onOpenCoach}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Aura behind avatar */}
      <HoloAura
        intensity={auraIntensity}
        seasonColor={seasonColor}
        streakDays={streakDays}
        size={signals.auraSize * 2}
      />

      {/* Fluid humanoid form - minimal geometry with heavy overlaps */}
      <group position={[0, -0.1, 0]} scale={[0.85, 0.85, 0.85]}>
        {/* Central body mass - from chest to hips */}
        <mesh position={[0, 0.15, 0]} scale={[0.58, 1.05, 0.42]}>
          <sphereGeometry args={[1, 64, 64]} />
          <holoSurfaceMaterial
            ref={materialRef}
            u_seasonColor={new THREE.Color(seasonColor)}
            u_accent={new THREE.Color('#7A5CFF')}
          />
        </mesh>

        {/* Head-neck region - unified ellipsoid */}
        <mesh position={[0, 0.98, 0]} scale={[0.38, 0.6, 0.38]}>
          <sphereGeometry args={[1, 64, 64]} />
          <holoSurfaceMaterial
            u_seasonColor={new THREE.Color(seasonColor)}
            u_accent={new THREE.Color('#7A5CFF')}
          />
        </mesh>

        {/* Shoulder mass - wide, flat ellipsoid */}
        <mesh position={[0, 0.62, 0]} scale={[0.8, 0.35, 0.35]}>
          <sphereGeometry args={[1, 48, 48]} />
          <holoSurfaceMaterial
            u_seasonColor={new THREE.Color(seasonColor)}
            u_accent={new THREE.Color('#7A5CFF')}
          />
        </mesh>

        {/* Left arm - single elongated form */}
        <mesh position={[-0.7, 0.22, 0]} scale={[0.22, 0.78, 0.22]}>
          <sphereGeometry args={[1, 32, 32]} />
          <holoSurfaceMaterial
            u_seasonColor={new THREE.Color(seasonColor)}
            u_accent={new THREE.Color('#7A5CFF')}
          />
        </mesh>

        {/* Right arm - single elongated form */}
        <mesh position={[0.7, 0.22, 0]} scale={[0.22, 0.78, 0.22]}>
          <sphereGeometry args={[1, 32, 32]} />
          <holoSurfaceMaterial
            u_seasonColor={new THREE.Color(seasonColor)}
            u_accent={new THREE.Color('#7A5CFF')}
          />
        </mesh>

        {/* Chest volume - adds depth */}
        <mesh position={[0, 0.48, 0.08]} scale={[0.5, 0.48, 0.38]}>
          <sphereGeometry args={[1, 48, 48]} />
          <holoSurfaceMaterial
            u_seasonColor={new THREE.Color(seasonColor)}
            u_accent={new THREE.Color('#7A5CFF')}
          />
        </mesh>

        {/* Waist taper */}
        <mesh position={[0, -0.35, 0]} scale={[0.48, 0.42, 0.36]}>
          <sphereGeometry args={[1, 48, 48]} />
          <holoSurfaceMaterial
            u_seasonColor={new THREE.Color(seasonColor)}
            u_accent={new THREE.Color('#7A5CFF')}
          />
        </mesh>
      </group>
    </animated.group>
  );
};

export default HoloAvatarMesh;
