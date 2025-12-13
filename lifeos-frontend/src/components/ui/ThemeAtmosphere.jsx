/**
 * ThemeAtmosphere - Renders atmospheric visual depth effects for themes
 *
 * This component creates the visual depth that makes themes feel immersive:
 * - Multi-layer gradient backgrounds
 * - Floating ambient glow orbs
 * - Subtle noise texture
 * - Edge vignette
 * - Theme-specific effects (scan lines, grid, caustics)
 */

import React from 'react';
import useThemeStore from '../../stores/themeStore';
import { getThemeAtmosphere } from '../../lib/themes';

export default function ThemeAtmosphere({ className = '' }) {
  const { currentTheme } = useThemeStore();
  const atmosphere = getThemeAtmosphere(currentTheme);

  if (!atmosphere || !atmosphere.gradient) {
    return null;
  }

  return (
    <div className={`theme-atmosphere ${className}`}>
      {/* Main gradient layer */}
      <div
        className="atmosphere-gradient"
        style={{ backgroundImage: atmosphere.gradient }}
      />

      {/* Floating orbs */}
      {atmosphere.orbs?.map((orb, index) => (
        <div
          key={index}
          className="atmosphere-orb"
          style={{
            backgroundColor: orb.color,
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            filter: `blur(${orb.blur})`,
          }}
        />
      ))}

      {/* Noise texture overlay */}
      {atmosphere.noiseOpacity > 0 && (
        <div
          className="atmosphere-noise"
          style={{ opacity: atmosphere.noiseOpacity }}
        />
      )}

      {/* Vignette overlay */}
      {atmosphere.vignetteOpacity > 0 && (
        <div
          className="atmosphere-vignette"
          style={{
            background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${atmosphere.vignetteOpacity}) 100%)`
          }}
        />
      )}

      {/* Theme-specific effects */}
      {atmosphere.scanLines && <div className="atmosphere-scanlines" />}
      {atmosphere.gridLines && <div className="atmosphere-grid" />}
      {atmosphere.caustics && <div className="atmosphere-caustics" />}

      <style>{`
        .theme-atmosphere {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .atmosphere-gradient {
          position: absolute;
          inset: 0;
          background-size: 100% 100%;
        }

        .atmosphere-orb {
          position: absolute;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: orbFloat 20s ease-in-out infinite;
        }

        .atmosphere-orb:nth-child(2) {
          animation-delay: -5s;
          animation-duration: 25s;
        }

        .atmosphere-orb:nth-child(3) {
          animation-delay: -10s;
          animation-duration: 22s;
        }

        @keyframes orbFloat {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          25% {
            transform: translate(-48%, -52%) scale(1.05);
          }
          50% {
            transform: translate(-52%, -48%) scale(0.95);
          }
          75% {
            transform: translate(-50%, -50%) scale(1.02);
          }
        }

        .atmosphere-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          mix-blend-mode: overlay;
        }

        .atmosphere-vignette {
          position: absolute;
          inset: 0;
        }

        /* Synthwave scan lines effect */
        .atmosphere-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          );
        }

        /* Cyber grid effect */
        .atmosphere-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 50%, transparent 100%);
        }

        /* Ocean caustics effect */
        .atmosphere-caustics {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 30% 20% at 20% 30%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 25% 15% at 60% 50%, rgba(6, 182, 212, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 35% 25% at 80% 70%, rgba(14, 165, 233, 0.07) 0%, transparent 50%);
          animation: causticsMove 15s ease-in-out infinite;
        }

        @keyframes causticsMove {
          0%, 100% {
            transform: scale(1) translate(0, 0);
          }
          33% {
            transform: scale(1.1) translate(2%, 3%);
          }
          66% {
            transform: scale(0.95) translate(-2%, -2%);
          }
        }
      `}</style>
    </div>
  );
}
