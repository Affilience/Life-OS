import React from 'react';
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
} from 'lucide-react';

const QUICK_ACTIONS = [
  { id: 'task', label: 'Add Task', icon: CheckSquare, color: 'from-blue-500 to-blue-600', path: '/productivity' },
  { id: 'workout', label: 'Log Workout', icon: Dumbbell, color: 'from-green-500 to-green-600', path: '/health' },
  { id: 'journal', label: 'Journal', icon: PenLine, color: 'from-purple-500 to-purple-600', path: '/journal' },
  { id: 'learn', label: 'Learn', icon: BookOpen, color: 'from-yellow-500 to-yellow-600', path: '/knowledge' },
  { id: 'schedule', label: 'Schedule', icon: Calendar, color: 'from-pink-500 to-pink-600', path: '/calendar' },
  { id: 'goal', label: 'Goals', icon: Target, color: 'from-orange-500 to-orange-600', path: '/missions' },
  { id: 'expense', label: 'Expense', icon: Wallet, color: 'from-emerald-500 to-emerald-600', path: '/financial' },
];

export default function QuickActionsWidget() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <Zap className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-white/60">Quick Actions</h3>
      </div>

      {/* Actions Grid */}
      <div className="flex-1 grid grid-cols-2 gap-2 content-start overflow-y-auto">
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
}
