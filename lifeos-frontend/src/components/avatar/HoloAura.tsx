/**
 * ONYXOS HoloAura
 * Pulsing halo disc behind avatar with streak-based spokes
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AuraMaterial } from './HoloMaterials';

interface HoloAuraProps {
  intensity?: number;
  seasonColor?: string;
  streakDays?: number;
  size?: number;
}

const HoloAura: React.FC<HoloAuraProps> = ({
  intensity = 0.8,
  seasonColor = '#7A5CFF',
  streakDays = 0,
  size = 2,
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Calculate aura size based on streaks
  const auraSize = size + Math.min(streakDays * 0.05, 0.5);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={[0, 0.2, -0.5]} rotation={[0, 0, 0]}>
      <planeGeometry args={[auraSize, auraSize, 1, 1]} />
      <auraMaterial
        ref={materialRef}
        u_color={new THREE.Color(seasonColor)}
        u_intensity={intensity}
        u_radius={0.45}
        u_streakSpokes={streakDays}
      />
    </mesh>
  );
};

export default HoloAura;
