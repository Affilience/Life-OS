import React from 'react';
import { TrendingUp, Target, Award, Zap, BookOpen, Code, Palette } from 'lucide-react';
import MiniBarChart from '../shared/charts/MiniBarChart';
import MiniLineChart from '../shared/charts/MiniLineChart';
import StatCard from '../shared/charts/StatCard';

export default function SkillsDashboard() {
  // Mock data
  const practiceHoursData = [
    { label: 'Mon', value: 2 },
    { label: 'Tue', value: 3 },
    { label: 'Wed', value: 1.5 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 2.5 },
    { label: 'Sat', value: 5 },
    { label: 'Sun', value: 3 },
  ];

  const progressTrendData = [
    { label: 'W1', value: 65 },
    { label: 'W2', value: 68 },
    { label: 'W3', value: 72 },
    { label: 'W4', value: 75 },
  ];

  const activeSkills = [
    {
      name: 'React Development',
      category: 'Programming',
      level: 7,
      progress: 75,
      hours: 156,
      icon: Code,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'UI/UX Design',
      category: 'Design',
      level: 5,
      progress: 58,
      hours: 89,
      icon: Palette,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Technical Writing',
      category: 'Writing',
      level: 6,
      progress: 67,
      hours: 102,
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500'
    },
  ];

  const recentAchievements = [
    { title: 'Built First Full-Stack App', date: '2 days ago', xp: 500 },
    { title: 'Completed Advanced Hooks Course', date: '5 days ago', xp: 300 },
    { title: '30-Day Practice Streak', date: '1 week ago', xp: 250 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0614] via-[#0a0a0a] to-[#0a0a0a] pb-20">
      {/* Header with skill progression aesthetic */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-cyan-900/20 backdrop-blur-md border-b border-cyan-500/20">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            Skills Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track practice, progression, and real-world application
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Top Stats - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Active Skills"
            value="5"
            subtitle="in progress"
            trend="up"
            trendValue="+2 new"
            icon={Target}
            color="cyan"
          />
          <StatCard
            title="Total Hours"
            value="347h"
            subtitle="all time"
            trend="up"
            trendValue="+21h"
            icon={Zap}
            color="blue"
          />
          <StatCard
            title="Avg Progress"
            value="68%"
            subtitle="across skills"
            trend="up"
            trendValue="+5%"
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Mastered"
            value="2"
            subtitle="skills"
            icon={Award}
            color="yellow"
          />
        </div>

        {/* Practice Hours This Week */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Practice Hours (This Week)
              </h3>
              <p className="text-xs text-gray-400 mt-1">Daily deliberate practice</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">21h</div>
              <div className="text-xs text-gray-400">total</div>
            </div>
          </div>
          <div className="h-32">
            <MiniBarChart data={practiceHoursData} color="cyan" showValues maxHeight={120} />
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
              <p className="text-xs text-gray-400 mt-1">Average skill progression</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">75%</div>
              <div className="text-xs text-gray-400">current avg</div>
            </div>
          </div>
          <div className="h-32">
            <MiniLineChart data={progressTrendData} color="cyan" filled={true} showDots={true} />
          </div>
        </div>

        {/* Active Skills with Progress Bars */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Active Skills
          </h3>
          <div className="space-y-4">
            {activeSkills.map((skill, index) => {
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
                          <p className="text-xs text-gray-400">{skill.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">Level {skill.level}</div>
                          <div className="text-xs text-gray-400">{skill.hours}h</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progress to Level {skill.level + 1}</span>
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
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white font-medium">{achievement.title}</p>
                  <p className="text-xs text-gray-400">{achievement.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">+{achievement.xp}</span>
                  <span className="text-xs text-gray-400">XP</span>
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
