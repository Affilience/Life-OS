import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, Calendar, Heart, Sparkles, Pen } from 'lucide-react';
import { format, subDays } from 'date-fns';
import MiniLineChart from '../shared/charts/MiniLineChart';
import StatCard from '../shared/charts/StatCard';
import { useJournalStore } from '../../features/journal/journal.store';

export default function JournalDashboard() {
  const navigate = useNavigate();
  const { entries, hydrate, loading } = useJournalStore();

  // Load entries on mount
  useEffect(() => {
    hydrate();
  }, []);

  const handleStartWriting = () => {
    const today = new Date();
    navigate(`/journal/${format(today, 'yyyy')}/${format(today, 'MM')}`);
  };

  // Calculate all stats from real entries
  const { moodTrendData, entryFrequencyData, topEmotions, recentThemes, stats } = useMemo(() => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    // Build last 7 days for mood trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      last7Days.push({
        dateStr: format(d, 'yyyy-MM-dd'),
        label: dayLabels[d.getDay()]
      });
    }

    // Calculate mood for each day
    const moodData = last7Days.map(({ dateStr, label }) => {
      const dayEntries = (entries || []).filter(e => e.date === dateStr);
      const avgMood = dayEntries.length > 0
        ? Math.round(dayEntries.reduce((sum, e) => sum + (e.mood || 5), 0) / dayEntries.length)
        : 0;
      return { label, value: avgMood };
    });

    // Calculate weekly entry frequency (last 4 weeks)
    const weeklyData = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = subDays(today, (w + 1) * 7);
      const weekEnd = subDays(today, w * 7);
      const weekEntries = (entries || []).filter(e => {
        const entryDate = new Date(e.date);
        return entryDate >= weekStart && entryDate < weekEnd;
      }).length;
      weeklyData.push({ label: `W${4 - w}`, value: weekEntries });
    }

    // Extract emotions/moods from tags
    const emotionCounts = {};
    const themeCounts = {};
    (entries || []).forEach(e => {
      (e.tags || []).forEach(tag => {
        const lowerTag = tag.toLowerCase();
        // Common emotion tags
        if (['grateful', 'focused', 'energized', 'calm', 'happy', 'motivated', 'anxious', 'tired'].includes(lowerTag)) {
          emotionCounts[tag] = (emotionCounts[tag] || 0) + 1;
        } else {
          // Consider other tags as themes
          themeCounts[tag] = (themeCounts[tag] || 0) + 1;
        }
      });
    });

    // Build top emotions
    const emotionColors = {
      grateful: 'from-pink-500 to-rose-500',
      focused: 'from-purple-500 to-indigo-500',
      energized: 'from-orange-500 to-amber-500',
      calm: 'from-blue-500 to-cyan-500',
      happy: 'from-yellow-500 to-amber-500',
      motivated: 'from-green-500 to-emerald-500',
      anxious: 'from-red-500 to-rose-500',
      tired: 'from-gray-500 to-slate-500'
    };
    const emotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        count,
        color: emotionColors[emotion.toLowerCase()] || 'from-purple-500 to-pink-500'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    // Build recent themes
    const themes = Object.entries(themeCounts)
      .map(([theme, entries]) => ({
        theme: theme.charAt(0).toUpperCase() + theme.slice(1).replace(/-/g, ' '),
        entries
      }))
      .sort((a, b) => b.entries - a.entries)
      .slice(0, 4);

    // Calculate overall stats
    const totalEntries = (entries || []).length;
    const totalWords = (entries || []).reduce((sum, e) => sum + (e.wordCount || 0), 0);
    const avgMood = totalEntries > 0
      ? ((entries || []).reduce((sum, e) => sum + (e.mood || 5), 0) / totalEntries).toFixed(1)
      : '0';

    // Calculate streak
    let streak = 0;
    const entriesByDate = new Map();
    (entries || []).forEach(e => entriesByDate.set(e.date, true));
    for (let i = 0; i < 365; i++) {
      const checkDate = format(subDays(today, i), 'yyyy-MM-dd');
      if (entriesByDate.has(checkDate)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // This week entries
    const weekAgo = subDays(today, 7);
    const thisWeekEntries = (entries || []).filter(e => new Date(e.date) >= weekAgo).length;

    return {
      moodTrendData: moodData,
      entryFrequencyData: weeklyData,
      topEmotions: emotions.length > 0 ? emotions : [
        { emotion: 'No data', count: 0, color: 'from-gray-500 to-slate-500' }
      ],
      recentThemes: themes.length > 0 ? themes : [
        { theme: 'No themes yet', entries: 0 }
      ],
      stats: {
        streak,
        totalEntries,
        avgMood,
        totalWords,
        thisWeekEntries,
        avgPerWeek: totalEntries > 0 ? (weeklyData.reduce((sum, w) => sum + w.value, 0) / 4).toFixed(1) : '0'
      }
    };
  }, [entries]);

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

      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Top Stats - 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard
            title="Current Streak"
            value={stats.streak.toString()}
            subtitle="days"
            trend={stats.streak > 0 ? "up" : "neutral"}
            trendValue={stats.streak > 0 ? `${stats.streak} day streak` : "Start writing!"}
            icon={Calendar}
            color="purple"
          />
          <StatCard
            title="Total Entries"
            value={stats.totalEntries.toString()}
            subtitle="entries"
            trend={stats.thisWeekEntries > 0 ? "up" : "neutral"}
            trendValue={`+${stats.thisWeekEntries} this week`}
            icon={Pen}
            color="pink"
          />
          <StatCard
            title="Avg Mood"
            value={stats.avgMood}
            subtitle="out of 10"
            trend={parseFloat(stats.avgMood) >= 5 ? "up" : "down"}
            trendValue={`${stats.avgPerWeek} avg/week`}
            icon={Heart}
            color="rose"
          />
          <StatCard
            title="Word Count"
            value={stats.totalWords >= 1000 ? `${(stats.totalWords / 1000).toFixed(1)}k` : stats.totalWords.toString()}
            subtitle="total words"
            trend="up"
            trendValue={`${stats.totalEntries > 0 ? Math.round(stats.totalWords / stats.totalEntries) : 0} avg/entry`}
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
              <div className="text-2xl font-bold text-white">{stats.avgMood}</div>
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
              <div className="text-2xl font-bold text-white">{stats.avgPerWeek}</div>
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
            <button
              onClick={handleStartWriting}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Start Writing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
