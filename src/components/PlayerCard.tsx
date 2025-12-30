import { Player } from '@/types/tournament';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Briefcase, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
  showStatus?: boolean;
  compact?: boolean;
  className?: string;
}

export function PlayerCard({ player, showStatus = true, compact = false, className }: PlayerCardProps) {
  const statusVariant = player.status === 'APPROVED' ? 'approved' : 
                       player.status === 'REJECTED' ? 'rejected' : 'pending';

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {player.photoUrl ? (
            <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold truncate">{player.name}</p>
          <p className="text-xs text-muted-foreground">{player.employeeNumber}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-card rounded-xl p-4 border border-border card-shadow match-card",
      className
    )}>
      <div className="flex items-start gap-4">
        {/* Photo */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          {player.photoUrl ? (
            <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold truncate">{player.name}</h3>
              <p className="text-sm text-primary font-medium">{player.employeeNumber}</p>
            </div>
            {showStatus && (
              <Badge variant={statusVariant}>{player.status}</Badge>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="truncate">{player.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              <span className="truncate">{player.designation}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>{player.phone}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{player.category}</Badge>
            <Badge variant="outline">{player.gender}</Badge>
            <Badge variant="outline">Age: {player.age}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
