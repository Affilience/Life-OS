import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useNavigate } from 'react-router-dom';
import { Settings, Move, Check, Undo2, Redo2, Plus, LayoutGrid, Home } from 'lucide-react';
import useDashboardStore, { DASHBOARD_WIDGETS } from '../stores/dashboardStore';
import PageHeader from '../components/shared/PageHeader';
import DashboardSettingsModal from '../components/dashboard/DashboardSettingsModal';
import AddWidgetModal from '../components/dashboard/AddWidgetModal';
import { WidgetWrapper, WIDGET_COMPONENTS } from '../components/dashboard/widgets';

// Import react-grid-layout styles
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../components/dashboard/DashboardGrid.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardNew() {
  const navigate = useNavigate();
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
    <div className={`min-h-screen bg-bg-0 pb-20 ${isEditMode ? 'dashboard-edit-mode' : ''}`}>
      {/* Dashboard Settings Modal */}
      <DashboardSettingsModal />

      {/* Toast Notification */}
      {toast && (
        <div className={`
          fixed top-20 left-1/2 -translate-x-1/2 z-50
          px-4 py-2 rounded-lg shadow-lg
          animate-fade-in-down
          ${toast.type === 'success' ? 'bg-success/90' : 'bg-primary-500/90'}
          text-text-primary text-sm font-medium
        `}>
          {toast.message}
        </div>
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-bg-0/95 backdrop-blur-md border-b border-border-subtle">
        <div className="px-4 py-3 flex items-center justify-between">
          <PageHeader
            title="Dashboard"
            subtitle="Your personal command center"
            icon={Home}
            module="default"
            variant="elevated"
            className="mb-0 flex-1"
          />
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
                      ? 'text-text-secondary hover:bg-bg-hover hover:text-text-primary hover:-translate-y-0.5 active:translate-y-0'
                      : 'text-text-muted cursor-not-allowed'
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
                      ? 'text-text-secondary hover:bg-bg-hover hover:text-text-primary hover:-translate-y-0.5 active:translate-y-0'
                      : 'text-text-muted cursor-not-allowed'
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
                  className="p-2 rounded-lg transition-all duration-150 text-text-secondary hover:bg-bg-hover hover:text-text-primary hover:-translate-y-0.5 active:translate-y-0"
                  title="Compact Layout (remove gaps)"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
              </>
            )}

            {/* Edit Mode Toggle */}
            <button
              onClick={toggleEditMode}
              data-tour="edit-dashboard-btn"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isEditMode
                  ? 'bg-primary-500 text-text-primary shadow-lg shadow-primary hover:bg-primary-600 hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-bg-2 text-text-secondary hover:bg-bg-hover hover:text-text-primary hover:-translate-y-0.5 active:translate-y-0'
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

            {/* Settings Button - navigates to Settings page */}
            <button
              onClick={() => navigate('/settings')}
              data-tour="settings-btn"
              className="p-2 hover:bg-bg-hover rounded-lg transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 text-text-secondary hover:text-text-primary"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Mode Banner */}
      {isEditMode && (
        <div className="bg-gradient-to-r from-primary-500/20 via-secondary/20 to-primary-500/20 border-b border-primary-500/30 px-6 py-2.5">
          <p className="text-sm text-primary-200 text-center flex items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              Edit Mode
            </span>
            <span className="text-primary-300/70">•</span>
            <span>Drag to move</span>
            <span className="text-primary-300/70">•</span>
            <span>Corners to resize</span>
            <span className="text-primary-300/70">•</span>
            <span className="hidden sm:inline">Ctrl+Z to undo</span>
          </p>
        </div>
      )}

      {/* Grid Layout */}
      <div className="px-4 pt-2 pb-4">
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
            // Ensure minW doesn't exceed 1 for responsive layouts (sm has 1 col)
            const minW = 1;

            return (
              <div
                key={widgetId}
                data-grid={{
                  // Provide default x, y, w, h values to prevent undefined errors
                  x: existingLayout?.x ?? 0,
                  y: existingLayout?.y ?? (index * defaultH),
                  w: existingLayout?.w ?? defaultW,
                  h: existingLayout?.h ?? defaultH,
                  minW,
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
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary/20 flex items-center justify-center mb-6 border border-primary-500/20">
              <Plus className="w-10 h-10 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Your dashboard is empty</h3>
            <p className="text-sm text-text-secondary mb-6 max-w-sm">
              Add widgets to customize your dashboard and see your stats at a glance
            </p>
            <button
              onClick={() => setIsAddWidgetOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-secondary hover:from-primary-600 hover:to-secondary text-text-primary text-sm font-medium rounded-xl transition-all duration-150 shadow-lg shadow-primary hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0"
            >
              Add Widgets
            </button>
          </div>
        )}

        {/* Add Widget Button (floating) */}
        <button
          onClick={() => setIsAddWidgetOpen(true)}
          data-tour="add-widget-btn"
          className="fixed bottom-24 right-6 p-4 bg-gradient-to-r from-primary-500 to-secondary text-text-primary rounded-full shadow-lg shadow-primary hover:shadow-glow hover:scale-110 hover:-translate-y-1 active:scale-100 active:translate-y-0 transition-all duration-150 z-20"
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
