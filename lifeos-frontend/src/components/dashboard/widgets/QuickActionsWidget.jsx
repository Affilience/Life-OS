import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  CheckSquare,
  Dumbbell,
  BookOpen,
  PenLine,
  Calendar,
  Target,
  Wallet,
  LayoutGrid,
} from 'lucide-react';
import { useGamificationModeStore, TERMINOLOGY } from '../../../stores/gamificationModeStore';

// Mode-specific action colors
const getActionColors = (mode) => ({
  cosmic: {
    task: 'from-blue-500 to-blue-600',
    workout: 'from-green-500 to-green-600',
    journal: 'from-purple-500 to-purple-600',
    learn: 'from-yellow-500 to-yellow-600',
    schedule: 'from-pink-500 to-pink-600',
    goal: 'from-orange-500 to-orange-600',
    expense: 'from-emerald-500 to-emerald-600',
  },
  professional: {
    task: 'from-blue-500 to-cyan-600',
    workout: 'from-teal-500 to-teal-600',
    journal: 'from-indigo-500 to-indigo-600',
    learn: 'from-sky-500 to-sky-600',
    schedule: 'from-blue-600 to-blue-700',
    goal: 'from-cyan-500 to-cyan-600',
    expense: 'from-emerald-500 to-emerald-600',
  },
  minimal: {
    task: 'from-gray-500 to-gray-600',
    workout: 'from-gray-500 to-gray-600',
    journal: 'from-gray-500 to-gray-600',
    learn: 'from-gray-500 to-gray-600',
    schedule: 'from-gray-500 to-gray-600',
    goal: 'from-gray-500 to-gray-600',
    expense: 'from-gray-500 to-gray-600',
  },
});

const getQuickActions = (mode) => {
  const colors = getActionColors(mode)[mode] || getActionColors('cosmic').cosmic;
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;

  return [
    { id: 'task', label: 'Add Task', icon: CheckSquare, color: colors.task, path: '/productivity' },
    { id: 'workout', label: 'Log Workout', icon: Dumbbell, color: colors.workout, path: '/health' },
    { id: 'journal', label: 'Journal', icon: PenLine, color: colors.journal, path: '/journal' },
    { id: 'learn', label: 'Learn', icon: BookOpen, color: colors.learn, path: '/knowledge' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, color: colors.schedule, path: '/calendar' },
    { id: 'goal', label: terms.task + 's', icon: Target, color: colors.goal, path: '/quests' },
    { id: 'expense', label: 'Expense', icon: Wallet, color: colors.expense, path: '/financial' },
  ];
};

const QuickActionsWidget = memo(function QuickActionsWidget() {
  const navigate = useNavigate();
  const mode = useGamificationModeStore((state) => state.mode);
  const QUICK_ACTIONS = getQuickActions(mode);

  // Mode-specific header icon
  const HeaderIcon = mode === 'cosmic' ? Zap : mode === 'professional' ? LayoutGrid : LayoutGrid;
  const headerIconColor = mode === 'cosmic' ? 'text-yellow-400' : mode === 'professional' ? 'text-blue-400' : 'text-gray-400';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <HeaderIcon className={`w-4 h-4 ${headerIconColor}`} />
        <h3 className="text-sm font-semibold text-text-muted">Quick Actions</h3>
      </div>

      {/* Actions Grid */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 gap-2 content-start overflow-y-auto">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className={`
                flex flex-col items-center justify-center gap-1.5 p-3
                bg-gradient-to-br ${action.color}
                rounded-xl text-white
                hover:scale-105 hover:shadow-lg
                transition-all duration-200
                min-h-[60px]
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default QuickActionsWidget;
