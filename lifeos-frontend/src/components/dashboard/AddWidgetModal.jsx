import React, { useState } from 'react';
import { X, Plus, Check, Search } from 'lucide-react';
import useDashboardStore, {
  DASHBOARD_WIDGETS,
  WIDGET_CATEGORIES,
} from '../../stores/dashboardStore';
import { WIDGET_COMPONENTS } from './widgets';

export default function AddWidgetModal({ isOpen, onClose }) {
  const { widgetVisibility, toggleWidget } = useDashboardStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  // Get available widgets (widgets that have a component and are not visible)
  const availableWidgets = Object.entries(DASHBOARD_WIDGETS)
    .filter(([id, widget]) => {
      // Must have a component implementation
      if (!WIDGET_COMPONENTS[id]) return false;

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          widget.name.toLowerCase().includes(query) ||
          widget.description.toLowerCase().includes(query)
        );
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        return widget.category === selectedCategory;
      }

      return true;
    })
    .map(([id, widget]) => ({ id, ...widget }));

  // Separate into visible and hidden widgets
  const visibleWidgets = availableWidgets.filter(w => widgetVisibility[w.id]);
  const hiddenWidgets = availableWidgets.filter(w => !widgetVisibility[w.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Add Widgets</h2>
            <p className="text-xs text-white/60 mt-0.5">
              Customize your dashboard with widgets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-white/10 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search widgets..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              All
            </button>
            {Object.entries(WIDGET_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedCategory === key
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Widget List */}
        <div className="p-4 overflow-y-auto max-h-[400px]">
          {/* Hidden Widgets (Available to Add) */}
          {hiddenWidgets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Available Widgets
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {hiddenWidgets.map((widget) => (
                  <button
                    key={widget.id}
                    onClick={() => toggleWidget(widget.id)}
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all group"
                  >
                    <span className="text-2xl">{widget.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                        {widget.name}
                      </p>
                      <p className="text-xs text-white/50">{widget.description}</p>
                    </div>
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                      <Plus className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Visible Widgets (Already Added) */}
          {visibleWidgets.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Active Widgets
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {visibleWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl"
                  >
                    <span className="text-2xl">{widget.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">
                        {widget.name}
                      </p>
                      <p className="text-xs text-white/50">{widget.description}</p>
                    </div>
                    <button
                      onClick={() => toggleWidget(widget.id)}
                      className="p-2 bg-green-500/20 rounded-lg text-green-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                      title="Remove from dashboard"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {availableWidgets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/60 text-sm">No widgets match your search</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-between items-center">
          <p className="text-xs text-white/40">
            {visibleWidgets.length} widget{visibleWidgets.length !== 1 ? 's' : ''} active
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
