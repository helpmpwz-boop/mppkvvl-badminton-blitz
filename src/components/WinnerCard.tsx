import { Trophy, Crown, Star, Medal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TournamentWinner } from '@/hooks/useTournamentWinners';
import { cn } from '@/lib/utils';

interface WinnerCardProps {
  winner: TournamentWinner;
  className?: string;
}

export const WinnerCard = ({ winner, className }: WinnerCardProps) => {
  const isDoubles = winner.partner_id !== null;
  const categoryLabel = winner.category.replace('Mens', "Men's").replace('Womens', "Women's");

  return (
    <Card className={cn(
      "relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10",
      "hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20",
      "animate-slide-up",
      className
    )}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-accent/20 to-transparent rounded-tr-full" />
      
      {/* Crown icon */}
      <div className="absolute top-2 right-2">
        <Crown className="h-6 w-6 text-primary animate-pulse" />
      </div>

      <CardContent className="p-4 relative">
        {/* Trophy and Category */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-full bg-primary/20">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <Badge variant="default" className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold">
              <Star className="h-3 w-3 mr-1 fill-current" />
              CHAMPION
            </Badge>
          </div>
        </div>

        {/* Category Label */}
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
          {categoryLabel}
        </p>

        {/* Winner Names */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Medal className="h-4 w-4 text-primary" />
            <div>
              <p className="font-display font-bold text-foreground">{winner.player.name}</p>
              <p className="text-xs text-muted-foreground">{winner.player.designation}</p>
              <p className="text-xs text-muted-foreground">{winner.player.location}</p>
            </div>
          </div>

          {isDoubles && winner.partner && (
            <div className="flex items-center gap-2 pt-1 border-t border-border/50">
              <Medal className="h-4 w-4 text-accent" />
              <div>
                <p className="font-display font-bold text-foreground">{winner.partner.name}</p>
                <p className="text-xs text-muted-foreground">{winner.partner.designation}</p>
                <p className="text-xs text-muted-foreground">{winner.partner.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Award Date */}
        <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/30">
          Awarded: {new Date(winner.awarded_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </p>
      </CardContent>
    </Card>
  );
};
