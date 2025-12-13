/**
 * Create Guild Modal
 * Form for creating a new guild
 */

import React, { useState } from 'react';
import {
  X,
  Shield,
  Globe,
  Lock,
  Users,
  FileText,
  Loader2,
} from 'lucide-react';
import { useSocialStore } from '../../stores/socialStore';

const PRIVACY_OPTIONS = [
  {
    id: 'open',
    label: 'Open',
    description: 'Anyone can join',
    icon: Globe,
  },
  {
    id: 'apply',
    label: 'Apply to Join',
    description: 'Members must apply',
    icon: Users,
  },
  {
    id: 'invite_only',
    label: 'Invite Only',
    description: 'By invitation only',
    icon: Lock,
  },
];

const GUILD_ICONS = ['🛡️', '⚔️', '🏰', '🎯', '🔥', '⭐', '💎', '🚀', '🎮', '👑'];

export default function CreateGuildModal({ isOpen, onClose }) {
  const { createGuild } = useSocialStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'open',
    icon: '🛡️',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Guild name is required');
      return;
    }

    if (formData.name.length < 3) {
      setError('Guild name must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createGuild(
      formData.name.trim(),
      formData.description.trim(),
      formData.privacy
    );

    setLoading(false);

    if (result.error) {
      setError(result.error.message || 'Failed to create guild');
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      privacy: 'open',
      icon: '🛡️',
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Create Guild
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* Guild Icon */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Guild Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {GUILD_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-11 h-11 rounded-lg text-xl flex items-center justify-center transition-all ${
                    formData.icon === icon
                      ? 'bg-green-500/30 ring-2 ring-green-500'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Guild Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Guild Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Productivity Warriors"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
              maxLength={30}
              autoFocus
            />
            <p className="text-xs text-white/40 mt-1">
              {formData.name.length}/30 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is your guild about? What are your goals?"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-white/40 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Privacy Setting
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRIVACY_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, privacy: option.id })}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      formData.privacy === option.id
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-white/40 mt-2">
              {PRIVACY_OPTIONS.find(o => o.id === formData.privacy)?.description}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Preview */}
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
            <p className="text-xs text-white/50 mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl">
                {formData.icon}
              </div>
              <div>
                <h4 className="font-semibold text-white">
                  {formData.name || 'Guild Name'}
                </h4>
                <p className="text-sm text-white/60">
                  {PRIVACY_OPTIONS.find(o => o.id === formData.privacy)?.label} · 1 member
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Create Guild
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
