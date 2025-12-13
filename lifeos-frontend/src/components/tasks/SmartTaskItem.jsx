/**
 * SmartTaskItem - A task item component with semantic understanding
 *
 * Features:
 * - Displays task with completion checkbox
 * - Shows action button that navigates to the relevant section
 * - Visual category/type indicator
 * - Compact or expanded view modes
 */

import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  BookOpen,
  Dumbbell,
  Utensils,
  Moon,
  BookMarked,
  GraduationCap,
  Brain,
  Sparkles,
  DollarSign,
  Calendar,
  Target,
  Users,
  Heart,
  Droplet,
  Pill,
  Palette,
  Home,
  Briefcase,
  CheckSquare,
  Zap,
  Star,
  ChevronRight,
} from 'lucide-react';
import { getTaskActionRoute, analyzeTaskSemantics } from '../../services/taskSemanticService';
import './SmartTaskItem.css';

// Icon mapping
const ICON_MAP = {
  BookOpen,
  Dumbbell,
  Utensils,
  Moon,
  BookMarked,
  GraduationCap,
  Brain,
  Sparkles,
  DollarSign,
  Calendar,
  Target,
  Users,
  Heart,
  Droplet,
  Pill,
  Palette,
  Home,
  Briefcase,
  CheckSquare,
};

function SmartTaskItem({
  task,
  onToggle,
  showActionButton = true,
  compact = false,
  showCategory = true,
  categoryConfig = null,
  priorityConfig = null,
}) {
  const navigate = useNavigate();

  // Analyze task semantics
  const semantics = useMemo(() => analyzeTaskSemantics(task.title), [task.title]);
  const actionInfo = useMemo(() => getTaskActionRoute(task), [task.title]);

  // Get the icon component
  const TaskIcon = semantics?.icon ? ICON_MAP[semantics.icon] : CheckSquare;

  // Handle action button click
  const handleActionClick = (e) => {
    e.stopPropagation();
    if (actionInfo?.fullPath) {
      navigate(actionInfo.fullPath);
    }
  };

  // Get priority indicator
  const getPriorityIndicator = () => {
    if (!task.priority) return null;
    switch (task.priority) {
      case 'critical':
        return <Zap className="w-3 h-3 text-red-400" />;
      case 'high':
        return <Star className="w-3 h-3 text-orange-400" />;
      default:
        return null;
    }
  };

  // Category colors
  const getCategoryStyle = () => {
    if (categoryConfig) {
      return {
        background: `linear-gradient(135deg, ${categoryConfig.color})`,
      };
    }
    // Default based on semantic type
    const typeColors = {
      journal: 'from-rose-500 to-pink-500',
      workout: 'from-emerald-500 to-teal-500',
      nutrition: 'from-amber-500 to-orange-500',
      sleep: 'from-indigo-500 to-violet-500',
      reading: 'from-cyan-500 to-blue-500',
      learning: 'from-violet-500 to-purple-500',
      deepWork: 'from-blue-500 to-indigo-500',
      meditation: 'from-purple-500 to-pink-500',
      finance: 'from-green-500 to-emerald-500',
      planning: 'from-slate-500 to-gray-500',
      goals: 'from-yellow-500 to-amber-500',
      social: 'from-pink-500 to-rose-500',
      hydration: 'from-sky-400 to-blue-400',
      supplements: 'from-teal-500 to-cyan-500',
      creative: 'from-fuchsia-500 to-pink-500',
      chores: 'from-stone-500 to-slate-500',
      work: 'from-indigo-500 to-violet-500',
    };
    return semantics?.type ? typeColors[semantics.type] : 'from-slate-500 to-gray-500';
  };

  if (compact) {
    return (
      <div className={`smart-task-item compact ${task.completed ? 'completed' : ''}`}>
        <button
          onClick={() => onToggle?.(task.id)}
          className="task-checkbox"
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : (
            <div className="checkbox-wrapper">
              <Circle className="w-4 h-4 text-text-muted" />
              {getPriorityIndicator() && (
                <div className="priority-indicator">{getPriorityIndicator()}</div>
              )}
            </div>
          )}
        </button>

        <span className={`task-title ${task.completed ? 'completed' : ''}`}>
          {task.title}
        </span>

        {showActionButton && actionInfo && !task.completed && (
          <button
            onClick={handleActionClick}
            className="task-action-btn compact"
            title={actionInfo.label}
          >
            <TaskIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`smart-task-item ${task.completed ? 'completed' : ''}`}>
      <button
        onClick={() => onToggle?.(task.id)}
        className="task-checkbox"
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : (
          <div className="checkbox-wrapper">
            <Circle className="w-5 h-5 text-text-muted" />
            {getPriorityIndicator() && (
              <div className="priority-indicator">{getPriorityIndicator()}</div>
            )}
          </div>
        )}
      </button>

      <div className="task-content">
        <div className="task-header">
          <span className={`task-title ${task.completed ? 'completed' : ''}`}>
            {task.title}
          </span>

          {showCategory && semantics && (
            <span
              className={`task-type-badge bg-gradient-to-r ${getCategoryStyle()}`}
            >
              <TaskIcon className="w-3 h-3" />
              {semantics.type.charAt(0).toUpperCase() + semantics.type.slice(1)}
            </span>
          )}
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>

      {showActionButton && actionInfo && !task.completed && (
        <button
          onClick={handleActionClick}
          className="task-action-btn"
          title={`Go to ${actionInfo.label}`}
        >
          <span className="action-label">{actionInfo.label}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default memo(SmartTaskItem);
