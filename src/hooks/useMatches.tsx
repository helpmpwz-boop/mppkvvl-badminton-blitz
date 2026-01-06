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
        (payload) => {
          // Avoid refetching the full joined payload on every score click.
          // We patch the cached matches for UPDATE events and only refetch for INSERT/DELETE
          // (and in cases where we need the joined winner/player data).
          if (payload.eventType === 'UPDATE' && payload.new) {
            const row = payload.new as MatchRow;
            queryClient.setQueryData(['matches'], (prev: Match[] | undefined) => {
              if (!prev) return prev;
              return prev.map((m) => {
                if (m.id !== row.id) return m;
                return {
                  ...m,
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
                  // winner name/avatar requires joined query; keep existing winner object for now.
                };
              });
            });
            return;
          }

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
      // Avoid fetching huge base64 photos; select only the player fields we actually use.
      const playerCols = [
        'id',
        'name',
        'employee_number',
        'location',
        'designation',
        'age',
        'gender',
        'category',
        'team',
        // 'photo_url', // intentionally omitted for performance
        'phone',
        'email',
        'status',
        'registered_at',
        'created_at',
        'updated_at',
      ].join(',');

      const { data, error } = await supabase
        .from('matches')
        .select(
          [
            '*',
            `player_a:players!matches_player_a_id_fkey(${playerCols})`,
            `player_a2:players!matches_player_a2_id_fkey(${playerCols})`,
            `player_b:players!matches_player_b_id_fkey(${playerCols})`,
            `player_b2:players!matches_player_b2_id_fkey(${playerCols})`,
            `winner:players!matches_winner_id_fkey(${playerCols})`,
          ].join(',')
        )
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
        status: 'UPCOMING' as MatchStatus,
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
    // optimistic: update UI instantly; realtime will keep other clients in sync
    onMutate: async ({ matchId, playerSide, setNumber }) => {
      await queryClient.cancelQueries({ queryKey: ['matches'] });
      const previous = queryClient.getQueryData<Match[]>(['matches']);

      queryClient.setQueryData<Match[]>(['matches'], (prev) => {
        if (!prev) return prev;
        return prev.map((m) => {
          if (m.id !== matchId) return m;
          const key = `set${setNumber}` as const;
          const next = { ...m };
          next.setScores = {
            ...m.setScores,
            [key]: {
              a: m.setScores[key].a + (playerSide === 'A' ? 1 : 0),
              b: m.setScores[key].b + (playerSide === 'B' ? 1 : 0),
            },
          };
          return next;
        });
      });

      return { previous };
    },
    mutationFn: async ({ 
      matchId, 
      playerSide, 
      setNumber 
    }: { 
      matchId: string; 
      playerSide: 'A' | 'B'; 
      setNumber: 1 | 2 | 3;
    }) => {
      const { error } = await supabase.rpc('increment_set_score', {
        _match_id: matchId,
        _set_number: setNumber,
        _side: playerSide,
      });

      if (error) throw error;
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['matches'], ctx.previous);
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
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: MatchStatus }) => {
      const { error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId);
      
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: status === 'LIVE' ? "Match Started" : "Status Updated",
        description: status === 'LIVE' ? "The match is now live!" : `Match status changed to ${status}`,
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

// Optimized hook using database function - single round trip + optimistic UI
export function useUpdateScore() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    onMutate: async ({ matchId, playerSide }) => {
      await queryClient.cancelQueries({ queryKey: ['matches'] });
      const previous = queryClient.getQueryData<Match[]>(['matches']);

      queryClient.setQueryData<Match[]>(['matches'], (prev) => {
        if (!prev) return prev;
        return prev.map((m) => {
          if (m.id !== matchId) return m;
          const setNumber = m.currentSet as 1 | 2 | 3;
          const key = `set${setNumber}` as const;
          return {
            ...m,
            setScores: {
              ...m.setScores,
              [key]: {
                a: m.setScores[key].a + (playerSide === 'A' ? 1 : 0),
                b: m.setScores[key].b + (playerSide === 'B' ? 1 : 0),
              },
            },
          };
        });
      });

      return { previous };
    },
    mutationFn: async ({ matchId, playerSide }: { matchId: string; playerSide: 'A' | 'B' }) => {
      const { error } = await supabase.rpc('increment_current_set_score', {
        _match_id: matchId,
        _side: playerSide,
      });

      if (error) throw error;
    },
    onError: (error: Error, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['matches'], ctx.previous);
      toast({
        title: "Score Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    // no invalidate: realtime + optimistic updates keep UI fast
  });
}

// Decrement score hook for correcting mistakes
export function useDecrementScore() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    onMutate: async ({ matchId, playerSide }) => {
      await queryClient.cancelQueries({ queryKey: ['matches'] });
      const previous = queryClient.getQueryData<Match[]>(['matches']);

      queryClient.setQueryData<Match[]>(['matches'], (prev) => {
        if (!prev) return prev;
        return prev.map((m) => {
          if (m.id !== matchId) return m;
          const setNumber = m.currentSet as 1 | 2 | 3;
          const key = `set${setNumber}` as const;
          const currentScore = playerSide === 'A' ? m.setScores[key].a : m.setScores[key].b;
          if (currentScore <= 0) return m; // Don't go below 0
          return {
            ...m,
            setScores: {
              ...m.setScores,
              [key]: {
                a: m.setScores[key].a - (playerSide === 'A' ? 1 : 0),
                b: m.setScores[key].b - (playerSide === 'B' ? 1 : 0),
              },
            },
          };
        });
      });

      return { previous };
    },
    mutationFn: async ({ matchId, playerSide }: { matchId: string; playerSide: 'A' | 'B' }) => {
      // Fetch current match to get current set and score
      const { data: match, error: fetchError } = await supabase
        .from('matches')
        .select('current_set, set1_score_a, set1_score_b, set2_score_a, set2_score_b, set3_score_a, set3_score_b')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      const setNumber = match.current_set;
      const scoreField = `set${setNumber}_score_${playerSide.toLowerCase()}` as keyof typeof match;
      const currentScore = match[scoreField] as number;

      if (currentScore <= 0) {
        throw new Error('Score cannot go below 0');
      }

      const updateData: Record<string, number> = {};
      updateData[scoreField as string] = currentScore - 1;

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId);

      if (error) throw error;
    },
    onError: (error: Error, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['matches'], ctx.previous);
      toast({
        title: "Score Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
