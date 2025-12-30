import { Match } from '@/types/tournament';
import { Badge } from '@/components/ui/badge';
import { LiveBadge } from './LiveBadge';
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
          {isLive && <LiveBadge />}
          {isCompleted && (
            <Badge variant="success">COMPLETED</Badge>
          )}
          {match.status === 'UPCOMING' && (
            <Badge variant="secondary">UPCOMING</Badge>
          )}
        </div>
      </div>

      {/* Players and Score */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Player A */}
          <div className={cn(
            "flex-1 text-center",
            isCompleted && match.winner?.id === match.playerA.id && "opacity-100",
            isCompleted && match.winner?.id !== match.playerA.id && "opacity-50"
          )}>
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
            <h4 className="font-display font-bold text-sm truncate">{match.playerA.name}</h4>
            <p className="text-xs text-muted-foreground">{match.playerA.location}</p>
          </div>

          {/* Score */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "text-5xl md:text-6xl font-display font-bold",
              isLive ? "text-primary" : "text-foreground"
            )}>
              {match.scoreA}
            </div>
            <div className="text-2xl text-muted-foreground font-light">-</div>
            <div className={cn(
              "text-5xl md:text-6xl font-display font-bold",
              isLive ? "text-primary" : "text-foreground"
            )}>
              {match.scoreB}
            </div>
          </div>

          {/* Player B */}
          <div className={cn(
            "flex-1 text-center",
            isCompleted && match.winner?.id === match.playerB.id && "opacity-100",
            isCompleted && match.winner?.id !== match.playerB.id && "opacity-50"
          )}>
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
            <h4 className="font-display font-bold text-sm truncate">{match.playerB.name}</h4>
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
