/**
 * SmartTaskItem - A task item component with semantic understanding
 *
 * Features:
 * - Displays task with completion checkbox
 * - Shows action button that navigates to the relevant section
 * - Visual category/type indicator
 * - Compact or expanded view modes
 * - Satisfying micro-interactions on completion
 */

import React, { memo, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  Check,
} from 'lucide-react';
import { getTaskActionRoute, analyzeTaskSemantics } from '../../services/taskSemanticService';
import { feedback } from '../../services/microInteractions';
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
  celebrateOnComplete = true,
}) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const checkboxRef = useRef(null);

  // Analyze task semantics
  const semantics = useMemo(() => analyzeTaskSemantics(task.title), [task.title]);
  const actionInfo = useMemo(() => getTaskActionRoute(task), [task.title]);

  // Get the icon component
  const TaskIcon = semantics?.icon ? ICON_MAP[semantics.icon] : CheckSquare;

  // Handle task toggle with micro-interactions
  const handleToggle = useCallback(() => {
    const wasCompleted = task.completed;

    // Trigger micro-interactions
    if (!wasCompleted) {
      // Completing - satisfying feedback
      const rect = checkboxRef.current?.getBoundingClientRect();
      feedback.taskComplete({
        celebrate: celebrateOnComplete,
        position: rect ? { x: rect.left + rect.width / 2, y: rect.top } : null,
      });
    } else {
      // Uncompleting
      feedback.taskUncomplete();
    }

    onToggle?.(task.id);
  }, [task.id, task.completed, onToggle, celebrateOnComplete]);

  // Handle action button click
  const handleActionClick = (e) => {
    e.stopPropagation();
    feedback.buttonPress();
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

  // Animation variants for checkbox
  const checkboxVariants = {
    unchecked: { scale: 1 },
    checked: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.3, times: [0, 0.5, 1] },
    },
    tap: { scale: 0.9 },
  };

  const checkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  if (compact) {
    return (
      <motion.div
        className={`smart-task-item compact ${task.completed ? 'completed' : ''}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10, height: 0 }}
        layout
      >
        <motion.button
          ref={checkboxRef}
          onClick={handleToggle}
          className="task-checkbox"
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
          variants={prefersReducedMotion ? {} : checkboxVariants}
          animate={task.completed ? 'checked' : 'unchecked'}
          whileTap="tap"
        >
          <AnimatePresence mode="wait">
            {task.completed ? (
              <motion.div
                key="checked"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative"
              >
                <CheckCircle2 className="w-4 h-4 text-success" />
              </motion.div>
            ) : (
              <motion.div
                key="unchecked"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="checkbox-wrapper"
              >
                <Circle className="w-4 h-4 text-text-muted" />
                {getPriorityIndicator() && (
                  <div className="priority-indicator">{getPriorityIndicator()}</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.span
          className={`task-title ${task.completed ? 'completed' : ''}`}
          animate={{
            opacity: task.completed ? 0.6 : 1,
            textDecoration: task.completed ? 'line-through' : 'none',
          }}
          transition={{ duration: 0.2 }}
        >
          {task.title}
        </motion.span>

        {showActionButton && actionInfo && !task.completed && (
          <motion.button
            onClick={handleActionClick}
            className="task-action-btn compact"
            title={actionInfo.label}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <TaskIcon className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`smart-task-item ${task.completed ? 'completed' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      layout
    >
      <motion.button
        ref={checkboxRef}
        onClick={handleToggle}
        className="task-checkbox"
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        variants={prefersReducedMotion ? {} : checkboxVariants}
        animate={task.completed ? 'checked' : 'unchecked'}
        whileTap="tap"
      >
        <AnimatePresence mode="wait">
          {task.completed ? (
            <motion.div
              key="checked"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <CheckCircle2 className="w-5 h-5 text-success" />
              {/* Ripple effect */}
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-success"
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="checkbox-wrapper"
            >
              <Circle className="w-5 h-5 text-text-muted" />
              {getPriorityIndicator() && (
                <div className="priority-indicator">{getPriorityIndicator()}</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="task-content">
        <div className="task-header">
          <motion.span
            className={`task-title ${task.completed ? 'completed' : ''}`}
            animate={{
              opacity: task.completed ? 0.6 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {task.title}
          </motion.span>

          {showCategory && semantics && (
            <motion.span
              className={`task-type-badge bg-gradient-to-r ${getCategoryStyle()}`}
              whileHover={{ scale: 1.05 }}
            >
              <TaskIcon className="w-3 h-3" />
              {semantics.type.charAt(0).toUpperCase() + semantics.type.slice(1)}
            </motion.span>
          )}
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>

      {showActionButton && actionInfo && !task.completed && (
        <motion.button
          onClick={handleActionClick}
          className="task-action-btn"
          title={`Go to ${actionInfo.label}`}
          whileHover={{ scale: 1.02, x: 3 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="action-label">{actionInfo.label}</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
}

export default memo(SmartTaskItem);
