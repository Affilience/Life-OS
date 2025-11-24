/**
 * Celebration Event Bus
 * Connects avatar events to Lottie celebration animations
 */

import { useEffect } from 'react';

export type CelebrationEvent =
  | { type: "xpBurst"; amount: number }
  | { type: "levelUp"; level: number }
  | { type: "streakMilestone"; days: number };

type CelebrationEventHandler = (event: CelebrationEvent) => void;

const celebrationHandlers = new Set<CelebrationEventHandler>();

/**
 * Emit a celebration event to all subscribers
 */
export function emitCelebration(event: CelebrationEvent): void {
  celebrationHandlers.forEach(handler => {
    try {
      handler(event);
    } catch (error) {
      console.error('Celebration event handler error:', error);
    }
  });
}

/**
 * Subscribe to celebration events
 */
export function useCelebrationBus(handlers: {
  onXpBurst?: (amount: number) => void;
  onLevelUp?: (level: number) => void;
  onStreakMilestone?: (days: number) => void;
}): void {
  useEffect(() => {
    const handler: CelebrationEventHandler = (event) => {
      switch (event.type) {
        case 'xpBurst':
          handlers.onXpBurst?.(event.amount);
          break;
        case 'levelUp':
          handlers.onLevelUp?.(event.level);
          break;
        case 'streakMilestone':
          handlers.onStreakMilestone?.(event.days);
          break;
      }
    };

    celebrationHandlers.add(handler);

    return () => {
      celebrationHandlers.delete(handler);
    };
  }, [handlers.onXpBurst, handlers.onLevelUp, handlers.onStreakMilestone]);
}
