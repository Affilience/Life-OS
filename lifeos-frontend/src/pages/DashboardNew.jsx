import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Settings, Move, Check, Undo2, Redo2, Plus, LayoutGrid } from 'lucide-react';
import useDashboardStore, { DASHBOARD_WIDGETS } from '../stores/dashboardStore';
import DashboardSettingsModal from '../components/dashboard/DashboardSettingsModal';
import AddWidgetModal from '../components/dashboard/AddWidgetModal';
import { WidgetWrapper, WIDGET_COMPONENTS } from '../components/dashboard/widgets';

// Import react-grid-layout styles
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../components/dashboard/DashboardGrid.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardNew() {
  const {
    layouts,
    widgetVisibility,
    isEditMode,
    toggleEditMode,
    updateLayouts,
    openSettings,
    undoLayout,
    redoLayout,
    canUndo,
    canRedo,
    compactAllLayouts,
  } = useDashboardStore();

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Add widget modal state
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Filter layouts to only include visible widgets
  const filteredLayouts = useMemo(() => {
    const result = {};
    Object.keys(layouts).forEach((breakpoint) => {
      result[breakpoint] = (layouts[breakpoint] || []).filter(
        (item) => widgetVisibility[item.i]
      );
    });
    return result;
  }, [layouts, widgetVisibility]);

  // Handle layout changes
  const handleLayoutChange = useCallback((currentLayout, allLayouts) => {
    if (isEditMode) {
      updateLayouts(allLayouts);
    }
  }, [isEditMode, updateLayouts]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditMode) return;

      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undoLayout();
          showToast('Undid layout change');
        }
      }
      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y for redo
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo()) {
          redoLayout();
          showToast('Redid layout change');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, canUndo, canRedo, undoLayout, redoLayout, showToast]);

  // Get visible widget IDs that have a corresponding component
  const visibleWidgets = useMemo(() => {
    return Object.entries(widgetVisibility)
      .filter(([id, visible]) => visible && WIDGET_COMPONENTS[id])
      .map(([id]) => id);
  }, [widgetVisibility]);

  // Generate a key for the grid layout based on visible widgets to force re-render
  const gridKey = useMemo(() => {
    return visibleWidgets.sort().join(',');
  }, [visibleWidgets]);

  return (
    <div className={`min-h-screen bg-[#0c0a10] pb-20 ${isEditMode ? 'dashboard-edit-mode' : ''}`}>
      {/* Dashboard Settings Modal */}
      <DashboardSettingsModal />

      {/* Toast Notification */}
      {toast && (
        <div className={`
          fixed top-20 left-1/2 -translate-x-1/2 z-50
          px-4 py-2 rounded-lg shadow-lg
          animate-fade-in-down
          ${toast.type === 'success' ? 'bg-green-500/90' : 'bg-purple-500/90'}
          text-white text-sm font-medium
        `}>
          {toast.message}
        </div>
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#0c0a10]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-2">
            {/* Undo/Redo buttons (only in edit mode) */}
            {isEditMode && (
              <>
                <button
                  onClick={() => {
                    if (canUndo()) {
                      undoLayout();
                      showToast('Undid layout change');
                    }
                  }}
                  disabled={!canUndo()}
                  className={`p-2 rounded-lg transition-all duration-150 ${
                    canUndo()
                      ? 'text-white/60 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 active:translate-y-0'
                      : 'text-white/20 cursor-not-allowed'
                  }`}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (canRedo()) {
                      redoLayout();
                      showToast('Redid layout change');
                    }
                  }}
                  disabled={!canRedo()}
                  className={`p-2 rounded-lg transition-all duration-150 ${
                    canRedo()
                      ? 'text-white/60 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 active:translate-y-0'
                      : 'text-white/20 cursor-not-allowed'
                  }`}
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    compactAllLayouts();
                    showToast('Layout compacted');
                  }}
                  className="p-2 rounded-lg transition-all duration-150 text-white/60 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 active:translate-y-0"
                  title="Compact Layout (remove gaps)"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" />
              </>
            )}

            {/* Edit Mode Toggle */}
            <button
              onClick={toggleEditMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isEditMode
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-600 hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {isEditMode ? (
                <>
                  <Check className="w-4 h-4" />
                  Done
                </>
              ) : (
                <>
                  <Move className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={openSettings}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 text-white/60 hover:text-white"
              title="Customize Dashboard"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Mode Banner */}
      {isEditMode && (
        <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border-b border-purple-500/30 px-6 py-2.5">
          <p className="text-sm text-purple-200 text-center flex items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Edit Mode
            </span>
            <span className="text-purple-300/70">•</span>
            <span>Drag to move</span>
            <span className="text-purple-300/70">•</span>
            <span>Corners to resize</span>
            <span className="text-purple-300/70">•</span>
            <span className="hidden sm:inline">Ctrl+Z to undo</span>
          </p>
        </div>
      )}

      {/* Grid Layout */}
      <div className="px-4 pt-6 pb-4">
        <ResponsiveGridLayout
          key={gridKey}
          className="layout"
          layouts={filteredLayouts}
          breakpoints={{ lg: 1200, md: 768, sm: 480 }}
          cols={{ lg: 4, md: 2, sm: 1 }}
          rowHeight={100}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          resizeHandles={['se', 'sw', 'ne', 'nw']}
          useCSSTransforms={true}
          compactType="vertical"
          preventCollision={false}
        >
          {visibleWidgets.map((widgetId, index) => {
            const WidgetComponent = WIDGET_COMPONENTS[widgetId];
            const widgetConfig = DASHBOARD_WIDGETS[widgetId];

            if (!WidgetComponent) return null;

            // Find existing layout entry or create default
            const existingLayout = (layouts.lg || []).find(item => item.i === widgetId);
            const defaultW = Math.min(widgetConfig?.minW || 2, 4);
            const defaultH = widgetConfig?.minH || 2;

            return (
              <div
                key={widgetId}
                data-grid={{
                  // Provide default x, y, w, h values to prevent undefined errors
                  x: existingLayout?.x ?? 0,
                  y: existingLayout?.y ?? (index * defaultH),
                  w: existingLayout?.w ?? defaultW,
                  h: existingLayout?.h ?? defaultH,
                  minW: widgetConfig?.minW || 1,
                  minH: widgetConfig?.minH || 1,
                  maxH: widgetConfig?.maxH || 10,
                }}
              >
                <WidgetWrapper widgetId={widgetId}>
                  <WidgetComponent />
                </WidgetWrapper>
              </div>
            );
          })}
        </ResponsiveGridLayout>

        {/* Empty State */}
        {visibleWidgets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center dashboard-empty-state">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-purple-500/20">
              <Plus className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Your dashboard is empty</h3>
            <p className="text-sm text-white/60 mb-6 max-w-sm">
              Add widgets to customize your dashboard and see your stats at a glance
            </p>
            <button
              onClick={() => setIsAddWidgetOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium rounded-xl transition-all duration-150 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              Add Widgets
            </button>
          </div>
        )}

        {/* Add Widget Button (floating) */}
        <button
          onClick={() => setIsAddWidgetOpen(true)}
          className="fixed bottom-24 right-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 hover:-translate-y-1 active:scale-100 active:translate-y-0 transition-all duration-150 z-20"
          title="Add Widget"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Add Widget Modal */}
      <AddWidgetModal
        isOpen={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
      />

      {/* Add fade-in animation */}
      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 200ms ease-out;
        }
      `}</style>
    </div>
  );
}
