import { Match } from '@/hooks/useMatches';
import { Badge } from '@/components/ui/badge';
import { LiveBadge } from './LiveBadge';
import { SetScoreDisplay } from './SetScoreDisplay';
import { User, Calendar, MapPin, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MatchCardProps {
  match: Match;
  showControls?: boolean;
  onScoreUpdate?: (matchId: string, player: 'A' | 'B') => void;
  className?: string;
}

export function MatchCard({ match, showControls = false, onScoreUpdate, className }: MatchCardProps) {
  const isLive = match.status === 'LIVE';
  const isCompleted = match.status === 'COMPLETED';
  const isDoubles = match.category.includes('Doubles');

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
    <div className={cn(
      "bg-gradient-card rounded-2xl border border-border card-shadow match-card overflow-hidden",
      isLive && "ring-2 ring-live/50",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{match.category}</Badge>
          {match.court && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {match.court}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <>
              <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
                Set {match.currentSet}
              </Badge>
              <LiveBadge />
            </>
          )}
          {isCompleted && (
            <Badge variant="success">COMPLETED</Badge>
          )}
          {match.status === 'UPCOMING' && (
            <Badge variant="secondary">UPCOMING</Badge>
          )}
        </div>
      </div>

      {/* Winner Banner */}
      {isCompleted && match.winner && (
        <div className="px-4 py-2 bg-success/10 border-b border-success/30">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4 text-success" />
            <span className="text-sm font-display font-bold text-success">
              Winner: {getWinnerName()}
            </span>
          </div>
        </div>
      )}

      {/* Set Scores */}
      {(isLive || isCompleted) && (
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <SetScoreDisplay
            setScores={match.setScores}
            setsWonA={match.setsWonA}
            setsWonB={match.setsWonB}
            currentSet={match.currentSet}
            compact
          />
        </div>
      )}

      {/* Players and Score */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Team A */}
          <div className={cn(
            "flex-1 text-center",
            isCompleted && match.winner?.id === match.playerA.id && "opacity-100",
            isCompleted && match.winner?.id !== match.playerA.id && "opacity-50"
          )}>
            {isDoubles ? (
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                  {match.playerA.photoUrl ? (
                    <img src={match.playerA.photoUrl} alt={match.playerA.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                {match.playerA2 && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                    {match.playerA2.photoUrl ? (
                      <img src={match.playerA2.photoUrl} alt={match.playerA2.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                )}
                {isCompleted && match.winner?.id === match.playerA.id && (
                  <Trophy className="h-5 w-5 text-success ml-1" />
                )}
              </div>
            ) : (
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden bg-muted mb-2">
                {match.playerA.photoUrl ? (
                  <img src={match.playerA.photoUrl} alt={match.playerA.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                    <User className="h-8 w-8 text-primary-foreground" />
                  </div>
                )}
                {isCompleted && match.winner?.id === match.playerA.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-success/80">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            )}
            <h4 className="font-display font-bold text-sm truncate">{match.playerA.name}</h4>
            {isDoubles && match.playerA2 && (
              <h4 className="font-display font-bold text-sm truncate text-muted-foreground">{match.playerA2.name}</h4>
            )}
            <p className="text-xs text-muted-foreground">{match.playerA.location}</p>
          </div>

          {/* VS Indicator */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-display font-bold text-muted-foreground">VS</span>
          </div>

          {/* Team B */}
          <div className={cn(
            "flex-1 text-center",
            isCompleted && match.winner?.id === match.playerB.id && "opacity-100",
            isCompleted && match.winner?.id !== match.playerB.id && "opacity-50"
          )}>
            {isDoubles ? (
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                  {match.playerB.photoUrl ? (
                    <img src={match.playerB.photoUrl} alt={match.playerB.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                {match.playerB2 && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                    {match.playerB2.photoUrl ? (
                      <img src={match.playerB2.photoUrl} alt={match.playerB2.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                )}
                {isCompleted && match.winner?.id === match.playerB.id && (
                  <Trophy className="h-5 w-5 text-success ml-1" />
                )}
              </div>
            ) : (
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden bg-muted mb-2">
                {match.playerB.photoUrl ? (
                  <img src={match.playerB.photoUrl} alt={match.playerB.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                    <User className="h-8 w-8 text-primary-foreground" />
                  </div>
                )}
                {isCompleted && match.winner?.id === match.playerB.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-success/80">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            )}
            <h4 className="font-display font-bold text-sm truncate">{match.playerB.name}</h4>
            {isDoubles && match.playerB2 && (
              <h4 className="font-display font-bold text-sm truncate text-muted-foreground">{match.playerB2.name}</h4>
            )}
            <p className="text-xs text-muted-foreground">{match.playerB.location}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{format(match.scheduledAt, 'PPp')}</span>
        </div>
      </div>
    </div>
  );
}
