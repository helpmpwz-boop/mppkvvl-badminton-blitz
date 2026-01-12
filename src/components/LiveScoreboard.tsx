import { Match, useUpdateScore, useDecrementScore, useSetMatchStatus, useCompleteMatch, useEndSet } from '@/hooks/useMatches';
import { Button } from '@/components/ui/button';
import { LiveBadge } from './LiveBadge';
import { SetScoreDisplay } from './SetScoreDisplay';
import { Celebration } from './Celebration';
import { User, Plus, Minus, Trophy, Flag, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';

interface LiveScoreboardProps {
  match: Match;
  adminMode?: boolean;
}

export function LiveScoreboard({ match, adminMode = false }: LiveScoreboardProps) {
  const updateScore = useUpdateScore();
  const decrementScore = useDecrementScore();
  const setMatchStatus = useSetMatchStatus();
  const completeMatch = useCompleteMatch();
  const endSet = useEndSet();
  const [animateA, setAnimateA] = useState(false);
  const [animateB, setAnimateB] = useState(false);
  const [celebration, setCelebration] = useState<{ show: boolean; winnerName: string; type: 'set' | 'match' }>({
    show: false,
    winnerName: '',
    type: 'set'
  });

  const handleScore = (player: 'A' | 'B') => {
    updateScore.mutate({ matchId: match.id, playerSide: player });
    if (player === 'A') {
      setAnimateA(true);
      setTimeout(() => setAnimateA(false), 300);
    } else {
      setAnimateB(true);
      setTimeout(() => setAnimateB(false), 300);
    }
  };

  const handleDecrement = (player: 'A' | 'B') => {
    decrementScore.mutate({ matchId: match.id, playerSide: player });
  };

  const handleStartMatch = () => {
    setMatchStatus.mutate({ matchId: match.id, status: 'LIVE' });
  };

  // Helper to get player/team name
  const getTeamName = useCallback((side: 'A' | 'B') => {
    if (side === 'A') {
      return match.playerA2 
        ? `${match.playerA.name} & ${match.playerA2.name}`
        : match.playerA.name;
    }
    return match.playerB2 
      ? `${match.playerB.name} & ${match.playerB2.name}`
      : match.playerB.name;
  }, [match.playerA, match.playerA2, match.playerB, match.playerB2]);

  const handleEndSet = (winner: 'A' | 'B') => {
    const winnerName = getTeamName(winner);
    setCelebration({ show: true, winnerName, type: 'set' });
    endSet.mutate({ matchId: match.id, setWinner: winner });
  };

  const handleEndMatch = (winnerId: string) => {
    const winnerName = winnerId === match.playerA.id ? getTeamName('A') : getTeamName('B');
    setCelebration({ show: true, winnerName, type: 'match' });
    completeMatch.mutate({ matchId: match.id, winnerId });
  };

  const handleCelebrationComplete = useCallback(() => {
    setCelebration({ show: false, winnerName: '', type: 'set' });
  }, []);

  // Get current set scores
  const currentSetScores = match.currentSet === 1 
    ? match.setScores.set1 
    : match.currentSet === 2 
      ? match.setScores.set2 
      : match.setScores.set3;

  // Get winner name for doubles
  const getWinnerName = () => {
    if (!match.winner) return null;
    if (match.winner.id === match.playerA.id) {
      return match.playerA2 
        ? `${match.playerA.name} & ${match.playerA2.name}`
        : match.playerA.name;
    }
    return match.playerB2 
      ? `${match.playerB.name} & ${match.playerB2.name}`
      : match.playerB.name;
  };

  return (
    <>
      {/* Celebration Effect */}
      <Celebration
        show={celebration.show}
        winnerName={celebration.winnerName}
        type={celebration.type}
        onComplete={handleCelebrationComplete}
      />
      
      <div className="bg-gradient-card rounded-3xl border border-border overflow-hidden card-shadow">
      {/* Header */}
      <div className="bg-muted/50 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-body uppercase tracking-wider">
              {match.category} • {match.court}
            </p>
            <h2 className="font-display text-xl font-bold mt-1">MPPKVVCL INDORE</h2>
          </div>
          {match.status === 'LIVE' && (
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-primary/20 rounded-full">
                <span className="text-sm font-display font-bold text-primary">SET {match.currentSet}</span>
              </div>
              <LiveBadge />
            </div>
          )}
          {match.status === 'UPCOMING' && (
            <div className="text-sm text-muted-foreground">Match Starting Soon...</div>
          )}
          {match.status === 'COMPLETED' && (
            <div className="flex items-center gap-2 text-success">
              <Trophy className="h-5 w-5" />
              <span className="font-display font-bold">MATCH COMPLETE</span>
            </div>
          )}
        </div>
      </div>

      {/* Set Scores */}
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <SetScoreDisplay 
          setScores={match.setScores}
          setsWonA={match.setsWonA}
          setsWonB={match.setsWonB}
          currentSet={match.currentSet}
        />
      </div>

      {/* Winner Banner */}
      {match.status === 'COMPLETED' && match.winner && (
        <div className="px-6 py-4 bg-success/10 border-b border-success/30">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-success" />
            <span className="font-display text-xl font-bold text-success">
              WINNER: {getWinnerName()}
            </span>
          </div>
        </div>
      )}

      {/* Main Scoreboard */}
      <div className="p-6 md:p-10 relative">
        <div className="absolute inset-0 bg-glow opacity-30" />
        
        <div className="relative flex items-center justify-between gap-4">
          {/* Player A */}
          <div className="flex-1 text-center">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden bg-muted border-4 border-primary/30">
                {match.playerA.photoUrl ? (
                  <img src={match.playerA.photoUrl} alt={match.playerA.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                    <User className="h-12 w-12 md:h-16 md:w-16 text-primary-foreground" />
                  </div>
                )}
              </div>
              {match.status === 'COMPLETED' && match.winner?.id === match.playerA.id && (
                <div className="absolute -top-2 -right-2 bg-success rounded-full p-2">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            <h3 className="font-display text-xl md:text-2xl font-bold mt-4">{match.playerA.name}</h3>
            {match.playerA2 && (
              <h4 className="font-display text-lg md:text-xl font-semibold text-primary">{match.playerA2.name}</h4>
            )}
            <p className="text-sm text-muted-foreground">{match.playerA.location}</p>
            
            {/* Current Set Score */}
            <div className={cn(
              "mt-6 score-display text-primary transition-transform",
              animateA && "animate-score-pop"
            )}>
              {currentSetScores.a}
            </div>

            {/* Admin Controls */}
            {adminMode && match.status === 'LIVE' && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => handleDecrement('A')} 
                  disabled={decrementScore.isPending || currentSetScores.a <= 0}
                  className="rounded-full w-12 h-12"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <Button variant="score" size="lg" onClick={() => handleScore('A')} disabled={updateScore.isPending}>
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
            <div className="font-display text-2xl md:text-4xl font-bold text-muted-foreground">VS</div>
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
          </div>

          {/* Player B */}
          <div className="flex-1 text-center">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden bg-muted border-4 border-primary/30">
                {match.playerB.photoUrl ? (
                  <img src={match.playerB.photoUrl} alt={match.playerB.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                    <User className="h-12 w-12 md:h-16 md:w-16 text-primary-foreground" />
                  </div>
                )}
              </div>
              {match.status === 'COMPLETED' && match.winner?.id === match.playerB.id && (
                <div className="absolute -top-2 -right-2 bg-success rounded-full p-2">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            <h3 className="font-display text-xl md:text-2xl font-bold mt-4">{match.playerB.name}</h3>
            {match.playerB2 && (
              <h4 className="font-display text-lg md:text-xl font-semibold text-primary">{match.playerB2.name}</h4>
            )}
            <p className="text-sm text-muted-foreground">{match.playerB.location}</p>
            
            {/* Current Set Score */}
            <div className={cn(
              "mt-6 score-display text-primary transition-transform",
              animateB && "animate-score-pop"
            )}>
              {currentSetScores.b}
            </div>

            {/* Admin Controls */}
            {adminMode && match.status === 'LIVE' && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => handleDecrement('B')} 
                  disabled={decrementScore.isPending || currentSetScores.b <= 0}
                  className="rounded-full w-12 h-12"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <Button variant="score" size="lg" onClick={() => handleScore('B')} disabled={updateScore.isPending}>
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {adminMode && (
        <div className="px-6 py-4 border-t border-border bg-muted/30 space-y-3">
          {match.status === 'UPCOMING' && (
            <Button 
              variant="live" 
              className="w-full" 
              onClick={handleStartMatch}
              disabled={setMatchStatus.isPending}
            >
              <Flag className="h-4 w-4" />
              START MATCH
            </Button>
          )}
          
          {match.status === 'LIVE' && (
            <>
              {/* End Set Buttons */}
              {match.currentSet <= 3 && (
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEndSet('A')}
                    disabled={endSet.isPending}
                  >
                    <ChevronRight className="h-4 w-4" />
                    {match.playerA.name.split(' ')[0]} Wins Set
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEndSet('B')}
                    disabled={endSet.isPending}
                  >
                    <ChevronRight className="h-4 w-4" />
                    {match.playerB.name.split(' ')[0]} Wins Set
                  </Button>
                </div>
              )}

              {/* End Match Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="success" 
                  className="flex-1 bg-success hover:bg-success/90 text-white"
                  onClick={() => handleEndMatch(match.playerA.id)}
                  disabled={completeMatch.isPending}
                >
                  <Trophy className="h-4 w-4" />
                  {match.playerA.name.split(' ')[0]} WINS MATCH
                </Button>
                <Button 
                  variant="success" 
                  className="flex-1 bg-success hover:bg-success/90 text-white"
                  onClick={() => handleEndMatch(match.playerB.id)}
                  disabled={completeMatch.isPending}
                >
                  <Trophy className="h-4 w-4" />
                  {match.playerB.name.split(' ')[0]} WINS MATCH
                </Button>
              </div>
            </>
          )}
        </div>
      )}
      </div>
    </>
  );
}
