/**
 * NotificationCenter - Bell icon with dropdown for notification history
 *
 * Shows:
 * - Unread count badge
 * - Recent achievements, XP gains, level ups
 * - Mark as read functionality
 * - Link to full notification settings
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Trophy, Zap, Star, Check, Settings, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { useGamificationModeStore, VISIBILITY } from '../../stores/gamificationModeStore';
import { useNavigate } from 'react-router-dom';

// Notification history store (extends notificationStore for history)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Create a simple history store to track past notifications
export const useNotificationHistoryStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      // Add a notification to history
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: notification.id || `notif-${Date.now()}`,
          timestamp: Date.now(),
          read: false,
        };

        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
          unreadCount: state.unreadCount + 1,
        }));
      },

      // Mark a notification as read
      markAsRead: (id) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification && !notification.read) {
            return {
              notifications: state.notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            };
          }
          return state;
        });
      },

      // Mark all as read
      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      // Clear all notifications
      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      // Remove a specific notification
      removeNotification: (id) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: notification && !notification.read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },
    }),
    {
      name: 'lifeos-notification-history',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 20), // Only persist last 20
        unreadCount: state.unreadCount,
      }),
    }
  )
);

/**
 * Get icon for notification type
 */
function getNotificationIcon(type) {
  switch (type) {
    case 'achievement':
      return <Trophy className="w-4 h-4 text-amber-400" />;
    case 'xp':
      return <Zap className="w-4 h-4 text-cyan-400" />;
    case 'levelUp':
      return <Star className="w-4 h-4 text-purple-400" fill="currentColor" />;
    case 'streak':
      return <span className="text-sm">🔥</span>;
    default:
      return <Bell className="w-4 h-4 text-primary-400" />;
  }
}

/**
 * Format relative time
 */
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

/**
 * Individual notification item
 */
function NotificationItem({ notification, onMarkRead, onRemove }) {
  const { id, type, title, message, timestamp, read, data } = notification;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`
        p-3 border-b border-border-subtle last:border-0
        ${read ? 'opacity-60' : 'bg-primary-500/5'}
        hover:bg-bg-hover transition-colors cursor-pointer
      `}
      onClick={() => !read && onMarkRead(id)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium text-sm text-text-primary truncate">
              {title}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
              className="flex-shrink-0 p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {message && (
            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
              {message}
            </p>
          )}

          {/* XP/Credits display */}
          {data?.xp && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-cyan-400 font-medium">
                +{data.xp} XP
              </span>
              {data.credits && (
                <span className="text-xs text-purple-400 font-medium">
                  +{data.credits} Credits
                </span>
              )}
            </div>
          )}

          <div className="text-xs text-text-muted mt-1">
            {formatRelativeTime(timestamp)}
          </div>
        </div>

        {/* Unread indicator */}
        {!read && (
          <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
        )}
      </div>
    </motion.div>
  );
}

/**
 * Main NotificationCenter component
 */
export default function NotificationCenter({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Get mode visibility
  const mode = useGamificationModeStore((state) => state.mode);
  const visibility = VISIBILITY[mode] || VISIBILITY.cosmic;

  // Get notification history
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotificationHistoryStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // In minimal mode, don't show notification center
  if (mode === 'minimal') {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 rounded-md
          cosmic-glow
          text-fg-secondary hover:text-fg-primary hover:bg-accent-mainSoft
          transition-all duration-fast
          ${isOpen ? 'bg-accent-mainSoft text-fg-primary' : ''}
        `}
      >
        <Bell size={18} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="
              absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
              flex items-center justify-center
              bg-red-500 text-white text-xs font-bold
              rounded-full px-1 border-2 border-bg-surface
            "
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="
              absolute top-full right-0 mt-2
              w-80 max-h-[400px]
              bg-bg-surface border border-border rounded-xl
              shadow-xl shadow-black/20
              overflow-hidden z-50
            "
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/settings');
                  }}
                  className="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                  title="Notification Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-text-muted text-sm">No notifications yet</p>
                  <p className="text-text-muted text-xs mt-1">
                    Achievements and XP gains will appear here
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markAsRead}
                      onRemove={removeNotification}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-border-subtle flex justify-between items-center">
                <button
                  onClick={clearAll}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
                <span className="text-xs text-text-muted">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
