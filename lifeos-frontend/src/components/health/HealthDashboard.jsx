import React from 'react';
import {
  Dumbbell,
  Heart,
  Moon,
  Flame,
  TrendingUp,
  Droplet,
  Apple,
  Activity
} from 'lucide-react';
import MiniLineChart from '../shared/charts/MiniLineChart';

/**
 * Health & Fitness Module Dashboard
 *
 * Unique Design: Fitness tracker aesthetic with circular progress rings,
 * health metrics in a grid, and body vitals monitoring
 *
 * Key KPIs:
 * - Workouts completed
 * - Active calories burned
 * - Sleep quality
 * - Heart rate zones
 * - Nutrition macros
 * - Hydration
 * - Recovery score
 * - Weekly activity
 */
export default function HealthDashboard() {
  // Mock data
  const weeklyCalories = [
    { label: 'Mon', value: 2850 },
    { label: 'Tue', value: 3100 },
    { label: 'Wed', value: 2950 },
    { label: 'Thu', value: 3300 },
    { label: 'Fri', value: 2900 },
    { label: 'Sat', value: 2200 },
    { label: 'Sun', value: 1800 }
  ];

  const sleepData = [
    { label: 'Mon', value: 7.2 },
    { label: 'Tue', value: 8.1 },
    { label: 'Wed', value: 6.8 },
    { label: 'Thu', value: 7.5 },
    { label: 'Fri', value: 7.8 },
    { label: 'Sat', value: 8.5 },
    { label: 'Sun', value: 8.2 }
  ];

  // Circular progress component
  const CircularProgress = ({ value, max, label, icon: Icon, color, unit = '' }) => {
    const percentage = (value / max) * 100;
    const strokeDasharray = 2 * Math.PI * 45;
    const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

    return (
      <div className="relative flex flex-col items-center">
        <svg className="w-32 h-32 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke={`var(--${color}-500)`}
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`w-6 h-6 text-${color}-400 mb-1`} />
          <p className="text-2xl font-bold text-white">{value}{unit}</p>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">{label}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0a0a] to-[#0a0a0a] pb-20">
      {/* Header with gradient */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-green-900/20 via-emerald-900/20 to-green-900/20 backdrop-blur-md border-b border-green-500/20 px-6 py-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-green-400" />
          Health & Fitness
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Body vitals, workouts, nutrition & recovery
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Today's Summary Banner */}
        <div className="bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-green-500/20 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Today's Activity</h2>
              <p className="text-sm text-green-300">Keep pushing! 💪</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">7-day streak</p>
              <p className="text-2xl font-bold text-green-400">🔥</p>
            </div>
          </div>

          {/* Activity Rings */}
          <div className="grid grid-cols-3 gap-4">
            <CircularProgress
              value={2850}
              max={3000}
              label="Active Cal"
              icon={Flame}
              color="orange"
            />
            <CircularProgress
              value={14}
              max={16}
              label="Workouts"
              icon={Dumbbell}
              color="green"
              unit="/16"
            />
            <CircularProgress
              value={8.2}
              max={8}
              label="Sleep"
              icon={Moon}
              color="indigo"
              unit="h"
            />
          </div>
        </div>

        {/* Body Vitals Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1a1a] border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-red-400" />
              <h4 className="text-sm font-semibold text-white">Heart Rate</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">72</p>
                <p className="text-sm text-gray-400">bpm</p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded">Resting</span>
                <span className="text-gray-500">↓ 3 from avg</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Droplet className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">Hydration</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">2.4</p>
                <p className="text-sm text-gray-400">/ 3L</p>
              </div>
              <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-[80%]" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Apple className="w-5 h-5 text-yellow-400" />
              <h4 className="text-sm font-semibold text-white">Calories In</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">2,200</p>
                <p className="text-sm text-gray-400">kcal</p>
              </div>
              <p className="text-xs text-gray-500">Target: 2,400 kcal</p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <h4 className="text-sm font-semibold text-white">Recovery</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">87</p>
                <p className="text-sm text-gray-400">/ 100</p>
              </div>
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Ready</span>
            </div>
          </div>
        </div>

        {/* Weekly Calories Burned */}
        <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Calories Burned
              </h3>
              <p className="text-sm text-gray-400 mt-1">Active energy this week</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">19.8k</p>
              <p className="text-sm text-orange-400">+2.1k vs last week</p>
            </div>
          </div>
          <MiniLineChart data={weeklyCalories} color="orange" filled showDots height={80} />
        </div>

        {/* Sleep Quality */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-400" />
                Sleep Quality
              </h3>
              <p className="text-sm text-gray-400 mt-1">Hours per night</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">7.7h</p>
              <p className="text-sm text-indigo-400">avg this week</p>
            </div>
          </div>
          <MiniLineChart data={sleepData} color="indigo" filled showDots height={80} />
        </div>

        {/* Macros Breakdown */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Nutrition Macros</h3>
          <div className="space-y-4">
            {[
              { name: 'Protein', value: 180, target: 200, color: 'red', unit: 'g' },
              { name: 'Carbs', value: 220, target: 250, color: 'yellow', unit: 'g' },
              { name: 'Fats', value: 65, target: 70, color: 'purple', unit: 'g' }
            ].map((macro, index) => {
              const percentage = (macro.value / macro.target) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{macro.name}</span>
                    <span className="text-sm text-gray-400">{macro.value}/{macro.target}{macro.unit}</span>
                  </div>
                  <div className="h-3 bg-[#0a0a0a] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${macro.color}-500 to-${macro.color}-600 transition-all duration-500 relative`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                      {percentage >= 100 && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-bold">✓</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="bg-[#1a1a1a] border border-green-500/20 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Workouts</h3>
          <div className="space-y-3">
            {[
              { type: 'Upper Body', duration: '45 min', calories: 320, time: '2h ago', icon: '💪' },
              { type: 'Cardio Run', duration: '30 min', calories: 280, time: 'Yesterday', icon: '🏃' },
              { type: 'Leg Day', duration: '60 min', calories: 420, time: '2 days ago', icon: '🦵' }
            ].map((workout, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-white/5 hover:border-green-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{workout.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{workout.type}</p>
                    <p className="text-xs text-gray-500">{workout.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{workout.duration}</p>
                  <p className="text-xs text-orange-400">{workout.calories} cal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Log Workout
          </button>
          <button className="bg-[#1a1a1a] border border-green-500/30 text-white p-4 rounded-xl font-semibold hover:bg-green-500/10 transition-colors">
            Track Meal
          </button>
        </div>
      </div>
    </div>
  );
}
