/**
 * RPM Viewer Component
 * Loads and displays Ready Player Me avatar with holographic effects
 */

import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useEffect,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { RpmViewerProps, RpmViewerRef, AvatarMood } from './rpm.types';
import {
  createHoloSurfaceMaterial,
  createAuraMaterial,
  applyHoloMaterialToModel,
  updateMaterialUniforms,
} from './rpm.materials';

/**
 * Avatar Model Component - loads and renders GLB with shaders
 */
interface AvatarModelProps {
  url: string;
  level: number;
  xp: number;
  xpToNext: number;
  seasonColor: string;
  streakDays: number;
  mood: AvatarMood;
  xpPulseValue: number;
  levelPulseValue: number;
}

function AvatarModel({
  url,
  seasonColor,
  mood,
  xpPulseValue,
  levelPulseValue,
  streakDays,
}: AvatarModelProps) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  // Create holographic material
  const holoMaterial = useMemo(() => {
    return createHoloSurfaceMaterial(seasonColor, '#7A5CFF');
  }, [seasonColor]);

  // Apply material to model
  useEffect(() => {
    if (scene) {
      const clonedScene = scene.clone(true);
      applyHoloMaterialToModel(clonedScene, holoMaterial);
      if (modelRef.current) {
        modelRef.current.clear();
        modelRef.current.add(clonedScene);
      }
    }
  }, [scene, holoMaterial]);

  // Map mood to numeric value
  const moodValue = mood === 'calm' ? 0 : mood === 'focused' ? 1 : 2;

  // Update shader uniforms
  useFrame((state) => {
    updateMaterialUniforms(holoMaterial, {
      time: state.clock.elapsedTime,
      xpPulse: xpPulseValue,
      levelPulse: levelPulseValue,
      mood: moodValue,
    });
  });

  // Create aura material
  const auraMaterial = useMemo(() => {
    const intensity = 0.8 + streakDays * 0.01;
    return createAuraMaterial(seasonColor, Math.min(intensity, 1.2));
  }, [seasonColor, streakDays]);

  // Update aura uniforms
  useFrame((state) => {
    if (auraMaterial.uniforms) {
      auraMaterial.uniforms.u_time.value = state.clock.elapsedTime;
      auraMaterial.uniforms.u_streakSpokes.value = streakDays;
    }
  });

  // Calculate aura size based on streaks
  const auraSize = 2.5 + Math.min(streakDays * 0.05, 0.5);

  // Breathing animation
  const { scale } = useSpring({
    from: { scale: 1 },
    to: async (next) => {
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

  return (
    <>
      {/* Aura behind avatar */}
      <mesh position={[0, 0.8, -0.3]} rotation={[0, 0, 0]}>
        <planeGeometry args={[auraSize, auraSize, 1, 1]} />
        <primitive object={auraMaterial} attach="material" />
      </mesh>

      {/* Avatar model */}
      <animated.group ref={modelRef} scale={scale as any} />
    </>
  );
}

/**
 * Placeholder Silhouette Component
 */
function PlaceholderSilhouette() {
  return (
    <mesh>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshBasicMaterial color="#1a1a2e" transparent opacity={0.3} />
    </mesh>
  );
}

/**
 * Main RPM Viewer Component
 */
export const RpmViewer = forwardRef<RpmViewerRef, RpmViewerProps>(
  (
    {
      level,
      xp,
      xpToNext,
      streakDays = 0,
      seasonColor = '#7A5CFF',
      mood = 'calm',
      onOpenCoach,
    },
    ref
  ) => {
    const [xpPulseValue, setXpPulseValue] = useState(0);
    const [levelPulseValue, setLevelPulseValue] = useState(0);
    const [currentSeasonColor, setCurrentSeasonColor] = useState(seasonColor);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Load avatar URL from store (you'll wire this up via props or context)
    useEffect(() => {
      // For now, this is a placeholder - will be connected to Zustand store
      // setAvatarUrl(useAvatarStore.getState().url);
    }, []);

    // Expose imperative API
    useImperativeHandle(ref, () => ({
      pulseXp: () => {
        setXpPulseValue(1);
        setTimeout(() => setXpPulseValue(0), 1200);
      },
      pulseLevel: () => {
        setLevelPulseValue(1);
        setTimeout(() => setLevelPulseValue(0), 1600);
      },
      setSeason: (color: string) => {
        setCurrentSeasonColor(color);
      },
    }));

    // Handle keyboard accessibility
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && onOpenCoach) {
        e.preventDefault();
        onOpenCoach();
      }
    };

    return (
      <div
        className="relative w-full h-full"
        role="button"
        tabIndex={0}
        onClick={onOpenCoach}
        onKeyPress={handleKeyPress}
        aria-label={`Level ${level} avatar, ${xp}/${xpToNext} XP, ${streakDays} day streak`}
      >
        <Canvas
          className="w-full h-full"
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 1, 3]} fov={45} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />

          {avatarUrl ? (
            <AvatarModel
              url={avatarUrl}
              level={level}
              xp={xp}
              xpToNext={xpToNext}
              seasonColor={currentSeasonColor}
              streakDays={streakDays}
              mood={mood}
              xpPulseValue={xpPulseValue}
              levelPulseValue={levelPulseValue}
            />
          ) : (
            <PlaceholderSilhouette />
          )}
        </Canvas>

        {/* Stats overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-white/60">Level {level}</span>
            <div className="w-32 h-1 bg-[#1a1724] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${(xp / xpToNext) * 100}%` }}
              />
            </div>
          </div>
          {streakDays > 0 && (
            <span className="text-amber-400 font-semibold">
              🔥 {streakDays}
            </span>
          )}
        </div>
      </div>
    );
  }
);

RpmViewer.displayName = 'RpmViewer';

// Preload GLB utility
export function preloadAvatar(url: string) {
  useGLTF.preload(url);
}
