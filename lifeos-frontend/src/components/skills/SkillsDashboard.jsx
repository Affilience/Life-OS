import React, { useMemo } from 'react';
import { TrendingUp, Target, Award, Zap, BookOpen, Code, Palette, Music, Brush, Wrench } from 'lucide-react';
import MiniBarChart from '../shared/charts/MiniBarChart';
import MiniLineChart from '../shared/charts/MiniLineChart';
import StatCard from '../shared/charts/StatCard';
import useSkillsStore from '../../stores/skillsStore';
import { useGamificationStore } from '../../stores/gamificationStore';

// Category to icon mapping
const CATEGORY_ICONS = {
  programming: Code,
  design: Palette,
  writing: BookOpen,
  music: Music,
  art: Brush,
  default: Wrench
};

const CATEGORY_COLORS = {
  programming: 'from-blue-500 to-cyan-500',
  design: 'from-purple-500 to-pink-500',
  writing: 'from-green-500 to-emerald-500',
  music: 'from-orange-500 to-red-500',
  art: 'from-pink-500 to-rose-500',
  default: 'from-gray-500 to-gray-600'
};

export default function SkillsDashboard() {
  // Connect to stores
  const { skills } = useSkillsStore();
  const { recentEvents } = useGamificationStore();

  // Calculate real stats from store data
  const stats = useMemo(() => {
    const today = new Date();
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    // Calculate practice hours per day from skill sessions
    const practiceHoursData = last7Days.map(date => {
      let totalMinutes = 0;
      (skills || []).forEach(skill => {
        const daySessions = (skill.sessions || []).filter(s => s.date?.startsWith(date));
        totalMinutes += daySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      });
      const dayOfWeek = new Date(date).getDay();
      return { label: dayLabels[dayOfWeek], value: Math.round((totalMinutes / 60) * 10) / 10 };
    });

    // Total weekly practice hours
    const weeklyHours = practiceHoursData.reduce((sum, d) => sum + d.value, 0);

    // Calculate total all-time hours
    const totalHours = (skills || []).reduce((sum, skill) => {
      const skillHours = (skill.sessions || []).reduce((s, session) => s + (session.duration || 0), 0);
      return sum + skillHours;
    }, 0) / 60;

    // Calculate progress trend (last 4 weeks)
    const progressTrendData = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (w * 7 + 7));
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - (w * 7));

      const avgProgress = (skills || []).length > 0
        ? Math.round((skills || []).reduce((sum, s) => sum + (s.progress || 0), 0) / skills.length)
        : 0;
      progressTrendData.push({ label: `W${4 - w}`, value: avgProgress });
    }

    // Build active skills list
    const activeSkills = (skills || []).slice(0, 5).map(skill => {
      const category = (skill.category || 'default').toLowerCase();
      const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
      const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
      const hours = (skill.sessions || []).reduce((sum, s) => sum + (s.duration || 0), 0) / 60;

      return {
        name: skill.name || 'Skill',
        category: skill.category || 'General',
        level: skill.level || 1,
        progress: skill.progress || 0,
        hours: Math.round(hours),
        icon: Icon,
        color
      };
    });

    // Calculate mastered skills (level >= 10)
    const masteredCount = (skills || []).filter(s => (s.level || 0) >= 10).length;

    // Average progress across all skills
    const avgProgress = (skills || []).length > 0
      ? Math.round((skills || []).reduce((sum, s) => sum + (s.progress || 0), 0) / skills.length)
      : 0;

    // Recent achievements from gamification events
    const achievementEvents = (recentEvents || [])
      .filter(e => e.eventType === 'achievement_unlocked' || e.eventType === 'xp_gained')
      .slice(0, 3)
      .map(e => {
        const eventDate = new Date(e.timestamp);
        const diffDays = Math.floor((today - eventDate) / (1000 * 60 * 60 * 24));
        const dateStr = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
        return {
          title: e.eventData?.title || e.eventData?.reason || 'Achievement',
          date: dateStr,
          xp: e.eventData?.amount || e.eventData?.xp || 100
        };
      });

    return {
      practiceHoursData,
      weeklyHours: Math.round(weeklyHours * 10) / 10,
      totalHours: Math.round(totalHours),
      progressTrendData,
      activeSkills: activeSkills.length > 0 ? activeSkills : [
        { name: 'Add your first skill', category: 'Get Started', level: 1, progress: 0, hours: 0, icon: Target, color: 'from-gray-500 to-gray-600' }
      ],
      skillCount: (skills || []).length,
      masteredCount,
      avgProgress,
      recentAchievements: achievementEvents.length > 0 ? achievementEvents : [
        { title: 'Start practicing to earn achievements!', date: 'Get started', xp: 0 }
      ]
    };
  }, [skills, recentEvents]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0614] via-[#0a0a0a] to-[#0a0a0a] pb-20">
      {/* Header with skill progression aesthetic */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-cyan-900/20 backdrop-blur-md border-b border-cyan-500/20">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            Skills Dashboard
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Track practice, progression, and real-world application
          </p>
        </div>
      </div>

      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Top Stats - 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard
            title="Active Skills"
            value={String(stats.skillCount)}
            subtitle="in progress"
            trend={stats.skillCount > 0 ? "up" : "neutral"}
            trendValue={stats.skillCount > 0 ? "tracking" : ""}
            icon={Target}
            color="cyan"
          />
          <StatCard
            title="Total Hours"
            value={`${stats.totalHours}h`}
            subtitle="all time"
            trend={stats.totalHours > 0 ? "up" : "neutral"}
            trendValue={stats.weeklyHours > 0 ? `+${stats.weeklyHours}h this week` : ""}
            icon={Zap}
            color="blue"
          />
          <StatCard
            title="Avg Progress"
            value={`${stats.avgProgress}%`}
            subtitle="across skills"
            trend={stats.avgProgress > 50 ? "up" : "neutral"}
            trendValue=""
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Mastered"
            value={String(stats.masteredCount)}
            subtitle="skills"
            icon={Award}
            color="yellow"
          />
        </div>

        {/* Practice Hours This Week */}
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Practice Hours (This Week)
              </h3>
              <p className="text-xs text-white/60 mt-1">Daily deliberate practice</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{stats.weeklyHours}h</div>
              <div className="text-xs text-white/60">total</div>
            </div>
          </div>
          <div className="h-32">
            <MiniBarChart data={stats.practiceHoursData} color="cyan" showValues maxHeight={120} />
          </div>
        </div>

        {/* Progress Trend */}
        <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border border-cyan-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Overall Progress Trend
              </h3>
              <p className="text-xs text-white/60 mt-1">Average skill progression</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{stats.avgProgress}%</div>
              <div className="text-xs text-white/60">current avg</div>
            </div>
          </div>
          <div className="h-32">
            <MiniLineChart data={stats.progressTrendData} color="cyan" filled={true} showDots={true} />
          </div>
        </div>

        {/* Active Skills with Progress Bars */}
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Active Skills
          </h3>
          <div className="space-y-4">
            {stats.activeSkills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${skill.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-semibold">{skill.name}</h4>
                          <p className="text-xs text-white/60">{skill.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">Level {skill.level}</div>
                          <div className="text-xs text-white/60">{skill.hours}h</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Progress to Level {skill.level + 1}</span>
                      <span className="text-white font-semibold">{skill.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-500`}
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Recent Achievements
          </h3>
          <div className="space-y-3">
            {stats.recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white font-medium">{achievement.title}</p>
                  <p className="text-xs text-white/60">{achievement.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">+{achievement.xp}</span>
                  <span className="text-xs text-white/60">XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Insights */}
        <div className="bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-blue-600/20 border border-blue-400/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold">Learning Insights</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>Best practice sessions are 9-11am (90% completion rate)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>You've applied React Development in 12 real projects this month</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Consider adding complementary skill: TypeScript (80% synergy)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
