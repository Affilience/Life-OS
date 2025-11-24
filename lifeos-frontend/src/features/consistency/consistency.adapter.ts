/**
 * Consistency Data Adapter
 * Mock implementation - replace with real data sources later
 */

import {
  startOfDay,
  subDays,
  startOfWeek,
  format,
  addDays,
  differenceInDays,
} from 'date-fns';
import {
  ConsistencySeries,
  ConsistencyDay,
  RangeWeeks,
  DayISO,
} from './consistency.types';

/**
 * Seeded random number generator for deterministic mock data
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  between(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

/**
 * Calculate composite consistency score
 */
function calculateScore(
  journalCount: number,
  questsCompleted: number,
  deepWorkMin: number,
  steps: number
): number {
  // Normalize each metric to 0..1
  const journalNorm = Math.min(1, journalCount / 1); // 1+ entry hits 1
  const questsNorm = Math.min(1, questsCompleted / 3); // 3 quests hits 1
  const deepWorkNorm = Math.min(1, deepWorkMin / 120); // 2h cap
  const stepsNorm = Math.min(1, steps / 8000); // 8k steps cap

  // Weighted composite (adjust weights as needed)
  const score =
    0.35 * journalNorm +
    0.35 * questsNorm +
    0.2 * deepWorkNorm +
    0.1 * stepsNorm;

  return Math.round(score * 100);
}

/**
 * Generate mock data for a single day
 */
function generateDayData(dateISO: DayISO, rng: SeededRandom): ConsistencyDay {
  // Create realistic patterns:
  // - More activity on weekdays
  // - Random off days
  // - Some streaks and gaps
  const date = new Date(dateISO);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Base probability of activity (lower on weekends)
  const activityChance = isWeekend ? 0.6 : 0.85;
  const hasActivity = rng.next() < activityChance;

  if (!hasActivity) {
    return {
      date: dateISO,
      score: 0,
      journalCount: 0,
      questsCompleted: 0,
      deepWorkMin: 0,
      steps: 0,
    };
  }

  // Generate realistic metrics
  const journalCount = rng.next() < 0.7 ? rng.between(1, 2) : 0;
  const questsCompleted = rng.between(0, 5);
  const deepWorkMin = rng.between(0, 180); // 0-3h
  const steps = rng.between(2000, 12000);

  const score = calculateScore(journalCount, questsCompleted, deepWorkMin, steps);

  return {
    date: dateISO,
    score,
    journalCount,
    questsCompleted,
    deepWorkMin,
    steps,
  };
}

/**
 * Get consistency data for specified range
 */
export async function getConsistency(
  rangeWeeks: RangeWeeks
): Promise<ConsistencySeries> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const today = startOfDay(new Date());
  const endISO = format(today, 'yyyy-MM-dd');

  // Calculate start date (nearest Sunday before today - rangeWeeks*7 + 1)
  const startDate = startOfWeek(subDays(today, (rangeWeeks - 1) * 7), {
    weekStartsOn: 0, // Sunday
  });
  const startISO = format(startDate, 'yyyy-MM-dd');

  // Generate days
  const days: ConsistencyDay[] = [];
  const totalDays = rangeWeeks * 7;

  // Use date as seed for consistent data
  const baseSeed = 42; // Fixed seed for demo consistency

  for (let i = 0; i < totalDays; i++) {
    const currentDate = addDays(startDate, i);
    const dateISO = format(currentDate, 'yyyy-MM-dd');

    // Skip future dates
    if (currentDate > today) {
      days.push({
        date: dateISO,
        score: 0,
        journalCount: 0,
        questsCompleted: 0,
        deepWorkMin: 0,
        steps: 0,
      });
      continue;
    }

    // Create seeded RNG for this specific date
    const daysSinceEpoch = differenceInDays(currentDate, new Date(2024, 0, 1));
    const rng = new SeededRandom(baseSeed + daysSinceEpoch);

    days.push(generateDayData(dateISO, rng));
  }

  return {
    startISO,
    endISO,
    days,
  };
}

/**
 * Calculate current and best streak from consistency data
 */
export function calculateStreaks(
  days: ConsistencyDay[],
  threshold: number = 10
): { current: number; best: number } {
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Calculate from end (today) backwards for current streak
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].score >= threshold) {
      tempStreak++;
      if (i === days.length - 1 || tempStreak === currentStreak + 1) {
        currentStreak = tempStreak;
      }
    } else {
      if (i === days.length - 1) {
        currentStreak = 0;
      }
      tempStreak = 0;
    }

    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  }

  return { current: currentStreak, best: bestStreak };
}
