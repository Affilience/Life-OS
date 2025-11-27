/**
 * Plan Tomorrow Tab - Daily task planning for the next day
 * Allows users to plan their tasks for tomorrow evening
 */

import React, { useState } from 'react';
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
  Save,
  FolderOpen,
  Zap,
  Target,
  Sun,
  Moon,
} from 'lucide-react';
import useDailyTasksStore, { TASK_CATEGORIES, PRIORITY_LEVELS } from '../../stores/dailyTasksStore';

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

export default function PlanTomorrowTab() {
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

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      {/* Header with view toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {viewMode === 'tomorrow' ? (
              <>
                <Moon className="w-6 h-6 text-violet-400" />
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
        <div className="flex items-center gap-2 bg-[#1a1724] rounded-lg p-1">
          <button
            onClick={() => setViewMode('today')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'today'
                ? 'bg-violet-500 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 inline mr-2" />
            Today
          </button>
          <button
            onClick={() => setViewMode('tomorrow')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'tomorrow'
                ? 'bg-violet-500 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 inline mr-2" />
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
            Potential XP
          </div>
          <div className="text-2xl font-bold text-yellow-400">+{totalXP}</div>
        </div>

        {viewMode === 'today' && (
          <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <Sparkles className="w-4 h-4 text-green-400" />
              Earned XP
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
        <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Today's Progress</span>
            <span className="text-violet-400 font-bold">{todayStats.percentage}%</span>
          </div>
          <div className="h-3 bg-[#0c0a10] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
              style={{ width: `${todayStats.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
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
                className="flex-1 bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className="px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
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
                      className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded text-sm hover:bg-violet-500/30 transition-colors"
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
        <div className="bg-[#1a1724] border border-violet-500/30 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-violet-400" />
            New Task for {viewMode === 'tomorrow' ? 'Tomorrow' : 'Today'}
          </h3>

          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="What do you want to accomplish?"
            className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500"
            autoFocus
          />

          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 resize-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Category */}
            <div>
              <label className="text-white/60 text-xs mb-1 block">Category</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
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
                className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
              >
                {Object.entries(PRIORITY_LEVELS).map(([key, level]) => (
                  <option key={key} value={key}>{level.label} (+{level.xp} XP)</option>
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
                className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
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
              className="px-6 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              Add Task
            </button>
          </div>
        </div>
      )}

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

            return (
              <div
                key={task.id}
                className={`bg-[#1a1724] border rounded-xl p-4 transition-all ${
                  task.completed
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-white/10 hover:border-violet-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <div className="mt-1 text-white/30 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-white/40 hover:text-violet-400 transition-colors" />
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
                        +{priority.xp} XP
                      </span>
                      {task.carriedFrom && (
                        <span className="text-amber-400">Carried over</span>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
