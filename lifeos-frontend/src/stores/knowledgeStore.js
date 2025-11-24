/**
 * Knowledge Module Store - Zustand
 * Manages all state for notes, books, media, tags, and collections
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SAMPLE_NOTES,
  SAMPLE_BOOKS,
  SAMPLE_MEDIA,
  SAMPLE_TAGS,
  SAMPLE_COLLECTIONS,
} from '../data/knowledgeData';

export const useKnowledgeStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // DATA STATE
      // ============================================
      notes: SAMPLE_NOTES,
      books: SAMPLE_BOOKS,
      media: SAMPLE_MEDIA,
      tags: SAMPLE_TAGS,
      collections: SAMPLE_COLLECTIONS,
      projects: [], // Cosmic projects system

      // ============================================
      // UI STATE
      // ============================================
      activeView: 'all-notes', // 'all-notes' | 'note-detail' | 'books' | 'media' | 'tags' | 'collections'
      activeItemId: null, // Currently selected note/book/media ID
      sidebarCollapsed: false,
      searchQuery: '',
      searchResults: [],
      isSearching: false,

      // ============================================
      // NOTES ACTIONS
      // ============================================

      /**
       * Create a new note
       */
      createNote: (noteData = {}) => {
        const newNote = {
          id: `note-${Date.now()}`,
          title: noteData.title || 'Untitled Note',
          content: noteData.content || '',
          tags: noteData.tags || [],
          linkedTo: noteData.linkedTo || [],
          linkedFrom: [],
          mediaAttachments: noteData.mediaAttachments || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFavorite: false,
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
          activeView: 'note-detail',
          activeItemId: newNote.id,
        }));

        return newNote.id;
      },

      /**
       * Update an existing note
       */
      updateNote: (noteId, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : note
          ),
        }));
      },

      /**
       * Delete a note
       */
      deleteNote: (noteId) => {
        set((state) => {
          // Remove note from linkedFrom arrays of other notes
          const updatedNotes = state.notes
            .filter((note) => note.id !== noteId)
            .map((note) => ({
              ...note,
              linkedFrom: note.linkedFrom.filter((id) => id !== noteId),
              linkedTo: note.linkedTo.filter((id) => id !== noteId),
            }));

          return {
            notes: updatedNotes,
            activeView: state.activeItemId === noteId ? 'all-notes' : state.activeView,
            activeItemId: state.activeItemId === noteId ? null : state.activeItemId,
          };
        });
      },

      /**
       * Toggle favorite status for a note
       */
      toggleNoteFavorite: (noteId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? { ...note, isFavorite: !note.isFavorite }
              : note
          ),
        }));
      },

      /**
       * Add a wiki link between two notes
       */
      addNoteLink: (sourceNoteId, targetNoteId) => {
        set((state) => ({
          notes: state.notes.map((note) => {
            if (note.id === sourceNoteId && !note.linkedTo.includes(targetNoteId)) {
              return { ...note, linkedTo: [...note.linkedTo, targetNoteId] };
            }
            if (note.id === targetNoteId && !note.linkedFrom.includes(sourceNoteId)) {
              return { ...note, linkedFrom: [...note.linkedFrom, sourceNoteId] };
            }
            return note;
          }),
        }));
      },

      /**
       * Add tag to a note
       */
      addTagToNote: (noteId, tag) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId && !note.tags.includes(tag)
              ? { ...note, tags: [...note.tags, tag] }
              : note
          ),
        }));

        // Update tag count
        get().updateTagCount(tag);
      },

      /**
       * Remove tag from a note
       */
      removeTagFromNote: (noteId, tag) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? { ...note, tags: note.tags.filter((t) => t !== tag) }
              : note
          ),
        }));

        // Update tag count
        get().updateTagCount(tag);
      },

      // ============================================
      // BOOKS ACTIONS
      // ============================================

      /**
       * Add a new book
       */
      addBook: (bookData) => {
        const newBook = {
          id: `book-${Date.now()}`,
          type: 'book',
          title: bookData.title || 'Untitled Book',
          author: bookData.author || 'Unknown',
          coverImage: bookData.coverImage || null,
          description: bookData.description || '',
          status: bookData.status || 'want-to-read',
          rating: bookData.rating || null,
          progress: bookData.progress || { current: 0, total: 0, unit: 'chapter' },
          notes: [],
          tags: bookData.tags || [],
          startedAt: bookData.status === 'reading' ? new Date().toISOString() : null,
          completedAt: null,
          createdAt: new Date().toISOString(),
          isFavorite: false,
          metadata: bookData.metadata || {},
        };

        set((state) => ({
          books: [newBook, ...state.books],
        }));

        return newBook.id;
      },

      /**
       * Update a book
       */
      updateBook: (bookId, updates) => {
        set((state) => ({
          books: state.books.map((book) => {
            if (book.id === bookId) {
              const updatedBook = { ...book, ...updates };

              // Auto-set timestamps based on status changes
              if (updates.status === 'reading' && !book.startedAt) {
                updatedBook.startedAt = new Date().toISOString();
              }
              if (updates.status === 'completed' && !book.completedAt) {
                updatedBook.completedAt = new Date().toISOString();
              }

              return updatedBook;
            }
            return book;
          }),
        }));
      },

      /**
       * Delete a book
       */
      deleteBook: (bookId) => {
        set((state) => ({
          books: state.books.filter((book) => book.id !== bookId),
          activeView: state.activeItemId === bookId ? 'books' : state.activeView,
          activeItemId: state.activeItemId === bookId ? null : state.activeItemId,
        }));
      },

      /**
       * Link a note to a book
       */
      linkNoteToBook: (noteId, bookId) => {
        set((state) => ({
          books: state.books.map((book) =>
            book.id === bookId && !book.notes.includes(noteId)
              ? { ...book, notes: [...book.notes, noteId] }
              : book
          ),
          notes: state.notes.map((note) =>
            note.id === noteId && !note.linkedTo.includes(bookId)
              ? { ...note, linkedTo: [...note.linkedTo, bookId] }
              : note
          ),
        }));
      },

      // ============================================
      // MEDIA ACTIONS
      // ============================================

      /**
       * Add new media item
       */
      addMedia: (mediaData) => {
        const newMedia = {
          id: `media-${Date.now()}`,
          type: mediaData.type || 'youtube',
          title: mediaData.title || 'Untitled Media',
          creator: mediaData.creator || 'Unknown',
          thumbnailUrl: mediaData.thumbnailUrl || null,
          url: mediaData.url || '',
          duration: mediaData.duration || '',
          status: mediaData.status || 'want-to-watch',
          notes: [],
          tags: mediaData.tags || [],
          watchedAt: null,
          createdAt: new Date().toISOString(),
          isFavorite: false,
        };

        set((state) => ({
          media: [newMedia, ...state.media],
        }));

        return newMedia.id;
      },

      /**
       * Update media item
       */
      updateMedia: (mediaId, updates) => {
        set((state) => ({
          media: state.media.map((item) => {
            if (item.id === mediaId) {
              const updatedItem = { ...item, ...updates };

              // Auto-set watchedAt when status changes to completed
              if (updates.status === 'completed' && !item.watchedAt) {
                updatedItem.watchedAt = new Date().toISOString();
              }

              return updatedItem;
            }
            return item;
          }),
        }));
      },

      /**
       * Delete media item
       */
      deleteMedia: (mediaId) => {
        set((state) => ({
          media: state.media.filter((item) => item.id !== mediaId),
          activeView: state.activeItemId === mediaId ? 'media' : state.activeView,
          activeItemId: state.activeItemId === mediaId ? null : state.activeItemId,
        }));
      },

      // ============================================
      // TAGS ACTIONS
      // ============================================

      /**
       * Create a new tag
       */
      createTag: (name, color = '#3b82f6') => {
        const existingTag = get().tags.find((t) => t.name === name);
        if (existingTag) return;

        const newTag = {
          id: `tag-${Date.now()}`,
          name,
          color,
          count: 0,
        };

        set((state) => ({
          tags: [...state.tags, newTag],
        }));
      },

      /**
       * Update tag count based on usage across notes, books, media
       */
      updateTagCount: (tagName) => {
        const state = get();
        const count =
          state.notes.filter((n) => n.tags.includes(tagName)).length +
          state.books.filter((b) => b.tags.includes(tagName)).length +
          state.media.filter((m) => m.tags.includes(tagName)).length;

        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.name === tagName ? { ...tag, count } : tag
          ),
        }));
      },

      /**
       * Delete a tag
       */
      deleteTag: (tagName) => {
        set((state) => ({
          tags: state.tags.filter((tag) => tag.name !== tagName),
          notes: state.notes.map((note) => ({
            ...note,
            tags: note.tags.filter((t) => t !== tagName),
          })),
          books: state.books.map((book) => ({
            ...book,
            tags: book.tags.filter((t) => t !== tagName),
          })),
          media: state.media.map((item) => ({
            ...item,
            tags: item.tags.filter((t) => t !== tagName),
          })),
        }));
      },

      // ============================================
      // COLLECTIONS ACTIONS
      // ============================================

      /**
       * Create a new collection
       */
      createCollection: (collectionData) => {
        const newCollection = {
          id: `collection-${Date.now()}`,
          name: collectionData.name || 'Untitled Collection',
          icon: collectionData.icon || '📁',
          description: collectionData.description || '',
          items: collectionData.items || [],
          color: collectionData.color || '#8b5cf6',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          collections: [...state.collections, newCollection],
        }));

        return newCollection.id;
      },

      /**
       * Update a collection
       */
      updateCollection: (collectionId, updates) => {
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId ? { ...col, ...updates } : col
          ),
        }));
      },

      /**
       * Delete a collection
       */
      deleteCollection: (collectionId) => {
        set((state) => ({
          collections: state.collections.filter((col) => col.id !== collectionId),
        }));
      },

      /**
       * Add item to collection
       */
      addItemToCollection: (collectionId, itemId) => {
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId && !col.items.includes(itemId)
              ? { ...col, items: [...col.items, itemId] }
              : col
          ),
        }));
      },

      /**
       * Remove item from collection
       */
      removeItemFromCollection: (collectionId, itemId) => {
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId
              ? { ...col, items: col.items.filter((id) => id !== itemId) }
              : col
          ),
        }));
      },

      // ============================================
      // PROJECTS ACTIONS
      // ============================================

      /**
       * Create a new project
       */
      createProject: (projectData) => {
        const newProject = {
          id: `project-${Date.now()}`,
          title: projectData.title || 'Untitled Project',
          goal: projectData.goal || '',
          status: projectData.status || 'nebula', // 'nebula' | 'nova' | 'cosmos'
          module: projectData.module || 'knowledge',
          goals: projectData.goals || [],
          tasks: projectData.tasks || [],
          notes: projectData.notes || '',
          tags: projectData.tags || [],
          startDate: projectData.startDate || null,
          targetDate: projectData.targetDate || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: [newProject, ...state.projects],
        }));

        return newProject.id;
      },

      /**
       * Update a project
       */
      updateProject: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : project
          ),
        }));
      },

      /**
       * Delete a project
       */
      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== projectId),
        }));
      },

      /**
       * Add goal to project
       */
      addGoalToProject: (projectId, goalData) => {
        const newGoal = {
          id: `goal-${Date.now()}`,
          title: goalData.title || 'Untitled Goal',
          completed: false,
          tasks: [],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, goals: [...project.goals, newGoal] }
              : project
          ),
        }));

        return newGoal.id;
      },

      /**
       * Add task to project
       */
      addTaskToProject: (projectId, taskData) => {
        const newTask = {
          id: `task-${Date.now()}`,
          title: taskData.title || 'Untitled Task',
          completed: false,
          priority: taskData.priority || 'medium',
          dueDate: taskData.dueDate || null,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, tasks: [...project.tasks, newTask] }
              : project
          ),
        }));

        return newTask.id;
      },

      /**
       * Toggle task completion
       */
      toggleTaskCompletion: (projectId, taskId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  tasks: project.tasks.map((task) =>
                    task.id === taskId ? { ...task, completed: !task.completed } : task
                  ),
                }
              : project
          ),
        }));
      },

      // ============================================
      // SEARCH ACTIONS
      // ============================================

      /**
       * Search across all content types
       */
      search: (query) => {
        set({ searchQuery: query, isSearching: true });

        if (!query.trim()) {
          set({ searchResults: [], isSearching: false });
          return;
        }

        const state = get();
        const lowerQuery = query.toLowerCase();

        // Search notes
        const noteResults = state.notes
          .filter(
            (note) =>
              note.title.toLowerCase().includes(lowerQuery) ||
              note.content.toLowerCase().includes(lowerQuery) ||
              note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
          )
          .map((note) => ({ ...note, type: 'note' }));

        // Search books
        const bookResults = state.books
          .filter(
            (book) =>
              book.title.toLowerCase().includes(lowerQuery) ||
              book.author.toLowerCase().includes(lowerQuery) ||
              book.description.toLowerCase().includes(lowerQuery) ||
              book.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
          )
          .map((book) => ({ ...book, type: 'book' }));

        // Search media
        const mediaResults = state.media
          .filter(
            (item) =>
              item.title.toLowerCase().includes(lowerQuery) ||
              item.creator.toLowerCase().includes(lowerQuery) ||
              item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
          )
          .map((item) => ({ ...item, type: 'media' }));

        set({
          searchResults: [...noteResults, ...bookResults, ...mediaResults],
          isSearching: false,
        });
      },

      /**
       * Clear search
       */
      clearSearch: () => {
        set({ searchQuery: '', searchResults: [], isSearching: false });
      },

      // ============================================
      // UI ACTIONS
      // ============================================

      /**
       * Set active view
       */
      setActiveView: (view, itemId = null) => {
        set({ activeView: view, activeItemId: itemId });
      },

      /**
       * Toggle sidebar collapsed state
       */
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      // ============================================
      // UTILITY GETTERS
      // ============================================

      /**
       * Get a note by ID
       */
      getNoteById: (noteId) => {
        return get().notes.find((note) => note.id === noteId);
      },

      /**
       * Get a book by ID
       */
      getBookById: (bookId) => {
        return get().books.find((book) => book.id === bookId);
      },

      /**
       * Get a media item by ID
       */
      getMediaById: (mediaId) => {
        return get().media.find((item) => item.id === mediaId);
      },

      /**
       * Get all items with a specific tag
       */
      getItemsByTag: (tagName) => {
        const state = get();
        return {
          notes: state.notes.filter((note) => note.tags.includes(tagName)),
          books: state.books.filter((book) => book.tags.includes(tagName)),
          media: state.media.filter((item) => item.tags.includes(tagName)),
        };
      },

      /**
       * Get favorite items
       */
      getFavorites: () => {
        const state = get();
        return {
          notes: state.notes.filter((note) => note.isFavorite),
          books: state.books.filter((book) => book.isFavorite),
          media: state.media.filter((item) => item.isFavorite),
        };
      },
    }),
    {
      name: 'lifeos-knowledge', // localStorage key
      partialize: (state) => ({
        // Only persist data, not UI state
        notes: state.notes,
        books: state.books,
        media: state.media,
        tags: state.tags,
        collections: state.collections,
        projects: state.projects,
      }),
    }
  )
);
