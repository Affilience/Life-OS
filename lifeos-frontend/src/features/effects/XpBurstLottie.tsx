import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import xpBurstAnimation from '../../assets/lottie/xp_burst.json';

export function XpBurstLottie({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div style={{ position: 'absolute', inset: -50, pointerEvents: 'none', zIndex: 10 }}>
      <Lottie
        animationData={xpBurstAnimation}
        loop={false}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
