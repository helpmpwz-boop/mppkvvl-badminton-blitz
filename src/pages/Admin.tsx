import { useState } from 'react';
import { TournamentHeader } from '@/components/TournamentHeader';
import { PlayerCard } from '@/components/PlayerCard';
import { LiveScoreboard } from '@/components/LiveScoreboard';
import { MatchCard } from '@/components/MatchCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTournamentStore } from '@/store/tournamentStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  ClipboardList, 
  Gamepad2, 
  CheckCircle, 
  XCircle, 
  Plus,
  Calendar,
  Trophy,
  Search
} from 'lucide-react';
import { Category } from '@/types/tournament';

export default function Admin() {
  const { players, matches, updatePlayerStatus, addMatch } = useTournamentStore();
  const { toast } = useToast();
  
  const [playerFilter, setPlayerFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New match form state
  const [selectedPlayerA, setSelectedPlayerA] = useState('');
  const [selectedPlayerB, setSelectedPlayerB] = useState('');
  const [matchCourt, setMatchCourt] = useState('');
  const [matchCategory, setMatchCategory] = useState<Category>('Mens Singles');
  
  const pendingPlayers = players.filter(p => p.status === 'PENDING');
  const approvedPlayers = players.filter(p => p.status === 'APPROVED');
  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING');

  const filteredPlayers = players.filter(p => {
    const matchesFilter = playerFilter === 'all' || p.status === playerFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApprove = (playerId: string) => {
    updatePlayerStatus(playerId, 'APPROVED');
    toast({
      title: "Player Approved",
      description: "The player has been approved for the tournament.",
    });
  };

  const handleReject = (playerId: string) => {
    updatePlayerStatus(playerId, 'REJECTED');
    toast({
      title: "Player Rejected",
      description: "The player registration has been rejected.",
    });
  };

  const handleCreateMatch = () => {
    if (!selectedPlayerA || !selectedPlayerB || selectedPlayerA === selectedPlayerB) {
      toast({
        title: "Invalid Selection",
        description: "Please select two different players for the match.",
        variant: "destructive",
      });
      return;
    }

    addMatch(selectedPlayerA, selectedPlayerB, new Date(), matchCourt || 'Court 1', matchCategory);
    toast({
      title: "Match Created",
      description: "The match has been scheduled successfully.",
    });
    
    setSelectedPlayerA('');
    setSelectedPlayerB('');
    setMatchCourt('');
  };

  return (
    <div className="min-h-screen">
      <TournamentHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage players, matches, and tournament settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{pendingPlayers.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{approvedPlayers.length}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-live/20">
                <Gamepad2 className="h-5 w-5 text-live" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{liveMatches.length}</p>
                <p className="text-xs text-muted-foreground">Live</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{upcomingMatches.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="players" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="players" className="gap-2">
              <Users className="h-4 w-4" />
              Players
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="scoring" className="gap-2">
              <Trophy className="h-4 w-4" />
              Live Scoring
            </TabsTrigger>
          </TabsList>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={playerFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlayerFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={playerFilter === 'PENDING' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlayerFilter('PENDING')}
                >
                  Pending
                </Button>
                <Button
                  variant={playerFilter === 'APPROVED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlayerFilter('APPROVED')}
                >
                  Approved
                </Button>
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPlayers.map((player) => (
                <div key={player.id} className="relative">
                  <PlayerCard player={player} />
                  {player.status === 'PENDING' && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(player.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(player.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No players found</p>
              </div>
            )}
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            {/* Create Match Form */}
            <div className="bg-gradient-card rounded-xl border border-border p-6">
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Schedule New Match
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <Label>Player A</Label>
                  <Select value={selectedPlayerA} onValueChange={setSelectedPlayerA}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Player B</Label>
                  <Select value={selectedPlayerB} onValueChange={setSelectedPlayerB}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedPlayers
                        .filter(p => p.id !== selectedPlayerA)
                        .map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={matchCategory} onValueChange={(v) => setMatchCategory(v as Category)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mens Singles">Men's Singles</SelectItem>
                      <SelectItem value="Womens Singles">Women's Singles</SelectItem>
                      <SelectItem value="Mens Doubles">Men's Doubles</SelectItem>
                      <SelectItem value="Womens Doubles">Women's Doubles</SelectItem>
                      <SelectItem value="Mixed Doubles">Mixed Doubles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Court</Label>
                  <Input
                    placeholder="e.g., Court 1"
                    value={matchCourt}
                    onChange={(e) => setMatchCourt(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button className="w-full" onClick={handleCreateMatch}>
                    <Plus className="h-4 w-4" />
                    Create Match
                  </Button>
                </div>
              </div>
            </div>

            {/* Match Lists */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-bold mb-4">Upcoming Matches</h3>
                <div className="space-y-4">
                  {upcomingMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                  {upcomingMatches.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">No upcoming matches</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold mb-4">Live Matches</h3>
                <div className="space-y-4">
                  {liveMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                  {liveMatches.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">No live matches</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Live Scoring Tab */}
          <TabsContent value="scoring" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {[...liveMatches, ...upcomingMatches].map((match) => (
                <LiveScoreboard key={match.id} match={match} adminMode />
              ))}
            </div>
            
            {liveMatches.length === 0 && upcomingMatches.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No matches available for scoring</p>
                <p className="text-sm mt-2">Create a match in the Matches tab first</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
