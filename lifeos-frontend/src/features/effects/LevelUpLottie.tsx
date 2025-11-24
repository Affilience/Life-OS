import React from 'react';
import Lottie from 'lottie-react';
import levelUpAnimation from '../../assets/lottie/level_up.json';

export function LevelUpLottie({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div style={{ position: 'absolute', inset: -75, pointerEvents: 'none', zIndex: 10 }}>
      <Lottie
        animationData={levelUpAnimation}
        loop={false}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
