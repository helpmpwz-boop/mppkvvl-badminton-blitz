import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TournamentWinner {
  id: string;
  player_id: string;
  partner_id: string | null;
  category: string;
  position: string;
  awarded_at: string;
  player: {
    id: string;
    name: string;
    designation: string;
    location: string;
    employee_number: string;
  };
  partner?: {
    id: string;
    name: string;
    designation: string;
    location: string;
    employee_number: string;
  } | null;
}

export const useTournamentWinners = () => {
  const queryClient = useQueryClient();

  const { data: winners = [], isLoading } = useQuery({
    queryKey: ['tournament-winners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournament_winners')
        .select(`
          id,
          player_id,
          partner_id,
          category,
          position,
          awarded_at,
          player:players!tournament_winners_player_id_fkey(id, name, designation, location, employee_number),
          partner:players!tournament_winners_partner_id_fkey(id, name, designation, location, employee_number)
        `)
        .order('awarded_at', { ascending: false });

      if (error) throw error;
      return data as unknown as TournamentWinner[];
    },
  });

  // Set up realtime subscription
  useQuery({
    queryKey: ['tournament-winners-subscription'],
    queryFn: async () => {
      const channel = supabase
        .channel('tournament-winners-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tournament_winners' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['tournament-winners'] });
          }
        )
        .subscribe();

      return () => channel.unsubscribe();
    },
    staleTime: Infinity,
  });

  return { winners, isLoading };
};

export const useAddTournamentWinner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playerId,
      partnerId,
      category,
      position = 'winner',
    }: {
      playerId: string;
      partnerId?: string | null;
      category: string;
      position?: string;
    }) => {
      // First check if winner already exists for this category
      const { data: existing } = await supabase
        .from('tournament_winners')
        .select('id')
        .eq('category', category)
        .eq('position', position)
        .single();

      if (existing) {
        // Update existing winner
        const { error } = await supabase
          .from('tournament_winners')
          .update({
            player_id: playerId,
            partner_id: partnerId || null,
            awarded_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new winner
        const { error } = await supabase
          .from('tournament_winners')
          .insert({
            player_id: playerId,
            partner_id: partnerId || null,
            category,
            position,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-winners'] });
      toast.success('Tournament winner updated!');
    },
    onError: (error) => {
      toast.error('Failed to update winner: ' + error.message);
    },
  });
};

export const useRemoveTournamentWinner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (winnerId: string) => {
      const { error } = await supabase
        .from('tournament_winners')
        .delete()
        .eq('id', winnerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-winners'] });
      toast.success('Winner removed');
    },
    onError: (error) => {
      toast.error('Failed to remove winner: ' + error.message);
    },
  });
};
