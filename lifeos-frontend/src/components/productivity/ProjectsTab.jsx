import React, { useState } from 'react';
import {
  Plus,
  Folder,
  TrendingUp,
  Clock,
  CheckCircle2,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Play,
  Pause,
  Archive,
  DollarSign,
  Calendar,
  Target,
  Filter,
} from 'lucide-react';
import useProductivityStore from '../../stores/productivityStore';
import './ProjectsTab.css';

export default function ProjectsTab() {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    getProjectStats,
  } = useProductivityStore();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'paused', 'completed', 'archived'
  const [sortBy, setSortBy] = useState('updatedAt'); // 'updatedAt', 'priority', 'progress', 'dueDate'

  // Form state
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
  });

  const handleOpenAddModal = () => {
    setEditingProject(null);
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
    });
    setShowAddModal(true);
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
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      addProject(formData);
    }
    setShowAddModal(false);
  };

  const handleDeleteProject = (projectId) => {
    if (confirm('Are you sure you want to delete this project? This will also delete all associated tasks and sessions.')) {
      deleteProject(projectId);
    }
  };

  const handleStatusChange = (projectId, newStatus) => {
    updateProject(projectId, { status: newStatus });
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  const getPriorityBadgeClass = (priority) => {
    return `priority-badge priority-${priority}`;
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

  return (
    <div className="projects-tab">
      {/* Header */}
      <div className="tab-header">
        <div className="header-left">
          <h2 className="tab-title">Projects</h2>
          <p className="tab-description">Manage your ongoing projects and track progress</p>
        </div>
        <button onClick={handleOpenAddModal} className="add-project-btn">
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Controls */}
      <div className="projects-controls">
        <div className="controls-left">
          {/* Status Filter */}
          <div className="filter-group">
            <Filter className="w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Projects</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sort */}
          <div className="filter-group">
            <TrendingUp className="w-4 h-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="updatedAt">Recently Updated</option>
              <option value="priority">Priority</option>
              <option value="progress">Progress</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            onClick={() => setViewMode('grid')}
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <Folder className="w-12 h-12 opacity-20" />
          <p>No projects found</p>
          <p className="empty-hint">Create your first project to get started!</p>
        </div>
      ) : (
        <div className={`projects-${viewMode}`}>
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);

            return (
              <div key={project.id} className="project-card">
                {/* Card Header */}
                <div className="project-card-header">
                  <div className="project-icon-wrapper">
                    <div
                      className="project-icon"
                      style={{ backgroundColor: `${project.color}20`, color: project.color }}
                    >
                      <Folder className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="project-badges">
                    <span className={getPriorityBadgeClass(project.priority)}>
                      {project.priority}
                    </span>
                    <span className={getStatusBadgeClass(project.status)}>
                      {project.status}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="project-card-content">
                  <h3 className="project-name">{project.name}</h3>
                  <p className="project-description">{project.description}</p>

                  {/* Progress Bar */}
                  <div className="project-progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Progress</span>
                      <span className="progress-value">{project.progress}%</span>
                    </div>
                    <div className="progress-bar-wrapper">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${project.progress}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="project-stats-grid">
                    <div className="project-stat">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(project.totalTimeSpent)}</span>
                    </div>
                    <div className="project-stat">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {stats.completedTasks}/{stats.totalTasks} tasks
                      </span>
                    </div>
                    <div className="project-stat">
                      <Target className="w-4 h-4" />
                      <span>{stats.totalSessions} sessions</span>
                    </div>
                    <div className="project-stat">
                      <DollarSign className="w-4 h-4" />
                      <span>£{stats.totalIncome}</span>
                    </div>
                  </div>

                  {/* Due Date */}
                  {project.dueDate && (
                    <div className="project-due-date">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(project.dueDate)}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="project-card-actions">
                  <button
                    onClick={() => handleOpenEditModal(project)}
                    className="action-btn edit"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  {project.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(project.id, 'paused')}
                      className="action-btn pause"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  )}
                  {project.status === 'paused' && (
                    <button
                      onClick={() => handleStatusChange(project.id, 'active')}
                      className="action-btn resume"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange(project.id, 'archived')}
                    className="action-btn archive"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="action-btn delete"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h3>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project"
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="form-select"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Due Date (optional)</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label>Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) =>
                      setFormData({ ...formData, progress: parseInt(e.target.value) })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <div className="color-picker">
                    {[
                      '#8b5cf6',
                      '#3b82f6',
                      '#ec4899',
                      '#f59e0b',
                      '#10b981',
                      '#06b6d4',
                      '#ef4444',
                      '#a855f7',
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`color-option ${formData.color === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
