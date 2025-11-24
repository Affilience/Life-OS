import React from 'react';
import Lottie from 'lottie-react';
import streakAnimation from '../../assets/lottie/streak_milestone.json';

export function StreakMilestoneLottie({ visible, days }: { visible: boolean; days: number }) {
  if (!visible) return null;

  return (
    <div style={{ position: 'absolute', inset: -100, pointerEvents: 'none', zIndex: 10 }}>
      <Lottie
        animationData={streakAnimation}
        loop={false}
        style={{ width: '100%', height: '100%' }}
      />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 48,
        fontWeight: 700,
        color: '#F2C94C',
        textShadow: '0 0 20px #F2C94C80'
      }}>
        {days}
      </div>
    </div>
  );
}
