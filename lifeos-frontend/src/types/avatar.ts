/**
 * ONYXOS Holographic Avatar System
 * Type definitions for 3D avatar with reactive states
 */

export type AvatarMood = 'calm' | 'focused' | 'stressed';

export interface HoloAvatarProps {
  level: number;
  xp: number;
  xpToNext: number;
  seasonColor?: string;
  streakDays?: number;
  mood?: AvatarMood;
  onOpenCoach?: () => void;
}

export interface AvatarState {
  xpPercent: number;
  hasLeveledUp: boolean;
  auraSize: number;
  auraIntensity: number;
  moodTint: number;
  seasonColorComputed: string;
}

export interface ShaderUniforms {
  u_time: { value: number };
  u_seasonColor: { value: THREE.Color };
  u_accent: { value: THREE.Color };
  u_xpPulse: { value: number };
  u_levelPulse: { value: number };
  u_mood: { value: number };
}

export interface AuraUniforms {
  u_time: { value: number };
  u_color: { value: THREE.Color };
  u_intensity: { value: number };
  u_radius: { value: number };
  u_streakSpokes: { value: number };
}

export enum MoodValue {
  calm = 0,
  focused = 1,
  stressed = 2,
}
