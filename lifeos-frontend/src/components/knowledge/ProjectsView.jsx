/**
 * Projects View - Cosmic Project Planning System
 * "Stellar Pipeline" - Kanban-style project visualisation
 */

import React, { useState } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import { Rocket, Plus, Calendar, Target, Sparkles, Trash2 } from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';
import ProjectDetailView from './ProjectDetailView';

export default function ProjectsView() {
  const { projects, updateProject, deleteProject } = useKnowledgeStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Show detail view if a project is selected
  if (selectedProjectId) {
    return (
      <ProjectDetailView
        projectId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  // Group projects by status
  const nebulaProjects = projects.filter((p) => p.status === 'nebula');
  const novaProjects = projects.filter((p) => p.status === 'nova');
  const cosmosProjects = projects.filter((p) => p.status === 'cosmos');

  const handleMoveProject = (projectId, newStatus) => {
    updateProject(projectId, { status: newStatus });
  };

  const handleDeleteProject = (projectId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Stellar Pipeline</h2>
            <p className="text-white/60 text-sm">
              Projects evolve through cosmic stages: Nebula (planning) → Nova (active) → Cosmos (complete)
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </button>
        </div>
      </div>

      {/* Stellar Pipeline - 3 Column Kanban */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6 overflow-auto lg:overflow-hidden">
        {/* Nebula Column - Ideas/Planning */}
        <PipelineColumn
          title="Nebula"
          subtitle="Ideas & Planning"
          color="#8b5cf6"
          icon={<Sparkles className="w-5 h-5" />}
          projects={nebulaProjects}
          onMoveProject={handleMoveProject}
          onDeleteProject={handleDeleteProject}
          onSelectProject={setSelectedProjectId}
        />

        {/* Nova Column - Active */}
        <PipelineColumn
          title="Nova"
          subtitle="Active & In Progress"
          color="#f59e0b"
          icon={<Rocket className="w-5 h-5" />}
          projects={novaProjects}
          onMoveProject={handleMoveProject}
          onDeleteProject={handleDeleteProject}
          onSelectProject={setSelectedProjectId}
        />

        {/* Cosmos Column - Complete */}
        <PipelineColumn
          title="Cosmos"
          subtitle="Completed"
          color="#10b981"
          icon={<Target className="w-5 h-5" />}
          projects={cosmosProjects}
          onMoveProject={handleMoveProject}
          onDeleteProject={handleDeleteProject}
          onSelectProject={setSelectedProjectId}
        />
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

/**
 * Pipeline Column Component
 */
function PipelineColumn({ title, subtitle, color, icon, projects, onMoveProject, onDeleteProject, onSelectProject }) {
  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div
        className="p-4 rounded-t-lg border-2 border-b-0"
        style={{
          borderColor: color,
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div style={{ color }}>{icon}</div>
          <h3 className="text-lg font-bold" style={{ color }}>
            {title}
          </h3>
          <span className="ml-auto text-sm text-white/50 bg-[#12101a]/50 px-2 py-0.5 rounded">
            {projects.length}
          </span>
        </div>
        <p className="text-xs text-white/50">{subtitle}</p>
      </div>

      {/* Projects List */}
      <div
        className="flex-1 p-4 border-2 border-t-0 rounded-b-lg overflow-y-auto space-y-3"
        style={{ borderColor: color + '40', backgroundColor: '#0a0a0a' }}
      >
        {projects.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-sm">
            No projects yet
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              color={color}
              onMove={onMoveProject}
              onDelete={onDeleteProject}
              onSelect={onSelectProject}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Project Card Component
 */
function ProjectCard({ project, color, onMove, onDelete, onSelect }) {
  const [showActions, setShowActions] = useState(false);

  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div
      className="bg-[#12101a]/60 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-purple-500/50 transition-all duration-200 cursor-pointer group relative"
      onClick={() => onSelect(project.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Delete Button */}
      {showActions && (
        <button
          onClick={(e) => onDelete(project.id, e)}
          className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all z-10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Project Title */}
      <h4 className="text-white font-semibold mb-2 pr-8">{project.title}</h4>

      {/* Project Goal */}
      {project.goal && (
        <p className="text-xs text-white/60 mb-3 line-clamp-2">{project.goal}</p>
      )}

      {/* Tasks Progress */}
      {totalTasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-white/50 mb-1">
            <span>Tasks</span>
            <span>
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#1a1724] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}80`,
              }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[#1a1724]/50 text-white/50 text-xs rounded"
            >
              #{tag}
            </span>
          ))}
          {project.tags.length > 2 && (
            <span className="px-2 py-0.5 text-zinc-600 text-xs">
              +{project.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Target Date */}
      {project.targetDate && (
        <div className="flex items-center gap-1 text-xs text-white/50">
          <Calendar className="w-3 h-3" />
          <span>{new Date(project.targetDate).toLocaleDateString()}</span>
        </div>
      )}

      {/* Move Actions */}
      {showActions && (
        <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
          {project.status !== 'nebula' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newStatus = project.status === 'cosmos' ? 'nova' : 'nebula';
                onMove(project.id, newStatus);
              }}
              className="flex-1 px-2 py-1 bg-[#1a1724] hover:bg-[#221e2e] text-zinc-300 text-xs rounded transition-all"
            >
              ← Move Back
            </button>
          )}
          {project.status !== 'cosmos' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newStatus = project.status === 'nebula' ? 'nova' : 'cosmos';
                onMove(project.id, newStatus);
              }}
              className="flex-1 px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs rounded transition-all"
            >
              Move Forward →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
