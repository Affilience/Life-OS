/**
 * Avatar Event Bus
 * Global event system for avatar state changes (XP, Level, Streak)
 */

import { useEffect } from 'react';

export type AvatarEvent =
  | { type: "xp:claimed"; amount: number }
  | { type: "level:up"; level: number }
  | { type: "streak:milestone"; days: number };

type AvatarEventHandler = (event: AvatarEvent) => void;

const eventHandlers = new Set<AvatarEventHandler>();

/**
 * Emit an avatar event to all subscribers
 */
export function emitAvatarEvent(event: AvatarEvent): void {
  eventHandlers.forEach(handler => {
    try {
      handler(event);
    } catch (error) {
      console.error('Avatar event handler error:', error);
    }
  });
}

/**
 * Subscribe to avatar events
 */
export function useAvatarEvents(handlers: {
  onXpClaimed?: (amount: number) => void;
  onLevelUp?: (level: number) => void;
  onStreakMilestone?: (days: number) => void;
}): void {
  useEffect(() => {
    const handler: AvatarEventHandler = (event) => {
      switch (event.type) {
        case 'xp:claimed':
          handlers.onXpClaimed?.(event.amount);
          break;
        case 'level:up':
          handlers.onLevelUp?.(event.level);
          break;
        case 'streak:milestone':
          handlers.onStreakMilestone?.(event.days);
          break;
      }
    };

    eventHandlers.add(handler);

    return () => {
      eventHandlers.delete(handler);
    };
  }, [handlers.onXpClaimed, handlers.onLevelUp, handlers.onStreakMilestone]);
}
