import React from 'react';
import { X, RotateCcw, Check, Eye, EyeOff } from 'lucide-react';
import useDashboardStore, {
  DASHBOARD_WIDGETS,
  WIDGET_CATEGORIES,
  DASHBOARD_PRESETS,
} from '../../stores/dashboardStore';

export default function DashboardSettingsModal() {
  const {
    isSettingsOpen,
    closeSettings,
    widgetVisibility,
    toggleWidget,
    currentPreset,
    applyPreset,
    resetToDefaults,
  } = useDashboardStore();

  if (!isSettingsOpen) return null;

  // Group widgets by category
  const widgetsByCategory = Object.values(DASHBOARD_WIDGETS).reduce((acc, widget) => {
    const category = widget.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(widget);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Customize Dashboard</h2>
          <button
            onClick={closeSettings}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-130px)]">
          {/* Preset Layouts */}
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white/60 mb-3">Quick Presets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(DASHBOARD_PRESETS).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    currentPreset === preset.id
                      ? 'bg-purple-500/20 border-purple-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-sm font-medium text-white">{preset.name}</span>
                    {currentPreset === preset.id && (
                      <Check className="w-4 h-4 text-purple-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-white/50">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Widget Toggles by Category */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/60">Widgets</h3>
              {currentPreset === null && (
                <span className="text-xs text-purple-400 px-2 py-0.5 bg-purple-500/20 rounded-full">
                  Custom
                </span>
              )}
            </div>

            <div className="space-y-4">
              {Object.entries(WIDGET_CATEGORIES).map(([categoryId, category]) => {
                const widgets = widgetsByCategory[categoryId];
                if (!widgets || widgets.length === 0) return null;

                return (
                  <div key={categoryId}>
                    <h4 className={`text-xs font-medium ${category.color} mb-2`}>
                      {category.name}
                    </h4>
                    <div className="space-y-1">
                      {widgets.map((widget) => {
                        const isVisible = widgetVisibility[widget.id];
                        return (
                          <button
                            key={widget.id}
                            onClick={() => toggleWidget(widget.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                              isVisible
                                ? 'bg-white/5 border border-white/10'
                                : 'bg-transparent border border-transparent hover:bg-white/5'
                            }`}
                          >
                            <span className="text-xl">{widget.icon}</span>
                            <div className="flex-1 text-left">
                              <div className={`text-sm font-medium ${isVisible ? 'text-white' : 'text-white/50'}`}>
                                {widget.name}
                              </div>
                              <div className="text-xs text-white/40">{widget.description}</div>
                            </div>
                            <div className={`p-1.5 rounded-lg ${isVisible ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                              {isVisible ? (
                                <Eye className="w-4 h-4 text-purple-400" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-white/30" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#0c0a10]/50">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </button>
          <button
            onClick={closeSettings}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
