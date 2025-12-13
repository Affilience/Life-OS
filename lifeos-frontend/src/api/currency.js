import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// GET user's cosmic currency
export function useCosmicCurrency() {
  return useQuery({
    queryKey: ['cosmic-currency'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('user_cosmic_currency')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no record exists, create one
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('user_cosmic_currency')
            .insert({
              user_id: user.id,
              cosmic_credits: 100,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          return newData;
        }
        throw error;
      }

      return data;
    },
  });
}

// GET currency transactions history
export function useCurrencyTransactions(limit = 50) {
  return useQuery({
    queryKey: ['currency-transactions', limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('currency_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

// SPEND credits (e.g., buying rewards)
export function useSpendCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, description, relatedEntityId, relatedEntityType }) => {
      const { data: { user } } = await supabase.auth.getUser();

      // First check if user has enough credits
      const { data: currency } = await supabase
        .from('user_cosmic_currency')
        .select('cosmic_credits, lifetime_credits_spent')
        .eq('user_id', user.id)
        .single();

      if (currency.cosmic_credits < amount) {
        throw new Error('Insufficient credits');
      }

      // Update currency
      const { data: updatedCurrency, error: updateError } = await supabase
        .from('user_cosmic_currency')
        .update({
          cosmic_credits: currency.cosmic_credits - amount,
          lifetime_credits_spent: (currency.lifetime_credits_spent || 0) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('currency_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          transaction_type: 'purchase',
          description,
          related_entity_id: relatedEntityId,
          related_entity_type: relatedEntityType,
          balance_after: updatedCurrency.cosmic_credits,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      return { currency: updatedCurrency, transaction };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cosmic-currency'] });
      queryClient.invalidateQueries({ queryKey: ['currency-transactions'] });
    },
  });
}
