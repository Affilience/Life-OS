/**
 * Ready Player Me Avatar Types
 */

export type AvatarMood = 'calm' | 'focused' | 'stressed';

export interface AvatarState {
  url: string | null;
  level: number;
  xp: number;
  xpToNext: number;
  streakDays: number;
  seasonColor?: string; // defaults to --accent
  mood?: AvatarMood;
}

export interface RpmViewerProps {
  level: number;
  xp: number;
  xpToNext: number;
  streakDays?: number;
  seasonColor?: string;
  mood?: AvatarMood;
  onOpenCoach?: () => void;
}

export interface RpmViewerRef {
  pulseXp: () => void;
  pulseLevel: () => void;
  setSeason: (color: string) => void;
}

export interface RpmCreatorProps {
  onAvatarReady: (url: string) => void;
  onClose?: () => void;
}

// Ready Player Me postMessage event types
export interface RpmMessageEvent {
  source: string;
  eventName: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
}
