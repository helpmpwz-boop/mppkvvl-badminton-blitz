import { Trophy, Loader2 } from 'lucide-react';
import { useTournamentWinners } from '@/hooks/useTournamentWinners';
import { WinnerCard } from './WinnerCard';

export const WinnersShowcase = () => {
  const { winners, isLoading } = useTournamentWinners();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (winners.length === 0) {
    return null;
  }

  // Separate singles and doubles winners
  const singlesWinners = winners.filter(w => 
    w.category.includes('Singles')
  );
  const doublesWinners = winners.filter(w => 
    w.category.includes('Doubles')
  );

  return (
    <section className="animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Tournament Champions</h2>
          <p className="text-sm text-muted-foreground">Official winners of MPPKVVCL Badminton 2026</p>
        </div>
      </div>

      {singlesWinners.length > 0 && (
        <div className="mb-6">
          <h3 className="font-display text-lg font-semibold mb-3 text-muted-foreground">Singles Champions</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {singlesWinners.map((winner) => (
              <WinnerCard key={winner.id} winner={winner} />
            ))}
          </div>
        </div>
      )}

      {doublesWinners.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold mb-3 text-muted-foreground">Doubles Champions</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {doublesWinners.map((winner) => (
              <WinnerCard key={winner.id} winner={winner} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
