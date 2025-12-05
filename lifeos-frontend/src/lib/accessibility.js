/**
 * Accessibility Utilities
 *
 * Provides utilities for:
 * - Screen reader announcements
 * - Keyboard navigation helpers
 * - Focus management
 * - ARIA attribute helpers
 */

/**
 * Screen Reader Only - visually hidden but accessible
 */
export const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * VisuallyHidden - React component for screen reader only content
 */
export function VisuallyHidden({ children, as: Component = 'span' }) {
  return <Component style={srOnlyStyles}>{children}</Component>;
}

/**
 * Announce to screen readers using ARIA live region
 */
let announcer = null;

export function announce(message, priority = 'polite') {
  // Create announcer element if it doesn't exist
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    Object.assign(announcer.style, srOnlyStyles);
    document.body.appendChild(announcer);
  }

  // Update priority if needed
  announcer.setAttribute('aria-live', priority);

  // Clear and set message (triggers announcement)
  announcer.textContent = '';
  requestAnimationFrame(() => {
    announcer.textContent = message;
  });
}

/**
 * Focus management utilities
 */
export const focusUtils = {
  // Focusable element selector
  FOCUSABLE_SELECTOR: [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', '),

  // Get all focusable elements within a container
  getFocusableElements(container) {
    return Array.from(container.querySelectorAll(this.FOCUSABLE_SELECTOR));
  },

  // Focus first focusable element in container
  focusFirst(container) {
    const elements = this.getFocusableElements(container);
    if (elements[0]) {
      elements[0].focus();
      return true;
    }
    return false;
  },

  // Focus last focusable element in container
  focusLast(container) {
    const elements = this.getFocusableElements(container);
    const last = elements[elements.length - 1];
    if (last) {
      last.focus();
      return true;
    }
    return false;
  },

  // Create a focus trap within a container
  createFocusTrap(container) {
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const elements = this.getFocusableElements(container);
      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  },
};

/**
 * Keyboard navigation helpers
 */
export const keyboardUtils = {
  // Key codes for common keys
  keys: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
  },

  // Check if key is activation key (Enter or Space)
  isActivationKey(e) {
    return e.key === this.keys.ENTER || e.key === this.keys.SPACE;
  },

  // Handle Enter/Space as click for custom interactive elements
  handleKeyActivation(e, callback) {
    if (this.isActivationKey(e)) {
      e.preventDefault();
      callback(e);
    }
  },

  // Arrow key navigation for lists/grids
  handleArrowNavigation(e, items, currentIndex, options = {}) {
    const { wrap = true, orientation = 'vertical', onSelect } = options;
    const { keys } = this;

    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';

    let newIndex = currentIndex;

    if (e.key === keys.ARROW_DOWN && isVertical) {
      newIndex = currentIndex + 1;
    } else if (e.key === keys.ARROW_UP && isVertical) {
      newIndex = currentIndex - 1;
    } else if (e.key === keys.ARROW_RIGHT && isHorizontal) {
      newIndex = currentIndex + 1;
    } else if (e.key === keys.ARROW_LEFT && isHorizontal) {
      newIndex = currentIndex - 1;
    } else if (e.key === keys.HOME) {
      newIndex = 0;
    } else if (e.key === keys.END) {
      newIndex = items.length - 1;
    } else {
      return currentIndex;
    }

    e.preventDefault();

    // Handle wrapping
    if (wrap) {
      if (newIndex < 0) newIndex = items.length - 1;
      if (newIndex >= items.length) newIndex = 0;
    } else {
      newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
    }

    // Focus the new item
    if (items[newIndex]) {
      items[newIndex].focus();
      if (onSelect) onSelect(newIndex);
    }

    return newIndex;
  },
};

/**
 * ARIA helpers
 */
export const ariaUtils = {
  // Generate unique IDs for ARIA relationships
  generateId(prefix = 'aria') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Create ARIA label props from children or explicit label
  labelProps(label, labelledBy) {
    if (labelledBy) {
      return { 'aria-labelledby': labelledBy };
    }
    if (label) {
      return { 'aria-label': label };
    }
    return {};
  },

  // Create expanded/collapsed state props
  expandedProps(isExpanded, controlsId) {
    return {
      'aria-expanded': isExpanded,
      'aria-controls': controlsId,
    };
  },

  // Create selected state props
  selectedProps(isSelected) {
    return { 'aria-selected': isSelected };
  },

  // Create current page props for navigation
  currentPageProps(isCurrent) {
    return isCurrent ? { 'aria-current': 'page' } : {};
  },
};

/**
 * Hook: useKeyboardNavigation
 * Provides arrow key navigation for lists
 */
export function useKeyboardNavigation(items, initialIndex = 0) {
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);

  const handleKeyDown = React.useCallback(
    (e) => {
      const newIndex = keyboardUtils.handleArrowNavigation(
        e,
        items,
        activeIndex,
        { onSelect: setActiveIndex }
      );
      return newIndex;
    },
    [items, activeIndex]
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
}

/**
 * Hook: useFocusTrap
 * Creates a focus trap within a ref'd element
 */
export function useFocusTrap(isActive = true) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const cleanup = focusUtils.createFocusTrap(containerRef.current);
    focusUtils.focusFirst(containerRef.current);

    return cleanup;
  }, [isActive]);

  return containerRef;
}

/**
 * Hook: useAnnounce
 * Returns a function to announce messages to screen readers
 */
export function useAnnounce() {
  return React.useCallback((message, priority = 'polite') => {
    announce(message, priority);
  }, []);
}

// Need React for hooks
import React from 'react';
