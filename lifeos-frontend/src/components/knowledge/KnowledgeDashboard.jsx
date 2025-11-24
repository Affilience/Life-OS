import React from 'react';
import {
  Book,
  BookOpen,
  Lightbulb,
  FileText,
  TrendingUp,
  Clock,
  Bookmark,
  Sparkles
} from 'lucide-react';
import MiniBarChart from '../shared/charts/MiniBarChart';

/**
 * Knowledge Management Module Dashboard
 *
 * Unique Design: Library/academic aesthetic with book shelves,
 * reading progress, note clusters, and learning metrics
 *
 * Key KPIs:
 * - Books read/in progress
 * - Reading hours
 * - Notes captured
 * - Ideas generated
 * - Knowledge connections
 * - Implementation rate
 * - Learning streaks
 */
export default function KnowledgeDashboard() {
  // Mock data
  const weeklyReadingHours = [
    { label: 'Mon', value: 2.5 },
    { label: 'Tue', value: 1.8 },
    { label: 'Wed', value: 3.2 },
    { label: 'Thu', value: 2.1 },
    { label: 'Fri', value: 2.8 },
    { label: 'Sat', value: 4.5 },
    { label: 'Sun', value: 3.8 }
  ];

  const monthlyNotes = [
    { label: 'W1', value: 12 },
    { label: 'W2', value: 18 },
    { label: 'W3', value: 15 },
    { label: 'W4', value: 22 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0614] via-[#0a0a0a] to-[#0a0a0a] pb-20">
      {/* Header with library theme */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-900/20 via-cyan-900/20 to-blue-900/20 backdrop-blur-md border-b border-blue-500/20 px-6 py-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Book className="w-6 h-6 text-blue-400" />
          Knowledge Management
        </h1>
        <p className="text-sm text-white/60 mt-1">
          Books, notes, ideas & learning metrics
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Reading Progress Banner */}
        <div className="relative bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-blue-500/10 border border-blue-500/30 rounded-2xl p-6 overflow-hidden">
          {/* Decorative book spine pattern */}
          <div className="absolute top-0 right-0 w-32 h-full opacity-10">
            <div className="flex gap-2 h-full">
              <div className="w-4 bg-blue-500" />
              <div className="w-4 bg-cyan-500" />
              <div className="w-4 bg-indigo-500" />
              <div className="w-4 bg-blue-500" />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Current Reading</h2>
                <p className="text-sm text-blue-300">3 books in progress</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">This month</p>
                <p className="text-2xl font-bold text-cyan-400">📚 2 completed</p>
              </div>
            </div>

            {/* Mini book progress */}
            <div className="space-y-3">
              {[
                { title: 'Atomic Habits', author: 'James Clear', progress: 68, pages: '320 pages', color: 'cyan' },
                { title: 'Deep Work', author: 'Cal Newport', progress: 45, pages: '296 pages', color: 'blue' },
                { title: 'The Art of Learning', author: 'Josh Waitzkin', progress: 22, pages: '265 pages', color: 'indigo' }
              ].map((book, index) => (
                <div key={index} className="bg-[#0c0a10]/50 rounded-lg p-3 border border-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{book.title}</p>
                      <p className="text-xs text-white/50">{book.author} · {book.pages}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded bg-${book.color}-500/20 text-${book.color}-300`}>
                      {book.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#1a1724] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${book.color}-500 to-${book.color}-400 transition-all duration-500`}
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Knowledge Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1a1724] border border-blue-500/20 rounded-xl p-4 text-center">
            <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">47</p>
            <p className="text-xs text-white/60 mt-1">Books Read</p>
          </div>

          <div className="bg-[#1a1724] border border-cyan-500/20 rounded-xl p-4 text-center">
            <FileText className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">284</p>
            <p className="text-xs text-white/60 mt-1">Notes</p>
          </div>

          <div className="bg-[#1a1724] border border-indigo-500/20 rounded-xl p-4 text-center">
            <Lightbulb className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">52</p>
            <p className="text-xs text-white/60 mt-1">Ideas</p>
          </div>
        </div>

        {/* Weekly Reading Hours */}
        <div className="bg-[#1a1724] border border-blue-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Reading Time
              </h3>
              <p className="text-sm text-white/60 mt-1">Hours invested this week</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">20.7h</p>
              <p className="text-sm text-blue-400">+3.2h from last week</p>
            </div>
          </div>
          <div className="h-32">
            <MiniBarChart data={weeklyReadingHours} color="blue" showValues maxHeight={100} />
          </div>
        </div>

        {/* Knowledge Capture (Notes) */}
        <div className="bg-[#1a1724] border border-cyan-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Knowledge Capture
              </h3>
              <p className="text-sm text-white/60 mt-1">Notes created this month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">67</p>
              <p className="text-sm text-cyan-400">notes captured</p>
            </div>
          </div>
          <div className="h-32">
            <MiniBarChart data={monthlyNotes} color="cyan" showValues maxHeight={100} />
          </div>
        </div>

        {/* Implementation Rate */}
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Implementation Rate
              </h3>
              <p className="text-sm text-white/60 mt-1">Ideas put into action</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-400">73%</p>
              <p className="text-sm text-white/60">38/52 ideas implemented</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-[#0c0a10]/50 rounded-lg p-3">
              <p className="text-sm text-white/60">Applied This Month</p>
              <p className="text-xl font-bold text-white">8</p>
            </div>
            <div className="bg-[#0c0a10]/50 rounded-lg p-3">
              <p className="text-sm text-white/60">Pending Review</p>
              <p className="text-xl font-bold text-white">14</p>
            </div>
          </div>
        </div>

        {/* Knowledge Connections */}
        <div className="bg-[#1a1724] border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Knowledge Connections
            </h3>
            <span className="text-sm text-purple-400">+12 this week</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { topic: 'Productivity', connections: 24, color: 'yellow' },
              { topic: 'Learning', connections: 18, color: 'blue' },
              { topic: 'Business', connections: 15, color: 'green' },
              { topic: 'Philosophy', connections: 12, color: 'purple' }
            ].map((item, index) => (
              <div key={index} className="bg-[#0c0a10] border border-white/5 rounded-lg p-3">
                <p className="text-sm text-white/60">{item.topic}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-white">{item.connections}</p>
                  <span className={`text-xs text-${item.color}-400`}>links</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1a1724] border border-white/10 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { type: 'Note', title: 'Habit Formation Principles', time: '2h ago', icon: '📝', color: 'cyan' },
              { type: 'Highlight', title: 'Deep Work Chapter 3', time: '5h ago', icon: '✨', color: 'yellow' },
              { type: 'Idea', title: 'Morning Routine Optimization', time: 'Yesterday', icon: '💡', color: 'purple' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-[#0c0a10] rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors">
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{activity.title}</p>
                  <p className="text-xs text-white/50">{activity.type} · {activity.time}</p>
                </div>
                <Bookmark className={`w-4 h-4 text-${activity.color}-400`} />
              </div>
            ))}
          </div>
        </div>

        {/* Learning Streak */}
        <div className="bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-orange-500/20 border border-orange-500/30 rounded-2xl p-5 text-center">
          <p className="text-sm text-white/60 mb-2">Learning Streak</p>
          <p className="text-5xl font-bold text-white mb-2">28 🔥</p>
          <p className="text-sm text-orange-300">days of continuous learning!</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Capture Note
          </button>
          <button className="bg-[#1a1724] border border-blue-500/30 text-white p-4 rounded-xl font-semibold hover:bg-blue-500/10 transition-colors">
            Browse Library
          </button>
        </div>
      </div>
    </div>
  );
}
