/**
 * Project Detail View - Full project management interface
 * Shows tasks, notes, goals, and project details all in one place
 */

import React, { useState } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import {
  ArrowLeft,
  Calendar,
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Save,
  X,
} from 'lucide-react';

export default function ProjectDetailView({ projectId, onBack }) {
  const { projects, updateProject, addTaskToProject, toggleTaskCompletion, deleteProject } =
    useKnowledgeStore();
  const project = projects.find((p) => p.id === projectId);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-white/60">Project not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    addTaskToProject(projectId, { title: newTaskTitle });
    setNewTaskTitle('');
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = project.tasks.filter((t) => t.id !== taskId);
    updateProject(projectId, { tasks: updatedTasks });
  };

  const handleUpdateNotes = (notes) => {
    updateProject(projectId, { notes });
  };

  const handleUpdateGoal = (goal) => {
    updateProject(projectId, { goal });
  };

  const handleStartEditTitle = () => {
    setEditedTitle(project.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      updateProject(projectId, { title: editedTitle });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  const handleDeleteProject = () => {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      deleteProject(projectId);
      onBack();
    }
  };

  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusColors = {
    nebula: { bg: '#8b5cf615', border: '#8b5cf6', text: '#a78bfa' },
    nova: { bg: '#f59e0b15', border: '#f59e0b', text: '#fbbf24' },
    cosmos: { bg: '#10b98115', border: '#10b981', text: '#34d399' },
  };

  const statusColor = statusColors[project.status] || statusColors.nebula;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#1a1724] rounded-lg transition-all text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Project Title - Editable */}
          {isEditingTitle ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 text-3xl font-bold bg-[#1a1724] border border-purple-500 rounded-lg px-4 py-2 text-white focus:outline-none"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
              />
              <button
                onClick={handleSaveTitle}
                className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={handleCancelEditTitle}
                className="p-2 bg-[#1a1724] hover:bg-[#221e2e] text-white/60 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{project.title}</h1>
              <button
                onClick={handleStartEditTitle}
                className="p-1.5 hover:bg-[#1a1724] rounded-lg transition-all text-white/50 hover:text-white"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Delete Button */}
          <button
            onClick={handleDeleteProject}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Status and Info Bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <div
            className="px-3 py-1.5 rounded-lg border-2 font-semibold text-sm"
            style={{
              backgroundColor: statusColor.bg,
              borderColor: statusColor.border,
              color: statusColor.text,
            }}
          >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </div>

          {project.targetDate && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Calendar className="w-4 h-4" />
              <span>Target: {new Date(project.targetDate).toLocaleDateString()}</span>
            </div>
          )}

          {totalTasks > 0 && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {completedTasks}/{totalTasks} tasks ({progress}%)
              </span>
            </div>
          )}

          {project.tags.length > 0 && (
            <div className="flex gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-[#1a1724]/50 text-white/60 text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Left Column - Tasks */}
        <div className="flex flex-col overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-400" />
            Tasks & Todos
          </h2>

          {/* Add Task Input */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 bg-[#1a1724]/50 border border-white/15 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
            />
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-[#221e2e] disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Tasks List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {project.tasks.length === 0 ? (
              <div className="text-center py-12 text-zinc-600">
                <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tasks yet. Add one above!</p>
              </div>
            ) : (
              project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#12101a]/60 border border-white/10 rounded-lg p-3 hover:border-white/15 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTaskCompletion(projectId, task.id)}
                      className="flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 hover:text-purple-400 transition-colors" />
                      )}
                    </button>

                    <span
                      className={`flex-1 ${
                        task.completed
                          ? 'text-white/50 line-through'
                          : 'text-white'
                      }`}
                    >
                      {task.title}
                    </span>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Goal & Notes */}
        <div className="flex flex-col overflow-hidden">
          {/* Goal Section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Project Goal
            </h2>
            <textarea
              value={project.goal || ''}
              onChange={(e) => handleUpdateGoal(e.target.value)}
              placeholder="What's the main goal or objective of this project?"
              className="w-full px-4 py-3 bg-[#1a1724]/50 border border-white/15 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
              rows={3}
            />
          </div>

          {/* Notes Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-purple-400" />
              Notes
            </h2>
            <textarea
              value={project.notes || ''}
              onChange={(e) => handleUpdateNotes(e.target.value)}
              placeholder="Add notes, ideas, or details about this project..."
              className="flex-1 px-4 py-3 bg-[#1a1724]/50 border border-white/15 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
