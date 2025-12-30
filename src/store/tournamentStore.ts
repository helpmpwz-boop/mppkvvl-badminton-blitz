import { create } from 'zustand';
import { Player, Match, PlayerStatus, MatchStatus, Category } from '@/types/tournament';

// Sample data for demonstration
const samplePlayers: Player[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    employeeNumber: 'EMP001',
    location: 'Indore HQ',
    designation: 'Senior Engineer',
    age: 32,
    gender: 'Male',
    category: 'Mens Singles',
    team: 'Engineering',
    phone: '9876543210',
    email: 'rajesh@mppkvvcl.com',
    status: 'APPROVED',
    registeredAt: new Date(),
  },
  {
    id: '2',
    name: 'Amit Sharma',
    employeeNumber: 'EMP002',
    location: 'Bhopal Office',
    designation: 'Manager',
    age: 35,
    gender: 'Male',
    category: 'Mens Singles',
    team: 'Operations',
    phone: '9876543211',
    status: 'APPROVED',
    registeredAt: new Date(),
  },
  {
    id: '3',
    name: 'Priya Verma',
    employeeNumber: 'EMP003',
    location: 'Indore HQ',
    designation: 'Assistant Engineer',
    age: 28,
    gender: 'Female',
    category: 'Womens Singles',
    phone: '9876543212',
    status: 'PENDING',
    registeredAt: new Date(),
  },
  {
    id: '4',
    name: 'Vikash Patel',
    employeeNumber: 'EMP004',
    location: 'Ujjain Office',
    designation: 'Junior Engineer',
    age: 26,
    gender: 'Male',
    category: 'Mens Singles',
    phone: '9876543213',
    status: 'APPROVED',
    registeredAt: new Date(),
  },
];

const sampleMatches: Match[] = [
  {
    id: '1',
    playerA: samplePlayers[0],
    playerB: samplePlayers[1],
    scoreA: 15,
    scoreB: 12,
    status: 'LIVE',
    scheduledAt: new Date(),
    court: 'Court 1',
    category: 'Mens Singles',
  },
  {
    id: '2',
    playerA: samplePlayers[3],
    playerB: samplePlayers[0],
    scoreA: 0,
    scoreB: 0,
    status: 'UPCOMING',
    scheduledAt: new Date(Date.now() + 3600000),
    court: 'Court 2',
    category: 'Mens Singles',
  },
];

interface TournamentStore {
  players: Player[];
  matches: Match[];
  addPlayer: (player: Omit<Player, 'id' | 'registeredAt' | 'status'>) => void;
  updatePlayerStatus: (playerId: string, status: PlayerStatus) => void;
  addMatch: (playerAId: string, playerBId: string, scheduledAt: Date, court: string, category: Category) => void;
  updateScore: (matchId: string, playerSide: 'A' | 'B') => void;
  setMatchStatus: (matchId: string, status: MatchStatus) => void;
  completeMatch: (matchId: string, winnerId: string) => void;
}

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  players: samplePlayers,
  matches: sampleMatches,

  addPlayer: (playerData) => {
    const newPlayer: Player = {
      ...playerData,
      id: Date.now().toString(),
      status: 'PENDING',
      registeredAt: new Date(),
    };
    set((state) => ({ players: [...state.players, newPlayer] }));
  },

  updatePlayerStatus: (playerId, status) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, status } : p
      ),
    }));
  },

  addMatch: (playerAId, playerBId, scheduledAt, court, category) => {
    const { players } = get();
    const playerA = players.find((p) => p.id === playerAId);
    const playerB = players.find((p) => p.id === playerBId);
    if (!playerA || !playerB) return;

    const newMatch: Match = {
      id: Date.now().toString(),
      playerA,
      playerB,
      scoreA: 0,
      scoreB: 0,
      status: 'UPCOMING',
      scheduledAt,
      court,
      category,
    };
    set((state) => ({ matches: [...state.matches, newMatch] }));
  },

  updateScore: (matchId, playerSide) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId
          ? {
              ...m,
              scoreA: playerSide === 'A' ? m.scoreA + 1 : m.scoreA,
              scoreB: playerSide === 'B' ? m.scoreB + 1 : m.scoreB,
            }
          : m
      ),
    }));
  },

  setMatchStatus: (matchId, status) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, status } : m
      ),
    }));
  },

  completeMatch: (matchId, winnerId) => {
    set((state) => ({
      matches: state.matches.map((m) => {
        if (m.id !== matchId) return m;
        const winner = m.playerA.id === winnerId ? m.playerA : m.playerB;
        return { ...m, status: 'COMPLETED' as MatchStatus, winner };
      }),
    }));
  },
}));
