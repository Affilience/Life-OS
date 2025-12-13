import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Flame,
  TrendingUp,
  Droplet,
  Apple,
  Scale
} from 'lucide-react';
import MiniLineChart from '../shared/charts/MiniLineChart';
import { useHealthStore } from '../../stores/healthStore';
import { useWorkoutStore } from '../../stores/workoutStore';

/**
 * Health & Fitness Module Dashboard
 *
 * Unique Design: Fitness tracker aesthetic with circular progress rings,
 * health metrics in a grid, and body vitals monitoring
 *
 * Key KPIs:
 * - Workouts completed (weekly)
 * - Active calories burned
 * - Nutrition macros
 * - Hydration
 * - Weight tracking
 * - Weekly activity
 */
export default function HealthDashboard() {
  const navigate = useNavigate();

  // Connect to stores
  const { meals, dailyGoals, waterIntake } = useHealthStore();
  const { workouts } = useWorkoutStore();

  // Quick action handlers
  const handleLogWorkout = () => {
    navigate('/health', { state: { activeTab: 'workouts' } });
  };

  const handleTrackMeal = () => {
    navigate('/health', { state: { activeTab: 'nutrition' } });
  };

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

    // Calculate weekly calories from meals
    const weeklyCalories = last7Days.map(date => {
      const dayMeals = (meals || []).filter(m => m.timestamp?.startsWith(date));
      const totalCal = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const dayOfWeek = new Date(date).getDay();
      return { label: dayLabels[dayOfWeek], value: totalCal || 0 };
    });

    // Calculate total weekly calories
    const totalWeeklyCalories = weeklyCalories.reduce((sum, d) => sum + d.value, 0);

    // Workouts this week
    const workoutsThisWeek = (workouts || []).filter(w => {
      const workoutDate = w.date?.split('T')[0];
      return last7Days.includes(workoutDate);
    });

    // Today's meals for nutrition
    const todayStr = today.toISOString().split('T')[0];
    const todayMeals = (meals || []).filter(m => m.timestamp?.startsWith(todayStr));
    const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const todayProtein = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const todayCarbs = todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const todayFat = todayMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

    // Calculate active calories burned from workouts
    const todayWorkouts = workoutsThisWeek.filter(w => w.date?.startsWith(todayStr));
    const activeCalories = todayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    // Water intake - waterIntake stores {amount, goal} objects per date
    const todayWater = waterIntake?.[todayStr]?.amount || 0;

    // Calculate streak (consecutive days with workouts)
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasWorkout = (workouts || []).some(w => w.date?.startsWith(dateStr));
      if (hasWorkout) streak++;
      else if (i > 0) break;
    }

    // Recent workouts
    const recentWorkouts = (workouts || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3)
      .map(w => {
        const workoutDate = new Date(w.date);
        const diffHours = Math.floor((today - workoutDate) / (1000 * 60 * 60));
        let timeAgo = diffHours < 24 ? `${diffHours}h ago` :
                      diffHours < 48 ? 'Yesterday' :
                      `${Math.floor(diffHours / 24)} days ago`;
        return {
          type: w.name || w.type || 'Workout',
          duration: w.duration ? `${w.duration} min` : '-',
          calories: w.caloriesBurned || 0,
          time: timeAgo,
          icon: w.type?.toLowerCase().includes('cardio') ? '🏃' :
                w.type?.toLowerCase().includes('leg') ? '🦵' : '💪'
        };
      });

    return {
      weeklyCalories,
      totalWeeklyCalories,
      workoutsThisWeek: workoutsThisWeek.length,
      activeCalories: activeCalories || 0,
      todayCalories,
      todayProtein,
      todayCarbs,
      todayFat,
      todayWater,
      streak,
      recentWorkouts,
      calorieTarget: dailyGoals?.calories || 2400,
      proteinTarget: dailyGoals?.protein || 200,
      carbsTarget: dailyGoals?.carbs || 250,
      fatTarget: dailyGoals?.fat || 70,
      waterTarget: dailyGoals?.water || 3
    };
  }, [meals, workouts, waterIntake, dailyGoals]);

  // Circular progress component - responsive sizing
  const CircularProgress = ({ value, max, label, icon: Icon, color, unit = '' }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const strokeDasharray = 2 * Math.PI * 40;
    const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

    return (
      <div className="relative flex flex-col items-center">
        <svg viewBox="0 0 100 100" className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--bg-0)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
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
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-400 mb-0.5 sm:mb-1`} />
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary">{value}{unit}</p>
        </div>
        <p className="text-[10px] sm:text-xs text-text-muted mt-1 sm:mt-2 text-center">{label}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-0 pb-20 w-full max-w-full overflow-hidden box-border">
      {/* Header with gradient */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-green-900/20 via-emerald-900/20 to-green-900/20 backdrop-blur-md border-b border-green-500/20 px-6 py-4">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-green-400" />
          Health & Fitness
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Body vitals, workouts, nutrition & recovery
        </p>
      </div>

      <div className="px-3 sm:px-4 pt-4 sm:pt-6 pb-4 space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden box-border">
        {/* Today's Summary Banner */}
        <div className="bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-green-500/20 border border-green-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary">Today's Activity</h2>
              <p className="text-xs sm:text-sm text-green-300">{stats.streak > 0 ? 'Keep pushing! 💪' : 'Start your journey!'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-text-muted">{stats.streak}-day streak</p>
              <p className="text-xl sm:text-2xl font-bold text-green-400">🔥</p>
            </div>
          </div>

          {/* Activity Rings */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto">
            <CircularProgress
              value={stats.activeCalories}
              max={3000}
              label="Active Cal"
              icon={Flame}
              color="orange"
            />
            <CircularProgress
              value={stats.workoutsThisWeek}
              max={5}
              label="Weekly Workouts"
              icon={Dumbbell}
              color="green"
              unit="/5"
            />
          </div>
        </div>

        {/* Body Vitals Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-bg-1 border border-blue-500/30 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <h4 className="text-[10px] sm:text-sm font-semibold text-text-primary">Hydration</h4>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <p className="text-xl sm:text-3xl font-bold text-text-primary">{stats.todayWater.toFixed(1)}</p>
                <p className="text-[10px] sm:text-sm text-text-muted">/ {stats.waterTarget}L</p>
              </div>
              <div className="h-1.5 sm:h-2 bg-bg-0 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                  style={{ width: `${Math.min((stats.todayWater / stats.waterTarget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-bg-1 border border-yellow-500/30 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Apple className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <h4 className="text-[10px] sm:text-sm font-semibold text-text-primary">Calories In</h4>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <p className="text-xl sm:text-3xl font-bold text-text-primary">{stats.todayCalories.toLocaleString()}</p>
              </div>
              <p className="text-[9px] sm:text-xs text-text-muted">Goal: {stats.calorieTarget.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-bg-1 border border-emerald-500/30 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <h4 className="text-[10px] sm:text-sm font-semibold text-text-primary">Weekly</h4>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <p className="text-xl sm:text-3xl font-bold text-text-primary">{(stats.totalWeeklyCalories / 1000).toFixed(1)}k</p>
              </div>
              <span className="text-[9px] sm:text-xs bg-green-500/20 text-green-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">{stats.workoutsThisWeek} workouts</span>
            </div>
          </div>
        </div>

        {/* Weekly Calories Burned */}
        <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h3 className="text-sm sm:text-lg font-semibold text-text-primary flex items-center gap-1.5 sm:gap-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                Weekly Calories
              </h3>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5 sm:mt-1">Calories consumed this week</p>
            </div>
            <div className="text-right">
              <p className="text-lg sm:text-2xl font-bold text-text-primary">{(stats.totalWeeklyCalories / 1000).toFixed(1)}k</p>
              <p className="text-xs sm:text-sm text-orange-400">{stats.workoutsThisWeek} workouts</p>
            </div>
          </div>
          <MiniLineChart data={stats.weeklyCalories} color="orange" filled showDots height={60} />
        </div>

        {/* Macros Breakdown */}
        <div className="bg-bg-1 border border-border rounded-xl sm:rounded-2xl p-3 sm:p-5" data-tour="nutrition-summary">
          <h3 className="text-sm sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4">Nutrition Macros</h3>
          <div className="space-y-3 sm:space-y-4">
            {[
              { name: 'Protein', value: stats.todayProtein, target: stats.proteinTarget, color: 'red', unit: 'g' },
              { name: 'Carbs', value: stats.todayCarbs, target: stats.carbsTarget, color: 'yellow', unit: 'g' },
              { name: 'Fats', value: stats.todayFat, target: stats.fatTarget, color: 'purple', unit: 'g' }
            ].map((macro, index) => {
              const percentage = (macro.value / macro.target) * 100;
              return (
                <div key={index} className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-text-primary">{macro.name}</span>
                    <span className="text-xs sm:text-sm text-text-muted">{macro.value}/{macro.target}{macro.unit}</span>
                  </div>
                  <div className="h-2 sm:h-3 bg-bg-0 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${macro.color}-500 to-${macro.color}-600 transition-all duration-500 relative`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                      {percentage >= 100 && (
                        <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-text-primary font-bold">✓</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="bg-bg-1 border border-green-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5" data-tour="workout-section">
          <h3 className="text-sm sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4">Recent Workouts</h3>
          <div className="space-y-2 sm:space-y-3">
            {(stats.recentWorkouts.length > 0 ? stats.recentWorkouts : [
              { type: 'No workouts yet', duration: '-', calories: 0, time: 'Log your first!', icon: '💪' }
            ]).map((workout, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 bg-bg-0 rounded-lg border border-border-subtle hover:border-green-500/30 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-lg sm:text-2xl">{workout.icon}</span>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-text-primary">{workout.type}</p>
                    <p className="text-[10px] sm:text-xs text-text-muted">{workout.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-text-primary">{workout.duration}</p>
                  <p className="text-[10px] sm:text-xs text-orange-400">{workout.calories} cal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3" data-tour="health-stats">
          <button
            onClick={handleLogWorkout}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-text-primary p-3 sm:p-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:opacity-90 transition-opacity"
            data-tour="start-workout-btn"
          >
            Log Workout
          </button>
          <button
            onClick={handleTrackMeal}
            className="bg-bg-1 border border-green-500/30 text-text-primary p-3 sm:p-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-green-500/10 transition-colors"
            data-tour="log-meal-btn"
          >
            Track Meal
          </button>
        </div>
      </div>
    </div>
  );
}
