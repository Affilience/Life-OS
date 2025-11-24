import React, { useState } from 'react';
import { RealisticCosmicAvatar } from '../avatar/RealisticCosmicAvatar';
import { useCelebrationBus } from '../effects/useCelebrationBus';
import { XpBurstLottie } from '../effects/XpBurstLottie';
import { LevelUpLottie } from '../effects/LevelUpLottie';
import { StreakMilestoneLottie } from '../effects/StreakMilestoneLottie';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import type { UserStats } from '../avatar/types';

export function DashboardAvatarSection({ user }: { user: UserStats }) {
  const reducedMotion = usePrefersReducedMotion();
  const [showXpBurst, setShowXpBurst] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [streakInfo, setStreakInfo] = useState<{visible:boolean;days:number}>({visible:false, days:0});

  useCelebrationBus({
    onXpBurst: () => {
      if (!reducedMotion) {
        setShowXpBurst(true);
        setTimeout(() => setShowXpBurst(false), 1000);
      }
    },
    onLevelUp: () => {
      if (!reducedMotion) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 1500);
      }
    },
    onStreakMilestone: (days) => {
      if (!reducedMotion) {
        setStreakInfo({ visible: true, days });
        setTimeout(() => setStreakInfo({visible:false, days:0}), 2000);
      }
    }
  });

  return (
    <section className="relative rounded-2xl border border-white/10 bg-[#0a0e1a] p-6 overflow-hidden">
      <div className="relative flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative">
          <RealisticCosmicAvatar
            level={user.level}
            xp={user.xp}
            xpToNext={user.xpToNext}
            streakDays={user.streakDays}
            season={user.season}
            mood={user.mood}
            onOpenCoach={() => alert('AI Coach opened!')}
            reducedMotion={reducedMotion}
          />
          <XpBurstLottie visible={showXpBurst} />
          <LevelUpLottie visible={showLevelUp} />
          <StreakMilestoneLottie visible={streakInfo.visible} days={streakInfo.days} />
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <div>
            <div className="text-2xl font-bold text-white mb-1">Level {user.level}</div>
            <div className="text-sm text-gray-400">{user.xp} / {user.xpToNext} XP</div>
          </div>

          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${(user.xp / user.xpToNext) * 100}%` }}
            />
          </div>

          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-gray-400">Streak:</span>{' '}
              <span className="text-amber-400 font-semibold">{user.streakDays} days</span>
            </div>
            <div>
              <span className="text-gray-400">Season:</span>{' '}
              <span className="text-violet-400 font-semibold capitalize">{user.season}</span>
            </div>
            <div>
              <span className="text-gray-400">Mood:</span>{' '}
              <span className="text-cyan-400 font-semibold capitalize">{user.mood}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
