import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// GET timeline events
export function useTimeline(filters = {}) {
  return useQuery({
    queryKey: ['timeline', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('timeline_events')
        .select('*')
        .eq('user_id', user.id);

      if (filters.moduleId) {
        query = query.eq('module_id', filters.moduleId);
      }

      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.startDate) {
        query = query.gte('event_timestamp', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('event_timestamp', filters.endDate);
      }

      query = query.order('event_timestamp', { ascending: false });

      if (filters.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(50); // Default limit
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

// GET module progress
export function useModuleProgress() {
  return useQuery({
    queryKey: ['module-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
  });
}
