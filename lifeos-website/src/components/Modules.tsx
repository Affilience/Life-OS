const modules = [
  {
    name: "Productivity",
    description: "Deep work tracking, task management, projects, and time blocking",
    icon: "✓",
    color: "#8b5cf6",
    stats: ["Track focus sessions", "Manage projects", "Time blocking"],
  },
  {
    name: "Health & Fitness",
    description: "Workouts, nutrition, sleep tracking, and recovery metrics",
    icon: "💪",
    color: "#22d3ee",
    stats: ["Log workouts", "Track macros", "Sleep analysis"],
  },
  {
    name: "Financial",
    description: "Income, expenses, budgets, net worth, and investment tracking",
    icon: "💰",
    color: "#34d399",
    stats: ["Budget tracking", "Net worth", "Income goals"],
  },
  {
    name: "Knowledge",
    description: "Books, notes, ideas, learning logs, and knowledge graphs",
    icon: "📚",
    color: "#fbbf24",
    stats: ["Reading log", "Note-taking", "Idea capture"],
  },
  {
    name: "Journal",
    description: "Daily entries, mood tracking, gratitude, and reflection prompts",
    icon: "📝",
    color: "#fb7185",
    stats: ["Daily journaling", "Mood tracking", "Prompts"],
  },
  {
    name: "Calendar",
    description: "Time blocking, event planning, and schedule optimization",
    icon: "📅",
    color: "#a78bfa",
    stats: ["Time blocking", "Event sync", "Schedule view"],
  },
  {
    name: "Skills",
    description: "Skill trees, practice logs, and progression tracking",
    icon: "⭐",
    color: "#f472b6",
    stats: ["Skill trees", "Practice logs", "Level up"],
  },
  {
    name: "Purpose",
    description: "Goals, values, vision boards, and life purpose alignment",
    icon: "🎯",
    color: "#818cf8",
    stats: ["Goal setting", "Values", "Vision board"],
  },
];

export function Modules() {
  return (
    <section id="modules" className="section bg-[#0a0812]">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            8 Powerful Modules,
            <span className="gradient-text"> One Unified System</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Each module is designed to work standalone, but the real magic happens
            when they work together — revealing patterns and insights across your entire life.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((module, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.04]"
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ backgroundColor: `${module.color}20` }}
              >
                {module.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {module.name}
              </h3>
              <p className="text-sm text-white/50 mb-4">
                {module.description}
              </p>

              {/* Stats/Features */}
              <div className="flex flex-wrap gap-2">
                {module.stats.map((stat, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/40"
                  >
                    {stat}
                  </span>
                ))}
              </div>

              {/* Hover Glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${module.color}10 0%, transparent 70%)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Cross-Module Insight */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">
                Cross-Module Intelligence
              </h3>
              <p className="text-white/60">
                "You're 30% more productive after morning workouts. You journal more
                consistently when you sleep 7+ hours. Your best deep work happens on
                days you eat high-protein breakfasts."
              </p>
              <p className="text-sm text-white/40 mt-4">
                — Insights only possible when all your data lives in one place
              </p>
            </div>
            <div className="w-full md:w-80 h-40 rounded-xl bg-[#1a1724] flex items-center justify-center">
              <span className="text-white/30">[Correlation Graph]</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
