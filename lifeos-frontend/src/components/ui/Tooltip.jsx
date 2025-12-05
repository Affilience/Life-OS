/**
 * Tooltip System
 *
 * A smart tooltip system with:
 * - Auto-positioning (flip when near edges)
 * - Rich content support (not just text)
 * - Keyboard accessible
 * - Delay on show/hide
 * - Multiple trigger modes (hover, click, focus)
 */

import React, { useState, useRef, useCallback, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

// Tooltip Context for global settings
const TooltipContext = createContext({
  showDelay: 300,
  hideDelay: 100,
});

/**
 * TooltipProvider - Optional wrapper for global tooltip settings
 */
export function TooltipProvider({ children, showDelay = 300, hideDelay = 100 }) {
  return (
    <TooltipContext.Provider value={{ showDelay, hideDelay }}>
      {children}
    </TooltipContext.Provider>
  );
}

/**
 * Calculate tooltip position
 */
function calculatePosition(triggerRect, tooltipRect, placement, offset = 8) {
  const positions = {
    top: {
      x: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      y: triggerRect.top - tooltipRect.height - offset,
    },
    bottom: {
      x: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      y: triggerRect.bottom + offset,
    },
    left: {
      x: triggerRect.left - tooltipRect.width - offset,
      y: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
    },
    right: {
      x: triggerRect.right + offset,
      y: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
    },
  };

  let pos = positions[placement];
  let actualPlacement = placement;

  // Flip if out of viewport
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Horizontal overflow check
  if (pos.x < 8) {
    if (placement === 'left') {
      pos = positions.right;
      actualPlacement = 'right';
    } else {
      pos.x = 8;
    }
  } else if (pos.x + tooltipRect.width > viewport.width - 8) {
    if (placement === 'right') {
      pos = positions.left;
      actualPlacement = 'left';
    } else {
      pos.x = viewport.width - tooltipRect.width - 8;
    }
  }

  // Vertical overflow check
  if (pos.y < 8) {
    if (placement === 'top') {
      pos = positions.bottom;
      actualPlacement = 'bottom';
    } else {
      pos.y = 8;
    }
  } else if (pos.y + tooltipRect.height > viewport.height - 8) {
    if (placement === 'bottom') {
      pos = positions.top;
      actualPlacement = 'top';
    } else {
      pos.y = viewport.height - tooltipRect.height - 8;
    }
  }

  return { ...pos, placement: actualPlacement };
}

/**
 * Tooltip Component
 */
export function Tooltip({
  children,
  content,
  placement = 'top',
  trigger = 'hover',
  showDelay: propShowDelay,
  hideDelay: propHideDelay,
  disabled = false,
  className = '',
  contentClassName = '',
  arrow = true,
  maxWidth = 250,
}) {
  const context = useContext(TooltipContext);
  const showDelay = propShowDelay ?? context.showDelay;
  const hideDelay = propHideDelay ?? context.hideDelay;

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, placement });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Update position when tooltip opens
  useEffect(() => {
    if (isOpen && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const newPosition = calculatePosition(triggerRect, tooltipRect, placement);
      setPosition(newPosition);
    }
  }, [isOpen, placement, content]);

  const show = useCallback(() => {
    if (disabled) return;
    clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, showDelay);
  }, [disabled, showDelay]);

  const hide = useCallback(() => {
    clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, hideDelay);
  }, [hideDelay]);

  const toggle = useCallback(() => {
    if (isOpen) {
      hide();
    } else {
      show();
    }
  }, [isOpen, show, hide]);

  // Event handlers based on trigger type
  const triggerProps = {};

  if (trigger === 'hover' || trigger === 'both') {
    triggerProps.onMouseEnter = show;
    triggerProps.onMouseLeave = hide;
  }

  if (trigger === 'focus' || trigger === 'both') {
    triggerProps.onFocus = show;
    triggerProps.onBlur = hide;
  }

  if (trigger === 'click') {
    triggerProps.onClick = toggle;
  }

  // Arrow positioning
  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  };

  if (!content) return children;

  return (
    <>
      {/* Trigger element */}
      {React.cloneElement(children, {
        ref: triggerRef,
        ...triggerProps,
        'aria-describedby': isOpen ? 'tooltip' : undefined,
      })}

      {/* Tooltip portal */}
      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            id="tooltip"
            role="tooltip"
            className={`
              fixed z-[9999] pointer-events-none
              animate-fade-in
              ${className}
            `}
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            <div
              className={`
                px-3 py-2 rounded-lg text-sm
                bg-[var(--bg-elevated,#2a2538)] border border-white/10
                text-white/90 shadow-lg shadow-black/30
                ${contentClassName}
              `}
              style={{ maxWidth }}
            >
              {content}
            </div>

            {/* Arrow */}
            {arrow && (
              <div
                className={`
                  absolute w-0 h-0
                  border-4 border-[var(--bg-elevated,#2a2538)]
                  ${arrowClasses[position.placement]}
                `}
              />
            )}
          </div>,
          document.body
        )}
    </>
  );
}

/**
 * InfoTooltip - Icon with tooltip for info/help text
 */
export function InfoTooltip({ content, size = 16, className = '' }) {
  return (
    <Tooltip content={content}>
      <button
        type="button"
        className={`
          inline-flex items-center justify-center rounded-full
          text-white/40 hover:text-white/60 transition-colors
          focus:outline-none focus:ring-2 focus:ring-violet-500/50
          ${className}
        `}
        aria-label="More information"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </button>
    </Tooltip>
  );
}

export default Tooltip;
