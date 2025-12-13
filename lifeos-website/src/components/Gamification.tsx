export function Gamification() {
  return (
    <section id="gamification" className="section">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Level Up
            <span className="gradient-text"> Your Life</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Personal development shouldn't feel like a chore. Our gamification system
            makes building habits and achieving goals genuinely fun.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Avatar Evolution */}
          <div className="order-2 lg:order-1">
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Watch Yourself Evolve
              </h3>
              <p className="text-white/60 mb-6">
                Your avatar evolves through 40 unique stages as you progress.
                From a tiny seed of potential to a magnificent cosmic being.
              </p>

              {/* Evolution Stages Preview */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                {["Seed", "Sprout", "Sapling", "Tree", "Cosmos"].map((stage, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center text-xl mb-2">
                      {["🌱", "🌿", "🌳", "✨", "🌌"][i]}
                    </div>
                    <span className="text-xs text-white/40">{stage}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <div>
                  <p className="text-white font-medium">Level 24 • Nebula Stage</p>
                  <p className="text-white/50 text-sm">12,450 / 15,000 XP to next level</p>
                  <div className="w-full h-2 bg-white/10 rounded-full mt-2">
                    <div className="h-full w-[83%] bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Gamification Features */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* XP System */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">XP For Everything</h4>
                <p className="text-white/60">
                  Complete tasks, finish workouts, log meals, write journal entries — everything
                  earns XP that contributes to your level.
                </p>
              </div>
            </div>

            {/* Streaks */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Powerful Streaks</h4>
                <p className="text-white/60">
                  Track multiple streaks with animated flames that grow as you maintain them.
                  Create custom streaks for any habit you want to build.
                </p>
              </div>
            </div>

            {/* Achievements */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">100+ Achievements</h4>
                <p className="text-white/60">
                  Unlock achievements for milestones like "First 30-day streak", "1000 Tasks
                  Completed", or "Night Owl" for late-night productivity.
                </p>
              </div>
            </div>

            {/* Quests */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚔️</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Daily & Weekly Quests</h4>
                <p className="text-white/60">
                  Fresh challenges every day and week. Complete quests for bonus XP
                  and special rewards.
                </p>
              </div>
            </div>

            {/* Skill Trees */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🌳</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Skyrim-Style Skill Trees</h4>
                <p className="text-white/60">
                  Unlock perks as you level up skills. Gain real bonuses like "Early Riser"
                  (2x XP for morning tasks) or "Deep Focus" (bonus for long work sessions).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 p-2 rounded-full bg-white/5 border border-white/10">
            <button className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium">
              Cosmic Mode
            </button>
            <button className="px-6 py-2 rounded-full text-white/60 hover:text-white transition-colors">
              Professional Mode
            </button>
            <button className="px-6 py-2 rounded-full text-white/60 hover:text-white transition-colors">
              Minimal Mode
            </button>
          </div>
          <p className="text-white/40 text-sm mt-4">
            Too much? Switch to Professional or Minimal mode for a cleaner experience.
          </p>
        </div>
      </div>
    </section>
  );
}
