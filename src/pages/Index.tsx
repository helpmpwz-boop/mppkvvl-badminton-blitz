import { TournamentHeader } from '@/components/TournamentHeader';
import { MatchCard } from '@/components/MatchCard';
import { LiveScoreboard } from '@/components/LiveScoreboard';
import { ViewerCount } from '@/components/ViewerCount';
import { Celebration } from '@/components/Celebration';
import { useMatches } from '@/hooks/useMatches';
import { useLiveViewers } from '@/hooks/useLiveViewers';
import { useCelebration } from '@/hooks/useCelebration';
import { Flame, Clock, Trophy, Zap, Loader2 } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';

const Index = () => {
  const { data: matches = [], isLoading } = useMatches();
  const { viewerCount } = useLiveViewers();
  const { celebration, clearCelebration } = useCelebration();
  
  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING');
  const completedMatches = matches
    .filter(m => m.status === 'COMPLETED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  return (
    <>
      {/* Celebration Effect for all viewers */}
      <Celebration
        show={celebration.show}
        winnerName={celebration.winnerName}
        type={celebration.type}
        onComplete={clearCelebration}
      />
      
      <div className="min-h-screen">
        <TournamentHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroBanner} 
            alt="Badminton Tournament" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
        <div className="absolute inset-0 bg-glow opacity-50" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">LIVE TOURNAMENT</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              <span className="text-gradient">MPPKVVCL INDORE</span>
            </h1>
            <p className="font-display text-2xl md:text-3xl font-semibold text-muted-foreground mb-6">
              BADMINTON TOURNAMENT 2026
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
              <ViewerCount count={viewerCount} size="sm" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-live animate-pulse" />
                <span>{liveMatches.length} Live</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{upcomingMatches.length} Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-success" />
                <span>{completedMatches.length} Completed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Live Matches Section */}
            {liveMatches.length > 0 && (
              <section className="animate-slide-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-live/20">
                    <Flame className="h-6 w-6 text-live" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">Live Matches</h2>
                    <p className="text-sm text-muted-foreground">Watch the action unfold in real-time</p>
                  </div>
                </div>
                
                <div className="grid gap-6 lg:grid-cols-2">
                  {liveMatches.map((match) => (
                    <LiveScoreboard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Matches Section */}
            {upcomingMatches.length > 0 && (
              <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">Upcoming Matches</h2>
                    <p className="text-sm text-muted-foreground">Scheduled matches waiting to begin</p>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Matches Section */}
            {completedMatches.length > 0 && (
              <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Trophy className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">Completed Matches</h2>
                    <p className="text-sm text-muted-foreground">View match results and winners</p>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {matches.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">No Matches Scheduled</h3>
                <p className="text-muted-foreground">Check back soon for tournament updates!</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 MPPKVVCL INDORE Badminton Tournament. All rights reserved.
          </p>
        </div>
      </footer>
      </div>
    </>
  );
};

export default Index;
