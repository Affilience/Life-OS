import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { useContentStore } from '../../stores/contentStore';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import QuickCapture from './QuickCapture';

// Helper to get relative time string
const getRelativeTime = (dateString) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

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
export default function KnowledgeDashboard({ onTabChange }) {
  const navigate = useNavigate();
  const [showQuickCapture, setShowQuickCapture] = useState(false);

  // Connect to real stores
  const { contentItems, stats, getInProgress, getCompleted, getImplementationRate } = useContentStore();
  const knowledgeState = useKnowledgeStore();
  // Provide safe defaults for potentially undefined properties
  const notes = knowledgeState?.notes || [];
  const ideas = knowledgeState?.ideas || [];
  const highlights = knowledgeState?.highlights || [];

  const handleCaptureNote = () => {
    // Open the QuickCapture modal
    setShowQuickCapture(true);
  };

  const handleBrowseLibrary = () => {
    // Switch to the library tab if callback provided, otherwise navigate
    if (onTabChange) {
      onTabChange('library');
    } else {
      navigate('/knowledge?tab=library');
    }
  };

  // Get books in progress
  const booksInProgress = useMemo(() => {
    return contentItems
      .filter(item => item.type === 'book' && item.status === 'in_progress')
      .slice(0, 3);
  }, [contentItems]);

  // Calculate completed books this month
  const booksCompletedThisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return contentItems.filter(
      item => item.type === 'book' &&
      item.status === 'completed' &&
      new Date(item.dateCompleted) >= startOfMonth
    ).length;
  }, [contentItems]);

  // Calculate total books completed
  const totalBooksRead = useMemo(() => {
    return contentItems.filter(item => item.type === 'book' && item.status === 'completed').length;
  }, [contentItems]);

  // Calculate implementation rate
  const implementationRate = useMemo(() => {
    const completed = contentItems.filter(item => item.status === 'completed');
    const implemented = completed.filter(item => item.implementationStatus === 'implemented');
    return completed.length > 0 ? Math.round((implemented.length / completed.length) * 100) : 0;
  }, [contentItems]);

  // Calculate weekly reading hours from content items with timeSpent
  const weeklyReadingHours = useMemo(() => {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      // Sum timeSpent for content items updated on this day
      const dayMinutes = contentItems.reduce((sum, item) => {
        const itemDate = new Date(item.updatedAt || item.dateStarted || item.dateCompleted);
        if (itemDate >= dayStart && itemDate <= dayEnd) {
          return sum + (item.timeSpent || 0);
        }
        return sum;
      }, 0);

      result.push({
        label: days[new Date(date).getDay()],
        value: Math.round((dayMinutes / 60) * 10) / 10 // Convert to hours
      });
    }
    return result;
  }, [contentItems]);

  // Calculate total weekly hours
  const totalWeeklyHours = useMemo(() => {
    return weeklyReadingHours.reduce((sum, day) => sum + day.value, 0).toFixed(1);
  }, [weeklyReadingHours]);

  // Get recent notes count per week this month
  const monthlyNotes = useMemo(() => {
    const now = new Date();
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (7 * (3 - i)));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const count = notes.filter(note => {
        const noteDate = new Date(note.createdAt);
        return noteDate >= weekStart && noteDate < weekEnd;
      }).length;

      weeks.push({ label: `W${i + 1}`, value: count || 0 });
    }
    return weeks;
  }, [notes]);

  // Get recent activity
  const recentActivity = useMemo(() => {
    const activities = [];

    // Add recent notes
    notes.slice(0, 2).forEach(note => {
      activities.push({
        type: 'Note',
        title: note.title,
        time: getRelativeTime(note.createdAt),
        icon: '📝',
        color: 'cyan'
      });
    });

    // Add recent ideas
    ideas.slice(0, 1).forEach(idea => {
      activities.push({
        type: 'Idea',
        title: idea.title,
        time: getRelativeTime(idea.createdAt),
        icon: '💡',
        color: 'purple'
      });
    });

    return activities.slice(0, 3);
  }, [notes, ideas]);

  // Calculate knowledge connections by topic/tag
  const knowledgeConnections = useMemo(() => {
    const tagCounts = {};
    const colors = ['yellow', 'blue', 'green', 'purple', 'cyan', 'pink'];

    // Count tags from notes
    notes.forEach(note => {
      (note.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Count tags from ideas
    ideas.forEach(idea => {
      (idea.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Convert to sorted array and take top 4
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([topic, connections], index) => ({
        topic,
        connections,
        color: colors[index % colors.length]
      }));
  }, [notes, ideas]);

  // Calculate notes created this week
  const notesThisWeek = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return notes.filter(note => new Date(note.createdAt) >= weekAgo).length;
  }, [notes]);

  // Calculate learning streak (consecutive days with content activity)
  const learningStreak = useMemo(() => {
    const activityDates = new Set();

    // Add dates from notes
    notes.forEach(note => {
      const date = new Date(note.createdAt).toDateString();
      activityDates.add(date);
    });

    // Add dates from content consumption
    contentItems.forEach(item => {
      if (item.dateStarted) activityDates.add(new Date(item.dateStarted).toDateString());
      if (item.dateCompleted) activityDates.add(new Date(item.dateCompleted).toDateString());
    });

    // Count consecutive days back from today
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      if (activityDates.has(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break; // Only break if we've started counting
      }
    }

    return streak;
  }, [notes, contentItems]);

  return (
    <div className="min-h-screen bg-bg-0 pb-20">
      {/* Header with library theme */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-900/20 via-cyan-900/20 to-blue-900/20 backdrop-blur-md border-b border-blue-500/20 px-6 py-4">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Book className="w-6 h-6 text-blue-400" />
          Knowledge Management
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Books, notes, ideas & learning metrics
        </p>
      </div>

      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Reading Progress Banner */}
        <div className="relative bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-blue-500/10 border border-blue-500/30 rounded-2xl p-6 overflow-hidden" data-tour="books-section">
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
                <h2 className="text-xl font-bold text-text-primary">Current Reading</h2>
                <p className="text-sm text-blue-300">{booksInProgress.length} book{booksInProgress.length !== 1 ? 's' : ''} in progress</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-muted">This month</p>
                <p className="text-2xl font-bold text-cyan-400">📚 {booksCompletedThisMonth} completed</p>
              </div>
            </div>

            {/* Mini book progress */}
            <div className="space-y-3">
              {booksInProgress.length > 0 ? booksInProgress.map((book, index) => {
                const colors = ['cyan', 'blue', 'indigo'];
                const color = colors[index % colors.length];
                // Calculate progress (default to 0 if no duration tracking)
                const progress = book.duration > 0 ? Math.round((book.timeSpent / book.duration) * 100) : 0;
                return (
                  <div
                    key={book.id}
                    onClick={() => navigate('/knowledge')}
                    className="bg-[#0c0a10]/50 rounded-lg p-3 border border-white/5 cursor-pointer hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-primary">{book.title}</p>
                        <p className="text-xs text-text-primary/50">{book.author || 'Unknown'} · {book.duration || '?'} pages</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded bg-${color}-500/20 text-${color}-300`}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-bg-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-4 text-text-primary/50">
                  <p>No books in progress</p>
                  <button
                    onClick={() => onTabChange?.('library')}
                    className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                  >
                    Add a book to read
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Knowledge Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-tour="knowledge-stats">
          <div className="bg-bg-1 border border-blue-500/20 rounded-xl p-4 text-center">
            <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">{totalBooksRead}</p>
            <p className="text-xs text-text-muted mt-1">Books Read</p>
          </div>

          <div className="bg-bg-1 border border-cyan-500/20 rounded-xl p-4 text-center">
            <FileText className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">{notes.length}</p>
            <p className="text-xs text-text-muted mt-1">Notes</p>
          </div>

          <div className="bg-bg-1 border border-indigo-500/20 rounded-xl p-4 text-center">
            <Lightbulb className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">{ideas.length}</p>
            <p className="text-xs text-text-muted mt-1">Ideas</p>
          </div>
        </div>

        {/* Weekly Reading Hours */}
        <div className="bg-bg-1 border border-blue-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Reading Time
              </h3>
              <p className="text-sm text-text-muted mt-1">Hours invested this week</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-text-primary">{totalWeeklyHours}h</p>
              <p className="text-sm text-blue-400">this week</p>
            </div>
          </div>
          <div className="h-32">
            <MiniBarChart data={weeklyReadingHours} color="blue" showValues maxHeight={100} />
          </div>
        </div>

        {/* Knowledge Capture (Notes) */}
        <div className="bg-bg-1 border border-cyan-500/20 rounded-2xl p-5" data-tour="notes-section">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Knowledge Capture
              </h3>
              <p className="text-sm text-text-muted mt-1">Notes created this month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-text-primary">{monthlyNotes.reduce((sum, w) => sum + w.value, 0)}</p>
              <p className="text-sm text-cyan-400">notes this month</p>
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
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Implementation Rate
              </h3>
              <p className="text-sm text-text-muted mt-1">Ideas put into action</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-400">{implementationRate}%</p>
              <p className="text-sm text-text-muted">
                {contentItems.filter(i => i.implementationStatus === 'implemented').length}/
                {contentItems.filter(i => i.status === 'completed').length} implemented
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="bg-[#0c0a10]/50 rounded-lg p-3">
              <p className="text-sm text-text-muted">Implementing</p>
              <p className="text-xl font-bold text-text-primary">
                {contentItems.filter(i => i.implementationStatus === 'implementing').length}
              </p>
            </div>
            <div className="bg-[#0c0a10]/50 rounded-lg p-3">
              <p className="text-sm text-text-muted">Pending Review</p>
              <p className="text-xl font-bold text-text-primary">
                {contentItems.filter(i => i.status === 'completed' && i.implementationStatus === 'not_started').length}
              </p>
            </div>
          </div>
        </div>

        {/* Knowledge Connections */}
        <div className="bg-bg-1 border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Knowledge Connections
            </h3>
            <span className="text-sm text-purple-400">+{notesThisWeek} this week</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {knowledgeConnections.length > 0 ? knowledgeConnections.map((item, index) => (
              <div key={index} className="bg-[#0c0a10] border border-white/5 rounded-lg p-3">
                <p className="text-sm text-text-muted">{item.topic}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-text-primary">{item.connections}</p>
                  <span className={`text-xs text-${item.color}-400`}>links</span>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-4 text-text-primary/50">
                <p>No tagged content yet</p>
                <p className="text-sm mt-1">Add tags to notes and ideas to see connections</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-bg-1 border border-border rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div
                key={index}
                onClick={() => navigate('/knowledge')}
                className="flex items-center gap-3 p-3 bg-[#0c0a10] rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors cursor-pointer"
              >
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{activity.title}</p>
                  <p className="text-xs text-text-primary/50">{activity.type} · {activity.time}</p>
                </div>
                <Bookmark className={`w-4 h-4 text-${activity.color}-400`} />
              </div>
            )) : (
              <div className="text-center py-4 text-text-primary/50">
                <p>No recent activity</p>
                <button
                  onClick={() => navigate('/knowledge')}
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                >
                  Start capturing knowledge
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Learning Streak */}
        <div className="bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-orange-500/20 border border-orange-500/30 rounded-2xl p-5 text-center">
          <p className="text-sm text-text-muted mb-2">Learning Streak</p>
          <p className="text-5xl font-bold text-text-primary mb-2">{learningStreak} {learningStreak > 0 ? '🔥' : '📚'}</p>
          <p className="text-sm text-orange-300">
            {learningStreak > 0 ? 'days of continuous learning!' : 'Start learning today!'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleCaptureNote}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-text-primary p-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 hover:shadow-[0_8px_32px_rgba(139,92,246,0.3)] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-150"
          >
            Capture Note
          </button>
          <button
            onClick={handleBrowseLibrary}
            className="bg-bg-1 border border-purple-500/30 text-text-primary p-4 rounded-xl font-semibold hover:bg-purple-500/10 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-150"
          >
            Browse Library
          </button>
        </div>
      </div>

      {/* Quick Capture Modal */}
      {showQuickCapture && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12101a] border border-white/10 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Quick Capture</h3>
              <button
                onClick={() => setShowQuickCapture(false)}
                className="text-white/60 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <QuickCapture onClose={() => setShowQuickCapture(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
