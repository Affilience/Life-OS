import React, { useState, useMemo } from 'react';
import {
  Plus,
  Folder,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Play,
  Pause,
  Archive,
  Calendar,
  Target,
  Filter,
  ChevronDown,
  ChevronRight,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Flag,
  Zap,
  GripVertical,
} from 'lucide-react';
import useProductivityStore from '../../stores/productivityStore';
import { EmptyState } from '../ui';
import './ProjectsTab.css';

// Project creation steps
const CREATE_STEPS = [
  { id: 'basics', label: 'Project Basics', description: 'Name and describe your project' },
  { id: 'details', label: 'Timeline & Priority', description: 'Set dates and importance' },
  { id: 'style', label: 'Personalize', description: 'Choose color and add first tasks' },
];

// Priority options with colors
const PRIORITIES = [
  { value: 'high', label: 'High Priority', color: 'text-red-400', bg: 'bg-red-500/20', description: 'Urgent, needs immediate attention' },
  { value: 'medium', label: 'Medium Priority', color: 'text-yellow-400', bg: 'bg-yellow-500/20', description: 'Important but not urgent' },
  { value: 'low', label: 'Low Priority', color: 'text-green-400', bg: 'bg-green-500/20', description: 'Can wait, do when time permits' },
];

// Color options
const COLORS = [
  { value: '#8b5cf6', name: 'Violet' },
  { value: '#3b82f6', name: 'Blue' },
  { value: '#06b6d4', name: 'Cyan' },
  { value: '#10b981', name: 'Emerald' },
  { value: '#f59e0b', name: 'Amber' },
  { value: '#ef4444', name: 'Red' },
  { value: '#ec4899', name: 'Pink' },
  { value: '#a855f7', name: 'Purple' },
];

export default function ProjectsTab() {
  const {
    projects,
    tasks,
    addProject,
    updateProject,
    deleteProject,
    getProjectStats,
    getTasksByProject,
    addTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
  } = useProductivityStore();

  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [expandedProjects, setExpandedProjects] = useState({});
  const [createStep, setCreateStep] = useState(0);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    priority: 'medium',
    progress: 0,
    color: '#8b5cf6',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    estimatedTime: 0,
    initialTasks: [], // For adding tasks during project creation
  });

  // New task form state (for adding tasks to existing projects)
  const [newTaskForm, setNewTaskForm] = useState({});
  const [showTaskInput, setShowTaskInput] = useState({});

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
      priority: 'medium',
      progress: 0,
      color: '#8b5cf6',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      estimatedTime: 0,
      initialTasks: [],
    });
    setCreateStep(0);
  };

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    resetForm();
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      color: project.color,
      startDate: project.startDate,
      dueDate: project.dueDate || '',
      estimatedTime: project.estimatedTime,
      initialTasks: [],
    });
    setCreateStep(0);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    resetForm();
    setEditingProject(null);
  };

  const handleNextStep = () => {
    if (createStep < CREATE_STEPS.length - 1) {
      setCreateStep(createStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (createStep > 0) {
      setCreateStep(createStep - 1);
    }
  };

  const handleSubmit = () => {
    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      // Create project
      const projectData = { ...formData };
      delete projectData.initialTasks;
      addProject(projectData);

      // Add initial tasks if any
      const newProjectId = `proj-${Date.now()}`;
      formData.initialTasks.forEach((taskTitle, index) => {
        if (taskTitle.trim()) {
          setTimeout(() => {
            addTask({
              projectId: newProjectId,
              title: taskTitle,
              description: '',
              status: 'pending',
              priority: 'medium',
              dueDate: null,
              tags: [],
              estimatedTime: 1800,
            });
          }, index * 10);
        }
      });
    }
    handleCloseModal();
  };

  const handleAddInitialTask = () => {
    setFormData({
      ...formData,
      initialTasks: [...formData.initialTasks, ''],
    });
  };

  const handleUpdateInitialTask = (index, value) => {
    const updated = [...formData.initialTasks];
    updated[index] = value;
    setFormData({ ...formData, initialTasks: updated });
  };

  const handleRemoveInitialTask = (index) => {
    setFormData({
      ...formData,
      initialTasks: formData.initialTasks.filter((_, i) => i !== index),
    });
  };

  const handleDeleteProject = (projectId) => {
    if (confirm('Are you sure you want to delete this project? This will also delete all associated tasks and sessions.')) {
      deleteProject(projectId);
    }
  };

  const handleStatusChange = (projectId, newStatus) => {
    updateProject(projectId, { status: newStatus });
  };

  const toggleProjectExpand = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const handleAddTaskToProject = (projectId) => {
    const taskTitle = newTaskForm[projectId];
    if (!taskTitle?.trim()) return;

    addTask({
      projectId,
      title: taskTitle,
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: null,
      tags: [],
      estimatedTime: 1800,
    });

    setNewTaskForm({ ...newTaskForm, [projectId]: '' });
    setShowTaskInput({ ...showTaskInput, [projectId]: false });
  };

  const formatTime = (seconds) => {
    const hours = (seconds / 3600).toFixed(1);
    return `${hours}h`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter and sort projects
  let filteredProjects = projects;
  if (filterStatus !== 'all') {
    filteredProjects = projects.filter((p) => p.status === filterStatus);
  }

  filteredProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      case 'progress':
        return b.progress - a.progress;
      case 'dueDate': {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      case 'updatedAt':
      default:
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });

  // Validate current step
  const isStepValid = () => {
    switch (createStep) {
      case 0:
        return formData.name.trim().length > 0;
      case 1:
        return true; // Timeline is optional
      case 2:
        return true; // Style is optional
      default:
        return false;
    }
  };

  return (
    <div className="projects-tab">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Projects</h2>
          <p className="text-white/60 text-sm">Manage your projects and track progress</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
          data-tour="create-project-btn"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-[#1a1724] border border-white/10 rounded-lg px-3 py-2">
          <Filter className="w-4 h-4 text-white/40" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
          >
            <option value="all">All Projects</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 bg-[#1a1724] border border-white/10 rounded-lg px-3 py-2">
          <TrendingUp className="w-4 h-4 text-white/40" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
          >
            <option value="updatedAt">Recently Updated</option>
            <option value="priority">Priority</option>
            <option value="progress">Progress</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>

        <div className="flex-1" />

        {/* View Toggle */}
        <div className="flex bg-[#1a1724] border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-violet-500 text-white' : 'text-white/60 hover:text-white'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-violet-500 text-white' : 'text-white/60 hover:text-white'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          type="projects"
          title="No projects found"
          description={filterStatus !== 'all'
            ? "Try adjusting your filters to see more projects"
            : "Create your first project to organize tasks and track progress"}
          actionLabel="Create Project"
          onAction={handleOpenCreateModal}
          variant="violet"
          size="md"
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'} data-tour="projects-list">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);
            const projectTasks = getTasksByProject(project.id);
            const isExpanded = expandedProjects[project.id];

            return (
              <div
                key={project.id}
                className={`bg-[#1a1724] border border-white/10 rounded-xl overflow-hidden transition-all hover:border-violet-500/30 ${isExpanded ? 'border-violet-500/30' : ''}`}
              >
                {/* Project Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${project.color}20` }}
                    >
                      <Folder className="w-5 h-5" style={{ color: project.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white truncate">{project.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          project.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {project.priority}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          project.status === 'paused' ? 'bg-amber-500/20 text-amber-400' :
                          project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-white/50 text-sm mt-1 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(project)}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white/50">Progress</span>
                      <span className="text-xs font-medium text-white">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-[#0c0a10] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                      />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mt-4 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(project.totalTimeSpent)}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {stats.completedTasks}/{stats.totalTasks} tasks
                    </span>
                    {project.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(project.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable Tasks Section */}
                <div className="border-t border-white/5">
                  <button
                    onClick={() => toggleProjectExpand(project.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      Tasks ({projectTasks.length})
                    </span>
                    <span className="text-xs text-violet-400">
                      {stats.completedTasks} completed
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2">
                      {/* Task List */}
                      {projectTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                            task.status === 'completed'
                              ? 'bg-green-500/10 border border-green-500/20'
                              : 'bg-[#0c0a10] border border-white/5 hover:border-white/10'
                          }`}
                        >
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className="flex-shrink-0"
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-white/40 hover:text-violet-400 transition-colors" />
                            )}
                          </button>
                          <span className={`flex-1 text-sm ${
                            task.status === 'completed' ? 'text-white/50 line-through' : 'text-white'
                          }`}>
                            {task.title}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {task.priority}
                          </span>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-white/40 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add Task Input */}
                      {showTaskInput[project.id] ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newTaskForm[project.id] || ''}
                            onChange={(e) => setNewTaskForm({ ...newTaskForm, [project.id]: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTaskToProject(project.id)}
                            placeholder="Task name..."
                            className="flex-1 bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddTaskToProject(project.id)}
                            className="p-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowTaskInput({ ...showTaskInput, [project.id]: false })}
                            className="p-2 text-white/40 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowTaskInput({ ...showTaskInput, [project.id]: true })}
                          className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-white/10 rounded-lg text-sm text-white/40 hover:text-violet-400 hover:border-violet-500/30 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Task
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex border-t border-white/5">
                  {project.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(project.id, 'paused')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-xs text-white/50 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  )}
                  {project.status === 'paused' && (
                    <button
                      onClick={() => handleStatusChange(project.id, 'active')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-xs text-white/50 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </button>
                  )}
                  {project.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusChange(project.id, 'completed')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-xs text-white/50 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange(project.id, 'archived')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-xs text-white/50 hover:text-gray-400 hover:bg-gray-500/10 transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg bg-[#1a1724] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step Indicator */}
              {!editingProject && (
                <div className="flex items-center gap-2 mt-4">
                  {CREATE_STEPS.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          index === createStep
                            ? 'bg-violet-500 text-white'
                            : index < createStep
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-white/50'
                        }`}>
                          {index < createStep ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                        </div>
                        <span className={`text-sm hidden md:block ${
                          index === createStep ? 'text-white' : 'text-white/50'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {index < CREATE_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 ${
                          index < createStep ? 'bg-green-500' : 'bg-white/10'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Step 1: Basics */}
              {(createStep === 0 || editingProject) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Project Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="What are you working on?"
                      className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your project goals and scope..."
                      rows={3}
                      className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-violet-500 resize-none"
                    />
                  </div>

                  {editingProject && (
                    <>
                      {/* Priority Selection */}
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Priority</label>
                        <div className="grid grid-cols-3 gap-2">
                          {PRIORITIES.map((p) => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, priority: p.value })}
                              className={`p-3 rounded-lg border text-center transition-all ${
                                formData.priority === p.value
                                  ? `${p.bg} border-current ${p.color}`
                                  : 'bg-[#0c0a10] border-white/10 text-white/60 hover:border-white/20'
                              }`}
                            >
                              <Flag className="w-4 h-4 mx-auto mb-1" />
                              <span className="text-xs">{p.label.replace(' Priority', '')}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">Start Date</label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">Due Date</label>
                          <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>

                      {/* Progress */}
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Progress: {formData.progress}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.progress}
                          onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      {/* Color */}
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Color</label>
                        <div className="flex gap-2">
                          {COLORS.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, color: c.value })}
                              className={`w-8 h-8 rounded-lg transition-all ${
                                formData.color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1724]' : ''
                              }`}
                              style={{ backgroundColor: c.value }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Timeline & Priority */}
              {createStep === 1 && !editingProject && (
                <div className="space-y-6">
                  {/* Priority Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">How important is this project?</label>
                    <div className="space-y-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: p.value })}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                            formData.priority === p.value
                              ? `${p.bg} border-current ${p.color}`
                              : 'bg-[#0c0a10] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <Flag className={`w-5 h-5 ${formData.priority === p.value ? p.color : 'text-white/40'}`} />
                          <div>
                            <div className={`font-medium ${formData.priority === p.value ? 'text-white' : 'text-white/80'}`}>
                              {p.label}
                            </div>
                            <div className="text-xs text-white/50">{p.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">When do you want to complete this?</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Target Due Date</label>
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="w-full bg-[#0c0a10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-white/40 mt-2">Due date is optional. You can always add or change it later.</p>
                  </div>
                </div>
              )}

              {/* Step 3: Style & Initial Tasks */}
              {createStep === 2 && !editingProject && (
                <div className="space-y-6">
                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">Choose a color for your project</label>
                    <div className="flex flex-wrap gap-3">
                      {COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: c.value })}
                          className={`w-12 h-12 rounded-xl transition-all ${
                            formData.color === c.value
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1724] scale-110'
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Initial Tasks */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        Add some initial tasks (optional)
                      </span>
                    </label>
                    <div className="space-y-2">
                      {formData.initialTasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-white/30" />
                          <input
                            type="text"
                            value={task}
                            onChange={(e) => handleUpdateInitialTask(index, e.target.value)}
                            placeholder={`Task ${index + 1}...`}
                            className="flex-1 bg-[#0c0a10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveInitialTask(index)}
                            className="p-2 text-white/40 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddInitialTask}
                        className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-white/10 rounded-lg text-sm text-white/40 hover:text-violet-400 hover:border-violet-500/30 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Task
                      </button>
                    </div>
                    <p className="text-xs text-white/40 mt-2">You can always add more tasks after creating the project.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 flex items-center justify-between">
              {!editingProject && createStep > 0 ? (
                <button
                  onClick={handlePrevStep}
                  className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}

              {editingProject || createStep === CREATE_STEPS.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!formData.name.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              ) : (
                <button
                  onClick={handleNextStep}
                  disabled={!isStepValid()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
