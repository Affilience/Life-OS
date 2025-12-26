import React, { useState, useRef } from 'react';
import {
  Plus,
  Circle,
  CheckCircle2,
  Clock,
  Flag,
  Folder,
  Tag,
  Edit2,
  Trash2,
  Calendar,
  Filter,
  TrendingUp,
  X,
  ChevronDown,
  ChevronRight,
  ListTree,
} from 'lucide-react';
import useProductivityStore from '../../stores/productivityStore';
import { EmptyState } from '../ui';
import { feedback } from '../../services/microInteractions';
import './TasksTab.css';

export default function TasksTab() {
  const {
    tasks,
    projects,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    // Subtask functions
    addSubtask,
    getSubtasks,
    getSubtaskStats,
    toggleSubtaskComplete,
    deleteSubtask,
    getTopLevelTasks,
  } = useProductivityStore();

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'active', 'completed'
  const [filterProject, setFilterProject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate', 'priority', 'createdAt'

  // Quick Add Form
  const [quickAddTitle, setQuickAddTitle] = useState('');

  // Subtask state
  const [expandedTasks, setExpandedTasks] = useState({}); // { taskId: boolean }
  const [addingSubtaskTo, setAddingSubtaskTo] = useState(null); // taskId of parent
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Full Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: null,
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    tags: [],
    estimatedTime: 0,
  });
  const [tagInput, setTagInput] = useState('');

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickAddTitle.trim()) return;

    addTask({
      title: quickAddTitle,
      description: '',
      projectId: null,
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      tags: [],
      estimatedTime: 0,
    });

    setQuickAddTitle('');
    setShowQuickAdd(false);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
      tags: task.tags || [],
      estimatedTime: task.estimatedTime || 0,
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    updateTask(editingTask.id, formData);
    setShowEditModal(false);
    setEditingTask(null);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (formData.tags.includes(tagInput.trim())) return;
    setFormData({
      ...formData,
      tags: [...formData.tags, tagInput.trim()],
    });
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleDeleteTask = (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  // Subtask handlers
  const toggleExpanded = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleAddSubtask = (parentTaskId) => {
    if (!newSubtaskTitle.trim()) return;

    addSubtask(parentTaskId, { title: newSubtaskTitle });
    setNewSubtaskTitle('');
    setAddingSubtaskTo(null);
    // Auto-expand parent to show new subtask
    setExpandedTasks(prev => ({ ...prev, [parentTaskId]: true }));
  };

  const handleToggleSubtask = (subtaskId, wasCompleted, event) => {
    // Trigger micro-interactions
    if (!wasCompleted) {
      const rect = event?.currentTarget?.getBoundingClientRect();
      feedback.taskComplete({
        celebrate: false, // Subtasks get subtle feedback only
        position: rect ? { x: rect.left + rect.width / 2, y: rect.top } : null,
      });
    } else {
      feedback.taskUncomplete();
    }
    toggleSubtaskComplete(subtaskId);
  };

  const handleDeleteSubtask = (subtaskId) => {
    if (confirm('Are you sure you want to delete this subtask?')) {
      deleteSubtask(subtaskId);
    }
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#60a5fa';
      default:
        return '#9ca3af';
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  // Filter and sort tasks - start with top-level tasks only
  let filteredTasks = tasks.filter(t => !t.parentTaskId);

  // Filter by status
  if (filterStatus !== 'all') {
    filteredTasks = filteredTasks.filter((t) => t.status === filterStatus);
  }

  // Filter by project
  if (filterProject !== 'all') {
    filteredTasks = filteredTasks.filter((t) => t.projectId === filterProject);
  }

  // Filter by priority
  if (filterPriority !== 'all') {
    filteredTasks = filteredTasks.filter((t) => t.priority === filterPriority);
  }

  // Sort tasks
  filteredTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      case 'dueDate': {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      case 'createdAt':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Group by status
  const pendingTasks = filteredTasks.filter((t) => t.status === 'pending');
  const activeTasks = filteredTasks.filter((t) => t.status === 'active');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  return (
    <div className="tasks-tab">
      {/* Header */}
      <div className="tab-header">
        <div className="header-left">
          <h2 className="tab-title">Tasks</h2>
          <p className="tab-description">Manage and organise your tasks by priority and project</p>
        </div>
        <button onClick={() => setShowQuickAdd(!showQuickAdd)} className="add-task-btn" data-tour="add-task-btn">
          <Plus className="w-5 h-5" />
          Quick Add Task
        </button>
      </div>

      {/* Quick Add Form */}
      {showQuickAdd && (
        <form onSubmit={handleQuickAdd} className="quick-add-form">
          <input
            type="text"
            value={quickAddTitle}
            onChange={(e) => setQuickAddTitle(e.target.value)}
            placeholder="Enter task title and press Enter..."
            className="quick-add-input"
            autoFocus
          />
          <button type="submit" className="quick-add-submit">
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowQuickAdd(false)}
            className="quick-add-cancel"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Controls */}
      <div className="tasks-controls">
        <div className="controls-left">
          {/* Status Filter */}
          <div className="filter-group">
            <Filter className="w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Project Filter */}
          <div className="filter-group">
            <Folder className="w-4 h-4" />
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="filter-group">
            <Flag className="w-4 h-4" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Recently Created</option>
            </select>
          </div>
        </div>

        {/* Task Counts */}
        <div className="task-counts">
          <span className="task-count">
            {pendingTasks.length} pending
          </span>
          <span className="task-count-separator">•</span>
          <span className="task-count">
            {activeTasks.length} active
          </span>
          <span className="task-count-separator">•</span>
          <span className="task-count">
            {completedTasks.length} completed
          </span>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          type="tasks"
          title="No tasks found"
          description={filterStatus !== 'all' || filterProject !== 'all' || filterPriority !== 'all'
            ? "Try adjusting your filters to see more tasks"
            : "Create your first task to start tracking your work and earning XP"}
          actionLabel="Create Task"
          onAction={() => setShowQuickAdd(true)}
          variant="violet"
          size="md"
        />
      ) : (
        <div className="tasks-list" data-tour="tasks-list">
          {filteredTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            const subtasks = getSubtasks(task.id);
            const subtaskStats = getSubtaskStats(task.id);
            const hasSubtasks = subtasks.length > 0;
            const isExpanded = expandedTasks[task.id];

            return (
              <div key={task.id} className="task-item-wrapper">
                <div className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
                  {/* Expand/Collapse for subtasks */}
                  <button
                    onClick={() => hasSubtasks && toggleExpanded(task.id)}
                    className={`task-expand-btn ${hasSubtasks ? 'has-subtasks' : 'no-subtasks'}`}
                    disabled={!hasSubtasks}
                  >
                    {hasSubtasks ? (
                      isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    ) : (
                      <span className="w-4 h-4" />
                    )}
                  </button>

                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      const wasCompleted = task.status === 'completed';
                      // Trigger micro-interactions
                      if (!wasCompleted) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        feedback.taskComplete({
                          celebrate: true,
                          position: { x: rect.left + rect.width / 2, y: rect.top },
                        });
                      } else {
                        feedback.taskUncomplete();
                      }
                      toggleTaskComplete(task.id);
                    }}
                    className="task-checkbox"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 checkbox-checked" />
                    ) : (
                      <Circle className="w-5 h-5 checkbox-unchecked" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="task-content">
                    <div className="task-title-row">
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-badges">
                        {/* Subtask count badge */}
                        {hasSubtasks && (
                          <span className="subtask-badge">
                            <ListTree className="w-3 h-3" />
                            {subtaskStats.completed}/{subtaskStats.total}
                          </span>
                        )}
                        <span
                          className="priority-badge"
                          style={{
                            backgroundColor: `${getPriorityColor(task.priority)}20`,
                            color: getPriorityColor(task.priority),
                            borderColor: `${getPriorityColor(task.priority)}40`,
                          }}
                        >
                          <Flag className="w-3 h-3" />
                          {task.priority}
                        </span>
                        <span className={getStatusBadgeClass(task.status)}>
                          {task.status}
                        </span>
                      </div>
                    </div>

                    {/* Subtask progress bar */}
                    {hasSubtasks && (
                      <div className="subtask-progress">
                        <div
                          className="subtask-progress-fill"
                          style={{ width: `${(subtaskStats.completed / subtaskStats.total) * 100}%` }}
                        />
                      </div>
                    )}

                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}

                    <div className="task-meta">
                      {project && (
                        <>
                          <div className="task-meta-item">
                            <Folder className="w-4 h-4" />
                            <span>{project.name}</span>
                          </div>
                          <span className="task-meta-separator">•</span>
                        </>
                      )}
                      {task.dueDate && (
                        <>
                          <div className="task-meta-item">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        </>
                      )}
                      {task.estimatedTime > 0 && (
                        <>
                          <span className="task-meta-separator">•</span>
                          <div className="task-meta-item">
                            <Clock className="w-4 h-4" />
                            <span>{(task.estimatedTime / 3600).toFixed(1)}h</span>
                          </div>
                        </>
                      )}
                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div className="task-tags">
                        <Tag className="w-3 h-3" />
                        {task.tags.map((tag, index) => (
                          <span key={index} className="task-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="task-actions">
                    <button
                      onClick={() => setAddingSubtaskTo(addingSubtaskTo === task.id ? null : task.id)}
                      className="task-action-btn subtask"
                      title="Add subtask"
                    >
                      <ListTree className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="task-action-btn edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="task-action-btn delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add Subtask Form */}
                {addingSubtaskTo === task.id && (
                  <div className="add-subtask-form">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Enter subtask title..."
                      className="subtask-input"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask(task.id)}
                    />
                    <button
                      onClick={() => handleAddSubtask(task.id)}
                      className="subtask-add-btn"
                      disabled={!newSubtaskTitle.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setAddingSubtaskTo(null);
                        setNewSubtaskTitle('');
                      }}
                      className="subtask-cancel-btn"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Subtasks List */}
                {isExpanded && hasSubtasks && (
                  <div className="subtasks-list">
                    {subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className={`subtask-item ${subtask.status === 'completed' ? 'completed' : ''}`}
                      >
                        <button
                          onClick={(e) => handleToggleSubtask(subtask.id, subtask.status === 'completed', e)}
                          className="subtask-checkbox"
                        >
                          {subtask.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 checkbox-checked" />
                          ) : (
                            <Circle className="w-4 h-4 checkbox-unchecked" />
                          )}
                        </button>
                        <span className={`subtask-title ${subtask.status === 'completed' ? 'completed' : ''}`}>
                          {subtask.title}
                        </span>
                        <button
                          onClick={() => handleDeleteSubtask(subtask.id)}
                          className="subtask-delete-btn"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingTask && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit Task</h3>

            <form onSubmit={handleSubmitEdit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Task Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title"
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
                    placeholder="Describe the task"
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label>Project</label>
                  <select
                    value={formData.projectId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, projectId: e.target.value || null })
                    }
                    className="form-select"
                  >
                    <option value="">No Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-row form-row-2">
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

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Estimated Time (hours)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={(formData.estimatedTime / 3600).toFixed(1)}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedTime: parseFloat(e.target.value) * 3600 })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tags</label>
                  <div className="tags-input-wrapper">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add a tag and press Enter"
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="add-tag-btn"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="tags-list">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="tag-chip">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="tag-remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
