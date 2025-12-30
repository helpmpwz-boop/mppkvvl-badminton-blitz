import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { Player } from './usePlayers';

type MatchRow = Database['public']['Tables']['matches']['Row'];
type MatchInsert = Database['public']['Tables']['matches']['Insert'];
type MatchStatus = Database['public']['Enums']['match_status'];
type PlayerCategory = Database['public']['Enums']['player_category'];

export interface Match {
  id: string;
  playerA: Player;
  playerB: Player;
  scoreA: number;
  scoreB: number;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  scheduledAt: Date;
  court: string;
  category: 'Mens Singles' | 'Womens Singles' | 'Mens Doubles' | 'Womens Doubles' | 'Mixed Doubles';
  winner?: Player;
}

interface MatchWithPlayers extends MatchRow {
  player_a: Database['public']['Tables']['players']['Row'];
  player_b: Database['public']['Tables']['players']['Row'];
  winner: Database['public']['Tables']['players']['Row'] | null;
}

const mapPlayerRow = (row: Database['public']['Tables']['players']['Row']): Player => ({
  id: row.id,
  name: row.name,
  employeeNumber: row.employee_number,
  location: row.location,
  designation: row.designation,
  age: row.age,
  gender: row.gender as Player['gender'],
  category: row.category as Player['category'],
  team: row.team ?? undefined,
  photoUrl: row.photo_url ?? undefined,
  phone: row.phone,
  email: row.email ?? undefined,
  status: row.status as Player['status'],
  registeredAt: new Date(row.registered_at),
});

const mapRowToMatch = (row: MatchWithPlayers): Match => ({
  id: row.id,
  playerA: mapPlayerRow(row.player_a),
  playerB: mapPlayerRow(row.player_b),
  scoreA: row.score_a,
  scoreB: row.score_b,
  status: row.status as Match['status'],
  scheduledAt: new Date(row.scheduled_at),
  court: row.court,
  category: row.category as Match['category'],
  winner: row.winner ? mapPlayerRow(row.winner) : undefined,
});

export function useMatches() {
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('matches-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        () => {
          // Invalidate and refetch matches on any change
          queryClient.invalidateQueries({ queryKey: ['matches'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          player_a:players!matches_player_a_id_fkey(*),
          player_b:players!matches_player_b_id_fkey(*),
          winner:players!matches_winner_id_fkey(*)
        `)
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      return (data ?? []).map((row) => mapRowToMatch(row as unknown as MatchWithPlayers));
    },
  });
}

export function useAddMatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      playerAId, 
      playerBId, 
      scheduledAt, 
      court, 
      category 
    }: { 
      playerAId: string; 
      playerBId: string; 
      scheduledAt: Date; 
      court: string; 
      category: PlayerCategory;
    }) => {
      const insert: MatchInsert = {
        player_a_id: playerAId,
        player_b_id: playerBId,
        scheduled_at: scheduledAt.toISOString(),
        court,
        category,
      };

      const { error } = await supabase
        .from('matches')
        .insert(insert);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: "Match Created",
        description: "The match has been scheduled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, playerSide }: { matchId: string; playerSide: 'A' | 'B' }) => {
      // First get current score
      const { data: match, error: fetchError } = await supabase
        .from('matches')
        .select('score_a, score_b')
        .eq('id', matchId)
        .single();
      
      if (fetchError) throw fetchError;

      const updateData = playerSide === 'A' 
        ? { score_a: match.score_a + 1 }
        : { score_b: match.score_b + 1 };

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useSetMatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: MatchStatus }) => {
      const { error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useCompleteMatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ matchId, winnerId }: { matchId: string; winnerId: string }) => {
      const { error } = await supabase
        .from('matches')
        .update({ 
          status: 'COMPLETED' as MatchStatus,
          winner_id: winnerId 
        })
        .eq('id', matchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: "Match Completed",
        description: "The match result has been recorded.",
      });
    },
  });
}
