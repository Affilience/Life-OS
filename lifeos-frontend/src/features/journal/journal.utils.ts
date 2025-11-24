/**
 * Journal Utility Functions
 * Streak calculations, statistics, and helpers
 */

import { JournalEntryMeta, DayISO } from './journal.types';
import { format, parseISO, differenceInDays, subDays, isToday, isYesterday } from 'date-fns';

export interface StreakInfo {
  current: number;
  longest: number;
  lastEntryDate?: DayISO;
}

/**
 * Calculate current streak and longest streak from entries
 * Current streak counts backwards from today (or yesterday if no entry today)
 */
export function calculateStreaks(entries: JournalEntryMeta[]): StreakInfo {
  if (entries.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Sort entries by date descending (most recent first)
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  const todayISO = format(today, 'yyyy-MM-dd');
  const yesterdayISO = format(subDays(today, 1), 'yyyy-MM-dd');

  // Check if streak is active (entry today or yesterday)
  const hasToday = sorted.some(e => e.date === todayISO);
  const hasYesterday = sorted.some(e => e.date === yesterdayISO);

  if (!hasToday && !hasYesterday) {
    // Streak is broken
    currentStreak = 0;
  } else {
    // Count backwards from today or yesterday
    const startDate = hasToday ? today : subDays(today, 1);
    let checkDate = startDate;

    while (true) {
      const checkISO = format(checkDate, 'yyyy-MM-dd');
      const hasEntry = sorted.some(e => e.date === checkISO);

      if (hasEntry) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  // Sort entries by date ascending for longest streak calculation
  const sortedAsc = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  for (const entry of sortedAsc) {
    const entryDate = parseISO(entry.date);

    if (prevDate === null) {
      // First entry
      tempStreak = 1;
    } else {
      const daysDiff = differenceInDays(entryDate, prevDate);

      if (daysDiff === 1) {
        // Consecutive day
        tempStreak++;
      } else {
        // Streak broken, reset
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    prevDate = entryDate;
  }

  // Check final streak
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    current: currentStreak,
    longest: longestStreak,
    lastEntryDate: sorted[0]?.date,
  };
}

/**
 * Get all unique tags from entries
 */
export function getAllTags(entries: JournalEntryMeta[]): string[] {
  const tagSet = new Set<string>();
  entries.forEach(entry => {
    entry.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

/**
 * Check if a date is part of the current active streak
 */
export function isInCurrentStreak(dateISO: DayISO, entries: JournalEntryMeta[]): boolean {
  const streakInfo = calculateStreaks(entries);
  if (streakInfo.current === 0) return false;

  const today = new Date();
  const checkDate = parseISO(dateISO);
  const daysDiff = differenceInDays(today, checkDate);

  // Check if date is within current streak range
  return daysDiff >= 0 && daysDiff < streakInfo.current;
}
