/**
 * Plan Tomorrow Tab - Daily task planning for the next day
 * Allows users to plan their tasks for tomorrow evening
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  GripVertical,
  Clock,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Save,
  FolderOpen,
  Zap,
  Target,
  Sun,
  Moon,
  ListTree,
  ExternalLink,
  BookOpen,
  Dumbbell,
  Utensils,
  BookMarked,
  GraduationCap,
  Brain,
  DollarSign,
  Heart,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import useDailyTasksStore, { TASK_CATEGORIES, PRIORITY_LEVELS } from '../../stores/dailyTasksStore';
import { useGamificationModeStore, TERMINOLOGY } from '../../stores/gamificationModeStore';
import { getTaskActionRoute, suggestTaskCategory } from '../../services/taskSemanticService';
import useBadHabitsStore from '../../stores/badHabitsStore';

// Icon mapping for action buttons
const ACTION_ICONS = {
  BookOpen,
  Dumbbell,
  Utensils,
  BookMarked,
  GraduationCap,
  Brain,
  DollarSign,
  Calendar,
  Target,
  Heart,
  ExternalLink,
};

// Mode-specific styling
const MODE_STYLES = {
  cosmic: {
    buttonBg: 'bg-violet-500 hover:bg-violet-600',
    toggleActive: 'bg-violet-500',
    inputFocus: 'focus:border-violet-500',
    borderAccent: 'border-violet-500/30',
    progressGradient: 'from-violet-500 to-purple-500',
    progressBg: 'from-violet-500/10 to-purple-500/10',
    progressBorder: 'border-violet-500/20',
    textAccent: 'text-violet-400',
    hoverBorder: 'hover:border-violet-500/30',
    hoverCircle: 'hover:text-violet-400',
    templateButton: 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30',
    iconMoon: 'text-violet-400',
  },
  professional: {
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    toggleActive: 'bg-blue-500',
    inputFocus: 'focus:border-blue-500',
    borderAccent: 'border-blue-500/30',
    progressGradient: 'from-blue-500 to-cyan-500',
    progressBg: 'from-blue-500/10 to-cyan-500/10',
    progressBorder: 'border-blue-500/20',
    textAccent: 'text-blue-400',
    hoverBorder: 'hover:border-blue-500/30',
    hoverCircle: 'hover:text-blue-400',
    templateButton: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
    iconMoon: 'text-blue-400',
  },
  minimal: {
    buttonBg: 'bg-gray-500 hover:bg-gray-600',
    toggleActive: 'bg-gray-500',
    inputFocus: 'focus:border-gray-400',
    borderAccent: 'border-gray-500/30',
    progressGradient: 'from-gray-400 to-gray-500',
    progressBg: 'from-gray-500/5 to-gray-600/5',
    progressBorder: 'border-gray-500/20',
    textAccent: 'text-gray-400',
    hoverBorder: 'hover:border-gray-500/30',
    hoverCircle: 'hover:text-gray-400',
    templateButton: 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30',
    iconMoon: 'text-gray-400',
  },
};

// Get tomorrow's date formatted nicely
const getTomorrowFormatted = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

// Compact bad habits section for the Today view
function CompactBadHabitsSection({ modeStyle, terms, mode }) {
  const { habits, getHabitStats } = useBadHabitsStore();
  const [expanded, setExpanded] = useState(false);

  if (habits.length === 0) return null;

  // Calculate time clean for display
  const formatTimeSince = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffMs = now - start;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="bg-[#1a1724] border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-medium">Habits to Quit</h3>
            <p className="text-white/50 text-xs">{habits.length} habit{habits.length !== 1 ? 's' : ''} being tracked</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-sm font-medium">
            {habits.filter(h => {
              const stats = getHabitStats(h.id);
              return stats && stats.daysSince > 0;
            }).length} on streak
          </span>
          <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded habit list */}
      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-3">
          {habits.map((habit) => {
            const stats = getHabitStats(habit.id);
            if (!stats) return null;

            const isOnStreak = stats.daysSince > 0;

            return (
              <div
                key={habit.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border transition-all
                  ${isOnStreak
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-orange-500/10 border-orange-500/20'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{habit.icon}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{habit.name}</p>
                    <p className="text-white/50 text-xs">
                      {isOnStreak
                        ? `Clean for ${formatTimeSince(habit.startDate)}`
                        : 'Start your streak today!'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {isOnStreak ? (
                    <div className="flex items-center gap-1 text-green-400">
                      <Shield className="w-4 h-4" />
                      <span className="font-bold">{stats.daysSince}</span>
                      <span className="text-xs text-white/50">days</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-orange-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs">Restart</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Link to full bad habits tracker */}
          <div className="pt-2 border-t border-white/10 text-center">
            <a
              href="/missions"
              className={`text-sm ${modeStyle.textAccent} hover:underline`}
            >
              Manage habits in Quit tab →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanTomorrowTab() {
  const navigate = useNavigate();

  // Get gamification mode
  const mode = useGamificationModeStore((state) => state.mode);
  const terms = TERMINOLOGY[mode] || TERMINOLOGY.cosmic;
  const modeStyle = MODE_STYLES[mode] || MODE_STYLES.cosmic;

  const {
    getTomorrowTasks,
    getTodayTasks,
    getTodayStats,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    templates,
    saveAsTemplate,
    applyTemplate,
    deleteTemplate,
    // Subtask functions
    addSubtask,
    getSubtasks,
    getSubtaskStats,
    toggleSubtask,
    deleteSubtask,
  } = useDailyTasksStore();

  const [showAddTask, setShowAddTask] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'productivity',
    priority: 'medium',
    estimatedMinutes: 30,
  });
  const [templateName, setTemplateName] = useState('');
  const [viewMode, setViewMode] = useState('tomorrow'); // 'tomorrow' or 'today'

  // Subtask state
  const [expandedTasks, setExpandedTasks] = useState({}); // { taskId: boolean }
  const [addingSubtaskTo, setAddingSubtaskTo] = useState(null); // taskId of parent
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const tomorrowTasks = getTomorrowTasks();
  const todayTasks = getTodayTasks();
  const todayStats = getTodayStats();
  const currentTasks = viewMode === 'tomorrow' ? tomorrowTasks : todayTasks;

  const totalEstimatedTime = currentTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
  const totalXP = currentTasks.reduce((sum, t) => sum + (PRIORITY_LEVELS[t.priority]?.xp || 10), 0);

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    const date = viewMode === 'tomorrow'
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    addTask(newTask, date);
    setNewTask({
      title: '',
      description: '',
      category: 'productivity',
      priority: 'medium',
      estimatedMinutes: 30,
    });
    setShowAddTask(false);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || tomorrowTasks.length === 0) return;
    saveAsTemplate(templateName);
    setTemplateName('');
    setShowTemplates(false);
  };

  const handleToggleTask = (taskId) => {
    const date = viewMode === 'tomorrow'
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    toggleTask(taskId, date);
  };

  const handleDeleteTask = (taskId) => {
    const date = viewMode === 'tomorrow'
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    deleteTask(taskId, date);
  };

  // Toggle task expansion to show/hide subtasks
  const toggleExpanded = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Get the current date string based on view mode
  const getCurrentDate = () => {
    return viewMode === 'tomorrow'
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
  };

  // Handle adding a subtask
  const handleAddSubtask = (parentTaskId) => {
    if (!newSubtaskTitle.trim()) return;

    addSubtask(parentTaskId, { title: newSubtaskTitle }, getCurrentDate());
    setNewSubtaskTitle('');
    setAddingSubtaskTo(null);
    // Auto-expand parent to show new subtask
    setExpandedTasks(prev => ({ ...prev, [parentTaskId]: true }));
  };

  // Handle toggling subtask completion
  const handleToggleSubtask = (subtaskId) => {
    toggleSubtask(subtaskId, getCurrentDate());
  };

  // Handle deleting subtask
  const handleDeleteSubtask = (subtaskId) => {
    deleteSubtask(subtaskId, getCurrentDate());
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      {/* Header with view toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {viewMode === 'tomorrow' ? (
              <>
                <Moon className={`w-6 h-6 ${modeStyle.iconMoon}`} />
                Plan Tomorrow
              </>
            ) : (
              <>
                <Sun className="w-6 h-6 text-amber-400" />
                Today's Plan
              </>
            )}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {viewMode === 'tomorrow' ? getTomorrowFormatted() : 'Your tasks for today'}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center w-full md:w-auto bg-[#1a1724] rounded-lg p-1">
          <button
            onClick={() => setViewMode('today')}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              viewMode === 'today'
                ? `${modeStyle.toggleActive} text-white`
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
            Today
          </button>
          <button
            onClick={() => setViewMode('tomorrow')}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              viewMode === 'tomorrow'
                ? `${modeStyle.toggleActive} text-white`
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4" />
            Tomorrow
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <Target className="w-4 h-4" />
            Tasks
          </div>
          <div className="text-2xl font-bold text-white">
            {viewMode === 'today' ? `${todayStats.completed}/${todayStats.total}` : currentTasks.length}
          </div>
        </div>

        <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <Clock className="w-4 h-4" />
            Est. Time
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.floor(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m
          </div>
        </div>

        <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            Potential {terms.xp}
          </div>
          <div className="text-2xl font-bold text-yellow-400">+{totalXP}</div>
        </div>

        {viewMode === 'today' && (
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <Sparkles className="w-4 h-4 text-green-400" />
              Earned {terms.xp}
            </div>
            <div className="text-2xl font-bold text-green-400">+{todayStats.totalXP}</div>
          </div>
        )}

        {viewMode === 'tomorrow' && (
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <FolderOpen className="w-4 h-4" />
              Templates
            </div>
            <div className="text-2xl font-bold text-white">{templates?.length || 0}</div>
          </div>
        )}
      </div>

      {/* Today Progress Bar */}
      {viewMode === 'today' && todayStats.total > 0 && (
        <div className={`bg-gradient-to-r ${modeStyle.progressBg} border ${modeStyle.progressBorder} rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Today's Progress</span>
            <span className={`${modeStyle.textAccent} font-bold`}>{todayStats.percentage}%</span>
          </div>
          <div className="h-3 bg-[#0c0a10] rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${modeStyle.progressGradient} transition-all duration-500`}
              style={{ width: `${todayStats.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowAddTask(true)}
          className={`flex items-center gap-2 px-4 py-2 ${modeStyle.buttonBg} text-white rounded-lg font-medium transition-colors`}
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>

        {viewMode === 'tomorrow' && (
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1724] hover:bg-[#221e2e] text-white/80 border border-white/10 rounded-lg font-medium transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Templates
            <ChevronDown className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Templates Panel */}
      {showTemplates && viewMode === 'tomorrow' && (
        <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-white">Templates</h3>

          {/* Save as Template */}
          {tomorrowTasks.length > 0 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name..."
                className={`flex-1 bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none ${modeStyle.inputFocus}`}
              />
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className={`px-4 py-2 ${modeStyle.buttonBg} disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors`}
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Template List */}
          {templates && templates.length > 0 ? (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between bg-[#0c0a10] rounded-lg p-3"
                >
                  <div>
                    <p className="text-white font-medium">{template.name}</p>
                    <p className="text-white/50 text-xs">{template.tasks.length} tasks</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => applyTemplate(template.id)}
                      className={`px-3 py-1 ${modeStyle.templateButton} rounded text-sm transition-colors`}
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm">No templates saved yet. Plan your tasks and save as a template.</p>
          )}
        </div>
      )}

      {/* Add Task Form */}
      {showAddTask && (
        <div className={`bg-[#1a1724] border ${modeStyle.borderAccent} rounded-xl p-4 space-y-4`}>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Plus className={`w-4 h-4 ${modeStyle.textAccent}`} />
            New Task for {viewMode === 'tomorrow' ? 'Tomorrow' : 'Today'}
          </h3>

          <input
            type="text"
            value={newTask.title}
            onChange={(e) => {
              const title = e.target.value;
              const suggestedCategory = title.trim() ? suggestTaskCategory(title) : newTask.category;
              setNewTask({ ...newTask, title, category: suggestedCategory });
            }}
            placeholder="What do you want to accomplish?"
            className={`w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none ${modeStyle.inputFocus}`}
            autoFocus
          />

          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            placeholder="Description (optional)"
            rows={2}
            className={`w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none ${modeStyle.inputFocus} resize-none`}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Category */}
            <div>
              <label className="text-white/60 text-xs mb-1 block">Category</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                className={`w-full bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none ${modeStyle.inputFocus}`}
              >
                {Object.entries(TASK_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-white/60 text-xs mb-1 block">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className={`w-full bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none ${modeStyle.inputFocus}`}
              >
                {Object.entries(PRIORITY_LEVELS).map(([key, level]) => (
                  <option key={key} value={key}>{level.label} (+{level.xp} {terms.xp})</option>
                ))}
              </select>
            </div>

            {/* Estimated Time */}
            <div>
              <label className="text-white/60 text-xs mb-1 block">Est. Time (min)</label>
              <input
                type="number"
                value={newTask.estimatedMinutes}
                onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: parseInt(e.target.value) || 30 })}
                min={5}
                step={5}
                className={`w-full bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none ${modeStyle.inputFocus}`}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowAddTask(false)}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTask}
              disabled={!newTask.title.trim()}
              className={`px-6 py-2 ${modeStyle.buttonBg} disabled:opacity-50 text-white rounded-lg font-medium transition-colors`}
            >
              Add Task
            </button>
          </div>
        </div>
      )}

      {/* Compact Bad Habits Section (shows in minimal/today mode) */}
      {viewMode === 'today' && <CompactBadHabitsSection modeStyle={modeStyle} terms={terms} mode={mode} />}

      {/* Task List */}
      <div className="space-y-3">
        {currentTasks.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <h3 className="text-white/60 font-medium mb-1">
              No tasks planned {viewMode === 'tomorrow' ? 'for tomorrow' : 'for today'}
            </h3>
            <p className="text-white/40 text-sm">
              {viewMode === 'tomorrow'
                ? 'Add tasks now to start your day prepared'
                : 'Plan your day in the evening for better productivity'}
            </p>
          </div>
        ) : (
          currentTasks.map((task, index) => {
            const category = TASK_CATEGORIES[task.category] || TASK_CATEGORIES.productivity;
            const priority = PRIORITY_LEVELS[task.priority] || PRIORITY_LEVELS.medium;
            const subtasks = getSubtasks(task.id, getCurrentDate());
            const subtaskStats = getSubtaskStats(task.id, getCurrentDate());
            const isExpanded = expandedTasks[task.id];
            const hasSubtasks = subtasks.length > 0;

            return (
              <div key={task.id} className="space-y-2">
                {/* Main Task */}
                <div
                  className={`bg-[#1a1724] border rounded-xl p-4 transition-all ${
                    task.completed
                      ? 'border-green-500/30 bg-green-500/5'
                      : `border-white/10 ${modeStyle.hoverBorder}`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Expand/Collapse or Drag Handle */}
                    {hasSubtasks ? (
                      <button
                        onClick={() => toggleExpanded(task.id)}
                        className="mt-1 text-white/50 hover:text-white transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <div className="mt-1 text-white/30 cursor-grab">
                        <GripVertical className="w-4 h-4" />
                      </div>
                    )}

                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <Circle className={`w-6 h-6 text-white/40 ${modeStyle.hoverCircle} transition-colors`} />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-medium ${task.completed ? 'text-white/50 line-through' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${category.color} text-white`}>
                          {category.label}
                        </span>
                        <span className={`text-xs ${priority.color}`}>
                          {priority.label}
                        </span>
                        {/* Subtask count badge */}
                        {hasSubtasks && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            subtaskStats.completed === subtaskStats.total
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-white/10 text-white/60'
                          }`}>
                            {subtaskStats.completed}/{subtaskStats.total} subtasks
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className={`text-sm mt-1 ${task.completed ? 'text-white/30' : 'text-white/50'}`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimatedMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          +{priority.xp} {terms.xp}
                        </span>
                        {task.carriedFrom && (
                          <span className="text-amber-400">Carried over</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      {/* Go To Action Button - only show if task has a matching action route and not completed */}
                      {(() => {
                        const actionInfo = getTaskActionRoute(task);
                        if (!actionInfo || task.completed) return null;

                        const ActionIcon = ACTION_ICONS[actionInfo.icon] || ExternalLink;
                        return (
                          <button
                            onClick={() => navigate(actionInfo.fullPath)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-xs font-medium ${modeStyle.templateButton}`}
                            title={`Go to ${actionInfo.label}`}
                          >
                            <ActionIcon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{actionInfo.label}</span>
                          </button>
                        );
                      })()}

                      {/* Add Subtask Button */}
                      <button
                        onClick={() => {
                          setAddingSubtaskTo(addingSubtaskTo === task.id ? null : task.id);
                          setExpandedTasks(prev => ({ ...prev, [task.id]: true }));
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          addingSubtaskTo === task.id
                            ? `${modeStyle.textAccent} bg-white/10`
                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }`}
                        title="Add subtask"
                      >
                        <ListTree className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtask Progress Bar */}
                  {hasSubtasks && subtaskStats.total > 0 && (
                    <div className="mt-3 ml-10">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${modeStyle.progressGradient} transition-all duration-300`}
                          style={{ width: `${subtaskStats.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Subtask Form */}
                {addingSubtaskTo === task.id && (
                  <div className="ml-8 bg-[#1a1724]/50 border border-white/10 rounded-lg p-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSubtask(task.id);
                          if (e.key === 'Escape') {
                            setAddingSubtaskTo(null);
                            setNewSubtaskTitle('');
                          }
                        }}
                        placeholder="Add a subtask..."
                        className={`flex-1 bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none ${modeStyle.inputFocus}`}
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddSubtask(task.id)}
                        disabled={!newSubtaskTitle.trim()}
                        className={`px-3 py-2 ${modeStyle.buttonBg} disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Subtasks List */}
                {isExpanded && hasSubtasks && (
                  <div className="ml-8 space-y-2">
                    {subtasks.map((subtask) => {
                      const subtaskPriority = PRIORITY_LEVELS[subtask.priority] || PRIORITY_LEVELS.medium;

                      return (
                        <div
                          key={subtask.id}
                          className={`bg-[#1a1724]/50 border rounded-lg p-3 transition-all ${
                            subtask.completed
                              ? 'border-green-500/20 bg-green-500/5'
                              : 'border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Subtask Checkbox */}
                            <button
                              onClick={() => handleToggleSubtask(subtask.id)}
                              className="flex-shrink-0"
                            >
                              {subtask.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : (
                                <Circle className={`w-5 h-5 text-white/40 ${modeStyle.hoverCircle} transition-colors`} />
                              )}
                            </button>

                            {/* Subtask Content */}
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm ${subtask.completed ? 'text-white/40 line-through' : 'text-white/80'}`}>
                                {subtask.title}
                              </span>
                            </div>

                            {/* Subtask XP */}
                            <span className="text-xs text-white/30 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-yellow-400/50" />
                              +{Math.floor(subtaskPriority.xp / 2)}
                            </span>

                            {/* Delete Subtask */}
                            <button
                              onClick={() => handleDeleteSubtask(subtask.id)}
                              className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
