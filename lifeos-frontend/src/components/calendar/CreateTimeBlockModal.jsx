/**
 * Create Time Block Modal - Quick capture for scheduling time blocks
 * Cosmic-themed modal with all essential fields from research
 */

import React, { useState } from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import {
  X,
  Clock,
  Zap,
  Target,
  Calendar,
  Tag,
  AlertTriangle,
} from 'lucide-react';

export default function CreateTimeBlockModal({ initialData, onClose }) {
  const { createTimeBlock } = useCalendarStore();

  const [formData, setFormData] = useState({
    title: '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    startTime: initialData?.startTime || '09:00',
    endTime: initialData?.endTime || '10:00',
    module: 'productivity',
    type: 'deep_work',
    priority: 'medium',
    energyLevel: 'medium',
    notes: '',
    tags: '',
  });

  const modules = [
    { id: 'productivity', label: 'Productivity', color: '#3b82f6', icon: '💼' },
    { id: 'health', label: 'Health & Fitness', color: '#ef4444', icon: '💪' },
    { id: 'knowledge', label: 'Knowledge', color: '#f59e0b', icon: '📚' },
    { id: 'finance', label: 'Finance', color: '#10b981', icon: '💰' },
    { id: 'journal', label: 'Journal', color: '#8b5cf6', icon: '✍️' },
    { id: 'skills', label: 'Skills', color: '#ec4899', icon: '🎯' },
    { id: 'calendar', label: 'Personal', color: '#06b6d4', icon: '🌟' },
  ];

  const blockTypes = [
    { id: 'deep_work', label: 'Deep Work', description: 'Focused, uninterrupted work' },
    { id: 'shallow', label: 'Shallow Work', description: 'Admin, emails, light tasks' },
    { id: 'meeting', label: 'Meeting', description: 'Calls, discussions' },
    { id: 'learning', label: 'Learning', description: 'Study, reading, courses' },
    { id: 'break', label: 'Break', description: 'Rest, recovery' },
    { id: 'exercise', label: 'Exercise', description: 'Workout, movement' },
    { id: 'creative', label: 'Creative', description: 'Design, writing, ideation' },
  ];

  const calculateDuration = () => {
    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  const duration = calculateDuration();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (duration <= 0) {
      alert('End time must be after start time');
      return;
    }

    const tagsArray = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    createTimeBlock({
      title: formData.title,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      plannedDuration: duration,
      module: formData.module,
      type: formData.type,
      priority: formData.priority,
      energyLevel: formData.energyLevel,
      notes: formData.notes,
      tags: tagsArray,
    });

    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedModule = modules.find((m) => m.id === formData.module);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#12101a] border border-purple-500/30 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div
          className="border-b border-purple-500/30 p-6"
          style={{
            background: `linear-gradient(135deg, ${selectedModule.color}20 0%, transparent 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${selectedModule.color}20` }}
              >
                <Clock className="w-6 h-6" style={{ color: selectedModule.color }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create Time Block</h2>
                <p className="text-sm text-white/60">
                  Schedule time for focused work
                </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              What will you work on? *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Write project proposal, Code review, Gym workout..."
              className="w-full px-4 py-3 bg-[#1a1724]/50 border border-white/15 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
              autoFocus
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1724]/50 border border-white/15 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1724]/50 border border-white/15 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1724]/50 border border-white/15 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Duration indicator */}
          <div className="flex items-center gap-2 text-sm text-white/60 bg-[#1a1724]/30 rounded-lg p-3">
            <Clock className="w-4 h-4" />
            <span>Duration: {duration} minutes ({(duration / 60).toFixed(1)} hours)</span>
            {duration > 120 && (
              <div className="ml-auto flex items-center gap-1 text-orange-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Consider breaking into 90-min blocks</span>
              </div>
            )}
          </div>

          {/* Module */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Life Module
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => handleChange('module', module.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.module === module.id
                      ? 'border-current'
                      : 'border-white/15 hover:border-zinc-600'
                  }`}
                  style={{
                    backgroundColor:
                      formData.module === module.id ? `${module.color}20` : 'transparent',
                    color: formData.module === module.id ? module.color : '#9ca3af',
                  }}
                >
                  <div className="text-2xl mb-1">{module.icon}</div>
                  <div className="text-xs font-medium">{module.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Block Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Block Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {blockTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleChange('type', type.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.type === type.id
                      ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                      : 'border-white/15 bg-[#1a1724]/30 text-white/60 hover:border-zinc-600'
                  }`}
                >
                  <div className="text-sm font-semibold">{type.label}</div>
                  <div className="text-xs text-white/50 mt-0.5">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority and Energy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Priority
              </label>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {['critical', 'high', 'medium', 'low'].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handleChange('priority', priority)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.priority === priority
                        ? 'bg-purple-500/20 text-purple-300 border-2 border-purple-500'
                        : 'bg-[#1a1724]/30 text-white/60 border-2 border-white/15 hover:border-zinc-600'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Energy Required
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['high', 'medium', 'low'].map((energy) => (
                  <button
                    key={energy}
                    type="button"
                    onClick={() => handleChange('energyLevel', energy)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.energyLevel === energy
                        ? 'bg-purple-500/20 text-purple-300 border-2 border-purple-500'
                        : 'bg-[#1a1724]/30 text-white/60 border-2 border-white/15 hover:border-zinc-600'
                    }`}
                  >
                    {energy.charAt(0).toUpperCase() + energy.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional context or details..."
              rows={2}
              className="w-full px-4 py-3 bg-[#1a1724]/50 border border-white/15 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="project-alpha, urgent, review (comma separated)"
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
              Create Time Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
