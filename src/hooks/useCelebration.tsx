import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CelebrationEvent {
  show: boolean;
  winnerName: string;
  type: 'set' | 'match';
  matchId: string;
}

const CELEBRATION_CHANNEL = 'celebration-events';

export function useCelebration() {
  const [celebration, setCelebration] = useState<CelebrationEvent>({
    show: false,
    winnerName: '',
    type: 'set',
    matchId: ''
  });

  // Broadcast a celebration event to all viewers
  const triggerCelebration = useCallback(async (winnerName: string, type: 'set' | 'match', matchId: string) => {
    const channel = supabase.channel(CELEBRATION_CHANNEL);
    
    await channel.send({
      type: 'broadcast',
      event: 'celebration',
      payload: {
        winnerName,
        type,
        matchId,
        timestamp: Date.now()
      }
    });
  }, []);

  // Subscribe to celebration events
  useEffect(() => {
    const channel = supabase.channel(CELEBRATION_CHANNEL)
      .on('broadcast', { event: 'celebration' }, (payload) => {
        const { winnerName, type, matchId } = payload.payload;
        setCelebration({
          show: true,
          winnerName,
          type,
          matchId
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clearCelebration = useCallback(() => {
    setCelebration({
      show: false,
      winnerName: '',
      type: 'set',
      matchId: ''
    });
  }, []);

  return {
    celebration,
    triggerCelebration,
    clearCelebration
  };
}
