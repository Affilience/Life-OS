/**
 * Content Consumption Store - Track all media consumed
 * Books, Podcasts, Videos, Articles, Courses
 * Focus on retention, application, and consumption vs creation time
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      // Create new content item
      addContent: (contentData) => {
        const newContent = {
          id: `content-${Date.now()}`,
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
        get().updateStats();
      },

      // Delete content item
      deleteContent: (contentId) => {
        set((state) => ({
          contentItems: state.contentItems.filter((item) => item.id !== contentId),
        }));
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
