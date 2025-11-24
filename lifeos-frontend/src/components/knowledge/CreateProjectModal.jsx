/**
 * Create Project Modal - Quick Capture for Projects
 * Cosmic-themed modal for creating new projects
 */

import React, { useState } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import { X, Rocket, Target, Calendar } from 'lucide-react';

export default function CreateProjectModal({ onClose }) {
  const { createProject } = useKnowledgeStore();
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    status: 'nebula',
    targetDate: '',
    tags: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a project title');
      return;
    }

    const tagsArray = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    createProject({
      title: formData.title,
      goal: formData.goal,
      status: formData.status,
      targetDate: formData.targetDate || null,
      tags: tagsArray,
    });

    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#12101a] border border-purple-500/30 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-purple-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Rocket className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create New Project</h2>
                <p className="text-sm text-white/60">Launch a new mission into the cosmos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Launch Personal Website, Learn React..."
              className="w-full px-4 py-3 bg-[#1a1724]/50 border border-white/15 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
              autoFocus
            />
          </div>

          {/* Project Goal */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Goal / Objective</span>
              </div>
            </label>
            <textarea
              value={formData.goal}
              onChange={(e) => handleChange('goal', e.target.value)}
              placeholder="What do you want to achieve with this project?"
              rows={3}
              className="w-full px-4 py-3 bg-[#1a1724]/50 border border-white/15 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
            />
          </div>

          {/* Initial Status */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Initial Stage
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleChange('status', 'nebula')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.status === 'nebula'
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-white/15 bg-[#1a1724]/30 text-white/60 hover:border-zinc-600'
                }`}
              >
                <div className="text-sm font-semibold">Nebula</div>
                <div className="text-xs text-white/50 mt-1">Planning</div>
              </button>
              <button
                type="button"
                onClick={() => handleChange('status', 'nova')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.status === 'nova'
                    ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                    : 'border-white/15 bg-[#1a1724]/30 text-white/60 hover:border-zinc-600'
                }`}
              >
                <div className="text-sm font-semibold">Nova</div>
                <div className="text-xs text-white/50 mt-1">Active</div>
              </button>
              <button
                type="button"
                onClick={() => handleChange('status', 'cosmos')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.status === 'cosmos'
                    ? 'border-green-500 bg-green-500/20 text-green-300'
                    : 'border-white/15 bg-[#1a1724]/30 text-white/60 hover:border-zinc-600'
                }`}
              >
                <div className="text-sm font-semibold">Cosmos</div>
                <div className="text-xs text-white/50 mt-1">Complete</div>
              </button>
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Target Completion Date</span>
              </div>
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => handleChange('targetDate', e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1724]/50 border border-white/15 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="work, personal, learning (comma separated)"
              className="w-full px-4 py-3 bg-[#1a1724]/50 border border-white/15 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#1a1724] hover:bg-[#221e2e] text-zinc-300 rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/30"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
