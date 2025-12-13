/**
 * Knowledge Module Store - Zustand
 * Manages all state for notes, books, media, tags, and collections
 * Hybrid pattern: optimistic local updates + async Supabase sync
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { triggerGamification } from '../hooks/useGamification';

// ============================================
// SUPABASE SYNC HELPERS
// ============================================

const initializeFromSupabase = async (set, get) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    // Load notes (limit to 500 most recent)
    const { data: notes } = await supabase
      .from('knowledge_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false)
      .order('updated_at', { ascending: false })
      .limit(500);

    // Load books (limit to 200)
    const { data: books } = await supabase
      .from('knowledge_books')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(200);

    // Load media (limit to 200)
    const { data: media } = await supabase
      .from('knowledge_media')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(200);

    // Load tags (limit to 500)
    const { data: tags } = await supabase
      .from('knowledge_tags')
      .select('*')
      .eq('user_id', userId)
      .limit(500);

    // Load collections (limit to 100)
    const { data: collections } = await supabase
      .from('knowledge_collections')
      .select('*')
      .eq('user_id', userId)
      .limit(100);

    // Load projects (limit to 100)
    const { data: projects } = await supabase
      .from('knowledge_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(100);

    // Transform data
    const transformedNotes = notes?.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content || '',
      tags: n.tags || [],
      linkedTo: n.linked_to || [],
      linkedFrom: n.linked_from || [],
      mediaAttachments: n.media_attachments || [],
      createdAt: n.created_at,
      updatedAt: n.updated_at,
      isFavorite: n.is_favorite || false,
    })) || [];

    const transformedBooks = books?.map(b => ({
      id: b.id,
      type: 'book',
      title: b.title,
      author: b.author || 'Unknown',
      coverImage: b.cover_image,
      description: b.description || '',
      status: b.status || 'want-to-read',
      rating: b.rating,
      progress: { current: b.progress_current || 0, total: b.progress_total || 0, unit: b.progress_unit || 'chapter' },
      notes: b.notes || [],
      tags: b.tags || [],
      startedAt: b.started_at,
      completedAt: b.completed_at,
      createdAt: b.created_at,
      isFavorite: b.is_favorite || false,
      metadata: b.metadata || {},
    })) || [];

    const transformedMedia = media?.map(m => ({
      id: m.id,
      type: m.media_type || 'youtube',
      title: m.title,
      creator: m.creator || m.author || 'Unknown',
      thumbnailUrl: m.thumbnail_url,
      url: m.url || '',
      duration: m.duration || '',
      status: m.status || 'want-to-watch',
      notes: m.linked_notes || [],
      tags: m.tags || [],
      watchedAt: m.watched_at,
      createdAt: m.created_at,
      isFavorite: m.is_favorite || false,
    })) || [];

    const transformedTags = tags?.map(t => ({
      id: t.id,
      name: t.name,
      color: t.color || '#3b82f6',
      count: t.count || 0,
    })) || [];

    const transformedCollections = collections?.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon || '📁',
      description: c.description || '',
      items: [],
      color: c.color || '#8b5cf6',
      createdAt: c.created_at,
    })) || [];

    const transformedProjects = projects?.map(p => ({
      id: p.id,
      title: p.title,
      goal: p.goal || '',
      status: p.status || 'nebula',
      module: p.module || 'knowledge',
      goals: p.goals || [],
      tasks: p.tasks || [],
      notes: p.notes || '',
      tags: p.tags || [],
      startDate: p.start_date,
      targetDate: p.target_date,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    })) || [];

    // Always set from Supabase data (even if empty)
    set({
      notes: transformedNotes,
      books: transformedBooks,
      media: transformedMedia,
      tags: transformedTags,
      collections: transformedCollections,
      projects: transformedProjects,
      isInitialized: true,
    });

    console.log('Knowledge store initialized from Supabase');
  } catch (error) {
    console.error('Error initializing knowledge store from Supabase:', error);
    set({ isInitialized: true }); // Mark as initialized even on error to prevent infinite retries
  }
};

const syncNoteToSupabase = async (note, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase.from('knowledge_notes').update({ archived: true }).eq('id', note.id).eq('user_id', userId);
    } else {
      await supabase.from('knowledge_notes').upsert({
        id: note.id,
        user_id: userId,
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        linked_to: note.linkedTo || [],
        linked_from: note.linkedFrom || [],
        media_attachments: note.mediaAttachments || [],
        is_favorite: note.isFavorite || false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing note to Supabase:', error);
  }
};

const syncBookToSupabase = async (book, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase.from('knowledge_books').delete().eq('id', book.id).eq('user_id', userId);
    } else {
      await supabase.from('knowledge_books').upsert({
        id: book.id,
        user_id: userId,
        title: book.title,
        author: book.author,
        cover_image: book.coverImage,
        description: book.description,
        status: book.status,
        rating: book.rating,
        progress_current: book.progress?.current || 0,
        progress_total: book.progress?.total || 0,
        progress_unit: book.progress?.unit || 'chapter',
        notes: book.notes || [],
        tags: book.tags || [],
        started_at: book.startedAt,
        completed_at: book.completedAt,
        is_favorite: book.isFavorite || false,
        metadata: book.metadata || {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing book to Supabase:', error);
  }
};

const syncMediaToSupabase = async (media, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase.from('knowledge_media').delete().eq('id', media.id).eq('user_id', userId);
    } else {
      await supabase.from('knowledge_media').upsert({
        id: media.id,
        user_id: userId,
        media_type: media.type,
        title: media.title,
        creator: media.creator,
        thumbnail_url: media.thumbnailUrl,
        url: media.url,
        duration: media.duration,
        status: media.status,
        linked_notes: media.notes || [],
        tags: media.tags || [],
        watched_at: media.watchedAt,
        is_favorite: media.isFavorite || false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing media to Supabase:', error);
  }
};

const syncTagToSupabase = async (tag, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase.from('knowledge_tags').delete().eq('name', tag.name).eq('user_id', userId);
    } else {
      await supabase.from('knowledge_tags').upsert({
        id: tag.id,
        user_id: userId,
        name: tag.name,
        color: tag.color,
        count: tag.count || 0,
      }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing tag to Supabase:', error);
  }
};

const syncCollectionToSupabase = async (collection, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase.from('knowledge_collections').delete().eq('id', collection.id).eq('user_id', userId);
    } else {
      await supabase.from('knowledge_collections').upsert({
        id: collection.id,
        user_id: userId,
        name: collection.name,
        description: collection.description,
        color: collection.color,
        icon: collection.icon,
        item_count: collection.items?.length || 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing collection to Supabase:', error);
  }
};

const syncProjectToSupabase = async (project, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase.from('knowledge_projects').delete().eq('id', project.id).eq('user_id', userId);
    } else {
      await supabase.from('knowledge_projects').upsert({
        id: project.id,
        user_id: userId,
        title: project.title,
        goal: project.goal,
        status: project.status,
        module: project.module,
        goals: project.goals || [],
        tasks: project.tasks || [],
        notes: project.notes,
        tags: project.tags || [],
        start_date: project.startDate,
        target_date: project.targetDate,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }
  } catch (error) {
    console.error('Error syncing project to Supabase:', error);
  }
};

export const useKnowledgeStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // DATA STATE
      // ============================================
      notes: [],
      books: [],
      media: [],
      tags: [],
      collections: [],
      projects: [],
      isInitialized: false,

      // ============================================
      // UI STATE
      // ============================================
      activeView: 'all-notes', // 'all-notes' | 'note-detail' | 'books' | 'media' | 'tags' | 'collections'
      activeItemId: null, // Currently selected note/book/media ID
      sidebarCollapsed: false,
      searchQuery: '',
      searchResults: [],
      isSearching: false,

      // Initialize from Supabase
      initializeFromSupabase: () => initializeFromSupabase(set, get),

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
        syncNoteToSupabase(newNote);

        // Award XP for creating a note
        triggerGamification('noteCreated', {
          xpOverride: 15,
          module: 'knowledge',
        });

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
        const note = get().notes.find(n => n.id === noteId);
        if (note) syncNoteToSupabase(note);
      },

      /**
       * Delete a note
       */
      deleteNote: (noteId) => {
        const note = get().notes.find(n => n.id === noteId);
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
        if (note) syncNoteToSupabase(note, 'delete');
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
        const note = get().notes.find(n => n.id === noteId);
        if (note) syncNoteToSupabase(note);
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
        syncBookToSupabase(newBook);

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
                // Award XP for completing a book
                triggerGamification('bookCompleted', {
                  xpOverride: 50,
                  module: 'knowledge',
                });
              }

              return updatedBook;
            }
            return book;
          }),
        }));
        const book = get().books.find(b => b.id === bookId);
        if (book) syncBookToSupabase(book);
      },

      /**
       * Delete a book
       */
      deleteBook: (bookId) => {
        const book = get().books.find(b => b.id === bookId);
        set((state) => ({
          books: state.books.filter((book) => book.id !== bookId),
          activeView: state.activeItemId === bookId ? 'books' : state.activeView,
          activeItemId: state.activeItemId === bookId ? null : state.activeItemId,
        }));
        if (book) syncBookToSupabase(book, 'delete');
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
        syncMediaToSupabase(newMedia);

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
        const media = get().media.find(m => m.id === mediaId);
        if (media) syncMediaToSupabase(media);
      },

      /**
       * Delete media item
       */
      deleteMedia: (mediaId) => {
        const media = get().media.find(m => m.id === mediaId);
        set((state) => ({
          media: state.media.filter((item) => item.id !== mediaId),
          activeView: state.activeItemId === mediaId ? 'media' : state.activeView,
          activeItemId: state.activeItemId === mediaId ? null : state.activeItemId,
        }));
        if (media) syncMediaToSupabase(media, 'delete');
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
        syncTagToSupabase(newTag);
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
        const tag = get().tags.find(t => t.name === tagName);
        if (tag) syncTagToSupabase(tag);
      },

      /**
       * Delete a tag
       */
      deleteTag: (tagName) => {
        const tag = get().tags.find(t => t.name === tagName);
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
        if (tag) syncTagToSupabase(tag, 'delete');
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
        syncCollectionToSupabase(newCollection);

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
        const collection = get().collections.find(c => c.id === collectionId);
        if (collection) syncCollectionToSupabase(collection);
      },

      /**
       * Delete a collection
       */
      deleteCollection: (collectionId) => {
        const collection = get().collections.find(c => c.id === collectionId);
        set((state) => ({
          collections: state.collections.filter((col) => col.id !== collectionId),
        }));
        if (collection) syncCollectionToSupabase(collection, 'delete');
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
        const collection = get().collections.find(c => c.id === collectionId);
        if (collection) syncCollectionToSupabase(collection);
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
        const collection = get().collections.find(c => c.id === collectionId);
        if (collection) syncCollectionToSupabase(collection);
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
        syncProjectToSupabase(newProject);

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
        const project = get().projects.find(p => p.id === projectId);
        if (project) syncProjectToSupabase(project);
      },

      /**
       * Delete a project
       */
      deleteProject: (projectId) => {
        const project = get().projects.find(p => p.id === projectId);
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== projectId),
        }));
        if (project) syncProjectToSupabase(project, 'delete');
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

// Initialize knowledge store from Supabase
export const initializeKnowledgeStore = async () => {
  const store = useKnowledgeStore.getState();
  await store.initializeFromSupabase();
};
