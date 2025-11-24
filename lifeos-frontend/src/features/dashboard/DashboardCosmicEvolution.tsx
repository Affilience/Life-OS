import React, { useEffect } from 'react';
import { CosmicAvatar } from '../cosmic-evolution/components/CosmicAvatar';
import { ProgressBar } from '../cosmic-evolution/components/ProgressBar';
import { useEvolutionStore } from '../cosmic-evolution/stores/evolutionStore';
import type { UserStats } from '../avatar/types';

interface DashboardCosmicEvolutionProps {
  user: UserStats;
}

export function DashboardCosmicEvolution({ user }: DashboardCosmicEvolutionProps) {
  const { setXP } = useEvolutionStore();

  // Sync cosmic evolution XP with user stats
  // Map user level to total XP (simple mapping: level * 100)
  useEffect(() => {
    const totalXP = user.level * 100 + user.xp;
    setXP(totalXP);
  }, [user.level, user.xp, setXP]);

  const handleEvolution = (newStage: number) => {
    console.log(`🎉 Evolved to Stage ${newStage}!`);
  };

  return (
    <section className="relative rounded-2xl border border-white/10 bg-[#0c0a10] p-6 overflow-hidden">
      <div className="relative flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative">
          <CosmicAvatar
            size={300}
            showProgress={true}
            onEvolution={handleEvolution}
          />
        </div>

        <div className="flex-1 space-y-4 min-w-0">
          <ProgressBar />

          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-white/60">Streak:</span>{' '}
              <span className="text-amber-400 font-semibold">{user.streakDays} days</span>
            </div>
            <div>
              <span className="text-white/60">Season:</span>{' '}
              <span className="text-violet-400 font-semibold capitalize">{user.season}</span>
            </div>
            <div>
              <span className="text-white/60">Mood:</span>{' '}
              <span className="text-cyan-400 font-semibold capitalize">{user.mood}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
