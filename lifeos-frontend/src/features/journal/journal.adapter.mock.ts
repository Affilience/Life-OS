/**
 * Journal Mock Data Adapter
 * Deterministic mock data for development
 */

import { format, subDays } from 'date-fns';
import {
  JournalEntry,
  JournalEntryMeta,
  JournalQuery,
  DayISO,
  JournalMood,
} from './journal.types';

// Seeded random for deterministic data
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

  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

const SAMPLE_TITLES = [
  'Progress & Reflections',
  'Today Was Challenging',
  'Breakthrough Moment',
  'Quiet Day',
  'Energy High',
  'Focus Session Notes',
  'Struggling With...',
  'Small Wins',
  'Deep Thoughts',
  'Gratitude',
];

const SAMPLE_TAGS = [
  'productivity',
  'health',
  'learning',
  'business',
  'personal',
  'goals',
  'habits',
  'insights',
];

const SAMPLE_BODIES = [
  'Had a really productive deep work session today. Managed to complete the feature I\'ve been working on and even fixed a few bugs. Feeling good about the progress.\n\nNeed to remember to take more breaks though - got too absorbed and skipped lunch.',

  'Struggled with focus today. Too many distractions and context switches. Tomorrow I need to block time better and turn off notifications during work blocks.\n\nDid manage to get a good workout in though, which helped clear my head.',

  'Great breakthrough on the project today. The solution suddenly became clear after stepping away for a walk. This confirms what I already know - breaks are essential for creative problem solving.\n\nAlso read 30 pages of the book on systems thinking.',

  'Quiet, steady day. Nothing dramatic but consistent progress on multiple fronts. Sometimes these are the best days - just showing up and doing the work.',

  'Energy levels were high today. Knocked out the morning workout, had two solid deep work blocks, and even had time for some learning. This is the standard I want to hit more often.\n\nMood: focused and energized.',
];

/**
 * Generate mock journal data for a date
 */
function generateMockEntry(dateISO: DayISO, seed: number): JournalEntry | null {
  const rng = new SeededRandom(seed);

  // 60% chance of having an entry
  if (rng.next() < 0.4) {
    return null;
  }

  const tags = [];
  const tagCount = rng.between(0, 3);
  for (let i = 0; i < tagCount; i++) {
    const tag = rng.pick(SAMPLE_TAGS);
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  const moods: (JournalMood | undefined)[] = ['calm', 'focused', 'stressed', 'neutral', undefined];
  const mood = rng.pick(moods);

  const title = rng.pick(SAMPLE_TITLES);
  const body = rng.pick(SAMPLE_BODIES);
  const wordCount = body.split(/\s+/).length;

  return {
    id: `entry-${dateISO}`,
    date: dateISO,
    hasText: true,
    tags,
    mood,
    wordCount,
    xpAwarded: 25,
    title,
    body,
  };
}

/**
 * List journal entry metadata
 */
export async function listEntriesMeta(
  query: JournalQuery = {}
): Promise<JournalEntryMeta[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 150));

  const today = new Date();
  const from = query.fromISO ? new Date(query.fromISO) : subDays(today, 365);
  const to = query.toISO ? new Date(query.toISO) : today;

  const entries: JournalEntryMeta[] = [];

  // Generate entries for date range
  let current = new Date(from);
  while (current <= to) {
    const dateISO = format(current, 'yyyy-MM-dd');
    const seed = current.getTime() / 1000; // Deterministic seed from date

    const entry = generateMockEntry(dateISO, seed);
    if (entry) {
      // Filter by tags if specified
      if (query.tags && query.tags.length > 0) {
        const hasTag = query.tags.some((t) => entry.tags.includes(t));
        if (!hasTag) {
          current.setDate(current.getDate() + 1);
          continue;
        }
      }

      // Filter by search if specified
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        const matchesTitle = entry.title?.toLowerCase().includes(searchLower);
        const matchesBody = entry.body?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesBody) {
          current.setDate(current.getDate() + 1);
          continue;
        }
      }

      // Extract metadata only
      const { title, body, ...meta } = entry;
      entries.push(meta);
    }

    current.setDate(current.getDate() + 1);
  }

  return entries;
}

/**
 * Get full entry by date
 */
export async function getEntryByDate(date: DayISO): Promise<JournalEntry | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const dateObj = new Date(date);
  const seed = dateObj.getTime() / 1000;

  return generateMockEntry(date, seed);
}

/**
 * Upsert journal entry
 */
export async function upsertEntry(entry: JournalEntry): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  console.log('Mock: Saved entry', entry);
  // In real impl, this would save to backend/localStorage
}

/**
 * Delete journal entry
 */
export async function deleteEntry(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  console.log('Mock: Deleted entry', id);
  // In real impl, this would delete from backend/localStorage
}
