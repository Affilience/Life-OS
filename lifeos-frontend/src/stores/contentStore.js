/**
 * Content Consumption Store - Track all media consumed
 * Books, Podcasts, Videos, Articles, Courses
 * Focus on retention, application, and consumption vs creation time
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';

// Supabase sync helpers
const syncContentToSupabase = async (content, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase.from('content_items').delete().eq('id', content.id);
      return;
    }

    const dbContent = {
      id: content.id,
      user_id: userId,
      title: content.title,
      content_type: content.type,
      status: content.status || 'planned',
      url: content.url || null,
      author: content.author || null,
      duration: content.duration || null,
      date_started: content.dateStarted || null,
      date_completed: content.dateCompleted || null,
      rating: content.rating || null,
      quality_score: content.qualityScore || null,
      tags: content.tags || [],
      category: content.category || null,
      key_takeaways: content.keyTakeaways || [],
      notes_url: content.notesUrl || null,
      implementation_status: content.implementationStatus || 'not_started',
      implementation_notes: content.implementationNotes || null,
      time_spent: content.timeSpent || 0,
      consumption_date: content.consumptionDate || new Date().toISOString(),
    };

    await supabase.from('content_items').upsert(dbContent, { onConflict: 'id' });
  } catch (error) {
    console.error('Error syncing content to Supabase:', error);
  }
};

export const useContentStore = create(
  persist(
    (set, get) => ({
      // State
      contentItems: [],
      stats: {
        totalConsumed: 0,
        totalTimeSpent: 0, // minutes
        implementationRate: 0, // percentage
        qualityAverage: 0,
      },

      // Initialize from Supabase
      initializeFromSupabase: async (passedUserId = null) => {
        // Master timeout to prevent hanging
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
        }, INIT_TIMEOUT_MS);

        // Helper to wrap queries with timeout
        const withTimeout = (promise, timeoutMs = 10000) => {
          return Promise.race([
            promise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
            )
          ]).catch(() => ({ data: null, error: 'timeout' }));
        };

        try {
          const userId = passedUserId || await getCurrentUserId();
          if (!userId) {
            clearTimeout(timeoutId);
            return;
          }

          const { data, error } = await withTimeout(
            supabase
              .from('content_items')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
          );

          // Continue with empty data on timeout - don't throw
          if (error && error !== 'timeout') throw error;

          if (data && data.length > 0) {
            const contentItems = data.map(item => ({
              id: item.id,
              title: item.title,
              type: item.content_type,
              status: item.status,
              url: item.url || '',
              author: item.author || '',
              duration: item.duration || 0,
              dateStarted: item.date_started,
              dateCompleted: item.date_completed,
              rating: item.rating || 0,
              qualityScore: item.quality_score || 0,
              tags: item.tags || [],
              category: item.category || '',
              keyTakeaways: item.key_takeaways || [],
              notesUrl: item.notes_url || '',
              implementationStatus: item.implementation_status || 'not_started',
              implementationNotes: item.implementation_notes || '',
              timeSpent: item.time_spent || 0,
              consumptionDate: item.consumption_date,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            }));

            set({ contentItems });
            get().updateStats();
          }
          console.log('[ContentStore] ✅ Initialized');
        } catch (error) {
          console.error('[ContentStore] ❌ Error initializing:', error);
        } finally {
          clearTimeout(timeoutId);
        }
      },

      // Create new content item
      addContent: (contentData) => {
        const newContent = {
          id: crypto.randomUUID(),
          title: contentData.title,
          type: contentData.type, // book, podcast, video, article, course
          status: contentData.status || 'planned', // planned, in_progress, completed, abandoned
          url: contentData.url || '',
          author: contentData.author || '',
          duration: contentData.duration || 0, // minutes for videos/podcasts, pages for books
          dateStarted: contentData.dateStarted || null,
          dateCompleted: contentData.dateCompleted || null,
          rating: contentData.rating || 0, // 1-5 stars
          qualityScore: contentData.qualityScore || 0, // 1-10, how valuable
          tags: contentData.tags || [],
          category: contentData.category || '', // productivity, business, health, etc.

          // Learning tracking
          keyTakeaways: contentData.keyTakeaways || [],
          notesUrl: contentData.notesUrl || '',
          implementationStatus: contentData.implementationStatus || 'not_started', // not_started, planning, implementing, implemented
          implementationNotes: contentData.implementationNotes || '',

          // Consumption awareness
          timeSpent: contentData.timeSpent || 0, // actual minutes spent
          consumptionDate: contentData.consumptionDate || new Date().toISOString(),

          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          contentItems: [...state.contentItems, newContent],
        }));

        // Sync to Supabase
        syncContentToSupabase(newContent);

        get().updateStats();
        return newContent;
      },

      // Update content item
      updateContent: (contentId, updates) => {
        set((state) => ({
          contentItems: state.contentItems.map((item) =>
            item.id === contentId
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        }));

        // Sync to Supabase
        const updatedContent = get().contentItems.find(item => item.id === contentId);
        if (updatedContent) {
          syncContentToSupabase(updatedContent);
        }

        get().updateStats();
      },

      // Delete content item
      deleteContent: (contentId) => {
        const contentToDelete = get().contentItems.find(item => item.id === contentId);

        set((state) => ({
          contentItems: state.contentItems.filter((item) => item.id !== contentId),
        }));

        // Sync to Supabase
        if (contentToDelete) {
          syncContentToSupabase(contentToDelete, 'delete');
        }

        get().updateStats();
      },

      // Mark as completed
      completeContent: (contentId, completionData) => {
        const { rating, qualityScore, keyTakeaways, timeSpent } = completionData;
        set((state) => ({
          contentItems: state.contentItems.map((item) =>
            item.id === contentId
              ? {
                  ...item,
                  status: 'completed',
                  dateCompleted: new Date().toISOString(),
                  rating: rating || item.rating,
                  qualityScore: qualityScore || item.qualityScore,
                  keyTakeaways: keyTakeaways || item.keyTakeaways,
                  timeSpent: timeSpent || item.timeSpent,
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));

        // Sync to Supabase
        const updatedContent = get().contentItems.find(item => item.id === contentId);
        if (updatedContent) {
          syncContentToSupabase(updatedContent);
        }

        get().updateStats();
      },

      // Add key takeaway
      addTakeaway: (contentId, takeaway) => {
        set((state) => ({
          contentItems: state.contentItems.map((item) =>
            item.id === contentId
              ? {
                  ...item,
                  keyTakeaways: [...item.keyTakeaways, takeaway],
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));

        // Sync to Supabase
        const updatedContent = get().contentItems.find(item => item.id === contentId);
        if (updatedContent) {
          syncContentToSupabase(updatedContent);
        }
      },

      // Update implementation status
      updateImplementation: (contentId, implementationStatus, notes) => {
        set((state) => ({
          contentItems: state.contentItems.map((item) =>
            item.id === contentId
              ? {
                  ...item,
                  implementationStatus,
                  implementationNotes: notes || item.implementationNotes,
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));

        // Sync to Supabase
        const updatedContent = get().contentItems.find(item => item.id === contentId);
        if (updatedContent) {
          syncContentToSupabase(updatedContent);
        }

        get().updateStats();
      },

      // Update stats
      updateStats: () => {
        const { contentItems } = get();
        const completed = contentItems.filter((item) => item.status === 'completed');
        const implemented = contentItems.filter(
          (item) => item.implementationStatus === 'implemented'
        );

        const totalTimeSpent = contentItems.reduce(
          (sum, item) => sum + (item.timeSpent || 0),
          0
        );

        const qualityScores = completed
          .filter((item) => item.qualityScore > 0)
          .map((item) => item.qualityScore);
        const qualityAverage =
          qualityScores.length > 0
            ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
            : 0;

        const implementationRate =
          completed.length > 0 ? (implemented.length / completed.length) * 100 : 0;

        set({
          stats: {
            totalConsumed: completed.length,
            totalTimeSpent,
            implementationRate,
            qualityAverage,
          },
        });
      },

      // Getters
      getContentById: (contentId) => {
        return get().contentItems.find((item) => item.id === contentId);
      },

      getContentByType: (type) => {
        return get().contentItems.filter((item) => item.type === type);
      },

      getContentByStatus: (status) => {
        return get().contentItems.filter((item) => item.status === status);
      },

      getInProgress: () => {
        return get().contentItems.filter((item) => item.status === 'in_progress');
      },

      getCompleted: () => {
        return get().contentItems.filter((item) => item.status === 'completed');
      },

      getPlanned: () => {
        return get().contentItems.filter((item) => item.status === 'planned');
      },

      getByCategory: (category) => {
        return get().contentItems.filter((item) => item.category === category);
      },

      // Analytics
      getConsumptionByType: () => {
        const { contentItems } = get();
        const types = ['book', 'podcast', 'video', 'article', 'course'];
        return types.map((type) => ({
          type,
          count: contentItems.filter((item) => item.type === type && item.status === 'completed').length,
          timeSpent: contentItems
            .filter((item) => item.type === type && item.status === 'completed')
            .reduce((sum, item) => sum + (item.timeSpent || 0), 0),
        }));
      },

      getConsumptionTrend: (days = 30) => {
        const { contentItems } = get();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return contentItems.filter(
          (item) =>
            item.status === 'completed' &&
            new Date(item.dateCompleted) >= cutoff
        ).length;
      },

      getImplementationRate: () => {
        const completed = get().getCompleted();
        const implemented = completed.filter(
          (item) => item.implementationStatus === 'implemented'
        );
        return completed.length > 0 ? (implemented.length / completed.length) * 100 : 0;
      },

      // Consumption vs Creation time (requires integration with productivity module)
      getConsumptionVsCreation: () => {
        const totalConsumption = get().stats.totalTimeSpent;
        // This would integrate with productivity/calendar modules
        // For now, just return consumption time
        return {
          consumption: totalConsumption,
          creation: 0, // TODO: Integrate with time blocking
          ratio: 0,
        };
      },
    }),
    {
      name: 'lifeos-content',
      partialize: (state) => ({
        contentItems: state.contentItems,
        stats: state.stats,
      }),
    }
  )
);

// Initialize content store from Supabase
export const initializeContentStore = async (userId = null) => {
  const store = useContentStore.getState();
  await store.initializeFromSupabase(userId);
};
