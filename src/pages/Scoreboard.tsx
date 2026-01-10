import { useMatches } from '@/hooks/useMatches';
import { useLiveViewers } from '@/hooks/useLiveViewers';
import { LiveBadge } from '@/components/LiveBadge';
import { SetScoreDisplay } from '@/components/SetScoreDisplay';
import { ViewerCount } from '@/components/ViewerCount';
import { Link } from 'react-router-dom';
import { Trophy, User, Clock, Maximize2, Minimize2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Scoreboard() {
  const { data: matches = [] } = useMatches();
  const { viewerCount } = useLiveViewers('scoreboard-viewers');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING');
  const displayMatches = liveMatches.length > 0 ? liveMatches : upcomingMatches.slice(0, 2);

  useEffect(() => {
    if (displayMatches.length > 1) {
      const interval = setInterval(() => {
        setCurrentMatchIndex((prev) => (prev + 1) % displayMatches.length);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [displayMatches.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const currentMatch = displayMatches[currentMatchIndex];

  // Get current set scores
  const getCurrentSetScores = () => {
    if (!currentMatch) return { a: 0, b: 0 };
    const set = currentMatch.currentSet;
    if (set === 1) return currentMatch.setScores.set1;
    if (set === 2) return currentMatch.setScores.set2;
    return currentMatch.setScores.set3;
  };

  const currentSetScores = getCurrentSetScores();

  // Get winner name for doubles
  const getWinnerName = () => {
    if (!currentMatch?.winner) return null;
    if (currentMatch.winner.id === currentMatch.playerA.id) {
      return currentMatch.playerA2 
        ? `${currentMatch.playerA.name} & ${currentMatch.playerA2.name}`
        : currentMatch.playerA.name;
    }
    return currentMatch.playerB2 
      ? `${currentMatch.playerB.name} & ${currentMatch.playerB2.name}`
      : currentMatch.playerB.name;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Bar */}
      <header className="bg-card/80 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary p-2 rounded-full">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-gradient">MPPKVVCL INDORE</h1>
              <p className="text-xs text-muted-foreground">BADMINTON TOURNAMENT 2024</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ViewerCount count={viewerCount} size="sm" />
          {displayMatches.length > 1 && (
            <div className="flex gap-1">
              {displayMatches.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentMatchIndex(idx)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    idx === currentMatchIndex 
                      ? "bg-primary scale-110" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </span>
          </Button>
        </div>
      </header>

      {/* Main Scoreboard */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {currentMatch ? (
          <div className="w-full max-w-7xl">
            {/* Match Header */}
            <div className="text-center mb-6 md:mb-10">
              <div className="inline-flex items-center gap-3 mb-4">
                {currentMatch.status === 'LIVE' ? (
                  <>
                    <div className="px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
                      <span className="font-display font-bold text-primary">SET {currentMatch.currentSet}</span>
                    </div>
                    <LiveBadge />
                  </>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-display font-bold text-primary">UPCOMING</span>
                  </div>
                )}
              </div>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-muted-foreground">
                {currentMatch.category} • {currentMatch.court}
              </h2>
            </div>

            {/* Set Scores Display */}
            {currentMatch.status !== 'UPCOMING' && (
              <div className="mb-6 flex justify-center">
                <div className="bg-card/80 backdrop-blur rounded-2xl px-8 py-4 border border-border">
                  <SetScoreDisplay
                    setScores={currentMatch.setScores}
                    setsWonA={currentMatch.setsWonA}
                    setsWonB={currentMatch.setsWonB}
                    currentSet={currentMatch.currentSet}
                  />
                </div>
              </div>
            )}

            {/* Winner Banner */}
            {currentMatch.status === 'COMPLETED' && currentMatch.winner && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-success/20 border border-success/30">
                  <Trophy className="h-8 w-8 text-success" />
                  <span className="font-display text-2xl md:text-4xl font-bold text-success">
                    WINNER: {getWinnerName()}
                  </span>
                </div>
              </div>
            )}

            {/* Scoreboard */}
            <div className="bg-gradient-card rounded-3xl border-2 border-border overflow-hidden">
              <div className="p-8 md:p-16 relative">
                <div className="absolute inset-0 bg-glow opacity-40" />
                
                <div className="relative flex items-center justify-between gap-8">
                  {/* Player A */}
                  <div className="flex-1 text-center">
                    <div className="relative inline-block">
                      <div className={cn(
                        "w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 mx-auto rounded-full overflow-hidden bg-muted border-4 shadow-lg",
                        currentMatch.winner?.id === currentMatch.playerA.id 
                          ? "border-success shadow-success/20" 
                          : "border-primary/30 shadow-primary/20"
                      )}>
                        {currentMatch.playerA.photoUrl ? (
                          <img 
                            src={currentMatch.playerA.photoUrl} 
                            alt={currentMatch.playerA.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                            <User className="h-16 w-16 md:h-24 md:h-24 lg:h-28 lg:w-28 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      {currentMatch.status === 'COMPLETED' && currentMatch.winner?.id === currentMatch.playerA.id && (
                        <div className="absolute -top-4 -right-4 bg-success rounded-full p-3 shadow-lg animate-bounce">
                          <Trophy className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold mt-6 mb-1">
                      {currentMatch.playerA.name}
                    </h3>
                    {currentMatch.playerA2 && (
                      <h4 className="font-display text-xl md:text-2xl lg:text-3xl font-semibold text-primary mb-2">
                        {currentMatch.playerA2.name}
                      </h4>
                    )}
                    <p className="text-lg md:text-xl text-muted-foreground">
                      {currentMatch.playerA.location}
                    </p>
                    
                    {/* Current Set Score */}
                    <div className="mt-8 md:mt-12">
                      <div className="inline-block bg-background/50 rounded-2xl px-8 py-4 md:px-12 md:py-6 border border-border">
                        <span className="font-display text-8xl md:text-[10rem] lg:text-[12rem] font-black text-primary leading-none">
                          {currentSetScores.a}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="flex flex-col items-center gap-6 py-8">
                    <div className="w-px h-24 md:h-32 bg-gradient-to-b from-transparent via-border to-transparent" />
                    <div className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-muted-foreground/50">
                      VS
                    </div>
                    <div className="w-px h-24 md:h-32 bg-gradient-to-b from-transparent via-border to-transparent" />
                  </div>

                  {/* Player B */}
                  <div className="flex-1 text-center">
                    <div className="relative inline-block">
                      <div className={cn(
                        "w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 mx-auto rounded-full overflow-hidden bg-muted border-4 shadow-lg",
                        currentMatch.winner?.id === currentMatch.playerB.id 
                          ? "border-success shadow-success/20" 
                          : "border-primary/30 shadow-primary/20"
                      )}>
                        {currentMatch.playerB.photoUrl ? (
                          <img 
                            src={currentMatch.playerB.photoUrl} 
                            alt={currentMatch.playerB.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                            <User className="h-16 w-16 md:h-24 md:h-24 lg:h-28 lg:w-28 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      {currentMatch.status === 'COMPLETED' && currentMatch.winner?.id === currentMatch.playerB.id && (
                        <div className="absolute -top-4 -right-4 bg-success rounded-full p-3 shadow-lg animate-bounce">
                          <Trophy className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold mt-6 mb-1">
                      {currentMatch.playerB.name}
                    </h3>
                    {currentMatch.playerB2 && (
                      <h4 className="font-display text-xl md:text-2xl lg:text-3xl font-semibold text-primary mb-2">
                        {currentMatch.playerB2.name}
                      </h4>
                    )}
                    <p className="text-lg md:text-xl text-muted-foreground">
                      {currentMatch.playerB.location}
                    </p>
                    
                    {/* Current Set Score */}
                    <div className="mt-8 md:mt-12">
                      <div className="inline-block bg-background/50 rounded-2xl px-8 py-4 md:px-12 md:py-6 border border-border">
                        <span className="font-display text-8xl md:text-[10rem] lg:text-[12rem] font-black text-primary leading-none">
                          {currentSetScores.b}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Match indicator */}
            {displayMatches.length > 1 && (
              <div className="text-center mt-6 text-muted-foreground">
                Match {currentMatchIndex + 1} of {displayMatches.length} • Auto-cycling
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-muted/50 flex items-center justify-center">
              <Trophy className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">No Live Matches</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Waiting for matches to begin...
            </p>
            <div className="mt-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="font-display text-primary">Real-time updates enabled</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card/80 backdrop-blur border-t border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2024 MPPKVVCL INDORE Badminton Tournament
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Live Updates Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
