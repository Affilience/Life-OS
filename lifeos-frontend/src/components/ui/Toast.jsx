/**
 * Toast Notification System
 *
 * A complete toast notification system with:
 * - Multiple variants (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Stack multiple toasts
 * - Action buttons (undo, retry, etc.)
 * - Smooth enter/exit animations
 * - Accessible with ARIA live regions
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Toast variants configuration
const TOAST_VARIANTS = {
  success: {
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    iconClassName: 'text-emerald-400',
    progressClassName: 'bg-emerald-500',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    iconClassName: 'text-rose-400',
    progressClassName: 'bg-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    iconClassName: 'text-amber-400',
    progressClassName: 'bg-amber-500',
  },
  info: {
    icon: Info,
    className: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
    iconClassName: 'text-violet-400',
    progressClassName: 'bg-violet-500',
  },
  loading: {
    icon: Loader2,
    className: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
    iconClassName: 'text-violet-400 animate-spin',
    progressClassName: 'bg-violet-500',
  },
};

// Default durations
const DEFAULT_DURATION = 5000;
const LOADING_DURATION = null; // Loading toasts don't auto-dismiss

// Generate unique IDs
let toastId = 0;
const generateId = () => `toast-${++toastId}`;

/**
 * Individual Toast Component
 */
function ToastItem({ toast, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const variant = TOAST_VARIANTS[toast.variant] || TOAST_VARIANTS.info;
  const Icon = variant.icon;

  const duration = toast.duration ?? (toast.variant === 'loading' ? LOADING_DURATION : DEFAULT_DURATION);

  // Handle dismiss with exit animation
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [toast.id, onDismiss]);

  // Auto-dismiss timer with progress
  useEffect(() => {
    if (!duration || toast.variant === 'loading') return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / duration) * 100;
      setProgress(newProgress);

      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      }
    };

    const animationFrame = requestAnimationFrame(updateProgress);
    const timer = setTimeout(handleDismiss, duration);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timer);
    };
  }, [duration, handleDismiss, toast.variant]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative flex items-start gap-3 w-full max-w-sm p-4 rounded-xl border backdrop-blur-sm
        shadow-lg shadow-black/20
        ${variant.className}
        ${isExiting ? 'animate-toast-exit' : 'animate-toast-enter'}
      `}
    >
      {/* Icon */}
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${variant.iconClassName}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-white text-sm mb-0.5">{toast.title}</p>
        )}
        {toast.message && (
          <p className="text-sm text-white/70">{toast.message}</p>
        )}

        {/* Action buttons */}
        {toast.action && (
          <button
            onClick={() => {
              toast.action.onClick();
              handleDismiss();
            }}
            className="mt-2 text-sm font-medium text-white hover:underline focus:outline-none focus:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      {toast.dismissible !== false && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Progress bar */}
      {duration && toast.showProgress !== false && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl overflow-hidden">
          <div
            className={`h-full ${variant.progressClassName} transition-none`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Toast Container - renders all toasts
 */
function ToastContainer({ toasts, onDismiss, position = 'bottom-right' }) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-20 left-4 sm:bottom-4',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2 sm:bottom-4',
    'bottom-right': 'bottom-20 right-4 sm:bottom-4',
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className={`fixed z-[100] flex flex-col gap-2 pointer-events-none ${positionClasses[position]}`}
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
}

/**
 * Toast Provider - wrap your app with this
 */
export function ToastProvider({ children, position = 'bottom-right', maxToasts = 5 }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    const id = options.id || generateId();

    setToasts((prev) => {
      // Remove oldest if at max
      const newToasts = prev.length >= maxToasts ? prev.slice(1) : prev;
      return [...newToasts, { ...options, id }];
    });

    return id;
  }, [maxToasts]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Update a toast (useful for loading -> success/error)
  const updateToast = useCallback((id, options) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...options } : t))
    );
  }, []);

  // Convenience methods
  const toast = useCallback((message, options = {}) => {
    return addToast({ message, variant: 'info', ...options });
  }, [addToast]);

  toast.success = (message, options = {}) => addToast({ message, variant: 'success', ...options });
  toast.error = (message, options = {}) => addToast({ message, variant: 'error', ...options });
  toast.warning = (message, options = {}) => addToast({ message, variant: 'warning', ...options });
  toast.info = (message, options = {}) => addToast({ message, variant: 'info', ...options });
  toast.loading = (message, options = {}) => addToast({ message, variant: 'loading', dismissible: false, ...options });

  // Promise toast - shows loading, then success/error
  toast.promise = async (promise, { loading, success, error }) => {
    const id = toast.loading(loading);

    try {
      const result = await promise;
      updateToast(id, {
        variant: 'success',
        message: typeof success === 'function' ? success(result) : success,
        dismissible: true,
        duration: DEFAULT_DURATION,
      });
      return result;
    } catch (err) {
      updateToast(id, {
        variant: 'error',
        message: typeof error === 'function' ? error(err) : error,
        dismissible: true,
        duration: DEFAULT_DURATION,
      });
      throw err;
    }
  };

  const value = {
    toasts,
    toast,
    addToast,
    dismissToast,
    dismissAll,
    updateToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} position={position} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

// CSS for animations (add to your global styles or design tokens)
export const toastStyles = `
@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateY(100%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-exit {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(100%) scale(0.95);
  }
}

.animate-toast-enter {
  animation: toast-enter 200ms cubic-bezier(0.2, 0, 0, 1);
}

.animate-toast-exit {
  animation: toast-exit 200ms cubic-bezier(0.4, 0, 1, 1);
}
`;

export default ToastProvider;
