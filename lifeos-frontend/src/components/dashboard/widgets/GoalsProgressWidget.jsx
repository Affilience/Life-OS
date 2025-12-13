import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  ChevronRight,
  Trophy,
  Flame,
  Star,
  Award,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';

// Import stores for real data
import { useResolutionStore, RESOLUTION_CATEGORIES } from '../../../stores/resolutionStore';
import { useContentStore } from '../../../stores/contentStore';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useFinancialStore } from '../../../stores/financialStore';
import { useGamificationStore } from '../../../stores/gamificationStore';
import { useGamificationModeStore, TERMINOLOGY } from '../../../stores/gamificationModeStore';

// Mode-specific styling
const MODE_STYLES = {
  cosmic: {
    linkColor: 'text-primary-400 hover:text-primary-300',
    completedIcon: Trophy,
    completedIconColor: 'text-warning',
    motivationIcon: Star,
    motivationIconColor: 'text-warning',
  },
  professional: {
    linkColor: 'text-primary-400 hover:text-primary-300',
    completedIcon: Award,
    completedIconColor: 'text-primary-400',
    motivationIcon: BarChart2,
    motivationIconColor: 'text-primary-400',
  },
  minimal: {
    linkColor: 'text-text-muted hover:text-text-secondary',
    completedIcon: CheckCircle2,
    completedIconColor: 'text-text-muted',
    motivationIcon: CheckCircle2,
    motivationIconColor: 'text-text-muted',
  },
};

// Category icon mapping
const CATEGORY_ICONS = {
  health: '💪',
  career: '💼',
  learning: '📚',
  financial: '💰',
  relationships: '❤️',
  creativity: '🎨',
  mindfulness: '🧘',
  habits: '🔥',
  fitness: '🏃',
};

// Category color mapping by mode
const getCategoryColors = (mode) => {
  if (mode === 'minimal') {
    return {
      health: 'from-gray-400 to-gray-500',
      career: 'from-gray-400 to-gray-500',
      learning: 'from-gray-400 to-gray-500',
      financial: 'from-gray-400 to-gray-500',
      relationships: 'from-gray-400 to-gray-500',
      creativity: 'from-gray-400 to-gray-500',
      mindfulness: 'from-gray-400 to-gray-500',
      habits: 'from-gray-400 to-gray-500',
      fitness: 'from-gray-400 to-gray-500',
    };
  }

  if (mode === 'professional') {
    return {
      health: 'from-teal-500 to-teal-600',
      career: 'from-blue-500 to-blue-600',
      learning: 'from-sky-500 to-sky-600',
      financial: 'from-cyan-500 to-cyan-600',
      relationships: 'from-indigo-500 to-indigo-600',
      creativity: 'from-blue-400 to-blue-500',
      mindfulness: 'from-slate-500 to-slate-600',
      habits: 'from-blue-600 to-blue-700',
      fitness: 'from-teal-500 to-teal-600',
    };
  }

  // Cosmic (default)
  return {
    health: 'from-green-500 to-emerald-500',
    career: 'from-purple-500 to-violet-500',
    learning: 'from-yellow-500 to-orange-500',
    financial: 'from-blue-500 to-cyan-500',
    relationships: 'from-pink-500 to-rose-500',
    creativity: 'from-cyan-500 to-teal-500',
    mindfulness: 'from-indigo-500 to-purple-500',
    habits: 'from-orange-500 to-red-500',
    fitness: 'from-emerald-500 to-green-500',
  };
};

export default function GoalsProgressWidget() {
  const navigate = useNavigate();

  // Get gamification mode and terminology
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.cosmic;

  // Mode-aware title
  const widgetTitle = mode === 'cosmic' ? 'Quest Progress' : mode === 'professional' ? 'Goals Progress' : 'Task Progress';

  // Get mode-specific icons
  const CompletedIcon = modeStyle.completedIcon;
  const MotivationIcon = modeStyle.motivationIcon;

  // Connect to stores
  const { resolutions } = useResolutionStore();
  const { contentItems } = useContentStore();
  const { workouts } = useWorkoutStore();
  const { totalSavings, savingsGoals } = useFinancialStore();
  const { streaks, globalStreak } = useGamificationStore();

  // Get mode-specific colors
  const categoryColors = getCategoryColors(mode);

  // Build real goals from various stores
  const goals = useMemo(() => {
    const goalsList = [];

    // Add resolutions as goals (limit to 4 active ones)
    const activeResolutions = (resolutions || [])
      .filter(r => r.status === 'active')
      .slice(0, 2);

    activeResolutions.forEach(resolution => {
      // Calculate progress based on check-ins or milestones
      const totalCheckIns = resolution.totalCheckIns || 0;
      const targetCheckIns = 365; // Full year goal
      const yearProgress = Math.round((totalCheckIns / targetCheckIns) * 100);

      goalsList.push({
        id: `res-${resolution.id}`,
        title: resolution.title,
        category: RESOLUTION_CATEGORIES[resolution.category]?.name || 'Goal',
        current: totalCheckIns,
        target: targetCheckIns,
        color: categoryColors[resolution.category] || categoryColors.habits,
        icon: CATEGORY_ICONS[resolution.category] || '🎯',
      });
    });

    // Add books reading goal
    const booksRead = (contentItems || []).filter(c => c.type === 'book' && c.status === 'completed').length;
    const bookTarget = 24; // Yearly target
    if (booksRead > 0 || contentItems?.some(c => c.type === 'book')) {
      goalsList.push({
        id: 'books-goal',
        title: `Read ${bookTarget} Books`,
        category: 'Learning',
        current: booksRead,
        target: bookTarget,
        color: categoryColors.learning,
        icon: '📚',
      });
    }

    // Add workouts goal
    const totalWorkouts = (workouts || []).length;
    const workoutTarget = 150; // ~3 per week
    if (totalWorkouts > 0) {
      goalsList.push({
        id: 'workouts-goal',
        title: `Complete ${workoutTarget} Workouts`,
        category: 'Fitness',
        current: totalWorkouts,
        target: workoutTarget,
        color: categoryColors.fitness,
        icon: '🏋️',
      });
    }

    // Add streak goal
    const currentStreak = globalStreak?.current_streak || 0;
    goalsList.push({
      id: 'streak-goal',
      title: `30 Day ${terms.streak}`,
      category: 'Habits',
      current: currentStreak,
      target: 30,
      color: categoryColors.habits,
      icon: '🔥',
    });

    // Add savings goal if available
    const activeSavingsGoal = (savingsGoals || []).find(g => g.status === 'active');
    if (activeSavingsGoal) {
      goalsList.push({
        id: 'savings-goal',
        title: activeSavingsGoal.name || 'Savings Goal',
        category: 'Finance',
        current: activeSavingsGoal.currentAmount || 0,
        target: activeSavingsGoal.targetAmount || 10000,
        color: categoryColors.financial,
        icon: '💰',
      });
    }

    // Limit to 4 goals for display
    return goalsList.slice(0, 4);
  }, [resolutions, contentItems, workouts, globalStreak, savingsGoals, categoryColors, terms.streak]);

  const completedGoals = goals.filter(g => g.current >= g.target).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-text-muted flex items-center gap-2">
          <Target className="w-4 h-4" />
          {widgetTitle}
        </h3>
        <button
          onClick={() => navigate('/quests')}
          className={`text-xs flex items-center gap-1 ${modeStyle.linkColor}`}
        >
          {completedGoals}/{goals.length}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Goals List */}
      <div className="flex-1 bg-bg-1 border border-border rounded-xl p-3 overflow-y-auto">
        {goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            const isCompleted = goal.current >= goal.target;

            return (
              <div key={goal.id} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{goal.icon}</span>
                    <div>
                      <p className="text-xs text-text-primary font-medium truncate max-w-[140px]">
                        {goal.title}
                      </p>
                      <p className="text-[10px] text-text-muted">{goal.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isCompleted ? (
                      <CompletedIcon className={`w-4 h-4 ${modeStyle.completedIconColor}`} />
                    ) : (
                      <span className="text-xs text-text-muted">
                        {goal.current}/{goal.target}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-bg-hover rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${goal.color} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Progress Percentage */}
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-text-muted">
                    {Math.round(progress)}% complete
                  </span>
                  {!isCompleted && goal.target - goal.current > 0 && (
                    <span className="text-[10px] text-text-muted">
                      {goal.target - goal.current} to go
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-4">
            <Target className="w-8 h-8 text-text-muted mb-2" />
            <p className="text-xs text-text-muted">No goals set yet</p>
            <p className="text-[10px] text-text-muted mt-1">Add resolutions or start tracking</p>
          </div>
        )}

        {/* Motivation */}
        {goals.length > 0 && completedGoals > 0 && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-2">
            <MotivationIcon className={`w-3.5 h-3.5 ${modeStyle.motivationIconColor}`} />
            <span className="text-[10px] text-text-muted">
              {completedGoals} {terms.task.toLowerCase()}{completedGoals !== 1 ? 's' : ''} {mode === 'cosmic' ? 'achieved' : 'completed'}!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
