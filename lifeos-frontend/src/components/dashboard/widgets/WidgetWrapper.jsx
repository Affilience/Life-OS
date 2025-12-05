import React, { useState } from 'react';
import { GripVertical, X, Maximize2, Minimize2 } from 'lucide-react';
import useDashboardStore, { DASHBOARD_WIDGETS } from '../../../stores/dashboardStore';

export default function WidgetWrapper({ widgetId, children, className = '' }) {
  const { isEditMode, toggleWidget } = useDashboardStore();
  const widget = DASHBOARD_WIDGETS[widgetId];
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={`relative h-full group ${className} ${isDragging ? 'z-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit mode UI */}
      {isEditMode && (
        <>
          {/* Drag handle - always visible in edit mode */}
          <div
            className={`
              drag-handle absolute top-0 left-0 right-0 h-9 z-20
              flex items-center justify-between px-3
              rounded-t-xl transition-all duration-200
              ${isDragging
                ? 'bg-purple-500/40 backdrop-blur-sm'
                : isHovered
                  ? 'bg-purple-500/30 backdrop-blur-sm'
                  : 'bg-gradient-to-b from-purple-500/20 to-transparent'
              }
            `}
            onMouseDown={(e) => {
              // Only set dragging if we're not clicking on a button
              if (e.target.closest('button')) return;
              setIsDragging(true);
            }}
            onMouseUp={() => setIsDragging(false)}
          >
            {/* Left side - drag indicator */}
            <div className="flex items-center gap-2">
              <div className={`
                p-1 rounded transition-all duration-200
                ${isDragging ? 'bg-purple-500/50 scale-110' : 'bg-transparent'}
              `}>
                <GripVertical className={`
                  w-4 h-4 transition-colors duration-200
                  ${isDragging ? 'text-white' : 'text-purple-400'}
                `} />
              </div>
              <span className={`
                text-xs font-medium transition-all duration-200
                ${isDragging ? 'text-white' : 'text-purple-300'}
              `}>
                {widget?.name || widgetId}
              </span>
            </div>

            {/* Right side - actions - outside drag handle to prevent event issues */}
            <div
              className="flex items-center gap-1"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Removing widget:', widgetId);
                  toggleWidget(widgetId);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-1.5 hover:bg-red-500/30 rounded-lg transition-all duration-200 group/remove cursor-pointer z-50"
                title="Remove widget"
                type="button"
              >
                <X className="w-3.5 h-3.5 text-white/60 group-hover/remove:text-red-400 transition-colors pointer-events-none" />
              </button>
            </div>
          </div>

          {/* Edit mode border with animated gradient */}
          <div className={`
            absolute inset-0 rounded-xl pointer-events-none transition-all duration-300
            ${isDragging
              ? 'border-2 border-purple-500 shadow-lg shadow-purple-500/20'
              : isHovered
                ? 'border-2 border-dashed border-purple-500/50'
                : 'border-2 border-dashed border-purple-500/20'
            }
          `} />

          {/* Resize indicator corners - visual hint */}
          {isHovered && !isDragging && (
            <>
              <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-purple-400/60 rounded-br pointer-events-none" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-purple-400/60 rounded-bl pointer-events-none" />
              <div className="absolute top-10 right-1 w-3 h-3 border-r-2 border-t-2 border-purple-400/60 rounded-tr pointer-events-none" />
              <div className="absolute top-10 left-1 w-3 h-3 border-l-2 border-t-2 border-purple-400/60 rounded-tl pointer-events-none" />
            </>
          )}
        </>
      )}

      {/* Widget content */}
      <div className={`
        h-full overflow-hidden rounded-xl transition-all duration-200
        ${isEditMode ? 'pt-9' : ''}
        ${isEditMode && isDragging ? 'opacity-90 scale-[0.98]' : ''}
      `}>
        {children}
      </div>
    </div>
  );
}
