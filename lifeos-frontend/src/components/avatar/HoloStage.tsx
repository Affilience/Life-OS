/**
 * ONYXOS HoloStage
 * Canvas wrapper with camera, lighting, and scene setup
 */

import React from 'react';
import { Canvas, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { HoloSurfaceMaterial, AuraMaterial } from './HoloMaterials';

// Register custom materials with R3F
extend({ HoloSurfaceMaterial, AuraMaterial });

interface HoloStageProps {
  children: React.ReactNode;
}

const HoloStage: React.FC<HoloStageProps> = ({ children }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.2], fov: 38 }}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{
        background: 'transparent',
        width: '100%',
        height: '100%',
      }}
      dpr={[1, 2]} // Device pixel ratio
    >
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.6} />

      {/* Soft directional light for subtle depth */}
      <directionalLight
        position={[2, 3, 1]}
        intensity={0.3}
        color="#ffffff"
      />

      {/* Optional fill light from below */}
      <directionalLight
        position={[-1, -2, 1]}
        intensity={0.15}
        color="#5CE1E6"
      />

      {children}
    </Canvas>
  );
};

export default HoloStage;
