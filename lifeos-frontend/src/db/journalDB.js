import Dexie from 'dexie';

// Initialize Dexie database
export const db = new Dexie('QuantaJournalDB');

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
  // Get all entries sorted by date (newest first)
  async getAllEntries() {
    return await db.entries
      .orderBy('date')
      .reverse()
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
    return { ...newEntry, id };
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
    return updatedEntry;
  },

  // Delete entry
  async deleteEntry(id) {
    return await db.entries.delete(id);
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

export default db;
