import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '../utils/haptics';
import {
  Flame,
  Star,
  Zap,
  Plus,
  Calendar,
  TrendingUp,
  Trophy,
  Target,
  Clock,
  BarChart3,
  Sparkles,
  Moon,
  Sun,
  Coffee,
  Dumbbell,
  Book,
  Heart,
  Brain,
  CheckCircle2,
  Circle
} from 'lucide-react';

/**
 * Orbit - Cosmic Habit Tracker
 * Implements best practices from Notion templates & Atomic Habits
 * Features: Streaks, gamification, visual progress, one-click tracking
 */

// Mock data - Research-based desaturated color palette for dark mode
const mockHabits = [
  {
    id: '1',
    name: 'Morning Meditation',
    icon: 'brain',
    color: '#8b7d82', // Mauve - desaturated purple for focus
    category: 'Mind',
    frequency: 'daily',
    currentStreak: 12,
    longestStreak: 25,
    completedToday: true,
    totalCompletions: 45,
    target: 100,
    difficulty: 'easy'
  },
  {
    id: '2',
    name: 'Workout',
    icon: 'dumbbell',
    color: '#7c8f7e', // Sage - desaturated green for health
    category: 'Body',
    frequency: 'daily',
    currentStreak: 7,
    longestStreak: 14,
    completedToday: false,
    totalCompletions: 32,
    target: 100,
    difficulty: 'medium'
  },
  {
    id: '3',
    name: 'Read 30min',
    icon: 'book',
    color: '#7a8892', // Steel - desaturated blue for trust/knowledge
    category: 'Mind',
    frequency: 'daily',
    currentStreak: 5,
    longestStreak: 18,
    completedToday: true,
    totalCompletions: 56,
    target: 100,
    difficulty: 'easy'
  },
  {
    id: '4',
    name: 'Deep Work 2hr',
    icon: 'zap',
    color: '#8b8269', // Sand - desaturated yellow for energy/productivity
    category: 'Productivity',
    frequency: 'daily',
    currentStreak: 3,
    longestStreak: 9,
    completedToday: false,
    totalCompletions: 28,
    target: 100,
    difficulty: 'hard'
  },
  {
    id: '5',
    name: 'Gratitude Journal',
    icon: 'heart',
    color: '#8b7d82', // Mauve - desaturated purple for mindfulness
    category: 'Mind',
    frequency: 'daily',
    currentStreak: 15,
    longestStreak: 20,
    completedToday: true,
    totalCompletions: 62,
    target: 100,
    difficulty: 'easy'
  }
];

const iconMap = {
  brain: Brain,
  dumbbell: Dumbbell,
  book: Book,
  zap: Zap,
  heart: Heart,
  coffee: Coffee,
  moon: Moon,
  sun: Sun
};

export default function HabitsNew() {
  const [habits, setHabits] = useState(mockHabits);
  const [viewMode, setViewMode] = useState('today'); // 'today', 'week', 'month', 'stats'
  const [showAddModal, setShowAddModal] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.completedToday).length;
    const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
    const totalStreakDays = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    const longestActiveStreak = Math.max(...habits.map(h => h.currentStreak));

    return {
      totalHabits,
      completedToday,
      completionRate,
      totalStreakDays,
      longestActiveStreak
    };
  }, [habits]);

  const toggleHabit = async (habitId) => {
    // Get the habit to check if we're completing or uncompleting
    const habit = habits.find(h => h.id === habitId);
    const isCompleting = !habit?.completedToday;
    const newStreak = isCompleting ? habit.currentStreak + 1 : habit.currentStreak - 1;

    // Check for streak milestones (7, 30, 100, 365 days)
    const streakMilestones = [7, 30, 100, 365];
    const isStreakMilestone = isCompleting && streakMilestones.includes(newStreak);

    // Haptic feedback
    if (isStreakMilestone) {
      await haptics.epic(); // Epic haptic for milestone streaks!
    } else if (isCompleting) {
      await haptics.success(); // Success haptic when completing
    } else {
      await haptics.light(); // Light haptic when uncompleting
    }

    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.id === habitId
          ? {
              ...habit,
              completedToday: !habit.completedToday,
              currentStreak: newStreak,
              totalCompletions: !habit.completedToday ? habit.totalCompletions + 1 : habit.totalCompletions - 1
            }
          : habit
      )
    );
  };

  const addHabit = (newHabit) => {
    const habit = {
      id: Date.now().toString(),
      ...newHabit,
      currentStreak: 0,
      longestStreak: 0,
      completedToday: false,
      totalCompletions: 0,
      target: 100
    };
    setHabits([...habits, habit]);
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-[#12101a] text-white p-6 md:p-8">
      {/* Simplified Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Orbit
            </h1>
            <p className="text-sm text-white/50">
              {stats.completedToday}/{stats.totalHabits} completed · {Math.round(stats.completionRate)}% · {stats.longestActiveStreak} day best streak
            </p>
          </div>

          {/* Consolidated View Toggle - Smaller */}
          <div className="flex gap-1 bg-[#12101a]/50 p-1 rounded-lg border border-white/10">
            {['today', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded text-sm transition-all capitalize ${
                  viewMode === mode
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-white/50 hover:text-gray-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'today' && <TodayView habits={habits} onToggle={toggleHabit} onAddClick={() => setShowAddModal(true)} />}
        {viewMode === 'week' && <WeekView habits={habits} />}
        {viewMode === 'month' && <MonthView habits={habits} />}
      </AnimatePresence>

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addHabit}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color }) {
  // Research-based desaturated colors for dark mode (#121212 background)
  const colorMap = {
    purple: 'from-emerald-500/15 to-teal-600/15 border-emerald-500/25',    // Success/growth
    orange: 'from-orange-500/15 to-amber-600/15 border-orange-500/25',    // Energy/streaks
    yellow: 'from-yellow-500/15 to-amber-600/15 border-yellow-500/25',    // Achievements
    blue: 'from-teal-500/15 to-cyan-600/15 border-teal-500/25'           // Trust/progress
  };

  const iconColorMap = {
    purple: 'text-emerald-400',
    orange: 'text-orange-400',
    yellow: 'text-yellow-400',
    blue: 'text-teal-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${colorMap[color]} border backdrop-blur-sm rounded-xl p-4`}
    >
      <div className="flex items-start justify-between mb-2">
        <Icon className={`w-5 h-5 ${iconColorMap[color]}`} />
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-white/60">{label}</div>
      <div className="text-xs text-white/50 mt-1">{subtext}</div>
    </motion.div>
  );
}

function TodayView({ habits, onToggle, onAddClick }) {
  return (
    <motion.div
      key="today"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-3"
    >
      {habits.map((habit, index) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onToggle={() => onToggle(habit.id)}
          index={index}
        />
      ))}

      {/* Add Habit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAddClick}
        className="w-full p-4 border-2 border-dashed border-white/15/50 rounded-xl text-white/50 hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
      >
        <Plus className="w-5 h-5 inline mr-2" />
        Add New Habit
      </motion.button>
    </motion.div>
  );
}

function HabitCard({ habit, onToggle, index }) {
  const Icon = iconMap[habit.icon] || Star;
  const progress = (habit.totalCompletions / habit.target) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div
        className={`relative bg-[#12101a]/50 backdrop-blur-sm border rounded-xl p-5 transition-all ${
          habit.completedToday
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-white/10 hover:border-emerald-500/30'
        }`}
      >
        {/* Cosmic Glow Effect */}
        {habit.completedToday && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl blur-xl" />
        )}

        <div className="relative flex items-center gap-4">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              habit.completedToday
                ? 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-[#1a1724] border border-white/15'
            }`}
            style={{ backgroundColor: habit.completedToday ? undefined : `${habit.color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: habit.completedToday ? '#10b981' : habit.color }} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{habit.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1724] text-white/60">
                {habit.category}
              </span>
            </div>

            {/* Progress Bar - Darker to lighter shows progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-[#1a1724] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                />
              </div>
              <span className="text-xs text-white/60 min-w-[3rem] text-right">
                {habit.totalCompletions}/{habit.target}
              </span>
            </div>
          </div>

          {/* Streak */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-lg font-bold">{habit.currentStreak}</span>
            </div>
            <span className="text-xs text-white/50">streak</span>
          </div>

          {/* Check Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
              habit.completedToday
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-[#1a1724] text-white/60 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border hover:border-emerald-500/30'
            }`}
          >
            {habit.completedToday ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <Circle className="w-7 h-7" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function WeekView({ habits }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <motion.div
      key="week"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#12101a]/30 border border-white/10 rounded-xl p-6"
    >
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-purple-400" />
        Week View
      </h2>

      {/* Week Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left pb-4 px-4">Habit</th>
              {days.map(day => (
                <th key={day} className="text-center pb-4 px-2 text-sm text-white/60">
                  {day}
                </th>
              ))}
              <th className="text-center pb-4 px-4 text-sm text-white/60">Week</th>
            </tr>
          </thead>
          <tbody>
            {habits.map(habit => {
              const Icon = iconMap[habit.icon] || Star;
              // Mock week data
              const weekData = Array.from({ length: 7 }, (_, i) => Math.random() > 0.3);
              const weekCompletion = weekData.filter(Boolean).length;

              return (
                <tr key={habit.id} className="border-b border-white/10/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${habit.color}20` }}>
                        <Icon className="w-4 h-4" style={{ color: habit.color }} />
                      </div>
                      <span className="font-medium">{habit.name}</span>
                    </div>
                  </td>
                  {weekData.map((completed, i) => (
                    <td key={i} className="text-center px-2 py-4">
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-700 mx-auto" />
                      )}
                    </td>
                  ))}
                  <td className="text-center px-4 py-4">
                    <span className="text-sm font-semibold">{weekCompletion}/7</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function MonthView({ habits }) {
  // Generate calendar grid for current month
  const daysInMonth = 31; // Simplified
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <motion.div
      key="month"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {habits.map(habit => {
        const Icon = iconMap[habit.icon] || Star;
        // Mock month data - heat map
        const monthData = Array.from({ length: daysInMonth }, () => Math.random());

        return (
          <div key={habit.id} className="bg-[#12101a]/30 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${habit.color}20` }}>
                <Icon className="w-5 h-5" style={{ color: habit.color }} />
              </div>
              <div>
                <h3 className="font-semibold">{habit.name}</h3>
                <p className="text-sm text-white/60">Monthly Heat Map</p>
              </div>
            </div>

            {/* Heat Map Grid */}
            <div className="grid grid-cols-7 gap-2">
              {monthData.map((intensity, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md transition-all cursor-pointer hover:scale-110"
                  style={{
                    backgroundColor: intensity > 0.7 ? `${habit.color}ff` :
                                   intensity > 0.4 ? `${habit.color}aa` :
                                   intensity > 0.2 ? `${habit.color}55` :
                                   '#27272a'
                  }}
                  title={`Day ${i + 1}: ${intensity > 0.2 ? 'Completed' : 'Skipped'}`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function StatsView({ habits }) {
  return (
    <motion.div
      key="stats"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-2 gap-6"
    >
      {/* Achievements */}
      <div className="bg-[#12101a]/30 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Achievements
        </h2>
        <div className="space-y-3">
          {[
            { name: '7-Day Warrior', desc: 'Maintain any streak for 7 days', unlocked: true },
            { name: '30-Day Champion', desc: 'Maintain any streak for 30 days', unlocked: false },
            { name: 'Perfect Week', desc: 'Complete all habits for 7 days', unlocked: true },
            { name: 'Cosmic Master', desc: 'Reach 100 total completions', unlocked: false }
          ].map((achievement, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                achievement.unlocked
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-[#1a1724]/30 border-white/15'
              }`}
            >
              <div className="flex items-center gap-3">
                <Trophy className={`w-6 h-6 ${achievement.unlocked ? 'text-yellow-500' : 'text-white/40'}`} />
                <div>
                  <div className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-white/50'}`}>
                    {achievement.name}
                  </div>
                  <div className="text-xs text-white/50">{achievement.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-[#12101a]/30 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          Insights
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="text-sm font-semibold text-purple-400 mb-1">Best Time</div>
            <div className="text-2xl font-bold">7:00 AM</div>
            <div className="text-xs text-white/60">You complete 80% of habits before noon</div>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="text-sm font-semibold text-blue-400 mb-1">Best Day</div>
            <div className="text-2xl font-bold">Monday</div>
            <div className="text-xs text-white/60">95% completion rate on Mondays</div>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="text-sm font-semibold text-green-400 mb-1">Longest Streak</div>
            <div className="text-2xl font-bold">25 days</div>
            <div className="text-xs text-white/60">Morning Meditation - May 2024</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AddHabitModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    icon: 'brain',
    color: '#6b7280', // Default desaturated gray-blue
    category: '',
    frequency: 'daily',
    difficulty: 'medium'
  });

  // Research-based desaturated color palette (3-5 colors for dark mode)
  const colorPalette = [
    { hex: '#6b7280', name: 'Slate' },      // Neutral
    { hex: '#7c8f7e', name: 'Sage' },       // Desaturated green (calm/health)
    { hex: '#8b7d82', name: 'Mauve' },      // Desaturated purple (focus)
    { hex: '#8b8269', name: 'Sand' },       // Desaturated yellow (energy)
    { hex: '#7a8892', name: 'Steel' }       // Desaturated blue (trust)
  ];

  const availableIcons = [
    { key: 'brain', name: 'Brain', Icon: Brain },
    { key: 'dumbbell', name: 'Workout', Icon: Dumbbell },
    { key: 'book', name: 'Book', Icon: Book },
    { key: 'zap', name: 'Energy', Icon: Zap },
    { key: 'heart', name: 'Heart', Icon: Heart },
    { key: 'coffee', name: 'Coffee', Icon: Coffee },
    { key: 'moon', name: 'Moon', Icon: Moon },
    { key: 'sun', name: 'Sun', Icon: Sun }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.category.trim()) {
      onAdd(formData);
      // Reset form
      setFormData({
        name: '',
        icon: 'brain',
        color: '#6b7280',
        category: '',
        frequency: 'daily',
        difficulty: 'medium'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1a1724] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Add New Habit
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Habit Name */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Habit Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Meditation"
                className="w-full bg-[#12101a] border border-white/15 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-4 gap-2">
                {availableIcons.map(({ key, name, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: key })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.icon === key
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/15 bg-[#12101a] hover:border-zinc-600'
                    }`}
                    title={name}
                  >
                    <Icon className="w-5 h-5 mx-auto" style={{ color: formData.icon === key ? '#10b981' : '#9ca3af' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Color Theme
              </label>
              <div className="flex gap-2">
                {colorPalette.map(({ hex, name }) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: hex })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === hex
                        ? 'border-white scale-110'
                        : 'border-white/15 hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex }}
                    title={name}
                  />
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Mind, Body, Productivity"
                className="w-full bg-[#12101a] border border-white/15 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['daily', 'weekly', 'monthly'].map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFormData({ ...formData, frequency: freq })}
                    className={`px-4 py-2 rounded-lg border transition-all capitalize ${
                      formData.frequency === freq
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/15 bg-[#12101a] text-white/60 hover:border-zinc-600'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: diff })}
                    className={`px-4 py-2 rounded-lg border transition-all capitalize ${
                      formData.difficulty === diff
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/15 bg-[#12101a] text-white/60 hover:border-zinc-600'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg border border-white/15 text-white/60 hover:border-zinc-600 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                Add Habit
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
