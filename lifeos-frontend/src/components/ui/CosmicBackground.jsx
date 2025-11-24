/**
 * Cosmic Background Component
 * Consistent, subtle cosmic background for all pages
 * Research-based: 3-5% opacity gradients, no overwhelming effects
 */

import React from 'react';

export default function CosmicBackground({ variant = 'default', className = '' }) {
  const variants = {
    // Default - Purple/Teal dual gradients (most pages)
    default: (
      <>
        <div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          }}
        />
      </>
    ),

    // Purple - Single purple gradient (Purpose & Values)
    purple: (
      <>
        <div
          className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
          }}
        />
      </>
    ),

    // Pink - Pink/Purple gradient (Calendar/Health)
    pink: (
      <>
        <div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          }}
        />
      </>
    ),

    // Blue - Blue/Cyan gradient (Knowledge)
    blue: (
      <>
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
          }}
        />
      </>
    ),

    // None - No background (for minimal pages)
    none: null,
  };

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 ${className}`}>
      {variants[variant]}
    </div>
  );
}
