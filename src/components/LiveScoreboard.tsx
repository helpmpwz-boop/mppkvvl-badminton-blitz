import { Match } from '@/types/tournament';
import { Button } from '@/components/ui/button';
import { LiveBadge } from './LiveBadge';
import { User, Plus, Minus, Trophy, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTournamentStore } from '@/store/tournamentStore';
import { useState } from 'react';

interface LiveScoreboardProps {
  match: Match;
  adminMode?: boolean;
}

export function LiveScoreboard({ match, adminMode = false }: LiveScoreboardProps) {
  const { updateScore, setMatchStatus, completeMatch } = useTournamentStore();
  const [animateA, setAnimateA] = useState(false);
  const [animateB, setAnimateB] = useState(false);

  const handleScore = (player: 'A' | 'B') => {
    updateScore(match.id, player);
    if (player === 'A') {
      setAnimateA(true);
      setTimeout(() => setAnimateA(false), 300);
    } else {
      setAnimateB(true);
      setTimeout(() => setAnimateB(false), 300);
    }
  };

  const handleStartMatch = () => {
    setMatchStatus(match.id, 'LIVE');
  };

  const handleEndMatch = (winnerId: string) => {
    completeMatch(match.id, winnerId);
  };

  return (
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
          {match.status === 'LIVE' && <LiveBadge />}
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

      {/* Main Scoreboard */}
      <div className="p-6 md:p-10 relative">
        {/* Background glow effect */}
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
            <p className="text-sm text-muted-foreground">{match.playerA.location}</p>
            
            {/* Score */}
            <div className={cn(
              "mt-6 score-display text-primary transition-transform",
              animateA && "animate-score-pop"
            )}>
              {match.scoreA}
            </div>

            {/* Admin Controls */}
            {adminMode && match.status === 'LIVE' && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button variant="score" size="lg" onClick={() => handleScore('A')}>
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
            <p className="text-sm text-muted-foreground">{match.playerB.location}</p>
            
            {/* Score */}
            <div className={cn(
              "mt-6 score-display text-primary transition-transform",
              animateB && "animate-score-pop"
            )}>
              {match.scoreB}
            </div>

            {/* Admin Controls */}
            {adminMode && match.status === 'LIVE' && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button variant="score" size="lg" onClick={() => handleScore('B')}>
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {adminMode && (
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          {match.status === 'UPCOMING' && (
            <Button variant="live" className="w-full" onClick={handleStartMatch}>
              <Flag className="h-4 w-4" />
              START MATCH
            </Button>
          )}
          {match.status === 'LIVE' && (
            <div className="flex gap-3">
              <Button 
                variant="success" 
                className="flex-1 bg-success hover:bg-success/90 text-white"
                onClick={() => handleEndMatch(match.playerA.id)}
              >
                <Trophy className="h-4 w-4" />
                {match.playerA.name.split(' ')[0]} WINS
              </Button>
              <Button 
                variant="success" 
                className="flex-1 bg-success hover:bg-success/90 text-white"
                onClick={() => handleEndMatch(match.playerB.id)}
              >
                <Trophy className="h-4 w-4" />
                {match.playerB.name.split(' ')[0]} WINS
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
