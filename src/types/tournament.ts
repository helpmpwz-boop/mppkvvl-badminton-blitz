export type PlayerStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type MatchStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';
export type Gender = 'Male' | 'Female' | 'Other';
export type Category = 'Mens Singles' | 'Womens Singles' | 'Mens Doubles' | 'Womens Doubles' | 'Mixed Doubles';

export interface Player {
  id: string;
  name: string;
  employeeNumber: string;
  location: string;
  designation: string;
  age: number;
  gender: Gender;
  category: Category;
  team?: string;
  photoUrl?: string;
  phone: string;
  email?: string;
  status: PlayerStatus;
  registeredAt: Date;
}

export interface Match {
  id: string;
  playerA: Player;
  playerA2?: Player;  // Doubles partner for side A
  playerB: Player;
  playerB2?: Player;  // Doubles partner for side B
  scoreA: number;
  scoreB: number;
  status: MatchStatus;
  winner?: Player;
  scheduledAt: Date;
  court?: string;
  category: Category;
}
