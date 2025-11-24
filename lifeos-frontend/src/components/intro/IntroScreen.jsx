import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import './IntroScreen.css';

// Ultra-optimized particle system
const OptimizedParticles = () => {
  const points = useRef();
  const particleCount = 50;

  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 8 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }

    return positions;
  }, []);

  useFrame((state) => {
    if (points.current) {
      const time = state.clock.getElapsedTime();
      points.current.rotation.y = time * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ffffff"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

// Simple ring
const SimpleRing = () => {
  const mesh = useRef();

  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.getElapsedTime();
      mesh.current.rotation.x = time * 0.15;
      mesh.current.rotation.y = time * 0.2;
    }
  });

  return (
    <mesh ref={mesh}>
      <torusGeometry args={[2.5, 0.03, 8, 64]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.12}
        depthWrite={false}
      />
    </mesh>
  );
};

// Optimized scene
const Scene = () => {
  const cameraRef = useRef();

  useFrame((state) => {
    if (cameraRef.current) {
      const time = state.clock.getElapsedTime();
      cameraRef.current.position.z = 11 + Math.sin(time * 0.4) * 0.3;
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 11]} fov={50} />
      <OptimizedParticles />
      <SimpleRing />
      <ambientLight intensity={0.5} />
    </>
  );
};

// Main intro component
const IntroScreen = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [bootMessage, setBootMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const handleSkip = useCallback(() => {
    setFadeOut(true);
    setTimeout(onComplete, 600);
  }, [onComplete]);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2.6;
      });
    }, 100);

    const timer1 = setTimeout(() => {
      setStage(1);
      setBootMessage('INITIALIZING QUANTUM CORE');
    }, 200);

    const timer2 = setTimeout(() => {
      setBootMessage('NEURAL PATHWAYS SYNCHRONIZED');
    }, 1200);

    const timer3 = setTimeout(() => {
      setStage(2);
      setBootMessage('TEMPORAL MATRIX CALIBRATED');
    }, 2200);

    const timer4 = setTimeout(() => {
      setBootMessage('SYSTEM ONLINE');
    }, 3200);

    const timer5 = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 800);
    }, 4500);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearInterval(progressInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete, handleSkip]);

  return (
    <div className={`intro-screen-minimal ${fadeOut ? 'fade-out' : ''}`}>
      {/* 3D Background */}
      <div className="canvas-container">
        <Canvas
          dpr={1}
          gl={{
            antialias: false,
            powerPreference: "high-performance",
            alpha: false
          }}
        >
          <Scene />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="intro-content">
        {/* Circular HUD rings */}
        <div className={`hud-ring ${stage >= 1 ? 'active' : ''}`}></div>
        <div className={`hud-ring-outer ${stage >= 1 ? 'active' : ''}`}></div>
        <div className={`hud-ring-inner ${stage >= 1 ? 'active' : ''}`}></div>

        {/* Circular progress */}
        <svg className={`circular-progress ${stage >= 1 ? 'active' : ''}`} viewBox="0 0 200 200">
          <circle
            className="progress-bg"
            cx="100"
            cy="100"
            r="90"
          />
          <circle
            className="progress-circle"
            cx="100"
            cy="100"
            r="90"
            style={{
              strokeDashoffset: 565.48 - (565.48 * progress) / 100
            }}
          />
        </svg>

        {/* Center dot */}
        <div className={`center-dot ${stage >= 1 ? 'active' : ''}`}></div>

        {/* Logo */}
        <div className={`logo-wrapper stage-${stage}`}>
          <h1 className="intro-title">QUANTA</h1>
          <div className="logo-underline"></div>
        </div>

        {/* Subtitle */}
        <div className={`subtitle ${stage >= 2 ? 'show' : ''}`}>
          Personal Operating System
        </div>

        {/* Boot message - Bottom left */}
        <div className={`boot-message ${bootMessage ? 'show' : ''}`}>
          <span className="boot-indicator">&gt;</span> {bootMessage}
        </div>

        {/* System metrics - Bottom right */}
        <div className={`system-metrics ${stage >= 1 ? 'show' : ''}`}>
          <div className="metric">
            <span className="metric-label">PWR</span>
            <span className="metric-value">{Math.round(progress)}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">SYS</span>
            <span className="metric-value">ONLINE</span>
          </div>
        </div>

        {/* Skip button */}
        <button className="skip-btn" onClick={handleSkip}>
          ESC
        </button>
      </div>
    </div>
  );
};

export default IntroScreen;
