import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// GET user's rewards
export function useRewards() {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_available', true)
        .order('cost', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// CREATE new reward
export function useCreateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reward) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('rewards')
        .insert({
          ...reward,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

// UPDATE reward
export function useUpdateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

// DELETE reward
export function useDeleteReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rewardId) => {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}

// REDEEM reward (purchase with credits)
export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rewardId) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Get reward details
      const { data: reward, error: rewardError } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', rewardId)
        .single();

      if (rewardError) throw rewardError;

      // Check if user has enough credits
      const { data: currency } = await supabase
        .from('user_cosmic_currency')
        .select('cosmic_credits, lifetime_credits_spent')
        .eq('user_id', user.id)
        .single();

      if (currency.cosmic_credits < reward.cost) {
        throw new Error('Insufficient credits');
      }

      // Deduct credits
      const { error: updateError } = await supabase
        .from('user_cosmic_currency')
        .update({
          cosmic_credits: currency.cosmic_credits - reward.cost,
          lifetime_credits_spent: (currency.lifetime_credits_spent || 0) + reward.cost,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log redemption
      const { data: redemption, error: redemptionError } = await supabase
        .from('reward_redemptions')
        .insert({
          user_id: user.id,
          reward_id: rewardId,
          cost_paid: reward.cost,
        })
        .select()
        .single();

      if (redemptionError) throw redemptionError;

      // Log transaction
      await supabase.from('currency_transactions').insert({
        user_id: user.id,
        amount: -reward.cost,
        transaction_type: 'purchase',
        description: `Redeemed: ${reward.title}`,
        related_entity_id: redemption.id,
        related_entity_type: 'reward_redemption',
        balance_after: currency.cosmic_credits - reward.cost,
      });

      return redemption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['cosmic-currency'] });
      queryClient.invalidateQueries({ queryKey: ['currency-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reward-redemptions'] });
    },
  });
}

// GET reward redemption history
export function useRewardRedemptions() {
  return useQuery({
    queryKey: ['reward-redemptions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          reward:rewards(*)
        `)
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
