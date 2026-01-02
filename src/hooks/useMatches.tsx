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

export interface SetScores {
  set1: { a: number; b: number };
  set2: { a: number; b: number };
  set3: { a: number; b: number };
}

export interface Match {
  id: string;
  playerA: Player;
  playerA2?: Player;
  playerB: Player;
  playerB2?: Player;
  scoreA: number;
  scoreB: number;
  setsWonA: number;
  setsWonB: number;
  currentSet: number;
  setScores: SetScores;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  scheduledAt: Date;
  court: string;
  category: 'Mens Singles' | 'Womens Singles' | 'Mens Doubles' | 'Womens Doubles' | 'Mixed Doubles';
  winner?: Player;
}

interface MatchWithPlayers extends MatchRow {
  player_a: Database['public']['Tables']['players']['Row'];
  player_a2: Database['public']['Tables']['players']['Row'] | null;
  player_b: Database['public']['Tables']['players']['Row'];
  player_b2: Database['public']['Tables']['players']['Row'] | null;
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
  playerA2: row.player_a2 ? mapPlayerRow(row.player_a2) : undefined,
  playerB: mapPlayerRow(row.player_b),
  playerB2: row.player_b2 ? mapPlayerRow(row.player_b2) : undefined,
  scoreA: row.score_a,
  scoreB: row.score_b,
  setsWonA: row.sets_won_a,
  setsWonB: row.sets_won_b,
  currentSet: row.current_set,
  setScores: {
    set1: { a: row.set1_score_a, b: row.set1_score_b },
    set2: { a: row.set2_score_a, b: row.set2_score_b },
    set3: { a: row.set3_score_a, b: row.set3_score_b },
  },
  status: row.status as Match['status'],
  scheduledAt: new Date(row.scheduled_at),
  court: row.court,
  category: row.category as Match['category'],
  winner: row.winner ? mapPlayerRow(row.winner) : undefined,
});

export function useMatches() {
  const queryClient = useQueryClient();

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
          player_a2:players!matches_player_a2_id_fkey(*),
          player_b:players!matches_player_b_id_fkey(*),
          player_b2:players!matches_player_b2_id_fkey(*),
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
      playerA2Id,
      playerBId, 
      playerB2Id,
      scheduledAt, 
      court, 
      category 
    }: { 
      playerAId: string; 
      playerA2Id?: string;
      playerBId: string; 
      playerB2Id?: string;
      scheduledAt: Date; 
      court: string; 
      category: PlayerCategory;
    }) => {
      const insert: MatchInsert = {
        player_a_id: playerAId,
        player_a2_id: playerA2Id || null,
        player_b_id: playerBId,
        player_b2_id: playerB2Id || null,
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

export function useUpdateSetScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      matchId, 
      playerSide, 
      setNumber 
    }: { 
      matchId: string; 
      playerSide: 'A' | 'B'; 
      setNumber: 1 | 2 | 3;
    }) => {
      const scoreColumn = `set${setNumber}_score_${playerSide.toLowerCase()}` as const;
      
      // Get current score
      const { data: match, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();
      
      if (fetchError) throw fetchError;

      const currentScore = match[scoreColumn as keyof typeof match] as number;
      
      const { error } = await supabase
        .from('matches')
        .update({ [scoreColumn]: currentScore + 1 })
        .eq('id', matchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useEndSet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      matchId, 
      setWinner 
    }: { 
      matchId: string; 
      setWinner: 'A' | 'B';
    }) => {
      const { data: match, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();
      
      if (fetchError) throw fetchError;

      const newSetsWonA = setWinner === 'A' ? match.sets_won_a + 1 : match.sets_won_a;
      const newSetsWonB = setWinner === 'B' ? match.sets_won_b + 1 : match.sets_won_b;
      const newCurrentSet = Math.min(match.current_set + 1, 3);

      const { error } = await supabase
        .from('matches')
        .update({
          sets_won_a: newSetsWonA,
          sets_won_b: newSetsWonB,
          current_set: newCurrentSet,
        })
        .eq('id', matchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: "Set Complete",
        description: "Moving to the next set.",
      });
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

// Legacy hook for backward compatibility - updates current set score
export function useUpdateScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, playerSide }: { matchId: string; playerSide: 'A' | 'B' }) => {
      // Get current match to know which set we're in
      const { data: match, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();
      
      if (fetchError) throw fetchError;

      const currentSet = match.current_set as 1 | 2 | 3;
      const scoreColumn = `set${currentSet}_score_${playerSide.toLowerCase()}`;
      const currentScore = match[scoreColumn as keyof typeof match] as number;

      const { error } = await supabase
        .from('matches')
        .update({ [scoreColumn]: currentScore + 1 })
        .eq('id', matchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
