import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ==================== NOTES ====================

export function useNotes(filters = {}) {
  return useQuery({
    queryKey: ['notes', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('knowledge_notes')
        .select('*')
        .eq('user_id', user.id);

      if (filters.archived !== undefined) {
        query = query.eq('archived', filters.archived);
      } else {
        query = query.eq('archived', false);
      }

      if (filters.pinned !== undefined) {
        query = query.eq('pinned', filters.pinned);
      }

      if (filters.folderPath) {
        query = query.eq('folder_path', filters.folderPath);
      }

      query = query.order('updated_at', { ascending: false });

      const { data, error} = await query;

      if (error) throw error;
      return data;
    },
  });
}

// GET single note
export function useNote(id) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// CREATE note
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('knowledge_notes')
        .insert({ ...note, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Parse [[wikilinks]] and create links
      await createLinksFromContent(data.id, note.content, user.id);

      // Add to timeline
      await supabase.from('timeline_events').insert({
        user_id: user.id,
        module_id: 'knowledge',
        event_type: 'note_created',
        title: note.title,
        metadata: { note_id: data.id },
        xp_earned: 10,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

// UPDATE note
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('knowledge_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update links if content changed
      if (updates.content) {
        const { data: { user } } = await supabase.auth.getUser();

        // Delete existing links from this note
        await supabase
          .from('knowledge_links')
          .delete()
          .eq('source_note_id', id);

        // Create new links
        await createLinksFromContent(id, updates.content, user.id);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', data.id] });
      queryClient.invalidateQueries({ queryKey: ['note-links'] });
    },
  });
}

// DELETE note
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId) => {
      const { error } = await supabase
        .from('knowledge_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// SEARCH notes (full-text search)
export function useSearchNotes(query) {
  return useQuery({
    queryKey: ['notes-search', query],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('knowledge_notes')
        .select('*')
        .eq('user_id', user.id)
        .textSearch('content_vector', query)
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: query && query.length > 2,
  });
}

// GET note links (bidirectional)
export function useNoteLinks(noteId) {
  return useQuery({
    queryKey: ['note-links', noteId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // Get outgoing links (from this note)
      const { data: outgoing, error: outError } = await supabase
        .from('knowledge_links')
        .select(`
          id,
          target_note_id,
          link_type,
          target:knowledge_notes!target_note_id(id, title)
        `)
        .eq('source_note_id', noteId);

      if (outError) throw outError;

      // Get incoming links (to this note)
      const { data: incoming, error: inError } = await supabase
        .from('knowledge_links')
        .select(`
          id,
          source_note_id,
          link_type,
          source:knowledge_notes!source_note_id(id, title)
        `)
        .eq('target_note_id', noteId);

      if (inError) throw inError;

      return { outgoing, incoming };
    },
    enabled: !!noteId,
  });
}

// Helper function to parse [[wikilinks]] and create links
async function createLinksFromContent(sourceNoteId, content, userId) {
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
  const matches = content.matchAll(wikiLinkRegex);
  const linkedTitles = Array.from(matches, m => m[1]);

  if (linkedTitles.length === 0) return;

  // Find notes with these titles
  const { data: targetNotes } = await supabase
    .from('knowledge_notes')
    .select('id, title')
    .eq('user_id', userId)
    .in('title', linkedTitles);

  if (!targetNotes || targetNotes.length === 0) return;

  // Create link records
  const links = targetNotes.map(target => ({
    user_id: userId,
    source_note_id: sourceNoteId,
    target_note_id: target.id,
    link_type: 'reference',
  }));

  await supabase.from('knowledge_links').insert(links);
}

// ==================== MEDIA (Books, Videos, etc.) ====================

export function useMedia(filters = {}) {
  return useQuery({
    queryKey: ['media', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('knowledge_media')
        .select('*')
        .eq('user_id', user.id);

      if (filters.mediaType) {
        query = query.eq('media_type', filters.mediaType);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      query = query.order('updated_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (media) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('knowledge_media')
        .insert({ ...media, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('knowledge_media')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // If marking as completed, add to timeline
      if (updates.status === 'completed') {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('timeline_events').insert({
          user_id: user.id,
          module_id: 'knowledge',
          event_type: 'media_completed',
          title: `Completed: ${data.title}`,
          metadata: { media_id: id, media_type: data.media_type },
          xp_earned: 20,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}
