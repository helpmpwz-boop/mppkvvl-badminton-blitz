import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TournamentHeader } from '@/components/TournamentHeader';
import { PlayerCard } from '@/components/PlayerCard';
import { LiveScoreboard } from '@/components/LiveScoreboard';
import { MatchCard } from '@/components/MatchCard';
import { UserManagement } from '@/components/admin/UserManagement';
import { CSVUploadForm } from '@/components/admin/CSVUploadForm';
import { EditPlayerDialog } from '@/components/admin/EditPlayerDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { usePlayers, useUpdatePlayerStatus, useDeletePlayer, Player } from '@/hooks/usePlayers';
import { useMatches, useAddMatch } from '@/hooks/useMatches';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  ClipboardList, 
  Gamepad2, 
  CheckCircle, 
  XCircle, 
  Plus,
  Calendar,
  Trophy,
  Search,
  LogOut,
  Loader2,
  Shield,
  UserCog,
  Upload,
  Pencil,
  Trash2,
  Download
} from 'lucide-react';
import { downloadPlayersExcel, downloadWinnersExcel, getUniqueTeams } from '@/utils/excelExport';
import { Database } from '@/integrations/supabase/types';

type PlayerCategory = Database['public']['Enums']['player_category'];

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const { data: matches = [], isLoading: matchesLoading } = useMatches();
  const updatePlayerStatus = useUpdatePlayerStatus();
  const deletePlayer = useDeletePlayer();
  const addMatch = useAddMatch();
  
  const [playerFilter, setPlayerFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);
  
  // New match form state
  const [selectedPlayerA, setSelectedPlayerA] = useState('');
  const [selectedPlayerA2, setSelectedPlayerA2] = useState('');
  const [selectedPlayerB, setSelectedPlayerB] = useState('');
  const [selectedPlayerB2, setSelectedPlayerB2] = useState('');
  const [matchCourt, setMatchCourt] = useState('');
  const [matchCategory, setMatchCategory] = useState<PlayerCategory>('Mens Singles');

  // Winners export filters
  const [winnersCategoryFilter, setWinnersCategoryFilter] = useState<'all' | 'singles' | 'doubles'>('all');
  const [winnersTeamFilter, setWinnersTeamFilter] = useState('');

  const isDoublesCategory = matchCategory.includes('Doubles');
  const uniqueTeams = getUniqueTeams(players);
  const completedMatches = matches.filter(m => m.status === 'COMPLETED');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  
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
    updatePlayerStatus.mutate({ playerId, status: 'APPROVED' });
  };

  const handleReject = (playerId: string) => {
    updatePlayerStatus.mutate({ playerId, status: 'REJECTED' });
  };

  const handleCreateMatch = () => {
    if (!selectedPlayerA || !selectedPlayerB || selectedPlayerA === selectedPlayerB) {
      return;
    }

    // For doubles, ensure partners are selected
    if (isDoublesCategory && (!selectedPlayerA2 || !selectedPlayerB2)) {
      return;
    }

    addMatch.mutate({
      playerAId: selectedPlayerA,
      playerA2Id: isDoublesCategory ? selectedPlayerA2 : undefined,
      playerBId: selectedPlayerB,
      playerB2Id: isDoublesCategory ? selectedPlayerB2 : undefined,
      scheduledAt: new Date(),
      court: matchCourt || 'Court 1',
      category: matchCategory,
    });
    
    setSelectedPlayerA('');
    setSelectedPlayerA2('');
    setSelectedPlayerB('');
    setSelectedPlayerB2('');
    setMatchCourt('');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <TournamentHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage players, matches, and tournament settings</p>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 border border-success/30">
                <Shield className="h-4 w-4 text-success" />
                <span className="text-sm text-success font-medium">Admin</span>
              </div>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {!isAdmin && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-6 mb-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-warning" />
            <h2 className="font-display text-xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground">
              You are logged in but don't have admin privileges yet.<br />
              Contact an existing admin to grant you access.
            </p>
          </div>
        )}

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
          <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
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
            {isAdmin && (
              <>
                <TabsTrigger value="reports" className="gap-2">
                  <Download className="h-4 w-4" />
                  Reports
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2">
                  <UserCog className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="csv-upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  CSV Upload
                </TabsTrigger>
              </>
            )}
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
              <div className="flex gap-2 flex-wrap">
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
                {isAdmin && filteredPlayers.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPlayersExcel(filteredPlayers, `players_${playerFilter}`)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export Excel
                  </Button>
                )}
              </div>
            </div>

            {playersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Players Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredPlayers.map((player) => (
                    <div key={player.id} className="relative">
                      <PlayerCard player={player} />
                      {isAdmin && (
                        <div className="absolute top-4 right-4 flex gap-2">
                          {player.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleApprove(player.id)}
                                disabled={updatePlayerStatus.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(player.id)}
                                disabled={updatePlayerStatus.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPlayer(player)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingPlayer(player)}
                          >
                            <Trash2 className="h-4 w-4" />
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
              </>
            )}
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            {/* Create Match Form */}
            {isAdmin && (
              <div className="bg-gradient-card rounded-xl border border-border p-6">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Schedule New Match
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Category - moved first so doubles logic works */}
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={matchCategory} onValueChange={(v) => {
                      setMatchCategory(v as PlayerCategory);
                      // Reset partner selections when switching category
                      setSelectedPlayerA2('');
                      setSelectedPlayerB2('');
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mens Singles">Men's Singles</SelectItem>
                        <SelectItem value="Womens Singles">Women's Singles</SelectItem>
                        <SelectItem value="Mens Doubles">Men's Doubles</SelectItem>
                        <SelectItem value="Womens Doubles">Women's Doubles</SelectItem>
                        <SelectItem value="Mixed Doubles">Mixed Doubles</SelectItem>
                        <SelectItem value="Veteran Mens Singles">Veteran Men's Singles</SelectItem>
                        <SelectItem value="Veteran Womens Singles">Veteran Women's Singles</SelectItem>
                        <SelectItem value="Veteran Mens Doubles">Veteran Men's Doubles</SelectItem>
                        <SelectItem value="Veteran Womens Doubles">Veteran Women's Doubles</SelectItem>
                        <SelectItem value="Veteran Mixed Doubles">Veteran Mixed Doubles</SelectItem>
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
                    <Button 
                      className="w-full" 
                      onClick={handleCreateMatch}
                      disabled={
                        !selectedPlayerA || 
                        !selectedPlayerB || 
                        (isDoublesCategory && (!selectedPlayerA2 || !selectedPlayerB2)) ||
                        addMatch.isPending
                      }
                    >
                      {addMatch.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Create Match
                    </Button>
                  </div>
                </div>

                {/* Players Selection */}
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  {/* Team A */}
                  <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
                    <h4 className="font-semibold text-sm text-primary">Team A</h4>
                    <div className="space-y-2">
                      <Label>Player A1</Label>
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
                    {isDoublesCategory && (
                      <div className="space-y-2">
                        <Label>Player A2 (Partner)</Label>
                        <Select value={selectedPlayerA2} onValueChange={setSelectedPlayerA2}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select partner" />
                          </SelectTrigger>
                          <SelectContent>
                            {approvedPlayers
                              .filter(p => p.id !== selectedPlayerA && p.id !== selectedPlayerB && p.id !== selectedPlayerB2)
                              .map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Team B */}
                  <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
                    <h4 className="font-semibold text-sm text-destructive">Team B</h4>
                    <div className="space-y-2">
                      <Label>Player B1</Label>
                      <Select value={selectedPlayerB} onValueChange={setSelectedPlayerB}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select player" />
                        </SelectTrigger>
                        <SelectContent>
                          {approvedPlayers
                            .filter(p => p.id !== selectedPlayerA && p.id !== selectedPlayerA2)
                            .map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {isDoublesCategory && (
                      <div className="space-y-2">
                        <Label>Player B2 (Partner)</Label>
                        <Select value={selectedPlayerB2} onValueChange={setSelectedPlayerB2}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select partner" />
                          </SelectTrigger>
                          <SelectContent>
                            {approvedPlayers
                              .filter(p => p.id !== selectedPlayerA && p.id !== selectedPlayerA2 && p.id !== selectedPlayerB)
                              .map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {matchesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
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
            )}
          </TabsContent>

          {/* Live Scoring Tab */}
          <TabsContent value="scoring" className="space-y-6">
            {matchesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  {[...liveMatches, ...upcomingMatches].map((match) => (
                    <LiveScoreboard key={match.id} match={match} adminMode={true} />
                  ))}
                </div>
                
                {liveMatches.length === 0 && upcomingMatches.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No matches available for scoring</p>
                    <p className="text-sm mt-2">Create a match in the Matches tab first</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Reports Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="reports" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Players Export Card */}
                <div className="bg-gradient-card rounded-xl border border-border p-6">
                  <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Export Player List
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all registered players as an Excel file.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      onClick={() => downloadPlayersExcel(players.filter(p => p.status === 'APPROVED'), 'approved_players')}
                      disabled={approvedPlayers.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Approved Players ({approvedPlayers.length})
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full" 
                      onClick={() => downloadPlayersExcel(players, 'all_players')}
                      disabled={players.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download All Players ({players.length})
                    </Button>
                  </div>
                </div>

                {/* Winners Export Card */}
                <div className="bg-gradient-card rounded-xl border border-border p-6">
                  <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Export Winners List
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download match winners filtered by category and team.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Category Filter</Label>
                      <Select value={winnersCategoryFilter} onValueChange={(v) => setWinnersCategoryFilter(v as 'all' | 'singles' | 'doubles')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="singles">Singles Only</SelectItem>
                          <SelectItem value="doubles">Doubles Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Team Filter (Optional)</Label>
                      <Select value={winnersTeamFilter} onValueChange={setWinnersTeamFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Teams" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Teams</SelectItem>
                          {uniqueTeams.map((team) => (
                            <SelectItem key={team} value={team}>
                              {team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => {
                        const result = downloadWinnersExcel(matches, {
                          categoryFilter: winnersCategoryFilter,
                          teamFilter: winnersTeamFilter === 'all' ? undefined : winnersTeamFilter,
                        });
                        if (!result) {
                          alert('No winners found with the selected filters.');
                        }
                      }}
                      disabled={completedMatches.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Winners ({completedMatches.length} matches)
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* User Management Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>
          )}

          {/* CSV Upload Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="csv-upload" className="space-y-6">
              <div className="bg-gradient-card rounded-xl border border-border p-6">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Bulk Player Registration
                </h3>
                <CSVUploadForm />
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Edit Player Dialog */}
        <EditPlayerDialog
          player={editingPlayer}
          open={!!editingPlayer}
          onOpenChange={(open) => !open && setEditingPlayer(null)}
        />

        {/* Delete Player Confirmation */}
        <AlertDialog open={!!deletingPlayer} onOpenChange={(open) => !open && setDeletingPlayer(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Player</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deletingPlayer?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingPlayer) {
                    deletePlayer.mutate(deletingPlayer.id);
                    setDeletingPlayer(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
