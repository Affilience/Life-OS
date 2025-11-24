import React from 'react';
import { BookOpen, TrendingUp, Calendar, Heart, Sparkles, Pen } from 'lucide-react';
import MiniLineChart from '../shared/charts/MiniLineChart';
import StatCard from '../shared/charts/StatCard';

export default function JournalDashboard() {
  // Mock data for journal stats
  const moodTrendData = [
    { label: 'Mon', value: 7 },
    { label: 'Tue', value: 8 },
    { label: 'Wed', value: 6 },
    { label: 'Thu', value: 9 },
    { label: 'Fri', value: 8 },
    { label: 'Sat', value: 9 },
    { label: 'Sun', value: 7 },
  ];

  const entryFrequencyData = [
    { label: 'W1', value: 5 },
    { label: 'W2', value: 6 },
    { label: 'W3', value: 7 },
    { label: 'W4', value: 6 },
  ];

  const topEmotions = [
    { emotion: 'Grateful', count: 23, color: 'from-pink-500 to-rose-500' },
    { emotion: 'Focused', count: 18, color: 'from-purple-500 to-indigo-500' },
    { emotion: 'Energized', count: 15, color: 'from-orange-500 to-amber-500' },
    { emotion: 'Calm', count: 12, color: 'from-blue-500 to-cyan-500' },
  ];

  const recentThemes = [
    { theme: 'Personal Growth', entries: 15 },
    { theme: 'Work Progress', entries: 12 },
    { theme: 'Relationships', entries: 8 },
    { theme: 'Health Journey', entries: 7 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0614] via-[#0a0a0a] to-[#0a0a0a] pb-20">
      {/* Header with diary aesthetic */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 backdrop-blur-md border-b border-purple-500/20">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Journal Dashboard
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Your journey of reflection and self-discovery
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Top Stats - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Current Streak"
            value="12"
            subtitle="days"
            trend="up"
            trendValue="+3 days"
            icon={Calendar}
            color="purple"
          />
          <StatCard
            title="Total Entries"
            value="87"
            subtitle="this year"
            trend="up"
            trendValue="+6 this week"
            icon={Pen}
            color="pink"
          />
          <StatCard
            title="Avg Mood"
            value="7.8"
            subtitle="out of 10"
            trend="up"
            trendValue="+0.4"
            icon={Heart}
            color="rose"
          />
          <StatCard
            title="Word Count"
            value="24.3k"
            subtitle="total words"
            trend="up"
            trendValue="+2.1k"
            icon={Sparkles}
            color="indigo"
          />
        </div>

        {/* Mood Trend Chart */}
        <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Mood Trend (7 Days)
              </h3>
              <p className="text-xs text-white/60 mt-1">Daily emotional patterns</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">7.8</div>
              <div className="text-xs text-white/60">avg mood</div>
            </div>
          </div>
          <div className="h-32">
            <MiniLineChart data={moodTrendData} color="pink" filled={true} showDots={true} />
          </div>
        </div>

        {/* Top Emotions - with gradient bars */}
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Top Emotions (This Month)
          </h3>
          <div className="space-y-3">
            {topEmotions.map((item, index) => {
              const percentage = (item.count / topEmotions[0].count) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{item.emotion}</span>
                    <span className="text-white/60">{item.count} times</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Entry Frequency */}
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Writing Frequency
              </h3>
              <p className="text-xs text-white/60 mt-1">Entries per week</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">6.5</div>
              <div className="text-xs text-white/60">avg/week</div>
            </div>
          </div>
          <div className="h-24">
            <MiniLineChart data={entryFrequencyData} color="purple" filled={true} />
          </div>
        </div>

        {/* Recent Themes */}
        <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Recurring Themes
          </h3>
          <div className="space-y-3">
            {recentThemes.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  <span className="text-gray-300">{item.theme}</span>
                </div>
                <span className="text-sm text-white/60">{item.entries} entries</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection Prompt Card */}
        <div className="bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-purple-600/20 border border-purple-400/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Today's Reflection</h3>
            </div>
            <p className="text-gray-300 text-sm italic mb-4">
              "What moment today made you feel most alive? How can you create more of those moments?"
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
              Start Writing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
