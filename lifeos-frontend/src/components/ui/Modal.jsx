/**
 * Accessible Modal Component
 *
 * A fully accessible modal/dialog component with:
 * - Focus trap (tab cycles within modal)
 * - Escape key to close
 * - Return focus to trigger element on close
 * - ARIA attributes for screen readers
 * - Scroll lock on body
 * - Smooth enter/exit animations
 * - Portal rendering to avoid z-index issues
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Focusable elements selector
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Modal Component
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  contentClassName = '',
  initialFocus,
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] sm:max-w-[90vw]',
  };

  // Handle opening/closing with animation
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else if (shouldRender) {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        // Return focus to the element that triggered the modal
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
      }, 200); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Set initial focus
  useEffect(() => {
    if (isOpen && isAnimating && modalRef.current) {
      const timer = setTimeout(() => {
        if (initialFocus?.current) {
          initialFocus.current.focus();
        } else {
          // Focus the first focusable element or the modal itself
          const firstFocusable = modalRef.current.querySelector(FOCUSABLE_SELECTOR);
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 50); // Small delay for animation
      return () => clearTimeout(timer);
    }
  }, [isOpen, isAnimating, initialFocus]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus trap
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    },
    []
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        ${isAnimating ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-200
      `}
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black/60 backdrop-blur-sm
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
          transition-opacity duration-200
        `}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`
          relative w-full ${sizeClasses[size]}
          bg-[var(--bg-elevated,#221e2e)] border border-white/10
          rounded-2xl shadow-xl shadow-black/30
          ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          transition-all duration-200
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-white"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="text-sm text-white/60 mt-0.5"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`px-6 py-4 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * ModalFooter - Footer section for modal actions
 */
export function ModalFooter({ children, className = '' }) {
  return (
    <div
      className={`
        flex items-center justify-end gap-3 px-6 py-4
        border-t border-white/10 -mx-6 -mb-4 mt-4
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * ConfirmDialog - Pre-built confirmation dialog
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const variantClasses = {
    danger: 'bg-rose-500 hover:bg-rose-600 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    primary: 'bg-violet-500 hover:bg-violet-600 text-white',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      {message && (
        <p className="text-white/70 text-sm">{message}</p>
      )}
      <ModalFooter>
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`
            px-4 py-2 text-sm font-medium rounded-lg transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${variantClasses[variant]}
          `}
        >
          {loading ? 'Loading...' : confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
}

/**
 * useModal - Hook for managing modal state
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}

export default Modal;
