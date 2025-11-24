import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ==================== PROJECTS ====================

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('productivity_projects')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'paused'])
        .order('priority', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('productivity_projects')
        .insert({ ...project, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('productivity_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ==================== TASKS ====================

export function useTasks(filters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('productivity_tasks')
        .select('*')
        .eq('user_id', user.id);

      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        query = query.in('status', ['todo', 'in_progress']);
      }

      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
      }

      query = query.order('position', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('productivity_tasks')
        .insert({ ...task, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('productivity_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId) => {
      const { data, error } = await supabase
        .from('productivity_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Add to timeline
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('timeline_events').insert({
        user_id: user.id,
        module_id: 'productivity',
        event_type: 'task_completed',
        title: `Completed: ${data.title}`,
        metadata: { task_id: taskId },
        xp_earned: 10,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

// ==================== SESSIONS ====================

export function useSessions(date) {
  return useQuery({
    queryKey: ['sessions', date],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('productivity_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', startOfDay.toISOString())
        .lte('started_at', endOfDay.toISOString())
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('productivity_sessions')
        .insert({ ...session, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Add to timeline
      await supabase.from('timeline_events').insert({
        user_id: user.id,
        module_id: 'productivity',
        event_type: 'session_logged',
        title: session.title,
        metadata: {
          session_id: data.id,
          duration_minutes: session.actual_duration_minutes,
        },
        xp_earned: Math.floor(session.actual_duration_minutes / 10),
      });

      return data;
    },
    onSuccess: (data) => {
      const date = new Date(data.started_at).toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['sessions', date] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

// ==================== INCOME ====================

export function useIncome(filters = {}) {
  return useQuery({
    queryKey: ['income', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('productivity_income')
        .select('*')
        .eq('user_id', user.id);

      if (filters.startDate) {
        query = query.gte('income_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('income_date', filters.endDate);
      }

      query = query.order('income_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (income) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('productivity_income')
        .insert({ ...income, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
    },
  });
}
