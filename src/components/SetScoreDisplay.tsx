import * as React from 'react';
import { cn } from '@/lib/utils';
import { SetScores } from '@/hooks/useMatches';

interface SetScoreDisplayProps {
  setScores: SetScores;
  setsWonA: number;
  setsWonB: number;
  currentSet: number;
  compact?: boolean;
}

const SetScoreDisplay = React.forwardRef<HTMLDivElement, SetScoreDisplayProps>(
  ({ setScores, setsWonA, setsWonB, currentSet, compact = false }, ref) => {
    const sets = [
      { num: 1, a: setScores.set1.a, b: setScores.set1.b },
      { num: 2, a: setScores.set2.a, b: setScores.set2.b },
      { num: 3, a: setScores.set3.a, b: setScores.set3.b },
    ];

    if (compact) {
      return (
        <div ref={ref} className="flex items-center gap-2">
          <span className="font-display font-bold text-lg">{setsWonA}</span>
          <span className="text-muted-foreground">-</span>
          <span className="font-display font-bold text-lg">{setsWonB}</span>
          <div className="flex gap-1 ml-2">
            {sets.map((set) => (
              <div
                key={set.num}
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  set.num === currentSet && 'bg-primary/20 text-primary',
                  set.num < currentSet && 'bg-muted text-muted-foreground',
                  set.num > currentSet && 'text-muted-foreground/50'
                )}
              >
                {set.a}-{set.b}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="space-y-2">
        {/* Sets Won */}
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sets</div>
            <div className="font-display text-3xl font-bold">
              <span className={cn(setsWonA > setsWonB && 'text-success')}>{setsWonA}</span>
              <span className="text-muted-foreground mx-2">-</span>
              <span className={cn(setsWonB > setsWonA && 'text-success')}>{setsWonB}</span>
            </div>
          </div>
        </div>

        {/* Set-by-Set Scores */}
        <div className="flex justify-center gap-3">
          {sets.map((set) => (
            <div
              key={set.num}
              className={cn(
                'flex flex-col items-center px-3 py-2 rounded-lg border transition-all',
                set.num === currentSet
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-muted/50 border-border text-muted-foreground'
              )}
            >
              <span className="text-[10px] uppercase tracking-wider mb-1">Set {set.num}</span>
              <span className="font-display font-bold text-lg">
                {set.a} - {set.b}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
SetScoreDisplay.displayName = 'SetScoreDisplay';

export { SetScoreDisplay };
