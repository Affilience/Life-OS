/**
 * Mission System Types
 * Cosmic-themed daily/weekly/monthly missions with progress tracking
 */

export type MissionFrequency = 'daily' | 'weekly' | 'monthly' | 'challenge';
export type MissionDifficulty = 'routine' | 'moderate' | 'challenging' | 'cosmic';
export type MissionStatus = 'active' | 'completed' | 'failed' | 'expired';

export type ModuleId = 'journal' | 'knowledge' | 'health' | 'finance' | 'productivity' | 'any';

export interface MissionObjective {
  id: string;
  type: 'count' | 'duration' | 'quality' | 'sequence';
  description: string;
  target: number;
  current: number;
  metric: string; // 'journal_entries', 'workout_minutes', 'books_read', etc.
}

export interface Mission {
  id: string;
  title: string;
  cosmicNarrative?: string;
  description: string;
  moduleId: ModuleId;
  frequency: MissionFrequency;
  difficulty: MissionDifficulty;

  objectives: MissionObjective[];

  xpReward: number;
  creditsReward: number;

  requiresStreak?: boolean;
  minimumStreakDays?: number;

  icon?: string;
  tags?: string[];
  isRepeatable: boolean;
  maxCompletions?: number;

  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  mission?: Mission; // Populated via join
  status: MissionStatus;

  progress: Record<string, number>; // { objective_id: current_value }
  completionPercentage: number;

  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;

  rewardsClaimed: boolean;
}

export interface MissionFilters {
  frequency?: MissionFrequency;
  moduleId?: ModuleId;
  difficulty?: MissionDifficulty;
  status?: MissionStatus;
}

export interface MissionProgress {
  total: number;
  completed: number;
  active: number;
  failed: number;
}

export interface MissionReward {
  xp: number;
  credits: number;
  bonusMultiplier?: number;
}
