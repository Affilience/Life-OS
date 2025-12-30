import Dexie from 'dexie';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { triggerGamification } from '../hooks/useGamification';

// Initialize Dexie database
export const db = new Dexie('AscyntJournalDB');

// Define database schema
db.version(1).stores({
  entries: '++id, date, timestamp, *tags',
  settings: 'key'
});

// Journal entry model with default values
export const createEntry = (data) => {
  const entry = {
    date: data.date || new Date().toISOString().split('T')[0],
    timestamp: data.timestamp || Date.now(),
    title: data.title || '',
    content: data.content || '',
    mood: data.mood || null,
    tags: data.tags || [],
    wordCount: data.wordCount || (data.content ? data.content.split(/\s+/).filter(Boolean).length : 0),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };

  // Only include id if it exists (for updates)
  if (data.id !== undefined && data.id !== null) {
    entry.id = data.id;
  }

  return entry;
};

// CRUD Operations
export const journalDB = {
  // Get all entries sorted by date (oldest first - like a real book)
  async getAllEntries() {
    return await db.entries
      .orderBy('date')
      .toArray();
  },

  // Get entry by ID
  async getEntry(id) {
    return await db.entries.get(id);
  },

  // Get entries by date range
  async getEntriesByDateRange(startDate, endDate) {
    return await db.entries
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  },

  // Get entry by specific date
  async getEntryByDate(date) {
    return await db.entries
      .where('date')
      .equals(date)
      .first();
  },

  // Add new entry
  async addEntry(entry) {
    const newEntry = createEntry(entry);
    const id = await db.entries.add(newEntry);
    const savedEntry = { ...newEntry, id };

    // Sync to Supabase in background
    journalSync.syncToSupabase(savedEntry).catch(err =>
      console.error('Background sync failed:', err)
    );

    // Award XP for journal entry based on word count
    const wordCount = newEntry.wordCount || 0;
    let xpAmount = 15; // Base XP for any entry
    if (wordCount >= 200) xpAmount = 25; // Detailed entry
    if (wordCount >= 500) xpAmount = 40; // Long reflection

    triggerGamification('journalEntry', {
      xpOverride: xpAmount,
      module: 'knowledge', // Journal relates to self-knowledge
    });

    return savedEntry;
  },

  // Update existing entry
  async updateEntry(id, updates) {
    const entry = await db.entries.get(id);
    if (!entry) throw new Error('Entry not found');

    const updatedEntry = {
      ...entry,
      ...updates,
      updatedAt: new Date().toISOString(),
      wordCount: updates.content
        ? updates.content.split(/\s+/).filter(Boolean).length
        : entry.wordCount
    };

    await db.entries.update(id, updatedEntry);

    // Sync to Supabase in background
    journalSync.syncToSupabase(updatedEntry).catch(err =>
      console.error('Background sync failed:', err)
    );

    return updatedEntry;
  },

  // Delete entry
  async deleteEntry(id) {
    // Get entry first to get timestamp for Supabase delete
    const entry = await db.entries.get(id);
    const result = await db.entries.delete(id);

    // Delete from Supabase in background
    if (entry?.timestamp) {
      journalSync.deleteFromSupabase(entry.timestamp).catch(err =>
        console.error('Background delete sync failed:', err)
      );
    }

    return result;
  },

  // Search entries
  async searchEntries(query) {
    const allEntries = await db.entries.toArray();
    const lowerQuery = query.toLowerCase();

    return allEntries.filter(entry =>
      entry.title?.toLowerCase().includes(lowerQuery) ||
      entry.content?.toLowerCase().includes(lowerQuery) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  // Get entries by tag
  async getEntriesByTag(tag) {
    return await db.entries
      .where('tags')
      .equals(tag)
      .toArray();
  },

  // Get all unique tags
  async getAllTags() {
    const entries = await db.entries.toArray();
    const tagSet = new Set();
    entries.forEach(entry => {
      entry.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  },

  // Get entry count
  async getEntryCount() {
    return await db.entries.count();
  },

  // Clear all entries (use with caution!)
  async clearAllEntries() {
    return await db.entries.clear();
  }
};

// Settings operations
export const settingsDB = {
  async get(key) {
    const setting = await db.settings.get(key);
    return setting?.value;
  },

  async set(key, value) {
    return await db.settings.put({ key, value });
  }
};

// Supabase sync operations
export const journalSync = {
  // Sync entry to Supabase
  async syncToSupabase(entry) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('No authenticated user, skipping journal sync');
        return null;
      }

      const supabaseEntry = {
        user_id: userId,
        entry_date: entry.date,
        entry_timestamp: entry.timestamp,
        title: entry.title || null,
        content: entry.content,
        mood_rating: entry.mood || null,
        energy_level: entry.energy || null,
        tags: entry.tags || [],
        word_count: entry.wordCount || 0,
        is_favorite: entry.isFavorite || false,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('journal_entries')
        .upsert(supabaseEntry, {
          onConflict: 'user_id,entry_timestamp',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error syncing journal entry to Supabase:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Journal sync error:', err);
      return null;
    }
  },

  // Fetch all entries from Supabase
  async fetchFromSupabase() {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('No authenticated user, skipping journal fetch');
        return [];
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false });

      if (error) {
        console.error('Error fetching journal entries from Supabase:', error);
        return [];
      }

      return data.map(entry => ({
        id: entry.id,
        date: entry.entry_date,
        timestamp: entry.entry_timestamp,
        title: entry.title,
        content: entry.content,
        mood: entry.mood_rating,
        energy: entry.energy_level,
        tags: entry.tags || [],
        wordCount: entry.word_count,
        isFavorite: entry.is_favorite,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
        supabaseId: entry.id
      }));
    } catch (err) {
      console.error('Journal fetch error:', err);
      return [];
    }
  },

  // Full sync - pull from Supabase and merge with local
  async fullSync() {
    try {
      // Fetch from Supabase
      const remoteEntries = await this.fetchFromSupabase();

      // Get local entries
      const localEntries = await db.entries.toArray();

      // Create maps for comparison
      const remoteByTimestamp = new Map(remoteEntries.map(e => [e.timestamp, e]));
      const localByTimestamp = new Map(localEntries.map(e => [e.timestamp, e]));

      // Merge: remote wins for conflicts, add missing to each side
      for (const remote of remoteEntries) {
        const local = localByTimestamp.get(remote.timestamp);
        if (!local) {
          // Add remote entry to local
          await db.entries.add({
            date: remote.date,
            timestamp: remote.timestamp,
            title: remote.title,
            content: remote.content,
            mood: remote.mood,
            tags: remote.tags,
            wordCount: remote.wordCount,
            createdAt: remote.createdAt,
            updatedAt: remote.updatedAt
          });
        } else if (new Date(remote.updatedAt) > new Date(local.updatedAt)) {
          // Remote is newer, update local
          await db.entries.update(local.id, {
            title: remote.title,
            content: remote.content,
            mood: remote.mood,
            tags: remote.tags,
            wordCount: remote.wordCount,
            updatedAt: remote.updatedAt
          });
        }
      }

      // Push local-only entries to Supabase
      for (const local of localEntries) {
        if (!remoteByTimestamp.has(local.timestamp)) {
          await this.syncToSupabase(local);
        }
      }

      console.log('Journal sync completed');
      return true;
    } catch (err) {
      console.error('Full journal sync error:', err);
      return false;
    }
  },

  // Delete from Supabase
  async deleteFromSupabase(timestamp) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('No authenticated user, skipping journal delete');
        return false;
      }

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('user_id', userId)
        .eq('entry_timestamp', timestamp);

      if (error) {
        console.error('Error deleting journal entry from Supabase:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Journal delete error:', err);
      return false;
    }
  },

  // Sync journal cover settings to Supabase
  async syncCoverSettings(settings) {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('No authenticated user, skipping cover settings sync');
        return false;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ journal_cover_settings: settings })
        .eq('id', userId);

      if (error) {
        console.error('Error syncing journal cover settings:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Cover settings sync error:', err);
      return false;
    }
  },

  // Fetch journal cover settings from Supabase
  async fetchCoverSettings() {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('No authenticated user, skipping cover settings fetch');
        return null;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('journal_cover_settings')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching journal cover settings:', error);
        return null;
      }

      return data?.journal_cover_settings || null;
    } catch (err) {
      console.error('Cover settings fetch error:', err);
      return null;
    }
  }
};

export default db;
