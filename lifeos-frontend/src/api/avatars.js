import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * Avatar generation and management hooks
 *
 * Note: Actual PixelLab generation happens server-side via MCP
 * These hooks manage the generated avatar data
 */

// GET user's avatar
export function useUserAvatar() {
  return useQuery({
    queryKey: ['user-avatar'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('user_profiles')
        .select('avatar_stage, avatar_url, avatar_animations')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

// GET avatar generation jobs (if stored)
export function useAvatarJobs() {
  return useQuery({
    queryKey: ['avatar-jobs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // This would query a custom table if we store generation jobs
      // For now, just return empty array
      return [];
    },
  });
}

// REQUEST avatar generation (triggers backend PixelLab MCP call)
export function useGenerateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stageName, level, prestige = 0, generateAnimations = true }) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Call your backend API endpoint that uses PixelLab MCP
      // For now, this is a placeholder - you'll need to implement the backend endpoint
      const response = await fetch('/api/avatars/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          stage_name: stageName,
          level,
          prestige,
          generate_animations: generateAnimations,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate avatar');
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-avatar'] });
      queryClient.invalidateQueries({ queryKey: ['avatar-jobs'] });
    },
  });
}

// UPDATE avatar URL (after generation completes)
export function useUpdateAvatarUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ avatarUrl, avatarAnimations, avatarStage }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: avatarUrl,
          avatar_animations: avatarAnimations,
          avatar_stage: avatarStage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-avatar'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

// Equipment generation (for future use)
export function useGenerateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ equipmentName, slot, rarity }) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Call backend API for equipment generation
      const response = await fetch('/api/avatars/generate-equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          equipment_name: equipmentName,
          slot,
          rarity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate equipment');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-assets'] });
    },
  });
}
