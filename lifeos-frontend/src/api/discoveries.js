import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// GET all discoveries
export function useDiscoveries() {
  return useQuery({
    queryKey: ['discoveries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discoveries')
        .select('*')
        .order('rarity', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// GET user's unlocked discoveries
export function useUserDiscoveries() {
  return useQuery({
    queryKey: ['user-discoveries'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('user_discoveries')
        .select(`
          *,
          discovery:discoveries(*)
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
