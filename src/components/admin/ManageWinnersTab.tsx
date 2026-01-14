import { useState } from 'react';
import { Trophy, Trash2, Crown, Users, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTournamentWinners, useAddTournamentWinner, useRemoveTournamentWinner } from '@/hooks/useTournamentWinners';
import { usePlayers } from '@/hooks/usePlayers';
import { PlayerCombobox } from './PlayerCombobox';
import { Badge } from '@/components/ui/badge';
import { Constants } from '@/integrations/supabase/types';

const categories = Constants.public.Enums.player_category;

export const ManageWinnersTab = () => {
  const { winners, isLoading: winnersLoading } = useTournamentWinners();
  const { data: players = [] } = usePlayers();
  const addWinner = useAddTournamentWinner();
  const removeWinner = useRemoveTournamentWinner();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedPartner, setSelectedPartner] = useState<string>('');

  const approvedPlayers = players.filter(p => p.status === 'APPROVED');
  const isDoubles = selectedCategory.includes('Doubles');

  const handleAddWinner = () => {
    if (!selectedCategory || !selectedPlayer) return;

    addWinner.mutate({
      playerId: selectedPlayer,
      partnerId: isDoubles ? selectedPartner || null : null,
      category: selectedCategory,
    });

    setSelectedPlayer('');
    setSelectedPartner('');
  };

  const handleRemoveWinner = (winnerId: string) => {
    if (confirm('Are you sure you want to remove this winner?')) {
      removeWinner.mutate(winnerId);
    }
  };

  // Separate singles and doubles
  const singlesWinners = winners.filter(w => w.category.includes('Singles'));
  const doublesWinners = winners.filter(w => w.category.includes('Doubles'));

  return (
    <div className="space-y-6">
      {/* Add Winner Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Declare Tournament Winner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace('Mens', "Men's").replace('Womens', "Women's")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isDoubles ? 'Player 1' : 'Winner'}</Label>
              <PlayerCombobox
                players={approvedPlayers}
                value={selectedPlayer}
                onValueChange={setSelectedPlayer}
                placeholder="Select winner"
              />
            </div>

            {isDoubles && (
              <div className="space-y-2">
                <Label>Player 2 (Partner)</Label>
                <PlayerCombobox
                  players={approvedPlayers}
                  value={selectedPartner}
                  onValueChange={setSelectedPartner}
                  placeholder="Select partner"
                  excludeIds={selectedPlayer ? [selectedPlayer] : []}
                />
              </div>
            )}

            <div className="flex items-end">
              <Button
                onClick={handleAddWinner}
                disabled={!selectedCategory || !selectedPlayer || addWinner.isPending}
                className="w-full"
              >
                <Trophy className="h-4 w-4 mr-2" />
                {addWinner.isPending ? 'Saving...' : 'Declare Winner'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Winners */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Singles Winners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Singles Champions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {singlesWinners.length === 0 ? (
              <p className="text-muted-foreground text-sm">No singles winners declared yet</p>
            ) : (
              <div className="space-y-3">
                {singlesWinners.map((winner) => (
                  <div
                    key={winner.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{winner.player.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {winner.category.replace('Mens', "Men's").replace('Womens', "Women's")}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveWinner(winner.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doubles Winners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Doubles Champions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {doublesWinners.length === 0 ? (
              <p className="text-muted-foreground text-sm">No doubles winners declared yet</p>
            ) : (
              <div className="space-y-3">
                {doublesWinners.map((winner) => (
                  <div
                    key={winner.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">
                          {winner.player.name}
                          {winner.partner && ` & ${winner.partner.name}`}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {winner.category.replace('Mens', "Men's").replace('Womens', "Women's")}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveWinner(winner.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
